/* global mars3d Cesium*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Tree, Icon } from 'antd'
import styles from './style.less'
import echarts from 'echarts'

const { TreeNode } = Tree;

/* openlayers */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, XYZ } from 'ol/source';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction, Select as SelectInteraction } from 'ol/interaction';
import { Image as ImageLayer, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { ImageWMS, TileJSON, Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import { toLonLat, fromLonLat, get, getTransform } from 'ol/proj';
import { FullScreen } from 'ol/control';
import filter, { or, like, and, equalTo } from 'ol/format/filter';
import GeoJSON from 'ol/format/GeoJSON';
import { none } from 'ol/centerconstraint';
import { click, pointerMove } from 'ol/events/condition';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';

const { Option, OptGroup } = Select;

var myVectorSource = new VectorSource({
  format: new GeoJSON(),
  loader: function (extent, resolution, projection) {
    var proj = projection.getCode();
    var url = '/nongye/geoserver/nongye/ows?service=WFS&' +
      'version=1.1.0&request=GetFeature&typename=nongye:wusugd&' +
      'outputFormat=application/json&srsname=' + proj + '&' +
      'bbox=' + extent.join(',') + ',' + proj;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    var onError = function () {
      myVectorSource.removeLoadedExtent(extent);
    }
    xhr.onerror = onError;
    xhr.onload = function () {
      if (xhr.status == 200) {
        myVectorSource.addFeatures(
          myVectorSource.getFormat().readFeatures(xhr.responseText));
      } else {
        onError();
      }
    }
    xhr.send();
  },
  strategy: bboxStrategy
});

@connect(({ nongye }) => ({
  nongye
}))

class Nongye extends Component {

  constructor(props) {
    super(props)
    this.state = {
      map: null,
      chart: null,
      //底图
      digitalLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        })
      }),
      imagesLayer: new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        })
      }),
      arcgisLayer: new TileLayer({
        source: new XYZ({
          //url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      }),
      //业务图层
      cha1: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/jiangshui/wms',
          params: { 'LAYERS': 'jiangshui:7mwuhan1' },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      cha2: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/nongye/wms',
          params: { 'LAYERS': 'jiangshui:7mwuhan1' },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      showChart: false,
      crop_prop: null,//点击地块详细信息
    }
  }

  componentDidMount() {
    this.start()
    this.setState({
      chart: this.refs.chart,
    })
  }

  start = () => {
    this.initMap({
    }).then(() => {
      const { map, wushuCrops } = this.state

      //监听动作
      let that = this
      // map.on('singleclick', function (evt) {
      //   var viewResolution = /** @type {number} */ (map.getView().getResolution());
      //   var url = wushuCrops.getSource().getFeatureInfoUrl(
      //     evt.coordinate,
      //     viewResolution,
      //     'EPSG:3857',
      //     { 'INFO_FORMAT': 'application/json' }
      //   );
      //   if (url) {
      //     fetch(url)
      //       .then(function (response) { return response.text(); })
      //       .then(function (result) {
      //         let json = JSON.parse(result)
      //         console.log(json)
      //         that.setState({
      //           showChart: false,
      //           crop_prop: json.features.length > 0 ? json.features[0].properties : null
      //         })
      //       });
      //   }
      // });

      // map.on('pointermove', function (evt) {
      //   if (evt.dragging) {
      //     return;
      //   }
      //   var pixel = map.getEventPixel(evt.originalEvent);
      //   var hit = map.forEachLayerAtPixel(pixel, function () {
      //     return true;
      //   });
      //   map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      // });

      /** legend部分 */
      // // Update the legend when the resolution changes
      // map.getView().on('change:resolution', (event)=> {
      //   var resolution = event.target.getResolution();
      //   this.updateLegend(resolution);
      // });

    })
  }

  initMap = () => {
    const { arcgisLayer, imagesLayer, digitalLayer, cha1, cha2 } = this.state
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(false)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(true)
    cha2.set("id", 'cha2')
    cha2.setVisible(false)
    cha1.set("id", 'cha1')
    cha1.setVisible(true)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var map = new Map({
        interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([114,30.52]),
          zoom: 9
        }),
        layers: [
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          cha1,
          cha2
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)

      //监听单击选择
      var select = new SelectInteraction({
        condition: click,
      });
      map.addInteraction(select);
      select.on('select', function (e) {
        console.log(e.target.getFeatures())
      })

      this.setState({
        map
      }, () => {
        resolve()
      })
    })
  };

  //定位
  location = () => {
    const { map } = this.state
    let bmap = new BMap.Map("allmap");

    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        // alert('您的位置：'+r.point.lng+','+r.point.lat);
        map.setView(new View({
          center: fromLonLat([r.point.lng, r.point.lat]),
          zoom: 10
        }))
      }
      else {
        alert('failed' + this.getStatus());
      }
    });
  }
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


  onCheck = (checkedKeys, info) => {
    const { wushuCrops, cha2, cha1 } = this.state
    console.log(checkedKeys)
    cha1.setVisible(false)
    cha2.setVisible(false)
    //显示隐藏图层数据
    if (checkedKeys.includes("wuhan")) {//所有
      cha2.setVisible(true)
      cha1.setVisible(true)
    }else{
      if (checkedKeys.includes("cha1")) { //只有影像
        cha1.setVisible(true)
      } 
      if (checkedKeys.includes("cha2")) { //只有边界
        cha2.setVisible(true)
      } 
    } 
  };

  render() {
    const { map, chart, crop_prop, showChart } = this.state
    return (
      <div style={{ width: '100%', paddingTop: '80px' }}>
        <div className={styles.layer}>
          <Tree
            checkable
            defaultExpandedKeys={['wuhan']}
            defaultSelectedKeys={['cha2']}
            defaultCheckedKeys={['cha2']}
            // onSelect={this.onSelect}
            onCheck={this.onCheck}
          >
            <TreeNode title="武汉插值图" key="wuhan">
              <TreeNode title="插值1" key="cha1"></TreeNode>
              <TreeNode title="插值2" key="cha2"></TreeNode>
            </TreeNode>
          </Tree>
        </div>
        <div className={styles.map} id="map">
          <div className={styles.toolbar}>
            <div className={styles.bar} onClick={this.location}>
              <div id="allmap" style={{ display: none }}></div>
              <p><Icon type="environment" /></p>
            </div>
            <div className={styles.bar} onClick={this.anhei}>
              <p>暗黑</p>
            </div>
            <div className={styles.bar} onClick={this.luwang}>
              <p>路网</p>
            </div>
            <div className={styles.bar} onClick={this.weixing}>
              <p>卫星</p>
            </div>
          </div>

          {/* <div className={styles.legend}><img src={require('./img/legend.png')}></img></div> */}
        </div>
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



export default Nongye
