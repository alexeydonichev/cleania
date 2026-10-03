export type SubmissionAttempt = { signature: string; requestId: string } | null;

/** Retry the same payload with the same key; never persist customer data in browser storage. */
export function submissionPayload(ref: { current: SubmissionAttempt }, payload: Record<string, unknown>) {
  const signature = JSON.stringify(payload);
  if (!ref.current || ref.current.signature !== signature) {
    ref.current = { signature, requestId: crypto.randomUUID() };
  }
  return { ...payload, requestId: ref.current.requestId };
}
