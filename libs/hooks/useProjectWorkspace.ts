import { useEffect, useState } from 'react';
import { MemberType } from '../enums/member.enum';
import { getMembers, MemberError } from '../services/member.service';
import { getProjects, ProjectError } from '../services/project.service';
import type { MemberListItem } from '../types/member/member';
import type { Project } from '../types/project/project';
import { useAuth } from './useAuth';

interface WorkspaceData {
  requestKey: string;
  projects: Project[] | null;
  members: MemberListItem[];
  error: string | null;
  memberError: string | null;
  membersLoading: boolean;
}

export function useProjectWorkspace() {
  const { member, updateMember } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<WorkspaceData | null>(null);
  const memberId = member?._id;
  const isAdmin = member?.memberType === MemberType.ADMIN;
  const requestKey = `${memberId}:${isAdmin}:${attempt}`;

  useEffect(() => {
    if (!memberId) return;

    const controller = new AbortController();

    function saveResult(result: Partial<WorkspaceData>) {
      if (controller.signal.aborted) return;

      setData((previous) => ({
        requestKey,
        projects: null,
        members: [],
        error: null,
        memberError: null,
        membersLoading: isAdmin,
        ...(previous?.requestKey === requestKey ? previous : {}),
        ...result,
      }));
    }

    function sessionExpired(error: unknown): boolean {
      if (
        (error instanceof ProjectError || error instanceof MemberError) &&
        error.status === 401
      ) {
        controller.abort();
        updateMember(null);
        return true;
      }
      return false;
    }

    async function loadProjects() {
      try {
        const projects = await getProjects({}, controller.signal);
        // The API enforces access; keep the displayed member scope explicit too.
        saveResult({
          projects: isAdmin
            ? projects
            : projects.filter((project) => project.memberId === memberId),
        });
      } catch (error) {
        if (controller.signal.aborted || sessionExpired(error)) return;
        saveResult({
          error:
            error instanceof Error
              ? error.message
              : 'We could not load your projects. Please try again.',
        });
      }
    }

    async function loadMembers() {
      try {
        const members = await getMembers(controller.signal);
        saveResult({ members, membersLoading: false });
      } catch (error) {
        if (controller.signal.aborted || sessionExpired(error)) return;
        saveResult({
          membersLoading: false,
          memberError: 'Member names could not be loaded.',
        });
      }
    }

    void loadProjects();
    if (isAdmin) void loadMembers();

    return () => controller.abort();
  }, [isAdmin, memberId, requestKey, updateMember]);

  const current = data?.requestKey === requestKey ? data : null;

  const addProject = (project: Project) => {
    if (!isAdmin) return;

    setData((previous) => {
      if (previous?.requestKey !== requestKey || !previous.projects)
        return previous;

      return {
        ...previous,
        projects: [
          project,
          ...previous.projects.filter((item) => item._id !== project._id),
        ],
      };
    });
  };

  const replaceProject = (updatedProject: Project) => {
    if (!isAdmin) return;

    setData((previous) => {
      if (previous?.requestKey !== requestKey || !previous.projects)
        return previous;

      return {
        ...previous,
        projects: previous.projects.map((project) =>
          project._id === updatedProject._id ? updatedProject : project,
        ),
      };
    });
  };

  return {
    projects: current?.projects ?? null,
    members: current?.members ?? [],
    error: current?.error ?? null,
    memberError: current?.memberError ?? null,
    isLoading: !current?.projects && !current?.error,
    membersLoading: current?.membersLoading ?? isAdmin,
    retry: () => setAttempt((previous) => previous + 1),
    addProject,
    replaceProject,
  };
}
