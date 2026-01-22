from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class ElementStyle(BaseModel):
    backgroundColor: Optional[str] = None
    color: Optional[str] = "#000000"
    fontSize: Optional[int] = 16
    fontFamily: Optional[str] = "System"
    borderRadius: Optional[int] = 0
    borderWidth: Optional[int] = 0
    borderColor: Optional[str] = None

class Element(BaseModel):
    id: str
    type: str  # 'image', 'text', 'link', 'friend', 'shape'
    x: float
    y: float
    width: float
    height: float
    zIndex: int
    content: str  # base64 for images, text content for text
    style: ElementStyle
    url: Optional[str] = None  # for link buttons
    rotation: Optional[float] = 0

class Page(BaseModel):
    title: str
    elements: List[Element]
    backgroundColor: str = "#FFFFFF"
    canvasWidth: float = 375
    canvasHeight: float = 667

class PageResponse(BaseModel):
    id: str
    title: str
    elements: List[Element]
    backgroundColor: str
    canvasWidth: float
    canvasHeight: float
    createdAt: datetime
    updatedAt: datetime

class PageUpdate(BaseModel):
    title: Optional[str] = None
    elements: Optional[List[Element]] = None
    backgroundColor: Optional[str] = None
    canvasWidth: Optional[float] = None
    canvasHeight: Optional[float] = None


# Helper function to serialize MongoDB documents
def serialize_page(page: dict) -> dict:
    page["id"] = str(page["_id"])
    del page["_id"]
    return page


# Add your routes to the router
@api_router.get("/")
async def root():
    return {"message": "Canvas Page Builder API"}


@api_router.post("/pages", response_model=PageResponse)
async def create_page(page: Page):
    """Create a new page"""
    page_dict = page.dict()
    page_dict["createdAt"] = datetime.utcnow()
    page_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.pages.insert_one(page_dict)
    created_page = await db.pages.find_one({"_id": result.inserted_id})
    
    return serialize_page(created_page)


@api_router.get("/pages", response_model=List[PageResponse])
async def get_pages():
    """Get all pages"""
    pages = await db.pages.find().sort("updatedAt", -1).to_list(100)
    return [serialize_page(page) for page in pages]


@api_router.get("/pages/{page_id}", response_model=PageResponse)
async def get_page(page_id: str):
    """Get a specific page by ID"""
    try:
        page = await db.pages.find_one({"_id": ObjectId(page_id)})
        if not page:
            raise HTTPException(status_code=404, detail="Page not found")
        return serialize_page(page)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.put("/pages/{page_id}", response_model=PageResponse)
async def update_page(page_id: str, page_update: PageUpdate):
    """Update a page"""
    try:
        update_data = {k: v for k, v in page_update.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.pages.update_one(
            {"_id": ObjectId(page_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Page not found")
        
        updated_page = await db.pages.find_one({"_id": ObjectId(page_id)})
        return serialize_page(updated_page)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.delete("/pages/{page_id}")
async def delete_page(page_id: str):
    """Delete a page"""
    try:
        result = await db.pages.delete_one({"_id": ObjectId(page_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Page not found")
        return {"message": "Page deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
