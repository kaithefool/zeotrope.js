'use strict';

module.exports = Position;

function Position (pos, parent, child) {
    this.pos = pos;
    if (parent) {
        this.parent = parent;
    }
    if (child) {
        this.child = child;
    }
}

Position.prototype = {
    update: function () {
        var pt = getPt(this.pos, this.parent, this.child);
        this.x = pt.x;
        this.y = pt.y;
    },
    remove: function () {
        if (this.parent) {
            this.parent.detach(this);
        }
    }
};

function getPt (pos, parent, child) {
    var pt = percentToPx( parsePtStr(pos) );
    if (child) {
        pt = centerAt(child, pt);
    }
    return pt;
}

function parsePtStr (str) {
    str = str.replace('center', '50%');
    var val = str.split(' ');

    return {
        width: val[0],
        height: val.length === 1 ? val[0] : val[1] // repeat value for height if only width is provided
    };
}

function percentToPx (pt, parent) {
    return {
        x: pt.x.indexOf('%') === -1 ? pt.x : pt.x.slice(0, -1)/100 * parent.width,
        y: pt.y.indexOf('%') === -1 ? pt.y : pt.y.slice(0, -1)/100 * parent.height
    };
}

function centerAt (dimen, pt) {
    return {
        x: pt.x - (dimen.width / 2),
        y: pt.y - (dimen.height / 2)
    };
}