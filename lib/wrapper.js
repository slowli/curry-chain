'use strict';

const U = require('./updaters');

module.exports = function (curry) {
  var wrap = curry(curry, {
    fn: U.index(0, U.replace),

    arg: U.index('__idx', U.replace),

    language: function (value) {
      if (arguments.length > 1 || typeof value === 'string') {
        value = arguments;
      }

      return U.index([1, '__languageChains'], U.pushAll)
        .call(this, value);
    },

    defaultsTo: function (value) {
      return U.index([1, '__defaults', this.__idx], U.replace)
        .call(this, value);
    },

    option: function (name) {
      return U.index(1, U.assignKey(name)).call(
        this,
        U.index(this.__idx, U.assignKey(name))
      );
    },

    options: function (names) {
      if (arguments.length > 1) {
        names = arguments;
      }

      var args = this;
      for (var name of names) {
        args = U.index(1, U.assignKey(name)).call(
          args,
          U.index(this.__idx, U.assignKey(name))
        );
      }
      return args;
    },

    sink: function (name) {
      return U.index(1, U.assignKey(name)).call(
        this,
        U.index(this.__idx, U.assign)
      );
    },

    setter: function (name, updater) {
      if (!updater) updater = U.replace;

      return U.index(1, U.assignKey(name)).call(
        this,
        U.index(this.__idx, updater)
      );
    },

    __languageChains: [
      'and', 'with', 'where', 'that', 'has'
    ]
  });

  wrap.for = function () {
    return wrap.done(...arguments);
  };

  return wrap;
};
