/** Enumerados del Bounded Context Cuenta (según el diagrama). */
export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export enum AccountRole {
  CAREGIVER = 'CAREGIVER',
  TEACHER = 'TEACHER',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
}

export enum InstitutionType {
  SCHOOL = 'SCHOOL',
  THERAPY_CENTER = 'THERAPY_CENTER',
}

export enum PlanType {
  FREEMIUM = 'FREEMIUM',
  FAMILY_PREMIUM = 'FAMILY_PREMIUM',
  INSTITUTIONAL = 'INSTITUTIONAL',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
}
