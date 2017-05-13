'use strict';

const wrapper = require('./lib/wrapper');
const curryObj = require('./lib/curry-object');

const curry = module.exports = wrapper(curryObj);
curry.updaters = require('./lib/updaters');
