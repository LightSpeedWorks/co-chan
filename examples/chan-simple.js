// chan.js

(function() {
	'use strict';

	var slice = Array.prototype.slice;

	// recv: chan(cb)
	// send: chan(err, data)
	// send: chan() or chan(undefined)
	// send: chan(data)
	// send: chan(val or err)
	// chan.end()
	// chan.readable()
	// chan.size
	// chan.empty
	// chan.done()

	function Channel(empty) {
		if (arguments.length > 1)
			throw new Error('Channel: too many arguments');

		function channel(a, b) {
			// yield callback
			if (typeof a === 'function')
				return recv(a);

			// error
			if (a instanceof Error)
				return send(a);

			// value or undefined
			if (arguments.length <= 1)
				return send(a);

			var args = slice.call(arguments);

			if (a == null) {
				if (arguments.length === 2) {
					return send(b);
				}
				else {
					args.shift();
				}
			}

			// (null, value,...) -> [value, ...]
			return send(args);
		}

		var isClosed = false;    // send stream is closed
		var isDone = false;      // receive stream is done
		var recvCallbacks = [];  // receive pending callbacks queue
		var values        = [];  // send pending values

		if (typeof empty === 'undefined')
			empty = new Object();
		else if (typeof empty === 'function')
			empty = new empty();

		function send(val) {
			if (isClosed)
				throw new Error('Cannot send to closed channel');
			else if (recvCallbacks.length > 0)
				complete(recvCallbacks.shift(), val);
			else
				values.push(val);
		} // send

		function recv(cb) {
			if (done())
				complete(cb, empty);
			else if (values.length > 0)
				complete(cb, values.shift());
			else
				recvCallbacks.push(cb);
			return;
		} // recv

		function done() {
			if (!isDone && isClosed && values.length === 0) {
				isDone = true;
				// complete each pending callback with the empty value
				var cb;
				while (cb = recvCallbacks.shift())
					complete(cb, empty);
				//recvCallbacks.forEach(function(cb) { complete(cb, empty); });
			}

			return isDone;
		} // done

		function close() {
			isClosed = true;
			return done();
		} // close

		function readable() {
			var buf = this.read();
			if (!buf) return;
			send(buf);
		} // readable

		channel.empty = empty;
		channel.close = close;
		channel.done  = done;

		// for stream
		channel.end      = close;
		channel.readable = readable;

		return channel;

	} // Channel

	function complete(cb, val) {
		if (val instanceof Error)
			cb(val);
		else
			cb(null, val);
	} // complete

	module.exports = Channel;

})();
