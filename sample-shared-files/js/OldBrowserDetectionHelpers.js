(function alertIfOldBrowser() {
  try {
    var testForConstSupport = new Function("'use strict'; const testConstSupport = 0;");
    testForConstSupport();
  }
  catch(e) {
    // browser doesnt not support const - cannot run ZoomSDK
    // call incompatible browser handler here
    alert("Browser not supported: missing basic JS constructs required for ZoomAuthentication.js to load.\n\n" + navigator.userAgent);
  }
})();