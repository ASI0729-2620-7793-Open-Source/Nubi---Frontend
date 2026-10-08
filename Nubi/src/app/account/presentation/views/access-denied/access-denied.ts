import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

/** Página amable de acceso denegado con enlace de regreso (regla 1). */
@Component({
  imports: [RouterLink, ButtonModule, MessageModule],
  selector: 'app-access-denied',
  template: `<div class="page">
    <p-message severity="warn">No tienes acceso a esta sección.</p-message>
    <a routerLink="/perfil"><p-button label="Volver a Perfiles"></p-button></a>
  </div>`,
})
export class AccessDenied {}

