'use strict';

var canvas = document.getElementById('demo-0');

function ColumnClip (img, scale, pos) {
   this.img = img;
   this.scale = scale;
   this.pos = pos;
}
ColumnClip.prototype.draw = function (canvas, progress) {
    var ctx = canvas.ctx;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.pos.x, this.pos.y, this.scale.width, this.scale.height);
    ctx.clip();
    this.img.draw();
    ctx.restore();
};

function nextSlide () {
    var zeo = new Zeotrope(canvas),
        now = new Date(),
        cols = Math.floor(zeo.canvas.width / 96),
        colScale = zeo.canvas.getScale(100/cols + '% 100%'),
        img = zeo.canvas.getImg({
            src: './image1.jpg',
            position: 'center',
            scale: 'cover'
        });

    for (var i = 0; i < cols; i++) {
        var colClip = new ColumnClip(img, colScale, zeo.canvas.getPos());
        zeo.anim({
            fillMode: 'forward',
            time: {
                start: new Date(now.getTime() + (i * 50)),
                easing: 'easeInOutCubic',
                duration: 800
            },
            draw: colClip.draw.bind(colClip)
        });
    }
}

canvas.onclick = nextSlide;