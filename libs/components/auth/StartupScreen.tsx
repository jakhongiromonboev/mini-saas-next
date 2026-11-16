import Head from 'next/head';
import AuthLayout from '../layout/AuthLayout';

interface StartupScreenProps {
  hasError: boolean;
  onRetry: () => void;
}

export default function StartupScreen({
  hasError,
  onRetry,
}: StartupScreenProps) {
  return (
    <>
      <Head>
        <title>Mini SaaS</title>
      </Head>
      <AuthLayout>
        <div className="py-2 text-center">
          {hasError ? (
            <div
              aria-hidden="true"
              className="mx-auto mb-8 flex size-20 items-center justify-center rounded-[24px] bg-[#f0f4ff] text-[#345edb]"
            >
              <RetryIcon className="size-8" />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="relative mx-auto mb-6 flex size-[104px] items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full border border-[#e9eefb]" />
              <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#345edb] border-r-[#97aff4] motion-safe:animate-spin motion-safe:[animation-duration:2.5s]" />
              <span className="flex size-16 items-center justify-center rounded-[19px] bg-[#345edb] pr-[3px] text-[40px] font-bold tracking-[-3px] text-white shadow-[0_9px_22px_rgb(52_94_219/19%)] motion-safe:animate-pulse motion-safe:[animation-duration:2.8s]">
                m.
              </span>
            </div>
          )}

          <div aria-live="polite" aria-atomic="true">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] text-[#697d9a] uppercase">
              {hasError ? 'Let’s try that again' : 'A moment, then you’re in'}
            </p>
            <h1 className="text-[25px] leading-[1.18] font-semibold tracking-[-0.85px] text-[#192a3e] sm:text-[27px]">
              {hasError ? (
                <>
                  Your workspace is
                  <br />
                  taking a little longer
                </>
              ) : (
                <>
                  Getting your
                  <br />
                  workspace ready
                </>
              )}
            </h1>
            <p className="mt-4 mb-6 text-[13px] leading-[1.7] text-[#647287]">
              {hasError
                ? 'We couldn’t connect just yet. Please try connecting again.'
                : 'We’re getting things ready for you. Your workspace will open shortly.'}
            </p>
          </div>

          {hasError ? (
            <button
              type="button"
              onClick={onRetry}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#345edb] px-4 text-[13px] font-semibold text-white shadow-[0_5px_13px_rgb(52_94_219/23%)] hover:bg-[#294fc1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#345edb]"
            >
              <RetryIcon className="size-4" />
              Try again
            </button>
          ) : (
            <p
              role="status"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#f1f5ff] px-3 py-2.5 text-[11px] leading-relaxed text-[#36548f]"
            >
              <span
                aria-hidden="true"
                className="size-[5px] shrink-0 rounded-full bg-[#345edb]"
              />
              Connecting to your workspace
            </p>
          )}

          <p className="mt-3.5 text-[11px] leading-relaxed text-[#768396]">
            {hasError
              ? 'Your workspace is waiting for you.'
              : 'The first visit may take about a minute.'}
          </p>
        </div>
      </AuthLayout>
    </>
  );
}

function RetryIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7v5h-5 M20 12a8 8 0 1 0-2.34 5.66 M20 12a8 8 0 0 0-2.34-5.66" />
    </svg>
  );
}
