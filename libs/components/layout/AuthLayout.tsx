import type { ReactNode } from 'react';
import AuthIllustration from '@/libs/components/auth/AuthIllustration';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#eef2f8] p-3 text-[#192a3e] sm:p-6 lg:p-10">
      <div className="grid w-full max-w-[1120px] grid-cols-1 overflow-hidden rounded-[24px] shadow-[0_20px_60px_rgba(8,22,43,0.12)] md:min-h-[710px] md:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <aside
          className="relative flex min-w-0 flex-col overflow-hidden bg-[#192a3e] p-6 text-[#f4f7fc] md:p-8 lg:p-10"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 55% 42%, #345c88 0%, #203a57 31%, #192a3e 69%)',
          }}
        >
          <div className="flex items-center gap-3 text-lg font-semibold tracking-[-0.5px]">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-xl bg-[#345edb] text-2xl font-bold tracking-[-1.5px] shadow-[0_5px_15px_rgba(5,20,50,0.18)]"
            >
              m.
            </span>
            <span>Mini SaaS</span>
          </div>

          <div className="relative -mx-5 mt-2 hidden min-h-[330px] flex-1 md:block">
            <AuthIllustration />
          </div>

          <div className="relative hidden pt-3 md:block">
            <h2 className="max-w-[290px] text-[34px] leading-[1.16] font-semibold tracking-[-1.2px]">
              Your project
              <br />
              workspace.
            </h2>
            <p className="mt-4 max-w-[285px] text-sm leading-relaxed text-[#c3d0e1]">
              A shared view of your projects, deadlines, and team.
            </p>
          </div>
        </aside>

        <main
          className="flex min-w-0 items-center justify-center bg-[#f0f3f8] px-4 py-7 sm:p-8 lg:p-10"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 20% 6%, #e8edf9, transparent 65%)',
          }}
        >
          <section className="w-full max-w-[420px] rounded-[20px] border border-white bg-white p-6 shadow-[0_24px_54px_rgba(16,35,70,0.11),0_3px_10px_rgba(16,35,70,0.04)] sm:p-8">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
