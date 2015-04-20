(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var frame = require('./frame.js');

module.exports = Canvas;

var Canvas = function (el) {
	this.el = el;
	this.ctx = this.el.getContext('2d');

	// add frame listener
	this._frame = this.frame.bind(this);
	frame.add(this._frame);

	// onResize event
	this._onResize = this.onResize.bind(this);
	window.addEventListener(this._onResize);
};

Canvas.prototype = {

	resized: false,

	frame: function () {
		
	},

	onResize: function () {
		this.width = this.el.offsetWidth;
        this.height = this.el.offsetHeight;
        this.el.setAttribute('width', this.width);
        this.el.setAttribute('height', this.height);
        this.resized = true;
	},

	remove: function () {
		frame.remove(this._frame);
		window.removeEventListener(this._onResize);
	}

};
},{"./frame.js":4}],2:[function(require,module,exports){
'use strict';

var helpers = require('./helpers');
var easings = require('./easings');

module.exports = Timeline;

function Timeline (options) {
	var opt = this.opt = helpers.extend({}, defaults, options);

	// initialize
	this.easing = easings[opt.easing];
	this.start = opt.start instanceof Date ? opt.start : new Date();
	this.end = opt.end instanceof Date ? opt.end : new Date(this.start.getDate() + opt.duration);
	this.duration = opt.end - opt.start;
}

var defaults = {
	easing: 'linear',
	start: null,
	end: null,
	duration: 1000 // milliseconds
};

Timeline.prototype = {

	getProgress: function (dateTime) {
		var now = dateTime || new Date();
		if (now < this.start) {
			return 0;
		} else if (now > this.end) {
			return 1;
		} else {
			return this.easing( (now - this.start) / this.duration );
		}
	}

};
},{"./easings":3,"./helpers":5}],3:[function(require,module,exports){
'use strict';

module.exports = {
    // no easing, no acceleration
    linear: function (t) { return t; },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t; },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t); },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t*t*t; },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t)*t*t+1; },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t*t*t*t; },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1-(--t)*t*t*t; },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t; },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t; },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
};
},{}],4:[function(require,module,exports){
'use strict';

module.exports = {

	listeners: [],

	status: 0,

	_frame: function () {
		if (this.status) {
			this.execute();
			window.requestAnimationFrame(this._frame.bind(this));
		}
	},

	start: function () {
		this.status = 1;

		if (window.requestAnimationFrame) {
			this._frame();
		} else {
			this._intvl = window.setInterval(this._frame.bind(this), 16); // 60fps
		}
	},

	stop: function () {
		this.status = 0;

		if (this._intvl) {
			window.clearInterval(this._intvl);
		}
	},

	execute: function () {
		for (var i = 0; i < this.listeners.length; i++) {
			this.listeners[i]();
		}
	},

	add: function (listener) {
		if (!this.listeners.length) {
			this.start();
		}
		this.listeners.push(listener);
	},

	remove: function (listener) {
		for (var i = 0; i < this.listeners.length; i++) {
			if (this.listeners[i] === listener) {
				this.listeners.splice(i, 1);
				break;
			}
		}

		if (!this.listeners.length) {
			this.stop();
		}
	}

};

},{}],5:[function(require,module,exports){
'use strict';

module.exports = {

	extend: function () {
	    for(var i=1; i<arguments.length; i++)
	        for(var key in arguments[i])
	            if(arguments[i].hasOwnProperty(key))
	                arguments[0][key] = arguments[i][key];
	    return arguments[0];
	}

};
},{}],6:[function(require,module,exports){
"use strict";

require("./lib/Canvas.js");


},{"./lib/Canvas.js":1}]},{},[1,2,3,4,5,6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbGliL0NhbnZhcy5qcyIsInNyYy9saWIvVGltZWxpbmUuanMiLCJzcmMvbGliL2Vhc2luZ3MuanMiLCJzcmMvbGliL2ZyYW1lLmpzIiwic3JjL2xpYi9oZWxwZXJzLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBmcmFtZSA9IHJlcXVpcmUoJy4vZnJhbWUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG5cbnZhciBDYW52YXMgPSBmdW5jdGlvbiAoZWwpIHtcblx0dGhpcy5lbCA9IGVsO1xuXHR0aGlzLmN0eCA9IHRoaXMuZWwuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHQvLyBhZGQgZnJhbWUgbGlzdGVuZXJcblx0dGhpcy5fZnJhbWUgPSB0aGlzLmZyYW1lLmJpbmQodGhpcyk7XG5cdGZyYW1lLmFkZCh0aGlzLl9mcmFtZSk7XG5cblx0Ly8gb25SZXNpemUgZXZlbnRcblx0dGhpcy5fb25SZXNpemUgPSB0aGlzLm9uUmVzaXplLmJpbmQodGhpcyk7XG5cdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKHRoaXMuX29uUmVzaXplKTtcbn07XG5cbkNhbnZhcy5wcm90b3R5cGUgPSB7XG5cblx0cmVzaXplZDogZmFsc2UsXG5cblx0ZnJhbWU6IGZ1bmN0aW9uICgpIHtcblx0XHRcblx0fSxcblxuXHRvblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMud2lkdGggPSB0aGlzLmVsLm9mZnNldFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuZWwub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoKTtcbiAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5yZXNpemVkID0gdHJ1ZTtcblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uICgpIHtcblx0XHRmcmFtZS5yZW1vdmUodGhpcy5fZnJhbWUpO1xuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuX29uUmVzaXplKTtcblx0fVxuXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcbnZhciBlYXNpbmdzID0gcmVxdWlyZSgnLi9lYXNpbmdzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7XG5cbmZ1bmN0aW9uIFRpbWVsaW5lIChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0Ly8gaW5pdGlhbGl6ZVxuXHR0aGlzLmVhc2luZyA9IGVhc2luZ3Nbb3B0LmVhc2luZ107XG5cdHRoaXMuc3RhcnQgPSBvcHQuc3RhcnQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LnN0YXJ0IDogbmV3IERhdGUoKTtcblx0dGhpcy5lbmQgPSBvcHQuZW5kIGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5lbmQgOiBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldERhdGUoKSArIG9wdC5kdXJhdGlvbik7XG5cdHRoaXMuZHVyYXRpb24gPSBvcHQuZW5kIC0gb3B0LnN0YXJ0O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGVhc2luZzogJ2xpbmVhcicsXG5cdHN0YXJ0OiBudWxsLFxuXHRlbmQ6IG51bGwsXG5cdGR1cmF0aW9uOiAxMDAwIC8vIG1pbGxpc2Vjb25kc1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlID0ge1xuXG5cdGdldFByb2dyZXNzOiBmdW5jdGlvbiAoZGF0ZVRpbWUpIHtcblx0XHR2YXIgbm93ID0gZGF0ZVRpbWUgfHwgbmV3IERhdGUoKTtcblx0XHRpZiAobm93IDwgdGhpcy5zdGFydCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIGlmIChub3cgPiB0aGlzLmVuZCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmVhc2luZyggKG5vdyAtIHRoaXMuc3RhcnQpIC8gdGhpcy5kdXJhdGlvbiApO1xuXHRcdH1cblx0fVxuXG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDIqdCp0IDogLTErKDQtMip0KSp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb24gXG4gICAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMSsoLS10KSp0KnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMTYqdCp0KnQqdCp0IDogMSsxNiooLS10KSp0KnQqdCp0OyB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0bGlzdGVuZXJzOiBbXSxcblxuXHRzdGF0dXM6IDAsXG5cblx0X2ZyYW1lOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdHVzKSB7XG5cdFx0XHR0aGlzLmV4ZWN1dGUoKTtcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZnJhbWUuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9LFxuXG5cdHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSAxO1xuXG5cdFx0aWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcblx0XHRcdHRoaXMuX2ZyYW1lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2ludHZsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuX2ZyYW1lLmJpbmQodGhpcyksIDE2KTsgLy8gNjBmcHNcblx0XHR9XG5cdH0sXG5cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMDtcblxuXHRcdGlmICh0aGlzLl9pbnR2bCkge1xuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5faW50dmwpO1xuXHRcdH1cblx0fSxcblxuXHRleGVjdXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5saXN0ZW5lcnNbaV0oKTtcblx0XHR9XG5cdH0sXG5cblx0YWRkOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdGFydCgpO1xuXHRcdH1cblx0XHR0aGlzLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblx0fSxcblxuXHRyZW1vdmU6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0aGlzLmxpc3RlbmVyc1tpXSA9PT0gbGlzdGVuZXIpIHtcblx0XHRcdFx0dGhpcy5saXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdG9wKCk7XG5cdFx0fVxuXHR9XG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG5cdGV4dGVuZDogZnVuY3Rpb24gKCkge1xuXHQgICAgZm9yKHZhciBpPTE7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuXHQgICAgICAgIGZvcih2YXIga2V5IGluIGFyZ3VtZW50c1tpXSlcblx0ICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmhhc093blByb3BlcnR5KGtleSkpXG5cdCAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1ba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuXHQgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcblx0fVxuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKFwiLi9saWIvQ2FudmFzLmpzXCIpO1xuXG4iXX0=
