import { ProjectStatus } from '../enums/project.enum';
import type { Project } from '../types/project/project';

const budgetFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const projectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.ON_HOLD]: 'On hold',
  [ProjectStatus.COMPLETED]: 'Completed',
};

export function formatBudget(value: number): string {
  return budgetFormat.format(value);
}

export function formatDeadline(value: string, short = false): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  // Deadlines are calendar dates stored at midnight UTC by the API.
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(short ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  }).format(date);
}

export function isDeadlineOverdue(value: string): boolean {
  const today = new Date();
  const startOfToday = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return new Date(value).getTime() < startOfToday;
}

export function getProjectSummary(projects: Project[]) {
  const nextProject = projects.reduce<Project | null>((next, project) => {
    if (project.projectStatus === ProjectStatus.COMPLETED) return next;
    const deadline = new Date(project.projectDeadline).getTime();
    if (Number.isNaN(deadline)) return next;
    if (!next || deadline < new Date(next.projectDeadline).getTime()) {
      return project;
    }
    return next;
  }, null);

  return {
    total: projects.length,
    active: projects.filter(
      (project) => project.projectStatus === ProjectStatus.ACTIVE,
    ).length,
    budget: projects.reduce(
      (total, project) => total + project.projectBudget,
      0,
    ),
    nextProject,
  };
}
