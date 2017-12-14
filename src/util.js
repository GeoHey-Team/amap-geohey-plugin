export function merge( objs ) { // (Object[, Object, ...])
    var sources = Array.prototype.slice.call( arguments, 1 );

    var i, j, len, src;
    for ( j = 0, len = sources.length; j < len; j++ ) {
        src = sources[ j ] || {};
        for ( i in src ) {
            if ( src.hasOwnProperty( i ) ) {
                objs[ i ] = src[ i ];
            }
        }
    }

    return objs;
}

export function isObject( obj ) {
    return ( Object.prototype.toString.call( obj ) === '[object Object]' );
}

export function isArray( obj ) {
    return ( Object.prototype.toString.call( obj ) === '[object Array]' );
}

export function isString( obj ) {
    return ( Object.prototype.toString.call( obj ) === '[object String]' );
}

export function isFunction( obj ) {
    return ( Object.prototype.toString.call( obj ) === '[object Function]' );
}

export function renderString( template, data ) { // template variable must be {A~Z|a~z|0~9|_}, not case-sensitive.
    if ( !template ) {
        return '';
    }

    return template.replace( /\{ *([\w]+) *\}/gi, function( template, key ) {
        var value = data[ key ];
        return ( value === undefined ) ? '' : value;
    } );
}