import Constants from './constants.js'
import MapVizLayers from './mapviz-layers.js'
import ajax from './ajax.js'

const getLayers = MapVizLayers.getLayers;

function get( uid, options, map, callback ) {

    options = options || {};

    options.uri = options.uri || Constants.uri;

    if ( !options.host ) {
        options.host = Constants.domain;
        options.tileHost = Constants.tileHost;
        options.cluster = Constants.geoheyServerCluster;
    }

    let url = options.host + '/s/mapviz/' + uid;

    if ( options.ak ) {
        url += '?ak=' + options.ak;
    }

    if ( !options.tileHost ) {
        options.tileHost = options.host;
    }

    ajax( url, {
        type: 'GET',
        error: function( req ) {
            console.error( 'mapviz请求失败' );
        },
        success: function( xhr, res ) {
            let data = JSON.parse( res );
            if ( data.code !== 0 ) {
                console.error( data.code + ':' + data.msg );
                return;
            };

            let dataContent = data.data.content;
            let mapContent = data.data.map;

            let list = dataContent ? getLayers( dataContent, options ) : [];

            let result = {
                mapData: mapContent,
                setting: data.data.setting,
                vizData: data.data,
                layerList: list
            }

            if ( map && map instanceof AMap.Map ) {

                let layerList = result.layerList;

                for ( let i = 0; i < layerList.length; i++ ) {

                    let item = layerList[ i ];
                    let layer = item.layer;

                    layer.setzIndex( i + 1 );
                    layer.setMap( map );

                    if ( item.utfGridLayer ) {
                        item.utfGridLayer.setMap( map )
                    }

                }
            }

            if ( typeof callback === 'function' ) {
                callback( result );
            }
        }
    } );
}

export { get }