/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select,DatePicker,
   Table, Tag, Card, Form, Input, Icon, Radio,Breadcrumb, InputNumber  } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;


@connect(({ Rabbit, F_Login }) => ({
  Rabbit, F_Login
}))

class Panel extends Component {

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
      type: 'Rabbit/getAll',
      callback: res => {
        console.log(res);
      }
    })

  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除数据 ?',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Rabbit/delete',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({
              type: 'Rabbit/getAll',
            })
          }
        })
      }
    })
  }

  findByStationNum = () => {
    const { role, name } = this.state
    const { dispatch } = this.props
    console.log(name, role)

    dispatch({
      type: 'Rabbit/findByStationNum',
      payload: {
        stationNum: name === '' ? 'ALL' : name,
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
          type: 'Rabbit/update',
          payload: {
            data: { ...values, module: 'users' }
          }
        }).then(r => {
          console.log(r);
          r.success && dispatch({
            type: 'Rabbit/getAllByModule',
            payload: {
              data: 'users'
            }
          })

          form.resetFields();
          this.setState({ visible: false });
        })
      } { //新增模式
        dispatch({
          type: 'Rabbit/save',
          payload: {
            data: { ...values}
          }
        }).then(r => {
          console.log(r);
          r.success && dispatch({
            type: 'Rabbit/getAll',
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
    const { datas } = this.props.Rabbit;
    const { form } = this.formRef.props;
    // history.push("./movie/comments?name=" + name)
    this.setState({ visible: true, operateType: 'update' });
    let da = datas.find(d => d.id == vid)
    console.log(da)
    const { id, stationNum, gps, color, stayTime, stationIp, angle } = da
    form.setFieldsValue({
      id, stationNum, gps, color, stayTime, stationIp, angle
    })

  }

  onNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }
  render() {
    const { datas } = this.props.Rabbit
    const { operateType } = this.state
    return (
      <div className={styles.Rabbit} style={{ paddingTop: 10 }}>
        <Row style={{marginBottom:10}}>
          <Col offset={2} span={2}>
            <Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button>
          </Col>
          <Col offset={4} span={16}>
            <Form layout={"inline"}>
              <Form.Item label="站点编号" style={{ height: 20 }}>
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="站点编号"
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
                <Button type="primary" onClick={this.findByStationNum}><Icon type="search" />搜索</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>


        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '站点编号',
                dataIndex: 'stationNum',
                key: 'stationNum',
              },
              {
                title: '位置GPS',
                dataIndex: 'gps',
                key: 'gps',
              },
              {
                title: '颜色',
                dataIndex: 'color',
                key: 'color',
              },
              {
                title: '保留时间',
                dataIndex: 'stayTime',
                key: 'stayTime',
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
                title: '站点IP',
                dataIndex: 'stationIp',
                key: 'stationIp',
              },
              {
                title: '角度差',
                dataIndex: 'angle',
                key: 'angle',
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
        labelCol: { span: 8 },
        wrapperCol: { span: 14 },
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
            <Form.Item label="站点编号" {...formItemLayout}>
              {getFieldDecorator('stationNum', {
                rules: [{ required: true, message: 'please enter 账号 !' }],
              })(<Input />)} {/* <Input disabled={operateType === 'add'?false:true}/> */}
            </Form.Item>
            <Form.Item label="位置GPS" {...formItemLayout}>
              {getFieldDecorator('gps', {
                rules: [{ required: true, message: 'please enter 位置GPS !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="颜色" {...formItemLayout}>
              {getFieldDecorator('color', {
                rules: [{ required: true, message: 'please enter 颜色 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="保留时间" {...formItemLayout}>
              {getFieldDecorator('stayTime', {
                rules: [{ required: true, message: 'please enter 保留时间 !' }],
              })(<DatePicker />)}
            </Form.Item>
            <Form.Item label="站点IP" {...formItemLayout}>
              {getFieldDecorator('stationIp', {
                rules: [{ required: true, message: 'please enter 站点IP !' }],
              })(<Input.TextArea />)}
            </Form.Item>
            <Form.Item label="与地理正北的角度差" {...formItemLayout} >
              {getFieldDecorator('angle',{
                rules: [{ required: true, message: 'please enter 与地理正北的角度差 !' }],
              })(<InputNumber />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(Panel))


/**
 * 账号：v1
 * 姓名：v2
 * 性别：v3
 * 电话：v4
 * 角色：v5，养殖厂长，养殖主管，养殖人员
 * 住址：v6
 * 密码：v7
 */
