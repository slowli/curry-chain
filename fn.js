'use strict';

const wrapper = require('./lib/wrapper');
const curryFn = require('./lib/curry-fn');

const curry = module.exports = wrapper(curryFn);
curry.updaters = require('./lib/updaters');
