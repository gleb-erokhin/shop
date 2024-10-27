const gulp = require('gulp');
require('./gulp/dev.js');
require('./gulp/docs.js');

/* ============== USE TASK ============== */

/** Исполняемый файл gulp dev
 * 
 * 'clean' - запуск таска очистки файлов строго только его
 * 'html', 'sass', 'images' - запуск всех остальных тасков для работы с файлами
 * 'server', 'watch' - и только в конце в любом порядке обновление страницы и слежение за файлами
 */
gulp.task('default', gulp.series(
    'clean:dev',
    gulp.parallel('html:dev', 'sass:dev', 'images:dev', 'fonts:dev', 'files:dev', 'js:dev'),
    gulp.parallel('server:dev', 'watch:dev')
));

/** Исполняемый файл gulp docs - production
 * 
 */
gulp.task('docs', gulp.series(
    'clean:docs',
    gulp.parallel('html:docs', 'sass:docs', 'images:docs', 'fonts:docs', 'files:docs', 'js:docs'),
    gulp.parallel('server:docs')
));