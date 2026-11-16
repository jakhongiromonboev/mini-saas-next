import type { ProjectStatus } from '../../enums/project.enum';

export interface ProjectUpdateInput {
  projectStatus?: ProjectStatus;
  projectName?: string;
  //calendar date in YYYY-MM-DD format.
  projectDeadline?: string;
  projectBudget?: number;
  memberId?: string;
}
