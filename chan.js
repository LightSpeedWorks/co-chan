// chan.js

(function() {
	'use strict';

	var slice = Array.prototype.slice;

	// recv:
	//   yield chan -> (cb)
	//   yield chan.recv -> (cb)

	// send:
	//   yield chan() -> (cb)
	//   yield chan(val) -> (cb)
	//   yield chan(err) -> (cb)
	//   yield chan(err, val) -> (cb)
	//   yield chan([err,] val1, val2, val3, ...) -> (cb)
	//   yield chan.send() -> (cb)
	//   yield chan.send(val) -> (cb)
	//   yield chan.send(err) -> (cb)
	//   yield chan.send(array) -> (cb)

	// property:
	//   chan.size - buffer size
	//   chan.empty - empty object if channel is empty

	// close:
	//   chan.close()

	// is done? is closed?:
	//   chan.done()

	// for readable stream:
	//   chan.end -> (cb)
	//   chan.readable -> (cb)

	//   stream.on('end', chan.end);
	//   stream.on('error', chan);
	//   stream.on('readable', chan.readable);
	//   stream.on('data', chan); // for old style stream

	function Channel(empty, size) {
		if (arguments.length > 2)
			throw new Error('makeChan: too many arguments');

		function channel(a, b) {
			// yield callback
			if (typeof a === 'function')
				return channel.recv(a);

			// error
			if (a instanceof Error)
				return channel.send(a);

			// value or undefined
			if (arguments.length <= 1)
				return channel.send(a);

			var args = slice.call(arguments);

			if (a == null) {
				if (arguments.length === 2)
					return channel.send(b);
				else
					args.shift();
			}

			// (null, value,...) -> [value, ...]
			return channel.send(args);
		}

		var isClosed = false;    // send stream is closed
		var isDone = false;      // receive stream is done
		var recvCallbacks = [];  // receive pending callbacks queue
		var sendCallbacks = [];  // send pending callbacks and values queue
		var buffCallbacks = [];  // send pending callbacks and values buffer

		if (typeof empty === 'number' && typeof size === 'undefined') {
			size = empty;
			empty = undefined;
		}

		if (typeof empty === 'function')
			empty = new empty();

		if (typeof size === 'undefined')
			size = 0;

		// enqueue into buffer
		var enq = function enq(bomb) {
			if (buffCallbacks.length < size) {
				buffCallbacks.push(bomb);
				bomb.sent = true;
			}
			else
				sendCallbacks.push(bomb);
		}

		// dequeue from buffer or pendings
		var deq = function deq() {
			var bomb = null;
			if (buffCallbacks.length > 0) {
				bomb = buffCallbacks.shift();
				if (sendCallbacks.length > 0)
					enq(sendCallbacks.shift());
			}
			else if (sendCallbacks.length > 0)
				bomb = sendCallbacks.shift();
			return bomb;
		}

		var send = function send(val) {
			if (isClosed)
				throw new Error('Cannot send to closed channel');

			var bomb = {cb:null, val:val, called:false, sent:false};
			function channel(cb) {
				if (!bomb.cb) {
					if (!cb) cb = function dummyCallback(){};
					bomb.cb = cb;
				}

				if (bomb.sent)
					fire(bomb);
			} // channel(cb)

			enq(bomb);
			if (recvCallbacks.length > 0) {
				bomb = deq();
				complete(recvCallbacks.shift(), bomb.val);
				fire(bomb);
			}
			return channel;
		}; // send

		var recv = function recv(cb) {
			if (done())
				return complete(cb, empty);

			var bomb = deq();
			if (bomb) {
				complete(cb, bomb.val);
				fire(bomb);
			}
			else
				recvCallbacks.push(cb);
			return;
		}; // recv

		var done = function done() {
			if (!isDone && isClosed &&
					buffCallbacks.length === 0 &&
					sendCallbacks.length === 0) {
				isDone = true;
				// call each pending callback with the empty value
				recvCallbacks.forEach(function(cb) { complete(cb, empty); });
			}

			return isDone;
		}; // done

		var close = function close() {
			isClosed = true;
			return done();
		}; // close

		var readable = function readable() {
			var buf = this.read();
			if (!buf) return;
			send(buf);
		}; // readable

		var stream = function stream(stream) {
			stream.on('end', close);
			stream.on('error', send);
			stream.on('readable', readable);
			return this;
		}; // stream

		channel.size  = size;
		channel.empty = empty;
		channel.close = close;
		channel.done  = done;
		channel.send  = send;
		channel.recv  = recv;

		// for stream
		channel.end      = close;
		channel.readable = readable;
		channel.stream   = stream;

		return channel;

	} // Channel

	function complete(cb, val) {
		if (val instanceof Error)
			cb(val);
		else
			cb(null, val);
	} // complete

	function fire(bomb) {
		bomb.sent = true;
		if (!bomb.cb || bomb.called) return;
		bomb.called = true;
		bomb.cb(null, bomb.val);
	} // fire

	module.exports = Channel;

})();
