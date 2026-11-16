import type { MemberStatus, MemberType } from '../../enums/member.enum';

export interface Member {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberName: string;
  memberEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberListItem {
  _id: string;
  memberName: string;
  memberEmail: string;
}
