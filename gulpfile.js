  /////////////////////////////////////////
 // Required							//
/////////////////////////////////////////

var gulp 		= require('gulp'), // Подключаем Gulp
	browserSync = require('browser-sync'), // Подключаем Browser Sync
	uglify 		= require('gulp-uglify'), // Подключаем gulp-uglifyjs (для сжатия JS)
	plumber 	= require('gulp-plumber'),
	compass 	= require('gulp-compass'),
	concat 		= require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
	uglify 		= require('gulp-uglify'), // Подключаем gulp-uglifyjs (для сжатия JS)
	rename 		= require('gulp-rename'), // Подключаем библиотеку для переименования файлов
	del 		= require('del'), // Подключаем библиотеку для удаления файлов и папок
	imagemin 	= require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
	pngquant 	= require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
	spritesmith = require('gulp.spritesmith'), // Подключаем библиотеку для работы со спрайтамы
	autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
	cache 		= require('gulp-cache'), // Подключаем библиотеку кеширования
	htmlmin 	= require('gulp-htmlmin'),
	jade 		= require('gulp-jade'),
	rename 		= require('gulp-rename');

  /////////////////////////////////////////
 // Jade tasks							//
/////////////////////////////////////////
gulp.task('jade', function() {
	return gulp.src('app/jade/**/*.jade')
		.pipe(plumber())
	.pipe(jade({
		pretty: true
	}))
	.pipe(gulp.dest('app'));
});

  /////////////////////////////////////////
 // HTML tasks							//
/////////////////////////////////////////
// gulp.task('html', function(){
// 	gulp.src('app/*.html')
// 	.pipe(htmlmin({
// 		collapseWhitespace: true
// 	}))
// 	.pipe(gulp.dest('app'))
// 	.pipe(browserSync.reload({stream:true}));
// });

  /////////////////////////////////////////
 // Compass/Sass Tasks					//
/////////////////////////////////////////
gulp.task('compass', function() {
	gulp.src('./app/sass/**/*.sass')
		.pipe(plumber({
			errorHandler: function (error) {
			console.log(error.message);
			this.emit('end');
		}}))
		.pipe(compass({
			config_file: 'config.rb',
			css: 'app/css',
			sass: 'app/sass'
		}))
	.on('error', function(err) {
		// Would like to catch the error here 
	})
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream:true}));
});

  /////////////////////////////////////////
 // Spritesmith Tasks					//
/////////////////////////////////////////
gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/sprite/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'sprite.sass',
    algorithm: 'top-down',
    padding: 10
  }));
  return spriteData.pipe(gulp.dest('app/img'));
});

  /////////////////////////////////////////
 // Browser-Sync Tasks					//
/////////////////////////////////////////
gulp.task('browser-sync', function(){
	browserSync({
		server: {
			baseDir: 'app'
		}
	});
});
  /////////////////////////////////////////
 // Script Tasks						//
/////////////////////////////////////////
gulp.task('scripts', function(){
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jquery/public/jquery.min.js', // Берем jQuery
		'app/libs/magnific-popup/public/jquery.magnific-popup.min.js' // Берем Magnific Popup
		])
		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

  /////////////////////////////////////////
 // Public Tasks						//
/////////////////////////////////////////
gulp.task('clean', function() {
	return del.sync('public'); // Удаляем папку public перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('public/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'scripts'], function() {

	var buildCss = gulp.src([ // Переносим библиотеки в продакшен
		'app/css/style.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('public/css'))

	var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
	.pipe(gulp.dest('public/fonts'))

	var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
	.pipe(gulp.dest('public/js'))

	var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
	.pipe(gulp.dest('public'));

});

gulp.task('clear', function (callback) {
	return cache.clearAll();
})

  /////////////////////////////////////////
 // Watch Tasks							//
/////////////////////////////////////////
gulp.task('watch', ['browser-sync',  'jade', 'compass'], function(){
	gulp.watch('app/jade/*.jade', ['jade']);
	gulp.watch('app/sass/**/*.sass', ['compass']);
	gulp.watch('app/js/**/*.js', browserSync.reload);
	gulp.watch('app/*.html', browserSync.reload);
});
  /////////////////////////////////////////
 // Default tasks						//
/////////////////////////////////////////
gulp.task('default', ['watch']);