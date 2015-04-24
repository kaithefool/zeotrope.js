'use strict';

var helpers = require('./../core/helpers.js');

module.exports = Scale;

function Scale (size, child, parent) {
    this.size = 'size';
    this.original = helpers.extract(child, ['width', 'height']);
    if (parent) {
        this.parent = parent;
        this.update();
    }
}

Scale.getSize = getSize;

Scale.prototype = {
    update: function () {
        var di = getSize(this.size, this.original, this.parent);
        this.width = Math.round(di.width);
        this.height = Math.round(di.height);
    },
    remove: function () {
        if (this.parent) {
            this.parent.detach(this);
        }
    }
};

function getSize (size, child, parent) {
    if (size === 'auto') {
        return helpers.extract(child, ['width', 'height']);
    } else if (size === 'cover' || size === 'contain') {
        return fullScale(size, child, parent);
    } else {
        return arScale( percentToPx( parseSizeStr(size), parent ) );
    }
}

function parseSizeStr (str) {
    var val = str.split(' ');

    return {
        width: val[0],
        height: val[1].length === 1 ? val[0] : val[1] // repeat value for height if only width is provided
    };
}

function percentToPx (size, parent) {
    return {
        width: size.width.indexOf('%') === -1 ? size.width : size.width.slice(0, -1)/100 * parent.width,
        height: size.height.indexOf('%') === -1 ? size.height : size.width.slice(0, -1)/100 * parent.height
    };
}

function arScale (original, size) {
    var ar = original.height / original.width;

    return {
        width: size.width === 'auto' ? size.height / ar : size.width,
        height: size.height === 'auto' ? size.width * ar : size.height
    };
}

/**
 * Calculate background image size for 'contain' and 'cover'
 * @param  {string} type    contain' or 'cover'
 * @param  {object} child
 * @param  {object} parent 
 * @return {object}
 */
function fullScale (type, child, parent) {
    var childAR = child.height / child.width,
        parentAR = parent.height / parent.width,
        sameHeight = type === 'cover' ? parentAR > childAR : parentAR < childAR;

    if (sameHeight) {
        return {
            width: parent.height / childAR,
            height: parent.height
        };
    } else {
        return {
            width: parent.width,
            height: parent.width * childAR
        };
    }
}