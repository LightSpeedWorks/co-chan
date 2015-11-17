// test

describe('test chan simple', function () {
	'use strict';

	var chan = require('../examples/chan-simple');
	var assert = require('assert');

	var ch = chan();
	var act = [];

	function cb(err, val) {
		act.push([err, val]);
	}

	it('test', function () {
		act = [];

		ch(12);
		assert.deepEqual(act, [], 'send 12');
		ch(34);
		assert.deepEqual(act, [], 'send 34');

		ch(cb);
		assert.deepEqual(act.shift(), [null, 12], 'recv 12');
		ch(cb);
		assert.deepEqual(act.shift(), [null, 34], 'recv 34');
		ch(cb);
		assert.deepEqual(act, [], 'recv pending');

		ch(56);
		assert.deepEqual(act.shift(), [null, 56], 'recv 56');

		ch.end();
		assert.deepEqual(act, [], 'recv pending');
		ch(cb);
		assert.deepEqual(act.shift(), [null, ch.empty], 'recv empty');
		ch(cb);
		assert.deepEqual(act.shift(), [null, ch.empty], 'recv empty');

		var thru = false;
		try {
			ch(78);
			thru = true;
		} catch (err) {
			assert.deepEqual(act, [], 'recv end');
		}
		if (thru) assert(false, 'send 78 fall thru');

	}); // it

}); // describe
