'use strict';

module.exports = Canvas;

var Canvas = function (el) {
	this.el = el;
	this.ctx = this.el.getContext('2d');

	// onResize event
	this._onResize = this.onResize.bind(this);
	window.addEventListener(this._onResize);
};

Canvas.prototype = {
	resize: function () {},
	onResize: function () {
		this.width = this.el.offsetWidth;
        this.height = this.el.offsetHeight;
        this.el.setAttribute('width', this.width);
        this.el.setAttribute('height', this.height);
        this.resize();
	},
	clear: function () {
		this.ctx.clearRect(0, 0, this.width, this.el.height);
	},
	remove: function () {
		window.removeEventListener(this._onResize);
		this.el.parentElement.removeChild(this.el);
	}
};