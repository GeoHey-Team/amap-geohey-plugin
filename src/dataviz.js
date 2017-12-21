import Constants from './constants.js'
import MapVizLayers from './mapviz-layers.js'
import ajax from './ajax.js'

const getLayers = MapVizLayers.getLayers;

function getDataContent( data ) {
    let dataContent = JSON.parse( JSON.stringify( data ) );
    for ( let i = 0; i < dataContent.length; i++ ) {
        let item = dataContent[ i ];
        item.config = item.vizConfig;
        item.visible = true;
        delete item.vizConfig;
    }
    return dataContent;
}

function get( data, options, map ) {

    options = options || {};

    options.uri = options.uri || Constants.uri;

    if ( !options.host ) {
        options.host = Constants.domain;
        options.tileHost = Constants.tileHost;
        options.cluster = Constants.geoheyServerCluster;
    }

    let dataContent = getDataContent( data );

    let layerList = dataContent ? getLayers( dataContent, options, true ) : [];

    if ( map && map instanceof AMap.Map ) {

        let layerArray = [];

        for ( let i = 0; i < layerList.length; i++ ) {

            let item = layerList[ i ];
            let layer = item.layer;

            layer.setzIndex( i + 1 );
            layer.setMap( map );

            if ( item.utfGridLayer ) {
                item.utfGridLayer.setMap( map );
            }

            layerArray.push( {
                uid: item.dataUid,
                type: item.dataType
            } );

        }

        layerArray.reverse();

    }

    return layerList;
}

export { get }
