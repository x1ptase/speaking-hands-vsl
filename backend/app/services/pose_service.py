"""
Pose service.

Responsibility:
- MediaPipe initialization
- Pose landmark extraction from a BGR frame
- Returning 33 x 2 numpy array of (x, y) landmarks
"""

from pathlib import Path
import mediapipe as mp
import numpy as np


class PoseService:
    def __init__(self, min_detection_confidence: float = 0.5, min_tracking_confidence: float = 0.5):
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.mp_pose = mp.solutions.pose
        self._pose = self.mp_pose.Pose(
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def process_frame(self, bgr_frame):
        """
        Process a BGR OpenCV frame.

        Returns:
            annotated_frame (np.ndarray): Frame with pose landmarks drawn.
            keypoint (list | None): List of 33 [x, y] arrays, or None if no pose detected.
        """
        import cv2

        frame = bgr_frame.copy()
        frame.flags.writeable = False
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self._pose.process(rgb)

        frame.flags.writeable = True
        annotated = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        self.mp_drawing.draw_landmarks(
            annotated,
            results.pose_landmarks,
            self.mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style(),
        )

        keypoint = None
        if results.pose_landmarks:
            flat = np.array([[res.x, res.y] for res in results.pose_landmarks.landmark]).flatten()
            keypoint = list(np.array_split(flat, 33))

        return annotated, keypoint

    def close(self):
        self._pose.close()
