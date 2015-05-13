'use strict';

var Timeline = require('./../../src/core/Timeline.js');
var start = new Date();
start.add = function (milliseconds) {
    return new Date(this.getTime() + milliseconds);
};

describe('Timeline', function () {

    it('should initialize without any arguments', function () {
        var time = new Timeline();
        expect(time).toBeTruthy(true);
    });

    describe('Progress and easings', function () {
        it('should return correct linear progress', function () {
            var time = new Timeline({start: start});
            expect(time.getProgress(start.add(500))).toBe(0.5);
            expect(time.getProgress(start.add(200))).toBe(0.2);
        });
        it('should always return progress from 0 to 1', function () {
            var time = new Timeline({start: start});
            expect(time.getProgress(start.add(2000))).toBe(1);
            expect(time.getProgress(start.add(-1000))).toBe(0);
        });
        it('should return correct easeInQuad progress', function () {
            var time = new Timeline({start: start, easing: 'easeInQuad'});
            expect(time.getProgress(start.add(500))).toBe(0.25);
            expect(time.getProgress(start.add(300))).toBe(0.09);
        });
    });

    describe('Control methods', function () {
        it('should be able to paused', function () {
            
        });
    });

});