from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database.session import get_db
from app.ai.assistant import AIAssistant

router = APIRouter(prefix="/ai-assistant", tags=["ai-assistant"])

class QueryRequest(BaseModel):
    query: str
    context: Optional[dict] = None

class QueryResponse(BaseModel):
    success: bool
    query: str
    result: Optional[dict] = None
    error: Optional[str] = None
    suggestions: Optional[list] = None
    timestamp: str

@router.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest, db: Session = Depends(get_db)):
    """
    Process natural language query from administrator
    
    Example queries:
    - "Who arrived late today?"
    - "Show employees absent this week"
    - "Which camera has the lowest recognition accuracy?"
    - "Best performing department"
    - "Failed recognitions this month"
    """
    try:
        assistant = AIAssistant(db)
        result = assistant.process_query(request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.get("/examples")
async def get_example_queries():
    """Get example queries that the AI assistant can handle"""
    return {
        "categories": {
            "Late Arrivals": [
                "Who arrived late today?",
                "Show late arrivals this week",
                "List employees who came late yesterday"
            ],
            "Absences": [
                "Who is absent today?",
                "Show employees absent this week",
                "List absentees this month"
            ],
            "Camera Performance": [
                "Which camera has the lowest recognition accuracy?",
                "Show camera performance statistics",
                "Which camera has the most issues?"
            ],
            "Department Statistics": [
                "Best performing department",
                "Show department attendance statistics",
                "Which department has the worst attendance?"
            ],
            "Recognition Issues": [
                "Failed recognitions today",
                "Show low confidence recognitions",
                "Recognition errors this week"
            ],
            "Trends": [
                "Attendance trend this month",
                "Overall attendance statistics",
                "Peak arrival times this week"
            ]
        },
        "tips": [
            "Use natural language - the AI understands conversational queries",
            "Specify time periods like 'today', 'this week', 'yesterday', 'this month'",
            "Ask about specific users, cameras, or departments",
            "Query for trends, patterns, and performance metrics"
        ]
    }

@router.get("/capabilities")
async def get_capabilities():
    """Get list of AI assistant capabilities"""
    return {
        "capabilities": [
            {
                "category": "Attendance Queries",
                "features": [
                    "Late arrival tracking",
                    "Absence monitoring",
                    "Individual user attendance history",
                    "Attendance trends and patterns"
                ]
            },
            {
                "category": "Performance Analytics",
                "features": [
                    "Camera accuracy analysis",
                    "Recognition failure detection",
                    "Department performance comparison",
                    "Peak time identification"
                ]
            },
            {
                "category": "Insights",
                "features": [
                    "Automatic data interpretation",
                    "Trend detection",
                    "Performance ratings",
                    "Natural language summaries"
                ]
            }
        ],
        "supported_time_periods": [
            "today",
            "yesterday",
            "this week",
            "this month"
        ]
    }
