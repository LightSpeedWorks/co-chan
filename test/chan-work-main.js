// test

describe('test chan', function () {
  'use strict';

  var assert = require('assert');

  try {
    var chan = require('../lib/chan');
  } catch (err) {
    var chan = require('co-chan');
  }

  var act1 = [];
  var act2 = [];

  function cb(err, val) {
    act1.push([err, val]);
    /*
    if (err)
      console.log('recv: '+ err);
    else if (val && typeof val === 'object' && ch.empty === val)
      console.log('recv: empty');
    else
      console.log('recv: val = ' + val);
    */
  } // cb

  function cb2(err, val) {
    act2.push([err, val]);
    /*
    if (err)
      console.log('sent: '+ err);
    else if (val && typeof val === 'object' && ch.empty === val)
      console.log('sent: empty');
    else
      console.log('sent: val = ' + val);
    */
  } // cb2

  it('test 1 channel send async', function () {

    act1 = [];

    var ch = chan();
    // console.log('ch 1');
    ch(1); // send
    assert.deepEqual(act1, [], 'send 1');

    // console.log('ch 2');
    ch(2); // send
    assert.deepEqual(act1, [], 'send 2');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, 1], 'recv 1');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, 2], 'recv 2');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1, [], 'recv 3 pending');

    // console.log('ch 3');
    ch(3); // send
    assert.deepEqual(act1.shift(), [null, 3], 'recv 3');

    // console.log('ch.end');
    ch.end(); // end
    assert.deepEqual(act1, [], 'send end');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, ch.empty], 'recv empty 1');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, ch.empty], 'recv empty 2');

    var thru = false;
    try {
      // console.log('ch 4');
      ch(4); // send
      thru = true;
    } catch(err) {
      // console.log(err + ': 4 cant send');
    }
    if (thru) assert(false, 'send 4 fall thru');
    // console.log();

  }); // it

  it('test 1 channel send sync size 0', function () {

    act1 = [];
    act2 = [];

    var ch = chan();

    // console.log('ch 1');
    ch(1)(cb2); // send
    assert.deepEqual(act2, [], 'send 1 pending');

    // console.log('ch 2');
    ch(2)(cb2); // send
    assert.deepEqual(act2, [], 'send 2 pending');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, 1], 'recv 1');
    assert.deepEqual(act2.shift(), [null, 1], 'send 1');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, 2], 'recv 2');
    assert.deepEqual(act2.shift(), [null, 2], 'send 2');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1, [], 'recv 3 pending');

    // console.log('ch 3');
    ch(3)(cb2); // send
    assert.deepEqual(act2.shift(), [null, 3], 'send 3');
    assert.deepEqual(act1.shift(), [null, 3], 'recv 3');

    // console.log('ch.end');
    ch.end(); // end
    assert.deepEqual(act1, [], 'recv end pending');
    assert.deepEqual(act2, [], 'send end pending');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, null], 'recv end');

    // console.log('ch');
    ch(cb); // recv
    assert.deepEqual(act1.shift(), [null, null], 'recv end');

    var thru = false;
    try {
      // console.log('ch 4');
      ch(4)(cb2); // send
      thru = true;
    } catch(err) {
      // console.log(err + ': 4 cant send')
    }
    if (thru) assert(false, 'send 4 fall thru');
    // console.log();
    assert.deepEqual(act1, [], 'recv end pending');
    assert.deepEqual(act2, [], 'send end pending');

  }); // it

  it('test 1 channel send sync size 1', function () {

    act1 = [];
    act2 = [];

    console.log('1#%j 2#%j', act1, act2);

    var ch = chan(null, 1);

    // console.log('ch 1');
    ch(1)(cb2); // send

    // console.log('ch 2');
    ch(2)(cb2); // send

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch 3');
    ch(3)(cb2); // send

    // console.log('ch.end');
    ch.end(); // end

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log();

  }); // it

  it('test 1 channel send sync size 2', function () {

    act1 = [];
    act2 = [];

    var ch = chan(null, 2);

    // console.log('ch 1');
    ch(1)(cb2); // send

    // console.log('ch 2');
    ch(2)(cb2); // send

    // console.log('ch 3');
    ch(3)(cb2); // send

    // console.log('ch 4');
    ch(4)(cb2); // send

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch 5');
    ch(5)(cb2); // send

    // console.log('ch 6');
    ch(6)(cb2); // send

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch.end');
    ch.end(); // end

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log();

  }); // it

  it('test 1 channel send sync size Infinity', function () {

    act1 = [];
    act2 = [];

    var ch = chan(null, Infinity);

    // console.log('ch 1');
    ch(1)(cb2); // send

    // console.log('ch 2');
    ch(2)(cb2); // send

    // console.log('ch 3');
    ch(3)(cb2); // send

    // console.log('ch 4');
    ch(4)(cb2); // send

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch 5');
    ch(5)(cb2); // send

    // console.log('ch 6');
    ch(6)(cb2); // send

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch.end');
    ch.end(); // end

    // console.log('ch');
    ch(cb); // recv

    // console.log('ch');
    ch(cb); // recv

    // console.log();

  }); // it

}); // describe
