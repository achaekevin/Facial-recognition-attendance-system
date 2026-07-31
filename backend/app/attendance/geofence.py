import math
from typing import Tuple, Dict, Any

class GeofenceEngine:
    """
    Haversine Geofence Distance Engine for verifying mobile GPS check-in boundaries.
    """

    def __init__(
        self,
        center_lat: float = 24.7136,  # Default Main Campus Latitude
        center_lng: float = 46.6753,  # Default Main Campus Longitude
        allowed_radius_meters: float = 500.0
    ):
        self.center_lat = center_lat
        self.center_lng = center_lng
        self.allowed_radius_meters = allowed_radius_meters

    def calculate_haversine_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculates distance in meters between two lat/lng points using Haversine formula."""
        R = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lng2 - lng1)

        a = (
            math.sin(delta_phi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        distance = R * c
        return round(distance, 1)

    def verify_checkin_location(self, user_lat: float, user_lng: float) -> Tuple[bool, float, str]:
        """
        Verifies if user's GPS location is within the allowed campus geofence radius.
        Returns (is_inside, distance_meters, status_message).
        """
        dist = self.calculate_haversine_distance(user_lat, user_lng, self.center_lat, self.center_lng)
        is_inside = dist <= self.allowed_radius_meters

        if is_inside:
            msg = f"GPS Verified: Inside campus perimeter ({dist}m from center)."
        else:
            msg = f"Geofence Access Denied: You are {dist}m away (max allowed: {self.allowed_radius_meters}m)."

        return is_inside, dist, msg

geofence_engine = GeofenceEngine()
