"""
Recognition service.

Responsibility:
- Load DD-Net model and weights
- Prepare model input (feature extraction from landmark sequences)
- Run inference
- Return recognized sign label and confidence
"""

from pathlib import Path
import random
import numpy as np
import scipy.ndimage.interpolation as inter
from scipy.signal import medfilt
from scipy.spatial.distance import cdist
from tqdm import tqdm

# Model files sit next to this package: backend/app/model/
_MODEL_DIR = Path(__file__).resolve().parents[1] / "model"
_WEIGHTS_PATH = _MODEL_DIR / "trainModels.h5"

# Recognition labels (10 classes, 5 active)
LABELS = [
    "xin chao rat vui duoc gap ban",   # class 0
    "",                                  # class 1
    "xin cam on ban that tot bung",     # class 2
    "",                                  # class 3
    "xin chao rat vui duoc gap ban",   # class 4
    "toi la nguoi diec",                # class 5
    "",                                  # class 6
    "",                                  # class 7
    "",                                  # class 8
    "toi la nguoi diec",                # class 9
]


def _zoom(p, target_l=32, joints_num=20, joints_dim=3):
    """Temporal resampling via median filter + linear interpolation."""
    l = p.shape[0]
    p_new = np.empty([target_l, joints_num, joints_dim])
    for m in range(joints_num):
        for n in range(joints_dim):
            p[:, m, n] = medfilt(p[:, m, n], 3)
            p_new[:, m, n] = inter.zoom(p[:, m, n], target_l / l)[:target_l]
    return p_new


def _norm_train2d(p):
    """Centre 2-D pose sequence around its mean."""
    p[:, :, 0] = p[:, :, 0] - np.mean(p[:, :, 0])
    p[:, :, 1] = p[:, :, 1] - np.mean(p[:, :, 1])
    return p


def _get_CG(p, C):
    """
    Compute JCD (Joint Cartesian Distance) feature matrix.
    NOTE: This version matches the original main.py implementation
    which appends a zero-row before computing cdist.
    """
    M = []
    iu = np.triu_indices(C.joint_n, 1, C.joint_n)
    for f in range(C.frame_l):
        d_m = cdist(p[f], np.concatenate([p[f], np.zeros([1, C.joint_d])]), "euclidean")
        d_m = d_m[iu]
        M.append(d_m)
    M = np.stack(M)
    return M


def _prepare_input(sequence, C):
    """Build the two model input arrays (JCD matrix + normalised pose) from a sequence."""
    X_0 = []
    X_1 = []

    T = np.expand_dims(sequence, axis=0)
    for i in tqdm(range(len(T))):
        p = np.copy(T[i])
        p = _zoom(p, target_l=C.frame_l, joints_num=C.joint_n, joints_dim=C.joint_d)
        M = _get_CG(p, C)
        X_0.append(M)
        p = _norm_train2d(p)
        X_1.append(p)

    return np.stack(X_0), np.stack(X_1)


class RecognitionService:
    def __init__(self):
        # Import here to avoid pulling TF at module level prematurely
        from app.model import ddnet

        self._C = ddnet.Config()
        self._model = ddnet.build_DD_Net(self._C)
        self._model.summary()
        self._model.load_weights(str(_WEIGHTS_PATH))
        print(f"[RecognitionService] Loaded weights from {_WEIGHTS_PATH}")

    def predict(self, sequence: list) -> tuple[str, float]:
        """
        Run inference on a landmark sequence.

        Args:
            sequence: list of 33-element [x, y] arrays, length >= 100.

        Returns:
            (label, confidence): recognised Vietnamese phrase and softmax confidence.
        """
        X_0, X_1 = _prepare_input(np.array(sequence), self._C)
        probs = self._model.predict([X_0, X_1])[0]
        class_idx = int(np.argmax(probs))
        confidence = float(probs[class_idx])
        label = LABELS[class_idx]
        return label, confidence, class_idx
