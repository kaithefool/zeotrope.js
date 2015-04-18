module.exports = function (grunt) {

    "use strict";

    grunt.config.set('usebanner', {
        options:
        {
            position: 'top',
            banner: '/*!\n * <%= pkg.name %> <%= pkg.version %> <<%= pkg.homepage %>>\n * Contributor(s): <%= pkg.contributors %>\n * Last Build: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n\n',
            linebreak: true
        },
        js:
        {

            files:
            {
                src: [
                    'dist/*.js'
                ]
            }
        }
    });
};