const dom = require('../src').render;
const assert = require('chai').assert;
const z = require('zoetic');

module.exports = [
  ['z.bindel',
   ['Ensure cleanup is called when observable is replaced', (document) => {
     const buttonClick = z.emitter();

     let count = 0;
     const values = [];

     const body = z.observable(
       null,
       z.map(() => {
         count += 1;
         const inputValue = z.emitter();
         const content = [
           ':input', {
             value: count,
             mount: z.bindel('value', 'input', inputValue),
           }];
         return {
           content,
           inputValue,
         };
       }, buttonClick));

     const inputValue = z.mapcat(
       obj => obj ? obj.inputValue : z.emitter([]),
       body);

     z.each(v => {
       values.push(v);
     }, inputValue);

     const el = dom(
       [':div',
        [':button', {
          mount: z.listen('click', buttonClick),
        }, 'Click me'],
        z.map(b => b ? b.content : '', body),
       ], document);

     const button = el.getElementsByTagName('button')[0];

     button.click();
     button.click();
     button.click();

     assert.deepEqual(values, ['1', '2', '3']);
   }],
  ],
];
