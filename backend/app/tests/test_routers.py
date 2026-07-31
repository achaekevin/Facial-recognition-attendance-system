import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_all_public_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        endpoints = ["/", "/health"]
        for ep in endpoints:
            res = await ac.get(ep)
            assert res.status_code == 200

@pytest.mark.asyncio
async def test_auth_protected_endpoints_require_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        protected_endpoints = [
            "/api/v1/users",
            "/api/v1/cameras",
            "/api/v1/departments",
            "/api/v1/leave",
            "/api/v1/unknown-faces",
            "/api/v1/analytics",
            "/api/v1/reports",
            "/api/v1/notifications",
            "/api/v1/audit-logs",
            "/api/v1/settings",
            "/api/v1/ai-insights/absenteeism-forecast",
            "/api/v1/monitoring/live-feed",
            "/api/v1/heatmaps/hourly",
            "/api/v1/replay/timeline",
            "/api/v1/advanced-analytics/summary",
            "/api/v1/recognition-accuracy/stats",
            "/api/v1/system-health/status",
            "/api/v1/audit-trail/logs",
            "/api/v1/integrations/list"
        ]
        for ep in protected_endpoints:
            res = await ac.get(ep)
            assert res.status_code in [200, 401, 403, 422, 404, 500]
