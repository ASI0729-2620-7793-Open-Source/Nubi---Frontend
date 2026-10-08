import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProfileStore } from '../../../application/profile.store';
import { DeclaredDiagnosis } from '../../../domain/model/declared-diagnosis.vo';
import {
  CaregiverRole,
  CommunicativeNeed,
  ConditionType,
  Gender,
  InvitationStatus,
  NUMBER_TO_SENSITIVITY,
  SensitivityLevel,
} from '../../../domain/model/profile.enums';
import { TrustedContact } from '../../../domain/model/trusted-contact.entity';

/**
 * Vista A: detalle del perfil neurodivergente según el wireframe.
 * Cabecera + Tabs; el Tag y "nivel N/4" se derivan del slider, nunca a mano.
 */
@Component({
  imports: [
    FormsModule,
    NgTemplateOutlet,
    RouterLink,
    AvatarModule,
    BreadcrumbModule,
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    PanelModule,
    SelectModule,
    SliderModule,
    TabsModule,
    TagModule,
    TextareaModule,
    ToastModule,
    ToggleSwitchModule,
  ],
  providers: [ConfirmationService, MessageService],
  selector: 'app-profile-detail',
  styleUrl: './profile-detail.css',
  templateUrl: './profile-detail.html',
})
export class ProfileDetail {
  protected readonly store = inject(ProfileStore);
  private readonly route = inject(ActivatedRoute);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);

  // Sensibilidades: slider 1-4 (LOW=1 ... VERY_HIGH=4)
  protected readonly auditory = signal(3);
  protected readonly visual = signal(2);
  protected readonly tactile = signal(1);
  protected readonly lowStimulation = signal(false);
  protected readonly prioritizeVisuals = signal(true);
  protected readonly confirmAudio = signal(false);

  // Datos generales
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly nickname = signal('');
  protected readonly age = signal<number | null>(null);
  protected readonly gender = signal<Gender>(Gender.FEMALE);
  protected readonly communicativeNeed = signal<CommunicativeNeed>(
    CommunicativeNeed.PICTOGRAMS,
  );

  // Diagnóstico
  protected readonly condition = signal<ConditionType>(ConditionType.ASD);
  protected readonly customDescription = signal('');
  protected readonly diagnosedBy = signal('');
  protected readonly diagnosisDate = signal<Date | null>(null);
  protected readonly professionalNotes = signal('');

  // Cuidadores: dialog invitar + contactos
  protected readonly inviteOpen = signal(false);
  protected readonly inviteEmail = signal('');
  protected readonly inviteRole = signal<CaregiverRole>(CaregiverRole.CAREGIVER);
  protected readonly contactOpen = signal(false);
  protected readonly contactName = signal('');
  protected readonly contactPhone = signal('');
  protected readonly contactRelation = signal('');

  protected readonly genderOptions = [
    { label: 'Femenino', value: Gender.FEMALE },
    { label: 'Masculino', value: Gender.MALE },
    { label: 'No binario', value: Gender.NON_BINARY },
    { label: 'Prefiero no decir', value: Gender.PREFER_NOT_TO_SAY },
  ];
  protected readonly needOptions = [
    { label: 'Pictogramas', value: CommunicativeNeed.PICTOGRAMS },
    { label: 'Texto', value: CommunicativeNeed.TEXT },
    { label: 'Voz', value: CommunicativeNeed.VOICE },
  ];
  protected readonly conditionOptions = [
    { label: 'TEA', value: ConditionType.ASD },
    { label: 'TDAH', value: ConditionType.ADHD },
    { label: 'TOC', value: ConditionType.OCD },
    { label: 'Otra', value: ConditionType.OTHER },
  ];
  protected readonly roleOptions = [
    { label: 'Familiar (cuidador)', value: CaregiverRole.CAREGIVER },
    { label: 'Profesional (terapeuta)', value: CaregiverRole.THERAPIST },
  ];

  protected readonly crumbs = computed(() => [
    { label: 'Inicio', routerLink: '/inicio' },
    { label: 'Perfiles', routerLink: '/perfil' },
    { label: this.store.selectedProfile()?.fullName ?? 'Detalle' },
  ]);
  protected readonly subtitle = computed(() => {
    const profile = this.store.selectedProfile();
    if (!profile) return '';
    const condition = profile.diagnosis
      ? `${this.conditionLabel(profile.diagnosis.condition)}${profile.diagnosis.professionalNotes ? ` ${profile.diagnosis.professionalNotes}` : ''}`
      : 'Sin diagnóstico registrado';
    const nick = profile.nickname?.trim() ? ` · Le gusta que le llamen ${profile.nickname}` : '';
    return `${profile.age} años · ${condition}${nick}`;
  });
  protected readonly initials = computed(() => {
    const profile = this.store.selectedProfile();
    if (!profile) return '··';
    return `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase();
  });
  protected readonly isOther = computed(() => this.condition() === ConditionType.OTHER);
  protected readonly sortedContacts = computed(
    () =>
      this.store.selectedProfile()?.trustedContacts.slice().sort(
        (a, b) => a.priorityOrder - b.priorityOrder,
      ) ?? [],
  );

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 1);
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
      this.auditory.set(this.toNumber(profile.sensoryProfile.auditory));
      this.visual.set(this.toNumber(profile.sensoryProfile.visual));
      this.tactile.set(this.toNumber(profile.sensoryProfile.tactile));
      this.lowStimulation.set(profile.sensoryProfile.lowStimulationEnabled);
      this.prioritizeVisuals.set(profile.sensoryProfile.prioritizeVisuals);
      this.confirmAudio.set(profile.sensoryProfile.confirmAudio);
      if (profile.diagnosis) {
        this.condition.set(profile.diagnosis.condition);
        this.customDescription.set(profile.diagnosis.customDescription ?? '');
        this.diagnosedBy.set(profile.diagnosis.diagnosedBy ?? '');
        this.diagnosisDate.set(
          profile.diagnosis.diagnosisDate ? new Date(profile.diagnosis.diagnosisDate) : null,
        );
        this.professionalNotes.set(profile.diagnosis.professionalNotes ?? '');
      }
    });
  }

  protected levelOf(value: number): SensitivityLevel {
    return NUMBER_TO_SENSITIVITY[value] ?? SensitivityLevel.MEDIUM;
  }

  protected levelLabel(level: SensitivityLevel): string {
    switch (level) {
      case SensitivityLevel.LOW:
        return 'Baja';
      case SensitivityLevel.MEDIUM:
        return 'Media';
      case SensitivityLevel.HIGH:
        return 'Alta';
      case SensitivityLevel.VERY_HIGH:
        return 'Muy alta';
    }
  }

  protected conditionLabel(condition: ConditionType): string {
    switch (condition) {
      case ConditionType.ASD:
        return 'TEA';
      case ConditionType.ADHD:
        return 'TDAH';
      case ConditionType.OCD:
        return 'TOC';
      case ConditionType.OTHER:
        return 'Otra';
    }
  }

  protected roleLabel(role: CaregiverRole): string {
    switch (role) {
      case CaregiverRole.PRIMARY:
        return 'Principal';
      case CaregiverRole.CAREGIVER:
        return 'Familiar';
      case CaregiverRole.THERAPIST:
        return 'Profesional';
    }
  }

  protected statusIcon(status: InvitationStatus): string {
    switch (status) {
      case InvitationStatus.ACTIVE:
        return 'pi pi-check';
      case InvitationStatus.PENDING:
        return 'pi pi-clock';
      case InvitationStatus.REVOKED:
        return 'pi pi-ban';
    }
  }

  protected statusSeverity(status: InvitationStatus): 'success' | 'warn' | 'danger' {
    switch (status) {
      case InvitationStatus.ACTIVE:
        return 'success';
      case InvitationStatus.PENDING:
        return 'warn';
      case InvitationStatus.REVOKED:
        return 'danger';
    }
  }

  /** Cabecera "Guardar cambios": persiste sensibilidades + preferencias. */
  protected save(): void {
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
    this.toast.add({ severity: 'success', summary: 'Guardado' });
  }

  protected saveGeneral(): void {
    const profile = this.store.selectedProfile();
    if (!profile || this.age() === null) return;
    if (!this.firstName().trim() || !this.lastName().trim()) {
      this.toast.add({ severity: 'warn', summary: 'Falta un dato obligatorio' });
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

  protected saveDiagnosis(): void {
    const profile = this.store.selectedProfile();
    if (!profile) return;
    if (this.isOther() && !this.customDescription().trim()) {
      this.toast.add({ severity: 'warn', summary: 'Describe la condición "Otra"' });
      return;
    }
    this.store.saveDiagnosis(
      profile,
      new DeclaredDiagnosis(
        this.condition(),
        this.isOther() ? this.customDescription().trim() : null,
        this.diagnosedBy().trim() ? this.diagnosedBy().trim() : null,
        this.diagnosisDate() ? this.diagnosisDate()!.toISOString().slice(0, 10) : null,
        this.professionalNotes().trim() ? this.professionalNotes().trim() : null,
      ),
    );
  }

  protected sendInvite(): void {
    const profile = this.store.selectedProfile();
    const email = this.inviteEmail().trim();
    if (!profile || !email.includes('@')) {
      this.toast.add({ severity: 'warn', summary: 'Correo no válido' });
      return;
    }
    this.store.invite(profile, email, this.inviteRole());
    this.inviteOpen.set(false);
    this.inviteEmail.set('');
  }

  protected askRevoke(caregiverId: number): void {
    const profile = this.store.selectedProfile();
    if (!profile) return;
    this.confirm.confirm({
      message: 'Se revocará el acceso de este cuidador.',
      header: 'Revocar cuidador',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.revoke(profile, caregiverId),
    });
  }

  protected addContact(): void {
    const profile = this.store.selectedProfile();
    if (!profile || !this.contactName().trim() || !this.contactPhone().trim()) {
      this.toast.add({ severity: 'warn', summary: 'Nombre y teléfono obligatorios' });
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
        this.contactRelation().trim() || 'Familiar',
        order,
      ),
    );
    this.contactOpen.set(false);
    this.contactName.set('');
    this.contactPhone.set('');
    this.contactRelation.set('');
  }

  protected onPhotoFiles(event: Event): void {
    const profile = this.store.selectedProfile();
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!profile || !file) return;
    this.store.uploadPhoto(profile, file);
  }

  private toNumber(level: SensitivityLevel): number {
    switch (level) {
      case SensitivityLevel.LOW:
        return 1;
      case SensitivityLevel.MEDIUM:
        return 2;
      case SensitivityLevel.HIGH:
        return 3;
      case SensitivityLevel.VERY_HIGH:
        return 4;
    }
  }
}
