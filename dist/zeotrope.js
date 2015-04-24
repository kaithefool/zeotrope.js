(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var helpers = require('./helpers'),
    Scale = require('./../render/Scale.js');

module.exports = Canvas;

function Canvas (el) {
    this.el = el;
    this.ctx = this.el.getContext('2d');

    // onResize event
    this._resizeHandler = this._onResize.bind(this);
    window.addEventListener(this._resizeHandler);
    this.onResize();
}

Canvas.prototype = {
    scales: [],
    positions: [],
    _onResize: function () {
        var w = this.el.offsetWidth,
            h = this.el.offsetHeight;

        if (w !== this.width && h !== this.height) {
            this.width = w;
            this.height = h;
            this.el.setAttribute('width', this.width);
            this.el.setAttribute('height', this.height);

            // update all scales
            for (var i = 0; i < this.scales.length; i++) {
                this.scales[i].update();
            }

            // and all positions
        }
    },
    getPt: function () {},
    getPosition: function () {

    },
    getSize: function (size, child) {
        return Scale.getSize(size, child, this);
    },
    getScale: function (size, child) {
        var scale = new Scale(size, child, this);
        this.scales.push(scale);
        return scale;
    },
    detach: function (obj) {
        var collection;

        if (obj instanceof Scale) {
            collection = this.scales;
        }

        helpers.remove(collection, obj);
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },
    remove: function () {
        window.removeEventListener(this._resizeHandler);
        this.el.parentElement.removeChild(this.el);
    }
};
},{"./../render/Scale.js":9,"./helpers":5}],2:[function(require,module,exports){
'use strict';

var helpers = require('./helpers.js');
var easings = require('./easings.js');

module.exports = Timeline;

function Timeline (options) {
	var opt = this.opt = helpers.extend({}, defaults, options);

	// initialize
	this.easing = easings[opt.easing];
	this.start = opt.start instanceof Date ? opt.start : new Date();
	this.end = opt.end instanceof Date ? opt.end : new Date(this.start.getTime() + opt.duration);
	this.duration = this.end - this.start;
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
	extract: function (obj, properties) {
		var result = {};
		for (var i = 0; i < properties.length; i++) {
			result[properties[i]] = obj[properties[i]];
		}
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

		if (this.isFill(progress)) {
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

var helpers = require('./../core/helpers.js');

module.exports = Img;

function Img (canvas, opt) {
    this.canvas = canvas;
    this.opt = helpers.extend({}, defaults, opt);

    // preload
    this.el = new Image();
    this.el.onload = this.onLoad.bind(this);
    this.el.src = this.opt.src;

    //
    
}

var defaults = {
    src: '',
    size: 'auto', // see background-size css property,
    position: 'center' // background-position
};

Img.prototype = {
    width: 0,
    height: 0,
    draw: function () {
        if (!this.loaded) {
            return;
        }

        this.canvas.ctx.drawImage(this.x, this.y, this.width, this.height);
    },
    onLoad: function () {
        this.loaded = true;
    },
    getSize: function () {
        if (typeof this.opt.size === 'string') { 
            var size = scale(this.opt.size, this.el, this.canvas);
            this.width = size.w;
            this.height = size.h;
        } else {

        }
    },
    getPosition: function () {
        
    }
};

/**
 * Calculate background image size
 * @param  {string} type   'auto', 'contain' or 'cover'
 * @param  {object} child
 * @param  {object} parent 
 * @return {object}
 */
function scale (type, child, parent) {
    if (type === 'auto') {
        return {
            w: child.width,
            h: child.height
        };
    }

    var childAR = child.height / child.width,
        parentAR = parent.height / parent.width,
        sameHeight = type === 'cover' ? parentAR > childAR : parentAR < childAR;

    if (sameHeight) {
        return {
            w: parent.height / childAR,
            h: parent.height
        };
    } else {
        return {
            w: parent.width,
            h: parent.width * childAR
        };
    }
}
},{"./../core/helpers.js":5}],8:[function(require,module,exports){

},{}],9:[function(require,module,exports){
'use strict';

var helpers = require('./../core/helpers.js');

module.exports = Scale;

function Scale (size, child, parent) {
    this.size = 'size';
    this.original = helpers.extract(child, ['width', 'height']);
    if (parent) {
        this.parent = parent;
        this.update();
    }
}

Scale.getSize = getSize;

Scale.prototype = {
    update: function () {
        var di = getSize(this.size, this.original, this.parent);
        this.width = Math.round(di.width);
        this.height = Math.round(di.height);
    },
    remove: function () {
        if (this.parent) {
            this.parent.detach(this);
        }
    }
};

function getSize (size, child, parent) {
    if (size === 'auto') {
        return helpers.extract(child, ['width', 'height']);
    } else if (size === 'cover' || size === 'contain') {
        return fullScale(size, child, parent);
    } else {
        return arScale( percentToPx( parseSizeStr(size), parent ) );
    }
}

function parseSizeStr (str) {
    var val = str.split(' ');

    return {
        width: val[0],
        height: val[1].length === 1 ? val[0] : val[1] // repeat value for height if only width is provided
    };
}

function percentToPx (size, parent) {
    return {
        width: size.width.indexOf('%') === -1 ? size.width : size.width.slice(0, -1)/100 * parent.width,
        height: size.height.indexOf('%') === -1 ? size.height : size.width.slice(0, -1)/100 * parent.height
    };
}

function arScale (original, size) {
    var ar = original.height / original.width;

    return {
        width: size.width === 'auto' ? size.height / ar : size.width,
        height: size.height === 'auto' ? size.width * ar : size.height
    };
}

/**
 * Calculate background image size for 'contain' and 'cover'
 * @param  {string} type    contain' or 'cover'
 * @param  {object} child
 * @param  {object} parent 
 * @return {object}
 */
function fullScale (type, child, parent) {
    var childAR = child.height / child.width,
        parentAR = parent.height / parent.width,
        sameHeight = type === 'cover' ? parentAR > childAR : parentAR < childAR;

    if (sameHeight) {
        return {
            width: parent.height / childAR,
            height: parent.height
        };
    } else {
        return {
            width: parent.width,
            height: parent.width * childAR
        };
    }
}
},{"./../core/helpers.js":5}],10:[function(require,module,exports){
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
},{"./core/Canvas.js":1,"./core/frame.js":4,"./core/helpers.js":5,"./render/Anim.js":6}]},{},[1,2,3,4,5,6,7,8,9,10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0ltZy5qcyIsInNyYy9yZW5kZXIvUG9zaXRpb24uanMiLCJzcmMvcmVuZGVyL1NjYWxlLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKSxcbiAgICBTY2FsZSA9IHJlcXVpcmUoJy4vLi4vcmVuZGVyL1NjYWxlLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuXG5mdW5jdGlvbiBDYW52YXMgKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gb25SZXNpemUgZXZlbnRcbiAgICB0aGlzLl9yZXNpemVIYW5kbGVyID0gdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICB0aGlzLm9uUmVzaXplKCk7XG59XG5cbkNhbnZhcy5wcm90b3R5cGUgPSB7XG4gICAgc2NhbGVzOiBbXSxcbiAgICBwb3NpdGlvbnM6IFtdLFxuICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdyA9IHRoaXMuZWwub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHcgIT09IHRoaXMud2lkdGggJiYgaCAhPT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCk7XG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgYWxsIHNjYWxlc1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNjYWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGVzW2ldLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhbmQgYWxsIHBvc2l0aW9uc1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRQdDogZnVuY3Rpb24gKCkge30sXG4gICAgZ2V0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG4gICAgZ2V0U2l6ZTogZnVuY3Rpb24gKHNpemUsIGNoaWxkKSB7XG4gICAgICAgIHJldHVybiBTY2FsZS5nZXRTaXplKHNpemUsIGNoaWxkLCB0aGlzKTtcbiAgICB9LFxuICAgIGdldFNjYWxlOiBmdW5jdGlvbiAoc2l6ZSwgY2hpbGQpIHtcbiAgICAgICAgdmFyIHNjYWxlID0gbmV3IFNjYWxlKHNpemUsIGNoaWxkLCB0aGlzKTtcbiAgICAgICAgdGhpcy5zY2FsZXMucHVzaChzY2FsZSk7XG4gICAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9LFxuICAgIGRldGFjaDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgY29sbGVjdGlvbjtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgU2NhbGUpIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gPSB0aGlzLnNjYWxlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGhlbHBlcnMucmVtb3ZlKGNvbGxlY3Rpb24sIG9iaik7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgICAgICB0aGlzLmVsLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbCk7XG4gICAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzLmpzJyk7XG52YXIgZWFzaW5ncyA9IHJlcXVpcmUoJy4vZWFzaW5ncy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lO1xuXG5mdW5jdGlvbiBUaW1lbGluZSAob3B0aW9ucykge1xuXHR2YXIgb3B0ID0gdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdC8vIGluaXRpYWxpemVcblx0dGhpcy5lYXNpbmcgPSBlYXNpbmdzW29wdC5lYXNpbmddO1xuXHR0aGlzLnN0YXJ0ID0gb3B0LnN0YXJ0IGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5zdGFydCA6IG5ldyBEYXRlKCk7XG5cdHRoaXMuZW5kID0gb3B0LmVuZCBpbnN0YW5jZW9mIERhdGUgPyBvcHQuZW5kIDogbmV3IERhdGUodGhpcy5zdGFydC5nZXRUaW1lKCkgKyBvcHQuZHVyYXRpb24pO1xuXHR0aGlzLmR1cmF0aW9uID0gdGhpcy5lbmQgLSB0aGlzLnN0YXJ0O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGVhc2luZzogJ2xpbmVhcicsXG5cdHN0YXJ0OiBudWxsLFxuXHRlbmQ6IG51bGwsXG5cdGR1cmF0aW9uOiAxMDAwLCAvLyBtaWxsaXNlY29uZHNcblx0aXRlcmF0ZTogMSAvLyBpbnRlZ2VyIG9yICdpbmZpbml0ZSdcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZSA9IHtcblx0Z2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uIChkYXRlVGltZSkge1xuXHRcdHZhciBub3cgPSBkYXRlVGltZSB8fCBuZXcgRGF0ZSgpO1xuXG5cdFx0aWYgKG5vdyA8IHRoaXMuc3RhcnQpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAobm93ID4gdGhpcy5lbmQpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lYXNpbmcoIChub3cgLSB0aGlzLnN0YXJ0KSAvIHRoaXMuZHVyYXRpb24gKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUT0RPc1xuXHQgKi9cblx0cmV2ZXJzZTogZnVuY3Rpb24gKCkge30sXG5cdHBhdXNlOiBmdW5jdGlvbiAoKSB7fSxcblx0cGxheTogZnVuY3Rpb24gKCkge30sXG5cdGdvVG86IGZ1bmN0aW9uICgpIHt9XG59OyIsIid1c2Ugc3RyaWN0Jztcbi8qXG4gKiBFYXNpbmcgRnVuY3Rpb25zIC0gaW5zcGlyZWQgZnJvbSBodHRwOi8vZ2l6bWEuY29tL2Vhc2luZy9cbiAqIG9ubHkgY29uc2lkZXJpbmcgdGhlIHQgdmFsdWUgZm9yIHRoZSByYW5nZSBbMCwgMV0gPT4gWzAsIDFdXG4gKiBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDIqdCp0IDogLTErKDQtMip0KSp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb24gXG4gICAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMSsoLS10KSp0KnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMTYqdCp0KnQqdCp0IDogMSsxNiooLS10KSp0KnQqdCp0OyB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGxpc3RlbmVyczogW10sXG5cdHN0YXR1czogMCxcblx0X2ZyYW1lOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdHVzKSB7XG5cdFx0XHR0aGlzLmV4ZWN1dGUoKTtcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZnJhbWUuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogU3RhcnQgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSAxO1xuXG5cdFx0aWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcblx0XHRcdHRoaXMuX2ZyYW1lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2ludHZsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuX2ZyYW1lLmJpbmQodGhpcyksIDE2KTsgLy8gNjBmcHNcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFN0b3AgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDA7XG5cblx0XHRpZiAodGhpcy5faW50dmwpIHtcblx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2ludHZsKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGFsbCBsaXN0ZW5lcnNcblx0ICovXG5cdGV4ZWN1dGU6IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmxpc3RlbmVyc1tpXSgpO1xuXHRcdH1cblx0fSxcblx0YWRkOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdGFydCgpO1xuXHRcdH1cblx0XHR0aGlzLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmxpc3RlbmVycywgbGlzdGVuZXIpO1xuXG5cdFx0aWYgKCF0aGlzLmxpc3RlbmVycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuc3RvcCgpO1xuXHRcdH1cblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGV4dGVuZDogZnVuY3Rpb24gKCkge1xuXHQgICAgZm9yKHZhciBpPTE7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuXHQgICAgICAgIGZvcih2YXIga2V5IGluIGFyZ3VtZW50c1tpXSlcblx0ICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmhhc093blByb3BlcnR5KGtleSkpXG5cdCAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1ba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuXHQgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcblx0fSxcblx0ZXh0cmFjdDogZnVuY3Rpb24gKG9iaiwgcHJvcGVydGllcykge1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJlc3VsdFtwcm9wZXJ0aWVzW2ldXSA9IG9ialtwcm9wZXJ0aWVzW2ldXTtcblx0XHR9XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKGFycmF5LCBlbCkge1xuXHRcdHJldHVybiBhcnJheS5zcGxpY2UoYXJyYXkuaW5kZXhPZihlbCksIDEpO1xuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFRpbWVsaW5lID0gcmVxdWlyZSgnLi8uLi9jb3JlL1RpbWVsaW5lLmpzJyksXG5cdGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW07XG5cbi8qKlxuICogVE9ETzogbXVsdGlwbGUgdGltZWxpbmVzXG4gKi9cbmZ1bmN0aW9uIEFuaW0gKG9wdCkge1xuXHR0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcblx0dGhpcy50aW1lID0gbmV3IFRpbWVsaW5lKG9wdC50aW1lKTtcblx0dGhpcy5kcmF3ID0gdGhpcy5vcHQuZHJhdztcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXHRmaWxsTW9kZTogJ25vbmUnLFxuXHR0aW1lOiB7fSxcblx0ZHJhdzogZnVuY3Rpb24gKCkge30gXG59O1xuXG5BbmltLnByb3RvdHlwZSA9IHtcblx0cmVuZGVyOiBmdW5jdGlvbiAoY2FudmFzKSB7XG5cdFx0dmFyIHByb2dyZXNzID0gdGhpcy50aW1lLmdldFByb2dyZXNzKCk7XG5cblx0XHRpZiAodGhpcy5pc0ZpbGwocHJvZ3Jlc3MpKSB7XG5cdFx0XHR0aGlzLmRyYXcoY2FudmFzLCBwcm9ncmVzcyk7XG5cdFx0fVxuXHR9LFxuXHRpc0ZpbGw6IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuXHRcdHZhciBmaWxsTW9kZSA9IHRoaXMub3B0LmZpbGxNb2RlO1xuXG5cdFx0aWYgKGZpbGxNb2RlID09PSAnbm9uZScgJiYgKHByb2dyZXNzID09PSAwIHx8IHByb2dyZXNzID09PSAxKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdmb3J3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdiYWNrd2FyZCcgJiYgcHJvZ3Jlc3MgPT09IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX3plb3Ryb3BlKSB7XG5cdFx0XHR0aGlzLl96ZW90cm9wZS5kZXRhY2godGhpcyk7XG5cdFx0fVxuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltZztcblxuZnVuY3Rpb24gSW1nIChjYW52YXMsIG9wdCkge1xuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXG4gICAgLy8gcHJlbG9hZFxuICAgIHRoaXMuZWwgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmVsLm9ubG9hZCA9IHRoaXMub25Mb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5lbC5zcmMgPSB0aGlzLm9wdC5zcmM7XG5cbiAgICAvL1xuICAgIFxufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gICAgc3JjOiAnJyxcbiAgICBzaXplOiAnYXV0bycsIC8vIHNlZSBiYWNrZ3JvdW5kLXNpemUgY3NzIHByb3BlcnR5LFxuICAgIHBvc2l0aW9uOiAnY2VudGVyJyAvLyBiYWNrZ3JvdW5kLXBvc2l0aW9uXG59O1xuXG5JbWcucHJvdG90eXBlID0ge1xuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMCxcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmN0eC5kcmF3SW1hZ2UodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9LFxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgfSxcbiAgICBnZXRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHQuc2l6ZSA9PT0gJ3N0cmluZycpIHsgXG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHNjYWxlKHRoaXMub3B0LnNpemUsIHRoaXMuZWwsIHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBzaXplLnc7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IHNpemUuaDtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBcbiAgICB9XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZSBiYWNrZ3JvdW5kIGltYWdlIHNpemVcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSAgICdhdXRvJywgJ2NvbnRhaW4nIG9yICdjb3ZlcidcbiAqIEBwYXJhbSAge29iamVjdH0gY2hpbGRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyZW50IFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5mdW5jdGlvbiBzY2FsZSAodHlwZSwgY2hpbGQsIHBhcmVudCkge1xuICAgIGlmICh0eXBlID09PSAnYXV0bycpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHc6IGNoaWxkLndpZHRoLFxuICAgICAgICAgICAgaDogY2hpbGQuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkQVIgPSBjaGlsZC5oZWlnaHQgLyBjaGlsZC53aWR0aCxcbiAgICAgICAgcGFyZW50QVIgPSBwYXJlbnQuaGVpZ2h0IC8gcGFyZW50LndpZHRoLFxuICAgICAgICBzYW1lSGVpZ2h0ID0gdHlwZSA9PT0gJ2NvdmVyJyA/IHBhcmVudEFSID4gY2hpbGRBUiA6IHBhcmVudEFSIDwgY2hpbGRBUjtcblxuICAgIGlmIChzYW1lSGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3OiBwYXJlbnQuaGVpZ2h0IC8gY2hpbGRBUixcbiAgICAgICAgICAgIGg6IHBhcmVudC5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdzogcGFyZW50LndpZHRoLFxuICAgICAgICAgICAgaDogcGFyZW50LndpZHRoICogY2hpbGRBUlxuICAgICAgICB9O1xuICAgIH1cbn0iLG51bGwsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjYWxlO1xuXG5mdW5jdGlvbiBTY2FsZSAoc2l6ZSwgY2hpbGQsIHBhcmVudCkge1xuICAgIHRoaXMuc2l6ZSA9ICdzaXplJztcbiAgICB0aGlzLm9yaWdpbmFsID0gaGVscGVycy5leHRyYWN0KGNoaWxkLCBbJ3dpZHRoJywgJ2hlaWdodCddKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbn1cblxuU2NhbGUuZ2V0U2l6ZSA9IGdldFNpemU7XG5cblNjYWxlLnByb3RvdHlwZSA9IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRpID0gZ2V0U2l6ZSh0aGlzLnNpemUsIHRoaXMub3JpZ2luYWwsIHRoaXMucGFyZW50KTtcbiAgICAgICAgdGhpcy53aWR0aCA9IE1hdGgucm91bmQoZGkud2lkdGgpO1xuICAgICAgICB0aGlzLmhlaWdodCA9IE1hdGgucm91bmQoZGkuaGVpZ2h0KTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRldGFjaCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGdldFNpemUgKHNpemUsIGNoaWxkLCBwYXJlbnQpIHtcbiAgICBpZiAoc2l6ZSA9PT0gJ2F1dG8nKSB7XG4gICAgICAgIHJldHVybiBoZWxwZXJzLmV4dHJhY3QoY2hpbGQsIFsnd2lkdGgnLCAnaGVpZ2h0J10pO1xuICAgIH0gZWxzZSBpZiAoc2l6ZSA9PT0gJ2NvdmVyJyB8fCBzaXplID09PSAnY29udGFpbicpIHtcbiAgICAgICAgcmV0dXJuIGZ1bGxTY2FsZShzaXplLCBjaGlsZCwgcGFyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXJTY2FsZSggcGVyY2VudFRvUHgoIHBhcnNlU2l6ZVN0cihzaXplKSwgcGFyZW50ICkgKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2l6ZVN0ciAoc3RyKSB7XG4gICAgdmFyIHZhbCA9IHN0ci5zcGxpdCgnICcpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IHZhbFswXSxcbiAgICAgICAgaGVpZ2h0OiB2YWxbMV0ubGVuZ3RoID09PSAxID8gdmFsWzBdIDogdmFsWzFdIC8vIHJlcGVhdCB2YWx1ZSBmb3IgaGVpZ2h0IGlmIG9ubHkgd2lkdGggaXMgcHJvdmlkZWRcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBwZXJjZW50VG9QeCAoc2l6ZSwgcGFyZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGguaW5kZXhPZignJScpID09PSAtMSA/IHNpemUud2lkdGggOiBzaXplLndpZHRoLnNsaWNlKDAsIC0xKS8xMDAgKiBwYXJlbnQud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQuaW5kZXhPZignJScpID09PSAtMSA/IHNpemUuaGVpZ2h0IDogc2l6ZS53aWR0aC5zbGljZSgwLCAtMSkvMTAwICogcGFyZW50LmhlaWdodFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFyU2NhbGUgKG9yaWdpbmFsLCBzaXplKSB7XG4gICAgdmFyIGFyID0gb3JpZ2luYWwuaGVpZ2h0IC8gb3JpZ2luYWwud2lkdGg7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB3aWR0aDogc2l6ZS53aWR0aCA9PT0gJ2F1dG8nID8gc2l6ZS5oZWlnaHQgLyBhciA6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQgPT09ICdhdXRvJyA/IHNpemUud2lkdGggKiBhciA6IHNpemUuaGVpZ2h0XG4gICAgfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYmFja2dyb3VuZCBpbWFnZSBzaXplIGZvciAnY29udGFpbicgYW5kICdjb3ZlcidcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSAgICBjb250YWluJyBvciAnY292ZXInXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNoaWxkXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmVudCBcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuZnVuY3Rpb24gZnVsbFNjYWxlICh0eXBlLCBjaGlsZCwgcGFyZW50KSB7XG4gICAgdmFyIGNoaWxkQVIgPSBjaGlsZC5oZWlnaHQgLyBjaGlsZC53aWR0aCxcbiAgICAgICAgcGFyZW50QVIgPSBwYXJlbnQuaGVpZ2h0IC8gcGFyZW50LndpZHRoLFxuICAgICAgICBzYW1lSGVpZ2h0ID0gdHlwZSA9PT0gJ2NvdmVyJyA/IHBhcmVudEFSID4gY2hpbGRBUiA6IHBhcmVudEFSIDwgY2hpbGRBUjtcblxuICAgIGlmIChzYW1lSGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogcGFyZW50LmhlaWdodCAvIGNoaWxkQVIsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogcGFyZW50LndpZHRoICogY2hpbGRBUlxuICAgICAgICB9O1xuICAgIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW52YXMgPSByZXF1aXJlKCcuL2NvcmUvQ2FudmFzLmpzJyksXG5cdGZyYW1lID0gcmVxdWlyZSgnLi9jb3JlL2ZyYW1lLmpzJyksXG5cdEFuaW0gPSByZXF1aXJlKCcuL3JlbmRlci9BbmltLmpzJyksXG5cdGhlbHBlcnMgPSByZXF1aXJlKCcuL2NvcmUvaGVscGVycy5qcycpO1xuXG53aW5kb3cuWmVvdHJvcGUgPSBaZW90cm9wZTtcblxuZnVuY3Rpb24gWmVvdHJvcGUgKGVsKSB7XG5cdHRoaXMuY2FudmFzID0gbmV3IENhbnZhcyhlbCk7XG5cdHRoaXMuZnJhbWUgPSBmcmFtZS5hZGQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG59XG5cblplb3Ryb3BlLnByb3RvdHlwZSA9IHtcblx0YW5pbXM6IFtdLFxuXHRhbmltOiBmdW5jdGlvbiAob3B0KSB7XG5cdFx0dmFyIGFuaW0gPSBuZXcgQW5pbShvcHQpO1xuXHRcdGFuaW0uX3plb3Ryb3BlID0gdGhpcztcblx0XHR0aGlzLmFuaW1zLnB1c2goYW5pbSk7XG5cdFx0cmV0dXJuIGFuaW07XG5cdH0sXG5cdGRldGFjaDogZnVuY3Rpb24gKGFuaW0pIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmFuaW1zLCBhbmltKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5jYW52YXMuY2xlYXIoKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYW5pbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuYW5pbXNbaV0ucmVuZGVyKHRoaXMuY2FudmFzKTtcblx0XHR9XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKCkge1xuXHRcdGZyYW1lLnJlbW92ZSh0aGlzLmZyYW1lKTtcblx0XHR0aGlzLmNhbnZhcy5yZW1vdmUoKTtcblx0fVxufTsiXX0=
