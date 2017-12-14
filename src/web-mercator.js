const DEGREE_PER_RADIAN = 180 / Math.PI;

var WebMercator = {
    a: 6378137,
    max: 20037507.842788246,

    project: function( lon, lat ) {
        var self = WebMercator, // 不可用this，因调用的context不定
            f = DEGREE_PER_RADIAN,
            r = self.a,
            x = lon / f * r,
            sine = Math.sin( lat / f ),
            y = r / 2 * Math.log( ( 1 + sine ) / ( 1 - sine ) );

        if ( !self._isCoordinates( lon, lat ) ) {
            throw new Error( "Type of coordinates should be number" );
        }

        if ( y === Infinity ) {
            y = self.max;
        } else if ( y === -Infinity ) {
            y = -self.max;
        }

        return [ x, y ];
    },

    unproject: function( x, y ) {
        var self = WebMercator, // 不可用this，因调用的context不定
            f = DEGREE_PER_RADIAN,
            r = self.a,
            xRad = x / r,
            PI = Math.PI,
            lonR = xRad - ( Math.floor( xRad / PI / 2 + 0.5 ) * PI * 2 ),
            latR = PI / 2 - ( Math.atan( Math.exp( -y / r ) ) * 2 );

        if ( !self._isCoordinates( x, y ) ) {
            throw new Error( "Type of coordinates should be number" );
        }

        return [ lonR * f, latR * f ];
    },

    _isCoordinates: function( lon, lat ) {
        return typeof lon === 'number' && typeof lat === 'number';
    }
};

export default WebMercator;