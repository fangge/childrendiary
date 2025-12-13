const path = require('path');
const rspack = require('@rspack/core');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * @type {import('@rspack/core').Configuration}
 */
module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    main: './src/index.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].js',
    clean: true,
    publicPath: process.env.PUBLIC_PATH || '/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: true
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  development: isDev,
                  refresh: isDev
                }
              }
            }
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ],
        type: 'javascript/auto'
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: !isDev
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'server/data',
          to: 'data',
          globOptions: {
            ignore: ['**/*.js']
          }
        }
      ]
    }),
    new rspack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.PUBLIC_PATH': JSON.stringify(process.env.PUBLIC_PATH || '/'),
      'import.meta.env.BASE_URL': JSON.stringify(process.env.PUBLIC_PATH || '/'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV || 'development'),
      'import.meta.env.DEV': JSON.stringify(isDev),
      'import.meta.env.PROD': JSON.stringify(!isDev)
    }),
    ...(isDev ? [new ReactRefreshPlugin()] : [])
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    static: [
      {
        directory: path.join(__dirname, 'server/data'),
        publicPath: '/data'
      }
    ],
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    ]
  },
  optimization: {
    minimize: !isDev,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: 'react-vendor',
          priority: 20
        }
      }
    }
  },
  devtool: isDev ? 'cheap-module-source-map' : false,
  performance: {
    hints: false
  }
};