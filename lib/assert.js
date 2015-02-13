var env = require('./env')



module.exports = assert



function assert(bool, message) {

  if (!bool) {

    if (!env.isProd) {
      throw new Error(message)
    }

    else if (typeof console === 'object' && typeof console.warn === 'function' ) {
      console.warn(message)
    }
  }
}



assert.number = function assertIsNumber(x, message) {
  assert(typeof x === 'number', message)
}

assert.object = function assertObject(x, message) {
  assert(typeof x === 'object', message)
}
