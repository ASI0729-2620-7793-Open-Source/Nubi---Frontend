import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { SessionStore } from '../../../iam/application/session.store';
import { ToastStore } from '../../../shared/application/toast.store';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { ChildStore } from '../../application/child.store';
import {
  COMMUNICATION_NEEDS,
  ChildForm,
  GENDERS,
  SensoryProfile,
} from '../../domain/model/child-profile';
import { ProfileApi } from '../../infrastructure/profile-api';
import { SensoryEditor } from '../components/sensory-editor/sensory-editor';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';
import { LanguageSwitch } from '../../../shared/presentation/language-switch/language-switch';

/**
 * Registro del único niño de la cuenta, en tres pasos cortos:
 * quién es, cómo siente el mundo y listo.
 */
@Component({
  selector: 'app-onboarding',
  imports: [FormsModule, SensoryEditor, TranslatePipe, LanguageSwitch],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  private readonly api = inject(ProfileApi);
  private readonly childStore = inject(ChildStore);
  private readonly toast = inject(ToastStore);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionStore);

  protected readonly genders = GENDERS;
  protected readonly needs = COMMUNICATION_NEEDS;
  protected readonly step = signal(1);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected form: ChildForm = {
    firstName: '',
    lastName: '',
    nickname: '',
    age: 6,
    gender: 'MALE',
    communicativeNeed: 'PICTOGRAMS',
  };

  protected readonly sensory = signal<SensoryProfile>({
    auditory: 'MEDIUM',
    visual: 'MEDIUM',
    tactile: 'MEDIUM',
    lowStimulationEnabled: false,
    prioritizeVisuals: true,
    confirmAudio: false,
  });

  next(): void {
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) {
      this.error.set(t('onboarding.escribeElNombreY'));
      return;
    }
    if (!this.form.age || this.form.age < 1 || this.form.age > 18) {
      this.error.set(t('onboarding.laEdadDebeEstar'));
      return;
    }
    this.error.set(null);
    this.step.set(2);
  }

  finish(): void {
    this.busy.set(true);
    this.error.set(null);
    const email = this.session.user()?.email ?? '';
    this.api
      .create({ ...this.form, nickname: this.form.nickname.trim() || this.form.firstName, primaryCaregiverEmail: email })
      .pipe(
        switchMap((child) =>
          this.api.updateSensory(child.id, this.sensory()).pipe(
            catchError(() => of(child.sensoryProfile)),
            switchMap((sensoryProfile) => of({ ...child, sensoryProfile: sensoryProfile ?? child.sensoryProfile })),
          ),
        ),
      )
      .subscribe({
        next: (child) => {
          this.childStore.set(child);
          this.step.set(3);
          this.busy.set(false);
        },
        error: (error) => {
          this.error.set(apiErrorMessage(error));
          this.busy.set(false);
        },
      });
  }

  go(path: string): void {
    this.toast.ok(t('onboarding.listoNubiYaConoce', { p0: this.childStore.name() }));
    void this.router.navigate([path]);
  }

  signOut(): void {
    this.session.signOut();
    void this.router.navigate(['/ingresar']);
  }
}
