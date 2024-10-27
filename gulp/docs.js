/* ============== VARS ============== */

const gulp = require('gulp');

/** Include
 * для использования include в html файлах
 * 
 */
const fileInclude = require('gulp-file-include'); //

/** htmlclean
 * 
 * 
 */
const htmlclean = require('gulp-htmlclean');

/** webphtml
 * 
 * 
 */
const webphtml = require('gulp-webp-html');

/** подключаем sass
 * @sassGlob - необходим для упрощенного подключения частей файлов scss
 */
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');

/** autoprefixer
 * 
 * 
 */
const autoprefixer = require('gulp-autoprefixer');

/** gulp-csso
 * 
 * 
 */
const csso = require('gulp-csso');

/** Исходные карты для scss
 * 
 * 
 */
// const sourceMaps = require('gulp-sourcemaps');

/** webpcss
 * 
 * 
 */
const webpcss = require('gulp-webp-css');

/** сервер обновления страницы
 * 
 * 
 */
const server = require('gulp-server-livereload');

/** удаление папки dist - gulp-clean
 * @fs - для работы с файловой системой
 * 
 */
const clean = require('gulp-clean');
const fs = require('fs');

/** Объединяем медиа запросы
 * заблокировано, так как при использовании ломает исходные карты
 * 
 */
const groupMedia = require('gulp-group-css-media-queries');

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
 * @imageminWebp - улучшенная обработка фото
 * @rename - переименовании обработанных фото
 */
const imageMin = require('gulp-imagemin');
const imageminWebp = require('imagemin-webp');
const rename = require('gulp-rename');

/** webp
 * 
 * 
 */
const webp = require('gulp-webp');

/** 
 * использование в картинках, HTML, JS, CSS
 * 
 */
const changed = require('gulp-changed');

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
 * htmlclean() - убират все пробелы и переносы в файле html
 * webphtml() - автоматически добавляет теги picture и sorce для использования webp изображения
 */
gulp.task('html:docs', function () {
    return gulp.src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
        .pipe(changed('./docs/'))
        .pipe(plumber(plumberNotify('html')))
        .pipe(fileInclude({ fileIncludeConfig }))
        .pipe(webphtml())
        .pipe(htmlclean())
        .pipe(gulp.dest('./docs/'))
});

/** SASS
 * обработка scss файлов
 * все файлы в папке scss вне зависимости от вложенности
 * sourceMaps.init() - инициализируем карты scss
 * sourceMaps.write() - записываем данные значений scss
 * groupMedia() - обрабатываем запросы на объединения media запросов /пока отключено, ломаются sourceMaps, groupMedia() - должна быть подключена до sass() тогда исходные карты не ломаются
 * plumber(plumberSassConfig) - для отслеживания ошибок, и их отображения
 * autoprefixer - для добавления префиксов
 * csso - минификация файла css, убирает все пробелы и отступы
 */
gulp.task('sass:docs', function () {
    return gulp.src('./src/scss/*.scss')
        .pipe(changed('./docs/css'))
        .pipe(plumber(plumberNotify('SCSS')))
        // .pipe(sourceMaps.init())
        .pipe(autoprefixer())
        .pipe(sassGlob())
        .pipe(webpcss())
        .pipe(groupMedia())
        .pipe(sass())
        .pipe(csso())
        // .pipe(sourceMaps.write())
        .pipe(gulp.dest('./docs/css'))
});

/** images
 * Копирование изображений
 * @src - любая папка внутри img и любой файл
 * webp() - конвертация в webp картинку, работаем в два этапа, сначала проверяем картинки изменились они или нет, затем преобразовываем в webp сохраняем в папку dest, а потом опять берем и этой папки обрабатываем уже через imagemin и возвращаем в папку dest, все это используется с changed() чтобы так же не обрабатывать уже готовые файлы
 * @imageMin - есть проблема с именованием через плагин rename он все подряд переименовывает с папками, надо найти решение чтобы папки не трогал, или другой плагин надо
*/
gulp.task('images:docs', function () {
    return gulp.src('./src/img/**/*')
        .pipe(changed('./docs/img/'))
        .pipe(webp())
        // .pipe(
        //     imageMin([
        //         imageminWebp({
        //             quality: 85,
        //         }),
        //     ])
        // )
        // .pipe(rename({ extname: '.webp' }))
        .pipe(gulp.dest('./docs/img/'))
        .pipe(gulp.src('./src/img/**/*'))
        .pipe(changed('./docs/img/'))
        .pipe(
            imageMin(
                [
                    imageMin.gifsicle({ interlaced: true }),
                    imageMin.mozjpeg({ quality: 85, progressive: true }),
                    imageMin.optipng({ optimizationLevel: 5 }),
                ],
                { verbose: true }
            )
        )
        .pipe(gulp.dest('./docs/img/'))
});

/** fonts
 * Копирование шрифтов
 * @src - любая папка внутри img и любой файл
 */
gulp.task('fonts:docs', function () {
    return gulp.src('./src/fonts/**/*')
        .pipe(changed('./docs/fonts/'))
        .pipe(gulp.dest('./docs/fonts/'))
});

/** files
 * Копирование файлов для загрузки и скачивания на сайте
 * @src - любая папка внутри img и любой файл
 */
gulp.task('files:docs', function () {
    return gulp.src('./src/files/**/*')
        .pipe(changed('./docs/files/'))
        .pipe(gulp.dest('./docs/files/'))
});

/** JS
 * src('./src/js/*.js') - забираем все файлы в папке js и объеденяем в один файл
 * файл js будет для каждой страницы, после чего он объединяется в один файл js
 * документация по нему в файле webpack.config.js
 * plumberNotify('JS') - добавляем для отслеживания ошибок
 * babel() - конфиг добавляем в файле packege.json
 */
gulp.task('js:docs', function () {
    return gulp.src('./src/js/*.js')
        .pipe(changed('./docs/js/'))
        .pipe(plumber(plumberNotify('JS')))
        .pipe(babel())
        .pipe(webpack(require('../webpack.config.js')))
        .pipe(gulp.dest('./docs/js'))
});

/** server
 * @src - забираем файлы для просмотра из папки dist
 * 
 */
gulp.task('server:docs', function () {
    return gulp.src('./docs/')
        .pipe(server(startServerConfig))
});

/** clean
 * удаление папки dist при запуске таска
 * @done - условие дает возможность проверки если папки dist нет, то не будет ошибки папки
 * @clean({read: false}) - дает возможность удалить принудительно файлы
 */
gulp.task('clean:docs', function (done) {
    if (fs.existsSync('./docs/')) {
        return gulp.src('./docs/')
            .pipe(clean())
    }
    done();
});
