/* global mars3d Cesium*/
/* 导入antdesign包 */
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card } from 'antd'
import styles from './style.less'
import echarts from 'echarts'

/* 导入openlayers依赖包 */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, XYZ } from 'ol/source';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileJSON, WMTS, TileWMS, Vector as VectorSource } from 'ol/source';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Select as OlSelect } from 'ol/interaction';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { toStringHDMS } from 'ol/coordinate';
import { Fill, Icon, Stroke, Style, Circle } from 'ol/style';
import { toLonLat, fromLonLat, get as getProjection } from 'ol/proj';
import { FullScreen } from 'ol/control';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import { getTopLeft, getWidth } from 'ol/extent';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import TileState from 'ol/TileState';

const { Option, OptGroup } = Select;

/** 引入geojson文件，加载矢量数据 */
const gaoxiao1Json = require('./file/gaoxiao1.json')
const gaoxiaoJson = require('./file/gaoxiao.json')
class OpenLayersClass extends Component {

  constructor(props) {
    super(props)
    this.state = {
      map: null,
      chart: null,
      /** 引入geoserver发布的wms图层 */
      wmsSource: new TileWMS({
        url: 'http://localhost:8081/geoserver/a0516/wms',
        params: { 'LAYERS': 'a0516:gaoxiao', 'TILED': true },
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
      }),
      /** 在线的osm数据源地图 */
      raster: new TileLayer({
        source: new OSM()
      }),
      /** 是在线的高德电子地图 */
      digitalLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        })
      }),
      /** 是高德影像地图 */
      imagesLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        })
      }),
      /** arcgis在线地图 */
      arcgisLayer: new TileLayer({
        source: new XYZ({
          //url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      }),
      /** 高校的切片图层 wms */
      gaoxiaoPoint: new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/a0516/wms',
          params: { 'LAYERS': 'a0516:gaoxiao', 'TILED': true },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        })
      }),
      /** 高校关系的切片图层wms */
      quanqiu: new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/tiger/wms',
          params: { 'LAYERS': 'tiger:giant_polygon', 'TILED': true },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        })
      }),

      popHtml: '',/**存储弹框数据 */
      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible: false,
      confirmLoading: false,
    }
  }

  /**
   * react生命周期结束后立即执行代码区块
   * 类似于document.onload=这种
   */
  componentDidMount() {
    this.start()
    this.setState({
      chart: this.refs.chart
    })
  }

  /**
   * 初始化加载地图
   */
  start = () => {
    this.initMap({
    }).then(() => {
      return this.addWmts()
    }).then(() => {
    })
  }

  addWmts = () => {
    const {map} = this.state 
    return new Promise(resolve => {
      //设置地图投影
      var projection = getProjection('EPSG:4326');
      var projectionExtent = projection.getExtent();
      var matrixIds = ['EPSG:4326:0', 'EPSG:4326:1', 'EPSG:4326:2', 'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6', 'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10',
        'EPSG:4326:11', 'EPSG:4326:12', 'EPSG:4326:13', 'EPSG:4326:14', 'EPSG:4326:15', 'EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18', 'EPSG:4326:19', 'EPSG:4326:20', 'EPSG:4326:21'];
      //切片大小
      var resolutions = [0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4, 8.58306884765625E-5,
        4.291534423828125E-5, 2.1457672119140625E-5, 1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6, 1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7];

      var source = new WMTS({
        url: 'http://localhost:8081/geoserver/gwc/service/wmts',
        layer: 'a0516:gaoxiao-gx',
        matrixSet: 'EPSG:4326',
        format: 'image/png',
        projection: projection,
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        wrapX: true
      })
      source.setTileLoadFunction(function customLoader(tile, src) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.addEventListener('loadend', function (evt) {
          var data = this.response;
          if (data !== undefined) {
            tile.getImage().src = URL.createObjectURL(data);
          } else {
            tile.setState(TileState.ERROR);
          }
        });
        xhr.addEventListener('error', function () {
          tile.setState(TileState.ERROR);
        });
        xhr.open('GET', src);
        xhr.setRequestHeader('f00', 'bar');
        xhr.send();
      })

      map.addLayer(new TileLayer({
        source: source
      }));

      resolve()
    })
  }

  initMap = () => {
    const { gaoxiaoPoint, quanqiu } = this.state
    gaoxiaoPoint.set('id', 'gaoxiaoPoint')
    gaoxiaoPoint.setVisible(true)
    return new Promise(resolve => {
      //全屏控件
      var fullScreenControl = new FullScreen()
      //弹出框层
      var overlay = new Overlay({
        id: 111,
        element: this.popupDiv,
        autoPan: true,
        autoPanMargin: 100,
        positioning: 'center-right'
      });

      var map = new Map({
        // interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([114, 30.5]), //定位到的经纬度
          zoom: 5
        }),
        overlays: [overlay],
        layers: [
          quanqiu,
          // gaoxiaoPoint,
        ],
        target: 'map' //mapdiv的id
      });
      map.addControl(fullScreenControl)

      //保存这个全局变量
      this.setState({
        map
      })
      resolve()
    })
  };

  //渲染页面html模块
  render() {
    const { map, showPopup, popHtml } = this.state
    return (
      <div style={{ width: '100%', height: 670, left: 0, top: 80, bottom: 0, right: 0, position: 'absolute', zIndex: 999 }}>
        <div className={styles.map} id="map"></div>
        <div id="chart" ref="chart" style={{ display: 'none' }}></div>
      </div>
    )
  }

}

export default OpenLayersClass
