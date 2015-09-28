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