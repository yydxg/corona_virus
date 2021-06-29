/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';

@connect(({ User,Login }) => ({
  User,Login
}))

class User extends Component {

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

  delete = (id) => {
    const {dispatch} = this.props
    Modal.confirm({
      title:'删除当前数据吗？',
      onCancel:()=>{},
      onOk:()=>{
        console.log(id)
        dispatch({
          type:'User/deleteUser',
          payload:{
            id:id
          }
        }).then((re)=>{
          if(re.success){
            dispatch({type: 'User/getAllUser'})
          }
        })
      }
    })
  }

  render() {
    const { users } = this.props.User
    const { role } = this.props.Login
    return (
      <div className={styles.user}>

        <Card>
          <Table
          rowKey = {record =>record.id} 
          columns={[
            {
              title: '用户名',
              dataIndex: 'username',
              key: 'username',
            },
            {
              title: '班级',
              dataIndex: 'className',
              key: 'className',
            },
            {
              title: '专业',
              dataIndex: 'major',
              key: 'major',
            },
            {
              title: '操作',
              key: 'action',
              render: (text, record) => (
                <span>
                  {role === 'TEACHER'?<a style={{ marginRight: 16 }} onClick={()=>this.delete(record.id)}>删除</a>:''}
                </span>
              ),
            },
          ]} dataSource={users} 
         
          />
        </Card>

      </div>
    )
  }
}

export default User
