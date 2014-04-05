// require the dependencies
// 依存関係 require
try {
  var chan = require('../lib/chan');
} catch (err) {
  var chan = require('co-chan');
}
var co   = require('co');
var fs   = require('fs');

// make a new channel
// 新しいチャネルを作成します。
var ch = chan();

// execute a co generator
// co generator を実行します。
co(function *() {

  // pass the channel as the callback to filesystem read file function
  // this will push the file contents in to the channel
  // ファイルシステムのファイル読込み関数のコールバックとして
  // チャネルを渡すと、ファイル内容がチャネルに送り込まれます。
  fs.readFile(__dirname + '/README.md', ch);

  // yield the channel to pull the value off the channel
  // チャネルを yield するとチャネルの値を受け取れます。
  var contents = yield ch;

  // use the value as you like
  // 後は好きに値が使えます。
  console.log(String(contents));

})();
