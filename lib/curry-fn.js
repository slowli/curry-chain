'use strict';

const makeDone = require('./done');

function isSpecial (name) {
  return name[0] === '_' && name[1] === '_';
}

module.exports = function chainable (fn, config, args) {
  if (!args) {
    args = config.__defaults || new Array(fn.length);
  }

  let proxyFn = makeDone(fn, args);

  for (let argName in config) {
    if (isSpecial(argName)) continue;

    proxyFn[argName] = function () {
      var newArgs = config[argName].apply(args, arguments);
      return chainable(fn, config, newArgs);
    };
  }

  Object.defineProperty(proxyFn, 'done', {
    enumerable: false,
    configurable: false,
    value: proxyFn
  });

  var chains = config.__languageChains || [ ];
  chains.forEach(chain => {
    if (!proxyFn[chain]) {
      proxyFn[chain] = proxyFn;
    } else {
      // Can happen if we want to use the same word (e.g., 'with') as a language chain
      // and as a function
      for (let argName in config) {
        proxyFn[chain][argName] = proxyFn[argName];
      }
    }
  });

  return proxyFn;
};
