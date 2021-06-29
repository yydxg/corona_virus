/*关系型数据库管理多张表，提供数据添加，删除，表删除，下载excel*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { getCookie, setCookie } from '@/utils/cookie'

@connect(({ Kuang, Login }) => ({
  Kuang, Login
}))

class Kuang extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      kuangs: []
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.Login;

    if (login && login.username !== '') {
      dispatch({
        type: 'Kuang/getAllKuangs',
        callback: res => {
          console.log(res);
          const { success, data } = res
          success && data && this.setState({
            kuangs: data
          })
        }
      })
    } else {
      history.push('/')
    }

  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除当前数据吗？',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Kuang/deleteKuang',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({
              type: 'Kuang/getAllKuangs', callback: res => {
                const { success, data } = res
                success && data && this.setState({
                  kuangs: data
                })
              }
            })
          }
        })
      }
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
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      dispatch({
        type: 'Kuang/save',
        payload: {
          data: { ...values }
        }
      }).then(r => {
        console.log(r);
        r.success && dispatch({
          type: 'Kuang/getAllKuangs', callback: res => {
            const { success, data } = res
            success && data && this.setState({
              kuangs: data
            })
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

  rollback = e => {
    this.props.history.goBack()
  }

  download = () => {
    const aElement = document.createElement('a');
    document.body.appendChild(aElement);
    aElement.style.display = 'none';
    aElement.href = `/api/kuang/download`;
    aElement.download = 'hihi'
    aElement.click();
    document.body.removeChild(aElement);
  }

  render() {
    const { kuangs } = this.state
    let role = '';
    this.props.Login != undefined ? role = this.props.Login.role : role = 'COMMON'
    console.log(kuangs)
    return (
      <div className={styles.kuang}>
        <Row>
          <Col span={2}>
            {role === 'ADMIN' ? <Button type="primary" shape="round" onClick={this.showModal}><Icon type="plus" />添加</Button> : ''}
          </Col>
          <Col span={2}>
            <Button type="primary" shape="round" onClick={this.download}><Icon type="download" />下载</Button>
          </Col>
          <Col span={2}>
            <Button type="primary" shape="round" onClick={this.rollback}><Icon type="rollback" />返回</Button>
          </Col>
          <Col offset={18} span={6}></Col>
        </Row>


        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '年份',
                dataIndex: 'nf',
                key: 'nf',
              },
              {
                title: '月份',
                dataIndex: 'yf',
                key: 'yf'
              },
              {
                title: '块段编号',
                dataIndex: 'kdbh',
                key: 'kdbh',
              },
              {
                title: '井口代码',
                dataIndex: 'jkdm',
                key: 'jkdm'
              },
              {
                title: '井口名称',
                dataIndex: 'jkmc',
                key: 'jkmc'
              },
              {
                title: '采区名称',
                dataIndex: 'cqmc',
                key: 'cqmc'
              },
              {
                title: '采区代码',
                dataIndex: 'cqdm',
                key: 'cqdm'
              },
              {
                title: '煤层名称',
                dataIndex: 'mcmc',
                key: 'mcmc'
              },
              {
                title: '倾角',
                dataIndex: 'qj',
                key: 'qj'
              },
              {
                title: '煤厚',
                dataIndex: 'mh',
                key: 'mh'
              },
              {
                title: '地质储量',
                dataIndex: 'dzcl',
                key: 'dzcl'
              },
              {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                  <span>
                    {role === 'ADMIN' ? <a style={{ marginRight: 16 }} onClick={() => this.delete(record.id)}>删除</a> : ''}
                  </span>
                ),
              },
            ]} dataSource={kuangs} pagination={true} />
        </Card>

        <CollectionCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addKuang' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="添加矿井信息"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="inline">
            <Form.Item label="年份">
              {getFieldDecorator('nf', {
                rules: [{ required: true, message: '请输入年份!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="月份">
              {getFieldDecorator('yf', {
                rules: [{ required: true, message: '请输入月份!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="块段编号">
              {getFieldDecorator('kdbh', {
                rules: [{ required: true, message: '请输入块段编号!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="井口代码">
              {getFieldDecorator('jkdm', {
                rules: [{ required: true, message: '请输入井口代码!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="井口名称">
              {getFieldDecorator('jkmc', {
                rules: [{ required: true, message: '请输入井口名称!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="采区名称">
              {getFieldDecorator('cqmc', {
                rules: [{ required: true, message: '请输入采区名称!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="采区代码">
              {getFieldDecorator('cqdm', {
                rules: [{ required: true, message: '请输入采区代码!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="煤层名称">
              {getFieldDecorator('mcmc', {
                rules: [{ required: true, message: '请输入煤层名称!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="倾角">
              {getFieldDecorator('qj', {
                rules: [{ required: true, message: '请输入倾角!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="煤厚">
              {getFieldDecorator('mh', {
                rules: [{ required: true, message: '请输入煤厚!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="地质储量">
              {getFieldDecorator('dzcl', {
                rules: [{ required: true, message: '请输入地质储量!' }],
              })(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(Kuang))