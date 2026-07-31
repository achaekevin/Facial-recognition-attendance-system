import pytest
from datetime import datetime
from app.attendance.rules_engine import AttendanceRulesEngine

def test_attendance_rules_engine_instantiation():
    engine = AttendanceRulesEngine()
    assert engine.min_confidence_threshold == 0.85
    assert engine.duplicate_window_minutes == 5
    assert engine.max_daily_checkins == 10
