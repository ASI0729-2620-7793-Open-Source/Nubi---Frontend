import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProfileStore as ActiveProfileStore } from '../../../../shared/application/profile.store';
import { ProfileStore } from '../../../application/profile.store';
import { CaregiverRole, InvitationStatus } from '../../../domain/model/profile.enums';
import { ProfileCaregiver } from '../../../domain/model/profile-caregiver.entity';
import { TrustedContact } from '../../../domain/model/trusted-contact.entity';
import { initialsOf, nameFromEmail } from '../../caregiver-display';

/**
 * Cuidadores asociados a un perfil (US-06), según el mock-up: resumen, tabla y panel
 * lateral para invitar. Solo el cuidador principal invita y revoca (regla 6).
 */
@Component({
  imports: [FormsModule, RouterLink, TranslatePipe, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  selector: 'app-profile-caregivers',
  styleUrls: ['../../profile-theme.css', './profile-caregivers.css'],
  templateUrl: './profile-caregivers.html',
})
export class ProfileCaregivers {
  protected readonly store = inject(ProfileStore);
  private readonly activeProfiles = inject(ActiveProfileStore);
  private readonly route = inject(ActivatedRoute);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly Status = InvitationStatus;

  // Panel "Invitar cuidador"
  protected readonly inviteOpen = signal(false);
  protected readonly inviteEmail = signal('');
  protected readonly inviteRole = signal<CaregiverRole | ''>('');
  protected readonly inviteRoles = [CaregiverRole.CAREGIVER, CaregiverRole.THERAPIST];

  // Contactos de confianza
  protected readonly contactOpen = signal(false);
  protected readonly contactName = signal('');
  protected readonly contactPhone = signal('');
  protected readonly contactRelation = signal('');

  protected readonly caregivers = computed(() => this.store.selectedProfile()?.caregivers ?? []);
  protected readonly activeCount = computed(
    () => this.caregivers().filter((item) => item.status === InvitationStatus.ACTIVE).length,
  );
  protected readonly pendingCount = computed(
    () => this.caregivers().filter((item) => item.status === InvitationStatus.PENDING).length,
  );
  protected readonly sortedContacts = computed(
    () =>
      this.store
        .selectedProfile()
        ?.trustedContacts.slice()
        .sort((a, b) => a.priorityOrder - b.priorityOrder) ?? [],
  );

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 1);
    this.store.clearMessages();
    this.store.select(Number.isFinite(id) ? id : 1);
    if (this.store.profiles().length === 0) this.store.load();
  }

  /** Mi nombre sale de la sesión; el de los demás, de su correo. */
  protected nameOf(item: ProfileCaregiver): string {
    const mine = item.id === this.store.myCaregiver()?.id;
    const me = mine ? this.activeProfiles.caregiver()?.fullName : null;
    return me ?? nameFromEmail(item.invitedEmail);
  }

  protected initialsOf(item: ProfileCaregiver): string {
    return initialsOf(this.nameOf(item));
  }

  protected closeInvite(): void {
    this.inviteOpen.set(false);
    this.inviteEmail.set('');
    this.inviteRole.set('');
  }

  protected sendInvite(): void {
    const profile = this.store.selectedProfile();
    const email = this.inviteEmail().trim();
    const role = this.inviteRole();
    if (!profile || !/^\S+@\S+\.\S+$/.test(email) || role === '') {
      this.notify('warn', 'profile.caregivers.invalidInvite');
      return;
    }
    this.store.invite(profile, email, role);
    this.closeInvite();
  }

  protected askRevoke(caregiver: ProfileCaregiver): void {
    const profile = this.store.selectedProfile();
    if (!profile) return;
    this.confirm.confirm({
      header: this.translate.instant('profile.caregivers.revokeTitle'),
      message: this.translate.instant('profile.caregivers.revokeMessage', {
        name: this.nameOf(caregiver),
      }),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('profile.caregivers.revoke'),
      rejectLabel: this.translate.instant('profile.create.cancel'),
      accept: () => this.store.revoke(profile, caregiver.id),
    });
  }

  /** Sin servicio de correo en esta entrega: la invitación sigue pendiente y solo se avisa. */
  protected resend(): void {
    this.notify('success', 'profile.caregivers.resent');
  }

  protected addContact(): void {
    const profile = this.store.selectedProfile();
    if (!profile || !this.contactName().trim() || !this.contactPhone().trim()) {
      this.notify('warn', 'profile.caregivers.contacts.required');
      return;
    }
    const nextId = Math.max(0, ...profile.trustedContacts.map((item) => item.id)) + 1;
    const order = Math.max(0, ...profile.trustedContacts.map((item) => item.priorityOrder)) + 1;
    this.store.linkContact(
      profile,
      new TrustedContact(
        nextId,
        this.contactName().trim(),
        this.contactPhone().trim(),
        null,
        this.contactRelation().trim() ||
          this.translate.instant('profile.caregivers.contacts.defaultRelation'),
        order,
      ),
    );
    this.contactOpen.set(false);
    this.contactName.set('');
    this.contactPhone.set('');
    this.contactRelation.set('');
  }

  private notify(severity: 'success' | 'warn', key: string): void {
    this.toast.add({ severity, summary: this.translate.instant(key) });
  }
}
