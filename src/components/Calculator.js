import React, {Component} from 'react';
import  {connect} from 'react-redux';
import {buttonClick} from '../actions/index'
// import axios from 'axios';

import Button from './Button';
import Screen from './Screen';



class Calculator extends Component{

  constructor(){
    super();
    this.expression = React.createRef();

  }

  handleClick(value,operator){
    this.props.newOperation(operator, value)
  }

  renderButton(value,operator){
    return <Button value={value} onClick={() => this.handleClick(value,operator)}/>
  }



  render(){
    return(
        <div className="calculator">
          <Screen value={this.props.currentOperation}/>
          <div className="calculator-row">
            {this.renderButton(7,false)}
            {this.renderButton(8,false)}
            {this.renderButton(9,false)}
            {this.renderButton('+',true)}
          </div>
          <div className="calculator-row">
            {this.renderButton(4,false)}
            {this.renderButton(5,false)}
            {this.renderButton(6,false)}
            {this.renderButton('-',true)}
          </div>
          <div className="calculator-row">
            {this.renderButton(1,false)}
            {this.renderButton(2,false)}
            {this.renderButton(3,false)}
            {this.renderButton('×',true)}
          </div>
          <div className="calculator-row">
            {this.renderButton(0,false)}
            {this.renderButton(".",false)}
            {this.renderButton("=",true)}
            {this.renderButton("÷",true)}
          </div>
          <div className="calculator-row">
            {this.renderButton("(",false)}
            {this.renderButton(")",false)}
            {this.renderButton("clear",true)}
            {this.renderButton("back",true)}
          </div>
          <div className="calculator-row">
            {this.renderButton("API =",true)}
          </div>

        </div>
    );
  }


}

const mapStateToProps = state => {
  return {
    currentOperation: state.calculator.currentOperation,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    newOperation: (operator, value) => dispatch( buttonClick(operator, value)),
  };
};



export default connect(mapStateToProps, mapDispatchToProps)(Calculator)
