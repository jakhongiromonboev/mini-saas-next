import { MemberType } from '@/libs/enums/member.enum';
import type { Member } from '@/libs/types/member/member';

interface AccountCardProps {
  member: Member;
  error: string | null;
  isPending: boolean;
  onSignOut: () => Promise<void>;
}

export default function AccountCard({
  member,
  error,
  isPending,
  onSignOut,
}: AccountCardProps) {
  return (
    <>
      <span className="inline-flex rounded-full bg-[#edf2ff] px-3 py-1 text-xs font-semibold text-[#345edb]">
        Signed in
      </span>
      <h1 className="mt-5 text-[28px] leading-tight font-semibold tracking-[-0.9px]">
        Your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[#647287]">
        You are signed in to Mini SaaS.
      </p>

      <dl className="mt-7 space-y-5">
        <div>
          <dt className="text-xs font-medium text-[#647287]">Full name</dt>
          <dd className="mt-1 text-sm font-medium wrap-anywhere">
            {member.memberName}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[#647287]">Email address</dt>
          <dd className="mt-1 text-sm wrap-anywhere">{member.memberEmail}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-[#647287]">Role</dt>
          <dd className="mt-1 text-sm">
            {member.memberType === MemberType.ADMIN ? 'Admin' : 'Member'}
          </dd>
        </div>
      </dl>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-[10px] border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-800 wrap-anywhere"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSignOut}
        disabled={isPending}
        className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#345edb] px-4 py-3 text-sm font-semibold text-white shadow-[0_5px_13px_rgba(52,94,219,0.23)] transition-colors hover:bg-[#294fc1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#345edb] disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? 'Signing out…' : 'Sign out'}
      </button>
    </>
  );
}
