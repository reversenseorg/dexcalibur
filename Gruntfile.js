const _path_ = require('path');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    build: {
        output: 'dist'
    }
  });

  // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // +------------------------------------------------+
  // ----------------- BUILD TASK ---------------------
  // +------------------------------------------------+

  grunt.registerTask(
      'build',
      'To build final package including non-TS required resources',
      function(pProfile){

            let output = _path_.join(__dirname,grunt.config('build.output')); //,'dexcalibur-ts');

              /*grunt.config.set('copy.core', {
                  expand: true,
                  dot: true,
                  cwd: 'dexcalibur',
                  //src: 'inspectors/web/',
                  dest: output
              });
              grunt.task.run(['copy:core']);*/

              let srcs = [
                  './test/**/*',
                  './scripts/**/*',
                  './bin/**/*',
                  './node_modules/**/*',
                  './package.json',
                  './package-lock.json',
                  './dexcalibur',
                  './README.md',
    //              './src/builtinref/**/*',
                  './src/requires/**/*',
    //              './src/routes/**/*',
    //              './src/scanner/**/*',
    //              './src/webserver/**/*',
                  './inspectors/**/web/*'
              ];

              grunt.config.set('copy.core', {
                  expand: true,
                  dot: true,
                  src: srcs,
                  dest: output
              });
              grunt.task.run(['copy:core']);
      });
};
