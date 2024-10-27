const config = {
    // тип сборки, для прода
	mode: 'production',
	entry: {
        // откуда будем забирать файлы, все пути
		index: './src/js/index.js',
		// contacts: './src/js/contacts.js',
		// about: './src/js/about.js',
	},
	output: {
        // заготовка для исходного файла JS
		filename: '[name].bundle.js',
	},
	module: {
        // подключаем модули для обработки стилей
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
};

// экспортируем конфиг чтобы его забрать в gulpfile
module.exports = config;
