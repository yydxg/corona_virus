/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;

@connect(({ D_SEE, Login }) => ({
  D_SEE, Login
}))
class D_See extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart: null,
      selectValue: '',
      input1: '',
      input2: '',
      data: [],
    }
  }

  componentDidMount() {
    const { history } = this.props
    const login = this.props.Login;
    if (login && login.username !== '') {
      const myChart = echarts.init(this.chartsDiv);
      this.setState({
        myChart,
      })
    } else {
      history.push('/')
    }
  }


  createGraph = (myChart) => {
    const option = this.getOption()
    myChart.setOption(option);
  }

  getOption = () => {
    const { data } = this.state;
    console.log(data)
    const dataArr = []; const linkArr = [];
    let s_arr = []; //记录是否重复
    let link_arr = [];

    let colorList = ["#EEA9B8", "#EE82EE", "#D2691E", "#BF3EFF", "#B4CDCD", "#8E8E8E", "#87CEFA", "#698B69", "#20B2AA", "#9F79EE"]
    data.res && data.res.map((item, index) => {
      let { s, t } = item
      if (s_arr.indexOf(s.name) < 0) {
        dataArr.push({
          name: s.name,
          des: JSON.stringify(s),
          symbolSize: 50,
          itemStyle: {
            normal: {
              color: colorList[Math.ceil(Math.random() * 10)]
            }
          }
        })
        s_arr.push(s.name)
      }
      if (s_arr.indexOf(t.name) < 0) {
        dataArr.push({
          name: t.name,
          des: JSON.stringify(t),
          symbolSize: 50,
          itemStyle: {
            normal: {
              color: colorList[Math.ceil(Math.random() * 10)]
            }
          }
        })
        s_arr.push(t.name)
      }
      if (link_arr.indexOf(s.name + '->' + t.name) < 0) {
        linkArr.push({
          source: s.name,
          target: t.name,
          name: 'extends',
          lineStyle: {
            color: "blue"
          }
        })
        link_arr.push(s.name + '->' + t.name)
      }
    })

    return {
      title: { text: '查询结果' },
      tooltip: {
        formatter: function (x) {
          return x.data.des;
        }
      },
      legend: [{
        // selectedMode: 'single',
        // data: categories.map(function (a) {
        //     return a.name;
        // })
      }],
      series: [
        {
          type: 'graph', // 类型:关系图
          layout: 'force', //图的布局，类型为力导图
          symbolSize: 40, // 调整节点的大小
          roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [2, 10],
          edgeLabel: {
            normal: {
              textStyle: {
                fontSize: 20
              }
            }
          },
          force: {
            repulsion: 2500,
            edgeLength: [10, 50]
          },
          draggable: true,
          lineStyle: {
            normal: {
              width: 2,
              color: '#4b565b',
            }
          },
          edgeLabel: {
            normal: {
              show: false,
              formatter: function (x) {
                return x.data.name;
              }
            }
          },
          label: {
            normal: {
              show: true,
              textStyle: {}
            }
          },
          data: dataArr,
          links: linkArr,
        }
      ]
    };
  }

  doSearch = () => {
    const { input1, input2, selectValue, myChart } = this.state
    const { dispatch } = this.props

    dispatch({
      type: 'D_SEE/doAll',
    }).then(res => {
      const { success, data } = res
      if (success) {
        if (data) {
          this.setState({
            data,
          })

          myChart && this.createGraph(myChart)
        } else {
          Modal.info({
            content: "没有查询到结果！"
          })
        }
      }
    })

  }

  render() {

    return (
      <div style={{ paddingTop: 100 }}>
        <Card>
          <Row>
            <Col span={2} offset={0}>
              <Form layout={'inline'}>
                <Form.Item >
                  <Button type="primary" onClick={this.doSearch}>查询所有</Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>

          <hr />

          <div style={{ width: '100%' }}>
            <div id="main" style={{ width: '100%', height: '400px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>

        </Card>
      </div>
    )
  }
}

export default D_See