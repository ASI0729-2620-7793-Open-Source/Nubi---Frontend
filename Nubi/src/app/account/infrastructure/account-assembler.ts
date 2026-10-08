import { Account } from '../domain/model/account.entity';
import { Institution } from '../domain/model/institution.entity';
import { Payment } from '../domain/model/payment.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SupportTicket } from '../domain/model/support-ticket.entity';
import {
  AccountResource,
  InstitutionResource,
  PaymentResource,
  SubscriptionResource,
  SupportTicketResource,
} from './account-resources';

/**
 * Assembler del Bounded Context Cuenta.
 * Convierte entre recursos REST y entidades del dominio.
 */
export class AccountAssembler {
  toAccount(resource: AccountResource): Account {
    return new Account(
      resource.id,
      resource.email,
      resource.fullName,
      resource.authProvider,
      resource.googleSubject,
      resource.role,
      resource.active,
      resource.institutionId,
      new Date(resource.createdAt),
      new Date(resource.updatedAt),
    );
  }

  toInstitution(resource: InstitutionResource): Institution {
    return new Institution(
      resource.id,
      resource.name,
      resource.type,
      resource.contactEmail,
      resource.memberIds,
      resource.profileIds,
      new Date(resource.createdAt),
      new Date(resource.updatedAt),
    );
  }

  fromInstitution(entity: Institution): InstitutionResource {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type as never,
      contactEmail: entity.contactEmail,
      memberIds: entity.memberIds,
      profileIds: entity.profileIds,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  toSubscription(resource: SubscriptionResource): Subscription {
    return new Subscription(
      resource.id,
      resource.accountId,
      resource.plan,
      resource.status,
      resource.maxProfiles,
      resource.maxCaregiversPerProfile,
      new Date(resource.startedAt),
      resource.endsAt ? new Date(resource.endsAt) : null,
      new Date(resource.createdAt),
      new Date(resource.updatedAt),
    );
  }

  toPayment(resource: PaymentResource): Payment {
    return new Payment(
      resource.id,
      resource.subscriptionId,
      resource.amount,
      resource.currency,
      resource.status,
      resource.gatewayReference,
      resource.paidAt ? new Date(resource.paidAt) : null,
    );
  }

  toTicket(resource: SupportTicketResource): SupportTicket {
    return new SupportTicket(
      resource.id,
      resource.accountId,
      resource.subject,
      resource.description,
      resource.status,
      new Date(resource.createdAt),
      resource.resolvedAt ? new Date(resource.resolvedAt) : null,
    );
  }
}
