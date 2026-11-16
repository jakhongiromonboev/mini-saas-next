import WorkspaceIcon, {
  type WorkspaceIconName,
} from '@/libs/components/common/WorkspaceIcon';
import { MemberType } from '@/libs/enums/member.enum';

interface ProjectWorkspaceProps {
  memberType: MemberType;
}

interface SummaryCard {
  label: string;
  description: string;
  icon: WorkspaceIconName;
}

export default function ProjectWorkspace({
  memberType,
}: ProjectWorkspaceProps) {
  const isAdmin = memberType === MemberType.ADMIN;
  const summaryCards: SummaryCard[] = [
    {
      label: isAdmin ? 'Total projects' : 'Assigned projects',
      description: isAdmin ? 'Across all team members' : 'Across all statuses',
      icon: 'folder',
    },
    {
      label: 'Active now',
      description: 'Currently in progress',
      icon: 'activity',
    },
    isAdmin
      ? {
          label: 'Total budget',
          description: 'Allocated across all projects',
          icon: 'wallet',
        }
      : {
          label: 'Next deadline',
          description: 'Your next project milestone',
          icon: 'calendar',
        },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.19em] text-[#6a7480] uppercase">
            {isAdmin ? 'Team workspace' : 'Your workspace'}
          </p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-[-1.2px] sm:text-[36px]">
            {isAdmin ? 'Projects' : 'My projects'}
          </h1>
          <p className="mt-2.5 max-w-xl text-sm leading-6 text-[#687582]">
            {isAdmin
              ? "A clear view of your team's work, from start to finish."
              : 'Everything assigned to you, with the details that matter.'}
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#345edb] px-4 text-sm font-medium text-white shadow-[0_4px_12px_rgb(52_94_219/12%)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <WorkspaceIcon name="plus" className="size-[18px]" />
            Add project
          </button>
        ) : (
          <p className="flex items-center gap-2 pb-1 text-xs text-[#687582]">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[#345edb]"
            />
            Personal view
          </p>
        )}
      </div>

      <section
        aria-label="Project summary"
        className="mt-7 grid gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-5"
      >
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[22px] border border-white bg-white px-6 py-6 shadow-[0_10px_32px_rgb(25_42_62/5%)] lg:px-7"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[13px] font-normal text-[#65717e]">
                {card.label}
              </h2>
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#f8f9fa] text-[#74808b]">
                <WorkspaceIcon name={card.icon} className="size-[18px]" />
              </span>
            </div>
            <p
              className="mt-3 text-[30px] leading-tight font-semibold tracking-[-0.8px] text-[#263342]"
              aria-label={`${card.label}: not available`}
            >
              —
            </p>
            <p className="mt-2.5 text-xs leading-5 text-[#76818d]">
              {card.description}
            </p>
          </div>
        ))}
      </section>

      <section
        aria-label={isAdmin ? 'Team projects' : 'Assigned projects'}
        className="mt-7 overflow-hidden rounded-[18px] border border-[#e3e7eb] bg-white shadow-[0_8px_28px_rgb(25_42_62/3%)]"
      >
        <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[365px]">
            <WorkspaceIcon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-[#86909b]"
            />
            <input
              type="search"
              aria-label={isAdmin ? 'Search projects' : 'Search your projects'}
              placeholder={
                isAdmin ? 'Search projects…' : 'Search your projects…'
              }
              disabled
              className="h-11 w-full rounded-lg border border-[#e3e7eb] bg-[#fdfdfd] pr-3 pl-10 text-sm text-[#647281] placeholder:text-[#86909b] disabled:cursor-not-allowed"
            />
          </div>
          <div className="relative">
            <select
              aria-label="Filter by project status"
              disabled
              className="h-11 w-full appearance-none rounded-lg border border-[#e3e7eb] bg-[#fdfdfd] pr-10 pl-4 text-xs text-[#647281] disabled:cursor-not-allowed sm:w-[145px]"
            >
              <option>All statuses</option>
            </select>
            <WorkspaceIcon
              name="chevron"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#86909b]"
            />
          </div>
        </div>
        <div
          role="region"
          aria-label="Project table"
          tabIndex={0}
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#345edb]"
        >
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">
              {isAdmin
                ? 'Team project details'
                : 'Your assigned project details'}
            </caption>
            <thead className="border-y border-[#e7eaee] bg-[#f8f9fb] text-[11px] font-medium tracking-[0.015em] text-[#687583]">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-medium">
                  Project name
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3.5 font-medium">
                  Deadline
                </th>
                {isAdmin && (
                  <th scope="col" className="px-4 py-3.5 font-medium">
                    Assigned member
                  </th>
                )}
                <th scope="col" className="px-5 py-3.5 text-right font-medium">
                  Budget (USD)
                </th>
                {isAdmin && (
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr aria-hidden="true">
                <td colSpan={isAdmin ? 6 : 4} className="h-4" />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex min-h-[250px] flex-col items-center justify-center px-6 pt-3 pb-10 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-[#e4eaf6] bg-[#f0f4fd] text-[#5271be]">
            <WorkspaceIcon name="folder" className="size-6" />
          </span>
          <h2 className="mt-5 text-base font-semibold tracking-[-0.3px]">
            Your projects, in one place
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#7a8592]">
            Project details will appear here.
          </p>
        </div>
      </section>
    </>
  );
}
