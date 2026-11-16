import { ProjectStatus } from '@/libs/enums/project.enum';
import type { MemberListItem } from '@/libs/types/member/member';
import type { Project } from '@/libs/types/project/project';
import {
  formatBudget,
  formatDeadline,
  projectStatusLabels,
} from '@/libs/utils/project';

interface ProjectTableProps {
  projects: Project[];
  members: MemberListItem[];
  isAdmin: boolean;
  membersLoading: boolean;
}

const statusClasses: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'bg-[#edf2ff] text-[#3d5cb3]',
  [ProjectStatus.ON_HOLD]: 'bg-[#fbf3df] text-[#876219]',
  [ProjectStatus.COMPLETED]: 'bg-[#eaf5ee] text-[#38745a]',
};

export default function ProjectTable({
  projects,
  members,
  isAdmin,
  membersLoading,
}: ProjectTableProps) {
  const memberNames = new Map(
    members.map((member) => [member._id, member.memberName]),
  );

  return (
    <div
      role="region"
      aria-label="Project table"
      tabIndex={0}
      className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#345edb]"
    >
      <table
        className={`w-full border-collapse text-left text-sm ${isAdmin ? 'min-w-[900px]' : 'min-w-[640px]'}`}
      >
        <caption className="sr-only">
          {isAdmin ? 'Team project details' : 'Your assigned project details'}
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
        <tbody className="divide-y divide-[#e7eaee]">
          {projects.map((project) => {
            const initials = project.projectName
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .toUpperCase();

            return (
              <tr
                key={project._id}
                className="transition-colors hover:bg-[#fafbfe]"
              >
                <th scope="row" className="px-5 py-4 font-medium">
                  <div className="flex min-w-[210px] items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[#e4e8ed] bg-[#f9fafb] text-[11px] font-semibold text-[#435264]"
                    >
                      {initials || 'P'}
                    </span>
                    <span className="max-w-xs wrap-anywhere">
                      {project.projectName}
                    </span>
                  </div>
                </th>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs whitespace-nowrap ${statusClasses[project.projectStatus]}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-1 rounded-full bg-current"
                    />
                    {projectStatusLabels[project.projectStatus]}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-[#536171]">
                  {formatDeadline(project.projectDeadline)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-4 text-[#6b7785]">
                    <span className="block max-w-40 wrap-anywhere">
                      {memberNames.get(project.memberId) ||
                        (membersLoading ? 'Loading…' : 'Member unavailable')}
                    </span>
                  </td>
                )}
                <td className="px-5 py-4 text-right font-medium whitespace-nowrap tabular-nums">
                  {formatBudget(project.projectBudget)}
                </td>
                {isAdmin && (
                  <td className="px-5 py-4">
                    <div className="flex gap-4 text-xs">
                      <button
                        type="button"
                        disabled
                        aria-label={`Edit ${project.projectName}`}
                        className="min-h-9 text-[#345edb] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled
                        aria-label={`Delete ${project.projectName}`}
                        className="min-h-9 text-[#9b3749] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
