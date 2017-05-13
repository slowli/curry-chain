'use strict';

const index = require('./indexing');

module.exports = {
  replace (old, value) {
    return value;
  },

  assign (old, value) {
    return Object.assign({}, old, value);
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
      return Object.assign({}, old, {[key]: value});
    };
  },

  index (pos, updater) {
    return function (value) {
      return index.set(this, pos, updater(index.get(this, pos), value));
    };
  }
};
