var env = require('./env')



module.exports = hysteresis

/*  Threshold :: [Int, Int]

    Threshold is modeled as a pair.
    First is the lower threshold boundary.
    Second is the upper threshold boundary.

    Config :: {
      initialSide :: 1 | 0
      initialIsChange :: Boolean
      initialBias :: 1 | 0
      checkType :: 'crosses' | 'crossesOrMeets'
    }

    hysteresis :: Threshold, Config -> (Int -> Boolean)
*/
function hysteresis(threshold, config){
  /* Assert user input except when in production where we should log
  instead of crash the program.*/
  config = config || {}
  if (!env.isProd) {
    if (typeof threshold[0] !== 'number') throw new Error('hysteresis: Invalid threshold type. Lower value must be a number.')
    if (typeof threshold[1] !== 'number') throw new Error('hysteresis: Invalid threshold type. Upper value must be a number.')
    if (threshold[0] > threshold[1]) throw new Error('hysteresis: Invalid threshold. Lower cannot be less than upper.')
    if (typeof config !== 'object') throw new Error('hysteresis: Invalid config type. Config must be a plain object.')
    if (config.hasOwnProperty('initialSide')) {
      if (typeof config.initialSide !== 'number') throw new Error('hysteresis: Invalid initialSide config type: Must be number 0, 1, or not specified at all.')
      if (!(config.initialSide === 1 || config.initialSide === 0)) throw new Error('hysteresis: Invalid initialSide config: must 0, 1 or not specified at all.')
    }
    // TODO validate all config options
  }

  /* `side` tracks what side of the t the last given value was. 0 represents
  below the t and 1 represents above it.*/
  var side = config.hasOwnProperty('initialSide') ? config.initialSide : null
  var crossDirs = checkTypes[config.checkType || 'crossesOrMeets']
  var oppositeBounds = threshold.concat().reverse()

  /* If not given an `initialSide` should the first number be checked
  for having crossed the upper or lower threshold bounds? 0 indicates the former
  while 1 the latter. This is backwards but maes sense given the lookups are
  sorted in terms of which side the value is coming *from*.
  To hide this bacwardness from the user config we flip any user-given number.
  By default we bias to check for having crossed the upper threshold.*/
  var initialBias = config.hasOwnProperty('initialBias') ? +!config.initialBias : 0

  /* If not given an `initialSide` should the initial side resolution
  be considered a change or not? This is a semantic and existential question
  without a non-surprising answer to someone. Therefore users can configure it
  By default it is considered a change.*/
  var initialIsChange = config.hasOwnProperty('initialIsChange') ? config.initialIsChange : true

  /* Return a function to track how values move
  around the t.*/
  return function howAroundThreshold(number){
    /* If the user did not give an `initialSide` then we use the first received
    number to resolve the `side` state.*/
    if (side === null) {
      side = +checkCrossed(crossDirs[initialBias], number, oppositeBounds[initialBias])
      /* This initiation may or may not count as a change dependong on the
      user config. */
      return initialIsChange ? (side + 1) : 0
    }
    /* Check if this number crosses a threshold. Internally our answer is a
    binary number but externally we return it + 1 because 0 is, for the outside
    world, reserved to mean "no change". Thus 1 means a change wherein the number
    fell below the lower threshold and 2 means a change wherein the number rose
    above the threshold. The important semantic distinction of "crossed" versus
    "crossed-or-met" is a config choice resolved during instantiation.*/
    return  checkCrossed(crossDirs[side], number, oppositeBounds[side])
            ? (side = +!side) + 1
            : 0
  }
}



var checkTypes = {
  crossesOrMeets: ['>=','<='],
  crosses: ['>', '<']
}

function checkCrossed(operator, a, b){
  switch (operator) {
    case '>':  return a > b
    case '<':  return a < b
    case '>=': return a >= b
    case '<=': return a <= b
  }
}
