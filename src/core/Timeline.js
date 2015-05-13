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