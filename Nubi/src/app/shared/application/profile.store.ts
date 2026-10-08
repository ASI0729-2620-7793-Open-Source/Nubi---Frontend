import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { Caregiver } from '../domain/model/caregiver.entity';
import { ProfileSummary } from '../domain/model/profile-summary.entity';
import { CaregiverApi } from '../infrastructure/caregiver-api';
import { ProfileApi } from '../infrastructure/profile-api';

/** En esta entrega la sesión del cuidador se simula: no hay backend de identidad. */
const SIGNED_IN_CAREGIVER_ID = 1;

/**
 * Cuidador con la sesión iniciada y perfil a cargo. Es compartido porque todos los
 * Bounded Contexts necesitan saber de quién es la vista.
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly profileApi = inject(ProfileApi);
  private readonly caregiverApi = inject(CaregiverApi);

  private readonly caregiverState = signal<Caregiver | null>(null);
  private readonly profilesState = signal<ProfileSummary[]>([]);
  private readonly selectedIdState = signal<number | null>(null);
  private readonly loadingState = signal(false);
  private readonly apiDownState = signal(false);

  readonly caregiver = computed(() => this.caregiverState());
  readonly loading = computed(() => this.loadingState());
  /** La API falsa no responde: la app lo avisa en pantalla en vez de quedarse vacía. */
  readonly apiDown = computed(() => this.apiDownState());
  readonly selectedProfile = computed(
    () => this.profilesState().find((profile) => profile.id === this.selectedIdState()) ?? null,
  );
  readonly selectedProfileId = computed(() => this.selectedIdState());

  load(): void {
    this.loadingState.set(true);
    this.apiDownState.set(false);

    forkJoin({
      caregiver: this.caregiverApi.getById(SIGNED_IN_CAREGIVER_ID),
      profiles: this.profileApi.getAll(),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ caregiver, profiles }) => {
          const inCare = profiles.filter((profile) => caregiver.profileIds.includes(profile.id));
          this.caregiverState.set(caregiver);
          this.profilesState.set(inCare);
          if (this.selectedIdState() === null && inCare.length > 0) {
            this.selectedIdState.set(inCare[0].id);
          }
        },
        error: () => this.apiDownState.set(true),
      });
  }
}
