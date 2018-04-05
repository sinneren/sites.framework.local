var gulp         = require('gulp');
var sass         = require('gulp-sass');
var minifycss    = require('gulp-clean-css');
var rename       = require('gulp-rename');
var browserSync  = require('browser-sync').create();
var jade         = require('gulp-jade');
var concat       = require('gulp-concat');
var imagemin     = require('gulp-imagemin');
var postcss      = require('gulp-postcss');
var cssnext      = require('postcss-cssnext');
var mqpacker     = require('css-mqpacker');
var runSequence  = require('run-sequence');
var svgSprite    = require('gulp-svg-sprites');
var cheerio      = require('gulp-cheerio');
var replace      = require('gulp-replace');

var appDir = './build';
var baseDir = './src';

var config = {
  server: {
    baseDir: appDir
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: 'sm',
  notify: false
};



gulp.task('browser-sync', ['styles', 'jade', 'modals', 'blocks', 'img'], function() {
  browserSync.init(config);
});

gulp.task('styles', function() {
  var processors = [
      cssnext({browsers: ['last 15 versions', '> 1%', 'ie 9']}),
      mqpacker()
  ];
  return gulp.src(baseDir + '/scss/**/*.scss')
    .pipe(sass({style: 'expanded', sourceComments: 'map'})
      .on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(appDir + '/css'))
    .pipe(rename({suffix: '.min', prefix: ''}))
    .pipe(minifycss({keepSpecialComments: 1}))
    .pipe(gulp.dest(appDir + '/css'))
    .pipe(browserSync.stream({
      files: [appDir + '/css/**/*.css']
    }));
});

gulp.task('jade', function() {
  return gulp.src(baseDir + '/pages/**/*.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(appDir))
    .pipe(browserSync.stream({
      files: [appDir + '/**/*.html']
    }));
});
gulp.task('modals', function() {
  return gulp.src(baseDir + '/modals/*.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(appDir + '/modals/'))
    .pipe(browserSync.stream({
      files: [appDir + '/modals/*.html']
    }));
});
gulp.task('img', function() {
  return gulp.src(baseDir + '/img/*')
    .pipe(imagemin({optimizationLevel: 5, progressive: true, interlaced: true}))
    .pipe(gulp.dest(appDir + '/img'));
});

gulp.task('sprite', function() {
  return gulp.src(baseDir + '/img/icons/**/*.svg')
    .pipe(cheerio({
      run: function($) {
        $('[fill]').removeAttr('fill');
      },
      parserOptions: { xmlMode: false }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode: 'symbols',
      preview: false,
      svg: {
        symbols: 'sprite.symbols.svg'
      }
    }))
    .pipe(gulp.dest(appDir + '/img/sprites/'));
});

/*Vendors generator*/
/*gulp.task('scripts', function() {
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/jquery-ui/jquery-ui.min.js',
    'bower_components/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js',
    'bower_components/jquery-modal/jquery.modal.js',
    'bower_components/swiper/dist/js/swiper.jquery.js',
    'bower_components/select2/dist/js/select2.js',
  ])
  .pipe(concat('vendors.js'))
  .pipe(gulp.dest(appDir + '/libs'))
  .pipe(rename({suffix: '.min', prefix: ''}));
});*/

/*Blocks generator*/
gulp.task('blocks', function() {
  return runSequence(
    'blocks:html',
    'blocks:css',
    'blocks:js'
  );
});
gulp.task('blocks:js', function() {
  return gulp.src(baseDir + '/blocks/**/*.js')
    .pipe(gulp.dest(appDir + '/blocks'))
    .pipe(browserSync.stream({
      files: [appDir + '/blocks/**/*.js']
    }));
});
gulp.task('blocks:html', function() {
  return gulp.src([baseDir + '/blocks/**/*.jade', '!' + baseDir + '/blocks/**/_*.jade'])
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest(appDir + '/blocks'))
    .pipe(browserSync.stream({
      files: [appDir + '/blocks/**/*.html']
    }));
});
gulp.task('blocks:css', function() {
  var processors = [
    cssnext({browsers: ['last 15 versions', '> 1%', 'ie 9']}),
    mqpacker()
  ];

  return gulp.src(baseDir + '/blocks/**/*.scss')
    .pipe(sass({style: 'expanded', sourceComments: 'map'})
      .on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(appDir + '/blocks'))
    .pipe(rename({suffix: '.min', prefix: ''}))
    .pipe(minifycss({keepSpecialComments: 1}))
    .pipe(gulp.dest(appDir + '/blocks'))
    .pipe(browserSync.stream({
      files: [appDir + '/blocks/**/*.css']
    }));
});

/*Watcher*/
gulp.task('watch', function() {
  gulp.watch(baseDir + '/**/*.scss', ['styles', 'blocks']);
  gulp.watch(baseDir + '/**/*.jade', ['jade', 'modals', 'blocks']);
  gulp.watch(baseDir + '/img/*', ['img']);
  gulp.watch(appDir + '/js/*.js').on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'watch']);
