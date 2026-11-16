import type { ProjectStatus } from '../../enums/project.enum';

export interface Project {
  _id: string;
  projectStatus: ProjectStatus;
  projectName: string;
  projectDeadline: string;
  projectBudget: number;
  memberId: string;
  createdAt: string;
  updatedAt: string;
}
