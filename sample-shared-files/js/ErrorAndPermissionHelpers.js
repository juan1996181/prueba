// NOTE: For code clarity, these functions manipulate the DOM and use functions/vars in other files.  You should modify this code to fit your application architecture and calling conventions.


//
// Called to handle scenarios where ZoomSDK.getBrowserSupport().supported == false
//
// Generally speaking, ZoOm is supported on all browsers that support:
// Web Workers, the WebRTC getUserMedia API, and Web Assembly
//
function handleUnsupportedBrowser() {
  var zoomBrowserSupport = ZoomSDK.getBrowserSupport();

  $(".error-header").text("Incompatible Browser");

  // ZoOm is not currently supported on iOS, except for Safari.
  // This is due to Apple revoking the ability to use the getUserMedia API
  // in the WKWebView component, which Chrome, Firefox, and Opera rely on.
  // This is an open bug in the Apple ecosystem and is expected to be fixed in the near future.
  if(zoomBrowserSupport.DetectRTC.isIosAndNotSafari) {
    $("#ios-browser-error").fadeIn(300);
  }
  // Certain iOS devices do not support the latest Safari version, nor the minimum version ZoOm requires.
  // i.e. iPhone 4, iPhone 5c, iPad 1st-gen
  else if(zoomBrowserSupport.DetectRTC.osName == "iOS" && zoomBrowserSupport.DetectRTC.browser.name == "safari") {
    $("#ios-safari-error").fadeIn(300);
  }
  // Certain Android browser/device combinations are not supported.
  // i.e. Samsung Browser on very old Android phones
  else if(zoomBrowserSupport.DetectRTC.osName == "Android OS") {
    $("#android-browser-error").fadeIn(300);
  }
  // Catch-all for cases where we detect that the browser does not support
  // the features that ZoOm needs, but we are not able to detect the specific platform.
  else {
    $("#browser-error").fadeIn(300);
  }

  transitionToErrorOverlay();
}

