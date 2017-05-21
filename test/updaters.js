'use strict';
/* eslint-env node,mocha */

const expect = require('chai').expect;

const U = require('../lib/updaters');

describe('updaters', function () {
  describe('replace', function () {
    it('should replace old value with a new one', function () {
      var x = U.replace('a', 'b');
      expect(x).to.equal('b');
    });

    it('should work within an index function', function () {
      var updater = U.index(0, U.replace);
      var args = [ { foo: 'bar' }, 3 ];
      args = updater.call(args, 12);
      expect(args).to.deep.equal([12, 3]);
    });
  });

  describe('assign', function () {
    it('should assign properties to the old value', function () {
      var obj = U.assign({ foo: 'bar', a: 1 }, { foo: 'baz', b: 2 });
      expect(obj).to.deep.equal({
        foo: 'baz',
        a: 1,
        b: 2
      });
    });

    it('should work within an index function', function () {
      var updater = U.index(0, U.replace);
      var args = [ { foo: 'bar' }, 3 ];
      args = updater.call(args, { foo: 'baz' });
      expect(args).to.deep.equal([{ foo: 'baz' }, 3]);
    });
  });

  describe('push', function () {
    it('should push element to the old value', function () {
      var array = U.push([1, 2], 3);
      expect(array).to.deep.equal([1, 2, 3]);
    });

    it('should push element to the undefined old value', function () {
      var array = U.push(undefined, 3);
      expect(array).to.deep.equal([3]);
    });

    it('should work within an index function', function () {
      var updater = U.index(1, U.push);
      var args = [ { foo: 'bar' }, [3] ];
      args = updater.call(args, 4);
      expect(args).to.deep.equal([{ foo: 'bar' }, [3, 4]]);
    });
  });

  describe('pushAll', function () {
    it('should assign properties to the old value', function () {
      var array = U.pushAll([1, 2, 3], [4, 5, 6]);
      expect(array).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });

    it('should work within an index function', function () {
      var updater = U.index(1, U.pushAll);
      var args = [ { foo: 'bar' }, [1] ];
      args = updater.call(args, [2, '3']);
      expect(args).to.deep.equal([{ foo: 'bar' }, [1, 2, '3']]);
    });
  });

  describe('assignKey', function () {
    it('should return a function', function () {
      expect(U.assignKey('foo')).to.be.a('function');
    });

    it('should assign the specified key to an old value', function () {
      var obj = U.assignKey('foo')({ foo: 'bar' }, 'baz');
      expect(obj).to.deep.equal({ foo: 'baz' });
    });

    it('should return a key-value pair when the old value is undefined', function () {
      var obj = U.assignKey('foo')(undefined, 'baz');
      expect(obj).to.deep.equal({ foo: 'baz' });
    });

    it('should work within an index function', function () {
      var updater = U.index(0, U.assignKey('foo'));
      var args = [ { foo: 'bar' }, 2 ];
      args = updater.call(args, 'baz');
      expect(args).to.deep.equal([{ foo: 'baz' }, 2]);
    });
  });

  describe('index', function () {
    it('should update the args array for a scalar index', function () {
      var updater = U.index(0, U.replace);
      var args = [ { foo: 'bar' }, 2 ];
      expect(updater.call(args, 'baz')).to.deep.equal([ 'baz', 2 ]);
    });

    it('should not change the old value for a scalar index', function () {
      var updater = U.index(0, U.replace);
      var args = [ { foo: 'bar' }, 2 ];
      updater.call(args, 'baz');
      expect(args).to.deep.equal([ { foo: 'bar' }, 2 ]);
    });

    it('should update the args array for a compound index', function () {
      var updater = U.index('0.foo', U.replace);
      var args = [ { foo: 'bar' }, 2 ];
      expect(updater.call(args, 'baz')).to.deep.equal([ { foo: 'baz' }, 2 ]);
    });

    it('should create missing keys in the args array for a compound index', function () {
      var updater = U.index('0.foo', U.replace);
      var args = [ { }, 2 ];
      expect(updater.call(args, 'baz')).to.deep.equal([ { foo: 'baz' }, 2 ]);
    });
  });
});
