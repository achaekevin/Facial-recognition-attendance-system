"""
API endpoints for liveness detection and anti-spoofing verification.
"""
import base64
import numpy as np
import cv2
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.authorization.rbac import get_current_user
from app.recognition.liveness_detector import LivenessDetector

router = APIRouter(prefix="/liveness", tags=["Liveness Detection"])

# Initialize liveness detector
liveness_detector = LivenessDetector()


class LivenessCheckRequest(BaseModel):
    """Request model for liveness check."""
    image_base64: str
    check_blink: bool = True
    check_movement: bool = True
    check_texture: bool = True
    check_screen: bool = True


class LivenessCheckResponse(BaseModel):
    """Response model for liveness check."""
    success: bool
    is_live: bool
    overall_score: float
    risk_level: str
    status: str
    component_scores: dict
    checks_passed: dict
    recommendations: list
    details: dict


def decode_base64_image(base64_str: str) -> np.ndarray:
    """
    Decode base64 string to OpenCV image.
    
    Args:
        base64_str: Base64 encoded image string
        
    Returns:
        OpenCV image array
    """
    # Remove data URL prefix if present
    if ',' in base64_str:
        base64_str = base64_str.split(',')[1]
    
    # Decode base64
    img_data = base64.b64decode(base64_str)
    np_arr = np.frombuffer(img_data, np.uint8)
    
    # Decode image
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Failed to decode image")
    
    return img


def detect_face_and_landmarks(image: np.ndarray):
    """
    Detect face and extract landmarks using dlib or mediapipe.
    Simplified version - in production, use proper face detection.
    
    Args:
        image: Input image
        
    Returns:
        Tuple of (face_region, landmarks)
    """
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Use Haar Cascade for face detection (simple approach)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    if len(faces) == 0:
        return None, None
    
    # Take the largest face
    face = max(faces, key=lambda f: f[2] * f[3])
    x, y, w, h = face
    
    # Generate mock landmarks for demo
    # In production, use dlib or mediapipe for real landmark detection
    landmarks = generate_mock_landmarks((x, y, w, h))
    
    return (x, y, w, h), landmarks


def generate_mock_landmarks(face_region):
    """
    Generate mock 68 facial landmarks for demo purposes.
    In production, replace with actual landmark detection (dlib, mediapipe, etc.)
    
    Args:
        face_region: (x, y, w, h) tuple
        
    Returns:
        68x2 numpy array of landmark coordinates
    """
    x, y, w, h = face_region
    
    # Create approximate landmark positions
    landmarks = np.zeros((68, 2))
    
    # Face outline (0-16)
    for i in range(17):
        landmarks[i] = [x + (i / 16.0) * w, y + h * 0.7]
    
    # Eyebrows (17-26)
    for i in range(17, 22):
        landmarks[i] = [x + ((i - 17) / 4.0) * w * 0.4, y + h * 0.3]
    for i in range(22, 27):
        landmarks[i] = [x + w * 0.6 + ((i - 22) / 4.0) * w * 0.4, y + h * 0.3]
    
    # Nose (27-35)
    for i in range(27, 36):
        landmarks[i] = [x + w * 0.5, y + h * (0.4 + (i - 27) * 0.05)]
    
    # Left eye (36-41)
    eye_left_center = (x + w * 0.35, y + h * 0.4)
    for i in range(36, 42):
        angle = (i - 36) * np.pi / 3
        landmarks[i] = [
            eye_left_center[0] + np.cos(angle) * w * 0.08,
            eye_left_center[1] + np.sin(angle) * h * 0.05
        ]
    
    # Right eye (42-47)
    eye_right_center = (x + w * 0.65, y + h * 0.4)
    for i in range(42, 48):
        angle = (i - 42) * np.pi / 3
        landmarks[i] = [
            eye_right_center[0] + np.cos(angle) * w * 0.08,
            eye_right_center[1] + np.sin(angle) * h * 0.05
        ]
    
    # Mouth (48-67)
    mouth_center = (x + w * 0.5, y + h * 0.75)
    for i in range(48, 68):
        angle = (i - 48) * 2 * np.pi / 20
        landmarks[i] = [
            mouth_center[0] + np.cos(angle) * w * 0.15,
            mouth_center[1] + np.sin(angle) * h * 0.08
        ]
    
    return landmarks


