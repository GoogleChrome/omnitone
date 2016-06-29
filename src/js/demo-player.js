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
var DemoPlayer = (function () {

  'use strict';

  var VERSION = '0.1.2.0002';
  var DEBUG_MODE = false;

  // "Resonance-specific" constants.
  var GL_YAW_OFFSET = Math.PI;
  var AUDIO_YAW_OFFSET = -1.5 * Math.PI;

  var playerOptions;
  var systemInfo = {
    browser: null,
    version: null,
    platform: null
  };

  var viewportElement;
  var videoElement;
  var canvasElement;

  var vrDisplay;
  var matProj = mat4.create();
  var matPose = mat4.create();
  var matView = mat4.create();

  var btnPresent;
  var btnHome;
  var btnPlay;
  var btnPause;
  var btnRewind;

  var glContext;
  var vrPanoramicView;
  var animationRequestId;

  var audioContext;
  var foaDecoder;
  var quatFOARotation = quat.create();
  var matFOARotation = mat3.create();

  var __nullFn__ = new Function();


  function _checkCompatibility() {
    // detect browser and platform.
    var ua = navigator.userAgent, tem,
    M = ua.match(/(chrome|safari|firefox|edge(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE ' + (tem[1] || '');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) !== null)
      M.splice(1, 1, tem[1]);

    systemInfo.browser = M[0];
    systemInfo.version = M[1];

    if (ua.match(/Edge/i))
      systemInfo.browser = 'Edge';

    if (ua.match(/iPad/i) || ua.match(/iPhone/i)) {
      systemInfo.platform = 'iOS';
    } else if (ua.match(/Mac OS X/i)) {
      systemInfo.platform = 'OSX';
    } else if (ua.match(/Android/i)) {
      systemInfo.platform = 'Android';
    } else if (ua.match(/Win/i)) {
      systemInfo.platform = 'Windows';
    }

    if (WGLUUrl.getBool('debug', false)) {
      DEBUG_MODE = true;
      console.log('[DEMO-PLAYER] mode: DEBUG');
    }

    // TODO: iOS Safari cannot decode the multichannel audio file.
    if (systemInfo.platform === 'iOS' && !DEBUG_MODE) {
      VRSamplesUtil.addError('Your browser cannot decode this video or audio format.');
      return;
    }

    // TODO: Android is not fully ready yet. Unified Media Pipeline must be
    // enabled for M51. It is enabled by default at M53.
    if (systemInfo.platform === 'Android' && !DEBUG_MODE) {
      VRSamplesUtil.addError('Decoding multichannel audio is not supported yet in this browser.');
      return;
    }

    console.log('[DEMO-PLAYER] System info: ', systemInfo);

    _initializeComponents();
  }


  function _initializeComponents() {
    console.log('[DEMO-PLAYER] Player Version: ' + VERSION);
    console.log('[DEMO-PLAYER] Initializing demo...');
    var infoMessage = VRSamplesUtil.addInfo('Initializing demo player...');

    // Initialize VR display.
    if (navigator.getVRDisplays) {
      navigator.getVRDisplays().then(function (displays) {
        if (displays.length > 0) {
          vrDisplay = displays[0];
          window.addEventListener('vrdisplaypresentchange', _onVRPresentChange, false);
        } else {
          VRSamplesUtil.addInfo('WebVR supported, but no VRDisplays found.', 3000);
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

    // Create elements and initialize them.
    viewportElement = document.getElementById(playerOptions.viewportElementID);
    canvasElement = document.createElement('canvas');
    viewportElement.appendChild(canvasElement);

    canvasElement.style.boxSizing = 'border-box';
    canvasElement.style.position = 'relative';
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    canvasElement.style.left = 0;
    canvasElement.style.top = 0;
    canvasElement.style.margin = 0;

    var glContextString = (systemInfo.browser === 'Edge')
      ? 'experimental-webgl' 
      : 'webgl';
    
    glContext = canvasElement.getContext(glContextString, {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: false
    });
    glContext.enable(glContext.DEPTH_TEST);
    glContext.enable(glContext.CULL_FACE);

    vrPanoramicView = new VRPanorama(glContext);
    vrPanoramicView.isStereo = true;
    vrPanoramicView.yawOffset = GL_YAW_OFFSET;

    videoElement = document.createElement('video');

    if (systemInfo.platform === 'Android') {
      // 1080p is not good for lower-end devices.
      videoElement.src = playerOptions.video_url_720_remote;
    } else if (systemInfo.browser === 'Safari') {
      // Due to the WebGL CORS bug, Safari cannot use the remote video.
      videoElement.src = playerOptions.video_url_1080_local;
    } else if (systemInfo.browser === 'Firefox') {
      // FireFox only can decode VP/Vorbis (WebM)
      videoElement.src = playerOptions.video_url_1080_local_webm;
    } else {
      // All is good, go for the highest quality video.
      videoElement.src = playerOptions.video_url_1080_remote;
    }

    console.log('[DEMO-PLAYER] video src: ', videoElement.src);

    // Safari's AAC decoder has different channel layout.
    if (systemInfo.browser !== 'Safari') {
      audioContext = new AudioContext();
      foaDecoder = Omnitone.createFOADecoder(audioContext, videoElement);
    } else {
      audioContext = new webkitAudioContext();
      foaDecoder = Omnitone.createFOADecoder(audioContext, videoElement, {
        routingDestination: [2, 0, 1, 3]
      });
    }

    console.log('[DEMO-PLAYER] audio sample rate: ', audioContext.sampleRate)

    window.addEventListener('resize', _onResize, false);

    return Promise.all([
      foaDecoder.initialize(),
      vrPanoramicView.setVideoElement(videoElement)
    ]).then(function () {
      // Demo player is ready to play.
      console.log('[DEMO-PLAYER] Ready to play.');
      videoElement.pause();
      VRSamplesUtil.makeToast(infoMessage, 1);
      VRSamplesUtil.addInfo('Drag the screen to hear the spatial audio effect.'
        + '<br> Press "Play" to start the video.', 5000);
      _preparePlayer();
    }, function (error) {
      console.log('[DEMO-PLAYER] ERROR: ', error);
      if (error.code === 3) {
        VRSamplesUtil.addError('The media file cannot be decoded.');
      } else if (error.code === 4) {
        VRSamplesUtil.addError('The media file is not supported.');      
      }
    });
  }


  function _getPoseMatrix(out, pose) {
    var orientation = pose.orientation;
    if (!orientation)
      orientation = [0, 0, 0, 1];
    mat4.fromQuat(out, orientation);
  }


  function _renderSceneView(matPose, eye) {
    if (eye) {
      // FYI: When rendering a panorama do NOT offset the views by the IPD!
      // That will make the viewer feel like their head is trapped in a tiny
      // ball, which is usually not the desired effect.
      mat4.perspectiveFromFieldOfView(matProj, eye.fieldOfView, 0.1, 1024.0);
      mat4.invert(matView, matPose);
    } else {
      mat4.perspective(matProj, 0.4 * Math.PI, canvasElement.width / canvasElement.height, 0.1, 1024.0);
      mat4.invert(matView, matPose);
    }

    vrPanoramicView.render(matProj, matView, eye);
  }


  function _updateSoundRotation(poseOrientation) {
    quat.invert(quatFOARotation, poseOrientation);
    quat.rotateY(quatFOARotation, quatFOARotation, AUDIO_YAW_OFFSET);
    mat3.fromQuat(matFOARotation, quatFOARotation);
    foaDecoder.setRotationMatrix(matFOARotation);
  }


  function _onAnimationFrame() {
    glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
    animationRequestId = vrDisplay.requestAnimationFrame(_onAnimationFrame);

    if (vrDisplay) {
      var pose = vrDisplay.getPose();
      _getPoseMatrix(matPose, pose);

      _updateSoundRotation(pose.orientation);

      if (vrDisplay.isPresenting) {
        glContext.viewport(0, 0, canvasElement.width * 0.5, canvasElement.height);
        _renderSceneView(matPose, vrDisplay.getEyeParameters('left'));
        glContext.viewport(canvasElement.width * 0.5, 0, canvasElement.width * 0.5, canvasElement.height);
        _renderSceneView(matPose, vrDisplay.getEyeParameters('right'));
        vrDisplay.submitFrame(pose);
      } else {
        glContext.viewport(0, 0, canvasElement.width, canvasElement.height);
        _renderSceneView(matPose, null);
      }
    } else {
      glContext.viewport(0, 0, canvasElement.width, canvasElement.height);
      mat4.perspective(projectionMat, 0.4 * Math.PI, canvasElement.width / canvasElement.height, 0.1, 1024.0);
      mat4.identity(matView);
      vrPanoramicView.render(matProj, matView);
    }
  }


  function _preparePlayer() {
    if (!vrDisplay)
      return;

    videoElement.currentTime = 0;
    vrDisplay.resetPose();
    foaDecoder.setMode('ambisonic');
    _onResize();

    animationRequestId = window.requestAnimationFrame(_onAnimationFrame);    

    // if (!vrDisplay.stageParameters) {
    //   VRSamplesUtil.addButton('Reset Pose', null, null, function () {
    //     vrDisplay.resetPose();
    //   });
    // }

    if (vrDisplay.capabilities.canPresent && !btnPresent) {
      btnPresent = VRSamplesUtil.addButton(
        'Enter VR', null, '../images/cardboard64.png',
        _onVRRequestPresent);
    }

    btnHome = VRSamplesUtil.addButton('Home', null, null, _onHome);
    btnRewind = VRSamplesUtil.addButton('Rewind', null, null, _onRewind);
    btnPlay = VRSamplesUtil.addButton('Play', null, null, _onPlay);
  }


  function _onHome() {
    window.location.href = 'https://googlechrome.github.io/omnitone/';
  }


  function _onPlay() {
    videoElement.play();
    VRSamplesUtil.removeButton(btnPlay);
    btnPause = VRSamplesUtil.addButton('Pause', null, null, _onPause);
  }


  function _onPause() {
    videoElement.pause();
    VRSamplesUtil.removeButton(btnPause);
    btnPlay = VRSamplesUtil.addButton('Play', null, null, _onPlay);
  }


  function _onRewind() {
    videoElement.currentTime = 0;
  }


  function _onResize() {
    if (vrDisplay && vrDisplay.isPresenting) {
      var leftEye = vrDisplay.getEyeParameters('left');
      var rightEye = vrDisplay.getEyeParameters('right');
      canvasElement.width = Math.max(leftEye.renderWidth, rightEye.renderWidth) * 2;
      canvasElement.height = Math.max(leftEye.renderHeight, rightEye.renderHeight);
    } else {
      canvasElement.width = canvasElement.offsetWidth * window.devicePixelRatio;
      canvasElement.height = canvasElement.offsetHeight * window.devicePixelRatio;
    }
  }

  function _onVRRequestPresent() {
    vrDisplay.requestPresent({
      source: canvasElement
    }).then(__nullFn__, function () {
      VRSamplesUtil.addError('VRRequestPresent failed.', 2000);
    });
  }


  function _onVRExitPresent() {
    vrDisplay.exitPresent().then(__nullFn__, function () {
      VRSamplesUtil.addError('VRExitPresent failed.', 2000);
    });
  }


  function _onVRPresentChange() {
    _onResize();
    if (vrDisplay.isPresenting) {
      if (vrDisplay.capabilities.hasExternalDisplay) {
        VRSamplesUtil.removeButton(vrButtonPresent);
        vrButtonPresent = VRSamplesUtil.addButton(
          'Exit VR', null, '../images/cardboard64.png', _onVRExitPresent);
      }
    } else {
      if (vrDisplay.capabilities.hasExternalDisplay) {
        VRSamplesUtil.removeButton(vrButtonPresent);
        vrButtonPresent = VRSamplesUtil.addButton(
          'Enter VR', null, '../images/cardboard64.png', _onVRRequestPresent);
      }
    }
  }


  return {

    initialize: function (options) {
      playerOptions = options;
      VRSamplesUtil.setContainerElementID(options.viewportElementID);      
      _checkCompatibility();
    }

  };

})();
