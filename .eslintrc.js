module.exports = {
  "env": {
    "es6": true,
  },
  "extends": "google",
  "rules": {
    // the 'rest' parameter for |arguments| might not be supported in some
    // old version of browsers. See also:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters#Browser_compatibility
    "prefer-rest-params": 0,
  }
};
