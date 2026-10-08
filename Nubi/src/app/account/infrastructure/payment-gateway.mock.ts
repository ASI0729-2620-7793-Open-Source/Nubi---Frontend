import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaymentStatus } from '../domain/model/account.enums';
import { Payment } from '../domain/model/payment.entity';

/**
 * Puerto PaymentGateway mockeado: cada intento aprueba o rechaza
 * de forma alternada para mostrar PENDING, PAID y FAILED (regla 5).
 */
@Injectable({ providedIn: 'root' })
export class PaymentGatewayMock {
  private attempts = 0;

  charge(subscriptionId: number, amount: number, currency: string): Observable<Payment> {
    this.attempts += 1;
    const approved = this.attempts % 2 === 1;
    return of(
      new Payment(
        Date.now(),
        subscriptionId,
        amount,
        currency,
        approved ? PaymentStatus.PAID : PaymentStatus.FAILED,
        approved ? `GW-${this.attempts}` : null,
        approved ? new Date() : null,
      ),
    );
  }
}
