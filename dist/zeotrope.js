/*!
 * zeotrope.js 1.0.0 <>
 * Contributor(s): Kai Lam <kai.chun.lam@gmail.com>
 * Last Build: 2016-01-06
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
    window.addEventListener('resize', this._resizeHandler);
    this._onResize();
}

Canvas.prototype = {
    dimensions: [],
    _onResize: function () {
        var w = this.el.offsetWidth,
            h = this.el.offsetHeight;

        if (w !== this.width || h !== this.height) {
            this.width = w;
            this.height = h;
            this.diagonal = Math.sqrt((w*w) + (h*h));
            this.el.setAttribute('width', this.width);
            this.el.setAttribute('height', this.height);

            // update all dimension
            for (var i = 0; i < this.dimensions.length; i++) {
                this.dimensions[i].update();
            }         

            this.resize();
        }
    },
    resize: function () {},
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
    remove: function (removeEl) {
        window.removeEventListener('resize', this._resizeHandler);
        if (removeEl) {
            this.el.parentElement.removeChild(this.el);
        }
    }
};
},{"./../render/Dimension.js":7,"./helpers":5}],2:[function(require,module,exports){
'use strict';

var helpers = require('./helpers.js');
var easings = require('./easings.js');

module.exports = Timeline;

function Timeline (options) {
	var opt = this.opt = helpers.extend({}, defaults, options);

	/**
	 * todo: rewrite this
	 */

	// initialize
	this.easing = easings[opt.easing];
	this.start = opt.start instanceof Date ? opt.start : new Date();
	if (opt.delay) {
		this.start = new Date(this.start.getTime() + opt.delay);
	}
	if (opt.iterate !== 'infinite') {
		this.end = opt.end instanceof Date ? opt.end : new Date(this.start.getTime() + (opt.duration*opt.iterate));
		this.duration = (this.end.getTime() - this.start) / opt.iterate;
	} else {
		this.duration = opt.duration;
	}
}

var defaults = {
	easing: 'linear',
	start: null,
	end: null,
	delay: 0, // milliseconds
	duration: 1000, // milliseconds
	iterate: 1 // integer or 'infinite'
};

Timeline.prototype = {
	backward: false,
	pausedAt: null,
	getProgress: function (now) {
		var current = this.getCurrent(now);

		if (this.backward) {
			current = 1 - current;
		}

		return current === 0 || current === 1 ? current : this.easing(current);
	},
	getCurrent: function (now) {
		now = now ? now : new Date();

		if (this.pausedAt !== null) {
			return this.pausedAt;
		} else if (now < this.start) {
			return 0;
		} else if (this.end && now > this.end) {
			return 1;
		} else {
			return ( (now - this.start) / this.duration ) % 1;
		}
	},
	pause: function (now) {
		this.pausedAt = this.getCurrent(now);
	},
	reverse: function (now) {
		var current = this.getCurrent(now);

		this.end = new Date(now.getTime() + (current * this.duration));
		this.start = new Date(this.end.getTime() - this.duration);
		this.backward = this.backward ? false : true;

		return this.getCurrent(now);
	},
	play: function (now) {
		if (this.pausedAt) {
			now = now ? now : new Date();

			this.end = new Date(now.getTime() + ((1 - this.pausedAt) * this.duration));
			this.start = new Date(this.end.getTime() - this.duration);
			this.pausedAt = null;
		}
	}
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
			if (obj[properties[i]]) {
				result[properties[i]] = obj[properties[i]];	
			}
		}
		return result;
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
	if (this.opt.start) {
		this.start();
	}
}

var defaults = {
	fillMode: 'both',
	time: {},
	start: true,
	draw: function () {}
};

Anim.prototype = {
	started: false,
	start: function () {
		this.time = new Timeline(this.opt.time);
		this.draw = this.opt.draw;
		this.started = true;
	},
	render: function (canvas) {
		this.progress = this.time.getProgress();

		if (this.isFill(this.progress)) {
			this.draw(canvas, this.progress, this.opt);
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
    this.update();
}

var defaults = {
    position: null,
    size: null,
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
                width: percentToPx(scale[0], this.parent ? this.parent.width : undefined),
                height: percentToPx(scale[1], this.parent ? this.parent.height : undefined)
            };

            if (this.baseSize) {
                size = fillWithAspectRatio(this.baseSize, size);    
            }
        }

        // only output number
        return {
            width: Number(size.width),
            height: Number(size.height)
        };
    },
    getPosition: function () {
        var pos = parsePropStr(this.opt.position),
            pt = {
                x: percentToPx(pos[0], this.parent ? this.parent.width : undefined),
                y: percentToPx(pos[1], this.parent ? this.parent.height : undefined)
            };

        // adjust for origin
        if (this.opt.origin) {
            var origin = parsePropStr(this.opt.origin);
            pt = centerAt(pt, {x: origin[0], y: origin[1]}, this);
        }

        return {
            x: Number(pt.x),
            y: Number(pt.y)
        };
    },
    remove: function () {
        if (this.parent) {
            this.parent.detach(this);
        }
    }
};

