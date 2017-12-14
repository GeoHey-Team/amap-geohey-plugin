import Constants from './constants.js'

function Rainbow() {
    "use strict";
    let gradients = null;
    let minNum = 0;
    let maxNum = 100;
    let colours = [ 'ff0000', 'ffff00', '00ff00', '0000ff' ];
    setColours( colours );

    function setColours( spectrum ) {
        if ( spectrum.length < 2 ) {
            throw new Error( 'Rainbow must have two or more colours.' );
        } else {
            let increment = ( maxNum - minNum ) / ( spectrum.length - 1 );
            let firstGradient = new ColourGradient();
            firstGradient.setGradient( spectrum[ 0 ], spectrum[ 1 ] );
            firstGradient.setNumberRange( minNum, minNum + increment );
            gradients = [ firstGradient ];

            for ( let i = 1; i < spectrum.length - 1; i++ ) {
                let colourGradient = new ColourGradient();
                colourGradient.setGradient( spectrum[ i ], spectrum[ i + 1 ] );
                colourGradient.setNumberRange( minNum + increment * i, minNum + increment * ( i + 1 ) );
                gradients[ i ] = colourGradient;
            }

            colours = spectrum;
        }
    }

    this.setSpectrum = function() {
        setColours( arguments );
        return this;
    }

    this.setSpectrumByArray = function( array ) {
        setColours( array );
        return this;
    }

    this.colourAt = function( number ) {
        if ( isNaN( number ) ) {
            throw new TypeError( number + ' is not a number' );
        } else if ( gradients.length === 1 ) {
            return gradients[ 0 ].colourAt( number );
        } else {
            let segment = ( maxNum - minNum ) / ( gradients.length );
            let index = Math.min( Math.floor( ( Math.max( number, minNum ) - minNum ) / segment ), gradients.length - 1 );
            return gradients[ index ].colourAt( number );
        }
    }

    this.colorAt = this.colourAt;

    this.setNumberRange = function( minNumber, maxNumber ) {
        if ( maxNumber > minNumber ) {
            minNum = minNumber;
            maxNum = maxNumber;
            setColours( colours );
        } else {
            throw new RangeError( 'maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')' );
        }
        return this;
    }
}

