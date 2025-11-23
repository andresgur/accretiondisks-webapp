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



# Model for requiring both mass and spin
class Params(BaseModel):
    mass: float
    spin: float
    mdot: float
    alpha: float
    innerTorque: Optional[float] = -0.1

# Initial creation or full update
@app.post("/create_compact_object") 
def createCO(params: Params):

    global CO # Use global if CO is defined outside the function scope
    # This route explicitly requires both mass and spin.
    CO = CompactObject(params.mass, params.spin)
    LEdd = CO.LEdd
    Risco = CO.Risco
    global disk
    global disktype
    if params.mdot <1:
        disk = ShakuraSunyaevDisk(CO, params.mdot, alpha=params.alpha, Wrphi_in=params.innerTorque, N=10000)
        disktype = "SS73"
    else:
        disk = CompositeDisk(InnerDisk, CO=CO, mdot=params.mdot, alpha=params.alpha, Wrphi_in=params.innerTorque, N=10000)
        disktype = "Outflows"
    return {
        "LEdd": LEdd, 
        "Risco":Risco,
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / disk.CO.Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "Qrad": (disk.Qrad / disk.Qvis).tolist(),
        "Qadv": (disk.Qadv / disk.Qvis).tolist(),
        "vr": (disk.vr / ccgs).tolist(),
        "Ltot": (disk.L()/LEdd)
       # "T": (disk.T / 1e8).tolist()
    }

class MdotParams(BaseModel):
    mdot: float

@app.post("/accretiondisk/mdot_change")
def changeMdot(params: MdotParams):
    if params.mdot <1:
        disk.mdot = params.mdot
    elif (disktype=="SS73"):
        newdisk = CompositeDisk(InnerDisk, CO=CO, mdot=params.mdot, alpha=disk.alpha, Wrphi_in=disk.Wrphi_in, N=10000)
    else:
        disk.mdot = params.mdot
    
    return {
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / disk.CO.Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "Qrad": (disk.Qrad / disk.Qvis).tolist(),
        "Qadv": (disk.Qadv / disk.Qvis).tolist(),
        "vr": (disk.vr / ccgs).tolist(),
        "Ltot": (disk.L()/disk.CO.LEdd),
        #"T": (disk.T / 1e8).tolist()
    }

class AlphaParams(BaseModel):
    alpha:float

@app.post("/accretiondisk/alpha_change")
def changeAlpha(params: AlphaParams):
    disk.alpha = params.alpha

    return {
        "R": (disk.R / disk.CO.Risco).tolist(),
        "rho": (disk.rho / 10**3).tolist(),
        "vr": (disk.vr / ccgs).tolist(),
        #"T": (disk.T / 10**8).tolist()
    }


# Model for changing only mass
class MassParams(BaseModel):
    mass: float

@app.post("/compactobject/mass_change")
def changeMass(params: MassParams):
        
    CO.M = params.mass
    disk.CO = CO
    # Recalculate properties that depend on mass
    LEdd = CO.LEdd
    Risco = CO.Risco
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
        #"T": (disk.T / 1e8).tolist()
    }

# Model for changing only spin
class SpinParams(BaseModel):
    spin: float

@app.post("/compactobject/spin_change")
def changeSpin(params: SpinParams):
        
    CO.a = params.spin

    disk.CO = CO
    # Recalculate properties that depend on spin
    Risco = CO.Risco 
    return {
        "Risco": Risco,        
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "Qrad": (disk.Qrad / disk.Qvis).tolist(),
        "Qadv": (disk.Qadv / disk.Qvis).tolist(),
        "Ltot": (disk.L()/disk.CO.LEdd),
        "vr": (disk.vr / ccgs).tolist(),
        #"T": (disk.T / 1e8).tolist()
    }