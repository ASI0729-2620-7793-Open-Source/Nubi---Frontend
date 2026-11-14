/** Cuenta del cuidador que inicia sesión (Bounded Context IAM del backend). */
export interface UserAccount {
  id: number;
  email: string;
  fullName: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest extends SignInRequest {
  fullName: string;
}
