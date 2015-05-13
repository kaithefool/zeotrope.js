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
    remove: function (removeEl) {
        window.removeEventListener(this._resizeHandler);
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

	// initialize
	this.easing = easings[opt.easing];
	this.start = opt.start instanceof Date ? opt.start : new Date();
	if (opt.delay) {
		this.start = new Date(this.start.getTime() + opt.delay);
	}
	this.end = opt.end instanceof Date ? opt.end : new Date(this.start.getTime() + opt.duration);
	this.duration = this.end - this.start;
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

		if (now < this.start) {
			return 0;
		} else if (now > this.end) {
			return 1;
		} else if (this.pausedAt !== null) {
			return this.pausedAt;
		} else {
			return (now - this.start) / this.duration;
		}
	},
	/**
	 * TODOs
	 */
	pause: function () {
		this.pausedAt = this.getCurrent();
	},
	reverse: function () {
		var current = this.getCurrent();

		this.start = new Date(this.end - (current * this.duration));
		this.backward = this.backward ? false : true;
	},
	play: function () {
		this.start = this.end - ((1 - this.pausedAt) * this.duration);
		this.pausedAt = null;
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
			this.draw(canvas, this.progress);
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
	removeOnComplete: true,
	onload: function () {},
	startOnLoad: true
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

		this.canvas.clear();
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
			if (this.opt.removeOnComplete) {
				this.remove();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyksXG4gICAgRGltZW5zaW9uID0gcmVxdWlyZSgnLi8uLi9yZW5kZXIvRGltZW5zaW9uLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuXG5mdW5jdGlvbiBDYW52YXMgKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gb25SZXNpemUgZXZlbnRcbiAgICB0aGlzLl9yZXNpemVIYW5kbGVyID0gdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xufVxuXG5DYW52YXMucHJvdG90eXBlID0ge1xuICAgIGRpbWVuc2lvbnM6IFtdLFxuICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdyA9IHRoaXMuZWwub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHcgIT09IHRoaXMud2lkdGggJiYgaCAhPT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCk7XG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgYWxsIGRpbWVuc2lvblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmRpbWVuc2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpbWVuc2lvbnNbaV0udXBkYXRlKCk7XG4gICAgICAgICAgICB9ICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldERpbWVuc2lvbjogZnVuY3Rpb24gKG9wdCwgYmFzZVNpemUpIHtcbiAgICAgICAgdmFyIGRpbWVuID0gbmV3IERpbWVuc2lvbihvcHQsIGJhc2VTaXplLCB0aGlzKTtcbiAgICAgICAgdGhpcy5kaW1lbnNpb25zLnB1c2goZGltZW4pO1xuICAgICAgICByZXR1cm4gZGltZW47XG4gICAgfSxcbiAgICBkZXRhY2g6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb247XG5cbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIERpbWVuc2lvbikge1xuICAgICAgICAgICAgY29sbGVjdGlvbiA9IHRoaXMuZGltZW5zaW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGhlbHBlcnMucmVtb3ZlKGNvbGxlY3Rpb24sIG9iaik7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAocmVtb3ZlRWwpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICAgIGlmIChyZW1vdmVFbCkge1xuICAgICAgICAgICAgdGhpcy5lbC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuZWwpO1xuICAgICAgICB9XG4gICAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzLmpzJyk7XG52YXIgZWFzaW5ncyA9IHJlcXVpcmUoJy4vZWFzaW5ncy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVsaW5lO1xuXG5mdW5jdGlvbiBUaW1lbGluZSAob3B0aW9ucykge1xuXHR2YXIgb3B0ID0gdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdC8vIGluaXRpYWxpemVcblx0dGhpcy5lYXNpbmcgPSBlYXNpbmdzW29wdC5lYXNpbmddO1xuXHR0aGlzLnN0YXJ0ID0gb3B0LnN0YXJ0IGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5zdGFydCA6IG5ldyBEYXRlKCk7XG5cdGlmIChvcHQuZGVsYXkpIHtcblx0XHR0aGlzLnN0YXJ0ID0gbmV3IERhdGUodGhpcy5zdGFydC5nZXRUaW1lKCkgKyBvcHQuZGVsYXkpO1xuXHR9XG5cdHRoaXMuZW5kID0gb3B0LmVuZCBpbnN0YW5jZW9mIERhdGUgPyBvcHQuZW5kIDogbmV3IERhdGUodGhpcy5zdGFydC5nZXRUaW1lKCkgKyBvcHQuZHVyYXRpb24pO1xuXHR0aGlzLmR1cmF0aW9uID0gdGhpcy5lbmQgLSB0aGlzLnN0YXJ0O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGVhc2luZzogJ2xpbmVhcicsXG5cdHN0YXJ0OiBudWxsLFxuXHRlbmQ6IG51bGwsXG5cdGRlbGF5OiAwLCAvLyBtaWxsaXNlY29uZHNcblx0ZHVyYXRpb246IDEwMDAsIC8vIG1pbGxpc2Vjb25kc1xuXHRpdGVyYXRlOiAxIC8vIGludGVnZXIgb3IgJ2luZmluaXRlJ1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlID0ge1xuXHRiYWNrd2FyZDogZmFsc2UsXG5cdHBhdXNlZEF0OiBudWxsLFxuXHRnZXRQcm9ncmVzczogZnVuY3Rpb24gKG5vdykge1xuXHRcdHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50KG5vdyk7XG5cblx0XHRpZiAodGhpcy5iYWNrd2FyZCkge1xuXHRcdFx0Y3VycmVudCA9IDEgLSBjdXJyZW50O1xuXHRcdH1cblxuXHRcdHJldHVybiBjdXJyZW50ID09PSAwIHx8IGN1cnJlbnQgPT09IDEgPyBjdXJyZW50IDogdGhpcy5lYXNpbmcoY3VycmVudCk7XG5cdH0sXG5cdGdldEN1cnJlbnQ6IGZ1bmN0aW9uIChub3cpIHtcblx0XHRub3cgPSBub3cgPyBub3cgOiBuZXcgRGF0ZSgpO1xuXG5cdFx0aWYgKG5vdyA8IHRoaXMuc3RhcnQpIHtcblx0XHRcdHJldHVybiAwO1xuXHRcdH0gZWxzZSBpZiAobm93ID4gdGhpcy5lbmQpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5wYXVzZWRBdCAhPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucGF1c2VkQXQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAobm93IC0gdGhpcy5zdGFydCkgLyB0aGlzLmR1cmF0aW9uO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRPRE9zXG5cdCAqL1xuXHRwYXVzZTogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMucGF1c2VkQXQgPSB0aGlzLmdldEN1cnJlbnQoKTtcblx0fSxcblx0cmV2ZXJzZTogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBjdXJyZW50ID0gdGhpcy5nZXRDdXJyZW50KCk7XG5cblx0XHR0aGlzLnN0YXJ0ID0gbmV3IERhdGUodGhpcy5lbmQgLSAoY3VycmVudCAqIHRoaXMuZHVyYXRpb24pKTtcblx0XHR0aGlzLmJhY2t3YXJkID0gdGhpcy5iYWNrd2FyZCA/IGZhbHNlIDogdHJ1ZTtcblx0fSxcblx0cGxheTogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhcnQgPSB0aGlzLmVuZCAtICgoMSAtIHRoaXMucGF1c2VkQXQpICogdGhpcy5kdXJhdGlvbik7XG5cdFx0dGhpcy5wYXVzZWRBdCA9IG51bGw7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuLypcbiAqIEVhc2luZyBGdW5jdGlvbnMgLSBpbnNwaXJlZCBmcm9tIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuICogb25seSBjb25zaWRlcmluZyB0aGUgdCB2YWx1ZSBmb3IgdGhlIHJhbmdlIFswLCAxXSA9PiBbMCwgMV1cbiAqIHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqKDItdCk7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuICgtLXQpKnQqdCsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gNCp0KnQqdCA6ICh0LTEpKigyKnQtMikqKDIqdC0yKSsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDgqdCp0KnQqdCA6IDEtOCooLS10KSp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uIFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQ7IH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bGlzdGVuZXJzOiBbXSxcblx0c3RhdHVzOiAwLFxuXHRfZnJhbWU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5zdGF0dXMpIHtcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9mcmFtZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBTdGFydCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RhcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDE7XG5cblx0XHRpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdFx0dGhpcy5fZnJhbWUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faW50dmwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5fZnJhbWUuYmluZCh0aGlzKSwgMTYpOyAvLyA2MGZwc1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU3RvcCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMDtcblxuXHRcdGlmICh0aGlzLl9pbnR2bCkge1xuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5faW50dmwpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRyaWdnZXIgYWxsIGxpc3RlbmVyc1xuXHQgKi9cblx0ZXhlY3V0ZTogZnVuY3Rpb24gKCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGlzdGVuZXJzW2ldKCk7XG5cdFx0fVxuXHR9LFxuXHRhZGQ6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnN0YXJ0KCk7XG5cdFx0fVxuXHRcdHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMubGlzdGVuZXJzLCBsaXN0ZW5lcik7XG5cblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdG9wKCk7XG5cdFx0fVxuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBmb3IodmFyIGk9MTsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspXG5cdCAgICAgICAgZm9yKHZhciBrZXkgaW4gYXJndW1lbnRzW2ldKVxuXHQgICAgICAgICAgICBpZihhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcblx0ICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG5cdCAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuXHR9LFxuXHRleHRyYWN0OiBmdW5jdGlvbiAob2JqLCBwcm9wZXJ0aWVzKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKG9ialtwcm9wZXJ0aWVzW2ldXSkge1xuXHRcdFx0XHRyZXN1bHRbcHJvcGVydGllc1tpXV0gPSBvYmpbcHJvcGVydGllc1tpXV07XHRcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoYXJyYXksIGVsKSB7XG5cdFx0cmV0dXJuIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKGVsKSwgMSk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuLy4uL2NvcmUvVGltZWxpbmUuanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbTtcblxuLyoqXG4gKiBUT0RPOiBtdWx0aXBsZSB0aW1lbGluZXNcbiAqL1xuZnVuY3Rpb24gQW5pbSAob3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXHRpZiAodGhpcy5vcHQuc3RhcnQpIHtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH1cbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXHRmaWxsTW9kZTogJ2JvdGgnLFxuXHR0aW1lOiB7fSxcblx0c3RhcnQ6IHRydWUsXG5cdGRyYXc6IGZ1bmN0aW9uICgpIHt9XG59O1xuXG5BbmltLnByb3RvdHlwZSA9IHtcblx0c3RhcnRlZDogZmFsc2UsXG5cdHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy50aW1lID0gbmV3IFRpbWVsaW5lKHRoaXMub3B0LnRpbWUpO1xuXHRcdHRoaXMuZHJhdyA9IHRoaXMub3B0LmRyYXc7XG5cdFx0dGhpcy5zdGFydGVkID0gdHJ1ZTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoY2FudmFzKSB7XG5cdFx0dGhpcy5wcm9ncmVzcyA9IHRoaXMudGltZS5nZXRQcm9ncmVzcygpO1xuXG5cdFx0aWYgKHRoaXMuaXNGaWxsKHRoaXMucHJvZ3Jlc3MpKSB7XG5cdFx0XHR0aGlzLmRyYXcoY2FudmFzLCB0aGlzLnByb2dyZXNzKTtcblx0XHR9XG5cdH0sXG5cdGlzRmlsbDogZnVuY3Rpb24gKHByb2dyZXNzKSB7XG5cdFx0dmFyIGZpbGxNb2RlID0gdGhpcy5vcHQuZmlsbE1vZGU7XG5cblx0XHRpZiAoZmlsbE1vZGUgPT09ICdub25lJyAmJiAocHJvZ3Jlc3MgPT09IDAgfHwgcHJvZ3Jlc3MgPT09IDEpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2ZvcndhcmQnICYmIHByb2dyZXNzID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2JhY2t3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRkZXRhY2g6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5femVvdHJvcGUpIHtcblx0XHRcdHRoaXMuX3plb3Ryb3BlLmRldGFjaCh0aGlzKTtcblx0XHR9XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGltZW5zaW9uO1xuXG5mdW5jdGlvbiBEaW1lbnNpb24gKG9wdCwgYmFzZVNpemUsIHBhcmVudCkge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuICAgIHRoaXMuYmFzZVNpemUgPSBiYXNlU2l6ZTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZSgpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gICAgcG9zaXRpb246IG51bGwsXG4gICAgc2l6ZTogbnVsbCxcbiAgICBvcmlnaW46IDBcbn07XG5cbi8vIGNvbnN0IG1ldGhvZHNcbmhlbHBlcnMuZXh0ZW5kKERpbWVuc2lvbiwge1xuICAgIHBhcnNlUHJvcFN0cjogcGFyc2VQcm9wU3RyLFxuICAgIHBlcmNlbnRUb1B4OiBwZXJjZW50VG9QeCxcbiAgICBjZW50ZXJBdDogY2VudGVyQXQsXG4gICAgZmlsbFdpdGhBc3BlY3RSYXRpbzogZmlsbFdpdGhBc3BlY3RSYXRpbyxcbiAgICBmdWxsU2NhbGU6IGZ1bGxTY2FsZVxufSk7XG5cblxuRGltZW5zaW9uLnByb3RvdHlwZSA9IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0LnNpemUpIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gdGhpcy5nZXRTaXplKCk7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gc2l6ZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHQucG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0aGlzLmdldFBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnggPSBwb3MueDtcbiAgICAgICAgICAgIHRoaXMueSA9IHBvcy55O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBnZXRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzaXplO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdC5zaXplID09PSAnYXV0bycgfHwgdGhpcy5vcHQuc2l6ZSA9PT0gJ2F1dG8gYXV0bycpIHtcbiAgICAgICAgICAgIHNpemUgPSBoZWxwZXJzLmV4dHJhY3QodGhpcy5iYXNlU2l6ZSwgWyd3aWR0aCcsICdoZWlnaHQnXSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHQuc2l6ZSA9PT0gJ2NvdmVyJyB8fCB0aGlzLm9wdC5zaXplID09PSAnY29udGFpbicpIHtcbiAgICAgICAgICAgIHNpemUgPSBmdWxsU2NhbGUodGhpcy5vcHQuc2l6ZSwgdGhpcy5iYXNlU2l6ZSwgdGhpcy5wYXJlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHNjYWxlID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0LnNpemUpO1xuICAgICAgICAgICAgc2l6ZSA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogcGVyY2VudFRvUHgoc2NhbGVbMF0sIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQud2lkdGggOiB1bmRlZmluZWQpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogcGVyY2VudFRvUHgoc2NhbGVbMV0sIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQuaGVpZ2h0IDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuYmFzZVNpemUpIHtcbiAgICAgICAgICAgICAgICBzaXplID0gZmlsbFdpdGhBc3BlY3RSYXRpbyh0aGlzLmJhc2VTaXplLCBzaXplKTsgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvbmx5IG91dHB1dCBudW1iZXJcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBOdW1iZXIoc2l6ZS53aWR0aCksXG4gICAgICAgICAgICBoZWlnaHQ6IE51bWJlcihzaXplLmhlaWdodClcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIGdldFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwb3MgPSBwYXJzZVByb3BTdHIodGhpcy5vcHQucG9zaXRpb24pLFxuICAgICAgICAgICAgcHQgPSB7XG4gICAgICAgICAgICAgICAgeDogcGVyY2VudFRvUHgocG9zWzBdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LndpZHRoIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICB5OiBwZXJjZW50VG9QeChwb3NbMV0sIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQuaGVpZ2h0IDogdW5kZWZpbmVkKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBhZGp1c3QgZm9yIG9yaWdpblxuICAgICAgICBpZiAodGhpcy5vcHQub3JpZ2luKSB7XG4gICAgICAgICAgICB2YXIgb3JpZ2luID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0Lm9yaWdpbik7XG4gICAgICAgICAgICBwdCA9IGNlbnRlckF0KHB0LCB7eDogb3JpZ2luWzBdLCB5OiBvcmlnaW5bMV19LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBOdW1iZXIocHQueCksXG4gICAgICAgICAgICB5OiBOdW1iZXIocHQueSlcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRldGFjaCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmZ1bmN0aW9uIHBhcnNlUHJvcFN0ciAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoJ2NlbnRlcicsICc1MCUnKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvdG9wfGxlZnQvZywgJzAnKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvYm90dG9tfHJpZ2h0L2csICcxMDAlJyk7XG4gICAgdmFyIHZhbCA9IHN0ci5zcGxpdCgnICcpO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgdmFsWzBdLFxuICAgICAgICB2YWwubGVuZ3RoID09PSAxID8gdmFsWzBdIDogdmFsWzFdIC8vIHJlcGVhdCB2YWx1ZSBmb3IgaGVpZ2h0IGlmIG9ubHkgd2lkdGggaXMgcHJvdmlkZWRcbiAgICBdO1xufVxuXG5mdW5jdGlvbiBwZXJjZW50VG9QeCAocGVyY2VudCwgcGFyZW50UHgpIHtcbiAgICByZXR1cm4gcGVyY2VudC5pbmRleE9mKCclJykgPT09IC0xID8gcGVyY2VudCA6IHBlcmNlbnQuc2xpY2UoMCwgLTEpIC8gMTAwICogcGFyZW50UHg7XG59XG5cbmZ1bmN0aW9uIGNlbnRlckF0IChwdCwgb3JpZ2luLCBkaW1lbikge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHB0LnggLSAoZGltZW4gPyBwZXJjZW50VG9QeChvcmlnaW4ueCwgZGltZW4ud2lkdGgpIDogb3JpZ2luLngpLFxuICAgICAgICB5OiBwdC55IC0gKGRpbWVuID8gcGVyY2VudFRvUHgob3JpZ2luLnksIGRpbWVuLmhlaWdodCkgOiBvcmlnaW4ueSlcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBmaWxsV2l0aEFzcGVjdFJhdGlvIChvcmlnaW5hbCwgc2l6ZSkge1xuICAgIHZhciBhciA9IG9yaWdpbmFsLmhlaWdodCAvIG9yaWdpbmFsLndpZHRoO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGggPT09ICdhdXRvJyB8fCAhc2l6ZS53aWR0aCA/IHNpemUuaGVpZ2h0IC8gYXIgOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0ID09PSAnYXV0bycgfHwgIXNpemUuaGVpZ2h0ID8gc2l6ZS53aWR0aCAqIGFyIDogc2l6ZS5oZWlnaHRcbiAgICB9O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBiYWNrZ3JvdW5kIGltYWdlIHNpemUgZm9yICdjb250YWluJyBhbmQgJ2NvdmVyJ1xuICogQHBhcmFtICB7c3RyaW5nfSB0eXBlICAgIGNvbnRhaW4nIG9yICdjb3ZlcidcbiAqIEBwYXJhbSAge29iamVjdH0gY2hpbGRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyZW50IFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5mdW5jdGlvbiBmdWxsU2NhbGUgKHR5cGUsIGNoaWxkLCBwYXJlbnQpIHtcbiAgICB2YXIgY2hpbGRBUiA9IGNoaWxkLmhlaWdodCAvIGNoaWxkLndpZHRoLFxuICAgICAgICBwYXJlbnRBUiA9IHBhcmVudC5oZWlnaHQgLyBwYXJlbnQud2lkdGgsXG4gICAgICAgIHNhbWVIZWlnaHQgPSB0eXBlID09PSAnY292ZXInID8gcGFyZW50QVIgPiBjaGlsZEFSIDogcGFyZW50QVIgPCBjaGlsZEFSO1xuXG4gICAgaWYgKHNhbWVIZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBwYXJlbnQuaGVpZ2h0IC8gY2hpbGRBUixcbiAgICAgICAgICAgIGhlaWdodDogcGFyZW50LmhlaWdodFxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogcGFyZW50LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJlbnQud2lkdGggKiBjaGlsZEFSXG4gICAgICAgIH07XG4gICAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltZztcblxuZnVuY3Rpb24gSW1nIChzcmMsIG9wdCwgY2FudmFzKSB7XG4gICAgdGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG5cbiAgICAvLyBwcmVsb2FkXG4gICAgdGhpcy5lbCA9IG5ldyBJbWFnZSgpO1xuICAgIHRoaXMuZWwub25sb2FkID0gdGhpcy5fb25Mb2FkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5lbC5zcmMgPSBzcmM7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICAgIHNpemU6ICdjb3ZlcicsXG4gICAgcG9zaXRpb246ICdjZW50ZXInLFxuICAgIG9yaWdpbjogJzUwJSA1MCUnXG59O1xuXG5JbWcucHJvdG90eXBlID0ge1xuICAgIGRyYXc6IGZ1bmN0aW9uIChkaW1lbikge1xuICAgICAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGkgPSB0aGlzLmRpbWVuc2lvbjtcbiAgICAgICAgaWYgKGRpbWVuKSB7XG4gICAgICAgICAgICBkaSA9IGhlbHBlcnMuZXh0ZW5kKHt9LCB0aGlzLmRpbWVuc2lvbiwgZGltZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYW52YXMuY3R4LmRyYXdJbWFnZSh0aGlzLmVsLCBkaS54LCBkaS55LCBkaS53aWR0aCwgZGkuaGVpZ2h0KTtcbiAgICB9LFxuICAgIF9vbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbiA9IHRoaXMuY2FudmFzLmdldERpbWVuc2lvbih0aGlzLm9wdCwgdGhpcy5lbCk7XG4gICAgICAgIHRoaXMub25sb2FkKCk7XG4gICAgfSxcbiAgICBvbmxvYWQ6IGZ1bmN0aW9uICgpIHt9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENhbnZhcyA9IHJlcXVpcmUoJy4vY29yZS9DYW52YXMuanMnKSxcblx0ZnJhbWUgPSByZXF1aXJlKCcuL2NvcmUvZnJhbWUuanMnKSxcblx0QW5pbSA9IHJlcXVpcmUoJy4vcmVuZGVyL0FuaW0uanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vY29yZS9oZWxwZXJzLmpzJyksXG5cdEltZyA9IHJlcXVpcmUoJy4vcmVuZGVyL0ltZy5qcycpO1xuXG53aW5kb3cuWmVvdHJvcGUgPSBaZW90cm9wZTtcblxuZnVuY3Rpb24gWmVvdHJvcGUgKGVsLCBvcHQpIHtcblx0dGhpcy5vcHQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdCk7XG5cblx0dGhpcy5jYW52YXMgPSBuZXcgQ2FudmFzKGVsKTtcblx0dGhpcy5mcmFtZSA9IGZyYW1lLmFkZCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpKTtcblxuXHQvLyBjb2xsZWN0aW9uc1xuXHR0aGlzLmFuaW1zID0gW107XG5cdHRoaXMuaW1ncyA9IFtdO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdG9uQ29tcGxldGU6IGZ1bmN0aW9uICgpIHt9LFxuXHRyZW1vdmVPbkNvbXBsZXRlOiB0cnVlLFxuXHRvbmxvYWQ6IGZ1bmN0aW9uICgpIHt9LFxuXHRzdGFydE9uTG9hZDogdHJ1ZVxufTtcblxuWmVvdHJvcGUucHJvdG90eXBlID0ge1xuXHRhbmltOiBmdW5jdGlvbiAob3B0KSB7XG5cdFx0aWYgKHRoaXMub3B0LnN0YXJ0T25Mb2FkICYmIHRoaXMuaW1ncy5sZW5ndGgpIHtcblx0XHRcdG9wdC5zdGFydCA9IHR5cGVvZiBvcHQuc3RhcnQgPT09ICdib29sZWFuJyA/IG9wdC5zdGFydCA6IGZhbHNlO1xuXHRcdH1cblxuXHRcdHZhciBhbmltID0gbmV3IEFuaW0ob3B0KTtcblx0XHRhbmltLl96ZW90cm9wZSA9IHRoaXM7XG5cdFx0dGhpcy5hbmltcy5wdXNoKGFuaW0pO1xuXHRcdHJldHVybiBhbmltO1xuXHR9LFxuXHRkaW1lbnNpb246IGZ1bmN0aW9uIChvcHQsIGJhc2VTaXplKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2FudmFzLmdldERpbWVuc2lvbihvcHQsIGJhc2VTaXplKTtcblx0fSxcblx0aW1nOiBmdW5jdGlvbiAoc3JjLCBvcHQpIHtcblx0XHR2YXIgaW1nID0gbmV3IEltZyhzcmMsIG9wdCwgdGhpcy5jYW52YXMpO1xuXHRcdGltZy5vbmxvYWQgPSB0aGlzLl9vbmxvYWQuYmluZCh0aGlzKTtcblx0XHR0aGlzLmltZ3MucHVzaChpbWcpO1xuXHRcdHJldHVybiBpbWc7XG5cdH0sXG5cdF9vbmxvYWQ6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgbG9hZGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW1ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKCF0aGlzLmltZ3NbaV0ubG9hZGVkKSB7XG5cdFx0XHRcdGxvYWRlZCA9IGZhbHNlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobG9hZGVkKSB7XG5cdFx0XHR0aGlzLm9wdC5vbmxvYWQoKTtcblx0XHRcdGlmICh0aGlzLm9wdC5zdGFydE9uTG9hZCkge1xuXHRcdFx0XHR0aGlzLnN0YXJ0QW5pbXMoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHN0YXJ0QW5pbXM6IGZ1bmN0aW9uICgpIHtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYW5pbXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICghdGhpcy5hbmltc1tpXS5zdGFydGVkKSB7XG5cdFx0XHRcdHRoaXMuYW5pbXNbaV0uc3RhcnQoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGRldGFjaDogZnVuY3Rpb24gKGFuaW0pIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmFuaW1zLCBhbmltKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGNvbXBsZXRlZCA9IHRydWU7XG5cblx0XHR0aGlzLmNhbnZhcy5jbGVhcigpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKHRoaXMuYW5pbXNbaV0uc3RhcnRlZCkge1xuXHRcdFx0XHR0aGlzLmFuaW1zW2ldLnJlbmRlcih0aGlzLmNhbnZhcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVE9ETzogV2hhdCBpZiBpdCBoYXMgaXRlcmF0aW9uP1xuXHRcdFx0ICovXG5cdFx0XHRpZiAodGhpcy5hbmltc1tpXS5wcm9ncmVzcyAhPT0gMSkge1xuXHRcdFx0XHRjb21wbGV0ZWQgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoY29tcGxldGVkKSB7XG5cdFx0XHR0aGlzLm9wdC5vbkNvbXBsZXRlLmFwcGx5KHRoaXMpO1xuXHRcdFx0aWYgKHRoaXMub3B0LnJlbW92ZU9uQ29tcGxldGUpIHtcblx0XHRcdFx0dGhpcy5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24gKHJlbW92ZUVsKSB7XG5cdFx0ZnJhbWUucmVtb3ZlKHRoaXMuZnJhbWUpO1xuXHRcdHRoaXMuY2FudmFzLmNsZWFyKCk7XG5cdFx0dGhpcy5jYW52YXMucmVtb3ZlKHJlbW92ZUVsKTtcblx0fVxufTsiXX0=
