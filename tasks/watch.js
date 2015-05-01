module.exports = function (grunt) {

    'use strict';

    grunt.config.set('watch', {
    	js: {
    		files: ['src/**/*', 'test/specs/**/*Spec.js'],
    		tasks: ['browserify', 'karma:test']
    	}
    });

};