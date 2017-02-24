// If webkit-prefixed context exists, it's Safari.
if (window.webkitAudioContext) {
  window.AudioContext = window.webkitAudioContext;
}
