import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { DeclaredDiagnosis } from '../domain/model/declared-diagnosis.vo';
import { NeurodivergentProfile } from '../domain/model/neurodivergent-profile.entity';
import {
  CaregiverRole,
  CommunicativeNeed,
  Gender,
  InvitationStatus,
} from '../domain/model/profile.enums';
import { ProfileCaregiver } from '../domain/model/profile-caregiver.entity';
import { SensoryProfile } from '../domain/model/sensory-profile.vo';
import { TrustedContact } from '../domain/model/trusted-contact.entity';
import { PhotoUploadService } from '../infrastructure/photo-upload.service';
import { ProfileApiEndpoint } from '../infrastructure/profile-api-endpoint';
import { SubscriptionLimitsService } from '../infrastructure/subscription-limits.service';

/**
 * Estado del Bounded Context Perfil y Personalización (US-01 a US-06).
 * Expone signals de solo lectura; las vistas nunca llaman HttpClient directo.
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly api = inject(ProfileApiEndpoint);
  private readonly limits = inject(SubscriptionLimitsService);
  private readonly photos = inject(PhotoUploadService);

  private readonly profilesState = signal<NeurodivergentProfile[]>([]);
  private readonly selectedIdState = signal<number | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly infoState = signal<string | null>(null);
  private readonly limitReachedState = signal<'profiles' | 'caregivers' | null>(null);

  readonly profiles = computed(() => this.profilesState());
  readonly selectedProfile = computed(
    () => this.profilesState().find((profile) => profile.id === this.selectedIdState()) ?? null,
  );
  /** Cuidador autenticado (mock: coincide con shared SIGNED_IN_CAREGIVER_ID). */
  readonly currentAccountId = 1;
  readonly currentEmail = 'maria@example.com';
  /** Mi vínculo con el perfil seleccionado (rol, estado y fechas). */
  readonly myCaregiver = computed<ProfileCaregiver | null>(() => {
    const profile = this.selectedProfile();
    if (!profile) return null;
    return (
      profile.caregivers.find((item) => item.accountId === this.currentAccountId) ??
      profile.caregivers.find((item) => item.invitedEmail === this.currentEmail) ??
      null
    );
  });
  /** Solo el PRIMARY invita y revoca (regla 6). */
  readonly isPrimary = computed(() => this.myCaregiver()?.role === CaregiverRole.PRIMARY);
  /** Invitaciones PENDING de todos mis perfiles (Vista B). */
  readonly pendingInvitations = computed(() =>
    this.profilesState().flatMap((profile) =>
      profile.caregivers
        .filter((item) => item.status === InvitationStatus.PENDING)
        .map((caregiver) => ({ profile, caregiver })),
    ),
  );
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());
  readonly info = computed(() => this.infoState());
  readonly limitReached = computed(() => this.limitReachedState());

  load(): void {
    this.loadingState.set(true);
    this.errorState.set(null);
    this.api
      .getProfiles()
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        // Sin datos la vista muestra el estado vacío; listo para la API futura
        next: (profiles) => this.setProfiles(profiles),
        error: () => {
          this.setProfiles([]);
          this.errorState.set('profile.list.loadError');
        },
      });
  }

  select(profileId: number): void {
    this.selectedIdState.set(profileId);
  }

  /** US-01: valida límite del plan antes de crear (regla 3). */
  create(
    draft: Pick<NeurodivergentProfile, 'firstName' | 'lastName' | 'age'> &
      Partial<NeurodivergentProfile>,
  ): void {
    this.limits.allowsAnotherProfile(this.profilesState().length).subscribe((allowed) => {
      if (!allowed) {
        this.limitReachedState.set('profiles');
        this.errorState.set('profile.limits.profilesReached');
        return;
      }
      const now = new Date();
      const profile = new NeurodivergentProfile(
        Date.now(),
        draft.firstName,
        draft.lastName,
        draft.nickname ?? null,
        draft.age,
        draft.gender ?? Gender.PREFER_NOT_TO_SAY,
        draft.photoUrl ?? null,
        draft.communicativeNeed ?? CommunicativeNeed.PICTOGRAMS,
        true,
        draft.sensoryProfile ?? SensoryProfile.withDefaultValues(),
        draft.diagnosis ?? null,
        draft.caregivers ?? [],
        draft.trustedContacts ?? [],
        now,
        now,
      );
      this.loadingState.set(true);
      this.api
        .createProfile(profile)
        .pipe(finalize(() => this.loadingState.set(false)))
        .subscribe({
          next: (created) => {
            this.profilesState.update((items) => [...items, created]);
            this.selectedIdState.set(created.id);
          },
          error: () => this.errorState.set('profile.create.error'),
        });
    });
  }

  /** US-02 general: envía el objeto completo; sin cambios solo informa. */
  saveGeneral(
    profile: NeurodivergentProfile,
    changes: Pick<
      NeurodivergentProfile,
      'firstName' | 'lastName' | 'nickname' | 'age' | 'gender' | 'communicativeNeed'
    >,
  ): void {
    const same =
      profile.firstName === changes.firstName &&
      profile.lastName === changes.lastName &&
      (profile.nickname ?? '') === (changes.nickname ?? '') &&
      profile.age === changes.age &&
      profile.gender === changes.gender &&
      profile.communicativeNeed === changes.communicativeNeed;
    this.saveIfChanged(profile.updateGeneral(changes), !same);
  }

  /** US-02 y regla 5: sin cambios no llama a la API y lo informa amablemente. */
  saveIfChanged(next: NeurodivergentProfile, hasChanges: boolean): void {
    if (!hasChanges) {
      this.infoState.set('profile.form.noChanges');
      return;
    }
    this.loadingState.set(true);
    this.api
      .updateProfile(next)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (updated) => this.replace(updated),
        error: () => this.errorState.set('profile.form.saveError'),
      });
  }

  /** US-03: registra el Value Object sensorial completo. */
  saveSensitivities(profile: NeurodivergentProfile, sensory: SensoryProfile): void {
    this.loadingState.set(true);
    this.api
      .registerSensitivities(profile, sensory)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (updated) => this.replace(updated),
        error: () => this.errorState.set('profile.sensitivities.saveError'),
      });
  }

  /** US-04: declara el diagnóstico completo. */
  saveDiagnosis(profile: NeurodivergentProfile, diagnosis: DeclaredDiagnosis): void {
    this.loadingState.set(true);
    this.api
      .declareDiagnosis(profile, diagnosis)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (updated) => this.replace(updated),
        error: () => this.errorState.set('profile.diagnosis.saveError'),
      });
  }

  /** US-05: valida foto y actualiza photoUrl con la URL resuelta. */
  uploadPhoto(profile: NeurodivergentProfile, file: File): void {
    this.photos.upload(file).subscribe({
      next: (photoUrl) => this.saveIfChanged(profile.changePhoto(photoUrl), true),
      error: () => this.errorState.set('photo.errors.rejected'),
    });
  }

  /** US-06: valida límite del plan antes de invitar (regla 3). */
  invite(profile: NeurodivergentProfile, email: string, role: CaregiverRole): void {
    this.limits.allowsAnotherCaregiver(profile.caregivers.length).subscribe((allowed) => {
      if (!allowed) {
        this.limitReachedState.set('caregivers');
        this.errorState.set('profile.limits.caregiversReached');
        return;
      }
      this.loadingState.set(true);
      this.api
        .inviteCaregiver(profile, email, role)
        .pipe(finalize(() => this.loadingState.set(false)))
        .subscribe({
          next: (updated) => this.replace(updated),
          error: () => this.errorState.set('profile.caregivers.inviteError'),
        });
    });
  }

  linkContact(profile: NeurodivergentProfile, contact: TrustedContact): void {
    this.loadingState.set(true);
    this.api
      .linkTrustedContact(profile, contact)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (updated) => this.replace(updated),
        error: () => this.errorState.set('profile.contacts.linkError'),
      });
  }

  /** Vista B: aceptar mi invitación PENDING -> ACTIVE (aparece en mi lista). */
  acceptInvitation(profile: NeurodivergentProfile, caregiverId: number): void {
    const target = profile.caregivers.find((item) => item.id === caregiverId);
    if (!target || target.status !== InvitationStatus.PENDING) return;
    const next = new NeurodivergentProfile(
      profile.id,
      profile.firstName,
      profile.lastName,
      profile.nickname,
      profile.age,
      profile.gender,
      profile.photoUrl,
      profile.communicativeNeed,
      profile.active,
      profile.sensoryProfile,
      profile.diagnosis,
      profile.caregivers.map((item) =>
        item.id === caregiverId ? item.accept(this.currentAccountId) : item,
      ),
      profile.trustedContacts,
      profile.createdAt,
      new Date(),
    );
    this.saveIfChanged(next, true);
  }

  /** US-06: revocar acceso (el PRIMARY nunca se revoca, regla 1). */
  revoke(profile: NeurodivergentProfile, caregiverId: number): void {
    const target = profile.caregivers.find((item) => item.id === caregiverId);
    if (!target || target.isPrincipal()) return;
    const next = new NeurodivergentProfile(
      profile.id,
      profile.firstName,
      profile.lastName,
      profile.nickname,
      profile.age,
      profile.gender,
      profile.photoUrl,
      profile.communicativeNeed,
      profile.active,
      profile.sensoryProfile,
      profile.diagnosis,
      profile.caregivers.map((item) => (item.id === caregiverId ? item.revoke() : item)),
      profile.trustedContacts,
      profile.createdAt,
      new Date(),
    );
    this.saveIfChanged(next, true);
  }

  /** Contactos: subir/bajar prioridad y persistir el orden completo. */
  moveContact(profile: NeurodivergentProfile, contactId: number, delta: -1 | 1): void {
    const sorted = [...profile.trustedContacts].sort(
      (a, b) => a.priorityOrder - b.priorityOrder,
    );
    const index = sorted.findIndex((item) => item.id === contactId);
    const other = sorted[index + delta];
    if (index < 0 || !other) return;
    const current = sorted[index];
    const swapped = sorted.map((item) => {
      if (item.id === current.id)
        return new TrustedContact(
          item.id,
          item.fullName,
          item.phone,
          item.email,
          item.relationship,
          other.priorityOrder,
        );
      if (item.id === other.id)
        return new TrustedContact(
          item.id,
          item.fullName,
          item.phone,
          item.email,
          item.relationship,
          current.priorityOrder,
        );
      return item;
    });
    const next = new NeurodivergentProfile(
      profile.id,
      profile.firstName,
      profile.lastName,
      profile.nickname,
      profile.age,
      profile.gender,
      profile.photoUrl,
      profile.communicativeNeed,
      profile.active,
      profile.sensoryProfile,
      profile.diagnosis,
      profile.caregivers,
      swapped,
      profile.createdAt,
      new Date(),
    );
    this.saveIfChanged(next, true);
  }

  clearMessages(): void {
    this.errorState.set(null);
    this.infoState.set(null);
    this.limitReachedState.set(null);
  }

  private replace(updated: NeurodivergentProfile): void {
    this.profilesState.update((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  private setProfiles(profiles: NeurodivergentProfile[]): void {
    this.profilesState.set(profiles);
    if (this.selectedIdState() === null && profiles.length > 0) {
      this.selectedIdState.set(profiles[0].id);
    }
  }
}
