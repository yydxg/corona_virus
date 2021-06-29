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
    !viewer && mars3d.createMap({
      id: 'cesiumDiv',
      data: {
        homeButton: true,
        center: { "x": 101.197, "y": 38.338, "z": 985284, "heading": 0, "pitch": -86, "roll": 0 },
        location: {
          format: "<div>经度:{x}</div> <div>纬度:{y}</div> <div>海拔：{z}米</div> <div>方向：{heading}度</div> <div>视高：{height}米</div>"
        },
        navigation: {
          compass: { top: "10px", right: "5px" }
        },
        basemaps: [
          {
            "pid": 10,
            "name": "天地图卫星",
            "type": "www_tdt",
            "layer": "img_d",
            "key": [
              "313cd4b28ed520472e8b43de00b2de56",
              "83b36ded6b43b9bc81fbf617c40b83b5",
              "0ebd57f93a114d146a954da4ecae1e67",
              "6c99c7793f41fccc4bd595b03711913e",
              "56b81006f361f6406d0e940d2f89a39c"
            ],
            "visible": true
          }
        ]
      },
      success: (viewer) => {
        // viewer.camera.setView()
        window.viewer = viewer;
        this.setState({
          viewer,
        })

        this.addYX().then(()=>{
          return this.addGansuDistrict()
        }).then(() => {
          return this.addZhuji()
        })

      },
    });
  };

  addYX = ()=>{
    return new Promise((resolve,reject)=>{
      // viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
      //   url:'http://127.0.0.1:8084/arcgis1/satellite/{z}/{x}/{y}.jpg'
      // }))
      resolve()
    })
  }
  addGansuDistrict = () => {
    return new Promise((resolve, reject) => {
      let promise_line = Cesium.GeoJsonDataSource.load(URL.districtMultPolyline);
      promise_line.then(data => {
        viewer.dataSources.add(data);
        let entities = data.entities.values;
        entities.map(entity => {
          entity.polyline.width = 3;
          entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: .6,
            color: Cesium.Color.fromCssColorString('#1694E7').withAlpha(.9)
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

  load3DFeatures = async arr2 => {
    let arr = Array.from(arr2);
    console.log(arr)
    var result = {};
    for (let i = 0; i < arr.length; i++) {
      let count = 1;
      Object.keys(result).forEach(key=>{
        // console.log(result[key])
        let obj = result[key];
        // console.log(obj.binming, arr[i])
        if (obj && (obj.shi === arr[i].shi) && (obj.binming === arr[i].binming)) {
          let total = obj.fabinshu+arr[i].fabinshu
          console.log(obj.fabinshu,arr[i].fabinshu,total)
          result[key].fabinshu = total;
          count = 0;
        }
      })
      if(count) {
        result[arr[i].id] = arr[i] 
      };
    }
    console.log(result)
    var keyvalue = [];
    for (var key in result) {
      keyvalue.push(result[key])
    }
    console.log(keyvalue)

    viewer.entities.removeAll();
    for (var i = 0, len = keyvalue.length; i < len; i++) {
      let item = keyvalue[i];
      var jd = Number(positionDistrict[item.shi][0]), wd = Number(positionDistrict[item.shi][1]);
      if (isNaN(jd) || isNaN(wd)) continue;

      var clr = item.binming==='传染性胃肠炎'?"#9FF6DB":(item.binming==='猪流行性腹泻'?"#6A39CA":"#F5A623");
      var valparam = Number(item.fabinshu) * 10000; //柱高度

      var html = "日期：" + item["year"]+"-"+ item["month"]+ "<br />地区："
        + item["shi"]+","+item["xian"] + "<br />易感动物数：" + item["yigandongwushu"] + "<br />发病数："
        + item["fabinshu"] + "<br />病名：" + item["binming"]
        + "<br />疫点类别：" + item["yidianleibie"];

      var position = Cesium.Cartesian3.fromDegrees(jd, wd);

      //添加柱子
      var radius = 10000;
      viewer.entities.add({
        position: position,
        ellipse: {
          semiMinorAxis: radius,
          semiMajorAxis: radius,
          height: 0.0,
          extrudedHeight: valparam,
          material: new Cesium.Color.fromCssColorString(clr).withAlpha(0.8),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10000)
        },
        tooltip: html,
      });
    }

    viewer.mars.centerAt({ "x": 101.197, "y": 25.338, "z": 1000000, "heading": 0, "pitch": -45, "roll": 0 })
  }

  //渲染页面html模块
  render() {
    const { drawVisible } = this.state
    return (
      <div style={{ width: '100%', height: 'calc(100% - 80px)', left: 0, top: 80, bottom: 0, right: 0, position: 'absolute'}}>
        <div className={styles.map} id="cesiumDiv">
          <div className={styles.toolbar}>

          </div>
        </div>

        <ul className={styles.school}>
          <li>
            <div className={`${styles.circle} ${styles.primaryPeople}`} />
          </li>
          <li>猪流行性腹泻</li>
          <li>
            <div className={`${styles.circle} ${styles.middle}`} />
          </li>
          <li>传染性胃肠炎</li>
          <li>
            <div className={`${styles.circle} ${styles.middlePeople}`} />
          </li>
          <li>布鲁氏菌病</li>
        </ul>

        <div style={{ position: 'fixed', bottom: 0 }}><Button icon='double-right' type="primary" onClick={this.showDrawer}>
          打开查询
        </Button></div>
        <Drawer
          width={800}
          title="猪病查询"
          placement={'left'}
          closable={true}
          maskClosable={false}
          mask={false}
          onClose={this.onClose}
          visible={drawVisible}
          style={{ height: '672px', top: '80px' }}
        >
          {/* <Row>
              <Col span={24}><Input.Search addonBefore="坐标：" defaultValue={'121,31'} onSearch={value => this.searchLonlat(value)} /></Col>
          </Row> */}
          <Cesium_pig_search locateLayer={this.locateLayer} hideLayer={this.hideLayer} load3DFeatures={this.load3DFeatures} />

        </Drawer>

      </div>
    )
  }

}

export default PigDisease
