import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class BasicNeeds implements BaseEntity {
  #id: number;
  #MenuOption: string;

  constructor(data: { id: number; MenuOption: string }) {
    this.#id = data.id;
    this.#MenuOption = data.MenuOption;
  }

  get id(): number {
    return this.#id;
  }

  set id(value: number) {
    this.#id = value;
  }

  get MenuOption(): string {
    return this.#MenuOption;
  }

  set MenuOption(value: string) {
    this.#MenuOption = value;
  }
}
