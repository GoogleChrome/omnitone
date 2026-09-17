/**
 * @license
 * Copyright 2026 Google Inc. All Rights Reserved.
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

import {chromeLauncher} from '@web/test-runner';

// The suite needs the real Web Audio API (OfflineAudioContext, ConvolverNode,
// decodeAudioData), so it runs in a locally installed Chrome. This is the same
// "bring your own Chrome" contract the previous Karma setup used.
const launchArgs = [
  // Web Audio tests must not wait for a user gesture to start a context.
  '--autoplay-policy=no-user-gesture-required',
];

// Hosted CI runners execute in a container where the setuid sandbox is
// unavailable.
if (process.env.CI) {
  launchArgs.push('--no-sandbox');
}

export default {
  files: ['test/test-*.js', '!test/test-setup.js'],
  browsers: [chromeLauncher({launchOptions: {args: launchArgs}})],
  testRunnerHtml: (testFramework) => `<!DOCTYPE html>
<html>
  <head>
    <script src="/node_modules/chai/chai.js"></script>
    <script src="/build/omnitone.min.js"></script>
    <script src="/test/test-setup.js"></script>
    <script src="/test/resources/omnitone-foa-hrir-base64.js"></script>
    <script src="/test/resources/omnitone-soa-hrir-base64.js"></script>
    <script src="/test/resources/omnitone-toa-hrir-base64.js"></script>
  </head>
  <body>
    <script type="module" src="${testFramework}"></script>
  </body>
</html>`,
};
