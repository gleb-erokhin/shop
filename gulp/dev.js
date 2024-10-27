/* ============== VARS ============== */

const gulp = require('gulp');
const fileInclude = require('gulp-file-include'); // для использования include в html файлах

/** подключаем sass
 * @sassGlob - необходим для упрощенного подключения частей файлов scss
 */
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');

/** сервер обновления страницы
 * 
 * 
 */
const server = require('gulp-server-livereload');

/** удаление папки dist / docs - gulp-clean
 * @fs - для работы с файловой системой
 * 
 */
const clean = require('gulp-clean');
const fs = require('fs');

/** Исходные карты для scss
 * 
 * 
 */
const sourceMaps = require('gulp-sourcemaps');

/** отображение ошибок
 * 
 * 
 */
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

/** webpack
 * 
 * 
 */
const webpack = require('webpack-stream');

/** bable
 * добавляем в таск JS
 * 
 */
const babel = require('gulp-babel');

/** imagemin
 * для сжатия картинок
 * 
 */
const imageMin = require('gulp-imagemin');

/** 
 * использование в картинках, HTML, JS, CSS
 * 
 */
const changed = require('gulp-changed');

/** replace
 * меняет пути к фото до необходимого, а при разработке мы пишем путь полный как начнет подсказывать VScode
 * 
 */
const replace = require('gulp-replace');


/* ============== VARS ============== */

/** конфиг для includeFiles
 * 
 * 
 */
const fileIncludeConfig = {
    prefix: '@@',
    basepath: '@file'
}

/** конфиг для startServer
 * 
 * 
 */
const startServerConfig = {
    livereload: true,
    open: true
}

/* ============== FUNCTIONS ============== */

/** функция для plumber
 * @title - передаем в переменную параметр для наблюдения, html, scss каждый в своих тасках
 * 
 */
const plumberNotify = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        })
    }
}


/* ============== TASKS ============== */

/** HTML
 * include for HTML
 * объеденяем все файлы для html, позволяет разделять блоки в разные файлы
 * plumber(plumberNotify('html')) - отслеживание ошибок при работе с файлами, передаем функцию plumberNotify('html') - со значением html
 * ['path', '!path'] - при необходимости забирать html из разных папок можно с помощью массива передавать в src, ! знак исключает добавление в сборку
 */
gulp.task('html:dev', function () {
    return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        .pipe(changed('./build/', { hasChanged: changed.compareContents }))
        .pipe(plumber(plumberNotify('html')))
        .pipe(fileInclude({ fileIncludeConfig }))
        .pipe(
            replace(
                /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
                '$1./$4$5$7$1'
            ))
        .pipe(gulp.dest('./build/'))
});

/** SASS
 * обработка scss файлов
 * все файлы в папке scss вне зависимости от вложенности
 * sourceMaps.init() - инициализируем карты scss
 * sourceMaps.write() - записываем данные значений scss
 * groupMedia() - обрабатываем запросы на объединения media запросов /пока отключено, ломаются sourceMaps/
 * plumber(plumberSassConfig) - для отслеживания ошибок, и их отображения
 */
gulp.task('sass:dev', function () {
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./build/css'))
        .pipe(plumber(plumberNotify('SCSS')))
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(
            replace(
                /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
                '$1$2$3$4$6$1'
            )
        )
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./build/css'))
});

/** images
 * Копирование изображений
 * @src - любая папка внутри img и любой файл
*/
gulp.task('images:dev', function () {
    return gulp.src('./src/img/**/*')
        .pipe(changed('./build/img/'))
        // .pipe(imageMin({ verbose: true }))
        .pipe(gulp.dest('./build/img/'))
});

/** fonts
 * Копирование шрифтов
 * @src - любая папка внутри img и любой файл
 */
gulp.task('fonts:dev', function () {
    return gulp.src('./src/fonts/**/*')
        .pipe(changed('./build/fonts/'))
        .pipe(gulp.dest('./build/fonts/'))
});

/** files
 * Копирование файлов для загрузки и скачивания на сайте
 * @src - любая папка внутри img и любой файл
 */
gulp.task('files:dev', function () {
    return gulp.src('./src/files/**/*')
        .pipe(changed('./build/files/'))
        .pipe(gulp.dest('./build/files/'))
});

/** JS
 * src('./src/js/*.js') - забираем все файлы в папке js и объеденяем в один файл
 * файл js будет для каждой страницы, после чего он объединяется в один файл js
 * документация по нему в файле webpack.config.js
 * plumberNotify('JS') - добавляем для отслеживания ошибок
 * babel() - конфиг добавляем в файле packege.json для совместимости старых браузеров
 */
gulp.task('js:dev', function () {
    return gulp.src('./src/js/*.js')
        .pipe(changed('./build/js/'))
        .pipe(plumber(plumberNotify('JS')))
        // .pipe(babel())
        .pipe(webpack(require('./../webpack.config.js')))
        .pipe(gulp.dest('./build/js'))
});

/** server
 * @src - забираем файлы для просмотра из папки dist
 * 
 */
gulp.task('server:dev', function () {
    return gulp.src('./build/')
        .pipe(server(startServerConfig))
});

/** clean
 * удаление папки dist при запуске таска
 * @done - условие дает возможность проверки если папки dist нет, то не будет ошибки папки
 * @clean({read: false}) - дает возможность удалить принудительно файлы
 */
gulp.task('clean:dev', function (done) {
    if (fs.existsSync('./build/')) {
        return gulp.src('./build/', { read: false })
            .pipe(clean())
    }
    done();
});

/** watch
 * *.scss, *.html - слежение за изменениями во всех файлах, любой уровень вложенности
 * ./src/img/ - смотрим за любыми файлами в папке img
 */
gulp.task('watch:dev', function () {
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
    gulp.watch('./src/**/*.html', gulp.parallel('html:dev'));
    gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
    gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
});


