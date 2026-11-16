import { API_URL } from '../config';
import { ProjectStatus } from '../enums/project.enum';
import type { Project } from '../types/project/project';
import type {
  ProjectInput,
  ProjectInquiry,
} from '../types/project/project.input';
import type { ProjectUpdateInput } from '../types/project/project.update';

interface ProjectResponse {
  projects?: Project[];
  project?: Project;
  deleted?: boolean;
  error?: { message?: string };
}

export class ProjectError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ProjectError';
  }
}

const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
const unexpectedResponse =
  'The server returned an unexpected project response. Please try again.';

/** PROJECT FUNCTIONS **/
export async function getProjects(
  inquiry: ProjectInquiry = {},
  signal?: AbortSignal,
): Promise<Project[]> {
  const params = new URLSearchParams();
  const search = inquiry.search?.trim();

  if (search) params.set('search', search);
  if (inquiry.projectStatus !== undefined) {
    params.set('projectStatus', inquiry.projectStatus);
  }

  const query = params.toString();
  const { result, status } = await request(
    `/project/all${query ? `?${query}` : ''}`,
    { method: 'GET', signal },
  );

  if (!Array.isArray(result.projects) || !result.projects.every(isProject)) {
    throw new ProjectError(status, unexpectedResponse);
  }
  return result.projects;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const { result, status } = await request('/project/create', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return readProject(result, status);
}

export async function updateProject(
  id: string,
  input: ProjectUpdateInput,
): Promise<Project> {
  const { result, status } = await request(
    `/project/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
  return readProject(result, status);
}

export async function deleteProject(id: string): Promise<void> {
  const { result, status } = await request(
    `/project/${encodeURIComponent(id)}/delete`,
    { method: 'PUT' },
  );

  if (result.deleted !== true) {
    throw new ProjectError(status, unexpectedResponse);
  }
}

/** RESPONSE HELPERS **/
function isProject(project: Project | null | undefined): project is Project {
  return Boolean(
    project &&
    typeof project._id === 'string' &&
    Object.values(ProjectStatus).includes(project.projectStatus) &&
    typeof project.projectName === 'string' &&
    typeof project.projectDeadline === 'string' &&
    typeof project.projectBudget === 'number' &&
    Number.isFinite(project.projectBudget) &&
    typeof project.memberId === 'string' &&
    typeof project.createdAt === 'string' &&
    typeof project.updatedAt === 'string',
  );
}

function readProject(result: ProjectResponse, status: number): Project {
  if (!isProject(result.project)) {
    throw new ProjectError(status, unexpectedResponse);
  }
  return result.project;
}

async function request(
  path: string,
  options: RequestInit = {},
): Promise<{ result: ProjectResponse; status: number }> {
  const controller = new AbortController();
  const cancelRequest = () => controller.abort();
  let timedOut = false;

  if (options.signal?.aborted) cancelRequest();
  options.signal?.addEventListener('abort', cancelRequest, { once: true });

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(apiUrl + path, {
      ...options,
      headers: options.body
        ? { 'Content-Type': 'application/json' }
        : undefined,
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    });
    const result: ProjectResponse | null = await response
      .json()
      .catch((error: unknown) => {
        if (controller.signal.aborted) throw error;
        return null;
      });

    if (!response.ok) {
      const message =
        typeof result?.error?.message === 'string'
          ? result.error.message
          : 'The request could not be completed. Please try again.';
      throw new ProjectError(response.status, message);
    }

    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new ProjectError(response.status, unexpectedResponse);
    }
    return { result, status: response.status };
  } catch (error) {
    if (options.signal?.aborted || error instanceof ProjectError) throw error;
    if (timedOut) {
      throw new Error('The request took too long. Please try again.');
    }
    throw new Error('Unable to reach the server. Please try again.');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', cancelRequest);
  }
}
