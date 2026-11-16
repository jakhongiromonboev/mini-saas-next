import { API_URL } from '../config';
import type { MemberListItem } from '../types/member/member';

interface MemberListResponse {
  members?: MemberListItem[];
  error?: { message?: string };
}

export class MemberError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MemberError';
  }
}

const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

export async function getMembers(
  signal?: AbortSignal,
): Promise<MemberListItem[]> {
  const controller = new AbortController();
  const cancelRequest = () => controller.abort();
  let timedOut = false;

  if (signal?.aborted) cancelRequest();
  signal?.addEventListener('abort', cancelRequest, { once: true });

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(`${apiUrl}/member/all`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    });
    const result: MemberListResponse | null = await response
      .json()
      .catch((error: unknown) => {
        if (controller.signal.aborted) throw error;
        return null;
      });

    if (!response.ok) {
      const message =
        typeof result?.error?.message === 'string'
          ? result.error.message
          : 'The request could not be completed. Please try again.';
      throw new MemberError(response.status, message);
    }

    if (
      !result ||
      typeof result !== 'object' ||
      Array.isArray(result) ||
      !Array.isArray(result.members) ||
      !result.members.every(isMemberListItem)
    ) {
      throw new MemberError(
        response.status,
        'The server returned an unexpected member response. Please try again.',
      );
    }
    return result.members;
  } catch (error) {
    if (signal?.aborted || error instanceof MemberError) throw error;
    if (timedOut) {
      throw new Error('The request took too long. Please try again.');
    }
    throw new Error('Unable to reach the server. Please try again.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancelRequest);
  }
}

function isMemberListItem(
  member: MemberListItem | null | undefined,
): member is MemberListItem {
  return Boolean(
    member &&
    typeof member._id === 'string' &&
    typeof member.memberName === 'string' &&
    typeof member.memberEmail === 'string',
  );
}
