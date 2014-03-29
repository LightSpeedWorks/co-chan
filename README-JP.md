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
  console.log('recv: ch1 =', value);

  // チャネル#2に値を送り込みます。
  ch2(34);
  console.log('send: ch2 = 34');

})();

co(function *() {

  // チャネル#1に値を送り込みます。
  ch1(12);
  console.log('send: ch1 = 12');

  // チャネル#2から値を受け取ります。
  var value = yield ch2;
  console.log('recv: ch2 =', value);

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
  console.log('recv: ch1 =', value);

  // チャネル#2に値を送り込み、受け取られるまで待ちます。
  yield ch2(34);
  console.log('send: ch2 = 34');

  try {
    // チャネル#1からエラーを受け取ります。
    value = yield ch1;
    console.log('recv: ch1 =', value);
  } catch (err) {
    console.log(String(err));
  }

  // チャネル#2を閉じます。
  ch2.end();

})();

co(function *() {

  // チャネル#1に値を送り込み、受け取られるまで待ちます。
  yield ch1(12);
  console.log('send: ch1 = 12');

  // チャネル#2から値を受け取ります。
  var value = yield ch2;
  console.log('recv: ch2 =', value);

  // チャネル#1に値を送り込み、受け取られるまで待ちます。
  yield ch1(new Error('custom error'));
  console.log('send: ch1 err');

  // 閉じられようとしているチャネル#2から値を受け取ります。
  value = yield ch2;
  if (value === ch2.empty) {
    console.log('ch2 is empty');
  } else {
    console.log('recv: ch2 =', value);
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
console.log('send: ch = 123');

// チャネルから値を受け取ります。
ch(function (err, value) {
  if (err) {
    console.log('recv: ch err', String(err));
  } else {
    console.log('recv: ch =', value);
  }
});
```

### 通常の node 関数から値を取得するために、コールバック関数としてチャネルをセットする

```js
// 依存関係 require
var chan = require('aa-chan');
var fs   = require('fs');

// 新しいチャネルを作成します。
var ch = chan();

// ファイルシステムのファイル読込み関数のコールバックとして
// チャネルを渡すと、ファイル内容がチャネルに送り込まれます。
fs.readFile(__dirname + '/README.md', ch);
console.log('read: to ch');

// コールバック関数を引数にチャネルを呼び出すと、チャネルの値を受け取れます。
ch(function (err, contents) {
  if (err) {
    console.log('recv: ch err', String(err));
  } else {
    console.log('recv: ch =', String(contents));
  }
});
```

ライセンス
----------

  MIT
