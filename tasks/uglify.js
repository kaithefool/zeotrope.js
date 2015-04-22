module.exports = function (grunt) {

    'use strict';

    grunt.config.set('uglify', {
        dist: {
            files: {
                'dist/zeotrope.min.js': ['dist/zeotrope.js']
            }
        }
    });

};