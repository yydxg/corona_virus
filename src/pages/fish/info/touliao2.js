/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, message, Drawer,
  Modal, InputNumber, Select, Table, DatePicker, Tag, Card, Form, Input, Icon, Radio, Breadcrumb
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';
import moment from 'moment';

let lastStage;
@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))
class Touliao2 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      zhuangtai: 'ALL',
      name: '',
      operateType: 'add',
      dateString: [],
      datas: [],//过滤后加工的数据
      cesiumVisible: false,
      datas_yutang:[],
      datas_siliao:[],//饲料

    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;

    this.initTable();

    if (login && login.username !== '') {

    } else {
      // history.push('/fish/user/login')
    }

  }

  initTable = () => {
    this.props.dispatch({
      type: 'Fish/getAllByModule',
      payload: {
        data: 'touliao'
      },
      callback: res => {
        const { success, data } = res;
        if (success && data) {
          let dataArr = data.map(d => {
            return { ...d, tem1: moment(d.v7).fromNow() }
          })
          console.log(dataArr)
          this.setState({
            datas: dataArr
          })

          // this.showTouliao()
        }
      }
    })
  }
  showTouliao = () => {
    const { viewer } = this.state
    let that = this;
    !viewer && mars3d.createMap({
      id: 'cesiumDiv',
      url: '/config/marsConfig.json',
      success: (viewer) => {
        // viewer.camera.setView()
        window.viewer = viewer;
        that.setState({
          viewer,
        })
        this.initView(viewer);//121.480212 29.79226 
        //115.907543  30.441563
        viewer.mars.centerAt({ "y": 29.79226, "x": 121.480212, "z": 45.74, "heading": 202.4, "pitch": -23.6, "roll": 359.9 });
        // viewer.mars.centerAt({ "y": 30.441563, "x": 115.907543, "z": 45.74, "heading": 202.4, "pitch": -23.6, "roll": 359.9 });

        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((movement) => {
          var cartesian = mars3d.point.getCurrentMousePosition(viewer.scene, movement.position);
          if (cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);

            var jd = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
            var wd = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
            var height = Number(cartographic.height.toFixed(1));
            console.log(jd,wd,height)

            this.yanwu(jd, wd, height)
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      },
    });
  }

  yanwu = (jd, wd, height) => {
    console.log(jd,wd,height)
    let particlePosition = Cesium.Cartesian3.fromDegrees(jd, wd, 20)

    let particleSystemEx = new mars3d.ParticleSystemEx(viewer, {
      //ParticleSystem原生属性
      image: '/data/dadi/water/smoke.png',
      startColor: Cesium.Color.LIGHTCYAN.withAlpha(0.3),    //粒子出生时的颜色
      endColor: Cesium.Color.WHITE.withAlpha(0.0),   //当粒子死亡时的颜色

      particleSize: 20,  //粒子图片的Size大小（单位：像素）
      startScale: 2.0, //粒子在出生时的比例（单位：相对于imageSize大小的倍数）
      endScale: 4.0,   //粒子在死亡时的比例（单位：相对于imageSize大小的倍数）

      minimumParticleLife: 1.0,//粒子可能存在的最短寿命时间，实际寿命将随机生成（单位：秒）
      maximumParticleLife: 3.0,//粒子可能存在的最长寿命时间，实际寿命将随机生成（单位：秒）

      // minimumSpeed: 1.0,  //粒子初速度的最小界限，超过该最小界限，随机选择粒子的实际速度。（单位：米/秒） ？？？
      // maximumSpeed: 2.0,  //粒子初速度的最大界限，超过该最大界限，随机选择粒子的实际速度。（单位：米/秒）

      emissionRate: 200, //粒子发射器的发射速率 （单位：次/秒）
      // lifetime: 5, //粒子的一个生命周期长度（单位：秒） ？？？

      //mars扩展的属性
      position: particlePosition, //位置
      gravity: -11,  //重力因子，会修改速度矢量以改变方向或速度（基于物理的效果）
      // target: new Cesium.Cartesian3(-0.151, 0.294, 0.225), // 粒子的方向 
      target: Cesium.Cartesian3.fromDegrees(jd, wd, 100), // 粒子的方向 
      maxHeight: 5000,  //超出该高度后不显示粒子效果 
    })
  }

  initView = (viewer) => {
    //加个模型，效果更NB
    // mars3d.layer.remove()
    mars3d.layer.createLayer({
      "type": "3dtiles",
      "name": "整体模型",
      "url": "/live3d/3dtiles/max-fsdzm/tileset.json", //定义在 config\marsUrl.js
      "maximumScreenSpaceError": 1,
      "maximumMemoryUsage": 1024,
      "offset": { "z": 3 },
      "visible": true
    }, viewer);

    var layerZM = mars3d.layer.createLayer({
      "type": "gltf",
      "name": "闸门",
      "url": "/live3d/gltf/mars/zhamen.glb",
      "position": { "x": 121.479807, "y": 29.791276, "z": 2.7 },
      "style": { "heading": 104 },
      "visible": true
    }, viewer);

    //闸门内部水域
    var layerWater1 = mars3d.layer.createLayer({
      "type": "water",
      "name": "河流(面状)",
      "url": "/live3d/file/geojson/hedao-nei.json",
      "symbol": {
        "styleOptions": {
          "height": 5, //水面高度
          "normalMap": "/data/dadi/water/waterNormals.jpg?time=" + new Date().getTime(),   // 水正常扰动的法线图
          "frequency": 8000.0,    // 控制波数的数字。
          "animationSpeed": 0.02, // 控制水的动画速度的数字。
          "amplitude": 5.0,       // 控制水波振幅的数字。
          "specularIntensity": 0.8,       // 控制镜面反射强度的数字。
          "baseWaterColor": "#006ab4",    // rgba颜色对象基础颜色的水。#00ffff,#00baff,#006ab4
          "blendColor": "#006ab4",        // 从水中混合到非水域时使用的rgba颜色对象。
          "opacity": 0.4, //透明度
        }
      },
      "visible": true
    }, viewer);

    // //河道水域（闸门外部）
    let layerWater2 = mars3d.layer.createLayer({
      "type": "water",
      "name": "河流(面状)",
      "url": "/live3d/file/geojson/hedao-wai.json",
      "symbol": {
        "styleOptions": {
          "height": 3, //水面高度
          "normalMap": "/data/dadi/water/waterNormals.jpg?time=" + new Date().getTime(),   // 水正常扰动的法线图
          "frequency": 8000.0,    // 控制波数的数字。
          "animationSpeed": 0.02, // 控制水的动画速度的数字。
          "amplitude": 5.0,       // 控制水波振幅的数字。
          "specularIntensity": 0.8,       // 控制镜面反射强度的数字。
          "baseWaterColor": "#006ab4",    // rgba颜色对象基础颜色的水。#00ffff,#00baff,#006ab4
          "blendColor": "#006ab4",        // 从水中混合到非水域时使用的rgba颜色对象。
          "opacity": 0.4, //透明度
        }
      },
      "visible": true
    }, viewer);
  }

  addCircleScanPostStage = (viewer, cartographicCenter, maxRadius, scanColor, duration) => {
    var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
    var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

    var _CartograhpicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
    var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartograhpicCenter1);
    var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

    var _time = (new Date()).getTime();

    var _scratchCartesian4Center = new Cesium.Cartesian4();
    var _scratchCartesian4Center1 = new Cesium.Cartesian4();
    var _scratchCartesian3Normal = new Cesium.Cartesian3();

    var ScanPostStage = new Cesium.PostProcessStage({
      fragmentShader: this.getScanSegmentShader(),
      uniforms: {
        u_scanCenterEC: function () {
          var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
          return temp;
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
        u_radius: function () {
          return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
        },
        u_scanColor: scanColor
      }
    });

    viewer.scene.postProcessStages.add(ScanPostStage);
    return ScanPostStage;
  }
  removeStage = () => {
    if (lastStage)
      viewer.scene.postProcessStages.remove(lastStage);
    lastStage = null;
  }
  getScanSegmentShader = () => {
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

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除数据 ?',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Fish/delete',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            this.initTable();
          }
        })
      }
    })
  }

  findBy = () => {
    const { name, dateString } = this.state
    const { dispatch } = this.props
    console.log(name, dateString)
    if (!dateString || dateString.length === 0) {
      message.warn('请选择日期范围！')
      return;
    }
    dispatch({
      type: 'Fish/findByV2AndDate',
      payload: {//v1:计划名称。v3:规格
        module: 'touliao',
        v2: name === '' ? 'ALL' : name,
        startDate: dateString[0],
        endDate: dateString[1]
      },
      callback: res => {
        const { success, data } = res;
        if (success && data) {
          let dataArr = data.map(d => {
            return { ...d, tem1: moment(d.v7).fromNow() }
          })
          console.log(dataArr)
          this.setState({
            datas: dataArr
          })
        }
      }
    })
  }

  showAddModal = () => {
    this.formRef.props.form.resetFields();
    const { dispatch } = this.props;
    dispatch({
      type: 'Fish/findModule1AndV1InModule2AndV2',
      payload: {
        module1: 'yutang',
        module2: 'fangyang'
      }
    }).then(r => {
      console.log(r);
      const {success:success1, data:data1} = r
      if(success1){
        dispatch({
          type: 'Fish/findByModuleAndV4GreaterThanZero',
          payload: {
            module: 'siliao'
          }
        }).then(res => {
          
          const {success:success2,data:data2} = res
          
          success2 && this.setState({ 
            datas_siliao:data2,
            datas_yutang:data1,
            visible: true, 
            operateType: 'add' 
          });
        })
      }
    })
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    const { tempdata } = this.props.F_Login
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      const { id } = values;
      if (values && values.id) { //编辑模式
        dispatch({
          type: 'Fish/update',
          payload: {
            data: { ...values, module: 'touliao' }
          }
        }).then(r => {
          console.log(r);
          r.success && this.initTable()
          form.resetFields();
          this.setState({ visible: false });
        })
      } else{ //新增模式
        //siliao总数
        let total = values.v3.split(',')[1]
        if(total < values.v4){
          message.warn('该饲料仓库数量已不足！')
          return;
        }
        let siliao_v4 = total-values.v4
        this.isV1Unique(values.v1).then(r => {
          const { success, data } = r
          if (success && data) {
            dispatch({
              type: 'Fish/save',
              payload: {
                data: { ...values, v3: values.v3.split(',')[0], module: 'touliao', v7: moment().format('YYYY-MM-DD'), v9: tempdata.v2 }
              }
            }).then(r => {
              console.log(r);

              r.success && dispatch({
                type: 'Fish/updateV4',
                payload: {
                  id:values.v3.split(',')[2],
                  v4:siliao_v4,
                }
              })

              r.success && this.initTable()
              // r.success && this.yanwu(112.48+Math.random()*0.01, 29.792+Math.random()*0.01, 2)
              r.success && this.yanwu(21.479256 ,29.79286 ,3)
              
              r.success && this.props.showVisual()
              form.resetFields();
              this.setState({ visible: false });
            })
          } else {
            message.warn("已存在相同投料，请重新设置！")
            return;
          }
        })
      }
    });
  };

  isV1Unique = (v1) => {
    const { dispatch } = this.props;
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'Fish/isV1Unique',
        payload: {
          module: 'touliao',
          v1
        }
      }).then(r => {
        resolve(r)
      })
    })
  }
  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  showUpdateModal = (vid) => {
    const { history } = this.props;
    const { datas } = this.props.Fish;
    const { form } = this.formRef.props;
    this.setState({ visible: true, operateType: 'update' });
    let da = datas.find(d => d.id == vid)
    const { id, v1, v2, v3, v4, v7, v9 } = da
    form.setFieldsValue({
      id, v1, v2, v3, v4, v7, v9
    })

  }
  onChangeDate = (date, dateString) => {
    console.log(date, dateString);
    this.setState({
      dateString,
    })
  }
  onNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }
  onClose = () => {
    this.setState({
      cesiumVisible: false,
    });
  };

  render() {
    const { operateType, datas } = this.state
    const { tempdata, role } = this.props.F_Login
    return (
      <>
        <div className={styles.Fish} style={{ width: '100%' }}>
          <Row style={{ marginBottom: 10 }}>
            <Col offset={2} span={10}>
              <Breadcrumb>
                <Breadcrumb.Item><Icon type="home" />位置：</Breadcrumb.Item>
                <Breadcrumb.Item>
                  <a href="#">信息管理模块</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  投料管理
              </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row style={{ marginBottom: 10 }}>
            <Col offset={2} span={2}>
              {role === '养殖人员' ? <Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button> : ''}
            </Col>
            <Col offset={2} span={22}>
              <Form layout={"inline"}>
                <Form.Item label="鱼塘名称" style={{ height: 20 }}>
                  <Input
                    placeholder="鱼塘名称"
                    onChange={this.onNameChange}
                  />,
              </Form.Item>
                <Form.Item label="日期范围" style={{ height: 20 }}>
                  <DatePicker.RangePicker renderExtraFooter={() => 'extra footer'} onChange={this.onChangeDate} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={this.findBy}><Icon type="search" />搜索</Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>

          <Card>
            <Table
              rowKey={record => record.id}
              columns={[
                {
                  title: '养殖批次',
                  dataIndex: 'v1',
                  key: 'v1',
                },
                {
                  title: '鱼塘名称',
                  dataIndex: 'v2',
                  key: 'v2',
                },
                {
                  title: '养殖品种',
                  dataIndex: 'v3',
                  key: 'v3',
                },
                {
                  title: '数量',
                  dataIndex: 'v4',
                  key: 'v4',
                },
                {
                  title: '投料时间',
                  dataIndex: 'v7',
                  key: 'v7',
                },
                {
                  title: '投料人',
                  dataIndex: 'v9',
                  key: 'v9',
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 200,
                  render: (text, record) => {
                    if (this.props.F_Login.role === '养殖人员') {
                      return <span>
                        <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                        <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)} >修改</Button>
                        {/* <Button type="dashed" style={{ marginRight: 16 }} onClick={() => this.showTouliao(record.id)} >投料</Button> */}
                      </span>
                    }
                  },
                },
              ]} dataSource={role === '养殖人员' ? datas.filter(d => d.v9 === tempdata.v2) : datas} pagination={{ pageSize: 5 }} />
          </Card>

          <CollectionCreateForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.visible}
            onCancel={this.handleCancel}
            onCreate={this.handleCreate}
            okText={operateType === 'add' ? '添加' : '修改'}
            title={operateType === 'add' ? '添加' : '修改'}
            datas_yutang = {this.state.datas_yutang}
            datas_siliao = {this.state.datas_siliao}

          />

          <Drawer
            width={'1200'}
            title="模拟投药"
            placement={'right'}
            closable={true}
            maskClosable={false}
            mask={false}
            onClose={this.onClose}
            visible={this.state.cesiumVisible}
            style={{ height: '672px', top: '80px' }}
          >
          </Drawer>
        </div>
        {/* <div id="cesiumDiv" style={{ width: '40%', height: '80%', float: 'right', marginTop: 80 }}></div> */}
      </>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addFangyang' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form, title, okText, datas_yutang, datas_siliao } = this.props;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
      };
      return (
        <Modal
          visible={visible}
          title={title}
          okText={okText}
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="horizontal">
            <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('id')(<Input />)}
            </Form.Item>
            <Form.Item label="养殖批次" {...formItemLayout}>
              {getFieldDecorator('v1', {
                rules: [{ required: true, message: 'please enter 养殖批次 !' }],
              })(<Input disabled={title === '修改' ? true : false} />)}
            </Form.Item>
            <Form.Item label="鱼塘名称" {...formItemLayout}>
              {getFieldDecorator('v2', {
                rules: [{ required: true, message: 'please enter 鱼塘名称 !' }],
              })(<Select
                showSearch
                style={{ width: 200 }}
                placeholder="Select a 鱼塘编号（名称）"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                disabled={title === '修改' ? true : false}
              >
                {
                  datas_yutang.map((d,idx)=>(
                    <Option key={idx} value={d.v1}>{'编号：'+d.v1+' 名称：'+ d.v2}</Option>
                  ))
                }
              </Select>)}
            </Form.Item>
            <Form.Item label="饲料名称" {...formItemLayout}>
              {getFieldDecorator('v3', {
                rules: [{ required: true, message: 'please enter 养殖品种 !' }],
              })(<Select
                showSearch
                style={{ width: 300 }}
                placeholder="Select a 饲料名称"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                disabled={title === '修改' ? true : false}
              >
                {
                  datas_siliao.map((d,idx)=>(
                    <Option key={idx} value={d.v1+","+d.v4+","+d.id}>{'编号：'+d.v1+' 名称：'+ d.v2+'数量：'+d.v4}</Option>
                  ))
                }
              </Select>)}
            </Form.Item>
            <Form.Item label="投料数量（kg）" {...formItemLayout}>
              {getFieldDecorator('v4', {
                rules: [{ required: true, message: 'please enter 数量 !' }],
              })(<InputNumber min={0}/>)}
            </Form.Item>
            <Form.Item label="投料时间" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v7', {
              })(<Input />)}
            </Form.Item>
            {/* <Form.Item label="备注信息" {...formItemLayout}>
              {getFieldDecorator('v8', {
                rules: [{ required: true, message: 'please enter 备注信息 !' }],
              })(<Input.TextArea  />)}
            </Form.Item> */}
            <Form.Item label="投料人" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v9', {
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }

);
export default connect()(Form.create()(Touliao2))
/**
 * v1: 鱼塘编号、鱼塘名称、饲料名称、投料数量、投料人、投料时间
 */