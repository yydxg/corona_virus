/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel, Upload, message
} from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;

@connect(({ B_Import }) => ({
  B_Import
}))
class B_import extends Component {
  constructor(props) {
    super(props)
    this.state = {
      myChart: null,
      txtValue: '',
      inputValue: '',
      data: [],
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }


  sqlChange = e => {
    this.setState({
      inputValue: e.target.value
    })
  }

  excute = () => {
    const { inputValue } = this.state
    console.log(inputValue)
    const { dispatch } = this.props
    dispatch({
      type: 'B_Import/doExcute',
      payload: {
        inputValue: [inputValue]
      }
    }).then(res => {
      const { success } = res
      if (success) {
        Modal.info({
          content: "执行成功！"
        })

      } else {
        Modal.error({
          content: "执行失败！"
        })
      }
    })

  }

  jsReadFiles = (files) => {
    var file = document.getElementById("file").files[0];
    // var file = files[0];
    console.log(file.type)
    var that = this;
    var reader = new FileReader();//new一个FileReader实例
    if (/text+/.test(file.type)) {//判断文件类型，是不是text类型
      reader.onload = function () {
        console.log(this.result)
        that.setState({
          txtValue: this.result
        })
      }
      reader.readAsText(file, 'utf-8');
    } else if (/image+/.test(file.type)) {//判断文件是不是imgage类型
      reader.onload = function () {
        console.log(this.result)
        that.setState({
          txtValue: this.result
        })
      }
      reader.readAsDataURL(file);
    } else {
      Modal.error({
        content: '请选择txt文本文件'
      })
      return
    }
  }

  render() {

    return (
      <div style={{ paddingTop: 100 }}>
        <Row>
          <Col span={11}>
            <Card>
              <input type="file" id="file" onChange={this.jsReadFiles.bind(this)} />

              <Input.TextArea
                value={this.state.txtValue}
                autoSize={{ minRows: 20, maxRows: 25 }}
              ></Input.TextArea>
            </Card>
          </Col>
          <Col span={11} offset={2}>
            <Card>
              <Input.TextArea
                value={this.state.inputValue}
                autoSize={{ minRows: 20, maxRows: 25 }}
                onChange={this.sqlChange}
              ></Input.TextArea>
              <Button type="primary" onClick={this.excute}>执行</Button>
            </Card>
          </Col>
        </Row>

      </div>
    )
  }
}

export default B_import