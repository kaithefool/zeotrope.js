(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var helpers = require('./helpers'),
    Dimension = require('./../render/Dimension.js');

module.exports = Canvas;

function Canvas (el) {
    this.el = el;
    this.ctx = this.el.getContext('2d');

    // onResize event
    this._resizeHandler = this._onResize.bind(this);
    window.addEventListener(this._resizeHandler);
    this._onResize();
}

Canvas.prototype = {
    dimensions: [],
    _onResize: function () {
        var w = this.el.offsetWidth,
            h = this.el.offsetHeight;

        if (w !== this.width && h !== this.height) {
            this.width = w;
            this.height = h;
            this.el.setAttribute('width', this.width);
            this.el.setAttribute('height', this.height);

            // update all dimension
            for (var i = 0; i < this.dimensions.length; i++) {
                this.dimensions[i].update();
            }         
        }
    },
    getDimension: function (opt, baseSize) {
        var dimen = new Dimension(opt, baseSize, this);
        this.dimensions.push(dimen);
        return dimen;
    },
    detach: function (obj) {
        var collection;

        if (obj instanceof Dimension) {
            collection = this.dimensions;
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
},{"./../render/Dimension.js":7,"./helpers":5}],2:[function(require,module,exports){
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

module.exports = Dimension;

function Dimension (opt, baseSize, parent) {
    this.opt = helpers.extend({}, defaults, opt);
    this.baseSize = baseSize;
    if (parent) {
        this.parent = parent;
    }
}

var defaults = {
    position: 'center',
    size: 'contain',
    origin: 0
};

Dimension.prototype = {
    update: function () {
        if (this.opt.size) {
            var size = this.getSize();
            this.width = size.width;
            this.height = size.height;
        }

        if (this.opt.position) {
            var pos = this.getPosition();
            this.x = pos.x;
            this.y = pos.y;
        }
    },
    getSize: function () {
        var size;

        if (this.opt.size === 'auto' || this.opt.size === 'auto auto') {
            size = helpers.extract(this.baseSize, ['width', 'height']);
        } else if (this.opt.size === 'cover' || this.opt.size === 'contain') {
            size = fullScale(this.opt.size, this.baseSize, this.parent);
        } else {
            var scale = parsePropStr(this.opt.size);
            size = {
                width: percentToPx(scale[0], this.parent.width),
                height: percentToPx(scale[0], this.parent.height)
            };

            size = fillWithAspectRatio(this.baseSize, size);
        }

        return size;
    },
    getPosition: function () {
        var pos = parsePropStr(this.opt.position),
            pt = {
                x: percentToPx(pos[0], this.parent.width),
                y: percentToPx(pos[1], this.parent.height)
            };

        // adjust for origin
        if (this.opt.origin) {
            var origin = parsePropStr(this.opt.origin);
            pt = centerAt(pt, this, {x: origin[0], y: origin[1]});
        }

        return pt;
    },
    remove: function () {
        if (this.parent) {
            this.parent.detach(this);
        }
    }
};

function parsePropStr (str) {
    str = str.replace('center', '50%');
    str = str.replace(/top|left/g, 0);
    str = str.replace(/bottom|right/g, '100%');
    var val = str.split(' ');

    return [
        val[0],
        val.length === 1 ? val[0] : val[1] // repeat value for height if only width is provided
    ];
}

function percentToPx (percent, parentPx) {
    return percent.indexOf('%') === -1 ? percent : percent.slice(0, -1) / 100 * parentPx;
}

function centerAt (pt, dimen, origin) {
    return {
        x: pt.x - percentToPx(origin.x, dimen.width),
        y: pt.y - percentToPx(origin.y, dimen.height)
    };
}

function fillWithAspectRatio (original, size) {
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
},{"./../core/helpers.js":5}],8:[function(require,module,exports){
'use strict';

var helpers = require('./../core/helpers.js');

module.exports = Img;

function Img (src, opt, canvas) {
    this.opt = helpers.extend({}, defaults, opt);

    // preload
    this.el = new Image();
    this.el.onload = this._onLoad.bind(this);
    this.el.src = src;

    this.canvas = canvas;
}

var defaults = {
    dimension: {
        size: 'cover',
        position: 'center',
        origin: '50% 50%'
    }
};

Img.prototype = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    draw: function () {
        if (!this.loaded) {
            return;
        }

        this.canvas.ctx.drawImage(this.x, this.y, this.width, this.height);
    },
    _onLoad: function () {
        this.loaded = true;
        this.canvas.getDimension(this.opt.dimension, this.el);
    }
};
},{"./../core/helpers.js":5}],9:[function(require,module,exports){
'use strict';

var Canvas = require('./core/Canvas.js'),
	frame = require('./core/frame.js'),
	Anim = require('./render/Anim.js'),
	helpers = require('./core/helpers.js'),
	Img = require('./render/Img.js');

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
	dimension: function (opt, baseSize) {
		return this.canvas.getDimension(opt, baseSize);
	},
	img: function (src, opt) {
		return new Img(src, opt, this.canvas);
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
},{"./core/Canvas.js":1,"./core/frame.js":4,"./core/helpers.js":5,"./render/Anim.js":6,"./render/Img.js":8}]},{},[1,2,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpLFxuICAgIERpbWVuc2lvbiA9IHJlcXVpcmUoJy4vLi4vcmVuZGVyL0RpbWVuc2lvbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhcztcblxuZnVuY3Rpb24gQ2FudmFzIChlbCkge1xuICAgIHRoaXMuZWwgPSBlbDtcbiAgICB0aGlzLmN0eCA9IHRoaXMuZWwuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIG9uUmVzaXplIGV2ZW50XG4gICAgdGhpcy5fcmVzaXplSGFuZGxlciA9IHRoaXMuX29uUmVzaXplLmJpbmQodGhpcyk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgdGhpcy5fb25SZXNpemUoKTtcbn1cblxuQ2FudmFzLnByb3RvdHlwZSA9IHtcbiAgICBkaW1lbnNpb25zOiBbXSxcbiAgICBfb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHcgPSB0aGlzLmVsLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgaCA9IHRoaXMuZWwub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIGlmICh3ICE9PSB0aGlzLndpZHRoICYmIGggIT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gdztcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaDtcbiAgICAgICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIGFsbCBkaW1lbnNpb25cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaW1lbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zW2ldLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfSAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXREaW1lbnNpb246IGZ1bmN0aW9uIChvcHQsIGJhc2VTaXplKSB7XG4gICAgICAgIHZhciBkaW1lbiA9IG5ldyBEaW1lbnNpb24ob3B0LCBiYXNlU2l6ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMuZGltZW5zaW9ucy5wdXNoKGRpbWVuKTtcbiAgICAgICAgcmV0dXJuIGRpbWVuO1xuICAgIH0sXG4gICAgZGV0YWNoOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBjb2xsZWN0aW9uO1xuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEaW1lbnNpb24pIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gPSB0aGlzLmRpbWVuc2lvbnM7XG4gICAgICAgIH1cblxuICAgICAgICBoZWxwZXJzLnJlbW92ZShjb2xsZWN0aW9uLCBvYmopO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICAgICAgdGhpcy5lbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWwpO1xuICAgIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycy5qcycpO1xudmFyIGVhc2luZ3MgPSByZXF1aXJlKCcuL2Vhc2luZ3MuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lbGluZTtcblxuZnVuY3Rpb24gVGltZWxpbmUgKG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHQvLyBpbml0aWFsaXplXG5cdHRoaXMuZWFzaW5nID0gZWFzaW5nc1tvcHQuZWFzaW5nXTtcblx0dGhpcy5zdGFydCA9IG9wdC5zdGFydCBpbnN0YW5jZW9mIERhdGUgPyBvcHQuc3RhcnQgOiBuZXcgRGF0ZSgpO1xuXHR0aGlzLmVuZCA9IG9wdC5lbmQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LmVuZCA6IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpICsgb3B0LmR1cmF0aW9uKTtcblx0dGhpcy5kdXJhdGlvbiA9IHRoaXMuZW5kIC0gdGhpcy5zdGFydDtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXHRlYXNpbmc6ICdsaW5lYXInLFxuXHRzdGFydDogbnVsbCxcblx0ZW5kOiBudWxsLFxuXHRkdXJhdGlvbjogMTAwMCwgLy8gbWlsbGlzZWNvbmRzXG5cdGl0ZXJhdGU6IDEgLy8gaW50ZWdlciBvciAnaW5maW5pdGUnXG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUgPSB7XG5cdGdldFByb2dyZXNzOiBmdW5jdGlvbiAoZGF0ZVRpbWUpIHtcblx0XHR2YXIgbm93ID0gZGF0ZVRpbWUgfHwgbmV3IERhdGUoKTtcblxuXHRcdGlmIChub3cgPCB0aGlzLnN0YXJ0KSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9IGVsc2UgaWYgKG5vdyA+IHRoaXMuZW5kKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFzaW5nKCAobm93IC0gdGhpcy5zdGFydCkgLyB0aGlzLmR1cmF0aW9uICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogVE9ET3Ncblx0ICovXG5cdHJldmVyc2U6IGZ1bmN0aW9uICgpIHt9LFxuXHRwYXVzZTogZnVuY3Rpb24gKCkge30sXG5cdHBsYXk6IGZ1bmN0aW9uICgpIHt9LFxuXHRnb1RvOiBmdW5jdGlvbiAoKSB7fVxufTsiLCIndXNlIHN0cmljdCc7XG4vKlxuICogRWFzaW5nIEZ1bmN0aW9ucyAtIGluc3BpcmVkIGZyb20gaHR0cDovL2dpem1hLmNvbS9lYXNpbmcvXG4gKiBvbmx5IGNvbnNpZGVyaW5nIHRoZSB0IHZhbHVlIGZvciB0aGUgcmFuZ2UgWzAsIDFdID0+IFswLCAxXVxuICogc2VlIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dyZS8xNjUwMjk0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIG5vIGVhc2luZywgbm8gYWNjZWxlcmF0aW9uXG4gICAgbGluZWFyOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCooMi10KTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyAyKnQqdCA6IC0xKyg0LTIqdCkqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VJbkN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZU91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gKC0tdCkqdCp0KzE7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uIFxuICAgIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyA0KnQqdCp0IDogKHQtMSkqKDIqdC0yKSooMip0LTIpKzE7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZU91dFF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMS0oLS10KSp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gOCp0KnQqdCp0IDogMS04KigtLXQpKnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDErKC0tdCkqdCp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb24gXG4gICAgZWFzZUluT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDE2KnQqdCp0KnQqdCA6IDErMTYqKC0tdCkqdCp0KnQqdDsgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRsaXN0ZW5lcnM6IFtdLFxuXHRzdGF0dXM6IDAsXG5cdF9mcmFtZTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLnN0YXR1cykge1xuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2ZyYW1lLmJpbmQodGhpcykpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFN0YXJ0IGFuaW1hdGlvbiBsb29wXG5cdCAqL1xuXHRzdGFydDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMTtcblxuXHRcdGlmICh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG5cdFx0XHR0aGlzLl9mcmFtZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9pbnR2bCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLl9mcmFtZS5iaW5kKHRoaXMpLCAxNik7IC8vIDYwZnBzXG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTdG9wIGFuaW1hdGlvbiBsb29wXG5cdCAqL1xuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSAwO1xuXG5cdFx0aWYgKHRoaXMuX2ludHZsKSB7XG5cdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLl9pbnR2bCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogVHJpZ2dlciBhbGwgbGlzdGVuZXJzXG5cdCAqL1xuXHRleGVjdXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5saXN0ZW5lcnNbaV0oKTtcblx0XHR9XG5cdH0sXG5cdGFkZDogZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG5cdFx0aWYgKCF0aGlzLmxpc3RlbmVycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuc3RhcnQoKTtcblx0XHR9XG5cdFx0dGhpcy5saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cblx0XHRyZXR1cm4gbGlzdGVuZXI7XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG5cdFx0aGVscGVycy5yZW1vdmUodGhpcy5saXN0ZW5lcnMsIGxpc3RlbmVyKTtcblxuXHRcdGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnN0b3AoKTtcblx0XHR9XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRleHRlbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIGZvcih2YXIgaT0xOyBpPGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcblx0ICAgICAgICBmb3IodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pXG5cdCAgICAgICAgICAgIGlmKGFyZ3VtZW50c1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKVxuXHQgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcblx0ICAgIHJldHVybiBhcmd1bWVudHNbMF07XG5cdH0sXG5cdGV4dHJhY3Q6IGZ1bmN0aW9uIChvYmosIHByb3BlcnRpZXMpIHtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRyZXN1bHRbcHJvcGVydGllc1tpXV0gPSBvYmpbcHJvcGVydGllc1tpXV07XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChhcnJheSwgZWwpIHtcblx0XHRyZXR1cm4gYXJyYXkuc3BsaWNlKGFycmF5LmluZGV4T2YoZWwpLCAxKTtcblx0fVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBUaW1lbGluZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9UaW1lbGluZS5qcycpLFxuXHRoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltO1xuXG4vKipcbiAqIFRPRE86IG11bHRpcGxlIHRpbWVsaW5lc1xuICovXG5mdW5jdGlvbiBBbmltIChvcHQpIHtcblx0dGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG5cdHRoaXMudGltZSA9IG5ldyBUaW1lbGluZShvcHQudGltZSk7XG5cdHRoaXMuZHJhdyA9IHRoaXMub3B0LmRyYXc7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0ZmlsbE1vZGU6ICdub25lJyxcblx0dGltZToge30sXG5cdGRyYXc6IGZ1bmN0aW9uICgpIHt9IFxufTtcblxuQW5pbS5wcm90b3R5cGUgPSB7XG5cdHJlbmRlcjogZnVuY3Rpb24gKGNhbnZhcykge1xuXHRcdHZhciBwcm9ncmVzcyA9IHRoaXMudGltZS5nZXRQcm9ncmVzcygpO1xuXG5cdFx0aWYgKHRoaXMuaXNGaWxsKHByb2dyZXNzKSkge1xuXHRcdFx0dGhpcy5kcmF3KGNhbnZhcywgcHJvZ3Jlc3MpO1xuXHRcdH1cblx0fSxcblx0aXNGaWxsOiBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcblx0XHR2YXIgZmlsbE1vZGUgPSB0aGlzLm9wdC5maWxsTW9kZTtcblxuXHRcdGlmIChmaWxsTW9kZSA9PT0gJ25vbmUnICYmIChwcm9ncmVzcyA9PT0gMCB8fCBwcm9ncmVzcyA9PT0gMSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKGZpbGxNb2RlID09PSAnZm9yd2FyZCcgJiYgcHJvZ3Jlc3MgPT09IDApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKGZpbGxNb2RlID09PSAnYmFja3dhcmQnICYmIHByb2dyZXNzID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdGRldGFjaDogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLl96ZW90cm9wZSkge1xuXHRcdFx0dGhpcy5femVvdHJvcGUuZGV0YWNoKHRoaXMpO1xuXHRcdH1cblx0fVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaW1lbnNpb247XG5cbmZ1bmN0aW9uIERpbWVuc2lvbiAob3B0LCBiYXNlU2l6ZSwgcGFyZW50KSB7XG4gICAgdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG4gICAgdGhpcy5iYXNlU2l6ZSA9IGJhc2VTaXplO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgfVxufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gICAgcG9zaXRpb246ICdjZW50ZXInLFxuICAgIHNpemU6ICdjb250YWluJyxcbiAgICBvcmlnaW46IDBcbn07XG5cbkRpbWVuc2lvbi5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdC5zaXplKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IHNpemUuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgcG9zID0gdGhpcy5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy54ID0gcG9zLng7XG4gICAgICAgICAgICB0aGlzLnkgPSBwb3MueTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2l6ZTtcblxuICAgICAgICBpZiAodGhpcy5vcHQuc2l6ZSA9PT0gJ2F1dG8nIHx8IHRoaXMub3B0LnNpemUgPT09ICdhdXRvIGF1dG8nKSB7XG4gICAgICAgICAgICBzaXplID0gaGVscGVycy5leHRyYWN0KHRoaXMuYmFzZVNpemUsIFsnd2lkdGgnLCAnaGVpZ2h0J10pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0LnNpemUgPT09ICdjb3ZlcicgfHwgdGhpcy5vcHQuc2l6ZSA9PT0gJ2NvbnRhaW4nKSB7XG4gICAgICAgICAgICBzaXplID0gZnVsbFNjYWxlKHRoaXMub3B0LnNpemUsIHRoaXMuYmFzZVNpemUsIHRoaXMucGFyZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBzY2FsZSA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5zaXplKTtcbiAgICAgICAgICAgIHNpemUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUb1B4KHNjYWxlWzBdLCB0aGlzLnBhcmVudC53aWR0aCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBwZXJjZW50VG9QeChzY2FsZVswXSwgdGhpcy5wYXJlbnQuaGVpZ2h0KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2l6ZSA9IGZpbGxXaXRoQXNwZWN0UmF0aW8odGhpcy5iYXNlU2l6ZSwgc2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2l6ZTtcbiAgICB9LFxuICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwb3MgPSBwYXJzZVByb3BTdHIodGhpcy5vcHQucG9zaXRpb24pLFxuICAgICAgICAgICAgcHQgPSB7XG4gICAgICAgICAgICAgICAgeDogcGVyY2VudFRvUHgocG9zWzBdLCB0aGlzLnBhcmVudC53aWR0aCksXG4gICAgICAgICAgICAgICAgeTogcGVyY2VudFRvUHgocG9zWzFdLCB0aGlzLnBhcmVudC5oZWlnaHQpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIGFkanVzdCBmb3Igb3JpZ2luXG4gICAgICAgIGlmICh0aGlzLm9wdC5vcmlnaW4pIHtcbiAgICAgICAgICAgIHZhciBvcmlnaW4gPSBwYXJzZVByb3BTdHIodGhpcy5vcHQub3JpZ2luKTtcbiAgICAgICAgICAgIHB0ID0gY2VudGVyQXQocHQsIHRoaXMsIHt4OiBvcmlnaW5bMF0sIHk6IG9yaWdpblsxXX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHB0O1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGV0YWNoKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZnVuY3Rpb24gcGFyc2VQcm9wU3RyIChzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgnY2VudGVyJywgJzUwJScpO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC90b3B8bGVmdC9nLCAwKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvYm90dG9tfHJpZ2h0L2csICcxMDAlJyk7XG4gICAgdmFyIHZhbCA9IHN0ci5zcGxpdCgnICcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgdmFsWzBdLFxuICAgICAgICB2YWwubGVuZ3RoID09PSAxID8gdmFsWzBdIDogdmFsWzFdIC8vIHJlcGVhdCB2YWx1ZSBmb3IgaGVpZ2h0IGlmIG9ubHkgd2lkdGggaXMgcHJvdmlkZWRcbiAgICBdO1xufVxuXG5mdW5jdGlvbiBwZXJjZW50VG9QeCAocGVyY2VudCwgcGFyZW50UHgpIHtcbiAgICByZXR1cm4gcGVyY2VudC5pbmRleE9mKCclJykgPT09IC0xID8gcGVyY2VudCA6IHBlcmNlbnQuc2xpY2UoMCwgLTEpIC8gMTAwICogcGFyZW50UHg7XG59XG5cbmZ1bmN0aW9uIGNlbnRlckF0IChwdCwgZGltZW4sIG9yaWdpbikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHB0LnggLSBwZXJjZW50VG9QeChvcmlnaW4ueCwgZGltZW4ud2lkdGgpLFxuICAgICAgICB5OiBwdC55IC0gcGVyY2VudFRvUHgob3JpZ2luLnksIGRpbWVuLmhlaWdodClcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBmaWxsV2l0aEFzcGVjdFJhdGlvIChvcmlnaW5hbCwgc2l6ZSkge1xuICAgIHZhciBhciA9IG9yaWdpbmFsLmhlaWdodCAvIG9yaWdpbmFsLndpZHRoO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGggPT09ICdhdXRvJyA/IHNpemUuaGVpZ2h0IC8gYXIgOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0ID09PSAnYXV0bycgPyBzaXplLndpZHRoICogYXIgOiBzaXplLmhlaWdodFxuICAgIH07XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIGJhY2tncm91bmQgaW1hZ2Ugc2l6ZSBmb3IgJ2NvbnRhaW4nIGFuZCAnY292ZXInXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGUgICAgY29udGFpbicgb3IgJ2NvdmVyJ1xuICogQHBhcmFtICB7b2JqZWN0fSBjaGlsZFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJlbnQgXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGZ1bGxTY2FsZSAodHlwZSwgY2hpbGQsIHBhcmVudCkge1xuICAgIHZhciBjaGlsZEFSID0gY2hpbGQuaGVpZ2h0IC8gY2hpbGQud2lkdGgsXG4gICAgICAgIHBhcmVudEFSID0gcGFyZW50LmhlaWdodCAvIHBhcmVudC53aWR0aCxcbiAgICAgICAgc2FtZUhlaWdodCA9IHR5cGUgPT09ICdjb3ZlcicgPyBwYXJlbnRBUiA+IGNoaWxkQVIgOiBwYXJlbnRBUiA8IGNoaWxkQVI7XG5cbiAgICBpZiAoc2FtZUhlaWdodCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC5oZWlnaHQgLyBjaGlsZEFSLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJlbnQuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBwYXJlbnQud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC53aWR0aCAqIGNoaWxkQVJcbiAgICAgICAgfTtcbiAgICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1nO1xuXG5mdW5jdGlvbiBJbWcgKHNyYywgb3B0LCBjYW52YXMpIHtcbiAgICB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcblxuICAgIC8vIHByZWxvYWRcbiAgICB0aGlzLmVsID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5lbC5vbmxvYWQgPSB0aGlzLl9vbkxvYWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmVsLnNyYyA9IHNyYztcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gICAgZGltZW5zaW9uOiB7XG4gICAgICAgIHNpemU6ICdjb3ZlcicsXG4gICAgICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICAgICAgb3JpZ2luOiAnNTAlIDUwJSdcbiAgICB9XG59O1xuXG5JbWcucHJvdG90eXBlID0ge1xuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMCxcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgZHJhdzogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhbnZhcy5jdHguZHJhd0ltYWdlKHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSxcbiAgICBfb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jYW52YXMuZ2V0RGltZW5zaW9uKHRoaXMub3B0LmRpbWVuc2lvbiwgdGhpcy5lbCk7XG4gICAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW52YXMgPSByZXF1aXJlKCcuL2NvcmUvQ2FudmFzLmpzJyksXG5cdGZyYW1lID0gcmVxdWlyZSgnLi9jb3JlL2ZyYW1lLmpzJyksXG5cdEFuaW0gPSByZXF1aXJlKCcuL3JlbmRlci9BbmltLmpzJyksXG5cdGhlbHBlcnMgPSByZXF1aXJlKCcuL2NvcmUvaGVscGVycy5qcycpLFxuXHRJbWcgPSByZXF1aXJlKCcuL3JlbmRlci9JbWcuanMnKTtcblxud2luZG93Llplb3Ryb3BlID0gWmVvdHJvcGU7XG5cbmZ1bmN0aW9uIFplb3Ryb3BlIChlbCkge1xuXHR0aGlzLmNhbnZhcyA9IG5ldyBDYW52YXMoZWwpO1xuXHR0aGlzLmZyYW1lID0gZnJhbWUuYWRkKHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xufVxuXG5aZW90cm9wZS5wcm90b3R5cGUgPSB7XG5cdGFuaW1zOiBbXSxcblx0YW5pbTogZnVuY3Rpb24gKG9wdCkge1xuXHRcdHZhciBhbmltID0gbmV3IEFuaW0ob3B0KTtcblx0XHRhbmltLl96ZW90cm9wZSA9IHRoaXM7XG5cdFx0dGhpcy5hbmltcy5wdXNoKGFuaW0pO1xuXHRcdHJldHVybiBhbmltO1xuXHR9LFxuXHRkaW1lbnNpb246IGZ1bmN0aW9uIChvcHQsIGJhc2VTaXplKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2FudmFzLmdldERpbWVuc2lvbihvcHQsIGJhc2VTaXplKTtcblx0fSxcblx0aW1nOiBmdW5jdGlvbiAoc3JjLCBvcHQpIHtcblx0XHRyZXR1cm4gbmV3IEltZyhzcmMsIG9wdCwgdGhpcy5jYW52YXMpO1xuXHR9LFxuXHRkZXRhY2g6IGZ1bmN0aW9uIChhbmltKSB7XG5cdFx0aGVscGVycy5yZW1vdmUodGhpcy5hbmltcywgYW5pbSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuY2FudmFzLmNsZWFyKCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmFuaW1zW2ldLnJlbmRlcih0aGlzLmNhbnZhcyk7XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uICgpIHtcblx0XHRmcmFtZS5yZW1vdmUodGhpcy5mcmFtZSk7XG5cdFx0dGhpcy5jYW52YXMucmVtb3ZlKCk7XG5cdH1cbn07Il19
