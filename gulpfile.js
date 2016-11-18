require('colors');
var del = require('del');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var less = require('gulp-less');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var path = require('path');
var runGulp = require('run-gulp-task');
var removeUseStrict = require("gulp-remove-use-strict");
var browserify = require('browserify');
var pkgFilePath = path.join(process.cwd(), 'package.json');
var pkg = require(pkgFilePath);
var glob = require('glob');
var source = require('vinyl-source-stream');
var babelify = require('babelify');


function err(error) {
    console.error('[ERROR]'.red + error.message);
    this.emit('end');
}

gulp.task('clean', function(cb) {
    del(['build'], cb);
});

var ifless = function(file) {
    var extname = path.extname(file.path);
    return extname === '.less' ? true : false;
};

gulp.task('css', ['clean'], function() {
    return gulp.src(['src/**/*.css', 'src/**/*.less'])
        .pipe(plumber(err))
        .pipe(gulpif(ifless, less()))
        .pipe(gulp.dest('build'));
});

// 读取更新后的package.json
gulp.task('update_pkg', () => {
    delete require.cache[require.resolve(pkgFilePath)];
    try {
        pkg = require(pkgFilePath);
    } catch (e) {
        console.error('[ERROR]'.red + 'package.json is not avaliable');
    }
});



gulp.task('js', ['clean'], function() {
    //const fileList = glob.sync('src/js/module/*.js');
    //console.info(fileList);

    const fileList = glob.sync('src/js/pages/**/*.js');
    console.info(fileList);
    fileList.forEach(function(folder) {
        console.log(folder);
        var componentName = folder.match(/(\w+).js$/)[1];
        return browserify(folder)
            .transform("babelify", {presets: ["es2015", "react"]})
            .bundle()

            //Pass desired output filename to vinyl-source-stream
            .pipe(source(componentName + '.js'))
            .pipe(gulp.dest('build/' + componentName));
    });
});

gulp.task("copy", ["clean"], function() {
    return gulp.src(["src/**/*.png", "src/**/*.xtpl", "src/**/*.jpg", "src/**/*.jpeg", "src/**/*.gif", "src/**/*.html", "src/**/*.htm", "src/**/*.ttf", "src/**/*.eot", "src/**/*.svg", "src/**/*.woff"])
        .pipe(gulp.dest("build"));
});

gulp.task("watch", [], function() {
    runGulp('default', gulp)
        .then(() => {
            gulp.watch(['src/**/*.js', '!src/seed.js', 'src/**/*.xtpl'], ["js", "seed2demo"]);
            gulp.watch(['src/**/*.css', 'src/**/*.less'], ["css"]);
            gulp.watch(['./package.json'], ['update_pkg', 'js']);
        });
});


gulp.task('default', ['clean', 'css', 'js', 'copy']);
