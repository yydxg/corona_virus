/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel, Menu, InputNumber, Message
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { SubMenu } = Menu;
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

const defaultMarker = require('./file/poi-marker-default.png')
const redMarker = require('./file/poi-marker-red.png')

class LocationProfile extends Component {

  constructor(props) {
    super(props)
    this.state = {
      value: '',
      movieName: '',
      data: [],

      map: null,
      defaultLayer: AMap.createDefaultLayer(),
      weiPianLayer: new AMap.TileLayer.Satellite(),
      roadNetLayer: new AMap.TileLayer.RoadNet(),
      trafficLayer: new AMap.TileLayer.Traffic({
        zIndex: 10
      }),
      radioValue: 1,
    }
  }

  componentDidMount() {
    let { dispatch, history, location } = this.props;
    const login = this.props.Login;
    const { center, defaultLayer, trafficLayer, roadNetLayer, weiPianLayer } = this.state
    const address = location.query.address
    
    /* if (login && login.username !== '') {
      dispatch({
        type: 'Movie/getAllMovies',
        callback: res => {
          console.log(res);
        }
      })
    } else {
      history.push('/')
    } */
    setTimeout(() => {
      var map = new AMap.Map(this.mapDiv, {
        zoom: 10,
      })

      map.addLayer(defaultLayer)
      map.addLayer(trafficLayer)
      map.addLayer(weiPianLayer)
      map.addLayer(roadNetLayer)
      trafficLayer.hide()
      weiPianLayer.hide()
      roadNetLayer.hide()


      map.on("complete", () => {
        console.log("地图加载完成！");

        AMap.plugin('AMap.Geocoder', () => {
          var geocoder = new AMap.Geocoder({
            // city 指定进行编码查询的城市，支持传入城市名、adcode 和 citycode
            city: '全国'
          })

          geocoder.getLocation(address, (status, result)=> {
            console.log(result)
            if (status === 'complete' && result.info === 'OK') {
              // result中对应详细地理坐标信息
              console.log(result)
              const { geocodes } = result;
              const { location } = geocodes[0]
              this.addMarker(address, [location.lng, location.lat])
              map.setCenter([location.lng, location.lat])
            } else {
              Modal.error({
                content: '没有找到此地方哦哦',
              })
            }
          })
        })
      });


      this.setState({
        map,
      })
    }, 600)
  }


  //添加marker
  addMarker = (name, position) => {
    const { map } = this.state
    // var random = Math.random()
    var marker = new AMap.Marker({
      title: name,
      // icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
      icon: redMarker,
      position
      // offset: new AMap.Pixel(-13, -30)
    });
    marker.setMap(map);
    
  }

  onChangeRadio = e => {
    console.log('radio checked', e.target.value);
    const { map, defaultLayer, weiPianLayer, trafficLayer, roadNetLayer } = this.state
    defaultLayer.hide()
    weiPianLayer.hide()
    trafficLayer.hide()
    roadNetLayer.hide()
    switch (e.target.value) {
      case 1:
        defaultLayer.show()
        break;
      case 2:
        weiPianLayer.show()
        break;
      case 3:
        weiPianLayer.show()
        roadNetLayer.show()
        break;
      case 4:
        trafficLayer.show()
        break;
    }

    this.setState({
      radioValue: e.target.value,
    });
  };

  render() {
    // const {value,data} = this.state

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div className={styles.Movie}>
        <Card style={{ position: 'absolute', right: 0, bottom: 10, zIndex: 2147483647, width: 140 }}>
          <Radio.Group onChange={this.onChangeRadio} value={this.state.radioValue}>
            <Radio style={radioStyle} value={1}>
              电子地图
            </Radio>
            <Radio style={radioStyle} value={2}>
              卫星图
            </Radio>
            <Radio style={radioStyle} value={3}>
              卫星和路网
            </Radio>
            <Radio style={radioStyle} value={4}>
              实时路况
            </Radio>
          </Radio.Group>
        </Card>
        <div id="container" style={{ width: '100%', height: '100%', paddingTop: '100px', position: 'absolute', left: 0 }} ref={(mapDiv) => { this.mapDiv = mapDiv }}></div>
      </div>
    )
  }
}

export default LocationProfile