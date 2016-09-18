const assert = require('assert');
const _ = require('lodash');

const isTextNode = (x) => _.isNumber(x) || _.isString(x);

// TODO: this should be stricter... should attributes
// always be a Map type instead of an Object
const isAttributes = (x) => _.isPlainObject(x);

const tagStringRegexp = /^:([a-z][a-z0-9-]*)(([\.#][a-z0-9-]+)*)$/;

const isTagString = (x) => tagStringRegexp.test(x);

const tagString2Name = (x) => x.match(tagStringRegexp)[1];

const getTagName = (x) => tagString2Name(_.head(x));

const hasAttributes = (x) => x.length > 1
      && isAttributes(x[1]);

const getAttributes = (x) => (hasAttributes(x)
                              && x[1]) || undefined;

const getClasses = (x) => _.map(
  _.head(x).match(/\.[a-z0-9-:]+/g),
  (y) => y.slice(1));

const getId = (x) => _.trimStart(
  _.last(
    _.head(x)
      .match(/#[a-z0-9-:]+/g)),
  '#');

const getChildren = (x) => (hasAttributes(x)
                            ? _.tail(_.tail(x))
                            : _.tail(x));

let isNode = null;

const isElement = (x) => _.isArray(x)
      && isTagString(_.head(x))
      && _.every(getChildren(x), isNode);

const assertElement = (x, loc = 'root', idx = 0) => {
  if (_.isString(x) || _.isNumber(x)) return;
  assert(_.isArray(x),
         `Expected a string/number/array but got "${x}"`
         + ` at location: ${loc}[${idx}]`);
  const ts = _.head(x);
  assert(isTagString(ts),
         `Invalid tag string "${ts}" at location: ${loc}[${idx}]`);
  // TODO: if attributes are present, check those as well
  loc = _.filter([loc, ts]).join('->');
  _.each(getChildren(x), (y, i) => assertElement(y, `${loc}`, i + 1));
};

isNode = (x) => isTextNode(x) || isElement(x);

const attrs2DOMMapping = {
  class: (el, val) => {
    el.className = _.filter([el.className, val]).join(' ');
  },
  id: (el, val) => { el.id = val; },
};

function bindAttrs(el, attrs) {
  _.each(attrs, (val, key) => {
    if (!attrs2DOMMapping[key]) {
      throw new Error('Unsupported attribute: ' + key + ', with value: ' + val);
    }
    attrs2DOMMapping[key](el, val);
  });
}

function render(x, document) {
  if (isTextNode(x)) return document.createTextNode(x);
  if (isElement(x)) {
    const el = document.createElement(getTagName(x));
    el.className = getClasses(x).join(' ');
    el.id = getId(x);
    const attrs = getAttributes(x);
    bindAttrs(el, attrs);
    const children = getChildren(x);
    _.each(children, (c) => el.appendChild(render(c, document)));
    return el;
  }
  return undefined;
}

function dom(x, document) {
  assertElement(x);
  return render(x, document);
}

module.exports = { dom };
