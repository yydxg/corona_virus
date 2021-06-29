
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import mapboxgl from 'mapbox-gl'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'

const schoolRate = require("./file/result.json")
const labelJson = require("./file/label.json")

var map;
// var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
class MyMapbox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      styleValue: 'streets-v11',
      urlValue: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/911_testZ/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=',
    };
    this.map = null;
  }

  // https://api-global.mapbox.cn/v4/mapbox.terrain-rgb/8/211/111.webp?sku=101xmWG7ULiol&access_token=

  componentDidMount() {
    // mapboxgl.accessToken = 'pk.eyJ1IjoicGluZ2Fuc2hhbiIsImEiOiJjazBxMTd3YnAwM3JvM2dycDhmM2hrdWxuIn0.xKCpie1LxJsHjq0H77rbRw';
    mapboxgl.accessToken = 'pk.eyJ1IjoicGluZ2Fuc2hhbiIsImEiOiJja2xmd2d4NnQyMzF6MnZzOG1udjJ4MXg5In0.SPBgZOvXnfFgRQWHp29otQ'
    map = this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      // style:'mapbox://styles/mapbox/streets-v9',
      // center: [4.474246, 51.91385],
      center: [108.913, 34.22859],
      zoom: 10
    });

    this.map.on('load', e => {
      // 地图导航
      let nav = new mapboxgl.NavigationControl()
      this.map.addControl(nav, 'top-left')

      // 显示比例尺
      let scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
      })
      this.map.addControl(scale)
      scale.setUnit('metric')
      // 全屏按钮
      this.map.addControl(new mapboxgl.FullscreenControl())

      // 使用定位模块
      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserLocation: true,
          zoom: 14
        })
      )
    })

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    /* this.map.on('mouseenter', 'mypoint',  (e) => {
      // Change the cursor style as a UI indicator.
      this.map.getCanvas().style.cursor = 'pointer';

      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(this.map);
    });

    this.map.on('mouseleave', 'mypoint', ()=> {
      this.map.getCanvas().style.cursor = '';
      popup.remove();
    }); */

    this.map.on('mouseenter', 'school', (e) => {
      // Change the cursor style as a UI indicator.
      this.map.getCanvas().style.cursor = 'pointer';

      var coordinates = e.lngLat;
      var name = e.features[0].properties.name;
      var rate = e.features[0].properties.rate;
      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup
        .setLngLat(coordinates)
        .setHTML(`<div>
            ${name}
        </div>`)
        .addTo(this.map);
    });

    this.map.on('mouseleave', 'school', () => {
      this.map.getCanvas().style.cursor = '';
      popup.remove();
    });
  }

  addLayer = () => {
    const { urlValue } = this.state
    fetch(urlValue, {
      method: 'GET',
      /*headers: {
          'Content-Type': 'application/json;charset=UTF-8'
      },*/
      mode: 'cors',
      cache: 'default'
    }).then(res => res.json()).then((data) => {
      console.log(data)
      this.map.addSource('points', {
        'type': 'geojson',
        'data': data
      });
      this.map.addLayer({
        'id': 'mypoints',
        'type': 'circle',
        'source': 'points',
        'layout': {},
        'paint': {
          // 'fill-color':"#088",

        }
        /* 'layout': {
          // get the icon name from the source's "icon" property
          // concatenate the name to get an icon from the style's sprite sheet
          'icon-image': ['concat', ['get', 'icon'], '-15'],
          // get the title name from the source's "title" property
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        } */
      });

    })
  }

  jisuan = () => {
    console.log(schoolRate);
    if (map.getLayer('school')) {
      map.removeLayer('school');
      map.removeSource('school');
    }
    if (map.getLayer('poi-labels')) {
      map.removeLayer('poi-labels');
      map.removeSource('poi-labels');
    }
    this.map.addLayer({
      'id': 'school',
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': schoolRate
      },
      'layout': {},
      'paint': {
        'fill-color': "#088",
      }
    });

    this.map.addLayer({
      'id': 'poi-labels',
      'type': 'symbol',
      'source': {
        'type': 'geojson',
        'data': labelJson
      },
      'layout': {
        'text-field': ['get', 'rate'],
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        'text-radial-offset': 0.5,
        'text-justify': 'auto',
        // 'icon-image': ['concat', ['get', 'icon'], '-15']
      },
      "paint": {
        'text-color': "red"
      }
    });

    // this.map.rotateTo(180, { duration: 10000 });
    this.map.panTo([108.913, 34.22859])
  }

  onChangeMap = e => {
    console.log('radio checked', e.target.value);
    this.map.setStyle('mapbox://styles/mapbox/' + e.target.value);
    this.setState({
      styleValue: e.target.value,
    });
  };
  handleUrlChange = e => {
    this.setState({
      urlValue: e.target.value,
    });
  }
  render() {
    return <div className={styles.mapboxgl} > {/* style={{height:'100%',paddingTop:80,}} */}
      <div style={{ position: 'absolute', width: 480, zIndex: 1000, left: 50 }}>

        <Card style={{ width: '100%' }}>
          <Row>
            <Col span={4}>底图切换:</Col>
            <Col span={18}>
              <Radio.Group onChange={this.onChangeMap} value={this.state.styleValue}>
                <Radio value={'streets-v11'} Select={true}>streets</Radio>
                <Radio value={'light-v10'}>light</Radio>
                <Radio value={'dark-v10'}>dark</Radio>
                <Radio value={'satellite-v9'}>satellite</Radio>
              </Radio.Group>
            </Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={2}>图层:</Col>
            <Col span={22}>
              <Input
                type="text"
                size={'small'}
                value={this.state.urlValue}
                onChange={this.handleUrlChange}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col span={4}>
              <Button size='small' type="primary" onClick={this.addLayer}>添加</Button>
            </Col>
            <Col span={4}>
              <Button size='small' type="danger" onClick={this.jisuan}>计算</Button>
            </Col>
          </Row>
        </Card>
      </div>

      <div id="map" style={{ height: '100%' }}></div>
    </div>
  }
}

export default MyMapbox