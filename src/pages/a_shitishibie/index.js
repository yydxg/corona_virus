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

const columns = [
  {
    title: '服务名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '服务地址',
    dataIndex: 'url',
    key: 'url',
  },
  {
    title: '操作',
    key: 'action',
    render: (text, record) => (
      <span>
        <a>查看</a>
        <Divider type="vertical" />
      </span>
    ),
  },
];

const data = [
  {
    key: '1',
    name: 'World_Hillshade_Dark',
    url: 'http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer',
  },
  {
    key: '2',
    name: 'World_Hillshade_Dark',
    url: 'http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer',
  },
  {
    key: '3',
    name: 'World_Hillshade_Dark',
    url: 'http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer',
  },
  {
    key: '4',
    name: 'World_Hillshade_Dark',
    url: 'http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer',
  },
  {
    key: '5',
    name: 'World_Hillshade_Dark',
    url: 'http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer',
  },
  {
    key: '6',
    name: 'World_Hillshade_Dark',
    url: 'http://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade_Dark/MapServer',
  },
];

@connect(({ SHITI }) => ({
  SHITI
}))

class ShiTi extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      mydicts:["地图服务",
      "中国境界线",
      "中国城市",
      "中国省会城市",
      "中国主要公路",
      "中国主要铁路",
      "中国地级市",
      "中国县级城市",
      "中国主要湖泊",
      "中国主要河流",
      "中国一级面状河流",
      "北京市省道",
      "北京市市区道路",
      "北京市地铁",
      "北京市人行道",
      "北京市高速公路",
      "北京市铁路",
      "北京市国道",
      "北京市交通站点",
      "北京市酒店",
      "北京市湖泊",
      "北京市绿地",
      "北京市景点",
      "北京市公共厕所",
      "北京市收费站",
      "北京市公园",
      "北京市河流",
      "北京市港口",
      "北京市乡镇",
      "北京市医疗机构",
      "北京市村庄"],
      fenchiHtml:'',
      shibieHtml:'',
    }
  }

  componentWillUnmount() {
  }

  componentDidMount() {
    // this.props.dispatch({
    //   type:'SHITI/init',
    // })

  }

  createGraph = (myChart) => {
    const option = this.getOption()
    myChart.setOption(option);
  }

  getOption = () => {
    const { data } = this.props.FUWU;
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
          data: dataArr,

          links: linkArr,

        }
      ]
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    const {mydicts} = this.state;
    const { dispatch } = this.props
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values)
        const { words } = values
        dispatch({
          type: 'SHITI/jieba',
          payload: {
            words,
          }
        }).then(res => {
          console.log(res)
          const {success , data:{words,chixing}} = res
          if(success){
            let fenchiHtml = "";
            let shibieHtml = "";
            words.map((w,idx)=>{
              fenchiHtml += w;
              fenchiHtml += "<span style='color:#bbb'>["+chixing[idx]+"]</span>";
              if(mydicts.indexOf(w)!==-1){
                shibieHtml += '<a>'+w+'</a>';
              }else{
                shibieHtml += w;
              }
            })
            console.log(shibieHtml)
            this.setState({
              fenchiHtml,
              shibieHtml,
            })
          }
        })
      }
    });
  };
  render() {
    
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
            <Row>
              <Col span={12} offset={4}>
              <Form layout="inline" onSubmit={this.handleSubmit}>
                <Form.Item label="请输入一段话">
                  {getFieldDecorator('words', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your words!',
                      },
                    ],
                  })(<Input style={{width:400}}/>)}

                </Form.Item>
                <Form.Item {...buttonItemLayout}>
                  <Button type="primary" htmlType="submit">分词</Button>
                </Form.Item>
              </Form>
              </Col>
            </Row>
        </Card>
        <Card style={{marginTop:10}} title="实体识别" headStyle={{margin:"0 200px 0 200px"}}> 
            <Row>
              <Col span={12} offset={4}>
                <div dangerouslySetInnerHTML={{__html: this.state.shibieHtml}} />
              </Col>
            </Row>
        </Card>
        <Card style={{marginTop:10}} title="中文分词" headStyle={{margin:"0 200px 0 200px"}}> 
            <Row>
              <Col span={12} offset={4}>
                <div dangerouslySetInnerHTML={{__html: this.state.fenchiHtml}} />
              </Col>
            </Row>
        </Card>
      </div>

    )
  }
}

export default ShiTi = Form.create({ name: 'register' })(ShiTi);