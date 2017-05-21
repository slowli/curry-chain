'use strict';

const index = require('./indexing');
/* istanbul ignore next: ponyfill which is here mostly for PhantomJS tests */
const objectAssign = Object.assign || require('object-assign');

module.exports = {
  replace (old, value) {
    return value;
  },

  assign (old, value) {
    return objectAssign({}, old, value);
  },

  push (old, value) {
    var array = (old || []).slice(0);
    array.push(value);
    return array;
  },

  pushAll (old, values) {
    var array = (old || []).slice(0);
    Array.prototype.push.apply(array, values);
    return array;
  },

  assignKey (key) {
    return function (old, value) {
      return objectAssign({}, old, {[key]: value});
    };
  },

  index (pos, updater) {
    return function (value) {
      return index.set(this, pos, updater(index.get(this, pos), value));
    };
  }
};
