import { merge } from './util.js'
import ajax from './ajax.js'
import Constants from './constants.js'
import { create as createConfig } from './mapviz-config.js'
import { getLegendData } from './mapviz-legend.js'
import { 
    Heat as HeatLayer,
    UTFGrid as UTFGridLayer,
    TimedTile as TimedTileLayer,
    TimedHeat as TimedHeatLayer
} from './GeoHeyLayer'

import WebMercator from './web-mercator.js'

const retina = ( window.devicePixelRatio >= 1.5 ) ||
    ( window.matchMedia && window.matchMedia( '(-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5),(min-resolution: 1.5dppx)' ).matches );
const RETINA_STRING = retina ? '@2x' : '';


function encodeConfigJson( layer ) {

    let dataUid = layer.dataUid;
    let dataType = layer.dataType;
    let filter = layer.filter;
    let config = layer.config;
    let animated = layer.animated;
    let interactivity = layer.interactivity;
    let json = null;

    if ( config.type == Constants.configTypes.MARKER_HEAT || !animated ) {

        json = {
            dataUid: dataUid,
            dataType: dataType,
            filter: filter,
            interactivity: interactivity,
            vizConfig: config.toJSON ? config.toJSON() : config
        };

    } else {

        // 时态
        let breaks = layer.timeBreaks;
        let timeField = layer.timeField;
        let list = [];
        let ta = layer.timeAccumulate;
        let type = layer.tipType;
        for ( let i = 0; i < breaks.length; i++ ) {
            let b = breaks[ i ];
            let f;
            if ( ta || i == 0 ) {
                if ( type == 'date' ) {
                    f = timeField + '<=to_timestamp(' + b / 1000 + ')';
                } else {
                    f = timeField + '<=' + b;
                }
            } else {
                if ( type == 'date' ) {
                    f = timeField + '<=to_timestamp(' + b / 1000 + ') and ' + timeField + '>to_timestamp(' + breaks[ i - 1 ] / 1000 + ')';
                } else {
                    f = timeField + '<=' + b + ' and ' + timeField + '>' + breaks[ i - 1 ];
                }
            }
            if ( filter ) {
                f += ' and ' + filter;
            }
            list.push( {
                dataUid: dataUid,
                dataType: dataType,
                filter: f,
                vizConfig: config.toJSON()
            } );
        }
        json = list;
    }

    return JSON.stringify( json );

}

function getConfigData( data, options, callback ) {

    let url = options.host + options.uri + 'config'

    if ( options.ak ) {
        url += '?ak=' + options.ak;
    }

    ajax( url, {
        type: 'POST',
        data: data,
        success: function( xhr, res ) {
            callback( JSON.parse( res ) )
        }
    } );
}

function getHeatLayer( layerData, options ) {
    let config = layerData.config;

    let dataFunc = function( tileInfo, data, layerOptions ) {
        if ( !data.data || data.data.length == 0 ) {
            return;
        }
        let x = tileInfo[ 0 ],
            y = tileInfo[ 1 ],
            z = tileInfo[ 2 ];
        let res = layerOptions.zoomReses[ z ];
        let dataPoints = [];
        let xx, yy, value, mapx, mapy, time;

        data = data.data;

        for ( let i = 0; i < data.length; i++ ) {
            xx = data[ i ].x__uint8;
            yy = data[ i ].y__uint8;
            value = data[ i ].vals__uint8[ 0 ];
            mapx = ( 256 * x + config.resolution * ( xx + 0.5 ) ) * res + layerOptions.originX;
            mapy = layerOptions.originY - ( 256 * ( y + 1 ) - config.resolution * ( yy + 0.5 ) ) * res;

            const [ lng, lat ] = WebMercator.unproject( mapx, mapy );

            for ( let j = 0; j < data[ i ].vals__uint8.length; j++ ) {
                value = data[ i ].vals__uint8[ j ];
                time = data[ i ].dates__uint16[ j ];
                time += 1;

                dataPoints.push( {
                    lng,
                    lat,
                    count: value,
                    attr: {
                        t: time
                    }
                } )
            }
        }
        return dataPoints;
    };

    let layerOptions = {
        topValue: config.heatTopValue,
        radius: config.heatSize,
        minOpacity: config.heatMinOpacity,
        maxOpacity: config.heatMaxOpacity,
        radiusUnit: config.heatSizeUnit,
        colors: config.colors
    }

    let heatLayer;

    if ( !config.animated ) {

        heatLayer = new HeatLayer( null, dataFunc, layerOptions )

    } else {

        layerOptions.frameCount = config.frameCount;
        layerOptions.duration = config.duration;
        layerOptions.timeAccumulate = config.timeAccumulate;

        heatLayer = new TimedHeatLayer( null, dataFunc, layerOptions )

    }

    // if ( layerData.showLegend ) {
    //     let legendData = getLegendData( layerData );
    //     heatLayer.setLegend( legendData )
    // }

    if ( layerData.visible === false ) {
        heatLayer.hide();
    }

    // heatLayer.name = layerData.dataName;


    getConfigData( {
        configJson: encodeConfigJson( layerData )
    }, options, function( data ) {
        if ( data.code !== 0 ) return;

        let url = options.host + options.uri + data.data.vizId + '/0/{z}/{x}/{y}.json';

        if ( options.ak ) {
            url += '?ak=' + options.ak;
        }
        heatLayer.setTileUrl( url );
        heatLayer.reload();

        if ( config.animated ) {
            heatLayer.play()
        }

    } )

    return heatLayer;
}

