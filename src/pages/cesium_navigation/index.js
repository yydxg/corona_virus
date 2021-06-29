/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card, Radio, Steps, message,
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'

const { Step } = Steps;
const { Option, OptGroup } = Select;

const steps = [
  {
    title: '点选起点',
  },
  {
    title: '点选终点',
  }
];


const startImg = require('./img/start.png')
const endImg = require('./img/symbol1.png')
const linkPulseImg = require('./img/LinkPulse.png')

class Cesium_navigation extends Component {

  constructor(props) {
    super(props)
    this.state = {
      obj: null,
      viewer: null,

      ModalText: 'Content of the modal',
      chartVisible: false,
      sourceVisible: false,
      confirmLoading: false,
      baseMap: 1,//1,高清影像，2高清街道
      baseMapLayer: null,
      imageryLayer_gd: null,
      current: 0,//步骤
      startNav: false,//开启导航
      navDataSource: new Cesium.CustomDataSource("nav"),
      dataRouteSource: new Cesium.CustomDataSource("dataRoute"),
      startPoint: null,
      endPoint: null,
      closeNav: false,
    }
  }

  componentDidMount() {
    this.start()
  }

  start = () => {
    this.initMap({
    }).then(() => {
      return this.addYX('http://127.0.0.1:8084/arcgis/satellite/{z}/{x}/{y}.jpg')
    })
    .then(() => {
      return this.add3Dtiles()
    })
    .then(() => {
      this.bindClick()
      this.addFeature()
    })
  }

  initMap = () => {
    const { navDataSource } = this.state
    return new Promise(resolve => {
      mars3d.createMap({
        id: 'cesiumContainer',
        data: {
          homeButton: true,
          center: { "x": 108.38350, "y": 23.24760, "z": 1000, "heading": 0, "pitch": -90, "roll": 0 },
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

          viewer.dataSources.remove(navDataSource, true)
          navDataSource.entities.removeAll()
          viewer.dataSources.add(navDataSource);

          this.setState({
            viewer
          })
          resolve()
        },
      });
    })
  };

  bindClick = () => {
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(movement => {
      const { startNav } = this.state
      let pick = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
      console.log(2222)
      if (startNav && Cesium.defined(pick)) {
        this.addNavPoint(pick)
        console.log(pick)
      }

      this.setState({
      })
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  addNavPoint = (point) => {
    const { current, navDataSource, startPoint, endPoint } = this.state
    if (current === 0) {
      console.log('起点')
      navDataSource.entities.remove(startPoint);
      let start = navDataSource.entities.add({
        name: "起点",
        position: point,
        billboard: {
          image: startImg,
          scale: 1,
          pixelOffset: new Cesium.Cartesian2(0, 0), //偏移量 
        }
      });
      this.setState({
        startPoint: start,
      })
    } else if (current === 1) {
      console.log('终点')
      navDataSource.entities.remove(endPoint);

      let end = navDataSource.entities.add({
        name: "绿色自定义图标",
        position: point,
        billboard: {
          image: endImg,
          scale: 1,
          pixelOffset: new Cesium.Cartesian2(0, -6), //偏移量 
        }
      })
      //测试 颜色闪烁
      mars3d.util.highlightEntity(end, {
        time: 30,  //闪烁时长（秒）
        maxAlpha: 0.9,
        color: Cesium.Color.WHITE,
        onEnd: function () {//结束后回调
        }
      });
      this.setState({
        endPoint: end,
      })
    }
  }

  loadGeoServer = (url, layers) => {
    const { viewer } = this.state
    viewer && viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
      url: url,
      layers: layers,
    }))
  }

