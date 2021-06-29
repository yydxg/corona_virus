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

@connect(({ B_SEE }) => ({
  B_SEE
}))
class B_See extends Component {
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
    console.log(data)
    const dataArr = []; const linkArr = [];
    let c_arr = [], v_arr = [],f_arr=[],o_arr=[]; //记录是否重复
    let link_arr = [];
    data.res1 && data.res1.map((item, index) => {
      let { c, v,f,o} = item
      if (c_arr.indexOf("c:" + c.name) < 0) {
        dataArr.push({
          name: "c:" + c.name,
          des: JSON.stringify(c),
          symbolSize: 80,
          itemStyle: {
            normal: {
              color: '#B23AEE'
            }
          }
        })
        c_arr.push("c:" + c.name)
      }
      if (v_arr.indexOf("v:" + v.name) < 0) {
        dataArr.push({
          name: "v:" + v.name,
          des: JSON.stringify(v),
          symbolSize: 40,
          itemStyle: {
            normal: {
              color: 'green'
            }
          }
        })
        v_arr.push("v:" + v.name)
      }
      if (f_arr.indexOf("f:" + f.name) < 0) {
        dataArr.push({
          name: "f:" + f.name,
          des: JSON.stringify(f),
          symbolSize: 50,
          itemStyle: {
            normal: {
              color: 'red'
            }
          }
        })
        f_arr.push("f:" + f.name)
      }
      if (o_arr.indexOf("o:" + o.name) < 0) {
        dataArr.push({
          name: "o:" + o.name,
          des: JSON.stringify(o),
          symbolSize: 50,
          itemStyle: {
            normal: {
              color: 'blue'
            }
          }
        })
        o_arr.push("o:" + o.name)
      }
      if (link_arr.indexOf('c:' + c.name + '->' + 'v:' + v.name) < 0) {
        linkArr.push({
          source: 'c:' + c.name,
          target: 'v:' + v.name,
          name: 'HAS',
        })
        link_arr.push('c:' + c.name + '->' + 'v:' + v.name)
      }
      if (link_arr.indexOf('c:' + c.name + '->' + 'f:' + f.name) < 0) {
        linkArr.push({
          source: 'c:' + c.name,
          target: 'f:' + f.name,
          name: 'HAS',
        })
        link_arr.push('c:' + c.name + '->' + 'f:' + f.name)
      }
      if (link_arr.indexOf('c:' + c.name + '->' + 'o:' + o.name) < 0) {
        linkArr.push({
          source: 'c:' + c.name,
          target: 'o:' + o.name,
          name: 'HAS',
        })
        link_arr.push('c:' + c.name + '->' + 'o:' + o.name)
      }
    })

    data.res2 && data.res2.map((item, index) => {
      let { s,t } = item
      if (link_arr.indexOf('c:' + s.name + '->' + 'c:' + t.name) < 0) {
        linkArr.push({
          source: 'c:' + s.name,
          target: 'c:' + t.name,
          name: 'EXTENDS',
          lineStyle:{
            color : "blue"
          }
        })
        link_arr.push('c:' + s.name + '->' + 'c:' + t.name)
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
          type: 'graph',
          layout: 'force',
          symbolSize: 40,
          // roat: true,
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
            repulsion: 100,
            // repulsios: 50,
            edgeLength: 300
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

    
      dispatch({
        type:'B_SEE/doAll',
      }).then(res=>{
        const { success,data } =res
        if(success){
          if(data){
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

export default B_See