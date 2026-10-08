import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Institution } from '../domain/model/institution.entity';
import { Account } from '../domain/model/account.entity';
import { AccountAssembler } from './account-assembler';
import { AccountResource, InstitutionResource } from './account-resources';

/**
 * ENDPOINT SUPUESTO (el diagrama no trae InstitutionController).
 * Agrupa aquí: obtener institución de una cuenta, actualizar datos,
 * listar miembros, agregar miembro (addMember), listar perfiles
 * gestionados y asignar perfil (assignProfile). Todo mockeado con
 * json-server para coordinar con backend.
 */
@Injectable({ providedIn: 'root' })
export class InstitutionApiEndpoint {
  private readonly http = inject(HttpClient);
  private readonly assembler = new AccountAssembler();
  private readonly base = `${environment.apiBaseUrl}${environment.institutionsEndpoint}`;

  /** SUPUESTO: GET /institutions?accountId=:id */
  getByAccount(accountId: number): Observable<Institution> {
    return this.http
      .get<InstitutionResource[]>(`${this.base}?accountId=${accountId}`)
      .pipe(map((resources) => this.assembler.toInstitution(resources[0])));
  }

  /** SUPUESTO: PUT /institutions/:id */
  update(institution: Institution): Observable<Institution> {
    const resource = this.assembler.fromInstitution(institution);
    return this.http
      .put<InstitutionResource>(`${this.base}/${institution.id}`, resource)
      .pipe(map((updated) => this.assembler.toInstitution(updated)));
  }

  /** SUPUESTO: GET /accounts?institutionId=:id */
  listMembers(institutionId: number): Observable<Account[]> {
    return this.http
      .get<AccountResource[]>(
        `${environment.apiBaseUrl}${environment.accountsEndpoint}?institutionId=${institutionId}`,
      )
      .pipe(map((resources) => resources.map((resource) => this.assembler.toAccount(resource))));
  }

  /** SUPUESTO: POST /institutions/:id/members { email } -> addMember */
  addMember(institution: Institution, account: Account): Observable<Institution> {
    return this.update(institution.addMember(account));
  }

  /** SUPUESTO: POST /institutions/:id/profiles { profileId } -> assignProfile */
  assignProfile(institution: Institution, profileId: number): Observable<Institution> {
    return this.update(institution.assignProfile(profileId));
  }
}
