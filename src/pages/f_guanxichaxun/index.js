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

@connect(({ FGUANXI }) => ({
  FGUANXI
}))
class f_Guanxichaxun extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart: null,
      selectValue: '',
      input1: '',
      input2: '',
      data: [],
      topic: 'Co总',
    }
  }

  componentDidMount() {
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
    const { data } = this.state;
    const dataArr = []; const linkArr = [];
    let n_arr = [], m_arr = []; //记录是否重复
    let link_arr = [];
    let colors = ['#f7acbc', '#deab8a', '#817936', '#f47920', '#f05b72', '#4d4f36',
      '#f58220', '#7fb80e', '#78a355', '#367459', '#cd9a5b', '#dea32c', '#375830', '#c37e00', '#00a6ac', '#afdfe4', '#145b7d', '#ae5039', '#f36c21'
      , '#6e6b41', '#2468a2']
    let color1 = colors[parseInt(Math.random() * colors.length)]
    let color2 = colors[parseInt(Math.random() * colors.length)]
    data && data.map((item, index) => {
      let { n, m } = item
      if (n_arr.indexOf(n.name) < 0) {
        dataArr.push({
          name: n.name,
          des: n.info,
          symbolSize: 100,
          itemStyle: {
            normal: {
              color: color1
            }
          }
        })
        n_arr.push(n.name)
      }
      if (m_arr.indexOf(m.name) < 0) {
        dataArr.push({
          name: m.name,
          des: m.info,
          symbolSize: 80,
          itemStyle: {
            normal: {
              color: color2
            }
          }
        })
        m_arr.push(m.name)
      }
      if (link_arr.indexOf(n.name + '->' + m.name) < 0) {
        linkArr.push({
          source: n.name,
          target: m.name,
          name: 'HAS',
          des: '站点->服务',
        })
        link_arr.push(n.name + '->' + m.name)
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
              // color: '#4b565b'
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
  handleSelectChange = value => {
    this.setState({
      selectValue: value
    })
  }
  handleSelectTopicChange = value => {
    this.setState({
      topic: value
    })
  }
  doSearch = () => {
    const { input1, input2, selectValue, myChart } = this.state
    const { dispatch } = this.props

    //input1.trim()===""||selectValue.trim()===''||input2.trim()===''
    if (selectValue.trim() === '') {
      Modal.error({
        content: '请填完整表单进行查询！'
      })
      return;
    } else {
      dispatch({
        type: 'FGUANXI/doSearch',
        payload: {
          input1,
          input2,
          selectValue,
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
    const { topic } = this.state
    return (
      <div style={{ paddingTop: 80 }}>
        <Card>
          <Row>
            <Col span={22} offset={2}>

              <Form layout={'inline'}>
                <Form.Item>
                  请选择类型
                </Form.Item>
                <Form.Item>
                  <Select
                    size={"default"}
                    onChange={this.handleSelectTopicChange}
                    style={{ width: 200 }}
                  >
                    <Option value="Co总">Co总</Option>
                    <Option value="催化剂材料----生产数据">催化剂材料----生产数据</Option>
                    <Option value="钙钛矿太阳能电池">钙钛矿太阳能电池</Option>
                    <Option value="固体氧化物燃料电池材料模板">固体氧化物燃料电池材料模板</Option>
                    <Option value="铝合金数据模板">铝合金数据模板</Option>
                    <Option value="镁合金数据">镁合金数据</Option>
                    <Option value="专利成果">专利成果</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Input placeholder="please input" onChange={this.handleChange1} />
                </Form.Item>
                <Form.Item>
                  {
                    topic === 'Co总' &&
                    <>
                      <Select
                        size={"default"}
                        onChange={this.handleSelectChange}
                        style={{ width: 300 }}
                      >
                        <Option value="topic-meta">topic-meta</Option>
                        <Option value="meta-content">meta-content</Option>
                        <Option value="content-合金成分及热处理制度">content-合金成分及热处理制度</Option>
                        <Option value="content-性能1">content-性能1</Option>
                        <Option value="content-性能2">content-性能2</Option>
                      </Select>
                    </>
                  }
                  {
                    topic === '催化剂材料----生产数据' &&
                    <>
                      <Select
                        size={"default"}
                        onChange={this.handleSelectChange}
                        style={{ width: 300 }}
                      >
                        <Option value="xxx">xxx</Option>
                        <Option value="xxx">xxx</Option>
                      </Select>
                    </>
                  }
                  {
                    topic === '钙钛矿太阳能电池' &&
                    <>
                      <Select
                        size={"default"}
                        onChange={this.handleSelectChange}
                        style={{ width: 300 }}
                      >
                        <Option value="xxx">xxx</Option>
                        <Option value="xxx">xxx</Option>
                      </Select>

                    </>
                  }
                  {
                    topic === '固体氧化物燃料电池材料模板' &&
                    <>
                      <Select
                        size={"default"}
                        onChange={this.handleSelectChange}
                        style={{ width: 300 }}
                      >
                        <Option value="xxx">xxx</Option>
                        <Option value="xxx">xxx</Option>
                      </Select>

                    </>
                  }
                  {
                    topic === '铝合金数据模板' &&
                    <>
                      <Select
                        size={"default"}
                        onChange={this.handleSelectChange}
                        style={{ width: 300 }}
                      >
                        <Option value="xxx">xxx</Option>
                        <Option value="xxx">xxx</Option>
                      </Select>
                    </>
                  }
                  {
                    topic === '镁合金数据' &&
                    <>
                      <Select
                        size={"default"}
                        onChange={this.handleSelectChange}
                        style={{ width: 300 }}
                      >
                        <Option value="xxx">xxx</Option>
                        <Option value="xxx">xxx</Option>
                      </Select>
                    </>
                  }
                  {
                    topic === '专利成果' &&
                    <>
                      <Select
                        size={"default"}
                        onChange={this.handleSelectChange}
                        style={{ width: 300 }}
                      >
                        <Option value="xxx">xxx</Option>
                        <Option value="xxx">xxx</Option>
                      </Select>
                    </>
                  }

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
            <div id="main" style={{ width: '100%', height: '500px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>

        </Card>
      </div>
    )
  }
}

export default f_Guanxichaxun