import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProfileStore as ActiveProfileStore } from '../../../../shared/application/profile.store';
import { ProfileStore } from '../../../application/profile.store';
import { DeclaredDiagnosis } from '../../../domain/model/declared-diagnosis.vo';
import {
  CommunicativeNeed,
  ConditionType,
  Gender,
  InvitationStatus,
  NUMBER_TO_SENSITIVITY,
  SENSITIVITY_TO_NUMBER,
  SensitivityLevel,
} from '../../../domain/model/profile.enums';
import { ProfileCaregiver } from '../../../domain/model/profile-caregiver.entity';
import { initialsOf, nameFromEmail } from '../../caregiver-display';

type DetailTab = 'general' | 'sensitivities' | 'diagnosis';

/**
 * Vista A: detalle del perfil neurodivergente según el mock-up.
 * Cabecera con pestañas; la etiqueta y el "nivel N/4" se derivan del control, nunca a mano.
 */
@Component({
  imports: [FormsModule, RouterLink, TranslatePipe, ToastModule],
  providers: [MessageService],
  selector: 'app-profile-detail',
  styleUrls: ['../../profile-theme.css', './profile-detail.css'],
  templateUrl: './profile-detail.html',
})
export class ProfileDetail {
  protected readonly store = inject(ProfileStore);
  protected readonly activeProfiles = inject(ActiveProfileStore);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(MessageService);
  private readonly translate = inject(TranslateService);

  protected readonly tab = signal<DetailTab>('sensitivities');
  protected readonly tabs: DetailTab[] = ['general', 'sensitivities', 'diagnosis'];

  // Sensibilidades: control 1-4 (LOW=1 ... VERY_HIGH=4)
  protected readonly auditory = signal(3);
  protected readonly visual = signal(2);
  protected readonly tactile = signal(1);
  protected readonly lowStimulation = signal(false);
  protected readonly prioritizeVisuals = signal(true);
  protected readonly confirmAudio = signal(false);
  protected readonly senses = [
    { key: 'auditory', value: this.auditory },
    { key: 'visual', value: this.visual },
    { key: 'tactile', value: this.tactile },
  ];
  protected readonly levels = Object.values(SensitivityLevel);

  // Datos generales
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly nickname = signal('');
  protected readonly age = signal<number | null>(null);
  protected readonly gender = signal<Gender>(Gender.FEMALE);
  protected readonly communicativeNeed = signal<CommunicativeNeed>(CommunicativeNeed.PICTOGRAMS);
  protected readonly genders = Object.values(Gender);
  protected readonly needs = Object.values(CommunicativeNeed);

  // Diagnóstico
  protected readonly condition = signal<ConditionType>(ConditionType.ASD);
  protected readonly customDescription = signal('');
  protected readonly diagnosedBy = signal('');
  /** Mes del diagnóstico con el formato del control nativo: AAAA-MM. */
  protected readonly diagnosisMonth = signal('');
  protected readonly professionalNotes = signal('');
  protected readonly conditions = Object.values(ConditionType);

