'use strict';


module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  /* global process */

  // configures browsers to run test against
  // any of [ 'PhantomJS', 'Chrome', 'Firefox', 'IE']
  var TEST_BROWSERS = ((process.env.TEST_BROWSERS || '').replace(/^\s+|\s+$/, '') || 'PhantomJS').split(/\s*,\s*/g);

  // project configuration
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      client: [ 'client/{lib,test}/**/*.js' ]
      // TODO(nre): restructure back-end and enable
      // app: [ 'app/{lib,test}/**/*.js' ]
    },

    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'chore(project): release v<%= version %>',
        tagMessage: 'chore(project): tag v<%= version %>',
        npm: false
      }
    },

    clean: {
      client: [ 'public' , 'distro']
    },

    karma: {
      options: {
        configFile: 'client/test/config/karma.unit.js'
      },
      single: {
        singleRun: true,
        autoWatch: false,

        browsers: TEST_BROWSERS
      },
      unit: {
        browsers: TEST_BROWSERS
      }
    },

    browserify: {
      client: {
        src: 'client/lib/index.js',
        target: 'public/index.js'
      }
    },

    copy: {
      html: {
        files: [
          { src: 'client/lib/index.html', dest: 'public/index.html' }
        ]
      },
      fonts: {
        files: [
          {
            src: [
              'client/fonts/{app,bpmn}.*',
              'node_modules/dmn-js/fonts/dmn-js.*'
            ],
            dest: 'public/fonts',
            expand: true,
            flatten: true
          }
        ]
      }
    },

    less: {
      app: {
        options: {
          paths: [
            'client/lib',
            'client/styles',
            'node_modules'
          ]
        },
        files: {
          'public/css/style.css': 'client/styles/app.less'
        }
      }
    },

    distro: {
      darwin: {
        platform: 'darwin'
      },
      windows: {
        platform: 'win32'
      },
      linux: {
        platform: 'linux'
      }
    },

    watch: {
      less: {
        files: 'client/{lib,styles}/**/*.less',
        tasks: [ 'less' ]
      },
      copy: {
        files: 'client/lib/index.html',
        tasks: [ 'copy' ]
      },
      client: {
        files: 'public/**/*',
        options: {
          livereload: true
        }
      },
      app: {
        files: 'app/**/*',
        options: {
          livereload: true
        },
        tasks: [ 'mochaTest:app' ]
      }
    },

    connect: {
      client: {
        options: {
          base: 'public',
          port: 3010,
          livereload: true,
          open: true
        }
      }
    },

    mochaTest: {
      app: {
        src: ['./app/test/spec/**/*.js'],
        options: {
          reporter: 'spec',
          require: [ './app/test/expect' ]
        }
      }
    }
  });

  grunt.loadTasks('tasks');

  // tasks

  grunt.registerTask('lint', [ 'eslint' ]);

  grunt.registerTask('test', [ 'karma:single', 'mochaTest:app']);

  grunt.registerTask('auto-test', [ 'karma:unit' ]);

  grunt.registerTask('auto-test-app', [ 'mochaTest', 'watch:app' ]);

  grunt.registerTask('auto-build', [
    'clean',
    'browserify:client:watch',
    'less',
    'copy',
    'connect',
    'watch'
  ]);

  grunt.registerTask('package', [ 'distro:darwin', 'distro:windows', 'distro:linux' ]);

  grunt.registerTask('build-client', [
    'clean',
    'browserify:client',
    'less',
    'copy'
  ]);

  grunt.registerTask('default', [ 'lint', 'test', 'build-client', 'package' ]);
};
