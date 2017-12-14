let _ajaxSeq = 0;
function ajax( url, options ) {
    if ( !url ) {
        return;
    }

    var ajaxOptions = options || {};

    var context = ajaxOptions.context || this;

    var appendQueryParam = function( url, key, value ) {
        if ( key === undefined || value === undefined ) {
            return url;
        }

        url += ( url.match( /\?/ ) ? '&' : '?' );
        url += ( key + '=' + encodeURIComponent( value ) );
        return url;
    };

    var trySuccess = function( req, data ) {
        if ( success ) {
            success.call( context, req, data );
        }
    };
    var tryError = function( req ) {
        if ( error ) {
            error.call( context, req );
        }
    };
    var tryComplete = function( req ) {
        if ( complete ) {
            complete.call( context, req );
        }
    };

    // HTTP request parameters
    var type = ( ajaxOptions.type || 'GET' ).toUpperCase() === 'POST' ? 'POST' : 'GET',
        contentType = ajaxOptions.contentType,
        headers = ajaxOptions.headers || {},
        data = ajaxOptions.data || {},
        responseType = ( ajaxOptions.responseType || 'DATA' ).toUpperCase(), // DATA|TEXT|XML|JSON|JSONP
        jsonp = ajaxOptions.jsonp || '_g_jsonp_' + ( _ajaxSeq++ ),
        jsonpCallback = ajaxOptions.jsonpCallback || 'callback',
        success = ajaxOptions.success,
        error = ajaxOptions.error,
        complete = ajaxOptions.complete;

    var loadCallback, key, script;

    type = ( responseType === 'JSONP' ) ? 'GET' : type; // JSONP only support GET method

    if ( type === 'GET' ) {
        for ( key in data ) {
            url = appendQueryParam( url, key, data[ key ] );
        }

        data = null;
    } else {
        var postData = '';
        for ( key in data ) {
            postData = appendQueryParam( postData, key, data[ key ] );
        }
        if ( postData[ 0 ] === '?' ) {
            postData = postData.slice( 1 );
        }

        data = postData;

        contentType = contentType || 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    if ( responseType === 'JSONP' ) {
        url = appendQueryParam( url, jsonpCallback, jsonp );

        script = document.createElement( 'script' );　
        script.src = url;
        script._g_jsonp_ = jsonp;

        window[ jsonp ] = function( json ) {
            script._g_jsonp_value_ = json;
            window[ jsonp ] = null;

            if ( script.parentNode ) {
                script.parentNode.removeChild( script );
            }
        };

        loadCallback = function() {
            if ( script._g_abort_ ) {
                return;
            }

            if ( !script.readyState /*FF*/ ||
                script.readyState == 'loaded' || script.readyState == 'complete' ) {

                if ( !script.success ) {
                    script.success = true;

                    trySuccess( script, script._g_jsonp_value_ );
                    tryComplete( script );
                }
            }
        };

        if ( 'onload' in script ) {
            script.onload = loadCallback;
        } else {
            script.onreadystatechange = loadCallback;
        }

        script.onerror = function() {
            tryError( script );
            tryComplete( script );
        };

        var head = document.getElementsByTagName( 'head' )[ 0 ];
        head.appendChild( script );
        return script;
    } else {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject( 'Microsoft.XMLHTTP' );

        if ( !xhr ) {
            return;
        }

        loadCallback = function() {
            if ( xhr.readyState == 4 ) {
                if ( xhr.status == 200 || xhr.status == 304 ) {
                    var responseData;
                    if ( responseType === 'TEXT' ) {
                        responseData = xhr.responseText;
                    } else if ( responseType === 'XML' ) {
                        responseData = xhr.responseXML;
                    } else if ( responseType === 'JSON' ) {
                        /*jslint evil: true */
                        responseData = eval( '(' + xhr.responseText + ')' );
                    } else {
                        responseData = xhr.response;
                    }

                    trySuccess( xhr, responseData );
                } else {
                    tryError( xhr );
                }

                tryComplete( xhr );
            }
        };

        xhr.onload = loadCallback;

        xhr.onerror = function() {
            tryError( xhr );
            tryComplete( xhr );
        };

        xhr.open( type, url, true );

        if ( contentType ) {
            xhr.setRequestHeader( 'Content-Type', contentType );
        }

        for ( key in headers ) {
            xhr.setRequestHeader( key, headers[ key ] );
        }

        xhr.send( data );

        return xhr;
    }

}

export default ajax;