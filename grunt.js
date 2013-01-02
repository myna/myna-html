'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      standaloneBanner: [
        '/*!',
        ' * <%= pkg.description %> v<%= pkg.version %> (standalone)',
        ' * Copyright 2012 Myna Ltd',
        ' * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)',
        ' * Published: <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * Includes:',
        ' *  - jQuery 1.8.2 http://jquery.com/download',
        ' *  - JSON.{parse,stringify} https://raw.github.com/douglascrockford/JSON-js/master/json2.js',
        ' *  - jQuery Cookie https://github.com/carhartl/jquery-cookie',
        ' */'
      ].join("\n"),
      nodepsBanner: [
        '/*!',
        ' * <%= pkg.description %> v<%= pkg.version %> (no dependencies)',
        ' * Copyright 2012 Myna Ltd',
        ' * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)',
        ' * Published: <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * Dependencies:',
        ' *  - jQuery 1.5+ http://jquery.com/download',
        ' *  - JSON.{parse,stringify} https://raw.github.com/douglascrockford/JSON-js/master/json2.js',
        ' *  - jQuery Cookie https://github.com/carhartl/jquery-cookie',
        ' */'
      ].join("\n")
    },
    coffee: {
      app: {
        src: [ 'src/*.coffee' ],
        dest: 'temp',
        options: { bare: true }
      }
    },
    jasmine: {
      //src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js', // This doesn't work
      src: 'dist/myna-html-1.latest.js',
      helpers: ['lib/**/*.js', 'specs/base.js'],
      specs: 'specs/*spec.js'
    },
    concat: {
      dist: {
        src: [
          '<banner:meta.standaloneBanner>',
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
          '<banner:meta.standaloneBanner>',
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
          '<banner:meta.nodepsBanner>',
          'temp/myna.js'
        ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.version %>.js'
      },
      nodepsLatest: {
        src: [
          '<banner:meta.nodepsBanner>',
          'temp/myna.js'
        ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.latest.js'
      }
    },
    min: {
      dist: {
        src: [
          '<banner:meta.standaloneBanner>',
          'dist/<%= pkg.name %>-<%= pkg.version %>.js'
        ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
      },
      latest: {
        src: [
          '<banner:meta.standaloneBanner>',
          'dist/<%= pkg.name %>-<%= pkg.series %>.latest.js'
        ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.series %>.latest.min.js'
      },
      nodeps: {
        src: [
          '<banner:meta.nodepsBanner>',
          'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.js'
        ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.min.js'
      },
      nodepsLatest: {
        src: [
          '<banner:meta.nodepsBanner>',
          'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.latest.js'
        ],
        dest: 'dist/<%= pkg.name %>-nodeps-<%= pkg.series %>.latest.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-coffee');
  grunt.loadNpmTasks('grunt-jasmine-runner');

  grunt.registerTask('default', 'coffee concat min');
  grunt.registerTask('test', 'coffee concat jasmine');

  // grunt.registerTask('default', 'Build and minify', function(type) {
  //   grunt.task.run([ 'coffee', 'concat', 'min' ]);
  // });
};
