// Read config files that may not exist.
const webpack = require('webpack');

module.exports = {
    // base url
    publicPath: process.env.NODE_ENV === 'production'
        ? '/explorer-smd/'
        : '/',
    // output dir
    outputDir: './dist',
    // eslint-loader check
    lintOnSave: true,
    // webpack-dev-server
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        historyApiFallback: true,  // SPAのルーティング対応
        open: true  // 自動でブラウザを開く
    },
    css: {
        // modules: true,
        loaderOptions: {
            sass: {
                prependData: '@import "~@/styles/variables.scss";'
            }
        }
    },
    configureWebpack: {
        resolve: {
            fallback: {
                https: require.resolve('https-browserify'),
                http: require.resolve('stream-http'),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                zlib: require.resolve('browserify-zlib'),
                querystring: require.resolve('querystring-es3'),
                path: require.resolve('path-browserify'),
                vm: require.resolve('vm-browserify'),
                fs: false,
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            })
        ]
    }
};
