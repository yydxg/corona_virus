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

/* const data = [
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
]; */


@connect(({ FUWU }) => ({
  FUWU
}))

class Fuwu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
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
    const { dispatch } = this.props
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { words } = values
        dispatch({
          type: 'FUWU/jiebaSearch',
          payload: {
            words,
          }
        }).then(res => {
          const {success , data} = res
          let tableData = []
          if(success){
            data.map((d,idx)=>{
              tableData.push({
                key:idx,
                name:d.n.name
                ,url:d.n.url,
              })
            })
            this.setState({
              data:tableData
            })
          }
        })
      }
    });
  };

  myInfo = (name) =>{
    this.props.history.push({pathname:"/a_fuwuchaxun/info",query: { name : name }});  
  }

  render() {
    const {data} = this.state
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 20 },
    };
    const buttonItemLayout = {
      wrapperCol: { span: 2, offset: 4 },
    };
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
            <a onClick={() => this.myInfo(record.name)}>查看</a>
            <Divider type="vertical" />
          </span>
        ),
      },
    ];
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
                  <Button type="primary" htmlType="submit">查询</Button>
                </Form.Item>
              </Form>
              </Col>
            </Row>
          <hr />
          <Table columns={columns} dataSource={data} />
        </Card>
      </div>

    )
  }
}

export default Fuwu = Form.create({ name: 'register' })(Fuwu);