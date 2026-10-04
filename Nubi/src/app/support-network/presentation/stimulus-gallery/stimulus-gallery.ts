import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ProfileStore } from '../../../shared/application/profile.store';
import { CalmSessionStore } from '../../application/calm-session.store';
import { CalmingResourceStore } from '../../application/calming-resource.store';
import { ResourceType } from '../../domain/model/calming-resource.enums';

/**
 * Galería de estímulos de Autocuidado (sección 4.4.3): recursos de calma filtrables por
 * tipo (abre con el que conviene según el perfil sensorial) y marcables como favoritos.
 */
@Component({
  selector: 'app-stimulus-gallery',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './stimulus-gallery.html',
  styleUrl: './stimulus-gallery.css',
})
export class StimulusGallery {
  protected readonly resourceStore = inject(CalmingResourceStore);
  protected readonly sessionStore = inject(CalmSessionStore);
  protected readonly profileStore = inject(ProfileStore);

  protected readonly filters = [
    { type: null, labelKey: 'gallery.all' },
    { type: ResourceType.VISUAL, labelKey: 'gallery.visual' },
    { type: ResourceType.AUDITORY, labelKey: 'gallery.auditory' },
  ];

  /** Aviso contextual que explica por qué la galería abre con los estímulos visuales. */
  protected readonly noticeKey = computed(() => {
    const sensoryProfile = this.resourceStore.sensoryProfile();
    if (!sensoryProfile) return null;

    const auditory = sensoryProfile.hasHighAuditorySensitivity();
    if (auditory && sensoryProfile.prioritizeVisuals) return 'gallery.noticeAuditoryAndVisual';
    if (auditory) return 'gallery.noticeAuditory';
    if (sensoryProfile.prioritizeVisuals) return 'gallery.noticeVisual';
    return null;
  });
}
