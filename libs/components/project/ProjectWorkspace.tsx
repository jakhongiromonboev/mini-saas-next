import { useState } from 'react';
import WorkspaceIcon, {
  type WorkspaceIconName,
} from '@/libs/components/common/WorkspaceIcon';
import { MemberType } from '@/libs/enums/member.enum';
import { ProjectStatus } from '@/libs/enums/project.enum';
import { useProjectWorkspace } from '@/libs/hooks/useProjectWorkspace';
import type { Project } from '@/libs/types/project/project';
import {
  formatBudget,
  formatDeadline,
  getProjectSummary,
  isDeadlineOverdue,
  projectStatusLabels,
} from '@/libs/utils/project';
import ProjectTable from './ProjectTable';
import ProjectModal from './ProjectModal';
import DeleteProjectModal from './DeleteProjectModal';

interface ProjectWorkspaceProps {
  memberType: MemberType;
}

interface SummaryCard {
  label: string;
  value: string;
  description: string;
  icon: WorkspaceIconName;
}

export default function ProjectWorkspace({
  memberType,
}: ProjectWorkspaceProps) {
  const isAdmin = memberType === MemberType.ADMIN;
  const {
    projects,
    members,
    error,
    memberError,
    isLoading,
    membersLoading,
    retry,
    addProject,
    replaceProject,
    removeProject,
  } = useProjectWorkspace();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const summary = projects ? getProjectSummary(projects) : null;
  const nextProject = summary?.nextProject;
  const query = search.trim().toLowerCase();
  const memberNames = new Map(
    members.map((member) => [member._id, member.memberName.toLowerCase()]),
  );
  const visibleProjects = (projects ?? []).filter((project) => {
    const memberName = memberNames.get(project.memberId) ?? '';
    const matchesSearch =
      project.projectName.toLowerCase().includes(query) ||
      (isAdmin && memberName.includes(query));

    return (!status || project.projectStatus === status) && matchesSearch;
  });
  const hasFilters = Boolean(query || status);
  const canManageProjects =
    isAdmin &&
    !isLoading &&
    !error &&
    !membersLoading &&
    !memberError &&
    members.length > 0;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const openEditProject = (project: Project) => {
    setSuccessMessage(null);
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleProjectSaved = (project: Project) => {
    if (editingProject) {
      replaceProject(project);
      setSuccessMessage('Project updated successfully.');
    } else {
      addProject(project);
      setSuccessMessage('Project created successfully.');
    }
    clearFilters();
    closeProjectModal();
  };

  const openDeleteProject = (project: Project) => {
    setSuccessMessage(null);
    setDeletingProject(project);
  };

  const handleProjectDeleted = (projectId: string) => {
    removeProject(projectId);
    setDeletingProject(null);
    setSuccessMessage('Project deleted successfully.');
  };

  const checkProjects = () => {
    closeProjectModal();
    setDeletingProject(null);
    clearFilters();
    retry();
  };

  const summaryCards: SummaryCard[] = [
    {
      label: isAdmin ? 'Total projects' : 'Assigned projects',
      value: summary ? summary.total.toLocaleString('en-US') : '—',
      description: isAdmin ? 'Across all team members' : 'Across all statuses',
      icon: 'folder',
    },
    {
      label: 'Active now',
      value: summary ? summary.active.toLocaleString('en-US') : '—',
      description: 'Currently in progress',
      icon: 'activity',
    },
    isAdmin
      ? {
          label: 'Total budget',
          value: summary ? formatBudget(summary.budget) : '—',
          description: 'Allocated across all projects',
          icon: 'wallet',
        }
      : {
          label: 'Next deadline',
          value: nextProject
            ? formatDeadline(nextProject.projectDeadline, true)
            : '—',
          description: nextProject
            ? `${isDeadlineOverdue(nextProject.projectDeadline) ? 'Overdue · ' : ''}${nextProject.projectName}`
            : summary
              ? 'No unfinished projects'
              : 'Your next project milestone',
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
            aria-haspopup="dialog"
            aria-controls={showProjectModal ? 'project-dialog' : undefined}
            onClick={() => {
              setSuccessMessage(null);
              setEditingProject(null);
              setShowProjectModal(true);
            }}
            disabled={!canManageProjects}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#345edb] px-4 text-sm font-medium text-white shadow-[0_4px_12px_rgb(52_94_219/12%)] hover:bg-[#294fc1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#345edb] disabled:cursor-not-allowed disabled:opacity-60"
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

      {successMessage && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-[#d5eadc] bg-[#edf7f0] px-4 py-3 text-sm text-[#38745a]"
        >
          {successMessage}
        </p>
      )}
      {isAdmin && !membersLoading && !memberError && members.length === 0 && (
        <p role="status" className="mt-5 text-sm text-[#687582]">
          No active members are available for project assignment.
        </p>
      )}

      <section
        aria-label="Project summary"
        className="mt-7 grid gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-5"
      >
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="min-w-0 rounded-[22px] border border-white bg-white px-6 py-6 shadow-[0_10px_32px_rgb(25_42_62/5%)] lg:px-7"
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
              className="mt-3 text-[30px] leading-tight font-semibold tracking-[-0.8px] text-[#263342] tabular-nums wrap-anywhere"
              aria-label={`${card.label}: ${summary ? (card.value === '—' ? 'None' : card.value) : 'not available'}`}
            >
              {card.value}
            </p>
            <p className="mt-2.5 text-xs leading-5 text-[#76818d] wrap-anywhere">
              {card.description}
            </p>
          </div>
        ))}
      </section>

      <section
        aria-label={isAdmin ? 'Team projects' : 'Assigned projects'}
        aria-busy={isLoading}
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
              aria-label={
                isAdmin ? 'Search projects or members' : 'Search your projects'
              }
              placeholder={
                isAdmin
                  ? 'Search projects or members…'
                  : 'Search your projects…'
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              maxLength={200}
              disabled={isLoading || Boolean(error)}
              className="h-11 w-full rounded-lg border border-[#e3e7eb] bg-[#fdfdfd] pr-3 pl-10 text-sm text-[#647281] placeholder:text-[#86909b] focus:border-[#345edb] focus:outline-none focus:ring-2 focus:ring-[#345edb]/15 disabled:cursor-not-allowed"
            />
          </div>
          <div className="relative">
            <select
              aria-label="Filter by project status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ProjectStatus | '')
              }
              disabled={isLoading || Boolean(error)}
              className="h-11 w-full appearance-none rounded-lg border border-[#e3e7eb] bg-[#fdfdfd] pr-10 pl-4 text-xs text-[#647281] focus:border-[#345edb] focus:outline-none focus:ring-2 focus:ring-[#345edb]/15 disabled:cursor-not-allowed sm:w-[145px]"
            >
              <option value="">All statuses</option>
              {Object.values(ProjectStatus).map((value) => (
                <option key={value} value={value}>
                  {projectStatusLabels[value]}
                </option>
              ))}
            </select>
            <WorkspaceIcon
              name="chevron"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#86909b]"
            />
          </div>
        </div>
        {memberError && !isLoading && !error && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ede7d7] bg-[#fffbf0] px-5 py-3 text-xs leading-5 text-[#7b632a]"
          >
            <p>{memberError} Projects are still available.</p>
            <button
              type="button"
              onClick={retry}
              className="rounded px-2 py-1 font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Retry
            </button>
          </div>
        )}
        <ProjectTable
          projects={visibleProjects}
          members={members}
          isAdmin={isAdmin}
          membersLoading={membersLoading}
          canEdit={canManageProjects}
          onEdit={openEditProject}
          canDelete={isAdmin && !isLoading && !error}
          onDelete={openDeleteProject}
        />
        {isLoading ? (
          <div
            role="status"
            className="flex min-h-[250px] flex-col items-center justify-center gap-4 px-6 text-sm text-[#687582]"
          >
            <span
              aria-hidden="true"
              className="size-6 rounded-full border-2 border-[#e7ecf5] border-t-[#345edb] motion-safe:animate-spin"
            />
            Loading your projects…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center"
          >
            <h2 className="text-base font-semibold">
              We couldn’t load your projects
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#7a8592]">
              {error}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 min-h-11 rounded-lg bg-[#345edb] px-5 text-sm font-medium text-white hover:bg-[#294fc1] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#345edb]"
            >
              Try again
            </button>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-[#e4eaf6] bg-[#f0f4fd] text-[#5271be]">
              <WorkspaceIcon name="folder" className="size-6" />
            </span>
            <h2 className="mt-5 text-base font-semibold tracking-[-0.3px]">
              {hasFilters
                ? 'No matching projects'
                : isAdmin
                  ? 'No projects yet'
                  : 'No projects assigned yet'}
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#7a8592]">
              {hasFilters
                ? 'Try a different search or status.'
                : isAdmin
                  ? 'Your team’s projects will appear here.'
                  : 'Projects assigned to you will appear here.'}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 min-h-11 rounded-lg px-4 text-sm font-medium text-[#345edb] hover:bg-[#f0f4fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#345edb]"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <p
            role="status"
            className="border-t border-[#e7eaee] px-5 py-3.5 text-xs text-[#7a8592]"
          >
            Showing {visibleProjects.length} of {projects?.length} projects
          </p>
        )}
      </section>
      {isAdmin && showProjectModal && (
        <ProjectModal
          key={editingProject?._id ?? 'new'}
          project={editingProject ?? undefined}
          members={members}
          onClose={closeProjectModal}
          onSaved={handleProjectSaved}
          onCheckProjects={checkProjects}
        />
      )}
      {isAdmin && deletingProject && (
        <DeleteProjectModal
          key={deletingProject._id}
          project={deletingProject}
          onClose={() => setDeletingProject(null)}
          onDeleted={handleProjectDeleted}
          onCheckProjects={checkProjects}
        />
      )}
    </>
  );
}
