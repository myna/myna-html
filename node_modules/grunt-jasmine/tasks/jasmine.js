/*
 * grunt-jasmine
 * https://github.com/dong-ilgim/grunt-jasmine
 *
 * Copyright (c) 2012 Dong-il Kim
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

    // Please see the grunt documentation for more information regarding task and
    // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerMultiTask('jasmine', 'Test unit by jasmine.', function() {
        var jasmine = require("jasmine-node").executeSpecsInFolder;
        var specFolder = this.file.src,
            isVerbose = false,
            showColors = true;
        var onComplete = function(runner, log) {
            if (runner.results().failedCount === 0) {
                grunt.log.writeln('Pass to jasmine unit test : ' + specFolder);
                done(true);
            } else {
                grunt.verbose.error();
                throw grunt.task.taskError("Can't pass to jasmine unit test");
            }
        };

        var done = this.async();
        jasmine(specFolder,
            onComplete,
            isVerbose,
            showColors);
    });

    // ==========================================================================
    // HELPERS
    // ==========================================================================

    grunt.registerHelper('jasmine', function() {
        return 'jasmine!!!';
    });

};
