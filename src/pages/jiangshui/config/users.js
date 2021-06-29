/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio,Breadcrumb  } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';


@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))

class Users extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      role: 'ALL',
      name: '',
      operateType: 'add',
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;
    dispatch({
      type: 'Fish/getAllByModule',
      payload: {
        data: 'users'
      },
      callback: res => {
        console.log(res);
      }
    })
    if(login && login.username !==''){
      
    }else{
      history.push('/fish/user/login')
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
        }).then((re) => {
          if (re.success) {
            dispatch({
              type: 'Fish/getAllByModule',
              payload: {
                data: 'users'
              }
            })
          }
        })
      }
    })
  }

  findByRole = () => {
    const { role, name } = this.state
    const { dispatch } = this.props
    console.log(name, role)

    dispatch({
      type: 'Fish/findByV2AndV5',
      payload: {//v2:姓名。v5:角色
        module:'users',
        v2: name === '' ? 'ALL' : name,
        v5: role,
      }
    })


  }

  handleChange = (value) => {
    console.log(`selected ${value}`);
    this.setState({
      role: value
    })
  }


  showAddModal = () => {
    this.formRef.props.form.resetFields();
    this.setState({ visible: true, operateType: 'add' });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
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
          console.log(r);
          r.success && dispatch({
            type: 'Fish/getAllByModule',
            payload: {
              data: 'users'
            }
          })

          form.resetFields();
          this.setState({ visible: false });
        })
      } else{ //新增模式
        dispatch({
          type: 'Fish/save',
          payload: {
            data: { ...values, module: 'users', v7: !values.v7 ? '123456' : values.v7 }
          }
        }).then(r => {
          console.log(r);
          r.success && dispatch({
            type: 'Fish/getAllByModule',
            payload: {
              data: 'users'
            }
          })

          form.resetFields();
          this.setState({ visible: false });
        })
      }

    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  showUpdateModal = (vid) => {
    const { history } = this.props;
    const { datas } = this.props.Fish;
    const { form } = this.formRef.props;
    // history.push("./movie/comments?name=" + name)
    this.setState({ visible: true, operateType: 'update' });
    let da = datas.find(d => d.id == vid)
    console.log(da)
    const { id, v1, v2, v3, v4, v5, v6, v7 } = da
    form.setFieldsValue({
      id, v1, v2, v3, v4, v5, v6, v7
    })

  }

  onNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }
  render() {
    const { datas } = this.props.Fish
    const { operateType } = this.state
    return (
      <div className={styles.Fish} style={{ paddingTop: 100 }}>
        <Row style={{marginBottom:10}}>
          <Col offset={2} span={10}>
            <Breadcrumb>
              <Breadcrumb.Item><Icon type="home" />位置：</Breadcrumb.Item>
              <Breadcrumb.Item>
                <a href="#">系统设置模块</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                用户管理
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row style={{marginBottom:10}}>
          <Col offset={2} span={2}>
            <Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button>
          </Col>
          <Col offset={8} span={12}>
            <Form layout={"inline"}>
              <Form.Item label="姓名" style={{ height: 20 }}>
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="姓名"
                  onChange={this.onNameChange}
                />,
              </Form.Item>
              {/* <Form.Item label="角色">
                <Select defaultValue="All" style={{ width: 120 }} onChange={this.handleChange}>
                  <Select.Option value="ALL">All</Select.Option>
                  <Select.Option value="养殖厂长">养殖厂长</Select.Option>
                  <Select.Option value="养殖主管">养殖主管</Select.Option>
                  <Select.Option value="养殖人员">养殖人员</Select.Option>
                </Select>
              </Form.Item> */}
              <Form.Item>
                <Button type="primary" onClick={this.findByRole}><Icon type="search" />搜索</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>


        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '账号',
                dataIndex: 'v1',
                key: 'v1',
              },
              {
                title: '姓名',
                dataIndex: 'v2',
                key: 'v2',
              },
              {
                title: '性别',
                dataIndex: 'v3',
                key: 'v3',
              },
              {
                title: '电话',
                dataIndex: 'v4',
                key: 'v4',
              },
              // {
              //   title: '角色',
              //   dataIndex: 'v5',
              //   key: 'v5',
              //   render: function (text, record) {
              //     //角色：v5，养殖厂长，养殖主管，养殖人员
              //     if (text === "养殖厂长") {
              //       return <Tag color={'geekblue'} key={'养殖厂长'}> 养殖厂长 </Tag>
              //     } else if (text === "养殖主管") {
              //       return <Tag color={'red'} key={'养殖主管'}> 养殖主管 </Tag>
              //     } else if (text === "养殖人员") {
              //       return <Tag color={'pink'} key={'养殖人员'}> 养殖人员 </Tag>
              //     }
              //   }
              // },
              {
                title: '住址',
                dataIndex: 'v6',
                key: 'v6',
                ellipsis: true,
              },
              {
                title: '操作',
                key: 'action',
                width: 200,
                render: (text, record) => {
                  if(record.v1 !=='Admin'){
                    return <span>
                    <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                    <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)} >修改</Button>
                    {/* <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.describe(record.name)} >修改</Button> */}
                  </span>
                  }else{
                    return <Button icon="stop" disabled>禁止操作</Button>
                  }
                },
              },
            ]} dataSource={datas} pagination={{ pageSize: 5 }} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          operateType={operateType}
        />
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addMovie' })(
  // eslint-disable-next-line
  class extends React.Component {

    render() {
      const { visible, onCancel, onCreate, form, operateType } = this.props;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
      };
      return (
        <Modal
          visible={visible}
          title={operateType === 'add' ? '添加' : '修改'}
          okText={operateType === 'add' ? '添加' : '修改'}
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="horizontal">
            <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('id')(<Input />)}
            </Form.Item>
            <Form.Item label="账号" {...formItemLayout}>
              {getFieldDecorator('v1', {
                rules: [{ required: true, message: 'please enter 账号 !' }],
              })(<Input disabled={operateType === 'add'?false:true}/>)}
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
                <Radio.Group>
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
            <Form.Item label="密码" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('v7')(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(Users))


/**
 * 账号：v1
 * 姓名：v2
 * 性别：v3
 * 电话：v4
 * 角色：v5，养殖厂长，养殖主管，养殖人员
 * 住址：v6
 * 密码：v7
 */
