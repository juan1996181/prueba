// Developer code to handle getting MediaStreamTrack via WebRTC getUserMedia API.
// NOTE: There are many known edge cases for some devices with hardware/WebRTC implementation bugs we handle here that detract from code clarity.
// NOTE: Also for code clarity, this function manipulates the DOM and uses functions/vars in other files.  You should modify this code to fit your application architecture and calling conventions.

//
// initializeZoomCamera
//
// Self-contained function that takes the ZoOm Parent Container and ZoOm Video Element, as well as callbacks, and initializes the camera/video.
//
// zoomParentContainerElement -- The <div> containing ZoOm elements (please see all Sample App code for example).
// zoomVideoElement -- The <video> that will show the camera (please see Sample App code for example).
// constraintIndexToTry -- Call with 0.  initializeZoomCamera is recursively called when getting the camera.
// onSuccess -- Developer defined function that is called when the correct MediaStreamTrack is acquired and set on the <video> element
// onError -- Developer defined function that is called when a Camera could not be acquired for a non-recoverable reason such as permission denied, no camera, etc.
//
function initializeZoomCamera(zoomParentContainerElement, zoomVideoElement, constraintIndexToTry, onSuccess, onError) {
  // On desktop, where the camera data comes in at landscape resolution,
  // we need to try the HD resolutions first because we want to get camera frames that are at least 640 tall.
  var CONSTRAINTS_DESKTOP = [
    { audio: false, video: { width: { exact: 1280 }, height: { exact: 720 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 1920 }, height: { exact: 1080 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 640 }, height: { exact: 360 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 640 }, height: { exact: 480 }, facingMode: "user" } }
  ];

  var CONSTRAINTS_IOS = [
    { audio: false, video: { width: { exact: 640 }, height: { exact: 360 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 1280 }, height: { exact: 720 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 1920 }, height: { exact: 1080 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 640 }, height: { exact: 480 }, facingMode: "user" } }
  ];

  var CONSTRAINTS_ANDROID_PORTRAIT = [
    { audio: false, video: { width: { exact: 640 }, height: { exact: 360 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 1280 }, height: { exact: 720 }, facingMode: "user" } },
    { audio: false, video: { width: { exact: 1920 }, height: { exact: 1080 }, facingMode: "user" } },
    { audio: false, video: true }
  ];

  var CONSTRAINTS_ANDROID_LANDSCAPE = [
    { audio: false, video: true }
  ];

  // Called when checking valid constraints to try the next constraint, or fail if we could not get a valid camera.
  function tryNextConstraintOrStopAndLogError(zoomParentContainerElement, zoomVideoElement, constraintIndexToTry, constraintsToUse, onSuccess, onError) {
    if (constraintIndexToTry < constraintsToUse.length - 1) {
      appendLog("Constraint " + constraintIndexToTry + " could not be satisfied, trying next constraint.");
      initializeZoomCamera(zoomParentContainerElement, zoomVideoElement, constraintIndexToTry + 1, onSuccess, onError);
    }
    else {
      onError("noConstraintsSatisfiedZoomCameraSelectionLogicError");
    }
  }

  var constraintsToUse;
  var usingAndroidPortrait = false;
  var browserSupportInfo = ZoomSDK.getBrowserSupport();

  if (!browserSupportInfo.isMobileDevice) {
    constraintsToUse = CONSTRAINTS_DESKTOP;
  }
  else if(browserSupportInfo.osName === "iOS") {
    constraintsToUse = CONSTRAINTS_IOS;
  }
  // Landscape Android
  else if(browserSupportInfo.osName === "Android OS" && (screen.width >= screen.height)) {
    constraintsToUse = CONSTRAINTS_ANDROID_LANDSCAPE;
  }
  // Portrait Android
  else if(browserSupportInfo.osName === "Android OS" && (screen.width < screen.height)) {
    constraintsToUse = CONSTRAINTS_ANDROID_PORTRAIT;
    usingAndroidPortrait = true;
  }
  // Unknown
  else {
    alert("Unknown device type, setting constraints for desktop/ios!");
    constraintsToUse = CONSTRAINTS_IOSAndDesktop;
  }

  // Android j7 is skewed unless you use this constraint.
  if(navigator && navigator.userAgent && navigator.userAgent.indexOf("SM-J727T1") != -1) {
    constraintsToUse = [{ audio: false, video: { width: { exact: 1920 }, facingMode: "user" } }];
  }

  navigator.mediaDevices.getUserMedia(constraintsToUse[constraintIndexToTry]).then(function (stream) {
    // This line of code can be removed if not using demo styling where zoom-parent-container is hidden until we get a stream.
    zoomParentContainerElement.classList.remove("display-none");

    videoTrack = stream.getVideoTracks()[0];
    zoomVideoElement.srcObject = stream;

    zoomVideoElement.onloadeddata = function () {
      // Chrome + Windows on certain devices can get into this case if another browser/tab has webcam already open. Oddly, stream.active == true (non-deterministically) when the stream object is initially passed to the success function above.
      if(stream.active != null && stream.active == false) {
        onError("cameraStreamInactiveError");
        return;
      }

      // zoom-parent-container MUST be styled to the SAME ASPECT RATIO as the camera or you will get undefined/unsupported behavior.
      // Note 1 - In this example, we read the height that is defined from CSS, then set the width according to the aspect ratio of the track we received (the camera stream).
      // Note 2 - We also make sure to not set the width to a float value to avoid sub-pixel rendering, which negatively impacts performance and can cause off-by-one UI issues.
      // Note 3 - We choose the "loadeddata" listener and reading the videoHeight and videoWidth from the actual <video> element as the most cross-browser compatible method of getting the true height and width (aspect ratio) chosen.  There are other methods like MediaStreamTrack.getSettings() that do not rely on an event listener but do not work across all browsers.
      var aspectRatioOfSelectedCameraStream = zoomVideoElement.videoHeight / zoomVideoElement.videoWidth;

      // if it picked landscape but we are Android and portrait, try again.
      if(aspectRatioOfSelectedCameraStream < 1 && usingAndroidPortrait) {
        if(typeof appendLog !== "undefined") {
          appendLog("ZoOm Camera warning: got a camera stream that was landscape when using portrait.  This is handled by falling through and trying other constraints. Current constraint index: " + constraintIndexToTry + ". Trying next constraint...");
        }
        else {
          console.log("ZoOm Camera warning: got a camera stream that was landscape when using portrait.  This is handled by falling through and trying other constraints. Current constraint index: " + constraintIndexToTry + ". Trying next constraint...");
        }

        videoTrack.stop();
        tryNextConstraintOrStopAndLogError(zoomParentContainerElement, zoomVideoElement, constraintIndexToTry, constraintsToUse, onSuccess, onError);
        return;
      }

      // Special case for device where front-facing camera is already flipped (only known device).
      // On this device, Firefox does not have the device model in navigator.userAgent, so this is still a known issue.
      if(navigator && navigator.userAgent && navigator.userAgent.indexOf("Lenovo YT3-850F") != -1) {
        zoomParentContainerElement.style.transform = "scaleX(1)";
      }

      zoomParentContainerElement.style.width = Math.round((parseInt(window.getComputedStyle(zoomParentContainerElement).height)) / aspectRatioOfSelectedCameraStream) + "px";
      onSuccess(videoTrack);
    };
  }, function (error) {
    // Error checking across the device/browser/version/hardware implementation differences makes for somewhat messy code here.
    if(error) {
      // Continue to check constraints until no more constraints are available.
      if(
        ((typeof OverconstrainedError !== "undefined" && error instanceof OverconstrainedError) || (error.name && error.name == "OverconstrainedError")) ||
        (browserSupportInfo.DetectRTC.browser.name == "edge" && (typeof MediaStreamError !== "undefined" && error instanceof MediaStreamError && error.name && error.name == "NotFoundError"))
      ) {
        tryNextConstraintOrStopAndLogError(zoomParentContainerElement, zoomVideoElement, constraintIndexToTry, constraintsToUse, onSuccess, onError);
      }
      else {
        onError(error);
      }
    }
    else {
      if(typeof appendLog !== "undefined") {
        appendLog("Camera selection did not complete.  Error callback called but no error received.");
      }
      else {
        console.log("Camera selection did not complete.  Error callback called but no error received.");
      }

      // Callback with null as there was no error, but we should still signal that there was an error.
      onError(null);
    }
  });
}