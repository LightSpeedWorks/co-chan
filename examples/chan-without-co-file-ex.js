// require the dependencies
// 依存関係 require
try {
  var chan = require('../lib/chan');
} catch (err) {
  var chan = require('co-chan');
}
var fs   = require('fs');

// make a new channel
// 新しいチャネルを作成します。
var ch = chan();

// pass the channel as the callback to filesystem read file function
// this will push the file contents in to the channel
// ファイルシステムのファイル読込み関数のコールバックとして
// チャネルを渡すと、ファイル内容がチャネルに送り込まれます。
fs.readFile(__dirname + '/README.md', ch);
console.log('read: to ch');

// call with callback to the channel as thunk to pull the value off the channel
// コールバック関数を引数にチャネルを呼び出すと、チャネルの値を受け取れます。
ch(function (err, contents) {
  if (err) {
    console.log('recv: ch err', String(err));
  } else {
    console.log('recv: ch =', String(contents));
  }
});

// read: to ch
// recv: ch = this is README.md
