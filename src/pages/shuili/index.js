/* global mars3d Cesium*/
/* 导入antdesign包 */
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card, Drawer, Input } from 'antd'
import styles from './style.less'
import Shuili_search from './search'
import { connect } from 'dva';
import { request } from '../../utils/request';

const { Option, OptGroup } = Select;

/** 引入geojson文件，加载矢量数据 */
const URL = {
  // districtMultPolyline: `${prefix}shenda_local/vector/sz_distinct_part_line2.geojson?t=0715`
  districtMultPolyline: require('./file/districtLine.geojson'),
  yichan: require('./file/yichan.geojson'),
}

@connect(({ Shuili, F_Login }) => ({
  Shuili, F_Login
}))
class Shuili extends Component {

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
    return new Promise(resolve => {
      var viewer = mars3d.createMap({
        id: 'cesiumDiv',
        data: {
          homeButton: true,
          center: { "x": 110.597, "y": 29.808, "z": 7852845, "heading": 352, "pitch": -86, "roll": 0 },
          location: {
            format: "<div>经度:{x}</div> <div>纬度:{y}</div> <div>海拔：{z}米</div> <div>方向：{heading}度</div> <div>视高：{height}米</div>"
          },
          navigation: {
            compass: { top: "10px", right: "5px" }
          },
          basemaps: [
            {
              "name": "底图",
              "type": "tile",
              "url": "http://mt1.google.cn/vt/lyrs=s&x={x}&y={y}&z={z}",
              "visible": true
            }
          ]
        },
      });
      window.viewer = viewer;
      this.setState({
        viewer
      })
      resolve()

      // mars3d.createMap({
      //   id: 'cesiumDiv',
      //   url: '/config/marsConfig.json',
      //   success: (viewer) => {
      //     // viewer.camera.setView()

      //   },
      // });
    })
  };
  initMap2 = () => {
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
  };

  addYichan = () => {
    return new Promise((resolve, reject) => {
      let promise_point = Cesium.GeoJsonDataSource.load(URL.yichan);
      promise_point.then(data => {
        let entities = data.entities.values;
        entities.map(entity => {
          let color = null;
          if (entity.properties.category._value === 'Cultural') {
            color = Cesium.Color.fromCssColorString('#9FF6DB')
          } else if (entity.properties.category._value === 'Mixed') {
            color = Cesium.Color.fromCssColorString('#6A39CA')
          } else if (entity.properties.category._value === 'Natural') {
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
          打开操作面板
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
          <Shuili_search locateLayer={this.locateLayer} hideLayer={this.hideLayer} />

        </Drawer>

      </div>
    )
  }

}

export default Shuili
