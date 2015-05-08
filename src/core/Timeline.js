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