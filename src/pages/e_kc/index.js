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

@connect(({ E_kc }) => ({
  E_kc
}))
class E_kc extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart:null,
      selectValue:'ONE', 
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
    const {selectValue} = this.state
    let option;
    switch(selectValue){
      case "ONE":
        option = this.getOneOption()
        break;
      case "JAVAWEB":
        option = this.getJAVAWEBOption()
        break
    }
    
    myChart.setOption(option);
  }

  getOneOption = () => {
    const { data } = this.state;
    console.log(data)
    const dataArr = []; const linkArr = [];
    let c_arr = [],t_arr=[],p_arr=[]; //记录是否重复
    let link_arr = [];
    data && data.map((item, index) => {
      let { s, t,p} = item
      if (c_arr.indexOf("s:"+s.name) < 0) {
        dataArr.push({
          name: "s:"+s.name,
          des: JSON.stringify(s),
          symbolSize: 100,
          itemStyle: {
            normal: {
              color: '#FF3E96'
            }
          }
        })
        c_arr.push("s:"+s.name)
      }
      if (t_arr.indexOf("t:"+t.name) < 0) {
        dataArr.push({
          name: "t:"+t.name,
          des: JSON.stringify(t),
          symbolSize: 80,
          itemStyle: {
            normal: {
              color: '#836FFF'
            }
          }
        })
        t_arr.push("t:"+t.name)
      }
      if (p_arr.indexOf("p:"+p.name) < 0) {
        dataArr.push({
          name: "p:"+p.name,
          des: JSON.stringify(p),
          symbolSize: 60,
          itemStyle: {
            normal: {
              color: '#458B74'
            }
          }
        })
        p_arr.push("p:"+p.name)
      }
      if (link_arr.indexOf("s:"+s.name + '->' + "t:"+t.name) < 0) {
        linkArr.push({
          source: "s:"+s.name,
          target: "t:"+t.name,
          label:{
            show:false
          }
        })
        link_arr.push("s:"+s.name + '->' + "t:"+ t.name)
      }
      if (link_arr.indexOf("t:"+ t.name + '->' + "p:"+ p.name) < 0) {
        linkArr.push({
          source: "t:"+ t.name,
          target: "p:"+ p.name,
          label:{
            show:false
          }
        })
        link_arr.push("t:"+ t.name + '->' + "p:"+ p.name)
      }
    })

    return {
      title: { text: '课程1图谱结果' },
      // 提示框的配置
      tooltip: {
        formatter: function (x) {
          return x.data.des;
        }
      },
      // 工具箱
      toolbox: {
        // 显示工具箱
        show: true,
        feature: {
          mark: {
            show: true
          },
          // 还原
          restore: {
            show: true
          },
          // 保存为图片
          saveAsImage: {
            show: true
          }
        }
      },
      series: [{
        type: 'graph', // 类型:关系图
        layout: 'force', //图的布局，类型为力导图
        symbolSize: 40, // 调整节点的大小
        roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
        edgeSymbol: ['circle', 'circle'],
        edgeSymbolSize: [2, 2],
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
            show: true,
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
        // 数据["类","对象","函数","变量","权限"];
        data: dataArr,
        links: linkArr,
      }]
    };
  }

  componentWillUnmount() {
  }

  handleSelectChange = value =>{
    this.setState({
      selectValue:value
    })
  }

  doSearch = () =>{
    const {selectValue,myChart} = this.state
    const {dispatch} = this.props

    if(selectValue === ''){
      Modal.info({
        content:"请选择课程！"
      })
      return;
    }
      dispatch({
        type:'E_kc/doSearch',
        payload:{
          selectValue
        }
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
            <Col span={12} offset={0}>
            <Form layout={'inline'}>
            <Form.Item>
              <Select
                size={"default"}
                onChange={this.handleSelectChange}
                placeholder={"选择课程"}
                style={{width:130}}
              >
                <Option value="ONE">课程1</Option>
                <Option value="TWO">课程2</Option>
                <Option value="THREE">课程3</Option>
              </Select>
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

export default E_kc