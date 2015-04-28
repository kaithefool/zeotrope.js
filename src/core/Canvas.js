'use strict';

var helpers = require('./helpers'),
    Scale = require('./../render/Scale.js'),
    Position = require('./../render/Position.js'),
    Img = require('./../render/Img.js');

module.exports = Canvas;

function Canvas (el) {
    this.el = el;
    this.ctx = this.el.getContext('2d');

    // onResize event
    this._resizeHandler = this._onResize.bind(this);
    window.addEventListener(this._resizeHandler);
    this._onResize();
}

Canvas.prototype = {
    scales: [],
    positions: [],
    _onResize: function () {
        var w = this.el.offsetWidth,
            h = this.el.offsetHeight;

        if (w !== this.width && h !== this.height) {
            this.width = w;
            this.height = h;
            this.el.setAttribute('width', this.width);
            this.el.setAttribute('height', this.height);

            /**
             * TODO: skip non-percentage scales and positions
             */

            // update all scales
            for (var i = 0; i < this.scales.length; i++) {
                this.scales[i].update();
            }

            // and all positions
            for (var k = 0; k < this.positions.length; k++) {
                this.positions[k].update();
            }            
        }
    },
    getPt: function (pos, child) {
        return Position.getPt(pos, this, child);
    },
    getPosition: function (pos, child) {
        var position = new Position(pos, this, child);
        this.positions.push(position);
        return position;
    },
    getSize: function (size, child) {
        return Scale.getSize(size, child, this);
    },
    getScale: function (size, child) {
        var scale = new Scale(size, child, this);
        this.scales.push(scale);
        return scale;
    },
    getImg: function (opt) {
        return new Img(opt, this);
    },
    detach: function (obj) {
        var collection;

        if (obj instanceof Scale) {
            collection = this.scales;
        }
        if (obj instanceof Position) {
            collection = this.positions;
        }

        helpers.remove(collection, obj);
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },
    remove: function () {
        window.removeEventListener(this._resizeHandler);
        this.el.parentElement.removeChild(this.el);
    }
};