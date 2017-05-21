'use strict';
/* eslint-env node,mocha */

const expect = require('chai')
  .use(require('sinon-chai'))
  .use(require('dirty-chai')).expect;
const sinon = require('sinon');

const curry = require('..');
const curryFn = require('../fn');
const U = curry.updaters;

function describeCurry (curry, label) {
  describe('curry-chain ' + label, function () {
    describe('plain construction', function () {
      it('should create a function', function () {
        var original = () => null;
        var fn = curry.for(original, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace)
        });

        expect(fn.foo).to.be.a('function');
        expect(fn.bar).to.be.a('function');
      });

      it('should proxy calls to the original function', function () {
        var original = sinon.mock().returns('Hello universe');
        var fn = curry.for(original, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace)
        });

        var result = fn.foo(10).bar(20).done();
        expect(result).to.equal('Hello universe');
        expect(original).to.have.been.calledOnce();
        expect(original).to.have.been.calledWith(10, 20);
      });

      it('should allow redefining arguments', function () {
        var original = sinon.mock().returns('Hello universe');
        var fn = curry.for(original, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace)
        });

        var result = fn.foo(10).bar(20).foo(30).done();
        expect(result).to.equal('Hello universe');
        expect(original).to.have.been.calledOnce();
        expect(original).to.have.been.calledWith(30, 20);
      });

      it('should allow undefined arguments', function () {
        var original = sinon.mock().returns('Hello universe');
        var fn = curry.for(original, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace)
        });

        var result = fn.foo(10).done();
        expect(result).to.equal('Hello universe');
        expect(original).to.have.been.calledOnce();
        expect(original).to.have.been.calledWith(10);
      });

      it('should allow multiple aliases for the same argument', function () {
        var original = sinon.mock().returns('Hello universe');
        var fn = curry.for(original, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace),
          bazz: U.index(1, U.replace)
        });

        var result = fn.foo(10).bar(20).bazz(30).done();
        expect(result).to.equal('Hello universe');
        expect(original).to.have.been.calledOnce();
        expect(original).to.have.been.calledWith(10, 30);
      });

      it('should maintain independent argument instantiation for different chains', function () {
        var original = (x, y) => [x, y];
        var partialFn = curry.for(original, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace),
          bazz: U.index(1, U.replace)
        }).foo(1);

        var fn = partialFn.bar(2);
        var otherFn = partialFn.bazz(3);
        expect(fn.done()).to.deep.equal([1, 2]);
        expect(otherFn.done()).to.deep.equal([1, 3]);
      });

      it('should allow specifying default values for parameters', function () {
        var fn = curry.for((x, y) => [x, y], {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace),
          __defaults: [ 'foo' ]
        });

        expect(fn.done()).to.deep.equal(['foo', undefined]);
        expect(fn.bar(5).done()).to.deep.equal(['foo', 5]);
        expect(fn.foo(1).done()).to.deep.equal([1, undefined]);
      });

      it('should allow specifying language chains', function () {
        var fn = curry.for((x, y) => [x, y], {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace),
          __languageChains: [ 'and' ]
        });

        expect(fn.and).to.exist();
        expect(fn.foo(5).and.bar(10).done()).to.deep.equal([5, 10]);
      });

      it('should allow specifying language chains with names coinciding with chain names', function () {
        var fn = curry.for((x, y) => [x, y], {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace),
          __languageChains: [ 'foo' ]
        });

        expect(fn.foo(5).bar(10).foo.foo(10).done()).to.deep.equal([10, 10]);
      });

      it('should take arguments from `done`', function () {
        var fn = curry.for((x, y) => x + y, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace)
        });

        expect(fn.done(3, 4)).to.equal(7);
      });

      it('should skip defined arguments when taking args from `done`', function () {
        var fn = curry.for((x, y) => x + y, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace)
        });
        fn = fn.foo(3).done;

        expect([1, 2, 3].map(fn)).to.deep.equal([4, 5, 6]);
      });

      it('should fill in undefined arguments when taking args from `done`', function () {
        var fn = curry.for((x, y) => x + y, {
          foo: U.index(0, U.replace),
          bar: U.index(1, U.replace)
        });
        fn = fn.bar(3).done;

        expect([1, 2, 3].map(fn)).to.deep.equal([4, 5, 6]);
      });

      it('should allow passing `this` argument to `done`', function () {
        var fn = curry.for(function (x, y) {
          this[x] = y;
        }, {
          key: U.index(0, U.replace),
          val: U.index(1, U.replace)
        });

        var obj = {};
        fn.key('foo').val('bar').done.call(obj);
        expect(obj).to.deep.equal({ foo: 'bar' });
      });
    });

    describe('literate interface', function () {
      it('should create a function', function () {
        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.setter('bar')
          .done();

        expect(fn.foo).to.be.a('function');
        expect(fn.bar).to.be.a('function');
      });

      it('should proxy calls to the orignal function', function () {
        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.setter('bar')
          .done();

        expect(fn.foo(10).bar(20).done()).to.deep.equal([10, 20]);
      });

      it('should allow multiple setters for the same argument', function () {
        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.setter('bar').and.setter('bazz')
          .done();

        expect(fn.foo(10).bar(20).bazz('abc').done()).to.deep.equal([10, 'abc']);
      });

      it('should allow to return to an earlier argument in the definition', function () {
        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.setter('bar').and
          .arg(0).has.setter('boo')
          .done();

        expect(fn.boo(10).bar(20).done()).to.deep.equal([10, 20]);
      });

      it('should allow specifying option arguments', function () {
        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.option('bar').and.option('bazz')
          .done();

        expect(fn.foo('!').bar(3).bazz([]).done()).to.deep.equal(['!', { bar: 3, bazz: [] }]);
      });

      it('should allow specifying option arguments in a list', function () {
        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.options(['bar', 'bazz'])
          .done();

        expect(fn.foo('!').bar(3).bazz([]).done()).to.deep.equal(['!', { bar: 3, bazz: [] }]);
      });

      it('should allow specifying option arguments in multiple arguments', function () {
        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.options('bar', 'bazz')
          .done();

        expect(fn.foo('!').bar(3).bazz([]).done()).to.deep.equal(['!', { bar: 3, bazz: [] }]);
      });

      it('should allow specifying a sink for option arguments', function () {
        var fn = curry.fn(x => x).where
          .arg(0).has.options(['foo', 'bar']).and.sink('with')
          .done();

        expect(fn.with({ bar: 3, foo: '?' }).foo('!').done()).to.deep.equal({
          foo: '!',
          bar: 3
        });
      });

      it('should make option arguments rewritable', function () {
        var fn = curry.fn(x => x).where
          .arg(0).has.options(['foo', 'bar'])
          .done();

        expect(fn.foo('!').bar(3).foo({ x: [] }).done()).to.deep.equal({
          foo: { x: [] },
          bar: 3
        });
      });

      it('should allow specifying language chains', function () {
        var fn = curry.fn(x => x).where
          .arg(0).has.options('foo', 'bar')
          .language('with', 'and')
          .done();

        expect(fn.with.foo('!').and.bar(3).done()).to.deep.equal({
          foo: '!',
          bar: 3
        });
      });

      it('should allow specifying language chains as an array', function () {
        var fn = curry.fn(x => x).where
          .arg(0).has.options('foo', 'bar')
          .language(['with', 'and'])
          .done();

        expect(fn.with.foo('!').and.bar(3).done()).to.deep.equal({
          foo: '!',
          bar: 3
        });
      });

      it('should allow appending language chains', function () {
        var fn = curry.fn(x => x).where
          .arg(0).has.options('foo', 'bar')
          .language('with').language('and')
          .done();

        expect(fn.with.foo('!').and.bar(3).done()).to.deep.equal({
          foo: '!',
          bar: 3
        });
      });

      it('should allow specifying custom setter logic', function () {
        var fn = curry.fn(x => x).where
          .arg(0).has.setter('str', (old, val) => (old || '') + val)
          .done();
        expect(fn.str('abc').str('de').str('f').done()).to.equal('abcdef');
      });

      it('should allow specifying default arguments with custom setters', function () {
        var fn = curry.fn(x => x).where
          .arg(0).has.setter('plus', (old, val) => old + val);

        var numFn = fn.where.arg(0).defaultsTo(0).done();
        expect(numFn.done()).to.equal(0);
        expect(numFn.plus(1).plus(2).plus(3).done()).to.equal(6);

        var strFn = fn.where.arg(0).defaultsTo('').done();
        expect(strFn.done()).to.equal('');
        expect(strFn.plus(1).plus(2).plus(3).done()).to.equal('123');
      });

      it('should work in traditional currying', function () {
        var fn = curry.fn((x, y) => x + y).where
          .arg(0).has.setter('x').and
          .arg(1).has.setter('y')
          .done();

        expect([1, 2, 3].map(fn.x(10).done)).to.deep.equal([11, 12, 13]);
      });

      it('should not explode with a lot of computations', function () {
        this.timeout(5000);

        var fn = curry.fn((x, y) => [x, y]).where
          .arg(0).has.setter('foo').and
          .arg(1).has.setter('bar')
          .done();
        for (var i = 0; i < 15000; i++) {
          fn = fn.foo(i).bar(i);
        }
        expect(fn.done()).to.deep.equal([14999, 14999]);
      });
    });

    if (typeof curry === 'function') {
      // Test direct interface

      describe('terminator-less literary inteface', function () {
        it('should create a function', function () {
          var fn = curry.fn((x, y) => [x, y]).where
            .arg(0).has.setter('foo').and
            .arg(1).has.setter('bar')();

          expect(fn.foo).to.be.a('function');
          expect(fn.bar).to.be.a('function');
        });

        it('should proxy calls to the orignal function', function () {
          var fn = curry.fn((x, y) => [x, y]).where
            .arg(0).has.setter('foo').and
            .arg(1).has.setter('bar')();

          expect(fn.foo(10).bar(20)()).to.deep.equal([10, 20]);
        });

        it('should work in traditional currying', function () {
          var fn = curry.fn((x, y) => x + y).where
            .arg(0).has.setter('x').and
            .arg(1).has.setter('y')();

          expect([1, 2, 3].map(fn.x(10))).to.deep.equal([11, 12, 13]);
        });
      });
    }
  });
}

describeCurry(curry, 'object implementation (default)');
describeCurry(curryFn, 'function implementation');
