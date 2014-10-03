var env = require('./env')



module.exports = hysteresis

/*  Threshold :: [Int, Int]

    Threshold is modeled as a pair.
    First is the lower threshold.
    Second is the upper threshold boundary.
*/
/*  hysteresis :: Threshold a => a, { initialSide: Int } -> (Int -> Boolean)
*/
function hysteresis(threshold, config){
  var lower = threshold[0]
  var upper = threshold[1]

  /* `wasAbove` tracks what side of the threshold the last given
  value was. 0 represents below the threshold and 1 represents
  above it.*/
  var wasAbove = (config && (typeof config.initialSide === 'number')) ? Boolean(config.initialSide) : null

  /* Assert user input except when
  in production where we should log
  instead of crash the program.*/
  if (!env.isProd) {
    if (typeof lower !== 'number') throw new Error('hysteresis: Invalid threshold type. Lower value must be a number.')
    if (typeof upper !== 'number') throw new Error('hysteresis: Invalid threshold type. Upper value must be a number.')
    if (upper < lower) throw new Error('hysteresis: Invalid threshold. Lower cannot be less than upper.')
    if (config && typeof config !== 'object') throw new Error('hysteresis: Invalid config type. Config must be a plain object.')
    if (config && typeof config.initialSide !== 'number') throw new Error('hysteresis: Invalid initialSide config type: Must be number 0, 1, or not specified at all.')
    if (config && !(config.initialSide === 1 || config.initialSide === 0)) throw new Error('hysteresis: Invalid initialSide config: must 0, 1 or not specified at all.')
  }

  /* Return a function to track how values move
  around the threshold.*/
  return function howAaroundThreshold(number){
    if (wasAbove === null) {
      wasAbove = number >= upper
      return 0
    } else if (wasAbove && number <= lower) {
      wasAbove = !wasAbove
      return 1
    } else if (!wasAbove && number >= upper) {
      wasAbove = !wasAbove
      return 2
    } else {
      return 0
    }
  }
}
