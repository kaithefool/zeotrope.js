/*!
 * zeotrope.js 1.0.0 <>
 * Contributor(s): Kai Lam <kai.chun.lam@gmail.com>
 * Last Build: 2015-04-30
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyksXG4gICAgRGltZW5zaW9uID0gcmVxdWlyZSgnLi8uLi9yZW5kZXIvRGltZW5zaW9uLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuXG5mdW5jdGlvbiBDYW52YXMgKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gb25SZXNpemUgZXZlbnRcbiAgICB0aGlzLl9yZXNpemVIYW5kbGVyID0gdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xufVxuXG5DYW52YXMucHJvdG90eXBlID0ge1xuICAgIGRpbWVuc2lvbnM6IFtdLFxuICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdyA9IHRoaXMuZWwub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHcgIT09IHRoaXMud2lkdGggJiYgaCAhPT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCk7XG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgYWxsIGRpbWVuc2lvblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnNbaV0udXBkYXRlKCk7XG4gICAgICAgICAgICB9ICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldERpbWVuc2lvbjogZnVuY3Rpb24gKG9wdCwgYmFzZVNpemUpIHtcbiAgICAgICAgdmFyIGRpbWVuID0gbmV3IERpbWVuc2lvbihvcHQsIGJhc2VTaXplLCB0aGlzKTtcbiAgICAgICAgdGhpcy5kaW1lbnNpb25zLnB1c2goZGltZW4pO1xuICAgICAgICByZXR1cm4gZGltZW47XG4gICAgfSxcbiAgICBkZXRhY2g6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb247XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERpbWVuc2lvbikge1xuICAgICAgICAgICAgY29sbGVjdGlvbiA9IHRoaXMuZGltZW5zaW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGhlbHBlcnMucmVtb3ZlKGNvbGxlY3Rpb24sIG9iaik7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgICAgICB0aGlzLmVsLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbCk7XG4gICAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzLmpzJyk7XG52YXIgZWFzaW5ncyA9IHJlcXVpcmUoJy4vZWFzaW5ncy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lO1xuXG5mdW5jdGlvbiBUaW1lbGluZSAob3B0aW9ucykge1xuXHR2YXIgb3B0ID0gdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdC8vIGluaXRpYWxpemVcblx0dGhpcy5lYXNpbmcgPSBlYXNpbmdzW29wdC5lYXNpbmddO1xuXHR0aGlzLnN0YXJ0ID0gb3B0LnN0YXJ0IGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5zdGFydCA6IG5ldyBEYXRlKCk7XG5cdHRoaXMuZW5kID0gb3B0LmVuZCBpbnN0YW5jZW9mIERhdGUgPyBvcHQuZW5kIDogbmV3IERhdGUodGhpcy5zdGFydC5nZXRUaW1lKCkgKyBvcHQuZHVyYXRpb24pO1xuXHR0aGlzLmR1cmF0aW9uID0gdGhpcy5lbmQgLSB0aGlzLnN0YXJ0O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGVhc2luZzogJ2xpbmVhcicsXG5cdHN0YXJ0OiBudWxsLFxuXHRlbmQ6IG51bGwsXG5cdGR1cmF0aW9uOiAxMDAwLCAvLyBtaWxsaXNlY29uZHNcblx0aXRlcmF0ZTogMSAvLyBpbnRlZ2VyIG9yICdpbmZpbml0ZSdcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZSA9IHtcblx0Z2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uIChkYXRlVGltZSkge1xuXHRcdHZhciBub3cgPSBkYXRlVGltZSB8fCBuZXcgRGF0ZSgpO1xuXG5cdFx0aWYgKG5vdyA8IHRoaXMuc3RhcnQpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAobm93ID4gdGhpcy5lbmQpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lYXNpbmcoIChub3cgLSB0aGlzLnN0YXJ0KSAvIHRoaXMuZHVyYXRpb24gKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUT0RPc1xuXHQgKi9cblx0cmV2ZXJzZTogZnVuY3Rpb24gKCkge30sXG5cdHBhdXNlOiBmdW5jdGlvbiAoKSB7fSxcblx0cGxheTogZnVuY3Rpb24gKCkge30sXG5cdGdvVG86IGZ1bmN0aW9uICgpIHt9XG59OyIsIid1c2Ugc3RyaWN0Jztcbi8qXG4gKiBFYXNpbmcgRnVuY3Rpb25zIC0gaW5zcGlyZWQgZnJvbSBodHRwOi8vZ2l6bWEuY29tL2Vhc2luZy9cbiAqIG9ubHkgY29uc2lkZXJpbmcgdGhlIHQgdmFsdWUgZm9yIHRoZSByYW5nZSBbMCwgMV0gPT4gWzAsIDFdXG4gKiBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDIqdCp0IDogLTErKDQtMip0KSp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb24gXG4gICAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMSsoLS10KSp0KnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMTYqdCp0KnQqdCp0IDogMSsxNiooLS10KSp0KnQqdCp0OyB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGxpc3RlbmVyczogW10sXG5cdHN0YXR1czogMCxcblx0X2ZyYW1lOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdHVzKSB7XG5cdFx0XHR0aGlzLmV4ZWN1dGUoKTtcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZnJhbWUuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogU3RhcnQgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSAxO1xuXG5cdFx0aWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcblx0XHRcdHRoaXMuX2ZyYW1lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2ludHZsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuX2ZyYW1lLmJpbmQodGhpcyksIDE2KTsgLy8gNjBmcHNcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFN0b3AgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDA7XG5cblx0XHRpZiAodGhpcy5faW50dmwpIHtcblx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2ludHZsKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGFsbCBsaXN0ZW5lcnNcblx0ICovXG5cdGV4ZWN1dGU6IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmxpc3RlbmVyc1tpXSgpO1xuXHRcdH1cblx0fSxcblx0YWRkOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdGFydCgpO1xuXHRcdH1cblx0XHR0aGlzLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmxpc3RlbmVycywgbGlzdGVuZXIpO1xuXG5cdFx0aWYgKCF0aGlzLmxpc3RlbmVycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuc3RvcCgpO1xuXHRcdH1cblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGV4dGVuZDogZnVuY3Rpb24gKCkge1xuXHQgICAgZm9yKHZhciBpPTE7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuXHQgICAgICAgIGZvcih2YXIga2V5IGluIGFyZ3VtZW50c1tpXSlcblx0ICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmhhc093blByb3BlcnR5KGtleSkpXG5cdCAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1ba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuXHQgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcblx0fSxcblx0ZXh0cmFjdDogZnVuY3Rpb24gKG9iaiwgcHJvcGVydGllcykge1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJlc3VsdFtwcm9wZXJ0aWVzW2ldXSA9IG9ialtwcm9wZXJ0aWVzW2ldXTtcblx0XHR9XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKGFycmF5LCBlbCkge1xuXHRcdHJldHVybiBhcnJheS5zcGxpY2UoYXJyYXkuaW5kZXhPZihlbCksIDEpO1xuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFRpbWVsaW5lID0gcmVxdWlyZSgnLi8uLi9jb3JlL1RpbWVsaW5lLmpzJyksXG5cdGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW07XG5cbi8qKlxuICogVE9ETzogbXVsdGlwbGUgdGltZWxpbmVzXG4gKi9cbmZ1bmN0aW9uIEFuaW0gKG9wdCkge1xuXHR0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcblx0dGhpcy50aW1lID0gbmV3IFRpbWVsaW5lKG9wdC50aW1lKTtcblx0dGhpcy5kcmF3ID0gdGhpcy5vcHQuZHJhdztcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXHRmaWxsTW9kZTogJ25vbmUnLFxuXHR0aW1lOiB7fSxcblx0ZHJhdzogZnVuY3Rpb24gKCkge30gXG59O1xuXG5BbmltLnByb3RvdHlwZSA9IHtcblx0cmVuZGVyOiBmdW5jdGlvbiAoY2FudmFzKSB7XG5cdFx0dmFyIHByb2dyZXNzID0gdGhpcy50aW1lLmdldFByb2dyZXNzKCk7XG5cblx0XHRpZiAodGhpcy5pc0ZpbGwocHJvZ3Jlc3MpKSB7XG5cdFx0XHR0aGlzLmRyYXcoY2FudmFzLCBwcm9ncmVzcyk7XG5cdFx0fVxuXHR9LFxuXHRpc0ZpbGw6IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuXHRcdHZhciBmaWxsTW9kZSA9IHRoaXMub3B0LmZpbGxNb2RlO1xuXG5cdFx0aWYgKGZpbGxNb2RlID09PSAnbm9uZScgJiYgKHByb2dyZXNzID09PSAwIHx8IHByb2dyZXNzID09PSAxKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdmb3J3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdiYWNrd2FyZCcgJiYgcHJvZ3Jlc3MgPT09IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX3plb3Ryb3BlKSB7XG5cdFx0XHR0aGlzLl96ZW90cm9wZS5kZXRhY2godGhpcyk7XG5cdFx0fVxuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpbWVuc2lvbjtcblxuZnVuY3Rpb24gRGltZW5zaW9uIChvcHQsIGJhc2VTaXplLCBwYXJlbnQpIHtcbiAgICB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcbiAgICB0aGlzLmJhc2VTaXplID0gYmFzZVNpemU7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB9XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBwb3NpdGlvbjogJ2NlbnRlcicsXG4gICAgc2l6ZTogJ2NvbnRhaW4nLFxuICAgIG9yaWdpbjogMFxufTtcblxuRGltZW5zaW9uLnByb3RvdHlwZSA9IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0LnNpemUpIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gdGhpcy5nZXRTaXplKCk7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gc2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnggPSBwb3MueDtcbiAgICAgICAgICAgIHRoaXMueSA9IHBvcy55O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzaXplO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdC5zaXplID09PSAnYXV0bycgfHwgdGhpcy5vcHQuc2l6ZSA9PT0gJ2F1dG8gYXV0bycpIHtcbiAgICAgICAgICAgIHNpemUgPSBoZWxwZXJzLmV4dHJhY3QodGhpcy5iYXNlU2l6ZSwgWyd3aWR0aCcsICdoZWlnaHQnXSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHQuc2l6ZSA9PT0gJ2NvdmVyJyB8fCB0aGlzLm9wdC5zaXplID09PSAnY29udGFpbicpIHtcbiAgICAgICAgICAgIHNpemUgPSBmdWxsU2NhbGUodGhpcy5vcHQuc2l6ZSwgdGhpcy5iYXNlU2l6ZSwgdGhpcy5wYXJlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHNjYWxlID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0LnNpemUpO1xuICAgICAgICAgICAgc2l6ZSA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRvUHgoc2NhbGVbMF0sIHRoaXMucGFyZW50LndpZHRoKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHBlcmNlbnRUb1B4KHNjYWxlWzBdLCB0aGlzLnBhcmVudC5oZWlnaHQpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzaXplID0gZmlsbFdpdGhBc3BlY3RSYXRpbyh0aGlzLmJhc2VTaXplLCBzaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzaXplO1xuICAgIH0sXG4gICAgZ2V0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBvcyA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5wb3NpdGlvbiksXG4gICAgICAgICAgICBwdCA9IHtcbiAgICAgICAgICAgICAgICB4OiBwZXJjZW50VG9QeChwb3NbMF0sIHRoaXMucGFyZW50LndpZHRoKSxcbiAgICAgICAgICAgICAgICB5OiBwZXJjZW50VG9QeChwb3NbMV0sIHRoaXMucGFyZW50LmhlaWdodClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gYWRqdXN0IGZvciBvcmlnaW5cbiAgICAgICAgaWYgKHRoaXMub3B0Lm9yaWdpbikge1xuICAgICAgICAgICAgdmFyIG9yaWdpbiA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5vcmlnaW4pO1xuICAgICAgICAgICAgcHQgPSBjZW50ZXJBdChwdCwgdGhpcywge3g6IG9yaWdpblswXSwgeTogb3JpZ2luWzFdfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHQ7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kZXRhY2godGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBwYXJzZVByb3BTdHIgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKCdjZW50ZXInLCAnNTAlJyk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL3RvcHxsZWZ0L2csIDApO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9ib3R0b218cmlnaHQvZywgJzEwMCUnKTtcbiAgICB2YXIgdmFsID0gc3RyLnNwbGl0KCcgJyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICB2YWxbMF0sXG4gICAgICAgIHZhbC5sZW5ndGggPT09IDEgPyB2YWxbMF0gOiB2YWxbMV0gLy8gcmVwZWF0IHZhbHVlIGZvciBoZWlnaHQgaWYgb25seSB3aWR0aCBpcyBwcm92aWRlZFxuICAgIF07XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRUb1B4IChwZXJjZW50LCBwYXJlbnRQeCkge1xuICAgIHJldHVybiBwZXJjZW50LmluZGV4T2YoJyUnKSA9PT0gLTEgPyBwZXJjZW50IDogcGVyY2VudC5zbGljZSgwLCAtMSkgLyAxMDAgKiBwYXJlbnRQeDtcbn1cblxuZnVuY3Rpb24gY2VudGVyQXQgKHB0LCBkaW1lbiwgb3JpZ2luKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogcHQueCAtIHBlcmNlbnRUb1B4KG9yaWdpbi54LCBkaW1lbi53aWR0aCksXG4gICAgICAgIHk6IHB0LnkgLSBwZXJjZW50VG9QeChvcmlnaW4ueSwgZGltZW4uaGVpZ2h0KVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGZpbGxXaXRoQXNwZWN0UmF0aW8gKG9yaWdpbmFsLCBzaXplKSB7XG4gICAgdmFyIGFyID0gb3JpZ2luYWwuaGVpZ2h0IC8gb3JpZ2luYWwud2lkdGg7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB3aWR0aDogc2l6ZS53aWR0aCA9PT0gJ2F1dG8nID8gc2l6ZS5oZWlnaHQgLyBhciA6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQgPT09ICdhdXRvJyA/IHNpemUud2lkdGggKiBhciA6IHNpemUuaGVpZ2h0XG4gICAgfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYmFja2dyb3VuZCBpbWFnZSBzaXplIGZvciAnY29udGFpbicgYW5kICdjb3ZlcidcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSAgICBjb250YWluJyBvciAnY292ZXInXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNoaWxkXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmVudCBcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuZnVuY3Rpb24gZnVsbFNjYWxlICh0eXBlLCBjaGlsZCwgcGFyZW50KSB7XG4gICAgdmFyIGNoaWxkQVIgPSBjaGlsZC5oZWlnaHQgLyBjaGlsZC53aWR0aCxcbiAgICAgICAgcGFyZW50QVIgPSBwYXJlbnQuaGVpZ2h0IC8gcGFyZW50LndpZHRoLFxuICAgICAgICBzYW1lSGVpZ2h0ID0gdHlwZSA9PT0gJ2NvdmVyJyA/IHBhcmVudEFSID4gY2hpbGRBUiA6IHBhcmVudEFSIDwgY2hpbGRBUjtcblxuICAgIGlmIChzYW1lSGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogcGFyZW50LmhlaWdodCAvIGNoaWxkQVIsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogcGFyZW50LndpZHRoICogY2hpbGRBUlxuICAgICAgICB9O1xuICAgIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWc7XG5cbmZ1bmN0aW9uIEltZyAoc3JjLCBvcHQsIGNhbnZhcykge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXG4gICAgLy8gcHJlbG9hZFxuICAgIHRoaXMuZWwgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmVsLm9ubG9hZCA9IHRoaXMuX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWwuc3JjID0gc3JjO1xuXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBkaW1lbnNpb246IHtcbiAgICAgICAgc2l6ZTogJ2NvdmVyJyxcbiAgICAgICAgcG9zaXRpb246ICdjZW50ZXInLFxuICAgICAgICBvcmlnaW46ICc1MCUgNTAlJ1xuICAgIH1cbn07XG5cbkltZy5wcm90b3R5cGUgPSB7XG4gICAgZHJhdzogZnVuY3Rpb24gKGRpbWVuKSB7XG4gICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaSA9IHRoaXMuZGltZW5zaW9uO1xuICAgICAgICBpZiAoZGltZW4pIHtcbiAgICAgICAgICAgIGRpID0gaGVscGVycy5leHRlbmQoe30sIHRoaXMuZGltZW5zaW9uLCBkaW1lbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhbnZhcy5jdHguZHJhd0ltYWdlKGRpLngsIGRpLnksIGRpLndpZHRoLCBkaS5oZWlnaHQpO1xuICAgIH0sXG4gICAgX29uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY2FudmFzLmdldERpbWVuc2lvbih0aGlzLm9wdC5kaW1lbnNpb24sIHRoaXMuZWwpO1xuICAgIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FudmFzID0gcmVxdWlyZSgnLi9jb3JlL0NhbnZhcy5qcycpLFxuXHRmcmFtZSA9IHJlcXVpcmUoJy4vY29yZS9mcmFtZS5qcycpLFxuXHRBbmltID0gcmVxdWlyZSgnLi9yZW5kZXIvQW5pbS5qcycpLFxuXHRoZWxwZXJzID0gcmVxdWlyZSgnLi9jb3JlL2hlbHBlcnMuanMnKSxcblx0SW1nID0gcmVxdWlyZSgnLi9yZW5kZXIvSW1nLmpzJyk7XG5cbndpbmRvdy5aZW90cm9wZSA9IFplb3Ryb3BlO1xuXG5mdW5jdGlvbiBaZW90cm9wZSAoZWwpIHtcblx0dGhpcy5jYW52YXMgPSBuZXcgQ2FudmFzKGVsKTtcblx0dGhpcy5mcmFtZSA9IGZyYW1lLmFkZCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpKTtcbn1cblxuWmVvdHJvcGUucHJvdG90eXBlID0ge1xuXHRhbmltczogW10sXG5cdGFuaW06IGZ1bmN0aW9uIChvcHQpIHtcblx0XHR2YXIgYW5pbSA9IG5ldyBBbmltKG9wdCk7XG5cdFx0YW5pbS5femVvdHJvcGUgPSB0aGlzO1xuXHRcdHRoaXMuYW5pbXMucHVzaChhbmltKTtcblx0XHRyZXR1cm4gYW5pbTtcblx0fSxcblx0ZGltZW5zaW9uOiBmdW5jdGlvbiAob3B0LCBiYXNlU2l6ZSkge1xuXHRcdHJldHVybiB0aGlzLmNhbnZhcy5nZXREaW1lbnNpb24ob3B0LCBiYXNlU2l6ZSk7XG5cdH0sXG5cdGltZzogZnVuY3Rpb24gKHNyYywgb3B0KSB7XG5cdFx0cmV0dXJuIG5ldyBJbWcoc3JjLCBvcHQsIHRoaXMuY2FudmFzKTtcblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoYW5pbSkge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMuYW5pbXMsIGFuaW0pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLmNhbnZhcy5jbGVhcigpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5hbmltc1tpXS5yZW5kZXIodGhpcy5jYW52YXMpO1xuXHRcdH1cblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG5cdFx0ZnJhbWUucmVtb3ZlKHRoaXMuZnJhbWUpO1xuXHRcdHRoaXMuY2FudmFzLnJlbW92ZSgpO1xuXHR9XG59OyJdfQ==
