'use strict';

var helpers = require('./../core/helpers.js');

module.exports = Img;

function Img (src, opt, canvas) {
    this.opt = helpers.extend({}, defaults, opt);

    // preload
    this.el = new Image();
    this.el.onload = this._onLoad.bind(this);
    this.el.src = src;

    this.canvas = canvas;
}

var defaults = {
    dimension: {
        size: 'cover',
        position: 'center',
        origin: '50% 50%'
    }
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

        this.canvas.ctx.drawImage(this.x, this.y, this.width, this.height);
    },
    _onLoad: function () {
        this.loaded = true;
        this.canvas.getDimension(this.opt.dimension, this.el);
    }
};