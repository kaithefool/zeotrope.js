'use strict';

var frame = require('./frame.js');

module.exports = Canvas;

var Canvas = function (el) {
	this.el = el;
	this.ctx = this.el.getContext('2d');

	// add frame listener
	this._frame = this.frame.bind(this);
	frame.add(this._frame);

	// onResize event
	this._onResize = this.onResize.bind(this);
	window.addEventListener(this._onResize);
};

Canvas.prototype = {

	resized: false,

	frame: function () {
		
	},

	onResize: function () {
		this.width = this.el.offsetWidth;
        this.height = this.el.offsetHeight;
        this.el.setAttribute('width', this.width);
        this.el.setAttribute('height', this.height);
        this.resized = true;
	},

	remove: function () {
		frame.remove(this._frame);
		window.removeEventListener(this._onResize);
	}

};