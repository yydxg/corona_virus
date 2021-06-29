/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Redirect } from 'umi';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card, Radio, Steps, message,
  Form, Input, Icon, Cascader, DatePicker, Tag, InputNumber, Table,
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';

const { CheckableTag } = Tag;
const { Step } = Steps;
const { Option, OptGroup } = Select;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

const steps = [
  {
    title: '点选起点',
  },
  {
    title: '点选终点',
  }
];

const cities = ["北京", "长沙", "厦门", "石家庄", "上海", "昆明", "广州", "济南", "重庆",
  "西安", "青岛", "武汉", "成都", "杭州", "郑州", "天津", "沈阳", "深圳", "南京", "合肥"]

const startImg = require('../img/start.png')
const citiesLngLat = require('../data/shizhudi.json')
const zhanji = require('../data/zhanji.glb')
let flightEntity = null;

@connect(({ Cesium_Travel, F_Login }) => ({
  Cesium_Travel, F_Login
}))

class Cesium_Flight extends Component {

  constructor(props) {
    super(props)
    this.state = {
      expand: false,
      viewer: null,
      navDataSource: new Cesium.CustomDataSource("nav"),
      selectAirNameTag: '',//航司标签选中
      datas: [],//表格数据
    }
  }

  componentDidMount() {
    const login = this.props.F_Login;
    if(login && login.username !==''){
      
    }else{
      // history.push('/fish/user/login')
    }

    this.start()
  }

