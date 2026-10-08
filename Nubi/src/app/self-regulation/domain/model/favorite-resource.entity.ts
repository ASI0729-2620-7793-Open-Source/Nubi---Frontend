/** Recurso de calma que un perfil marcó como favorito. */
export class FavoriteResource {
  constructor(
    public readonly id: number,
    public readonly profileId: number,
    public readonly resourceId: number,
    public readonly markedAt: Date,
  ) {}
}
