'use strict';

var helpers = require('./../core/helpers.js');

module.exports = Img;

function Img (canvas, opt) {
    this.canvas = canvas;
    this.opt = helpers.extend({}, defaults, opt);

    // preload
    this.el = new Image();
    this.el.onload = this.onLoad.bind(this);
    this.el.src = this.opt.src;

    //
    
}

var defaults = {
    src: '',
    size: 'auto', // see background-size css property,
    position: 'center' // background-position
};

Img.prototype = {
    width: 0,
    height: 0,
    draw: function () {
        if (!this.loaded) {
            return;
        }

        this.canvas.ctx.drawImage(this.x, this.y, this.width, this.height);
    },
    onLoad: function () {
        this.loaded = true;
    },
    getSize: function () {
        
    },
    getPosition: function () {

    }
};