  start = () => {
    this.initMap({
    }).then(() => {
      this.addGansuDistrict()
      this.props.form.setFieldsValue({
        date: [moment('2021-02-15'), moment('2021-02-19')]
      })
    }).then(() => {
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

          // viewer.dataSources.remove(navDataSource, true)
          // navDataSource.entities.removeAll()
          // viewer.dataSources.add(navDataSource);

          this.setState({
            viewer
          })
          resolve()
        },
      });
    })
  };

  loadGeoJson = () => {
    viewer.dataSources.add(
      Cesium.GeoJsonDataSource.load(require("../data/shengxian.geojson"))
    )
  }
  addGansuDistrict = () => {
    return new Promise((resolve, reject) => {
      let promise_line = Cesium.GeoJsonDataSource.load(require("../data/shengxian.geojson"));
      promise_line.then(data => {
        viewer.dataSources.add(data);
        let entities = data.entities.values;
        entities.map(entity => {
          entity.polyline.width = 2;
          entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: .5,
            color: Cesium.Color.fromCssColorString('#1694E7').withAlpha(.9)
          })
        })
        resolve()
      })
    })
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

  handleSearch = e => {
    e.preventDefault();
    const { dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) {
        message.warn('请输入完整查询条件！')
        return;
      }
      console.log('Received values of form: ', values);
      const { departureCityName, arrivalCityName, date } = values
      dispatch({
        type: 'Cesium_Travel/findFlights',
        payload: {
          data: { ...values, startDate: date[0].format('YYYY-MM-DD'), endDate: date[1].format('YYYY-MM-DD') }
        }
      }).then(r => {
        console.log(r)
        const { success, data } = r
        if (!success) return;
        if(data.length===0){
          message.info('当前条件下无数据。')
          return;
        }
        this.initView(departureCityName, arrivalCityName)
        this.setState({
          datas: data
        })
      })
    });
  };

  initView = (startName, endName) => {
    var start = Cesium.JulianDate.fromDate(new Date(2018, 8, 5, 10));

    let features = citiesLngLat.features
    let startCoor = features.filter(f => f.properties.name.indexOf(startName) >= 0)[0].geometry.coordinates;
    let endCoor = features.filter(f => f.properties.name.indexOf(endName) >= 0)[0].geometry.coordinates;
    var startPoint = Cesium.Cartesian3.fromDegrees(startCoor[0], startCoor[1]);
    var endPoint = Cesium.Cartesian3.fromDegrees(endCoor[0], endCoor[1]);
    var result = this.computepathFlight(startPoint,endPoint);
    var position = result.property;
    var stop = result.stop;
    viewer.entities.removeAll()

    //添加label
    viewer.entities.add({
      name: "根据视距显示文字",
      position: Cesium.Cartesian3.fromDegrees(startCoor[0], startCoor[1], 1548.6),
      label: {
          text: startName,
          font: 'normal small-caps normal 30px 楷体',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.BLUE,
          outlineColor: Cesium.Color.LIME,
          outlineWidth: 2,
      }
    });
    viewer.entities.add({
      name: "根据视距显示文字",
      position: Cesium.Cartesian3.fromDegrees(endCoor[0], endCoor[1], 1548.6),
      label: {
          text: endName,
          font: 'normal small-caps normal 30px 楷体',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.BLUE,
          outlineColor: Cesium.Color.LIME,
          outlineWidth: 2,
      }
    });

    //添加飞机航线    
    flightEntity = viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start: start,
        stop: stop
      })]),
      position: position,
      orientation: new Cesium.VelocityOrientationProperty(position),
      model: {
        uri: zhanji,
        scale: 0.1,
        minimumPixelSize: 80
      },
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Cesium.Color.GREEN
        }),
        width: 4
      }
    });

    // This is where it becomes a smooth path.
    flightEntity.position.setInterpolationOptions({
      interpolationDegree: 5,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
    });
    viewer.flyTo(viewer.entities, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90)));

    //Make sure viewer is at the desired time.
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //到达终止时间后循环
    viewer.clock.multiplier = 1;
    viewer.clock.shouldAnimate = true;
  }

  computepathFlight = (startPoint, endPoint) => {
    var start = Cesium.JulianDate.fromDate(new Date(2018, 8, 5, 10));

    var property = new Cesium.SampledPositionProperty();


    var positions = mars3d.polyline.getLinkedPointList(startPoint, endPoint, 15000, 50);//计算曲线点

    // var dataSource = new Cesium.CustomDataSource('data')
    // viewer.dataSources.add(dataSource)

    // dataSource.entities.add({
    //   name: '流动线特效 空中',
    //   polyline: {
    //     positions: positions,
    //     width: 5,
    //     material: new mars3d.LineFlowMaterial({//动画线材质
    //       color: Cesium.Color.CYAN,
    //       duration: 2000000, //时长，控制速度
    //       url: 'img/textures/LinkPulse.png'
    //     }),
    //   }
    // });
    console.log(positions)

    var ilen = parseInt(positions.length / 5);
    for (var i = 0; i < ilen; i++) {
      var xyz = positions[i * 5];
      // var wgs84 = viewer.scene.globe.ellipsoid.cartesianToCartographic(xyz);
      var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
      // var position = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(wgs84.longitude), Cesium.Math.toDegrees(wgs84.latitude), 12000);
      property.addSample(time, xyz);
    }

    // var lastpoint = new Cesium.Cartesian3(values[0], values[1], values[2]);
    var lastpoint = positions[ilen - 1];
    // var lastwgs84 = viewer.scene.globe.ellipsoid.cartesianToCartographic(lastpoint);
    var time = Cesium.JulianDate.addSeconds(start, ilen, new Cesium.JulianDate());
    // var position = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(lastwgs84.longitude), Cesium.Math.toDegrees(lastwgs84.latitude), 12000);
    // property.addSample(time, lastpoint);

    return {
      property: property,
      stop: time.clone()
    };
  }


  handleAirNameChange = (tag, checked) => {
    const nextSelectedTags = checked ? tag : '';
    this.setState({ selectAirNameTag: nextSelectedTags });
    this.props.form.setFieldsValue({
      marketAirlineName: tag,
    });
  }

  goTrain=()=>{
    this.props.history.push('/cesium_travel/train')
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { viewer, expand, datas,
      selectAirNameTag } = this.state
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 16,
          offset: 2,
        },
      },
    };
    const tagsFromServer = ["中国国航", "南方航空", "海南航空", "华夏航空", "东方航空",
      "吉祥航空", "深圳航空", "幸福航空"];

    return (
      <div style={{ width: '100%', height: 'calc(100% - 80px)', left: 0, top: 80, bottom: 0, right: 0, position: 'absolute' }} >

        <Card className={styles.baseMap}>
          <Form {...formItemLayout} onSubmit={this.handleSearch}>
            <Form.Item label={
              <span>
                城市&nbsp;
                  <Tooltip title="请输入出发-到达城市！">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }>
              <Row>
                <Col span={10}>
                  {getFieldDecorator('departureCityName', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your departureCityName!',
                      },
                    ],
                  })(<Select
                    style={{ width: '100%' }}
                    placeholder="select departure city"
                    optionLabelProp="label"
                  >
                    {
                      cities.map(c => (
                        <Option key={c} value={c} label={c}>
                          {c}
                        </Option>
                      ))
                    }
                  </Select>)}
                </Col>
                <Col span={4}>
                  <Icon type="swap" style={{ fontSize: 24, marginLeft: 42, marginTop: 4 }} />
                </Col>
                <Col span={10}>
                  {getFieldDecorator('arrivalCityName', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your arrivalCityName!',
                      },
                    ],
                  })(<Select
                    style={{ width: '100%' }}
                    placeholder="select arrival city"
                    optionLabelProp="label"
                  >
                    {
                      cities.map(c => (
                        <Option key={c} value={c} label={c}>
                          {c}
                        </Option>
                      ))
                    }
                  </Select>)}
                </Col>
              </Row>
            </Form.Item>

            <Form.Item
              label={
                <span>
                  日期&nbsp;
              <Tooltip title="请输入日期?">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator('date', {
                rules: [{ required: true, message: 'Please input your date!' }],
              })(<RangePicker />)}
            </Form.Item>
            {
              expand &&
              <Fragment>
                <Form.Item
                  label={
                    <span>
                      航司&nbsp;
              <Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                  extra="请参考下方热门航司."
                  style={{ marginBottom: 0 }}
                >
                  {getFieldDecorator('marketAirlineName', {
                  })(<Input />)}

                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      &nbsp;
              </span>
                  }>
                  {tagsFromServer.map(tag => (
                    <CheckableTag
                      key={tag}
                      checked={tag === selectAirNameTag}
                      onChange={checked => this.handleAirNameChange(tag, checked)}
                    >
                      {tag}
                    </CheckableTag>
                  ))}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      航班编号&nbsp;
              <Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('flightNo', {
                  })(<Input />)}

                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      机身&nbsp;
              <Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('aircraftSize', {
                  })(<Radio.Group>
                    <Radio value={'M'}>M</Radio>
                    <Radio value={'L'}>L</Radio>
                    <Radio value={'S'}>S</Radio>
                  </Radio.Group>)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      餐食&nbsp;
              <Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('mealType', {
                  })(<Radio.Group>
                    <Radio value={'SNACK'}>SNACK</Radio>
                    <Radio value={'NONE'}>NONE</Radio>
                    <Radio value={'MEAL'}>MEAL</Radio>
                  </Radio.Group>)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      准点率&nbsp;
              <Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('arrivalPunctuality', {
                  })(<InputNumber min={90} max={100} formatter={value => `${value}%`}
                    parser={value => value.replace('%', '')} />)}
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      成人票价&nbsp;
              <Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  <Row>
                    <Col span={6}>
                      {getFieldDecorator('minAdultPrice', {
                      })(<InputNumber min={0} max={100000} formatter={value => `￥ ${value}`}
                        parser={value => value.replace('￥ ', '')} />)}
                    </Col>
                    <Col span={6}>
                      {getFieldDecorator('maxAdultPrice', {
                      })(<InputNumber min={0} max={100000} formatter={value => `￥ ${value}`}
                        parser={value => value.replace('￥ ', '')} />)}
                    </Col>
                  </Row>
                </Form.Item>
              </Fragment>
            }
            <Form.Item {...tailFormItemLayout}>
              <a style={{ marginLeft: 8, fontSize: 12 }} onClick={() => this.setState({ expand: !expand })}>
                高级 <Icon type={expand ? 'up' : 'down'} />
              </a> <Button type="primary" htmlType="submit"> 搜索 </Button>
            </Form.Item>
          </Form>

          <Card>
            <Table
              rowKey={record => record.id}
              scroll={{ x: 1200, y: 300 }}
              columns={[
                {
                  title: '航司',
                  dataIndex: 'marketAirlineName',
                  fixed: 'left',
                  key: 'marketAirlineName'
                },
                {
                  title: '出发时间',
                  dataIndex: 'departureDateTime',
                  fixed: 'left',
                  key: 'departureDateTime',
                  defaultSortOrder: 'descend',
                  sorter: (a, b) => moment(a.departureDateTime).diff(moment(b.departureDateTime), 'minutes' )
                },
                {
                  title: '到达时间',
                  dataIndex: 'arrivalDateTime',
                  fixed: 'left',
                  key: 'arrivalDateTime',
                  sorter: (a, b) => moment(a.arrivalDateTime).diff(moment(b.arrivalDateTime), 'minutes' )
                },
                {
                  title: '成人票价',
                  dataIndex: 'minAdultPrice',
                  key: 'minAdultPrice',
                  sorter: (a, b) => a.minAdultPrice - b.minAdultPrice,
                  filters: [
                    {
                      text: '<400',
                      value: 400,
                    },
                    {
                      text: '<600',
                      value: 600,
                    },
                    {
                      text: '<1000',
                      value: 1000,
                    },
                    {
                      text: '<2000',
                      value: 2000,
                    },
                    {
                      text: '<3000',
                      value: 3000,
                    },
                  ],
                  onFilter: (value, record) => parseFloat(record.minAdultPrice) <= value,
                },
                {
                  title: '名称',
                  dataIndex: 'aircraftName',
                  key: 'aircraftName',
                },
                {
                  title: '餐食',
                  dataIndex: 'mealType',
                  key: 'mealType',
                  width: 200,
                  render: function (text, record) {
                    if (text === 'NONE') {
                      return <Tag color={'geekblue'} key={'geekblue'}> {text} </Tag>
                    } else if (text === "SNACK") {
                      return <Tag color={'green'} key={'green'}> {text} </Tag>
                    } else if (text === "MEAL") {
                      return <Tag color={'pink'} key={'pink'}> {text} </Tag>
                    }
                  }
                },
                {
                  title: '到达机场',
                  dataIndex: 'arrivalAirportName',
                  key: 'arrivalAirportName'
                },
                {
                  title: '出发机场',
                  dataIndex: 'departureAirportName',
                  key: 'departureAirportName'
                },

              ]} dataSource={datas} pagination={true} />
          </Card>
        </Card>
        <Card className={styles.tips}>
            <Row>
              <Col span={12}>天气不好，去坐火车？</Col>
              <Col span={6}><a href="#" onClick={this.goTrain}>是</a></Col>
            </Row>
        </Card>

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

      </div >
    )
  }
}

export default Form.create({ name: 'xx' })(Cesium_Flight)
