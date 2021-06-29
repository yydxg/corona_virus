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




@connect(({ SHITI }) => ({
  SHITI
}))

class ShiTi extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart: null,
      data:[],
    }
  }

  componentWillUnmount() {
  }

  componentDidMount() {
    // this.props.dispatch({
    //   type:'SHITI/init',
    // })
    const myChart = echarts.init(this.chartsDiv);
    this.setState({
      myChart,
    })
  }

  createGraph = (myChart) => {
    const option = this.getOption()
    myChart.setOption(option);
  }

  getOption = () => {
    const { data } = this.props.SHITI;
    const dataArr = []; const linkArr = [];
    let n_arr = [], m_arr = [], l_arr = []; //记录是否重复
    let link_arr = [];
    console.log(data)
    data && data.map((item, index) => {
      let { n, m, l } = item
      if (n_arr.indexOf("n:" + n.name) < 0) {
        dataArr.push({
          name: "n:" + n.name,
          des: 'sss',
          symbolSize: 100,
          itemStyle: {
            normal: {
              color: 'red'
            }
          }
        })
        n_arr.push("n:" + n.name)
      }
      if (m_arr.indexOf("m:" + m.name) < 0) {
        dataArr.push({
          name: "m:" + m.name,
          des: 'sss',
          symbolSize: 80,
          itemStyle: {
            normal: {
              color: ':rgb(255,0,255)'
            }
          }
        })
        m_arr.push("m:" + m.name)
      }
      if (l_arr.indexOf("l:" + l.name) < 0) {
        dataArr.push({
          name: "l:" + l.name,
          des: 'sss',
          symbolSize: 50,
          itemStyle: {
            normal: {
              color: 'blue'
            }
          }
        })
        l_arr.push("l:" + l.name)
      }
      if (link_arr.indexOf('n:' + n.name + '->' + 'm:' + m.name) < 0) {
        linkArr.push({
          source: 'n:' + n.name,
          target: 'm:' + m.name,
          name: 'HAS',
          des: '站点->服务',
        })
        link_arr.push('n:' + n.name + '->' + 'm:' + m.name)
      }
      if (link_arr.indexOf('m:' + m.name + '->' + 'l:' + l.name) < 0) {
        linkArr.push({
          source: 'm:' + m.name,
          target: 'l:' + l.name,
          name: 'HAS',
          des: '服务->图层',
          lineStyle: {
            normal: {
              type: 'dotted'
            }
          }
        })
        link_arr.push('m:' + m.name + '->' + 'l:' + l.name)
      }
    })

    return {
      title: { text: '地理信息服务图谱' },
      tooltip: {
        formatter: function (x) {
          return x.data.des;
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
          itemStyle: {
            normal: {
              color: '#4b565b'
            }
          },
          lineStyle: {
            normal: {
              width: 2,
              color: '#4b565b'

            }
          },
          edgeLabel: {
            normal: {
              show: true,
              formatter: function (x) {
                return x.data.name;
              }
            }
          },
          label: {
            normal: {
              show: true,
              textStyle: {
              }
            }
          },
          data: dataArr,/*  [
                  {
                      name: '高育良',
                      des: 'sss',
                      symbolSize: 100,
                      itemStyle: {
                          normal: {
                              color: 'red'
                          }
                      }
                  }, {
                      name: '蔡成功',
                      des: '汉东省公安厅厅长',
                      symbolSize: 80,
                      itemStyle: {
                        normal: {
                            color: '#000'
                        }
                    }
                  }, {
                      name: '高良',
                      des: 'ssssssssssss\npppp:ppppppppp',
                      symbolSize: 50,
                      itemStyle: {
                          normal: {
                              color: 'blue'
                          }
                      }
                  },
              ], */
          links: linkArr,/*  [
                  {
                      source: '高育良',
                      target: '蔡成功',
                      name: 'HAS',
                      des: '站点->服务',
                  }, {
                    source: '蔡成功',
                    target: '高良',
                    name: "HAS",
                    des: '服务->图层',
                    lineStyle: {
                        normal: {
                            type: 'dotted',
                            color: '#000'
                        }
                    }
                }] */
        }
      ]
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {serviceHost} = values
        this.props.dispatch({
          type:'SHITI/fetchChart',
          payload:{
            name:"lish",
            serviceHost,
          }
        },res=>{
          console.log(res)
        })
      }
    });
  };
  render() {
    const { myChart } = this.state

    myChart && this.createGraph(myChart)
    const { getFieldDecorator } = this.props.form;
    const formItemLayout ={
          labelCol: { span: 4 },
          wrapperCol: { span: 14 },
        };
    const buttonItemLayout = {
          wrapperCol: { span: 14, offset: 4 },
        };
    return (
      <div className={styles.root}>
        <Card style={{height:'100%'}}>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <Form.Item label="服务地址">
              {getFieldDecorator('serviceHost', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your service root url!',
                  },
                ],
              })(<Input />)}

            </Form.Item>
            <Form.Item {...buttonItemLayout}>
              <Button type="primary" htmlType="submit">提交</Button>
            </Form.Item>
          </Form>
          <hr></hr>
          <div style={{ width: '100%' }}>
            <div id="main" style={{ width: '100%', height: '500px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>
        </Card>
      </div>

    )
  }
}

export default ShiTi = Form.create({ name: 'register' })(ShiTi);