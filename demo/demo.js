'use strict';

function ColumnClip (opt) {
    this.opt = opt;
}
ColumnClip.prototype.draw = function (canvas, progress) {
    var opt = this.opt,
        ctx = canvas.ctx;

    var x = opt.w * (1 - progress), // related to opt.x
        y = opt.h * 0.1 * (1 - progress), // related to opt.y
        w = opt.w - x,
        h = opt.h - (y * 2);

    ctx.beginPath();
    ctx.rect(Math.floor(opt.x + x), Math.floor(opt.y + y), Math.ceil(w), Math.ceil(h));
    ctx.fillStyle = '#000';
    ctx.fill();
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
                h: colH
            });

            zeotrope.anim({
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