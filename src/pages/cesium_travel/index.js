import React, { Component } from 'react';
import { Redirect } from 'umi';
import {getCookie,setCookie} from '@/utils/cookie'

class Index extends Component {
  
  componentDidMount(){
    
  }

  render() {
    return (
      <Redirect to="/cesium_travel/flight"  />
    )
  }
}

export default Index