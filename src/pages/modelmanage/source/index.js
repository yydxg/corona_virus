/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';
import { draw, addPie, clearDraw } from '../pie/fun'

const { Option, OptGroup } = Select;
const liuxiangpng = require('../img/ArrowOpacity.png')
const arrowImg = require('../img/arrow.png')
const hospitalImg = require('../img/hospital.png')
const linkPulseImg = require('../img/LinkPulse.png')

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
      pickId: '',
      dataJiantouSource: null,
      dataPeopleSource: null,
      datakuosanSource: null,
      dataTravelSource: null,
      dataHospitalSource: null,
      dataRouteSource: null,
      imageryLayer_gd: null,
      arrPoint: [],
    }
  }

  componentDidMount() {
    this.bindClick();
    this.setState({
      dataJiantouSource: new Cesium.CustomDataSource("jiantou"),
      dataPeopleSource: new Cesium.CustomDataSource("people"),
      datakuosanSource: new Cesium.CustomDataSource("kuosan"),
      dataTravelSource: new Cesium.CustomDataSource("travel"),
      dataHospitalSource: new Cesium.CustomDataSource("hospital"),
      dataRouteSource: new Cesium.CustomDataSource("route"),
      urlTemplateService: new Cesium.UrlTemplateImageryProvider({
        url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
        //            layer: "tdtAnnoLayer",
        //            style: "default",
        //            format: "image/jpeg",
        //            tileMatrixSetID: "GoogleMapsCompatible"
      })
    })
    // this.handleOk();
  }

  componentWillUnmount() {
    viewer.imageryLayers.remove(this.state.imageryLayer_gd);
  }

  removeImagery = () => {
    const { imageryLayer_gd } = this.state
    viewer.imageryLayers.remove(imageryLayer_gd);
  }

  bindClick = () => {
    const { viewer } = this.props
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(movement => {
      const { prePick } = this.state
      var pick = viewer.scene.pick(movement.position);
      prePick !== null ? prePick.id.point.color = new Cesium.Color.fromCssColorString("#3388ff") : '';
      if (Cesium.defined(pick) && pick.id.id && pick.id.flag === "people") {
        pick.id.point.color = new Cesium.Color.fromCssColorString("#FFFF00");
        console.log(pick)
        this.setState({
          prePick: pick,
          pickId: pick.id.id
        })
      } else {
        this.setState({
          pickId: ''
        })
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  handleOk = () => {
    const { dispatch, viewer } = this.props
    const { input_value, records, shengData, dataPeopleSource } = this.state;
    clearDraw()

    dispatch({
      type: 'Visualization/getPerson',
      payload: {
        currentCity: input_value || '武汉',
      },
    }).then(result => {
      console.log(result)
      const { success, data } = result

      if (success) {
        viewer.dataSources.remove(dataPeopleSource, true)
        dataPeopleSource.entities.removeAll()
        // viewer.dataSources.add(dataPeopleSource);
        data.map((item, i) => {
          let health = '';
          if (item.healthState === "SICK") {
            health = '确诊'
          } else if (item.healthState === "YES") {
            health = '健康'
          } else if (item.healthState === "CASE") {
            health = '疑似'
          }
          var inthtml = `<table style="width: 200px;"><tr>'
                  <th scope="col" colspan="4"  style="text-align:center;font-size:15px;">${item.name}</th></tr><tr>'
                  <td >性别：</td><td >${item.sex}</td></tr><tr>
                  <td >年龄：</td><td >${item.age}岁</td></tr><tr>
                  <td >所在城市：</td><td >${item.currentCity}</td></tr><tr>
                  <td >健康状况：</td><td >${health}</td></tr><tr>
                  <td >经纬度：</td><td >${item.lon},${item.lat}</td></tr><tr>
                  <td colspan="4" style="text-align:right;"></td></tr></table>`;

          //添加实体
          dataPeopleSource.entities.add({
            flag: 'people',
            name: item.name,
            id: item.id,
            position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat),
            point: {
              color: item.healthState === "SICK" ? new Cesium.Color.fromCssColorString("#FF6103") : new Cesium.Color.fromCssColorString("#3388ff"),
              pixelSize: 10,
              outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
              outlineWidth: 2,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
              text: item.name,
              font: 'normal small-caps normal 17px 楷体',
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              fillColor: Cesium.Color.AZURE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -20),   //偏移量  
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000000)
            },
            data: item,
            popup: {
              html: inthtml,
              anchor: [0, -25],
            }
          });
        });
        viewer.flyTo(dataPeopleSource.entities, { duration: 3 });

        viewer.dataSources.add(dataPeopleSource);
      }
      this.setState({
        showToolBar: true
      })
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


  _loadGeoJson = (dataJson) => {
    var dataPromise = Cesium.GeoJsonDataSource.load(dataJson, {
      clampToGround: true
    })
    dataPromise.then(function (dataSource) {
      viewer.dataSources.add(dataSource);
      var entities = dataSource.entities.values;
      var colorHash = {};
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        var name = entity.name;  //geojson里面必须得有一个name属性，entity.name对应
        var color = colorHash[name]; //可以使两个同名要素使用同一种颜色。。。
        if (!color) {
          color = Cesium.Color.fromRandom({
            alpha: 1.0
          });
          colorHash[name] = color;
        }
        entity.name = entity.properties.NAME._value;
        entity.polygon.material = color;
        entity.label = {
          text: "aaaaaaaaaaa"
        }
        entity.polygon.outline = true;
        entity.polygon.fill = false
        entity.polygon.outlineColor = color;
        entity.polygon.outlineWidth = 10;
        // entity.polygon.extrudedHeight = Math.floor(Math.random()*40000+20000) //20000~60000的随机数，单位是米
        // viewer.zoomTo(promise);

        var pointsArray = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
        //获取entity的polygon的中心点
        var centerpoint = Cesium.BoundingSphere.fromPoints(pointsArray).center;
      }
      viewer.flyTo(dataSource);
    }).otherwise(function (error) { });
  }

  handleCancel = () => {
    this.props.parent.hideModal()
  };

  handleChange = (value) => {
    this.setState({
      input_value: value
    })
  }

  addAllPie = () => {
    let id = "sss" + Math.random()
    let data = [{
      name: "a",
      value: Math.round(Math.random() * 100000)
    }, {
      name: "b",
      value: Math.round(Math.random() * 100000)
    }, {
      name: "c",
      value: Math.round(Math.random() * 100000)
    }]
    addPie({ id: id, data: data, lon: 113, lat: 25 })

    id = "sss" + Math.random()
    data = [{
      name: "a",
      value: Math.round(Math.random() * 100000)
    }, {
      name: "b",
      value: Math.round(Math.random() * 100000)
    }, {
      name: "c",
      value: Math.round(Math.random() * 100000)
    }]
    addPie({ id: id, data: data, lon: 114, lat: 26 })
    this.state.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(114, 23, 1000),
      duration: 1.0,
    });
  }

  suyuan = () => {
    const { pickId, dataJiantouSource, datakuosanSource, dataTravelSource, dataHospitalSource, dataRouteSource } = this.state

    console.log(pickId)
    if (pickId === '') {
      Modal.info({ title: '请点选人员.' })
    } else {
      viewer.dataSources.remove(dataTravelSource, true)
      dataTravelSource.entities.removeAll()
      viewer.dataSources.remove(dataHospitalSource, true)
      dataHospitalSource.entities.removeAll()
      viewer.dataSources.remove(dataRouteSource, true)
      dataRouteSource.entities.removeAll()
      this.removeImagery()
      this._clearDraw()
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
        }
        let arrs = []
        viewer.dataSources.remove(datakuosanSource, true)
        datakuosanSource.entities.removeAll()
        viewer.dataSources.add(datakuosanSource);
        //示例：箭头动态特效 地面
        viewer.dataSources.remove(dataJiantouSource, true)
        dataJiantouSource.entities.removeAll()
        viewer.dataSources.add(dataJiantouSource);
        data.reverse().map((item, index) => {
          arrs.push(item.lon, item.lat, 0)
          // this._addScanSegement({lon:item.lon,lat:item.lat,height:32,radius:10000})
          //添加动态效果点，模拟扩散效果
          if (item.healthState === "SICK") {
            datakuosanSource.entities.add({
              position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 0),
              ellipse: {
                height: 0.0,
                semiMinorAxis: 30000.0,
                semiMajorAxis: 30000.0,
                material: new mars3d.ElliposidFadeMaterialProperty({
                  color: new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 0.8)
                }),
              }
            });
          }
        })

        dataJiantouSource.entities.add({
          name: '箭头动态特效 地面',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(arrs),
            width: 10,
            material: new mars3d.AnimationLineMaterialProperty({//动画线材质
              color: Cesium.Color.CHARTREUSE,
              duration: 2000, //时长，控制速度
              url: liuxiangpng
            }),
          }
        });

        viewer.flyTo(dataJiantouSource)
      })
    }
  }

  _addScanSegement = ({ lon: lon, lat: lat, height: height, radius: radius }) => {
    const { viewer } = this.props
    let duration = 3000; //持续时间
    console.log(lon, lat, height)
    var cartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(lon), Cesium.Math.toRadians(lat), height);
    var scanColor = new Cesium.Color(1.0, 0.0, 0.0, 1);

    var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
    var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

    var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
    var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
    var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

    var _CartographicCenter2 = new Cesium.Cartographic(cartographicCenter.longitude + Cesium.Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
    var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
    var _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
    var _RotateQ = new Cesium.Quaternion();
    var _RotateM = new Cesium.Matrix3();

    var _time = (new Date()).getTime();

    var _scratchCartesian4Center = new Cesium.Cartesian4();
    var _scratchCartesian4Center1 = new Cesium.Cartesian4();
    var _scratchCartesian4Center2 = new Cesium.Cartesian4();
    var _scratchCartesian3Normal = new Cesium.Cartesian3();
    var _scratchCartesian3Normal1 = new Cesium.Cartesian3();

    var ScanPostStage = new Cesium.PostProcessStage({
      fragmentShader: this._getScanSegmentShader(),
      uniforms: {
        u_scanCenterEC: function () {
          return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
        },
        u_scanPlaneNormalEC: function () {
          var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
          var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
          _scratchCartesian3Normal.x = temp1.x - temp.x;
          _scratchCartesian3Normal.y = temp1.y - temp.y;
          _scratchCartesian3Normal.z = temp1.z - temp.z;

          Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
          return _scratchCartesian3Normal;
        },
        u_radius: radius,
        u_scanLineNormalEC: function () {
          var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
          var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
          var temp2 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);

          _scratchCartesian3Normal.x = temp1.x - temp.x;
          _scratchCartesian3Normal.y = temp1.y - temp.y;
          _scratchCartesian3Normal.z = temp1.z - temp.z;

          Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

          _scratchCartesian3Normal1.x = temp2.x - temp.x;
          _scratchCartesian3Normal1.y = temp2.y - temp.y;
          _scratchCartesian3Normal1.z = temp2.z - temp.z;

          var tempTime = (((new Date()).getTime() - _time) % duration) / duration;
          Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ);
          Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
          Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
          Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
          return _scratchCartesian3Normal1;
        },
        u_scanColor: scanColor
      }
    });
    viewer.scene.postProcessStages.add(ScanPostStage);

    return ScanPostStage;
  }


  _getScanSegmentShader = () => {
    //扩散效果Shader
    var scanSegmentShader = "\n\
              uniform sampler2D colorTexture;\n\
              uniform sampler2D depthTexture;\n\
              varying vec2 v_textureCoordinates;\n\
              uniform vec4 u_scanCenterEC;\n\
              uniform vec3 u_scanPlaneNormalEC;\n\
              uniform float u_radius;\n\
              uniform vec4 u_scanColor;\n\
              \n\
              vec4 toEye(in vec2 uv,in float depth)\n\
              {\n\
                          vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n\
                          vec4 posIncamera = czm_inverseProjection * vec4(xy,depth,1.0);\n\
                          posIncamera = posIncamera/posIncamera.w;\n\
                          return posIncamera;\n\
              }\n\
              \n\
              vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point)\n\
              {\n\
                          vec3 v01 = point - planeOrigin;\n\
                          float d = dot(planeNormal,v01);\n\
                          return (point-planeNormal * d);\n\
              }\n\
              float getDepth(in vec4 depth)\n\
              {\n\
                          float z_window = czm_unpackDepth(depth);\n\
                          z_window = czm_reverseLogDepth(z_window);\n\
                          float n_range = czm_depthRange.near;\n\
                          float f_range = czm_depthRange.far;\n\
                          return (2.0 * z_window - n_range - f_range)/(f_range-n_range);\n\
              } \n\
              void main()\n\
              {\n\
                          gl_FragColor = texture2D(colorTexture,v_textureCoordinates);\n\
                          float depth = getDepth(texture2D(depthTexture,v_textureCoordinates));\n\
                          vec4 viewPos = toEye(v_textureCoordinates,depth);\n\
                          vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz,u_scanCenterEC.xyz,viewPos.xyz);\n\
                          float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n\
                          if(dis<u_radius)\n\
                          {\n\
                              float f = 1.0-abs(u_radius - dis )/ u_radius;\n\
                              f = pow(f,4.0);\n\
                              gl_FragColor = mix(gl_FragColor,u_scanColor,f);\n\
                          }\n\
              } \n\ ";
    return scanSegmentShader;
  }

  guiji = () => {
    const { pickId, dataTravelSource, arrPoint, dataHospitalSource, dataJiantouSource, datakuosanSource, dataRouteSource } = this.state
    const { viewer } = this.props
    console.log(pickId)
    if (pickId === '') {
      Modal.info({ title: '请点选人员.' })
    } else {
      viewer.dataSources.remove(datakuosanSource, true)
      datakuosanSource.entities.removeAll()
      viewer.dataSources.remove(dataJiantouSource, true)
      dataJiantouSource.entities.removeAll()
      viewer.dataSources.remove(dataHospitalSource, true)
      dataHospitalSource.entities.removeAll()
      viewer.dataSources.remove(dataRouteSource, true)
      dataRouteSource.entities.removeAll()
      this.removeImagery()
      this._clearDraw()

      this.props.dispatch({
        type: 'Visualization/getTravel',
        payload: {
          id: pickId,
        },
      }).then((r) => {
        const { data } = r
        if (data.length === 0) {
          Modal.info({ title: '该人员近期没有活动.' })
        }
        let arrs = []
        viewer.dataSources.remove(dataTravelSource, true)
        dataTravelSource.entities.removeAll()
        viewer.dataSources.add(dataTravelSource);
        data.map((item, index) => {
          arrs.push(item.lon, item.lat)
          var divpoint = new mars3d.DivPoint(viewer, {
            html: `<div class="divpoint2">
                        <div class="title">${item.date}</div>
                        <div class="content">${item.play}</div> 
                      </div >`,
            position: Cesium.Cartesian3.fromDegrees(item.lon, item.lat, 0),
            anchor: [0, 0],
          });
          arrPoint.push(divpoint);
        })
        //示例 
        dataTravelSource.entities.add({
          name: '动态立体墙',
          wall: {
            positions: Cesium.Cartesian3.fromDegreesArray(arrs),
            maximumHeights: [500, 500, 500, 500, 500],
            minimumHeights: [100, 100, 100, 100, 100,],
            material: new mars3d.AnimationLineMaterialProperty({//动画线材质
              color: Cesium.Color.CHARTREUSE,
              duration: 1000, //时长，控制速度
              url: arrowImg,
              repeat: new Cesium.Cartesian2(30, 1),
            }),
          }
        });
        viewer.flyTo(dataTravelSource)
      })
    }
  }

  _clearDraw = () => {
    const { arrPoint } = this.state
    for (var i = 0, len = arrPoint.length; i < len; i++) {
      arrPoint[i].destroy();
    }
    this.setState({
      arrPoint: []
    })
    $(".divpoint2").remove()
  }

  jiuzheng = () => {
    const { prePick, pickId, dataHospitalSource, dataRouteSource, datakuosanSource, dataJiantouSource, dataTravelSource } = this.state
    const { viewer } = this.props
    if (pickId === '') {
      Modal.info({ title: '请点选人员.' })
    } else {
      viewer.dataSources.remove(datakuosanSource, true)
      datakuosanSource.entities.removeAll()
      viewer.dataSources.remove(dataJiantouSource, true)
      dataJiantouSource.entities.removeAll()
      viewer.dataSources.remove(dataTravelSource, true)
      dataTravelSource.entities.removeAll()
      this._clearDraw()

      console.log(prePick.id.position, pickId)
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var x = prePick.id.position._value.x;
      var y = prePick.id.position._value.y;
      var z = prePick.id.position._value.z;
      var cartesian3 = new Cesium.Cartesian3(x, y, z);
      var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
      var sourceLat = Cesium.Math.toDegrees(cartographic.latitude);
      var sourceLng = Cesium.Math.toDegrees(cartographic.longitude);
      var alt = cartographic.height;
      //wgs84转国测局坐标
      // var wgs84togcj02 = coordtransform.wgs84togcj02(lng,lat);
      //国测局坐标转百度经纬度坐标
      // var gcj02tobd09 = coordtransform.gcj02tobd09(wgs84togcj02[0], wgs84togcj02[1]);
      let requestUrl = `http://restapi.amap.com/v3/place/around?key=6ae8c26f1ed9f9d5b10edbc19eb83062&location=${sourceLng},${sourceLat}&keywords=医院&radius=3000&offset=20&page=1&extensions=all`;
      fetch(requestUrl, {
        method: 'GET',
        /*headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },*/
        mode: 'cors',
        cache: 'default'
      }).then(res => res.json()).then((data) => {
        console.log(data)
        const { count, info, pois } = data
        if (count === "0") {
          Modal.info({ title: '三千米范围内没有找到医院.' })
        } else {
          viewer.dataSources.remove(dataHospitalSource, true)
          dataHospitalSource.entities.removeAll()
          viewer.dataSources.add(dataHospitalSource);
          pois.map((item, index) => {
            //添加实体
            let lng = parseFloat(item.location.split(',')[0]);
            let lat = parseFloat(item.location.split(',')[1]);
            // var bd09togcj02 = coordtransform.bd09togcj02(lng ,lat);
            // var gcj02towgs84 = coordtransform.gcj02towgs84(bd09togcj02[0], bd09togcj02[1]);
            dataHospitalSource.entities.add({
              name: item.name,
              position: Cesium.Cartesian3.fromDegrees(lng, lat),
              billboard: {
                image: hospitalImg,
                scale: 0.03,  //原始大小的缩放比例
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.2)
              },
              label: {
                text: item.name,
                font: 'normal small-caps normal 19px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(48, -13),   //偏移量  
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000000)
              },
              data: item,
            });
          })
          let destinationLng = parseFloat(pois[0].location.split(',')[0])
          let destinationLat = parseFloat(pois[0].location.split(',')[1])
          let routeUrl = `http://restapi.amap.com/v3/direction/driving?key=93491b0fb44d1770a55eb86d219a8ffb&origin=${sourceLng},${sourceLat}&destination=${destinationLng},${destinationLat}&originid=&destinationid=&extensions=base&strategy=0&waypoints=&avoidpolygons=&avoidroad=`
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
              //            layer: "tdtAnnoLayer",
              //            style: "default",
              //            format: "image/jpeg",
              //            tileMatrixSetID: "GoogleMapsCompatible"
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
          })
        }
      })
    }
  }

  render() {
    const { confirmLoading, showToolBar } = this.state
    const { visible } = this.props
    return (
      <div>
        {showToolBar && <div className={styles.toolbar}>
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
        </div>}
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
                <Option value="襄阳">襄阳</Option>
                <Option value="荆州">荆州</Option>
              </OptGroup>
              <OptGroup label="河南">
                <Option value="郑州">郑州</Option>
                <Option value="南阳">南阳</Option>
                <Option value="登封">登封</Option>
              </OptGroup>
            </OptGroup>
          </Select>,
          </Modal>
      </div>
    )
  }
}

export default Source