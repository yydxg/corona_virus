/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button,Row, Col,Tooltip,Modal,Select  } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Source from './source'

/* openlayers */
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import { OSM, XYZ} from 'ol/source';
import {LineString, Point, Polygon} from 'ol/geom';
import {defaults as defaultInteractions, Pointer as PointerInteraction} from 'ol/interaction';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {TileJSON, Vector as VectorSource} from 'ol/source';
import {Fill, Icon, Stroke, Style} from 'ol/style';
import {toLonLat, fromLonLat} from 'ol/proj';
import {FullScreen,ScaleLine} from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import { connect } from 'dva';

// const chinaJson = require('./file/wuhan.geojson')
const { Option, OptGroup } = Select;

@connect(({Navigation, Login }) => ({
  Navigation, Login
}))

class Navigation extends Component{

  constructor(props) {
    super(props)
    this.state = {
      map:null,
      chart:null,
      digitalLayer:new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
        }) 
      }),
      imagesLayer:new TileLayer({
        //source: new OSM()
        source: new XYZ({
          url: 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'
        }) 
      }),
      arcgisLayer:new TileLayer({
        source: new XYZ({
          //url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        })
      }),
      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible:false,
      confirmLoading: false,
    }
  }

  componentDidMount() {
    let { dispatch,history } = this.props;
    const login = this.props.Login;
    /* if(login && login.username !==''){
      this.start()
      console.log(this.refs.chart)
      this.setState({
        chart:this.refs.chart
      })
    }else{
      history.push('/')
    } */
    this.start()
      console.log(this.refs.chart)
      this.setState({
        chart:this.refs.chart
      })
  }

  start = ()=>{
    this.initMap({
    }).then(()=>{
    })
  }

  initMap = () => {
    const {arcgisLayer,imagesLayer,digitalLayer } = this.state
    arcgisLayer.set('id','arcgisLayer')
    arcgisLayer.setVisible(true)
    imagesLayer.set('id','imagesLayer')
    imagesLayer.setVisible(false)
    digitalLayer.set('id','digitalLayer')
    digitalLayer.setVisible(false)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var scaleLineControl = new ScaleLine({
        //设置度量单位为米
        units: 'metric',
        target: 'scalebar',
        className: 'ol-scale-line'
      });

      var map = new Map({
        interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([114, 30.5]),
          zoom: 16
        }),
        layers: [
          arcgisLayer,
          imagesLayer,
          digitalLayer,
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)
      map.addControl(scaleLineControl);
      this.setState({
        map
      })
    })
  };


  //影像和电子地图切换
  landi = ()=>{
    const {map,arcgisLayer } = this.state
    var layers = map.getLayers()
    for(let i=0 ; i<layers.getLength(); i++){
      var id = layers.item(i).get('id')
      if(id === 'imagesLayer'||id === 'digitalLayer'){
        layers.item(i).setVisible(false)
      }
    }
    arcgisLayer.setVisible(true)
  }
  weixing = ()=>{
    const {map,imagesLayer } = this.state
    var layers = map.getLayers()
    for(let i=0 ; i<layers.getLength(); i++){
      var id = layers.item(i).get('id')
      if(id === 'arcgisLayer'||id === 'digitalLayer'){
        layers.item(i).setVisible(false)
      }
    }
    imagesLayer.setVisible(true)
  }
  luwang = () =>{
    const {map,digitalLayer } = this.state
    var layers = map.getLayers()
    for(let i=0 ; i<layers.getLength(); i++){
      var id = layers.item(i).get('id')
      if(id === 'arcgisLayer'||id === 'imagesLayer'){
        layers.item(i).setVisible(false)
      }
    }
    digitalLayer.setVisible(true)
  }

  hideModal = () =>{
    this.setState({
      chartVisible:false,
      sourceVisible:false,
    })
  }
  
  render(){
    const {map,chart,chartVisible,sourceVisible, confirmLoading, ModalText} = this.state
    return(
        <div style={{width:'100%', padding:'100px 0 10px'}}>
          <div className={styles.map} id="map">
            <div className={styles.toolbar}>
              <div className={styles.bar} onClick={this.landi}>
                <p>深蓝</p>
              </div>
              <div className={styles.bar} onClick={this.luwang}>
                <p>百度</p>
              </div>
              <div className={styles.bar} onClick={this.weixing}>
                <p>卫星</p>
              </div>
            </div>
          </div>
          <div id="chart" ref="chart" style={{display:'none'}}></div>
          <div id="scalebar" ref="scalebar" style={{float:'left',position:'absolute',bottom:'85px'}}></div>
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

  if ( PointerInteraction ) Drag.__proto__ = PointerInteraction;
  Drag.prototype = Object.create( PointerInteraction && PointerInteraction.prototype );
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
    function(feature) {
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
      function(feature) {
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



export default Navigation
