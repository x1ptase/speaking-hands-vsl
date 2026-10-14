/** Draws the current video frame onto `canvas` and returns its pixels, or null when no frame is available. */
export function captureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement): ImageData | null {
  const { videoWidth: width, videoHeight: height } = video;
  // readyState < HAVE_CURRENT_DATA or zero dimensions means there is no decodable frame yet.
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || width === 0 || height === 0) return null;

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(video, 0, 0, width, height);
  return context.getImageData(0, 0, width, height);
}
