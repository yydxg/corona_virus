/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button,Row, Col,Tooltip,Modal,Select  } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Wrap from './wrap'

const { Option, OptGroup } = Select;

class Visualization extends Component{

  constructor(props) {
    super(props)
    this.state = {
      obj:null,
      viewer:null,

      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible:false,
      confirmLoading: false,
    }
  }

  componentDidMount() {
    this.start()
  }

  start = ()=>{
    this.initMap({
    }).then(()=>{
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
          this.setState({
            viewer
          })
          resolve()
        },
      });
    })
  };

  initCamera = (viewer)=>{
    const { obj } = this.state
    viewer.flyTo(obj,{
      offset: {
        heading : Cesium.Math.toRadians(0),
        pitch : Cesium.Math.toRadians(-90.0),//从上往下看为-90
        roll : 0
      }
    })
  }

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

  zoomIn = ()=>{
    const { viewer } = this.state
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
    const { viewer } = this.state // 获取当前镜头位置的笛卡尔坐标
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
    const {viewer,chartVisible,sourceVisible, confirmLoading, ModalText} = this.state
    return(
        <div style={{width:'100%', padding:'100px 0 10px'}}>
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
          {viewer && <Wrap parent={this} viewer={viewer} visible = {sourceVisible}/>}
        </div>
    )
  }
}

export default Visualization
