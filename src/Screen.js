import React, {Component} from 'react';


class Screen extends Component{
  render(){
    return(
        <div className="screen">
          <div> {this.props.value}</div>
        </div>
    );
  }
}

export default Screen
