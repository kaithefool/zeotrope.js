'use strict';

var Timeline = require('./../../src/core/Timeline.js');
var start = new Date();
start.add = function (milliseconds) {
    return new Date(this.getTime() + milliseconds);
};

describe('Timeline', function () {
    var time;

    beforeEach(function () {
        time = new Timeline({start: start});
    });

    it('should initialize without any arguments', function () {
        var time = new Timeline();
        expect(time).toBeTruthy(true);
    });

    describe('Progress and easings', function () {
        it('should return correct linear progress', function () {
            expect(time.getProgress(start.add(500))).toBe(0.5);
            expect(time.getProgress(start.add(200))).toBe(0.2);
        });
        it('should always return progress from 0 to 1', function () {
            expect(time.getProgress(start.add(2000))).toBe(1);
            expect(time.getProgress(start.add(-1000))).toBe(0);
        });
        it('should return correct easeInQuad progress', function () {
            var time = new Timeline({start: start, easing: 'easeInQuad'});
            expect(time.getProgress(start.add(500))).toBe(0.25);
            expect(time.getProgress(start.add(300))).toBe(0.09);
        });
        it('should be able to delay', function () {
            var time = new Timeline({start: start, delay: 2000});
            expect(time.getProgress(start.add(2500))).toBe(0.5);
        });
    });

    describe('Control methods', function () {
        it('should be able to pause and play', function () {
            time.pause(start.add(300));
            expect(time.getProgress(start.add(10000))).toBe(0.3);
            time.play(start.add(2000));
            expect(time.getProgress(start.add(2300))).toBe(0.6);
        });
        it('should be able to reverse', function () {
            time.reverse(start.add(300));
            expect(time.getProgress(start.add(400))).toBeCloseTo(0.2, 2);
        });
    });

});