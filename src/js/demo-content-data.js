/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var BaseUrl =
    'https://storage.googleapis.com/omnitone-demo.google.com.a.appspot.com/';

// For V3.
var OmnitoneDemoContentData = {
  'resonance': {
    title: 'Resonance by Tim Fain',
    stereoscopic: true,
    postGain: 0.95,
    urlSet: {
      'mp4_720p': BaseUrl + 'resonance-720p-h264-aac.mp4',
      'mp4_1080p': BaseUrl + 'resonance-1080p-h264-aac.mp4',
      'webm_1080p': '../media/resonance-1080p-vp9-vorbis-excerpt.webm',
      'mp4_1080p_excerpt': '../media/resonance-1080p-h264-aac-excerpt.mp4'
    }
  },
  'fuerzaimprevista': {
    title: 'Fuerza Imprevista by Jaunt VR',
    stereoscopic: false,
    postGain: 2.5,
    urlSet: {
      'mp4_1080p': BaseUrl + 'fuerza-imprevista-1080p-h264-aac.mp4',
      'webm_1080p': BaseUrl + 'fuerza-imprevista-1080p-vp9-vorbis.webm'
    }
  }
};

// For V4.
var OmnitoneDemoVideoSourceData = {
  'resonance': {
    title: 'Resonance by Tim Fain',
    stereoscopic: true,
    sources: [
      {
        src: BaseUrl + 'resonance-1080p-h264-aac.mp4',
        type: 'video/mp4',
        media: 'screen and (min-device-width:801px)'
      },
      {
        src: BaseUrl + 'resonance-720p-h264-aac.mp4',
        type: 'video/mp4',
        media: 'screen and (max-device-width:800px)'
      },
      {
        src: BaseUrl + 'media/resonance-1080p-vp9-vorbis-excerpt.webm',
        type: 'video/webm',
        media: 'screen and (min-device-width:801px)'
      }
    ]
  },
  'fuerzaimprevista': {
    title: 'Fuerza Imprevista by Jaunt VR',
    stereoscopic: false,
    sources: [
      {
        src: BaseUrl + 'fuerza-imprevista-1080p-h264-aac.mp4',
        type: 'video/mp4',
        media: 'screen and (min-device-width:801px)'
      },
      {
        src: BaseUrl + 'fuerza-imprevista-1080p-vp9-vorbis.webm',
        type: 'video/webm',
        media: 'screen and (min-device-width:801px)'
      }
    ]
  }
};
