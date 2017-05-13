'use strict';

const objectAssign = Object.assign || require('object-assign');

function isInteger (x) {
  return typeof x === 'number' || (typeof x === 'string' && x.match(/^-?[0-9]+$/));
}

function indexToArray (index) {
  // Convert index to the array form
  if (typeof index === 'string' && index.indexOf('.') >= 0) {
    index = index.split('.');
  } else if (!Array.isArray(index)) {
    index = [ index ];
  }
  return index;
}

function indexPath (obj, index) {
  index = indexToArray(index);
  var path = [ obj ];

  index.forEach(part => {
    if (part < 0 && obj.length) {
      part = obj.length + (+part);
    }

    if (obj === undefined) {
      path.push(undefined);
    } else {
      obj = obj[part];
      path.push(obj);
    }
  });

  return path;
}

function getIndex (obj, index) {
  var path = indexPath(obj, index);
  return path[path.length - 1];
}

function setIndex (obj, index, value) {
  index = indexToArray(index);
  var path = indexPath(obj, index);
  path[index.length] = value;

  for (var pos = index.length - 1; pos >= 0; pos--) {
    var part = index[pos];
    var parent = path[pos];
    if (part < 0 && parent.length && -part <= parent.length) {
      part = parent.length + (+part);
    }

    var parentCopy = parent
      ? new (Object.getPrototypeOf(parent).constructor)()
      : (isInteger(part) ? [] : {});
    objectAssign(parentCopy, parent);
    parentCopy[part] = path[pos + 1];
    path[pos] = parentCopy;
  }
  return path[0];
}

module.exports = {
  get: getIndex,
  set: setIndex,
  path: indexPath,
  toArray: indexToArray
};
