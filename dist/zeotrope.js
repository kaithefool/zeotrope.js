/*!
 * zeotrope.js 1.0.0 <>
 * Contributor(s): Kai Lam <kai.chun.lam@gmail.com>
 * Last Build: 2015-05-01
*/


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

// const methods
helpers.extend(Dimension, {
    parsePropStr: parsePropStr,
    percentToPx: percentToPx,
    centerAt: centerAt,
    fillWithAspectRatio: fillWithAspectRatio,
    fullScale: fullScale
});


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
            pt = centerAt(pt, {x: origin[0], y: origin[1]}, this);
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
    str = str.replace(/top|left/g, '0');
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

function centerAt (pt, origin, dimen) {
    return {
        x: pt.x - (dimen ? percentToPx(origin.x, dimen.width) : origin.x),
        y: pt.y - (dimen ? percentToPx(origin.y, dimen.height) : origin.y)
    };
}

function fillWithAspectRatio (original, size) {
    var ar = original.height / original.width;

    return {
        width: size.width === 'auto' || !size.width ? size.height / ar : size.width,
        height: size.height === 'auto' || !size.height ? size.width * ar : size.height
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
    draw: function (dimen) {
        if (!this.loaded) {
            return;
        }

        var di = this.dimension;
        if (dimen) {
            di = helpers.extend({}, this.dimension, dimen);
        }

        this.canvas.ctx.drawImage(di.x, di.y, di.width, di.height);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKSxcbiAgICBEaW1lbnNpb24gPSByZXF1aXJlKCcuLy4uL3JlbmRlci9EaW1lbnNpb24uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG5cbmZ1bmN0aW9uIENhbnZhcyAoZWwpIHtcbiAgICB0aGlzLmVsID0gZWw7XG4gICAgdGhpcy5jdHggPSB0aGlzLmVsLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBvblJlc2l6ZSBldmVudFxuICAgIHRoaXMuX3Jlc2l6ZUhhbmRsZXIgPSB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgIHRoaXMuX29uUmVzaXplKCk7XG59XG5cbkNhbnZhcy5wcm90b3R5cGUgPSB7XG4gICAgZGltZW5zaW9uczogW10sXG4gICAgX29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3ID0gdGhpcy5lbC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGggPSB0aGlzLmVsLm9mZnNldEhlaWdodDtcblxuICAgICAgICBpZiAodyAhPT0gdGhpcy53aWR0aCAmJiBoICE9PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHc7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSBhbGwgZGltZW5zaW9uXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGltZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGltZW5zaW9uc1tpXS51cGRhdGUoKTtcbiAgICAgICAgICAgIH0gICAgICAgICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RGltZW5zaW9uOiBmdW5jdGlvbiAob3B0LCBiYXNlU2l6ZSkge1xuICAgICAgICB2YXIgZGltZW4gPSBuZXcgRGltZW5zaW9uKG9wdCwgYmFzZVNpemUsIHRoaXMpO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMucHVzaChkaW1lbik7XG4gICAgICAgIHJldHVybiBkaW1lbjtcbiAgICB9LFxuICAgIGRldGFjaDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgY29sbGVjdGlvbjtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGltZW5zaW9uKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uID0gdGhpcy5kaW1lbnNpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVscGVycy5yZW1vdmUoY29sbGVjdGlvbiwgb2JqKTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZWwucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcbiAgICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMuanMnKTtcbnZhciBlYXNpbmdzID0gcmVxdWlyZSgnLi9lYXNpbmdzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7XG5cbmZ1bmN0aW9uIFRpbWVsaW5lIChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0Ly8gaW5pdGlhbGl6ZVxuXHR0aGlzLmVhc2luZyA9IGVhc2luZ3Nbb3B0LmVhc2luZ107XG5cdHRoaXMuc3RhcnQgPSBvcHQuc3RhcnQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LnN0YXJ0IDogbmV3IERhdGUoKTtcblx0dGhpcy5lbmQgPSBvcHQuZW5kIGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5lbmQgOiBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSArIG9wdC5kdXJhdGlvbik7XG5cdHRoaXMuZHVyYXRpb24gPSB0aGlzLmVuZCAtIHRoaXMuc3RhcnQ7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0ZWFzaW5nOiAnbGluZWFyJyxcblx0c3RhcnQ6IG51bGwsXG5cdGVuZDogbnVsbCxcblx0ZHVyYXRpb246IDEwMDAsIC8vIG1pbGxpc2Vjb25kc1xuXHRpdGVyYXRlOiAxIC8vIGludGVnZXIgb3IgJ2luZmluaXRlJ1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlID0ge1xuXHRnZXRQcm9ncmVzczogZnVuY3Rpb24gKGRhdGVUaW1lKSB7XG5cdFx0dmFyIG5vdyA9IGRhdGVUaW1lIHx8IG5ldyBEYXRlKCk7XG5cblx0XHRpZiAobm93IDwgdGhpcy5zdGFydCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIGlmIChub3cgPiB0aGlzLmVuZCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmVhc2luZyggKG5vdyAtIHRoaXMuc3RhcnQpIC8gdGhpcy5kdXJhdGlvbiApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRPRE9zXG5cdCAqL1xuXHRyZXZlcnNlOiBmdW5jdGlvbiAoKSB7fSxcblx0cGF1c2U6IGZ1bmN0aW9uICgpIHt9LFxuXHRwbGF5OiBmdW5jdGlvbiAoKSB7fSxcblx0Z29UbzogZnVuY3Rpb24gKCkge31cbn07IiwiJ3VzZSBzdHJpY3QnO1xuLypcbiAqIEVhc2luZyBGdW5jdGlvbnMgLSBpbnNwaXJlZCBmcm9tIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuICogb25seSBjb25zaWRlcmluZyB0aGUgdCB2YWx1ZSBmb3IgdGhlIHJhbmdlIFswLCAxXSA9PiBbMCwgMV1cbiAqIHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqKDItdCk7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuICgtLXQpKnQqdCsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gNCp0KnQqdCA6ICh0LTEpKigyKnQtMikqKDIqdC0yKSsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDgqdCp0KnQqdCA6IDEtOCooLS10KSp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uIFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQ7IH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bGlzdGVuZXJzOiBbXSxcblx0c3RhdHVzOiAwLFxuXHRfZnJhbWU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5zdGF0dXMpIHtcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9mcmFtZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBTdGFydCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RhcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDE7XG5cblx0XHRpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdFx0dGhpcy5fZnJhbWUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faW50dmwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5fZnJhbWUuYmluZCh0aGlzKSwgMTYpOyAvLyA2MGZwc1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU3RvcCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMDtcblxuXHRcdGlmICh0aGlzLl9pbnR2bCkge1xuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5faW50dmwpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRyaWdnZXIgYWxsIGxpc3RlbmVyc1xuXHQgKi9cblx0ZXhlY3V0ZTogZnVuY3Rpb24gKCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGlzdGVuZXJzW2ldKCk7XG5cdFx0fVxuXHR9LFxuXHRhZGQ6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnN0YXJ0KCk7XG5cdFx0fVxuXHRcdHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMubGlzdGVuZXJzLCBsaXN0ZW5lcik7XG5cblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdG9wKCk7XG5cdFx0fVxuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBmb3IodmFyIGk9MTsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspXG5cdCAgICAgICAgZm9yKHZhciBrZXkgaW4gYXJndW1lbnRzW2ldKVxuXHQgICAgICAgICAgICBpZihhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcblx0ICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG5cdCAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuXHR9LFxuXHRleHRyYWN0OiBmdW5jdGlvbiAob2JqLCBwcm9wZXJ0aWVzKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cmVzdWx0W3Byb3BlcnRpZXNbaV1dID0gb2JqW3Byb3BlcnRpZXNbaV1dO1xuXHRcdH1cblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoYXJyYXksIGVsKSB7XG5cdFx0cmV0dXJuIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKGVsKSwgMSk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuLy4uL2NvcmUvVGltZWxpbmUuanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbTtcblxuLyoqXG4gKiBUT0RPOiBtdWx0aXBsZSB0aW1lbGluZXNcbiAqL1xuZnVuY3Rpb24gQW5pbSAob3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXHR0aGlzLnRpbWUgPSBuZXcgVGltZWxpbmUob3B0LnRpbWUpO1xuXHR0aGlzLmRyYXcgPSB0aGlzLm9wdC5kcmF3O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGZpbGxNb2RlOiAnbm9uZScsXG5cdHRpbWU6IHt9LFxuXHRkcmF3OiBmdW5jdGlvbiAoKSB7fSBcbn07XG5cbkFuaW0ucHJvdG90eXBlID0ge1xuXHRyZW5kZXI6IGZ1bmN0aW9uIChjYW52YXMpIHtcblx0XHR2YXIgcHJvZ3Jlc3MgPSB0aGlzLnRpbWUuZ2V0UHJvZ3Jlc3MoKTtcblxuXHRcdGlmICh0aGlzLmlzRmlsbChwcm9ncmVzcykpIHtcblx0XHRcdHRoaXMuZHJhdyhjYW52YXMsIHByb2dyZXNzKTtcblx0XHR9XG5cdH0sXG5cdGlzRmlsbDogZnVuY3Rpb24gKHByb2dyZXNzKSB7XG5cdFx0dmFyIGZpbGxNb2RlID0gdGhpcy5vcHQuZmlsbE1vZGU7XG5cblx0XHRpZiAoZmlsbE1vZGUgPT09ICdub25lJyAmJiAocHJvZ3Jlc3MgPT09IDAgfHwgcHJvZ3Jlc3MgPT09IDEpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2ZvcndhcmQnICYmIHByb2dyZXNzID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2JhY2t3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRkZXRhY2g6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5femVvdHJvcGUpIHtcblx0XHRcdHRoaXMuX3plb3Ryb3BlLmRldGFjaCh0aGlzKTtcblx0XHR9XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGltZW5zaW9uO1xuXG5mdW5jdGlvbiBEaW1lbnNpb24gKG9wdCwgYmFzZVNpemUsIHBhcmVudCkge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuICAgIHRoaXMuYmFzZVNpemUgPSBiYXNlU2l6ZTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIH1cbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICBzaXplOiAnY29udGFpbicsXG4gICAgb3JpZ2luOiAwXG59O1xuXG4vLyBjb25zdCBtZXRob2RzXG5oZWxwZXJzLmV4dGVuZChEaW1lbnNpb24sIHtcbiAgICBwYXJzZVByb3BTdHI6IHBhcnNlUHJvcFN0cixcbiAgICBwZXJjZW50VG9QeDogcGVyY2VudFRvUHgsXG4gICAgY2VudGVyQXQ6IGNlbnRlckF0LFxuICAgIGZpbGxXaXRoQXNwZWN0UmF0aW86IGZpbGxXaXRoQXNwZWN0UmF0aW8sXG4gICAgZnVsbFNjYWxlOiBmdWxsU2NhbGVcbn0pO1xuXG5cbkRpbWVuc2lvbi5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdC5zaXplKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IHNpemUuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgcG9zID0gdGhpcy5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy54ID0gcG9zLng7XG4gICAgICAgICAgICB0aGlzLnkgPSBwb3MueTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2l6ZTtcblxuICAgICAgICBpZiAodGhpcy5vcHQuc2l6ZSA9PT0gJ2F1dG8nIHx8IHRoaXMub3B0LnNpemUgPT09ICdhdXRvIGF1dG8nKSB7XG4gICAgICAgICAgICBzaXplID0gaGVscGVycy5leHRyYWN0KHRoaXMuYmFzZVNpemUsIFsnd2lkdGgnLCAnaGVpZ2h0J10pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0LnNpemUgPT09ICdjb3ZlcicgfHwgdGhpcy5vcHQuc2l6ZSA9PT0gJ2NvbnRhaW4nKSB7XG4gICAgICAgICAgICBzaXplID0gZnVsbFNjYWxlKHRoaXMub3B0LnNpemUsIHRoaXMuYmFzZVNpemUsIHRoaXMucGFyZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBzY2FsZSA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5zaXplKTtcbiAgICAgICAgICAgIHNpemUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUb1B4KHNjYWxlWzBdLCB0aGlzLnBhcmVudC53aWR0aCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBwZXJjZW50VG9QeChzY2FsZVswXSwgdGhpcy5wYXJlbnQuaGVpZ2h0KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2l6ZSA9IGZpbGxXaXRoQXNwZWN0UmF0aW8odGhpcy5iYXNlU2l6ZSwgc2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2l6ZTtcbiAgICB9LFxuICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwb3MgPSBwYXJzZVByb3BTdHIodGhpcy5vcHQucG9zaXRpb24pLFxuICAgICAgICAgICAgcHQgPSB7XG4gICAgICAgICAgICAgICAgeDogcGVyY2VudFRvUHgocG9zWzBdLCB0aGlzLnBhcmVudC53aWR0aCksXG4gICAgICAgICAgICAgICAgeTogcGVyY2VudFRvUHgocG9zWzFdLCB0aGlzLnBhcmVudC5oZWlnaHQpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIGFkanVzdCBmb3Igb3JpZ2luXG4gICAgICAgIGlmICh0aGlzLm9wdC5vcmlnaW4pIHtcbiAgICAgICAgICAgIHZhciBvcmlnaW4gPSBwYXJzZVByb3BTdHIodGhpcy5vcHQub3JpZ2luKTtcbiAgICAgICAgICAgIHB0ID0gY2VudGVyQXQocHQsIHt4OiBvcmlnaW5bMF0sIHk6IG9yaWdpblsxXX0sIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHB0O1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGV0YWNoKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZnVuY3Rpb24gcGFyc2VQcm9wU3RyIChzdHIpIHtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgnY2VudGVyJywgJzUwJScpO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC90b3B8bGVmdC9nLCAnMCcpO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9ib3R0b218cmlnaHQvZywgJzEwMCUnKTtcbiAgICB2YXIgdmFsID0gc3RyLnNwbGl0KCcgJyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICB2YWxbMF0sXG4gICAgICAgIHZhbC5sZW5ndGggPT09IDEgPyB2YWxbMF0gOiB2YWxbMV0gLy8gcmVwZWF0IHZhbHVlIGZvciBoZWlnaHQgaWYgb25seSB3aWR0aCBpcyBwcm92aWRlZFxuICAgIF07XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRUb1B4IChwZXJjZW50LCBwYXJlbnRQeCkge1xuICAgIHJldHVybiBwZXJjZW50LmluZGV4T2YoJyUnKSA9PT0gLTEgPyBwZXJjZW50IDogcGVyY2VudC5zbGljZSgwLCAtMSkgLyAxMDAgKiBwYXJlbnRQeDtcbn1cblxuZnVuY3Rpb24gY2VudGVyQXQgKHB0LCBvcmlnaW4sIGRpbWVuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogcHQueCAtIChkaW1lbiA/IHBlcmNlbnRUb1B4KG9yaWdpbi54LCBkaW1lbi53aWR0aCkgOiBvcmlnaW4ueCksXG4gICAgICAgIHk6IHB0LnkgLSAoZGltZW4gPyBwZXJjZW50VG9QeChvcmlnaW4ueSwgZGltZW4uaGVpZ2h0KSA6IG9yaWdpbi55KVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGZpbGxXaXRoQXNwZWN0UmF0aW8gKG9yaWdpbmFsLCBzaXplKSB7XG4gICAgdmFyIGFyID0gb3JpZ2luYWwuaGVpZ2h0IC8gb3JpZ2luYWwud2lkdGg7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB3aWR0aDogc2l6ZS53aWR0aCA9PT0gJ2F1dG8nIHx8ICFzaXplLndpZHRoID8gc2l6ZS5oZWlnaHQgLyBhciA6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQgPT09ICdhdXRvJyB8fCAhc2l6ZS5oZWlnaHQgPyBzaXplLndpZHRoICogYXIgOiBzaXplLmhlaWdodFxuICAgIH07XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIGJhY2tncm91bmQgaW1hZ2Ugc2l6ZSBmb3IgJ2NvbnRhaW4nIGFuZCAnY292ZXInXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGUgICAgY29udGFpbicgb3IgJ2NvdmVyJ1xuICogQHBhcmFtICB7b2JqZWN0fSBjaGlsZFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJlbnQgXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGZ1bGxTY2FsZSAodHlwZSwgY2hpbGQsIHBhcmVudCkge1xuICAgIHZhciBjaGlsZEFSID0gY2hpbGQuaGVpZ2h0IC8gY2hpbGQud2lkdGgsXG4gICAgICAgIHBhcmVudEFSID0gcGFyZW50LmhlaWdodCAvIHBhcmVudC53aWR0aCxcbiAgICAgICAgc2FtZUhlaWdodCA9IHR5cGUgPT09ICdjb3ZlcicgPyBwYXJlbnRBUiA+IGNoaWxkQVIgOiBwYXJlbnRBUiA8IGNoaWxkQVI7XG5cbiAgICBpZiAoc2FtZUhlaWdodCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC5oZWlnaHQgLyBjaGlsZEFSLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJlbnQuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBwYXJlbnQud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC53aWR0aCAqIGNoaWxkQVJcbiAgICAgICAgfTtcbiAgICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1nO1xuXG5mdW5jdGlvbiBJbWcgKHNyYywgb3B0LCBjYW52YXMpIHtcbiAgICB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcblxuICAgIC8vIHByZWxvYWRcbiAgICB0aGlzLmVsID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5lbC5vbmxvYWQgPSB0aGlzLl9vbkxvYWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmVsLnNyYyA9IHNyYztcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gICAgZGltZW5zaW9uOiB7XG4gICAgICAgIHNpemU6ICdjb3ZlcicsXG4gICAgICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICAgICAgb3JpZ2luOiAnNTAlIDUwJSdcbiAgICB9XG59O1xuXG5JbWcucHJvdG90eXBlID0ge1xuICAgIGRyYXc6IGZ1bmN0aW9uIChkaW1lbikge1xuICAgICAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGkgPSB0aGlzLmRpbWVuc2lvbjtcbiAgICAgICAgaWYgKGRpbWVuKSB7XG4gICAgICAgICAgICBkaSA9IGhlbHBlcnMuZXh0ZW5kKHt9LCB0aGlzLmRpbWVuc2lvbiwgZGltZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYW52YXMuY3R4LmRyYXdJbWFnZShkaS54LCBkaS55LCBkaS53aWR0aCwgZGkuaGVpZ2h0KTtcbiAgICB9LFxuICAgIF9vbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNhbnZhcy5nZXREaW1lbnNpb24odGhpcy5vcHQuZGltZW5zaW9uLCB0aGlzLmVsKTtcbiAgICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbnZhcyA9IHJlcXVpcmUoJy4vY29yZS9DYW52YXMuanMnKSxcblx0ZnJhbWUgPSByZXF1aXJlKCcuL2NvcmUvZnJhbWUuanMnKSxcblx0QW5pbSA9IHJlcXVpcmUoJy4vcmVuZGVyL0FuaW0uanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vY29yZS9oZWxwZXJzLmpzJyksXG5cdEltZyA9IHJlcXVpcmUoJy4vcmVuZGVyL0ltZy5qcycpO1xuXG53aW5kb3cuWmVvdHJvcGUgPSBaZW90cm9wZTtcblxuZnVuY3Rpb24gWmVvdHJvcGUgKGVsKSB7XG5cdHRoaXMuY2FudmFzID0gbmV3IENhbnZhcyhlbCk7XG5cdHRoaXMuZnJhbWUgPSBmcmFtZS5hZGQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG59XG5cblplb3Ryb3BlLnByb3RvdHlwZSA9IHtcblx0YW5pbXM6IFtdLFxuXHRhbmltOiBmdW5jdGlvbiAob3B0KSB7XG5cdFx0dmFyIGFuaW0gPSBuZXcgQW5pbShvcHQpO1xuXHRcdGFuaW0uX3plb3Ryb3BlID0gdGhpcztcblx0XHR0aGlzLmFuaW1zLnB1c2goYW5pbSk7XG5cdFx0cmV0dXJuIGFuaW07XG5cdH0sXG5cdGRpbWVuc2lvbjogZnVuY3Rpb24gKG9wdCwgYmFzZVNpemUpIHtcblx0XHRyZXR1cm4gdGhpcy5jYW52YXMuZ2V0RGltZW5zaW9uKG9wdCwgYmFzZVNpemUpO1xuXHR9LFxuXHRpbWc6IGZ1bmN0aW9uIChzcmMsIG9wdCkge1xuXHRcdHJldHVybiBuZXcgSW1nKHNyYywgb3B0LCB0aGlzLmNhbnZhcyk7XG5cdH0sXG5cdGRldGFjaDogZnVuY3Rpb24gKGFuaW0pIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmFuaW1zLCBhbmltKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5jYW52YXMuY2xlYXIoKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYW5pbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuYW5pbXNbaV0ucmVuZGVyKHRoaXMuY2FudmFzKTtcblx0XHR9XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKCkge1xuXHRcdGZyYW1lLnJlbW92ZSh0aGlzLmZyYW1lKTtcblx0XHR0aGlzLmNhbnZhcy5yZW1vdmUoKTtcblx0fVxufTsiXX0=
