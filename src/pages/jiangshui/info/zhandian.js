/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, message, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio, Breadcrumb, InputNumber } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'
import { none } from 'ol/centerconstraint';
// import JsExportExcel from 'js-export-excel'
import ExportJsonExcel from 'js-export-excel';



//站点信息管理

@connect(({ Fish, F_Login }) => ({
  Fish, F_Login
}))

class Miaozhong extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      zhuangtai: 'ALL',
      name: '',
      operateType: 'add',
    }
  }

  async componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.F_Login;
    dispatch({
      type: 'Fish/getAllByModule',
      payload: {
        data: 'miaozhong'
      },
      callback: res => {
        console.log(res);
      }
    })

    if (login && login.username !== '') {

    } else {
      history.push('/jiangshui/user/login')
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
                data: 'miaozhong'
              }
            })
          }
        })
      }
    })
  }

  findByZhuangtai = () => {
    const { zhuangtai, name } = this.state
    const { dispatch } = this.props
    console.log(name, zhuangtai)

    dispatch({
      type: 'Fish/findByV2',
      payload: {//v2:姓名。v3:规格
        module: 'miaozhong',
        v2: name === '' ? 'ALL' : name,
        // v3: zhuangtai,
      }
    })
  }

  exportTable = () => {
    const datas = this.props.Fish.datas ? this.props.Fish.datas : '';//表格数据
    console.log(1,datas)
    var option = {};
    let dataTable = [];
    dataTable = datas
    option.fileName = '站点信息'
    console.log(2,dataTable)
    option.datas = [
      {
        sheetData: dataTable,
        sheetName: 'sheet',
        sheetFilter: ['v1','v5','v2','v4','v3'],
        sheetHeader: ['编号', '省名', '站名','北纬','经度'],
      }
    ];

    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  }

  // handleChange = (value) => {
  //   this.setState({
  //     zhuangtai: value
  //   })
  // }

  showAddModal = () => {
    this.formRef.props.form.resetFields();
    this.setState({ visible: true, operateType: 'add' });
    this.formRef.props.form.setFieldsValue({
      v3:114.4, v4:30.3,v5:'湖北'
    })
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
            data: { ...values, module: 'miaozhong' }
          }
        }).then(r => {
          console.log(r);
          r.success && dispatch({
            type: 'Fish/getAllByModule',
            payload: {
              data: 'miaozhong'
            }
          })
          form.resetFields();
          this.setState({ visible: false });
        })
      } else { //新增模式
        this.isV1Unique(values.v1).then(r => {
          const { success, data } = r
          if (success && data) {
            dispatch({
              type: 'Fish/save',
              payload: {
                data: { ...values, module: 'miaozhong' }
              }
            }).then(r => {
              console.log(r);
              r.success && dispatch({
                type: 'Fish/getAllByModule',
                payload: {
                  data: 'miaozhong'
                }
              })
              form.resetFields();
              this.setState({ visible: false });
            })
          } else {
            message.warn("已存在相同苗种编号，请重新设置！")
            return;
          }
        })
      }
    });
  };

  isV1Unique = (v1) => {
    const { dispatch } = this.props;
    return new Promise((resolve, reject) => {
      dispatch({
        type: 'Fish/isV1Unique',
        payload: {
          module: 'miaozhong',
          v1
        }
      }).then(r => {
        resolve(r)
      })
    })
  }

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
    const { id, v1, v2, v3, v4, v5 } = da
    form.setFieldsValue({
      id, v1, v2, v3, v4, v5
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
        <Row style={{ marginBottom: 10 }}>
          <Col offset={2} span={10}>
            <Breadcrumb>
              <Breadcrumb.Item><Icon type="home" />位置：</Breadcrumb.Item>
              <Breadcrumb.Item>
                <a href="#">数据管理模块</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                站点管理
              </Breadcrumb.Item>
            </Breadcrumb>
          </Col>
        </Row>
        <Row style={{ marginBottom: 10 }}>
          <Col offset={2} span={2}>
            <Button type="primary" shape="round" onClick={this.showAddModal}><Icon type="plus" />添加</Button>
          </Col>
          <Col offset={8} span={12}>
            <Form layout={"inline"}>
              <Form.Item label="站点名称" style={{ height: 20 }}>
                <Input
                  placeholder="站点名称"
                  onChange={this.onNameChange}
                />,
              </Form.Item>
              {/* <Form.Item label="状态">
                <Select defaultValue="All" style={{ width: 120 }} onChange={this.handleChange}>
                  <Select.Option value="ALL">All</Select.Option>
                  <Select.Option value="正常">正常</Select.Option>
                  <Select.Option value="坏了">坏了</Select.Option>
                  <Select.Option value="停工">停工</Select.Option>
                </Select>
              </Form.Item> */}
              <Form.Item>
                <Button type="primary" onClick={this.findByZhuangtai}><Icon type="search" />搜索</Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={this.exportTable}><Icon type="search" />导出表格</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>


        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: '编号',
                dataIndex: 'v1',
                key: 'v1',
              },
              {
                title: '省名',
                dataIndex: 'v5',
                key: 'v5',
              },
              {
                title: '站点名称',
                dataIndex: 'v2',
                key: 'v2',
              },
              {
                title: '经度',
                dataIndex: 'v3',
                key: 'v3',
              },
              {
                title: '纬度',
                dataIndex: 'v4',
                key: 'v4',
              },
              // {
              //   title: '鱼塘名称',
              //   dataIndex: 'v5',
              //   key: 'v5',
              // },
              {
                title: '操作',
                key: 'action',
                width: 200,
                render: (text, record) => {
                  if (this.props.F_Login.role !== '养殖厂长') {
                    return <span>
                      <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >删除</Button>
                      <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.showUpdateModal(record.id)} >修改</Button>
                    </span>
                  } else {
                    return <Button icon="stop" disabled>无权限</Button>
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
          okText={operateType === 'add' ? '添加' : '修改'}
          title={operateType === 'add' ? '添加' : '修改'}
        />
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addMovie' })(
  // eslint-disable-next-line
  class extends React.Component {

    render() {
      const { visible, onCancel, onCreate, form, title, okText } = this.props;
      const { getFieldDecorator } = form;
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
      };
      return (
        <Modal
          visible={visible}
          title={title}
          okText={okText}
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="horizontal">
            <Form.Item label="id" {...formItemLayout} style={{ display: 'none' }}>
              {getFieldDecorator('id')(<Input />)}
            </Form.Item>
            <Form.Item label="编号" {...formItemLayout}>
              {getFieldDecorator('v1', {
                rules: [{ required: true, message: 'please enter 编号 !' }],
              })(<Input disabled={title === '修改' ? true : false} />)}
            </Form.Item>
            <Form.Item label="省名" {...formItemLayout}>
              {getFieldDecorator('v5', {
                rules: [{ required: true, message: 'please enter 省名 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="站点名称" {...formItemLayout}>
              {getFieldDecorator('v2', {
                rules: [{ required: true, message: 'please enter 站点名称 !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="经度" {...formItemLayout}>
              {getFieldDecorator('v3', {
                rules: [{ required: true, message: 'please enter 单价 !' }],
              })(<InputNumber min="-180" max="180"  step="0.01" />)}
            </Form.Item>
            <Form.Item label="纬度" {...formItemLayout}>
              {getFieldDecorator('v4', {
                rules: [{ required: true, message: 'please enter 库存量 !' }],
              })(<InputNumber min="-90" max="90"  step="0.01" />)}
            </Form.Item>

          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(Miaozhong))


/**
 * v1:编号、v2站点名称、v3经度、v4纬度、v5省名
 */