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

import {playwrightLauncher} from '@web/test-runner-playwright';

export default {
  files: ['test/test-*.js', '!test/test-setup.js'],
  browsers: [playwrightLauncher({product: 'chromium'})],
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
