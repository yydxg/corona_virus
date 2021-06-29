/* global mars3d Cesium*/
import React, { Component } from 'react';
import { connect } from 'dva';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Tree, Icon, message } from 'antd'
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
import { Fill, Stroke, Style,Circle as CircleStyle, } from 'ol/style';
import { toLonLat, fromLonLat, get, getTransform ,transform} from 'ol/proj';
import { FullScreen } from 'ol/control';
import filter, { or, like, and, equalTo, contains } from 'ol/format/filter';
import GeoJSON from 'ol/format/GeoJSON';
import { none } from 'ol/centerconstraint';
import { click, pointerMove } from 'ol/events/condition';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import {getVectorContext} from 'ol/render';

const { Option, OptGroup } = Select;

var myVectorSource = new VectorSource({
  format: new GeoJSON(),
  loader: function (extent, resolution, projection) {
    var proj = projection.getCode();
    var url = '/nongye/geoserver/imageSearch/ows?service=WFS&' +
      'version=1.1.0&request=GetFeature&typename=imageSearch:jinqu1&' +
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
      zjplayer: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/imageSearch/wms',
          params: { 'LAYERS': 'imageSearch:zjp1' },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      roadlayer: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/imageSearch/wms',
          params: { 'LAYERS': 'imageSearch:road1' },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      xianlayer: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/imageSearch/wms',
          params: { 'LAYERS': 'imageSearch:xian1' },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      jqdlayer: new ImageLayer({
        source: new ImageWMS({
          url: '/nongye/geoserver/imageSearch/wms',
          params: {
            'LAYERS': 'imageSearch:jinqu1',
            // 'CQL_FILTER': `kind='mianhua'`
          },
          ratio: 1,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
        }),
      }),
      myVectorLayer: new VectorLayer({
        style: new Style({
          fill: new Fill({ color: 'rgba(0,0,0,0.001)' }),
          // stroke:,
        }),
        source: myVectorSource
      }),

      showJD: false,
      showChart: false,
      crop_prop: null,//点击地块详细信息
      jiuzhengLayer:null,
      startPoint:[120,30],
      endPoint:[120,30.1],
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
      const { map, jqdlayer, myVectorLayer } = this.state

      //监听动作
      let that = this
      map.on('singleclick', function (evt) {
        var viewResolution = /** @type {number} */ (map.getView().getResolution());
        var url = jqdlayer.getSource().getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          'EPSG:3857',
          { 'INFO_FORMAT': 'application/json' }
        );
        if (url) {
          fetch(url)
            .then(function (response) { return response.text(); })
            .then(function (result) {
              let json = JSON.parse(result)
              if(!json.features[0]) return;
              console.log(json)
              let endPoint = transform(json.features[0].geometry.coordinates[0], "EPSG:3857", "EPSG:4326")
              console.log(endPoint)
              that.setState({
                showJD: false,
                showChart: false,
                endPoint,
                crop_prop: json.features.length > 0 ? json.features[0].properties : null
              })
            });
        }
      });

      map.on('pointermove', function (evt) {
        if (evt.dragging) {
          return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var hit = map.forEachLayerAtPixel(pixel, function () {
          return true;
        });
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
      });

      /** legend部分 */
      // // Update the legend when the resolution changes
      // map.getView().on('change:resolution', (event)=> {
      //   var resolution = event.target.getResolution();
      //   this.updateLegend(resolution);
      // });

    })
  }

  initMap = () => {
    const { arcgisLayer, imagesLayer, digitalLayer, roadlayer, zjplayer, xianlayer, jqdlayer, myVectorLayer } = this.state
    arcgisLayer.set('id', 'arcgisLayer')
    arcgisLayer.setVisible(false)
    imagesLayer.set('id', 'imagesLayer')
    imagesLayer.setVisible(true)
    digitalLayer.set('id', 'digitalLayer')
    digitalLayer.setVisible(false)
    zjplayer.set("id", 'zjplayer')
    zjplayer.setVisible(true)
    roadlayer.set("id", 'roadlayer')
    roadlayer.setVisible(false)
    xianlayer.set("id", 'xianlayer')
    xianlayer.setVisible(false)
    jqdlayer.set("id", 'jqdlayer')
    jqdlayer.setVisible(true)
    return new Promise(resolve => {
      var fullScreenControl = new FullScreen()
      var map = new Map({
        interactions: defaultInteractions().extend([new Drag()]),
        view: new View({
          center: fromLonLat([120.12, 29.48]),
          zoom: 9
        }),
        layers: [
          arcgisLayer,
          imagesLayer,
          digitalLayer,
          zjplayer,
          xianlayer,
          roadlayer,
          jqdlayer,
          myVectorLayer
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
    const that = this;
    geolocation.getCurrentPosition(function (r) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        alert('您的位置：'+r.point.lng+','+r.point.lat);
        map.setView(new View({
          center: fromLonLat([r.point.lng, r.point.lat]),
          zoom: 10
        }))
        that.setState({
          startPoint:[r.point.lng, r.point.lat]
        })
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
    const { jqdlayer, zjplayer, roadlayer, xianlayer } = this.state
    //显示隐藏图层数据
    if (checkedKeys.includes("allLayer")) {//两者皆有
      zjplayer.setVisible(true)
      xianlayer.setVisible(true)
      roadlayer.setVisible(true)
      jqdlayer.setVisible(true)
    } else {
      if (checkedKeys.includes("zjp")) { //省边界
        zjplayer.setVisible(true)
      } else {
        zjplayer.setVisible(false)
      }
      if (checkedKeys.includes("xian")) { //有县域
        xianlayer.setVisible(true)
      } else {
        xianlayer.setVisible(false)
      }
      if (checkedKeys.includes("road")) {
        roadlayer.setVisible(true)
      } else {
        roadlayer.setVisible(false)
      }

      if (checkedKeys.includes("jqd")) {
        jqdlayer.setVisible(true)
      } else {
        jqdlayer.setVisible(false)
      }
      //过滤crops业务图层要素数据
      // let p = ''
      // checkedKeys.forEach(element => {
      //   p += "'" + element + "' ,"
      // });

      // jqdlayer.getSource().updateParams({
      //   'CQL_FILTER': `kind in ${'(' + p.substr(0, p.length - 1) + ')'}`
      // })
      // jqdlayer.getSource().refresh()
    }
  };

  getArrDifference = (arr1, arr2) => {
    return arr1.concat(arr2).filter(function (v, i, arr) {
      return arr.indexOf(v) === arr.lastIndexOf(v);
    });
  }

  daohang = () => {
    const { jiuzhengLayer,map,startPoint,endPoint} = this.state
    if(endPoint[0] === 120) {
      message.alert('未选择景区!')
      return;
    }
    // let destinationLng = parseFloat(pois[0].location.split(',')[0])
    // let destinationLat = parseFloat(pois[0].location.split(',')[1])
    // let routeUrl = `http://restapi.amap.com/v3/direction/driving?key=93491b0fb44d1770a55eb86d219a8ffb&origin=${prePick.get('lng')},${prePick.get('lat')}&destination=${destinationLng},${destinationLat}&originid=&destinationid=&extensions=base&strategy=0&waypoints=&avoidpolygons=&avoidroad=`
    let routeUrl = `http://restapi.amap.com/v3/direction/driving?key=93491b0fb44d1770a55eb86d219a8ffb&origin=${startPoint[0]},${startPoint[1]}&destination=${endPoint[0]},${endPoint[1]}&originid=&destinationid=&extensions=base&strategy=0&waypoints=&avoidpolygons=&avoidroad=`
    fetch(routeUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'default'
    }).then(res => res.json()).then((result) => {
      console.log(result)
      const { info, route, } = result
      let steps = route.paths[0].steps
      let geometrys = new LineString([])
      let features = []
      steps.map((item, index) => {
        var polylines = item.polyline.split(';')
        for (let i = 0; i < polylines.length; i++) {
          let lng = parseFloat(polylines[i].split(',')[0])
          let lat = parseFloat(polylines[i].split(',')[1])
          geometrys.appendCoordinate(transform([lng, lat], "EPSG:4326", "EPSG:3857"));
        }
      })

      let feature = new Feature({
        geometry: geometrys
      })
      features.push(feature)

      var vectorLayer = new VectorLayer({
        source: new VectorSource({
          features: features
        }),
        style: function (feature) {
          // if()
          return new Style({
            stroke: new Stroke({
              width: 6, color: [237, 212, 0, 0.8]
            })
          })
        }
      });
      if (jiuzhengLayer) {
        map.removeLayer(jiuzhengLayer)
      }
      vectorLayer.set('id', 'jiuzhengLayer')
      map.addLayer(vectorLayer)

      var routeLength = geometrys.getCoordinates().length;
      var routeCoords = geometrys.getCoordinates()
      let animating = true;
      let now = new Date().getTime();
      let speed = 50
      vectorLayer.on('postrender', (event) => {
        var vectorContext = getVectorContext(event);
        var frameState = event.frameState;

        if (animating) {
          var elapsedTime = frameState.time - now;
          // here the trick to increase speed is to jump some indexes
          // on lineString coordinates
          var index = Math.round(speed * elapsedTime / 1000);

          if (index >= routeLength) {
            now = new Date().getTime();
            index = 0
            animating = false
            return;
          }

          var currentPoint = new Point(routeCoords[index]);
          var feature = new Feature(currentPoint);
          vectorContext.drawFeature(feature, new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: 'black' }),
              stroke: new Stroke({
                color: 'white', width: 2
              })
            })
          }));
          map.getView().setCenter(routeCoords[index]);
        }
        // tell OpenLayers to continue the postrender animation
        map.render();
      });

      this.setState({
        jiuzhengLayer: vectorLayer
      })

    })
  }

  lookJD = () => {
    this.setState({
      showJD: true
    })
  }

  NDVI = () => {
    const { crop_prop } = this.state
    this.setState({
      showJD: false,
      showChart: true
    }, () => {
      var myChart = echarts.init(document.getElementById('chart'));
      var option = {
        title: {
          text: '2021年旅游月度走势（观光人次）'
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: {
          type: 'value'
        },
        grid: {
          bottom: '10%',
          containLabel: true
        },
        series: [{
          data: Array.from({ length: 6 }, v => Math.floor(Math.random() * (500000 - 50000)) + 50000),
          type: 'line'
        }]
      };
      myChart.setOption(option);
    })
  }

  render() {
    const { map, chart, crop_prop, showChart, showJD } = this.state
    return (
      <div style={{ width: '100%', paddingTop: '80px' }}>
        <div className={styles.layer}>
          <Tree
            checkable
            defaultExpandedKeys={['allLayer', 'crops']}
            defaultSelectedKeys={['zjp', 'jqd']}
            defaultCheckedKeys={['zjp', 'jqd']}
            // onSelect={this.onSelect}
            onCheck={this.onCheck}
          >
            <TreeNode title="浙江景点" key="allLayer">
              <TreeNode title="省界" key="zjp"></TreeNode>
              <TreeNode title="县域" key="xian"></TreeNode>
              <TreeNode title="路网" key="road"></TreeNode>
              <TreeNode title="景点" key="jqd"></TreeNode>
            </TreeNode>
          </Tree>
          <Divider orientation="right"><a onClick={this.daohang}>驾车导航</a></Divider>
          <div className={styles.desc}>
            {crop_prop && (
              <>
                {/* <div className={styles.title}>农作物详情</div> */}
                <Divider orientation="left">景点详情</Divider>
                <div className={styles.item}><label>NAME：</label><span>{crop_prop.NAME}</span></div>
                <div className={styles.item}><label>KIND：</label><span>{crop_prop.KIND}</span></div>
                <Divider orientation="right"><a onClick={this.lookJD}>查看景点</a></Divider>
                <Divider orientation="right"><a onClick={this.NDVI}>景点走势</a></Divider>
              </>
            )
            }
          </div>
          {
            showChart && (
              <div className={styles.chart}>
                <div id="chart" ref="chart" style={{ width: '100%', height: '100%' }}></div>
              </div>

            )
          }
          {
            showJD && (
              <div className={styles.chart}>
                <div id="chart1" ref="chart1" style={{ width: '100%', height: '100%', padding: '20px' }}>
                  <Row>
                    <Col>
                      1.让您的身心合二为一——翠云山度假区。
                      2.一站式滑雪观光,全季候运动休闲。
                      3.大自然的健身房,原生态的翠云山。
                      4.“心”境界,雪天堂——翠云山。
                      5.云中小镇禅净土,四季大美翠云山。
                  </Col>
                  </Row>
                  <Row>
                    <Col>
                      <img width='100%' height='50%' src={Math.random() > 0.5 ? require('./img/jd1.jpg') : require('./img/jd2.jpg')}></img>
                    </Col>
                  </Row>
                </div>
              </div>

            )
          }
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
