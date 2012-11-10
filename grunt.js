'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    coffee: {
      app: {
        src: [ 'src/*.coffee' ],
        dest: 'temp',
        options: { bare: true }
      }
    },
    jasmine: {
      files: ['specs/**/*.html']
    },
    concat: {
      dist: {
        src: [
          'lib/jquery-1.8.2.js',
          'lib/json2.js',
          'lib/jquery.cookie.js',
          'temp/myna.js',
          'temp/main.js'
        ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      latest: {
        src: [
          'lib/jquery-1.8.2.js',
          'lib/json2.js',
          'lib/jquery.cookie.js',
          'temp/myna.js',
          'temp/main.js'
        ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.series %>.latest.js'
      },
      nodeps: {
        src: [
          'temp/myna.js'
        ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.version %>.js'
      },
      nodepsLatest: {
        src: [
          'temp/myna.js'
        ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.latest.js'
      }
    },
    min: {
      dist: {
        src: [ 'dist/<%= pkg.name %>-<%= pkg.version %>.js' ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      },
      latest: {
        src: [ 'dist/<%= pkg.name %>-<%= pkg.series %>.latest.js' ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.series %>.latest.min.js'
      },
      nodeps: {
        src: [ 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.js' ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.min.js'
      },
      nodepsLatest: {
        src: [ 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.latest.js' ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.latest.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-coffee');
  grunt.loadNpmTasks('grunt-jasmine');

  grunt.registerTask('default', 'coffee concat min');
  grunt.registerTask('test', 'coffee concat jasmine');

  // grunt.registerTask('default', 'Build and minify', function(type) {
  //   grunt.task.run([ 'coffee', 'concat', 'min' ]);
  // });
};
