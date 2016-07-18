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
  ],

  ['Basic DOM manipulation',

   ['An empty node', (el, document) => {
     el.appendChild(dom([':span'], document));
     assert(el.children[0].tagName === 'SPAN');
   }],


   ['A node with a string', (el, document) => {
     el.appendChild(dom([':span', 'hello'], document));
     assert(el.children[0].textContent === 'hello');
   }],

  ]];
