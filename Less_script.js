var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer'); (автоматическое добавление префиксов для разных браузеров)
var cleancss = require('gulp-clean-css'); (сжатие css файла)
var browsersync = require('browser-sync').create(); (автоматическое обновление)



var less = require('gulp-less'); (преобразуем все файлы less в css)
var concat = require('gulp-concat'); (все файлы less, данного проекта, сохраняем в один файл rezstyle.css)
var sourcemaps = require('gulp-sourcemaps'); (отслеживание позиции изменения less файла)



var config = {
	paths:{
		less: './lessfiles/**/*.less', // путь к файлам less
		html: './index.html' // путь к index.html
	}
	output:{
		cssname: 'rezstyle.css', // все файлы less, данного проекта, сохраняем в один файл rezstyle.css
		path: 'css1' // путь к файлу css
	}
};




gulp.task('less', function(){
	// получаем все файлы  less,
	// инициализируем sourcemaps,
	// компилируем less в css,
	// объединение всех less в rezstyle.css,
	// добавление автопрефиксов,
	// минификация css,
	// куда сохранять результат,
	// синхронизация

	return gulp.src(config.paths.less)
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(concat(config.output.cssname))
		.pipe(autoprefixer())
		.pipe(cleancss())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.output.path))

		.pipe(browsersync.stream());
});



gulp.task('serve', function(){
	browsersync.init({
		server: {
			basedir: config.output.path
		}
	});

	// смотреть за файлами всеми less
	gulp.watch(config.paths.less, ['less']);
	gulp.watch(config.paths.html).on('change', browsersync.reload);

});




// запуск функций less и serve
gulp.task('default', ['less', 'serve']);
