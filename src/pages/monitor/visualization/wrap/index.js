/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio, Collapse, Slider,Carousel } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;

@connect(({ Visualization }) => ({
  Visualization
}))

class Wrap extends Component {

  constructor(props) {
    super(props)
    this.state = {
      areaValue: 1, //1 云南 2 四川 3 广西
      showImg:true,
      prePick: null,
      pickId: '',
      datakuosanSource: null,
      dataMoyuSource: null,
      // imageryLayer_gd: null,
    }
  }

  componentDidMount() {
    this.bindClick();
    this.setState({
      datakuosanSource: new Cesium.CustomDataSource("kuosan"),
      dataMoyuSource: new Cesium.CustomDataSource("moyu"),
    }, () => {
      this.handleOk(7);
      //一进入即飞到云南
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(102.5, 24.5, 5000),
        duration: 1.0,
      });
    })
    // 
  }

  componentWillUnmount() {
    // viewer.imageryLayers.remove(this.state.imageryLayer_gd);
  }

  bindClick = () => {
    const { viewer } = this.props
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(movement => {
      const { prePick } = this.state
      var pick = viewer.scene.pick(movement.position);
      prePick !== null ? prePick.id.point.color = new Cesium.Color.fromCssColorString("#3388ff") : '';
      if (Cesium.defined(pick) && pick.id.id && pick.id.flag === "moyu") {
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

      //输出坐标
      var cartesian = viewer.scene.pickPosition(movement.position);
        if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian); //根据笛卡尔坐标获取到弧度
            var lng = Cesium.Math.toDegrees(cartographic.longitude); //根据弧度获取到经度
            var lat = Cesium.Math.toDegrees(cartographic.latitude); //根据弧度获取到纬度
            var height = cartographic.height;//模型高度
            console.log(cartesian, lng, lat, height);
        }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  handleOk = (month) => {
    const { dispatch, viewer } = this.props
    const { input_value, records, shengData, datakuosanSource, dataMoyuSource } = this.state;
    // clearDraw()

    dispatch({
      type: 'Visualization/getAllMoyus'
    }).then(result => {
      console.log(result)
      const { success, data } = result
      const data1 = data.filter(v=>v.month===month)
      if (success) {
        viewer.dataSources.remove(dataMoyuSource, true)
        viewer.dataSources.remove(datakuosanSource, true)
        dataMoyuSource.entities.removeAll()
        datakuosanSource.entities.removeAll()
        data1.map((item, i) => {
          let diqu = '';
          if (item.diqu === "SICUAN") {
            diqu = '四川'
          } else if (item.diqu === "GUANGXI") {
            diqu = '广西'
          } else if (item.diqu === "YUNNAN") {
            diqu = '云南'
          }
          var inthtml = `<table style="width: 200px;"><tr>'
                  <th scope="col" colspan="4"  style="text-align:center;font-size:15px;">${item.month}月</th></tr><tr>'
                  <td >地区：</td><td >${diqu}</td></tr><tr>
                  <td >温度：</td><td >${item.tem}℃</td></tr><tr>
                  <td >湿度：</td><td >${item.humidity}%</td></tr><tr>
                  <td >海拔：</td><td >${item.height}m</td></tr><tr>
                  <td >PH值：</td><td >${item.ph}</td></tr><tr>
                  <td >光照强度：</td><td >${item.beam}Lux</td></tr><tr>
                  <td >经纬度：</td><td >${item.lng},${item.lat}</td></tr><tr>
                  <td colspan="4" style="text-align:right;"></td></tr></table>`;
          //添加实体
          dataMoyuSource.entities.add({
            flag: 'moyu',
            name: item.id,
            id: item.id,
            position: Cesium.Cartesian3.fromDegrees(item.lng, item.lat),
            point: {
              color: new Cesium.Color.fromCssColorString("#3388ff"),
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
          if (item.tem > 20) {
            //扩散点
            datakuosanSource.entities.add({
              position: Cesium.Cartesian3.fromDegrees(item.lng, item.lat),
              ellipse: {
                // height: 0.0,
                semiMinorAxis: 1000.0,
                semiMajorAxis: 1000.0,
                material: new mars3d.ElliposidFadeMaterialProperty({
                  color: new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 0.8)
                }),
              }
            });
          }
        });
        viewer.dataSources.add(datakuosanSource);
        viewer.dataSources.add(dataMoyuSource);
      }
    })
  };

  handleChange = (value) => {
    this.setState({
      input_value: value
    })
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

  //------------------------
  onAreaChange = e => {
    console.log('radio checked', e.target.value);
    const p = e.target.value
    if(p===1){
      this.setState({
        showImg:true
      })
    }else{
      this.setState({
        showImg:false
      })
    }
    switch (p) {
      case 1://YUNNAN
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(102.5, 24.5, 1000),
          duration: 1.0,
        });
        break;
      case 2:
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(104.1, 30.7, 1000),
          duration: 1.0,
        });
        break;
      case 3:
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(108.5, 22.5, 1000),
          duration: 1.0,
        });
        break;
      default:
        break
    }

    this.setState({
      areaValue: e.target.value,
    });
  }


  sliderChange = val =>{
    this.handleOk(val)
  }

  render() {
    const { areaValue,showImg } = this.state
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const marks = {
      7: '7月',
      8: {
        style: {
          color: '#f50',
        },
        label: <strong>8月</strong>,
      },
      9: '9月'
    };
    return (
      <div>
        <Card style={{ width: 250 ,position:'absolute',left:15,top:230}}>
          <Collapse defaultActiveKey={['2']}>
            <Panel header="地区|月份" key="2">
              <Row>
                <Col span={6}>
                  <Radio.Group onChange={this.onAreaChange} value={areaValue}>
                    <Radio style={radioStyle} value={1}>云南</Radio>
                    <Radio style={radioStyle} value={2}>四川</Radio>
                    <Radio style={radioStyle} value={3}>广西</Radio>
                    {/* <Radio style={radioStyle} value={4}>More...{this.state.value === 4 ? <Input style={{ width: 100, marginLeft: 10 }} /> : null}</Radio> */}
                  </Radio.Group>
                </Col>
                <Col span={6}>
                  <div style={{ display: 'inline-block', height: 80 ,padding:'10px 0 0 25px'}}>
                    <Slider vertical included={false} marks={marks} step={1} defaultValue={[7]} max={9} min={6} onChange={this.sliderChange}/>
                  </div>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        </Card>
        { showImg &&<Card style={{ width: 500,height:300,position:"absolute",right:0,top:80 }}>
        <Carousel autoplay style={{height:'100%'}} >
                    <div className={styles.img1}>
                        <h3>种上了</h3>
                    </div>
                    <div className={styles.img2}>
                      <h3>收获了</h3>
                    </div>
                    <div className={styles.img3}>
                      <h3>吃上了</h3>
                    </div>
                  </Carousel>,
        </Card>
        }
      </div>
    )
  }
}

export default Wrap