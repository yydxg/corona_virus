/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button,Row, Col,Tooltip,Modal,Select  } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Pie from './pie'
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
import {FullScreen} from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';


const chinaJson = require('./file/wuhan.geojson')
const { Option, OptGroup } = Select;

class OpenLayersClass extends Component{

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
      wuhanGeojson:new VectorLayer({
        source: new VectorSource({
          url: chinaJson,
          format: new GeoJSON()
        }),
        style: new Style({
          stroke: new Stroke({
            color: '#319FD3',
            width: 20
          })
        })
      }),
      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible:false,
      confirmLoading: false,
    }
  }

  componentDidMount() {
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
    const {wuhanGeojson,arcgisLayer,imagesLayer,digitalLayer } = this.state
    arcgisLayer.set('id','arcgisLayer')
    arcgisLayer.setVisible(true)
    imagesLayer.set('id','imagesLayer')
    imagesLayer.setVisible(false)
    digitalLayer.set('id','digitalLayer')
    digitalLayer.setVisible(false)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
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
          wuhanGeojson,
        ],
        target: 'map'
      });
      map.addControl(fullScreenControl)
      this.setState({
        map
      })
    })
  };

  loadGeoJSON = (url) =>{
    const { viewer } = this.state
    var promise = Cesium.GeoJsonDataSource.load(url);
    promise.then((dataSource) => {
      viewer.dataSources.add(dataSource);
      viewer.flyTo(dataSource,{
        offset: {
          heading : Cesium.Math.toRadians(0),
          pitch : Cesium.Math.toRadians(-90.0),//从上往下看为-90
          roll : 0
        }
      })
      this.setState({
        obj:dataSource
      })
    })
  }

  loadMapServer = (url)=>{
    const { viewer } = this.state
    let layer = viewer.imageryLayers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
      url:url
    }));
    viewer.flyTo(layer,{
      offset: {
        heading : Cesium.Math.toRadians(0),
        pitch : Cesium.Math.toRadians(-90.0),//从上往下看为-90
        roll : 0
      }
    })
    this.setState({
      obj:layer
    })
  }

  load3Dtiles = (url)=>{
    const { viewer } = this.state
    var tileset = new Cesium.Cesium3DTileset({
      url: url
    })

    viewer && tileset.readyPromise.then((tileset) => {
      viewer.scene.primitives.add(tileset);
      // viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
      viewer.flyTo(tileset,{
        offset: {
          heading : Cesium.Math.toRadians(0),
          pitch : Cesium.Math.toRadians(-90.0),//从上往下看为-90
          roll : 0
        }
      })
      this.setState({
        obj:tileset
      })
    }).otherwise(function (error) {
      console.log(error);
    });
  }

  loadGeoServer = (url,layers)=>{
    const { viewer } = this.state
    viewer && viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
      url : url,
      layers:layers,
    }))
  }


  //影像和电子地图切换
  anhei = ()=>{
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

  showModal = (type) => {
    switch(type){
      case 'chart':
        this.setState({
          chartVisible: true,
          sourceVisible:false,
        });
        break;
      case 'source':
        this.setState({
          chartVisible: false,
          sourceVisible: true,
        });
        break;
    }
    
  };

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
            <div className={styles.buttons}>
              <Tooltip placement="right" title="图表分析" onClick={()=>this.showModal("chart")}>
                <Button type="dashed" block><span className="icon iconfont icon-zhengcefagui"></span></Button>
              </Tooltip>
              <Tooltip placement="bottom" title="人员分析" onClick={()=>this.showModal("source")}>
                <Button type="dashed" block><span className="icon iconfont icon-lujingyunsuan"></span></Button>
              </Tooltip>
            </div>
            <div className={styles.toolbar}>
              <div className={styles.bar} onClick={this.anhei}>
                {/* <span className="icon iconfont icon-zoomin"></span> */}
                <p>暗黑</p>
              </div>
              <div className={styles.bar} onClick={this.luwang}>
                {/* <span className="icon iconfont icon-zoomin"></span> */}
                <p>路网</p>
              </div>
              <div className={styles.bar} onClick={this.weixing}>
                {/* <span className="icon iconfont icon-zoomout"></span> */}
                <p>卫星</p>
              </div>
            </div>
          </div>
          <div id="chart" ref="chart" style={{display:'none'}}></div>
          
          {map && <Pie parent={this} map={map} chart={chart}  visible = {chartVisible}/>}

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



export default OpenLayersClass
