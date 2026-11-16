import type { NextPage } from 'next';
import DashboardLayout from '@/libs/components/layout/DashboardLayout';
import ProjectWorkspace from '@/libs/components/project/ProjectWorkspace';
import { MemberType } from '@/libs/enums/member.enum';

const AdminProjects: NextPage = () => {
  return (
    <DashboardLayout requiredRole={MemberType.ADMIN} title="Projects">
      <ProjectWorkspace memberType={MemberType.ADMIN} />
    </DashboardLayout>
  );
};

export default AdminProjects;
