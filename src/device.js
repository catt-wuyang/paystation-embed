// import Bowser from "bowser";
// console.log(Bowser);
// const browser = Bowser.getParser(window.navigator.userAgent);

function Device() {}

Device.prototype.isMobile = function () {
  return false;
  //   return browser.mobile || browser.tablet;
};

export default Device;
