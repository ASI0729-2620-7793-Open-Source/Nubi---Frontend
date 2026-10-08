import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupportTicket } from '../domain/model/support-ticket.entity';
import { AccountAssembler } from './account-assembler';
import { SupportTicketRequest, SupportTicketResource } from './account-resources';

/**
 * Fachada HTTP del SupportTicketController (reportIssue del diagrama)
 * más supuestos agrupados: listar tickets de la cuenta y cerrar (close).
 */
@Injectable({ providedIn: 'root' })
export class SupportApiEndpoint {
  private readonly http = inject(HttpClient);
  private readonly assembler = new AccountAssembler();
  private readonly base = `${environment.apiBaseUrl}${environment.ticketsEndpoint}`;

  /** reportIssue(accountId, SupportTicketRequest) del diagrama. */
  reportIssue(accountId: number, request: SupportTicketRequest): Observable<SupportTicket> {
    return this.http
      .post<SupportTicketResource>(this.base, { accountId, ...request, status: 'OPEN' })
      .pipe(map((resource) => this.assembler.toTicket(resource)));
  }

  /** SUPUESTO: GET /tickets?accountId=:id */
  listByAccount(accountId: number): Observable<SupportTicket[]> {
    return this.http
      .get<SupportTicketResource[]>(`${this.base}?accountId=${accountId}`)
      .pipe(map((resources) => resources.map((resource) => this.assembler.toTicket(resource))));
  }

  /** SUPUESTO: POST /tickets/:id/close -> close() */
  closeTicket(ticket: SupportTicket): Observable<SupportTicket> {
    return this.http
      .post<SupportTicketResource>(`${this.base}/${ticket.id}/close`, {})
      .pipe(map((resource) => this.assembler.toTicket(resource)));
  }
}
