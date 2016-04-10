/*jslint node: true */
'use strict';

var pkg = require('./package.json');
var fs = require('fs');
var compression = require('compression');

//Using exclusion patterns slows down Grunt significantly
//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
//this method is used to create a set of inclusive patterns for all subdirectories
//skipping node_modules, bower_components, dist, and any .dirs
//This enables users to create any directory structure they desire.
var createFolderGlobs = function (fileTypePatterns) {
    fileTypePatterns = Array.isArray(fileTypePatterns) ? fileTypePatterns : [fileTypePatterns];
    var ignore = ['node_modules', 'bower_components', 'components', 'vendor', 'temp'];
    var fs = require('fs');
    return fs.readdirSync(process.cwd())
          .map(function (file) {
              if (ignore.indexOf(file) !== -1 ||
                  file.indexOf('.') === 0 ||
                  !fs.lstatSync(file).isDirectory()) {
                  return null;
              } else {
                  return fileTypePatterns.map(function (pattern) {
                      return file + '/**/' + pattern;
                  });
              }
          })
          .filter(function (patterns) {
              return patterns;
          })
          .concat(fileTypePatterns);
};

var middlewareFn = function (connect, options, middlewares) {
    // inject a custom middleware into the array of default middlewares
    middlewares.unshift(compression());

    return middlewares;
};

