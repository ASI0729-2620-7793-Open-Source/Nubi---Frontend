import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { BasicNeeds } from '../domain/model/basic.needs';
import { BasicNeedsResource, BasicNeedsResponse } from './basic-needs.response';

/**
 * Maps category entities to and from API resources.
 */
export class BasicNeedsAssembler implements BaseAssembler<
  BasicNeeds,
  BasicNeedsResource,
  BasicNeedsResponse
> {
  /**
   * Converts a CategoriesResponse to an array of Category entities.
   * @param response - The API response containing categories.
   * @returns An array of Category entities.
   */
  toEntitiesFromResponse = (response: BasicNeedsResponse): BasicNeeds[] =>
    response.BasicNeeds.map((resource) =>
      this.toEntityFromResource(resource as BasicNeedsResource),
    );

  /**
   * Converts a CategoryResource to a Category entity.
   * @param resource - The resource to convert.
   * @returns The converted Category entity.
   */
  toEntityFromResource = (resource: BasicNeedsResource): BasicNeeds =>
    new BasicNeeds({
      id: resource.id,
      MenuOption: resource.MenuOption,
    });

  /**
   * Converts a Category entity to a CategoryResource.
   * @param entity - The entity to convert.
   * @returns The converted CategoryResource.
   */
  toResourceFromEntity = (entity: BasicNeeds): BasicNeedsResource =>
    ({
      id: entity.id,
      MenuOption: entity.MenuOption,
    }) as BasicNeedsResource;
}
