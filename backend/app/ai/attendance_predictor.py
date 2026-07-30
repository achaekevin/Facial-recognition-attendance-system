"""
AI-powered attendance prediction and analytics engine.
Uses statistical methods to predict absenteeism, identify patterns, and provide recommendations.
"""
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from collections import defaultdict, Counter
import statistics


class AttendancePredictor:
    """
    AI-powered attendance analytics and prediction engine.
    """
    
    def __init__(self):
        self.absenteeism_threshold = 0.3  # 30% absence rate
        self.late_threshold = 0.2  # 20% late arrival rate
        self.chronic_late_count = 5  # 5+ late arrivals in 30 days
        
    def analyze_user_attendance(self, attendance_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Comprehensive analysis of a single user's attendance history.
        
        Args:
            attendance_records: List of attendance records for a user
            
        Returns:
            Dictionary with analysis metrics
        """
        if not attendance_records:
            return {
                "total_days": 0,
                "present_days": 0,
                "absent_days": 0,
                "late_days": 0,
                "attendance_rate": 0.0,
                "punctuality_rate": 0.0,
                "risk_level": "unknown",
                "prediction": "insufficient_data"
            }
        
        total_days = len(attendance_records)
        present_days = sum(1 for r in attendance_records if r.get('attendance_status') == 'present')
        late_days = sum(1 for r in attendance_records if r.get('attendance_status') == 'late')
        absent_days = sum(1 for r in attendance_records if r.get('attendance_status') == 'absent')
        
        attendance_rate = present_days / total_days if total_days > 0 else 0
        punctuality_rate = (present_days - late_days) / present_days if present_days > 0 else 0
        
        # Calculate risk level
        risk_level = self._calculate_risk_level(attendance_rate, punctuality_rate)
        
        # Predict future attendance
        prediction = self._predict_attendance_behavior(attendance_records)
        
        # Calculate average hours worked
        total_hours = sum(r.get('total_hours', 0) for r in attendance_records)
        avg_hours = total_hours / present_days if present_days > 0 else 0
        
        return {
            "total_days": total_days,
            "present_days": present_days,
            "absent_days": absent_days,
            "late_days": late_days,
            "attendance_rate": round(attendance_rate * 100, 2),
            "punctuality_rate": round(punctuality_rate * 100, 2),
            "avg_hours_per_day": round(avg_hours, 2),
            "risk_level": risk_level,
            "prediction": prediction,
            "trend": self._calculate_trend(attendance_records)
        }
    
    def _calculate_risk_level(self, attendance_rate: float, punctuality_rate: float) -> str:
        """
        Determine risk level based on attendance and punctuality.
        """
        if attendance_rate < 0.7:
            return "critical"
        elif attendance_rate < 0.85:
            return "high"
        elif attendance_rate < 0.95 or punctuality_rate < 0.8:
            return "medium"
        else:
            return "low"
    
    def _predict_attendance_behavior(self, records: List[Dict[str, Any]]) -> str:
        """
        Predict future attendance behavior based on recent patterns.
        """
        if len(records) < 5:
            return "insufficient_data"
        
        # Analyze last 14 days vs previous period
        recent = records[:14] if len(records) >= 14 else records
        recent_absent = sum(1 for r in recent if r.get('attendance_status') == 'absent')
        recent_rate = 1 - (recent_absent / len(recent))
        
        if recent_rate < 0.7:
            return "likely_absent"
        elif recent_rate < 0.85:
            return "at_risk"
        elif recent_rate > 0.95:
            return "excellent"
        else:
            return "stable"
    
    def _calculate_trend(self, records: List[Dict[str, Any]]) -> str:
        """
        Calculate attendance trend (improving, declining, stable).
        """
        if len(records) < 10:
            return "stable"
        
        # Compare first half vs second half
        mid = len(records) // 2
        first_half = records[mid:]
        second_half = records[:mid]
        
        first_rate = sum(1 for r in first_half if r.get('attendance_status') == 'present') / len(first_half)
        second_rate = sum(1 for r in second_half if r.get('attendance_status') == 'present') / len(second_half)
        
        diff = second_rate - first_rate
        
        if diff > 0.1:
            return "improving"
        elif diff < -0.1:
            return "declining"
        else:
            return "stable"
    
    def identify_late_arrivals(self, attendance_records: List[Dict[str, Any]], 
                              users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify users with chronic late arrival patterns.
        """
        user_late_counts = defaultdict(int)
        user_total_days = defaultdict(int)
        
        for record in attendance_records:
            user_id = record.get('user_id')
            user_total_days[user_id] += 1
            if record.get('attendance_status') == 'late':
                user_late_counts[user_id] += 1
        
        late_users = []
        for user_id, late_count in user_late_counts.items():
            if late_count >= self.chronic_late_count:
                total = user_total_days[user_id]
                late_rate = (late_count / total) * 100 if total > 0 else 0
                
                user = next((u for u in users if u.get('id') == user_id), None)
                if user:
                    late_users.append({
                        "user_id": user_id,
                        "user_name": user.get('name', 'Unknown'),
                        "department": user.get('department_name', 'Unknown'),
                        "late_count": late_count,
                        "total_days": total,
                        "late_rate": round(late_rate, 2),
                        "risk_level": "high" if late_rate > 30 else "medium"
                    })
        
        return sorted(late_users, key=lambda x: x['late_count'], reverse=True)
    
    def analyze_department_trends(self, attendance_records: List[Dict[str, Any]], 
                                  users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze attendance trends by department.
        """
        dept_stats = defaultdict(lambda: {"present": 0, "absent": 0, "late": 0, "total": 0})
        
        # Map user_id to department
        user_dept_map = {u.get('id'): u.get('department_name', 'Unknown') for u in users}
        
        for record in attendance_records:
            user_id = record.get('user_id')
            dept = user_dept_map.get(user_id, 'Unknown')
            status = record.get('attendance_status', 'unknown')
            
            dept_stats[dept]['total'] += 1
            if status == 'present':
                dept_stats[dept]['present'] += 1
            elif status == 'absent':
                dept_stats[dept]['absent'] += 1
            elif status == 'late':
                dept_stats[dept]['late'] += 1
        
        department_trends = []
        for dept, stats in dept_stats.items():
            if stats['total'] > 0:
                attendance_rate = (stats['present'] / stats['total']) * 100
                late_rate = (stats['late'] / stats['total']) * 100
                absent_rate = (stats['absent'] / stats['total']) * 100
                
                department_trends.append({
                    "department": dept,
                    "total_records": stats['total'],
                    "attendance_rate": round(attendance_rate, 2),
                    "late_rate": round(late_rate, 2),
                    "absent_rate": round(absent_rate, 2),
                    "performance": "excellent" if attendance_rate > 95 else 
                                 "good" if attendance_rate > 85 else
                                 "needs_improvement" if attendance_rate > 70 else "critical"
                })
        
        return sorted(department_trends, key=lambda x: x['attendance_rate'], reverse=True)
    
    def forecast_weekly_attendance(self, historical_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Forecast attendance for the upcoming week based on historical patterns.
        """
        if len(historical_records) < 30:
            return {
                "forecast_available": False,
                "reason": "Insufficient historical data (minimum 30 days required)"
            }
        
        # Group by day of week
        day_patterns = defaultdict(list)
        
        for record in historical_records:
            try:
                date_str = record.get('attendance_date')
                if isinstance(date_str, str):
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                else:
                    date_obj = date_str
                
                day_of_week = date_obj.strftime('%A')
                status = record.get('attendance_status')
                is_present = 1 if status == 'present' else 0
                day_patterns[day_of_week].append(is_present)
            except:
                continue
        
        # Calculate average attendance rate per day
        forecast = {}
        days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for day in days_order:
            if day in day_patterns and len(day_patterns[day]) > 0:
                avg_rate = (sum(day_patterns[day]) / len(day_patterns[day])) * 100
                forecast[day] = {
                    "expected_rate": round(avg_rate, 2),
                    "confidence": "high" if len(day_patterns[day]) >= 4 else "medium",
                    "sample_size": len(day_patterns[day])
                }
            else:
                forecast[day] = {
                    "expected_rate": 85.0,  # Default estimate
                    "confidence": "low",
                    "sample_size": 0
                }
        
        return {
            "forecast_available": True,
            "weekly_forecast": forecast,
            "overall_predicted_rate": round(statistics.mean([f['expected_rate'] for f in forecast.values()]), 2)
        }
    
    def generate_recommendations(self, user_analysis: Dict[str, Any], 
                                user_name: str) -> List[Dict[str, str]]:
        """
        Generate AI-powered recommendations based on attendance analysis.
        """
        recommendations = []
        
        risk_level = user_analysis.get('risk_level')
        attendance_rate = user_analysis.get('attendance_rate', 0)
        late_days = user_analysis.get('late_days', 0)
        trend = user_analysis.get('trend', 'stable')
        
        # Critical risk recommendations
        if risk_level == "critical":
            recommendations.append({
                "priority": "urgent",
                "category": "Attendance Intervention",
                "recommendation": f"Immediate meeting required with {user_name}. Attendance rate at {attendance_rate}% is critically low.",
                "action": "Schedule one-on-one meeting within 48 hours"
            })
            recommendations.append({
                "priority": "urgent",
                "category": "HR Review",
                "recommendation": "Initiate formal attendance improvement plan (PIP).",
                "action": "Prepare documentation and review with HR"
            })
        
        # High risk recommendations
        elif risk_level == "high":
            recommendations.append({
                "priority": "high",
                "category": "Early Intervention",
                "recommendation": f"{user_name}'s attendance ({attendance_rate}%) requires attention before it becomes critical.",
                "action": "Schedule informal check-in to understand barriers"
            })
        
        # Late arrival patterns
        if late_days > 5:
            recommendations.append({
                "priority": "medium",
                "category": "Punctuality Coaching",
                "recommendation": f"{user_name} has {late_days} late arrivals. Consider flexible hours or time management support.",
                "action": "Discuss schedule flexibility options"
            })
        
        # Declining trend
        if trend == "declining":
            recommendations.append({
                "priority": "high",
                "category": "Trend Alert",
                "recommendation": f"Attendance is declining for {user_name}. Early intervention can prevent further deterioration.",
                "action": "Investigate underlying causes (health, personal, work-related)"
            })
        
        # Improving trend (positive reinforcement)
        if trend == "improving":
            recommendations.append({
                "priority": "low",
                "category": "Positive Reinforcement",
                "recommendation": f"{user_name} is showing improved attendance. Consider recognition.",
                "action": "Acknowledge improvement in next review or team meeting"
            })
        
        # Excellent performance
        if attendance_rate > 95 and user_analysis.get('punctuality_rate', 0) > 90:
            recommendations.append({
                "priority": "low",
                "category": "Recognition",
                "recommendation": f"{user_name} maintains excellent attendance and punctuality.",
                "action": "Consider for attendance excellence award"
            })
        
        return recommendations
    
    def calculate_overall_insights(self, all_records: List[Dict[str, Any]], 
                                  users: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate organization-wide attendance insights.
        """
        if not all_records:
            return {"error": "No attendance data available"}
        
        total_records = len(all_records)
        present_count = sum(1 for r in all_records if r.get('attendance_status') == 'present')
        late_count = sum(1 for r in all_records if r.get('attendance_status') == 'late')
        absent_count = sum(1 for r in all_records if r.get('attendance_status') == 'absent')
        
        overall_rate = (present_count / total_records) * 100 if total_records > 0 else 0
        late_rate = (late_count / total_records) * 100 if total_records > 0 else 0
        absent_rate = (absent_count / total_records) * 100 if total_records > 0 else 0
        
        # Identify at-risk users count
        user_records = defaultdict(list)
        for record in all_records:
            user_id = record.get('user_id')
            user_records[user_id].append(record)
        
        at_risk_count = 0
        critical_count = 0
        
        for user_id, records in user_records.items():
            analysis = self.analyze_user_attendance(records)
            risk = analysis.get('risk_level')
            if risk == 'critical':
                critical_count += 1
            elif risk == 'high':
                at_risk_count += 1
        
        return {
            "total_records": total_records,
            "overall_attendance_rate": round(overall_rate, 2),
            "late_rate": round(late_rate, 2),
            "absent_rate": round(absent_rate, 2),
            "critical_risk_users": critical_count,
            "high_risk_users": at_risk_count,
            "total_users_tracked": len(user_records),
            "health_status": "excellent" if overall_rate > 95 else
                           "good" if overall_rate > 85 else
                           "needs_attention" if overall_rate > 75 else "critical"
        }
