# Omnitone: Spatial Audio on the Web

[![Travis](https://img.shields.io/travis/GoogleChrome/omnitone.svg)](https://travis-ci.org/GoogleChrome/omnitone) [![npm](https://img.shields.io/npm/v/omnitone.svg?colorB=4bc51d)](https://www.npmjs.com/package/omnitone) [![GitHub license](https://img.shields.io/badge/license-Apache%202-brightgreen.svg)](https://raw.githubusercontent.com/GoogleChrome/omnitone/master/LICENSE)

Omnitone is a robust implementation of [FOA (first-order-ambisonic)](https://en.wikipedia.org/wiki/Ambisonics) decoder with binaural rendering written in Web Audio API. Its decoding process is based on multiple gain nodes for ambisonic gain matrix and convolutions for [HRTF](https://en.wikipedia.org/wiki/Head-related_transfer_function) binaural rendering, ensuring the optimum performance.

See Omnitone in action:
- __[Project Home](https://googlechrome.github.io/omnitone/#home)__
- __[JauntVR Gallery: Music](https://www.jauntvr.com/lobby/MusicLobby)__
- __[Plan8 Ambisonic Player](http://labs.plan8.se/ambisonics-webplayer/)__
- __[Forge.js](http://forgejs.org/samples/ambisonics)__

The implementation of Omnitone is based on the [Google spatial media](https://github.com/google/spatial-media) specification. The FOA input stream must be configured to ACN channel layout with SN3D normalization.

- [Installation](#installation)
- [Usage](#usage)
- [Advanced Usage](#advanced-usage)
  + __[FOARenderer](#foarenderer) (NEW in 0.2.0)__
  + [FOADecoder](#foadecoder)
  + [FOARouter](#foarouter)
  + [FOARotator](#foarotator)
  + [FOAPhaseMatchedFilter](#foaphasematchedfilter)
  + [FOAVirtualSpeaker](#foavirtualspeaker)
- [Building](#building)
- __[Test](#test) (NEW in 0.2.1)__
- [Audio Codec compatibility](#audio-codec-compatibility)
- [Related Resources](#related-resouces)


## How it works

Omnitone abstracts various technical layers of audio spatialization. The input audio stream can be either a media element (video or audio tags) or a multichannel web audio source. The rotation of the sound field also can be easily linked to the mobile phone's sensor or the on-screen user interaction.

<p align="center">
    <img src="https://raw.githubusercontent.com/GoogleChrome/omnitone/master/doc/diagram-omnitone.png" alt="Omnitone Diagram">
</p>


## Installation

Omnitone is designed to be used for the web front-end projects. So [NPM](https://www.npmjs.com/) is recommended if you want to install the library to your web project. You can also clone this repository and use the library file as usual.

```bash
npm install omnitone
```


## Usage

The first step is to include the library file in an HTML document.

```html
<!-- Use Omnitone from installed node_modules/ -->
<script src="node_modules/omnitone/build/omnitone.min.js"></script>

<!-- if you prefer to use CDN -->
<script src="https://cdn.rawgit.com/GoogleChrome/omnitone/962089ca/build/omnitone.min.js"></script>
```

There are two different ways of rendering the ambisonic input stream with Omnitone.

- [FOARenderer (Optimized)](#foarenderer-optimized)
- [FOADeocoder (Fully-configurable)](#foadeocoder-fully-configurable)

### FOARenderer (Optimized)

Newly introduced with the version 0.2.0, `FOARenderer` is a highly optimized ambisonic renderer that outperforms the original renderer by __~100%__. The renderer instance also behaves like an AudioNode, so it can be integrated to the existing WebAudio audio graph easily.

```js
// Set up an audio element to feed the ambisonic source audio feed.
var audioElement = document.createElement('audio');
audioElement.src = 'audio-file-foa-acn.wav';

// Create AudioContext, MediaElementSourceNode and FOARenderer.
var audioContext = new AudioContext();
var audioElementSource =
    audioContext.createMediaElementSource(audioElement);
var foaRenderer = Omnitone.createFOARenderer(audioContext, {
    HRIRUrl: 'https://cdn.rawgit.com/GoogleChrome/omnitone/962089ca/build/resources/sh_hrir_o_1.wav'
  });

// Make connection and start play.
foaRenderer.initialize().then(function () {
    audioElementSource.connect(foaRenderer.input);
    foaRenderer.output.connect(audioContext.destination);
    audioElement.play();
  });
}
```

Currently the HRIR for `FOARenderer` is available on Omnitone's repository. If you do not need a configurable audio path for ambisonic rendering, `FOARenderer` is strongly recommended. See the example [here](https://cdn.rawgit.com/GoogleChrome/omnitone/0.2.2/examples/foa-renderer.html).

### FOADeocoder (Fully-configurable)

The `FOADecoder` directly takes `<audio>` or `<video>` element along with the associated `AudioContext`. This object is a thin wrapper of building blocks described in the [advanced usage](#advanced-usage).

```js
// Prepare audio element to feed the ambisonic source audio feed.
var audioElement = document.createElement('audio');
audioElement.src = 'resources/4ch-spatial-audio-file.wav';

// Create an AudioContext and an Omnitone decoder.
var audioContext = new AudioContext();
var decoder = Omnitone.createFOADecoder(audioContext, audioElement);

// Initialize and then start playing the audio element.
decoder.initialize().then(function () {
  audioElement.play();
}, function (onInitializationError) {
  console.error(onInitializationError);
});
```

The decoder constructor accepts the context and the element as arguments. `FOADecoder` uses [HRIRs](https://github.com/google/spatial-media/tree/master/support/hrtfs/cube) from Google spatial media repository, but you can use a custom set of HRIR files as well. The initialization of a decoder instance returns a promise which resolves when the resources (i.e. impulse responses) are fully loaded. See the example [here](https://cdn.rawgit.com/GoogleChrome/omnitone/0.2.2/examples/foa-decoder.html).

### Basic Features: Rotation, ChannelMap, Rendering Mode

The rotation matrix (3x3, row-major) in the decoder can be updated inside of the graphics render loop. This operation rotates the entire sound field. The rotation matrix is commonly derived from the quaternion of the orientation sensor on the VR headset or the smartphone. Also Omnitone converts the coordinate system from the WebGL space to the audio space internally, so you need not to transform the matrix manually.

```js
// Sound field rotation with 3x3 matrix.
foaRenderer.setRotationMatrix(rotationMatrix);
foaDecoder.setRotationMatrix(rotationMatrix);
```

If you prefer to work with 4x4 rotation matrix (e.g. Three.js camera), you can use the following method instead.

```js
// Rotate the sound field by passing Three.js camera object. (4x4 matrix)
foaRenderer.setRotationMatrixFromCamera(camera.matrix);
foaDecoder.setRotationMatrixFromCamera(camera.matrix);
```

Use `setRenderingMode` or `setMode` method to change the setting of the decoder. This is useful when the media source does not have spatially encoded (e.g. stereo or mono) or when you want to reduce the CPU usage or the power consumption by disabling the decoder.

```js
// Mono or regular multi-channel layouts.
foaRenderer.setRenderingMode('bypass');
foaDecoder.setMode('bypass');

// Use ambisonic rendering.
foaRenderer.setRenderingMode('ambisonic');
foaDecoder.setMode('ambisonic');

// Disable encoding completely. (audio processing disabled)
foaRenderer.setRenderingMode('off');
foaDecoder.setMode('off');
```


## Advanced Usage

Omnitone also provides various building blocks for the first-order-ambisonic decoding and the binaural rendering. The `FOADecoder` is just a ready-made object built with those components. You can create them and connect together build your own decoding mechanism.

### FOARenderer

`FOARenderer` is an optimized FOA stream binaural renderer based on SH-MaxRe HRIR. It uses a specially crafted HRIR for the optimized audio processing, and the URL for HRIR is shown below. `FOARenderer` must be initialized before its usage.

```js
var foaRenderer = Omnitone.createFOARenderer(audioContext, {
  HRIRUrl: 'https://cdn.rawgit.com/GoogleChrome/omnitone/962089ca/build/resources/sh_hrir_o_1.wav',
  channelMap: [0, 1, 2, 3]
});

foaRenderer.initialize().then(/* do stuff when FOARenderer is ready. */);
```

* context (AudioContext): an AudioContext object.
* options (Object): options for decoder.
    - HRIRUrl (String): URL for the SH-MaxRe HRIR.
    - channelMap (Array): A custom channel map.

```js
foaRenderer.input   // A GainNode as an input of FOARenderer.
foaRenderer.output  // A GainNode as an output of FOARenderer.
```

Note that a `FOARenderer` instance has `input` and `output` GainNode. These nodes can be connected to the other AudioNodes for pre/post-processing.

### FOADecoder

`FOADecoder` is a ready-made package of ambisonic gain decoder and binaural renderer.

```js
var foaDecoder = Omnitone.createFOADecoder(context, element, {
  HRTFSetUrl: 'YOUR_HRTF_SET_URL',
  postGainDB: 0,
  channelMap: [0, 1, 2, 3]
});
```

* context (AudioContext): an AudioContext object.
* element (MediaElement): A target video or audio element for streaming.
* options (Object): options for decoder.
    - HRTFSetUrl (String): Base URL for the cube HRTF sets.
    - postGainDB (Number): Post-decoding gain compensation in dB.
    - channelMap (Array): A custom channel map.

### FOARouter

`FOARouter` is useful when you need to change the channel layout of the incoming multichannel audio stream. This is necessary because the channel layout changes depending on the audio codec in the browser.

```js
var router = Omnitone.createFOARouter(context, channelMap);
```

* context (AudioContext): an AudioContext object.
* channelMap (Array): an array represents the target channel layout.

#### Methods

```js
router.setChannelMap([0, 1, 2, 3]); // 4-ch AAC in Chrome (default).
router.setChannelMap([1, 2, 0, 3]); // 4-ch AAC in Safari.
```

### FOARotator

`FOARotator` is a sound field rotator for the first-order-ambisonic decoding. It also performs the coordinate transformation between the world space and the audio space.

```js
var rotator = Omnitone.createFOARotator(context);
```

* context (AudioContext): an AudioContext object.

#### Methods

```js
rotator.setRotationMatrix([1, 0, 0, 0, 1, 0, 0, 0, 1]); // 3x3 row-major matrix.
rotator.setRotationMatrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); // 4x4 row-major matrix.
```

* rotationMatrix (Array): 3x3 row-major matrix.
* rotationMatrix4 (Array): 4x4 row-major matrix.

### FOAPhaseMatchedFilter

`FOAPhaseMatchedFilter` is a pair of pass filters (LP/HP) with a crossover frequency to compensate the gain of high frequency contents without a phase difference.

```js
var filter = Omnitone.createFOAPhaseMatchedFilter(context);
```

* context (AudioContext): an AudioContext object.

### FOAVirtualSpeaker

`FOAVirtualSpeaker` is a virtual speaker abstraction with the decoding gain coefficients and HRTF convolution for the first-order-ambisonic audio stream. Note that the speaker instance directly connects to the destination node of `AudioContext`. So you cannot apply additional audio processing after this component.

```js
var speaker = Omnitone.createFOAVirtualSpeaker(context, options);
```

* context (AudioContext): an AudioContext object.
* options (Object): options for speaker.
    - coefficients: decoding coefficients for (W,X,Y,Z).
    - IR: stereo IR buffer for HRTF convolution.
    - gain: post-gain for the speaker.

#### Methods

```js
speaker.enable();   // activate the speaker.
speaker.disable();  // deactivate the speaker.
```

Deactivating a virtual speaker can save CPU powers. Running multiple HRTF convolution can be computationally expensive, so disabling a speaker might be helpful when the binaural rendering is not necessary.


## Building

Omnitone uses [WebPack](https://webpack.github.io/) to build the minified library and to manage dependencies.

```bash
npm install         # install dependencies.
npm run build       # build a non-minified library.
npm run watch       # recompile whenever any source file changes.
npm run build-all   # build a minified library and copy static resources.
```


## Test

Omnitone uses [Travis](https://travis-ci.org/) and [Karma](https://karma-runner.github.io/1.0/index.html) test runner for continuous integration. (The index HTML page for the local testing is deprecated in v0.2.1.) To run the test suite locally, you have to clone the repository, install dependencies and launch the test runner:

```bash
npm test
```

Note that unit tests require the promisified version of `OfflineAudioContext`, so they might not run on outdate browsers. Omnitone's Travis CI is using the latest stable version of Chrome.


## Audio Codec Compatibility

Omnitone is designed to run any browser that supports Web Audio API, however, it does not address the incompatibility issue around various media codecs in the browsers. At the time of writing, the decoding of compressed multichannel audio via `<video>` or `<audio>` elements is not fully supported by the majority of mobile browsers.


## Related Resources

* [Google Spatial Media](https://github.com/google/spatial-media)
* [Web Audio API](https://webaudio.github.io/web-audio-api/)
* [WebVR](https://webvr.info/)


## Acknowledgments

Special thanks to Boris Smus, Brandon Jones, Dillon Cower, Drew Allen, Julius Kammerl and Marcin Gorzel for their help on this project. We are also grateful to Tim Fain and Jaunt VR for their permission to use beautiful VR contents in the demo.


## Support

If you have found an error in this library, please file an issue at: https://github.com/GoogleChrome/omnitone/issues.

Patches are encouraged, and may be submitted by forking this project and submitting a pull request through GitHub. See CONTRIBUTING for more detail.


## License

Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

