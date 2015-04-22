module.exports = function (grunt) {

    'use strict';

    grunt.config.set('browserify', {
        options: {
            browserifyOptions: {
                debug: true
            }
        },
        dist: {
        	files: {
        		'dist/zeotrope.js': ['src/**/*.js']
        	}
        }
    });

};