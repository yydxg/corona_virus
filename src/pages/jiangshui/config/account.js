/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal,Breadcrumb,
   Select, Table, Tag, Card, Form, Input, Icon, Radio, message } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';


@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))
class Account extends Component {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount() {
    const login = this.props.F_Login;
    console.log(login)
    const { form } = this.props;
    const { id, v1, v2, v3, v4, v5, v6, v7 } = login.tempdata
    if(login && login.username !==''){
      form.setFieldsValue({
        id, v1, v2, v3, v4, v5, v6, v7
      })
    }else{
      this.props.history.push('/fish/user/login')
    }

  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除数据 ?',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Fish/delete',
          payload: {
            id
          }
        })
      }
    })
  }

  handleSubmit = () => {
    const { dispatch,form } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      const { id } = values;
      if (values && values.id) { //编辑模式
        dispatch({
          type: 'Fish/update',
          payload: {
            data: { ...values, module: 'users' }
          }
        }).then(r => {
          //更新F_Login.tempdata
          console.log(r);
          dispatch({
            type:'F_Login/updateTempdata',
            payload:{
              data:values
            }
          })
          message.success('修改成功！')          
        })
      }

    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    return (
      <div className={styles.account} style={{ paddingTop: 100 }}>
        <Row style={{marginBottom:20}}>
          <Col offset={2} span={10}>
            <Breadcrumb>
              <Breadcrumb.Item><Icon type="home" />位置：</Breadcrumb.Item>
              <Breadcrumb.Item>
                <a href="#">系统设置模块</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                用户设置
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Form layout="horizontal">
          <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
            {getFieldDecorator('id')(<Input />)}
          </Form.Item>
          <Form.Item label="账号" {...formItemLayout}>
            {getFieldDecorator('v1', {
              rules: [{ required: true, message: 'please enter 账号 !' }],
            })(<Input disabled/>)}
          </Form.Item>
          <Form.Item label="姓名" {...formItemLayout}>
            {getFieldDecorator('v2', {
              rules: [{ required: true, message: 'please enter 姓名 !' }],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="性别" {...formItemLayout}>
            {getFieldDecorator('v3', {
              initialValue: '男',
            })(
              <Radio.Group>
                <Radio.Button value="男">男</Radio.Button>
                <Radio.Button value="女">女</Radio.Button>
              </Radio.Group>,
            )}
          </Form.Item>
          <Form.Item label="电话" {...formItemLayout}>
            {getFieldDecorator('v4', {
              rules: [{ required: true, message: 'please enter 电话 !' }],
            })(<Input />)}
          </Form.Item>
          {/* <Form.Item label="角色" {...formItemLayout}>
            {getFieldDecorator('v5', {
              initialValue: '养殖人员',
            })(
              <Radio.Group disabled>
                <Radio value="养殖厂长">养殖厂长</Radio>
                <Radio value="养殖主管">养殖主管</Radio>
                <Radio value="养殖人员">养殖人员</Radio>
              </Radio.Group>,
            )}
          </Form.Item> */}
          <Form.Item label="住址" {...formItemLayout}>
            {getFieldDecorator('v6', {
              rules: [{ required: true, message: 'please enter 住址 !' }],
            })(<Input.TextArea />)}
          </Form.Item>
          <Form.Item label="密码" {...formItemLayout} >
            {getFieldDecorator('v7',{
              rules: [{ required: true, message: 'please enter password !' }],
            })(<Input type='password' />)}
          </Form.Item>
          <Form.Item wrapperCol={{ span: 12, offset: 4 }}>
            <Button type="primary" onClick={this.handleSubmit}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

export default connect()(Form.create()(Account))


/**
 * 账号：v1
 * 姓名：v2
 * 性别：v3
 * 电话：v4
 * 角色：v5，养殖厂长，养殖主管，养殖人员
 * 住址：v6
 * 密码：v7
 */
