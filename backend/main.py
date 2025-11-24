from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
# accretion disk imports
from accretion_disks.compact_object import CompactObject
from accretion_disks.shakurasunyaevdisk import ShakuraSunyaevDisk
from accretion_disks.diskwithoutflows import CompositeDisk, InnerDisk
from accretion_disks.constants import ccgs
import numpy as np

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def createDisk(params):
    if params.mdot <1:
        disk = ShakuraSunyaevDisk(CO, params.mdot, alpha=params.alpha, Wrphi_in=params.innerTorque, N=10000)
        Rsph =0
    else:
        print("Switching to superEdd disk")
        disk = CompositeDisk(InnerDisk, ShakuraSunyaevDisk, CO=CO, mdot=params.mdot, alpha=params.alpha, Wrphi_in=params.innerTorque, N=10000)
        Rsph = disk.Rsph / disk.CO.Risco
    return disk, Rsph
    

# Model for requiring both mass and spin
class Params(BaseModel):
    mass: float
    spin: float
    mdot: float
    alpha: float
    innerTorque: Optional[float] = -0.1

# Initial creation or full update
@app.post("/init") 
def init(params: Params):

    global CO # Use global if CO is defined outside the function scope
    # This route explicitly requires both mass and spin.
    CO = CompactObject(params.mass, params.spin)
    LEdd = CO.LEdd
    Risco = CO.Risco
    disk, Rsph = createDisk(params)
    return {
        "LEdd": LEdd, 
        "Risco":Risco,
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "Qrad": (disk.Qrad / disk.Qvis).tolist(),
        "Qadv": (disk.Qadv / disk.Qvis).tolist(),
        "vr": (disk.vr / ccgs).tolist(),
        "Ltot": (disk.L()/LEdd),
        "Rsph": Rsph
       # "T": (disk.T / 1e8).tolist()
    }

class DiskParams(BaseModel):
    mdot: float
    alpha: float
    innerTorque: Optional[float] = -0.1
    N: Optional[int]= 100000

@app.post("/accretiondisk/update")
def updateDisk(params: DiskParams):
    disk, Rsph = createDisk(params)
    
    return {
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / disk.CO.Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "Qrad": (disk.Qrad / disk.Qvis).tolist(),
        "Qadv": (disk.Qadv / disk.Qvis).tolist(),
        "vr": (disk.vr / ccgs).tolist(),
        "Ltot": (disk.L()/disk.CO.LEdd),
        "Rsph": Rsph
        #"T": (disk.T / 1e8).tolist()
    }



# Model for changing only mass
class MassParams(BaseModel):
    mass: float
    mdot: float
    alpha: float
    N: Optional[int]= 100000
    innerTorque: Optional[float] = -0.1

@app.post("/compactobject/mass_change")
def changeMass(params: MassParams):
        
    CO.M = params.mass
    # Recalculate properties that depend on mass
    LEdd = CO.LEdd
    Risco = CO.Risco
    disk, Rsph = createDisk(params)
    return {
        "LEdd": LEdd, 
        "Risco": Risco,
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / disk.CO.Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "Qrad": (disk.Qrad / disk.Qvis).tolist(),
        "Qadv": (disk.Qadv / disk.Qvis).tolist(),
        "vr": (disk.vr / ccgs).tolist(),
        "Ltot": (disk.L()/LEdd),
        "Rsph": Rsph
        #"T": (disk.T / 1e8).tolist()
    }

# Model for changing only spin
class SpinParams(BaseModel):
    spin: float
    mdot: float
    alpha: float
    N: Optional[int]=10000
    innerTorque: Optional[float] = -0.1

@app.post("/compactobject/spin_change")
def changeSpin(params: SpinParams):
        
    CO.a = params.spin

    # Recalculate properties that depend on spin
    Risco = CO.Risco 

    if params.mdot <1:
        disk = ShakuraSunyaevDisk(CO, params.mdot, alpha=params.alpha, Wrphi_in=params.innerTorque, N=params.N)
        Rsph = 0
    else:
        disk = CompositeDisk(InnerDisk, CO=CO, mdot=params.mdot, alpha=params.alpha, Wrphi_in=params.innerTorque, N=params.N)
        Rsph = disk.Rsph  / disk.CO.Risco
    return {
        "Risco": Risco,        
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "Qrad": (disk.Qrad / disk.Qvis).tolist(),
        "Qadv": (disk.Qadv / disk.Qvis).tolist(),
        "Ltot": (disk.L()/disk.CO.LEdd),
        "vr": (disk.vr / ccgs).tolist(),
        'Rsph': Rsph
        #"T": (disk.T / 1e8).tolist()
    }