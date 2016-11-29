module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			dist: {
				options: {
					outputStyle: 'compressed'
				},
				files: {
					'public/css/style.css': 'public/css/sass/style.scss'
				}
			}
		},

		autoprefixer: {
			dist: {
				files: {
					'public/css/style.css': 'public/css/style.css'
				}
			}
		},

		svgstore: {
			options: {
				cleanup: true,
				prefix: 'svg_',
				formatting: {
					indent_with_tabs: true
				},
				svg: {
					style: "display: none;"
				}
			},
			default: {
				files: {
					'public/svg-symbols.html' : ['svg/*.svg']
				}
			}
		},

		watch: {
			sass: {
				files: 'public/css/**/*.scss',
				tasks: ['sass', 'autoprefixer']
			},

			svg: {
				files: 'public/svg/*.svg',
				tasks: ['svgstore']
			},

			live_reload: {
				options: {
					livereload: true
				},
				files: ['public/css/*.css']
				// files: ['public/css/*.css', 'public/js/*.js']
			}
		}

	});

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-svgstore');
	grunt.loadNpmTasks('grunt-newer');

	grunt.registerTask('default', ['sass', 'autoprefixer', 'svgstore', 'watch']);
};