// require the dependencies
// 依存関係 require
try {
  var chan = require('aa-chan');
} catch (err) {
  var chan = require('../lib/chan');
}

// make a new channel
// 新しいチャネルを作成します。
var ch = chan();

// send value into the channel
// チャネルに値を送り込みます。
ch(123);
console.log('send: ch = 123');

// receive value from the channel
// チャネルから値を受け取ります。
ch(function (err, value) {
  if (err) {
    console.log('recv: ch err', String(err));
  } else {
    console.log('recv: ch =', value);
  }
});
