// Basic code to make interface "better" on mobile web browsers.
// Developer is responsible for displaying the ZoOm interface at good sizing across devices based on constraints of their own application.
// On mobile phones, a height of around 70-90% is desired for optimal user experience.  Note that size is complete controlled by developer in their own application.
// On mobile tablet, a height of around 40% is desired.  Full screen on a tablet causes a very "in your face" experience.  It also causes the user to need to look very far down on their screen in order to see feedback and align their face.
function adjustZoomInterfaceForMobile() {
  var browserSupportInfo = ZoomSDK.getBrowserSupport();
  if (!browserSupportInfo.isMobileDevice) {
    // Do any desktop-specific styling here.
    $("#zoom-icon-angle-good").attr("src","../sample-shared-files/images/zoom-face-guy-angle-good-web.png");
    $("#zoom-icon-angle-bad").attr("src","../sample-shared-files/images/zoom-face-guy-angle-ok-web.png");
    $(".authentication-menu-button").css({
      "height": "40px",
      "width": "40%"
    });
    updateZoomUIConstraintsAfterCameraSuccess();
    return;
  }

  // Hide text next to low-light mode switch for mobile.
  $("#image-switch-text").hide();

  var windowHeight = $(window).height();
  var windowWidth = $(window).width();

  // Resize the wrapping box container and hide the border for mobile devices.
  $(".wrapping-box-container").css({
    "width": "" + Math.round(0.99 * $(window).width()),
    "border": "0px"
  });

  // Handling sizing for medium sized mobile devices.
  if(windowWidth < 600) {
    $(".big-button").css({
      "height": "40px",
      "width": "90%"
    });

    $("#username").css({
      "height": "40px",
      "width": "80%"
    });

    $("#liveness-button").css("height", "3.7em");
    $(".custom-logo-container").css({
      "transform": "scale(0.8)",
      "margin": "0 auto", "padding": "0"
    });

    // Slightly smaller header text for this size device.
    $(".user-helper h2").css("font-size", "20px");

    // Slightly smaller pictogram icons on this size device.
    $(".user-helper > div > div img").css("height", "70px");

    // The retry images of the user should be taller on mobile.
    $(".retry-images img").css("height", "110px");

    // Make error container lists look better on mobile.
    $(".error-feedback-container ol").css("width", "85%");
  }

  // Handle sizing for small mobile devices.
  if(windowWidth <= 320) {
    $(".custom-logo-container").css({
      "transform": "scale(0.6)",
      "margin-top": "-5%"
    });

    $("#feedback-text").css("display", "none");
    $(".user-helper h2").css("font-size", "18px");

    // Tighten up the ui on super tiny devices.
    $(".user-helper > div > div img").css("height", "40px");
    $(".user-helper > div > div img").css("margin", "0 auto 10px");
    $(".user-helper > div > div img").css("padding", "0");

    // The retry images of the user should be taller on mobile.
    $(".retry-images img").css("height", "110px");
  }

  // Don't need to have two example images on retry screen on mobile.
  $(".retry-images-left").find("img:first").remove();
  $(".retry-images-right").find("img:first").remove();

  // Handle iOS specifically, because it is easy to special case.  For iOS, iPhone vs. iPad could also be detected based on user agent.
  // For Android, we handle showing ZoOm better for large and small screen sizes.
  if (browserSupportInfo.osName === "iOS") {
    if (windowWidth < 768) {
      $("#zoom-parent-container").css("height", "" + Math.round(0.75 * windowHeight));
    }
    else {
      $("#zoom-parent-container").css("height", "" + Math.round(0.6 * windowHeight));
    }
  }
  else {
    var isInPortrait = window.innerWidth < window.innerHeight;

    // Sizing here could get much more granular if the developer desires to do so.
    // This is a very naive approach to detecting larger devices (tablets) and drawing ZoOm interface smaller on those devices.
    if(isInPortrait) {
      if (windowWidth < 600) {
        $("#zoom-parent-container").css("height", "" + Math.round(0.75 * windowHeight));
      }
      else {
        $("#zoom-parent-container").css("height", "" + Math.round(0.6 * windowHeight));
      }
    }
    else {
      if ($(window).height() <= parseInt(window.getComputedStyle(document.getElementById("zoom-parent-container")).height)) {
        $("#zoom-parent-container").css("height", "" + Math.round(0.75 * windowHeight));
      }
    }
  }
  updateZoomUIConstraintsAfterCameraSuccess();
}

function updateZoomUIConstraintsAfterCameraSuccess() {
  // Do any post-zoom-camera init styling.
  $(".custom-logo-container").fadeTo(300, 1);
}
