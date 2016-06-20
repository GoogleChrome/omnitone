# Omnitone

Omnitone is a robust implementation of FOA (first-order ambisonic) decoder written in Web Audio API. Its decoding process is based on multiple gain nodes for ambisonic gain matrix and stereo convolutions for HRTF binaural rendering, ensuring the optimum performance. (No JS-based audio processing)


## Installation

The installation via Bower is recommended. NPM works as well.

```bash
bower install omnitone
```


## Usage

The decoder requires an audio or video element and AudioContext. The following is an example of how to set up the context and the element for FOA decoding. A first-order-ambisonic media file consists of 4 audio channels.

The decode constructor accepts the context and the element as arguments along with the path to the HRTF IRs. (originally located in `build/resources`) The initialization of a decoder instance returns a promise which resolves when the resources (i.e. impulse responses) are loaded.

```js
// Prepare audio element to feed the ambisonic source audio feed.
var audioElement = document.createElement('audio');
audioElement.src = 'resources/4ch-spatial-audio-file.wav';

// Create an AudioContext and an Omniton decoder.
var audioContext = new AudioContext();
var decoder = Omnitone.createFOADecoder(audioContext, audioElement, {
  baseResourceUrl: 'PATH/TO/HRTF_DIRECTORY'
});

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


Use `setMode` method to change the setting of the ambisonic decoder. This is useful when the media source it is not ambisonically decoded. (e.g. stereo or mono).

```js
// Mono or regular multi-channel layouts.
decoder.setMode('plain');

// Ambisonically decoded audio stream.
decoder.setMode('ambisonic');

// Disable encoding completely. (no audio processing)
decoder.setMode('none');
```


## Building

Omnitone project uses WebPack to build the minified library and to manage dependencies.

```bash
npm run install     # install dependencies.
npm run build       # build a non-minified library.
npm run watch       # recompile whenever any source file changes.
npm run build-all   # build a minified library and copy static resources.
```


## Support

If you have found an error in this library, please file an issue at: https://github.com/GoogleChrome/omnitone/issues.

Patches are encouraged, and may be submitted by forking this project and submitting a pull request through GitHub. See CONTRIBUTING for more detail.


## License

Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

