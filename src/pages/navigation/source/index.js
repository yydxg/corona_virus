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
      poiLayer: null,
      blingPointLayer: null,
      warkingLayer: null,
      blingHandler: null,
      animating: false,

      personLng: 0,
      personLat: 0,
    }
  }

  componentDidMount() {
    
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
        var inthtml = `<table style="width: 300px;"><tr>'
                  <th scope="col" colspan="8"  style="text-align:center;font-size:15px;">${feature.get('name')}</th></tr><tr>'
                  <td colspan="4">坐标：</td><td >${feature.get('lnglat')}</td></tr><tr>
                  <td colspan="4">详情：</td><td >${feature.get('info')}</td></tr><tr>
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

  bindBling = (pointsFeature) => {
    // const {blingPointLayer } = this.state
    var handle = setInterval(() => {
      for (let i = 0; i < pointsFeature.length; i++) {
        this.flash(pointsFeature[i])
      }
    }, 1000)
    this.setState({
      blingHandler: handle
    })
  }

  handleOk = () => {
    const { dispatch, map } = this.props
    const { input_value, records, shengData, style, poiLayer } = this.state;
    map.getOverlays().clear()
    dispatch({
      type: 'Visualization/getPois',
    }).then(result => {
      console.log(result)
      const { success, data } = result
      if (success) {
        let features = [];
        data.map((item, i) => {

          let feature = new Feature({
            geometry: new Point(transform([item.lng, item.lat], "EPSG:4326", "EPSG:3857")),
            flag: 'people',
            id: item.id,
            name: item.name,
            info: item.info,
            lnglat: item.lng + ',' + item.lat,
            lng: item.lng,
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

        if (poiLayer) {
          map.removeLayer(poiLayer)
        }
        vectorLayer.set('id', 'peopleSourceLayer')
        map.addLayer(vectorLayer)
        let view = map.getView()
        view.animate({
          center: fromLonLat([115.069,30.235]),
          zoom: 12,
          duration: 2000
        });
        this.setState({
          showToolBar: true,
          poiLayer: vectorLayer,
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


  addPerson = () => {
    const { blingHandler, warkingLayer, blingPointLayer } = this.state
    const { map } = this.props
    warkingLayer && map.removeLayer(warkingLayer)
    blingPointLayer && map.removeLayer(blingPointLayer)
    blingHandler && window.clearInterval(blingHandler)

    var input = document.getElementById("lnglat").value;
    console.log(input)
    let lng = parseFloat(input.split(',')[0])
    let lat = parseFloat(input.split(',')[1])
    let pointsFeature = []
    let pointFeature = new Feature({
      geometry: new Point(transform([lng, lat], "EPSG:4326", "EPSG:3857"))
    })
    pointsFeature.push(pointFeature)

    var vectorPointLayer = new VectorLayer({
      source: new VectorSource({
        features: pointsFeature
      })
    });
    if (blingPointLayer) {
      map.removeLayer(blingPointLayer)
    }
    vectorPointLayer.set('id', 'blingPointLayer')
    map.addLayer(vectorPointLayer)

    this.bindBling(pointsFeature)

    this.setState({
      blingPointLayer: vectorPointLayer,
      personLng: lng,
      personLat: lat
    })
  }

  flash = (feature) => {
    const { map } = this.props
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
  _styleFunction = function (feature) {
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

    geometry.forEachSegment(function (start, end) {
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

  _clear = () => {
    const { blingHandler, warkingLayer, blingPointLayer } = this.state
    const { map } = this.props
    warkingLayer && map.removeLayer(warkingLayer)
    blingPointLayer && map.removeLayer(blingPointLayer)
    blingHandler && window.clearInterval(blingHandler)
  }

  where = () => {
    const { prePick, pickId, warkingLayer, personLat, personLng } = this.state
    const { map } = this.props
    if (pickId === '') {
      Modal.info({ title: '请点选POI点!' })
    } else if (personLng === 0 && personLat === 0) {
      Modal.info({ title: '请添加人员位置!' })
    } else {
      warkingLayer && map.removeLayer(warkingLayer)

      console.log(prePick.get('lng'), prePick.get('lat'), pickId)
      let routeUrl = `http://restapi.amap.com/v3/direction/walking?key=6ae8c26f1ed9f9d5b10edbc19eb83062&origin=${personLng},${personLat}&destination=${prePick.get('lng')},${prePick.get('lat')}`
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
        if (warkingLayer) {
          map.removeLayer(warkingLayer)
        }
        vectorLayer.set('id', 'warkingLayer')
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
          warkingLayer: vectorLayer
        })
      })
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
    const { confirmLoading, showToolBar } = this.state
    const { visible } = this.props
    return (
      <div>
        <div style={{ position: "absolute", top: '180px', left: '150px' }}>
          <input id="lnglat" defaultValue="115.506971,30.230091"></input><button onClick={this.addPerson}>添加人员位置</button>
        </div>
        <div id="popup" className={styles["ol-popup"]}>
          <a href="#" id="popup-closer" className={styles["ol-popup-closer"]}></a>
          <div id="popup-content"></div>
          <div className={styles.bar} onClick={this.where}>
            <Tooltip placement="right" title="点我规划路线">
              <span className="icon iconfont icon-zuobiaozhuanhuan">去这儿</span>
            </Tooltip>
          </div>
        </div>

      </div>
    )
  }
}

export default Source