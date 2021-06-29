/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel, message
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

// var ecConfig = require('echarts/config');
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

@connect(({ Country }) => ({
  Country
}))

class Neo_D_Country extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      tableData: [],
      showChart: true,
      myChart: null,
    }
  }

  componentWillUnmount() {
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'Country/initAll',
      payload: {
        num: 10
      }
    }).then(response => {
      const { data, success } = response
      if (success) {
        this.setState({
          data,
        })
        this.initTable(data).then(() => {
          const myChart = echarts.init(this.chartsDiv);
          setTimeout(() => {
            myChart && this.createGraph(myChart)
            this.setState({
              myChart,
            })
          }, 1000)
        })
      } else {
        message.error("服务器错误！")
      }

    })
  }

  initTable = (data) => {
    let myData = [];//重新构造data
    myData = data.map((item, i) => {
      const { from, r, to } = item
      return {
        rowKey: i,
        from: JSON.stringify(from),
        r: JSON.stringify(r),
        to: JSON.stringify(to)
      }
    })
    this.setState({
      tableData: myData
    })
    return Promise.resolve()
  }

  createGraph = (myChart) => {
    const option = this.getOption()
    myChart.setOption(option);
  }

  getOption = () => {
    const { data } = this.state;
    console.log(data)
    const dataArr = []; const linkArr = [];
    let from_arr = [], to_arr = []; //记录是否重复
    let link_arr = [];
    data && data.map((item, index) => {
      let { from, to, r } = item
      if (from_arr.indexOf('f:' + from.Note) < 0) {
        dataArr.push({
          name: "f:" + from.Note,
          des: from,
          symbolSize: 100,
          itemStyle: {
            normal: {
              color: 'skyblue'
            }
          }
        })
        from_arr.push('f:' + from.Note)
      }
      if (to_arr.indexOf('t:' + to.Note) < 0) {
        dataArr.push({
          name: 't:' + to.Note,
          des: to,
          symbolSize: 80,
          itemStyle: {
            normal: {
              color: 'pink'
            }
          }
        })
        to_arr.push('t:' + to.Note)
      }
      if (link_arr.indexOf('f:' + from.Note + '->' + 't:' + to.Note) < 0) {
        linkArr.push({
          source: 'f:' + from.Note,
          target: 't:' + to.Note,
          name: r.type,
          des: r,
          lineStyle: {
            normal: {
              width: 2,
              color: '#4b565b'
            }
          }
        })
        link_arr.push('f:' + from.Note + '->' + 't:' + to.Note)
      }
    })
    console.log(dataArr, linkArr)
    return {
      title: { text: '国际移民知识图谱系统' },
      tooltip: {
        formatter: function (x) {
          let desc = JSON.stringify(x.data.des);
          function insertEnter(str, n) {
            var len = str.length;
            var strTemp = '';
            if (len > n) {
              strTemp = str.substring(0, n);
              str = str.substring(n, len);
              return strTemp + '<br />' + insertEnter(str, n);
            } else {
              return str;
            }
          }
          return insertEnter(desc,30)
        }
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          symbolSize: 80,
          roam: true,
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            normal: {
              show: true,
              textStyle: {
                fontSize: 8
              },
              formatter: function (x) {
                return x.data.name;
              }
            }
          },
          force: {
            repulsion: 2500,
            edgeLength: [10, 50]
          },
          draggable: true,
          label: {
            normal: {
              show: true,
              textStyle: {
              },
              formatter: function (x) {
                return x.data.name.split(":")[1];
              }
            }
          },
          data: dataArr,

          links: linkArr,

        }
      ]
    };
  }

  myInfo = (name) => {
    this.props.history.push({ pathname: "/a_fuwuchaxun/info", query: { name: name } });
  }

  handleChange = (value) => {
    console.log(`selected ${value}`);
    this.props.dispatch({
      type: 'Country/initAll',
      payload: {
        num: value
      }
    }).then(response => {
      const { data, success } = response
      if (success) {
        this.setState({
          data,
        })
        this.initTable(data).then(() => {
          const myChart = echarts.init(this.chartsDiv);
          setTimeout(() => {
            myChart && this.createGraph(myChart)
            this.setState({
              myChart,
            })
          }, 1000)
        })
      } else {
        message.error("服务器错误！")
      }

    })
  }

  render() {
    const { tableData, showChart } = this.state
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 20 },
    };
    const buttonItemLayout = {
      wrapperCol: { span: 2, offset: 4 },
    };
    const columns = [
      {
        title: '国家（始）',
        dataIndex: 'from',
        key: 'from',
        width: '600'
      },
      {
        title: '移民关系',
        dataIndex: 'r',
        key: 'r',
        width: '200'
      },
      {
        title: '国家（终）',
        dataIndex: 'to',
        key: 'to',
        width: '600'
      },
    ];
    return (
      <div className={styles.root}>
        <Card>
          <Row type="flex" justify="center" align="middle">
            <Col span={2}>
              查询条数:
            </Col>
            <Col span={4}>
              <Select defaultValue="10" style={{ width: 120 }} onChange={this.handleChange}>
                <Option value="10">10条</Option>
                <Option value="30">30条</Option>
                <Option value="50">50条</Option>
                <Option value="100">100条</Option>
                <Option value="200">200条</Option>
                <Option value="500">500条</Option>
              </Select>
            </Col>
          </Row>
          <hr />
          <div style={{ width: '100%' }}>
            <div id="main" style={{ width: '100%', height: '600px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>
          <Table rowKey='rowKey' columns={columns} dataSource={tableData} />
        </Card>
      </div>

    )
  }
}

export default Neo_D_Country = Form.create({ name: 'register' })(Neo_D_Country);