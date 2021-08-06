import React, { Component } from 'react';
import { Redirect } from 'umi';
import {getCookie,setCookie} from '@/utils/cookie'

class Index extends Component {
  
  componentDidMount(){
    
  }

  render() {
    return (
      // <Redirect to="/user/login" />
      // <Redirect to="/openlayers_nongye" />
      // <Redirect to="/neo_django_country" />
      // <Redirect to="/fish/user/login" />
      // <Redirect to="/PigDisease" />
      // <Redirect to="/yichan" />
      <Redirect to="/shuili" />
    )
  }
}

export default Index