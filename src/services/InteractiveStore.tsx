import { observable, action } from 'mobx';

class InteractiveStore {
  /** Whether or not the user is trying out the API */
  active = observable.box(false);

  @action
  toggleActive = () => {
    const active = this.active.get();
    if (active) {
      this.currentParameters = {};
    }
    this.active.set(!active);
  };

  /**
   * Current query parameters
   */
  @observable
  currentParameters: { [key: string]: string | undefined } = {};

  @action
  addParameter = (parameter: string, value: string) => {
    this.currentParameters[parameter] = value;
  };
}
export const interactiveStore = new InteractiveStore();