function ColourGradient() {
    "use strict";
    let startColour = 'ff0000';
    let endColour = '0000ff';
    let minNum = 0;
    let maxNum = 100;

    this.setGradient = function( colourStart, colourEnd ) {
        startColour = getHexColour( colourStart );
        endColour = getHexColour( colourEnd );
    }

    this.setNumberRange = function( minNumber, maxNumber ) {
        if ( maxNumber > minNumber ) {
            minNum = minNumber;
            maxNum = maxNumber;
        } else {
            throw new RangeError( 'maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')' );
        }
    }

    this.colourAt = function( number ) {
        return calcHex( number, startColour.substring( 0, 2 ), endColour.substring( 0, 2 ) ) +
            calcHex( number, startColour.substring( 2, 4 ), endColour.substring( 2, 4 ) ) +
            calcHex( number, startColour.substring( 4, 6 ), endColour.substring( 4, 6 ) );
    }

    function calcHex( number, channelStart_Base16, channelEnd_Base16 ) {
        let num = number;
        if ( num < minNum ) {
            num = minNum;
        }
        if ( num > maxNum ) {
            num = maxNum;
        }
        let numRange = maxNum - minNum;
        let cStart_Base10 = parseInt( channelStart_Base16, 16 );
        let cEnd_Base10 = parseInt( channelEnd_Base16, 16 );
        let cPerUnit = ( cEnd_Base10 - cStart_Base10 ) / numRange;
        let c_Base10 = Math.round( cPerUnit * ( num - minNum ) + cStart_Base10 );
        return formatHex( c_Base10.toString( 16 ) );
    }

    function formatHex( hex ) {
        if ( hex.length === 1 ) {
            return '0' + hex;
        } else {
            return hex;
        }
    }

    function isHexColour( string ) {
        let regex = /^#?[0-9a-fA-F]{6}$/i;
        return regex.test( string );
    }

    function getHexColour( string ) {
        if ( isHexColour( string ) ) {
            return string.substring( string.length - 6, string.length );
        } else {
            let name = string.toLowerCase();
            if ( colourNames.hasOwnProperty( name ) ) {
                return colourNames[ name ];
            }
            throw new Error( string + ' is not a valid colour.' );
        }
    }

    // Extended list of CSS colornames s taken from
    // http://www.w3.org/TR/css3-color/#svg-color
    let colourNames = {
        aliceblue: "F0F8FF",
        antiquewhite: "FAEBD7",
        aqua: "00FFFF",
        aquamarine: "7FFFD4",
        azure: "F0FFFF",
        beige: "F5F5DC",
        bisque: "FFE4C4",
        black: "000000",
        blanchedalmond: "FFEBCD",
        blue: "0000FF",
        blueviolet: "8A2BE2",
        brown: "A52A2A",
        burlywood: "DEB887",
        cadetblue: "5F9EA0",
        chartreuse: "7FFF00",
        chocolate: "D2691E",
        coral: "FF7F50",
        cornflowerblue: "6495ED",
        cornsilk: "FFF8DC",
        crimson: "DC143C",
        cyan: "00FFFF",
        darkblue: "00008B",
        darkcyan: "008B8B",
        darkgoldenrod: "B8860B",
        darkgray: "A9A9A9",
        darkgreen: "006400",
        darkgrey: "A9A9A9",
        darkkhaki: "BDB76B",
        darkmagenta: "8B008B",
        darkolivegreen: "556B2F",
        darkorange: "FF8C00",
        darkorchid: "9932CC",
        darkred: "8B0000",
        darksalmon: "E9967A",
        darkseagreen: "8FBC8F",
        darkslateblue: "483D8B",
        darkslategray: "2F4F4F",
        darkslategrey: "2F4F4F",
        darkturquoise: "00CED1",
        darkviolet: "9400D3",
        deeppink: "FF1493",
        deepskyblue: "00BFFF",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1E90FF",
        firebrick: "B22222",
        floralwhite: "FFFAF0",
        forestgreen: "228B22",
        fuchsia: "FF00FF",
        gainsboro: "DCDCDC",
        ghostwhite: "F8F8FF",
        gold: "FFD700",
        goldenrod: "DAA520",
        gray: "808080",
        green: "008000",
        greenyellow: "ADFF2F",
        grey: "808080",
        honeydew: "F0FFF0",
        hotpink: "FF69B4",
        indianred: "CD5C5C",
        indigo: "4B0082",
        ivory: "FFFFF0",
        khaki: "F0E68C",
        lavender: "E6E6FA",
        lavenderblush: "FFF0F5",
        lawngreen: "7CFC00",
        lemonchiffon: "FFFACD",
        lightblue: "ADD8E6",
        lightcoral: "F08080",
        lightcyan: "E0FFFF",
        lightgoldenrodyellow: "FAFAD2",
        lightgray: "D3D3D3",
        lightgreen: "90EE90",
        lightgrey: "D3D3D3",
        lightpink: "FFB6C1",
        lightsalmon: "FFA07A",
        lightseagreen: "20B2AA",
        lightskyblue: "87CEFA",
        lightslategray: "778899",
        lightslategrey: "778899",
        lightsteelblue: "B0C4DE",
        lightyellow: "FFFFE0",
        lime: "00FF00",
        limegreen: "32CD32",
        linen: "FAF0E6",
        magenta: "FF00FF",
        maroon: "800000",
        mediumaquamarine: "66CDAA",
        mediumblue: "0000CD",
        mediumorchid: "BA55D3",
        mediumpurple: "9370DB",
        mediumseagreen: "3CB371",
        mediumslateblue: "7B68EE",
        mediumspringgreen: "00FA9A",
        mediumturquoise: "48D1CC",
        mediumvioletred: "C71585",
        midnightblue: "191970",
        mintcream: "F5FFFA",
        mistyrose: "FFE4E1",
        moccasin: "FFE4B5",
        navajowhite: "FFDEAD",
        navy: "000080",
        oldlace: "FDF5E6",
        olive: "808000",
        olivedrab: "6B8E23",
        orange: "FFA500",
        orangered: "FF4500",
        orchid: "DA70D6",
        palegoldenrod: "EEE8AA",
        palegreen: "98FB98",
        paleturquoise: "AFEEEE",
        palevioletred: "DB7093",
        papayawhip: "FFEFD5",
        peachpuff: "FFDAB9",
        peru: "CD853F",
        pink: "FFC0CB",
        plum: "DDA0DD",
        powderblue: "B0E0E6",
        purple: "800080",
        red: "FF0000",
        rosybrown: "BC8F8F",
        royalblue: "4169E1",
        saddlebrown: "8B4513",
        salmon: "FA8072",
        sandybrown: "F4A460",
        seagreen: "2E8B57",
        seashell: "FFF5EE",
        sienna: "A0522D",
        silver: "C0C0C0",
        skyblue: "87CEEB",
        slateblue: "6A5ACD",
        slategray: "708090",
        slategrey: "708090",
        snow: "FFFAFA",
        springgreen: "00FF7F",
        steelblue: "4682B4",
        tan: "D2B48C",
        teal: "008080",
        thistle: "D8BFD8",
        tomato: "FF6347",
        turquoise: "40E0D0",
        violet: "EE82EE",
        wheat: "F5DEB3",
        white: "FFFFFF",
        whitesmoke: "F5F5F5",
        yellow: "FFFF00",
        yellowgreen: "9ACD32"
    }
}


