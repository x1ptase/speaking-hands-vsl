from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.recognition_service import RecognitionService

router = APIRouter()

# Single instance initialized at startup
recognition_service = None

def get_recognition_service() -> RecognitionService:
    global recognition_service
    if recognition_service is None:
        print("[API] Initializing RecognitionService...")
        recognition_service = RecognitionService()
    return recognition_service

class RecognitionRequest(BaseModel):
    sequence: List[List[List[float]]] # list of frames, each frame is list of 33 points, each point is [x, y]

class RecognitionResponse(BaseModel):
    label: str
    confidence: float
    class_index: int

@router.post("/predict", response_model=RecognitionResponse)
def predict(request: RecognitionRequest):
    if not request.sequence or len(request.sequence) < 100:
        raise HTTPException(status_code=422, detail="Sequence must contain at least 100 frames")
    
    try:
        service = get_recognition_service()
        # predict() expects a sequence (list of 33-element [x, y] arrays)
        label, confidence, class_idx = service.predict(request.sequence)
        
        return RecognitionResponse(
            label=label,
            confidence=confidence,
            class_index=class_idx
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
