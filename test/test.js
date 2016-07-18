const assert = require('assert');
const { dom } = require('../src');

module.exports = [

  ['Valid tag names',
   ['Only lowercase letters', (document) => {
     assert.doesNotThrow(() => dom([':valid'], document));
   }],
   ['Lowercase letters and hyphens', (document) => {
     assert.doesNotThrow(() => dom([':i-am-valid'], document));
   }],
   ['Ending with a hyphen', (document) => {
     assert.doesNotThrow(() => dom([':also-valid-'], document));
   }],
  ],

  ['Invalid tag names',
   ['Starting with a hyphen', (document) => {
     assert.throws(() => dom([':-invalid'], document));
   }],
   ['Just a colon', (document) => {
     assert.throws(() => dom([':'], document));
   }],
   ['Empty string', (document) => {
     assert.throws(() => dom([''], document));
   }],
   ['Undefined', (document) => {
     assert.throws(() => dom([], document));
   }],
   ['Null', (document) => {
     assert.throws(() => dom([null], document));
   }],
  ],

  ['Basic DOM manipulation',
   ['An empty node', (document) => {
     assert(dom([':span'], document).tagName === 'SPAN');
   }],
   ['A node with a string', (document) => {
     assert(dom([':span', 'hello'], document).textContent === 'hello');
   }],
  ],

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
