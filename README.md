# Spatial Audio Renderer for Web

SAR(Spatial Audio Renderer) is a robust implementation of [FOA (first-order-ambisonic)](https://en.wikipedia.org/wiki/Ambisonics) decoder written in Web Audio API. Its decoding process is based on multiple gain nodes for ambisonic gain matrix and stereo convolutions for [HRTF](https://en.wikipedia.org/wiki/Head-related_transfer_function) binaural rendering, ensuring the optimum performance. (The native audio processing is done by Web Audio API.)


## Installation

SAR is designed to be used for the web-facing project, so the installation via [Bower](https://bower.io/) is recommended. NPM works as well.

```bash
bower install spatial-audio-renderer
```


## How it works

![SAR Diagram](https://raw.githubusercontent.com/GoogleChrome/omnitone/master/doc/diagram.png)

SAR is a high-level library that abstracts various technical layers of the first-order-ambisonic decoding. The input audio stream can be either a media element (video or audio tags) or a multichannel web audio source. The rotation of the sound field also can be easily updated by the mobile phone's sensor or the on-screen user interaction.


## Usage

The decoder requires an audio or video element and AudioContext. The following is an example of how to set up the context and the element for FOA decoding. A first-order-ambisonic media file consists of 4 audio channels.

The decoder constructor accepts the context and the element as arguments. Note that SAR uses HRTFs from [Google spatial media](https://github.com/google/spatial-media) repository, but you can use a custom set of HRTF files as well. The initialization of a decoder instance returns a promise which resolves when the resources (i.e. impulse responses) are loaded.

```js
// Prepare audio element to feed the ambisonic source audio feed.
var audioElement = document.createElement('audio');
audioElement.src = 'resources/4ch-spatial-audio-file.wav';

// Create an AudioContext and an SAR decoder.
var audioContext = new AudioContext();
var decoder = SAR.createFOADecoder(audioContext, audioElement);

// Initialize and then start playing the audio element.
decoder.initialize().then(function () {
  audioElement.play();
}, function (onInitializationError) {
  console.error(onInitializationError);
});
```

The rotation matrix (3x3, row-major) of the decoder can be updated inside of the graphics render loop. This operation rotates the entire sound field. The matrix commonly is derived from the orientation quaternion of the head-mounted display.

Find the example code to see how to extract the rotation matrix from the quaternion. Also SAR converts the coordinate system from WebGL space to the audio space internally, so you need not to transform the matrix manually.

```js
// Rotate the sound field.
decoder.setRotationMatrix(rotationMatrix);
```

Use `setMode` method to change the setting of the ambisonic decoder. This is useful when the media source it is not ambisonically decoded (e.g. stereo or mono) or when you want to reduce the CPU usage or the power consumption by stopping the decoder.

```js
// Mono or regular multi-channel layouts.
decoder.setMode('plain');

// Ambisonically decoded audio stream.
decoder.setMode('ambisonic');

// Disable encoding completely. (audio processing disabled)
decoder.setMode('none');
```


## Building

SAR project uses WebPack to build the minified library and to manage dependencies.

```bash
npm run install     # install dependencies.
npm run build       # build a non-minified library.
npm run watch       # recompile whenever any source file changes.
npm run build-all   # build a minified library and copy static resources.
```


## Related Resources

* [Google Spatial Media](https://github.com/google/spatial-media)
* [VRView](https://developers.google.com/vr/concepts/vrview/)
* [Web Audio API](https://webaudio.github.io/web-audio-api/)
* [WebVR](https://webvr.info/)


## Support

If you have found an error in this library, please file an issue at: https://github.com/GoogleChrome/spatial-audio-renderer/issues.

Patches are encouraged, and may be submitted by forking this project and submitting a pull request through GitHub. See CONTRIBUTING for more detail.


## License

Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

