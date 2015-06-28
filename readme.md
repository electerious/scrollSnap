# scrollSnap

Scroll, stop, snap.

scrollSnap provides a hassle-free alternative to scroll-hijacking, allowing a section-based navigation without harming the user-experience. It's written in Vanilla JS and has zero dependencies.

Tested with the latest versions of [Mozilla Firefox](https://www.mozilla.org/en-US/firefox/new/), [Apple Safari](https://www.apple.com/safari/), [Google Chrome](https://www.google.com/chrome/browser/), [Microsoft Internet Explorer](http://windows.microsoft.com/en-us/internet-explorer/download-ie) (10+) and [Opera](http://www.opera.com/).

## Demos

| Name | Description | Link |
|:-----------|:------------|:------------|
| Basic | Snaps to the nearest section | [Try it on CodePen](http://codepen.io/electerious/pen/gpxbZp) |

## Features

- Works in all modern browsers
- Zero dependencies
- CommonJS and AMD support
- Performance-optimized
- Fluid animations

## Performance

scrollSnap has been developed with performance in mind. It uses modern technologies to get the most of your browser:

- Works without additional libraries to keep your site slim
- Written in ES2015 and transformed to ES5 using [Babel](https://babeljs.io)
- `requestAnimationFrame` for fluid animations
- Size-calculations will be performed at start and after a defined scroll-delay. All data gets cached to avoid unnecessary recalculations.

## Installation

We recommend to install scrollSnap using [Bower](http://bower.io/) or [npm](https://npmjs.com).

	bower install scrollSnap
	npm install scrollsnap
	
## Requirements

scrollSnap dependents on the following browser APIs:

- [requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe)

Some of these APIs are capable of being polyfilled in older browser. Check the linked resources above to determine if you must polyfill to achieve your desired level of browser support.
	
## Include

Simply include the JS-file at the end of your `body`.

```html
<script src="dist/scrollSnap.min.js"></script>
```

## Options

List of options you can pass to the `scrollSnap.init`-function:

```js
scrollSnap.init({

	// NodeList of snap-elements (required)
	// scrollSnap always snaps to the nearest element
	elements: document.querySelectorAll('section'),
	
	// Integer - Set a minimum window-size (required)
	// scrollSnap will be deactivated when the window is smaller than the given dimensions
	minWidth: 600,
	minHeight: 400,
	
	// Boolean - Deactivate scrollSnap on mobile devices (optional)
	detectMobile: true,
	
	// Boolean - Keyboard-navigation (optional)
	keyboard: true,
	
	// Integer - Snap-animation-speed (optional)
	// Higher = slower
	duration: 20,
	
	// Function - Set a custom timing-function for the snap-animation (optional)
	timing: scrollSnap._timing

})
```