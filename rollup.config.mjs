/**
 * @license
 * Copyright 2019 Google Inc. All Rights Reserved.
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
 * @file Omnitone library build config file for rollup.js.
 */

import fs from 'fs';
import terser from '@rollup/plugin-terser';

const licenseBanner = fs.readFileSync('src/LICENSE', 'utf8');
const terserOptions = {
  format: {
    preamble: licenseBanner,
  },
};

export default [
  // UMD style (browser global + CommonJS/Browserify/AMD)
  {
    input: 'src/omnitone.js',
    output: {
      file: 'build/omnitone.js',
      format: 'umd',
      name: 'Omnitone',
      banner: licenseBanner,
    },
  },

  // ES6 module style
  {
    input: 'src/omnitone.js',
    output: {
      file: 'build/omnitone.esm.js',
      format: 'esm',
      banner: licenseBanner,
    },
  },

  // UMD style, minified
  {
    input: 'src/omnitone.js',
    output: {
      file: 'build/omnitone.min.js',
      format: 'umd',
      name: 'Omnitone',
    },
    plugins: [terser(terserOptions)],
  },

  // ES6 module style, minified (primary)
  {
    input: 'src/omnitone.js',
    output: {
      file: 'build/omnitone.min.esm.js',
      format: 'esm',
    },
    plugins: [terser(terserOptions)],
  },
];
