# AMap-GeoHey-Plugin

高德地图扩展，用来展示GeoHey平台的数据上图服务

目前尚不支持流体场，也不会添加时间轴等控件

命名空间为`AMapGeoHey`

在`AMapGeoHey`下有两个模块：`MapViz`和`DataViz`

注意：此插件依赖`AMap.Heatmap`，所以必须在加载`AMap.Heatmap`插件后再获取数据

## Install

可以通过NPM安装
```bash
npm install amap-geohey-plugin --save
```
然后在html中引入，注意必须在高德的SDK之后引入
```html
<script src="http://webapi.amap.com/maps?v=1.4.2&key=高德平台开发者key"></script>
<script src="node_modules/dist/amap-geohey-plugin.min.js"></script>
```

也可以直接下载`amap-geohey-plugin.min.js`，然后复制到项目中并引入
```html
<script src="http://webapi.amap.com/maps?v=1.4.2&key=高德平台开发者key"></script>
<script src="amap-geohey-plugin.min.js"></script>
```

## MapViz
`AMapGeoHey.MapViz`用来展示一个[数据上图](https://geohey.com/apps/dataviz/)项目，它可以通过一个**数据上图项目的uid**来获取此项目的数据或直接绘制出来。


### 方法

| 方法名					| 返回值	| 说明											|
| ------------------------- | --------- | --------------------------------------------- |
| get( [String] uid, [Object] options, [Map] map, [Function] callback )	| this	| 获取指定项目uid的数据上图项目，会根据数据生成多个图层，并自动添加到map中(如果传入了map)，map和callback都是可选的	 |


### 选项

| 选项名		| 类型		| 默认值		| 说明											|
| ------------- | --------- | ------------- | --------------------------------------------- |
| host	| String	| 'http://geohey.com'	| 数据请求地址	|
| ak	| String	| null	| API Key，可以在平台密钥管理页面申请	|
| tileHost	| String	| 'http://{s}.geohey.com'	| 瓦片请求地址	|
| cluster	| Array	| [ 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8' ]	| 瓦片服务器集群	|
| uri	| String	| '/s/dataviz/'	| dataviz服务地址	|


### 示例一：传入map，自动显示

传入map是最简单的方式，可以自动将所有图层显示出来

```javascript
var map = new AMap.Map( 'container', {
	resizeEnable: true,
	zoom: 5,
	center: [ 116.23, 39.94 ]
} );

// 依赖AMap.Heatmap
map.plugin( [ "AMap.Heatmap" ], function() {

    AMapGeoHey.MapViz.get( '4229f22d186a456781ba4873db04e14c', {
        host: 'http://geohey.com',                          // 数据请求地址
        ak: 'OTJlMGUxMGNkYTUzNGZhY2FlN2I2M2UzOGQ5ZWVhMTU',  // API Key
        tileHost: 'http://{s}.geohey.com',                  // 瓦片请求地址
        cluster: [ 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8' ] // 瓦片服务器集群
    }, map )

} );
```


### 示例二：通过callback获取原始数据

如果想自己处理图层和数据，可以给第四个参数传入一个callback来获取数据，也可以和示例一的方式同时使用

```javascript
var map = new AMap.Map( 'container', {
	resizeEnable: true,
	zoom: 5,
	center: [ 116.23, 39.94 ]
} );

map.plugin( [ "AMap.Heatmap" ], function() {

    AMapGeoHey.MapViz.get( '4229f22d186a456781ba4873db04e14c', {
        host: 'http://geohey.com',                          // 数据请求地址
        ak: 'OTJlMGUxMGNkYTUzNGZhY2FlN2I2M2UzOGQ5ZWVhMTU',  // API Key
        tileHost: 'http://{s}.geohey.com',                  // 瓦片请求地址
        cluster: [ 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8' ] // 瓦片服务器集群
    }, null, function( data ) {
    	// data包含图层以及项目原始数据等信息，下方是data结构
        /*
           {
                mapData: {
                    center: [-9006666.08710878, 4181352.011028123],
                    resolution: 135.62261255951645,
                    type: 'online',
                    uid: 'auto'
                },
                setting: {
                    plugin: [ 'layer-list', 'logo', 'legend' ]
                },
                vizData: { ... },   // 项目原始数据
                baseLayer: layer,   // 底图图层
                layerList: [
                    {
                        name: '中国各省省会',
                        animated: false,        // 是否为时态图层
                        geometryType: 'pt',     // 数据几何类型
                        fields: [ ... ],        // 字段列表
                        visible: true,          // 是否可见
                        dataUid: '...',         // 数据uid
                        dataType: 'public',     // 数据类型
                        extent: [ ... ],        // 数据范围
                        vizData: { ... },       // 此图层原始数据
                        config: { ... },        // viz config
                        layer: layer            // 图层，可以直接添加到map中
                    },
                    ...
                ]
            }
         */
    } )

} );

```

## DataViz
`AMapGeoHey.MapViz`用来对一个或多个数据进行可视化，它可以通过一个**数据上图配置**来获取图层列表或直接绘制出来。

数据上图配置可以在数据上图参数面板中得到

### 方法

| 方法名					| 返回值	| 说明											|
| ------------------------- | --------- | --------------------------------------------- |
| get( [Array] config, [Object] options, [Map] map, [Function] callback )	| this	| 根据一个数据上图配置，生成多个图层，并自动添加到map中(如果传入了map)	 |


### 选项

| 选项名		| 类型		| 默认值		| 说明											|
| ------------- | --------- | ------------- | --------------------------------------------- |
| host	| String	| 'http://geohey.com'	| 数据请求地址	|
| ak	| String	| null	| API Key，可以在平台密钥管理页面申请	|
| tileHost	| String	| 'http://{s}.geohey.com'	| 瓦片请求地址	|
| cluster	| Array	| [ 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8' ]	| 瓦片服务器集群	|
| uri	| String	| '/s/dataviz/'	| dataviz服务地址	|


### 示例

```javascript
var map = new AMap.Map( 'container', {
	resizeEnable: true,
	zoom: 5,
	center: [ 116.23, 39.94 ]
} );

// 依赖AMap.Heatmap
map.plugin( [ "AMap.Heatmap" ], function() {

	var layerList = AMapGeoHey.DataViz.get( [ {
		"dataUid": "a31be504afa44c1ea6afa19995693600",
		"dataType": "private",
		"interactivity": [
			null
		],
		"vizConfig": {
			"type": "marker-simple",
			"labelField": null,
			"labelFont": "Microsoft YaHei Regular",
			"labelSize": 12,
			"labelDx": 0,
			"labelDy": -20,
			"labelAllowOverlap": true,
			"labelPlacement": "point",
			"blendingMode": "src-over",
			"markerColor": "#c00000",
			"markerOpacity": 0.8,
			"markerSize": 6,
			"outlineColor": "#ffffff",
			"outlineOpacity": 0.8,
			"outlineWidth": 1
		}
	} ], {
		host: 'http://geohey.com',
		ak: 'YWE2Njk1OGE2ZjFmNDI3ZGEyNTg0Yzk0ZGM2Y2Q2ODk',
		tileHost: 'http://{s}.geohey.com',
		cluster: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8']
	}, map )

	console.log( layerList )

} );
```
