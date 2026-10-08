"""
main.py — Speaking Hands VSL entry point.

Coordinates:
    Camera (OpenCV)
        ↓
    PoseService (MediaPipe)
        ↓
    RecognitionService (DD-Net)
        ↓
    AudioService (SoundCard / SoundFile)

Run from backend/:
    source ../.venv/bin/activate
    python app/main.py
"""

import sys
import os

# Tắt log từ abseil/TensorFlow
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["GLOG_minloglevel"] = "2"

import time

# Ensure the 'app/' directory is on sys.path so that
# 'from model import ddnet' resolves correctly regardless of cwd.
APP_DIR = os.path.dirname(os.path.abspath(__file__))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

import cv2
from tkinter import *

from services.pose_service import PoseService
from services.recognition_service import RecognitionService
from services.audio_service import AudioService


# ---------------------------------------------------------------------------
# Tkinter GUI setup
# ---------------------------------------------------------------------------
window = Tk()
window.title("Vietnamese Sign Language Interpreter")
window.geometry("1020x600")
window["bg"] = "#e0ffff"

label_text = Label(
    window,
    text="  Phiên dịch ngôn ngữ kí hiệu                                                                ",
    bg="#708090",
    fg="#fffafa",
    font=("Time New Roman", 30),
)
label_text.place(x=0, y=0)

label_text1 = Label(
    window,
    text="                                                                                            ",
    bg="#4682b4",
    font=("Time New Roman", 70),
)
label_text1.place(x=0, y=48)

label_text2 = Label(
    window,
    text="                                                                                            ",
    bg="#d3d3d3",
    font=("Time New Roman", 40),
)
label_text2.place(x=0, y=158)

label_text2 = Label(
    window,
    text="                                                                                            ",
    bg="#4682b4",
    font=("Time New Roman", 100),
)
label_text2.place(x=200, y=280)

label_text3 = Label(window, text="    ", bg="#4682b4", font=("Time New Roman", 18))
label_text3.place(x=0, y=260)
label_text4 = Label(window, text="    ", bg="#4682b4", font=("Time New Roman", 18))
label_text4.place(x=0, y=300)
label_text5 = Label(window, text="    ", bg="#4682b4", font=("Time New Roman", 18))
label_text5.place(x=0, y=340)
label_text6 = Label(window, text="    ", bg="#4682b4", font=("Time New Roman", 18))
label_text6.place(x=0, y=380)
label_text7 = Label(window, text="    ", bg="#4682b4", font=("Time New Roman", 18))
label_text7.place(x=0, y=420)


# ---------------------------------------------------------------------------
# Model 1 — real-time sign language recognition
# ---------------------------------------------------------------------------
def GT1():
    pose_service = PoseService()
    recognition_service = RecognitionService()
    audio_service = AudioService()

    sequence = []
    sentence = [""]
    time0 = 0

    cap = cv2.VideoCapture(0)
    try:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            # Flip for selfie-view
            frame = cv2.flip(frame, 1)

            # Pose landmark extraction
            annotated_frame, keypoint = pose_service.process_frame(frame)

            if keypoint is not None:
                sequence.append(keypoint)
                sequence = sequence[-120:]

            # Run inference when enough frames are buffered
            if len(sequence) == 120:
                label, confidence, class_idx = recognition_service.predict(sequence[-100:])
                audio_service.play(class_idx)
                sentence.append(label)
                sequence.clear()
                print(sentence)

            # FPS overlay
            time1 = time.time()
            if time0 > 0:
                fps = 1 / (time1 - time0)
                cv2.putText(
                    annotated_frame,
                    "FPS:" + str(int(fps)),
                    (3, 475),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )
            time0 = time1

            # Prediction overlay
            cv2.rectangle(annotated_frame, (0, 0), (640, 40), (245, 117, 16), -1)
            cv2.putText(
                annotated_frame,
                "".join(sentence[-1:]),
                (3, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )
            cv2.imshow("Vietnamese Sign Language", annotated_frame)

            if cv2.waitKey(5) & 0xFF == ord("q"):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        pose_service.close()


# ---------------------------------------------------------------------------
# Model 2 — text input / display utility
# ---------------------------------------------------------------------------
def GT2():
    label_text = Label(window, text="", fg="white", bg="#4682b4", font=("Time New Roman", 30))
    label_text.place(x=200, y=300)

    t2t = Entry(window, width=40)
    t2t.place(x=500, y=66)

    def handleButtonCon():
        label_text.configure(text="" + t2t.get())

    btnCon = Button(
        window,
        text="Hoạt động",
        bg="#696969",
        fg="#e6e6fa",
        font=("Time New Roman", 12),
        command=handleButtonCon,
    )
    btnCon.place(x=750, y=60)


# ---------------------------------------------------------------------------
# Buttons
# ---------------------------------------------------------------------------
btnCon1 = Button(
    window,
    text="Model 1",
    bg="#696969",
    fg="#e6e6fa",
    font=("Time New Roman", 18),
    command=GT1,
)
btnCon1.place(x=10, y=168)

btnCon2 = Button(
    window,
    text="Model 2",
    bg="#696969",
    fg="#e6e6fa",
    font=("Time New Roman", 18),
    command=GT2,
)
btnCon2.place(x=180, y=168)

window.mainloop()
