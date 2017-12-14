import { merge, isArray, isFunction, renderString } from '../util.js'

function Layer( url, options ) {

	this.url = url;
	this.options = options;

} 

Layer.prototype = {
	constructor: Layer,

	tileSize: 256,

	originX: -20037508.342784,
	originY: 20037508.342784,

	zoomReses: [
		156543.033928,
		78271.516964,
		39135.758482,
		19567.879241,
		9783.9396205,
		4891.96981025,
		2445.984905125,
		1222.9924525625,
		611.49622628125,
		305.748113140625,
		152.8740565703125,
		76.43702828515625,
		38.21851414257813,
		19.10925707128906,
		9.554628535644531,
		4.777314267822266,
		2.388657133911133,
		1.194328566955567,
		0.597164283477783,
		0.298582141738892
	],

	getTileUrl( idxX, idxY, zoom ) {

		const url = this.url;
		const cluster = this.options.cluster;

		if ( !url ) {
			return null;
		}

		const scale = this.options.scale || 1;

		const tileUrlPattern = isFunction( url ) ? url( zoom, idxX, idxY, scale ) : url;

		let server;
		if ( isArray( cluster ) && cluster.length > 0 ) {
			const i = Math.abs( idxX + idxY ) % cluster.length;
			server = cluster[ i ];
		}

		return renderString( tileUrlPattern, merge( {
			s: server,
			z: zoom,
			x: idxX,
			y: idxY,
			i: scale > 1 ? '@2x' : ''
		}, this.options ) );

	},

	setTileUrl( url ) {

		this.url = url;

	},

	setMap() {},

	getMap() {},

	setzIndex() {},

	getzIndex() {},

	hide() {},

	show() {},
}

export default Layer;