let getColors = ( function() {

    let rainbow = new Rainbow();

    return function( colors, len, version ) {
        let result = []
        if ( version === '1.0.0' ) {
            return colors;
        } else {
            rainbow.setNumberRange( 0, len );
            rainbow.setSpectrum.apply( undefined, colors );
            for ( let i = 0; i < len; i++ ) {
                result.push( '#' + rainbow.colourAt( i ) )
            }
        }
        return result;
    }
}() )

let ConfigBase = function( options ) {

    this.version = options && options.version ? options.version : '0.0.1';

    this.labelField = options && options[ 'labelField' ] ? options[ 'labelField' ] : undefined;
    this.labelColor = options && options[ 'labelColor' ] ? options[ 'labelColor' ] : Constants.defaultLabelColor;
    this.labelFont = options && options[ 'labelFont' ] ? options[ 'labelFont' ] : Constants.defaultLabelFont;
    this.labelSize = options && options[ 'labelSize' ] ? options[ 'labelSize' ] : Constants.defaultLabelSize;
    this.labelDx = options && options[ 'labelDx' ] ? options[ 'labelDx' ] : Constants.defaultLabelDx;
    this.labelDy = options && options[ 'labelDy' ] ? options[ 'labelDy' ] : Constants.defaultLabelDy;
    this.labelPlacement = options && options[ 'labelPlacement' ] ? options[ 'labelPlacement' ] : Constants.defaultLabelPlacement;
    this.labelHaloColor = options && options[ 'labelHaloColor' ] ? options[ 'labelHaloColor' ] : Constants.defaultLabelHaloColor;
    this.labelAllowOverlap = options && options[ 'labelAllowOverlap' ] ? options[ 'labelAllowOverlap' ] : Constants.defaultLabelAllowOverlap;
}

ConfigBase.prototype.toJSON = function() {
    return this;
}

ConfigBase.prototype.isReady = function() {
    return true;
}

let MarkerConfigBase = function( options ) {
    ConfigBase.apply( this, arguments );
    this.markerColor = options && options[ 'markerColor' ] ? options[ 'markerColor' ] : Constants.defaultMarkerColor;
    this.markerSize = options && options[ 'markerSize' ] ? options[ 'markerSize' ] : Constants.defaultMarkerSize;
    this.markerOpacity = options && ( options[ 'markerOpacity' ] || options[ 'markerOpacity' ] == 0 ) ? options[ 'markerOpacity' ] : Constants.defaultMarkerOpacity;
    this.outlineColor = options && options[ 'outlineColor' ] ? options[ 'outlineColor' ] : Constants.defaultOutlineColor;
    this.outlineWidth = options && ( options[ 'outlineWidth' ] || options[ 'outlineWidth' ] == 0 ) ? options[ 'outlineWidth' ] : Constants.defaultOutlineWidth;
    this.outlineOpacity = options && ( options[ 'outlineOpacity' ] || options[ 'outlineOpacity' ] == 0 ) ? options[ 'outlineOpacity' ] : Constants.defaultOutlineOpacity;
}

MarkerConfigBase.prototype = new ConfigBase();

let MarkerSimpleConfig = function( options ) {
    this.type = Constants.configTypes.MARKER_SIMPLE;
    this.blendingMode = options && options[ 'blendingMode' ] ? options[ 'blendingMode' ] : Constants.defaultBlendingMode;
    MarkerConfigBase.apply( this, arguments );
};

MarkerSimpleConfig.prototype = new MarkerConfigBase();

//
let MarkerChoroplethConfig = function( options ) {
    this.type = Constants.configTypes.MARKER_CHOROPLETH;
    this.fieldName = options && options[ 'fieldName' ] ? options[ 'fieldName' ] : undefined;
    this.bucketCount = options && options[ 'bucketCount' ] ? options[ 'bucketCount' ] : Constants.defaultBucketCount;
    this.bucketType = options && options[ 'bucketType' ] ? options[ 'bucketType' ] : Constants.defaultBucketType;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultColorRamp;
    this.colorsReversed = options && options[ 'colorsReversed' ] ? options[ 'colorsReversed' ] : false;
    this.markerColor = Constants.noDataColor;
    this.breaks = options && options[ 'breaks' ] ? options[ 'breaks' ] : undefined;
    this.blendingMode = options && options[ 'blendingMode' ] ? options[ 'blendingMode' ] : Constants.defaultBlendingMode;
    // 兼容历史版本
    if ( options && options.equalInterval ) {
        this.bucketType = 'equalinterval';
        this.breaks = [];
        for ( let i = 0; i < options.breakCount; i++ ) {
            this.breaks[ i ] = options.equalInterval.max - i * options.equalInterval.step;
        }
    }
    MarkerConfigBase.apply( this, arguments );
};

