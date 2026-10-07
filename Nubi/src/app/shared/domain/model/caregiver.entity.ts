/** Cuidador con la sesión iniciada, tal como aparece al pie de la barra lateral. */
export class Caregiver {
  constructor(
    public readonly id: number,
    public readonly fullName: string,
    public readonly role: string,
    public readonly avatarUrl: string,
    public readonly profileIds: number[],
  ) {}
}
