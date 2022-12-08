
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var XPayStationWidget = (function () {
  'use strict';

  function isEmpty(value) {
    return value === null || value === undefined;
  }

  function zipObject(props, values) {
    let index = -1,
      length = props ? props.length : 0,
      result = {};

    if (length && !values && !Array.isArray(props[0])) {
      values = [];
    }
    while (++index < length) {
      const key = props[index];
      if (values) {
        result[key] = values[index];
      } else if (key) {
        result[key[0]] = key[1];
      }
    }
    return result;
  }

  function param(a) {
    const s = [];

    const add = function (k, v) {
      v = typeof v === "function" ? v() : v;
      v = v === null ? "" : v === undefined ? "" : v;
      s[s.length] = encodeURIComponent(k) + "=" + encodeURIComponent(v);
    };

    const buildParams = function (prefix, obj) {
      let i, len, key;

      if (prefix) {
        if (Array.isArray(obj)) {
          for (i = 0, len = obj.length; i < len; i++) {
            buildParams(
              prefix +
                "[" +
                (typeof obj[i] === "object" && obj[i] ? i : "") +
                "]",
              obj[i]
            );
          }
        } else if (String(obj) === "[object Object]") {
          for (key in obj) {
            buildParams(prefix + "[" + key + "]", obj[key]);
          }
        } else {
          add(prefix, obj);
        }
      } else if (Array.isArray(obj)) {
        for (i = 0, len = obj.length; i < len; i++) {
          add(obj[i].name, obj[i].value);
        }
      } else {
        for (key in obj) {
          buildParams(key, obj[key]);
        }
      }
      return s;
    };

    return buildParams("", a).join("&");
  }

  function once(f) {
    return function () {
      f(arguments);
      f = function () {};
    };
  }

  function addEventObject(context, wrapEventInNamespace) {
    const dummyWrapper = function (event) {
      return event;
    };
    wrapEventInNamespace = wrapEventInNamespace || dummyWrapper;
    let eventsList = [];

    function isStringContainedSpace(str) {
      return / /.test(str);
    }

    return {
      trigger: function (eventName, data) {
        const eventInNamespace = wrapEventInNamespace(eventName);
        try {
          const event = new CustomEvent(eventInNamespace, { detail: data }); // Not working in IE
        } catch (e) {
          const event = document.createEvent("CustomEvent");
          event.initCustomEvent(eventInNamespace, true, true, data);
        }
        document.dispatchEvent(event);
      }.bind(context),
      on: function (eventName, handle, options) {
        function addEvent(eventName, handle, options) {
          const eventInNamespace = wrapEventInNamespace(eventName);
          document.addEventListener(eventInNamespace, handle, options);
          eventsList.push({
            name: eventInNamespace,
            handle: handle,
            options: options,
          });
        }

        if (isStringContainedSpace(eventName)) {
          const events = eventName.split(" ");
          events.forEach(function (parsedEventName) {
            addEvent(parsedEventName, handle, options);
          });
        } else {
          addEvent(eventName, handle, options);
        }
      }.bind(context),

      off: function (eventName, handle, options) {
        const offAllEvents = !eventName && !handle && !options;

        if (offAllEvents) {
          eventsList.forEach(function (event) {
            document.removeEventListener(event.name, event.handle, event.options);
          });
          return;
        }

        function removeEvent(eventName, handle, options) {
          const eventInNamespace = wrapEventInNamespace(eventName);
          document.removeEventListener(eventInNamespace, handle, options);
          eventsList = eventsList.filter(function (event) {
            return event.name !== eventInNamespace;
          });
        }

        if (isStringContainedSpace(eventName)) {
          const events = eventName.split(" ");
          events.forEach(function (parsedEventName) {
            removeEvent(parsedEventName, handle, options);
          });
        } else {
          removeEvent(eventName, handle, options);
        }
      }.bind(context),
    };
  }

  function wrapEventInNamespace$2(eventName) {
    return PostMessage._NAMESPACE + "_" + eventName;
  }

  function PostMessage(window) {
    this.eventObject = addEventObject(this, wrapEventInNamespace$2);
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

  var version = "1.2.8";

  // import "./styles/lightBox.scss";

  function LightBox(isMobile) {
    this.eventObject = addEventObject(this, wrapEventInNamespace$1);
    this.options = isMobile ? DEFAULT_OPTIONS_MOBILE : DEFAULT_OPTIONS$1;
    this.message = null;
  }

  const CLASS_PREFIX = "xpaystation-widget-lightbox";
  const COMMON_OPTIONS = {
    zIndex: 1000,
    overlayOpacity: ".6",
    overlayBackground: "#000000",
    contentBackground: "#ffffff",
    closeByKeyboard: true,
    closeByClick: true,
    modal: false,
    spinner: "xsolla",
    spinnerColor: null,
    spinnerUrl: null,
    spinnerRotationPeriod: 0,
  };
  const DEFAULT_OPTIONS$1 = Object.assign({}, COMMON_OPTIONS, {
    width: null,
    height: "100%",
    contentMargin: "10px",
  });
  const DEFAULT_OPTIONS_MOBILE = Object.assign({}, COMMON_OPTIONS, {
    width: "100%",
    height: "100%",
    contentMargin: "0px",
  });

  const SPINNERS = {
    //   xsolla: xsollaLogo,
    //   round: roundLogo,
    xsolla: "",
    round: "",
    none: "",
  };

  const MIN_PS_DIMENSIONS = {
    height: 500,
    width: 600,
  };

  const handleKeyupEventName = wrapEventInNamespace$1("keyup");
  const handleResizeEventName = wrapEventInNamespace$1("resize");

  const handleGlobalKeyup = function (event) {
    const clickEvent = document.createEvent("Event");
    clickEvent.initEvent(handleKeyupEventName, false, true);
    clickEvent.sourceEvent = event;

    document.body.dispatchEvent(clickEvent);
  };

  const handleSpecificKeyup = function (event) {
    if (event.sourceEvent.which == 27) {
      this.closeFrame();
    }
  };

  const handleGlobalResize = function () {
    const resizeEvent = document.createEvent("Event");
    resizeEvent.initEvent(handleResizeEventName, false, true);

    window.dispatchEvent(resizeEvent);
  };

  function wrapEventInNamespace$1(eventName) {
    return LightBox._NAMESPACE + "_" + eventName;
  }

  /** Private Members **/
  LightBox.prototype.triggerEvent = function () {
    this.eventObject.trigger.apply(this.eventObject, arguments);
  };

  LightBox.prototype.measureScrollbar = function () {
    // thx walsh: https://davidwalsh.name/detect-scrollbar-width
    const scrollDiv = document.createElement("div");
    scrollDiv.classList.add("scrollbar-measure");
    scrollDiv.setAttribute(
      "style",
      "position: absolute;" +
        "top: -9999px" +
        "width: 50px" +
        "height: 50px" +
        "overflow: scroll"
    );

    document.body.appendChild(scrollDiv);

    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);

    return scrollbarWidth;
  };

  /** Public Members **/
  LightBox.prototype.openFrame = function (url, options) {
    this.options = Object.assign({}, this.options, options);
    const HandleBoundSpecificKeyup = handleSpecificKeyup.bind(this);
    options = this.options;

    const spinner =
      options.spinner === "custom" && !!options.spinnerUrl
        ? '<img class="spinner-custom" src="' +
          encodeURI(options.spinnerUrl) +
          '" />'
        : SPINNERS[options.spinner] || Object.values(SPINNERS)[0];

    const template = function (settings) {
      const host = document.createElement("div");
      host.className = settings.prefix;

      const overlay = document.createElement("div");
      overlay.className = settings.prefix + "-overlay";

      const content = document.createElement("div");
      content.className =
        settings.prefix + "-content" + " " + settings.prefix + "-content__hidden";

      const iframe = document.createElement("iframe");
      iframe.className = settings.prefix + "-content-iframe";
      iframe.src = settings.url;
      iframe.frameBorder = "0";
      iframe.allowFullscreen = true;

      const spinner = document.createElement("div");
      spinner.className = settings.prefix + "-spinner";
      spinner.innerHTML = settings.spinner;

      content.appendChild(iframe);

      host.appendChild(overlay);
      host.appendChild(content);
      host.appendChild(spinner);

      return host;
    };

    const bodyElement = document.body;
    const lightBoxElement = template({
      prefix: CLASS_PREFIX,
      url: url,
      spinner: spinner,
    });
    const lightBoxOverlayElement = lightBoxElement.querySelector(
      "." + CLASS_PREFIX + "-overlay"
    );
    const lightBoxContentElement = lightBoxElement.querySelector(
      "." + CLASS_PREFIX + "-content"
    );
    const lightBoxIframeElement = lightBoxContentElement.querySelector(
      "." + CLASS_PREFIX + "-content-iframe"
    );
    const lightBoxSpinnerElement = lightBoxElement.querySelector(
      "." + CLASS_PREFIX + "-spinner"
    );

    const psDimensions = {
      width: withDefaultPXUnit(MIN_PS_DIMENSIONS.width),
      height: withDefaultPXUnit(MIN_PS_DIMENSIONS.height),
    };

    function withDefaultPXUnit(value) {
      const isStringWithoutUnit =
        typeof value === "string" &&
        String(parseFloat(value)).length === value.length;
      if (isStringWithoutUnit) {
        return value + "px";
      }
      return typeof value === "number" ? value + "px" : value;
    }

    lightBoxElement.style.zIndex = options.zIndex;

    lightBoxOverlayElement.style.opacity = options.overlayOpacity;
    lightBoxOverlayElement.style.backgroundColor = options.overlayBackground;

    lightBoxContentElement.style.backgroundColor = options.contentBackground;
    lightBoxContentElement.style.margin = withDefaultPXUnit(
      options.contentMargin
    );
    lightBoxContentElement.style.width = options.width
      ? withDefaultPXUnit(options.width)
      : "auto";
    lightBoxContentElement.style.height = options.height
      ? withDefaultPXUnit(options.height)
      : "auto";

    if (options.spinnerColor) {
      lightBoxSpinnerElement.querySelector("path").style.fill =
        options.spinnerColor;
    }

    if (options.spinner === "custom") {
      const spinnerCustom =
        lightBoxSpinnerElement.querySelector(".spinner-custom");
      spinnerCustom.style["-webkit-animation-duration"] =
        options.spinnerRotationPeriod + "s;";
      spinnerCustom.style["animation-duration"] =
        options.spinnerRotationPeriod + "s;";
    }

    if (options.closeByClick) {
      lightBoxOverlayElement.addEventListener(
        "click",
        function () {
          this.closeFrame();
        }.bind(this)
      );
    }

    bodyElement.appendChild(lightBoxElement);

    if (options.closeByKeyboard) {
      bodyElement.addEventListener(
        handleKeyupEventName,
        HandleBoundSpecificKeyup
      );

      bodyElement.addEventListener("keyup", handleGlobalKeyup, false);
    }

    const showContent = once(
      function () {
        hideSpinner();
        lightBoxContentElement.classList.remove(
          CLASS_PREFIX + "-content__hidden"
        );
        this.triggerEvent("load");
      }.bind(this)
    );

    const lightBoxResize = function () {
      const width = options.width ? options.width : psDimensions.width;
      const height = options.height ? options.height : psDimensions.height;

      lightBoxContentElement.style.left = "0px";
      lightBoxContentElement.style.top = "0px";
      lightBoxContentElement.style.borderRadius = "8px";
      lightBoxContentElement.style.width = withDefaultPXUnit(width);
      lightBoxContentElement.style.height = withDefaultPXUnit(height);

      const containerWidth = lightBoxElement.clientWidth,
        containerHeight = lightBoxElement.clientHeight;

      const contentWidth = outerWidth(lightBoxContentElement),
        contentHeight = outerHeight(lightBoxContentElement);

      const horMargin = contentWidth - lightBoxContentElement.offsetWidth,
        vertMargin = contentHeight - lightBoxContentElement.offsetHeight;

      const horDiff = containerWidth - contentWidth,
        vertDiff = containerHeight - contentHeight;

      if (horDiff < 0) {
        lightBoxContentElement.style.width = containerWidth - horMargin + "px";
      } else {
        lightBoxContentElement.style.left = Math.round(horDiff / 2) + "px";
      }

      if (vertDiff < 0) {
        lightBoxContentElement.style.height = containerHeight - vertMargin + "px";
      } else {
        lightBoxContentElement.style.top = Math.round(vertDiff / 2) + "px";
      }
    };

    if (options.width && options.height) {
      lightBoxResize = once(lightBoxResize.bind(this));
    }

    function outerWidth(el) {
      const width = el.offsetWidth;
      const style = getComputedStyle(el);

      width += parseInt(style.marginLeft) + parseInt(style.marginRight);
      return width;
    }

    function outerHeight(el) {
      const height = el.offsetHeight;
      const style = getComputedStyle(el);

      height += parseInt(style.marginTop) + parseInt(style.marginBottom);
      return height;
    }

    let bodyStyles;
    const hideScrollbar = function () {
      bodyStyles = zipObject(
        ["overflow", "paddingRight"].map(function (key) {
          return [key, getComputedStyle(bodyElement)[key]];
        })
      );

      const bodyPad = parseInt(
        getComputedStyle(bodyElement)["paddingRight"] || 0,
        10
      );
      bodyElement.style.overflow = "hidden";
      bodyElement.style.paddingRight = withDefaultPXUnit(
        bodyPad + this.measureScrollbar()
      );
    }.bind(this);

    const resetScrollbar = function () {
      if (bodyStyles) {
        Object.keys(bodyStyles).forEach(function (key) {
          bodyElement.style[key] = bodyStyles[key];
        });
      }
    };

    const showSpinner = function () {
      lightBoxSpinnerElement.style.display = "block";
    };

    const hideSpinner = function () {
      lightBoxSpinnerElement.style.display = "none";
    };
    lightBoxIframeElement.addEventListener("load", function handleLoad(event) {
      const timeout = !(options.width && options.height)
        ? options.resizeTimeout || 30000
        : 1000; // 30000 if psDimensions will not arrive and custom timeout is not provided
      setTimeout(function () {
        lightBoxResize();
        showContent();
      }, timeout);
      lightBoxIframeElement.removeEventListener("load", handleLoad);
    });

    const iframeWindow =
      lightBoxIframeElement.contentWindow || lightBoxIframeElement;

    // Cross-window communication
    this.message = new PostMessage(iframeWindow);
    if (options.width && options.height) {
      this.message.on("dimensions", function () {
        lightBoxResize();
        showContent();
      });
    } else {
      this.message.on("dimensions", function (event) {
        const data = event.detail;
        if (data.dimensions) {
          psDimensions = zipObject(
            ["width", "height"].map(function (dim) {
              return [
                dim,
                Math.max(MIN_PS_DIMENSIONS[dim] || 0, data.dimensions[dim] || 0) +
                  "px",
              ];
            })
          );

          lightBoxResize();
        }
        showContent();
      });
    }
    this.message.on(
      "widget-detection",
      function () {
        this.message.send("widget-detected", {
          version: version,
          lightBoxOptions: options,
        });
      }.bind(this)
    );
    this.message.on(
      "widget-close",
      function () {
        this.closeFrame();
      }.bind(this)
    );
    this.message.on(
      "close",
      function () {
        this.closeFrame();
      }.bind(this)
    );
    this.message.on(
      "status",
      function (event) {
        this.triggerEvent("status", event.detail);
      }.bind(this)
    );
    this.message.on(
      "user-country",
      function (event) {
        this.triggerEvent("user-country", event.detail);
      }.bind(this)
    );

    // Resize
    window.addEventListener(handleResizeEventName, lightBoxResize);
    window.addEventListener("resize", handleGlobalResize);

    // Clean up after close
    const that = this;
    this.on("close", function handleClose(event) {
      that.message.off();
      bodyElement.removeEventListener(
        handleKeyupEventName,
        HandleBoundSpecificKeyup
      );
      bodyElement.removeEventListener("keyup", handleGlobalKeyup);

      window.removeEventListener("resize", handleGlobalResize);

      window.removeEventListener(handleResizeEventName, lightBoxResize);
      lightBoxElement.parentNode.removeChild(lightBoxElement);
      resetScrollbar();
      that.off("close", handleClose);
    });

    showSpinner();
    hideScrollbar();
    this.triggerEvent("open");
  };

  LightBox.prototype.closeFrame = function () {
    if (!this.options.modal) {
      this.triggerEvent("close");
    }
  };

  LightBox.prototype.close = function () {
    this.closeFrame();
  };

  LightBox.prototype.on = function () {
    this.eventObject.on.apply(this.eventObject, arguments);
  };

  LightBox.prototype.off = function () {
    this.eventObject.off.apply(this.eventObject, arguments);
  };

  LightBox.prototype.getPostMessage = function () {
    return this.message;
  };

  LightBox._NAMESPACE = ".xpaystation-widget-lightbox";

  function ChildWindow() {
    this.eventObject = addEventObject(this, wrapEventInNamespace);
    this.message = null;
  }

  function wrapEventInNamespace(eventName) {
    return ChildWindow._NAMESPACE + "_" + eventName;
  }

  const DEFAULT_OPTIONS = {
    target: "_blank",
  };

  /** Private Members **/
  ChildWindow.prototype.eventObject = null;
  ChildWindow.prototype.childWindow = null;

  ChildWindow.prototype.triggerEvent = function (event, data) {
    this.eventObject.trigger(event, data);
  };

  /** Public Members **/
  ChildWindow.prototype.open = function (url, options) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    if (this.childWindow && !this.childWindow.closed) {
      this.childWindow.location.href = url;
    }

    const that = this;
    const addHandlers = function () {
      that.on("close", function handleClose() {
        if (timer) {
          clearTimeout(timer);
        }
        if (that.childWindow) {
          that.childWindow.close();
        }

        that.off("close", handleClose);
      });

      // Cross-window communication
      that.message = new PostMessage(that.childWindow);
      that.message.on(
        "dimensions widget-detection",
        function handleWidgetDetection() {
          that.triggerEvent("load");
          that.message.off("dimensions widget-detection", handleWidgetDetection);
        }
      );
      that.message.on("widget-detection", function handleWidgetDetection() {
        that.message.send("widget-detected", {
          version: version,
          childWindowOptions: options,
        });
        that.message.off("widget-detection", handleWidgetDetection);
      });
      that.message.on("status", function (event) {
        that.triggerEvent("status", event.detail);
      });
      that.on("close", function handleClose() {
        that.message.off();
        that.off("close", handleClose);
      });
      that.message.on("user-country", function (event) {
        that.triggerEvent("user-country", event.detail);
      });
    };

    switch (options.target) {
      case "_self":
        this.childWindow = window;
        addHandlers();
        this.childWindow.location.href = url;
        break;
      case "_parent":
        this.childWindow = window.parent;
        addHandlers();
        this.childWindow.location.href = url;
        break;
      case "_blank":
      default:
        this.childWindow = window.open(url);
        this.childWindow.focus();
        addHandlers();

        const checkWindow = function () {
          if (this.childWindow) {
            if (this.childWindow.closed) {
              this.triggerEvent("close");
            } else {
              timer = setTimeout(checkWindow, 100);
            }
          }
        }.bind(this);
        const timer = setTimeout(checkWindow, 100);
        break;
    }

    this.triggerEvent("open");
  };

  ChildWindow.prototype.close = function () {
    this.triggerEvent("close");
  };

  ChildWindow.prototype.on = function (event, handler, options) {
    if (typeof handler !== "function") {
      return;
    }

    this.eventObject.on(event, handler, options);
  };

  ChildWindow.prototype.off = function (event, handler, options) {
    this.eventObject.off(event, handler, options);
  };

  ChildWindow.prototype.getPostMessage = function () {
    return this.message;
  };

  ChildWindow._NAMESPACE = "CHILD_WINDOW";

  function Exception (message) {
    this.message = message;
    this.name = "XsollaPayStationWidgetException";
    this.toString = function () {
      return this.name + ": " + this.message;
    }.bind(this);
  }

  // import Bowser from "bowser";
  // console.log(Bowser);
  // const browser = Bowser.getParser(window.navigator.userAgent);

  function Device() {}

  Device.prototype.isMobile = function () {
    return false;
    //   return browser.mobile || browser.tablet;
  };

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function App() {
    this.config = Object.assign({}, DEFAULT_CONFIG);
    this.eventObject = addEventObject(this);
    this.isInitiated = false;
    this.postMessage = null;
    this.childWindow = null;
  }

  App.eventTypes = {
    INIT: "init",
    OPEN: "open",
    OPEN_WINDOW: "open-window",
    OPEN_LIGHTBOX: "open-lightbox",
    LOAD: "load",
    CLOSE: "close",
    CLOSE_WINDOW: "close-window",
    CLOSE_LIGHTBOX: "close-lightbox",
    STATUS: "status",
    STATUS_INVOICE: "status-invoice",
    STATUS_DELIVERING: "status-delivering",
    STATUS_TROUBLED: "status-troubled",
    STATUS_DONE: "status-done",
    USER_COUNTRY: "user-country",
  };

  const DEFAULT_CONFIG = {
    access_token: null,
    access_data: null,
    sandbox: false,
    lightbox: {},
    childWindow: {},
    host: "secure.xsolla.com",
    iframeOnly: false,
  };
  const SANDBOX_PAYSTATION_URL =
    "https://sandbox-secure.xsolla.com/paystation2/?";
  const EVENT_NAMESPACE = ".xpaystation-widget";
  const ATTR_PREFIX = "data-xpaystation-widget-open";

  /** Private Members **/
  App.prototype.config = {};
  App.prototype.isInitiated = false;
  App.prototype.eventObject = addEventObject(undefined);

  App.prototype.getPaymentUrl = function () {
    if (this.config.payment_url) {
      return this.config.payment_url;
    }

    const query = {};
    if (this.config.access_token) {
      query.access_token = this.config.access_token;
    } else {
      query.access_data = JSON.stringify(this.config.access_data);
    }

    const urlWithoutQueryParams = this.config.sandbox
      ? SANDBOX_PAYSTATION_URL
      : "https://" + this.config.host + "/paystation2/?";
    return urlWithoutQueryParams + param(query);
  };

  App.prototype.checkConfig = function () {
    if (
      isEmpty(this.config.access_token) &&
      isEmpty(this.config.access_data) &&
      isEmpty(this.config.payment_url)
    ) {
      this.throwError("No access token or access data or payment URL given");
    }

    if (
      !isEmpty(this.config.access_data) &&
      typeof this.config.access_data !== "object"
    ) {
      this.throwError("Invalid access data format");
    }

    if (isEmpty(this.config.host)) {
      this.throwError("Invalid host");
    }
  };

  App.prototype.checkApp = function () {
    if (this.isInitiated === undefined) {
      this.throwError("Initialize widget before opening");
    }
  };

  App.prototype.throwError = function (message) {
    throw new Exception(message);
  };

  App.prototype.triggerEvent = function (eventName, data) {
    if (arguments.length === 1) {
      [].forEach.call(
        arguments,
        function (eventName) {
          const event = document.createEvent("HTMLEvents");
          event.initEvent(eventName, true, false);
          document.dispatchEvent(event);
        }.bind(this)
      );
    } else {
      this.eventObject.trigger(eventName, data);
    }
  };

  App.prototype.triggerCustomEvent = function (eventName, data) {
    try {
      const event = new CustomEvent(eventName, { detail: data }); // Not working in IE
    } catch (e) {
      const event = document.createEvent("CustomEvent");
      event.initCustomEvent(eventName, true, true, data);
    }
    document.dispatchEvent(event);
  };

  /**
   * Initialize widget with options
   * @param options
   */
  App.prototype.init = function (options) {
    function initialize(options) {
      this.isInitiated = true;
      this.config = Object.assign({}, DEFAULT_CONFIG, options);

      const bodyElement = document.body;
      const clickEventName = "click" + EVENT_NAMESPACE;

      const handleClickEvent = function (event) {
        const targetElement = document.querySelector("[" + ATTR_PREFIX + "]");
        if (event.sourceEvent.target === targetElement) {
          this.open.call(this, targetElement);
        }
      }.bind(this);

      bodyElement.removeEventListener(clickEventName, handleClickEvent);

      const clickEvent = document.createEvent("Event");
      clickEvent.initEvent(clickEventName, false, true);

      bodyElement.addEventListener(
        "click",
        function (event) {
          clickEvent.sourceEvent = event;
          bodyElement.dispatchEvent(clickEvent);
        }.bind(this),
        false
      );

      bodyElement.addEventListener(clickEventName, handleClickEvent);
      this.triggerEvent(App.eventTypes.INIT);
    }
    ready(initialize.bind(this, options));
  };

  /**
   * Open payment interface (PayStation)
   */
  App.prototype.open = function () {
    this.checkConfig();
    this.checkApp();

    const triggerSplitStatus = function (data) {
      switch (((data || {}).paymentInfo || {}).status) {
        case "invoice":
          this.triggerEvent(App.eventTypes.STATUS_INVOICE, data);
          break;
        case "delivering":
          this.triggerEvent(App.eventTypes.STATUS_DELIVERING, data);
          break;
        case "troubled":
          this.triggerEvent(App.eventTypes.STATUS_TROUBLED, data);
          break;
        case "done":
          this.triggerEvent(App.eventTypes.STATUS_DONE, data);
          break;
      }
    }.bind(this);

    const url = this.getPaymentUrl();
    const that = this;

    function handleStatus(event) {
      const statusData = event.detail;
      that.triggerEvent(App.eventTypes.STATUS, statusData);
      triggerSplitStatus(statusData);
    }

    function handleUserLocale(event) {
      const userCountry = {
        user_country: event.detail.user_country,
      };
      that.triggerCustomEvent(App.eventTypes.USER_COUNTRY, userCountry);
    }

    this.postMessage = null;
    if (new Device().isMobile() && !this.config.iframeOnly) {
      const childWindow = new ChildWindow();
      childWindow.on("open", function handleOpen() {
        that.postMessage = childWindow.getPostMessage();
        that.triggerEvent(App.eventTypes.OPEN);
        that.triggerEvent(App.eventTypes.OPEN_WINDOW);
        childWindow.off("open", handleOpen);
      });
      childWindow.on("load", function handleLoad() {
        that.triggerEvent(App.eventTypes.LOAD);
        childWindow.off("load", handleLoad);
      });
      childWindow.on("close", function handleClose() {
        that.triggerEvent(App.eventTypes.CLOSE);
        that.triggerEvent(App.eventTypes.CLOSE_WINDOW);
        childWindow.off("status", handleStatus);
        childWindow.off(App.eventTypes.USER_COUNTRY, handleUserLocale);
        childWindow.off("close", handleClose);
      });
      childWindow.on("status", handleStatus);
      childWindow.on(App.eventTypes.USER_COUNTRY, handleUserLocale);
      childWindow.open(url, this.config.childWindow);
      that.childWindow = childWindow;
    } else {
      const lightBox = new LightBox(
        new Device().isMobile() && this.config.iframeOnly
      );
      lightBox.on("open", function handleOpen() {
        that.postMessage = lightBox.getPostMessage();
        that.triggerEvent(App.eventTypes.OPEN);
        that.triggerEvent(App.eventTypes.OPEN_LIGHTBOX);
        lightBox.off("open", handleOpen);
      });
      lightBox.on("load", function handleLoad() {
        that.triggerEvent(App.eventTypes.LOAD);
        lightBox.off("load", handleLoad);
      });
      lightBox.on("close", function handleClose() {
        that.triggerEvent(App.eventTypes.CLOSE);
        that.triggerEvent(App.eventTypes.CLOSE_LIGHTBOX);
        lightBox.off("status", handleStatus);
        lightBox.off(App.eventTypes.USER_COUNTRY, handleUserLocale);
        lightBox.off("close", handleClose);
      });
      lightBox.on("status", handleStatus);
      lightBox.on(App.eventTypes.USER_COUNTRY, handleUserLocale);
      lightBox.openFrame(url, this.config.lightbox);
      that.childWindow = lightBox;
    }
  };

  /**
   * Close payment interface (PayStation)
   */
  App.prototype.close = function () {
    this.childWindow.close();
  };

  /**
   * Attach an event handler function for one or more events to the widget
   * @param event One or more space-separated event types (init, open, load, close, status, status-invoice, status-delivering, status-troubled, status-done)
   * @param handler A function to execute when the event is triggered
   */
  App.prototype.on = function (event, handler, options) {
    if (typeof handler !== "function") {
      return;
    }

    const handlerDecorator = function (event) {
      handler(event, event.detail);
    };

    this.eventObject.on(event, handlerDecorator, options);
  };

  /**
   * Remove an event handler
   * @param event One or more space-separated event types
   * @param handler A handler function previously attached for the event(s)
   */
  App.prototype.off = function (event, handler, options) {
    this.eventObject.off(event, handler, options);
  };

  /**
   * Send a message directly to PayStation
   * @param command
   * @param data
   */
  App.prototype.sendMessage = function (command, data) {
    if (this.postMessage) {
      this.postMessage.send.apply(this.postMessage, arguments);
    }
  };

  /**
   * Attach an event handler function for message event from PayStation
   * @param command
   * @param handler
   */
  App.prototype.onMessage = function (command, handler) {
    if (this.postMessage) {
      this.postMessage.on.apply(this.postMessage, arguments);
    }
  };

  let instance;

  const getInstance = function () {
    if (!instance) {
      instance = new App();
    }
    return instance;
  };

  const widget = Object.assign(
    zipObject(
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

  return widget;

})();
