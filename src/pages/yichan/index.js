/* global mars3d Cesium*/
/* 导入antdesign包 */
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card, Drawer, Input } from 'antd'
import styles from './style.less'
import Cesium_pig_search from './search'
import { connect } from 'dva';
import { request } from '../../utils/request';

const { Option, OptGroup } = Select;

/** 引入geojson文件，加载矢量数据 */
const URL = {
  // districtMultPolyline: `${prefix}shenda_local/vector/sz_distinct_part_line2.geojson?t=0715`
  districtMultPolyline: require('./file/districtLine.geojson'),
  yichan: require('./file/yichan.geojson'),
}
const positionDistrict = {
  "白银市": [104.622105864371633, 36.612483308614621],
  "定西市": [104.451531964912874, 35.120553398839021],
  "甘南州": [102.744876565997643, 34.334699616645537],
  "嘉峪关市": [98.195989924259976, 39.816527903507982],
  "金昌市": [102.050723572088543, 38.427317288668256],
  "酒泉市": [96.243789572388025, 40.459792113278098],
  "兰州市": [103.63379042466822, 36.358181743208938],
  "临夏州": [103.277183221356921, 35.629944298183354],
  "陇南市": [105.210210477569987, 33.595114425138135],
  "平凉市": [106.65109840933745, 35.306545846436201],
  "庆阳市": [107.591449804518092, 36.166047836183814],
  "天水市": [105.739951767586717, 34.65014894748343],
  "武威市": [103.053820006792563, 38.175358171157285],
  "张掖市": [99.894447807479693, 38.919733875921764]
}


@connect(({ PigDisease, F_Login }) => ({
  PigDisease, F_Login
}))
class PigDisease extends Component {

  constructor(props) {
    super(props)
    this.state = {
      viewer: null,

      drawVisible: false,
    }
  }

  /**
   * react生命周期结束后立即执行代码区块
   * 类似于document.onload=这种
   */
  componentDidMount() {
    this.initMap()
    const login = this.props.F_Login;
    // if (login && login.username !== '') {

    // } else {
    //   this.props.history.push('/fish/user/login')
    // }
  }

  initMap = () => {
    const { viewer } = this.state

    //获取自定义底图切换
    function getImageryProviderArr() {
      var providerViewModels = [];
      var imgModel;
      imgModel = new Cesium.ProviderViewModel({
        name: '高德影像',
        tooltip: '高德影像地图服务',
        iconUrl: "img/basemaps/gaode_img.png",
        creationFunction: function () {
          return [
            mars3d.layer.createImageryProvider({ type: "www_gaode", layer: "img_d" }),
            mars3d.layer.createImageryProvider({ type: "www_gaode", layer: "img_z" })
          ];
        }
      });
      providerViewModels.push(imgModel);
      imgModel = new Cesium.ProviderViewModel({
        name: '高德电子',
        tooltip: '高德电子地图服务',
        iconUrl: "img/basemaps/gaode_vec.png",
        creationFunction: function () {
          return mars3d.layer.createImageryProvider({ type: "www_gaode", layer: "vec" });
        }
      });
      providerViewModels.push(imgModel);
      return providerViewModels;
    }
    let viewer2 = new Cesium.Viewer("cesiumDiv", {
      animation: false,       //是否创建动画小器件，左下角仪表
      timeline: false,        //是否显示时间线控件
      fullscreenButton: false, //右下角全屏按钮
      vrButton: false,         //右下角vr虚拟现实按钮

      geocoder: false,         //是否显示地名查找控件
      sceneModePicker: false,  //是否显示投影方式控件
      homeButton: false,        //回到默认视域按钮
      navigationHelpButton: false,    //是否显示帮助信息控件

      baseLayerPicker: true,  //是否显示图层选择控件
      imageryProviderViewModels: getImageryProviderArr(),     //地图底图
      // terrainProviderViewModels: getTerrainProviderViewModelsArr()
    });

    window.viewer = viewer2;
    this.setState({
      viewer: viewer2,
    })

    this.addYichan().then(() => {
      return this.addZhuji()
    })
  };

  addYichan = () => {
    return new Promise((resolve, reject) => {
      let promise_point = Cesium.GeoJsonDataSource.load(URL.yichan);
      promise_point.then(data => {
        let entities = data.entities.values;
        entities.map(entity => {
          let color = null;
          if(entity.properties.category._value === 'Cultural'){
            color = Cesium.Color.fromCssColorString('#9FF6DB')
          }else if(entity.properties.category._value === 'Mixed'){
            color = Cesium.Color.fromCssColorString('#6A39CA')
          }else if(entity.properties.category._value === 'Natural'){
            color = Cesium.Color.fromCssColorString('#F5A623')
          }
          viewer.entities.add({
            name: entity.name,
            position: entity.position,
            point: {
                color,
                pixelSize: 12,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
          })
        })
        resolve()
      })
    })
  }

  addZhuji = () => {
    return new Promise((resolve, reject) => {
      let dataSource = new Cesium.CustomDataSource('district_zhuji')
      viewer.dataSources.add(dataSource)
      //加注记
      Object.keys(positionDistrict).forEach(item => {
        const label = dataSource.entities.add({
          position: Cesium.Cartesian3.fromDegrees(...positionDistrict[item], 100),
          label: {
            id: item,
            text: item,
            font: '24px PingFangSC-Medium',
            fillColor: Cesium.Color.WHITE,
            translucencyByDistance: new Cesium.NearFarScalar(1.5e5, 1.0, 1.5e6, 0.8),
            scaleByDistance: new Cesium.NearFarScalar(1.5e5, 2.0, 1.5e6, 0.5),
            outlineWidth: 2,
            backgroundPadding: new Cesium.Cartesian2(12, 8),
            backgroundColor: Cesium.Color.fromCssColorString('#1694E7').withAlpha(.1),
            pixelOffset: new Cesium.Cartesian2(-30, -30),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER
          }
        })
      })
      resolve()
    })
  }

  showDrawer = () => {
    this.setState({
      drawVisible: !this.state.drawVisible,
    });
  };
  onClose = () => {
    this.setState({
      drawVisible: false,
    });
  };

  //渲染页面html模块
  render() {
    const { drawVisible } = this.state
    return (
      <div style={{ width: '100%', height: 'calc(100% - 80px)', left: 0, top: 80, bottom: 0, right: 0, position: 'absolute' }}>
        <div className={styles.map} id="cesiumDiv">
          <div className={styles.toolbar}>

          </div>
        </div>

        <ul className={styles.school}>
          <li>
            <div className={`${styles.circle} ${styles.primaryPeople}`} />
          </li>
          <li>Cultural</li>
          <li>
            <div className={`${styles.circle} ${styles.middle}`} />
          </li>
          <li>Mixed</li>
          <li>
            <div className={`${styles.circle} ${styles.middlePeople}`} />
          </li>
          <li>Natural</li>
        </ul>

        <div style={{ position: 'fixed', bottom: 0 }}><Button icon='double-right' type="primary" onClick={this.showDrawer}>
          打开查询
        </Button></div>
        <Drawer
          width={800}
          placement={'left'}
          closable={true}
          maskClosable={false}
          mask={false}
          onClose={this.onClose}
          visible={drawVisible}
          style={{ height: '672px', top: '80px' }}
        >
          <Cesium_pig_search locateLayer={this.locateLayer} hideLayer={this.hideLayer}  />

        </Drawer>

      </div>
    )
  }

}

export default PigDisease
