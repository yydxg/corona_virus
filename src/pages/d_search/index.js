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

@connect(({ D_SEARCH, Login }) => ({
  D_SEARCH, Login
}))
class D_Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart: null,
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

      myChart.on('click', params => {
        console.log(params)
        const { data } = this.state
        let temp = data;
        const { data: { name } } = params
        this.props.dispatch({
          type: 'D_SEARCH/doSearch2',
          payload: {
            name,
          }
        }).then(res => {

          const { success, data } = res
          if (success) {
            if (data.length > 0) {
              this.setState({
                data: temp.concat(data),
              })

              myChart && this.createGraph(myChart)
            } else {
              Modal.info({
                content: "没有查询到结果！"
              })
            }
          }
        })
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
    let n_arr = []; //记录是否重复
    let link_arr = [];
    data && data.map((item, index) => {
      let { s, t } = item
      if (n_arr.indexOf(s.name) < 0) {
        dataArr.push({
          name: s.name,
          des: JSON.stringify(s),
          symbolSize: 80,
          itemStyle: {
            normal: {
              color: '#B23AEE'
            }
          }
        })
        n_arr.push(s.name)
      }
      if (n_arr.indexOf(t.name) < 0) {
        dataArr.push({
          name: t.name,
          des: JSON.stringify(t),
          symbolSize: 40,
          itemStyle: {
            normal: {
              color: 'green'
            }
          }
        })
        n_arr.push(t.name)
      }
      if (link_arr.indexOf(s.name + '->' + t.name) < 0) {
        linkArr.push({
          source: s.name,
          target: t.name,
          // name: 'HAS',
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

  componentWillUnmount() {
  }

  handleChange1 = e => {
    this.setState({
      input1: e.target.value
    })
  }
  handleChange2 = e => {
    this.setState({
      input2: e.target.value
    })
  }

  doSearch = () => {
    const { input1, input2, myChart } = this.state
    const { dispatch } = this.props

    if (input1.trim() === "" || input2.trim() === '') {
      Modal.error({
        content: '请填完整表单进行查询！'
      })
      return;
    } else {
      dispatch({
        type: 'D_SEARCH/doSearch',
        payload: {
          sName: input1,
          tName: input2,
        }
      }).then(res => {
        const { success, data } = res
        if (success) {
          if (data.length > 0) {
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
  }

  render() {

    return (
      <div style={{ paddingTop: 100 }}>
        <Card>
          <Row>
            <Col span={18} offset={6}>
              <Form layout={'inline'}>
                <Form.Item>
                  <Input placeholder="please input" onChange={this.handleChange1} />
                </Form.Item>
                <Form.Item>

                  <Icon type="arrow-left" /> <Icon type="arrow-right" />
                </Form.Item>
                <Form.Item>
                  <Input placeholder="please input" onChange={this.handleChange2} />
                </Form.Item>
                <Form.Item >
                  <Button type="primary" onClick={this.doSearch}>确定</Button>
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

export default D_Search