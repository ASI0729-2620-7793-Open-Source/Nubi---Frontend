import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, Signal, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import { ProfileStore } from '../../../application/profile.store';
import { Sidenav } from '../sidenav/sidenav';
import { Toolbar } from '../toolbar/toolbar';

/** Breakpoints de la sección 4.1.2.6 del informe (Diseño responsivo). */
const MOBILE_QUERY = '(max-width: 768px)';
const DESKTOP_QUERY = '(min-width: 1025px)';

/**
 * Estructura común de las vistas con navegación:
 * - Desktop (≥ 1025 px): barra lateral fija, como en los mock-ups.
 * - Tablet (769–1024 px): navegación superior completa.
 * - Mobile (≤ 768 px): header compacto con menú hamburguesa y Modo SOS siempre visible.
 */
@Component({
  imports: [
    MatIconModule,
    MatSidenavModule,
    RouterLink,
    RouterOutlet,
    TranslatePipe,
    Sidenav,
    Toolbar,
  ],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly profileStore = inject(ProfileStore);

  private readonly menu = viewChild(MatSidenav);
  private readonly scrollContainer = viewChild(MatSidenavContent);

  protected readonly isDesktop = this.matches(DESKTOP_QUERY);
  protected readonly isMobile = this.matches(MOBILE_QUERY);

  constructor() {
    // El contenido se desplaza dentro del sidenav: cada vista nueva empieza desde arriba
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.scrollContainer()?.scrollTo({ top: 0 }));
  }

  protected openMenu(): void {
    this.menu()?.open();
  }

  protected closeMenu(): void {
    if (!this.isDesktop()) {
      this.menu()?.close();
    }
  }

  protected retry(): void {
    this.profileStore.load();
  }

  private matches(query: string): Signal<boolean> {
    return toSignal(this.breakpointObserver.observe(query).pipe(map((state) => state.matches)), {
      initialValue: this.breakpointObserver.isMatched(query),
    });
  }
}
