/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col,
  DatePicker, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio, message
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { getCookie, setCookie } from '@/utils/cookie'
import moment from 'moment';

var clipTileset, drawControl, timeTik;

@connect(({ Shuili, Login }) => ({
  Shuili, Login
}))
class Shuili_search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      datas: [],
      operateType: 'add',
      urlTileset: 'http://127.0.0.1:9999/shenda_data/max-3dtiles-3/6-8-bu/tileset.json', //模型地址
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.Login;
    console.log(this.props)
    // this.props.form.resetFields();
    // this.props.form.setFieldsValue({
    //   date: moment("2019-04"), category: 'ALL'
    // })
    this.initDraw()
  }

  initDraw = () => {
    const { form } = this.formRef.props;
    drawControl = new mars3d.Draw(viewer, {
      hasEdit: true,
      // hasDel: function (e) {
      //     //当需要判断该entity是否可以删除时，在该回调方法中处理，return false不可删除
      //     var entity = e.target;
      //     return true;
      // }
    });
    drawControl.on(mars3d.draw.event.DrawCreated, (e) => {
      var entity = e.entity;
      // this.startEditing(entity);
      console.log('创建完成', e);
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var position = e.entity.position._value
      var wgs84 = ellipsoid.cartesianToCartographic(position);
      console.log(wgs84)
      this.setState({
        longitude: wgs84.longitude,
        latitude: wgs84.latitude,
      })
      // this.formRef.props.form.resetFields();

      this.setState({ visible: true, operateType: 'add' }, () => {
        setTimeout(() => {
          this.formRef.props.form.setFieldsValue({
            day1: 0.00, day2: 1.01, day3: 1.86, day4: 2.24, day5: 2.39, day6: 2.27, day7: 1.61, day8: 1.55, day9: 1.53, day10: 2.21,
            day11: 2.50, day12: 2.67, day13: 2.53, day14: 2.40, day15: 2.31, day16: 2.13, day17: 2.13, day18: 2.01, day19: 2.03, day20: 2.21,
            day21: 2.29, day22: 2.35, day23: 2.24, day24: 2.41, day25: 2.42, day26: 2.32, day27: 2.33, day28: 2.27, day29: 2.24, day30: 2.11,
            day31: 2.12, day32: 2.03
          })
        }, 200)
      });
    });

    drawControl.loadJson({ "type": "FeatureCollection", "features": [
      { "type": "Feature", "properties": { "type": "billboard", "style": { "image": require("../img/mark1.png"), "label": { "text": "", "font_size": 30, "color": "#ffffff", "border": true, "border_color": "#000000", "pixelOffset": [0, -50] } }, "attr": {} }, "geometry": { "type": "Point", "coordinates": [116.274056, 30.949407, 0] } }, 
      { "type": "Feature", "properties": { "type": "billboard", "style": { "image": require("../img/mark1.png"), "label": { "text": "", "font_size": 30, "color": "#ffffff", "border": true, "border_color": "#000000", "pixelOffset": [0, -50] } }, "attr": {} }, "geometry": { "type": "Point", "coordinates": [116.339646, 30.9412, -0.01] } }] }, {
      clear: true,
      flyTo: true
    })
  }

  startEditing = (entity) => {
    var lonlats = drawControl.getCoordinates(entity);

    clearTimeout(timeTik);

    var plotAttr = mars3d.widget.getClass('widgets/plotAttr/widget.js');
    if (plotAttr && plotAttr.isActivate) {
      plotAttr.startEditing(entity, lonlats);
    }
    else {
      mars3d.widget.activate({
        viewer: viewer,
        uri: 'widgets/plotAttr/widget.js',
        name: "属性编辑",
        entity: entity,
        lonlats: lonlats,
        deleteEntity: function (entity) {
          drawControl.deleteEntity(entity);
        },
        updateAttr: function (attr) {
          drawControl.updateAttribute(attr);
        },
        updateGeo: function (positions) {
          drawControl.setPositions(positions); //更新当前编辑的entity  
        },
        centerAt: function (entity) {
          viewer.mars.flyTo(entity);
        },
      });
    }
  }

  locate = (record) => {
    const { dispatch } = this.props
    const { longitude, latitude } = record
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100000),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
  }

  showModal = () => {
    drawControl && drawControl.startDraw({
      type: "billboard",
      style: {
        image: require("../img/mark1.png"),
        label: {//不需要文字时，去掉label配置即可
          // "text": "可以同时支持文字",
          "font_size": 30,
          "color": "#ffffff",
          "border": true,
          "border_color": "#000000",
          "pixelOffset": [0, -50],
        }
      }
    });

  };
  showUpdateModal = (vid) => {
    const { datas } = this.state;
    let da = datas.find(d => d.id == vid)
    const { id, name_en, date, longitude, latitude, area, criteria_txt, category, category_short,
      states_name_en, region_en, iso_code, udnp_code, transboundary, } = da

  }

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { longitude, latitude } = this.state
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      const { id } = values;
      if (values && values.id) { //编辑模式
        dispatch({
          type: 'Shuili/update',
          payload: {
            data: { ...values }
          }
        }).then(r => {
          console.log(r);
          // r.success && dispatch({
          //   type: 'Shuili/getAllByModule',
          //   payload: {
          //     data: 'shebei'
          //   }
          // })
          form.resetFields();
          this.setState({ visible: false });
        })
      } { //新增模式
        // Object.values(obj)
        dispatch({
          type: 'Shuili/save',
          payload: {
            data: { module: 'shuili', v1: longitude, v2: latitude, v3: Object.values({ ...values }).join(',') }
          }
        }).then(r => {
          console.log(r);
          // r.success && dispatch({
          //   type: 'Fish/getAllByModule',
          //   payload: {
          //     data: 'shebei'
          //   }
          // })

          form.resetFields();
          this.setState({ visible: false });
        })
      }

    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  add3dModel = () => {
    // this.formRef.props.form.resetFields();
    // this.setState({ visible: true, operateType: 'add' });
    const { urlTileset } = this.state;
    console.log(urlTileset)
    // 加个模型

    // var tileset = new Cesium.Cesium3DTileset({
    //   url: urlTileset //'http://data.marsgis.cn/3dtiles/bim-qiaoliang/tileset.json'
    // })

    // viewer && tileset.readyPromise.then((tileset) => {
    //   var boundingSphere = tileset.boundingSphere;
    //   var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    //   var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
    //   var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, -80);
    //   var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    //   tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

    //   viewer.scene.primitives.add(tileset);

    //   // viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 1.0));
    //   viewer.flyTo(tileset, {
    //     offset: {
    //       heading: Cesium.Math.toRadians(0),
    //       pitch: Cesium.Math.toRadians(-90.0),//从上往下看为-90
    //       roll: 0
    //     }
    //   })
    //   clipTileset = new mars3d.tiles.TilesClipPlan(tileset);
    // }).otherwise(function (error) {
    //   console.log(error);
    //   // reject()
    // });

    var layerModel = mars3d.layer.createLayer({
      "type": "3dtiles",
      "name": "",
      "url": urlTileset, //'http://data.marsgis.cn/3dtiles/bim-qiaoliang/tileset.json',//定义在 config\marsUrl.js
      "maximumScreenSpaceError": 16,
      "maximumMemoryUsage": 8192,
      "dynamicScreenSpaceError": true,
      "cullWithChildrenBounds": false,
      "luminanceAtZenith": 0.6,
      // "scenetree": "scenetree.json",
      // "offset": { "x": 117.096906, "y": 31.851564, "z": 45, "heading": 342.5 },
      "showClickFeature": true,
      "pickFeatureStyle": {
        "color": "#00FF00"
      },
      "popup": "all",
      "visible": true,
      "flyTo": true,
      "calback": function (tileset) {
        clipTileset = new mars3d.tiles.TilesClipPlan(tileset);

        var radius = tileset.boundingSphere.radius / 2;
        // $("#rangeDistance").attr("min", -radius);
        // $("#rangeDistance").attr("max", radius);
        clipTileset.distance = 0
      }
    }, viewer);

  };

  polyClip = () => {
    if (!clipTileset) {
      message.warn('还未添加模型！')
      return;
    }
    clipTileset.clear();
    viewer.mars.draw.startDraw({
      type: 'polyline',
      config: { maxPointNum: 2 },
      style: {
        color: '#007be6',
        opacity: 0.8,
        outline: false,
      },
      success: function (entity) { //绘制成功后回调 
        var points = viewer.mars.draw.getPositions(entity);
        viewer.mars.draw.deleteAll();

        clipTileset.clipByPoints(points);
      }
    });
  }

  clearClip = () => {
    if (!clipTileset) {
      message.warn('还未添加模型！')
      return;
    }
    clipTileset.clear();
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.props.dispatch({
          type: 'Shuili/findByNameAndCategory',
          payload: {
            ...values,
          }
        }).then(res => {
          const { success, data } = res;
          if (success) {
            this.setState({
              datas: data,
            })

          }
        })

      } else {
        message.error('输入参数非法错误！')
      }
    });
  };
  drawZhu = () => {
    const { data } = this.state;

  }

  handeUrlChange = value => {
    this.setState({
      urlTileset: value
    });
  }

  render() {
    const { datas, operateType } = this.state
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Row style={{ marginBottom: 10 }}>
          <Col span={14} >
            <Input type="primary" shape="round" defaultValue='http://127.0.0.1:9999/shenda_data/max-3dtiles-3/6-8-bu/tileset.json' onChange={this.handeUrlChange} />
          </Col>
          <Col offset={1} span={2}>
            <Button type="primary" shape="round" onClick={this.add3dModel}><Icon type="plus" />添加</Button>
          </Col>
          <Col offset={2} span={2}>
            <Button type="primary" shape="round" onClick={this.polyClip}>裁剪</Button>
          </Col>
          <Col offset={1} span={2}>
            <Button type="primary" shape="round" onClick={this.clearClip}>清除</Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col span={2}>
            操作：
          </Col>
          <Col span={2}>
            <Button type="primary" shape="round" onClick={this.showModal}>添加点标记</Button>
          </Col>

        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col span={24}>
            <Form layout={'inline'} onSubmit={this.handleSubmit}>
              <Form.Item label="名称：" >
                {getFieldDecorator(`name`, {
                  rules: [
                    {
                      required: true,
                      message: '请输入名称!',
                    },
                  ],
                })(<Input />)}
              </Form.Item>
              <Form.Item label="类型：" >
                {getFieldDecorator('category', {
                  rules: [{ required: true, message: '请选择类型！!' }],
                })(
                  <Select style={{ width: 150 }}
                    placeholder="请选择类型！"
                  >
                    <Select.Option value="ALL">所有</Select.Option>
                    <Select.Option value="Cultural">Cultural</Select.Option>
                    <Select.Option value="Natural">Natural</Select.Option>
                    <Select.Option value="Mixed">Mixed</Select.Option>
                  </Select>
                )}
              </Form.Item>
              <Form.Item >
                <Button type="primary" htmlType="submit">搜索</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>

        <Card>
          <Table
            rowKey={record => record.id}
            scroll={{ x: 1000, y: 300 }}
            columns={[
              {
                title: 'name_en',
                dataIndex: 'name_en',
                fixed: 'left',
                key: 'name_en',
                width: 200
              },
              {
                title: 'region_en',
                dataIndex: 'region_en',
                fixed: 'left',
                key: 'region_en',
                width: 120
              },
              {
                title: 'category',
                dataIndex: 'category',
                key: 'category',
                width: 100,
                render: function (text, record) {
                  if (text.indexOf("Mixed") > -1) {
                    return <Tag color={'geekblue'} key={'geekblue'}> {text} </Tag>
                  } else if (text.indexOf("Cultural") > -1) {
                    return <Tag color={'green'} key={'green'}> {text} </Tag>
                  } else if (text.indexOf("Natural") > -1) {
                    return <Tag color={'yellow'} key={'yellow'}> {text} </Tag>
                  }
                }
              },
              {
                title: 'date',
                dataIndex: 'date',
                key: 'date',
                width: 80,
              },
              {
                title: 'area',
                dataIndex: 'area',
                key: 'area',
                width: 100,
              },
              {
                title: 'longitude',
                dataIndex: 'longitude',
                key: 'longitude',
                width: 120,
              },
              {
                title: 'latitude',
                dataIndex: 'latitude',
                key: 'latitude',
                width: 100,
              },
              {
                title: 'udnp_code',
                dataIndex: 'udnp_code',
                key: 'udnp_code',
                width: 120,
              },
              {
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 80,
                render: (text, record) => (
                  <span>
                    {/* <a style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)}>详情</a> */}
                    <a style={{ marginRight: 16 }} onClick={() => this.locate(record)}>定位</a>
                  </span>
                ),
              },
            ]} dataSource={datas} pagination={true} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          okText={operateType === 'add' ? '添加' : '修改'}
          title={operateType === 'add' ? '添加' : '修改'}
          operateType={operateType}
        />
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addMovie' })(
  // eslint-disable-next-line
  class extends React.Component {

    render() {
      const { visible, onCancel, onCreate, form, title, okText, operateType } = this.props;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 14 },
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
            <Form.Item label="2014/6/13" {...formItemLayout}>
              {getFieldDecorator('day1', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/7/17" {...formItemLayout}>
              {getFieldDecorator('day2', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/8/1" {...formItemLayout}>
              {getFieldDecorator('day3', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/8/5" {...formItemLayout}>
              {getFieldDecorator('day4', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/8/8" {...formItemLayout}>
              {getFieldDecorator('day5', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/8/12" {...formItemLayout}>
              {getFieldDecorator('day6', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/8/19" {...formItemLayout}>
              {getFieldDecorator('day7', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/8/26" {...formItemLayout}>
              {getFieldDecorator('day8', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/9/2" {...formItemLayout}>
              {getFieldDecorator('day9', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/9/9" {...formItemLayout}>
              {getFieldDecorator('day10', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/9/16" {...formItemLayout}>
              {getFieldDecorator('day11', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/9/17" {...formItemLayout}>
              {getFieldDecorator('day12', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/9/23" {...formItemLayout}>
              {getFieldDecorator('day13', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/9/30" {...formItemLayout}>
              {getFieldDecorator('day14', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/10/7" {...formItemLayout}>
              {getFieldDecorator('day15', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/10/14" {...formItemLayout}>
              {getFieldDecorator('day16', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/10/15" {...formItemLayout}>
              {getFieldDecorator('day17', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/10/21" {...formItemLayout}>
              {getFieldDecorator('day18', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/10/28" {...formItemLayout}>
              {getFieldDecorator('day19', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/11/4" {...formItemLayout}>
              {getFieldDecorator('day20', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/11/11" {...formItemLayout}>
              {getFieldDecorator('day21', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/11/18" {...formItemLayout}>
              {getFieldDecorator('day22', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/11/25" {...formItemLayout}>
              {getFieldDecorator('day23', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/12/2" {...formItemLayout}>
              {getFieldDecorator('day24', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/12/9" {...formItemLayout}>
              {getFieldDecorator('day25', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2014/12/30" {...formItemLayout}>
              {getFieldDecorator('day26', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2015/1/6" {...formItemLayout}>
              {getFieldDecorator('day27', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2015/1/13" {...formItemLayout}>
              {getFieldDecorator('day28', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2015/1/20" {...formItemLayout}>
              {getFieldDecorator('day29', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2015/1/27" {...formItemLayout}>
              {getFieldDecorator('day30', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2015/2/3" {...formItemLayout}>
              {getFieldDecorator('day31', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="2015/2/10" {...formItemLayout}>
              {getFieldDecorator('day32', {
                rules: [{ required: true, message: 'please enter  !' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create({ name: 'home_form' })(Shuili_search))