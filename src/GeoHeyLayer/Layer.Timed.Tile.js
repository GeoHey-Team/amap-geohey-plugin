import ajax from '../ajax.js'
import Timed from './Layer.Timed.js'

function TimedTile( layerList, options ) {

	Timed.call( this, null, options )

	this._layerList = layerList || [];

	this._current = 0;

	this.map = null;

	this._playing = false;

	this._visible = true;


}

TimedTile.prototype = Object.assign( Object.create( Timed.prototype ), {

	setMap( map ) {

		this.map = map;

		const layer = this._layerList[ this._current ];

		layer && layer.setMap( map );

	},

	getMap() {

		return this.map;

	},

	setzIndex( index ) {

		this.map = map;

		const layer = this._layerList[ this._current ];

		layer && layer.setzIndex( index );

	},

	getzIndex() {

		return this.map;

	},

	hide() {
		this._visible = false;

		const layer = this._layerList[ this._current ];

		layer && layer.hide();
	},

	show() {
		this._visible = true;

		const layer = this._layerList[ this._current ];

		layer && layer.show();
	},

	_layerLoadedHandler () {

		var layer = this._layerList[ this._current ];
		layer._allLoaded = true;
        layer.off( 'complete', this._layerLoadedHandler, this);

        if ( !this._playing ) return;

        this._timeout = setTimeout( () => {
        	this._next()
        }, this.options.duration * 1000 );

	},

	_next () {

		let current = this._current;
		let index = current + 1;
		index = index > this._layerList.length - 1 ? 0 : index;
		let layer = this._setIndex( index );

		if ( !layer._allLoaded ) {
			layer.on( 'complete', this._layerLoadedHandler, this );
		} else {
			this._layerLoadedHandler()
		}
	},

	_setIndex: function ( index ) {

		if ( !this.map || !this._layerList || index < 0 || index > this._layerList.length - 1 ) return null;

		const currentLayer = this._layerList[ this._current ];

		currentLayer && currentLayer.setMap( null );

		this._current = index;

		var layer = this._layerList[ this._current ];

		layer.setMap( this.map );

		if ( this._visible ) {
			layer.show();
		} else {
			layer.hide();
		}

		return layer;
	},

	setLayers( layers ) {
		this._layerList = layers;
	},

	play() {

		if ( this._playing ) return;

		this._playing = true;

		var layer = this._setIndex( this._current );

		if ( !layer._allLoaded ) {
			layer.on( 'complete', this._layerLoadedHandler, this );
		} else {
			this._layerLoadedHandler();
		}

	},

	stop() {

		this._playing = false;
		clearTimeout( this._timeout );
		this._setIndex( 0 );

	},
	pause() {

		this._playing = false;
		clearTimeout( this._timeout );

	}
} )


export default TimedTile;