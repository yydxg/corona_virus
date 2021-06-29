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
import {easeOut} from 'ol/easing';
import {unByKey} from 'ol/Observable';
import { toStringHDMS } from 'ol/coordinate';
import { LineString, Point, Polygon } from 'ol/geom';
import { defaults as defaultInteractions, Pointer as PointerInteraction } from 'ol/interaction';
import { Heatmap as HeatmapLayer, Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileJSON, Vector as VectorSource ,Stamen} from 'ol/source';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import { toLonLat, fromLonLat, transform } from 'ol/proj';
import { FullScreen } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import {getVectorContext} from 'ol/render';

@connect(({ Visualization }) => ({
  Visualization
}))

class Source extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showToolBar: false,
      confirmLoading: false,
      visible: false,
      prePick: null,
      imageryLayer_gd: null,
      arrPoint: [],

      pickId: '',
      peopleLayer: null,
      suyuanLayer:null,
      blingPointLayer:null,
      huodongLayer:null,
      jiuzhengLayer:null,
      hospitalLayer:null,
      blingHandler:null,
      animating:false,
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
    const {blingPointLayer } = this.state
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

    map.on('click', (evt)=> {
      const {prePick } = this.state
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature) {
          return feature;
        });
      if (feature && (feature.get('flag') === 'people')) {
        var coordinate = feature.getGeometry().getCoordinates();
        var hdms = toStringHDMS(toLonLat(coordinate));
        console.log(feature)
        var inthtml = `<table style="width: 200px;"><tr>'
                  <th scope="col" colspan="4"  style="text-align:center;font-size:15px;">${feature.get('name')}</th></tr><tr>'
                  <td >性别：</td><td >${feature.get('sex')==='MEN'?'男':'女'}</td></tr><tr>
                  <td >年龄：</td><td >${feature.get('age')}岁</td></tr><tr>
                  <td >所在城市：</td><td >${feature.get('currentCity')}</td></tr><tr>
                  <td >健康状况：</td><td >${feature.get('health')}</td></tr><tr>
                  <td >经纬度：</td><td >${feature.get('lnglat')}</td></tr><tr>
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
            scale:0.7
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

  bindBling = (pointsFeature)=>{
    // const {blingPointLayer } = this.state
    var handle = setInterval(()=>{
        for(let i= 0 ;i <pointsFeature.length;i++){
          this.flash(pointsFeature[i])
        }
    },1000)
    this.setState({
      blingHandler:handle
    })
  }

  handleOk = () => {
    const { dispatch, map } = this.props
    const { input_value, records, shengData, style,peopleLayer } = this.state;
    map.getOverlays().clear()
    dispatch({
      type: 'Visualization/getPerson',
      payload: {
        currentCity: input_value || '武汉',
      },
    }).then(result => {
      console.log(result)
      const { success, data } = result
      if (success) {
        let features = [];
        data.map((item, i) => {
          let health = '';
          if (item.healthState === "SICK") {
            health = '确诊'
          } else if (item.healthState === "YES") {
            health = '健康'
          } else if (item.healthState === "CASE") {
            health = '疑似'
          }

          let feature = new Feature({
            geometry: new Point(transform([item.lon, item.lat], "EPSG:4326", "EPSG:3857")),
            flag:'people',
            id:item.id,
            name: item.name,
            age: item.age,
            sex: item.sex,
            currentCity: item.currentCity,
            health: health,
            lnglat: item.lon + ',' + item.lat,
            lng:item.lon,
            lat:item.lat,
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
        
        if(peopleLayer){
          map.removeLayer(peopleLayer)
        }
        vectorLayer.set('id', 'peopleSourceLayer')
        map.addLayer(vectorLayer)
        let view = map.getView()
        view.animate({
          center: fromLonLat([114, 30.2]),
          zoom:9,
          duration: 2000
        });
        this.setState({
          showToolBar: true,
          peopleLayer: vectorLayer,
          
        })
      }
    })

    this.setState({
      confirmLoading: true,
    });
    setTimeout(() => {
      this.setState({
        confirmLoading: false,
      });
      this.props.parent.hideModal()
    }, 2000);
  };

  handleCancel = () => {
    this.props.parent.hideModal()
  };

  handleChange = (value) => {
    this.setState({
      input_value: value
    })
  }

  suyuan = () => {
    const { pickId, huodongLayer,blingPointLayer } = this.state
    const {map } = this.props
    console.log(pickId)
    if (pickId === '') {
      Modal.info({ title: '请点选人员.' })
    } else {
      
      this.props.dispatch({
        type: 'Visualization/getSuyuan',
        payload: {
          id: pickId,
        },
      }).then((r) => {
        console.log(r)
        const { data } = r
        if (data.length === 1) {
          Modal.info({ title: '该人员没有直接接触人员.' })
        }else{
          let geometrys = new LineString([])
          let pointsFeature = []
          data.reverse().map((item, index) => {
            // arrs.push(item.lon, item.lat, 0)
            geometrys.appendCoordinate(transform([item.lon, item.lat], "EPSG:4326", "EPSG:3857"));
            if (item.healthState === "SICK") {
              let pointFeature = new Feature({
                geometry:new Point(transform([item.lon, item.lat], "EPSG:4326", "EPSG:3857"))
              })
              pointsFeature.push(pointFeature)
            }
          })

          let feature = new Feature({
            geometry: geometrys
            // id:item.id,
          })

          var vectorLayer = new VectorLayer({
            source: new VectorSource({
              features: [feature]
            }),
            style: this._styleFunction
          });
          if(huodongLayer){
            map.removeLayer(huodongLayer)
          }
          vectorLayer.set('id','huodongLayer')
          map.addLayer(vectorLayer)

          var vectorPointLayer = new VectorLayer({
            source: new VectorSource({
              features: pointsFeature
            })
          });
          if(blingPointLayer){
            map.removeLayer(blingPointLayer)
          }
          vectorPointLayer.set('id','blingPointLayer')
          map.addLayer(vectorPointLayer)

          let view = map.getView()
          view.fit(geometrys,{
            duration:1000
          });
          this.bindBling(pointsFeature)

          this.setState({
            huodongLayer:vectorLayer,
            blingPointLayer:vectorPointLayer
          })
        }
      })
    }
  }

flash = (feature)=> {
  const {map } = this.props
  let duration = 3000
  var start = new Date().getTime();
  var listenerKey = map.getLayers().item(0).on('postrender', animate);

  function animate(event) {
    var vectorContext = getVectorContext(event);
    var frameState = event.frameState;
    var flashGeom = feature.getGeometry().clone();
    var elapsed = frameState.time - start;
    var elapsedRatio = elapsed / duration;
    // radius will be 5 at start and 30 at end.
    var radius = easeOut(elapsedRatio) * 25 + 5;
    var opacity = easeOut(1 - elapsedRatio);

    var style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.25 + opacity
        })
      })
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    if (elapsed > duration) {
      unByKey(listenerKey);
      return;
    }
    // tell OpenLayers to continue postrender animation
    map.render();
  }
}
  _styleFunction = function(feature) {
    var geometry = feature.getGeometry();
    var styles = [
      // linestring
      new Style({
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        })
      })
    ];
  
    geometry.forEachSegment(function(start, end) {
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      var rotation = Math.atan2(dy, dx);
      // arrows
      styles.push(new Style({
        geometry: new Point(end),
        image: new Icon({
          src: '../img/arrow1.png',
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation
        })
      }));
    });
  
    return styles;
  };

  guiji = () => {
    const { pickId, huodongLayer } = this.state
    const { map } = this.props
    if (pickId === '') {
      Modal.info({ title: '请点选人员.' })
    } else {
      
      this._clear()

      this.props.dispatch({
        type: 'Visualization/getTravel',
        payload: {
          id: pickId,
        },
      }).then((r) => {
        const { data } = r
        console.log(data)
        if (data.length === 0) {
          Modal.info({ title: '该人员近期没有活动.' })
          return
        }

        let features = [];
        data.map((item, i) => {
          let feature = new Feature({
            geometry: new Point(transform([item.lon, item.lat], "EPSG:4326", "EPSG:3857")),
            flag:'travel',
            id:item.id,
            play: item.play,
            stay: item.stay,
            date:item.date,
            lnglat: item.lon + ',' + item.lat,
            lng:item.lon,
            lat:item.lat,
          })
          features.push(feature);
        });
        let vectorSource = new VectorSource({
          features: features
        })
        var vectorLayer = new HeatmapLayer({
          source: vectorSource,
          blur:10,
          radius:10,
          weight: function(feature) {
            var stay_hour = feature.get('stay');
            return stay_hour / 5;
          } 
        })
        
        if(huodongLayer){
          map.removeLayer(huodongLayer)
        }
        vectorLayer.set('id', 'huodongLayer')
        map.addLayer(vectorLayer)
        let view = map.getView()
        view.animate({
          center: fromLonLat([114, 30.2]),
          zoom:9,
          duration: 2000
        });

        this.setState({
          huodongLayer:vectorLayer
        })
      })
    }
  }

  _clear = () => {
    const {blingHandler, hospitalLayer,jiuzhengLayer,huodongLayer,blingPointLayer,suyuanLayer } = this.state
    const {map } = this.props
    hospitalLayer && map.removeLayer(hospitalLayer)
    jiuzhengLayer && map.removeLayer(jiuzhengLayer)
    huodongLayer && map.removeLayer(huodongLayer)
    blingPointLayer && map.removeLayer(blingPointLayer)
    suyuanLayer && map.removeLayer(suyuanLayer)
    blingHandler && window.clearInterval(blingHandler)
  }

  jiuzheng = () => {
    const { prePick, pickId, hospitalLayer,jiuzhengLayer } = this.state
    const { map } = this.props
    if (pickId === '') {
      Modal.info({ title: '请点选人员.' })
    } else {
      
      this._clear()

      console.log(prePick.get('lng'),prePick.get('lat'), pickId)
      
      //wgs84转国测局坐标
      // var wgs84togcj02 = coordtransform.wgs84togcj02(lng,lat);
      //国测局坐标转百度经纬度坐标
      // var gcj02tobd09 = coordtransform.gcj02tobd09(wgs84togcj02[0], wgs84togcj02[1]);
      let requestUrl = `http://restapi.amap.com/v3/place/around?key=93491b0fb44d1770a55eb86d219a8ffb&location=${prePick.get('lng')},${prePick.get('lat')}&keywords=医院&radius=5000&offset=20&page=1&extensions=all`;
      fetch(requestUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
      }).then(res => res.json()).then((data) => {
        console.log(data)
        const { count, info, pois } = data
        if (count === "0") {
          Modal.info({ title: '三千米范围内没有找到医院.' })
        } else {
          var hospitalFeatures = [];
          pois.map((item, index) => {
            //添加实体
            let lng = parseFloat(item.location.split(',')[0]);
            let lat = parseFloat(item.location.split(',')[1]);
            let pointFeature = new Feature({
              geometry:new Point(transform([lng, lat], "EPSG:4326", "EPSG:3857"))
            })
            pointFeature.setStyle(new Style({
              image: new Icon({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: './img/hospital.png',
                scale:0.05
              })
            }))
            hospitalFeatures.push(pointFeature)
          })

          var vectorPointLayer = new VectorLayer({
            source: new VectorSource({
              features: hospitalFeatures
            })
          });
          if(hospitalLayer){
            map.removeLayer(hospitalLayer)
          }
          vectorPointLayer.set('id','hospitalLayer')
          map.addLayer(vectorPointLayer)
          this.setState({
            hospitalLayer:vectorPointLayer
          })

          let destinationLng = parseFloat(pois[0].location.split(',')[0])
          let destinationLat = parseFloat(pois[0].location.split(',')[1])
          let routeUrl = `http://restapi.amap.com/v3/direction/driving?key=93491b0fb44d1770a55eb86d219a8ffb&origin=${prePick.get('lng')},${prePick.get('lat')}&destination=${destinationLng},${destinationLat}&originid=&destinationid=&extensions=base&strategy=0&waypoints=&avoidpolygons=&avoidroad=`
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
              for(let i = 0; i<polylines.length;i++){
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
              style:function(feature){
                // if()
                return new Style({
                  stroke: new Stroke({
                    width: 6, color: [237, 212, 0, 0.8]
                  })
                })
              }
            });
            if(jiuzhengLayer){
              map.removeLayer(jiuzhengLayer)
            }
            vectorLayer.set('id','jiuzhengLayer')
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
                    fill: new Fill({color: 'black'}),
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
              jiuzhengLayer:vectorLayer
            })

          })
        }
      })
    }
  }

  moveFeature = (event) => {
    const {animating } = this.state
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
  
  startAnimation = ()=> {
    const {animating } = this.state
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
  stopAnimation =(ended) => {
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
    const { confirmLoading, showToolBar } = this.state
    const { visible } = this.props
    return (
      <div>
        {/* <div id="popup" ref="popup" style={{display:'none'}}></div> */}
        <div id="popup" className={styles["ol-popup"]}>
          <a href="#" id="popup-closer" className={styles["ol-popup-closer"]}></a>
          <div id="popup-content"></div>
          <div className={styles.bar}  onClick={this.suyuan}>
            <Tooltip placement="right" title="溯源分析">
              <span className="icon iconfont icon-tuopuyunsuan"></span>
            </Tooltip>
          </div>
          <div className={styles.bar} onClick={this.guiji}>
            <Tooltip placement="right" title="轨迹分析">
              <span className="icon iconfont icon-lujingyunsuan"></span>
            </Tooltip>
          </div>
          <div className={styles.bar} onClick={this.jiuzheng}>
            <Tooltip placement="right" title="就诊分析">
              <span className="icon iconfont icon-zuobiaozhuanhuan"></span>
            </Tooltip>
          </div>
        </div>

        {/* {showToolBar && <div className={styles.toolbar}>
          <div className={styles.bar} onClick={this.suyuan}>
            <Tooltip placement="right" title="溯源分析">
              <span className="icon iconfont icon-tuopuyunsuan"></span>
            </Tooltip>
          </div>
          <div className={styles.bar} onClick={this.guiji}>
            <Tooltip placement="right" title="轨迹分析">
              <span className="icon iconfont icon-lujingyunsuan"></span>
            </Tooltip>
          </div>
          <div className={styles.bar} onClick={this.jiuzheng}>
            <Tooltip placement="right" title="就诊分析">
              <span className="icon iconfont icon-zuobiaozhuanhuan"></span>
            </Tooltip>
          </div>
        </div>} */}

        <Modal
          title="溯源分析"
          visible={visible}
          onOk={this.handleOk}
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          请选择：
            <Select showSearch defaultValue="武汉" style={{ width: 200 }} onChange={this.handleChange}>
            <OptGroup label="区域">
              <OptGroup label="湖北">
                <Option value="武汉">武汉</Option>
              </OptGroup>
              <OptGroup label="河南">
                <Option value="郑州">郑州</Option>
              </OptGroup>
            </OptGroup>
          </Select>,
          </Modal>
      </div>
    )
  }
}

export default Source