MarkerChoroplethConfig.prototype = new MarkerConfigBase();
MarkerChoroplethConfig.prototype.toJSON = function() {
    let buckets = [];

    let colors = getColors( this.colors, this.bucketCount, this.version );

    for ( let i = 0; i < this.breaks.length; i++ ) {
        let index = this.colorsReversed ? this.breaks.length - 1 - i : i;
        buckets.push( {
            value: this.breaks[ i ],
            color: colors[ index ] || '#ffffff'
        } );
    }


    return {
        type: this.type,
        markerSize: this.markerSize,
        markerColor: this.markerColor,
        markerOpacity: this.markerOpacity,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth,
        outlineOpacity: this.outlineOpacity,
        blendingMode: this.blendingMode,
        fieldName: this.fieldName,
        buckets: buckets,
        labelField: this.labelField,
        labelFont: this.labelFont,
        labelSize: this.labelSize,
        labelColor: this.labelColor,
        labelDx: this.labelDx,
        labelDy: this.labelDy,
        labelPlacement: this.labelPlacement,
        labelHaloColor: this.labelHaloColor,
        labelAllowOverlap: this.labelAllowOverlap
    };
}

let MarkerBubbleConfig = function( options ) {
    this.type = Constants.configTypes.MARKER_BUBBLE;
    this.fieldName = options && options[ 'fieldName' ] ? options[ 'fieldName' ] : undefined;
    this.bucketCount = options && options[ 'bucketCount' ] ? options[ 'bucketCount' ] : Constants.defaultBucketCount;
    this.bucketType = options && options[ 'bucketType' ] ? options[ 'bucketType' ] : Constants.defaultBucketType;
    this.markerColor = options && options[ 'markerColor' ] ? options[ 'markerColor' ] : Constants.defaultBubbleMarkerColor;
    this.breaks = options && options[ 'breaks' ] ? options[ 'breaks' ] : undefined;
    this.minSize = options && options[ 'minSize' ] ? options[ 'minSize' ] : Constants.defaultBubbleMinSize;
    this.maxSize = options && options[ 'maxSize' ] ? options[ 'maxSize' ] : Constants.defaultBubbleMaxSize;
    // 颜色渲染设置
    this.fillMode = options && options[ 'fillMode' ] ? options[ 'fillMode' ] : Constants.defaultBubbleFillMode;
    this.colorFieldName = options && options[ 'colorFieldName' ] ? options[ 'colorFieldName' ] : undefined;
    this.colorBucketCount = options && options[ 'colorBucketCount' ] ? options[ 'colorBucketCount' ] : Constants.defaultBucketCount;
    this.colorBucketType = options && options[ 'colorBucketType' ] ? options[ 'colorBucketType' ] : Constants.defaultBucketType;
    this.colorBreaks = options && options[ 'colorBreaks' ] ? options[ 'colorBreaks' ] : undefined;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultColorRamp;
    //
    MarkerConfigBase.apply( this, arguments );
};

MarkerBubbleConfig.prototype = new MarkerConfigBase();
MarkerBubbleConfig.prototype.isReady = function() {
    if ( this.fillMode == 'single' ) {
        return true;
    }
    return this.breaks && this.colorBreaks;
}
MarkerBubbleConfig.prototype.toJSON = function() {
    let buckets = [];
    let diff = ( this.maxSize - this.minSize ) / ( this.breaks.length - 1 );
    for ( let i = 0; i < this.breaks.length; i++ ) {
        buckets.push( {
            value: this.breaks[ i ],
            markerSize: this.maxSize - i * diff
        } );
    }

    let result = {
        type: this.type,
        markerColor: this.markerColor,
        markerOpacity: this.markerOpacity,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth,
        outlineOpacity: this.outlineOpacity,
        fieldName: this.fieldName,
        buckets: buckets,
        labelField: this.labelField,
        labelFont: this.labelFont,
        labelSize: this.labelSize,
        labelColor: this.labelColor,
        labelDx: this.labelDx,
        labelDy: this.labelDy,
        labelPlacement: this.labelPlacement,
        labelHaloColor: this.labelHaloColor,
        labelAllowOverlap: this.labelAllowOverlap,
        fillMode: this.fillMode
    };

    if ( this.fillMode == 'multi' ) {
        buckets = [];
        let colors = getColors( this.colors, this.colorBucketCount, this.version );
        for ( let i = 0; i < this.colorBreaks.length; i++ ) {
            buckets.push( {
                value: this.colorBreaks[ i ],
                color: colors[ i ] || '#ffffff'
            } );
        }
        result[ 'colorBuckets' ] = buckets;
        result[ 'colorFieldName' ] = this.colorFieldName;
    }

    return result;
}

