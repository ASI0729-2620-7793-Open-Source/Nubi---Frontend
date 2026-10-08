import { SensoryProfileSnapshot } from './sensory-profile-snapshot';

/**
 * Value Object. Datos del perfil que el Modo SOS necesita para elegir a quién acompañar:
 * nombre, edad, diagnóstico y perfil sensorial. Los administra Perfil y Personalización.
 */
export class SosProfile {
  constructor(
    public readonly id: number,
    public readonly fullName: string,
    public readonly age: number,
    public readonly diagnosis: string,
    public readonly sensory: SensoryProfileSnapshot,
  ) {}

  get shortName(): string {
    return this.fullName.split(' ')[0] ?? this.fullName;
  }

  /** "Diana Ríos" -> "DR" */
  get initials(): string {
    return this.fullName
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}
