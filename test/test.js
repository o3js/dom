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
      assert.equal(
        dom([':span', { class: 'myclass' }], document)
          .className, 'myclass');
    }],
   ],

  ],

  ['Class shorthand',
   ['Single class',
    (document) => {
      assert(
        dom([':span.myclass'], document)
          .className === 'myclass');
    }],

   ['Multiple classes',
    (document) => {
      assert(
        dom([':span.myclass.other-class9'], document)
          .className === 'myclass other-class9');
    }],

   ['Mixed modes result in overridden className',
    (document) => {
      assert.equal(
        dom([':span.1.2', {
          class: '2 3',
        }], document)
          .className, '2 3');
    }],
  ],

  ['ID shorthand',
   ['Single ID',
    (document) => {
      assert.equal(
        dom([':span#myid'], document)
          .id, 'myid');
    },
   ],

   // TODO: should this actually throw?
   ['Multiple IDs',
    (document) => {
      assert.equal(
        dom([':span#myid#nextid'], document)
          .id, 'nextid');
    },
   ],

   // TODO: should this actually throw?
   ['Mixed modes',
    (document) => {
      assert.equal(
        dom([':span#myid', {
          id: 'otherid',
        }], document)
          .id, 'otherid');
    },
   ]],

  ['Mount',
   ['Basics', (document) => {
     dom([':div', {
       mount: (el) => {
         assert.equal(el.tagName, 'DIV');
       },
     }], document);
   }]],

];

