'use strict';

module.exports = function makeDone (fn, args) {
  let undefinedIdxs = [];
  for (var i = 0; i < args.length; i++) {
    if (args[i] === undefined) {
      undefinedIdxs.push(i);
    }
  }

  return function () {
    var completeArgs = args.slice(0);
    undefinedIdxs.forEach((pos, i) => {
      completeArgs[pos] = arguments[i];
    });
    completeArgs = completeArgs.concat(
      Array.prototype.slice.call(arguments, undefinedIdxs.length));

    return fn.apply(this, completeArgs);
  };
};
