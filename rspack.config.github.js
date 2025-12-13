const path = require('path');
const rspack = require('@rspack/core');

/**
 * @type {import('@rspack/core').Configuration}
 */
module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.github.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].js',
    clean: true,
    publicPath: process.env.PUBLIC_PATH || '/childrendiary/'
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
                  development: false,
                  refresh: false
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
      minify: true
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
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.PUBLIC_PATH': JSON.stringify(process.env.PUBLIC_PATH || '/childrendiary/'),
      'import.meta.env.BASE_URL': JSON.stringify(process.env.PUBLIC_PATH || '/childrendiary/'),
      'import.meta.env.MODE': JSON.stringify('production'),
      'import.meta.env.DEV': JSON.stringify(false),
      'import.meta.env.PROD': JSON.stringify(true)
    })
  ],
  optimization: {
    minimize: true,
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
  devtool: false,
  performance: {
    hints: false
  }
};