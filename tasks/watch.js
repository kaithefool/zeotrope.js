module.exports = function (grunt) {

    'use strict';

    grunt.config.set('watch', {
    	js: {
    		files: 'src/**/*',
    		tasks: ['browserify']
    	}
    });

};