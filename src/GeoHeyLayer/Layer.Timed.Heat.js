import ajax from '../ajax.js'
import Heat from './Layer.Heat.js'
import Timed from './Layer.Timed.js'

function TimedHeat( url, dataFunc, options ) {

	Timed.call( this, url, options )
	Heat.call( this, url, dataFunc, options )

	this._t = 0;

	this._redraw = () => {

		const data = this.dataSet.filter( item => {

			if ( item.attr && item.attr.t ) {
				const t = item.attr.t;

				if ( this.options.timeAccumulate ) {
					return t <= this._t;
				}

				return t === this._t;
			}

			return true;
		} )

		this._heatmap.setDataSet( {
			max: options.topValue,
			data
		} );
	}

}

TimedHeat.prototype = Object.assign( Object.create( Timed.prototype ), Object.create( Heat.prototype ), {

	_next() {

		this._t++;

		this._t = this._t > this.options.frameCount ? 1 : this._t;

		this._redraw()

		this._timeout = setTimeout( () => {
        	this._next()
        }, this.options.duration * 1000 );

	},

	play() {

		if ( this._playing ) return;

		this._playing = true;
		this._next()

	},
	pause() {

		this._playing = false;
		clearTimeout( this._timeout );

	},
	stop() {

		this._playing = false;
		this._t = 0;
		clearTimeout( this._timeout );

	}
} )


export default TimedHeat;