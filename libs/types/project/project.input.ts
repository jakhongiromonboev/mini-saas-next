import type { ProjectStatus } from '../../enums/project.enum';

export interface ProjectInput {
  projectStatus?: ProjectStatus;
  projectName: string;
  // Send the calendar date in YYYY-MM-DD format.
  projectDeadline: string;
  projectBudget: number;
  memberId: string;
}

export interface ProjectInquiry {
  search?: string;
  projectStatus?: ProjectStatus;
}
