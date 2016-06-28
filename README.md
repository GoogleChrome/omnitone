# Omnitone: Spatial Audio on the Web

Omnitone is a robust implementation of [FOA (first-order-ambisonic)](https://en.wikipedia.org/wiki/Ambisonics) decoder written in Web Audio API. Its decoding process is based on multiple gain nodes for ambisonic gain matrix and stereo convolutions for [HRTF](https://en.wikipedia.org/wiki/Head-related_transfer_function) binaural rendering, ensuring the optimum performance. (The native audio processing is done by Web Audio API.)


## Installation

Omnitone is designed to be used for the web-facing project, so the installation via [Bower](https://bower.io/) or [NPM](https://www.npmjs.com/) is recommended. Alternatively, you clone or download this repository and use the library file as usual.

```bash
bower install omnitone
// Or
npm install omnitone
```


## How it works

![Omnitone Diagram](https://raw.githubusercontent.com/GoogleChrome/omnitone/master/doc/diagram.png)

Omnitone is a high-level library that abstracts various technical layers of the first-order-ambisonic decoding. The input audio stream can be either a media element (video or audio tags) or a multichannel web audio source. The rotation of the sound field also can be easily linked to the mobile phone's sensor or the on-screen user interaction.


## Mobile-platform Compatibility

Omnitone is designed to run any browser that supports Web Audio API. However, there are several issues around the inconsistent result from the audio/video codec in the browser. At the time of writing, the decoding of compressed multichannel audio stream via `<video>` or `<audio>` elements is not fully supported by the majority of mobile web browsers.


## Usage

The first step is to include the library file in an HTML document.

```html
<script src="omnitone.min.js"></script>
```

The decoder requires an audio or video element and AudioContext. The following is an example of how to set up the context and the element for FOA decoding. A first-order-ambisonic media file consists of 4 audio channels.

The decoder constructor accepts the context and the element as arguments. Note that Omnitone uses HRTFs from [Google spatial media](https://github.com/google/spatial-media) repository, but you can use a custom set of HRTF files as well. The initialization of a decoder instance returns a promise which resolves when the resources (i.e. impulse responses) are loaded.

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

Find the example code to see how to extract the rotation matrix from the quaternion. Also Omnitone converts the coordinate system from WebGL space to the audio space internally, so you need not to transform the matrix manually.

```js
// Rotate the sound field.
decoder.setRotationMatrix(rotationMatrix);
```

Use `setMode` method to change the setting of the ambisonic decoder. This is useful when the media source it is not ambisonically decoded (e.g. stereo or mono) or when you want to reduce the CPU usage or the power consumption by stopping the decoder.

```js
// Mono or regular multi-channel layouts.
decoder.setMode('bypass');

// Ambisonically decoded audio stream.
decoder.setMode('ambisonic');

// Disable encoding completely. (audio processing disabled)
decoder.setMode('none');
```


## Advanced Usage

Omnitone also provides building blocks for the first-order-ambisonic decoding and the binaural rendering. The `FOADecoder` is just a ready-made object built with those components. You can create them and connect together build your own decoding mechanism. 

### FOARouter

`FOARouter` is useful when you need to change the channel layout of the incoming multichannel audio stream. This is necessary because the channel layout changes depending on the audio codec in the browser.

```js
var router = Omnitone.createFOARouter(context, routingDestination);
```

* context (AudioContext): an AudioContext object.
* routingDestination (Array): an array represents the target channel layout.

#### Methods

```js
router.setRoutingDestination([0, 1, 2, 3]); // 4-ch AAC in Chrome (default).
router.setRoutingDestination([1, 2, 0, 3]); // 4-ch AAC in Safari.
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
```

### FOAPhaseMatchedFilter

`FOAPhaseMatchedFilter` is a pair of pass filters (LP/HP) with a crossover frequency to compensate the gain of high frequency contents without a phase difference.

```js
var filter = Omnitone.createFOAPhaseMatchedFilter(context);
```

* context (AudioContext): an AudioContext object.

### FOAVirtualSpeaker

`FOAVirtualSpeaker` is a virtual speaker abstraction with the decoding gain coefficients and HRTF convolution for the first-order-ambisonic audio stream. Note that the speaker instance directly connects to AudioContext's destination.

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

Deactivating a virtual speaker can save CPU powers. Running multiple HRTF convolvers can be computationally expensive, so disabling a speaker might be helpful when the binaural rendering is not necessary.


## Building

SAR project uses [WebPack](https://webpack.github.io/) to build the minified library and to manage dependencies.

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

If you have found an error in this library, please file an issue at: https://github.com/GoogleChrome/omnitone/issues.

Patches are encouraged, and may be submitted by forking this project and submitting a pull request through GitHub. See CONTRIBUTING for more detail.


## License

Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

