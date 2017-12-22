import ajax from '../ajax.js'
import Layer from './Layer'

const HEAT_SIZE_SCALE = 1.5;

function Heat( url, dataFunc, options ) {

	Layer.call( this, url, options )

	this.map = null;

	const layerOptions = {
		originX: this.originX,
		originY: this.originY,
		zoomReses: this.zoomReses
	}

	const heatmapOptions = {
		radius: options.radiusUnit === 'map' ? 20 : options.radius * HEAT_SIZE_SCALE,
		opacity: [ options.minOpacity, options.maxOpacity ],
		gradient: options.colors
	}

	const tiles = {}

	this.dataSet = []

	const _update = ( x, y, z, success, fail ) => {

		const reqUrl = this.getTileUrl( x, y, z )
		const tileInfo = [ x, y, z ];

		if ( !reqUrl ) return null;

		const key = x + ',' + y + ',' + z;

		if ( tiles[ key ] ) {
			fail();

			[].push.apply( this.dataSet,  tiles[ key ] )

			this._redraw();
			return;
		}

		ajax( reqUrl, {
			responseType: this.options.responseType,
			success: ( xhr, data ) => {

				data = JSON.parse( data );

				const dataPoints = dataFunc( tileInfo, data, layerOptions ) || [];

				tiles[ key ] = dataPoints;

				[].push.apply( this.dataSet, dataPoints )

				fail();

				this._redraw();

			},
			complete: ( xhr ) => {
				fail();
			}
		} );

	}

	this._redraw = () => {
		this._heatmap.setDataSet( {
			max: options.topValue,
			data: this.dataSet
		} )
	}


	this._layer = new AMap.TileLayer.Flexible( {
		createTile: _update,
		cacheSize: 1
	} )

	this._heatmap = new AMap.Heatmap( null, heatmapOptions );

	const methods = [ 'setMap', 'getMap', 'hide', 'show', 'getzIndex', 'setzIndex' ]

 	methods.map( key => {

		this[ key ] = function( arg ) {

			if ( key === 'setMap' ) {

				if ( arg && arg !== this.map ) {
					this.map = arg;

					if ( this.options.radiusUnit === 'map' ) {
						const res = this.map.getResolution();

						const heatSize = this.options.radius / res;

						heatmapOptions.radius = heatSize * HEAT_SIZE_SCALE;

						this._heatmap.setOptions( heatmapOptions );
					}

					this.map.on( 'zoomstart', () => {
						this.dataSet = [];
					} )

					this.map.on( 'zoomend', () => {

						if ( this.options.radiusUnit === 'map' ) {
							const res = this.map.getResolution();
							const heatSize = this.options.radius / res;

							heatmapOptions.radius = heatSize * HEAT_SIZE_SCALE;

							this._heatmap.setOptions( heatmapOptions );
						}
					} )
				}
			}

			this._layer[ key ]( arg );
			this._heatmap[ key ]( arg );
		}
	} )

	this.reload = function() {
		this._layer.reload();
	}

}

Heat.prototype = Object.assign( Object.create( Layer.prototype ), {

} )


export default Heat;
