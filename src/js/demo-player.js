/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/* global mat4, vec3, VRPanorama, VRSamplesUtil */


/**
 * @class OmnitoneDemoPlayer
 * @return {DemoPlayer}
 */
window.OmnitoneDemoPlayer = (function () {

  // Player information
  var VERSION = '0.1.4.0004';

  // The GL video mapping is 180 degree opposite.
  // TODO: fix this in vr-panorama.js
  var GL_YAW_OFFSET = Math.PI;

  // Browser information (brand, version, platform)
  var _browserInfo;

  // Player options.
  var _playerOptions = {
    debug: false,
    contentId: null,
    stereoscopic: true,
    postGainDB: 30,
    sourceUrl: null
  };

  // Elements.
  var _viewportElement;
  var _videoElement;
  var _canvasElement;

  // VR and WebGL related.
  var _vrDisplay;
  var _glContext;
  var _glPanoramicView;
  var _projectionMatrix = mat4.create();
  var _viewMatrix = mat4.create();
  var _poseMatrix = mat4.create();
  var _animationRequestId;

  // WebAudio related.
  var _audioContext;
  var _foaDecoder;
  var _rotationQuaternion = quat.create();
  var _rotationMatrix = mat3.create();

  // UI-related
  var _infoMessage;
  var _buttonPresent;
  var _buttonGallery;
  var _buttonPause;
  var _buttonRewind;


  /**
   *
   */
  function PLAYERLOG () {
    window.console.log.apply(window.console, [
      '%c[DEMO-PLAYER]%c '
        + Array.prototype.slice.call(arguments).join(' ') + ' %c(@'
        + performance.now().toFixed(2) + 'ms)',
      'background: #BBDEFB; color: #4CAF50; font-weight: 700',
      'font-weight: 400',
      'color: #AAA'
    ]);
  };


  /**
   *
   */
  function getBrowserInfo () {
    var ua = navigator.userAgent;

    // Check the mobile platform first.
    var platform = ua.match(/android|ipad|iphone/i);
    if (!platform)
      platform = ua.match(/cros|linux|mac os x|windows/i);

    // Check Edge first. If fails, check the other major browsers.
    var client = ua.match(/(edge)\/(\d+)/i);
    if (!client)
      client = ua.match(/(chrome|safari|firefox|opera)\/(\d+)/i);

    PLAYERLOG('User agent: ' + ua);

    return {
      brand: client[1],
      version: client[2],
      platform: platform ? platform[0] : 'unknown'
    };
  }


  /**
   * Perform the browser/platform check and fail early if necessary.
   * @param  {[type]} browserInfo [description]
   */
  function checkCompatibility (playerOptions, browserInfo) {
    // If this is debug mode, forcibly pass the check.
    if (playerOptions.debug)
      return true;

    // iOS Safari cannot decode the multichannel AAC file.
    if (browserInfo.platform === 'iPhone' || browserInfo.platform === 'iPad') {
      VRSamplesUtil.makeToast(_infoMessage, 1);
      VRSamplesUtil.addError(
        'Your browser cannot decode this video or audio format.');
      return false;
    }

    // TODO: Android is not fully ready yet. Unified Media Pipeline must be
    // enabled for M51. It is enabled by default at M53.
    if (browserInfo.platform === 'Android') {
      VRSamplesUtil.makeToast(_infoMessage, 1);
      VRSamplesUtil.addError(
        'Decoding multichannel audio is not supported <br>' +
        'yet in this browser. Use debug mode if necessary.');
      return false;
    }

    // This browser can play the demo content.
    return true;
  }


  /**
   *
   */
  function createContentData () {
    // Collect browser information.
    _browserInfo = getBrowserInfo();

    // Enable debug mode if necessary. This bypasses the platform lock for
    // mobile phones, or for the local test.
    if (WGLUUrl.getBool('debug', false)) {
      _playerOptions.debug = true;
    }

    var browserIsGood = checkCompatibility(_playerOptions, _browserInfo);
    if (!browserIsGood)
      return false;

    // Get content Id. If it's missing, throw an error message.
    var contentId = WGLUUrl.getString('id');
    var contentData;
    if (!contentId) {
      VRSamplesUtil.makeToast(_infoMessage, 1);
      VRSamplesUtil.addError(
        'Invalid content ID. The content cannot be played.');
      return false;
    } else {
      contentData = OmnitoneDemoContentData[contentId];
      _playerOptions.contentId = contentId;
      _playerOptions.postGainDB = contentData.postGainDB;
      _playerOptions.stereoscopic = contentData.stereoscopic;
    }

    // Choose the appropriate video source based on the browser information.
    if (_browserInfo.platform === 'Android') {
      // Use 720p video for smartphones.
      _playerOptions.sourceUrl = contentData.urlSet.mp4_720p;
    } else if (_browserInfo.brand === 'Safari') {
      // Use 1080p excerpt for Safari (due to CORS WebGL bug)
      _playerOptions.sourceUrl = contentData.urlSet.mp4_1080p_excerpt;
    } else if (_browserInfo.brand === 'Firefox') {
      // FireFox only can decode VP/Vorbis (WebM).
      _playerOptions.sourceUrl = contentData.urlSet.webm_1080p;
    } else {
      // All is good, go for the highest quality video.
      _playerOptions.sourceUrl = contentData.urlSet.mp4_1080p;
    }

    // If the source URL is invalid, the demo cannot be played. Halt here.
    if (!_playerOptions.sourceUrl) {
      VRSamplesUtil.makeToast(_infoMessage, 1);
      VRSamplesUtil.addError(
        'The demo content is not prepared for this browser. ' +
        'Try with other browsers.');
      return false;
    }

    PLAYERLOG('Target media URL: ' + _playerOptions.sourceUrl);

    return true;
  }


  /**
   * [onResize description]
   * @return {[type]} [description]
   */
  function onResize () {
    if (_vrDisplay && _vrDisplay.isPresenting) {
      var leftEye = _vrDisplay.getEyeParameters('left');
      var rightEye = _vrDisplay.getEyeParameters('right');
      _canvasElement.width = Math.max(
        leftEye.renderWidth, rightEye.renderWidth) * 2;
      _canvasElement.height = Math.max(
        leftEye.renderHeight, rightEye.renderHeight);
    } else {
      _canvasElement.width =
        _canvasElement.offsetWidth * window.devicePixelRatio;
      _canvasElement.height =
        _canvasElement.offsetHeight * window.devicePixelRatio;
    }
  }


  /**
   * [onVRRequestPresent description]
   * @return {[type]} [description]
   */
  function onVRRequestPresent() {
    _vrDisplay.requestPresent({
      source: _canvasElement
    }).then(function () {}, function () {
      VRSamplesUtil.addError('VRRequestPresent failed.', 2000);
    });
  }


  /**
   * [onVRExitPresent description]
   * @return {[type]} [description]
   */
  function onVRExitPresent() {
    _vrDisplay.exitPresent().then(function () {}, function () {
      VRSamplesUtil.addError('VRExitPresent failed.', 2000);
    });
  }


  /**
   * [_onVRPresentChange description]
   * @return {[type]} [description]
   */
  function onVRPresentChange() {
    onResize();
    if (_vrDisplay.isPresenting) {
      if (_vrDisplay.capabilities.hasExternalDisplay) {
        VRSamplesUtil.removeButton(_buttonPresent);
        _buttonPresent = VRSamplesUtil.addButton(
          'Exit VR', null, '../images/cardboard64.png', onVRExitPresent);
      }
    } else {
      if (_vrDisplay.capabilities.hasExternalDisplay) {
        VRSamplesUtil.removeButton(_buttonPresent);
        _buttonPresent = VRSamplesUtil.addButton(
          'Enter VR', null, '../images/cardboard64.png', onVRRequestPresent);
      }
    }
  }


  /**
   * [getVRDisplay description]
   * @return {[type]} [description]
   */
  function getVRDisplay () {
    if (navigator.getVRDisplays) {
      navigator.getVRDisplays().then(function (displays) {
        if (displays.length > 0) {
          _vrDisplay = displays[0];
          window.addEventListener(
            'vrdisplaypresentchange', onVRPresentChange, false);
        } else {
          VRSamplesUtil.addInfo(
            'WebVR supported, but no VRDisplays found.', 3000);
        }
      });
    } else if (navigator.getVRDevices) {
      VRSamplesUtil.addError('Your browser supports WebVR but not the latest '
        + 'version. See <a href="http://webvr.info">webvr.info</a> for more '
        + 'info.');
    } else {
      VRSamplesUtil.addError('Your browser does not support WebVR. See '
        + '<a href="http://webvr.info">webvr.info</a> for assistance.');
    }
  }


  /**
   *
   */
  function initializeGraphics () {
    // Get VRDisplay.
    getVRDisplay();

    // Prepare WebGL, Canvas, and the panoramic view.
    _canvasElement = document.createElement('canvas');
    _viewportElement.appendChild(_canvasElement);

    _canvasElement.style.boxSizing = 'border-box';
    _canvasElement.style.position = 'relative';
    _canvasElement.style.width = '100%';
    _canvasElement.style.height = '100%';
    _canvasElement.style.left = 0;
    _canvasElement.style.top = 0;
    _canvasElement.style.margin = 0;

    // Edge needs a special care for WebGL.
    var webGlString = (_browserInfo.brand === 'Edge')
      ? 'experimental-webgl'
      : 'webgl';

    _glContext = _canvasElement.getContext(webGlString, {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false
    });

    // If glContext fails, do not proceed.
    if (!_glContext) {
      VRSamplesUtil.makeToast(_infoMessage, 1);
      VRSamplesUtil.addError(
        'WebGL is not available for the demo player. ' +
        'Try again with other browser or a different machine.');
      return;  
    }
    
    _glContext.enable(_glContext.DEPTH_TEST);
    _glContext.enable(_glContext.CULL_FACE);

    _glPanoramicView = new VRPanorama(_glContext);
    _glPanoramicView.isStereo = _playerOptions.stereoscopic;
    _glPanoramicView.yawOffset = GL_YAW_OFFSET;

    // Set up video element.
    _videoElement = document.createElement('video');
    _videoElement.src = _playerOptions.sourceUrl;

    window.addEventListener('resize', onResize, false);
  }


  /**
   *
   */
  function initializeAudio () {
    // The default channel layout for FFMPEG AAC channel ordering.
    var channelMap = [0, 1, 2, 3];

    // Come on guys... Catch up with the specification already... :(
    if (_browserInfo.brand === 'Safari') {
      _audioContext = new webkitAudioContext();
      // Safari uses the different AAC decoder in OSX. The order is different.
      channelMap = [2, 0, 1, 3]
    } else {
      _audioContext = new AudioContext();
    }

    // Create the Omnitone decoder instance.
    _foaDecoder = Omnitone.createFOADecoder(_audioContext, _videoElement, {
      postGainDB: _playerOptions.postGainDB,
      channelMap: channelMap
    });
  }


  /**
   * [greetAudience description]
   * @return {[type]} [description]
   */
  function greetAudience () {
    _videoElement.pause();
    VRSamplesUtil.makeToast(_infoMessage, 1);
    VRSamplesUtil.addInfo('Drag the screen to hear the spatial audio effect.'
      + '<br> Press "Play" to start the video.', 5000);

    // Prepare the playback.
    _videoElement.currentTime = 0;
    _vrDisplay.resetPose();
    _foaDecoder.setMode('ambisonic');

    onResize();

    // Start the graphics renderer.
    _animationRequestId = window.requestAnimationFrame(onAnimationFrame);

    // For VR devices, create the VR present button.
    if (_vrDisplay.capabilities.canPresent && !_buttonPresent) {
      _buttonPresent = VRSamplesUtil.addButton(
        'Enter VR', null, '../images/cardboard64.png',
        onVRRequestPresent);
    }

    // Create the transport control UI.
    _buttonGallery = VRSamplesUtil.addButton('Gallery', null, null, onGallery);
    _buttonRewind = VRSamplesUtil.addButton('Rewind', null, null, onRewind);
    _buttonPlay = VRSamplesUtil.addButton('Play', null, null, onPlay);
  }


  /**
   * [description]
   * @return {[type]} [description]
   */
  function getPoseMatrix (out, pose) {
    var orientation = pose.orientation;
    if (!orientation)
      orientation = [0, 0, 0, 1];
    mat4.fromQuat(out, orientation);
  }


  /**
   * [renderSceneView description]
   * @param  {[type]} poseMatrix [description]
   * @param  {[type]} eye        [description]
   * @return {[type]}            [description]
   */
  function renderSceneView (poseMatrix, eye) {
    if (eye) {
      // FYI: When rendering a panorama do NOT offset the views by the IPD!
      // That will make the viewer feel like their head is trapped in a tiny
      // ball, which is usually not the desired effect.
      mat4.perspectiveFromFieldOfView(
        _projectionMatrix, eye.fieldOfView, 0.1, 1024.0);
      mat4.invert(_viewMatrix, poseMatrix);
    } else {
      // TODO: Why 0.4?
      mat4.perspective(
        _projectionMatrix, 0.4 * Math.PI,
        _canvasElement.width / _canvasElement.height, 0.1, 1024.0);
      mat4.invert(_viewMatrix, poseMatrix);
    }

    _glPanoramicView.render(_projectionMatrix, _viewMatrix, eye);
  }


  /**
   * [updateFOARotationMatrix description]
   * @param  {[type]} poseOrientation [description]
   * @return {[type]}                 [description]
   */
  function updateFOARotationMatrix(poseOrientation) {
    quat.invert(_rotationQuaternion, poseOrientation);
    mat3.fromQuat(_rotationMatrix, _rotationQuaternion);
    _foaDecoder.setRotationMatrix(_rotationMatrix);
  }


  /**
   *
   * @return {[type]} [description]
   */
  function onAnimationFrame () {
    _glContext.clear(_glContext.COLOR_BUFFER_BIT | _glContext.DEPTH_BUFFER_BIT);
    _animationRequestId = _vrDisplay.requestAnimationFrame(onAnimationFrame);

    if (_vrDisplay) {
      // Get pose from the VR device.
      var pose = _vrDisplay.getPose();
      getPoseMatrix(_poseMatrix, pose);

      // Update the sound-field rotation first.
      updateFOARotationMatrix(pose.orientation);

      // Render graphics.
      if (_vrDisplay.isPresenting) {
        _glContext.viewport(
          0, 0, _canvasElement.width * 0.5, _canvasElement.height);
        renderSceneView(_poseMatrix, _vrDisplay.getEyeParameters('left'));
        _glContext.viewport(
          _canvasElement.width * 0.5, 0,
          _canvasElement.width * 0.5, _canvasElement.height);
        renderSceneView(_poseMatrix, _vrDisplay.getEyeParameters('right'));
        _vrDisplay.submitFrame(pose);
      } else {
        _glContext.viewport(0, 0, _canvasElement.width, _canvasElement.height);
        renderSceneView(_poseMatrix, null);
      }
    } else {
      _glContext.viewport(0, 0, _canvasElement.width, _canvasElement.height);
      mat4.perspective(_projectionMatrix, 0.4 * Math.PI,
        _canvasElement.width / _canvasElement.height, 0.1, 1024.0);
      mat4.identity(_viewMatrix);
      _glPanoramicView.render(_projectionMatrix, _viewMatrix);
    }
  }


  /**
   * [onGallery description]
   * @return {[type]} [description]
   */
  function onGallery() {
    window.location.href = '../#gallery';
  }


  /**
   * [onPlay description]
   * @return {[type]} [description]
   */
  function onPlay() {
    _videoElement.play();
    VRSamplesUtil.removeButton(_buttonPlay);
    _buttonPause = VRSamplesUtil.addButton('Pause', null, null, onPause);
  }


  /**
   * [onPause description]
   * @return {[type]} [description]
   */
  function onPause() {
    _videoElement.pause();
    VRSamplesUtil.removeButton(_buttonPause);
    _buttonPlay = VRSamplesUtil.addButton('Play', null, null, onPlay);
  }


  /**
   * [onRewind description]
   * @return {[type]} [description]
   */
  function onRewind() {
    _videoElement.currentTime = 0;
  }


  /**
   * The entry point.
   */
  function initializeComponents () {
    PLAYERLOG('Player Version: ' + VERSION);
    PLAYERLOG('Initializing demo...');
    _infoMessage = VRSamplesUtil.addInfo('Initializing demo player...');

    // Build the content data first. This contains the compatibility check
    // and the content data validation.
    var contentDataIsValid = createContentData();
    if (!contentDataIsValid)
      return;

    initializeGraphics();
    initializeAudio();

    return Promise.all([
      // Start initializing the Omnitone decoder. (loading HRTFs)
      _foaDecoder.initialize(),
      _glPanoramicView.setVideoElement(_videoElement)
    ]).then(function () {
      // The initialization of graphics/audio was successful. Make UI
      // interactive and greet the user.
      PLAYERLOG('Ready to play.');
      greetAudience();
    }, function (error) {
      PLAYERLOG('ERROR: initialization.');
      console.log(error);
      if (error.code === 3) {
        VRSamplesUtil.addError('The media file cannot be decoded.');
      } else if (error.code === 4) {
        VRSamplesUtil.addError('The media file is not supported.');
      }
    });
  }


  return {

    /**
     * Initialize the demo player with the view port element and options.
     * @param  {String} viewportElementId [description]
     */
    initialize: function (viewportElementId) {
      // Get the view port element first.
      _viewportElement = document.getElementById(viewportElementId);

      // Set the container object for messages.
      VRSamplesUtil.setContainerElementId(viewportElementId);

      // Start the entry point.
      initializeComponents();
    }

  };

})();
