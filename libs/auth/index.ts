import { API_URL } from '../config';
import type { Member } from '../types/member/member';
import type { LoginInput, SignupInput } from '../types/member/member.input';

interface AuthResponse {
  member?: Member;
  logout?: boolean;
  error?: { message?: string };
}

export class AuthError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

/** AUTH FUNCTIONS **/
export async function logIn(input: LoginInput): Promise<Member> {
  const result = await request('/member/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return readMember(result);
}

export async function signUp(input: SignupInput): Promise<Member> {
  const result = await request('/member/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return readMember(result);
}

export async function getMemberDetail(signal?: AbortSignal): Promise<Member> {
  const result = await request('/member/detail', { signal });
  return readMember(result);
}

export async function logOut(): Promise<void> {
  await request('/member/logout', { method: 'POST' });
}

/** RESPONSE HELPERS **/
function readMember(result: AuthResponse): Member {
  if (!result.member || typeof result.member._id !== 'string') {
    throw new AuthError(
      200,
      'The server returned an unexpected account response. Please try again.',
    );
  }
  return result.member;
}

async function request(
  path: string,
  options: RequestInit = {},
): Promise<AuthResponse> {
  const controller = new AbortController();
  const cancelRequest = () => controller.abort();
  let timedOut = false;

  // A session check can be cancelled when its component is removed.
  if (options.signal?.aborted) cancelRequest();
  options.signal?.addEventListener('abort', cancelRequest, { once: true });

  // Stop waiting if the API does not answer within 10 seconds.
  const timeout = setTimeout(() => {
    timedOut = true;
    cancelRequest();
  }, 10000);

  try {
    const response = await fetch(apiUrl + path, {
      ...options,
      headers: options.body
        ? { 'Content-Type': 'application/json' }
        : undefined,
      credentials: 'include', // The browser sends and receives the session cookie.
      cache: 'no-store',
      signal: controller.signal,
    });
    const result: AuthResponse | null = await response
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
      throw new AuthError(response.status, message);
    }

    if (!result || typeof result !== 'object') {
      throw new AuthError(
        response.status,
        'The server returned an unexpected response. Please try again.',
      );
    }
    return result;
  } catch (error) {
    if (options.signal?.aborted || error instanceof AuthError) throw error;
    if (timedOut) {
      throw new Error('The request took too long. Please try again.');
    }
    throw new Error('Unable to reach the server. Please try again.');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', cancelRequest);
  }
}
