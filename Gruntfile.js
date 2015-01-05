/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            '* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.repository.url ? "* " + pkg.repository.url + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            '* Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            '*/\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: '<%= pkg.list %>', //['lib/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.r<%= pkg.version %>.js',
                nonull: true
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['js/**/*.js']
            }
        },
        jsduck: {
            main: {
                src: ['<%= pkg.list %>'],
                dest: 'docs',
                options: {
                    'warnings': ['-no_doc', '-dup_member', '-link_ambiguous'],
                    'external': ['XMLHttpRequest', 'THREE', 'THREE.Matrix3']
                }
            }
        },
        nodeunit: {
            files: ['js/**/*_test.js']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib_test: {
                files: '<%= jshint.lib_test.src %>',
                tasks: ['jshint:lib_test', 'nodeunit']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsduck');

    grunt.registerTask('default', [
        'concat',
        'uglify'
    ]);

    grunt.registerTask('docs', [
        'jsduck'
    ]);

};
