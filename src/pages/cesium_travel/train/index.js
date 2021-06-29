/* global mars3d Cesium*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Card, Radio, Steps, message, Tabs,
  Form, Input, Icon, Cascader, DatePicker, Tag, InputNumber, Table, Statistic,
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';

import {
  G2,
  Chart,
  Tooltip as Tooltip1,
  Interval,
  Line, Point,
} from "bizcharts";

const { CheckableTag } = Tag;
const { Step } = Steps;
const { Option, OptGroup } = Select;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const { TabPane } = Tabs;
const CheckboxGroup = Checkbox.Group;

const plainOptions = ['G/C高铁', 'D动车', 'K/Z/T普通'];
const defaultCheckedList = ['G/C高铁', 'D动车', 'K/Z/T普通'];

const cities = ["北京", "长沙", "厦门", "石家庄", "上海", "昆明", "广州", "济南", "重庆",
  "西安", "青岛", "武汉", "成都", "杭州", "郑州", "天津", "沈阳", "深圳", "南京", "合肥"]

const startImg = require('../img/start.png')
const citiesLngLat = require('../data/shizhudi.json')
const zhanji = require('../data/zhanji.glb')
let flightEntity = null;
const days = ['2021/2/16', '2021/2/17', '2021/2/18', '2021/2/19', '2021/2/20', '2021/2/21', '2021/2/22']

@connect(({ Cesium_Travel, F_Login }) => ({
  Cesium_Travel, F_Login
}))

class Cesium_Train extends Component {

  constructor(props) {
    super(props)
    this.state = {
      expand: false,
      viewer: null,
      navDataSource: new Cesium.CustomDataSource("nav"),
      datas: [],//表格数据


      startCity: '起点',
      arriveCity: '终点',
      date: '2021/2/16',
      count: 0,
      checkedList: defaultCheckedList,
      chartPriceData: [],//价格
      chartTimeData:[],//运行时长
    }
  }

  componentDidMount() {
    const login = this.props.F_Login;

    if (login && login.username !== '') {

    } else {
      history.push('/fish/user/login')
    }

    this.start()

  }

  start = () => {

    this.props.form.setFieldsValue({
      trainDate: moment('2021/2/16')
    })
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
      const { fromStationName, toStationName, trainDate } = values
      console.log(trainDate)
      dispatch({
        type: 'Cesium_Travel/findTrains',
        payload: {
          data: { ...values, trainDate: trainDate.format('YYYY/M/D') }
        }
      }).then(r => {
        console.log(r)
        const { success, data } = r
        if (!success || !data) return;
        if (data.length === 0) {
          message.info('当前条件下无数据。')
        }
        const { trains, trainNos } = data
        let result = []
        for (let i = 0; i < trainNos.length; i++) {
          let selectArr = trains.filter(t => t.fullTrainCode === trainNos[i])
          result.push(selectArr)
        }
        console.log(result)
        let pp = result.reduce(function (a, b) { return a.concat(b) })
        let mm = pp.map(p=>({...p,runtime2:parseFloat(p.runTime)}))
        this.setState({
          datas: result,
          chartPriceData: pp,
          chartTimeData: mm,
          startCity: fromStationName,
          arriveCity: toStationName,
          date: trainDate.format('YYYY/M/D'),
          count: trainNos.length,
        })
      })
    });
  };

  callback = (key) => {
    console.log(key);
    const { startCity, arriveCity } = this.state
    this.props.dispatch({
      type: 'Cesium_Travel/findTrains',
      payload: {
        data: { fromStationName: startCity, toStationName: arriveCity, trainDate: key }
      }
    }).then(r => {
      console.log(r)
      const { success, data } = r
      if (!success || !data) return;
      if (data.length === 0) {
        message.info('当前条件下无数据。')
      }
      const { trains, trainNos } = data
      let result = []
      for (let i = 0; i < trainNos.length; i++) {
        let selectArr = trains.filter(t => t.fullTrainCode === trainNos[i])
        result.push(selectArr)
      }
      console.log(result)
      this.setState({
        datas: result,
        count: trainNos.length,
      })
    })
  }

  onChangeCX = checkedList => {
    this.setState({
      checkedList,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { viewer, expand, datas, checkedList,
      selectAirNameTag } = this.state
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

    return (
      <div style={{ width: '100%', height: 'calc(100% - 80px)', left: 0, top: 80, bottom: 0, right: 0, position: 'absolute', padding: '0 100px' }} >
        <Card className={styles.baseMap}>
          <Form layout="inline" onSubmit={this.handleSearch}>
            <Form.Item label={
              <span>
                出发&nbsp;
                  <Tooltip title="请输入出发城市！">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
            >
              {getFieldDecorator('fromStationName', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your fromStationName!',
                  },
                ],
              })(<Select
                style={{ width: 150 }}
                placeholder="departure city"
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
            </Form.Item>
            <Form.Item label={
              <span>
                到达&nbsp;
                  <Tooltip title="请输入到达城市！">
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }>
              {getFieldDecorator('toStationName', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your toStationName!',
                  },
                ],
              })(<Select
                style={{ width: 150 }}
                placeholder="arrival city"
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
              {getFieldDecorator('trainDate', {
                rules: [{ required: true, message: 'Please input your date!' }],
              })(<DatePicker format={'YYYY/M/D'} />)}
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit"> 搜索 </Button>
            </Form.Item>
          </Form>
          <Form>
            <Form.Item
              style={{ marginLeft: 68 }}
              extra={`热门：${cities.join(' ')}`}
            >
            </Form.Item>
          </Form>

          <Row className={styles.statistic}>
            <Col span={2}>
              <Statistic title="出发" value={this.state.startCity} />
            </Col>
            <Col span={2}>
              <Statistic title="到达" value={this.state.arriveCity} />
            </Col>
            <Col span={6} className={styles.staticLastChild}>
              <Statistic title="单程" value={`${this.state.date} (共${this.state.count}车次)`} />
            </Col>
          </Row>

          <Tabs defaultActiveKey="1" tabPosition={'top'} style={{}} size={'large'} tabBarGutter={130} onChange={this.callback}>
            {days.map(i => (
              <TabPane tab={`${i}`} key={i}>
                <Row className={styles.filter}>
                  <Col span={4}>车型：</Col>
                  <Col span={6}>
                    <CheckboxGroup
                      options={plainOptions}
                      value={this.state.checkedList}
                      onChange={this.onChangeCX}
                    />
                  </Col>
                </Row>
                <Row className={styles.train_head}>
                  <Col span={4}>车次信息</Col>
                  <Col span={4}>出发站/时间</Col>
                  <Col span={4}>运行时长</Col>
                  <Col span={4}>到达站/时间</Col>
                  <Col span={6}>坐席/参考价/余票</Col>
                  <Col span={2}></Col>
                </Row>
                {
                  datas &&
                  datas.map((d, idx) => {
                    let code = d[0].fullTrainCode[0];
                    if (checkedList.join().indexOf(code) != -1) {
                      return (
                        <>
                          <Row className={styles.train_item} key={idx}>
                            <Col span={4} className={styles.trainNo}><strong>{d[0].fullTrainCode}</strong></Col>
                            <Col span={4}>
                              <div className={styles.stationName}><strong>{d[0].fromStationName}</strong></div>
                              <div><Tag color="green">过</Tag>{d[0].startTime}</div>
                            </Col>
                            <Col span={4}>
                              <div className={styles.runTime}>{d[0].runTime.split(':')[0]}小时{d[0].runTime.split(':')[1]}分钟</div>
                              <div className={styles.line}></div>
                            </Col>
                            <Col span={4}>
                              <div className={styles.stationName}><strong>{d[0].toStationName}</strong></div>
                              <div><Tag color="green">过</Tag>{d[0].arriveTime}</div>
                            </Col>
                            <Col span={8}>
                              {
                                d.map((p, i) => {
                                  return <Row key={i} className={styles.others}>
                                    <Col span={6}>{p.seatTypeName}</Col>
                                    <Col span={6} className={styles.price}><small>¥</small><b>{p.seatMinPrice}</b></Col>
                                    <Col span={6}>余{p.seatYupiao}张</Col>
                                    <Col span={6}>{p.seatYupiao != 0 ? <Button type='primary' size='small'>预定</Button> : <Button type='danger' size='small'>抢票</Button>}</Col>
                                  </Row>
                                })
                              }
                            </Col>
                          </Row>
                        </>
                      )
                    }
                  })
                }
              </TabPane>
            ))}
          </Tabs>
        </Card>

        <Card>
          <Chart height={400} padding="auto" data={this.state.chartPriceData} autoFit>
            <Interval
              adjust={[
                {
                  type: 'dodge',
                  marginRatio: 0,
                },
              ]}
              color="seatTypeName"
              position="fullTrainCode*seatMinPrice"
            />
            <Tooltip1 shared />
          </Chart>
        </Card>

        <Card>
          <Chart scale={{ value: { min: 0 } }} padding={[10, 20, 50, 40]} autoFit height={600} data={this.state.chartTimeData} >
            <Line
              shape="smooth"
              position="fullTrainCode*runtime2"
              color="l (270) 0:rgba(255, 146, 255, 1) .5:rgba(100, 268, 255, 1) 1:rgba(215, 0, 255, 1)"
            />
          </Chart>
        </Card>

        {/* <div className={styles.cesiumContainer} id="cesiumContainer">
          <div className={styles.toolbar}>
            <div className={styles.bar} onClick={this.zoomIn}>
              <span className="icon iconfont icon-zoomin"></span>
            </div>
            <div className={styles.bar} onClick={this.zoomOut}>
              <span className="icon iconfont icon-zoomout"></span>
            </div>
          </div>
        </div> */}

      </div >
    )
  }
}

export default Form.create({ name: 'xx' })(Cesium_Train)
