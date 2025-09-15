import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    mode: 'development',
    entry: {
        app: './src/index.tsx',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '...']
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env",
                            ["@babel/preset-react", { runtime: "automatic" }],
                            "@babel/preset-typescript"
                        ],
                    }
                }
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            hash: true,
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '' },
            ],
        }),
    ],
    output: {
        publicPath: '/react-router',
    },
    devtool: 'inline-source-map',
    devServer: {
        port: 3000,
        open: '/react-router/#/react-router/',
        hot: true,
        historyApiFallback: true,
        static: false,
    }
};