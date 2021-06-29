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
import { TileJSON, TileWMS, Vector as VectorSource } from 'ol/source';
import { click, pointerMove, altKeyOnly } from 'ol/events/condition';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Select as OlSelect } from 'ol/interaction';
import { toStringHDMS } from 'ol/coordinate';
import { Fill, Icon, Stroke, Style, Circle } from 'ol/style';
import { toLonLat, fromLonLat } from 'ol/proj';
import { FullScreen } from 'ol/control';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';

const { Option, OptGroup } = Select;

/** 引入geojson文件，加载矢量数据 */
const gaoxiao1Json = require('./file/gaoxiao1.json')
const suzhou522 = require('./file/suzhou522.json')
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
      gaoxiaoGx: new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/a0516/wms',
          params: { 'LAYERS': 'a0516:gaoxiao-gx', 'TILED': true },
          serverType: 'geoserver',
          crossOrigin: 'anonymous'
        })
      }),
      suzhou_layer: new TileLayer({
        source: new TileWMS({
          url: 'http://localhost:8081/geoserver/fangwu/wms',
          params: { 'LAYERS': 'fangwu:shuzhou522', 'TILED': true },
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
    console.log(this.refs.chart)
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
      //**绑定点击地图事件 */
      this.bindClick()

    })
  }

  initMap = () => {
    const { raster, arcgisLayer, imagesLayer, digitalLayer,suzhou_layer } = this.state
    /** 先设置图层的显示隐藏 */
    raster.set("id", "raster")
    raster.setVisible(true)
    suzhou_layer.set('id', 'suzhou_layer')
    suzhou_layer.setVisible(true)
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(false)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(false)
    return new Promise(resolve => {
      //全屏控件
      var fullScreenControl = new FullScreen()
      var geojsonWrap = new GeoJSON()
      var features = geojsonWrap.readFeatures(suzhou522,{ 
        dataProjection: 'EPSG:4326',
        featureProjection:'EPSG:3857' })//读取所有的geojson数据  If you use EPSG:3857 in your view then your geojson vector declaration should be:3857
      console.log(features)
      var vectorSource = new VectorSource({
        projection: 'EPSG:4326',
	      /* url: "./file/gaoxiao.json", //GeoJSON的文件路径，用户可以根据需求而改变
        format: new GeoJSON() */
        features: features
      });
      //矢量图层
      var vector = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new Circle({
            radius: 3 * 2,
            fill: new Fill({
              color: [0, 153, 255, 0.01]
            }),
            stroke: new Stroke({
              color: [255, 255, 255, 0.001],
              width: 3 / 2
            })
          }),
        })
      });
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
          center: fromLonLat([120.722, 31.335]), //定位到的经纬度
          zoom: 10
        }),
        overlays: [overlay],
        layers: [
          raster, 
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          suzhou_layer,
          vector,
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

  bindClick = () => {
    const { map, wmsSource } = this.state
    //监听地图鼠标事件
    var overlay = map.getOverlayById(111)

    var selected = null;
    //高亮显示要素的风格
    var highlightStyle = new Style({
      fill: new Fill({
        color: 'rgba(255,255,255,0.7)'
      }),
      stroke: new Stroke({
        color: '#3399CC',
        width: 3
      })
    });
    //监听单击点击事件
    map.on('singleclick', (e) => {//singleclick pointermove
      if (selected !== null) {
        selected.setStyle(undefined);
        selected = null;
      }

      map.forEachFeatureAtPixel(e.pixel, function (f) {
        selected = f;
        f.setStyle(highlightStyle);
        return true;
      });

      if (selected) {
        console.log(selected)
        var element = overlay.getElement();
        var coordinate = e.coordinate;
        var hdms = toStringHDMS(toLonLat(coordinate));
        overlay.setPosition(coordinate);

        /* var pp ='';
        for (var key in selectFeature[0]) {
          pp += `<tr><td > ${key}：</td><td >${selectFeature[0][key]}</td></tr>`
        } */
        //保存点击的要素信息
        this.setState({
          popHtml: selected.values_
        })
      }
    });
  }

  //影像和电子地图切换
  osg = () => {
    const { map, raster } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'imagesLayer' || id === 'digitalLayer' || id === 'arcgisLayer') {
        layers.item(i).setVisible(false)
      }
    }
    raster.setVisible(true)
  }
  anhei = () => {
    const { map, arcgisLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'imagesLayer' || id === 'digitalLayer' || id === 'raster') {
        layers.item(i).setVisible(false)
      }
    }
    arcgisLayer.setVisible(true)
  }
  weixing = () => {
    const { map, imagesLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'arcgisLayer' || id === 'digitalLayer' || id === 'raster') {
        layers.item(i).setVisible(false)
      }
    }
    imagesLayer.setVisible(true)
  }
  luwang = () => {
    const { map, digitalLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'arcgisLayer' || id === 'imagesLayer' || id === 'raster') {
        layers.item(i).setVisible(false)
      }
    }
    digitalLayer.setVisible(true)
  }

  //关闭popup
  closePopup = () => {
    const { map } = this.state;
    var overlay = map.getOverlayById(111)
    overlay.setPosition(undefined);
  }

  //渲染页面html模块
  render() {
    const { map, showPopup, popHtml } = this.state
    return (
      <div style={{width: '100%', height: 670,left: 0,top: 80,bottom: 0,right: 0,position: 'absolute',zIndex:0 }}>
        <div className={styles.map} id="map">
          <div className={styles.toolbar}>
            <div className={styles.bar} onClick={this.osg}>
              <p>OSG</p>
            </div>
            <div className={styles.bar} onClick={this.anhei}>
              <p>mapbox</p>
            </div>
            <div className={styles.bar} onClick={this.luwang}>
              <p>路网</p>
            </div>
            <div className={styles.bar} onClick={this.weixing}>
              <p>卫星</p>
            </div>
          </div>
        </div>
        <div id="chart" ref="chart" style={{ display: 'none' }}></div>
        <div id="popup" ref={(popupDiv) => { this.popupDiv = popupDiv }} style={{overflow:'auto',width:500,height:800}}>
          <Card title="信息" extra={<a href="#" onClick={this.closePopup}>关闭</a>} style={{ width: 500 }}>
            <table >
              {/* 弹框信息 */}
              <tbody style={{overflow:'auto',width:300,height:500}}>
                <tr><td >坐标：</td><td >{popHtml["lng"]+","+popHtml["lat"]}</td></tr>
                {/* <tr><td >经度：</td><td >{popHtml["lng"]}</td></tr>
                <tr><td >维度：</td><td >{popHtml["lat"]}</td></tr> */}
                <tr><td >所在市/区/街道/小区：</td><td >{popHtml["shi"]+"/"+popHtml["xzqu"]+"/"+popHtml["jiedao"]+"/"+popHtml["xiaoqu"]}</td></tr>
                {/* <tr><td >行政区：</td><td >{popHtml["xzqu"]}</td></tr>
                <tr><td >街道：</td><td >{popHtml["jiedao"]}</td></tr>
                <tr><td >小区：</td><td >{popHtml["xiaoqu"]}</td></tr> */}
                <tr><td >成交日期：</td><td >{popHtml["cj_date"]}</td></tr>
                <tr><td >成交总价：</td><td >{popHtml["cj_zongjia"]}</td></tr>
                <tr><td >建筑面积：</td><td >{popHtml["jianzhumia"]}</td></tr>
                <tr><td >单价：</td><td >{popHtml["danjia"]}</td></tr>
                <tr><td >建筑类型：</td><td >{popHtml["leixing"]}</td></tr>
                <tr><td >年代：</td><td >{popHtml["niandai"]}</td></tr>
                <tr><td >朝向：</td><td >{popHtml["chaoxiang"]}</td></tr>
                <tr><td >楼层：</td><td >{popHtml["louceng"]}</td></tr>
                <tr><td >情况：</td><td >{popHtml["qingkuang"]}</td></tr>
                <tr><td >挂牌价：</td><td >{popHtml["guapaijia"]}</td></tr>
                <tr><td >关注人数：</td><td >{popHtml["guanzhuren"]}</td></tr>
                <tr><td >成交周期：</td><td >{popHtml["cj_zhouqi"]}</td></tr>
                <tr><td >浏览人数：</td><td >{popHtml["liulan"]}</td></tr>
            </tbody>
            </table>
          </Card>
        </div>
      </div>
    )
  }

}

export default OpenLayersClass