//
// Called to handle scenarios where we are unable to get a camera stream.
//
// For instance, on many Windows 10 configurations, if you have the webcam already open
// in another browser or tab, you can get several different errors when attempting to access the camera stream.
//
// Another example is permissions.  Depending on the device/platform, there are different ways
// permissions can be blocked due to either user behavior, default system behavior, and non-default system behavior.
//
function handleCameraAccessError(error) {
  $(".error-header").text("Camera Permissions Denied");

  var zoomBrowserSupport = ZoomSDK.getBrowserSupport();
  var browserName = zoomBrowserSupport.DetectRTC.browser.name;
  var osName = zoomBrowserSupport.DetectRTC.osName;
  var isMobileDevice = zoomBrowserSupport.DetectRTC.isMobileDevice;

  // Populate current URL for help screens.
  $(".web-address-location").text(window.location.origin);

  // NotAllowedError is a common error when a user has previous denied permissions for a specific website.
  if(
    (typeof NotAllowedError !== "undefined" && error instanceof NotAllowedError) ||
    (error.name && error.name == "NotAllowedError")
  ) {
    if(browserName === "chrome") {
      if(isMobileDevice) {
        $("#chrome-mobile-camera-denied").fadeIn(300);
      }
      else {
        $("#chrome-desktop-camera-denied").fadeIn(300);
      }
    }
    else if(browserName === "firefox") {
      if(isMobileDevice) {
        $("#firefox-mobile-camera-denied").fadeIn(300);
      }
      else {
        $("#firefox-desktop-camera-denied").fadeIn(300);
      }
    }
    else if(browserName === "safari") {
      if(isMobileDevice) {
        $("#safari-ios-camera-denied").fadeIn(300);
      }
      else if(osName == "Mac OS") {
        $("#safari-mac-camera-denied").fadeIn(300);
      }
      else {
        $("#generic-site-denied").fadeIn(300);
      }
    }
    else if(browserName == "opera") {
      if(isMobileDevice) {
        $("#opera-mobile-camera-denied").fadeIn(300);
      }
      else {
        $("#opera-desktop-camera-denied").fadeIn(300);
      }
    }
    else {
      $("#generic-site-denied").fadeIn(300);
    }
  }

  // NotReadableError is typically a result of either system-level camera access being disabled, or the camera is already in-use by another application.
  else if(
    (typeof NotReadableError !== "undefined" && error instanceof NotReadableError) ||
    (error.name && error.name == "NotReadableError")
  ) {
    if(browserName == "firefox") {
      if(osName == "Windows 10") {
        $("#windows-camera-disabled-or-busy").fadeIn(300);
      }
      else {
        $("#camera-stream-busy").fadeIn(300);
      }
    }
    else if(browserName == "opera") {
      if(osName == "Mac OS") {
        $("#mac-camera-disabled").fadeIn(300);
      }
      else if(osName == "Windows 10") {
        $("#windows-camera-disabled-or-busy").fadeIn(300);
      }
      else {
        $("#camera-stream-busy").fadeIn(300);
      }
    }
    else if(browserName == "chrome") {
      if (osName == "Mac OS") {
        $("#mac-camera-disabled").fadeIn(300);
      }
      else if(osName == "Windows 10") {
        $("#windows-camera-disabled").fadeIn(300);
      }
      else {
        $("#generic-system-denied-or-stream-busy").fadeIn(300);
      }
    }
    else {
      $("#generic-system-denied-or-stream-busy").fadeIn(300);
    }
  }

  // NotFoundError typically is a result of either system-level camera permissions not being granted for your browser, or no compatible camera was detected.
  else if(
    (typeof NotFoundError !== "undefined" && error instanceof NotFoundError) ||
    (error.name && error.name == "NotFoundError")
  ) {

    function showGenericHelperForNotFoundError() {
      if(browserName == "firefox") {
        if(isMobileDevice) {
          $("#firefox-camera-disabled").fadeIn(300);
        }
        else if(osName == "Mac OS") {
          $("#mac-camera-disabled").fadeIn(300);
        }
        else {
          $("#generic-system-or-site-denied").fadeIn(300);
        }
      }
      else if(browserName == "edge") {
        $("#windows-camera-disabled").fadeIn(300);
      }
      else {
        $("#generic-system-or-site-denied").fadeIn(300);
      }
    }

    // Check all available media devices to tell if error is caused from no camera connected or camera permissions being denied.
    if(navigator && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        var cameraDetected = false;
        devices.forEach(function(device) {
          if(device.kind == "videoinput") {
            cameraDetected = true;
          }
        });
        if(cameraDetected == false) {
          $(".error-header").text("Camera Not Detected");
          $("#generic-overconstrainederror").fadeIn(300);
        }
        else {
          // Since camera was detected, handle error in assuming camera permissions have been denied.
          showGenericHelperForNotFoundError();
        }
      });
    }
    else {
      showGenericHelperForNotFoundError();
    }
  }

  else if(
    (typeof PermissionDeniedError !== "undefined" && error instanceof PermissionDeniedError) ||
    (error.name && error.name == "PermissionDeniedError")
  ) {
    if(browserName == "edge") {
      $("#edge-camera-denied").fadeIn(300);
    }
    else if(browserName == "samsung") {
      // Camera has been previously blocked OR no camera permissions for application.
      $("#samsung-camera-denied").fadeIn(300);
    }
    else {
      $("#generic-site-denied").fadeIn(300);
    }
  }

  else if(
    (typeof SourceUnavailableError !== "undefined" && error instanceof SourceUnavailableError) ||
    (error.name && error.name == "SourceUnavailableError")
  ) {
    $("#camera-stream-busy").fadeIn(300);
  }

  else if(
    (typeof MediaDeviceFailedDueToShutdown !== "undefined" && error instanceof MediaDeviceFailedDueToShutdown) ||
    (error.name && error.name == "MediaDeviceFailedDueToShutdown")
  ) {
    if(browserName == "samsung") {
      // Cancelled site-level camera access request.
      $("#samsung-camera-failed").fadeIn(300);
    }
    else {
      $("#generic-mediadevicefailed").fadeIn(300);
    }
  }

  else if(error == "cameraStreamInactiveError") {
    $("#camera-stream-busy").fadeIn(300);
  }

  else if(error == "noConstraintsSatisfiedZoomCameraSelectionLogicError") {
    $(".error-header").text("Camera Not Detected");
    $("#generic-overconstrainederror").fadeIn(300);
  }

  else {
    $("#generic-camera-error").fadeIn(300);
  }

  transitionToErrorOverlay();
}

function showGenericAPIUnsuccess() {
  $("#generic-api-unsuccess").fadeIn(300);
  transitionToErrorOverlay();
}

