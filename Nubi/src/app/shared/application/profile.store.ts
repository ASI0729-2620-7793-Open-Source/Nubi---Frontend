import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { Caregiver } from '../domain/model/caregiver.entity';
import { ProfileSummary } from '../domain/model/profile-summary.entity';
import { CaregiverApi } from '../infrastructure/caregiver-api';
import { ProfileApi } from '../infrastructure/profile-api';

/** En esta entrega la sesión del cuidador se simula: no hay backend de identidad. */
const SIGNED_IN_CAREGIVER_ID = 1;

/** El perfil en uso se recuerda en el navegador para mantenerlo al recargar la página. */
const ACTIVE_PROFILE_KEY = 'nubi.activeProfileId';

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

    // Con la API vacía (sin cuidador ni perfiles) no es caída: solo sin datos.
    // El aviso sale únicamente si AMBAS peticiones fallan (API inalcanzable).
    forkJoin({
      caregiver: this.caregiverApi.getById(SIGNED_IN_CAREGIVER_ID).pipe(catchError(() => of(null))),
      profiles: this.profileApi.getAll().pipe(catchError(() => of(null))),
    })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: ({ caregiver, profiles }) => {
          if (caregiver === null && profiles === null) {
            this.apiDownState.set(true);
            return;
          }
          const inCare = (profiles ?? []).filter(
            (profile) => caregiver?.profileIds.includes(profile.id) ?? false,
          );
          this.caregiverState.set(caregiver);
          this.profilesState.set(inCare);
          const preferred = this.selectedIdState() ?? this.rememberedProfileId();
          const active = inCare.find((profile) => profile.id === preferred) ?? inCare[0];
          this.selectedIdState.set(active?.id ?? null);
        },
        error: () => this.apiDownState.set(true),
      });
  }

  /** Comando "Usar perfil": lo vuelve el perfil activo de toda la aplicación. */
  use(profileId: number): void {
    this.selectedIdState.set(profileId);
    localStorage.setItem(ACTIVE_PROFILE_KEY, String(profileId));
    this.assign(profileId);
  }

  /** Deja un perfil a cargo del cuidador, para que lo vean todos los Bounded Contexts. */
  assign(profileId: number): void {
    const caregiver = this.caregiverState();
    if (!caregiver || caregiver.profileIds.includes(profileId)) {
      this.load();
      return;
    }
    this.caregiverApi
      .assignProfiles(caregiver.id, [...caregiver.profileIds, profileId])
      .subscribe({
        next: (updated) => {
          this.caregiverState.set(updated);
          this.load();
        },
        error: () => this.load(),
      });
  }

  private rememberedProfileId(): number | null {
    const stored = localStorage.getItem(ACTIVE_PROFILE_KEY);
    return stored === null ? null : Number(stored);
  }
}
