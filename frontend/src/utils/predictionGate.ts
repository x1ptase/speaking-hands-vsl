import type { RecognitionResponse } from '../services/recognitionService';

/** Predictions below this softmax confidence (0-1) are treated as uncertain. */
export const MIN_CONFIDENCE = 0.85;
/** A new label must be predicted this many times in a row (confident and non-empty) before it is shown. */
export const CONFIRM_COUNT = 2;

export type PredictionNote = 'uncertain' | 'unsupported' | null;

export interface GateOutput {
  /** The response to display as the confirmed result, or null to keep the previous one. */
  confirmed: RecognitionResponse | null;
  note: PredictionNote;
  /** Consecutive confident predictions of the label that is waiting to be confirmed. */
  pendingCount: number;
}

/**
 * Stabilises raw backend predictions: low-confidence and empty-label predictions never replace the confirmed
 * label, and a different label must repeat CONFIRM_COUNT times in a row first. Labels are compared as returned by
 * the backend; nothing is mapped or invented here.
 */
export class PredictionGate {
  private confirmedLabel: string | null = null;
  private pendingLabel: string | null = null;
  private pendingCount = 0;

  update(response: RecognitionResponse): GateOutput {
    const label = response.label?.trim() ?? '';

    if (!(response.confidence >= MIN_CONFIDENCE)) {
      this.resetPending();
      return { confirmed: null, note: 'uncertain', pendingCount: 0 };
    }
    if (!label) {
      this.resetPending();
      return { confirmed: null, note: 'unsupported', pendingCount: 0 };
    }
    // Already-confirmed label: refresh confidence immediately, the streak requirement is for new labels.
    if (label === this.confirmedLabel) {
      this.resetPending();
      return { confirmed: response, note: null, pendingCount: 0 };
    }

    if (label === this.pendingLabel) {
      this.pendingCount += 1;
    } else {
      this.pendingLabel = label;
      this.pendingCount = 1;
    }
    if (this.pendingCount >= CONFIRM_COUNT) {
      this.confirmedLabel = label;
      this.resetPending();
      return { confirmed: response, note: null, pendingCount: 0 };
    }
    return { confirmed: null, note: null, pendingCount: this.pendingCount };
  }

  /** Forget the confirmed label and any pending streak (camera stop/restart, cleared result). */
  reset(): void {
    this.confirmedLabel = null;
    this.resetPending();
  }

  private resetPending(): void {
    this.pendingLabel = null;
    this.pendingCount = 0;
  }
}
