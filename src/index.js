const assert = require('assert');
const _ = require('lodash');

const isTextNode = (x) => _.isNumber(x) || _.isString(x);
const isSubscribable = (x) => x && x.subscribe;

// TODO: this should be stricter... should attributes
// always be a Map type instead of an Object
const isAttributes = (x) => _.isPlainObject(x) && !x.subscribe;

const tagStringRegexp = /^:([a-z][a-z0-9-]*)(([\.#][a-z0-9-]+)*)$/;

const isTagString = (x) => tagStringRegexp.test(x);

const tagString2Name = (x) => x.match(tagStringRegexp)[1];

const getTagName = (x) => tagString2Name(_.head(x));

const hasAttributes = (x) => x.length > 1
      && isAttributes(x[1]);

const getAttributes = (x) => (hasAttributes(x)
                              && _.omit(x[1], ['mount'])) || undefined;

const getMountFn = (x) => (hasAttributes(x)
                           && x[1].mount) || _.noop;

const getClasses = (x) => _.map(
  _.head(x).match(/\.[a-z0-9-:]+/g),
  (y) => y.slice(1));

const getId = (x) => _.trimStart(
  _.last(
    _.head(x)
      .match(/#[a-z0-9-:]+/g)),
  '#');

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
        && _.every(getChildren(x), isNode);

isNode = (x) => isTextNode(x) || isElement(x) || isSubscribable(x);

const assertElement = (x, loc = 'root', idx = 0) => {
  if (isTextNode(x) || isSubscribable(x)) return;
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
  class: (el, val) => {
    el.className = val;
  },
  id: (el, val) => { el.id = val; },
  style: (el, val) => { el.style.cssText = val; },
};

function bindAttrs(el, attrs) {
  _.each(attrs, (val, key) => {
    const mapper = attrs2DOMMapping[key] || ((e, v) => { e[key] = v; });
    if (val.subscribe) {
      val.subscribe((vPrime) => {
        mapper(el, vPrime);
      });
    } else {
      mapper(el, val);
    }
  });
}

function triggerRelease(el) {
  if (!el) return;
  _.each(el.children, triggerRelease);
  if (el.__onRelease) {
    _.each(el.__onRelease, cb => {
      cb();
    });
  }
}

let setDynamic;
const render = (x, document) => {
  if (x.subscribe) {
    let el;
    x.subscribe((xPrime) => {
      triggerRelease(el);
      if (el) el = setDynamic(el, xPrime);
      else el = render(xPrime, document);
    });
    el = el || render([':place-holder'], document);
    return el;
  }
  if (isTextNode(x)) return document.createTextNode(x);
  if (isElement(x)) {
    const el = document.createElement(getTagName(x));
    el.className = getClasses(x).join(' ');
    el.id = getId(x);
    const attrs = getAttributes(x);
    bindAttrs(el, attrs);
    const children = getChildren(x);
    _.each(children, (c) => el.appendChild(render(c, document)));
    getMountFn(x)(el, (cb) => {
      if (!el.__onRelease) el.__onRelease = [];
      el.__onRelease.push(cb);
    });
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
  assertElement(x);
  if (_.isString(x) || _.isNumber(x)) {
    return setText(el, x);
  }
  return setStructure(el, x);
};

function renderStatic(arr, indent) {
  if (!arr) {
    return '';
  }
  if (_.isArray(arr[0])) {
    return _.map(arr, item => renderStatic(item, indent)).join('\n');
  }
  if (_.isString(arr) || _.isNumber(arr)) {
    return [_.times(indent, () => '  ').join(''), arr].join('');
  }
  if (_.isPlainObject(arr)) {
    return null;
  }
  const attrs = arr.length > 1 && _.isPlainObject(arr[1]) && arr[1];
  const tagName = arr[0].slice(1);
  return _.filter([
    [_.times(indent, () => '  ').join(''),
     '<',
     tagName,
     _.map(attrs, (v, k) => ` ${k}="${v}"`).join(''),
     '>',
    ].join(''),
    arr.length > 1
      ? _.filter(
        _.map(_.tail(arr), (item) => renderStatic(item, indent + 1))).join('\n')
      : null,
    _.find(['input'], (i) => i === tagName)
      ? null
      : [_.times(indent, () => '  ').join(''), '</', tagName, '>'].join(''),
  ]).join('\n');
}

module.exports = {
  render: (x, document) => {
    assertElement(x);
    return render(x, document);
  },
  renderStatic: (x) => renderStatic(x, 0),
};
