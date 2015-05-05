'use strict';

function coverScale (childDimen, parentDimen) {
    var childAR = childDimen.height / childDimen.width,
        parentAR = parentDimen.height / parentDimen.width,
        w;

    if (parentAR > childAR) {
        w = parentDimen.height / childAR;
    } else {
        w = parentDimen.width;
    }

    return {
        w: w,
        h: w * childAR,
        x: (parentDimen.width - w) / 2,
        y: (parentDimen.height - w * childAR) / 2
    };
}

function ColumnClip (opt) {
    this.opt = opt;
    this.canvas = opt.canvas;
    this.img = new Image();
    this.img.onload = this.onload.bind(this);
    this.img.src = this.opt.img;
}
ColumnClip.prototype.onload = function () {
    this.imgDimen = coverScale(this.img, this.canvas);
};
ColumnClip.prototype.draw = function (canvas, progress) {
    if (!this.imgDimen) {
        return;
    }

    var opt = this.opt,
        ctx = canvas.ctx;

    var x = opt.w * (1 - progress), // related to opt.x
        y = opt.h * 0.1 * (1 - progress), // related to opt.y
        w = opt.w - x,
        h = opt.h - (y * 2),
        bgX = - x / 2; // background tranlsate-x

    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.floor(opt.x + x), Math.floor(opt.y + y), Math.ceil(w), Math.ceil(h));
    ctx.clip();
    ctx.drawImage(this.img, this.imgDimen.x + bgX, this.imgDimen.y, this.imgDimen.w, this.imgDimen.h);
    ctx.restore();
};

window.onload = function () {
    var canvas = document.getElementById('demo-0');
    canvas.onclick = function () {
        var zeotrope = new Zeotrope(canvas);

        var cols = Math.floor(zeotrope.canvas.width / 96),
            colW = zeotrope.canvas.width / cols,
            colH = zeotrope.canvas.height,
            now = new Date();

        for (var i = 0; i < cols; i++) {
            var colClip = new ColumnClip({
                x: colW * i,
                y: 0,
                w: colW,
                h: colH,
                img: './image1.jpg',
                canvas: zeotrope.canvas
            });

            zeotrope.anim({
                fillMode: 'forward',
                time: {
                    start: new Date(now.getTime() + (i * 50)),
                    easing: 'easeInOutCubic',
                    duration: 800
                },
                draw: colClip.draw.bind(colClip)
            });
        }
    };
};