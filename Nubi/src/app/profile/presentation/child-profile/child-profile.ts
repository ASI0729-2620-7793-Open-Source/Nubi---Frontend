import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionStore } from '../../../iam/application/session.store';
import { ToastStore } from '../../../shared/application/toast.store';
import { formatDate } from '../../../shared/domain/dates';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { ChildStore } from '../../application/child.store';
import {
  AVATARS,
  CAREGIVER_ROLES,
  COMMUNICATION_NEEDS,
  CaregiverRole,
  ChildForm,
  GENDERS,
  SensoryProfile,
  TrustedContact,
  avatarOf,
} from '../../domain/model/child-profile';
import { ProfileApi } from '../../infrastructure/profile-api';
import { SensoryEditor } from '../components/sensory-editor/sensory-editor';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';

type Tab = 'datos' | 'sentidos' | 'diagnostico' | 'red';

/** Ficha del niño: datos, perfil sensorial, diagnóstico de autismo y su red de cuidado. */
@Component({
  selector: 'app-child-profile',
  imports: [FormsModule, SensoryEditor, TranslatePipe],
  templateUrl: './child-profile.html',
  styleUrl: './child-profile.css',
})
export class ChildProfilePage implements OnInit {
  readonly tabParam = input<string>(undefined, { alias: 'tab' });

