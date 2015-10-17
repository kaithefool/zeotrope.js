'use strict';

var defaults = {
    imgs: [],
    sqW: 300,
    slideDur: 5000,
    animDur: 1000
};

function SqSlider (el, opts) {
    this.$el = $(el);
    this.opts = $.extend({}, defaults, opts);
    this.canvas = this.$el.find('canvas')[0];

    this.zeo = new Zeotrope(this.canvas);

    // prepare images
    for (var i = 0; i < this.opts.imgs.length; i++) {
        this.zeo.img(this.opts.imgs[i]);
    }
}

SqSlider.prototype = {
    onResize: function () {
        this.rows = Math.floor(this.zeo.canvas.height / this.opts.sqW);
        this.cols = Math.floor(this.zeo.canvas.width / this.opts.sqW);
    },
    next: function (img) {
        for (var r = 0; r < this.rows; r++) {
            for (var c = 0; c < this.cols; c++) {
                this.tile(r, c, img);
            }
        }
    },
    tile: function (row, col, img) {
        var pos = {
            x: col * this.opts.sqW,
            y: row * this.opts.sqW
        };

        this.zeo.anim({
            pos: pos,
            img: img,
            time: {
                duration: this.opts.animDur,
                delay: Math.random() * 1000
            },
            draw: this.draw.bind(this)
        });
    },
    draw: function (canvas, progress, opt) {
        sqClip(canvas.ctx, opt.pos.x, opt.pos.y, this.opts.sqW, opt.img);
    }
};

function sqClip (ctx, x, y, w, img) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, w);
    ctx.clip();
    img.draw();
    ctx.restore();
}

window.onload = function () {
    new SqSlider($('.sq-slider'), {
        imgs: [
            'img/bg-0.jpeg',
            'img/bg-1.jpeg',
            'img/bg-2.jpeg'
        ]
    });
};