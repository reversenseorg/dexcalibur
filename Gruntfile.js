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
            if (arguments.length === 1 && arguments[0]==='help') {
                  grunt.log.writeln('[HELP] '+this.name+" : [<profile_name>]");
                  return;
            }

            let output = grunt.config('build.output');

            output = _path_.join(__dirname,output);

              grunt.config.set('copy.core', {
                  expand: true,
                  dot: true,
                  cwd: 'dexcalibur',
                  src: 'inspectors/**/web/*',
                  dest: output
              });
              grunt.task.run(['copy:core']);

              [
                  './test/**/*',
                  './scripts/**/*',
                  './bin/**/*',
                  './node_modules/**/*',
                  './package.json',
                  './package-lock.json',
                  './dexcalibur',
                  './README.md',
                  './src/builtinref/**/*',
                  './src/requires/**/*',
                  './src/routes/**/*',
                  './src/scanner/**/*',
                  './src/webserver/**/*'
              ].map(function(pPath){
                  grunt.config.set('copy.core', {
                      expand: true,
                      dot: true,
                      cwd:'dexcalibur-ts',
                      src: pPath,
                      dest: output
                  });
                  grunt.task.run(['copy:core']);
              });



      });




    // +------------------------------------------------+
    // ----------------- RELEASE TASK -------------------
    // +------------------------------------------------+




};
