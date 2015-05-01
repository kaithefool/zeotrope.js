'use strict';

var Dimension =  require('./../../src/render/Dimension.js');

describe('Const methods', function () {

    describe('parsePropStr', function () {
        var fn = Dimension.parsePropStr;

        it('should return x and y axis value', function () {
            expect(fn('50% 20%')).toEqual(['50%', '20%']);
            expect(fn('50%')).toEqual(['50%', '50%']);
        });
        it('should convert position syntax to percentage', function () {
            expect(fn('left top')).toEqual(['0', '0']);
            expect(fn('right bottom')).toEqual(['100%', '100%']);
            expect(fn('center')).toEqual(['50%', '50%']);
        });
    });

    describe('percentToPx', function () {
        var fn = Dimension.percentToPx;

        it('should not modify any non percentage value', function () {
            expect(fn('auto', 100)).toBe('auto');
            expect(fn('20', 100)).toBe('20');
        });
        it('should return correct px value', function () {
            expect(fn('20%', 100)).toBe(20);
            expect(fn('120%', 100)).toBe(120);
            expect(fn('-120%', 100)).toBe(-120);
        });
    });

    describe('centerAt', function () {
        var fn = Dimension.centerAt,
            pt = {x: 50, y: 50},
            dimen = {width: 100, height: 200};

        it('should accept px values', function () {
            expect(fn(pt, {x: 10, y: 20})).toEqual({x: 40, y: 30});
        });
        it('should accept percentage values', function () {
            expect(fn(pt, {x: '50%', y: '50%'}, dimen)).toEqual({x: 0, y: -50});
        });
        it('should accept negative values', function () {
            expect(fn(pt, {x: '-50%', y: '-50%'}, dimen)).toEqual({x: 100, y: 150});
        });
    });

    describe('fillWithAspectRatio', function () {
        var fn = Dimension.fillWithAspectRatio,
            original = {width: 200, height: 100};

        it('should fill missing dimension with px', function () {
            expect(fn(original, {width: 50})).toEqual({width: 50, height: 25});
            expect(fn(original, {height: 50})).toEqual({width: 100, height: 50});
        });
        it('should accept auto value', function () {
            expect(fn(original, {width: 50, height: 'auto'})).toEqual({width: 50, height: 25});
        });
    });

    describe('fullScale', function () {
        var fn = Dimension.fullScale;

        it('should return correct contain scale', function () {
            expect(fn('contain', {width: 100, height: 50}, {width: 200, height: 200})).toEqual({width: 200, height: 100});
            expect(fn('contain', {width: 100, height: 50}, {width: 500, height: 100})).toEqual({width: 200, height: 100});
        });
        it('should return correct cover scale', function () {
            expect(fn('cover', {width: 100, height: 50}, {width: 200, height: 200})).toEqual({width: 400, height: 200});
            expect(fn('cover', {width: 100, height: 50}, {width: 500, height: 100})).toEqual({width: 500, height: 250});
        });
    });

});

describe('Initialize', function () {
    var dimen = new Dimension();
    it('should initialize without any arguments', function () {
        expect(dimen.opt).toBeTruthy(true);
    });
});