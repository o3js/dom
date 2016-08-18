/* global suite:false, test:false */

const _ = require('lodash');
const assert = require('assert');
const jsdom = require('jsdom').jsdom;

function parseParams(fn) {
  if (!fn) return [];
  const functionExp = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  const lambdaExp = /^[^\(]*\(\s*([^\)]*)\)\s*=>/m;
  const commentsExp = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  const argExp = /^\s*(\S+?)\s*$/;
  const fnString = fn.toString().replace(commentsExp, '');
  let match = fnString.match(functionExp);
  if (!match) match = fnString.match(lambdaExp);
  const params = match && match[1];
  if (!match || !params) return [];
  return _.map(
    params.split(','),
    (param) => param.match(argExp)[1]);
}

function functionName(fn) {
  assert(_.isFunction(fn), 'Not a function: ' + fn);
  if (fn.name) return fn.name;
  const match = fn.toString().match(/^\s*function\s*(\S*)\s*\(/);
  if (match) return match[1];
  return undefined;
}

function inject(fn, ...args) {
  assert(_.isFunction(fn), 'Not a function: ' + fn);
  const context = _.extend.apply(null, args);
  const params = parseParams(fn);
  const vals = _.map(params, (param) => {
    assert(
      _.has(context, param),
      'Inject parameter missing: ' + param + ', for: ' +
        functionName(fn) || '<anonymous>');
    return context[param];
  });
  return fn(...vals);
}

const isTest = (arr) => _.isArray(arr)
      && arr.length === 2
      && _.isString(arr[0])
      && _.isFunction(arr[1]);

const isSuite = (arr) => _.isArray(arr)
      && _.some(_.tail(arr), _.isArray);

function buildDeps() {
  const document = jsdom('<div id="main"></div>');
  const window = document.defaultView;
  const el = document.getElementById('main');
  return { document, el, window };
}

function runTests(arr) {
  if (isSuite(arr)) {
    suite(_.first(arr), () => _.each(_.tail(arr), runTests));
  } else if (isTest) {
    test(_.first(arr), () => inject(arr[1], buildDeps()));
  } else {
    throw new Error('Invalid test structure', arr);
  }
}

_.each(require('./test'), runTests);
