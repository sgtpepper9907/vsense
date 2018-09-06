var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './index.js',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    target: 'node',
    externals: [nodeExternals()]
}