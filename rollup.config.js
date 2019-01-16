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
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';

const licenseBanner = fs.readFileSync('src/LICENSE', 'utf8');
const cleanupOptions = {comments: 'none'};
const terserOptions = {
  output: {
    preamble: licenseBanner
  }
};

export default [
  // ES5: legacy IIFE style
  {
    input: 'src/omnitone.js',
    output: {
      file: 'build/omnitone.js',
      format: 'iife',
      name: 'Omnitone',
      banner: licenseBanner,
    },
    plugins: [cleanup(cleanupOptions)],
  },

  // ES6 module style
  {
    input: 'src/omnitone.js',
    output: {
      file: 'build/omnitone.esm.js',
      format: 'esm',
      banner: licenseBanner,
    },
    plugins: [cleanup(cleanupOptions)],
  },

  // ES5: legacy IIFE style, minified
  {
    input: 'src/omnitone.js',
    output: {
      file: 'build/omnitone.min.js',
      format: 'iife',
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
