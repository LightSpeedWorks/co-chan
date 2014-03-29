aa-chan - async await channel
=============================

  A [go](http://golang.org) style channel implementation
  that works well with [co](https://github.com/visionmedia/co).

  [Japanese version/■日本語版はこちら■](README-JP.md#readme)

Installation
------------

```bash
$ npm install aa-chan
```

Usage
-----

  **aa-chan** does not directly use any ES6 Harmony features, 
  but it is designed to work well with [co](https://github.com/visionmedia/co),
  a control flow library based on ES6 generators.

  The following example uses co and requires `node 0.11.x` (unstable)
  and must be run with the `--harmony-generators` or `--harmony` flag.
  Future stable versions of node.js will include support for generators.

### example using co generators

```js
// require the dependencies
var chan = require('aa-chan');
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
var chan = require('aa-chan');
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


### await for send value, await for receive value

```js
// require the dependencies
var chan = require('aa-chan');
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
  console.log('send: ch2 = 34');

  try {
    // receive error from channel 1
    value = yield ch1;
    console.log('recv: ch1 =', value);
  } catch (err) {
    console.log(String(err));
  }

  // close the channel 2
  ch2.end();

})();

co(function *() {

  // send value into channel 1, await for receive
  yield ch1(12);
  console.log('send: ch1 = 12');

  // receive value from channel 2
  var value = yield ch2;
  console.log('recv: ch2 =', value);

  // send error into channel 1, await for receive
  yield ch1(new Error('custom error'));
  console.log('send: ch1 err');

  // receive value from closing channel 2
  value = yield ch2;
  if (value === ch2.empty) {
    console.log('ch2 is empty');
  } else {
    console.log('recv: ch2 =', value);
  }

})();
```



Appendix
--------

without co

### send value into channel, receive value from the channel

```js
// require the dependencies
var chan = require('aa-chan');

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

### get value from regular node function, set channel as callback function

```js
// require the dependencies
var chan = require('aa-chan');
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

License
-------

  MIT
