import pytest
from app.recognition.engine import biometric_engine
from app.recognition.liveness_detector import LivenessDetector

def test_arcface_embedding_dimension():
    mock_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP..."
    vec = biometric_engine.extract_embedding(mock_base64)
    assert len(vec) == 512
    assert isinstance(vec, list)
    for v in vec:
        assert isinstance(v, float)

def test_cosine_similarity_identical_vectors():
    vec = [0.05] * 512
    score = biometric_engine.compute_cosine_similarity(vec, vec)
    assert score >= 99.0

def test_cosine_similarity_orthogonal_vectors():
    vec1 = [1.0] + [0.0] * 511
    vec2 = [0.0] + [1.0] + [0.0] * 510
    score = biometric_engine.compute_cosine_similarity(vec1, vec2)
    assert score == 50.0

def test_liveness_detector_instantiation():
    detector = LivenessDetector()
    assert detector.blink_threshold == 0.25
    assert detector.weights['blink'] == 0.25