function parsePropStr (str) {
    str = str.toString();
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
    size: 'cover',
    position: 'center',
    origin: '50% 50%'
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

        this.canvas.ctx.drawImage(this.el, di.x, di.y, di.width, di.height);
    },
    _onLoad: function () {
        this.loaded = true;
        this.dimension = this.canvas.getDimension(this.opt, this.el);
        this.onload();
    },
    onload: function () {}
};
},{"./../core/helpers.js":5}],9:[function(require,module,exports){
'use strict';

var Canvas = require('./core/Canvas.js'),
	frame = require('./core/frame.js'),
	Anim = require('./render/Anim.js'),
	helpers = require('./core/helpers.js'),
	Img = require('./render/Img.js'),
	Timeline = require('./core/Timeline.js');

window.Zeotrope = Zeotrope;

function Zeotrope (el, opt) {
	this.opt = helpers.extend({}, defaults, opt);

	this.canvas = new Canvas(el);
	this.frame = frame.add(this.render.bind(this));

	// collections
	this.anims = [];
	this.imgs = [];
}

var defaults = {
	onComplete: function () {},
	destroyOnComplete: true,
	removeElOnComplete: true,
	onload: function () {},
	startOnLoad: true,
	clearOnFrame: true
};

Zeotrope.prototype = {
	anim: function (opt) {
		if (this.opt.startOnLoad && this.imgs.length) {
			opt.start = typeof opt.start === 'boolean' ? opt.start : false;
		}

		var anim = new Anim(opt);
		anim._zeotrope = this;
		this.anims.push(anim);
		return anim;
	},
	time: function (opt) {
		return new Timeline(opt);
	},
	dimension: function (opt, baseSize) {
		return this.canvas.getDimension(opt, baseSize);
	},
	img: function (src, opt) {
		var img = new Img(src, opt, this.canvas);
		img.onload = this._onload.bind(this);
		this.imgs.push(img);
		return img;
	},
	_onload: function () {
		var loaded = true;
		for (var i = 0; i < this.imgs.length; i++) {
			if (!this.imgs[i].loaded) {
				loaded = false;
				break;
			}
		}

		if (loaded) {
			this.opt.onload();
			if (this.opt.startOnLoad) {
				this.startAnims();
			}
		}
	},
	startAnims: function () {
		for (var i = 0; i < this.anims.length; i++) {
			if (!this.anims[i].started) {
				this.anims[i].start();
			}
		}
	},
	detach: function (anim) {
		helpers.remove(this.anims, anim);
	},
	render: function () {
		var completed = true;

		if (this.opt.clearOnFrame) {
			this.canvas.clear();
		}
		for (var i = 0; i < this.anims.length; i++) {
			if (this.anims[i].started) {
				this.anims[i].render(this.canvas);
			}

			/**
			 * TODO: What if it has iteration?
			 */
			if (this.anims[i].progress !== 1) {
				completed = false;
			}
		}

		if (completed) {
			this.opt.onComplete.apply(this);
			if (this.opt.destroyOnComplete) {
				this.remove(this.opt.removeElOnComplete);
			}
		}
	},
	remove: function (removeEl) {
		frame.remove(this.frame);
		this.canvas.clear();
		this.canvas.remove(removeEl);
	}
};
},{"./core/Canvas.js":1,"./core/Timeline.js":2,"./core/frame.js":4,"./core/helpers.js":5,"./render/Anim.js":6,"./render/Img.js":8}]},{},[1,2,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpLFxuICAgIERpbWVuc2lvbiA9IHJlcXVpcmUoJy4vLi4vcmVuZGVyL0RpbWVuc2lvbi5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhcztcblxuZnVuY3Rpb24gQ2FudmFzIChlbCkge1xuICAgIHRoaXMuZWwgPSBlbDtcbiAgICB0aGlzLmN0eCA9IHRoaXMuZWwuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIG9uUmVzaXplIGV2ZW50XG4gICAgdGhpcy5fcmVzaXplSGFuZGxlciA9IHRoaXMuX29uUmVzaXplLmJpbmQodGhpcyk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgIHRoaXMuX29uUmVzaXplKCk7XG59XG5cbkNhbnZhcy5wcm90b3R5cGUgPSB7XG4gICAgZGltZW5zaW9uczogW10sXG4gICAgX29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3ID0gdGhpcy5lbC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGggPSB0aGlzLmVsLm9mZnNldEhlaWdodDtcblxuICAgICAgICBpZiAodyAhPT0gdGhpcy53aWR0aCB8fCBoICE9PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHc7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgICAgICAgICB0aGlzLmRpYWdvbmFsID0gTWF0aC5zcXJ0KCh3KncpICsgKGgqaCkpO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCk7XG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgYWxsIGRpbWVuc2lvblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnNbaV0udXBkYXRlKCk7XG4gICAgICAgICAgICB9ICAgICAgICAgXG5cbiAgICAgICAgICAgIHRoaXMucmVzaXplKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHJlc2l6ZTogZnVuY3Rpb24gKCkge30sXG4gICAgZ2V0RGltZW5zaW9uOiBmdW5jdGlvbiAob3B0LCBiYXNlU2l6ZSkge1xuICAgICAgICB2YXIgZGltZW4gPSBuZXcgRGltZW5zaW9uKG9wdCwgYmFzZVNpemUsIHRoaXMpO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMucHVzaChkaW1lbik7XG4gICAgICAgIHJldHVybiBkaW1lbjtcbiAgICB9LFxuICAgIGRldGFjaDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgY29sbGVjdGlvbjtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGltZW5zaW9uKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uID0gdGhpcy5kaW1lbnNpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVscGVycy5yZW1vdmUoY29sbGVjdGlvbiwgb2JqKTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIChyZW1vdmVFbCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICAgIGlmIChyZW1vdmVFbCkge1xuICAgICAgICAgICAgdGhpcy5lbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWwpO1xuICAgICAgICB9XG4gICAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzLmpzJyk7XG52YXIgZWFzaW5ncyA9IHJlcXVpcmUoJy4vZWFzaW5ncy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lO1xuXG5mdW5jdGlvbiBUaW1lbGluZSAob3B0aW9ucykge1xuXHR2YXIgb3B0ID0gdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdC8qKlxuXHQgKiB0b2RvOiByZXdyaXRlIHRoaXNcblx0ICovXG5cblx0Ly8gaW5pdGlhbGl6ZVxuXHR0aGlzLmVhc2luZyA9IGVhc2luZ3Nbb3B0LmVhc2luZ107XG5cdHRoaXMuc3RhcnQgPSBvcHQuc3RhcnQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LnN0YXJ0IDogbmV3IERhdGUoKTtcblx0aWYgKG9wdC5kZWxheSkge1xuXHRcdHRoaXMuc3RhcnQgPSBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSArIG9wdC5kZWxheSk7XG5cdH1cblx0aWYgKG9wdC5pdGVyYXRlICE9PSAnaW5maW5pdGUnKSB7XG5cdFx0dGhpcy5lbmQgPSBvcHQuZW5kIGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5lbmQgOiBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSArIChvcHQuZHVyYXRpb24qb3B0Lml0ZXJhdGUpKTtcblx0XHR0aGlzLmR1cmF0aW9uID0gKHRoaXMuZW5kLmdldFRpbWUoKSAtIHRoaXMuc3RhcnQpIC8gb3B0Lml0ZXJhdGU7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy5kdXJhdGlvbiA9IG9wdC5kdXJhdGlvbjtcblx0fVxufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGVhc2luZzogJ2xpbmVhcicsXG5cdHN0YXJ0OiBudWxsLFxuXHRlbmQ6IG51bGwsXG5cdGRlbGF5OiAwLCAvLyBtaWxsaXNlY29uZHNcblx0ZHVyYXRpb246IDEwMDAsIC8vIG1pbGxpc2Vjb25kc1xuXHRpdGVyYXRlOiAxIC8vIGludGVnZXIgb3IgJ2luZmluaXRlJ1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlID0ge1xuXHRiYWNrd2FyZDogZmFsc2UsXG5cdHBhdXNlZEF0OiBudWxsLFxuXHRnZXRQcm9ncmVzczogZnVuY3Rpb24gKG5vdykge1xuXHRcdHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50KG5vdyk7XG5cblx0XHRpZiAodGhpcy5iYWNrd2FyZCkge1xuXHRcdFx0Y3VycmVudCA9IDEgLSBjdXJyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBjdXJyZW50ID09PSAwIHx8IGN1cnJlbnQgPT09IDEgPyBjdXJyZW50IDogdGhpcy5lYXNpbmcoY3VycmVudCk7XG5cdH0sXG5cdGdldEN1cnJlbnQ6IGZ1bmN0aW9uIChub3cpIHtcblx0XHRub3cgPSBub3cgPyBub3cgOiBuZXcgRGF0ZSgpO1xuXG5cdFx0aWYgKHRoaXMucGF1c2VkQXQgIT09IG51bGwpIHtcblx0XHRcdHJldHVybiB0aGlzLnBhdXNlZEF0O1xuXHRcdH0gZWxzZSBpZiAobm93IDwgdGhpcy5zdGFydCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIGlmICh0aGlzLmVuZCAmJiBub3cgPiB0aGlzLmVuZCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAoIChub3cgLSB0aGlzLnN0YXJ0KSAvIHRoaXMuZHVyYXRpb24gKSAlIDE7XG5cdFx0fVxuXHR9LFxuXHRwYXVzZTogZnVuY3Rpb24gKG5vdykge1xuXHRcdHRoaXMucGF1c2VkQXQgPSB0aGlzLmdldEN1cnJlbnQobm93KTtcblx0fSxcblx0cmV2ZXJzZTogZnVuY3Rpb24gKG5vdykge1xuXHRcdHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50KG5vdyk7XG5cblx0XHR0aGlzLmVuZCA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyAoY3VycmVudCAqIHRoaXMuZHVyYXRpb24pKTtcblx0XHR0aGlzLnN0YXJ0ID0gbmV3IERhdGUodGhpcy5lbmQuZ2V0VGltZSgpIC0gdGhpcy5kdXJhdGlvbik7XG5cdFx0dGhpcy5iYWNrd2FyZCA9IHRoaXMuYmFja3dhcmQgPyBmYWxzZSA6IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcy5nZXRDdXJyZW50KG5vdyk7XG5cdH0sXG5cdHBsYXk6IGZ1bmN0aW9uIChub3cpIHtcblx0XHRpZiAodGhpcy5wYXVzZWRBdCkge1xuXHRcdFx0bm93ID0gbm93ID8gbm93IDogbmV3IERhdGUoKTtcblxuXHRcdFx0dGhpcy5lbmQgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgKCgxIC0gdGhpcy5wYXVzZWRBdCkgKiB0aGlzLmR1cmF0aW9uKSk7XG5cdFx0XHR0aGlzLnN0YXJ0ID0gbmV3IERhdGUodGhpcy5lbmQuZ2V0VGltZSgpIC0gdGhpcy5kdXJhdGlvbik7XG5cdFx0XHR0aGlzLnBhdXNlZEF0ID0gbnVsbDtcblx0XHR9XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuLypcbiAqIEVhc2luZyBGdW5jdGlvbnMgLSBpbnNwaXJlZCBmcm9tIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuICogb25seSBjb25zaWRlcmluZyB0aGUgdCB2YWx1ZSBmb3IgdGhlIHJhbmdlIFswLCAxXSA9PiBbMCwgMV1cbiAqIHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqKDItdCk7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuICgtLXQpKnQqdCsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gNCp0KnQqdCA6ICh0LTEpKigyKnQtMikqKDIqdC0yKSsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDgqdCp0KnQqdCA6IDEtOCooLS10KSp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uIFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQ7IH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bGlzdGVuZXJzOiBbXSxcblx0c3RhdHVzOiAwLFxuXHRfZnJhbWU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5zdGF0dXMpIHtcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9mcmFtZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBTdGFydCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RhcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDE7XG5cblx0XHRpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdFx0dGhpcy5fZnJhbWUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faW50dmwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5fZnJhbWUuYmluZCh0aGlzKSwgMTYpOyAvLyA2MGZwc1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU3RvcCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMDtcblxuXHRcdGlmICh0aGlzLl9pbnR2bCkge1xuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5faW50dmwpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRyaWdnZXIgYWxsIGxpc3RlbmVyc1xuXHQgKi9cblx0ZXhlY3V0ZTogZnVuY3Rpb24gKCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGlzdGVuZXJzW2ldKCk7XG5cdFx0fVxuXHR9LFxuXHRhZGQ6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnN0YXJ0KCk7XG5cdFx0fVxuXHRcdHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMubGlzdGVuZXJzLCBsaXN0ZW5lcik7XG5cblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdG9wKCk7XG5cdFx0fVxuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBmb3IodmFyIGk9MTsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspXG5cdCAgICAgICAgZm9yKHZhciBrZXkgaW4gYXJndW1lbnRzW2ldKVxuXHQgICAgICAgICAgICBpZihhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcblx0ICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG5cdCAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuXHR9LFxuXHRleHRyYWN0OiBmdW5jdGlvbiAob2JqLCBwcm9wZXJ0aWVzKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKG9ialtwcm9wZXJ0aWVzW2ldXSkge1xuXHRcdFx0XHRyZXN1bHRbcHJvcGVydGllc1tpXV0gPSBvYmpbcHJvcGVydGllc1tpXV07XHRcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoYXJyYXksIGVsKSB7XG5cdFx0cmV0dXJuIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKGVsKSwgMSk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuLy4uL2NvcmUvVGltZWxpbmUuanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbTtcblxuLyoqXG4gKiBUT0RPOiBtdWx0aXBsZSB0aW1lbGluZXNcbiAqL1xuZnVuY3Rpb24gQW5pbSAob3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXHRpZiAodGhpcy5vcHQuc3RhcnQpIHtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH1cbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXHRmaWxsTW9kZTogJ2JvdGgnLFxuXHR0aW1lOiB7fSxcblx0c3RhcnQ6IHRydWUsXG5cdGRyYXc6IGZ1bmN0aW9uICgpIHt9XG59O1xuXG5BbmltLnByb3RvdHlwZSA9IHtcblx0c3RhcnRlZDogZmFsc2UsXG5cdHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy50aW1lID0gbmV3IFRpbWVsaW5lKHRoaXMub3B0LnRpbWUpO1xuXHRcdHRoaXMuZHJhdyA9IHRoaXMub3B0LmRyYXc7XG5cdFx0dGhpcy5zdGFydGVkID0gdHJ1ZTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoY2FudmFzKSB7XG5cdFx0dGhpcy5wcm9ncmVzcyA9IHRoaXMudGltZS5nZXRQcm9ncmVzcygpO1xuXG5cdFx0aWYgKHRoaXMuaXNGaWxsKHRoaXMucHJvZ3Jlc3MpKSB7XG5cdFx0XHR0aGlzLmRyYXcoY2FudmFzLCB0aGlzLnByb2dyZXNzLCB0aGlzLm9wdCk7XG5cdFx0fVxuXHR9LFxuXHRpc0ZpbGw6IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuXHRcdHZhciBmaWxsTW9kZSA9IHRoaXMub3B0LmZpbGxNb2RlO1xuXG5cdFx0aWYgKGZpbGxNb2RlID09PSAnbm9uZScgJiYgKHByb2dyZXNzID09PSAwIHx8IHByb2dyZXNzID09PSAxKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdmb3J3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdiYWNrd2FyZCcgJiYgcHJvZ3Jlc3MgPT09IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX3plb3Ryb3BlKSB7XG5cdFx0XHR0aGlzLl96ZW90cm9wZS5kZXRhY2godGhpcyk7XG5cdFx0fVxuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpbWVuc2lvbjtcblxuZnVuY3Rpb24gRGltZW5zaW9uIChvcHQsIGJhc2VTaXplLCBwYXJlbnQpIHtcbiAgICB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcbiAgICB0aGlzLmJhc2VTaXplID0gYmFzZVNpemU7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB9XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICAgIHBvc2l0aW9uOiBudWxsLFxuICAgIHNpemU6IG51bGwsXG4gICAgb3JpZ2luOiAwXG59O1xuXG4vLyBjb25zdCBtZXRob2RzXG5oZWxwZXJzLmV4dGVuZChEaW1lbnNpb24sIHtcbiAgICBwYXJzZVByb3BTdHI6IHBhcnNlUHJvcFN0cixcbiAgICBwZXJjZW50VG9QeDogcGVyY2VudFRvUHgsXG4gICAgY2VudGVyQXQ6IGNlbnRlckF0LFxuICAgIGZpbGxXaXRoQXNwZWN0UmF0aW86IGZpbGxXaXRoQXNwZWN0UmF0aW8sXG4gICAgZnVsbFNjYWxlOiBmdWxsU2NhbGVcbn0pO1xuXG5cbkRpbWVuc2lvbi5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdC5zaXplKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IHNpemUuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgcG9zID0gdGhpcy5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy54ID0gcG9zLng7XG4gICAgICAgICAgICB0aGlzLnkgPSBwb3MueTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2l6ZTtcblxuICAgICAgICBpZiAodGhpcy5vcHQuc2l6ZSA9PT0gJ2F1dG8nIHx8IHRoaXMub3B0LnNpemUgPT09ICdhdXRvIGF1dG8nKSB7XG4gICAgICAgICAgICBzaXplID0gaGVscGVycy5leHRyYWN0KHRoaXMuYmFzZVNpemUsIFsnd2lkdGgnLCAnaGVpZ2h0J10pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0LnNpemUgPT09ICdjb3ZlcicgfHwgdGhpcy5vcHQuc2l6ZSA9PT0gJ2NvbnRhaW4nKSB7XG4gICAgICAgICAgICBzaXplID0gZnVsbFNjYWxlKHRoaXMub3B0LnNpemUsIHRoaXMuYmFzZVNpemUsIHRoaXMucGFyZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBzY2FsZSA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5zaXplKTtcbiAgICAgICAgICAgIHNpemUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUb1B4KHNjYWxlWzBdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LndpZHRoIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHBlcmNlbnRUb1B4KHNjYWxlWzFdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmhlaWdodCA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmJhc2VTaXplKSB7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IGZpbGxXaXRoQXNwZWN0UmF0aW8odGhpcy5iYXNlU2l6ZSwgc2l6ZSk7ICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gb25seSBvdXRwdXQgbnVtYmVyXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogTnVtYmVyKHNpemUud2lkdGgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBOdW1iZXIoc2l6ZS5oZWlnaHQpXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcG9zID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0LnBvc2l0aW9uKSxcbiAgICAgICAgICAgIHB0ID0ge1xuICAgICAgICAgICAgICAgIHg6IHBlcmNlbnRUb1B4KHBvc1swXSwgdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC53aWR0aCA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgeTogcGVyY2VudFRvUHgocG9zWzFdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmhlaWdodCA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gYWRqdXN0IGZvciBvcmlnaW5cbiAgICAgICAgaWYgKHRoaXMub3B0Lm9yaWdpbikge1xuICAgICAgICAgICAgdmFyIG9yaWdpbiA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5vcmlnaW4pO1xuICAgICAgICAgICAgcHQgPSBjZW50ZXJBdChwdCwge3g6IG9yaWdpblswXSwgeTogb3JpZ2luWzFdfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogTnVtYmVyKHB0LngpLFxuICAgICAgICAgICAgeTogTnVtYmVyKHB0LnkpXG4gICAgICAgIH07XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kZXRhY2godGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBwYXJzZVByb3BTdHIgKHN0cikge1xuICAgIHN0ciA9IHN0ci50b1N0cmluZygpO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKCdjZW50ZXInLCAnNTAlJyk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL3RvcHxsZWZ0L2csICcwJyk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL2JvdHRvbXxyaWdodC9nLCAnMTAwJScpO1xuICAgIHZhciB2YWwgPSBzdHIuc3BsaXQoJyAnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIHZhbFswXSxcbiAgICAgICAgdmFsLmxlbmd0aCA9PT0gMSA/IHZhbFswXSA6IHZhbFsxXSAvLyByZXBlYXQgdmFsdWUgZm9yIGhlaWdodCBpZiBvbmx5IHdpZHRoIGlzIHByb3ZpZGVkXG4gICAgXTtcbn1cblxuZnVuY3Rpb24gcGVyY2VudFRvUHggKHBlcmNlbnQsIHBhcmVudFB4KSB7XG4gICAgcmV0dXJuIHBlcmNlbnQuaW5kZXhPZignJScpID09PSAtMSA/IHBlcmNlbnQgOiBwZXJjZW50LnNsaWNlKDAsIC0xKSAvIDEwMCAqIHBhcmVudFB4O1xufVxuXG5mdW5jdGlvbiBjZW50ZXJBdCAocHQsIG9yaWdpbiwgZGltZW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBwdC54IC0gKGRpbWVuID8gcGVyY2VudFRvUHgob3JpZ2luLngsIGRpbWVuLndpZHRoKSA6IG9yaWdpbi54KSxcbiAgICAgICAgeTogcHQueSAtIChkaW1lbiA/IHBlcmNlbnRUb1B4KG9yaWdpbi55LCBkaW1lbi5oZWlnaHQpIDogb3JpZ2luLnkpXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZmlsbFdpdGhBc3BlY3RSYXRpbyAob3JpZ2luYWwsIHNpemUpIHtcbiAgICB2YXIgYXIgPSBvcmlnaW5hbC5oZWlnaHQgLyBvcmlnaW5hbC53aWR0aDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoID09PSAnYXV0bycgfHwgIXNpemUud2lkdGggPyBzaXplLmhlaWdodCAvIGFyIDogc2l6ZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCA9PT0gJ2F1dG8nIHx8ICFzaXplLmhlaWdodCA/IHNpemUud2lkdGggKiBhciA6IHNpemUuaGVpZ2h0XG4gICAgfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYmFja2dyb3VuZCBpbWFnZSBzaXplIGZvciAnY29udGFpbicgYW5kICdjb3ZlcidcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSAgICBjb250YWluJyBvciAnY292ZXInXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNoaWxkXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmVudCBcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuZnVuY3Rpb24gZnVsbFNjYWxlICh0eXBlLCBjaGlsZCwgcGFyZW50KSB7XG4gICAgdmFyIGNoaWxkQVIgPSBjaGlsZC5oZWlnaHQgLyBjaGlsZC53aWR0aCxcbiAgICAgICAgcGFyZW50QVIgPSBwYXJlbnQuaGVpZ2h0IC8gcGFyZW50LndpZHRoLFxuICAgICAgICBzYW1lSGVpZ2h0ID0gdHlwZSA9PT0gJ2NvdmVyJyA/IHBhcmVudEFSID4gY2hpbGRBUiA6IHBhcmVudEFSIDwgY2hpbGRBUjtcblxuICAgIGlmIChzYW1lSGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogcGFyZW50LmhlaWdodCAvIGNoaWxkQVIsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogcGFyZW50LndpZHRoICogY2hpbGRBUlxuICAgICAgICB9O1xuICAgIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWc7XG5cbmZ1bmN0aW9uIEltZyAoc3JjLCBvcHQsIGNhbnZhcykge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXG4gICAgLy8gcHJlbG9hZFxuICAgIHRoaXMuZWwgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmVsLm9ubG9hZCA9IHRoaXMuX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWwuc3JjID0gc3JjO1xuXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBzaXplOiAnY292ZXInLFxuICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICBvcmlnaW46ICc1MCUgNTAlJ1xufTtcblxuSW1nLnByb3RvdHlwZSA9IHtcbiAgICBkcmF3OiBmdW5jdGlvbiAoZGltZW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRpID0gdGhpcy5kaW1lbnNpb247XG4gICAgICAgIGlmIChkaW1lbikge1xuICAgICAgICAgICAgZGkgPSBoZWxwZXJzLmV4dGVuZCh7fSwgdGhpcy5kaW1lbnNpb24sIGRpbWVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmN0eC5kcmF3SW1hZ2UodGhpcy5lbCwgZGkueCwgZGkueSwgZGkud2lkdGgsIGRpLmhlaWdodCk7XG4gICAgfSxcbiAgICBfb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kaW1lbnNpb24gPSB0aGlzLmNhbnZhcy5nZXREaW1lbnNpb24odGhpcy5vcHQsIHRoaXMuZWwpO1xuICAgICAgICB0aGlzLm9ubG9hZCgpO1xuICAgIH0sXG4gICAgb25sb2FkOiBmdW5jdGlvbiAoKSB7fVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW52YXMgPSByZXF1aXJlKCcuL2NvcmUvQ2FudmFzLmpzJyksXG5cdGZyYW1lID0gcmVxdWlyZSgnLi9jb3JlL2ZyYW1lLmpzJyksXG5cdEFuaW0gPSByZXF1aXJlKCcuL3JlbmRlci9BbmltLmpzJyksXG5cdGhlbHBlcnMgPSByZXF1aXJlKCcuL2NvcmUvaGVscGVycy5qcycpLFxuXHRJbWcgPSByZXF1aXJlKCcuL3JlbmRlci9JbWcuanMnKSxcblx0VGltZWxpbmUgPSByZXF1aXJlKCcuL2NvcmUvVGltZWxpbmUuanMnKTtcblxud2luZG93Llplb3Ryb3BlID0gWmVvdHJvcGU7XG5cbmZ1bmN0aW9uIFplb3Ryb3BlIChlbCwgb3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXG5cdHRoaXMuY2FudmFzID0gbmV3IENhbnZhcyhlbCk7XG5cdHRoaXMuZnJhbWUgPSBmcmFtZS5hZGQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG5cblx0Ly8gY29sbGVjdGlvbnNcblx0dGhpcy5hbmltcyA9IFtdO1xuXHR0aGlzLmltZ3MgPSBbXTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXHRvbkNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7fSxcblx0ZGVzdHJveU9uQ29tcGxldGU6IHRydWUsXG5cdHJlbW92ZUVsT25Db21wbGV0ZTogdHJ1ZSxcblx0b25sb2FkOiBmdW5jdGlvbiAoKSB7fSxcblx0c3RhcnRPbkxvYWQ6IHRydWUsXG5cdGNsZWFyT25GcmFtZTogdHJ1ZVxufTtcblxuWmVvdHJvcGUucHJvdG90eXBlID0ge1xuXHRhbmltOiBmdW5jdGlvbiAob3B0KSB7XG5cdFx0aWYgKHRoaXMub3B0LnN0YXJ0T25Mb2FkICYmIHRoaXMuaW1ncy5sZW5ndGgpIHtcblx0XHRcdG9wdC5zdGFydCA9IHR5cGVvZiBvcHQuc3RhcnQgPT09ICdib29sZWFuJyA/IG9wdC5zdGFydCA6IGZhbHNlO1xuXHRcdH1cblxuXHRcdHZhciBhbmltID0gbmV3IEFuaW0ob3B0KTtcblx0XHRhbmltLl96ZW90cm9wZSA9IHRoaXM7XG5cdFx0dGhpcy5hbmltcy5wdXNoKGFuaW0pO1xuXHRcdHJldHVybiBhbmltO1xuXHR9LFxuXHR0aW1lOiBmdW5jdGlvbiAob3B0KSB7XG5cdFx0cmV0dXJuIG5ldyBUaW1lbGluZShvcHQpO1xuXHR9LFxuXHRkaW1lbnNpb246IGZ1bmN0aW9uIChvcHQsIGJhc2VTaXplKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2FudmFzLmdldERpbWVuc2lvbihvcHQsIGJhc2VTaXplKTtcblx0fSxcblx0aW1nOiBmdW5jdGlvbiAoc3JjLCBvcHQpIHtcblx0XHR2YXIgaW1nID0gbmV3IEltZyhzcmMsIG9wdCwgdGhpcy5jYW52YXMpO1xuXHRcdGltZy5vbmxvYWQgPSB0aGlzLl9vbmxvYWQuYmluZCh0aGlzKTtcblx0XHR0aGlzLmltZ3MucHVzaChpbWcpO1xuXHRcdHJldHVybiBpbWc7XG5cdH0sXG5cdF9vbmxvYWQ6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgbG9hZGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW1ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKCF0aGlzLmltZ3NbaV0ubG9hZGVkKSB7XG5cdFx0XHRcdGxvYWRlZCA9IGZhbHNlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobG9hZGVkKSB7XG5cdFx0XHR0aGlzLm9wdC5vbmxvYWQoKTtcblx0XHRcdGlmICh0aGlzLm9wdC5zdGFydE9uTG9hZCkge1xuXHRcdFx0XHR0aGlzLnN0YXJ0QW5pbXMoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHN0YXJ0QW5pbXM6IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYW5pbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICghdGhpcy5hbmltc1tpXS5zdGFydGVkKSB7XG5cdFx0XHRcdHRoaXMuYW5pbXNbaV0uc3RhcnQoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGRldGFjaDogZnVuY3Rpb24gKGFuaW0pIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmFuaW1zLCBhbmltKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGNvbXBsZXRlZCA9IHRydWU7XG5cblx0XHRpZiAodGhpcy5vcHQuY2xlYXJPbkZyYW1lKSB7XG5cdFx0XHR0aGlzLmNhbnZhcy5jbGVhcigpO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYW5pbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICh0aGlzLmFuaW1zW2ldLnN0YXJ0ZWQpIHtcblx0XHRcdFx0dGhpcy5hbmltc1tpXS5yZW5kZXIodGhpcy5jYW52YXMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRPRE86IFdoYXQgaWYgaXQgaGFzIGl0ZXJhdGlvbj9cblx0XHRcdCAqL1xuXHRcdFx0aWYgKHRoaXMuYW5pbXNbaV0ucHJvZ3Jlc3MgIT09IDEpIHtcblx0XHRcdFx0Y29tcGxldGVkID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNvbXBsZXRlZCkge1xuXHRcdFx0dGhpcy5vcHQub25Db21wbGV0ZS5hcHBseSh0aGlzKTtcblx0XHRcdGlmICh0aGlzLm9wdC5kZXN0cm95T25Db21wbGV0ZSkge1xuXHRcdFx0XHR0aGlzLnJlbW92ZSh0aGlzLm9wdC5yZW1vdmVFbE9uQ29tcGxldGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAocmVtb3ZlRWwpIHtcblx0XHRmcmFtZS5yZW1vdmUodGhpcy5mcmFtZSk7XG5cdFx0dGhpcy5jYW52YXMuY2xlYXIoKTtcblx0XHR0aGlzLmNhbnZhcy5yZW1vdmUocmVtb3ZlRWwpO1xuXHR9XG59OyJdfQ==
