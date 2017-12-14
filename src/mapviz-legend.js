import Constants from './constants'

function getAttribute( attr, type ) {

    if ( !type ) return attr;

    if ( attr === 'color' || attr === 'opacity' ) {

        attr = attr.split( '' );
        attr = attr.shift().toUpperCase() + attr.join( '' );

        if ( type === 'marker' ) return 'marker' + attr;

        if ( type === 'polyline' ) return 'line' + attr;

        if ( type === 'polygon' ) return 'fill' + attr
    }

    return attr;

}


export function getLegendData( layerData ) {

    var geomType = layerData.geometryType;
    var type;
    if ( geomType == 'pt' || geomType == 'mpt' ) {
        type = 'marker';
    } else if ( geomType == 'pl' || geomType == 'mpl' ) {
        type = 'polyline';
    } else if ( geomType == 'pg' || geomType == 'mpg' ) {
        type = 'polygon';
    }
    // 兼容旧版本
    var config = layerData.config
    if ( !type ) {
        var configType = config.type;
        if ( configType.indexOf( 'marker-' ) == 0 ) {
            type = 'marker';
        } else if ( configType.indexOf( 'polyline-' ) == 0 ) {
            type = 'polyline';
        } else if ( configType.indexOf( 'polygon-' ) == 0 ) {
            type = 'polygon';
        } else {
            type = 'marker';
        }
    }

    var json = config.toJSON();
    var buckets = json.buckets;
    var symbolOpacity = config[ getAttribute( 'opacity' ) ];

    var newBuckets = [];

    if ( config.type === Constants.configTypes.MARKER_SIMPLE ||
        config.type === Constants.configTypes.POLYLINE_SIMPLE ||
        config.type === Constants.configTypes.POLYGON_SIMPLE ) {

        newBuckets = [ {
            color: config[ getAttribute( 'color', type ) ],
            value: layerData.dataName,
            opacity: config[ getAttribute( 'opacity', type ) ]
        } ]

    } else if ( config.type == Constants.configTypes.MARKER_CHOROPLETH ||
        config.type == Constants.configTypes.POLYLINE_CHOROPLETH ||
        config.type == Constants.configTypes.POLYGON_CHOROPLETH ) {

        for ( var i = 0; i < buckets.length - 1; i++ ) {
            var value = buckets[ i ];
            newBuckets.push( {
                color: value.color,
                value: buckets[ i + 1 ].value + '~' + value.value
            } );
        }

        if ( buckets.length === 1 ) {

            newBuckets = [ {
                color: buckets[ 0 ].color,
                value: buckets[ 0 ].value
            } ]

        }

    } else if ( config.type == Constants.configTypes.MARKER_BUBBLE ) {
        var itemSize;
        var color = config.fillMode == 'single' ? config.markerColor : undefined;
        for ( var i = 0; i < buckets.length; i++ ) {

            if ( i < buckets.length - 1 ) {
                newBuckets.push( {
                    size: Math.ceil( buckets[ i ].markerSize * 2 ),
                    color: color,
                    value: buckets[ i + 1 ].value + '~' + buckets[ i ].value,
                    opacity: 0
                } );
            }
        }
        // 颜色表示的字段
        if ( config.fillMode == 'multi' ) {
            var cBuckets = json.colorBuckets;

            for ( var i = 0; i < cBuckets.length; i++ ) {
                var value = cBuckets[ i ];
                if ( i < cBuckets.length - 1 ) {
                    newBuckets.push( {
                        color: value.color,
                        value: cBuckets[ i + 1 ].value + '~' + value.value
                    } );
                }
            }
        }
    } else if ( config.type === Constants.configTypes.MARKER_CATEGORY ||
        config.type === Constants.configTypes.POLYLINE_CATEGORY ||
        config.type === Constants.configTypes.POLYGON_CATEGORY ) {

        for ( var i = 0; i < buckets.length; i++ ) {

            newBuckets.push( {
                color: buckets[ i ].color,
                value: buckets[ i ].value
            } );
        }

    }


    var legendOrder = layerData.legendOrder;
    if ( legendOrder === 'asc' && newBuckets ) {
        newBuckets = newBuckets.reverse();
    }

    return {
        title: layerData.legendTitle,
        type: type,
        order: legendOrder,
        data: newBuckets,
        opacity: symbolOpacity,
        outlineColor: config.outlineColor,
        outlineWidth: config.outlineWidth,
        outlineOpacity: config.outlineOpacity
    }
}