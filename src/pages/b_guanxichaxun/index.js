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

@connect(({ GUANXI }) => ({
  GUANXI
}))
class Guanxichaxun extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart:null,
      selectValue:'',
      input1:'',
      input2:'',
      data:[],
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
    data && data.map((item, index) => {
      let { n, m } = item
      if (n_arr.indexOf("n:" + n.name) < 0) {
        dataArr.push({
          name: "n:" + n.name,
          des: 'sss',
          symbolSize: 100,
          itemStyle: {
            normal: {
              color: '#B23AEE'
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
              color: 'green'
            }
          }
        })
        m_arr.push("m:" + m.name)
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

  handleChange1 = e =>{
    this.setState({
      input1:e.target.value
    })
  }
  handleChange2 = e =>{
    this.setState({
      input2:e.target.value
    })
  }
  handleSelectChange = value =>{
    this.setState({
      selectValue:value
    })
  }
  doSearch = () =>{
    const { input1,input2, selectValue,myChart} = this.state
    const {dispatch} = this.props

    if(input1.trim()===""||selectValue.trim()===''||input2.trim()===''){
      Modal.error({
        content:'请填完整表单进行查询！'
      })
      return;
    }else{
      dispatch({
        type:'GUANXI/doSearch',
        payload:{
          input1,
          input2,
          selectValue,
        }
      }).then(res=>{
        const { success,data } =res
        if(success){
          if(data.length>0){
            this.setState({
              data,
            })

            myChart && this.createGraph(myChart)
          }else{
            Modal.info({
              content:"没有查询到结果！"
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
              <Select
                size={"default"}
                onChange={this.handleSelectChange}
                style={{width:130}}
              >
                <Option value="station-service">站点-has->服务</Option>
                <Option value="service-layer">服务-has->图层</Option>
                <Option value="user-service">用户-like->服务</Option>
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
            <div id="main" style={{ width: '100%', height: '400px' }} ref={(chartsDiv) => { this.chartsDiv = chartsDiv }} />
          </div>

        </Card>
      </div>
    )
  }
}

export default Guanxichaxun