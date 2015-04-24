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
        if (typeof this.opt.size === 'string') { 
            var size = scale(this.opt.size, this.el, this.canvas);
            this.width = size.w;
            this.height = size.h;
        } else {

        }
    },
    getPosition: function () {
        
    }
};

/**
 * Calculate background image size
 * @param  {string} type   'auto', 'contain' or 'cover'
 * @param  {object} child
 * @param  {object} parent 
 * @return {object}
 */
function scale (type, child, parent) {
    if (type === 'auto') {
        return {
            w: child.width,
            h: child.height
        };
    }

    var childAR = child.height / child.width,
        parentAR = parent.height / parent.width,
        sameHeight = type === 'cover' ? parentAR > childAR : parentAR < childAR;

    if (sameHeight) {
        return {
            w: parent.height / childAR,
            h: parent.height
        };
    } else {
        return {
            w: parent.width,
            h: parent.width * childAR
        };
    }
}