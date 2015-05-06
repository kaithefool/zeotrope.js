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
	this.anims = [];
}

var defaults = {
	onComplete: function () {}
};

Zeotrope.prototype = {
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

		if (completed && this.opt.onComplete) {
			this.opt.onComplete.apply(this);
		}
	},
	remove: function (removeEl) {
		frame.remove(this.frame);
		this.canvas.clear();
		this.canvas.remove(removeEl);
	}
};