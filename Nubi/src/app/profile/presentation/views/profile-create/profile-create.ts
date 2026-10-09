import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileStore } from '../../../application/profile.store';
import { DeclaredDiagnosis } from '../../../domain/model/declared-diagnosis.vo';
import {
  CaregiverRole,
  ConditionType,
  Gender,
  InvitationStatus,
} from '../../../domain/model/profile.enums';
import { ProfileCaregiver } from '../../../domain/model/profile-caregiver.entity';
import { SensoryProfile } from '../../../domain/model/sensory-profile.vo';
import { PhotoUploadService } from '../../../infrastructure/photo-upload.service';

/**
 * Crear nuevo perfil (US-01), según el mock-up: datos básicos y diagnóstico en el primer
 * paso; "Continuar" crea el perfil y lleva a su detalle para registrar las sensibilidades.
 */
@Component({
  imports: [FormsModule, RouterLink, TranslatePipe],
  selector: 'app-profile-create',
  styleUrls: ['../../profile-theme.css', './profile-create.css'],
  templateUrl: './profile-create.html',
})
export class ProfileCreate {
  protected readonly store = inject(ProfileStore);
  private readonly photos = inject(PhotoUploadService);
  private readonly router = inject(Router);

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly age = signal<number | null>(null);
  protected readonly gender = signal<Gender | ''>('');
  protected readonly nickname = signal('');
  protected readonly condition = signal<ConditionType | ''>('');
  protected readonly notes = signal('');
  protected readonly photoUrl = signal<string | null>(null);
  protected readonly photoError = signal<string | null>(null);
  /** Los avisos de campos obligatorios aparecen recién al intentar continuar. */
  protected readonly submitted = signal(false);

  protected readonly genders = Object.values(Gender);
  protected readonly conditions = Object.values(ConditionType);

  protected readonly valid = computed(() => {
    const age = this.age();
    return (
      this.firstName().trim().length > 0 &&
      this.lastName().trim().length > 0 &&
      age !== null &&
      age >= 0 &&
      age <= 17 &&
      this.gender() !== '' &&
      this.condition() !== ''
    );
  });

  constructor() {
    this.store.clearMessages();
  }

  protected onPhoto(event: Event): void {
    const file = (event.target as HTMLInputElement | null)?.files?.[0];
    if (!file) return;
    this.photos.upload(file).subscribe({
      next: (url) => {
        this.photoUrl.set(url);
        this.photoError.set(null);
      },
      error: () => this.photoError.set('photo.errors.rejected'),
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    const gender = this.gender();
    const condition = this.condition();
    if (!this.valid() || gender === '' || condition === '') return;

    const now = new Date();
    this.store.create(
      {
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        age: this.age() ?? 0,
        gender,
        nickname: this.nickname().trim() || null,
        photoUrl: this.photoUrl(),
        sensoryProfile: SensoryProfile.withDefaultValues(),
        diagnosis: new DeclaredDiagnosis(condition, null, null, null, this.notes().trim() || null),
        // Quien crea el perfil queda como cuidador principal
        caregivers: [
          new ProfileCaregiver(
            1,
            this.store.currentAccountId,
            this.store.currentEmail,
            CaregiverRole.PRIMARY,
            InvitationStatus.ACTIVE,
            now,
            now,
          ),
        ],
      },
      (created) => this.router.navigate(['/perfil', created.id]),
    );
  }
}