function handleFailedInit() {
  $(".error-header").text("Initialization Unsuccessful");

  var message = "";
  switch (ZoomSDK.getStatus()) {
    case ZoomSDK.ZoomTypes.ZoomSDKStatus.NETWORK_ISSUES:
      message = "Please make sure that you have an active Internet connection, and then <strong><a href='.'>reload this page</a></strong>.";
      break;
    case ZoomSDK.ZoomTypes.ZoomSDKStatus.INVALID_TOKEN:
      message = "This is due to not including a valid license key for accessing the ZoOm SDK. <br/><p></p>To get your ZoOm Device SDK License Key, visit your <strong><a href='https://dev.zoomlogin.com/zoomsdk/#/account' target='_blank'>Developer Account</a></strong>.<br/><p></p>For information on setup and use, visit the <strong><a href='https://dev.zoomlogin.com/zoomsdk/#/web-guide' target='_blank'>ZoOm Browser SDK Guide</a></strong>.";
      break;
    case ZoomSDK.ZoomTypes.ZoomSDKStatus.DEVICE_IN_LANDSCAPE_MODE:
      message = "Device detected in landscape mode, which is not supported by the ZoOm SDK for this device.<br/><p></p>To ZoOm, please keep your device in a portrait orientation, and <strong><a href='.'>reload this page</a></strong>.";
      break;
    case ZoomSDK.ZoomTypes.ZoomSDKStatus.DEVICE_LOCKED_OUT:
      initializeLockoutCountdown();
      message = "You are currently locked out of ZoOm. This is due to too many unsuccessful ZoOm attempts.<br/><p></p>Please <strong><a href='.'>reload this page</a></strong> and try again in:";
      break;
    case ZoomSDK.ZoomTypes.ZoomSDKStatus.LICENSE_EXPIRED_OR_INVALID:
      message = "Your ZoOm Device SDK License Key is expired, contains invalid text, or you are attempting to initialize on a domain that is not specified in your license.<br/><p></p>To get your Device SDK License Key, visit your <strong><a href='https://dev.zoomlogin.com/zoomsdk/#/account' target='_blank'>Developer Account</a></strong>.<br/><p></p>For information on setup and use, visit the <strong><a href='https://dev.zoomlogin.com/zoomsdk/#/web-guide' target='_blank'>ZoOm Browser SDK Guide</a></strong>.";
      break;
    default:
      message = "ZoOm SDK Status:  " + ZoomSDK.getStatus() + "<br/><p></p>For information on proper setup and use, visit the <strong><a href='https://dev.zoomlogin.com/zoomsdk/#/web-guide' target='_blank'>ZoOm Browser SDK Guide</a></strong>.<br/><p></p>If this error persists, please share it with us for further assistance.";
      break;
  }

  $(".sdk-init-status").html(message);
  $("#sdk-init-failed").show(300);

  transitionToErrorOverlay();
}

function handleFailedPreload() {
  $(".error-header").text("Preload Unsuccessful");
  $("#sdk-preload-failed").show(300);

  transitionToErrorOverlay();
}

function handleFailedPrepareInterface(prepareInterfaceResult) {
  $(".error-header").text("Prepare Interface Unsuccessful");

  var message = "";
  switch (prepareInterfaceResult) {
    case ZoomVideoOrInterfaceDOMElementDoesNotExist:
      message = "Cannot prepare ZoOm interface because there was a problem loading the page's elements.<br/><p></p>To ZoOm, first try to <strong><a href='.'>reload this page</a></strong>.<br/><p></p>If this error persists, please share it with us for further assistance.";
      break;
    case ZoomSessionInProgress:
      message = "Cannot prepare ZoOm interface when ZoOm Session is in progress.<br/><p></p>To ZoOm, please close any other active ZoOm Sessions on your device, and <strong><a href='.'>reload this page</a></strong>.";
      break;
    case DeviceInLandscapeMode:
      message = "Cannot prepare ZoOm interface when on iOS and in landscape mode. Portrait mode is required on iOS.<br/><p></p>To ZoOm, please keep your device in a portrait orientation, and <strong><a href='.'>reload this page</a></strong>.";
      break;
    default:
      message = prepareInterfaceResult + "<br/><p></p>For information on proper setup and use, visit the <strong><a href='https://dev.zoomlogin.com/zoomsdk/#/web-guide' target='_blank'>ZoOm Browser SDK Guide</a></strong>.<br/><p></p>If this error persists, please share it with us for further assistance.";
      break;
  }

  $(".sdk-prepare-interface-result").html(message);
  $("#sdk-prepare-interface-failed").show(300);

  transitionToErrorOverlay();
}

function transitionToErrorOverlay() {
  $("#loading-overlay").hide(300);
  $(".wrapping-box-container").hide(300, function() {
    $(".background-to-black").show(300, function () {
      $("#zoom-logo-header").show(300);
      $("#error-overlay").show(300);
    });
  });
}

function initializeLockoutCountdown(){
  var currentTime = Date.parse(new Date());
  var endTime = new Date(currentTime + 300000);
  var clock = document.getElementById("lockout-clock");
  var timeInterval = setInterval(function(){
    var t = getTimeRemaining(endTime);
    var secondsString = "" + t.seconds;
    var minutesString = "" + t.minutes;
    var pad = "00";
    var seconds = pad.substring(0, pad.length - secondsString.length) + secondsString;
    var minutes = pad.substring(0, pad.length - minutesString.length) + minutesString;
    clock.innerHTML = minutes + ":" + seconds;
    if(t.total<=0){
      clearInterval(timeInterval);
    }
  }, 0);
}

function getTimeRemaining(endTime){
  var t = Date.parse(endTime) - Date.parse(new Date());
  var seconds = Math.floor( (t/1000) % 60 );
  var minutes = Math.floor( (t/1000/60) % 60 );
  return {
    "total": t,
    "minutes": minutes,
    "seconds": seconds
  };
}