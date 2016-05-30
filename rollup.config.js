import babel from 'rollup-plugin-babel'

export default {
    entry: 'src/js/app.js',
    format: 'cjs',
    plugins: [babel()],
    dest: 'dist/bundle.js'
}