  protected readonly initials = computed(() => {
    const profile = this.store.selectedProfile();
    return profile ? initialsOf(profile.fullName) : '··';
  });
  protected readonly isOther = computed(() => this.condition() === ConditionType.OTHER);
  protected readonly inUse = computed(
    () => this.store.selectedProfile()?.id === this.activeProfiles.selectedProfileId(),
  );
  /** Cuidadores con acceso vigente o invitación en curso. */
  protected readonly caregivers = computed(() =>
    (this.store.selectedProfile()?.caregivers ?? []).filter(
      (item) => item.status !== InvitationStatus.REVOKED,
    ),
  );

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 1);
    this.store.clearMessages();
    this.store.select(Number.isFinite(id) ? id : 1);
    if (this.store.profiles().length === 0) this.store.load();
    effect(() => {
      const profile = this.store.selectedProfile();
      if (!profile) return;
      this.firstName.set(profile.firstName);
      this.lastName.set(profile.lastName);
      this.nickname.set(profile.nickname ?? '');
      this.age.set(profile.age);
      this.gender.set(profile.gender);
      this.communicativeNeed.set(profile.communicativeNeed);
      this.auditory.set(SENSITIVITY_TO_NUMBER[profile.sensoryProfile.auditory]);
      this.visual.set(SENSITIVITY_TO_NUMBER[profile.sensoryProfile.visual]);
      this.tactile.set(SENSITIVITY_TO_NUMBER[profile.sensoryProfile.tactile]);
      this.lowStimulation.set(profile.sensoryProfile.lowStimulationEnabled);
      this.prioritizeVisuals.set(profile.sensoryProfile.prioritizeVisuals);
      this.confirmAudio.set(profile.sensoryProfile.confirmAudio);
      if (profile.diagnosis) {
        this.condition.set(profile.diagnosis.condition);
        this.customDescription.set(profile.diagnosis.customDescription ?? '');
        this.diagnosedBy.set(profile.diagnosis.diagnosedBy ?? '');
        this.diagnosisMonth.set(profile.diagnosis.diagnosisDate?.slice(0, 7) ?? '');
        this.professionalNotes.set(profile.diagnosis.professionalNotes ?? '');
      }
    });
  }

  protected levelOf(value: number): SensitivityLevel {
    return NUMBER_TO_SENSITIVITY[value] ?? SensitivityLevel.MEDIUM;
  }

  /** Color de la etiqueta de nivel, como en el mock-up. */
  protected levelTone(value: number): string {
    return value >= 3 ? 'coral' : value === 2 ? 'yellow' : '';
  }

  /** Mi nombre sale de la sesión; el de los demás, de su correo. */
  protected caregiverName(item: ProfileCaregiver): string {
    const me = this.isMe(item) ? this.activeProfiles.caregiver()?.fullName : null;
    return me ?? nameFromEmail(item.invitedEmail);
  }

  protected caregiverInitials(item: ProfileCaregiver): string {
    return initialsOf(this.caregiverName(item));
  }

  protected isMe(item: ProfileCaregiver): boolean {
    return item.id === this.store.myCaregiver()?.id;
  }

  /** "Marzo de 2026" a partir de la fecha guardada (AAAA-MM-DD). */
  protected monthLabel(isoDate: string): string {
    const text = new Intl.DateTimeFormat(this.translate.currentLang() ?? 'es', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(isoDate));
    return text[0].toUpperCase() + text.slice(1);
  }

  /** Cabecera "Guardar cambios": guarda lo que muestra la pestaña abierta. */
  protected save(): void {
    switch (this.tab()) {
      case 'general':
        return this.saveGeneral();
      case 'sensitivities':
        return this.saveSensitivities();
      case 'diagnosis':
        return this.saveDiagnosis();
    }
  }

  protected onPhotoFiles(event: Event): void {
    const profile = this.store.selectedProfile();
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!profile || !file) return;
    this.store.uploadPhoto(profile, file);
  }

  private saveSensitivities(): void {
    const profile = this.store.selectedProfile();
    if (!profile) return;
    this.store.saveSensitivities(
      profile,
      profile.sensoryProfile.copy({
        auditory: this.levelOf(this.auditory()),
        visual: this.levelOf(this.visual()),
        tactile: this.levelOf(this.tactile()),
        lowStimulationEnabled: this.lowStimulation(),
        prioritizeVisuals: this.prioritizeVisuals(),
        confirmAudio: this.confirmAudio(),
      }),
    );
    this.notify('success', 'profile.detail.saved');
  }

  private saveGeneral(): void {
    const profile = this.store.selectedProfile();
    if (!profile) return;
    if (!this.firstName().trim() || !this.lastName().trim() || this.age() === null) {
      this.notify('warn', 'profile.detail.missingRequired');
      return;
    }
    this.store.saveGeneral(profile, {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      nickname: this.nickname().trim() ? this.nickname().trim() : null,
      age: this.age() ?? profile.age,
      gender: this.gender(),
      communicativeNeed: this.communicativeNeed(),
    });
  }

  private saveDiagnosis(): void {
    const profile = this.store.selectedProfile();
    if (!profile) return;
    if (this.isOther() && !this.customDescription().trim()) {
      this.notify('warn', 'profile.detail.describeOther');
      return;
    }
    this.store.saveDiagnosis(
      profile,
      new DeclaredDiagnosis(
        this.condition(),
        this.customDescription().trim() ? this.customDescription().trim() : null,
        this.diagnosedBy().trim() ? this.diagnosedBy().trim() : null,
        this.diagnosisMonth() ? `${this.diagnosisMonth()}-01` : null,
        this.professionalNotes().trim() ? this.professionalNotes().trim() : null,
      ),
    );
    this.notify('success', 'profile.detail.saved');
  }

  private notify(severity: 'success' | 'warn', key: string): void {
    this.toast.add({ severity, summary: this.translate.instant(key) });
  }
}
