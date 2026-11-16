import { MemberType } from '../enums/member.enum';

export function getDashboardPath(memberType: MemberType): string {
  if (memberType === MemberType.ADMIN) return '/_admin';
  if (memberType === MemberType.USER) return '/projects';
  return '/account/join';
}
