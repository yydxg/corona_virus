/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input,Tree } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';

const { TreeNode, DirectoryTree } = Tree;

@connect(({Login }) => ({
  Login
}))

class Relationshipdb extends Component {

  constructor(props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount() {
    let { dispatch,history } = this.props;
    const login = this.props.Login;
    if(login && login.username !==''){
      dispatch({
        type: 'User/getAllUser',
        callback: res => {
          console.log(res);
        }
      })  
    }else{
      history.push('/')
    }
  }

  onSelect = (keys, event) => {
    let { dispatch,history } = this.props;
    console.log('Trigger Select', keys, event);
    history.push(`/relationshipdb/${keys[0]}`)
  };

  onExpand = () => {
    console.log('Trigger Expand');
  };

  render() {

    return (
      <div className={styles.db}>

        <Card>
          <DirectoryTree multiple defaultExpandAll onSelect={this.onSelect} onExpand={this.onExpand}>
          <TreeNode title="数据库一" key="0-0">
            <TreeNode title="表1" key="0-0-0" disabled={true} isLeaf />
            <TreeNode title="表2" key="0-0-1" disabled={true} isLeaf />
          </TreeNode>
          <TreeNode title="数据库二" key="0-1">
            <TreeNode title="学生表" key="student" isLeaf />
            <TreeNode title="矿井表" key="Kuang" isLeaf />
          </TreeNode>
        </DirectoryTree>
        </Card>

      </div>
    )
  }
}

export default Relationshipdb
