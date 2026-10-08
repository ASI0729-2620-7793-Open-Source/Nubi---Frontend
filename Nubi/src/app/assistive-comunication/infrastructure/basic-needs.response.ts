import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface BasicNeedsResource extends BaseResource {
  /**
   * The unique identifier for the category.
   */
  id: number;

  MenuOption: string;
}

/**
 * Response envelope for category collection queries.
 */
export interface BasicNeedsResponse extends BaseResponse {

  BasicNeeds: BasicNeedsResource[];
}
