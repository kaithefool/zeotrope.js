'use strict';

var helpers = require('./../core/helpers.js');

module.exports = Img;

function Img (opt, canvas) {
    this.opt = helpers.extend({}, defaults, opt);

    // preload
    this.el = new Image();
    this.el.onload = this._onLoad.bind(this);
    this.el.src = this.opt.src;

    // canvas
    this.canvas = canvas;
}

var defaults = {
    src: '',
    size: 'auto', // see background-size css property,
    position: 'center' // background-position
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

        this.canvas.ctx.drawImage(this.position.x, this.position.y, this.scale.width, this.scale.height);
    },
    _onLoad: function () {
        this.loaded = true;
        
        // scale and position
        this.scale = this.canvas.getScale(this.opt.size, this.el);
        this.position = this.canvas.getPosition(this.opt.position);
    }
};