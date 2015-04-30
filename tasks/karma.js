module.exports = function(grunt) {

    'use strict';

    grunt.config.set('karma', {
        options: {
            configFile: 'test/karma.conf.js',
            separator: ''
        },
        test: {
            options: {
                singleRun: true,
                browsers: ['PhantomJS'],
                logLevel: 'ERROR',
                reporters: ['story', 'coverage']
            }
        },
        watch: {
            options: {
                singleRun: false,
                background: true,
                browsers: ['PhantomJS'],
                logLevel: 'ERROR',
                reporters: ['story', 'coverage']
            }
        }
    });

};
