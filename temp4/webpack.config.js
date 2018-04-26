var path = require('path');
var webpack = require('webpack');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './src/ts/Application.js',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
        ]
    },
    resolve: {
        alias: {
            'three/MTLLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/MTLLoader.js'),
            'three/OBJLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/OBJLoader.js'),
            'three/TrackballControls': path.join(__dirname, 'node_modules/three/examples/js/controls/TrackballControls.js'),
            'three/TransformControls': path.join(__dirname, 'node_modules/three/examples/js/controls/TransformControls.js'),
        }
    },
    plugins:[
        new webpack.ProvidePlugin({
            'THREE': 'three'
        }),
    ]
}