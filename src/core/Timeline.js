'use strict';

var helpers = require('./helpers.js');
var easings = require('./easings.js');

module.exports = Timeline;

function Timeline (options) {
	var opt = this.opt = helpers.extend({}, defaults, options);

	// initialize
	this.easing = easings[opt.easing];
	this.start = opt.start instanceof Date ? opt.start : new Date();
	this.end = opt.end instanceof Date ? opt.end : new Date(this.start.getDate() + opt.duration);
	this.duration = opt.end - opt.start;
}

var defaults = {
	easing: 'linear',
	start: null,
	end: null,
	duration: 1000 // milliseconds
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
	}
};