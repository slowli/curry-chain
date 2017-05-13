'use strict';

const makeDone = require('./done');

module.exports = function chainableObj (fn, config) {
  var redefinedChains = [];

  let Wrapper = function (fn, args) {
    this.__fn = fn;
    this.__args = args;

    // Chained properties for redefined chains need to be copied manually
    // for every object
    for (var chain of redefinedChains) {
      for (var argName in config) {
        if (argName.startsWith('__')) continue;
        this[chain][argName] = this[argName].bind(this);
      }
    }
  };
  Wrapper.prototype.constructor = Wrapper;

  Object.defineProperty(Wrapper.prototype, 'done', {
    enumerable: false,
    configurable: false,

    get: function () {
      return makeDone(this.__fn, this.__args);
    }
  });

  for (let argName in config) {
    if (argName.startsWith('__')) continue;

    Wrapper.prototype[argName] = function () {
      var newArgs = config[argName].apply(this.__args, arguments);
      return new Wrapper(fn, newArgs);
    };
  }

  var chains = config.__languageChains || [ ];
  for (var chain of chains) {
    if (!Wrapper.prototype[chain]) {
      Object.defineProperty(Wrapper.prototype, chain, {
        enumerable: false,
        configurable: false,
        get: function () { return this; }
      });
    } else {
      // Can happen if we want to use the same word (e.g., 'with') as a language chain
      // and as a function
      redefinedChains.push(chain);
    }
  }

  return new Wrapper(fn, config.__defaults || []);
};
