'use strict';

var Dimension =  require('./../../src/render/Dimension.js');

describe('', function () {
    it('should initialize without any arguments', function () {
        var dimen = new Dimension();
        expect(dimen.opt).toBe(true);
    });
});