//
let MarkerCategoryConfig = function( options ) {
    this.type = Constants.configTypes.MARKER_CATEGORY;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultColorRamp;
    this.fieldName = options && options[ 'fieldName' ] ? options[ 'fieldName' ] : undefined;
    this.fieldValues = options && options[ 'fieldValues' ] ? options[ 'fieldValues' ] : undefined;
    this.fieldColors = options && options[ 'fieldColors' ] ? options[ 'fieldColors' ] : undefined;
    this.blendingMode = options && options[ 'blendingMode' ] ? options[ 'blendingMode' ] : Constants.defaultBlendingMode;
    MarkerConfigBase.apply( this, arguments );

    if ( !this.fieldValues && options.buckets ) {
        this.fieldValues = []
        for ( let i = 0; i < options.buckets.length; i++ ) {
            this.fieldValues.push( options.buckets[ i ].value );
        }
    }
    if ( !this.fieldColors && options.buckets ) {
        this.fieldColors = []
        for ( let i = 0; i < options.buckets.length; i++ ) {
            this.fieldColors.push( options.buckets[ i ].color );
        }
    }
};

MarkerCategoryConfig.prototype = new MarkerConfigBase();
MarkerCategoryConfig.prototype.toJSON = function() {
    let buckets = [];
    for ( let i = 0; i < this.fieldValues.length; i++ ) {
        let color = this.fieldColors[ i ];
        color = color.indexOf( '#' ) == -1 ? '#' + color : color;
        buckets.push( {
            value: this.fieldValues[ i ],
            color: color
        } );
    }
    return {
        type: this.type,
        markerSize: this.markerSize,
        markerOpacity: this.markerOpacity,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth,
        outlineOpacity: this.outlineOpacity,
        blendingMode: this.blendingMode,
        fieldName: this.fieldName,
        buckets: buckets,
        labelField: this.labelField,
        labelFont: this.labelFont,
        labelSize: this.labelSize,
        labelColor: this.labelColor,
        labelDx: this.labelDx,
        labelDy: this.labelDy,
        labelPlacement: this.labelPlacement,
        labelHaloColor: this.labelHaloColor,
        labelAllowOverlap: this.labelAllowOverlap
    };
}

//
let MarkerIntensityConfig = function( options ) {
    this.type = Constants.configTypes.MARKER_INTENSITY;
    this.blendingMode = options && options[ 'blendingMode' ] ? options[ 'blendingMode' ] : Constants.defaultBlendingMode;
    MarkerConfigBase.apply( this, arguments );
};

MarkerIntensityConfig.prototype = new MarkerConfigBase();

//
let MarkerHeatConfig = function( options ) {
    this.type = Constants.configTypes.MARKER_HEAT;
    this.heatSizeUnit = options && options[ 'heatSizeUnit' ] ? options[ 'heatSizeUnit' ] : Constants.defaultHeatSizeUnit;
    this.heatSize = options && options[ 'heatSize' ] ? options[ 'heatSize' ] : Constants.defaultHeatSize;
    this.heatMinOpacity = options && ( options[ 'heatMinOpacity' ] || options[ 'heatMinOpacity' ] == 0 ) ? options[ 'heatMinOpacity' ] : Constants.defaultHeatMinOpacity;
    if ( options[ 'heatOpacity' ] ) {
        this.heatMaxOpacity = options[ 'heatOpacity' ];
    } else {
        this.heatMaxOpacity = options && ( options[ 'heatMaxOpacity' ] || options[ 'heatMaxOpacity' ] == 0 ) ? options[ 'heatMaxOpacity' ] : Constants.defaultHeatMaxOpacity;
    }
    this.heatTopValue = options && options[ 'heatTopValue' ] ? options[ 'heatTopValue' ] : Constants.defaultHeatTopValue;
    this.resolution = options && options[ 'resolution' ] ? options[ 'resolution' ] : Constants.defaultHeatResolution;
    this.weightField = options && options[ 'weightField' ] ? options[ 'weightField' ] : undefined;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultHeatColor;
    //
    this.animated = options && options[ 'animated' ] ? options[ 'animated' ] : false;
    this.timeField = options && options[ 'timeField' ] ? options[ 'timeField' ] : undefined;
    this.frameCount = options && options[ 'frameCount' ] ? options[ 'frameCount' ] : Constants.defaultTimeSegment;
    this.duration = options && options[ 'duration' ] ? options[ 'duration' ] : Constants.defaultTimeDuration;
    this.timeAccumulate = options && options[ 'timeAccumulate' ] ? options[ 'timeAccumulate' ] : false;
};

MarkerHeatConfig.prototype.toJSON = function() {
    return this;
};

