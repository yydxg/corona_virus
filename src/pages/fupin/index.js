import React, { Component } from 'react';
import { Redirect } from 'umi';

class Fupin extends Component {
  
  componentDidMount(){
    
  }

  render() {
    return (
      <Redirect to="/fupin/profile" />
    )
  }
}

export default Fupin