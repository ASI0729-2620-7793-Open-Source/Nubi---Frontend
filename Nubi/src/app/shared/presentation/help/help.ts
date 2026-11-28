import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

/** Ayuda: objetivo de Nubi, Modo SOS, red de apoyo, respaldo profesional y preguntas frecuentes. */
@Component({
  selector: 'app-help',
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">{{ 'help.eyebrow' | translate }}</p>
          <h1>{{ 'help.title' | translate }}</h1>
          <p class="lead">{{ 'help.goal' | translate }}</p>
        </div>
      </header>
      @for (topic of topics; track topic) {
        <section class="card">
          <h2>{{ 'help.' + topic + '.q' | translate }}</h2>
          <p>{{ 'help.' + topic + '.a' | translate }}</p>
        </section>
      }
      <div class="row wrap">
        <a class="btn btn-primary" routerLink="/perfil" [queryParams]="{ tab: 'red' }">{{ 'help.openNetwork' | translate }}</a>
        <a class="btn btn-soft" routerLink="/seguimiento">{{ 'help.openSupport' | translate }}</a>
      </div>
    </div>
  `,
})
export class Help {
  protected readonly topics = ['sos', 'network', 'professional', 'answers', 'kidMode', 'archive'];
}
