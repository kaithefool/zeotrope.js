'use strict';

var Timeline = require('./../core/Timeline.js'),
	helpers = require('./../core/helpers.js');

module.exports = Anim;

function Anim (opt) {
	this.opt = helpers.extend({}, defaults, opt);
	this.time = new Timeline(opt.time);
}

var defaults = {
	fillMode: 'none',
	time: {},
	draw: {}
};

Anim.prototype = {
	render: function () {
		var progress = this.time.getProgress();

		if (this.isFill()) {
			this.draw(progress);
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
	draw: function () {

	},
	detach: function () {
		if (this._zeotrope) {
			this._zeotrope.detach(this);
		}
	}
};