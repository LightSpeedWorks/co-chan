[co-chan](https://www.npmjs.org/package/co-chan) - [Go](http://golang.org) like channel
=========================

  A [go](http://golang.org) style channel implementation
  that works well with [co](https://github.com/visionmedia/co).

  Channel has a buffer size, and default size is 0.

  Sender can await until the value pushed into buffer or
  until the value received by receiver.

  [Japanese version/■日本語版はこちら■](README-JP.md#readme)

Installation
------------

[![NPM](https://nodei.co/npm/co-chan.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/co-chan/)
[![NPM](https://nodei.co/npm-dl/co-chan.png?height=2)](https://nodei.co/npm/co-chan/)

```bash
$ npm install co-chan
```

Usage
-----

  **co-chan** does not directly use any ES6 Harmony features, 
  but it is designed to work well with [co](https://github.com/visionmedia/co),
  a control flow library based on ES6 generators.

  The following example uses co and requires `node 0.11.x` (unstable)
  and must be run with the `--harmony-generators` or `--harmony` flag.
  Future stable versions of node.js will include support for generators.

### example using co generators

```js
// require the dependencies
var chan = require('co-chan');
var co   = require('co');
var fs   = require('fs');

// make a new channel
var ch = chan();

// execute a co generator
co(function *() {

  // pass the channel as the callback to filesystem read file function
  // this will push the file contents in to the channel
  fs.readFile(__dirname + '/README.md', ch);

  // yield the channel to pull the value off the channel
  var contents = yield ch;

  // use the value as you like
  console.log(String(contents));

})();
```

### send value asynchronously, await for receive value

```js
// require the dependencies
var chan = require('co-chan');
var co   = require('co');

// make two channels
var ch1 = chan();
var ch2 = chan();

co(function *() {

  // receive value from channel 1
  var value = yield ch1;
  console.log('recv: ch1 =', value);

  // send value into channel 2
  ch2(34);
  console.log('send: ch2 = 34');

})();

co(function *() {

  // send value into channel 1
  ch1(12);
  console.log('send: ch1 = 12');

  // receive value from channel 2
  var value = yield ch2;
  console.log('recv: ch2 =', value);

})();
```

output:

```
recv: ch1 = 12
send: ch2 = 34
send: ch1 = 12
recv: ch2 = 34
```

### await for send value, await for receive value

```js
// require the dependencies
var chan = require('co-chan');
var co   = require('co');

// make two channels
var ch1 = chan();  // default buffer size = 0
var ch2 = chan();

co(function *() {

  // receive value from channel 1
  var value = yield ch1;
  console.log('recv: ch1 =', value);

  // send value into channel 2, await for receive
  yield ch2(34);
  console.log('sent: ch2 = 34');

  try {
    // receive error from channel 1
    value = yield ch1;
    console.log('recv: ch1 =', value);
  } catch (err) {
    console.log('recv: ch1 err', String(err));
  }

  // close the channel 2
  ch2.end();

})();

co(function *() {

  // send value into channel 1, await for receive
  yield ch1(12);
  console.log('sent: ch1 = 12');

  // receive value from channel 2
  var value = yield ch2;
  console.log('recv: ch2 =', value);

  // send error into channel 1, await for receive
  yield ch1(new Error('custom error'));
  console.log('sent: ch1 err');

  // receive value from closing channel 2
  value = yield ch2;
  if (value === ch2.empty) {
    console.log('ch2 is empty');
  } else {
    console.log('recv: ch2 =', value);
  }

})();
```

output:

```
recv: ch1 = 12
sent: ch1 = 12
recv: ch2 = 34
sent: ch2 = 34
recv: ch1 err Error: custom error
sent: ch1 err
recv: ch2 is empty
```

Appendix
--------

without co

### send value into channel, receive value from the channel

```js
// require the dependencies
var chan = require('co-chan');

// make a new channel
var ch = chan();

// send value into the channel
ch(123);
console.log('send: ch = 123');

// receive value from the channel
ch(function (err, value) {
  if (err) {
    console.log('recv: ch err', String(err));
  } else {
    console.log('recv: ch =', value);
  }
});
```

output:

```
send: ch = 123
recv: ch = 123
```

### get value from regular node function, set channel as callback function

```js
// require the dependencies
var chan = require('co-chan');
var fs   = require('fs');

// make a new channel
var ch = chan();

// pass the channel as the callback to filesystem read file function
// this will push the file contents in to the channel
fs.readFile(__dirname + '/README.md', ch);
console.log('read: to ch');

// call with callback to the channel as thunk to pull the value off the channel
ch(function (err, contents) {
  if (err) {
    console.log('recv: ch err', String(err));
  } else {
    console.log('recv: ch =', String(contents));
  }
});
```

output:

```
read: to ch
recv: ch = this is README.md
```

License
-------

  MIT

Git Repository
--------------

  LightSpeedWorks/[co-chan](https://github.com/LightSpeedWorks/co-chan#readme)

[npm-co-chan]: https://nodei.co/npm/co-chan
[npm-co-chan.png]: https://nodei.co/npm/co-chan.png