function createTimedTileLayer( vizId, options, mapVizOptions ) {

    let tileHost = mapVizOptions.tileHost;

    if ( mapVizOptions.cluster ) {
        tileHost = mapVizOptions.tileHost.replace( /\{(s)\}/, '{' + mapVizOptions.cluster.join( ',' ) + '}' )
    }

    let url = tileHost + mapVizOptions.uri + vizId +
        '/[z]/[x]/[y].png?retina=' + RETINA_STRING;

    if ( mapVizOptions.ak ) {
        url += '&ak=' + mapVizOptions.ak;
    }

    let newLayer = new AMap.TileLayer();

    newLayer.setTileUrl( url );

    return newLayer;
}

function getTileLayer( layerData, options ) {

    let layerOptions = {
        keepResample: false,
        tileEnlarge: false,
        crossOrigin: '*'
    }

    if ( options.cluster ) {
        layerOptions.cluster = options.cluster;
    }

    // 限制大数据显示比例尺
    let maxRes = layerData.maxRes;
    if ( maxRes ) {
        layerOptions.maxRes = maxRes;
    }

    // extent和数据真实的extent相差较大，需要扩大2倍
    if ( layerData.extent ) {

        let extent = layerData.extent;

        let centerX = ( extent[ 0 ] + extent[ 2 ] ) / 2;
        let centerY = ( extent[ 1 ] + extent[ 3 ] ) / 2;

        let scale = 2;

        layerOptions.minX = ( extent[ 0 ] - centerX ) * scale + centerX;
        layerOptions.minY = ( extent[ 1 ] - centerY ) * scale + centerY;
        layerOptions.maxX = ( extent[ 2 ] - centerX ) * scale + centerX;
        layerOptions.maxY = ( extent[ 3 ] - centerY ) * scale + centerY;

    }

    let mapLayer;

    if ( !layerData.animated ) {

        mapLayer = new AMap.TileLayer()

    } else {

        mapLayer = new TimedTileLayer( null, merge( {}, layerOptions, {
            frameCount: layerData.frameCount,
            timeBreaks: layerData.timeBreaks,
            duration: layerData.duration
        } ) );
    }

    // mapLayer.setName( layerData.dataName );

    // if ( layerData.showLegend ) {
    //     let legendData = MapVizLegend.getLegendData( layerData );
    //     mapLayer.setLegend( legendData )
    // }

    mapLayer.hide();

    if ( layerData.visible ) {
        mapLayer.show();
    }

    if ( layerData.interactivity ) {

        layerOptions.showAttr = true;

        let utfGridLayer = new UTFGridLayer( null, layerOptions );

        utfGridLayer.hide();

        mapLayer._utfGridLayer = utfGridLayer;

    }


    let param = {
        configJson: encodeConfigJson( layerData ),
        layerGrouped: !layerData.animated
    };

    getConfigData( param, options, function( data ) {

        if ( data.code !== 0 ) return;

        if ( param.layerGrouped ) {
            let tileHost = options.tileHost;

            if ( options.cluster ) {
                tileHost = options.tileHost.replace( /\{(s)\}/, '{' + options.cluster.join( ',' ) + '}' )
            }
            let templateUrl = tileHost + options.uri + data.data.vizId +
                '/[z]/[x]/[y].png?retina=' + RETINA_STRING;

            let utfUrl = options.tileHost + options.uri + data.data.vizId + '/0/{z}/{x}/{y}.grid';

            if ( options.ak ) {
                templateUrl += '&ak=' + options.ak;
                utfUrl += '?ak=' + options.ak;
            }

            mapLayer.setTileUrl( templateUrl );

            if ( mapLayer._utfGridLayer ) {
                mapLayer._utfGridLayer.setTileUrl( utfUrl );
            }

            if ( layerData.visible ) {
                mapLayer.show();

                if ( mapLayer._utfGridLayer ) {
                    mapLayer._utfGridLayer.show();
                }
            }

        } else {

            let tLayers = [];
            for ( let i = 0; i < data.data.vizIds.length; i++ ) {
                let l = createTimedTileLayer( data.data.vizIds[ i ], layerOptions, options );
                tLayers.push( l );
            }

            mapLayer.setLayers( tLayers );

            mapLayer.play();

        }

    } );

    return mapLayer;

}

let getLayers = function( dataContent, options, noConvert ) {

    let map, baseLayer, defaultGraphics, dataArrayOrigin = [],
        mapLayers = {},
        dataFields = {},
        timeSlider, geolocation, layerLocation;

    let allLayers = [];

    let result = [];

    let dataContentLength = dataContent.length;

    for ( let i = dataContentLength - 1; i >= 0; i-- ) {
        let layerData = dataContent[ i ];

        let configType = layerData.config.type;

        if ( !noConvert ) {
            let config = createConfig( layerData.config );
            layerData.config = config;
        }

        let item = {
            name: layerData.dataName,
            dataUid: layerData.dataUid,
            dataType: layerData.dataType,
            fields: layerData.fields,
            visible: layerData.visible,
            geometryType: layerData.geometryType,
            animated: layerData.animated !== undefined ? layerData.animated : layerData.config.animated,
            extent: layerData.extent,
            config: layerData.config,
            vizData: layerData,
            layer: null
        }

        if ( configType == Constants.configTypes.MARKER_HEAT ) {

            item.layer = getHeatLayer( layerData, options );

        } else if ( configType == Constants.configTypes.MARKER_FLUID ) {

            console.warn( 'AMap GeoHey MapViz: 不支持流体场图' );

        } else {

            item.layer = getTileLayer( layerData, options );

            if ( item.layer._utfGridLayer ) {
                item.utfGridLayer = item.layer._utfGridLayer;
            }

            layerData.config.animated = layerData.animated;
        }

        result.push( item )

    }

    return result;

}

export default {
    getLayers
}