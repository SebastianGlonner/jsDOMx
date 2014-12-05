/**
 * @param  {Grunt} grunt
 */
module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      MyTarget: {
        files: {
          'bin/jsDOMx.min.js': ['src/jsDOMx.js']
        },
        options: {
          'screw-ie8': true,
          'mangle': {
            'sort': true,
            'toplevel': true
          },
          'compress': true,
          'lint': true
        }
      }
    },
    watch: {
      options: {
        livereload: {
          port: 35731
        }
      },
      files: [
        'tests/specs/jsDOMxSpec.js',
        'src/jsDOMx.js'
        // 'bin/jsx.js'
      ],
      tasks: [
        'uglify'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['watch']);

};
