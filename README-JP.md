aa-chan - async await channel
=============================

  [English version](README.md#readme)

  [co](https://github.com/visionmedia/co) と一緒に非常にうまく動作する
  [Go](http://golang.org) 言語スタイル・チャネルの実装です。

インストレーション
------------------

```bash
$ npm install aa-chan
```

使い方
------

  **aa-chan** は直接 ES6 Harmony の機能を使用していませんが、
  ES6 generators をベースにした制御フローライブラリである
  [co](https://github.com/visionmedia/co)
  で非常にうまく動作する様にデザインされています。

  以下に示す使用例は co を使用しており、`node 0.11.x` (unstable) が必要で、
  実行する時に `--harmony-generators` または `--harmony` フラグが必要です。
  将来の node.js の安定版には generators のサポートが含まれるでしょう。

### co generators を使用した例

```js
// 依存関係 require
var chan = require('aa-chan');
var co   = require('co');
var fs   = require('fs');

// 新しいチャネルを作成します。
var ch = chan();

// co generator を実行します。
co(function *() {

  // ファイルシステムのファイル読込み関数のコールバックとして
  // チャネルを渡すと、ファイル内容がチャネルに送り込まれます。
  fs.readFile(__dirname + '/README.md', ch);

  // チャネルを yield するとチャネルの値を受け取れます。
  var contents = yield ch;

  // 後は好きに値が使えます。
  console.log(String(contents));

})();
```

### 非同期に値を送り込み、値の受け取りを待ちます。

```js
// 依存関係 require
var chan = require('aa-chan');
var co   = require('co');

// 2つのチャネルを作成します。
var ch1 = chan();
var ch2 = chan();

co(function *() {

  // チャネル#1から値を受け取ります。
  var value = yield ch1;

  // チャネル#2に値を送り込みます。
  ch2(34);

})();

co(function *() {

  // チャネル#1に値を送り込みます。
  ch1(12);

  // チャネル#2から値を受け取ります。
  var value = yield ch2;

})();
```

### 値の送り込みを待ち、値の受け取りを待ちます。

```js
// 依存関係 require
var chan = require('aa-chan');
var co   = require('co');

// 2つのチャネルを作成します。
var ch1 = chan();  // デフォルトバッファサイズはゼロ
var ch2 = chan();

co(function *() {

  // チャネル#1から値を受け取ります。
  var value = yield ch1;

  // チャネル#2に値を送り込み、受け取られるまで待ちます。
  yield ch2(34);

  try {
    // チャネル#1からエラーを受け取ります。
    value = yield ch1;
  } catch (err) {
    console.log(String(err));
  }

  // チャネル#2を閉じます。
  ch2.end();

})();

co(function *() {

  // チャネル#1に値を送り込み、受け取られるまで待ちます。
  yield ch1(12);

  // チャネル#2から値を受け取ります。
  var value = yield ch2;

  // チャネル#1に値を送り込み、受け取られるまで待ちます。
  yield ch1(new Error('custom error'));

  // 閉じられようとしているチャネル#2から値を受け取ります。
  value = yield ch2;
  if (value === ch2.empty) {
    console.log('チャネル#2は空');
  }

})();
```

付録
----

co を使用しないで使用する場合

### チャネルに送り込み、チャネルから受け取ります

```js
// 依存関係 require
var chan = require('aa-chan');

// 新しいチャネルを作成します。
var ch = chan();

// チャネルに値を送り込みます。
ch(123);

// チャネルから値を受け取ります。
ch(function (err, value) {
  console.log(value);
});
```

### get value from regular node function, set channel as callback function

```js
// 依存関係 require
var chan = require('aa-chan');

// 新しいチャネルを作成します。
var ch = chan();

// ファイルシステムのファイル読込み関数のコールバックとして
// チャネルを渡すと、ファイル内容がチャネルに送り込まれます。
fs.readFile(__dirname + '/README.md', ch);

// コールバック関数を引数にチャネルを呼び出すと、チャネルの値を受け取れます。
ch(function (err, contents) {
  console.log(String(contents));
});
```
