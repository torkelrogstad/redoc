import { observable, action } from 'mobx';
import { OperationModel } from '.';

class InteractiveStore {
  /**
   * If the user is trying out the API, this is set to the operation
   */
  @observable
  active?: OperationModel;

  @action
  clearActive = () => {
    this.currentParameters = {};
    this.active = undefined;
  };

  @action
  setActive = (operation: OperationModel) => {
    this.clearActive();

    this.active = operation;
  };

  /**
   * Current query parameters
   */
  @observable
  currentParameters: { [key: string]: string | undefined } = {};

  @action
  addParameter = (parameter: string, value: string) => {
    this.currentParameters[parameter] = value;
    console.warn('added parameters:', this.currentParameters);
  };
}
export const interactiveStore = new InteractiveStore();
