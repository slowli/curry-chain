# Chainable Currying

[![Build status][travis-image]][travis-url]
[![Code style][code-style-image]][code-style-url]
[![License][license-image]][license-url]

[travis-image]: https://img.shields.io/travis/slowli/curry-chain.svg?style=flat-square
[travis-url]: https://travis-ci.org/slowli/curry-chain
[code-style-image]: https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square
[code-style-url]: https://github.com/Flet/semistandard
[license-image]: https://img.shields.io/github/license/slowli/curry-chain.svg?style=flat-square
[license-url]: https://opensource.org/licenses/Apache-2.0

**curry-chain** is a library for creating literary, [chai][chai]-style curried
functions.

[chai]: http://chaijs.com/

## Usage

**curry-chain** allows to define curried functions: functions with settable arguments
and chainable setters. Curried functions are wrapped around ordinary functions,
allowing to set their arguments one by one, set individual properties for object
arguments, and much more.

In order to create a curried function, call `curry` on an existing function:

```javascript
const curry = require('curry-chain');

function greet (who, how) {
  return how + ', ' + who + '!';
}

var curryGreet = curry.fn(greet).where
  .arg(0).has.setter('who').and
  .arg(1).has.setter('how')
  .done();
```

This creates a chained function, the 0-th argument of which can be set with
a `who` setter, and the 1-st with a `how` setter:

```javascript
var greeting = curryGreet.who('universe').how('Hello').done();
// greeting === 'Hello, universe!'
```

More details of how the above code works:

- `fn` sets the function for currying
- `arg` selects the context - the argument index, which further `setter`
  and other instructions will describe
- `setter` creates a chainable setter with the specified name. The setter will
  set the current argument. By default, a setter replaces the argument, but other
  behaviors are also available
- `done` signals that the function is complete
- `where`, `that` and `and` are *language chains*, they are here just to improve
  readablility, just like in `chai`

The created curried function will have the specified chainable setters, and the `done`
function, which will call the original function specified by `fn`,
with the values of arguments set.

Notice that `curry` looks like a curried function: it is chainable and has
the `done` terminator. This is not a coincidence; `curry` actually *is* a curried
wrapper around a low-level curry creator function (see the source code
for more details).

### Argument assignment

#### Several setters

You can specify several setters for the same argument:

```javascript
var curryGreet = curry.fn(greet).where
  .arg(0).has.setter('who')
  .arg(1).has.setter('how').and.setter('with')
  .done();
  
curryGreet.with('G\'day').who('world').done();
curryGreet.how('Hello').who('world').done();
```

#### Language

You can specify language chains to improve readablility by using the `language` chain:

```javascript
var curryAdd = curry.fn((x, y) => x + y).where
  .arg(0).has.setter('x').and
  .arg(1).has.setter('y').and
  .language('with', 'and')
  .done();
  
curryAdd.with.x(10).and.y(5);
```

The names of language chains may coincide with names of setters.

#### Setters for properties

It is possible to specify setters for separate properties of an argument
using the `option` and `options` chains:

```javascript
function drawFigure(shape, pos, options) {
  // uses pos.x, pos.y, options.color and options.size
}

var curriedDraw = curry.fn(drawFigure).where
  .arg(0).has.setter('shape')
  .arg(1).has.setter('pos').and.option('x').and.option('y')
  .arg(2).has.options('color', 'size')
  .language('with', 'and')
  .done();
  
curriedDraw.shape('circle')
  .with.x(10).and.y(25)
  .color('blue').and.size(10).done();
```

#### Option sinks

The `sink` chain specifies a setter that can assign several properties of an argument
using `Object.assign`:

```javascript
var curriedDraw = // ...
  .arg(2).has.sink('with').done();

// 'with' may work simultaneously as a language chain and a sink
var shape = curriedDraw.shape('circle').with.x(10).and.color('blue');
// Leaves { color: 'blue' } option intact
shape.with({ size: 10 }).done();
```

#### Defaults

You can specify default argument values by using the `defaultsTo` chain:

```javascript
var curriedDraw = // ...
  .arg(1).defaultsTo({ x: 0, y: 0 })
  .done();
```

#### Partial assignment

As it can be expected from currying, curried functions may have only
some arguments assigned.

```javascript
var curryAdd = // ...
[1, 2, 3].map(curryAdd.with.x(10).done); // returns [11, 12, 13]
```

### Immutability

All generated curry chains are immutable, so you can safely pass them around.

```javascript
var curriedDraw = // ...
var circle = curriedDraw.type('circle');
var setSize = (shape, sz) => shape.size(sz);

// will draw red circle with size 10
var sizedCircle = setSize(circle.color('red'), 10);
// draws a blue circle with size 25
setSize(circle.color('blue'), 25).done();
// still draws a red circle with size 10
sizedCircle.x(5).y(10).done();
```

### Functional interface

`curry` is implemented using objects. There is also a purely functional implementation,
available via `require('chain-curry/fn')`. Unlike the default implementation,
the functional one does not require the `done` terminator (although it still works):

```javascript
var curry = require('chain-curry/fn');

var curryAdd = curry.fn((x, y) => x + y).where
  .arg(0).has.setter('x').and
  .arg(1).has.setter('y').and
  .language('with', 'and')();
  
[1, 2, 3].map(curryAdd.with.x(10)); // returns [11, 12, 13]
```

Unfortunately, the functional implementation is ~3 times slower than the object one.
This is because the object implementation can use prototypes in order to reuse
setters during chaining; the functional one needs to create new functions
for setters during each chained call.

## License

**curry-chain** is available under the terms of the [Apache 2.0 license](LICENSE).
