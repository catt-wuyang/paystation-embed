import * as Helpers from "./helpers";
import App from "./app";

let instance;

const getInstance = function () {
  if (!instance) {
    instance = new App();
  }
  return instance;
};

const widget = Object.assign(
  Helpers.zipObject(
    ["init", "open", "close", "on", "off", "sendMessage", "onMessage"].map(
      function (methodName) {
        const app = getInstance();
        return [
          methodName,
          function () {
            return app[methodName].apply(app, arguments);
          },
        ];
      }
    )
  ),
  {
    eventTypes: App.eventTypes,
  }
);

export default widget;
