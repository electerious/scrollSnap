window.scrollSnap = {

	_on: null,
	_animating: false,

	_scrollTimer: null,
	_resizeTimer: null,

	_computedOpts: null,
	_computedWindow: null,
	_computedElements: null,

	init(opts = {}) {

		// Check if opts includes all required properties
		if (scrollSnap._valid(opts)===false) return false

		// Disable scrollSnap on mobile devices
		if (opts.detectMobile===true && scrollSnap._isMobile()===true) return false

		// Save computed options
		scrollSnap._computedOpts = opts

		// Listen to window-size changes
		window.addEventListener('resize', scrollSnap._onResize)

		// Start the internal init function
		return scrollSnap._init(scrollSnap._computedOpts)

	},

	_init(opts) {

		// Get size of window
		scrollSnap._computedWindow = scrollSnap._getWindowMetrics()

		// Reset computed elements
		scrollSnap._computedElements = []

		// Update the metrics of each element
		for (let i = 0; i < opts.elements.length; ++i) {

			let element        = opts.elements[i],
			    elementMetrics = scrollSnap._getElementMetrics(element, scrollSnap._computedWindow, i)

			// Save metrics of element
			scrollSnap._computedElements.push(elementMetrics)

		}

		var isBig   = scrollSnap._computedWindow.width >= opts.minWidth && scrollSnap._computedWindow.height >= opts.minHeight,
		    isSmall = scrollSnap._computedWindow.width < opts.minWidth || scrollSnap._computedWindow.height < opts.minHeight

		if (isBig===true && (scrollSnap._on===false || scrollSnap._on===null))       return scrollSnap._start(opts)
		else if (isSmall===true && (scrollSnap._on===true || scrollSnap._on===null)) return scrollSnap._stop(opts)

	},

	_isMobile() {

		return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera)

	},

	_timing(t, b, c, d) {

		// t = Current frame
		// b = Start-value
		// c = End-value
		// d = Duration

		t /= d
		return -c * t*(t-2) + b

	},

	_normalizePosition(newPos, maxPos) {

		if (newPos<0)        newPos = 0
		if (newPos>maxPos-1) newPos = maxPos - 1

		return newPos

	},

	_valid(opts = {}) {

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
		if (opts.timing==null)                      opts.timing       = scrollSnap._timing
		if (opts.keyboard!==false)                  opts.keyboard     = true

		return true

	},

	_getWindowMetrics() {

		var boundingClientRect = document.body.getBoundingClientRect(),
		    windowSize         = { width: window.innerWidth, height: window.innerHeight }

		return {
			top    : boundingClientRect.top * -1,
			maxTop : boundingClientRect.height - windowSize.height,
			bottom : boundingClientRect.top * -1 + windowSize.height,
			width  : windowSize.width,
			height : windowSize.height
		}

	},

	_getElementMetrics(elem, windowMetrics, index) {

		if (elem==null) return false

		var obj = {
			index,
			active : false,
			top    : elem.offsetTop,
			bottom : elem.offsetTop + elem.offsetHeight,
			height : elem.offsetHeight,
			dom    : elem
		}

		obj.visiblePercentage = scrollSnap._getElementVisiblePercentage(obj, windowMetrics).vP

		return obj

	},

	_getElementVisiblePercentage(elementMetrics, windowMetrics) {

		var sP = 0,
		    eP = 0,
		    vH = 0,
		    vP = 0

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

	},

	_setElementVisible(elementMetrics, windowMetrics) {

		var elem = elementMetrics.dom

		// Remove all active-states
		for (let i = 0; i < scrollSnap._computedElements.length; ++i) {

			let elementMetrics = scrollSnap._computedElements[i]

			elementMetrics.dom.classList.remove('active')
			elementMetrics.active = false

		}

		// Add active-state to the element
		elem.classList.add('active')
		elementMetrics.active = true

		var currentFrame   = 0,
		    startScrollTop = -document.body.getBoundingClientRect().top,
		    difference     = startScrollTop - elementMetrics.top,
		    duration       = scrollSnap._computedOpts.duration,
		    timing         = scrollSnap._computedOpts.timing

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
					scrollSnap._animating = false

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

	},

	_start(opts) {

		scrollSnap._on = true

		window.addEventListener('wheel', scrollSnap._onScroll)
		if (opts.keyboard===true) document.body.addEventListener('keydown', scrollSnap._onKeydown)

		for (let i = 0; i < scrollSnap._computedElements.length; ++i) { scrollSnap._computedElements[i].dom.classList.remove('active') }

		return scrollSnap._scrollToNearest()

	},

	_stop(opts) {

		scrollSnap._on = false

		window.removeEventListener('wheel', scrollSnap._onScroll)
		if (opts.keyboard===true) document.body.removeEventListener('keydown', scrollSnap._onKeydown)

		for (let i = 0; i < scrollSnap._computedElements.length; ++i) { scrollSnap._computedElements[i].dom.classList.add('active') }

		return true

	},

	_onKeydown(e) {

		var key    = e.keyCode,
		    newPos = 0

		if (key!==38 && key!==40)         return true
		if (scrollSnap._animating===true) return false

		scrollSnap._animating = true

		// Get current position
		for (let i = 0; i < scrollSnap._computedElements.length; ++i) { if (scrollSnap._computedElements[i].active===true) newPos = i }

		// 38 = Up
		// 40 = Down
		if (key===38)      newPos += -1
		else if (key===40) newPos += 1

		// Check if next element exists
		newPos = scrollSnap._normalizePosition(newPos, scrollSnap._computedElements.length)

		// Show the new element
		scrollSnap._setElementVisible(scrollSnap._computedElements[newPos], scrollSnap._computedWindow)

		e.preventDefault()
		return false

	},

	_onResize() {

		// Reset timeout
		clearTimeout(scrollSnap._resizeTimer)

		// Set new timeout
		scrollSnap._resizeTimer = setTimeout(() => scrollSnap._init(scrollSnap._computedOpts), 200)

		return true

	},

	_onScroll(e) {

		if (scrollSnap._animating===true) return false

		// Reset timeout
		clearTimeout(scrollSnap._scrollTimer)

		// Set new timeout
		scrollSnap._scrollTimer = setTimeout(() => scrollSnap._scrollTo(e), 200)

		return true

	},

	_scrollTo(e) {

		scrollSnap._animating = true

		var direction      = 0,
		    topElement     = {},
		    nextElementNum = null,
		    nextElement    = {},
		    gravitation    = 9.807

		// Get the direction from the event
		if (e.type==='wheel') direction = e.deltaY

		// Normalize direction
		if (direction>0) direction = 1
		else             direction = -1

		// Update window metrics
		scrollSnap._computedWindow = scrollSnap._getWindowMetrics()

		// Reset computed elements
		scrollSnap._computedElements = []

		// Update the metrics of each element
		for (let i = 0; i < scrollSnap._computedOpts.elements.length; ++i) {

			let element        = scrollSnap._computedOpts.elements[i],
			    elementMetrics = scrollSnap._getElementMetrics(element, scrollSnap._computedWindow, i)

			// Save metrics of element
			scrollSnap._computedElements.push(elementMetrics)

			// Get the element which is most visible and save it
			if (topElement.visiblePercentage==null || elementMetrics.visiblePercentage>topElement.visiblePercentage) topElement = elementMetrics

		}

		// Use the velocity to calculate the next element
		nextElementNum = topElement.index + direction

		// Check if next element exists
		nextElementNum = scrollSnap._normalizePosition(nextElementNum, scrollSnap._computedElements.length)

		// Add velocity to next element
		scrollSnap._computedElements[nextElementNum].visiblePercentage *= gravitation

		// Re-check if there is a new most visible element
		for (let i = 0; i < scrollSnap._computedElements.length; ++i) {

			let elementMetrics = scrollSnap._computedElements[i]

			if (elementMetrics.visiblePercentage>topElement.visiblePercentage) topElement = elementMetrics

		}

		return scrollSnap._setElementVisible(topElement, scrollSnap._computedWindow)

	},

	_scrollToNearest() {

		scrollSnap.animating = true

		var nextElementMetrics = null

		for (let i = 0; i < scrollSnap._computedOpts.elements.length; ++i) {

			let elementMetrics = scrollSnap._computedElements[i]

			if (scrollSnap._computedWindow.top>=elementMetrics.top) nextElementMetrics = elementMetrics

		}

		return scrollSnap._setElementVisible(nextElementMetrics, scrollSnap._computedWindow)

	}

}