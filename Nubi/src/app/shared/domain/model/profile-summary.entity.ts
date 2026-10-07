/**
 * Copia de solo lectura del perfil que administra Perfil y Personalización.
 * Los Bounded Contexts la usan para saber de quién se trata la vista (por ejemplo,
 * "ayudar a Diana a recuperar la calma") y nunca la modifican.
 */
export class ProfileSummary {
  constructor(
    public readonly id: number,
    public readonly fullName: string,
    public readonly age: number,
  ) {}

  get shortName(): string {
    return this.fullName.split(' ')[0] ?? this.fullName;
  }
}
