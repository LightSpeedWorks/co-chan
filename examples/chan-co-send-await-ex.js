// require the dependencies
// 依存関係 require
try {
  var chan = require('../lib/chan');
} catch (err) {
  var chan = require('co-chan');
}
var co   = require('co');

// make two channels
// 2つのチャネルを作成します。
var ch1 = chan();  // default buffer size = 0
var ch2 = chan();  // デフォルトバッファサイズはゼロ

co(function *() {

  // receive value from channel 1
  // チャネル#1から値を受け取ります。
  var value = yield ch1;
  console.log('recv: ch1 =', value);

  // send value into channel 2, await for receive
  // チャネル#2に値を送り込み、受け取られるまで待ちます。
  yield ch2(34);
  console.log('sent: ch2 = 34');

  try {
    // receive error from channel 1
    // チャネル#1からエラーを受け取ります。
    value = yield ch1;
    console.log('recv: ch1 =', value);
  } catch (err) {
    console.log('recv: ch1 err', String(err));
  }

  // close the channel 2
  // チャネル#2を閉じます。
  ch2.end();

})();

co(function *() {

  // send value into channel 1, await for receive
  // チャネル#1に値を送り込み、受け取られるまで待ちます。
  yield ch1(12);
  console.log('sent: ch1 = 12');

  // receive value from channel 2
  // チャネル#2から値を受け取ります。
  var value = yield ch2;
  console.log('recv: ch2 =', value);

  // send error into channel 1, await for receive
  // チャネル#1に値を送り込み、受け取られるまで待ちます。
  yield ch1(new Error('custom error'));
  console.log('sent: ch1 err');

  // receive value from closing channel 2
  // 閉じられようとしているチャネル#2から値を受け取ります。
  value = yield ch2;
  if (value === ch2.empty) {
    console.log('recv: ch2 is empty');
  } else {
    console.log('recv: ch2 =', value);
  }

})();

// recv: ch1 = 12
// sent: ch1 = 12
// recv: ch2 = 34
// sent: ch2 = 34
// recv: ch1 err Error: custom error
// sent: ch1 err
// recv: ch2 is empty
