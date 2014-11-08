# hysteresis [![build status](https://secure.travis-ci.org/littlebits/hysteresis.png)](http://travis-ci.org/littlebits/hysteresis)

An implementation of [hysteresis](http://en.wikipedia.org/wiki/Hysteresis) in JavaScript

## Installation

```sh
$ npm install hysteresis
```
```sh
$ bower install littlebits/hysteresis
```

## Example

There are a variety of use-cases for hysteresis. One use-case at
[littleBits](littlebits.cc) is that we use it to avoid jittery event inference
in the [cloudBit's](http://littlebits.cc/cloud) data stream.

Imagine detecting a rising-edge event in a jittery but generally upward-growing
value. As the value crosses our target threshold value, it may actually go
slightly above and then below multiple times in quick succession, triggering
many events instead of just one.  

```

|                                   /
|                                 /
|=======================/=\=====/===========
|                 / \ /     \ /
|-----------/-\-/---------------------------
|     / \ /
|   /
| /
|-------------------------------------------
                        ✓       ×

✓ rising-edge event detected
× ignore insignificant threshold cross

= target threshold
- hyteresis buffer

```

Here is a naive example:
```js
var Hysteresis = require('hysteresis')
var createServer = require('net').createServer

var server = createServer(9500, function(socket){
  var check = Hysteresis([68,70])
  socket.on('data', function(data){
    var didCross = check(Number(data))
    if (didCross) socket.emit(['release', 'ignite'][didCross - 1], data)
  })
})
```



## API

### Hysteresis
```
Hysteresis(threshold, config) -> (check(number) -> 0 | 1 | 2)`
```

Instantiate a hysteresis instance. You must provide a `threshold` and may optionally provide a `config` object that tweaks behaviour.

`config` exposes the following options:
- `initialSide` – May be `1` or `0`, defaults to `null` causing `side` bootstrapping to be resolved using first received `number`
- `initialBias` – May be `1` or `0`, defaults to `1`
- `initialIsChange` – May be `Boolean`, defaults to `true`
- `checkType` – May be `'crosses'` or `'crossesOrMeets'`, defaults to `'crossesOrMeets'`

The constructor returns a `check` function that accepts `number` and returns one of the following codes:

```
check(number) -> 0 | 1 | 2
```
- `0` – the number did not cross the threshold
- `1` – the number fell below the threshold
- `2` – the number rose above the threshold



**For more details please read the annotated source code and review the tests.**
