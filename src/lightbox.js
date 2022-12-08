// import "./styles/lightBox.scss";
// import xsollaLogo from "./spinners/xsolla.svg";
// import roundLogo from "./spinners/round.svg";
import * as Helpers from "./helpers";
import PostMessage from "./postmessage";
import version from "./version";

function LightBox(isMobile) {
  this.eventObject = Helpers.addEventObject(this, wrapEventInNamespace);
  this.options = isMobile ? DEFAULT_OPTIONS_MOBILE : DEFAULT_OPTIONS;
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
const DEFAULT_OPTIONS = Object.assign({}, COMMON_OPTIONS, {
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

const handleKeyupEventName = wrapEventInNamespace("keyup");
const handleResizeEventName = wrapEventInNamespace("resize");

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

function wrapEventInNamespace(eventName) {
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

  const showContent = Helpers.once(
    function () {
      hideSpinner(options);
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
    lightBoxResize = Helpers.once(lightBoxResize.bind(this));
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
    bodyStyles = Helpers.zipObject(
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

  let loadTimer;
  lightBoxIframeElement.addEventListener("load", function handleLoad(event) {
    const timeout = !(options.width && options.height)
      ? options.resizeTimeout || 30000
      : 1000; // 30000 if psDimensions will not arrive and custom timeout is not provided
    loadTimer = setTimeout(function () {
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
        psDimensions = Helpers.zipObject(
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

export default LightBox;
