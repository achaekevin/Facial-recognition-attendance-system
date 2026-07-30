"""
Advanced anti-spoofing and liveness detection engine.
Implements multiple verification methods to ensure face belongs to a live person.
"""
import cv2
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
import math
from datetime import datetime
from collections import deque


class LivenessDetector:
    """
    Multi-modal liveness detection to prevent spoofing attacks.
    """
    
    def __init__(self):
        # Detection thresholds
        self.blink_threshold = 0.25  # EAR threshold for blink detection
        self.head_movement_threshold = 15.0  # Degrees for head rotation
        self.texture_threshold = 0.3  # LBP variance threshold
        self.frequency_threshold = 0.15  # High-frequency content threshold
        
        # Confidence weights
        self.weights = {
            'blink': 0.25,
            'head_movement': 0.20,
            'texture': 0.20,
            'frequency': 0.15,
            'depth': 0.10,
            'motion': 0.10
        }
        
        # Frame history for temporal analysis
        self.frame_history = deque(maxlen=30)
        self.ear_history = deque(maxlen=20)
        self.blink_count = 0
        self.last_blink_time = None
        
        # Facial landmarks indices
        self.LEFT_EYE = list(range(36, 42))
        self.RIGHT_EYE = list(range(42, 48))
        self.MOUTH = list(range(48, 68))
        
    def calculate_ear(self, eye_landmarks: np.ndarray) -> float:
        """
        Calculate Eye Aspect Ratio (EAR) for blink detection.
        
        Args:
            eye_landmarks: Array of 6 eye landmark coordinates [(x,y), ...]
            
        Returns:
            EAR value (lower values indicate closed eye)
        """
        # Vertical eye distances
        A = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
        B = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])
        
        # Horizontal eye distance
        C = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])
        
        # Eye aspect ratio
        ear = (A + B) / (2.0 * C)
        return ear
    
    def detect_blink(self, landmarks: np.ndarray) -> Dict[str, Any]:
        """
        Detect eye blinks using Eye Aspect Ratio (EAR).
        
        Args:
            landmarks: Array of 68 facial landmarks
            
        Returns:
            Dictionary with blink detection results
        """
        if landmarks is None or len(landmarks) < 68:
            return {
                'blink_detected': False,
                'ear_left': 0.0,
                'ear_right': 0.0,
                'confidence': 0.0,
                'status': 'insufficient_landmarks'
            }
        
        # Calculate EAR for both eyes
        left_eye = landmarks[self.LEFT_EYE]
        right_eye = landmarks[self.RIGHT_EYE]
        
        ear_left = self.calculate_ear(left_eye)
        ear_right = self.calculate_ear(right_eye)
        ear_avg = (ear_left + ear_right) / 2.0
        
        # Add to history
        self.ear_history.append(ear_avg)
        
        # Detect blink (EAR drops below threshold)
        blink_detected = False
        if ear_avg < self.blink_threshold:
            # Check if this is a new blink
            if len(self.ear_history) >= 3:
                # Verify it was open before
                prev_ears = list(self.ear_history)[-5:-1]
                if prev_ears and all(e > self.blink_threshold for e in prev_ears):
                    blink_detected = True
                    self.blink_count += 1
                    self.last_blink_time = datetime.now()
        
        # Calculate confidence based on blink naturalness
        confidence = 0.0
        if len(self.ear_history) >= 10:
            ear_variance = np.var(list(self.ear_history))
            # Natural blinking shows variance
            if 0.001 < ear_variance < 0.05:
                confidence = min(1.0, ear_variance * 50)
            
        return {
            'blink_detected': blink_detected,
            'blink_count': self.blink_count,
            'ear_left': round(ear_left, 3),
            'ear_right': round(ear_right, 3),
            'ear_avg': round(ear_avg, 3),
            'confidence': round(confidence, 3),
            'status': 'live' if blink_detected else 'monitoring'
        }
    
    def detect_head_movement(self, landmarks: np.ndarray, 
                           prev_landmarks: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Detect head rotation and movement.
        
        Args:
            landmarks: Current facial landmarks
            prev_landmarks: Previous frame landmarks
            
        Returns:
            Dictionary with head movement analysis
        """
        if landmarks is None or len(landmarks) < 68:
            return {
                'movement_detected': False,
                'rotation': {'yaw': 0.0, 'pitch': 0.0, 'roll': 0.0},
                'confidence': 0.0,
                'status': 'insufficient_data'
            }
        
        # Estimate head pose using key landmarks
        # Nose tip, chin, left eye outer, right eye outer, left mouth, right mouth
        key_points = landmarks[[30, 8, 36, 45, 48, 54]]
        
        # Simple rotation estimation based on landmark positions
        left_eye = landmarks[36]
        right_eye = landmarks[45]
        nose = landmarks[30]
        chin = landmarks[8]
        
        # Calculate angles
        eye_center = (left_eye + right_eye) / 2
        
        # Yaw (left-right rotation)
        left_dist = np.linalg.norm(nose - left_eye)
        right_dist = np.linalg.norm(nose - right_eye)
        yaw = math.degrees(math.atan2(right_dist - left_dist, (left_dist + right_dist) / 2))
        
        # Pitch (up-down rotation)
        vertical_dist = np.linalg.norm(eye_center - chin)
        nose_to_eyes = np.linalg.norm(nose - eye_center)
        pitch = math.degrees(math.atan2(nose_to_eyes, vertical_dist)) - 90
        
        # Roll (tilt)
        dx = right_eye[0] - left_eye[0]
        dy = right_eye[1] - left_eye[1]
        roll = math.degrees(math.atan2(dy, dx))
        
        # Detect significant movement
        movement_detected = False
        if prev_landmarks is not None:
            displacement = np.mean(np.linalg.norm(landmarks - prev_landmarks, axis=1))
            movement_detected = displacement > 5.0  # Threshold in pixels
        
        # Calculate confidence
        confidence = 0.0
        if abs(yaw) > 5 or abs(pitch) > 5 or abs(roll) > 5:
            confidence = min(1.0, (abs(yaw) + abs(pitch) + abs(roll)) / 50.0)
        
        return {
            'movement_detected': movement_detected,
            'rotation': {
                'yaw': round(yaw, 2),
                'pitch': round(pitch, 2),
                'roll': round(roll, 2)
            },
            'confidence': round(confidence, 3),
            'status': 'live' if movement_detected or confidence > 0.3 else 'static'
        }
    
    def detect_texture_liveness(self, frame: np.ndarray, face_region: Tuple[int, int, int, int]) -> Dict[str, Any]:
        """
        Analyze texture patterns to detect printed photos or screens.
        Uses Local Binary Patterns (LBP) and frequency analysis.
        
        Args:
            frame: Full image frame
            face_region: (x, y, w, h) of face bounding box
            
        Returns:
            Dictionary with texture analysis
        """
        if frame is None or frame.size == 0:
            return {
                'is_live': False,
                'texture_score': 0.0,
                'confidence': 0.0,
                'status': 'no_data'
            }
        
        x, y, w, h = face_region
        
        # Extract face region
        if y + h > frame.shape[0] or x + w > frame.shape[1]:
            return {
                'is_live': False,
                'texture_score': 0.0,
                'confidence': 0.0,
                'status': 'invalid_region'
            }
        
        face = frame[y:y+h, x:x+w]
        
        if face.size == 0:
            return {
                'is_live': False,
                'texture_score': 0.0,
                'confidence': 0.0,
                'status': 'empty_region'
            }
        
        # Convert to grayscale
        if len(face.shape) == 3:
            gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        else:
            gray = face
        
        # Calculate Local Binary Pattern variance
        lbp_variance = self._calculate_lbp_variance(gray)
        
        # Calculate frequency content (printed photos have less high-frequency content)
        frequency_score = self._calculate_frequency_content(gray)
        
        # Combine scores
        texture_score = (lbp_variance * 0.6 + frequency_score * 0.4)
        
        # Live faces typically have texture_score > 0.3
        is_live = texture_score > self.texture_threshold
        confidence = min(1.0, texture_score / 0.5)
        
        return {
            'is_live': is_live,
            'texture_score': round(texture_score, 3),
            'lbp_variance': round(lbp_variance, 3),
            'frequency_score': round(frequency_score, 3),
            'confidence': round(confidence, 3),
            'status': 'live' if is_live else 'possible_spoof'
        }
    
    def _calculate_lbp_variance(self, gray_image: np.ndarray) -> float:
        """
        Calculate Local Binary Pattern variance.
        """
        # Simplified LBP calculation
        rows, cols = gray_image.shape
        
        # Create LBP image
        lbp = np.zeros_like(gray_image)
        
        for i in range(1, rows - 1):
            for j in range(1, cols - 1):
                center = gray_image[i, j]
                code = 0
                
                # 8 neighbors
                code |= (gray_image[i-1, j-1] >= center) << 7
                code |= (gray_image[i-1, j] >= center) << 6
                code |= (gray_image[i-1, j+1] >= center) << 5
                code |= (gray_image[i, j+1] >= center) << 4
                code |= (gray_image[i+1, j+1] >= center) << 3
                code |= (gray_image[i+1, j] >= center) << 2
                code |= (gray_image[i+1, j-1] >= center) << 1
                code |= (gray_image[i, j-1] >= center) << 0
                
                lbp[i, j] = code
        
        # Calculate variance
        variance = np.var(lbp) / 255.0
        return variance
    
    def _calculate_frequency_content(self, gray_image: np.ndarray) -> float:
        """
        Calculate high-frequency content using FFT.
        Printed photos/screens typically have less high-frequency content.
        """
        # Apply FFT
        fft = np.fft.fft2(gray_image)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.abs(fft_shift)
        
        # Calculate high-frequency energy
        rows, cols = magnitude.shape
        center_row, center_col = rows // 2, cols // 2
        
        # Create mask for high frequencies (outer region)
        y, x = np.ogrid[:rows, :cols]
        mask = ((x - center_col)**2 + (y - center_row)**2) > (min(rows, cols) // 4)**2
        
        high_freq_energy = np.sum(magnitude[mask])
        total_energy = np.sum(magnitude)
        
        frequency_score = high_freq_energy / (total_energy + 1e-10)
        return frequency_score
    
    def detect_screen_replay(self, frame: np.ndarray, face_region: Tuple[int, int, int, int]) -> Dict[str, Any]:
        """
        Detect if the face is being displayed on a screen (replay attack).
        Looks for moiré patterns and screen refresh artifacts.
        
        Args:
            frame: Full image frame
            face_region: (x, y, w, h) of face bounding box
            
        Returns:
            Dictionary with screen detection results
        """
        x, y, w, h = face_region
        
        if frame is None or y + h > frame.shape[0] or x + w > frame.shape[1]:
            return {
                'is_screen': False,
                'confidence': 0.0,
                'status': 'insufficient_data'
            }
        
        face = frame[y:y+h, x:x+w]
        
        if face.size == 0:
            return {
                'is_screen': False,
                'confidence': 0.0,
                'status': 'empty_region'
            }
        
        # Convert to grayscale
        if len(face.shape) == 3:
            gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        else:
            gray = face
        
        # Detect moiré patterns using FFT
        fft = np.fft.fft2(gray)
        fft_shift = np.fft.fftshift(fft)
        magnitude = 20 * np.log(np.abs(fft_shift) + 1)
        
        # Look for regular patterns (screens have regular pixel grids)
        # Calculate autocorrelation to detect periodic patterns
        normalized = (magnitude - np.mean(magnitude)) / (np.std(magnitude) + 1e-10)
        
        # Simplified pattern detection
        rows, cols = normalized.shape
        center = normalized[rows//4:3*rows//4, cols//4:3*cols//4]
        pattern_strength = np.max(center) - np.mean(center)
        
        is_screen = pattern_strength > 3.0  # Threshold for screen detection
        confidence = min(1.0, pattern_strength / 5.0)
        
        return {
            'is_screen': is_screen,
            'pattern_strength': round(float(pattern_strength), 3),
            'confidence': round(confidence, 3),
            'status': 'screen_detected' if is_screen else 'real_face'
        }
    
    def calculate_overall_liveness_score(self, 
                                        blink_result: Dict[str, Any],
                                        movement_result: Dict[str, Any],
                                        texture_result: Dict[str, Any],
                                        screen_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate overall liveness confidence score from all detection methods.
        
        Args:
            blink_result: Blink detection results
            movement_result: Head movement results
            texture_result: Texture analysis results
            screen_result: Screen detection results
            
        Returns:
            Overall liveness assessment
        """
        # Extract individual scores
        blink_score = blink_result.get('confidence', 0.0)
        movement_score = movement_result.get('confidence', 0.0)
        texture_score = texture_result.get('confidence', 0.0)
        screen_score = 1.0 - screen_result.get('confidence', 0.0)  # Invert (lower is better)
        
        # Weighted combination
        overall_score = (
            self.weights['blink'] * blink_score +
            self.weights['head_movement'] * movement_score +
            self.weights['texture'] * texture_score +
            self.weights['frequency'] * texture_result.get('frequency_score', 0.0) +
            self.weights['motion'] * (1.0 if movement_result.get('movement_detected') else 0.0)
        )
        
        # Penalties for detected spoofing
        if screen_result.get('is_screen'):
            overall_score *= 0.3
        
        if not texture_result.get('is_live'):
            overall_score *= 0.5
        
        # Determine final status
        if overall_score > 0.75:
            status = 'high_confidence_live'
            risk = 'low'
        elif overall_score > 0.50:
            status = 'probable_live'
            risk = 'medium'
        elif overall_score > 0.30:
            status = 'uncertain'
            risk = 'high'
        else:
            status = 'likely_spoof'
            risk = 'critical'
        
        return {
            'overall_score': round(overall_score, 3),
            'status': status,
            'risk_level': risk,
            'is_live': overall_score > 0.50,
            'component_scores': {
                'blink': round(blink_score, 3),
                'movement': round(movement_score, 3),
                'texture': round(texture_score, 3),
                'screen': round(screen_score, 3)
            },
            'checks_passed': {
                'blink': blink_result.get('blink_detected', False),
                'movement': movement_result.get('movement_detected', False),
                'texture': texture_result.get('is_live', False),
                'screen': not screen_result.get('is_screen', True)
            },
            'recommendations': self._generate_recommendations(overall_score, status)
        }
    
    def _generate_recommendations(self, score: float, status: str) -> List[str]:
        """
        Generate recommendations based on liveness score.
        """
        recommendations = []
        
        if score < 0.30:
            recommendations.append("REJECT: Possible spoofing attack detected")
            recommendations.append("Request user to retry with better lighting")
        elif score < 0.50:
            recommendations.append("CAUTION: Low liveness confidence")
            recommendations.append("Require additional verification method")
        elif score < 0.75:
            recommendations.append("REVIEW: Moderate confidence")
            recommendations.append("Consider manual review for critical access")
        else:
            recommendations.append("ACCEPT: High confidence live person")
            recommendations.append("Proceed with face recognition")
        
        return recommendations
    
    def reset(self):
        """Reset all detection states."""
        self.frame_history.clear()
        self.ear_history.clear()
        self.blink_count = 0
        self.last_blink_time = None
    
    def perform_full_liveness_check(self, 
                                   frame: np.ndarray,
                                   landmarks: np.ndarray,
                                   face_region: Tuple[int, int, int, int],
                                   prev_landmarks: Optional[np.ndarray] = None) -> Dict[str, Any]:
        """
        Perform comprehensive liveness detection using all available methods.
        
        Args:
            frame: Input image frame
            landmarks: Facial landmarks (68 points)
            face_region: Face bounding box (x, y, w, h)
            prev_landmarks: Previous frame landmarks for motion detection
            
        Returns:
            Complete liveness assessment
        """
        # Run all detection methods
        blink_result = self.detect_blink(landmarks)
        movement_result = self.detect_head_movement(landmarks, prev_landmarks)
        texture_result = self.detect_texture_liveness(frame, face_region)
        screen_result = self.detect_screen_replay(frame, face_region)
        
        # Calculate overall score
        overall_result = self.calculate_overall_liveness_score(
            blink_result,
            movement_result,
            texture_result,
            screen_result
        )
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overall': overall_result,
            'blink_detection': blink_result,
            'head_movement': movement_result,
            'texture_analysis': texture_result,
            'screen_detection': screen_result
        }
