/**
 * Un cuidador invitado solo se conoce por su correo: el nombre visible sale de la parte
 * local ("javier.rios@email.com" -> "Javier Rios").
 */
export function nameFromEmail(email: string): string {
  return email
    .split('@')[0]
    .split(/[._-]+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

/** Iniciales de hasta dos palabras, para los avatares sin foto. */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