@router.post("/check", response_model=LivenessCheckResponse)
async def perform_liveness_check(
    request: LivenessCheckRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Perform comprehensive liveness detection on an image.
    
    This endpoint analyzes the provided image for signs of spoofing:
    - Blink detection
    - Head movement
    - Texture analysis (photo detection)
    - Screen replay detection
    
    Returns detailed liveness score and recommendations.
    """
    try:
        # Decode image
        try:
            image = decode_base64_image(request.image_base64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
        
        # Detect face and landmarks
        face_region, landmarks = detect_face_and_landmarks(image)
        
        if face_region is None or landmarks is None:
            raise HTTPException(
                status_code=400,
                detail="No face detected in image. Please ensure face is clearly visible."
            )
        
        # Perform liveness checks based on request parameters
        results = {
            'blink_detection': None,
            'head_movement': None,
            'texture_analysis': None,
            'screen_detection': None
        }
        
        if request.check_blink:
            results['blink_detection'] = liveness_detector.detect_blink(landmarks)
        
        if request.check_movement:
            results['head_movement'] = liveness_detector.detect_head_movement(landmarks)
        
        if request.check_texture:
            results['texture_analysis'] = liveness_detector.detect_texture_liveness(
                image, face_region
            )
        
        if request.check_screen:
            results['screen_detection'] = liveness_detector.detect_screen_replay(
                image, face_region
            )
        
        # Calculate overall liveness score
        overall_result = liveness_detector.calculate_overall_liveness_score(
            results['blink_detection'] or {},
            results['head_movement'] or {},
            results['texture_analysis'] or {},
            results['screen_detection'] or {}
        )
        
        return LivenessCheckResponse(
            success=True,
            is_live=overall_result['is_live'],
            overall_score=overall_result['overall_score'],
            risk_level=overall_result['risk_level'],
            status=overall_result['status'],
            component_scores=overall_result['component_scores'],
            checks_passed=overall_result['checks_passed'],
            recommendations=overall_result['recommendations'],
            details={
                'blink': results['blink_detection'],
                'movement': results['head_movement'],
                'texture': results['texture_analysis'],
                'screen': results['screen_detection']
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Liveness check failed: {str(e)}"
        )


@router.post("/verify-live")
async def verify_live_person(
    image: UploadFile = File(...),
    threshold: float = Form(default=0.5),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Quick liveness verification endpoint.
    Returns simple yes/no answer with confidence score.
    
    Args:
        image: Uploaded image file
        threshold: Minimum confidence threshold (0.0-1.0)
        
    Returns:
        Simple verification result
    """
    try:
        # Read image file
        contents = await image.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Detect face
        face_region, landmarks = detect_face_and_landmarks(img)
        
        if face_region is None:
            return {
                "success": False,
                "is_live": False,
                "confidence": 0.0,
                "message": "No face detected in image"
            }
        
        # Perform full liveness check
        result = liveness_detector.perform_full_liveness_check(
            img, landmarks, face_region
        )
        
        overall_score = result['overall']['overall_score']
        is_live = overall_score >= threshold
        
        return {
            "success": True,
            "is_live": is_live,
            "confidence": overall_score,
            "risk_level": result['overall']['risk_level'],
            "status": result['overall']['status'],
            "message": f"{'Live person detected' if is_live else 'Possible spoofing detected'} (confidence: {overall_score:.1%})",
            "checks": {
                "blink": result['blink_detection'].get('blink_detected', False),
                "movement": result['head_movement'].get('movement_detected', False),
                "texture": result['texture_analysis'].get('is_live', False),
                "not_screen": not result['screen_detection'].get('is_screen', True)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


@router.post("/batch-check")
async def batch_liveness_check(
    images_base64: list[str],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Perform liveness detection on multiple frames.
    Useful for video stream analysis.
    
    Args:
        images_base64: List of base64-encoded images
        
    Returns:
        Aggregated liveness results
    """
    if len(images_base64) > 30:
        raise HTTPException(
            status_code=400,
            detail="Maximum 30 frames allowed per batch"
        )
    
    try:
        results = []
        liveness_detector.reset()  # Reset detector state
        
        prev_landmarks = None
        
        for idx, img_b64 in enumerate(images_base64):
            try:
                # Decode image
                image = decode_base64_image(img_b64)
                
                # Detect face
                face_region, landmarks = detect_face_and_landmarks(image)
                
                if face_region and landmarks is not None:
                    # Perform liveness check
                    result = liveness_detector.perform_full_liveness_check(
                        image, landmarks, face_region, prev_landmarks
                    )
                    
                    results.append({
                        'frame_index': idx,
                        'success': True,
                        'score': result['overall']['overall_score'],
                        'is_live': result['overall']['is_live'],
                        'status': result['overall']['status']
                    })
                    
                    prev_landmarks = landmarks
                else:
                    results.append({
                        'frame_index': idx,
                        'success': False,
                        'score': 0.0,
                        'is_live': False,
                        'status': 'no_face_detected'
                    })
            
            except Exception as e:
                results.append({
                    'frame_index': idx,
                    'success': False,
                    'score': 0.0,
                    'is_live': False,
                    'status': f'error: {str(e)}'
                })
        
        # Calculate aggregate statistics
        successful_checks = [r for r in results if r['success']]
        
        if not successful_checks:
            return {
                "success": False,
                "message": "No successful liveness checks in batch",
                "results": results
            }
        
        avg_score = sum(r['score'] for r in successful_checks) / len(successful_checks)
        live_count = sum(1 for r in successful_checks if r['is_live'])
        
        return {
            "success": True,
            "total_frames": len(images_base64),
            "successful_checks": len(successful_checks),
            "average_score": round(avg_score, 3),
            "live_frames": live_count,
            "live_percentage": round((live_count / len(successful_checks)) * 100, 1),
            "overall_verdict": "LIVE" if avg_score > 0.5 and live_count / len(successful_checks) > 0.7 else "SUSPICIOUS",
            "blink_count": liveness_detector.blink_count,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Batch check failed: {str(e)}"
        )


@router.get("/config")
async def get_liveness_config(
    current_user = Depends(get_current_user)
):
    """
    Get current liveness detection configuration and thresholds.
    """
    return {
        "success": True,
        "config": {
            "thresholds": {
                "blink_ear": liveness_detector.blink_threshold,
                "head_movement": liveness_detector.head_movement_threshold,
                "texture": liveness_detector.texture_threshold,
                "frequency": liveness_detector.frequency_threshold
            },
            "weights": liveness_detector.weights,
            "enabled_checks": {
                "blink_detection": True,
                "head_movement": True,
                "texture_analysis": True,
                "screen_detection": True,
                "depth_estimation": False  # Future feature
            },
            "recommendation_thresholds": {
                "high_confidence": 0.75,
                "probable": 0.50,
                "uncertain": 0.30,
                "likely_spoof": 0.0
            }
        }
    }


@router.post("/reset")
async def reset_liveness_detector(
    current_user = Depends(get_current_user)
):
    """
    Reset liveness detector state.
    Useful when starting a new verification session.
    """
    liveness_detector.reset()
    
    return {
        "success": True,
        "message": "Liveness detector state reset successfully"
    }
