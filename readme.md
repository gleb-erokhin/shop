# html
  |-*blocks*
  |    |- header.html
  |    |- footer.html
  |    |- nav.html
  |
  |-*blog*
  |    |- post1.html
  |    |- post2.html
  |
  |- contacts.html    
  |- index.html


1.  @@include('./../blocks/header.html') - подключаем в файле post1.html
2.  @@include('blocks/header.html') - подключаем в файле index.html
3. <a href="./../index.html">Main page</a> - ссылка со страницы post.html



/** 
 * 
 * 
 */
gulp.task('xxxx', function () {
    return gulp.src('./src/*.html')
        .pipe()
        .pipe(gulp.dest('./dist/'))
});
/** 
 * 
 * 
 */
gulp.task('xxxx', function () {
    return gulp.src('./src/')
        .pipe()
        .pipe()
});

/** 
 * 
 * 
 */
const xxx = require('xxx');

const { error } = require('console');
const { title } = require('process');
const changed = require('gulp-changed');