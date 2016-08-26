const assert = require('assert');
const _ = require('lodash');

const isTextNode = (x) => _.isNumber(x) || _.isString(x);

// TODO: this should be stricter... should attributes
// always be a Map type instead of an Object
const isAttributes = (x) => _.isPlainObject(x);

const tagStringRegexp = /^:([a-z][a-z0-9-]*)$/;

const isTagString = (x) => tagStringRegexp.test(x);

const tagString2Name = (x) => x.match(tagStringRegexp)[1];

const getTagName = (x) => tagString2Name(_.head(x));

const hasAttributes = (x) => x.length > 1
      && isAttributes(x[1]);

const getAttributes = (x) => (hasAttributes(x)
                              && x[1]) || undefined;

const getChildren = (x) => _.reduce(
  (hasAttributes(x)
   ? _.tail(_.tail(x))
   : _.tail(x)),
  (result, item) => {
    if (_.isArray(item)
        && (_.isArray(item[0]) || _.isEmpty(item))) {
      _.each(item, (i) => { result.push(i); });
    } else {
      result.push(item);
    }
    return result;
  }, []);

let isNode;

const isElement = (x) => _.isArray(x)
      && isTagString(_.head(x))
        && _.every(getChildren(x), (c) => {
          const r = isNode(c);
          return r;
        });

isNode = (x) => isTextNode(x) || isElement(x) || x.subscribe;

const assertElement = (x, loc = 'root', idx = 0) => {
  if (x.subscribe) {
    return;
  }
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


const attrs2DOMMapping = {
  class: (el, val) => { el.className = val; },
  style: (el, val) => { el.style.cssText = val; },
};

function bindAttrs(el, attrs) {
  _.each(attrs, (val, key) => {
    const mapper = attrs2DOMMapping[key] || ((e, v) => { e[key] = v; });
    mapper(el, val);
  });
}

let setDynamic;
const render = (x, document) => {
  if (x.subscribe) {
    let el;
    x.subscribe((xPrime) => {
      if (el) el = setDynamic(el, xPrime);
      else el = render(xPrime, document);
    });
    el = el || render([':place-holder'], document);
    return el;
  }
  if (isTextNode(x)) return document.createTextNode(x);
  if (isElement(x)) {
    const el = document.createElement(getTagName(x));
    const attrs = getAttributes(x);
    bindAttrs(el, attrs);
    const children = getChildren(x);
    _.each(children, (c) => el.appendChild(render(c, document)));
    return el;
  }
  return undefined;
};

const getDocument = (el) => {
  if (el.ownerDocument) return el.ownerDocument;
  while (el.parentNode) {
    el = el.parentNode;
  }
  return el;
};

const removeChildren = (el) => {
  while (el.lastChild) {
    el.removeChild(el.lastChild);
  }
};

const replaceEl = (oldEl, newEl) => {
  if (oldEl.parentNode) {
    oldEl.parentNode.replaceChild(newEl, oldEl);
  }
  return newEl;
};

const setText = (el, text) => {
  if (el.nodeType !== 3) {
    // not already a text node, so replace with one
    const newEl = getDocument(el).createTextNode(text);
    el.parentNode.replaceChild(newEl, el);
    return newEl;
  }
  removeChildren(el);
  el.data = text;
  return el;
};

const setStructure = (el, x) => {
  removeChildren(el);
  return replaceEl(el, render(x, getDocument(el)));
};

setDynamic = (el, x) => {
  if (_.isString(x) || _.isNumber(x)) {
    return setText(el, x);
  }
  return setStructure(el, x);
};

function dom(x, document) {
  assertElement(x);
  const r = render(x, document);
  return r;
}

function attach(document, tag, x) {
  document
    .getElementById(tag.slice(1))
    .appendChild(dom(x, document));
}

module.exports = { dom, attach };
