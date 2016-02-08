let on        = null
let animating = false

let scrollTimer = null
let resizeTimer = null

let computedOpts     = null
let computedWindow   = null
let computedElements = null

export const init = function(opts = {}) {

	// Check if opts includes all required properties
	if (valid(opts)===false) return false

	// Disable on mobile devices
	if (opts.detectMobile===true && isMobile()===true) return false

	// Save computed options
	computedOpts = opts

	// Listen to window-size changes
	window.addEventListener('resize', onResize)

	// Start the internal init function
	return _init(computedOpts)

}

const _init = function(opts) {

	// Get size of window
	computedWindow = getWindowMetrics()

	// Reset computed elements
	computedElements = []

	// Update the metrics of each element
	for (let i = 0; i < opts.elements.length; ++i) {

		let element        = opts.elements[i]
		let elementMetrics = getElementMetrics(element, computedWindow, i)

		// Save metrics of element
		computedElements.push(elementMetrics)

	}

	let isBig   = computedWindow.width >= opts.minWidth && computedWindow.height >= opts.minHeight
	let isSmall = computedWindow.width < opts.minWidth || computedWindow.height < opts.minHeight

	if (isBig===true && (on===false || on===null))       return start(opts)
	else if (isSmall===true && (on===true || on===null)) return stop(opts)

}

const isMobile = function() {

	return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)

}

const timing = function(t, b, c, d) {

	// t = Current frame
	// b = Start-value
	// c = End-value
	// d = Duration

	t /= d
	return -c * t*(t-2) + b

}

const normalizePosition = function(newPos, maxPos) {

	if (newPos<0)        newPos = 0
	if (newPos>maxPos-1) newPos = maxPos - 1

	return newPos

}

const valid = function(opts = {}) {

	// Check required properties

	if (opts.elements==null) {
		console.error('Elements missing: opts.elements')
		return false
	}

	if (opts.minWidth==null || opts.minWidth<0) {
		console.error('Property missing or not a number: opts.minWidth')
		return false
	}

	if (opts.minHeight==null || opts.minHeight<0) {
		console.error('Property missing or not a number: opts.minHeight')
		return false
	}

	// Set optional properties

	if (opts.detectMobile!==false)              opts.detectMobile = true
	if (opts.duration==null || opts.duration<0) opts.duration     = 20
	if (opts.timing==null)                      opts.timing       = timing
	if (opts.keyboard!==false)                  opts.keyboard     = true

	return true

}

const getWindowMetrics = function() {

	let boundingClientRect = document.body.getBoundingClientRect()
	let windowSize         = { width: window.innerWidth, height: window.innerHeight }

	return {
		top    : boundingClientRect.top * -1,
		maxTop : boundingClientRect.height - windowSize.height,
		bottom : boundingClientRect.top * -1 + windowSize.height,
		width  : windowSize.width,
		height : windowSize.height
	}

}

const getElementMetrics = function(elem, windowMetrics, index) {

	if (elem==null) return false

	let obj = {
		index,
		active : false,
		top    : elem.offsetTop,
		bottom : elem.offsetTop + elem.offsetHeight,
		height : elem.offsetHeight,
		dom    : elem
	}

	obj.visiblePercentage = getElementVisiblePercentage(obj, windowMetrics).vP

	return obj

}

const getElementVisiblePercentage = function(elementMetrics, windowMetrics) {

	let sP = 0
	let eP = 0
	let vH = 0
	let vP = 0

	// Calculate start-point (sP)
	sP = (windowMetrics.top > elementMetrics.top ? windowMetrics.top : elementMetrics.top)

	// Calculate end-point (eP)
	eP = (windowMetrics.bottom > elementMetrics.bottom ? elementMetrics.bottom : windowMetrics.bottom)

	// Calculate visible height in pixels (vH)
	vH = eP - sP

	// Convert vH from pixels to a percentage value
	// 100 = element completely visible
	// 0 = element not visible at all
	vP = (100 / elementMetrics.height) * vH

	// Normalize output
	if (vH<0) vH = 0
	if (vP<0) vP = 0

	// Return the visible height in percent
	return { vH, vP }

}

