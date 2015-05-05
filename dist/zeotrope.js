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
	this.time = new Timeline(opt.time);
	this.draw = this.opt.draw;
}

var defaults = {
	fillMode: 'both',
	time: {},
	draw: function () {}
};

Anim.prototype = {
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
}

var defaults = {
	onComplete: function () {}
};

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
		var completed = true;

		this.canvas.clear();
		for (var i = 0; i < this.anims.length; i++) {
			this.anims[i].render(this.canvas);
			if (this.anims[i].progress !== 1) {
				completed = false;
			}
		}

		if (this.opt.onComplete) {
			this.opt.onComplete.apply(this);
		}
	},
	remove: function (removeEl) {
		frame.remove(this.frame);
		this.canvas.remove(removeEl);
	}
};
},{"./core/Canvas.js":1,"./core/frame.js":4,"./core/helpers.js":5,"./render/Anim.js":6,"./render/Img.js":8}]},{},[1,2,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3plb3Ryb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKSxcbiAgICBEaW1lbnNpb24gPSByZXF1aXJlKCcuLy4uL3JlbmRlci9EaW1lbnNpb24uanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXM7XG5cbmZ1bmN0aW9uIENhbnZhcyAoZWwpIHtcbiAgICB0aGlzLmVsID0gZWw7XG4gICAgdGhpcy5jdHggPSB0aGlzLmVsLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBvblJlc2l6ZSBldmVudFxuICAgIHRoaXMuX3Jlc2l6ZUhhbmRsZXIgPSB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKHRoaXMuX3Jlc2l6ZUhhbmRsZXIpO1xuICAgIHRoaXMuX29uUmVzaXplKCk7XG59XG5cbkNhbnZhcy5wcm90b3R5cGUgPSB7XG4gICAgZGltZW5zaW9uczogW10sXG4gICAgX29uUmVzaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3ID0gdGhpcy5lbC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGggPSB0aGlzLmVsLm9mZnNldEhlaWdodDtcblxuICAgICAgICBpZiAodyAhPT0gdGhpcy53aWR0aCAmJiBoICE9PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHc7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgICAgIC8vIHVwZGF0ZSBhbGwgZGltZW5zaW9uXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGltZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGltZW5zaW9uc1tpXS51cGRhdGUoKTtcbiAgICAgICAgICAgIH0gICAgICAgICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RGltZW5zaW9uOiBmdW5jdGlvbiAob3B0LCBiYXNlU2l6ZSkge1xuICAgICAgICB2YXIgZGltZW4gPSBuZXcgRGltZW5zaW9uKG9wdCwgYmFzZVNpemUsIHRoaXMpO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMucHVzaChkaW1lbik7XG4gICAgICAgIHJldHVybiBkaW1lbjtcbiAgICB9LFxuICAgIGRldGFjaDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgY29sbGVjdGlvbjtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGltZW5zaW9uKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uID0gdGhpcy5kaW1lbnNpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVscGVycy5yZW1vdmUoY29sbGVjdGlvbiwgb2JqKTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIChyZW1vdmVFbCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICAgICAgaWYgKHJlbW92ZUVsKSB7XG4gICAgICAgICAgICB0aGlzLmVsLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbCk7XG4gICAgICAgIH1cbiAgICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMuanMnKTtcbnZhciBlYXNpbmdzID0gcmVxdWlyZSgnLi9lYXNpbmdzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7XG5cbmZ1bmN0aW9uIFRpbWVsaW5lIChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0Ly8gaW5pdGlhbGl6ZVxuXHR0aGlzLmVhc2luZyA9IGVhc2luZ3Nbb3B0LmVhc2luZ107XG5cdHRoaXMuc3RhcnQgPSBvcHQuc3RhcnQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LnN0YXJ0IDogbmV3IERhdGUoKTtcblx0dGhpcy5lbmQgPSBvcHQuZW5kIGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5lbmQgOiBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSArIG9wdC5kdXJhdGlvbik7XG5cdHRoaXMuZHVyYXRpb24gPSB0aGlzLmVuZCAtIHRoaXMuc3RhcnQ7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0ZWFzaW5nOiAnbGluZWFyJyxcblx0c3RhcnQ6IG51bGwsXG5cdGVuZDogbnVsbCxcblx0ZHVyYXRpb246IDEwMDAsIC8vIG1pbGxpc2Vjb25kc1xuXHRpdGVyYXRlOiAxIC8vIGludGVnZXIgb3IgJ2luZmluaXRlJ1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlID0ge1xuXHRnZXRQcm9ncmVzczogZnVuY3Rpb24gKGRhdGVUaW1lKSB7XG5cdFx0dmFyIG5vdyA9IGRhdGVUaW1lIHx8IG5ldyBEYXRlKCk7XG5cblx0XHRpZiAobm93IDwgdGhpcy5zdGFydCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIGlmIChub3cgPiB0aGlzLmVuZCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmVhc2luZyggKG5vdyAtIHRoaXMuc3RhcnQpIC8gdGhpcy5kdXJhdGlvbiApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRPRE9zXG5cdCAqL1xuXHRyZXZlcnNlOiBmdW5jdGlvbiAoKSB7fSxcblx0cGF1c2U6IGZ1bmN0aW9uICgpIHt9LFxuXHRwbGF5OiBmdW5jdGlvbiAoKSB7fSxcblx0Z29UbzogZnVuY3Rpb24gKCkge31cbn07IiwiJ3VzZSBzdHJpY3QnO1xuLypcbiAqIEVhc2luZyBGdW5jdGlvbnMgLSBpbnNwaXJlZCBmcm9tIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuICogb25seSBjb25zaWRlcmluZyB0aGUgdCB2YWx1ZSBmb3IgdGhlIHJhbmdlIFswLCAxXSA9PiBbMCwgMV1cbiAqIHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqKDItdCk7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuICgtLXQpKnQqdCsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gNCp0KnQqdCA6ICh0LTEpKigyKnQtMikqKDIqdC0yKSsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDgqdCp0KnQqdCA6IDEtOCooLS10KSp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uIFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQ7IH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bGlzdGVuZXJzOiBbXSxcblx0c3RhdHVzOiAwLFxuXHRfZnJhbWU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5zdGF0dXMpIHtcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9mcmFtZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBTdGFydCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RhcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDE7XG5cblx0XHRpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdFx0dGhpcy5fZnJhbWUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faW50dmwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5fZnJhbWUuYmluZCh0aGlzKSwgMTYpOyAvLyA2MGZwc1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU3RvcCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMDtcblxuXHRcdGlmICh0aGlzLl9pbnR2bCkge1xuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5faW50dmwpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRyaWdnZXIgYWxsIGxpc3RlbmVyc1xuXHQgKi9cblx0ZXhlY3V0ZTogZnVuY3Rpb24gKCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGlzdGVuZXJzW2ldKCk7XG5cdFx0fVxuXHR9LFxuXHRhZGQ6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnN0YXJ0KCk7XG5cdFx0fVxuXHRcdHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMubGlzdGVuZXJzLCBsaXN0ZW5lcik7XG5cblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdG9wKCk7XG5cdFx0fVxuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBmb3IodmFyIGk9MTsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspXG5cdCAgICAgICAgZm9yKHZhciBrZXkgaW4gYXJndW1lbnRzW2ldKVxuXHQgICAgICAgICAgICBpZihhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcblx0ICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG5cdCAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuXHR9LFxuXHRleHRyYWN0OiBmdW5jdGlvbiAob2JqLCBwcm9wZXJ0aWVzKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKG9ialtwcm9wZXJ0aWVzW2ldXSkge1xuXHRcdFx0XHRyZXN1bHRbcHJvcGVydGllc1tpXV0gPSBvYmpbcHJvcGVydGllc1tpXV07XHRcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoYXJyYXksIGVsKSB7XG5cdFx0cmV0dXJuIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKGVsKSwgMSk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuLy4uL2NvcmUvVGltZWxpbmUuanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbTtcblxuLyoqXG4gKiBUT0RPOiBtdWx0aXBsZSB0aW1lbGluZXNcbiAqL1xuZnVuY3Rpb24gQW5pbSAob3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXHR0aGlzLnRpbWUgPSBuZXcgVGltZWxpbmUob3B0LnRpbWUpO1xuXHR0aGlzLmRyYXcgPSB0aGlzLm9wdC5kcmF3O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGZpbGxNb2RlOiAnYm90aCcsXG5cdHRpbWU6IHt9LFxuXHRkcmF3OiBmdW5jdGlvbiAoKSB7fVxufTtcblxuQW5pbS5wcm90b3R5cGUgPSB7XG5cdHJlbmRlcjogZnVuY3Rpb24gKGNhbnZhcykge1xuXHRcdHRoaXMucHJvZ3Jlc3MgPSB0aGlzLnRpbWUuZ2V0UHJvZ3Jlc3MoKTtcblxuXHRcdGlmICh0aGlzLmlzRmlsbCh0aGlzLnByb2dyZXNzKSkge1xuXHRcdFx0dGhpcy5kcmF3KGNhbnZhcywgdGhpcy5wcm9ncmVzcyk7XG5cdFx0fVxuXHR9LFxuXHRpc0ZpbGw6IGZ1bmN0aW9uIChwcm9ncmVzcykge1xuXHRcdHZhciBmaWxsTW9kZSA9IHRoaXMub3B0LmZpbGxNb2RlO1xuXG5cdFx0aWYgKGZpbGxNb2RlID09PSAnbm9uZScgJiYgKHByb2dyZXNzID09PSAwIHx8IHByb2dyZXNzID09PSAxKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdmb3J3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoZmlsbE1vZGUgPT09ICdiYWNrd2FyZCcgJiYgcHJvZ3Jlc3MgPT09IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0ZGV0YWNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX3plb3Ryb3BlKSB7XG5cdFx0XHR0aGlzLl96ZW90cm9wZS5kZXRhY2godGhpcyk7XG5cdFx0fVxuXHR9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpbWVuc2lvbjtcblxuZnVuY3Rpb24gRGltZW5zaW9uIChvcHQsIGJhc2VTaXplLCBwYXJlbnQpIHtcbiAgICB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0KTtcbiAgICB0aGlzLmJhc2VTaXplID0gYmFzZVNpemU7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICB9XG4gICAgdGhpcy51cGRhdGUoKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICAgIHBvc2l0aW9uOiBudWxsLFxuICAgIHNpemU6IG51bGwsXG4gICAgb3JpZ2luOiAwXG59O1xuXG4vLyBjb25zdCBtZXRob2RzXG5oZWxwZXJzLmV4dGVuZChEaW1lbnNpb24sIHtcbiAgICBwYXJzZVByb3BTdHI6IHBhcnNlUHJvcFN0cixcbiAgICBwZXJjZW50VG9QeDogcGVyY2VudFRvUHgsXG4gICAgY2VudGVyQXQ6IGNlbnRlckF0LFxuICAgIGZpbGxXaXRoQXNwZWN0UmF0aW86IGZpbGxXaXRoQXNwZWN0UmF0aW8sXG4gICAgZnVsbFNjYWxlOiBmdWxsU2NhbGVcbn0pO1xuXG5cbkRpbWVuc2lvbi5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdC5zaXplKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHNpemUud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IHNpemUuaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0LnBvc2l0aW9uKSB7XG4gICAgICAgICAgICB2YXIgcG9zID0gdGhpcy5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy54ID0gcG9zLng7XG4gICAgICAgICAgICB0aGlzLnkgPSBwb3MueTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0U2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2l6ZTtcblxuICAgICAgICBpZiAodGhpcy5vcHQuc2l6ZSA9PT0gJ2F1dG8nIHx8IHRoaXMub3B0LnNpemUgPT09ICdhdXRvIGF1dG8nKSB7XG4gICAgICAgICAgICBzaXplID0gaGVscGVycy5leHRyYWN0KHRoaXMuYmFzZVNpemUsIFsnd2lkdGgnLCAnaGVpZ2h0J10pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0LnNpemUgPT09ICdjb3ZlcicgfHwgdGhpcy5vcHQuc2l6ZSA9PT0gJ2NvbnRhaW4nKSB7XG4gICAgICAgICAgICBzaXplID0gZnVsbFNjYWxlKHRoaXMub3B0LnNpemUsIHRoaXMuYmFzZVNpemUsIHRoaXMucGFyZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBzY2FsZSA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5zaXplKTtcbiAgICAgICAgICAgIHNpemUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHBlcmNlbnRUb1B4KHNjYWxlWzBdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LndpZHRoIDogdW5kZWZpbmVkKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHBlcmNlbnRUb1B4KHNjYWxlWzFdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmhlaWdodCA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmJhc2VTaXplKSB7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IGZpbGxXaXRoQXNwZWN0UmF0aW8odGhpcy5iYXNlU2l6ZSwgc2l6ZSk7ICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gb25seSBvdXRwdXQgbnVtYmVyXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogTnVtYmVyKHNpemUud2lkdGgpLFxuICAgICAgICAgICAgaGVpZ2h0OiBOdW1iZXIoc2l6ZS5oZWlnaHQpXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBnZXRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcG9zID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0LnBvc2l0aW9uKSxcbiAgICAgICAgICAgIHB0ID0ge1xuICAgICAgICAgICAgICAgIHg6IHBlcmNlbnRUb1B4KHBvc1swXSwgdGhpcy5wYXJlbnQgPyB0aGlzLnBhcmVudC53aWR0aCA6IHVuZGVmaW5lZCksXG4gICAgICAgICAgICAgICAgeTogcGVyY2VudFRvUHgocG9zWzFdLCB0aGlzLnBhcmVudCA/IHRoaXMucGFyZW50LmhlaWdodCA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gYWRqdXN0IGZvciBvcmlnaW5cbiAgICAgICAgaWYgKHRoaXMub3B0Lm9yaWdpbikge1xuICAgICAgICAgICAgdmFyIG9yaWdpbiA9IHBhcnNlUHJvcFN0cih0aGlzLm9wdC5vcmlnaW4pO1xuICAgICAgICAgICAgcHQgPSBjZW50ZXJBdChwdCwge3g6IG9yaWdpblswXSwgeTogb3JpZ2luWzFdfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogTnVtYmVyKHB0LngpLFxuICAgICAgICAgICAgeTogTnVtYmVyKHB0LnkpXG4gICAgICAgIH07XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kZXRhY2godGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBwYXJzZVByb3BTdHIgKHN0cikge1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKCdjZW50ZXInLCAnNTAlJyk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL3RvcHxsZWZ0L2csICcwJyk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL2JvdHRvbXxyaWdodC9nLCAnMTAwJScpO1xuICAgIHZhciB2YWwgPSBzdHIuc3BsaXQoJyAnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIHZhbFswXSxcbiAgICAgICAgdmFsLmxlbmd0aCA9PT0gMSA/IHZhbFswXSA6IHZhbFsxXSAvLyByZXBlYXQgdmFsdWUgZm9yIGhlaWdodCBpZiBvbmx5IHdpZHRoIGlzIHByb3ZpZGVkXG4gICAgXTtcbn1cblxuZnVuY3Rpb24gcGVyY2VudFRvUHggKHBlcmNlbnQsIHBhcmVudFB4KSB7XG4gICAgcmV0dXJuIHBlcmNlbnQuaW5kZXhPZignJScpID09PSAtMSA/IHBlcmNlbnQgOiBwZXJjZW50LnNsaWNlKDAsIC0xKSAvIDEwMCAqIHBhcmVudFB4O1xufVxuXG5mdW5jdGlvbiBjZW50ZXJBdCAocHQsIG9yaWdpbiwgZGltZW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBwdC54IC0gKGRpbWVuID8gcGVyY2VudFRvUHgob3JpZ2luLngsIGRpbWVuLndpZHRoKSA6IG9yaWdpbi54KSxcbiAgICAgICAgeTogcHQueSAtIChkaW1lbiA/IHBlcmNlbnRUb1B4KG9yaWdpbi55LCBkaW1lbi5oZWlnaHQpIDogb3JpZ2luLnkpXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZmlsbFdpdGhBc3BlY3RSYXRpbyAob3JpZ2luYWwsIHNpemUpIHtcbiAgICB2YXIgYXIgPSBvcmlnaW5hbC5oZWlnaHQgLyBvcmlnaW5hbC53aWR0aDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoID09PSAnYXV0bycgfHwgIXNpemUud2lkdGggPyBzaXplLmhlaWdodCAvIGFyIDogc2l6ZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCA9PT0gJ2F1dG8nIHx8ICFzaXplLmhlaWdodCA/IHNpemUud2lkdGggKiBhciA6IHNpemUuaGVpZ2h0XG4gICAgfTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGUgYmFja2dyb3VuZCBpbWFnZSBzaXplIGZvciAnY29udGFpbicgYW5kICdjb3ZlcidcbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSAgICBjb250YWluJyBvciAnY292ZXInXG4gKiBAcGFyYW0gIHtvYmplY3R9IGNoaWxkXG4gKiBAcGFyYW0gIHtvYmplY3R9IHBhcmVudCBcbiAqIEByZXR1cm4ge29iamVjdH1cbiAqL1xuZnVuY3Rpb24gZnVsbFNjYWxlICh0eXBlLCBjaGlsZCwgcGFyZW50KSB7XG4gICAgdmFyIGNoaWxkQVIgPSBjaGlsZC5oZWlnaHQgLyBjaGlsZC53aWR0aCxcbiAgICAgICAgcGFyZW50QVIgPSBwYXJlbnQuaGVpZ2h0IC8gcGFyZW50LndpZHRoLFxuICAgICAgICBzYW1lSGVpZ2h0ID0gdHlwZSA9PT0gJ2NvdmVyJyA/IHBhcmVudEFSID4gY2hpbGRBUiA6IHBhcmVudEFSIDwgY2hpbGRBUjtcblxuICAgIGlmIChzYW1lSGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogcGFyZW50LmhlaWdodCAvIGNoaWxkQVIsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogcGFyZW50LndpZHRoICogY2hpbGRBUlxuICAgICAgICB9O1xuICAgIH1cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbWc7XG5cbmZ1bmN0aW9uIEltZyAoc3JjLCBvcHQsIGNhbnZhcykge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXG4gICAgLy8gcHJlbG9hZFxuICAgIHRoaXMuZWwgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmVsLm9ubG9hZCA9IHRoaXMuX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWwuc3JjID0gc3JjO1xuXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBzaXplOiAnY292ZXInLFxuICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICBvcmlnaW46ICc1MCUgNTAlJ1xufTtcblxuSW1nLnByb3RvdHlwZSA9IHtcbiAgICBkcmF3OiBmdW5jdGlvbiAoZGltZW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRpID0gdGhpcy5kaW1lbnNpb247XG4gICAgICAgIGlmIChkaW1lbikge1xuICAgICAgICAgICAgZGkgPSBoZWxwZXJzLmV4dGVuZCh7fSwgdGhpcy5kaW1lbnNpb24sIGRpbWVuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmN0eC5kcmF3SW1hZ2UodGhpcy5lbCwgZGkueCwgZGkueSwgZGkud2lkdGgsIGRpLmhlaWdodCk7XG4gICAgfSxcbiAgICBfb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kaW1lbnNpb24gPSB0aGlzLmNhbnZhcy5nZXREaW1lbnNpb24odGhpcy5vcHQsIHRoaXMuZWwpO1xuICAgICAgICB0aGlzLm9ubG9hZCgpO1xuICAgIH0sXG4gICAgb25sb2FkOiBmdW5jdGlvbiAoKSB7fVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW52YXMgPSByZXF1aXJlKCcuL2NvcmUvQ2FudmFzLmpzJyksXG5cdGZyYW1lID0gcmVxdWlyZSgnLi9jb3JlL2ZyYW1lLmpzJyksXG5cdEFuaW0gPSByZXF1aXJlKCcuL3JlbmRlci9BbmltLmpzJyksXG5cdGhlbHBlcnMgPSByZXF1aXJlKCcuL2NvcmUvaGVscGVycy5qcycpLFxuXHRJbWcgPSByZXF1aXJlKCcuL3JlbmRlci9JbWcuanMnKTtcblxud2luZG93Llplb3Ryb3BlID0gWmVvdHJvcGU7XG5cbmZ1bmN0aW9uIFplb3Ryb3BlIChlbCwgb3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXG5cdHRoaXMuY2FudmFzID0gbmV3IENhbnZhcyhlbCk7XG5cdHRoaXMuZnJhbWUgPSBmcmFtZS5hZGQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0b25Db21wbGV0ZTogZnVuY3Rpb24gKCkge31cbn07XG5cblplb3Ryb3BlLnByb3RvdHlwZSA9IHtcblx0YW5pbXM6IFtdLFxuXHRhbmltOiBmdW5jdGlvbiAob3B0KSB7XG5cdFx0dmFyIGFuaW0gPSBuZXcgQW5pbShvcHQpO1xuXHRcdGFuaW0uX3plb3Ryb3BlID0gdGhpcztcblx0XHR0aGlzLmFuaW1zLnB1c2goYW5pbSk7XG5cdFx0cmV0dXJuIGFuaW07XG5cdH0sXG5cdGRpbWVuc2lvbjogZnVuY3Rpb24gKG9wdCwgYmFzZVNpemUpIHtcblx0XHRyZXR1cm4gdGhpcy5jYW52YXMuZ2V0RGltZW5zaW9uKG9wdCwgYmFzZVNpemUpO1xuXHR9LFxuXHRpbWc6IGZ1bmN0aW9uIChzcmMsIG9wdCkge1xuXHRcdHJldHVybiBuZXcgSW1nKHNyYywgb3B0LCB0aGlzLmNhbnZhcyk7XG5cdH0sXG5cdGRldGFjaDogZnVuY3Rpb24gKGFuaW0pIHtcblx0XHRoZWxwZXJzLnJlbW92ZSh0aGlzLmFuaW1zLCBhbmltKTtcblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGNvbXBsZXRlZCA9IHRydWU7XG5cblx0XHR0aGlzLmNhbnZhcy5jbGVhcigpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5hbmltc1tpXS5yZW5kZXIodGhpcy5jYW52YXMpO1xuXHRcdFx0aWYgKHRoaXMuYW5pbXNbaV0ucHJvZ3Jlc3MgIT09IDEpIHtcblx0XHRcdFx0Y29tcGxldGVkID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMub3B0Lm9uQ29tcGxldGUpIHtcblx0XHRcdHRoaXMub3B0Lm9uQ29tcGxldGUuYXBwbHkodGhpcyk7XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChyZW1vdmVFbCkge1xuXHRcdGZyYW1lLnJlbW92ZSh0aGlzLmZyYW1lKTtcblx0XHR0aGlzLmNhbnZhcy5yZW1vdmUocmVtb3ZlRWwpO1xuXHR9XG59OyJdfQ==
