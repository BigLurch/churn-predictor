# Health check endpoint.

# Used to verify that the API is running.

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}