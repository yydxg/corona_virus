/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Source from './source'

/* openlayers */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, XYZ } from 'ol/source';
import TileGrid from 'ol/tilegrid/TileGrid';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource, TileArcGISRest, TileImage } from 'ol/source';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import { toLonLat, fromLonLat } from 'ol/proj';
import { FullScreen } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';


const liuxiangpng = require('./img/ArrowOpacity.png')

const { Option, OptGroup } = Select;

let resolutions = [];
for (let i = 0; i < 19; i++) {
  resolutions[i] = Math.pow(2, 18 - i);
}
let tilegrid = new TileGrid({
  origin: [0, 0],
  resolutions: resolutions,
});

class OpenLayersClass_Mobile extends Component {

  constructor(props) {
    super(props)
    this.state = {
      map: null,
      chart: null,
      baiduLayer: new TileLayer({
        source: new TileImage({
          projection: "EPSG:3857",
          tileGrid: tilegrid,
          tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            if (!tileCoord) {
              return "";
            }
            let z = tileCoord[0];
            let x = tileCoord[1];
            let y = -tileCoord[2];

            if (x < 0) {
              x = "M" + -x;
            }
            if (y < 0) {
              y = "M" + -y;
            }
            return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x=" + x + "&y=" + y + "&z=" + z + "&styles=pl&udt=20151021&scaler=1&p=1";
          }
        })
      }),
      digitalLayer: new TileLayer({
        source: new OSM()
        // source: new XYZ({
        //   url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        // }) 
      }),
      imagesLayer: new TileLayer({
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        })
      }),
      arcgisLayer: new TileLayer({
        source: new XYZ({
          url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      }),
      xuexiaoImgLayer: new TileLayer({
        source: new XYZ({
          url: 'http://127.0.0.1:8001/data/satellite/{z}/{x}/{y}.jpg'
        })
      }),
      xuexiaoLayer: new TileLayer({
        source: new TileArcGISRest({
          url: 'http://47.102.197.154:6080/arcgis/rest/services/test/cdlgdx/MapServer'
        })
      }),
      sourceVisible: false,
    }
  }

  componentDidMount() {
    this.start()
    console.log(this.refs.chart)
    this.setState({
      chart: this.refs.chart
    })
  }

  start = () => {
    this.initMap({
    }).then(() => {
    })
  }

  initMap = () => {
    const { arcgisLayer, imagesLayer, digitalLayer, xuexiaoLayer, xuexiaoImgLayer, baiduLayer } = this.state
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(false)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(true)
    xuexiaoImgLayer.set('id', 'xuexiaoLayer')
    xuexiaoImgLayer.setVisible(true)
    xuexiaoLayer.set('id', 'xuexiaoLayer')
    xuexiaoLayer.setVisible(true)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var map = new Map({
        interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([104.14, 30.68]),
          zoom: 16
        }),
        layers: [
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          // xuexiaoImgLayer,
          // baiduLayer,
          xuexiaoLayer,
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)
      this.setState({
        map
      })
    })
  };

  //影像和电子地图切换
  anhei = () => {
    const { map, arcgisLayer } = this.state
    var layers = map.getLayers()
    for (let i = 0; i < layers.getLength(); i++) {
      var id = layers.item(i).get('id')
      if (id === 'imagesLayer' || id === 'digitalLayer') {
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
      if (id === 'arcgisLayer' || id === 'digitalLayer') {
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
      if (id === 'arcgisLayer' || id === 'imagesLayer') {
        layers.item(i).setVisible(false)
      }
    }
    digitalLayer.setVisible(true)
  }

  render() {
    const { map, chart, sourceVisible } = this.state
    return (
      <div>
        <div className={styles.map} id="map">
          <div className={styles.bottomMenu}>
            <Row>
              <Col span={6}></Col>
              <Col span={6}></Col>
              <Col span={6}></Col>
              <Col span={6}></Col>
            </Row>
          </div>
          {/* <div className={styles.toolbar}>
              <div className={styles.bar} onClick={this.anhei}>
                <p>暗黑</p>
              </div>
              <div className={styles.bar} onClick={this.luwang}>
                <p>路网</p>
              </div>
              <div className={styles.bar} onClick={this.weixing}>
                <p>卫星</p>
              </div>
            </div> */}
        </div>
        <div id="chart" ref="chart" style={{ display: 'none' }}></div>

        {map && <Source parent={this} map={map} chart={chart} visible = {sourceVisible}/>} 
      </div>
    )
  }
}


var Drag = /*@__PURE__*/(function (PointerInteraction) {
  function Drag() {
    PointerInteraction.call(this, {
      handleDownEvent: handleDownEvent,
      handleDragEvent: handleDragEvent,
      handleMoveEvent: handleMoveEvent,
      handleUpEvent: handleUpEvent
    });

    /**
     * @type {import("../src/ol/coordinate.js").Coordinate}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;
  }

  if (PointerInteraction) Drag.__proto__ = PointerInteraction;
  Drag.prototype = Object.create(PointerInteraction && PointerInteraction.prototype);
  Drag.prototype.constructor = Drag;

  return Drag;
}(PointerInteraction));

/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
function handleDownEvent(evt) {
  var map = evt.map;

  var feature = map.forEachFeatureAtPixel(evt.pixel,
    function (feature) {
      return feature;
    });

  if (feature) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;
  }

  return !!feature;
}


/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Map browser event.
 */
function handleDragEvent(evt) {
  var deltaX = evt.coordinate[0] - this.coordinate_[0];
  var deltaY = evt.coordinate[1] - this.coordinate_[1];

  var geometry = this.feature_.getGeometry();
  geometry.translate(deltaX, deltaY);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
}


/**
 * @param {import("../src/ol/MapBrowserEvent.js").default} evt Event.
 */
function handleMoveEvent(evt) {
  if (this.cursor_) {
    var map = evt.map;
    var feature = map.forEachFeatureAtPixel(evt.pixel,
      function (feature) {
        return feature;
      });
    var element = evt.map.getTargetElement();
    if (feature) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
}


/**
 * @return {boolean} `false` to stop the drag sequence.
 */
function handleUpEvent() {
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
}



export default OpenLayersClass_Mobile
