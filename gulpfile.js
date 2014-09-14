var gulp = require('gulp')
  , karma = require('karma').server
  , connect = require('gulp-connect');

gulp.task('connect', function () {
  connect.server({
    root: '.'
  });
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  , singleRun: true
  }, done);
});

gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});
