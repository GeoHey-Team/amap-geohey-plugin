import ajax from '../ajax.js'
import Layer from './Layer'

function Timed( layerList, options ) {

	Layer.call( this, null, options )

	this._playing = false;

}

Timed.prototype = Object.assign( Object.create( Layer.prototype ), {

	play() {},

	stop() {},

	pause() {},
} )


export default Timed;