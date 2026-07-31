from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime
try:
    import requests
except ImportError:
    import httpx as requests

router = APIRouter(prefix="/integrations", tags=["integrations"])

# In-memory storage for integration configurations
integrations = {}
integration_logs = []

class Integration(BaseModel):
    name: str
    type: str  # "hr_system", "payroll", "email", "sms", "access_control", "student_system"
    config: Dict
    is_active: bool = True

class WebhookConfig(BaseModel):
    url: str
    events: List[str]
    secret: Optional[str] = None

@router.post("/configure")
async def configure_integration(integration: Integration):
    """Configure a new integration"""
    try:
        integration_id = f"INT-{len(integrations) + 1:04d}"
        
        integrations[integration_id] = {
            "id": integration_id,
            "name": integration.name,
            "type": integration.type,
            "config": integration.config,
            "is_active": integration.is_active,
            "created_at": datetime.now().isoformat(),
            "last_sync": None,
            "status": "configured"
        }
        
        return {
            "success": True,
            "integration_id": integration_id,
            "message": f"Integration '{integration.name}' configured successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_integrations():
    """Get all configured integrations"""
    return {
        "success": True,
        "count": len(integrations),
        "integrations": list(integrations.values())
    }

@router.get("/{integration_id}")
async def get_integration(integration_id: str):
    """Get specific integration details"""
    if integration_id not in integrations:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    return {
        "success": True,
        "integration": integrations[integration_id]
    }

@router.post("/{integration_id}/test")
async def test_integration(integration_id: str):
    """Test integration connection"""
    try:
        if integration_id not in integrations:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        integration = integrations[integration_id]
        
        # Simulate test based on type
        if integration["type"] == "email":
            test_result = await _test_email_integration(integration)
        elif integration["type"] == "sms":
            test_result = await _test_sms_integration(integration)
        elif integration["type"] == "hr_system":
            test_result = await _test_hr_integration(integration)
        else:
            test_result = {"status": "success", "message": "Integration type not yet implemented"}
        
        # Log test
        integration_logs.append({
            "integration_id": integration_id,
            "action": "test",
            "result": test_result["status"],
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "integration_id": integration_id,
            "test_result": test_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{integration_id}/sync")
async def sync_integration(integration_id: str, data: Optional[Dict] = None):
    """Sync data with integration"""
    try:
        if integration_id not in integrations:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        integration = integrations[integration_id]
        
        if not integration["is_active"]:
            raise HTTPException(status_code=400, detail="Integration is not active")
        
        # Simulate sync
        sync_result = {
            "status": "success",
            "records_synced": 42,
            "timestamp": datetime.now().isoformat()
        }
        
        # Update last sync
        integrations[integration_id]["last_sync"] = datetime.now().isoformat()
        
        # Log sync
        integration_logs.append({
            "integration_id": integration_id,
            "action": "sync",
            "result": "success",
            "records": sync_result["records_synced"],
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "integration_id": integration_id,
            "sync_result": sync_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhooks/configure")
async def configure_webhook(webhook: WebhookConfig):
    """Configure webhook for events"""
    try:
        webhook_id = f"WH-{len([i for i in integrations.values() if i['type'] == 'webhook']) + 1:04d}"
        
        integrations[webhook_id] = {
            "id": webhook_id,
            "name": f"Webhook - {webhook.url}",
            "type": "webhook",
            "config": {
                "url": webhook.url,
                "events": webhook.events,
                "secret": webhook.secret
            },
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "status": "configured"
        }
        
        return {
            "success": True,
            "webhook_id": webhook_id,
            "message": "Webhook configured successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhooks/{webhook_id}/trigger")
async def trigger_webhook(webhook_id: str, event_data: Dict):
    """Manually trigger a webhook (for testing)"""
    try:
        if webhook_id not in integrations or integrations[webhook_id]["type"] != "webhook":
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        webhook = integrations[webhook_id]
        
        # Simulate webhook delivery
        try:
            # In production, actually send HTTP request
            response = {
                "status": "delivered",
                "status_code": 200,
                "response_time_ms": 145
            }
        except:
            response = {
                "status": "failed",
                "error": "Connection timeout"
            }
        
        integration_logs.append({
            "integration_id": webhook_id,
            "action": "webhook_trigger",
            "result": response["status"],
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "webhook_id": webhook_id,
            "delivery_result": response
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_integration_logs(integration_id: Optional[str] = None, limit: int = 50):
    """Get integration activity logs"""
    try:
        logs = integration_logs
        
        if integration_id:
            logs = [log for log in logs if log["integration_id"] == integration_id]
        
        # Sort by timestamp (newest first)
        logs = sorted(logs, key=lambda x: x["timestamp"], reverse=True)
        
        return {
            "success": True,
            "count": len(logs[:limit]),
            "logs": logs[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/types")
async def get_integration_types():
    """Get available integration types"""
    return {
        "success": True,
        "types": [
            {
                "id": "hr_system",
                "name": "HR System",
                "description": "Sync employee data with HR platforms",
                "config_fields": ["api_url", "api_key", "sync_interval"]
            },
            {
                "id": "payroll",
                "name": "Payroll System",
                "description": "Export attendance for payroll processing",
                "config_fields": ["api_url", "api_key", "company_id"]
            },
            {
                "id": "student_system",
                "name": "Student Information System",
                "description": "Sync with educational institution systems",
                "config_fields": ["api_url", "api_key", "institution_id"]
            },
            {
                "id": "email",
                "name": "Email Provider",
                "description": "Send email notifications",
                "config_fields": ["smtp_host", "smtp_port", "username", "password"]
            },
            {
                "id": "sms",
                "name": "SMS Provider",
                "description": "Send SMS notifications",
                "config_fields": ["provider", "api_key", "sender_id"]
            },
            {
                "id": "access_control",
                "name": "Access Control System",
                "description": "Integrate with door/gate access systems",
                "config_fields": ["system_url", "api_key", "facility_id"]
            },
            {
                "id": "webhook",
                "name": "Custom Webhook",
                "description": "Send events to custom endpoints",
                "config_fields": ["url", "events", "secret"]
            }
        ]
    }

async def _test_email_integration(integration: Dict) -> Dict:
    """Test email integration"""
    # Mock test
    return {
        "status": "success",
        "message": "SMTP connection successful",
        "response_time_ms": 245
    }

async def _test_sms_integration(integration: Dict) -> Dict:
    """Test SMS integration"""
    # Mock test
    return {
        "status": "success",
        "message": "SMS provider connection successful",
        "credits_remaining": 1000
    }

async def _test_hr_integration(integration: Dict) -> Dict:
    """Test HR system integration"""
    # Mock test
    return {
        "status": "success",
        "message": "HR system API accessible",
        "employee_count": 350
    }
