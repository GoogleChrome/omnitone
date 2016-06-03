/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
NOTES
=====
sampling rate: 48kHz
bit depth: 16
length: 512 samples
normalization: -3.76 dBFS peak
tapering: half-hann (128 samples)
subject: gorzel@
microphones: Audio Technica BMC-10 (open ear canal)
loudspeakers: Equator D5
venue: Interactive Media Lab, TFTV, University of York, UK
remarks: Low frequencies re-modelled below 500Hz.

FOA Decoding coefficients 
=========================
    EL      AZ    W                 X                  Y                  Z
1   35.26   45    0.125000000000000 0.216494623077544  0.216529812402237  0.216494623077545
2   35.26   -45   0.125000000000000 -0.216494623077544 0.216529812402236  0.216494623077545
3   35.26   -135  0.125000000000000 -0.216494623077544 0.216529812402237  -0.216494623077545
4   35.26   135   0.125000000000000 0.216494623077544  0.216529812402237  -0.216494623077545
5   -35.26  45    0.125000000000000 0.216494623077544  -0.216529812402237 0.216494623077545
6   -35.26  -45   0.125000000000000 -0.216494623077544 -0.216529812402237 0.216494623077545
7   -35.26  -135  0.125000000000000 -0.216494623077544 -0.216529812402237 -0.216494623077545
8   -35.26  135   0.125000000000000 0.216494623077544  -0.216529812402237 -0.216494623077545
*/

// TODO: why these are different from the coefs above?
var FOASpeakerData = [{
  name: 'E35.26_A45',  // <0.5774,0.5774,-0.5774>
  url: 'E35.26_A45_D1.4.wav',
  coef: [.1250, 0.216494623077544, 0.216529812402237, -0.216494623077545]
}, {
  name: 'E35.26_A-45', // <0.5774,-0.5774,-0.5774>
  url: 'E35.26_A-45_D1.4.wav',
  coef: [.1250, 0.216494623077544, -0.216529812402236, -0.216494623077544],
}, {
  name: 'E35.26_A-135', // <-0.5774,-0.5774,-0.5774>
  url: 'E35.26_A-135_D1.4.wav',
  coef: [.1250, -0.216494623077544, -0.216529812402236, -0.216494623077545],
}, {
  name: 'E35.26_A135', // <-0.5774,0.5774,-0.5774>
  url: 'E35.26_A135_D1.4.wav',
  coef: [.1250, -0.216494623077545, 0.216529812402237, -0.216494623077545],
}, {
  name: 'E-35.26_A45', // <0.5774,0.5774,0.5774>
  url: 'E-35.26_A45_D1.4.wav',
  coef: [.1250, 0.216494623077544, 0.216529812402237, 0.216494623077545],
}, {
  name: 'E-35.26_A-45', // <0.5774,-0.5774,0.5774>
  url: 'E-35.26_A-45_D1.4.wav',
  coef: [.1250, 0.216494623077544, -0.216529812402236, 0.216494623077545],
}, {
  name: 'E-35.26_A-135', // <-0.5774,-0.5774,0.5774>
  url: 'E-35.26_A-135_D1.4.wav',
  coef: [.1250, -0.216494623077544, -0.216529812402237, 0.216494623077545],
}, {
  name: 'E-35.26_A135', // <-0.5774,0.5774,0.5774>
  url: 'E-35.26_A135_D1.4.wav',
  coef: [.1250, -0.216494623077545, 0.216529812402237, 0.216494623077545]
}];

module.exports = FOASpeakerData;
