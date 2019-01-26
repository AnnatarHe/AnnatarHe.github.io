import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default {
  input: 'src/js/app.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    uglify()
  ],
}
