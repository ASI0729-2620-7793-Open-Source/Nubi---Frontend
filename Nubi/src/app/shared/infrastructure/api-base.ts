import { environment } from '../../../environments/environment';

/** Raíz de la API REST del backend (Spring Boot): /api/v1. */
export const API_BASE = environment.apiBaseUrl;

/** Cabecera con la que el backend identifica a la cuenta que inicia sesión. */
export const ACCOUNT_HEADER = 'X-Account-Id';

/** Clave del almacenamiento local donde vive la sesión. */
export const SESSION_KEY = 'nubi.session';
