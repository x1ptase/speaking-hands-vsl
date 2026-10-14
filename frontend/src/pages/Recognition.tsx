import React, { useCallback, useRef, useState } from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import type { PoseOverlayHandle } from '../components/recognition/PoseOverlay';
import { CameraPreview } from '../components/recognition/CameraPreview';
import { SequenceUpload } from '../components/recognition/SequenceUpload';
import { RecognitionPanel, type PanelStage } from '../components/recognition/RecognitionPanel';
import { StatusBar } from '../components/recognition/StatusBar';
import { RecognitionHistory } from '../components/recognition/RecognitionHistory';
import { useRecognition, type RecognitionStatus } from '../hooks/useRecognition';
import { useCamera } from '../hooks/useCamera';
import { useLiveRecognition, type LivePhase } from '../hooks/useLiveRecognition';
import type { Frame } from '../services/recognitionService';
import { SEQUENCE_LENGTH } from '../utils/poseLandmarks';

const MANUAL_STAGE: Record<RecognitionStatus, { stage: PanelStage; text: string }> = {
  idle: { stage: 'idle', text: 'Waiting for camera or file' },
  selected: { stage: 'selected', text: 'Ready to submit' },
  loading: { stage: 'loading', text: 'Processing' },
  success: { stage: 'done', text: 'Done' },
  error: { stage: 'error', text: 'Error' },
};

const LIVE_STAGE: Record<LivePhase, PanelStage> = {
  off: 'idle',
  loading: 'loading',
  detecting: 'detecting',
  collecting: 'collecting',
  ready: 'ready',
  recognizing: 'recognizing',
  error: 'error',
};

export const Recognition: React.FC = () => {
  const { file, status, result, error, latencyMs, history, selectFile, submit, reset } = useRecognition();
  const camera = useCamera();
  const overlayRef = useRef<PoseOverlayHandle>(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const drawLandmarks = useCallback((frame: Frame | null) => overlayRef.current?.draw(frame), []);
  const live = useLiveRecognition(camera.videoRef, camera.status === 'running', drawLandmarks);
  const cameraActive = camera.status === 'running';

  const liveStatus = {
    off: 'Waiting for camera',
    loading: 'Loading pose model...',
    detecting: 'Detecting pose...',
    collecting: `Collecting frames: ${live.frameCount}/${SEQUENCE_LENGTH}`,
    ready: 'Ready to recognize',
    recognizing: 'Recognizing...',
    error: 'Error',
  }[live.phase];
  const liveDot = ({
    off: 'bg-gray-300',
    loading: 'bg-yellow-400',
    detecting: 'bg-yellow-400',
    collecting: 'bg-yellow-400',
    ready: 'bg-success',
    recognizing: 'bg-yellow-400',
    error: 'bg-red-500',
  } satisfies Record<LivePhase, string>)[live.phase];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle 
        title="Vietnamese Sign Language Recognition" 
        subtitle="AI-powered sign language recognition" 
      />

      {/* DOM order = mobile order: camera, then the result right below it, then manual upload. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="lg:col-span-2">
          <CameraPreview
            camera={camera}
            liveStatus={liveStatus}
            liveDot={liveDot}
            overlayRef={overlayRef}
            showLandmarks={showLandmarks}
            onShowLandmarksChange={setShowLandmarks}
          />
        </div>
        <div className="lg:col-span-1 lg:row-span-2">
          {cameraActive ? (
            <RecognitionPanel
              stage={LIVE_STAGE[live.phase]}
              statusText={liveStatus}
              progress={{ current: live.frameCount, total: SEQUENCE_LENGTH }}
              result={live.result}
              error={live.error}
              emptyHint="Đứng trước camera và thực hiện ký hiệu để nhận diện."
              onClear={live.clearResult}
            />
          ) : (
            <RecognitionPanel
              stage={MANUAL_STAGE[status].stage}
              statusText={MANUAL_STAGE[status].text}
              result={result}
              error={status === 'error' ? error : null}
              emptyHint="Chưa có kết quả. Bật camera hoặc chọn file JSON và bấm “Nhận diện”."
              onClear={reset}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          <SequenceUpload
            file={file}
            status={status}
            error={error}
            onSelectFile={selectFile}
            onSubmit={submit}
          />
        </div>
      </div>

      <div className="mb-8">
        <StatusBar
          cameraStatus={camera.status}
          status={status}
          liveStatus={cameraActive ? liveStatus : null}
          liveDot={liveDot}
          frameCount={cameraActive ? live.frameCount : (file?.sequence.length ?? null)}
          latencyMs={cameraActive ? live.latencyMs : latencyMs}
        />
      </div>

      <div className="grid grid-cols-1">
        <RecognitionHistory history={history} />
      </div>
    </div>
  );
};
