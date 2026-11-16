import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AuthError, getMemberDetail } from './index';
import type { Member } from '../types/member/member';
import { waitForApi } from '../services/health.service';
import StartupScreen from '../components/auth/StartupScreen';

type StartupStatus = 'checking' | 'slow' | 'unavailable' | 'ready';

interface AuthContextValue {
  member: Member | null;
  isLoading: boolean;
  sessionError: string | null;
  updateMember: (member: Member | null) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [startupStatus, setStartupStatus] = useState<StartupStatus>('checking');
  const [attempt, setAttempt] = useState(0);
  const sessionCheck = useRef<AbortController | null>(null);

  // The browser sends the HttpOnly cookie; the API tells us who is signed in.
  useEffect(() => {
    const controller = new AbortController();
    sessionCheck.current = controller;
    // Fast visits keep the usual session check without flashing a full screen.
    const slowStartup = setTimeout(() => {
      if (!controller.signal.aborted) setStartupStatus('slow');
    }, 1000);
    let apiReady = false;

    async function restoreSession() {
      try {
        await waitForApi(controller.signal);
        apiReady = true;
        const currentMember = await getMemberDetail(controller.signal);

        if (!controller.signal.aborted) {
          setMember(currentMember);
          setSessionError(null);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        if (!apiReady) {
          setStartupStatus('unavailable');
          return;
        }

        // A visitor without a session is expected to receive 401.
        if (error instanceof AuthError && error.status === 401) {
          setMember(null);
          setSessionError(null);
          return;
        }

        setSessionError(
          error instanceof Error
            ? error.message
            : 'Unable to check your session. Please try again.',
        );
      } finally {
        clearTimeout(slowStartup);
        if (!controller.signal.aborted && apiReady) {
          setStartupStatus('ready');
          setIsLoading(false);
        }
      }
    }

    void restoreSession();
    return () => {
      clearTimeout(slowStartup);
      controller.abort();
    };
  }, [attempt]);

  function retryStartup() {
    setStartupStatus('slow');
    setSessionError(null);
    setIsLoading(true);
    setAttempt((previous) => previous + 1);
  }

  function updateMember(nextMember: Member | null) {
    // An older session check must not overwrite a fresh login or logout.
    sessionCheck.current?.abort();
    setMember(nextMember);
    setSessionError(null);
    setIsLoading(false);
    setStartupStatus('ready');
  }

  return (
    <AuthContext.Provider
      value={{ member, isLoading, sessionError, updateMember }}
    >
      {startupStatus === 'slow' || startupStatus === 'unavailable' ? (
        <StartupScreen
          hasError={startupStatus === 'unavailable'}
          onRetry={retryStartup}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
