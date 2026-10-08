
export interface BasicNeedsResource {
  /**
   * The unique identifier for the category.
   */
  id: number;
  MenuOption: string;
}

/**
 * Response envelope for category collection queries.
 */
export interface BasicNeedsResponse {

  BasicNeeds: BasicNeedsResource[];
}
