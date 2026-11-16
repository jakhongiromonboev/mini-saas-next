import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { logOut } from '@/libs/auth';
import { getDashboardPath } from '@/libs/auth/navigation';
import WorkspaceIcon from '@/libs/components/common/WorkspaceIcon';
import { MemberType } from '@/libs/enums/member.enum';
import { useAuth } from '@/libs/hooks/useAuth';

interface DashboardLayoutProps {
  requiredRole: MemberType;
  children: ReactNode;
}

export default function DashboardLayout({
  requiredRole,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { member, isLoading, updateMember } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const requestPending = useRef(false);
  const dashboardPath = member
    ? getDashboardPath(member.memberType)
    : '/account/join';
  const canAccess = !isLoading && member?.memberType === requiredRole;

  useEffect(() => {
    if (isLoading || !router.isReady || canAccess) return;

    let active = true;
    void router.replace(dashboardPath).catch(() => {
      if (active)
        setError('We could not open your workspace. Please try again.');
    });

    return () => {
      active = false;
    };
  }, [canAccess, dashboardPath, isLoading, router]);

  const doLogout = async () => {
    if (requestPending.current) return;

    requestPending.current = true;
    setIsSigningOut(true);
    setError(null);

    try {
      await logOut();
      updateMember(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'We could not sign you out. Please try again.',
      );
    } finally {
      requestPending.current = false;
      setIsSigningOut(false);
    }
  };

  if (!canAccess || !member) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f5f6f3] px-6 text-[#243244]">
        <Head>
          <title>Mini SaaS</title>
        </Head>
        <main className="w-full max-w-sm rounded-[22px] border border-[#e7e9ed] bg-white p-9 text-center shadow-[0_12px_40px_rgb(25_42_62/5%)]">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-[#345edb] text-2xl font-bold tracking-[-1.5px] text-white">
            m.
          </span>
          {error ? (
            <>
              <p role="alert" className="mt-5 text-sm leading-6 text-red-700">
                {error}
              </p>
              <a
                href={dashboardPath}
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#345edb] px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#345edb]"
              >
                Continue
              </a>
            </>
          ) : (
            <div role="status" aria-live="polite" className="mt-6">
              <span
                className="mx-auto block size-6 rounded-full border-2 border-[#e7ecf5] border-t-[#345edb] motion-safe:animate-spin"
                aria-hidden="true"
              />
              <p className="mt-4 text-sm text-[#667383]">
                {isLoading
                  ? 'Checking your session…'
                  : 'Opening your workspace…'}
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  const initials =
    member.memberName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'M';

  return (
    <div className="min-h-dvh bg-[#eef1f5] text-[#243244] sm:px-5 sm:py-6 lg:px-8">
      <Head>
        <title>Mini SaaS</title>
        <meta
          name="description"
          content="Your projects, deadlines, and team in one workspace."
        />
      </Head>
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-[#243244] focus:shadow-lg"
      >
        Skip to workspace
      </a>
      <div className="mx-auto min-h-dvh max-w-[1440px] bg-[#f5f6f3] sm:min-h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-[22px] sm:border sm:border-[#e0e5eb] sm:shadow-[0_18px_65px_rgb(25_42_62/6%)]">
        <header className="bg-[#1b2b40] text-[#f5f7fb]">
          <div className="flex flex-wrap items-center gap-x-7 px-5 sm:px-8 lg:px-10">
            <Link
              href={dashboardPath}
              className="flex shrink-0 items-center gap-2.5 rounded-lg py-5 text-base font-semibold tracking-[-0.4px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a8bcff] sm:py-6"
            >
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#345edb] text-2xl font-bold tracking-[-1.5px] shadow-[0_4px_12px_rgb(0_0_0/15%)]"
              >
                m.
              </span>
              Mini SaaS
            </Link>
            <nav
              aria-label="Workspace navigation"
              className="order-3 w-full border-t border-white/10 sm:order-none sm:w-auto sm:self-stretch sm:border-0"
            >
              <Link
                href={dashboardPath}
                aria-current="page"
                className="flex h-full min-h-12 w-fit items-center border-b-[3px] border-[#92aaff] px-1 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#a8bcff]"
              >
                Projects
              </Link>
            </nav>
            <div className="ml-auto flex min-w-0 items-center gap-3 py-5 sm:gap-5">
              <div
                className="flex min-w-0 items-center gap-3"
                title={`${member.memberName} · ${member.memberType === MemberType.ADMIN ? 'Admin' : 'Member'}`}
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#30425a] text-xs font-medium tracking-wide"
                >
                  {initials}
                </span>
                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-40 truncate text-sm font-medium">
                    {member.memberName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#b8c5d7]">
                    {member.memberType === MemberType.ADMIN
                      ? 'Admin'
                      : 'Member'}
                  </p>
                </div>
                <span className="sr-only sm:hidden">
                  {member.memberName},{' '}
                  {member.memberType === MemberType.ADMIN ? 'Admin' : 'Member'}
                </span>
              </div>
              <div className="h-7 w-px bg-white/15" aria-hidden="true" />
              <button
                type="button"
                onClick={doLogout}
                disabled={isSigningOut}
                aria-label={isSigningOut ? 'Signing out' : 'Sign out'}
                className="flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-lg px-2.5 text-[#c7d2e1] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a8bcff] disabled:cursor-wait disabled:opacity-50"
              >
                <WorkspaceIcon name="logout" className="size-[18px]" />
                <span className="hidden text-xs font-medium lg:inline">
                  {isSigningOut ? 'Signing out…' : 'Sign out'}
                </span>
              </button>
            </div>
          </div>
        </header>
        <main
          id="workspace"
          tabIndex={-1}
          className="px-5 pt-8 pb-12 outline-none sm:px-8 sm:pt-10 lg:px-10"
        >
          {error && (
            <p
              role="alert"
              className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
            >
              {error}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
