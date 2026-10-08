import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

/**
 * Supuesto US-05: sin endpoint real de subida, se valida formato (jpg/png/webp)
 * y tamaño máximo de 2 MB en el frontend y se devuelve un ObjectURL local como
 * photoUrl temporal. Cuando exista POST /profiles/:id/photo se reemplaza aquí.
 */
export class PhotoValidationError extends Error {
  constructor(
    public readonly reason: 'type' | 'size',
    message: string,
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class PhotoUploadService {
  private static readonly MAX_BYTES = 2 * 1024 * 1024;
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  validate(file: File): void {
    if (!PhotoUploadService.ALLOWED_TYPES.includes(file.type)) {
      throw new PhotoValidationError('type', 'photo.errors.type');
    }
    if (file.size > PhotoUploadService.MAX_BYTES) {
      throw new PhotoValidationError('size', 'photo.errors.size');
    }
  }

  /** Mock de subida: valida y resuelve la URL local de la imagen. */
  upload(file: File): Observable<string> {
    try {
      this.validate(file);
    } catch (error) {
      return throwError(() => error);
    }
    return new Observable<string>((subscriber) => {
      subscriber.next(URL.createObjectURL(file));
      subscriber.complete();
    });
  }
}
