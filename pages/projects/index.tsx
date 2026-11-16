import type { NextPage } from 'next';
import DashboardLayout from '@/libs/components/layout/DashboardLayout';
import ProjectWorkspace from '@/libs/components/project/ProjectWorkspace';
import { MemberType } from '@/libs/enums/member.enum';

const MemberProjects: NextPage = () => {
  return (
    <DashboardLayout requiredRole={MemberType.USER}>
      <ProjectWorkspace memberType={MemberType.USER} />
    </DashboardLayout>
  );
};

export default MemberProjects;
