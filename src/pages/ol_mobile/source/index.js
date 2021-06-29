/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { Option, OptGroup } = Select;
const liuxiangpng = require('../img/ArrowOpacity.png')
const arrowImg = require('../img/arrow.png')
const hospitalImg = require('../img/hospital.png')
const linkPulseImg = require('../img/LinkPulse.png')

// const peopleSourceImg = require('../img/people.png')

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay';
import { OSM, XYZ } from 'ol/source';
import { easeOut } from 'ol/easing';
import { unByKey } from 'ol/Observable';
import { toStringHDMS } from 'ol/coordinate';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction } from 'ol/interaction';
import { Heatmap as HeatmapLayer, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource, Stamen } from 'ol/source';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import { toLonLat, fromLonLat, transform } from 'ol/proj';
import { FullScreen } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import { getVectorContext } from 'ol/render';

@connect(({ OMobile }) => ({
  OMobile
}))
class OL_Source extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showToolBar: false,
      confirmLoading: false,
      prePick: null,
      imageryLayer_gd: null,
      arrPoint: [],

      pickId: '',
      peopleLayer: null,
      suyuanLayer: null,
      blingPointLayer: null,
      huodongLayer: null,
      jiuzhengLayer: null,
      poisLayer: null,
      blingHandler: null,
      animating: false,
    }
  }

  componentDidMount() {
    this.setState({

    })
    this.handleOk();
    this.bindClickEvent()

  }

  bindClickEvent = () => {
    const { map } = this.props
    const { blingPointLayer } = this.state
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    var overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    map.addOverlay(overlay);

    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    map.on('click', (evt) => {
      const { prePick } = this.state
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
          return feature;
        });
      if (feature && (feature.get('flag') === 'people')) {
        var coordinate = feature.getGeometry().getCoordinates();
        var hdms = toStringHDMS(toLonLat(coordinate));
        console.log(feature)
        // var inthtml = `<table style="width: 200px;"><tr>'
        //           <th scope="col" colspan="4"  style="text-align:center;font-size:15px;">${feature.get('name')}</th></tr><tr>'
        //           <td >性别：</td><td >${feature.get('sex')==='MEN'?'男':'女'}</td></tr><tr>
        //           <td >年龄：</td><td >${feature.get('age')}岁</td></tr><tr>
        //           <td >所在城市：</td><td >${feature.get('currentCity')}</td></tr><tr>
        //           <td >健康状况：</td><td >${feature.get('health')}</td></tr><tr>
        //           <td >经纬度：</td><td >${feature.get('lnglat')}</td></tr><tr>
        //           <td colspan="4" style="text-align:right;"></td></tr></table>`;
        var inthtml = `<table style="width: 200px;"><tr>'
                  <th scope="col" colspan="4"  style="font-size:15px;">${feature.get('name')}</th></tr><tr>'
                  <td >X(m)：</td><td >5440.812</td></tr><tr>
                  <td >Y(m)：</td><td >9130.483</td></tr><tr>
                  <td >H(m)：</td><td >504.974</td></tr><tr>
                  <td >经纬度：</td><td >${feature.get('lnglat')}</td></tr><tr>
                  <td >备注：</td><td ></td></tr><tr>
                  <td colspan="4" style="text-align:right;"></td></tr></table>`;
        content.innerHTML = inthtml
        overlay.setPosition(coordinate);

        prePick && prePick.setStyle(new Style({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: './img/marker-blue.png'
          })
        }))

        feature.setStyle(new Style({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src: './img/marker-red.png',
            scale: 0.7
          })
        }))
        this.setState({
          pickId: feature.get('id'),
          prePick: feature
        })
      }
    });
  }
  componentWillUnmount() {
  }

  handleOk = () => {
    const { dispatch, map } = this.props
    const { input_value, records, shengData, style, peopleLayer } = this.state;
    map.getOverlays().clear()

    let features = [];
    let data = [{
      lon: 104.138,
      lat: 30.675,
      name: 'D01'
    }, {
      lon: 104.144,
      lat: 30.675,
      name: 'D13'
    }, {
      lon: 104.147,
      lat: 30.684,
      name: 'D55'
    }, {
      lon: 104.151,
      lat: 30.682,
      name: 'D76'
    }]
    data.map((item, i) => {
      let feature = new Feature({
        geometry: new Point(transform([item.lon, item.lat], "EPSG:4326", "EPSG:3857")),
        flag: 'people',
        id: item.id,
        name: item.name,
        lnglat: item.lon + ',' + item.lat,
        lng: item.lon,
        lat: item.lat,
      })
      feature.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: './img/marker-blue.png'
        })
      }))
      features.push(feature);
    });
    let vectorSource = new VectorSource({
      features: features
    })
    var vectorLayer = new VectorLayer({
      source: vectorSource
    })

    if (peopleLayer) {
      map.removeLayer(peopleLayer)
    }
    vectorLayer.set('id', 'peopleSourceLayer')
    map.addLayer(vectorLayer)
    this.setState({
      showToolBar: true,
      peopleLayer: vectorLayer,

    })

    this.setState({
      confirmLoading: true,
    });
    setTimeout(() => {
      this.setState({
        confirmLoading: false,
      });
    }, 2000);
  };

  handleChange = (value) => {
    this.setState({
      input_value: value
    })
  }

  _clear = () => {
    const { blingHandler, poisLayer, jiuzhengLayer, huodongLayer, blingPointLayer, suyuanLayer } = this.state
    const { map } = this.props
    poisLayer && map.removeLayer(poisLayer)
    jiuzhengLayer && map.removeLayer(jiuzhengLayer)
    huodongLayer && map.removeLayer(huodongLayer)
    blingPointLayer && map.removeLayer(blingPointLayer)
    suyuanLayer && map.removeLayer(suyuanLayer)
    blingHandler && window.clearInterval(blingHandler)
  }

  guihua = (p) => {
    const { prePick, pickId, poisLayer, jiuzhengLayer } = this.state
    const { map } = this.props
    if (pickId === '') {
      Modal.info({ title: '请点选点标，指定要去的地方！' })
    } else {

      this._clear()
      console.log(prePick.get('lng'), prePick.get('lat'), pickId)
      //wgs84转国测局坐标
      // var wgs84togcj02 = coordtransform.wgs84togcj02(lng,lat);
      //国测局坐标转百度经纬度坐标
      // var gcj02tobd09 = coordtransform.gcj02tobd09(wgs84togcj02[0], wgs84togcj02[1]);
      let bmap = new BMap.Map("allmap");

      var geolocation = new BMap.Geolocation();
      let that = this;
      geolocation.getCurrentPosition(function (r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
          console.log('您的位置：' + r.point.lng + ',' + r.point.lat);
          map.setView(new View({
            center: fromLonLat([r.point.lng, r.point.lat]),
            zoom: 10
          }))

          let poisFeatures = [];
          let lng = r.point.lng;
          let lat = r.point.lat;
          let pointFeature = new Feature({
            geometry: new Point(transform([lng, lat], "EPSG:4326", "EPSG:3857"))
          })
          pointFeature.setStyle(new Style({
            image: new Icon({
              anchor: [0.5, 1],
              anchorXUnits: 'fraction',
              anchorYUnits: 'pixels',
              src: './img/people.png',
              scale: 0.05
            })
          }))
          poisFeatures.push(pointFeature)

          var vectorPointLayer = new VectorLayer({
            source: new VectorSource({
              features: poisFeatures
            })
          });
          if (poisLayer) {
            map.removeLayer(poisLayer)
          }
          vectorPointLayer.set('id', 'poisLayer')
          map.addLayer(vectorPointLayer)
          that.setState({
            poisLayer: vectorPointLayer
          })

          let routeUrl = `http://restapi.amap.com/v3/direction/${p}?key=93491b0fb44d1770a55eb86d219a8ffb&origin=${lng},${lat}&destination=${prePick.get('lng')},${prePick.get('lat')}&originid=&destinationid=&extensions=base&strategy=0&waypoints=&avoidpolygons=&avoidroad=`
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

            that.setState({
              jiuzhengLayer: vectorLayer
            })

          })


        }
        else {
          alert('failed' + this.getStatus());
        }
      });

    }
  }

  moveFeature = (event) => {
    const { animating } = this.state
    var vectorContext = getVectorContext(event);
    var frameState = event.frameState;

    if (true) {
      var elapsedTime = frameState.time - now;
      // here the trick to increase speed is to jump some indexes
      // on lineString coordinates
      var index = Math.round(speed * elapsedTime / 1000);

      if (index >= routeLength) {
        stopAnimation(true);
        return;
      }

      var currentPoint = new Point(routeCoords[index]);
      var feature = new Feature(currentPoint);
      vectorContext.drawFeature(feature, styles.geoMarker);
    }
    // tell OpenLayers to continue the postrender animation
    map.render();
  };

  startAnimation = () => {
    const { animating } = this.state
    if (animating) {
      stopAnimation(false);
    } else {
      animating = true;
      now = new Date().getTime();
      speed = 10;
      // hide geoMarker
      geoMarker.setStyle(null);
      // just in case you pan somewhere else
      map.getView().setCenter(center);

    }
  }


  /**
   * @param {boolean} ended end of animation.
   */
  stopAnimation = (ended) => {
    animating = false;
    startButton.textContent = 'Start Animation';

    // if animation cancelled set the marker at the beginning
    var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0];
    var geometry = geoMarker.getGeometry();
    geometry.setCoordinates(coord);
    //remove listener
    vectorLayer.un('postrender', this.moveFeature);
  }

  render() {
    return (
      <div>
        {/* <div id="popup" ref="popup" style={{display:'none'}}></div> */}
        <div id="popup" className={styles["ol-popup"]}>
          <a href="#" id="popup-closer" className={styles["ol-popup-closer"]}></a>
          <div id="popup-content"></div>
          <div className={styles.bar}>
            <Tooltip placement="right" title="步行到这儿去" onClick={()=>this.guihua('walking')}>
              <span className="icon iconfont icon-zuobiaozhuanhuan">步行到这儿去</span>
            </Tooltip>
          </div>
          <div className={styles.bar}>
            <Tooltip placement="right" title="开车到这儿去" onClick={()=>this.guihua('driving')}>
              <span className="icon iconfont icon-zuobiaozhuanhuan">开车到这儿去</span>
            </Tooltip>
          </div>
        </div>
        <div id="allmap" style={{ display: 'none' }}></div>
      </div>
    )
  }
}

export default OL_Source