//
let MarkerFluidConfig = function( options ) {
    this.type = Constants.configTypes.MARKER_FLUID;
    this.uField = options && options[ 'uField' ] ? options[ 'uField' ] : undefined;
    this.vField = options && options[ 'vField' ] ? options[ 'vField' ] : undefined;
    this.width = options && options[ 'width' ] ? options[ 'width' ] : Constants.defaultFluidWidth;
    this.duration = options && options[ 'duration' ] ? options[ 'duration' ] : Constants.defaultFluidDuration;
    this.opacity = options && options[ 'opacity' ] ? options[ 'opacity' ] : Constants.defaultFluidOpacity;
    this.topValue = options && options[ 'topValue' ] ? options[ 'topValue' ] : Constants.defaultFluidTopValue;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultFluidColors;
};

MarkerFluidConfig.prototype = new MarkerConfigBase();

//
let PolylineConfigBase = function( options ) {
    this.lineColor = options && options[ 'lineColor' ] ? options[ 'lineColor' ] : Constants.defaultLineColor;
    this.lineOpacity = options && ( options[ 'lineOpacity' ] || options[ 'lineOpacity' ] == 0 ) ? options[ 'lineOpacity' ] : Constants.defaultLineOpacity;
    this.blendingMode = options && options[ 'blendingMode' ] ? options[ 'blendingMode' ] : Constants.defaultBlendingMode;
    this.lineDashArray = options && options[ 'lineDashArray' ] ? options[ 'lineDashArray' ] : Constants.defaultLineDashArray;
    ConfigBase.apply( this, arguments );
};

PolylineConfigBase.prototype = new ConfigBase();

//
let PolylineSimpleConfig = function( options ) {
    this.type = Constants.configTypes.POLYLINE_SIMPLE;
    PolylineConfigBase.apply( this, arguments );
    this.lineWidth = options && options[ 'lineWidth' ] ? options[ 'lineWidth' ] : Constants.defaultLineWidth;
};

PolylineSimpleConfig.prototype = new PolylineConfigBase();

//
let PolylineChoroplethConfig = function( options ) {
    this.type = Constants.configTypes.POLYLINE_CHOROPLETH;
    PolylineConfigBase.apply( this, arguments );
    this.fieldName = options && options[ 'fieldName' ] ? options[ 'fieldName' ] : undefined;
    this.bucketCount = options && options[ 'bucketCount' ] ? options[ 'bucketCount' ] : Constants.defaultBucketCount;
    this.bucketType = options && options[ 'bucketType' ] ? options[ 'bucketType' ] : Constants.defaultBucketType;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultColorRamp;
    this.colorsReversed = options && options[ 'colorsReversed' ] ? options[ 'colorsReversed' ] : false;
    this.lineColor = Constants.noDataColor;
    this.breaks = options && options[ 'breaks' ] ? options[ 'breaks' ] : undefined;
    //宽度渲染设置
    this.minWidth = options && options[ 'minWidth' ] ? options[ 'minWidth' ] : Constants.defaultLineMinWidth;
    this.maxWidth = options && options[ 'maxWidth' ] ? options[ 'maxWidth' ] : Constants.defaultLineMaxWidth;
    // 兼容历史版本
    if ( options[ 'lineWidth' ] ) {
        this.minWidth = options[ 'lineWidth' ];
        this.maxWidth = options[ 'lineWidth' ];
    }
    if ( options && options.equalInterval ) {
        this.bucketType = 'equalinterval';
        this.breaks = [];
        for ( let i = 0; i < options.breakCount; i++ ) {
            this.breaks[ i ] = options.equalInterval.max - i * options.equalInterval.step;
        }
    }
};

PolylineChoroplethConfig.prototype = new PolylineConfigBase();
PolylineChoroplethConfig.prototype.toJSON = function() {
    let buckets = [];

    let colors = getColors( this.colors, this.bucketCount, this.version );
    let diff = ( this.maxWidth - this.minWidth ) / ( this.breaks.length - 1 );
    for ( let i = 0; i < this.breaks.length; i++ ) {
        let index = this.colorsReversed ? this.breaks.length - 1 - i : i;
        buckets.push( {
            value: this.breaks[ i ],
            color: colors[ index ] || '#ffffff',
            lineWidth: this.maxWidth - i * diff
        } );
    }
    let result = {
        type: this.type,
        lineColor: this.lineColor,
        lineOpacity: this.lineOpacity,
        lineDashArray: this.lineDashArray,
        blendingMode: this.blendingMode,
        fieldName: this.fieldName,
        buckets: buckets,
        labelField: this.labelField,
        labelFont: this.labelFont,
        labelSize: this.labelSize,
        labelColor: this.labelColor,
        labelDx: this.labelDx,
        labelDy: this.labelDy,
        labelPlacement: this.labelPlacement,
        labelHaloColor: this.labelHaloColor,
        labelAllowOverlap: this.labelAllowOverlap,
        fillMode: this.fillMode
    };
    return result;
}

