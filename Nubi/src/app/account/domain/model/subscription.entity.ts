import { AuditableEntity } from '../../../shared/domain/model/auditable.entity';
import { PlanType, SubscriptionStatus } from './account.enums';

/**
 * Aggregate Root. Suscripción 1—1 con Account.
 * Al registrarse se activa FREEMIUM (AccountCreatedEvent, backend).
 */
export class Subscription extends AuditableEntity {
  constructor(
    public readonly id: number,
    public readonly accountId: number,
    public readonly plan: PlanType,
    public readonly status: SubscriptionStatus,
    public readonly maxProfiles: number,
    public readonly maxCaregiversPerProfile: number,
    public readonly startedAt: Date,
    public readonly endsAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(createdAt, updatedAt);
  }

  upgradeTo(plan: PlanType, maxProfiles: number, maxCaregivers: number): Subscription {
    return new Subscription(
      this.id,
      this.accountId,
      plan,
      SubscriptionStatus.ACTIVE,
      maxProfiles,
      maxCaregivers,
      this.startedAt,
      this.endsAt,
      this.createdAt,
      new Date(),
    );
  }

  cancel(): Subscription {
    return new Subscription(
      this.id,
      this.accountId,
      this.plan,
      SubscriptionStatus.CANCELLED,
      this.maxProfiles,
      this.maxCaregiversPerProfile,
      this.startedAt,
      this.endsAt,
      this.createdAt,
      new Date(),
    );
  }

  allowsAnotherProfile(currentProfiles: number): boolean {
    return this.status === SubscriptionStatus.ACTIVE && currentProfiles < this.maxProfiles;
  }

  allowsAnotherCaregiver(currentCaregivers: number): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE &&
      currentCaregivers < this.maxCaregiversPerProfile
    );
  }
}
