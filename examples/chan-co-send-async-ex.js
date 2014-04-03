// require the dependencies
// 依存関係 require
try {
  var chan = require('co-chan');
} catch (err) {
  var chan = require('../lib/chan');
}
var co   = require('co');

// make two channels
// 2つのチャネルを作成します。
var ch1 = chan();
var ch2 = chan();

co(function *() {

  // receive value from channel 1
  // チャネル#1から値を受け取ります。
  var value = yield ch1;
  console.log('recv: ch1 =', value);

  // send value into channel 2
  // チャネル#2に値を送り込みます。
  ch2(34);
  console.log('send: ch2 = 34');

})();

co(function *() {

  // send value into channel 1
  // チャネル#1に値を送り込みます。
  ch1(12);
  console.log('send: ch1 = 12');

  // receive value from channel 2
  // チャネル#2から値を受け取ります。
  var value = yield ch2;
  console.log('recv: ch2 =', value);

})();

// recv: ch1 = 12
// send: ch2 = 34
// send: ch1 = 12
// recv: ch2 = 34
