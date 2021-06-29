import { Form, Icon, Input, Button, Checkbox, Modal } from 'antd';
import { Link } from 'react-router-dom'
import { connect } from 'dva';
import {getCookie,setCookie} from '@/utils/cookie'

@connect(({ F_Login }) => ({
  F_Login
}))

class F_NormalLoginForm extends React.Component {
  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);

        this.props.dispatch({
          type:'F_Login/login',
          payload:{
            ...values,
            module:'users'
          }
        }).then((res)=>{
          const { success,result ,data ,err} = res;
          if(success && data){
            console.log(data)
            if(!data){
              Modal.info({
                content:"未找到用户！"
              })
              return
            }else{
              setCookie("username",data.v1)
              setCookie("role",data.v5)
              setCookie("password",data.v7)
              this.props.history.push('/jiangshui/info/zhandian')
              // this.props.history.push('/openlayers_nongye')
            }
          }else{
            Modal.info({
              content:"未找到用户！"
            })
          }
          
        })
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{width:'500px',margin: '0 auto',padding:'200px 0 0 0',height:'50px'}}>
        <h1 style={{textAlign:"center"}}>基于webgis的武汉市降水信息系统</h1>
      <Form onSubmit={this.handleSubmit} className="login-form">
        <Form.Item>
          {getFieldDecorator('v1', {
            rules: [{ required: true, message: '请输入用户名!' }],
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Username"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('v7', {
            rules: [{ required: true, message: '请输入密码!' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {/* {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(<Checkbox>Remember me</Checkbox>)}
          <a className="login-form-forgot" href="">
            Forgot password
          </a> */}
          <Button type="primary" htmlType="submit" className="login-form-button">
            登录
          </Button>
           {/* &nbsp; &nbsp; Or &nbsp; &nbsp; <Link to={{
              pathname: `register`,
              state: 'hello',
              }}>注册 now!
              </Link> */}
        </Form.Item>
      </Form>
      </div>
    );
  }
}

export default Form.create({ name: 'normal_login' })(F_NormalLoginForm);