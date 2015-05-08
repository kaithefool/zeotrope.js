'use strict';

window.onload = function () {

    var canvas = document.getElementById('demo-0');

    function ColumnClip (img, dimension) {
       this.img = img;
       this.dimension = dimension;
    }
    ColumnClip.prototype.draw = function (canvas, progress) {
        if (!this.img.loaded) {
            return;
        }

        var ctx = canvas.ctx,
            di = this.dimension,
            w = progress * di.width,
            x = (1 - progress) * di.width,
            y = (1 - progress) * di.height * 0.2,
            h = di.height - (y * 2);

        ctx.save();
        ctx.beginPath();
        ctx.rect(x + di.x, y + di.y, w, h);
        ctx.clip();
        this.img.draw({
            x: this.img.dimension.x + (x / 2)
        });
        ctx.restore();
    };

    function nextSlide () {
        var zeo = new Zeotrope(canvas),
            cols = Math.floor(zeo.canvas.width / 96),
            img = zeo.img('./image1.jpg');

        for (var i = 0; i < cols; i++) {
            var colClip = new ColumnClip(img, zeo.dimension({
                size: (100 / cols) + '% 100%',
                position: (i * 100 / cols)  + '% 0'
            }));
            zeo.anim({
                fillMode: 'forward',
                time: {
                    delay: i * 50,
                    easing: 'easeInOutCubic',
                    duration: 800
                },
                draw: colClip.draw.bind(colClip)
            });
        }
    }

    canvas.onclick = nextSlide;

};