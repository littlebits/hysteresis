var env = require('./env')



module.exports = hysteresis

/*  Threshold :: [Int, Int]

    Threshold is modeled as a pair.
    First is the lower t.
    Second is the upper t boundary.
*/
/*  hysteresis :: Threshold a => a, { initialSide: Int } -> (Int -> Boolean)
*/
function hysteresis(threshold, config){
  /* Assert user input except when in production where we should log
  instead of crash the program.*/
  if (!env.isProd) {
    if (typeof threshold[0] !== 'number') throw new Error('hysteresis: Invalid t type. Lower value must be a number.')
    if (typeof threshold[1] !== 'number') throw new Error('hysteresis: Invalid t type. Upper value must be a number.')
    if (threshold[0] > threshold[1]) throw new Error('hysteresis: Invalid t. Lower cannot be less than upper.')
    if (config && typeof config !== 'object') throw new Error('hysteresis: Invalid config type. Config must be a plain object.')
    if (config && typeof config['initialSide'] !== 'number') throw new Error('hysteresis: Invalid initialSide config type: Must be number 0, 1, or not specified at all.')
    if (config && !(config['initialSide'] === 1 || config['initialSide'] === 0)) throw new Error('hysteresis: Invalid initialSide config: must 0, 1 or not specified at all.')
    // TODO validate all config options
  }

  /* `side` tracks what side of the t the last given value was. 0 represents
  below the t and 1 represents above it.*/
  config = config || {}
  var side = config.hasOwnProperty('initialSide') ? config['initialSide'] : null
  var crossDirs = checkTypes[config.checkType || 'crossesOrMeets']
  var oppositeBounds = threshold.concat().reverse()

  /* If not given an `initialSide` should the first number be checked
  for having crossed the upper or lower threshold bounds? 0 indicates the former
  while 1 the latter. This is backwards but maes sense given the lookups are
  sorted in terms of which side the value is coming *from*.
  To hide this bacwardness from the user config we flip any user-given number.
  By default we bias to check for having crossed the upper threshold.*/
  var initialBias = config.hasOwnProperty('initialBias') ? +!config['initialBias'] : 0

  /* Return a function to track how values move
  around the t.*/
  return function howAaroundThreshold(number){
    // TODO annotate
    if (side === null) {
      side = +checkCrossed(crossDirs[initialBias], number, oppositeBounds[initialBias])
      return 0
    }
    // TODO annotate
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
