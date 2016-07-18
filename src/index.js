const assert = require('assert');
const _ = require('lodash');

const isTextNode = (x) => _.isNumber(x) || _.isString(x);

// TODO: this should be stricter... should attributes
// always be a Map type instead of an Object
const isAttributes = (x) => _.isPlainObject(x);

const isTagString = (x) => /^:[a-z-]+$/.test(x);

const tagString2Name = (x) => x.match(/^:([a-z][a-z-]*)$/)[1];

const getTagName = (x) => tagString2Name(_.head(x));

const hasAttributes = (x) => x.length > 1
      && isAttributes(x[1]);

// const getAttributes = (x) => (hasAttributes(x)
//                               && x[1]) || undefined;

const getChildren = (x) => (hasAttributes(x)
                            ? _.tail(_.tail(x))
                            : _.tail(x));

let isNode = null;

const isElement = (x) => _.isArray(x)
      && isTagString(_.head(x))
      && _.every(_.tail(x), isNode);

isNode = (x, i) => isTextNode(x)
  || (isAttributes(x) && i === 1)
  || isElement(x);

function render(x, document) {
  if (isTextNode(x)) return document.createTextNode(x);
  if (isElement(x)) {
    const el = document.createElement(getTagName(x));
    // const attrs = getAttributes(x);
    const children = getChildren(x);
    _.each(children, (c) => el.appendChild(render(c, document)));
    return el;
  }
  return undefined;
}

function dom(x, document) {
  assert(isNode(x));
  return render(x, document);
}

module.exports = { dom };
