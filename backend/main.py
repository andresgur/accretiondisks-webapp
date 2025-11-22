from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
# accretion disk imports
from accretion_disks.compact_object import CompactObject
from accretion_disks.shakurasunyaevdisk import ShakuraSunyaevDisk
from accretion_disks.constants import ccgs

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
    innerTorque: Optional[float] = -1e10 

# Initial creation or full update
@app.post("/create_compact_object") 
def createCO(params: Params):
    # This route explicitly requires both mass and spin.
    global CO # Use global if CO is defined outside the function scope
    CO = CompactObject(params.mass, params.spin)
    LEdd = CO.LEdd
    Risco = CO.Risco
    global disk
    disk = ShakuraSunyaevDisk(CO, params.mdot, alpha=params.alpha, Wrphi_in=params.innerTorque, N=300000)
    return {
        "LEdd": LEdd, 
        "Risco":Risco,
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / disk.CO.Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "T": (disk.T / 1e8).tolist()
    }

class MdotParams(BaseModel):
    mdot: float

@app.post("/accretiondisk/mdot_change")
def changeMdot(params: MdotParams):
    disk.mdot = params.mdot
    
    return {
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / disk.CO.Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "v_r": (disk.vr / ccgs).tolist(),
        "T": (disk.T / 10**8).tolist()
    }

class AlphaParams(BaseModel):
    alpha:float

@app.post("/accretiondisk/alpha_change")
def changeAlpha(params: AlphaParams):
    disk.alpha = params.alpha

    return {
        "H": (disk.H/ disk.R).tolist(),
        "R": (disk.R / disk.CO.Risco).tolist(),
        "Mdot": (disk.Mdot / disk.Mdot_0).tolist(),
        "v_r": (disk.vr / ccgs).tolist(),
        "T": (disk.T / 10**8).tolist()
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
        "v_r": (disk.vr / ccgs).tolist(),
        "T": (disk.T / 10**8).tolist()
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
        "v_r": (disk.vr / ccgs).tolist(),
        "T": (disk.T / 10**8).tolist()
    }