import { API_URL } from '../config';

const STARTUP_TIMEOUT_MS = 90000;
const REQUEST_TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 2000;

export async function waitForApi(signal: AbortSignal): Promise<void> {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    signal.throwIfAborted();
    const controller = new AbortController();
    const cancelRequest = () => controller.abort();
    signal.addEventListener('abort', cancelRequest, { once: true });
    const timeout = setTimeout(
      cancelRequest,
      Math.min(REQUEST_TIMEOUT_MS, deadline - Date.now()),
    );

    try {
      const response = await fetch(`${API_URL.replace(/\/+$/, '')}/health`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (response.ok) {
        const result: unknown = await response.json();
        if (
          result !== null &&
          typeof result === 'object' &&
          'status' in result &&
          result.status === 'ok'
        ) {
          return;
        }
      }
    } catch {
      signal.throwIfAborted();
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener('abort', cancelRequest);
    }

    const remaining = deadline - Date.now();
    if (remaining > 0) {
      await waitBeforeRetry(Math.min(RETRY_DELAY_MS, remaining), signal);
    }
  }

  throw new Error('The workspace is taking longer than expected to connect.');
}

function waitBeforeRetry(delay: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();

    const timeout = setTimeout(() => {
      signal.removeEventListener('abort', cancelWait);
      resolve();
    }, delay);

    function cancelWait() {
      clearTimeout(timeout);
      reject(signal.reason);
    }

    signal.addEventListener('abort', cancelWait, { once: true });
  });
}
