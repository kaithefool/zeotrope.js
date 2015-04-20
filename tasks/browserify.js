module.exports = function (grunt) {

    'use strict';

    grunt.config.set('browserify', {
        options: {
            browserifyOptions: {
                debug: true
            }
        },
        dev: {
        	files: {
        		'dist/zeotrope.js': ['src/**/*.js']
        	}
        }
    });

};