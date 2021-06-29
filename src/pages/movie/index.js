/* global mars3d Cesium*/
import React, { Component } from 'react';
import { Divider, Checkbox, Button, Row, Col, Tooltip, Modal, Select, Table, Tag, Card, Form, Input, Icon, Radio } from 'antd'
import styles from './style.less'
import echarts from 'echarts'
import { connect } from 'dva';
import { Link } from 'umi'
import { getCookie, setCookie } from '@/utils/cookie'

@connect(({ Movie, Login }) => ({
  Movie, Login
}))

class Movie extends Component {

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      type: 'ALL',
      name: '',
    }
  }

  componentDidMount() {
    let { dispatch, history } = this.props;
    const login = this.props.Login;
    dispatch({
      type: 'Movie/getAllMovies',
      callback: res => {
        console.log(res);
      }
    })
    /* if(login && login.username !==''){
      
    }else{
      history.push('/')
    } */

  }

  delete = (id) => {
    const { dispatch } = this.props
    Modal.confirm({
      title: 'delete the data ?',
      onCancel: () => { },
      onOk: () => {
        console.log(id)
        dispatch({
          type: 'Movie/deleteMovie',
          payload: {
            id
          }
        }).then((re) => {
          if (re.success) {
            dispatch({ type: 'Movie/getAllMovies' })
          }
        })
      }
    })
  }

  findByType = () => {
    const { type,name } = this.state
    const { dispatch } = this.props
    console.log(name,type)
    
    dispatch({
      type: 'Movie/findByType',
      payload: {
        name:name===''?'ALL':name,
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
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
      dispatch({
        type: 'Movie/save',
        payload: {
          data: { ...values }
        }
      }).then(r => {
        console.log(r);
        r.success && dispatch({
          type: 'Movie/getAllMovies'
        })

        form.resetFields();
        this.setState({ visible: false });
      })
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  describe = (name) => {
    const { history } = this.props;
    history.push("./movie/comments?name=" + name)
  }

  onNameChange = e=>{
    this.setState({
      name:e.target.value
    })
  }
  render() {
    const { movies } = this.props.Movie
    return (
      <div className={styles.Movie} style={{ paddingTop: 100 }}>
        <Row>
          <Col span={2}>
            <Button type="primary" shape="round" onClick={this.showModal}><Icon type="plus" />Add</Button>
          </Col>
          <Col offset={10} span={14}>
            <Form layout={"inline"}>
              <Form.Item label="name" style={{height:20}}>
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="movieName"
                  onChange = {this.onNameChange}
                />,
              </Form.Item>
              <Form.Item label="Type">
                <Select defaultValue="All" style={{ width: 120 }} onChange={this.handleChange}>
                  <Select.Option value="ALL">all</Select.Option>
                  <Select.Option value="comedy">comedy</Select.Option>
                  <Select.Option value="warfare">warfare</Select.Option>
                  <Select.Option value="action">action</Select.Option>
                  <Select.Option value="love">love</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={this.findByType}><Icon type="search" />Search</Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>


        <Card>
          <Table
            rowKey={record => record.id}
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Director',
                dataIndex: 'director',
                key: 'director',
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: function (text, record) {
                  if (text === "love") {
                    return <Tag color={'geekblue'} key={'love'}> love </Tag>
                  } else if (text === "action") {
                    return <Tag color={'grey'} key={'action'}> action </Tag>
                  } else if (text === "warfare") {
                    return <Tag color={'pink'} key={'warfare'}> warfare </Tag>
                  } else if (text === "comedy") {
                    return <Tag color={'red'} key={'comedy'}> comedy </Tag>
                  }
                }
              },
              {
                title: 'Introduce',
                dataIndex: 'content',
                key: 'records',
                ellipsis:true,
              },
              {
                title: 'Action',
                key: 'action',
                width:300,
                render: (text, record) => (
                  <span>
                    <Button type="danger" style={{ marginRight: 16 }} onClick={() => this.delete(record.id)} >delete</Button>
                    <Button type="primary" style={{ marginRight: 16 }} onClick={() => this.describe(record.name)} >describe the movie</Button>

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
      </div>
    )
  }
}

const CollectionCreateForm = Form.create({ name: 'form_in_addMovie' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="add movie"
          okText="add"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="Name">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'please enter name !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item label="Director">
              {getFieldDecorator('director', {
                rules: [{ required: true, message: 'please enter director !' }],
              })(<Input />)}
            </Form.Item>
            <Form.Item className="collection-create-form_last-form-item" label="Type">
              {getFieldDecorator('type', {
                initialValue: 'love',
              })(
                <Radio.Group>
                  <Radio value="love">love</Radio>
                  <Radio value="action">action</Radio>
                  <Radio value="warfare">warfare</Radio>
                  <Radio value="comedy">comedy</Radio>
                </Radio.Group>,
              )}
            </Form.Item>
            <Form.Item label="Introduce">
              {getFieldDecorator('content')(<Input type="textarea" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  },
);

export default connect()(Form.create()(Movie))