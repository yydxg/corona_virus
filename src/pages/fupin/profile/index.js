import React, { Component, Fragment } from 'react';
import { Redirect, router } from 'umi';
import { getCookie, setCookie } from '@/utils/cookie'
import styles from './style.less';
import MuduleTitle from '@/component/moduleTitle';
import { connect } from 'dva';
import {
  Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form,
  Input, Icon, Radio, Collapse, Slider, Carousel, Message, Avatar
} from 'antd'

const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

@connect(({ Pro,Login2 }) => ({
  Pro,Login2
}))

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      personId: '',
      Person: null,
      PersonFu: null,
      color1: '#f56a00',
      color2: '#f56a00',
      type:"ALL",
    }
  }

  componentDidMount() {
    const {history} = this.props
    const { name } = this.props.location.query
    console.log(name)
    const login = this.props.Login2;
    if(login && login.username !==''){
      this.props.dispatch({
        type: 'Pro/getProfile',
        payload: {
          name
        }
      }).then(res => {
        const { success, data } = res
        data === null && Message.info("查无此人")
  
        let index = Math.ceil(Math.random() * 3)
        let index2 = Math.ceil(Math.random() * 3)
        if (!Array.isArray(data) && data !== null) {
          console.log(data)
  
          this.props.dispatch({
            type: 'Pro/getAll',
            payload: {
              sourceId: data.id
            }
          })
        }
        this.setState({
          personId: data == null ? '' : data.id,
          Person: Array.isArray(data) ? data[0] : data,
          PersonFu: Array.isArray(data) ? data[1] : null,
          color1: colorList[index],
          color2: colorList[index2],
        })
      })

    }else{
      history.push('/')
    }
    
  }


  delete = (id) => {
    const { dispatch } = this.props
    const { personId } = this.state
    Modal.confirm({
      title: '删除此数据 ?',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Pro/deletePro',
          payload: {
            id: '' + id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({
              type: 'Pro/getAll',
              payload: {
                sourceId: personId
              }
            })
          }
        })
      }
    })
  }

  findByType = () => {
    const { type, name,personId } = this.state
    const { dispatch } = this.props
    console.log(name, type)

    dispatch({
      type: 'Pro/findByType',
      payload: {
        // name: name === '' ? 'ALL' : name,
        sourceId:personId,
        type
      }
    })
  }

  handleChange = (value) => {
    console.log(`selected ${value}`);
    this.setState({
      type: value
    })
  }

  showModal = () => {
    this.setState({ visible: true });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    const { personId } = this.state
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      dispatch({
        type: 'Pro/save',
        payload: {
          data: { ...values, sourceId: personId },

        }
      }).then(r => {
        console.log(r);
        r.success && dispatch({
          type: 'Pro/getAll',
          payload: {
            sourceId: personId,
          }
        })

        form.resetFields();
        this.setState({ visible: false });
      })
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  locate = (address) => {
    const { history } = this.props;
    history.push("./profile/location?address=" + address)
  }

  onNameChange = e => {
    this.setState({
      name: e.target.value
    })
  }

  render() {
    const { movies } = this.props.Pro
    const { Person, PersonFu } = this.state
    return (
      <Fragment>
        {
          Person != null ?
            <Fragment>
              <div style={{ height: 10 }}></div>
              <MuduleTitle titleDe='我的个人信息' titleEn='ABOUT MY' />
              <ul className={styles.myWork}>
                <li></li>
                <li>
                  <div className={styles.tit}>姓名：<Avatar style={{ backgroundColor: this.state.color1, verticalAlign: 'middle' }} size={64} >
                    {Person.name}
                  </Avatar></div>
                  <div className={styles.tit}>电话:{Person.phone}</div>
                  <div className={styles.tit}>地址:{Person.address}</div>
                  <div className={styles.tit}>贫困程度:{Person.poorLevel == 1 ? "较贫困" : (Person.poorLevel == 2 ? "贫困" : (Person.poorLevel == 3 ? '特别贫困' : '无'))}</div>
                  <div className={styles.tit}>地区编码:{Person.code}</div>
                  {PersonFu === null ? '' :
                    <div>
                      <div className={styles.txt}><b>专业扶贫人员:</b></div>

                      <div className={styles.txt} style={{ marginLeft: 30 }}>姓名：<Avatar style={{ backgroundColor: this.state.color2, verticalAlign: 'middle' }} size={32} >
                        {PersonFu.name}
                      </Avatar></div>
                      <div className={styles.txt} style={{ marginLeft: 30 }}>电话:{PersonFu.phone}</div>
                      <div className={styles.txt} style={{ marginLeft: 30 }}>地址:{PersonFu.address}</div>
                      {/* <div>
                      <a onClick={() => router.push('/system/visualization')}
                        className={styles.btn}>走你！</a>
                    </div> */}
                    </div>
                  }
                </li>
              </ul>
            </Fragment> : ''
        }
        {PersonFu == null ?
          <Fragment>
            <MuduleTitle titleDe='我的管辖' titleEn='MY MANAGE' />
            <Row>
              <Col span={2}>
                <Button type="primary" shape="round" onClick={this.showModal}><Icon type="plus" />添加</Button>
              </Col>
              <Col offset={10} span={14}>
                <Form layout={"inline"}>
                 {/*  <Form.Item label="姓名" style={{ height: 20 }}>
                    <Input
                      prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                      placeholder="movieName"
                      onChange={this.onNameChange}
                    />,
              </Form.Item> */}
                  <Form.Item label="贫困程度">
                    <Select defaultValue="ALL" style={{ width: 120 }} onChange={this.handleChange}>
                      <Select.Option value="ALL">所有</Select.Option>
                      <Select.Option value="1">较贫困</Select.Option>
                      <Select.Option value="2">贫困</Select.Option>
                      <Select.Option value="3">特别贫困</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={this.findByType}><Icon type="search" />查询</Button>
                  </Form.Item>
                </Form>
              </Col>
            </Row>


            <Card>
              <Table
                rowKey={record => record.id}
                columns={[
                  {
                    title: '姓名',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: '电话',
                    dataIndex: 'phone',
                    key: 'phone',
                  },
                  {
                    title: '贫困程度',
                    dataIndex: 'poorLevel',
                    key: 'poorLevel',
                    render: function (text, record) {
                      if (text === 0) {
                        return <Tag color={'geekblue'} key={'love'}>  </Tag>
                      } else if (text === 1) {
                        return <Tag color={'grey'} key={'action'}> 较贫困 </Tag>
                      } else if (text === 2) {
                        return <Tag color={'pink'} key={'warfare'}> 贫困 </Tag>
                      } else if (text === 3) {
                        return <Tag color={'red'} key={'comedy'}> 特别贫困 </Tag>
                      }
                    }
                  },
                  {
                    title: '地区编码',
                    dataIndex: 'code',
                    key: 'code',
                    ellipsis: true,
                  },
                  {
                    title: '地址',
                    dataIndex: 'address',
                    key: 'address',
                    ellipsis: true,
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 300,
                    render: (text, record) => (
                      <span>
                        <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                        <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.locate(record.address)} >精准定位</Button>

                      </span>
                    ),
                  },
                ]} dataSource={movies} pagination={{ pageSize: 5 }} />
            </Card>

            <CollectionCreateForm
              wrappedComponentRef={this.saveFormRef}
              visible={this.state.visible}
              onCancel={this.handleCancel}
              onCreate={this.handleCreate}
            />
          </Fragment> : ''
        }

      </Fragment>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addProfile' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="添加贫困人口"
          okText="add"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="姓名">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'please enter name !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="电话">
              {getFieldDecorator('phone', {
                rules: [{ required: true, message: 'please enter phone !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="地址">
              {getFieldDecorator('address', {
                rules: [{ required: true, message: 'please enter address !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="地区编号">
              {getFieldDecorator('code', {
                rules: [{ required: true, message: 'please enter code !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item className="collection-create-form_last-form-item" label="Type">
              {getFieldDecorator('poorLevel', {
                initialValue: '1',
              })(
                <Radio.Group>
                  <Radio value='1'>较贫困</Radio>
                  <Radio value="2">贫困</Radio>
                  <Radio value="3">特别贫困</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
            {/*  <Form.Item label="Introduce">
              {getFieldDecorator('content')(<Input type="textarea" />)}
            </Form.Item> */}
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(Profile))
