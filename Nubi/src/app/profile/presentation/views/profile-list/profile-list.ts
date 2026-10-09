import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ProfileStore as ActiveProfileStore } from '../../../../shared/application/profile.store';
import { ProfileStore } from '../../../application/profile.store';

/**
 * Lista de perfiles del cuidador (DataView con tarjetas y botón crear).
 * Crear abre el formulario de /perfil/nuevo (US-01); sin API muestra el mock.
 */
@Component({
  imports: [
    RouterLink,
    TranslatePipe,
    AvatarModule,
    ButtonModule,
    DataViewModule,
    MessageModule,
    SkeletonModule,
    TagModule,
  ],
  selector: 'app-profile-list',
  styleUrl: './profile-list.css',
  templateUrl: './profile-list.html',
})
export class ProfileList {
  protected readonly store = inject(ProfileStore);
  /** Perfil en uso: el que muestran Inicio y el resto de la aplicación. */
  protected readonly activeProfiles = inject(ActiveProfileStore);
  protected readonly hasProfiles = computed(() => this.store.profiles().length > 0);

  constructor() {
    if (this.store.profiles().length === 0) this.store.load();
  }
}