  private readonly api = inject(ProfileApi);
  private readonly toast = inject(ToastStore);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionStore);
  protected readonly childStore = inject(ChildStore);

  protected readonly tab = signal<Tab>('datos');
  protected readonly genders = GENDERS;
  protected readonly needs = COMMUNICATION_NEEDS;
  protected readonly roles = CAREGIVER_ROLES;
  protected readonly avatars = AVATARS;
  protected readonly avatarOf = avatarOf;
  protected readonly formatDate = formatDate;
  protected readonly saving = signal(false);

  protected form!: ChildForm;
  protected readonly sensory = signal<SensoryProfile>({
    auditory: 'MEDIUM',
    visual: 'MEDIUM',
    tactile: 'MEDIUM',
    lowStimulationEnabled: false,
    prioritizeVisuals: true,
    confirmAudio: false,
  });
  protected diagnosis = { diagnosedBy: '', diagnosisDate: '', professionalNotes: '' };
  protected invite: { email: string; role: CaregiverRole } = { email: '', role: 'CAREGIVER' };
  protected contact = { fullName: '', phone: '', email: '', relationship: '' };
  protected photoUrl = '';

  protected readonly child = computed(() => this.childStore.child()!);
  protected readonly isPrimary = computed(() =>
    this.child().caregivers.some((c) => c.role === 'PRIMARY' && c.accountId === this.session.user()?.id),
  );
  protected readonly activeCaregivers = computed(() => this.child().caregivers.filter((c) => c.status !== 'REVOKED'));
  protected readonly contacts = computed(() => [...this.child().trustedContacts].sort((a, b) => a.priorityOrder - b.priorityOrder));

  ngOnInit(): void {
    const tab = this.tabParam();
    if (tab === 'red' || tab === 'sentidos' || tab === 'diagnostico') this.tab.set(tab);
    this.reset();
  }

  private get id(): number {
    return this.child().id;
  }

  private reset(): void {
    const child = this.child();
    this.form = {
      firstName: child.firstName,
      lastName: child.lastName,
      nickname: child.nickname ?? '',
      age: child.age,
      gender: child.gender ?? 'PREFER_NOT_TO_SAY',
      communicativeNeed: child.communicativeNeed ?? 'PICTOGRAMS',
    };
    if (child.sensoryProfile) this.sensory.set(child.sensoryProfile);
    this.diagnosis = {
      diagnosedBy: child.diagnosis?.diagnosedBy ?? '',
      diagnosisDate: child.diagnosis?.diagnosisDate ?? '',
      professionalNotes: child.diagnosis?.professionalNotes ?? '',
    };
    this.photoUrl = /^https?:/.test(child.photoUrl ?? '') ? (child.photoUrl ?? '') : '';
  }

  saveData(): void {
    this.saving.set(true);
    this.api.update(this.id, this.form).subscribe({
      next: (child) => this.done(() => this.childStore.set(child), t('childProfile.saved')),
      error: (error) => this.fail(error),
    });
  }

  setAvatar(value: string): void {
    if (!value) return;
    this.api.updatePhoto(this.id, value).subscribe({
      next: (child) => {
        this.childStore.set(child);
        this.toast.ok(t('childProfile.nuevoAvatar'));
      },
      error: (error) => this.fail(error),
    });
  }

  saveSensory(): void {
    const sensory = this.sensory();
    this.saving.set(true);
    this.api.updateSensory(this.id, sensory).subscribe({
      next: (saved) =>
        this.done(() => this.childStore.patch({ sensoryProfile: saved }), t('childProfile.sensorySaved')),
      error: (error) => this.fail(error),
    });
  }

  saveDiagnosis(): void {
    this.saving.set(true);
    this.api
      .updateDiagnosis(this.id, {
        diagnosedBy: this.diagnosis.diagnosedBy.trim() || null,
        diagnosisDate: this.diagnosis.diagnosisDate || null,
        professionalNotes: this.diagnosis.professionalNotes.trim() || null,
      })
      .subscribe({
        next: (diagnosis) => this.done(() => this.childStore.patch({ diagnosis }), t('childProfile.diagnosisUpdated')),
        error: (error) => this.fail(error),
      });
  }

  inviteCaregiver(): void {
    if (!this.invite.email.trim()) return;
    this.api.inviteCaregiver(this.id, this.invite.email.trim(), this.invite.role).subscribe({
      next: (caregiver) => {
        this.childStore.patch({ caregivers: [...this.child().caregivers, caregiver] });
        this.toast.ok(t('childProfile.invitacionEnviadaA', { p0: caregiver.invitedEmail }));
        this.invite = { email: '', role: 'CAREGIVER' };
      },
      error: (error) => this.fail(error),
    });
  }

  revoke(caregiverId: number): void {
    if (!confirm(t('childProfile.quitarElAccesoDe'))) return;
    this.api.revokeCaregiver(this.id, caregiverId).subscribe({
      next: (updated) => {
        this.childStore.patch({ caregivers: this.child().caregivers.map((c) => (c.id === updated.id ? updated : c)) });
        this.toast.ok(t('childProfile.accesoRetirado'));
      },
      error: (error) => this.fail(error),
    });
  }

  addContact(): void {
    const { fullName, phone, email, relationship } = this.contact;
    if (!fullName.trim() || !phone.trim()) {
      this.toast.error(t('childProfile.elContactoNecesitaNombre'));
      return;
    }
    const priorityOrder = Math.max(0, ...this.child().trustedContacts.map((c) => c.priorityOrder)) + 1;
    this.api
      .linkContact(this.id, { fullName, phone, email: email || null, relationship: relationship || null, priorityOrder })
      .subscribe({
        next: (created) => {
          this.childStore.patch({ trustedContacts: [...this.child().trustedContacts, created] });
          this.contact = { fullName: '', phone: '', email: '', relationship: '' };
          this.toast.ok(t('childProfile.contactoAgregado'));
        },
        error: (error) => this.fail(error),
      });
  }

  moveContact(contact: TrustedContact, delta: number): void {
    const list = this.contacts().map((c) => c.id);
    const index = list.indexOf(contact.id);
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.api.reorderContacts(this.id, list).subscribe({
      next: (trustedContacts) => this.childStore.patch({ trustedContacts }),
      error: (error) => this.fail(error),
    });
  }

  removeContact(contact: TrustedContact): void {
    this.api.removeContact(this.id, contact.id).subscribe({
      next: (trustedContacts) => this.childStore.patch({ trustedContacts }),
      error: (error) => this.fail(error),
    });
  }

  archive(): void {
    const name = this.child().displayName;
    if (!confirm(t('childProfile.archivarElPerfilDe', { p0: name }))) return;
    this.api.archive(this.id).subscribe({
      next: () => {
        this.childStore.clear();
        this.toast.info(t('childProfile.elPerfilDeQuedo', { p0: name }));
        void this.router.navigate(['/bienvenida']);
      },
      error: (error) => this.fail(error),
    });
  }

  private done(apply: () => void, message: string): void {
    apply();
    this.saving.set(false);
    this.toast.ok(message);
  }

  private fail(error: unknown): void {
    this.saving.set(false);
    this.toast.error(apiErrorMessage(error));
  }
}
