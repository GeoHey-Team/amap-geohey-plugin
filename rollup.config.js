import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import packageInfo from './package.json'

const banner = `/*
 * GeoHey AMap Plugin v${ packageInfo.version }
 * GeoHey.com
 */
`;

export default {
	input: 'src/mapviz.js',
	output: {
		file: 'dist/amap-geohey-plugin.js',
		format: 'umd',
		name: 'GMapViz',
		banner: banner,
		sourcemap: false
	},
	legacy: false,
	plugins: [
		resolve(),
		babel({
	      exclude: 'node_modules/**'
	    })
	]
};
