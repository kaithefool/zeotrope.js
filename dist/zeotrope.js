/*!
 * zeotrope.js 1.0.0 <>
 * Contributor(s): Kai Lam <kai.chun.lam@gmail.com>
 * Last Build: 2015-10-02
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyksXG4gICAgRGltZW5zaW9uID0gcmVxdWlyZSgnLi8uLi9yZW5kZXIvRGltZW5zaW9uLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuXG5mdW5jdGlvbiBDYW52YXMgKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gb25SZXNpemUgZXZlbnRcbiAgICB0aGlzLl9yZXNpemVIYW5kbGVyID0gdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgdGhpcy5fb25SZXNpemUoKTtcbn1cblxuQ2FudmFzLnByb3RvdHlwZSA9IHtcbiAgICBkaW1lbnNpb25zOiBbXSxcbiAgICBfb25SZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHcgPSB0aGlzLmVsLm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgaCA9IHRoaXMuZWwub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgIGlmICh3ICE9PSB0aGlzLndpZHRoICYmIGggIT09IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gdztcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaDtcbiAgICAgICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgLy8gdXBkYXRlIGFsbCBkaW1lbnNpb25cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kaW1lbnNpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaW1lbnNpb25zW2ldLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfSAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXREaW1lbnNpb246IGZ1bmN0aW9uIChvcHQsIGJhc2VTaXplKSB7XG4gICAgICAgIHZhciBkaW1lbiA9IG5ldyBEaW1lbnNpb24ob3B0LCBiYXNlU2l6ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMuZGltZW5zaW9ucy5wdXNoKGRpbWVuKTtcbiAgICAgICAgcmV0dXJuIGRpbWVuO1xuICAgIH0sXG4gICAgZGV0YWNoOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBjb2xsZWN0aW9uO1xuXG4gICAgICAgIGlmIChvYmogaW5zdGFuY2VvZiBEaW1lbnNpb24pIHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb24gPSB0aGlzLmRpbWVuc2lvbnM7XG4gICAgICAgIH1cblxuICAgICAgICBoZWxwZXJzLnJlbW92ZShjb2xsZWN0aW9uLCBvYmopO1xuICAgIH0sXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKHJlbW92ZUVsKSB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICAgICAgaWYgKHJlbW92ZUVsKSB7XG4gICAgICAgICAgICB0aGlzLmVsLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbCk7XG4gICAgICAgIH1cbiAgICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMuanMnKTtcbnZhciBlYXNpbmdzID0gcmVxdWlyZSgnLi9lYXNpbmdzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7XG5cbmZ1bmN0aW9uIFRpbWVsaW5lIChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0LyoqXG5cdCAqIHRvZG86IHJld3JpdGUgdGhpc1xuXHQgKi9cblxuXHQvLyBpbml0aWFsaXplXG5cdHRoaXMuZWFzaW5nID0gZWFzaW5nc1tvcHQuZWFzaW5nXTtcblx0dGhpcy5zdGFydCA9IG9wdC5zdGFydCBpbnN0YW5jZW9mIERhdGUgPyBvcHQuc3RhcnQgOiBuZXcgRGF0ZSgpO1xuXHRpZiAob3B0LmRlbGF5KSB7XG5cdFx0dGhpcy5zdGFydCA9IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpICsgb3B0LmRlbGF5KTtcblx0fVxuXHRpZiAob3B0Lml0ZXJhdGUgIT09ICdpbmZpbml0ZScpIHtcblx0XHR0aGlzLmVuZCA9IG9wdC5lbmQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LmVuZCA6IG5ldyBEYXRlKHRoaXMuc3RhcnQuZ2V0VGltZSgpICsgKG9wdC5kdXJhdGlvbipvcHQuaXRlcmF0ZSkpO1xuXHRcdHRoaXMuZHVyYXRpb24gPSAodGhpcy5lbmQuZ2V0VGltZSgpIC0gdGhpcy5zdGFydCkgLyBvcHQuaXRlcmF0ZTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmR1cmF0aW9uID0gb3B0LmR1cmF0aW9uO1xuXHR9XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0ZWFzaW5nOiAnbGluZWFyJyxcblx0c3RhcnQ6IG51bGwsXG5cdGVuZDogbnVsbCxcblx0ZGVsYXk6IDAsIC8vIG1pbGxpc2Vjb25kc1xuXHRkdXJhdGlvbjogMTAwMCwgLy8gbWlsbGlzZWNvbmRzXG5cdGl0ZXJhdGU6IDEgLy8gaW50ZWdlciBvciAnaW5maW5pdGUnXG59O1xuXG5UaW1lbGluZS5wcm90b3R5cGUgPSB7XG5cdGJhY2t3YXJkOiBmYWxzZSxcblx0cGF1c2VkQXQ6IG51bGwsXG5cdGdldFByb2dyZXNzOiBmdW5jdGlvbiAobm93KSB7XG5cdFx0dmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnQobm93KTtcblxuXHRcdGlmICh0aGlzLmJhY2t3YXJkKSB7XG5cdFx0XHRjdXJyZW50ID0gMSAtIGN1cnJlbnQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGN1cnJlbnQgPT09IDAgfHwgY3VycmVudCA9PT0gMSA/IGN1cnJlbnQgOiB0aGlzLmVhc2luZyhjdXJyZW50KTtcblx0fSxcblx0Z2V0Q3VycmVudDogZnVuY3Rpb24gKG5vdykge1xuXHRcdG5vdyA9IG5vdyA/IG5vdyA6IG5ldyBEYXRlKCk7XG5cblx0XHRpZiAodGhpcy5wYXVzZWRBdCAhPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucGF1c2VkQXQ7XG5cdFx0fSBlbHNlIGlmIChub3cgPCB0aGlzLnN0YXJ0KSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9IGVsc2UgaWYgKHRoaXMuZW5kICYmIG5vdyA+IHRoaXMuZW5kKSB7XG5cdFx0XHRyZXR1cm4gMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuICggKG5vdyAtIHRoaXMuc3RhcnQpIC8gdGhpcy5kdXJhdGlvbiApICUgMTtcblx0XHR9XG5cdH0sXG5cdHBhdXNlOiBmdW5jdGlvbiAobm93KSB7XG5cdFx0dGhpcy5wYXVzZWRBdCA9IHRoaXMuZ2V0Q3VycmVudChub3cpO1xuXHR9LFxuXHRyZXZlcnNlOiBmdW5jdGlvbiAobm93KSB7XG5cdFx0dmFyIGN1cnJlbnQgPSB0aGlzLmdldEN1cnJlbnQobm93KTtcblxuXHRcdHRoaXMuZW5kID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIChjdXJyZW50ICogdGhpcy5kdXJhdGlvbikpO1xuXHRcdHRoaXMuc3RhcnQgPSBuZXcgRGF0ZSh0aGlzLmVuZC5nZXRUaW1lKCkgLSB0aGlzLmR1cmF0aW9uKTtcblx0XHR0aGlzLmJhY2t3YXJkID0gdGhpcy5iYWNrd2FyZCA/IGZhbHNlIDogdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzLmdldEN1cnJlbnQobm93KTtcblx0fSxcblx0cGxheTogZnVuY3Rpb24gKG5vdykge1xuXHRcdGlmICh0aGlzLnBhdXNlZEF0KSB7XG5cdFx0XHRub3cgPSBub3cgPyBub3cgOiBuZXcgRGF0ZSgpO1xuXG5cdFx0XHR0aGlzLmVuZCA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyAoKDEgLSB0aGlzLnBhdXNlZEF0KSAqIHRoaXMuZHVyYXRpb24pKTtcblx0XHRcdHRoaXMuc3RhcnQgPSBuZXcgRGF0ZSh0aGlzLmVuZC5nZXRUaW1lKCkgLSB0aGlzLmR1cmF0aW9uKTtcblx0XHRcdHRoaXMucGF1c2VkQXQgPSBudWxsO1xuXHRcdH1cblx0fVxufTsiLCIndXNlIHN0cmljdCc7XG4vKlxuICogRWFzaW5nIEZ1bmN0aW9ucyAtIGluc3BpcmVkIGZyb20gaHR0cDovL2dpem1hLmNvbS9lYXNpbmcvXG4gKiBvbmx5IGNvbnNpZGVyaW5nIHRoZSB0IHZhbHVlIGZvciB0aGUgcmFuZ2UgWzAsIDFdID0+IFswLCAxXVxuICogc2VlIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dyZS8xNjUwMjk0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8vIG5vIGVhc2luZywgbm8gYWNjZWxlcmF0aW9uXG4gICAgbGluZWFyOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCooMi10KTsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWFkOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyAyKnQqdCA6IC0xKyg0LTIqdCkqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VJbkN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZU91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gKC0tdCkqdCp0KzE7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uIFxuICAgIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyA0KnQqdCp0IDogKHQtMSkqKDIqdC0yKSooMip0LTIpKzE7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZU91dFF1YXJ0OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMS0oLS10KSp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb25cbiAgICBlYXNlSW5PdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gOCp0KnQqdCp0IDogMS04KigtLXQpKnQqdCp0OyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlSW5RdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0KnQqdDsgfSxcbiAgICAvLyBkZWNlbGVyYXRpbmcgdG8gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDErKC0tdCkqdCp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpb24gdW50aWwgaGFsZndheSwgdGhlbiBkZWNlbGVyYXRpb24gXG4gICAgZWFzZUluT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDE2KnQqdCp0KnQqdCA6IDErMTYqKC0tdCkqdCp0KnQqdDsgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRsaXN0ZW5lcnM6IFtdLFxuXHRzdGF0dXM6IDAsXG5cdF9mcmFtZTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLnN0YXR1cykge1xuXHRcdFx0dGhpcy5leGVjdXRlKCk7XG5cdFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2ZyYW1lLmJpbmQodGhpcykpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFN0YXJ0IGFuaW1hdGlvbiBsb29wXG5cdCAqL1xuXHRzdGFydDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMTtcblxuXHRcdGlmICh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG5cdFx0XHR0aGlzLl9mcmFtZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9pbnR2bCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLl9mcmFtZS5iaW5kKHRoaXMpLCAxNik7IC8vIDYwZnBzXG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTdG9wIGFuaW1hdGlvbiBsb29wXG5cdCAqL1xuXHRzdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5zdGF0dXMgPSAwO1xuXG5cdFx0aWYgKHRoaXMuX2ludHZsKSB7XG5cdFx0XHR3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLl9pbnR2bCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogVHJpZ2dlciBhbGwgbGlzdGVuZXJzXG5cdCAqL1xuXHRleGVjdXRlOiBmdW5jdGlvbiAoKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5saXN0ZW5lcnNbaV0oKTtcblx0XHR9XG5cdH0sXG5cdGFkZDogZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG5cdFx0aWYgKCF0aGlzLmxpc3RlbmVycy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuc3RhcnQoKTtcblx0XHR9XG5cdFx0dGhpcy5saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cblx0XHRyZXR1cm4gbGlzdGVuZXI7XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG5cdFx0aGVscGVycy5yZW1vdmUodGhpcy5saXN0ZW5lcnMsIGxpc3RlbmVyKTtcblxuXHRcdGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnN0b3AoKTtcblx0XHR9XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRleHRlbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIGZvcih2YXIgaT0xOyBpPGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcblx0ICAgICAgICBmb3IodmFyIGtleSBpbiBhcmd1bWVudHNbaV0pXG5cdCAgICAgICAgICAgIGlmKGFyZ3VtZW50c1tpXS5oYXNPd25Qcm9wZXJ0eShrZXkpKVxuXHQgICAgICAgICAgICAgICAgYXJndW1lbnRzWzBdW2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcblx0ICAgIHJldHVybiBhcmd1bWVudHNbMF07XG5cdH0sXG5cdGV4dHJhY3Q6IGZ1bmN0aW9uIChvYmosIHByb3BlcnRpZXMpIHtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAob2JqW3Byb3BlcnRpZXNbaV1dKSB7XG5cdFx0XHRcdHJlc3VsdFtwcm9wZXJ0aWVzW2ldXSA9IG9ialtwcm9wZXJ0aWVzW2ldXTtcdFxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChhcnJheSwgZWwpIHtcblx0XHRyZXR1cm4gYXJyYXkuc3BsaWNlKGFycmF5LmluZGV4T2YoZWwpLCAxKTtcblx0fVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBUaW1lbGluZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9UaW1lbGluZS5qcycpLFxuXHRoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBbmltO1xuXG4vKipcbiAqIFRPRE86IG11bHRpcGxlIHRpbWVsaW5lc1xuICovXG5mdW5jdGlvbiBBbmltIChvcHQpIHtcblx0dGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG5cdGlmICh0aGlzLm9wdC5zdGFydCkge1xuXHRcdHRoaXMuc3RhcnQoKTtcblx0fVxufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGZpbGxNb2RlOiAnYm90aCcsXG5cdHRpbWU6IHt9LFxuXHRzdGFydDogdHJ1ZSxcblx0ZHJhdzogZnVuY3Rpb24gKCkge31cbn07XG5cbkFuaW0ucHJvdG90eXBlID0ge1xuXHRzdGFydGVkOiBmYWxzZSxcblx0c3RhcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnRpbWUgPSBuZXcgVGltZWxpbmUodGhpcy5vcHQudGltZSk7XG5cdFx0dGhpcy5kcmF3ID0gdGhpcy5vcHQuZHJhdztcblx0XHR0aGlzLnN0YXJ0ZWQgPSB0cnVlO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIChjYW52YXMpIHtcblx0XHR0aGlzLnByb2dyZXNzID0gdGhpcy50aW1lLmdldFByb2dyZXNzKCk7XG5cblx0XHRpZiAodGhpcy5pc0ZpbGwodGhpcy5wcm9ncmVzcykpIHtcblx0XHRcdHRoaXMuZHJhdyhjYW52YXMsIHRoaXMucHJvZ3Jlc3MsIHRoaXMub3B0KTtcblx0XHR9XG5cdH0sXG5cdGlzRmlsbDogZnVuY3Rpb24gKHByb2dyZXNzKSB7XG5cdFx0dmFyIGZpbGxNb2RlID0gdGhpcy5vcHQuZmlsbE1vZGU7XG5cblx0XHRpZiAoZmlsbE1vZGUgPT09ICdub25lJyAmJiAocHJvZ3Jlc3MgPT09IDAgfHwgcHJvZ3Jlc3MgPT09IDEpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2ZvcndhcmQnICYmIHByb2dyZXNzID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2JhY2t3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRkZXRhY2g6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5femVvdHJvcGUpIHtcblx0XHRcdHRoaXMuX3plb3Ryb3BlLmRldGFjaCh0aGlzKTtcblx0XHR9XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGltZW5zaW9uO1xuXG5mdW5jdGlvbiBEaW1lbnNpb24gKG9wdCwgYmFzZVNpemUsIHBhcmVudCkge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuICAgIHRoaXMuYmFzZVNpemUgPSBiYXNlU2l6ZTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZSgpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gICAgcG9zaXRpb246IG51bGwsXG4gICAgc2l6ZTogbnVsbCxcbiAgICBvcmlnaW46IDBcbn07XG5cbi8vIGNvbnN0IG1ldGhvZHNcbmhlbHBlcnMuZXh0ZW5kKERpbWVuc2lvbiwge1xuICAgIHBhcnNlUHJvcFN0cjogcGFyc2VQcm9wU3RyLFxuICAgIHBlcmNlbnRUb1B4OiBwZXJjZW50VG9QeCxcbiAgICBjZW50ZXJBdDogY2VudGVyQXQsXG4gICAgZmlsbFdpdGhBc3BlY3RSYXRpbzogZmlsbFdpdGhBc3BlY3RSYXRpbyxcbiAgICBmdWxsU2NhbGU6IGZ1bGxTY2FsZVxufSk7XG5cblxuRGltZW5zaW9uLnByb3RvdHlwZSA9IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0LnNpemUpIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gdGhpcy5nZXRTaXplKCk7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gc2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnggPSBwb3MueDtcbiAgICAgICAgICAgIHRoaXMueSA9IHBvcy55O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzaXplO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdC5zaXplID09PSAnYXV0bycgfHwgdGhpcy5vcHQuc2l6ZSA9PT0gJ2F1dG8gYXV0bycpIHtcbiAgICAgICAgICAgIHNpemUgPSBoZWxwZXJzLmV4dHJhY3QodGhpcy5iYXNlU2l6ZSwgWyd3aWR0aCcsICdoZWlnaHQnXSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHQuc2l6ZSA9PT0gJ2NvdmVyJyB8fCB0aGlzLm9wdC5zaXplID09PSAnY29udGFpbicpIHtcbiAgICAgICAgICAgIHNpemUgPSBmdWxsU2NhbGUodGhpcy5vcHQuc2l6ZSwgdGhpcy5iYXNlU2l6ZSwgdGhpcy5wYXJlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHNjYWxlID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0LnNpemUpO1xuICAgICAgICAgICAgc2l6ZSA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRvUHgoc2NhbGVbMF0sIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQud2lkdGggOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogcGVyY2VudFRvUHgoc2NhbGVbMV0sIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQuaGVpZ2h0IDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuYmFzZVNpemUpIHtcbiAgICAgICAgICAgICAgICBzaXplID0gZmlsbFdpdGhBc3BlY3RSYXRpbyh0aGlzLmJhc2VTaXplLCBzaXplKTsgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvbmx5IG91dHB1dCBudW1iZXJcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBOdW1iZXIoc2l6ZS53aWR0aCksXG4gICAgICAgICAgICBoZWlnaHQ6IE51bWJlcihzaXplLmhlaWdodClcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwb3MgPSBwYXJzZVByb3BTdHIodGhpcy5vcHQucG9zaXRpb24pLFxuICAgICAgICAgICAgcHQgPSB7XG4gICAgICAgICAgICAgICAgeDogcGVyY2VudFRvUHgocG9zWzBdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LndpZHRoIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICB5OiBwZXJjZW50VG9QeChwb3NbMV0sIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQuaGVpZ2h0IDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBhZGp1c3QgZm9yIG9yaWdpblxuICAgICAgICBpZiAodGhpcy5vcHQub3JpZ2luKSB7XG4gICAgICAgICAgICB2YXIgb3JpZ2luID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0Lm9yaWdpbik7XG4gICAgICAgICAgICBwdCA9IGNlbnRlckF0KHB0LCB7eDogb3JpZ2luWzBdLCB5OiBvcmlnaW5bMV19LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBOdW1iZXIocHQueCksXG4gICAgICAgICAgICB5OiBOdW1iZXIocHQueSlcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRldGFjaCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmZ1bmN0aW9uIHBhcnNlUHJvcFN0ciAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnRvU3RyaW5nKCk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoJ2NlbnRlcicsICc1MCUnKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvdG9wfGxlZnQvZywgJzAnKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvYm90dG9tfHJpZ2h0L2csICcxMDAlJyk7XG4gICAgdmFyIHZhbCA9IHN0ci5zcGxpdCgnICcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgdmFsWzBdLFxuICAgICAgICB2YWwubGVuZ3RoID09PSAxID8gdmFsWzBdIDogdmFsWzFdIC8vIHJlcGVhdCB2YWx1ZSBmb3IgaGVpZ2h0IGlmIG9ubHkgd2lkdGggaXMgcHJvdmlkZWRcbiAgICBdO1xufVxuXG5mdW5jdGlvbiBwZXJjZW50VG9QeCAocGVyY2VudCwgcGFyZW50UHgpIHtcbiAgICByZXR1cm4gcGVyY2VudC5pbmRleE9mKCclJykgPT09IC0xID8gcGVyY2VudCA6IHBlcmNlbnQuc2xpY2UoMCwgLTEpIC8gMTAwICogcGFyZW50UHg7XG59XG5cbmZ1bmN0aW9uIGNlbnRlckF0IChwdCwgb3JpZ2luLCBkaW1lbikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHB0LnggLSAoZGltZW4gPyBwZXJjZW50VG9QeChvcmlnaW4ueCwgZGltZW4ud2lkdGgpIDogb3JpZ2luLngpLFxuICAgICAgICB5OiBwdC55IC0gKGRpbWVuID8gcGVyY2VudFRvUHgob3JpZ2luLnksIGRpbWVuLmhlaWdodCkgOiBvcmlnaW4ueSlcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBmaWxsV2l0aEFzcGVjdFJhdGlvIChvcmlnaW5hbCwgc2l6ZSkge1xuICAgIHZhciBhciA9IG9yaWdpbmFsLmhlaWdodCAvIG9yaWdpbmFsLndpZHRoO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGggPT09ICdhdXRvJyB8fCAhc2l6ZS53aWR0aCA/IHNpemUuaGVpZ2h0IC8gYXIgOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0ID09PSAnYXV0bycgfHwgIXNpemUuaGVpZ2h0ID8gc2l6ZS53aWR0aCAqIGFyIDogc2l6ZS5oZWlnaHRcbiAgICB9O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBiYWNrZ3JvdW5kIGltYWdlIHNpemUgZm9yICdjb250YWluJyBhbmQgJ2NvdmVyJ1xuICogQHBhcmFtICB7c3RyaW5nfSB0eXBlICAgIGNvbnRhaW4nIG9yICdjb3ZlcidcbiAqIEBwYXJhbSAge29iamVjdH0gY2hpbGRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyZW50IFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5mdW5jdGlvbiBmdWxsU2NhbGUgKHR5cGUsIGNoaWxkLCBwYXJlbnQpIHtcbiAgICB2YXIgY2hpbGRBUiA9IGNoaWxkLmhlaWdodCAvIGNoaWxkLndpZHRoLFxuICAgICAgICBwYXJlbnRBUiA9IHBhcmVudC5oZWlnaHQgLyBwYXJlbnQud2lkdGgsXG4gICAgICAgIHNhbWVIZWlnaHQgPSB0eXBlID09PSAnY292ZXInID8gcGFyZW50QVIgPiBjaGlsZEFSIDogcGFyZW50QVIgPCBjaGlsZEFSO1xuXG4gICAgaWYgKHNhbWVIZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBwYXJlbnQuaGVpZ2h0IC8gY2hpbGRBUixcbiAgICAgICAgICAgIGhlaWdodDogcGFyZW50LmhlaWdodFxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogcGFyZW50LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJlbnQud2lkdGggKiBjaGlsZEFSXG4gICAgICAgIH07XG4gICAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltZztcblxuZnVuY3Rpb24gSW1nIChzcmMsIG9wdCwgY2FudmFzKSB7XG4gICAgdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG5cbiAgICAvLyBwcmVsb2FkXG4gICAgdGhpcy5lbCA9IG5ldyBJbWFnZSgpO1xuICAgIHRoaXMuZWwub25sb2FkID0gdGhpcy5fb25Mb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5lbC5zcmMgPSBzcmM7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICAgIHNpemU6ICdjb3ZlcicsXG4gICAgcG9zaXRpb246ICdjZW50ZXInLFxuICAgIG9yaWdpbjogJzUwJSA1MCUnXG59O1xuXG5JbWcucHJvdG90eXBlID0ge1xuICAgIGRyYXc6IGZ1bmN0aW9uIChkaW1lbikge1xuICAgICAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGkgPSB0aGlzLmRpbWVuc2lvbjtcbiAgICAgICAgaWYgKGRpbWVuKSB7XG4gICAgICAgICAgICBkaSA9IGhlbHBlcnMuZXh0ZW5kKHt9LCB0aGlzLmRpbWVuc2lvbiwgZGltZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYW52YXMuY3R4LmRyYXdJbWFnZSh0aGlzLmVsLCBkaS54LCBkaS55LCBkaS53aWR0aCwgZGkuaGVpZ2h0KTtcbiAgICB9LFxuICAgIF9vbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbiA9IHRoaXMuY2FudmFzLmdldERpbWVuc2lvbih0aGlzLm9wdCwgdGhpcy5lbCk7XG4gICAgICAgIHRoaXMub25sb2FkKCk7XG4gICAgfSxcbiAgICBvbmxvYWQ6IGZ1bmN0aW9uICgpIHt9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbnZhcyA9IHJlcXVpcmUoJy4vY29yZS9DYW52YXMuanMnKSxcblx0ZnJhbWUgPSByZXF1aXJlKCcuL2NvcmUvZnJhbWUuanMnKSxcblx0QW5pbSA9IHJlcXVpcmUoJy4vcmVuZGVyL0FuaW0uanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vY29yZS9oZWxwZXJzLmpzJyksXG5cdEltZyA9IHJlcXVpcmUoJy4vcmVuZGVyL0ltZy5qcycpO1xuXG53aW5kb3cuWmVvdHJvcGUgPSBaZW90cm9wZTtcblxuZnVuY3Rpb24gWmVvdHJvcGUgKGVsLCBvcHQpIHtcblx0dGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG5cblx0dGhpcy5jYW52YXMgPSBuZXcgQ2FudmFzKGVsKTtcblx0dGhpcy5mcmFtZSA9IGZyYW1lLmFkZCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpKTtcblxuXHQvLyBjb2xsZWN0aW9uc1xuXHR0aGlzLmFuaW1zID0gW107XG5cdHRoaXMuaW1ncyA9IFtdO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdG9uQ29tcGxldGU6IGZ1bmN0aW9uICgpIHt9LFxuXHRkZXN0cm95T25Db21wbGV0ZTogdHJ1ZSxcblx0cmVtb3ZlRWxPbkNvbXBsZXRlOiB0cnVlLFxuXHRvbmxvYWQ6IGZ1bmN0aW9uICgpIHt9LFxuXHRzdGFydE9uTG9hZDogdHJ1ZSxcblx0Y2xlYXJPbkZyYW1lOiB0cnVlXG59O1xuXG5aZW90cm9wZS5wcm90b3R5cGUgPSB7XG5cdGFuaW06IGZ1bmN0aW9uIChvcHQpIHtcblx0XHRpZiAodGhpcy5vcHQuc3RhcnRPbkxvYWQgJiYgdGhpcy5pbWdzLmxlbmd0aCkge1xuXHRcdFx0b3B0LnN0YXJ0ID0gdHlwZW9mIG9wdC5zdGFydCA9PT0gJ2Jvb2xlYW4nID8gb3B0LnN0YXJ0IDogZmFsc2U7XG5cdFx0fVxuXG5cdFx0dmFyIGFuaW0gPSBuZXcgQW5pbShvcHQpO1xuXHRcdGFuaW0uX3plb3Ryb3BlID0gdGhpcztcblx0XHR0aGlzLmFuaW1zLnB1c2goYW5pbSk7XG5cdFx0cmV0dXJuIGFuaW07XG5cdH0sXG5cdGRpbWVuc2lvbjogZnVuY3Rpb24gKG9wdCwgYmFzZVNpemUpIHtcblx0XHRyZXR1cm4gdGhpcy5jYW52YXMuZ2V0RGltZW5zaW9uKG9wdCwgYmFzZVNpemUpO1xuXHR9LFxuXHRpbWc6IGZ1bmN0aW9uIChzcmMsIG9wdCkge1xuXHRcdHZhciBpbWcgPSBuZXcgSW1nKHNyYywgb3B0LCB0aGlzLmNhbnZhcyk7XG5cdFx0aW1nLm9ubG9hZCA9IHRoaXMuX29ubG9hZC5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuaW1ncy5wdXNoKGltZyk7XG5cdFx0cmV0dXJuIGltZztcblx0fSxcblx0X29ubG9hZDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBsb2FkZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pbWdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoIXRoaXMuaW1nc1tpXS5sb2FkZWQpIHtcblx0XHRcdFx0bG9hZGVkID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChsb2FkZWQpIHtcblx0XHRcdHRoaXMub3B0Lm9ubG9hZCgpO1xuXHRcdFx0aWYgKHRoaXMub3B0LnN0YXJ0T25Mb2FkKSB7XG5cdFx0XHRcdHRoaXMuc3RhcnRBbmltcygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0c3RhcnRBbmltczogZnVuY3Rpb24gKCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKCF0aGlzLmFuaW1zW2ldLnN0YXJ0ZWQpIHtcblx0XHRcdFx0dGhpcy5hbmltc1tpXS5zdGFydCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoYW5pbSkge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMuYW5pbXMsIGFuaW0pO1xuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgY29tcGxldGVkID0gdHJ1ZTtcblxuXHRcdGlmICh0aGlzLm9wdC5jbGVhck9uRnJhbWUpIHtcblx0XHRcdHRoaXMuY2FudmFzLmNsZWFyKCk7XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRoaXMuYW5pbXNbaV0uc3RhcnRlZCkge1xuXHRcdFx0XHR0aGlzLmFuaW1zW2ldLnJlbmRlcih0aGlzLmNhbnZhcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVE9ETzogV2hhdCBpZiBpdCBoYXMgaXRlcmF0aW9uP1xuXHRcdFx0ICovXG5cdFx0XHRpZiAodGhpcy5hbmltc1tpXS5wcm9ncmVzcyAhPT0gMSkge1xuXHRcdFx0XHRjb21wbGV0ZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tcGxldGVkKSB7XG5cdFx0XHR0aGlzLm9wdC5vbkNvbXBsZXRlLmFwcGx5KHRoaXMpO1xuXHRcdFx0aWYgKHRoaXMub3B0LmRlc3Ryb3lPbkNvbXBsZXRlKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlKHRoaXMub3B0LnJlbW92ZUVsT25Db21wbGV0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChyZW1vdmVFbCkge1xuXHRcdGZyYW1lLnJlbW92ZSh0aGlzLmZyYW1lKTtcblx0XHR0aGlzLmNhbnZhcy5jbGVhcigpO1xuXHRcdHRoaXMuY2FudmFzLnJlbW92ZShyZW1vdmVFbCk7XG5cdH1cbn07Il19
