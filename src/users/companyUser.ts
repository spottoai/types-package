export class CompanyUser {
  id?: string;
  userId!: string;
  companyId!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: number;
  isPendingInvite!: boolean;
  invitedBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
