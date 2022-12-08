import * as Helpers from "./helpers";

function wrapEventInNamespace(eventName) {
  return PostMessage._NAMESPACE + "_" + eventName;
}

function PostMessage(window) {
  this.eventObject = Helpers.addEventObject(this, wrapEventInNamespace);
  this.linkedWindow = window;

  window.addEventListener &&
    window.addEventListener(
      "message",
      function (event) {
        if (event.source !== this.linkedWindow) {
          return;
        }

        const message = {};
        if (typeof event.data === "string" && JSON !== undefined) {
          try {
            message = JSON.parse(event.data);
          } catch (e) {}
        }

        if (message.command) {
          this.eventObject.trigger(message.command, message.data);
        }
      }.bind(this)
    );
}

/** Private Members **/
PostMessage.prototype.eventObject = null;
PostMessage.prototype.linkedWindow = null;

/** Public Members **/
PostMessage.prototype.send = function (command, data, targetOrigin) {
  if (data === undefined) {
    data = {};
  }

  if (targetOrigin === undefined) {
    targetOrigin = "*";
  }

  if (
    !this.linkedWindow ||
    this.linkedWindow.postMessage === undefined ||
    window.JSON === undefined
  ) {
    return false;
  }

  try {
    this.linkedWindow.postMessage(
      JSON.stringify({ data: data, command: command }),
      targetOrigin
    );
  } catch (e) {}

  return true;
};

PostMessage.prototype.on = function (event, handle, options) {
  this.eventObject.on(event, handle, options);
};

PostMessage.prototype.off = function (event, handle, options) {
  this.eventObject.off(event, handle, options);
};

PostMessage._NAMESPACE = "POST_MESSAGE";

export default PostMessage;
