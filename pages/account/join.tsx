import Head from 'next/head';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { logIn, logOut, signUp } from '@/libs/auth';
import { getDashboardPath } from '@/libs/auth/navigation';
import AccountCard from '@/libs/components/auth/AccountCard';
import AuthLayout from '@/libs/components/layout/AuthLayout';
import { useAuth } from '@/libs/hooks/useAuth';
import type { SignupInput } from '@/libs/types/member/member.input';

const inputClassName =
  'h-12 w-full min-w-0 rounded-[10px] border border-[#dfe5ee] bg-[#fafbfd] px-3.5 text-base text-[#192a3e] placeholder:text-[#7b8799] focus:border-[#345edb] focus:outline-none focus:ring-2 focus:ring-[#345edb]/20 disabled:opacity-60';

const primaryButtonClassName =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#345edb] px-4 py-3 text-sm font-semibold text-white shadow-[0_5px_13px_rgba(52,94,219,0.23)] transition-colors hover:bg-[#294fc1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#345edb] disabled:cursor-wait disabled:opacity-60';

const Join: NextPage = () => {
  const router = useRouter();
  const { member, isLoading, sessionError, updateMember } = useAuth();
  const [loginView, setLoginView] = useState(true);
  const [input, setInput] = useState<SignupInput>({
    memberName: '',
    memberEmail: '',
    memberPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionErrorDismissed, setSessionErrorDismissed] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const requestPending = useRef(false);

  const visibleError = error ?? (sessionErrorDismissed ? null : sessionError);
  const actionLabel = loginView ? 'Sign in' : 'Create account';
  const pendingLabel = loginView ? 'Signing in…' : 'Creating account…';
  const pageTitle = member ? 'Your account' : actionLabel;
  const dashboardPath = member ? getDashboardPath(member.memberType) : null;

  useEffect(() => {
    if (
      isLoading ||
      !router.isReady ||
      !dashboardPath ||
      dashboardPath === '/account/join'
    ) {
      return;
    }

    let active = true;

    void router.replace(dashboardPath).catch(() => {
      if (active) {
        setError('We could not open your workspace. Please try again.');
      }
    });

    return () => {
      active = false;
    };
  }, [dashboardPath, isLoading, router]);

  const handleInput = (field: keyof SignupInput, value: string) => {
    setInput((previous) => ({ ...previous, [field]: value }));
  };

  const viewChangeHandler = (nextLoginView: boolean) => {
    if (requestPending.current || nextLoginView === loginView) return;

    setLoginView(nextLoginView);
    setInput((previous) => ({ ...previous, memberPassword: '' }));
    setShowPassword(false);
    setError(null);
    setSessionErrorDismissed(true);
  };

  const doLogin = async () => {
    if (requestPending.current) return;

    requestPending.current = true;
    setIsPending(true);
    setError(null);
    setSessionErrorDismissed(true);

    try {
      const member = await logIn({
        memberEmail: input.memberEmail.trim(),
        memberPassword: input.memberPassword,
      });

      updateMember(member);
      setInput((previous) => ({ ...previous, memberPassword: '' }));
      setShowPassword(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not sign you in. Please try again.',
      );
    } finally {
      requestPending.current = false;
      setIsPending(false);
    }
  };

  const doSignUp = async () => {
    if (requestPending.current) return;

    setError(null);
    setSessionErrorDismissed(true);

    if (!input.memberName.trim()) {
      setError('Enter your full name.');
      nameInputRef.current?.focus();
      return;
    }

    requestPending.current = true;
    setIsPending(true);

    try {
      const member = await signUp({
        memberName: input.memberName.trim(),
        memberEmail: input.memberEmail.trim(),
        memberPassword: input.memberPassword,
      });

      updateMember(member);
      setInput((previous) => ({ ...previous, memberPassword: '' }));
      setShowPassword(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not create your account. Please try again.',
      );
    } finally {
      requestPending.current = false;
      setIsPending(false);
    }
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginView) await doLogin();
    else await doSignUp();
  };

  const doLogout = async () => {
    if (requestPending.current) return;

    requestPending.current = true;
    setIsPending(true);
    setError(null);
    setSessionErrorDismissed(true);

    try {
      await logOut();
      updateMember(null);
      setInput({ memberName: '', memberEmail: '', memberPassword: '' });
      setLoginView(true);
      setShowPassword(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not sign you out. Please try again.',
      );
    } finally {
      requestPending.current = false;
      setIsPending(false);
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle} | Mini SaaS</title>
        <meta
          name="description"
          content="Sign in or create your Mini SaaS account to keep your projects, deadlines, and team in one place."
        />
      </Head>

      <AuthLayout>
        {member ? (
          <AccountCard
            member={member}
            error={visibleError}
            isPending={isPending}
            onSignOut={doLogout}
          />
        ) : isLoading ? (
          <div className="py-14 text-center" role="status" aria-live="polite">
            <span
              aria-hidden="true"
              className="mx-auto block size-8 rounded-full border-2 border-[#dfe5ee] border-t-[#345edb] motion-safe:animate-spin"
            />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Checking your session
            </h1>
            <p className="mt-3 text-sm text-[#647287]">
              Getting your account ready.
            </p>
          </div>
        ) : (
          <>
            <div
              role="group"
              aria-label="Account action"
              className="mb-8 grid grid-cols-2 gap-1 rounded-xl bg-[#f0f3f8] p-1"
            >
              <button
                type="button"
                aria-pressed={loginView}
                disabled={isPending}
                onClick={() => viewChangeHandler(true)}
                className="min-h-11 rounded-lg px-2 py-2 text-sm font-medium text-[#647287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345edb] disabled:cursor-wait disabled:opacity-60 aria-pressed:bg-white aria-pressed:text-[#192a3e] aria-pressed:shadow-sm"
              >
                Sign in
              </button>
              <button
                type="button"
                aria-pressed={!loginView}
                disabled={isPending}
                onClick={() => viewChangeHandler(false)}
                className="min-h-11 rounded-lg px-2 py-2 text-sm font-medium text-[#647287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345edb] disabled:cursor-wait disabled:opacity-60 aria-pressed:bg-white aria-pressed:text-[#192a3e] aria-pressed:shadow-sm"
              >
                Create account
              </button>
            </div>

            <h1
              id="auth-title"
              className="text-[28px] leading-tight font-semibold tracking-[-0.9px]"
            >
              {loginView ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#647287]">
              {loginView
                ? 'Sign in to view your projects.'
                : 'Get started with your project workspace.'}
            </p>

            {visibleError && (
              <p
                id="auth-error"
                role="alert"
                className="mt-5 rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-800 wrap-anywhere"
              >
                {visibleError}
              </p>
            )}

            <form
              onSubmit={handleSubmit}
              aria-labelledby="auth-title"
              aria-describedby={visibleError ? 'auth-error' : undefined}
              aria-busy={isPending}
              className="mt-7"
            >
              <fieldset disabled={isPending} className="grid min-w-0 gap-5">
                {!loginView && (
                  <div className="grid gap-2">
                    <label
                      htmlFor="member-name"
                      className="text-sm font-medium"
                    >
                      Full name
                    </label>
                    <input
                      ref={nameInputRef}
                      id="member-name"
                      name="memberName"
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      required
                      value={input.memberName}
                      onChange={(event) =>
                        handleInput('memberName', event.target.value)
                      }
                      placeholder="Your full name"
                      className={inputClassName}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <label htmlFor="member-email" className="text-sm font-medium">
                    Email address
                  </label>
                  <input
                    id="member-email"
                    name="memberEmail"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    required
                    value={input.memberEmail}
                    onChange={(event) =>
                      handleInput('memberEmail', event.target.value)
                    }
                    placeholder="you@example.com"
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="member-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="member-password"
                      name="memberPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={
                        loginView ? 'current-password' : 'new-password'
                      }
                      required
                      value={input.memberPassword}
                      onChange={(event) =>
                        handleInput('memberPassword', event.target.value)
                      }
                      placeholder="Enter your password"
                      className={`${inputClassName} pr-18`}
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      aria-pressed={showPassword}
                      aria-controls="member-password"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute top-0.5 right-0.5 min-h-11 min-w-14 rounded-lg px-3 text-xs font-semibold text-[#345edb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345edb] disabled:opacity-60"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={`${primaryButtonClassName} mt-1`}
                >
                  {isPending ? pendingLabel : actionLabel}
                  {!isPending && <span aria-hidden="true">→</span>}
                </button>
              </fieldset>
            </form>
          </>
        )}
      </AuthLayout>
    </>
  );
};

export default Join;
