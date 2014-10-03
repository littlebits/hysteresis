eq = require('chai').assert.equal
H = require('../lib/index')



describe 'hysteresis', ->

  describe 'By default', ->
    it 'considers initial value a change', ->
      eq H([10,50])(5), 1
      eq H([10,50])(10), 1
      eq H([10,50])(11), 1
      eq H([10,50])(50), 2
      eq H([10,50])(90), 2

    it 'is bias toward lower threshold on init', ->
      h = H([10,50])
      eq h(11), 1
      eq h(10), 0


  describe 'By config', ->
    it 'initial state can be overriden to return a change on first value', ->
      eq H([10,50], { initialSide: 1 })(5), 1
      eq H([10,50], { initialSide: 0 })(50), 2


  describe 'For rising values', ->
    it 'returns 0 if upper threshold not met or crossed', ->
      h = H([10,50])
      eq h(5), 1
      eq h(25), 0
      eq h(49), 0

    it 'returns 2 if upper threshold met exactly', ->
      h = H([10,50])
      eq h(49), 1
      eq h(50), 2

    it 'returns 2 if upper threshold crossed', ->
      h = H([10,50])
      eq h(49), 1
      eq h(500), 2

    it 'returns 0 after crossing and still rising', ->
      h = H([10,50])
      eq h(49), 1
      eq h(500), 2
      eq h(1000), 0


  describe 'For falling values', ->
    it 'returns 0 if lower threshold not met or crossed', ->
      h = H([10,50])
      eq h(95), 2
      eq h(70), 0
      eq h(51), 0

    it 'returns 1 if lower thrshold met exactly', ->
      h = H([10,50])
      eq h(51), 2
      eq h(10), 1

    it 'returns 1 if lower threshold crossed', ->
      h = H([10,50])
      eq h(51), 2
      eq h(0), 1

    it 'returns 0 after crossing and still falling', ->
      h = H([10,50])
      eq h(51), 2
      eq h(0), 1
      eq h(-50), 0
