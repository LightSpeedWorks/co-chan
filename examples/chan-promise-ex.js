// require the dependencies
// 依存関係 require
try {
	var Channel = require('../chan');
} catch (err) {
	var Channel = require('co-chan');
}

var chan = Channel();

setTimeout(chan, 300, 'val1');
chan.then(
	function (val) {
		//throw new Error('err1');
		console.log('val1:', val);
		var chan2 = Channel();
		setTimeout(chan2, 300, 'val2');
		return chan2;
	}
)
.then(
	function (val) {
		throw new Error('err2');
		console.log('val2:', val);
		var chan2 = Channel();
		setTimeout(chan2, 300, 'val3');
		return chan2;
	}
)
.catch(
	function (err) {
		console.log('errZ:', err);
	}
);
