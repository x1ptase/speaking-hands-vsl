# Speaking Hands VSL

A Vietnamese Sign Language (VSL) recognition application that uses computer vision and deep learning to recognize predefined sign language gestures through a webcam and provide corresponding Vietnamese phrase and audio output.

## Overview

**Speaking Hands VSL** is a desktop application designed to bridge communication barriers by interpreting Vietnamese Sign Language gestures in real time. Using a standard webcam, the system extracts human skeletal landmarks without requiring specialized hardware or sensors. These landmark sequences are converted into geometric and motion features and evaluated by a deep learning classifier, delivering instant visual text feedback and Vietnamese audio playback.

## Features

- **Real-Time Webcam Recognition**: Captures live video and tracks skeletal body motion using OpenCV and MediaPipe.
- **Deep Learning Classification**: Employs a pre-trained DD-Net (Double-Feature Double-Motion Network) model to classify dynamic sign sequences.
- **Dual Visual and Audio Output**: Displays recognized Vietnamese phrases on-screen and plays synchronized audio pronunciation files.
- **Desktop Graphical Interface**: Provides an interactive Tkinter-based desktop interface to launch inference and monitor status.
- **Lightweight Skeleton Processing**: Operates on normalized 2D landmark coordinates, reducing computational overhead compared to direct video processing.

## Technology Stack

- **Language**: Python 3.12
- **Deep Learning**: TensorFlow, Keras
- **Computer Vision**: MediaPipe, OpenCV
- **Scientific Computing**: NumPy, SciPy
- **User Interface**: Tkinter
- **Audio Output**: SoundFile, SoundCard

## How It Works

The recognition pipeline processes motion from live video input to translated speech:

```text
Webcam
   ↓
MediaPipe Pose
   ↓
Pose Landmarks
   ↓
Feature Processing
   ↓
DD-Net
   ↓
Gesture Classification
   ↓
Vietnamese Phrase / Audio Output
```

1. **Webcam Capture**: Captures video frames in real time through OpenCV.
2. **Landmark Extraction**: MediaPipe Pose identifies and tracks 33 skeletal body landmarks.
3. **Feature Processing**: Landmark trajectories are sampled, interpolated, and transformed into Joint Cartesian Distance (JCD) matrices and normalized coordinate vectors.
4. **Sequence Classification**: The DD-Net model analyzes temporal and spatial motion patterns to predict the most likely gesture.
5. **Output Delivery**: The translated Vietnamese phrase appears in the application window and the corresponding audio clip is played through the system speakers.

## Project Structure

```text
speaking-hands-vsl/
├── main.py
├── build_ddnet.py
├── trainModels.h5
├── requirements.txt
├── media/
├── .gitignore
└── README.md
```

- `main.py`: Main application entry point containing the Tkinter interface, webcam capture pipeline, landmark extraction, and real-time prediction with audio feedback.
- `build_ddnet.py`: Defines the DD-Net model architecture, network hyperparameters, and feature extraction helpers.
- `trainModels.h5`: Pre-trained weights for the DD-Net gesture classification model.
- `requirements.txt`: Python package dependencies.
- `media/`: Pre-recorded Vietnamese voice audio files corresponding to recognized gestures.
- `.gitignore`: Git configuration specifying files and directories ignored by version control.
- `README.md`: Project documentation and architectural overview.

## Model

The application utilizes a pre-trained **DD-Net (Double-Feature Double-Motion Network)** architecture optimized for skeleton-based gesture and action recognition.

High-level model configuration:
- **Frame Length**: 30 frames
- **Tracked Joints**: 33 pose landmarks
- **Joint Dimensions**: 2 (x, y coordinates)
- **JCD Feature Dimension**: 528 pairwise joint distance features
- **Output Classes**: 10 predefined gesture categories

> **Note**: The current model is trained on a closed set of predefined gesture classes and is intended for specific phrase recognition rather than general or continuous open-vocabulary Vietnamese Sign Language.

## Project Status

Speaking Hands VSL is currently a functional proof-of-concept prototype demonstrating real-time gesture capture, skeleton-based sequence inference, and multimodal (text and audio) feedback.

## Future Improvements

- **Hand Landmark Integration**: Incorporate MediaPipe Hands tracking for detailed finger articulation and fingerspelling support.
- **Dataset Expansion**: Collect and train on a broader vocabulary of Vietnamese Sign Language signs.
- **Continuous Sentence Recognition**: Transition from isolated gesture detection to continuous sentence parsing with language modeling.
- **Modernized Interface**: Upgrade the user interface and explore cross-platform desktop or web packaging.
- **Enhanced Robustness**: Improve filtering techniques to handle background clutter, distance variations, and diverse lighting conditions.