//
let PolylineCategoryConfig = function( options ) {
    this.type = Constants.configTypes.POLYLINE_CATEGORY;
    this.fieldName = options && options[ 'fieldName' ] ? options[ 'fieldName' ] : undefined;
    this.fieldValues = options && options[ 'fieldValues' ] ? options[ 'fieldValues' ] : undefined;
    this.fieldColors = options && options[ 'fieldColors' ] ? options[ 'fieldColors' ] : undefined;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultColorRamp;
    this.lineWidth = options && options[ 'lineWidth' ] ? options[ 'lineWidth' ] : Constants.defaultLineWidth;
    PolylineConfigBase.apply( this, arguments );
};

PolylineCategoryConfig.prototype = new PolylineConfigBase();
PolylineCategoryConfig.prototype.toJSON = function() {
    let buckets = [];
    for ( let i = 0; i < this.fieldValues.length; i++ ) {
        let color = this.fieldColors[ i ];
        color = color.indexOf( '#' ) == -1 ? '#' + color : color;
        buckets.push( {
            value: this.fieldValues[ i ],
            color: color
        } );
    }
    return {
        type: this.type,
        lineOpacity: this.lineOpacity,
        lineWidth: this.lineWidth,
        lineDashArray: this.lineDashArray,
        blendingMode: this.blendingMode,
        fieldName: this.fieldName,
        buckets: buckets,
        labelField: this.labelField,
        labelFont: this.labelFont,
        labelSize: this.labelSize,
        labelColor: this.labelColor,
        labelDx: this.labelDx,
        labelDy: this.labelDy,
        labelPlacement: this.labelPlacement,
        labelHaloColor: this.labelHaloColor,
        labelAllowOverlap: this.labelAllowOverlap
    };
}

//
let PolygonConfigBase = function( options ) {
    this.fillColor = options && options[ 'fillColor' ] ? options[ 'fillColor' ] : Constants.defaultFillColor;
    this.fillOpacity = options && ( options[ 'fillOpacity' ] || options[ 'fillOpacity' ] == 0 ) ? options[ 'fillOpacity' ] : Constants.defaultFillOpacity;
    this.outlineColor = options && options[ 'outlineColor' ] ? options[ 'outlineColor' ] : Constants.defaultOutlineColor;
    this.outlineOpacity = options && ( options[ 'outlineOpacity' ] || options[ 'outlineOpacity' ] == 0 ) ? options[ 'outlineOpacity' ] : Constants.defaultOutlineOpacity;
    this.outlineWidth = options && ( options[ 'outlineWidth' ] || options[ 'outlineWidth' ] == 0 ) ? options[ 'outlineWidth' ] : Constants.defaultOutlineWidth;
    this.lineDashArray = options && options[ 'lineDashArray' ] ? options[ 'lineDashArray' ] : Constants.defaultLineDashArray;
    ConfigBase.apply( this, arguments );
};

PolygonConfigBase.prototype = new ConfigBase();

//
let PolygonSimpleConfig = function( options ) {
    this.type = Constants.configTypes.POLYGON_SIMPLE;
    PolygonConfigBase.apply( this, arguments );
};

PolygonSimpleConfig.prototype = new PolygonConfigBase();

//
let PolygonChoroplethConfig = function( options ) {
    this.type = Constants.configTypes.POLYGON_CHOROPLETH;
    PolygonConfigBase.apply( this, arguments );
    //
    this.fieldName = options && options[ 'fieldName' ] ? options[ 'fieldName' ] : undefined;
    this.bucketCount = options && options[ 'bucketCount' ] ? options[ 'bucketCount' ] : Constants.defaultBucketCount;
    this.bucketType = options && options[ 'bucketType' ] ? options[ 'bucketType' ] : Constants.defaultBucketType;
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultColorRamp;
    this.colorsReversed = options && options[ 'colorsReversed' ] ? options[ 'colorsReversed' ] : false;
    this.fillColor = Constants.noDataColor;
    this.breaks = options && options[ 'breaks' ] ? options[ 'breaks' ] : undefined;
    // 兼容历史版本
    if ( options && options.equalInterval ) {
        this.bucketType = 'equalinterval';
        this.breaks = [];
        for ( let i = 0; i < options.breakCount; i++ ) {
            this.breaks[ i ] = options.equalInterval.max - i * options.equalInterval.step;
        }
    }
};

PolygonChoroplethConfig.prototype = new PolygonConfigBase();
PolygonChoroplethConfig.prototype.toJSON = function() {
    let buckets = [];

    let colors = getColors( this.colors, this.bucketCount, this.version );
    for ( let i = 0; i < this.breaks.length; i++ ) {
        let index = this.colorsReversed ? this.breaks.length - 1 - i : i;
        buckets.push( {
            value: this.breaks[ i ],
            color: colors[ index ] || '#ffffff'
        } );
    }
    return {
        type: this.type,
        fillColor: this.fillColor,
        fillOpacity: this.fillOpacity,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth,
        outlineOpacity: this.outlineOpacity,
        lineDashArray: this.lineDashArray,
        fieldName: this.fieldName,
        buckets: buckets,
        labelField: this.labelField,
        labelFont: this.labelFont,
        labelSize: this.labelSize,
        labelColor: this.labelColor,
        labelDx: this.labelDx,
        labelDy: this.labelDy,
        labelPlacement: this.labelPlacement,
        labelHaloColor: this.labelHaloColor,
        labelAllowOverlap: this.labelAllowOverlap
    };
}

