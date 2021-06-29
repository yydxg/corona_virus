/* global mars3d Cesium coordtransform$*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
   Input, Icon, Radio, Collapse, Slider,Carousel } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import Item from 'antd/lib/list/Item';
import { connect } from 'dva';
import { router } from 'umi';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;

@connect(({ xxx }) => ({
  xxx
}))

class Demo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div>

      </div>
    )
  }
}

export default Demo