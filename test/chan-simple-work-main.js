// test

'use strict';

var chan = require('../lib/chan-simple');

var ch = chan();

function cb(err, val) {
  if (err) {
    console.log('recv: '+ err);
  }
  else if (typeof val === 'object' && val !== null && ch.empty === val) {
    console.log('recv: empty');
  }
  else {
    console.log('recv: val = ' + val);
  }
} // cb

ch(12);
ch(34);

ch(cb);
ch(cb);
ch(cb);

ch(56);

ch.end();
ch(cb);
ch(cb);

// ch(78);
