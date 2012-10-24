module.exports = function(grunt) {

  grunt.initConfig({
    coffee: {
      app: {
        src: [ 'src/*.coffee' ],
        dest: 'dist',
        options: { bare: true }
      }
    },
    concat: {
      dist: {
        src: [
          'lib/json2.js',
          'lib/jquery.cookie.js',
          'dist/myna.js'
        ],
        dest: 'dist/jquery.myna.js'
      }
    },
    min: {
      dist: {
        src: [ 'dist/jquery.myna.js' ],
        dest: 'dist/jquery.myna.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-coffee');

  grunt.registerTask('default', 'coffee concat min');

};