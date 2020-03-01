// webpack.config.js
const StyleLintPlugin = require('stylelint-webpack-plugin');
module.exports = {
    plugins: [
        new StyleLintPlugin({
            files: ['**/*.{vue,htm,html,css,sss,less,scss,sass}'],
        })
    ],
    module: {
        rules: [{
            enforce: 'pre',
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            exclude: /node_modules/
        }]
    }
}