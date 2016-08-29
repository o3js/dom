const dom = require('../src').render;
const assert = require('chai').assert;

module.exports = [
  ['Valid tag names',
   ['Lowercase letters, numbers, and hyphens', (document) => {
     assert.doesNotThrow(() => dom([':my-valid-tag29'], document));
   }],
   ['A single leODtter', (document) => {
     assert.doesNotThrow(() => dom([':a'], document));
   }],
   ['Ending with a hyphen', (document) => {
     assert.doesNotThrow(() => dom([':also-valid-'], document));
   }],

   ['Invalid tag names',
    ['Starting with a hyphen', (document) => {
      assert.throws(() => dom([':-invalid'], document));
    }],
    ['A single hyphen', (document) => {
      assert.throws(() => dom([':-'], document));
    }],
    ['Starting with a number', (document) => {
      assert.throws(() => dom([':2real'], document));
    }],
    ['Just a colon', (document) => {
      assert.throws(() => dom([':'], document));
    }],
    ['Empty string', (document) => {
      assert.throws(() => dom([''], document));
    }],
    ['Object', (document) => {
      assert.throws(() => dom([{}], document));
    }],
    ['Undefined', (document) => {
      assert.throws(() => dom([], document));
    }],
    ['Null', (document) => {
      assert.throws(() => dom([null], document));
    }],
   ],
  ],

  ['Basic DOM manipulation',
   ['An empty node', (document) => {
     assert(dom([':span'], document).tagName === 'SPAN');
   }],
   ['A node with a string', (document) => {
     assert(dom([':span', 'hello'], document).textContent === 'hello');
   }],
  ],

  ['Syntax checking',
   ['Null root', () => {
     assert.throws(
       () => dom(null),
         /got "null"/);
   }],
   ['Undefined root', () => {
     assert.throws(
       () => dom(),
         /got "undefined"/);
   }],
   ['Invalid tag string at root', () => {
     assert.throws(
       () => dom(['']),
         /root\[0\]/);
   }],
   ['Invalid tag string two levels down and two in', () => {
     assert.throws(
       () => dom([':span', [':hello', 'what up', [':']]]),
         /root->:span->:hello\[2\]$/);
   }]],

  ['Attributes',
   ['"class"',
    ['An empty string', (document) => {
      assert(
        dom([':span', { class: '' }], document)
          .className === '');
    }],
     ['A non-empty string', (document) => {
       assert(
         dom([':span', { class: 'myclass' }], document)
           .className === 'myclass');
     }],
   ],
  ]];
