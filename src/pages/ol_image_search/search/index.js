/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, DatePicker, TimePicker, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio, message, InputNumber } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { getCookie, setCookie } from '@/utils/cookie'

const { MonthPicker, RangePicker } = DatePicker;

@connect(({ Imagery, Login }) => ({
  Imagery, Login
}))
class Image_search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.Login;
    console.log(this.props)
    dispatch({
      type: 'Imagery/getAllImages',
      callback: res => {
        console.log(res);
      }
    })
  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: '删除当前数据吗？',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Imagery/deleteImage',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({ type: 'Imagery/getAllImages' })
          }
        })
      }
    })
  }

  resetTable = () => {
    this.props.dispatch({
      type: 'Imagery/getAllImages'
    })
  }
  showModal = () => {
    this.setState({ visible: true });
  };

  handleCancel = () => {
    this.setState({ visible: false });
  };

  handleSearch2 = values => {
    console.log('Received values of form: ', values);
    console.log(this.props)
    if (values.name.trim() === '' || values.biaoqian.trim() === '') {
      message.warn('请输入完成查询条件')
      return
    }
    this.props.dispatch({
      type: 'Imagery/findByBiaoqian',
      payload: {
        ...values,
        dates: values['range-picker'].join(',')
      }
    })
  }

  handleCreate = () => {
    const { form } = this.formRef.props;
    const { dispatch } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      dispatch({
        type: 'Imagery/save',
        payload: {
          data: { ...values, biaoqian: values.biaoqian.join(','), year: values.year.format('YYYY-MM') }
        }
      }).then(r => {
        console.log(r);
        r.success && dispatch({
          type: 'Imagery/getAllImages'
        })

        form.resetFields();
        this.setState({ visible: false });
      })
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    const { images } = this.props.Imagery
    return (
      <div>

        <WrappedAdvancedSearchForm onNewImage={this.showModal} handleSearch2={this.handleSearch2} resetTable={this.resetTable} />

        <Card>
          <Table
            size={'small'}
            rowKey={record => record.id}
            scroll={{ x: 1500, y: 300 }}
            columns={[
              {
                title: '缩略图',
                dataIndex: 'id',
                key: 'id',
                render: (text, record) => {
                  return <img
                    width={100}
                    height={100}
                    src={require("../img/error.png")}
                  />
                }
              },
              {
                title: '名称',
                dataIndex: 'name',
                // fixed: 'left',
                key: 'name',
              },
              {
                title: '成像日期',
                dataIndex: 'year',
                key: 'year'
              },
              {
                title: '服务类型',
                dataIndex: 'serviceType',
                key: 'serviceType',
                render: (text, record) => (
                  text === 'xyz' ? '本地XYZ瓦片服务' : 'Geoserver-WMS服务'
                ),
              },
              {
                title: '云量',
                dataIndex: 'cloud',
                key: 'cloud',
                render: (text, record) => (
                  text + '%'
                ),
              },
              {
                title: '坐标点',
                dataIndex: 'points',
                key: 'points'
              },
              {
                title: '传感器类型',
                dataIndex: 'sensorType',
                key: 'sensorType'
              },
              {
                title: '轨道类型',
                dataIndex: 'trackType',
                key: 'trackType'
              },
              {
                title: '产品序列号',
                dataIndex: 'productNum',
                key: 'productNum'
              },
              {
                title: '数据集',
                dataIndex: 'biaoqian',
                key: 'biaoqian',
                render: function (text, record) {
                  if (text.indexOf("资源三号") > -1) {
                    return <Tag color={'geekblue'} key={'geekblue'}> {text} </Tag>
                  } else if (text.indexOf("高分一号") > -1) {
                    return <Tag color={'green'} key={'green'}> {text} </Tag>
                  } else if (text.indexOf("雷达数据") > -1) {
                    return <Tag color={'pink'} key={'pink'}> {text} </Tag>
                  } else if (text.indexOf("合成孔径雷达") > -1) {
                    return <Tag color={'red'} key={'red'}> {text} </Tag>
                  } else if (text.indexOf("其他") > -1) {
                    return <Tag color={'grey'} key={'grey'}> {text} </Tag>
                  }
                }
              },
              {
                title: '地址',
                dataIndex: 'url',
                key: 'url',
                width: 200,
                render: (text, record) => (
                  <span>
                    <a style={{ marginRight: 16 }}>{text}</a>
                  </span>
                ),
              },
              {
                title: '操作',
                key: 'action',
                fixed: 'right',
                width: 160,
                render: (text, record) => (
                  <span>
                    <a style={{ marginRight: 16 }} onClick={() => this.props.locateLayer(record.id)}>显示</a>
                    <a style={{ marginRight: 16 }} onClick={() => this.props.hideLayer(record.id)}>隐藏</a>
                    <a style={{ marginRight: 16 }} onClick={() => this.delete(record.id)}>删除</a>
                  </span>
                ),
              },
            ]} dataSource={images} pagination={true} />
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

const CollectionCreateForm = Form.create({ name: 'form_in_addImage' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="添加影像数据"
          okText="Create"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="服务名">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '请输入服务名!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="服务类型">
              {getFieldDecorator('serviceType', {
                rules: [{ required: true, message: '请选择服务类型!' }],
              })(
                <Select
                  placeholder="请选择服务类型！"
                >
                  <Select.Option value="xyz">本地XYZ瓦片服务</Select.Option>
                  <Select.Option value="wms">Geoserver-WMS服务</Select.Option>
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="服务地址">
              {getFieldDecorator('url', {
                rules: [{ required: true, message: '请输入服务地址!' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item className="collection-create-form_last-form-item" label="成像日期">
              {/* {getFieldDecorator('year', {
                initialValue: '2020',
              })(
                <Radio.Group>
                  <Radio value="2000">2000-</Radio>
                  <Radio value="2010">2000-2010</Radio>
                  <Radio value="2015">2010-2015</Radio>
                  <Radio value="2016">2016</Radio>
                  <Radio value="2017">2017</Radio>
                  <Radio value="2018">2018</Radio>
                  <Radio value="2019">2019</Radio>
                  <Radio value="2020">2020</Radio>
                  <Radio value="2021">2021</Radio>
                </Radio.Group>,
              )} */}
              {getFieldDecorator('year', {
                rules: [{ type: 'object', required: true, message: 'Please select time!' }],
              })(<MonthPicker />)}
            </Form.Item>
            <Form.Item label="数据集">
              {getFieldDecorator('biaoqian', {
                rules: [{ required: true, message: '请选择数据集!' }],
              })(
                <Select
                  placeholder="请选择数据集！"
                  mode="multiple"
                // onChange={this.handleSelectChange}
                >
                  <Select.Option value="资源三号">资源三号</Select.Option>
                  <Select.Option value="高分一号">高分一号</Select.Option>
                  <Select.Option value="雷达数据">雷达数据</Select.Option>
                  <Select.Option value="合成孔径雷达">合成孔径雷达</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>,
              )}
            </Form.Item>
            <Form.Item label="云量">
              {getFieldDecorator('cloud', {
                rules: [{ required: true, message: '请输入云量!' }],
              })(
                <InputNumber min={0} max={100} formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')} />
              )}
            </Form.Item>
            <Form.Item label="坐标点">
              {getFieldDecorator('points')(<Input />)}
            </Form.Item>
            <Form.Item label="传感器类型">
              {getFieldDecorator('infsensorTypeo')(<Input />)}
            </Form.Item>
            <Form.Item label="轨道类型">
              {getFieldDecorator('trackType')(<Input />)}
            </Form.Item>
            <Form.Item label="产品序列号">
              {getFieldDecorator('productNum')(<Input />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);



//form表单
// @connect(({ Imagery }) => ({
//   Imagery
// }))
class AdvancedSearchForm extends React.Component {
  state = {
    expand: false,
  };

  handleReset = () => {
    this.props.form.resetFields();
    this.props.resetTable();
  };

  newImage = () => {

  }

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      // Should format date value before submit.
      const rangeValue = fieldsValue['range-picker'];
      const values = {
        ...fieldsValue,
        'range-picker': [rangeValue[0].format('YYYY-MM'), rangeValue[1].format('YYYY-MM')],
      };
      console.log('Received values of form: ', values);
      this.props.handleSearch2(values)
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
    };
    const config = {
      rules: [{ type: 'object', required: true, message: 'Please select time!' }],
    };
    const rangeConfig = {
      rules: [{ type: 'array', required: true, message: 'Please select time!' }],
    };

    return (
      <>
        <Form {...formItemLayout} onSubmit={this.handleSubmit} style={{ marginTop: 10 }} labelAlign='left'>
          <Form.Item label={`数据集`}>
            {getFieldDecorator('biaoqian', {
              rules: [{ required: true, message: '请选择数据集!' }],
            })(
              <Select
                placeholder="请选择数据集！"
              >
                <Select.Option value="资源三号">资源三号</Select.Option>
                <Select.Option value="高分一号">高分一号</Select.Option>
                <Select.Option value="雷达数据">雷达数据</Select.Option>
                <Select.Option value="合成孔径雷达">合成孔径雷达</Select.Option>
                <Select.Option value="其他">其他</Select.Option>
              </Select>,
            )}
          </Form.Item>
          <Form.Item label={`服务名`}>
            {getFieldDecorator(`name`, {
              rules: [
                {
                  required: true,
                  message: '请输入服务名称!',
                },
              ],
            })(<Input placeholder="请输入服务名称" />)}
          </Form.Item>
          <Form.Item label="时间范围">
            {getFieldDecorator('range-picker', rangeConfig)(<RangePicker format='YYYY-MM' />)}
          </Form.Item>
          <Form.Item label="云量（<）">
            {getFieldDecorator('cloud', {
              rules: [{ required: true, message: '请输入云量!' }],
            })(
              <InputNumber min={0} max={100} formatter={value => `${value}%`}
                parser={value => value.replace('%', '')} />
            )}
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: { span: 24, offset: 0 },
              sm: { span: 16, offset: 8 },
            }}
          >
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="danger" onClick={this.props.onNewImage} style={{ marginRight: '10px' }}>
                  新增
            </Button>
                <Button type="primary" htmlType="submit">
                  查询
            </Button>
                <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                  重置
            </Button>
                {/* <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
              展开 <Icon type={this.state.expand ? 'up' : 'down'} />
            </a> */}
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </>
    );
  }
}
const WrappedAdvancedSearchForm = Form.create({ name: 'advanced_search' })(AdvancedSearchForm);


export default connect()(Form.create()(Image_search))