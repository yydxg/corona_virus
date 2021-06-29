/* global mars3d Cesium*/
/* 导入antdesign包 */
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Panel from './panel'

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
const gaoxiaoJson = require('./file/gaoxiao.json')
class OpenLayersClass1 extends Component {

  constructor(props) {
    super(props)
    this.state = {
      map: null,
      chart: null,
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
      popHtml: '',/**存储弹框数据 */
      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible: false,
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
      //**绑定点击地图事件 */
      this.bindClick()
    })
  }

  initMap = () => {
    const { raster, arcgisLayer, imagesLayer, digitalLayer } = this.state
    /** 先设置图层的显示隐藏 */
    raster.set("id", "raster")
    raster.setVisible(true)
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
      var features = geojsonWrap.readFeatures(gaoxiao1Json)//读取所有的geojson数据
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
              color: [255, 255, 255, 0.01],
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
          center: fromLonLat([114, 30.5]), //定位到的经纬度
          zoom: 5
        }),
        overlays: [overlay],
        layers: [
          raster, 
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          vector,
        ],
        target: 'map'
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
    const { map, } = this.state
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

        var selectFeature = gaoxiaoJson.filter(item => {
          return item.id === "" + selected.values_.id
        })
        console.log(selectFeature)
        
        //保存点击的要素信息
        this.setState({
          popHtml: selectFeature[0]
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
      <div style={{width: '100%', height: 'calc(100% - 80px)',left: 0,top: 80,bottom: 0,right: 0,position: 'absolute',zIndex:999 }}>
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
                <tr><td >id：</td><td >{popHtml["id"]}</td></tr>
                <tr><td >name：</td><td >{popHtml["name"]}</td></tr>
                <tr><td >location：</td><td >{popHtml["location"]}</td></tr>
                <tr><td >city：</td><td >{popHtml["city"]}</td></tr>
                <tr><td >webpage：</td><td >{popHtml["webpage"]}</td></tr>
                <tr><td >ranking：</td><td >{popHtml["ranking"]}</td></tr>
                <tr><td >institude：</td><td >{popHtml["institude"]}</td></tr>
                <tr><td >influence：</td><td >{popHtml["influence"]}</td></tr>
                <tr><td >college：</td><td >{popHtml["college"]}</td></tr>
                <tr><td >major：</td><td >{popHtml["major"]}</td></tr>
                <tr><td >history：</td><td >{popHtml["history"]}</td></tr>
                <tr><td >Curriculum system：</td><td >{popHtml["Curriculum system"]}</td></tr>
                <tr><td >feature：</td><td >{popHtml["feature"]}</td></tr>
            </tbody>
            </table>
          </Card>
        </div>

        <div className={styles.panel}>
          <Panel> </Panel>
        </div>
      </div>
    )
  }

}

export default OpenLayersClass1
