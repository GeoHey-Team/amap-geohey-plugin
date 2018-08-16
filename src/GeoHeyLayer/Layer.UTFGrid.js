import ajax from '../ajax.js'
import Layer from './Layer'
import WebMercator from '../web-mercator.js'

function UTFGrid( url, options ) {

	Layer.call( this, url, options )

	this.map = null;

	this._visible = true;

	this._window = new AMap.InfoWindow( {
		autoMove: false
	} );

	this._tiles = {}

	const _update = ( x, y, z, success, fail ) => {

		const reqUrl = this.getTileUrl( x, y, z )
		const tileInfo = [ x, y, z ];

		if ( !reqUrl ) return null;

		const key = x + ',' + y + ',' + z;

		if ( this._tiles[ key ] ) {
			fail();
			return;
		}

		ajax( reqUrl, {
			responseType: this.options.responseType,
			success: ( xhr, data ) => {

				data = JSON.parse( data );

				if ( !data || !data.data || !data.data.keys || ( data.data.keys.length == 1 && data.data.keys[ 0 ] == '' ) ) {
					return false;
				}

				this._tiles[ key ] = data.data;

				fail();

			},
			complete: ( xhr ) => {
				fail();
			}
		} );

	}

	this._layer = new AMap.TileLayer.Flexible( {
		createTile: _update,
		cacheSize: 0
	} )

	const methods = [ 'setMap', 'getMap', 'hide', 'show', 'getzIndex', 'setzIndex' ]

	methods.map( key => {

		this[ key ] = function( arg ) {

			if ( key === 'setMap' ) {

				if ( arg && arg !== this.map ) {
					this.map = arg;

					this.map.on( 'mousemove', this._onMouseMove, this );

				}
			}

			if ( key === 'hide' || key === 'show' ) {
				this._visible = key === 'show';
			} 

			this._layer[ key ]( arg );
		}
	} )

	this.reload = function() {
		this._layer.reload();
	}

}

UTFGrid.prototype = Object.assign( Object.create( Layer.prototype ), {

	getData( tileInfo, gridX, gridY ) {

		let key = tileInfo.join( ',' );
		let data = this._tiles[ key ];

		if ( data && data.grid ) {
			let idx = this._decode( data.grid[ gridY ].charCodeAt( gridX ) );
			key = data.keys[ idx ];
			return data.data[ key ];
		}
	},

	showData( data, lnglat ) {

		if ( !this.map ) return;

		if ( !data ) {
			
			this._window.close();

		} else {
			let html = '';
			for ( let key in data ) {
				if ( key === '_id' ) continue; // 不显示_id字段
				html += `<div style="height: 20px;
							font-size: 13px;
							line-height: 20px;
							color: #333;
							overflow: hidden;
							white-space: nowrap;">
							<span style="color: #777;">${ key }: </span><span>${ data[ key ] }</span></div>`
			}

			this._window.setContent( html );

			if ( this._window.getIsOpen() ) {
				this._window.setPosition( lnglat );
			} else {
				this._window.open( this.map, lnglat )
			}

		}
	},

	_decode: function( c ) {
		if ( c >= 93 ) {
			c--;
		}
		if ( c >= 35 ) {
			c--;
		}
		return c - 32;
	},

	_onMouseMove: function( e ) {

		if ( !this._visible ) {
			return;
		}

		const { originX, originY, zoomReses, tileSize } = this

		const res = this.map.getResolution();

		const z = this.map.getZoom();

		const [ mapX, mapY ] = WebMercator.project( e.lnglat.lng, e.lnglat.lat );

		const screenX = ( mapX - originX ) / res;
		const screenY = ( originY - mapY ) / res;

		const tileMapSize = tileSize * zoomReses[ z ];

		const gridSize = tileMapSize / res;

		const factor = gridSize / tileSize;
		const gridRes = factor * 4;

		const x = Math.floor( screenX / gridSize );
		const y = Math.floor( screenY / gridSize );

		const gridX = Math.floor( ( screenX - ( x * gridSize ) ) / gridRes );
		const gridY = Math.floor( ( screenY - ( y * gridSize ) ) / gridRes );

		const tileInfo = [ x, y, z ];

		const data = this.getData( tileInfo, gridX, gridY );

		if ( this.options.onMouseMove ) {
			this.options.onMouseMove( data, e.lnglat );
		}

		if ( this.options.showAttr ) {
			this.showData( data, e.lnglat );
		}

	},
} )


export default UTFGrid;