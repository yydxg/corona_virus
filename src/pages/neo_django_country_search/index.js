/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel, message, Statistic
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';
import Column from 'antd/lib/table/Column';

// var ecConfig = require('echarts/config');
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

@connect(({ Country }) => ({
  Country
}))
class Neo_D_Country_Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      showChart: true,
      myChart: null,
      input1: '',
      input2: '',
      selectValue: 'all',
      statistic: { //统计信息
        tiaoshu: '未知',
        qianru: '未知',
        qianchu: '未知'
      },
      showNodeInfo: false,//点击节点信息
      nodeInfo: null,//保存节点的信息
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
        const myChart = echarts.init(this.chartsDiv);
        setTimeout(() => {
          myChart && this.createGraph(myChart)
          //  图表添加点击事件
          myChart.on('click', (params) => {
            if (params.dataType === 'node') {  // 点击节点
              // 点击节点，改变节点名称，节点名称不能相同
              console.log(params)
              const { data: nodeInfo } = params
              this.setState({
                showNodeInfo: true,
                nodeInfo,
              })
            } else if (params.dataType === 'edge') {   // 点击连接线
              //不作处理
              this.setState({
                showNodeInfo: false
              })
            }
          })

          this.setState({
            myChart,
          })
        }, 1000)
      } else {
        message.error("服务器错误！")
      }

    })
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
          return insertEnter(desc, 80)
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

  handleSelectChange = value => {
    this.setState({
      selectValue: value
    })
  }

  doSearch = () => {
    const { input1, input2, selectValue, myChart } = this.state
    if (input1.trim() === "" || selectValue.trim() === '' ) {
      Modal.error({
        content: '请至少填写第一个查询条件！'
      })
      return;
    } else {
      this.props.dispatch({
        type: 'Country/commonSearch',
        payload: {
          from: input1,
          to: input2.trim(),
          r: selectValue,
        }
      }).then(res => {
        const { success, data } = res
        console.log(data)
        if (success) {
          if (data.length > 0) {
            this.setState({
              data,
              statistic: { //统计信息
                tiaoshu: data.length,
                qianru: input1,
                qianchu: input2
              }
            })
          } else {
            this.setState({
              data: [], //重置为空，即没有数据
              statistic: { //统计信息
                tiaoshu: '未知',
                qianru: '未知',
                qianchu: '未知'
              }
            })
            Modal.info({
              content: "没有查询到结果！"
            })
          }
          myChart && this.createGraph(myChart)
        }
      })
    }
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
      } else {
        message.error("服务器错误！")
      }

    })
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
  handleSelectChange = value => {
    this.setState({
      selectValue: value
    })
  }

  render() {
    const { showChart, statistic, showNodeInfo, nodeInfo } = this.state
    const { tiaoshu, qianru, qianchu } = statistic
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 20 },
    };
    const buttonItemLayout = {
      wrapperCol: { span: 2, offset: 4 },
    };
    return (
      <div className={styles.root}>
        <Card>
          <Row type="flex" justify="center" align="middle">
            <Col span={18} offset={6}>
              <Form layout={'inline'}>
                <Form.Item>
                  <Input placeholder="please input" onChange={this.handleChange1} />
                </Form.Item>
                <Form.Item>
                  <Select
                    size={"default"}
                    onChange={this.handleSelectChange}
                    style={{ width: 130 }}
                    defaultValue="all"
                  >
                    <Option value="all">All</Option>
                    <Option value="Emigrants">Emigrants</Option>
                    <Option value="Immigrants">Immigrants</Option>
                  </Select>
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
            <div id="main" style={{ width: '100%', height: '550px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>
        </Card>
        <Card className={styles.result} bodyStyle={{padding:10}}>
          <Row style={{marginBottom:10}}>
            <Col>
              <Tag color="cyan">查询结果</Tag>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="条数"
                  value={tiaoshu}
                  valueStyle={{fontSize:10}}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="迁入国"
                  value={qianru}
                  valueStyle={{fontSize:10}}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="迁出国"
                  value={qianchu}
                  valueStyle={{fontSize:10}}
                />
              </Card>
            </Col>
          </Row>
          {
            showNodeInfo &&
            <>
                <Tag style={{marginTop:5}} color="purple">国家：{nodeInfo.des["Note"]}</Tag>
                <Row style={{marginTop:5}}><Col span={4}>年份</Col><Col span={10}>GDP</Col><Col span={6}>Pop</Col></Row>
              {
                [...(new Array(16)).keys()].map(item => {
                  return <Row className={styles.tRow} key={item}><Col span={4}>{item+2000}</Col><Col span={10}>{nodeInfo.des["GDP"+(item+2000)]}</Col><Col span={6}>{nodeInfo.des["Pop"+(item+2000)]}</Col></Row>
                })
              }
            </>
          }
        </Card>
        {
            showNodeInfo &&
            <Card className={styles.profile} bodyStyle={{padding:10}}>
              <p>{nodeInfo.des["Profile"]}</p>
            </Card>
        }

      </div>

    )
  }
}

export default Neo_D_Country_Search = Form.create({ name: 'register' })(Neo_D_Country_Search);