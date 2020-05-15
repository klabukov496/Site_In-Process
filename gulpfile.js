// Объявляем текстовые переменные определяющие пути хранения файлов проекта
//
let project_folder = "dist";
let source_folder = "#src";

let path = {

	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
	},

	src: {
		html: [source_folder + "/*.html", "!" + source_folder +"/_*.html"],
		css: [source_folder + "/scss/*.scss", source_folder + "/scss/custom.scss"],
		less: source_folder + "/less/*.less",
		js: source_folder + "/js/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.ttf",
		distrCss: source_folder + "/css/*.css"
	},

	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
	},

	clean:"./" + project_folder + "/"
}

// ... пути в том числе для компиляции LESS
var config = {
	paths: {
		less: source_folder + "/less/*.less" 
	},
	output: {
		cssname: 'rezstyle.css',
		path: project_folder + "/css/"
	}
};


// Создаем переменные-объекты для работы скрипта
//
let {src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require("browser-sync").create(),
	fileinclude = require("gulp-file-include"),
	del = require("del"),
	scss = require("gulp-sass"),
	autoprefixer = require("gulp-autoprefixer"),
	group_media = require("gulp-group-css-media-queries"),
	clean_css = require("gulp-clean-css"),
	rename = require("gulp-rename");

// ... в том числе для компиляции LESS
var less_comp = require('gulp-less');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');


// Определяем функции для работы модуля

// Конфигурация и запуск 'browserSync'
//
function browserSync(params) {

	browsersync.init({

			server: {
				baseDir: "./" + project_folder + "/"
			},
			port:3000,
			notify: false
		})
}

// Получаем все исходные html файлы из Srс, импортируем определенные директивой @import файлы ("склеиваем") и сохраняем в dest
//
function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

// Получаем все исходные Img файлы из Srс, и сохраняем в dest
//
function img() {
	return src(path.src.img)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

// Получаем все исходные Js файлы из Srс, и сохраняем в dest
//
function js() {
	return src(path.src.js)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

// Используя метод 'watch' (объекта gulp) отслеживаем изменения html, scss в Src и  случае наличия изменений вызываем task-и: 'html', 'css' 
//
function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.js], js);
	gulp.watch(config.paths.less, less);

}

// Очищаем все файлы в Dest перед новым выводом
//
function clean(params) {
	return del(path.clean);
}


// Комплируем файлы Sass из папки Src - в файлы css в Dest
// 1. получаем исходные *.scss из Src
// 2. компилируем в *.css используя скрипт 'gulp-sass'
// 3. группируем медиазапросы используя скрипт 'gulp-group-css-media-queries'
// 4. расставляем вендорные префиксы при помощи скрипта 'gulp-autoprefixer'
// 5. выводим в Dest полную версию *.css
// 6. выполняем "минификацию" css используя скрипт 'gulp-clean-css'
// 7. переменовываем в  ".min.css"
// 8. выводим минифицированную версию css в Dest
// 9. по итогам компиляции, используя метод 'stream' утилиты 'browserSync', в Doom дереве сервера - обновляем все изменения css файлов

function css() {
	return src(path.src.css)
		.pipe (
			scss({
				outputStyle: "expanded"
				})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 version"],
				cascade: true
				})
		)
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(
			rename({
				extname: ".min.css"
				})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}


// Переносим в dest дистрибутивы css не требующие обработки (bootstrap3 и т.п.)
// 
function distrCss() {
	return src(path.src.distrCss)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}


// Обрабатываем LESS
// 
function less() {
	// получаем все файлы less, 
	// инициализируем sourcemaps, 
	// компилируем less в css, 
	// объединение всех less в rezstyle.css, 
	// добавление автопрефиксов, 
	// минификация css, 
	// куда сохранять результат, 
	// синхронизация
 
	return src(path.src.less)
		.pipe(less_comp())
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}

// Запускаем task-и:
// [build] Построение проекта: очищаем и выводим в Dest: [результаты компиляции Sass и пересобранные html файлы ]
// [watch] Отслеживаем изменения: 
// - запускаем сервер BrowserSync
// - отслеживаем изменения
// - перестраиваем проект [build]

let build = gulp.series(clean, gulp.parallel(css, less, html, img, distrCss, js));
let watch = gulp.parallel(build, watchFiles, browserSync);

// Опции командной строки gulp 
//
exports.css = css;
exports.less = less;
exports.distrCss = distrCss;
exports.html = html;
exports.img = img;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;