const setElementVisible = function(elementMetrics, windowMetrics) {

	let elem = elementMetrics.dom

	// Remove all active-states
	for (let i = 0; i < computedElements.length; ++i) {

		let elementMetrics = computedElements[i]

		elementMetrics.dom.classList.remove('active')
		elementMetrics.active = false

	}

	// Add active-state to the element
	elem.classList.add('active')
	elementMetrics.active = true

	let currentFrame   = 0
	let startScrollTop = -document.body.getBoundingClientRect().top
	let difference     = startScrollTop - elementMetrics.top
	let duration       = computedOpts.duration
	let timing         = computedOpts.timing

	function animation() {

		let newScrollTop = startScrollTop - timing(currentFrame, 0, difference, duration)

		// Scroll to element
		document.body.scrollTop = newScrollTop // Safari, Chrome
		document.documentElement.scrollTop = newScrollTop // Firefox

		// Stop the animation when ...
		// ... all frames have been shown
		// ... scrollTop reached its maximum after the first frame
		if ((currentFrame>=duration) ||
		    (document.body.scrollTop===windowMetrics.maxTop && currentFrame!==0)) {

				// Animation finished
				animating = false

		} else {

			// Continue with next frame
			currentFrame++

			// Continue animation
			requestAnimationFrame(animation)

		}

	}

	// Start the animation
	animation()

	return true

}

const start = function(opts) {

	on = true

	window.addEventListener('wheel', onScroll)
	if (opts.keyboard===true) document.body.addEventListener('keydown', onKeydown)

	for (let i = 0; i < computedElements.length; ++i) { computedElements[i].dom.classList.remove('active') }

	return scrollToNearest()

}

const stop = function(opts) {

	on = false

	window.removeEventListener('wheel', onScroll)
	if (opts.keyboard===true) document.body.removeEventListener('keydown', onKeydown)

	for (let i = 0; i < computedElements.length; ++i) { computedElements[i].dom.classList.add('active') }

	return true

}

const onKeydown = function(e) {

	let key    = e.keyCode
	let newPos = 0

	if (key!==38 && key!==40)         return true
	if (animating===true) return false

	animating = true

	// Get current position
	for (let i = 0; i < computedElements.length; ++i) { if (computedElements[i].active===true) newPos = i }

	// 38 = Up
	// 40 = Down
	if (key===38)      newPos += -1
	else if (key===40) newPos += 1

	// Check if next element exists
	newPos = normalizePosition(newPos, computedElements.length)

	// Show the new element
	setElementVisible(computedElements[newPos], computedWindow)

	e.preventDefault()
	return false

}

const onResize = function() {

	// Reset timeout
	clearTimeout(resizeTimer)

	// Set new timeout
	resizeTimer = setTimeout(() => init(computedOpts), 200)

	return true

}

const onScroll = function(e) {

	if (animating===true) return false

	// Reset timeout
	clearTimeout(scrollTimer)

	// Set new timeout
	scrollTimer = setTimeout(() => scrollTo(e), 200)

	return true

}

const scrollTo = function(e) {

	animating = true

	let direction      = 0
	let topElement     = {}
	let nextElementNum = null
	let nextElement    = {}
	let gravitation    = 9.807

	// Get the direction from the event
	if (e.type==='wheel') direction = e.deltaY

	// Normalize direction
	if (direction>0) direction = 1
	else             direction = -1

	// Update window metrics
	computedWindow = getWindowMetrics()

	// Reset computed elements
	computedElements = []

	// Update the metrics of each element
	for (let i = 0; i < computedOpts.elements.length; ++i) {

		let element        = computedOpts.elements[i]
		let elementMetrics = getElementMetrics(element, computedWindow, i)

		// Save metrics of element
		computedElements.push(elementMetrics)

		// Get the element which is most visible and save it
		if (topElement.visiblePercentage==null || elementMetrics.visiblePercentage>topElement.visiblePercentage) topElement = elementMetrics

	}

	// Use the velocity to calculate the next element
	nextElementNum = topElement.index + direction

	// Check if next element exists
	nextElementNum = normalizePosition(nextElementNum, computedElements.length)

	// Add velocity to next element
	computedElements[nextElementNum].visiblePercentage *= gravitation

	// Re-check if there is a new most visible element
	for (let i = 0; i < computedElements.length; ++i) {

		let elementMetrics = computedElements[i]

		if (elementMetrics.visiblePercentage>topElement.visiblePercentage) topElement = elementMetrics

	}

	return setElementVisible(topElement, computedWindow)

}

const scrollToNearest = function() {

	animating = true

	let nextElementMetrics = null

	for (let i = 0; i < computedOpts.elements.length; ++i) {

		let elementMetrics = computedElements[i]

		if (computedWindow.top>=elementMetrics.top) nextElementMetrics = elementMetrics

	}

	return setElementVisible(nextElementMetrics, computedWindow)

}