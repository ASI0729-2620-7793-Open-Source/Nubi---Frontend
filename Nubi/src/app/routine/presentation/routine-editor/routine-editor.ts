import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChildStore } from '../../../profile/application/child.store';
import { ToastStore } from '../../../shared/application/toast.store';
import { apiErrorMessage } from '../../../shared/infrastructure/api-error';
import { ProgressRing } from '../../../shared/presentation/charts/progress-ring';
import { ROUTINE_ICONS, RoutineStep, RoutineStepForm, shortTime } from '../../domain/model/routine-step';
import { RoutineApi } from '../../infrastructure/routine-api';
import { TranslatePipe } from '@ngx-translate/core';
import { t } from '../../../shared/infrastructure/i18n-bridge';
import { ServerTextPipe } from '../../../shared/presentation/server-text.pipe';

/**
 * Rutina visual del niño. Anticipar lo que viene reduce la ansiedad: cada paso tiene un ícono
 * grande, una hora opcional y se marca como hecho (el niño también puede hacerlo en su modo).
 */
@Component({
  selector: 'app-routine-editor',
  imports: [FormsModule, RouterLink, ProgressRing, TranslatePipe, ServerTextPipe],
  templateUrl: './routine-editor.html',
  styleUrl: './routine-editor.css',
})
export class RoutineEditor implements OnInit {
  private readonly api = inject(RoutineApi);
  private readonly toast = inject(ToastStore);
  protected readonly childStore = inject(ChildStore);

  protected readonly icons = ROUTINE_ICONS;
  protected readonly shortTime = shortTime;
  protected readonly steps = signal<RoutineStep[]>([]);
  protected readonly loading = signal(true);
  protected readonly editing = signal<RoutineStep | 'new' | null>(null);
  protected readonly saving = signal(false);
  protected form: RoutineStepForm = { title: '', icon: '⭐', scheduledTime: null };

  protected readonly done = computed(() => this.steps().filter((step) => step.completedToday).length);
  protected readonly share = computed(() => (this.steps().length ? this.done() / this.steps().length : 0));

  private get childId(): number {
    return this.childStore.childId()!;
  }

  ngOnInit(): void {
    this.api.steps(this.childId).subscribe({
      next: (steps) => {
        this.steps.set(steps);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }

  toggle(step: RoutineStep): void {
    this.api.complete(this.childId, step.id, !step.completedToday).subscribe({
      next: (updated) => this.replace(updated),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  openNew(): void {
    this.form = { title: '', icon: '⭐', scheduledTime: null };
    this.editing.set('new');
  }

  openEdit(step: RoutineStep): void {
    this.form = { title: step.title, icon: step.icon, scheduledTime: shortTime(step.scheduledTime) || null };
    this.editing.set(step);
  }

  save(): void {
    const target = this.editing();
    if (!target) return;
    if (!this.form.title.trim()) {
      this.toast.error(t('routineEditor.ponleUnNombreCorto'));
      return;
    }
    const body: RoutineStepForm = { ...this.form, scheduledTime: this.form.scheduledTime || null };
    this.saving.set(true);
    const request = target === 'new' ? this.api.add(this.childId, body) : this.api.update(this.childId, target.id, body);
    request.subscribe({
      next: (saved) => {
        if (target === 'new') {
          this.steps.update((list) => [...list, saved]);
          this.toast.ok(t('routineEditor.seSumoASu', { p0: saved.icon, p1: saved.title }));
        } else {
          this.replace(saved);
          this.toast.ok(t('routineEditor.pasoActualizado'));
        }
        this.saving.set(false);
        this.editing.set(null);
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.error(apiErrorMessage(error));
      },
    });
  }

  remove(step: RoutineStep): void {
    if (!confirm(t('routineEditor.quitarDeLaRutina', { p0: step.title }))) return;
    this.api.remove(this.childId, step.id).subscribe({
      next: () => {
        this.steps.update((list) => list.filter((item) => item.id !== step.id));
        this.editing.set(null);
        this.toast.ok(t('routineEditor.pasoQuitado'));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  move(index: number, delta: number): void {
    const list = [...this.steps()];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.steps.set(list);
    this.api.reorder(this.childId, list.map((step) => step.id)).subscribe({
      next: (ordered) => this.steps.set(ordered),
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  /** Ordena los pasos por su hora (los que no tienen hora quedan al final). */
  sortByTime(): void {
    const sorted = [...this.steps()].sort((a, b) => (a.scheduledTime ?? '99').localeCompare(b.scheduledTime ?? '99'));
    this.api.reorder(this.childId, sorted.map((step) => step.id)).subscribe({
      next: (ordered) => {
        this.steps.set(ordered);
        this.toast.ok(t('routineEditor.ordenamosLosPasosPor'));
      },
      error: (error) => this.toast.error(apiErrorMessage(error)),
    });
  }

  private replace(step: RoutineStep): void {
    this.steps.update((list) => list.map((item) => (item.id === step.id ? step : item)));
  }
}