module.exports = function (grunt) {
    var target = grunt.option('target') || 'dev'; // either dev or prod
    var version = grunt.option('ver') || pkg.version;
    var web3Provider = grunt.option('web3');
    var distDir = grunt.option('dist') || 'dist';
    var contracts = grunt.option('contracts');
    var contractFiles = grunt.option('contractFiles') || '../environments/development/contracts/*.sol.js';
    var configFile = 'app.config.auto.generated.js';
    var autoMsg = 'This is an auto generated file. Do not modify this file.';

    //var cacheBurster = '?rel=' + version;
    var cacheBurster = '';

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        connect: {
            main: {
                options: {
                    port: 9001,
                    hostname: '*',
                    middleware: middlewareFn,
                }
            },
            dist: {
                options: {
                    port: 9002,
                    hostname: '*',
                    base: distDir,
                    middleware: middlewareFn,
                }
            }
        },
        watch: {
            main: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false
                },
                files: [createFolderGlobs(['*.js', '*.scss', '*.html']), '!_SpecRunner.html', '!.grunt'],
                tasks: [] //all the tasks are run dynamically during the watch event handler
            }
        },
        replace:{
            dev:{
                options: {
                    patterns: [
                    {
                        json: {
                            'env': target,
                            'web3': web3Provider || 'http://localhost:8545',
                            'message': autoMsg,
                            'version': version,
                            'date': new Date(),
                            'contracts': contracts
                        }
                    }
                ]
                },
                files:[
                    {
                        src: 'app.config.js',
                        dest: configFile
                    }
                ]
            }
        },
        jshint: {
            main: {
                options: {
                    jshintrc: '.jshintrc',
                    verbose: true
                },
                src: [createFolderGlobs('*.js'), '!app.config.js', '!contracts.js']
            }
        },
        jscs: {
            src: [createFolderGlobs('*.js'), '!app.config.js', '!contracts.js'],
            options: {
                config: ".jscsrc",
                esnext: true, // If you use ES6 http://jscs.info/overview.html#esnext
                verbose: true, // If you need output with rule names http://jscs.info/overview.html#verbose
                fix: true, // Autofix code style violations when possible.
                requireCurlyBraces: ["if"],
                validateIndentation: 4
            }
        },
        clean: {
            before:{
                src:[distDir, 'temp', 'contracts.js'],
                options: {
                    force: true
                }
            },
            after: {
                src:['temp']
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: 'stylesheets',
                cssDir: 'temp',
                generatedImagesDir: 'temp/images/generated',
                imagesDir: 'images',
                javascriptsDir: 'scripts',
                fontsDir: distDir + '/fonts',
                importPath: 'bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/fonts',
                relativeAssets: false,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n',
                sourcemap: true
            },
            dist: {
                options: {
                    generatedImagesDir: 'images/generated'
                }
            },
            ui: {
                options: {
                    cssDir: './'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        ngtemplates: {
            main: {
                options: {
                    module: pkg.name,
                    htmlmin:'<%= htmlmin.main.options %>'
                },
                src: [createFolderGlobs('*.html'), '!index.html', '!_SpecRunner.html'],
                dest: 'temp/templates.js'
            }
        },
        copy: {
            main: {
                files: [
                  { src: ['images/**'], dest: distDir + '/' },
                  { src: ['tz/**'], dest: distDir + '/' },
                  { src: ['bower_components/components-font-awesome/fonts/**'],
                          dest: distDir + '/fonts/', filter:'isFile', flatten:true, expand: true },
                  { src: ['bower_components/components-font-awesome/fonts/**'],
                          dest: './fonts/', filter:'isFile', flatten:true, expand: true },
                  { src: ['bower_components/bootstrap/fonts/**'],
                          dest: distDir + '/fonts/bootstrap', filter:'isFile', flatten:true, expand: true },
                  { src: ['bower_components/bootstrap/fonts/**'],
                          dest: './fonts/bootstrap', filter:'isFile', flatten:true, expand: true }
                ]
            }
        },
        dom_munger:{
            read: {
                options: {
                    read:[
                      { selector:'script[data-concat!="false"]', attribute:'src', writeto:'appjs' },
                      { selector:'link[rel="stylesheet"][data-concat!="false"]',
                              attribute:'href', writeto:'appcss' }
                    ]
                },
                src: 'index.html'
            },
            update: {
                options: {
                    remove: ['script[data-remove!="false"]', 'link[data-remove!="false"]'],
                    append: [
                      { selector:'body',
                          html:'<script src="app.full.min.js' + cacheBurster + '"></script>' },
                      { selector:'head',
                          html:'<link rel="stylesheet" href="app.full.min.css' + cacheBurster + '">' }
                    ]
                },
                src:'index.html',
                dest: distDir + '/index.html'
            }
        },
        cssmin: {
            main: {
                src:['app.css', '<%= dom_munger.data.appcss %>'],
                dest:distDir + '/app.full.min.css'
            }
        },
        concat: {
            contracts: {
                src: [contractFiles],
                dest: 'contracts.js'
            },
            main: {
                src: ['<%= dom_munger.data.appjs %>', '<%= ngtemplates.main.dest %>'],
                dest: distDir + '/app.full.js'
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            main: {
                files: [{
                    src: [distDir + '/app.full.js'],
                    dest: distDir + '/app.full.js'
                }],
            },
        },
        uglify: {
            options: {
                sourceMap: true
            },
            main: {
                src: distDir + '/app.full.js',
                dest: distDir + '/app.full.min.js'
            }
        },
        htmlmin: {
            main: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                files: [{
                    src: [distDir + '/index.html'],
                    dest: distDir + '/index.html'
                }]
            }
        },
        imagemin: {
            main:{
                files: [{
                    expand: true, cwd:distDir + '/',
                    src:['**/{*.png,*.jpg}'],
                    dest: distDir + '/'
                }]
            }
        },
        karma: {
            options: {
                frameworks: ['jasmine'],
                files: [//this files data is also updated in the watch handler, if updated change there too
                  '<%= dom_munger.data.appjs %>',
                  'bower_components/angular-mocks/angular-mocks.js',

                  createFolderGlobs('*.spec.js')
                ],
                logLevel:'ERROR',
                reporters:['mocha'],
                autoWatch: false, //watching is handled by grunt-contrib-watch
                singleRun: true
            },
            all_tests: {
                browsers: ['PhantomJS']
            },
            during_watch: {
                browsers: ['PhantomJS']
            },
        }
    });

    grunt.registerTask('build', ['jshint', 'jscs', 'replace:dev',
          'clean:before', 'compass', 'dom_munger', 'ngtemplates', 'cssmin', 'concat',
          'ngAnnotate', 'uglify', 'copy', 'htmlmin', 'clean:after', 'imagemin']);
    grunt.registerTask('serve', ['dom_munger:read', 'jshint', //'jscs',
          'connect', 'watch']);
    grunt.registerTask('test', ['dom_munger:read', 'karma:all_tests']);
    grunt.registerTask('integration', ['jshint', 'jscs', 'clean:before', 'replace:dev',
          'compass', 'dom_munger', 'ngtemplates', 'cssmin', 'concat', 'ngAnnotate', 'uglify',
          'copy', 'htmlmin', 'clean:after']);

    grunt.event.on('watch', function (action, filepath) {
        //https://github.com/gruntjs/grunt-contrib-watch/issues/156

        var tasksToRun = [];

        if (filepath.lastIndexOf('.js') !== -1 &&
            filepath.lastIndexOf('.js') === filepath.length - 3) {

            //lint the changed js file
            grunt.config('jshint.main.src', filepath);
            grunt.config('jscs.src', filepath);
            tasksToRun.push('jshint');
            tasksToRun.push('jscs');

            //find the appropriate unit test for the changed file
            var spec = filepath;
            if (filepath.lastIndexOf('.spec.js') === -1 ||
              filepath.lastIndexOf('.spec.js') !== filepath.length - 8) {
                spec = filepath.substring(0, filepath.length - 3) + '.spec.js';
            }

            //if the spec exists then lets run it
            if (grunt.file.exists(spec)) {
                var files = [].concat(grunt.config('dom_munger.data.appjs'));
                files.push('bower_components/angular-mocks/angular-mocks.js');
                files.push(spec);
                grunt.config('karma.options.files', files);
                tasksToRun.push('karma:during_watch');
            }
        }

        //if index.html changed, we need to reread the <script> tags so our next run of karma
        //will have the correct environment
        if (filepath === 'index.html') {
            tasksToRun.push('dom_munger:read');
        }

        if (filepath.lastIndexOf('.scss') !== -1) {
            tasksToRun.push('compass');
        }

        //tasksToRun.push('replace:' + target);
        grunt.config('watch.main.tasks', tasksToRun);

    });
};
