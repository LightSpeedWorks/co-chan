'use strict';

// require the dependencies
// 依存関係 require
try {
	var Channel = require('../chan');
} catch (err) {
	var Channel = require('co-chan');
}
var net = require('net');
var co = require('co');

var PORT = 9000;

// Server service
// サーバ・サービス
var server = net.createServer(function (soc) {
	console.log('reader: connected');

	// make a new channel
	// 新しいチャネルを作成します。
	var ch = Channel();

	ch.stream(soc);
	// soc.on('end', ch.end);
	// soc.on('error', ch);
	// soc.on('readable', ch.readable);

	// execute a new thread for reader
	// リーダーのための新しいスレッドを実行する
	co(function *reader() {

		// while the channel is not done
		// チャネルが終わっていない間
		while (!ch.done()) {

			try {
				var buff = yield ch;
				if (buff === ch.empty) {
					console.log('reader: recv: end of stream');
				} else {
					console.log('reader: recv:', String(buff));
				}
			} catch (err) {
				console.log('reader: recv:', String(err));
			}

		}

		console.log('reader: end');
		server.close();
	}); // co reader

}); // net.createServer

server.listen(PORT, function () {
	server.on('error', function (err) {
		console.log('server: err', String(err));
	});
}); // server.listen

// execute a new thread for writer
// ライターのための新しいスレッドを実行する
co(function *writer() {

	var client = net.connect(PORT, function () {
		console.log('writer: connected');
	});

	for (var i = 1; i <= 5; ++i) {
		yield sleep(100);
		client.write('msg ' + i);
		console.log('writer: send: msg ' + i);
	}

	client.end();
	console.log('writer: end');

}); // co writer

function sleep(ms) {
	return function (cb) {
		setTimeout(cb, ms);
	};
} // sleep

// writer: connected
// reader: connected
// writer: send: msg 1
// reader: recv: msg 1
// writer: send: msg 2
// reader: recv: msg 2
// writer: send: msg 3
// reader: recv: msg 3
// writer: send: msg 4
// reader: recv: msg 4
// writer: send: msg 5
// writer: end
// reader: recv: msg 5
// reader: recv: end of stream
// reader: end
