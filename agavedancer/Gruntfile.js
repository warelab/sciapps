'use strict';

var _ = require('lodash');
var moment = require('moment');

module.exports = function (grunt) {
  require('jit-grunt')(grunt);
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  var lessifyOptions = {
    plugins: [
      new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]})
    ]
  };

  grunt.initConfig({
    env: {
      dev: {
        NODE_ENV : 'development',
        isDev : true
      },
      prod: {
        NODE_ENV : 'production',
        isDev : false
      }
    },

    browserify: {
      dev: {
        options: {
          browserifyOptions: {
            debug: true
          },
          transform: [
            ['node-lessify', lessifyOptions],
            ['babelify', {presets: ["es2015", "react"]}]
          ]
        },
        src: './public/javascripts/index.js',
        dest: './public/javascripts/bundle.js'
      },
      production: {
        options: {
          transform: [
            ['node-lessify', lessifyOptions],
            ['babelify', {presets: ["es2015", "react"]}],
            ['uglifyify', {global: true}]
          ],
          browserifyOptions: {
            debug: false
          }
        },
        src: '<%= browserify.dev.src %>',
        dest: '<%= browserify.dev.dest %>'
      }
    },

	jest: {
		options: {
			config: './jest.config.json'
		}
	},

    watch: {
      browserify: {
        files: ['./public/javascripts/**/*', './public/styles/*.less'],
        tasks: ['browserify:dev'],
      }
    },

    copy: {
      assets: {
        files: [
          {expand: true, cwd: 'assets/', src: ['**'], dest: 'build/assets/'}
        ]
      }
    }
  });

  grunt.registerTask('test', ['grunt-jest']);
  grunt.registerTask('default', ['env:dev', 'browserify:dev']);
  grunt.registerTask('package', ['env:prod', 'browserify:production']);
};
