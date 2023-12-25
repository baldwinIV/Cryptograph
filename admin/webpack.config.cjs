const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        main: './src/index.js',
        subpage: './src/coinmarketcap.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource'
            }
        ]
    },
    //https://velog.io/@bepyan/VanillaJS-Webpack5-HtmlWebpackPlugin
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html'
        }),
        new HtmlWebpackPlugin({
            filename: 'subpage.html',
            chunks: ['subpage'],
            template: './pages/coinmarketcap.html',
            minify: true
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist')
        },
        compress: true,
        port: 4000,
        open: true
    }
};

// https://yamoo9.gitbook.io/webpack/webpack/config-webpack-dev-environment/multi-page-application