//
let PolygonCategoryConfig = function( options ) {
    this.type = Constants.configTypes.POLYGON_CATEGORY;
    PolygonConfigBase.apply( this, arguments );
    //
    this.colors = options && options[ 'colors' ] ? options[ 'colors' ] : Constants.defaultColorRamp;
    this.fieldName = options && options[ 'fieldName' ] ? options[ 'fieldName' ] : undefined;
    this.fieldValues = options && options[ 'fieldValues' ] ? options[ 'fieldValues' ] : undefined;
    this.fieldColors = options && options[ 'fieldColors' ] ? options[ 'fieldColors' ] : undefined;
};

PolygonCategoryConfig.prototype = new PolygonConfigBase();
PolygonCategoryConfig.prototype.toJSON = function() {
    let buckets = [];
    for ( let i = 0; i < this.fieldValues.length; i++ ) {
        let color = this.fieldColors[ i ];
        color = color.indexOf( '#' ) == -1 ? '#' + color : color;
        buckets.push( {
            value: this.fieldValues[ i ],
            color: color
        } );
    }
    return {
        type: this.type,
        fillOpacity: this.fillOpacity,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth,
        outlineOpacity: this.outlineOpacity,
        lineDashArray: this.lineDashArray,
        fieldName: this.fieldName,
        buckets: buckets,
        labelField: this.labelField,
        labelFont: this.labelFont,
        labelSize: this.labelSize,
        labelColor: this.labelColor,
        labelDx: this.labelDx,
        labelDy: this.labelDy,
        labelPlacement: this.labelPlacement,
        labelHaloColor: this.labelHaloColor,
        labelAllowOverlap: this.labelAllowOverlap
    };
}

export function create( options ) {
    if ( options == null )
        return null;

    if ( options == Constants.configTypes.MARKER_SIMPLE ||
        options.type == Constants.configTypes.MARKER_SIMPLE )
        return new MarkerSimpleConfig( options );
    else if ( options == Constants.configTypes.MARKER_INTENSITY ||
        options.type == Constants.configTypes.MARKER_INTENSITY )
        //return new MarkerIntensityConfig(options);
        return new MarkerSimpleConfig( options );
    else if ( options == Constants.configTypes.MARKER_HEAT ||
        options.type == Constants.configTypes.MARKER_HEAT )
        return new MarkerHeatConfig( options );
    else if ( options == Constants.configTypes.MARKER_CHOROPLETH ||
        options.type == Constants.configTypes.MARKER_CHOROPLETH )
        return new MarkerChoroplethConfig( options );
    else if ( options == Constants.configTypes.MARKER_BUBBLE ||
        options.type == Constants.configTypes.MARKER_BUBBLE )
        return new MarkerBubbleConfig( options );
    else if ( options == Constants.configTypes.MARKER_CATEGORY ||
        options.type == Constants.configTypes.MARKER_CATEGORY )
        return new MarkerCategoryConfig( options );
    else if ( options == Constants.configTypes.MARKER_FLUID ||
        options.type == Constants.configTypes.MARKER_FLUID )
        return new MarkerFluidConfig( options );
    else if ( options == Constants.configTypes.POLYGON_SIMPLE ||
        options.type == Constants.configTypes.POLYGON_SIMPLE )
        return new PolygonSimpleConfig( options );
    else if ( options == Constants.configTypes.POLYGON_CHOROPLETH ||
        options.type == Constants.configTypes.POLYGON_CHOROPLETH )
        return new PolygonChoroplethConfig( options );
    else if ( options == Constants.configTypes.POLYGON_CATEGORY ||
        options.type == Constants.configTypes.POLYGON_CATEGORY )
        return new PolygonCategoryConfig( options );
    else if ( options == Constants.configTypes.POLYLINE_SIMPLE ||
        options.type == Constants.configTypes.POLYLINE_SIMPLE )
        return new PolylineSimpleConfig( options );
    else if ( options == Constants.configTypes.POLYLINE_CHOROPLETH ||
        options.type == Constants.configTypes.POLYLINE_CHOROPLETH )
        return new PolylineChoroplethConfig( options );
    else if ( options == Constants.configTypes.POLYLINE_CATEGORY ||
        options.type == Constants.configTypes.POLYLINE_CATEGORY )
        return new PolylineCategoryConfig( options );
}