  zoomIn = () => {
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

  zoomOut = () => {
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
    switch (type) {
      case 'chart':
        this.setState({
          chartVisible: true,
          sourceVisible: false,
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

  hideModal = () => {
    this.setState({
      chartVisible: false,
      sourceVisible: false,
    })
  }

  onChangeBaseMap = e => {
    console.log('radio checked', e.target.value);
    if (e.target.value === 1) {
      this.addYX('http://127.0.0.1:8084/arcgis/satellite/{z}/{x}/{y}.jpg')
    } else if (e.target.value === 2) {
      this.addYX('http://127.0.0.1:8084/bingmaps/roadmap/{z}/{x}/{y}.png')
    }

    this.setState({
      baseMap: e.target.value,
    });
  };

  addYX = (url) => {
    const { baseMapLayer } = this.state
    return new Promise((resolve, reject) => {
      baseMapLayer && viewer.imageryLayers.remove(baseMapLayer)
      var layer = viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: url
      }))
      this.flyToPoint(Cesium.Cartesian3.fromDegrees(108.2, 23.18, 0), 0, -45, 5000, 3)
      this.setState({
        baseMapLayer: layer
      })
      resolve()
    })
  }

  add3Dtiles = () => {
    return new Promise((reslove, reject) => {
      var tileset = new Cesium.Cesium3DTileset({
        url: 'http://127.0.0.1:8085/xiaoyuan/tileset.json'
      })

      viewer && tileset.readyPromise.then((tileset) => {
        var boundingSphere = tileset.boundingSphere;
        var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
        var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
        var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, -80);
        var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

        viewer.scene.primitives.add(tileset);

        // viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
        viewer.flyTo(tileset, {
          offset: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90.0),//从上往下看为-90
            roll: 0
          }
        })

      }).otherwise(function (error) {
        console.log(error);
        reject()
      });

      reslove()
    })
  }

  addFeature = () =>{
      let arr = [
        {
          "id":1,
          "lng":113,
          "lat":33,
          "name":"教学楼1",
          "info":"xxxxx,xxxxxx,"
        },
        {
          "id":2,
          "lng":108.2779,
          "lat":23.181537,
          "name":"教学楼2",
          "info":"xxxxx,xxxx222xx,xxxxx,xxxx222xx,xxxxx,xxxx222xx,xxxxx,xxxx222xx,xxxxx,xxxx222xx,"
        }
      ]
      let dataSource = new Cesium.CustomDataSource();
      console.log(arr.length);
      for (var i = 0, len = arr.length; i < len; i++) {
          var item = arr[i];

          var inthtml =
              '<table style="width: auto; background-color:rgb(227 233 242 / 90%)"><tr>' +
              '<th scope="col" colspan="4"  style="text-align:center;font-size:15px;">' +
              item.name +
              "</th></tr><tr>" +
              "<td >名称：</td><td >" + item.name + "</td></tr><tr>" +
              "<td >简介：</td><td >" + item.info + "</td></tr><tr>" +
              '<td colspan="4" style="text-align:right;"></td></tr></table>';

          //添加实体
          var entitie = dataSource.entities.add({
              id: item.id,
              name: item.text,
              position: Cesium.Cartesian3.fromDegrees(+item.lng, +item.lat, item.z || 0),
              billboard: {
                  image: './img/marker-red.png',
                  scale: 0.7,  //原始大小的缩放比例
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                  scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.2),
                  // disableDepthTestDistance: Number.POSITIVE_INFINITY, //一直显示，不被地形等遮挡 
              },
              label: {
                  text: item.name,
                  font: "normal small-caps normal 19px 楷体",
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  fillColor: Cesium.Color.AZURE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 2,
                  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  pixelOffset: new Cesium.Cartesian2(10, 30), //偏移量
                  // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                  distanceDisplayCondition: new Cesium.DistanceDisplayCondition(100, 80000)
              },
              data: item,
              popup: {
                  html: inthtml,
                  anchor: [0, -10],
              },
              click: function (entity) {//单击
                  if (viewer.camera.positionCartographic.height > 90000) {
                      viewer.mars.popup.close();//关闭popup

                      var position = entity.position._value;
                      viewer.mars.centerPoint(position, {
                          radius: 5000,   //距离目标点的距离
                          pitch: -50,     //相机方向
                          duration: 4,
                          complete: function (e) {//飞行完成回调方法
                              viewer.mars.popup.show(entity);//显示popup

                          }
                      });

                  }
              }
          });
      }
      viewer.flyTo(dataSource.entities, { duration: 3 });
      viewer.dataSources.add(dataSource);
  }


  /**
         * @description: 飞行定位到一个笛卡尔空间直角坐标点位置
         * @param {Cartesian3} destination 目标点 Cartesian3
         * @param {Number} heading  默认=0.0   偏航角 正北,由正北向东偏向为正
         * @param {*} pitch  =-90     俯仰角 垂直向下， ENU局部坐标系中XY平面的旋转角度，平面下为负，上为正，
         * @param {*} range    =0.0   距目标点距离
         * @param {*} duration =3   持续时间
         * @param {*} callBack =null   回调函数，定位完成后执行
         */
  flyToPoint = (destination, heading, pitch, range, duration, callBack) => {
    var boundingSphere = new Cesium.BoundingSphere(destination, 0.0);
    viewer.camera.flyToBoundingSphere(boundingSphere, {
      duration: duration || 3,
      maximumHeight: undefined,
      complete: function () {
        if (callBack) {
          callBack();
        } else {
          console.log('定位失败！');
        }
      },
      cancel: function () {
        console.log('定位取消！');
      },
      offset: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch),
        range: range
      },
    });
  }

  next = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  prev = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  closeNav = () => {
    const { navDataSource, dataRouteSource, closeNav, imageryLayer_gd } = this.state
    navDataSource.entities.removeAll()
    dataRouteSource.entities.removeAll()
    viewer.imageryLayers.remove(imageryLayer_gd)
    this.setState({
      closeNav: false
    })
  }

  doNav = () => {
    const { startPoint, endPoint, dataRouteSource, navDataSource, current } = this.state
    if (current === 0) return;
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var sourceLat = Cesium.Math.toDegrees(ellipsoid.cartesianToCartographic(startPoint.position.getValue()).latitude);
    var sourceLng = Cesium.Math.toDegrees(ellipsoid.cartesianToCartographic(startPoint.position.getValue()).longitude);
    console.log(startPoint, endPoint, sourceLat)
    var destinationLat = Cesium.Math.toDegrees(ellipsoid.cartesianToCartographic(endPoint.position.getValue()).latitude);
    var destinationLng = Cesium.Math.toDegrees(ellipsoid.cartesianToCartographic(endPoint.position.getValue()).longitude);

    let routeUrl = `http://restapi.amap.com/v3/direction/walking?key=93491b0fb44d1770a55eb86d219a8ffb&origin=${sourceLng},${sourceLat}&destination=${destinationLng},${destinationLat}&originid=&destinationid=&extensions=base&strategy=0&waypoints=116.357483,39.907234&avoidpolygons=&avoidroad=`
    fetch(routeUrl, {
      method: 'GET',
      /*headers: {
          'Content-Type': 'application/json;charset=UTF-8'
      },*/
      mode: 'cors',
      cache: 'default'
    }).then(res => res.json()).then((result) => {
      console.log(result)
      const { info, route, } = result
      let steps = route.paths[0].steps
      var layer = viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
      }))
      this.setState({
        imageryLayer_gd: layer
      })
      viewer.dataSources.remove(dataRouteSource, true)
      dataRouteSource.entities.removeAll()
      viewer.dataSources.add(dataRouteSource);

      steps.map((item, index) => {
        var arrs = []
        item.polyline.split(";").map((item1) => {
          arrs.push(parseFloat(item1.split(",")[0]), parseFloat(item1.split(",")[1]), 0)
        })
        dataRouteSource.entities.add({
          name: '流动线特效 地面',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(arrs),
            width: 10,
            material: new mars3d.AnimationLineMaterialProperty({//动画线材质
              color: new Cesium.Color.fromCssColorString("#00ff00"),
              duration: 5000, //时长，控制速度
              url: linkPulseImg
            }),
          }
        });
      })
      viewer.flyTo(dataRouteSource)
      message.success('步行导航完毕!')
      this.setState({
        closeNav: true,
      })
    })
  }

  render() {
    const { viewer, chartVisible, sourceVisible, baseMap, current, startNav, closeNav } = this.state
    return (
      <div style={{ width: '100%', height: 'calc(100% - 80px)', left: 0, top: 80, bottom: 0, right: 0, position: 'absolute' }} >
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

        <Card className={styles.baseMap}>
          <Row className={styles.row}>
            <Col span={6}>图层：</Col>
            <Col span={18}>
              <Radio.Group onChange={this.onChangeBaseMap} value={baseMap}>
                <Radio value={1}>高清影像</Radio>
                <Radio value={2}>高清街道</Radio>
              </Radio.Group>
            </Col>
          </Row>
          <Row className={styles.row}>
            <Col span={6}>导航：</Col>
            <Col span={18}>
              <Steps size="small" current={current}>
                {steps.map(item => (
                  <Step key={item.title} title={item.title} />
                ))}
              </Steps>
            </Col>
            <Col offset={6} span={18} style={{ marginTop: 10 }}>
              {current < steps.length - 1 && (
                startNav ? <Button type="primary" onClick={() => this.next()}>下一步</Button> : <Button type="primary" onClick={() => this.setState({ startNav: true })}>开启导航</Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" onClick={this.doNav}>
                  确定导航
                </Button>
              )}
              {current > 0 && (
                <Button style={{ marginLeft: 8 }} onClick={() => this.prev()}>
                  上一步
                </Button>
              )}
              {
                closeNav && (
                  <Button style={{ marginLeft: 8 }} onClick={() => this.closeNav()}>
                    关闭
                  </Button>
                )
              }
            </Col>
          </Row>
        </Card>

      </div >
    )
  }
}

export default Cesium_navigation
