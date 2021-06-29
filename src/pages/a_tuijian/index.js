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


@connect(({ FUWU }) => ({
  FUWU
}))

class Fuwu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      currentUser:'张三',//当前默认用户
    }
  }

  componentWillUnmount() {
  }

  componentDidMount() {
  }

  doTuijian = ()=>{
    const {dispatch} = this.props
    const {currentUser} = this.state
    dispatch({
      type:'TUI/tuijian',
      payload:{
        u_name:currentUser
      }
    }).then(res=>{
      const {success,data:{allRate,uLike}} = res
      console.log(allRate,uLike)
      if(success){
        let tableDate = []
        allRate.map((s,idx)=>{
          let xx = uLike.filter(u=>u.s.name === s.s.name)
          console.log(xx)
          if(xx.length===0){
            tableDate.push({
              key:idx,
              name:s.s.name,
              url:s.s.url,
              rate:s.sum
            })
          }
        })
        this.setState({
          data:tableDate
        })
      }else{
        Message.info("推荐失败！")
      }
    })
  }

  handleUserChange = value =>{
    console.log(value)
    this.setState({
      currentUser:value
    })
  }

  myInfo = (name) =>{
    this.props.history.push({pathname:"/a_fuwuchaxun/info",query: { name : name }});  
  }
  
  render() {
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
        title: '推荐指数（加和）',
        dataIndex: 'rate',
        key: 'rate',
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
            <Col span={4} offset={16} style={{ cursor: 'point' }}>
              切换用户：<Select defaultValue="张三" style={{ width: 120 }} onChange={this.handleUserChange}>
                <Option value="张三">张三</Option>
                <Option value="李四">李四</Option>
                <Option value="王五">王五</Option>
                <Option value="赵六">赵六</Option>
                <Option value="毛七">毛七</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={this.doTuijian}>确定</Button>
            </Col>
          </Row>
          <hr />
          <Table columns={columns} dataSource={this.state.data} />
        </Card>
      </div>

    )
  }
}

export default Fuwu = Form.create({ name: 'register' })(Fuwu);