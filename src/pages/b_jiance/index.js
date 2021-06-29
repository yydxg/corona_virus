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

@connect(({ B_JIANCE }) => ({
  B_JIANCE
}))
class B_Jiance extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectValue:'',
      data1:[],
      data2:[],
    }
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
  }

  handleSelectChange = value =>{
    this.setState({
      selectValue:value
    })
  }

  doSearch = () =>{
    const {selectValue} = this.state
    const {dispatch} = this.props

    if(selectValue.trim()===''){
      Modal.error({
        content:'请选择检测类型！'
      })
      return;
    }else{
      dispatch({
        type:'B_JIANCE/doCheck',
        payload:{
          type:selectValue,
        }
      }).then(res=>{
        const { success,data } =res
        if(success){
          console.log(data)
          let tableData = [];
          switch(selectValue){
            case "1":
              data.map((d,idx)=>{
                tableData.push({
                  key:idx,
                  cname:d.s.name,
                  oname:d.t.name,
                  num:d.t.showNum
                })
              })
              console.log(tableData)
              this.setState({
                data1:tableData,
              })
              break;
            case "2":
              data.map((d,idx)=>{
                tableData.push({
                  key:idx,
                  oname:d.s.name,
                  fun:d.s.fun,
                  qx:d.t.qx,
                })
              })
              this.setState({
                data2:tableData,
              })
              break;
            case "3":
              break;
          }
        }
      })
    }
  }
  setClassName = (record, index) => {
    // return ( index%2 === 0 ? styles.red : '')
    return styles.red
  }
  render() {
    const { selectValue,data1,data2 } = this.state
    console.log(data1);
    const columns1 = [
      {
        title: '类',
        dataIndex: 'cname',
        key: 'cname',
      },
      {
        title: '类中实例化的对象',
        dataIndex: 'oname',
        key: 'oname',
      },{
        title: '对象出现次数',
        dataIndex: 'num',
        key: 'num',
      }
    ];
    const columns2 = [
      {
        title: '对象名',
        dataIndex: 'oname',
        key: 'oname',
      },
      {
        title: '调用函数',
        dataIndex: 'fun',
        key: 'fun',
      },
      {
        title: '访问权限',
        dataIndex: 'qx',
        key: 'qx',
      }
    ];
    
    return (
      <div style={{ paddingTop: 100 }}>
        <Card>
          <Row>
            <Col span={18} offset={6}>
            <Form layout={'inline'}>
            <Form.Item>
              <Col span={24}>
                代码监测规则：
              </Col>
            </Form.Item>
            <Form.Item>
              <Select
                size={"default"}
                onChange={this.handleSelectChange}
                style={{width:500}}
              >
                <Option value="1">实例化了对象没有使用</Option>
                <Option value="2">访问权限问题</Option>
                {/* <Option value="3">类继承问题</Option> */}
              </Select>
            </Form.Item>

            <Form.Item >
              <Button type="primary" onClick={this.doSearch}>确定</Button>
            </Form.Item>
          </Form>
            </Col>
          </Row>

          <hr />
          <Table columns={selectValue==1?columns1:columns2} dataSource={selectValue==1?data1:data2} rowClassName={this.setClassName}/>
        </Card>
      </div>
    )
  }
}

export default B_Jiance