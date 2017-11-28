# Omnitone: Spatial Audio Rendering on the Web

[![Travis](https://img.shields.io/travis/GoogleChrome/omnitone.svg)](https://travis-ci.org/GoogleChrome/omnitone) [![npm](https://img.shields.io/npm/v/omnitone.svg?colorB=4bc51d)](https://www.npmjs.com/package/omnitone) [![GitHub license](https://img.shields.io/badge/license-Apache%202-brightgreen.svg)](https://raw.githubusercontent.com/GoogleChrome/omnitone/master/LICENSE)

Omnitone is a robust implementation of [ambisonic](https://en.wikipedia.org/wiki/Ambisonics) decoding and binaural rendering written in Web Audio API. Its rendering process is powered by the fast native features from Web Audio API (GainNode and Convolver), ensuring the optimum performance.

The implementation of Omnitone is based on the [Google spatial media](https://github.com/google/spatial-media) specification and [SADIE's binaural filters](https://www.york.ac.uk/sadie-project/GoogleVRSADIE.html). It also powers [Resonance Audio SDK](https://github.com/resonance-audio/resonance-audio-web-sdk) for web.

- [Usage](#usage)
  + [FOARenderer](#foarenderer)
  + __[HOARenderer](#hoarenderer) (New!)__
  + [Rotation and Rendering Mode](#rotation-and-rendering-mode)
- [API Documentation](https://rawgit.com/GoogleChrome/omnitone/master/doc/Omnitone.html)
- [Development](#development)
- [Audio Codec Compatibility](#audio-codec-compatibility)

If you are looking for interactive panning based on Omnitone's ambisonic rendering, be sure to check out [Songbird](https://github.com/google/songbird) project!

### Feature Highlights

Omnitone offers __ambisonic decoding__ and __binaural rendering__ of:
- First-order-ambisonic stream
- High-order-ambisonic stream (2nd and 3rd order)

### Omnitone in action:

- __[Omnitone Demos](https://googlechrome.github.io/omnitone/#home)__
- __[Omnitone Examples](https://rawgit.com/GoogleChrome/omnitone/master/examples/index.html)__
- __[Resonance Audio Web SDK Demos](https://cdn.rawgit.com/resonance-audio/resonance-audio-web-sdk/master/examples/index.html)__
- __[JauntVR Music Gallery](https://www.jauntvr.com/lobby/MusicLobby)__


## How it works

The input audio stream can be either an `HTMLMediaElement` (`<video>` or `<audio>` tag) or a multichannel `AudioBufferSourceNode`. The rotation of the sound field also can be easily linked to the mobile phone's sensor or the on-screen user interaction.

<p align="center">
    <img src="https://raw.githubusercontent.com/GoogleChrome/omnitone/master/doc/diagram-omnitone.png" alt="Omnitone Diagram">
</p>


## Usage

The first step is to include the library file in an HTML document.

```html
<script src="https://cdn.rawgit.com/GoogleChrome/omnitone/master/build/omnitone.min.js"></script>
```

Alternatively, you can install Omnitone as a part of your local development via [NPM](https://www.npmjs.com/package/omnitone).

```bash
npm install omnitone
```

You can also `git clone` the repository and use the library file as usual.

```bash
git clone https://github.com/GoogleChrome/omnitone.git
```

### FOARenderer

`FOARenderer` is for the first-order-ambisonic stream, which consists of 4 channels.

```js
// Set up an audio element to feed the ambisonic source audio feed.
var audioElement = document.createElement('audio');
audioElement.src = 'audio-file-foa-acn.wav';

// Create AudioContext, MediaElementSourceNode and FOARenderer.
var audioContext = new AudioContext();
var audioElementSource =
    audioContext.createMediaElementSource(audioElement);
var foaRenderer = Omnitone.createFOARenderer(audioContext);

// Make connection and start play.
foaRenderer.initialize().then(function() {
  audioElementSource.connect(foaRenderer.input);
  foaRenderer.output.connect(audioContext.destination);
  audioElement.play();
});
```

### HOARenderer

`HOARenderer` is for the higher-order-ambisonic stream. Currently Omnitone supports 2nd and 3rd order ambisonics, which consist of 9 channels and 16 channels respectively.

```js
// Works exactly the same way with FOARenderer. See the usage above.
var hoaRenderer = Omnitone.createHOARenderer(audioContext);
```

### Rotation and Rendering Mode

The rotation matrix in Omnitone renderer can be updated inside of the application's animation loop to rotate the entire sound field. Omnitone supports both 3x3 and 4x4 rotation matrices(column-major).

Note that 

```js
// Rotation with 3x3 or 4x4 matrix.
renderer.setRotationMatrix3(rotationMatrix3);
renderer.setRotationMatrix4(rotationMatrix4);
```

For example, if you want to hook up the Three.js perspective camera:

```js
renderer.setRotationMatrix4(camera.matrixWorld.elements);
```

Use `setRenderingMode` method to change the operation of the decoder. This is useful when switching between spatial media (ambisonic) and non-spatial media (mono or stereo) or when you want to save the CPU power by disabling the decoder.

```js
// Mono or regular multi-channel layouts.
renderer.setRenderingMode('bypass');

// Use ambisonic rendering.
renderer.setRenderingMode('ambisonic');

// Disable encoding completely. (audio processing disabled)
renderer.setRenderingMode('off');
```


## Development

### Building Omnitone Locally

For the development, get a copy of the repository first and run the following script to build the library. Omnitone uses [WebPack](https://webpack.github.io/) to compile the sources.

```bash
npm run build       # build a non-minified library.
npm run watch       # recompile whenever any source file changes.
npm run build-all   # build a minified library and copy static resources.
npm run build-doc   # build JSDoc3 documentation.
npm run eslint      # Run ESLint against source files.
```

### Test

Omnitone uses [Travis](https://travis-ci.org/) and [Karma](https://karma-runner.github.io/1.0/index.html) test runner for the automated testing.  To run the test suite locally, make sure to install dependencies before launch the local test runner. The test suite requires the promisifed version of OfflineAudioContext, so the Karma test runner will choose Chrome as a default test runner.

```bash
npm test
```

#### Local Testing on Linux

Since the test suite requires Chromium-based browser, the following set up might be necessary for Karma to run properly on Linux distros without Chromium-based browser.

```bash
# Tested with Ubuntu 16.04
sudo apt install chromium-browser
export CHROME_BIN=chromium-browser
```


## Audio Codec Compatibility

Omnitone is designed to run on any browser that supports Web Audio API, however, it does not address the incompatibility issue around various media codecs in the browser. At the time of writing, the decoding of compressed multichannel audio with more than 3 channels via `<video>` or `<audio>` elements is not fully supported by the majority of mobile browsers.


## Related Resources

* [Web Audio API](https://webaudio.github.io/web-audio-api)
* [WebVR](https://webvr.info)
* [Google Spatial Media](https://github.com/google/spatial-media)
* [Resonance Audio Web SDK](https://github.com/resonance-audio/resonance-audio-web-sdk)


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
