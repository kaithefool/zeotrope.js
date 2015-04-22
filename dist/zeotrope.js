(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = Canvas;

var Canvas = function (el) {
	this.el = el;
	this.ctx = this.el.getContext('2d');

	// onResize event
	this._onResize = this.onResize.bind(this);
	window.addEventListener(this._onResize);
};

Canvas.prototype = {
	onResize: function () {
		var w = this.el.offsetWidth,
        	h = this.el.offsetHeight;

        if (w !== this.width && h !== this.height) {
        	this.width = w;
        	this.height = h;
			this.el.setAttribute('width', this.width);
	        this.el.setAttribute('height', this.height);
        }
	},
	clear: function () {
		this.ctx.clearRect(0, 0, this.width, this.height);
	},
	remove: function () {
		window.removeEventListener(this._onResize);
		this.el.parentElement.removeChild(this.el);
	}
};
},{}],2:[function(require,module,exports){
'use strict';

var helpers = require('./helpers.js');
var easings = require('./easings.js');

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
	duration: 1000, // milliseconds
	iterate: 1 // integer or 'infinite'
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
	},
	/**
	 * TODOs
	 */
	reverse: function () {},
	pause: function () {},
	play: function () {},
	goTo: function () {}
};
},{"./easings.js":3,"./helpers.js":5}],3:[function(require,module,exports){
'use strict';
/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 * see https://gist.github.com/gre/1650294
 */
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

var helpers = require('./helpers');

module.exports = {
	listeners: [],
	status: 0,
	_frame: function () {
		if (this.status) {
			this.execute();
			window.requestAnimationFrame(this._frame.bind(this));
		}
	},
	/**
	 * Start animation loop
	 */
	start: function () {
		this.status = 1;

		if (window.requestAnimationFrame) {
			this._frame();
		} else {
			this._intvl = window.setInterval(this._frame.bind(this), 16); // 60fps
		}
	},

	/**
	 * Stop animation loop
	 */
	stop: function () {
		this.status = 0;

		if (this._intvl) {
			window.clearInterval(this._intvl);
		}
	},
	/**
	 * Trigger all listeners
	 */
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

		return listener;
	},
	remove: function (listener) {
		helpers.remove(this.listeners, listener);

		if (!this.listeners.length) {
			this.stop();
		}
	}
};

},{"./helpers":5}],5:[function(require,module,exports){
'use strict';

module.exports = {
	extend: function () {
	    for(var i=1; i<arguments.length; i++)
	        for(var key in arguments[i])
	            if(arguments[i].hasOwnProperty(key))
	                arguments[0][key] = arguments[i][key];
	    return arguments[0];
	},
	remove: function (array, el) {
		return array.splice(array.indexOf(el), 1);
	}
};
},{}],6:[function(require,module,exports){
'use strict';

var Timeline = require('./../core/Timeline.js'),
	helpers = require('./../core/helpers.js');

module.exports = Anim;

/**
 * TODO: multiple timelines
 */
function Anim (opt) {
	this.opt = helpers.extend({}, defaults, opt);
	this.time = new Timeline(opt.time);
	this.draw = this.opt.draw;
}

var defaults = {
	fillMode: 'none',
	time: {},
	draw: function () {} 
};

Anim.prototype = {
	render: function (canvas) {
		var progress = this.time.getProgress();

		if (this.isFill()) {
			this.draw(canvas, progress);
		}
	},
	isFill: function (progress) {
		var fillMode = this.opt.fillMode;

		if (fillMode === 'none' && (progress === 0 || progress === 1)) {
			return false;
		} else if (fillMode === 'forward' && progress === 0) {
			return false;
		} else if (fillMode === 'backward' && progress === 1) {
			return false;
		}

		return true;
	},
	detach: function () {
		if (this._zeotrope) {
			this._zeotrope.detach(this);
		}
	}
};
},{"./../core/Timeline.js":2,"./../core/helpers.js":5}],7:[function(require,module,exports){
'use strict';

var Canvas = require('./core/Canvas.js'),
	frame = require('./core/frame.js'),
	Anim = require('./render/Anim.js'),
	helpers = require('./core/helpers.js');

window.Zeotrope = Zeotrope;

function Zeotrope (el) {
	this.canvas = new Canvas(el);
	this.frame = frame.add(this.render.bind(this));
}

Zeotrope.prototype = {
	anims: [],
	anim: function (opt) {
		var anim = new Anim(opt);
		anim._zeotrope = this;
		this.anims.push(anim);
		return anim;
	},
	detach: function (anim) {
		helpers.remove(this.anims, anim);
	},
	render: function () {
		this.canvas.clear();
		for (var i = 0; i < this.anims.length; i++) {
			this.anims[i].render(this.canvas);
		}
	},
	remove: function () {
		frame.remove(this.frame);
		this.canvas.remove();
	}
};
},{"./core/Canvas.js":1,"./core/frame.js":4,"./core/helpers.js":5,"./render/Anim.js":6}]},{},[1,2,3,4,5,6,7])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvemVvdHJvcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG5cbnZhciBDYW52YXMgPSBmdW5jdGlvbiAoZWwpIHtcblx0dGhpcy5lbCA9IGVsO1xuXHR0aGlzLmN0eCA9IHRoaXMuZWwuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHQvLyBvblJlc2l6ZSBldmVudFxuXHR0aGlzLl9vblJlc2l6ZSA9IHRoaXMub25SZXNpemUuYmluZCh0aGlzKTtcblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5fb25SZXNpemUpO1xufTtcblxuQ2FudmFzLnByb3RvdHlwZSA9IHtcblx0b25SZXNpemU6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgdyA9IHRoaXMuZWwub2Zmc2V0V2lkdGgsXG4gICAgICAgIFx0aCA9IHRoaXMuZWwub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIGlmICh3ICE9PSB0aGlzLndpZHRoICYmIGggIT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgIFx0dGhpcy53aWR0aCA9IHc7XG4gICAgICAgIFx0dGhpcy5oZWlnaHQgPSBoO1xuXHRcdFx0dGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCk7XG5cdCAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuXHR9LFxuXHRjbGVhcjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKCkge1xuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuX29uUmVzaXplKTtcblx0XHR0aGlzLmVsLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbCk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycy5qcycpO1xudmFyIGVhc2luZ3MgPSByZXF1aXJlKCcuL2Vhc2luZ3MuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lbGluZTtcblxuZnVuY3Rpb24gVGltZWxpbmUgKG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHQvLyBpbml0aWFsaXplXG5cdHRoaXMuZWFzaW5nID0gZWFzaW5nc1tvcHQuZWFzaW5nXTtcblx0dGhpcy5zdGFydCA9IG9wdC5zdGFydCBpbnN0YW5jZW9mIERhdGUgPyBvcHQuc3RhcnQgOiBuZXcgRGF0ZSgpO1xuXHR0aGlzLmVuZCA9IG9wdC5lbmQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LmVuZCA6IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0RGF0ZSgpICsgb3B0LmR1cmF0aW9uKTtcblx0dGhpcy5kdXJhdGlvbiA9IG9wdC5lbmQgLSBvcHQuc3RhcnQ7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0ZWFzaW5nOiAnbGluZWFyJyxcblx0c3RhcnQ6IG51bGwsXG5cdGVuZDogbnVsbCxcblx0ZHVyYXRpb246IDEwMDAsIC8vIG1pbGxpc2Vjb25kc1xuXHRpdGVyYXRlOiAxIC8vIGludGVnZXIgb3IgJ2luZmluaXRlJ1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlID0ge1xuXHRnZXRQcm9ncmVzczogZnVuY3Rpb24gKGRhdGVUaW1lKSB7XG5cdFx0dmFyIG5vdyA9IGRhdGVUaW1lIHx8IG5ldyBEYXRlKCk7XG5cdFx0aWYgKG5vdyA8IHRoaXMuc3RhcnQpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAobm93ID4gdGhpcy5lbmQpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lYXNpbmcoIChub3cgLSB0aGlzLnN0YXJ0KSAvIHRoaXMuZHVyYXRpb24gKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUT0RPc1xuXHQgKi9cblx0cmV2ZXJzZTogZnVuY3Rpb24gKCkge30sXG5cdHBhdXNlOiBmdW5jdGlvbiAoKSB7fSxcblx0cGxheTogZnVuY3Rpb24gKCkge30sXG5cdGdvVG86IGZ1bmN0aW9uICgpIHt9XG59OyIsIid1c2Ugc3RyaWN0Jztcbi8qXG4gKiBFYXNpbmcgRnVuY3Rpb25zIC0gaW5zcGlyZWQgZnJvbSBodHRwOi8vZ2l6bWEuY29tL2Vhc2luZy9cbiAqIG9ubHkgY29uc2lkZXJpbmcgdGhlIHQgdmFsdWUgZm9yIHRoZSByYW5nZSBbMCwgMV0gPT4gWzAsIDFdXG4gKiBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDIqdCp0IDogLTErKDQtMip0KSp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb24gXG4gICAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMSsoLS10KSp0KnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMTYqdCp0KnQqdCp0IDogMSsxNiooLS10KSp0KnQqdCp0OyB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGxpc3RlbmVyczogW10sXG5cdHN0YXR1czogMCxcblx0X2ZyYW1lOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdHVzKSB7XG5cdFx0XHR0aGlzLmV4ZWN1dGUoKTtcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZnJhbWUuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogU3RhcnQgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSAxO1xuXG5cdFx0aWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcblx0XHRcdHRoaXMuX2ZyYW1lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2ludHZsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuX2ZyYW1lLmJpbmQodGhpcyksIDE2KTsgLy8gNjBmcHNcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFN0b3AgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDA7XG5cblx0XHRpZiAodGhpcy5faW50dmwpIHtcblx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2ludHZsKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGFsbCBsaXN0ZW5lcnNcblx0ICovXG5cdGV4ZWN1dGU6IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmxpc3RlbmVyc1tpXSgpO1xuXHRcdH1cblx0fSxcblx0YWRkOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdGFydCgpO1xuXHRcdH1cblx0XHR0aGlzLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmxpc3RlbmVycywgbGlzdGVuZXIpO1xuXG5cdFx0aWYgKCF0aGlzLmxpc3RlbmVycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuc3RvcCgpO1xuXHRcdH1cblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGV4dGVuZDogZnVuY3Rpb24gKCkge1xuXHQgICAgZm9yKHZhciBpPTE7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuXHQgICAgICAgIGZvcih2YXIga2V5IGluIGFyZ3VtZW50c1tpXSlcblx0ICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmhhc093blByb3BlcnR5KGtleSkpXG5cdCAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1ba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuXHQgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoYXJyYXksIGVsKSB7XG5cdFx0cmV0dXJuIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKGVsKSwgMSk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuLy4uL2NvcmUvVGltZWxpbmUuanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbTtcblxuLyoqXG4gKiBUT0RPOiBtdWx0aXBsZSB0aW1lbGluZXNcbiAqL1xuZnVuY3Rpb24gQW5pbSAob3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXHR0aGlzLnRpbWUgPSBuZXcgVGltZWxpbmUob3B0LnRpbWUpO1xuXHR0aGlzLmRyYXcgPSB0aGlzLm9wdC5kcmF3O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGZpbGxNb2RlOiAnbm9uZScsXG5cdHRpbWU6IHt9LFxuXHRkcmF3OiBmdW5jdGlvbiAoKSB7fSBcbn07XG5cbkFuaW0ucHJvdG90eXBlID0ge1xuXHRyZW5kZXI6IGZ1bmN0aW9uIChjYW52YXMpIHtcblx0XHR2YXIgcHJvZ3Jlc3MgPSB0aGlzLnRpbWUuZ2V0UHJvZ3Jlc3MoKTtcblxuXHRcdGlmICh0aGlzLmlzRmlsbCgpKSB7XG5cdFx0XHR0aGlzLmRyYXcoY2FudmFzLCBwcm9ncmVzcyk7XG5cdFx0fVxuXHR9LFxuXHRpc0ZpbGw6IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuXHRcdHZhciBmaWxsTW9kZSA9IHRoaXMub3B0LmZpbGxNb2RlO1xuXG5cdFx0aWYgKGZpbGxNb2RlID09PSAnbm9uZScgJiYgKHByb2dyZXNzID09PSAwIHx8IHByb2dyZXNzID09PSAxKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdmb3J3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdiYWNrd2FyZCcgJiYgcHJvZ3Jlc3MgPT09IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX3plb3Ryb3BlKSB7XG5cdFx0XHR0aGlzLl96ZW90cm9wZS5kZXRhY2godGhpcyk7XG5cdFx0fVxuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbnZhcyA9IHJlcXVpcmUoJy4vY29yZS9DYW52YXMuanMnKSxcblx0ZnJhbWUgPSByZXF1aXJlKCcuL2NvcmUvZnJhbWUuanMnKSxcblx0QW5pbSA9IHJlcXVpcmUoJy4vcmVuZGVyL0FuaW0uanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbndpbmRvdy5aZW90cm9wZSA9IFplb3Ryb3BlO1xuXG5mdW5jdGlvbiBaZW90cm9wZSAoZWwpIHtcblx0dGhpcy5jYW52YXMgPSBuZXcgQ2FudmFzKGVsKTtcblx0dGhpcy5mcmFtZSA9IGZyYW1lLmFkZCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpKTtcbn1cblxuWmVvdHJvcGUucHJvdG90eXBlID0ge1xuXHRhbmltczogW10sXG5cdGFuaW06IGZ1bmN0aW9uIChvcHQpIHtcblx0XHR2YXIgYW5pbSA9IG5ldyBBbmltKG9wdCk7XG5cdFx0YW5pbS5femVvdHJvcGUgPSB0aGlzO1xuXHRcdHRoaXMuYW5pbXMucHVzaChhbmltKTtcblx0XHRyZXR1cm4gYW5pbTtcblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoYW5pbSkge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMuYW5pbXMsIGFuaW0pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmNhbnZhcy5jbGVhcigpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5hbmltc1tpXS5yZW5kZXIodGhpcy5jYW52YXMpO1xuXHRcdH1cblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG5cdFx0ZnJhbWUucmVtb3ZlKHRoaXMuZnJhbWUpO1xuXHRcdHRoaXMuY2FudmFzLnJlbW92ZSgpO1xuXHR9XG59OyJdfQ==
