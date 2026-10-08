import {
  AccountRole,
  AuthProvider,
  InstitutionType,
  PaymentStatus,
  PlanType,
  SubscriptionStatus,
  TicketStatus,
} from '../domain/model/account.enums';

/** Recursos REST tal como los expone la API falsa (server/db.json). */
export interface AccountResource {
  id: number;
  email: string;
  fullName: string;
  authProvider: AuthProvider;
  googleSubject: string | null;
  role: AccountRole;
  active: boolean;
  institutionId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface TokenResource {
  token: string;
  accountId: number;
}

export interface InstitutionResource {
  id: number;
  name: string;
  type: InstitutionType;
  contactEmail: string;
  memberIds: number[];
  profileIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionResource {
  id: number;
  accountId: number;
  plan: PlanType;
  status: SubscriptionStatus;
  maxProfiles: number;
  maxCaregiversPerProfile: number;
  startedAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentResource {
  id: number;
  subscriptionId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gatewayReference: string | null;
  paidAt: string | null;
}

export interface SupportTicketResource {
  id: number;
  accountId: number;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface SupportTicketRequest {
  subject: string;
  description: string;
}
