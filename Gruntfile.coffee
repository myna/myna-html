#global module:false
module.exports = (grunt) ->
  pkg = grunt.file.readJSON("package.json")

  name        = pkg.name
  series      = pkg.series
  # Grunt 0.3 allows version numbers of the format "x.y".
  # Grunt 0.4 requires "x.y.z".
  # For backwards compatibility we strip the last ".0" off.
  version     = if /\.0$/.test(pkg.version)
                  pkg.version.substring(0, pkg.version.length - 2)
                else
                  pkg.version

  jasminePort = 8001


  standaloneBanner =
    """
    /*!
     * #{pkg.description} v#{version} (standalone)
     * Copyright 2012 Myna Ltd
     * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
     * Published: #{grunt.template.today("yyyy-mm-dd")}
     * Includes:
     *  - jQuery 1.8.2 http://jquery.com/download
     *  - JSON.{parse,stringify} https://raw.github.com/douglascrockford/JSON-js/master/json2.js
     *  - jQuery Cookie https://github.com/carhartl/jquery-cookie
     */
    """

  nodepsBanner =
    """
    /*!
     * #{pkg.description} v#{version} (no dependencies)
     * Copyright 2012 Myna Ltd
     * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
     * Published: #{grunt.template.today("yyyy-mm-dd")}
     * Dependencies:
     *  - jQuery 1.5+ http://jquery.com/download
     *  - JSON.{parse,stringify} https://raw.github.com/douglascrockford/JSON-js/master/json2.js
     *  - jQuery Cookie https://github.com/carhartl/jquery-cookie
     */

    """

  grunt.initConfig({
    pkg: pkg

    coffee:
      app:
        expand: true
        cwd: "src/"
        src: [ "*.coffee" ]
        dest: "temp/"
        options: { bare: true }
        ext: ".js"

    connect:
      jasmineSite:
        options:
          port: jasminePort
          base: "."

    jasmine:
      options:
        host: "http://127.0.0.1:#{jasminePort}/"
        outfile: "myna-html-specrunner.html"
        keepRunner: true
        specs: "specs/*spec.js"
        template: "specs/specrunner.template.html"
      standalone:
        src: "dist/myna-html-1.latest.js"
        options:
          helpers: [ "specs/base.js" ]
      nodeps:
        src: "dist/myna-html-nodeps-1.latest.js"
        options:
          helpers: [ "lib/jquery-1.8.2.js", "specs/base.js" ]

    concat:
      dist:
        src: [
          "lib/jquery-1.8.2.js"
          "lib/json2.js"
          "lib/jquery.cookie.js"
          "temp/myna.js"
          "temp/main.js"
        ]
        dest: "dist/#{name}-#{version}.js"
        options: { banner: standaloneBanner }
      latest:
        src: [
          "lib/jquery-1.8.2.js"
          "lib/json2.js"
          "lib/jquery.cookie.js"
          "temp/myna.js"
          "temp/main.js"
        ]
        dest: "dist/#{name}-#{series}.latest.js"
        options: { banner: standaloneBanner }
      nodeps:
        src: [ "temp/myna.js" ]
        dest: "dist/#{name}-nodeps-#{version}.js"
        options: { banner: nodepsBanner }
      nodepsLatest:
        src: [ "temp/myna.js" ]
        dest: "dist/#{name}-nodeps-#{series}.latest.js"
        options: { banner: nodepsBanner }

    uglify:
      dist:
        src: [ "dist/#{name}-#{version}.js" ]
        dest: "dist/#{name}-#{version}.min.js"
      latest:
        src: [ "dist/#{name}-#{series}.latest.js" ]
        dest: "dist/#{name}-#{series}.latest.min.js"
      nodeps:
        src: [ "dist/#{name}-nodeps-#{version}.js" ]
        dest: "dist/#{name}-nodeps-#{version}.min.js"
      nodepsLatest:
        src: [ "dist/#{name}-nodeps-#{series}.latest.js" ]
        dest: "dist/#{name}-nodeps-#{series}.latest.min.js"
  })

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-jasmine"
  grunt.loadNpmTasks "grunt-contrib-uglify"

  grunt.registerTask "default", [ "coffee", "concat", "uglify" ]
  grunt.registerTask "test", [ "coffee", "concat", "connect:jasmineSite", "jasmine" ]
