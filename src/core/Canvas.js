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
	onResize: function () {
		var w = this.el.offsetWidth,
        	h = this.el.offsetHeight;

        if (w !== this.width && h !== this.height) {
        	this.width = w;
        	this.height = h;
			this.el.setAttribute('width', this.width);
	        this.el.setAttribute('height', this.height);
        }
	},
	clear: function () {
		this.ctx.clearRect(0, 0, this.width, this.height);
	},
	remove: function () {
		window.removeEventListener(this._onResize);
		this.el.parentElement.removeChild(this.el);
	}
};