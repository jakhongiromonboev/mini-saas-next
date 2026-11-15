import {
  createContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AuthError, getMemberDetail } from './index';
import type { Member } from '../types/member/member';

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
  const sessionCheck = useRef<AbortController | null>(null);

  // The browser sends the HttpOnly cookie; the API tells us who is signed in.
  useEffect(() => {
    const controller = new AbortController();
    sessionCheck.current = controller;

    async function restoreSession() {
      try {
        const currentMember = await getMemberDetail(controller.signal);

        if (!controller.signal.aborted) {
          setMember(currentMember);
          setSessionError(null);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

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
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();
    return () => controller.abort();
  }, []);

  function updateMember(nextMember: Member | null) {
    // An older session check must not overwrite a fresh login or logout.
    sessionCheck.current?.abort();
    setMember(nextMember);
    setSessionError(null);
    setIsLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{ member, isLoading, sessionError, updateMember }}
    >
      {children}
    </AuthContext.Provider>
  );
}
