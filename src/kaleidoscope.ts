export default class Kaleidoscope {
  constructor() {
    console.log('init');
  }

  public greet() {
    console.log('hello');
  }
}

interface IWindow extends Window {
  Kaleidoscope: any;
}
declare let window: IWindow;

(() => {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Kaleidoscope;
  } else {
    window.Kaleidoscope = Kaleidoscope;
  }
})();
