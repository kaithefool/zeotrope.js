/*!
 * zeotrope.js 1.0.0 <>
 * Contributor(s): Kai Lam <kai.chun.lam@gmail.com>
 * Last Build: 2015-04-28
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

            /**
             * TODO: skip non-percentage scales and positions
             */

            // update all dimension
            for (var i = 0; i < this.scales.length; i++) {
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

function Img (opt, canvas) {
    this.opt = helpers.extend({}, defaults, opt);

    // preload
    this.el = new Image();
    this.el.onload = this._onLoad.bind(this);
    this.el.src = this.opt.src;

    // canvas
    this.canvas = canvas;
}

var defaults = {
    src: '',
    size: 'auto', // see background-size css property,
    position: 'center' // background-position
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

        this.canvas.ctx.drawImage(this.position.x, this.position.y, this.scale.width, this.scale.height);
    },
    _onLoad: function () {
        this.loaded = true;
        
        // scale and position
        this.scale = this.canvas.getScale(this.opt.size, this.el);
        this.position = this.canvas.getPosition(this.opt.position);
    }
};
},{"./../core/helpers.js":5}],9:[function(require,module,exports){
'use strict';

module.exports = Position;

function Position (pos, parent, child) {
    this.pos = pos;
    if (parent) {
        this.parent = parent;
    }
    if (child) {
        this.child = child;
    }
}

Position.getPt = getPt;

Position.prototype = {
    update: function () {
        var pt = getPt(this.pos, this.parent, this.child);
        this.x = Math.round(pt.x);
        this.y = Math.round(pt.y);
    },
    remove: function () {
        if (this.parent) {
            this.parent.detach(this);
        }
    }
};

function getPt (pos, parent, child) {
    var pt = percentToPx( parsePtStr(pos) );
    if (child) {
        pt = centerAt(child, pt);
    }
    return pt;
}

function parsePtStr (str) {
    str = str.replace('center', '50%');
    var val = str.split(' ');

    return {
        width: val[0],
        height: val.length === 1 ? val[0] : val[1] // repeat value for height if only width is provided
    };
}

function percentToPx (pt, parent) {
    return {
        x: pt.x.indexOf('%') === -1 ? pt.x : pt.x.slice(0, -1)/100 * parent.width,
        y: pt.y.indexOf('%') === -1 ? pt.y : pt.y.slice(0, -1)/100 * parent.height
    };
}

function centerAt (dimen, pt) {
    return {
        x: pt.x - (dimen.width / 2),
        y: pt.y - (dimen.height / 2)
    };
}
},{}],10:[function(require,module,exports){
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
        height: val.length === 1 ? val[0] : val[1] // repeat value for height if only width is provided
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
},{"./../core/helpers.js":5}],11:[function(require,module,exports){
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
},{"./core/Canvas.js":1,"./core/frame.js":4,"./core/helpers.js":5,"./render/Anim.js":6}]},{},[1,2,3,4,5,6,7,8,9,10,11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29yZS9DYW52YXMuanMiLCJzcmMvY29yZS9UaW1lbGluZS5qcyIsInNyYy9jb3JlL2Vhc2luZ3MuanMiLCJzcmMvY29yZS9mcmFtZS5qcyIsInNyYy9jb3JlL2hlbHBlcnMuanMiLCJzcmMvcmVuZGVyL0FuaW0uanMiLCJzcmMvcmVuZGVyL0RpbWVuc2lvbi5qcyIsInNyYy9yZW5kZXIvSW1nLmpzIiwic3JjL3JlbmRlci9Qb3NpdGlvbi5qcyIsInNyYy9yZW5kZXIvU2NhbGUuanMiLCJzcmMvemVvdHJvcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyksXG4gICAgRGltZW5zaW9uID0gcmVxdWlyZSgnLi8uLi9yZW5kZXIvRGltZW5zaW9uLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzO1xuXG5mdW5jdGlvbiBDYW52YXMgKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuICAgIHRoaXMuY3R4ID0gdGhpcy5lbC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gb25SZXNpemUgZXZlbnRcbiAgICB0aGlzLl9yZXNpemVIYW5kbGVyID0gdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLl9yZXNpemVIYW5kbGVyKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xufVxuXG5DYW52YXMucHJvdG90eXBlID0ge1xuICAgIGRpbWVuc2lvbnM6IFtdLFxuICAgIF9vblJlc2l6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdyA9IHRoaXMuZWwub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoID0gdGhpcy5lbC5vZmZzZXRIZWlnaHQ7XG5cbiAgICAgICAgaWYgKHcgIT09IHRoaXMud2lkdGggJiYgaCAhPT0gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgICAgICAgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdGhpcy53aWR0aCk7XG4gICAgICAgICAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFRPRE86IHNraXAgbm9uLXBlcmNlbnRhZ2Ugc2NhbGVzIGFuZCBwb3NpdGlvbnNcbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICAvLyB1cGRhdGUgYWxsIGRpbWVuc2lvblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNjYWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGltZW5zaW9uc1tpXS51cGRhdGUoKTtcbiAgICAgICAgICAgIH0gICAgICAgICBcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RGltZW5zaW9uOiBmdW5jdGlvbiAob3B0LCBiYXNlU2l6ZSkge1xuICAgICAgICB2YXIgZGltZW4gPSBuZXcgRGltZW5zaW9uKG9wdCwgYmFzZVNpemUsIHRoaXMpO1xuICAgICAgICB0aGlzLmRpbWVuc2lvbnMucHVzaChkaW1lbik7XG4gICAgICAgIHJldHVybiBkaW1lbjtcbiAgICB9LFxuICAgIGRldGFjaDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgY29sbGVjdGlvbjtcblxuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRGltZW5zaW9uKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uID0gdGhpcy5kaW1lbnNpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVscGVycy5yZW1vdmUoY29sbGVjdGlvbiwgb2JqKTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5fcmVzaXplSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZWwucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsKTtcbiAgICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMuanMnKTtcbnZhciBlYXNpbmdzID0gcmVxdWlyZSgnLi9lYXNpbmdzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZWxpbmU7XG5cbmZ1bmN0aW9uIFRpbWVsaW5lIChvcHRpb25zKSB7XG5cdHZhciBvcHQgPSB0aGlzLm9wdCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0Ly8gaW5pdGlhbGl6ZVxuXHR0aGlzLmVhc2luZyA9IGVhc2luZ3Nbb3B0LmVhc2luZ107XG5cdHRoaXMuc3RhcnQgPSBvcHQuc3RhcnQgaW5zdGFuY2VvZiBEYXRlID8gb3B0LnN0YXJ0IDogbmV3IERhdGUoKTtcblx0dGhpcy5lbmQgPSBvcHQuZW5kIGluc3RhbmNlb2YgRGF0ZSA/IG9wdC5lbmQgOiBuZXcgRGF0ZSh0aGlzLnN0YXJ0LmdldFRpbWUoKSArIG9wdC5kdXJhdGlvbik7XG5cdHRoaXMuZHVyYXRpb24gPSB0aGlzLmVuZCAtIHRoaXMuc3RhcnQ7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblx0ZWFzaW5nOiAnbGluZWFyJyxcblx0c3RhcnQ6IG51bGwsXG5cdGVuZDogbnVsbCxcblx0ZHVyYXRpb246IDEwMDAsIC8vIG1pbGxpc2Vjb25kc1xuXHRpdGVyYXRlOiAxIC8vIGludGVnZXIgb3IgJ2luZmluaXRlJ1xufTtcblxuVGltZWxpbmUucHJvdG90eXBlID0ge1xuXHRnZXRQcm9ncmVzczogZnVuY3Rpb24gKGRhdGVUaW1lKSB7XG5cdFx0dmFyIG5vdyA9IGRhdGVUaW1lIHx8IG5ldyBEYXRlKCk7XG5cblx0XHRpZiAobm93IDwgdGhpcy5zdGFydCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSBlbHNlIGlmIChub3cgPiB0aGlzLmVuZCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLmVhc2luZyggKG5vdyAtIHRoaXMuc3RhcnQpIC8gdGhpcy5kdXJhdGlvbiApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRPRE9zXG5cdCAqL1xuXHRyZXZlcnNlOiBmdW5jdGlvbiAoKSB7fSxcblx0cGF1c2U6IGZ1bmN0aW9uICgpIHt9LFxuXHRwbGF5OiBmdW5jdGlvbiAoKSB7fSxcblx0Z29UbzogZnVuY3Rpb24gKCkge31cbn07IiwiJ3VzZSBzdHJpY3QnO1xuLypcbiAqIEVhc2luZyBGdW5jdGlvbnMgLSBpbnNwaXJlZCBmcm9tIGh0dHA6Ly9naXptYS5jb20vZWFzaW5nL1xuICogb25seSBjb25zaWRlcmluZyB0aGUgdCB2YWx1ZSBmb3IgdGhlIHJhbmdlIFswLCAxXSA9PiBbMCwgMV1cbiAqIHNlZSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyBubyBlYXNpbmcsIG5vIGFjY2VsZXJhdGlvblxuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eVxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqKDItdCk7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gMip0KnQgOiAtMSsoNC0yKnQpKnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW5nIGZyb20gemVybyB2ZWxvY2l0eSBcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuICgtLXQpKnQqdCsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGlvbiB1bnRpbCBoYWxmd2F5LCB0aGVuIGRlY2VsZXJhdGlvbiBcbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ8MC41ID8gNCp0KnQqdCA6ICh0LTEpKigyKnQtMikqKDIqdC0yKSsxOyB9LFxuICAgIC8vIGFjY2VsZXJhdGluZyBmcm9tIHplcm8gdmVsb2NpdHkgXG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0OyB9LFxuICAgIC8vIGRlY2VsZXJhdGluZyB0byB6ZXJvIHZlbG9jaXR5IFxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHsgcmV0dXJuIDEtKC0tdCkqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0PDAuNSA/IDgqdCp0KnQqdCA6IDEtOCooLS10KSp0KnQqdDsgfSxcbiAgICAvLyBhY2NlbGVyYXRpbmcgZnJvbSB6ZXJvIHZlbG9jaXR5XG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiB0KnQqdCp0KnQ7IH0sXG4gICAgLy8gZGVjZWxlcmF0aW5nIHRvIHplcm8gdmVsb2NpdHlcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7IHJldHVybiAxKygtLXQpKnQqdCp0KnQ7IH0sXG4gICAgLy8gYWNjZWxlcmF0aW9uIHVudGlsIGhhbGZ3YXksIHRoZW4gZGVjZWxlcmF0aW9uIFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdDwwLjUgPyAxNip0KnQqdCp0KnQgOiAxKzE2KigtLXQpKnQqdCp0KnQ7IH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0bGlzdGVuZXJzOiBbXSxcblx0c3RhdHVzOiAwLFxuXHRfZnJhbWU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5zdGF0dXMpIHtcblx0XHRcdHRoaXMuZXhlY3V0ZSgpO1xuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9mcmFtZS5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBTdGFydCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RhcnQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLnN0YXR1cyA9IDE7XG5cblx0XHRpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdFx0dGhpcy5fZnJhbWUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5faW50dmwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy5fZnJhbWUuYmluZCh0aGlzKSwgMTYpOyAvLyA2MGZwc1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU3RvcCBhbmltYXRpb24gbG9vcFxuXHQgKi9cblx0c3RvcDogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuc3RhdHVzID0gMDtcblxuXHRcdGlmICh0aGlzLl9pbnR2bCkge1xuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5faW50dmwpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRyaWdnZXIgYWxsIGxpc3RlbmVyc1xuXHQgKi9cblx0ZXhlY3V0ZTogZnVuY3Rpb24gKCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGlzdGVuZXJzW2ldKCk7XG5cdFx0fVxuXHR9LFxuXHRhZGQ6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGlmICghdGhpcy5saXN0ZW5lcnMubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLnN0YXJ0KCk7XG5cdFx0fVxuXHRcdHRoaXMubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyO1xuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuXHRcdGhlbHBlcnMucmVtb3ZlKHRoaXMubGlzdGVuZXJzLCBsaXN0ZW5lcik7XG5cblx0XHRpZiAoIXRoaXMubGlzdGVuZXJzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5zdG9wKCk7XG5cdFx0fVxuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZXh0ZW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBmb3IodmFyIGk9MTsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspXG5cdCAgICAgICAgZm9yKHZhciBrZXkgaW4gYXJndW1lbnRzW2ldKVxuXHQgICAgICAgICAgICBpZihhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSlcblx0ICAgICAgICAgICAgICAgIGFyZ3VtZW50c1swXVtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG5cdCAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuXHR9LFxuXHRleHRyYWN0OiBmdW5jdGlvbiAob2JqLCBwcm9wZXJ0aWVzKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cmVzdWx0W3Byb3BlcnRpZXNbaV1dID0gb2JqW3Byb3BlcnRpZXNbaV1dO1xuXHRcdH1cblx0fSxcblx0cmVtb3ZlOiBmdW5jdGlvbiAoYXJyYXksIGVsKSB7XG5cdFx0cmV0dXJuIGFycmF5LnNwbGljZShhcnJheS5pbmRleE9mKGVsKSwgMSk7XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZWxpbmUgPSByZXF1aXJlKCcuLy4uL2NvcmUvVGltZWxpbmUuanMnKSxcblx0aGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gQW5pbTtcblxuLyoqXG4gKiBUT0RPOiBtdWx0aXBsZSB0aW1lbGluZXNcbiAqL1xuZnVuY3Rpb24gQW5pbSAob3B0KSB7XG5cdHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXHR0aGlzLnRpbWUgPSBuZXcgVGltZWxpbmUob3B0LnRpbWUpO1xuXHR0aGlzLmRyYXcgPSB0aGlzLm9wdC5kcmF3O1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG5cdGZpbGxNb2RlOiAnbm9uZScsXG5cdHRpbWU6IHt9LFxuXHRkcmF3OiBmdW5jdGlvbiAoKSB7fSBcbn07XG5cbkFuaW0ucHJvdG90eXBlID0ge1xuXHRyZW5kZXI6IGZ1bmN0aW9uIChjYW52YXMpIHtcblx0XHR2YXIgcHJvZ3Jlc3MgPSB0aGlzLnRpbWUuZ2V0UHJvZ3Jlc3MoKTtcblxuXHRcdGlmICh0aGlzLmlzRmlsbChwcm9ncmVzcykpIHtcblx0XHRcdHRoaXMuZHJhdyhjYW52YXMsIHByb2dyZXNzKTtcblx0XHR9XG5cdH0sXG5cdGlzRmlsbDogZnVuY3Rpb24gKHByb2dyZXNzKSB7XG5cdFx0dmFyIGZpbGxNb2RlID0gdGhpcy5vcHQuZmlsbE1vZGU7XG5cblx0XHRpZiAoZmlsbE1vZGUgPT09ICdub25lJyAmJiAocHJvZ3Jlc3MgPT09IDAgfHwgcHJvZ3Jlc3MgPT09IDEpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2ZvcndhcmQnICYmIHByb2dyZXNzID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChmaWxsTW9kZSA9PT0gJ2JhY2t3YXJkJyAmJiBwcm9ncmVzcyA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXHRkZXRhY2g6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5femVvdHJvcGUpIHtcblx0XHRcdHRoaXMuX3plb3Ryb3BlLmRldGFjaCh0aGlzKTtcblx0XHR9XG5cdH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vLi4vY29yZS9oZWxwZXJzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGltZW5zaW9uO1xuXG5mdW5jdGlvbiBEaW1lbnNpb24gKG9wdCwgYmFzZVNpemUsIHBhcmVudCkge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuICAgIHRoaXMuYmFzZVNpemUgPSBiYXNlU2l6ZTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIH1cbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICAgIHBvc2l0aW9uOiAnY2VudGVyJyxcbiAgICBzaXplOiAnY29udGFpbicsXG4gICAgb3JpZ2luOiAwXG59O1xuXG5EaW1lbnNpb24ucHJvdG90eXBlID0ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5vcHQuc2l6ZSkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSB0aGlzLmdldFNpemUoKTtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBzaXplLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBzaXplLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdC5wb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgICAgIHRoaXMueCA9IHBvcy54O1xuICAgICAgICAgICAgdGhpcy55ID0gcG9zLnk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGdldFNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNpemU7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0LnNpemUgPT09ICdhdXRvJyB8fCB0aGlzLm9wdC5zaXplID09PSAnYXV0byBhdXRvJykge1xuICAgICAgICAgICAgc2l6ZSA9IGhlbHBlcnMuZXh0cmFjdCh0aGlzLmJhc2VTaXplLCBbJ3dpZHRoJywgJ2hlaWdodCddKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdC5zaXplID09PSAnY292ZXInIHx8IHRoaXMub3B0LnNpemUgPT09ICdjb250YWluJykge1xuICAgICAgICAgICAgc2l6ZSA9IGZ1bGxTY2FsZSh0aGlzLm9wdC5zaXplLCB0aGlzLmJhc2VTaXplLCB0aGlzLnBhcmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgc2NhbGUgPSBwYXJzZVByb3BTdHIodGhpcy5vcHQuc2l6ZSk7XG4gICAgICAgICAgICBzaXplID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiBwZXJjZW50VG9QeChzY2FsZVswXSwgdGhpcy5wYXJlbnQud2lkdGgpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogcGVyY2VudFRvUHgoc2NhbGVbMF0sIHRoaXMucGFyZW50LmhlaWdodClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNpemUgPSBmaWxsV2l0aEFzcGVjdFJhdGlvKHRoaXMuYmFzZVNpemUsIHNpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNpemU7XG4gICAgfSxcbiAgICBnZXRQb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcG9zID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0LnBvc2l0aW9uKSxcbiAgICAgICAgICAgIHB0ID0ge1xuICAgICAgICAgICAgICAgIHg6IHBlcmNlbnRUb1B4KHBvc1swXSwgdGhpcy5wYXJlbnQud2lkdGgpLFxuICAgICAgICAgICAgICAgIHk6IHBlcmNlbnRUb1B4KHBvc1sxXSwgdGhpcy5wYXJlbnQuaGVpZ2h0KVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBhZGp1c3QgZm9yIG9yaWdpblxuICAgICAgICBpZiAodGhpcy5vcHQub3JpZ2luKSB7XG4gICAgICAgICAgICB2YXIgb3JpZ2luID0gcGFyc2VQcm9wU3RyKHRoaXMub3B0Lm9yaWdpbik7XG4gICAgICAgICAgICBwdCA9IGNlbnRlckF0KHB0LCB0aGlzLCB7eDogb3JpZ2luWzBdLCB5OiBvcmlnaW5bMV19KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwdDtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmRldGFjaCh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmZ1bmN0aW9uIHBhcnNlUHJvcFN0ciAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoJ2NlbnRlcicsICc1MCUnKTtcbiAgICBzdHIgPSBzdHIucmVwbGFjZSgvdG9wfGxlZnQvZywgMCk7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL2JvdHRvbXxyaWdodC9nLCAnMTAwJScpO1xuICAgIHZhciB2YWwgPSBzdHIuc3BsaXQoJyAnKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIHZhbFswXSxcbiAgICAgICAgdmFsLmxlbmd0aCA9PT0gMSA/IHZhbFswXSA6IHZhbFsxXSAvLyByZXBlYXQgdmFsdWUgZm9yIGhlaWdodCBpZiBvbmx5IHdpZHRoIGlzIHByb3ZpZGVkXG4gICAgXTtcbn1cblxuZnVuY3Rpb24gcGVyY2VudFRvUHggKHBlcmNlbnQsIHBhcmVudFB4KSB7XG4gICAgcmV0dXJuIHBlcmNlbnQuaW5kZXhPZignJScpID09PSAtMSA/IHBlcmNlbnQgOiBwZXJjZW50LnNsaWNlKDAsIC0xKSAvIDEwMCAqIHBhcmVudFB4O1xufVxuXG5mdW5jdGlvbiBjZW50ZXJBdCAocHQsIGRpbWVuLCBvcmlnaW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBwdC54IC0gcGVyY2VudFRvUHgob3JpZ2luLngsIGRpbWVuLndpZHRoKSxcbiAgICAgICAgeTogcHQueSAtIHBlcmNlbnRUb1B4KG9yaWdpbi55LCBkaW1lbi5oZWlnaHQpXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gZmlsbFdpdGhBc3BlY3RSYXRpbyAob3JpZ2luYWwsIHNpemUpIHtcbiAgICB2YXIgYXIgPSBvcmlnaW5hbC5oZWlnaHQgLyBvcmlnaW5hbC53aWR0aDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoID09PSAnYXV0bycgPyBzaXplLmhlaWdodCAvIGFyIDogc2l6ZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCA9PT0gJ2F1dG8nID8gc2l6ZS53aWR0aCAqIGFyIDogc2l6ZS5oZWlnaHRcbiAgICB9O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZSBiYWNrZ3JvdW5kIGltYWdlIHNpemUgZm9yICdjb250YWluJyBhbmQgJ2NvdmVyJ1xuICogQHBhcmFtICB7c3RyaW5nfSB0eXBlICAgIGNvbnRhaW4nIG9yICdjb3ZlcidcbiAqIEBwYXJhbSAge29iamVjdH0gY2hpbGRcbiAqIEBwYXJhbSAge29iamVjdH0gcGFyZW50IFxuICogQHJldHVybiB7b2JqZWN0fVxuICovXG5mdW5jdGlvbiBmdWxsU2NhbGUgKHR5cGUsIGNoaWxkLCBwYXJlbnQpIHtcbiAgICB2YXIgY2hpbGRBUiA9IGNoaWxkLmhlaWdodCAvIGNoaWxkLndpZHRoLFxuICAgICAgICBwYXJlbnRBUiA9IHBhcmVudC5oZWlnaHQgLyBwYXJlbnQud2lkdGgsXG4gICAgICAgIHNhbWVIZWlnaHQgPSB0eXBlID09PSAnY292ZXInID8gcGFyZW50QVIgPiBjaGlsZEFSIDogcGFyZW50QVIgPCBjaGlsZEFSO1xuXG4gICAgaWYgKHNhbWVIZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBwYXJlbnQuaGVpZ2h0IC8gY2hpbGRBUixcbiAgICAgICAgICAgIGhlaWdodDogcGFyZW50LmhlaWdodFxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3aWR0aDogcGFyZW50LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJlbnQud2lkdGggKiBjaGlsZEFSXG4gICAgICAgIH07XG4gICAgfVxufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuLy4uL2NvcmUvaGVscGVycy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltZztcblxuZnVuY3Rpb24gSW1nIChvcHQsIGNhbnZhcykge1xuICAgIHRoaXMub3B0ID0gaGVscGVycy5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHQpO1xuXG4gICAgLy8gcHJlbG9hZFxuICAgIHRoaXMuZWwgPSBuZXcgSW1hZ2UoKTtcbiAgICB0aGlzLmVsLm9ubG9hZCA9IHRoaXMuX29uTG9hZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZWwuc3JjID0gdGhpcy5vcHQuc3JjO1xuXG4gICAgLy8gY2FudmFzXG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgICBzcmM6ICcnLFxuICAgIHNpemU6ICdhdXRvJywgLy8gc2VlIGJhY2tncm91bmQtc2l6ZSBjc3MgcHJvcGVydHksXG4gICAgcG9zaXRpb246ICdjZW50ZXInIC8vIGJhY2tncm91bmQtcG9zaXRpb25cbn07XG5cbkltZy5wcm90b3R5cGUgPSB7XG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwLFxuICAgIHg6IDAsXG4gICAgeTogMCxcbiAgICBkcmF3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FudmFzLmN0eC5kcmF3SW1hZ2UodGhpcy5wb3NpdGlvbi54LCB0aGlzLnBvc2l0aW9uLnksIHRoaXMuc2NhbGUud2lkdGgsIHRoaXMuc2NhbGUuaGVpZ2h0KTtcbiAgICB9LFxuICAgIF9vbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgICAgICBcbiAgICAgICAgLy8gc2NhbGUgYW5kIHBvc2l0aW9uXG4gICAgICAgIHRoaXMuc2NhbGUgPSB0aGlzLmNhbnZhcy5nZXRTY2FsZSh0aGlzLm9wdC5zaXplLCB0aGlzLmVsKTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMuY2FudmFzLmdldFBvc2l0aW9uKHRoaXMub3B0LnBvc2l0aW9uKTtcbiAgICB9XG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBQb3NpdGlvbjtcblxuZnVuY3Rpb24gUG9zaXRpb24gKHBvcywgcGFyZW50LCBjaGlsZCkge1xuICAgIHRoaXMucG9zID0gcG9zO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgfVxuICAgIGlmIChjaGlsZCkge1xuICAgICAgICB0aGlzLmNoaWxkID0gY2hpbGQ7XG4gICAgfVxufVxuXG5Qb3NpdGlvbi5nZXRQdCA9IGdldFB0O1xuXG5Qb3NpdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwdCA9IGdldFB0KHRoaXMucG9zLCB0aGlzLnBhcmVudCwgdGhpcy5jaGlsZCk7XG4gICAgICAgIHRoaXMueCA9IE1hdGgucm91bmQocHQueCk7XG4gICAgICAgIHRoaXMueSA9IE1hdGgucm91bmQocHQueSk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kZXRhY2godGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBnZXRQdCAocG9zLCBwYXJlbnQsIGNoaWxkKSB7XG4gICAgdmFyIHB0ID0gcGVyY2VudFRvUHgoIHBhcnNlUHRTdHIocG9zKSApO1xuICAgIGlmIChjaGlsZCkge1xuICAgICAgICBwdCA9IGNlbnRlckF0KGNoaWxkLCBwdCk7XG4gICAgfVxuICAgIHJldHVybiBwdDtcbn1cblxuZnVuY3Rpb24gcGFyc2VQdFN0ciAoc3RyKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoJ2NlbnRlcicsICc1MCUnKTtcbiAgICB2YXIgdmFsID0gc3RyLnNwbGl0KCcgJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB3aWR0aDogdmFsWzBdLFxuICAgICAgICBoZWlnaHQ6IHZhbC5sZW5ndGggPT09IDEgPyB2YWxbMF0gOiB2YWxbMV0gLy8gcmVwZWF0IHZhbHVlIGZvciBoZWlnaHQgaWYgb25seSB3aWR0aCBpcyBwcm92aWRlZFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIHBlcmNlbnRUb1B4IChwdCwgcGFyZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogcHQueC5pbmRleE9mKCclJykgPT09IC0xID8gcHQueCA6IHB0Lnguc2xpY2UoMCwgLTEpLzEwMCAqIHBhcmVudC53aWR0aCxcbiAgICAgICAgeTogcHQueS5pbmRleE9mKCclJykgPT09IC0xID8gcHQueSA6IHB0Lnkuc2xpY2UoMCwgLTEpLzEwMCAqIHBhcmVudC5oZWlnaHRcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBjZW50ZXJBdCAoZGltZW4sIHB0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogcHQueCAtIChkaW1lbi53aWR0aCAvIDIpLFxuICAgICAgICB5OiBwdC55IC0gKGRpbWVuLmhlaWdodCAvIDIpXG4gICAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi8uLi9jb3JlL2hlbHBlcnMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2FsZTtcblxuZnVuY3Rpb24gU2NhbGUgKHNpemUsIGNoaWxkLCBwYXJlbnQpIHtcbiAgICB0aGlzLnNpemUgPSAnc2l6ZSc7XG4gICAgdGhpcy5vcmlnaW5hbCA9IGhlbHBlcnMuZXh0cmFjdChjaGlsZCwgWyd3aWR0aCcsICdoZWlnaHQnXSk7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG59XG5cblNjYWxlLmdldFNpemUgPSBnZXRTaXplO1xuXG5TY2FsZS5wcm90b3R5cGUgPSB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkaSA9IGdldFNpemUodGhpcy5zaXplLCB0aGlzLm9yaWdpbmFsLCB0aGlzLnBhcmVudCk7XG4gICAgICAgIHRoaXMud2lkdGggPSBNYXRoLnJvdW5kKGRpLndpZHRoKTtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBNYXRoLnJvdW5kKGRpLmhlaWdodCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5kZXRhY2godGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBnZXRTaXplIChzaXplLCBjaGlsZCwgcGFyZW50KSB7XG4gICAgaWYgKHNpemUgPT09ICdhdXRvJykge1xuICAgICAgICByZXR1cm4gaGVscGVycy5leHRyYWN0KGNoaWxkLCBbJ3dpZHRoJywgJ2hlaWdodCddKTtcbiAgICB9IGVsc2UgaWYgKHNpemUgPT09ICdjb3ZlcicgfHwgc2l6ZSA9PT0gJ2NvbnRhaW4nKSB7XG4gICAgICAgIHJldHVybiBmdWxsU2NhbGUoc2l6ZSwgY2hpbGQsIHBhcmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGFyU2NhbGUoIHBlcmNlbnRUb1B4KCBwYXJzZVNpemVTdHIoc2l6ZSksIHBhcmVudCApICk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZVNpemVTdHIgKHN0cikge1xuICAgIHZhciB2YWwgPSBzdHIuc3BsaXQoJyAnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHdpZHRoOiB2YWxbMF0sXG4gICAgICAgIGhlaWdodDogdmFsLmxlbmd0aCA9PT0gMSA/IHZhbFswXSA6IHZhbFsxXSAvLyByZXBlYXQgdmFsdWUgZm9yIGhlaWdodCBpZiBvbmx5IHdpZHRoIGlzIHByb3ZpZGVkXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gcGVyY2VudFRvUHggKHNpemUsIHBhcmVudCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoLmluZGV4T2YoJyUnKSA9PT0gLTEgPyBzaXplLndpZHRoIDogc2l6ZS53aWR0aC5zbGljZSgwLCAtMSkvMTAwICogcGFyZW50LndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LmluZGV4T2YoJyUnKSA9PT0gLTEgPyBzaXplLmhlaWdodCA6IHNpemUud2lkdGguc2xpY2UoMCwgLTEpLzEwMCAqIHBhcmVudC5oZWlnaHRcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBhclNjYWxlIChvcmlnaW5hbCwgc2l6ZSkge1xuICAgIHZhciBhciA9IG9yaWdpbmFsLmhlaWdodCAvIG9yaWdpbmFsLndpZHRoO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGggPT09ICdhdXRvJyA/IHNpemUuaGVpZ2h0IC8gYXIgOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0ID09PSAnYXV0bycgPyBzaXplLndpZHRoICogYXIgOiBzaXplLmhlaWdodFxuICAgIH07XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlIGJhY2tncm91bmQgaW1hZ2Ugc2l6ZSBmb3IgJ2NvbnRhaW4nIGFuZCAnY292ZXInXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGUgICAgY29udGFpbicgb3IgJ2NvdmVyJ1xuICogQHBhcmFtICB7b2JqZWN0fSBjaGlsZFxuICogQHBhcmFtICB7b2JqZWN0fSBwYXJlbnQgXG4gKiBAcmV0dXJuIHtvYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGZ1bGxTY2FsZSAodHlwZSwgY2hpbGQsIHBhcmVudCkge1xuICAgIHZhciBjaGlsZEFSID0gY2hpbGQuaGVpZ2h0IC8gY2hpbGQud2lkdGgsXG4gICAgICAgIHBhcmVudEFSID0gcGFyZW50LmhlaWdodCAvIHBhcmVudC53aWR0aCxcbiAgICAgICAgc2FtZUhlaWdodCA9IHR5cGUgPT09ICdjb3ZlcicgPyBwYXJlbnRBUiA+IGNoaWxkQVIgOiBwYXJlbnRBUiA8IGNoaWxkQVI7XG5cbiAgICBpZiAoc2FtZUhlaWdodCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2lkdGg6IHBhcmVudC5oZWlnaHQgLyBjaGlsZEFSLFxuICAgICAgICAgICAgaGVpZ2h0OiBwYXJlbnQuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdpZHRoOiBwYXJlbnQud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHBhcmVudC53aWR0aCAqIGNoaWxkQVJcbiAgICAgICAgfTtcbiAgICB9XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FudmFzID0gcmVxdWlyZSgnLi9jb3JlL0NhbnZhcy5qcycpLFxuXHRmcmFtZSA9IHJlcXVpcmUoJy4vY29yZS9mcmFtZS5qcycpLFxuXHRBbmltID0gcmVxdWlyZSgnLi9yZW5kZXIvQW5pbS5qcycpLFxuXHRoZWxwZXJzID0gcmVxdWlyZSgnLi9jb3JlL2hlbHBlcnMuanMnKTtcblxud2luZG93Llplb3Ryb3BlID0gWmVvdHJvcGU7XG5cbmZ1bmN0aW9uIFplb3Ryb3BlIChlbCkge1xuXHR0aGlzLmNhbnZhcyA9IG5ldyBDYW52YXMoZWwpO1xuXHR0aGlzLmZyYW1lID0gZnJhbWUuYWRkKHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xufVxuXG5aZW90cm9wZS5wcm90b3R5cGUgPSB7XG5cdGFuaW1zOiBbXSxcblx0YW5pbTogZnVuY3Rpb24gKG9wdCkge1xuXHRcdHZhciBhbmltID0gbmV3IEFuaW0ob3B0KTtcblx0XHRhbmltLl96ZW90cm9wZSA9IHRoaXM7XG5cdFx0dGhpcy5hbmltcy5wdXNoKGFuaW0pO1xuXHRcdHJldHVybiBhbmltO1xuXHR9LFxuXHRkZXRhY2g6IGZ1bmN0aW9uIChhbmltKSB7XG5cdFx0aGVscGVycy5yZW1vdmUodGhpcy5hbmltcywgYW5pbSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gKCkge1xuXHRcdHRoaXMuY2FudmFzLmNsZWFyKCk7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmFuaW1zW2ldLnJlbmRlcih0aGlzLmNhbnZhcyk7XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmU6IGZ1bmN0aW9uICgpIHtcblx0XHRmcmFtZS5yZW1vdmUodGhpcy5mcmFtZSk7XG5cdFx0dGhpcy5jYW52YXMucmVtb3ZlKCk7XG5cdH1cbn07Il19
