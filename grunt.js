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
    concat: {
      dist: {
        src: [ 'lib/json2.js', 'lib/jquery.cookie.js', 'temp/myna.js' ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      },
      latest: {
        src: [ 'lib/json2.js', 'lib/jquery.cookie.js', 'temp/myna.js' ],
        dest: 'dist/<%= pkg.name %>-<%= pkg.series %>.latest.js'
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
      }
    }
  });

  grunt.loadNpmTasks('grunt-coffee');

  grunt.registerTask('default', 'coffee concat min');

};