/*!
 * zeotrope.js 1.0.0 <>
 * Contributor(s): Kai Lam <kai.chun.lam@gmail.com>
 * Last Build: 2015-10-16
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
	Img = require('./render/Img.js');

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
},{"./core/Canvas.js":1,"./core/frame.js":4,"./core/helpers.js":5,"./render/Anim.js":6,"./render/Img.js":8}]},{},[1,2,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKSxcbiAgICBEaW1lbnNpb24gPSByZXF1aXJlKCcuLy4uL3JlbmRlci9EaW1lbnNpb24uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG5cbmZ1bmN0aW9uIENhbnZhcyAoZWwpIHtcbiAgICB0aGlzLmVsID0gZWw7XG4gICAgdGhpcy5jdHggPSB0aGlzLmVsLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBvblJlc2l6ZSBldmVudFxuICAgIHRoaXMuX3Jlc2l6ZUhhbmRsZXIgPSB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xufVxuXG5DYW52YXMucHJvdG90eXBlID0ge1xuICAgIGRpbWVuc2lvbnM6IFtdLFxuICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdyA9IHRoaXMuZWwub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHcgIT09IHRoaXMud2lkdGggfHwgaCAhPT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgICAgICAgICAgdGhpcy5kaWFnb25hbCA9IE1hdGguc3FydCgodyp3KSArIChoKmgpKTtcbiAgICAgICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIGFsbCBkaW1lbnNpb25cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaW1lbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zW2ldLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfSAgICAgICAgIFxuXG4gICAgICAgICAgICB0aGlzLnJlc2l6ZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZXNpemU6IGZ1bmN0aW9uICgpIHt9LFxuICAgIGdldERpbWVuc2lvbjogZnVuY3Rpb24gKG9wdCwgYmFzZVNpemUpIHtcbiAgICAgICAgdmFyIGRpbWVuID0gbmV3IERpbWVuc2lvbihvcHQsIGJhc2VTaXplLCB0aGlzKTtcbiAgICAgICAgdGhpcy5kaW1lbnNpb25zLnB1c2goZGltZW4pO1xuICAgICAgICByZXR1cm4gZGltZW47XG4gICAgfSxcbiAgICBkZXRhY2g6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb247XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERpbWVuc2lvbikge1xuICAgICAgICAgICAgY29sbGVjdGlvbiA9IHRoaXMuZGltZW5zaW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGhlbHBlcnMucmVtb3ZlKGNvbGxlY3Rpb24sIG9iaik7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAocmVtb3ZlRWwpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgICAgICBpZiAocmVtb3ZlRWwpIHtcbiAgICAgICAgICAgIHRoaXMuZWwucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcbiAgICAgICAgfVxuICAgIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycy5qcycpO1xudmFyIGVhc2luZ3MgPSByZXF1aXJlKCcuL2Vhc2luZ3MuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lbGluZTtcblxuZnVuY3Rpb24gVGltZWxpbmUgKG9wdGlvbnMpIHtcblx0dmFyIG9wdCA9IHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHQvKipcblx0ICogdG9kbzogcmV3cml0ZSB0aGlzXG5cdCAqL1xuXG5cdC8vIGluaXRpYWxpemVcblx0dGhpcy5lYXNpbmcgPSBlYXNpbmdzW29wdC5lYXNpbmddO1xuXHR0aGlzLnN0YXJ0ID0gb3B0LnN0YXJ0IGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5zdGFydCA6IG5ldyBEYXRlKCk7XG5cdGlmIChvcHQuZGVsYXkpIHtcblx0XHR0aGlzLnN0YXJ0ID0gbmV3IERhdGUodGhpcy5zdGFydC5nZXRUaW1lKCkgKyBvcHQuZGVsYXkpO1xuXHR9XG5cdGlmIChvcHQuaXRlcmF0ZSAhPT0gJ2luZmluaXRlJykge1xuXHRcdHRoaXMuZW5kID0gb3B0LmVuZCBpbnN0YW5jZW9mIERhdGUgPyBvcHQuZW5kIDogbmV3IERhdGUodGhpcy5zdGFydC5nZXRUaW1lKCkgKyAob3B0LmR1cmF0aW9uKm9wdC5pdGVyYXRlKSk7XG5cdFx0dGhpcy5kdXJhdGlvbiA9ICh0aGlzLmVuZC5nZXRUaW1lKCkgLSB0aGlzLnN0YXJ0KSAvIG9wdC5pdGVyYXRlO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMuZHVyYXRpb24gPSBvcHQuZHVyYXRpb247XG5cdH1cbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXHRlYXNpbmc6ICdsaW5lYXInLFxuXHRzdGFydDogbnVsbCxcblx0ZW5kOiBudWxsLFxuXHRkZWxheTogMCwgLy8gbWlsbGlzZWNvbmRzXG5cdGR1cmF0aW9uOiAxMDAwLCAvLyBtaWxsaXNlY29uZHNcblx0aXRlcmF0ZTogMSAvLyBpbnRlZ2VyIG9yICdpbmZpbml0ZSdcbn07XG5cblRpbWVsaW5lLnByb3RvdHlwZSA9IHtcblx0YmFja3dhcmQ6IGZhbHNlLFxuXHRwYXVzZWRBdDogbnVsbCxcblx0Z2V0UHJvZ3Jlc3M6IGZ1bmN0aW9uIChub3cpIHtcblx0XHR2YXIgY3VycmVudCA9IHRoaXMuZ2V0Q3VycmVudChub3cpO1xuXG5cdFx0aWYgKHRoaXMuYmFja3dhcmQpIHtcblx0XHRcdGN1cnJlbnQgPSAxIC0gY3VycmVudDtcblx0XHR9XG5cblx0XHRyZXR1cm4gY3VycmVudCA9PT0gMCB8fCBjdXJyZW50ID09PSAxID8gY3VycmVudCA6IHRoaXMuZWFzaW5nKGN1cnJlbnQpO1xuXHR9LFxuXHRnZXRDdXJyZW50OiBmdW5jdGlvbiAobm93KSB7XG5cdFx0bm93ID0gbm93ID8gbm93IDogbmV3IERhdGUoKTtcblxuXHRcdGlmICh0aGlzLnBhdXNlZEF0ICE9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wYXVzZWRBdDtcblx0XHR9IGVsc2UgaWYgKG5vdyA8IHRoaXMuc3RhcnQpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5lbmQgJiYgbm93ID4gdGhpcy5lbmQpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gKCAobm93IC0gdGhpcy5zdGFydCkgLyB0aGlzLmR1cmF0aW9uICkgJSAxO1xuXHRcdH1cblx0fSxcblx0cGF1c2U6IGZ1bmN0aW9uIChub3cpIHtcblx0XHR0aGlzLnBhdXNlZEF0ID0gdGhpcy5nZXRDdXJyZW50KG5vdyk7XG5cdH0sXG5cdHJldmVyc2U6IGZ1bmN0aW9uIChub3cpIHtcblx0XHR2YXIgY3VycmVudCA9IHRoaXMuZ2V0Q3VycmVudChub3cpO1xuXG5cdFx0dGhpcy5lbmQgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgKGN1cnJlbnQgKiB0aGlzLmR1cmF0aW9uKSk7XG5cdFx0dGhpcy5zdGFydCA9IG5ldyBEYXRlKHRoaXMuZW5kLmdldFRpbWUoKSAtIHRoaXMuZHVyYXRpb24pO1xuXHRcdHRoaXMuYmFja3dhcmQgPSB0aGlzLmJhY2t3YXJkID8gZmFsc2UgOiB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0Q3VycmVudChub3cpO1xuXHR9LFxuXHRwbGF5OiBmdW5jdGlvbiAobm93KSB7XG5cdFx0aWYgKHRoaXMucGF1c2VkQXQpIHtcblx0XHRcdG5vdyA9IG5vdyA/IG5vdyA6IG5ldyBEYXRlKCk7XG5cblx0XHRcdHRoaXMuZW5kID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArICgoMSAtIHRoaXMucGF1c2VkQXQpICogdGhpcy5kdXJhdGlvbikpO1xuXHRcdFx0dGhpcy5zdGFydCA9IG5ldyBEYXRlKHRoaXMuZW5kLmdldFRpbWUoKSAtIHRoaXMuZHVyYXRpb24pO1xuXHRcdFx0dGhpcy5wYXVzZWRBdCA9IG51bGw7XG5cdFx0fVxuXHR9XG59OyIsIid1c2Ugc3RyaWN0Jztcbi8qXG4gKiBFYXNpbmcgRnVuY3Rpb25zIC0gaW5zcGlyZWQgZnJvbSBodHRwOi8vZ2l6bWEuY29tL2Vhc2luZy9cbiAqIG9ubHkgY29uc2lkZXJpbmcgdGhlIHQgdmFsdWUgZm9yIHRoZSByYW5nZSBbMCwgMV0gPT4gWzAsIDFdXG4gKiBzZWUgaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vZ3JlLzE2NTAyOTRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gbm8gZWFzaW5nLCBubyBhY2NlbGVyYXRpb25cbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KigyLXQpOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDIqdCp0IDogLTErKDQtMip0KSp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAoLS10KSp0KnQrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb24gXG4gICAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDQqdCp0KnQgOiAodC0xKSooMip0LTIpKigyKnQtMikrMTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxLSgtLXQpKnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvblxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyA4KnQqdCp0KnQgOiAxLTgqKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMSsoLS10KSp0KnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMTYqdCp0KnQqdCp0IDogMSsxNiooLS10KSp0KnQqdCp0OyB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGxpc3RlbmVyczogW10sXG5cdHN0YXR1czogMCxcblx0X2ZyYW1lOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuc3RhdHVzKSB7XG5cdFx0XHR0aGlzLmV4ZWN1dGUoKTtcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fZnJhbWUuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogU3RhcnQgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSAxO1xuXG5cdFx0aWYgKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcblx0XHRcdHRoaXMuX2ZyYW1lKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2ludHZsID0gd2luZG93LnNldEludGVydmFsKHRoaXMuX2ZyYW1lLmJpbmQodGhpcyksIDE2KTsgLy8gNjBmcHNcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFN0b3AgYW5pbWF0aW9uIGxvb3Bcblx0ICovXG5cdHN0b3A6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDA7XG5cblx0XHRpZiAodGhpcy5faW50dmwpIHtcblx0XHRcdHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuX2ludHZsKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGFsbCBsaXN0ZW5lcnNcblx0ICovXG5cdGV4ZWN1dGU6IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmxpc3RlbmVyc1tpXSgpO1xuXHRcdH1cblx0fSxcblx0YWRkOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdGFydCgpO1xuXHRcdH1cblx0XHR0aGlzLmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuXHRcdHJldHVybiBsaXN0ZW5lcjtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAobGlzdGVuZXIpIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmxpc3RlbmVycywgbGlzdGVuZXIpO1xuXG5cdFx0aWYgKCF0aGlzLmxpc3RlbmVycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuc3RvcCgpO1xuXHRcdH1cblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGV4dGVuZDogZnVuY3Rpb24gKCkge1xuXHQgICAgZm9yKHZhciBpPTE7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKVxuXHQgICAgICAgIGZvcih2YXIga2V5IGluIGFyZ3VtZW50c1tpXSlcblx0ICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmhhc093blByb3BlcnR5KGtleSkpXG5cdCAgICAgICAgICAgICAgICBhcmd1bWVudHNbMF1ba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuXHQgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcblx0fSxcblx0ZXh0cmFjdDogZnVuY3Rpb24gKG9iaiwgcHJvcGVydGllcykge1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChvYmpbcHJvcGVydGllc1tpXV0pIHtcblx0XHRcdFx0cmVzdWx0W3Byb3BlcnRpZXNbaV1dID0gb2JqW3Byb3BlcnRpZXNbaV1dO1x0XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKGFycmF5LCBlbCkge1xuXHRcdHJldHVybiBhcnJheS5zcGxpY2UoYXJyYXkuaW5kZXhPZihlbCksIDEpO1xuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFRpbWVsaW5lID0gcmVxdWlyZSgnLi8uLi9jb3JlL1RpbWVsaW5lLmpzJyksXG5cdGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFuaW07XG5cbi8qKlxuICogVE9ETzogbXVsdGlwbGUgdGltZWxpbmVzXG4gKi9cbmZ1bmN0aW9uIEFuaW0gKG9wdCkge1xuXHR0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcblx0aWYgKHRoaXMub3B0LnN0YXJ0KSB7XG5cdFx0dGhpcy5zdGFydCgpO1xuXHR9XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0ZmlsbE1vZGU6ICdib3RoJyxcblx0dGltZToge30sXG5cdHN0YXJ0OiB0cnVlLFxuXHRkcmF3OiBmdW5jdGlvbiAoKSB7fVxufTtcblxuQW5pbS5wcm90b3R5cGUgPSB7XG5cdHN0YXJ0ZWQ6IGZhbHNlLFxuXHRzdGFydDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMudGltZSA9IG5ldyBUaW1lbGluZSh0aGlzLm9wdC50aW1lKTtcblx0XHR0aGlzLmRyYXcgPSB0aGlzLm9wdC5kcmF3O1xuXHRcdHRoaXMuc3RhcnRlZCA9IHRydWU7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKGNhbnZhcykge1xuXHRcdHRoaXMucHJvZ3Jlc3MgPSB0aGlzLnRpbWUuZ2V0UHJvZ3Jlc3MoKTtcblxuXHRcdGlmICh0aGlzLmlzRmlsbCh0aGlzLnByb2dyZXNzKSkge1xuXHRcdFx0dGhpcy5kcmF3KGNhbnZhcywgdGhpcy5wcm9ncmVzcywgdGhpcy5vcHQpO1xuXHRcdH1cblx0fSxcblx0aXNGaWxsOiBmdW5jdGlvbiAocHJvZ3Jlc3MpIHtcblx0XHR2YXIgZmlsbE1vZGUgPSB0aGlzLm9wdC5maWxsTW9kZTtcblxuXHRcdGlmIChmaWxsTW9kZSA9PT0gJ25vbmUnICYmIChwcm9ncmVzcyA9PT0gMCB8fCBwcm9ncmVzcyA9PT0gMSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKGZpbGxNb2RlID09PSAnZm9yd2FyZCcgJiYgcHJvZ3Jlc3MgPT09IDApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKGZpbGxNb2RlID09PSAnYmFja3dhcmQnICYmIHByb2dyZXNzID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdGRldGFjaDogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLl96ZW90cm9wZSkge1xuXHRcdFx0dGhpcy5femVvdHJvcGUuZGV0YWNoKHRoaXMpO1xuXHRcdH1cblx0fVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaW1lbnNpb247XG5cbmZ1bmN0aW9uIERpbWVuc2lvbiAob3B0LCBiYXNlU2l6ZSwgcGFyZW50KSB7XG4gICAgdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG4gICAgdGhpcy5iYXNlU2l6ZSA9IGJhc2VTaXplO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlKCk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBwb3NpdGlvbjogbnVsbCxcbiAgICBzaXplOiBudWxsLFxuICAgIG9yaWdpbjogMFxufTtcblxuLy8gY29uc3QgbWV0aG9kc1xuaGVscGVycy5leHRlbmQoRGltZW5zaW9uLCB7XG4gICAgcGFyc2VQcm9wU3RyOiBwYXJzZVByb3BTdHIsXG4gICAgcGVyY2VudFRvUHg6IHBlcmNlbnRUb1B4LFxuICAgIGNlbnRlckF0OiBjZW50ZXJBdCxcbiAgICBmaWxsV2l0aEFzcGVjdFJhdGlvOiBmaWxsV2l0aEFzcGVjdFJhdGlvLFxuICAgIGZ1bGxTY2FsZTogZnVsbFNjYWxlXG59KTtcblxuXG5EaW1lbnNpb24ucHJvdG90eXBlID0ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5vcHQuc2l6ZSkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSB0aGlzLmdldFNpemUoKTtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBzaXplLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBzaXplLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdC5wb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMueCA9IHBvcy54O1xuICAgICAgICAgICAgdGhpcy55ID0gcG9zLnk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNpemU7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0LnNpemUgPT09ICdhdXRvJyB8fCB0aGlzLm9wdC5zaXplID09PSAnYXV0byBhdXRvJykge1xuICAgICAgICAgICAgc2l6ZSA9IGhlbHBlcnMuZXh0cmFjdCh0aGlzLmJhc2VTaXplLCBbJ3dpZHRoJywgJ2hlaWdodCddKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdC5zaXplID09PSAnY292ZXInIHx8IHRoaXMub3B0LnNpemUgPT09ICdjb250YWluJykge1xuICAgICAgICAgICAgc2l6ZSA9IGZ1bGxTY2FsZSh0aGlzLm9wdC5zaXplLCB0aGlzLmJhc2VTaXplLCB0aGlzLnBhcmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgc2NhbGUgPSBwYXJzZVByb3BTdHIodGhpcy5vcHQuc2l6ZSk7XG4gICAgICAgICAgICBzaXplID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBwZXJjZW50VG9QeChzY2FsZVswXSwgdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC53aWR0aCA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBwZXJjZW50VG9QeChzY2FsZVsxXSwgdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5oZWlnaHQgOiB1bmRlZmluZWQpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5iYXNlU2l6ZSkge1xuICAgICAgICAgICAgICAgIHNpemUgPSBmaWxsV2l0aEFzcGVjdFJhdGlvKHRoaXMuYmFzZVNpemUsIHNpemUpOyAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9ubHkgb3V0cHV0IG51bWJlclxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IE51bWJlcihzaXplLndpZHRoKSxcbiAgICAgICAgICAgIGhlaWdodDogTnVtYmVyKHNpemUuaGVpZ2h0KVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgZ2V0UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHBvcyA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5wb3NpdGlvbiksXG4gICAgICAgICAgICBwdCA9IHtcbiAgICAgICAgICAgICAgICB4OiBwZXJjZW50VG9QeChwb3NbMF0sIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQud2lkdGggOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgIHk6IHBlcmNlbnRUb1B4KHBvc1sxXSwgdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC5oZWlnaHQgOiB1bmRlZmluZWQpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIGFkanVzdCBmb3Igb3JpZ2luXG4gICAgICAgIGlmICh0aGlzLm9wdC5vcmlnaW4pIHtcbiAgICAgICAgICAgIHZhciBvcmlnaW4gPSBwYXJzZVByb3BTdHIodGhpcy5vcHQub3JpZ2luKTtcbiAgICAgICAgICAgIHB0ID0gY2VudGVyQXQocHQsIHt4OiBvcmlnaW5bMF0sIHk6IG9yaWdpblsxXX0sIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IE51bWJlcihwdC54KSxcbiAgICAgICAgICAgIHk6IE51bWJlcihwdC55KVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuZGV0YWNoKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZnVuY3Rpb24gcGFyc2VQcm9wU3RyIChzdHIpIHtcbiAgICBzdHIgPSBzdHIudG9TdHJpbmcoKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgnY2VudGVyJywgJzUwJScpO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC90b3B8bGVmdC9nLCAnMCcpO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9ib3R0b218cmlnaHQvZywgJzEwMCUnKTtcbiAgICB2YXIgdmFsID0gc3RyLnNwbGl0KCcgJyk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICB2YWxbMF0sXG4gICAgICAgIHZhbC5sZW5ndGggPT09IDEgPyB2YWxbMF0gOiB2YWxbMV0gLy8gcmVwZWF0IHZhbHVlIGZvciBoZWlnaHQgaWYgb25seSB3aWR0aCBpcyBwcm92aWRlZFxuICAgIF07XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRUb1B4IChwZXJjZW50LCBwYXJlbnRQeCkge1xuICAgIHJldHVybiBwZXJjZW50LmluZGV4T2YoJyUnKSA9PT0gLTEgPyBwZXJjZW50IDogcGVyY2VudC5zbGljZSgwLCAtMSkgLyAxMDAgKiBwYXJlbnRQeDtcbn1cblxuZnVuY3Rpb24gY2VudGVyQXQgKHB0LCBvcmlnaW4sIGRpbWVuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogcHQueCAtIChkaW1lbiA/IHBlcmNlbnRUb1B4KG9yaWdpbi54LCBkaW1lbi53aWR0aCkgOiBvcmlnaW4ueCksXG4gICAgICAgIHk6IHB0LnkgLSAoZGltZW4gPyBwZXJjZW50VG9QeChvcmlnaW4ueSwgZGltZW4uaGVpZ2h0KSA6IG9yaWdpbi55KVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGZpbGxXaXRoQXNwZWN0UmF0aW8gKG9yaWdpbmFsLCBzaXplKSB7XG4gICAgdmFyIGFyID0gb3JpZ2luYWwuaGVpZ2h0IC8gb3JpZ2luYWwud2lkdGg7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB3aWR0aDogc2l6ZS53aWR0aCA9PT0gJ2F1dG8nIHx8ICFzaXplLndpZHRoID8gc2l6ZS5oZWlnaHQgLyBhciA6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQgPT09ICdhdXRvJyB8fCAhc2l6ZS5oZWlnaHQgPyBzaXplLndpZHRoICogYXIgOiBzaXplLmhlaWdodFxuICAgIH07XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIGJhY2tncm91bmQgaW1hZ2Ugc2l6ZSBmb3IgJ2NvbnRhaW4nIGFuZCAnY292ZXInXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGUgICAgY29udGFpbicgb3IgJ2NvdmVyJ1xuICogQHBhcmFtICB7b2JqZWN0fSBjaGlsZFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJlbnQgXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGZ1bGxTY2FsZSAodHlwZSwgY2hpbGQsIHBhcmVudCkge1xuICAgIHZhciBjaGlsZEFSID0gY2hpbGQuaGVpZ2h0IC8gY2hpbGQud2lkdGgsXG4gICAgICAgIHBhcmVudEFSID0gcGFyZW50LmhlaWdodCAvIHBhcmVudC53aWR0aCxcbiAgICAgICAgc2FtZUhlaWdodCA9IHR5cGUgPT09ICdjb3ZlcicgPyBwYXJlbnRBUiA+IGNoaWxkQVIgOiBwYXJlbnRBUiA8IGNoaWxkQVI7XG5cbiAgICBpZiAoc2FtZUhlaWdodCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC5oZWlnaHQgLyBjaGlsZEFSLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJlbnQuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBwYXJlbnQud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC53aWR0aCAqIGNoaWxkQVJcbiAgICAgICAgfTtcbiAgICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1nO1xuXG5mdW5jdGlvbiBJbWcgKHNyYywgb3B0LCBjYW52YXMpIHtcbiAgICB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcblxuICAgIC8vIHByZWxvYWRcbiAgICB0aGlzLmVsID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy5lbC5vbmxvYWQgPSB0aGlzLl9vbkxvYWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmVsLnNyYyA9IHNyYztcblxuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gICAgc2l6ZTogJ2NvdmVyJyxcbiAgICBwb3NpdGlvbjogJ2NlbnRlcicsXG4gICAgb3JpZ2luOiAnNTAlIDUwJSdcbn07XG5cbkltZy5wcm90b3R5cGUgPSB7XG4gICAgZHJhdzogZnVuY3Rpb24gKGRpbWVuKSB7XG4gICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkaSA9IHRoaXMuZGltZW5zaW9uO1xuICAgICAgICBpZiAoZGltZW4pIHtcbiAgICAgICAgICAgIGRpID0gaGVscGVycy5leHRlbmQoe30sIHRoaXMuZGltZW5zaW9uLCBkaW1lbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhbnZhcy5jdHguZHJhd0ltYWdlKHRoaXMuZWwsIGRpLngsIGRpLnksIGRpLndpZHRoLCBkaS5oZWlnaHQpO1xuICAgIH0sXG4gICAgX29uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZGltZW5zaW9uID0gdGhpcy5jYW52YXMuZ2V0RGltZW5zaW9uKHRoaXMub3B0LCB0aGlzLmVsKTtcbiAgICAgICAgdGhpcy5vbmxvYWQoKTtcbiAgICB9LFxuICAgIG9ubG9hZDogZnVuY3Rpb24gKCkge31cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FudmFzID0gcmVxdWlyZSgnLi9jb3JlL0NhbnZhcy5qcycpLFxuXHRmcmFtZSA9IHJlcXVpcmUoJy4vY29yZS9mcmFtZS5qcycpLFxuXHRBbmltID0gcmVxdWlyZSgnLi9yZW5kZXIvQW5pbS5qcycpLFxuXHRoZWxwZXJzID0gcmVxdWlyZSgnLi9jb3JlL2hlbHBlcnMuanMnKSxcblx0SW1nID0gcmVxdWlyZSgnLi9yZW5kZXIvSW1nLmpzJyk7XG5cbndpbmRvdy5aZW90cm9wZSA9IFplb3Ryb3BlO1xuXG5mdW5jdGlvbiBaZW90cm9wZSAoZWwsIG9wdCkge1xuXHR0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcblxuXHR0aGlzLmNhbnZhcyA9IG5ldyBDYW52YXMoZWwpO1xuXHR0aGlzLmZyYW1lID0gZnJhbWUuYWRkKHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xuXG5cdC8vIGNvbGxlY3Rpb25zXG5cdHRoaXMuYW5pbXMgPSBbXTtcblx0dGhpcy5pbWdzID0gW107XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0b25Db21wbGV0ZTogZnVuY3Rpb24gKCkge30sXG5cdGRlc3Ryb3lPbkNvbXBsZXRlOiB0cnVlLFxuXHRyZW1vdmVFbE9uQ29tcGxldGU6IHRydWUsXG5cdG9ubG9hZDogZnVuY3Rpb24gKCkge30sXG5cdHN0YXJ0T25Mb2FkOiB0cnVlLFxuXHRjbGVhck9uRnJhbWU6IHRydWVcbn07XG5cblplb3Ryb3BlLnByb3RvdHlwZSA9IHtcblx0YW5pbTogZnVuY3Rpb24gKG9wdCkge1xuXHRcdGlmICh0aGlzLm9wdC5zdGFydE9uTG9hZCAmJiB0aGlzLmltZ3MubGVuZ3RoKSB7XG5cdFx0XHRvcHQuc3RhcnQgPSB0eXBlb2Ygb3B0LnN0YXJ0ID09PSAnYm9vbGVhbicgPyBvcHQuc3RhcnQgOiBmYWxzZTtcblx0XHR9XG5cblx0XHR2YXIgYW5pbSA9IG5ldyBBbmltKG9wdCk7XG5cdFx0YW5pbS5femVvdHJvcGUgPSB0aGlzO1xuXHRcdHRoaXMuYW5pbXMucHVzaChhbmltKTtcblx0XHRyZXR1cm4gYW5pbTtcblx0fSxcblx0ZGltZW5zaW9uOiBmdW5jdGlvbiAob3B0LCBiYXNlU2l6ZSkge1xuXHRcdHJldHVybiB0aGlzLmNhbnZhcy5nZXREaW1lbnNpb24ob3B0LCBiYXNlU2l6ZSk7XG5cdH0sXG5cdGltZzogZnVuY3Rpb24gKHNyYywgb3B0KSB7XG5cdFx0dmFyIGltZyA9IG5ldyBJbWcoc3JjLCBvcHQsIHRoaXMuY2FudmFzKTtcblx0XHRpbWcub25sb2FkID0gdGhpcy5fb25sb2FkLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5pbWdzLnB1c2goaW1nKTtcblx0XHRyZXR1cm4gaW1nO1xuXHR9LFxuXHRfb25sb2FkOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGxvYWRlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmltZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICghdGhpcy5pbWdzW2ldLmxvYWRlZCkge1xuXHRcdFx0XHRsb2FkZWQgPSBmYWxzZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGxvYWRlZCkge1xuXHRcdFx0dGhpcy5vcHQub25sb2FkKCk7XG5cdFx0XHRpZiAodGhpcy5vcHQuc3RhcnRPbkxvYWQpIHtcblx0XHRcdFx0dGhpcy5zdGFydEFuaW1zKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRzdGFydEFuaW1zOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoIXRoaXMuYW5pbXNbaV0uc3RhcnRlZCkge1xuXHRcdFx0XHR0aGlzLmFuaW1zW2ldLnN0YXJ0KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRkZXRhY2g6IGZ1bmN0aW9uIChhbmltKSB7XG5cdFx0aGVscGVycy5yZW1vdmUodGhpcy5hbmltcywgYW5pbSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjb21wbGV0ZWQgPSB0cnVlO1xuXG5cdFx0aWYgKHRoaXMub3B0LmNsZWFyT25GcmFtZSkge1xuXHRcdFx0dGhpcy5jYW52YXMuY2xlYXIoKTtcblx0XHR9XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAodGhpcy5hbmltc1tpXS5zdGFydGVkKSB7XG5cdFx0XHRcdHRoaXMuYW5pbXNbaV0ucmVuZGVyKHRoaXMuY2FudmFzKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUT0RPOiBXaGF0IGlmIGl0IGhhcyBpdGVyYXRpb24/XG5cdFx0XHQgKi9cblx0XHRcdGlmICh0aGlzLmFuaW1zW2ldLnByb2dyZXNzICE9PSAxKSB7XG5cdFx0XHRcdGNvbXBsZXRlZCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChjb21wbGV0ZWQpIHtcblx0XHRcdHRoaXMub3B0Lm9uQ29tcGxldGUuYXBwbHkodGhpcyk7XG5cdFx0XHRpZiAodGhpcy5vcHQuZGVzdHJveU9uQ29tcGxldGUpIHtcblx0XHRcdFx0dGhpcy5yZW1vdmUodGhpcy5vcHQucmVtb3ZlRWxPbkNvbXBsZXRlKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKHJlbW92ZUVsKSB7XG5cdFx0ZnJhbWUucmVtb3ZlKHRoaXMuZnJhbWUpO1xuXHRcdHRoaXMuY2FudmFzLmNsZWFyKCk7XG5cdFx0dGhpcy5jYW52YXMucmVtb3ZlKHJlbW92ZUVsKTtcblx0fVxufTsiXX0=
