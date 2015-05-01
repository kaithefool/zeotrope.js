'use strict';

var Dimension =  require('./../../src/render/Dimension.js');

describe('Dimension', function () {

    describe('constructor methods', function () {

        describe('parsePropStr', function () {
            var fn = Dimension.parsePropStr;

            it('should return x and y axis value', function () {
                expect(fn('50% 20')).toEqual(['50%', '20']);
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

    it('should initialize without any arguments', function () {
        var dimen = new Dimension();
        expect(dimen.opt).toBeTruthy(true);
    });

    describe('size', function () {
        it('should accept size in pixel', function () {
            var dimen = new Dimension({size: '100 200'});
            expect(dimen.getSize()).toEqual({width: 100, height: 200});
        });
        it('should accept size in percentage', function () {
            var dimen = new Dimension({size: '100% 200%'}, null, {width: 80, height: 40});
            expect(dimen.getSize()).toEqual({width: 80, height: 80});
        });
        it('should accept size in pixel and percentage at the same time', function () {
            var dimen = new Dimension({size: '100 200%'}, null, {width: 80, height: 40});
            expect(dimen.getSize()).toEqual({width: 100, height: 80});
        });
        it('should accept syntax size', function () {
            var dimen0 = new Dimension({size: 'contain'}, {width: 100, height: 50}, {width: 80, height: 80});
            expect(dimen0.getSize()).toEqual({width: 80, height: 40});

            var dimen1 = new Dimension({size: 'cover'}, {width: 100, height: 50}, {width: 80, height: 80});
            expect(dimen1.getSize()).toEqual({width: 160, height: 80});
        });
        it('should accept auto size', function () {
            var dimen = new Dimension({size: 'auto'}, {width: 100, height: 50});
            expect(dimen.getSize()).toEqual({width: 100, height: 50});
        });
        it('should scale with aspect ratio', function () {
            var dimen0 = new Dimension({size: '500 auto'}, {width: 100, height: 50});
            expect(dimen0.getSize()).toEqual({width: 500, height: 250});

            var dimen1 = new Dimension({size: '500% auto'}, {width: 100, height: 50}, {width: 20, height: 1000});
            expect(dimen1.getSize()).toEqual({width: 100, height: 50});

            var dimen2 = new Dimension({size: 'auto 500%'}, {width: 100, height: 50}, {width: 20, height: 100});
            expect(dimen2.getSize()).toEqual({width: 1000, height: 500});
        });
    });

    describe('position', function () {
        it('should accept position in pixel', function () {
            var dimen = new Dimension({position: '100'});
            expect(dimen.getPosition()).toEqual({x: 100, y: 100});
        });
        it('should accept position in percentage', function () {
            var dimen = new Dimension({position: '50% 20%'}, null, {width: 100, height: 200});
            expect(dimen.getPosition()).toEqual({x: 50, y: 40});
        });
        it('should adjust position with the origin', function () {
            var dimen0 = new Dimension({
                position: '50% 20%',
                origin: '10 20'
            }, null, {width: 100, height: 200});
            expect(dimen0.getPosition()).toEqual({x: 40, y: 20});

            var dimen1 = new Dimension({
                position: '50% 20%',
                origin: '10 20'
            }, {width: 100, height: 400}, {width: 100, height: 200});
            expect(dimen1.getPosition()).toEqual({x: 40, y: 20});
        });
    });

});