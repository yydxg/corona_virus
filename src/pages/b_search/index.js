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

@connect(({ B_SEARCH }) => ({
  B_SEARCH
}))
class B_Search extends Component {
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
    let n_arr = [], m_arr = []; //记录是否重复
    let link_arr = [];
    data && data.map((item, index) => {
      let { s, t } = item
      if (n_arr.indexOf("s:" + s.name) < 0) {
        dataArr.push({
          name: "s:" + s.name,
          des: JSON.stringify(s),
          symbolSize: 80,
          itemStyle: {
            normal: {
              color: '#B23AEE'
            }
          }
        })
        n_arr.push("s:" + s.name)
      }
      if (m_arr.indexOf("t:" + t.name) < 0) {
        dataArr.push({
          name: "t:" + t.name,
          des: JSON.stringify(t),
          symbolSize: 40,
          itemStyle: {
            normal: {
              color: 'green'
            }
          }
        })
        m_arr.push("t:" + t.name)
      }
      if (link_arr.indexOf('s:' + s.name + '->' + 't:' + t.name) < 0) {
        linkArr.push({
          source: 's:' + s.name,
          target: 't:' + t.name,
          // name: 'HAS',
        })
        link_arr.push('s:' + s.name + '->' + 't:' + t.name)
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
          symbolSize: 40,
          roat: true,
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
            repulsios: 25,
            edgeLength: 200
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
        type:'B_SEARCH/doSearch',
        payload:{
          sName:input1,
          tName:input2,
          flag:selectValue,
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
                style={{width:150}}
              >
                <Option value="c-has-o">类-has->对象</Option>
                <Option value="c-has-v">类-has->变量</Option>
                <Option value="c-has-f">类-has->函数</Option>
                <Option value="c-extends-c">类-extends->类</Option>
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

export default B_Search