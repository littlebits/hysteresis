eq = require('chai').assert.equal
H = require('../lib/index')



describe 'hysteresis', ->

  it 'returns 0 on any initial value given default initial state', ->
    eq H([10,50])(5), 0
    eq H([10,50])(10), 0
    eq H([10,50])(11), 0
    eq H([10,50])(50), 0
    eq H([10,50])(90), 0

  it 'Initial state can be overriden to return a change on first value', ->
    eq H([10,50], { initialSide: 1 })(5), 1
    eq H([10,50], { initialSide: 0 })(50), 2

  it 'is bias toward lower threshold on init', ->
    h = H([10,50])
    # lower-bias here means that on init, wherein
    # there are no past values, the first value
    # sets state to 1 so long as it is less than
    # upper. For example:
    eq h(11), 0 # This sets state to 1, not 2
    eq h(10), 0 # This returns 0 because no state change (still 1)
    # Upper-bias would mean that on the first value
    # the state would be 2 so long as it was greater
    # than lower.

  describe 'For rising values', ->
    it 'returns 0 if upper threshold not met or crossed', ->
      h = H([10,50])
      eq h(5), 0
      eq h(25), 0
      eq h(49), 0

    it 'returns 2 if upper threshold met exactly', ->
      h = H([10,50])
      eq h(49), 0
      eq h(50), 2

    it 'returns 2 if upper threshold crossed', ->
      h = H([10,50])
      eq h(49), 0
      eq h(500), 2

    it 'returns 0 after crossing and still rising', ->
      h = H([10,50])
      eq h(49), 0
      eq h(500), 2
      eq h(1000), 0


  describe 'For falling values', ->
    it 'returns 0 if lower threshold not met or crossed', ->
      h = H([10,50])
      eq h(95), 0
      eq h(70), 0
      eq h(51), 0

    it 'returns 1 if lower thrshold met exactly', ->
      h = H([10,50])
      eq h(51), 0
      eq h(10), 1

    it 'returns 1 if lower threshold crossed', ->
      h = H([10,50])
      eq h(51), 0
      eq h(0), 1

    it 'returns 0 after crossing and still falling', ->
      h = H([10,50])
      eq h(51), 0
      eq h(0), 1
      eq h(-50), 0
