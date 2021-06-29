import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'umi';
import styles from './style.less';
import { Modal,Button } from 'antd';
import { connect } from 'dva';
import { ModalDrag } from '@/utils/ModalDrag.js';
import { _addHangPian } from '../layer';

@connect(({ Login,HUIBAO }) => ({
  Login,HUIBAO
}))
class MainCesium extends Component{

  componentDidMount() {
    this.start()
  }

  start = ()=>{
    this.initMap({
    }).then(()=>{
      return _addHangPian()
    })
  }

  initMap = () => {
    return new Promise(resolve => {
      mars3d.createMap({
        id: 'cesiumContainer',
        url: '/config/marsConfig.json',
        success: (viewer) => {
          // viewer.camera.setView()
          window.viewer = viewer;
          var drawHelper = new DrawHelper(viewer);
          this.props.dispatch({
            type:'HUIBAO/setCommon',
            payload:{
              viewer,
              drawHelper
            }
          })
          /* new MeasureTool({
            viewer: viewer,
            target: 'measure'
          }) */
          resolve()
        },
      });
    })
  };

  zoomIn = ()=>{
    const { viewer } = this.props.HUIBAO;
    let cameraPos = viewer.camera.position;
    let ellipsoid = viewer.scene.globe.ellipsoid;
    let cartographic = ellipsoid.cartesianToCartographic(cameraPos);
    let height = cartographic.height;
    let centerLon = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(8));
    let centerLat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(8));
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, height / 1.5),
      duration: 1.0
    });
  }

  zoomOut = ()=>{
    const { viewer } = this.props.HUIBAO; // 获取当前镜头位置的笛卡尔坐标
    let cameraPos = viewer.camera.position; // 获取当前坐标系标准
    let ellipsoid = viewer.scene.globe.ellipsoid; // 根据坐标系标准，将笛卡尔坐标转换为地理坐标
    let cartographic = ellipsoid.cartesianToCartographic(cameraPos);  // 获取镜头的高度
    let height = cartographic.height;
    // 根据上面当前镜头的位置，获取该中心位置的经纬度坐标
    let centerLon = parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(8));
    let centerLat = parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(8));
    // 镜头拉远
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, height * 1.5),
      duration: 1.0,
    });
  }

  render() {

    return (
      <>
        <div className={styles.cesiumContainer} id="cesiumContainer">
            <div className={styles.toolbar}>
              <div className={styles.bar} onClick={this.zoomIn}>
                <span className="icon iconfont icon-zoomin"></span>
              </div>
              <div className={styles.bar} onClick={this.zoomOut}>
                <span className="icon iconfont icon-zoomout"></span>
              </div>
            </div>
          </div>
      </>
    )
  }
}

export default MainCesium