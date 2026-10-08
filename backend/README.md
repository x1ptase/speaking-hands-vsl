# Speaking Hands Backend

This directory contains the backend structure for the Speaking Hands project.

## Purpose
To serve as the AI and Machine Learning core of the application, responsible for interpreting sign language sequences from video feeds.

## Main Technologies
- **Python 3.12**
- **TensorFlow & Keras** (Deep Learning Classification)
- **MediaPipe** (Skeletal Landmark Tracking)
- **OpenCV** (Video Ingestion)

## Current Status
Currently running the legacy prototype codebase using a Tkinter UI (`app/main.py`). The logic is mapped for a future migration to a FastAPI REST/WebSocket architecture.

## Folder Structure
- `app/`: Core application logic (legacy main entry point).
  - `model/`: Neural network architecture (`ddnet.py`) and pre-trained weights (`trainModels.h5`).
  - `services/`: Placeholders for future AI logic decoupling (recognition, pose, audio).
- `media/`: Audio files for translated speech feedback.
