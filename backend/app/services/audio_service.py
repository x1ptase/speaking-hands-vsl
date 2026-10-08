"""
Audio service.

Responsibility:
- Load audio files from backend/media/
- Map recognised sign class index to the corresponding audio file
- Play audio via the system default speaker
"""

from pathlib import Path
import soundfile as sf
import soundcard as sc

# backend/media/ relative to this file's location (backend/app/services/)
_MEDIA_DIR = Path(__file__).resolve().parents[2] / "media"

# Map from class index to audio filename.
# Only classes with a real recording are included.
_CLASS_TO_AUDIO = {
    0: "output1.wav",
    2: "output2.wav",
    4: "output4.wav",
    5: "output5.wav",
    9: "output6.wav",
}


class AudioService:
    def __init__(self):
        self._speaker = sc.default_speaker()
        print(f"[AudioService] Using speaker: {self._speaker.name}")

    def play(self, class_idx: int) -> bool:
        """
        Play the audio clip associated with the recognised class.

        Args:
            class_idx: Predicted class index (0-9).

        Returns:
            True if a clip was played, False if no audio is mapped to that class.
        """
        filename = _CLASS_TO_AUDIO.get(class_idx)
        if filename is None:
            return False

        audio_path = _MEDIA_DIR / filename
        if not audio_path.exists():
            print(f"[AudioService] Warning: audio file not found: {audio_path}")
            return False

        samples, samplerate = sf.read(str(audio_path))
        self._speaker.play(samples, samplerate=samplerate)
        return True
