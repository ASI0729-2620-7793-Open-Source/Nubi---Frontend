import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProfileStore as ActiveProfileStore } from '../../../../shared/application/profile.store';
import { ProfileStore } from '../../../application/profile.store';
import { ConditionType } from '../../../domain/model/profile.enums';
import { SensoryProfile } from '../../../domain/model/sensory-profile.vo';
import { DeclaredDiagnosis } from '../../../domain/model/declared-diagnosis.vo';

/**
 * Lista de perfiles del cuidador (DataView con tarjetas y botón crear).
 * Crear exige nombre, edad y condición (US-01); sin API muestra el mock.
 */
@Component({
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    AvatarModule,
    ButtonModule,
    DataViewModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    SkeletonModule,
    TagModule,
    ToastModule,
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

  protected readonly open = signal(false);
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly age = signal<number | null>(null);
  protected readonly condition = signal<ConditionType>(ConditionType.ASD);
  protected readonly conditionOptions = [
    { label: 'TEA', value: ConditionType.ASD },
    { label: 'TDAH', value: ConditionType.ADHD },
    { label: 'TOC', value: ConditionType.OCD },
    { label: 'Otra', value: ConditionType.OTHER },
  ];

  constructor() {
    if (this.store.profiles().length === 0) this.store.load();
  }

  protected create(): void {
    if (!this.firstName().trim() || !this.lastName().trim() || this.age() === null) return;
    this.store.create({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      age: this.age() ?? 0,
      sensoryProfile: SensoryProfile.withDefaultValues(),
      diagnosis: new DeclaredDiagnosis(this.condition(), null, null, null, null),
    });
    this.open.set(false);
    this.firstName.set('');
    this.lastName.set('');
    this.age.set(null);
  }
}
