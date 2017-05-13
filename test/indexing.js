'use strict';
/* eslint-env node,mocha */

const expect = require('chai')
  .use(require('dirty-chai')).expect;

const index = require('../lib/indexing');

describe('index', function () {
  describe('toArray', function () {
    it('should convert a number to a 1-element array', function () {
      var x = index.toArray(1);
      expect(x).to.deep.equal([1]);
    });

    it('should convert a dot-less string to a 1-element array', function () {
      var x = index.toArray('abc');
      expect(x).to.deep.equal(['abc']);
    });

    it('should return back an array as is', function () {
      var x = index.toArray([1, 'foo']);
      expect(x).to.deep.equal([1, 'foo']);
    });

    it('should break a dotted string to an array', function () {
      var x = index.toArray('1.foo');
      expect(x).to.deep.equal(['1', 'foo']);
    });
  });

  describe('path', function () {
    it('should return an original array + element when called with an existing index on array', function () {
      var obj = [1, 2, 3, 4];
      expect(index.path(obj, 1)).to.deep.equal([obj, 2]);
    });

    it('should return an array + undefined when called with an existing index on array', function () {
      var obj = [1, 2, 3, 4];
      expect(index.path(obj, 'foo')).to.deep.equal([obj, undefined]);
      expect(index.path(obj, 100)).to.deep.equal([obj, undefined]);
    });

    it('should wrap around when called with a negative index', function () {
      var obj = [1, 2, 3, 4];
      expect(index.path(obj, -1)).to.deep.equal([obj, 4]);
      expect(index.path(obj, -2)).to.deep.equal([obj, 3]);
      expect(index.path(obj, -3)).to.deep.equal([obj, 2]);
      expect(index.path(obj, -4)).to.deep.equal([obj, 1]);
    });

    it('should return undefined when a negative index is too negative', function () {
      var obj = [1, 2, 3, 4];
      expect(index.path(obj, -5)).to.deep.equal([obj, undefined]);
      expect(index.path(obj, -10)).to.deep.equal([obj, undefined]);
    });

    it('should return a sequence of elements when called with a compound index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.path(obj, '1.x')).to.deep.equal([obj, {x: 3, y: 4}, 3]);
      expect(index.path(obj, '1.y')).to.deep.equal([obj, {x: 3, y: 4}, 4]);
    });

    it('should end with undefined if the element at the final index part is undefined', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.path(obj, '1.z')).to.deep.equal([obj, {x: 3, y: 4}, undefined]);
    });

    it('should end with several undefined\'s if an object misses several index parts', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.path(obj, '3.z')).to.deep.equal([obj, undefined, undefined]);
    });
  });

  describe('get', function () {
    it('should return an array element when called with an integer index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.get(obj, 0)).to.equal('foo');
      expect(index.get(obj, 1)).to.deep.equal({x: 3, y: 4});
      expect(index.get(obj, 2)).to.equal('bar');
    });

    it('should return an array element when called with a negative integer index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.get(obj, -3)).to.equal('foo');
      expect(index.get(obj, -2)).to.deep.equal({x: 3, y: 4});
      expect(index.get(obj, -1)).to.equal('bar');
    });

    it('should return an array element when called with an integer-like index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.get(obj, '0')).to.equal('foo');
      expect(index.get(obj, '1')).to.deep.equal({x: 3, y: 4});
      expect(index.get(obj, '2')).to.equal('bar');
      expect(index.get(obj, '-3')).to.equal('foo');
      expect(index.get(obj, '-2')).to.deep.equal({x: 3, y: 4});
      expect(index.get(obj, '-1')).to.equal('bar');
    });

    it('should return undefined when called with a non-existent simple index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.get(obj, '5')).to.be.undefined();
      expect(index.get(obj, 'foo')).to.be.undefined();
      expect(index.get(obj, 'bar')).to.be.undefined();
    });

    it('should return a deeply nested element for a compound index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.get(obj, '1.x')).to.equal(3);
      expect(index.get(obj, '1.y')).to.equal(4);
    });

    it('should return a deep element for a compound index in the array form', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.get(obj, [1, 'x'])).to.equal(3);
      expect(index.get(obj, ['1', 'y'])).to.equal(4);
    });

    it('should return undefined for a non-existent compound index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      expect(index.get(obj, [1, 'z'])).to.be.undefined();
      expect(index.get(obj, '1.foo')).to.be.undefined();
      expect(index.get(obj, '1.x.0')).to.be.undefined();
      expect(index.get(obj, '0.x')).to.be.undefined();
      expect(index.get(obj, '1.y.bar')).to.be.undefined();
    });
  });

  describe('set', function () {
    it('should change a single element of an array', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      var newObj = index.set(obj, 0, 'baz');
      expect(newObj).to.deep.equal(['baz', {x: 3, y: 4}, 'bar']);
    });

    it('should leave the original array intact', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      index.set(obj, 0, 'baz');
      expect(obj).to.deep.equal(['foo', {x: 3, y: 4}, 'bar']);
    });

    it('should change a single element of an array when called with a negative index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      var newObj = index.set(obj, -3, 'baz');
      expect(newObj).to.deep.equal(['baz', {x: 3, y: 4}, 'bar']);
    });

    it('should add an element to an array if the simple index is positive and non-existent', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      var newObj = index.set(obj, 3, 'baz');
      expect(newObj).to.deep.equal(['foo', {x: 3, y: 4}, 'bar', 'baz']);
    });

    it('should modify the element of a nested object if called with an exiting compound index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      var newObj = index.set(obj, '1.x', 'baz');
      expect(newObj).to.deep.equal(['foo', {x: 'baz', y: 4}, 'bar']);
    });

    it('should leave the original array intact if called with an exiting compound index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      index.set(obj, '1.x', 'baz');
      expect(obj).to.deep.equal(['foo', {x: 3, y: 4}, 'bar']);
    });

    it('should create an array property if called with a partially existing index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      var newObj = index.set(obj, '-2.z', 'baz');
      expect(newObj).to.deep.equal(['foo', {x: 3, y: 4, z: 'baz'}, 'bar']);
    });

    it('should create an object with a property when called with a non-existent compound index', function () {
      var obj = ['foo', {x: 3, y: 4}, 'bar'];
      var newObj = index.set(obj, '3.z', 'baz');
      expect(newObj).to.deep.equal(['foo', {x: 3, y: 4}, 'bar', {z: 'baz'}]);
    });

    it('should populate a nested array', function () {
      var obj = ['foo', {x: [], y: 4}, 'bar'];
      var newObj = index.set(obj, '1.x.0', 'baz');
      expect(newObj).to.deep.equal(['foo', {x: ['baz'], y: 4}, 'bar']);
    });
  });
});
