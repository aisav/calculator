import React, {Component} from 'react';

// import axios from 'axios';

import Button from './Button';
import Screen from './Screen';

const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI('XW2VUL-KJT8AL6PA6');

class Calculator extends Component{

  constructor(){
    super();
    this.expression = React.createRef();
    this.state={
      currentOperation:"",
      decimalSet:false,
      parensOpen:0,
      walFrameMode:false,
    };
  }

  handleClick(value,operator){
    var currentOp = this.state.currentOperation;
    var decimalSet = this.state.decimalSet;
    var parensOpen = this.state.parensOpen;
    let lastVal = currentOp.length>0 ? currentOp[currentOp.length-1] : null;
    if(currentOp==="Infinity" || currentOp==="-Infinity")
      currentOp= "";



    if(operator){
      if(value==="clear"){
        currentOp= ""
        parensOpen=0;
      }else if(value==="back"){
        if(!endsWithScientificNotation(currentOp)){
          currentOp= currentOp.substr(0,currentOp.length-1);
          if(lastVal==="(") parensOpen--;
          if(lastVal===")") parensOpen++;
          if(lastVal===".") decimalSet=false;
        }
      }else
          if(value==="API =") {
            this.setState({walFrameMode: true})
            waApi.getFull("2+3")
                .then(res => {
                  console.log(res)
                  this.setState({currentOperation: 1})
                })
                .catch(err=> {
                      this.setState({currentOperation: 0})
                      console.log(err)
                    })
            // Todo fix Access-Control-Allow-Origin
            // axios.get(`http://api.wolframalpha.com/v2/query?input=1-7777776&appid=XW2VUL-KJT8AL6PA6`)
            //     .then(res => {
            //       console.log(res)
            //       this.setState({currentOperation: 1})
            //     })
          }
          else {
            currentOp = this.processOperator(value, currentOp, parensOpen);
          }
      decimalSet=false;
    }else if(value==="."){
      if(!decimalSet){
        currentOp+=value;
        decimalSet=true;
      }
    }else if(value==="("){
      if(!isValidExpression(lastVal)){
        currentOp+=value;
        parensOpen++;
      }
    }else if(value===")"){
      if(isValidExpression(lastVal) && parensOpen>0){
        currentOp+=value;
        parensOpen--;
      }
    }else {
      let secondToLast = currentOp.length>1 ? currentOp[currentOp.length-2] : null;
      if(lastVal==="0" && !isDigit(secondToLast))
        currentOp= currentOp.substr(0,currentOp.length-1)+value;
      else
        currentOp+=value;
    }
    this.setState({currentOperation:currentOp,decimalSet:decimalSet,parensOpen:parensOpen});
  }

  renderButton(value,operator){
    return <Button value={value} onClick={() => this.handleClick(value,operator)}/>
  }



  render(){
    return(
        <div className="calculator">
          <Screen value={this.state.currentOperation}/>
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

  processOperator(operator,currentOp,openParens){
    let lastVal = currentOp.length>0 ? currentOp[currentOp.length-1] : null;

    if(isValidExpression(lastVal)){
      if(operator==="=" && openParens===0){
        return evaluateExpression(currentOp).toString();
      }else if(operator!=="=")
        currentOp+=operator;
    }else if(operator==="-"){
      if(lastVal){
        if(lastVal==="+")
          currentOp= currentOp.substr(0,currentOp.length-1) + "-";
        else if(lastVal==="-"){
          if(!unaryMinus(currentOp,currentOp.length-1))
            currentOp= currentOp.substr(0,currentOp.length-1) + "+";
        }else
          currentOp += operator;
      }else
        currentOp+=operator;
    }
    return currentOp;
  }

}


function isDigit(char){
  if(!char) return false;
  return ("0" <= char && char <= "9") || char===".";
}

function isValidExpression(char){
  return isDigit(char) || char===")";
}

function evaluateExpression(operationString){
  var postfix = infixToPostfix(operationString);
  var stack = [];

  for(let i=0; i < postfix.length; i++){
    if(typeof(postfix[i]) === "number")
      stack.push(postfix[i])
    else{
      var v2= stack.pop();
      var v1= stack.pop();
      stack.push(result(v1,v2,postfix[i]));
    }
  }
  let answer = Math.round(stack.pop()*10000000000)/10000000000
  return answer;
}

function infixToPostfix(operationString){
  var stack=[];//stack for operators
  var postfix=[];//array for postfix expression

  for(let i=0; i < operationString.length; i++){
    if(isDigit(operationString[i])){
      let endNumber = pushNumber(operationString,i,postfix);
      i= endNumber;//skip to the last digit of this number
    }else if(unaryMinus(operationString,i)){
      operationString = operationString.substr(0,i)+"n*"+operationString.substr(i+1,operationString.length);
      i--;
    }else if(operationString[i]==="n"){//n represents -1, push -1 onto the stack
      postfix.push(-1);
    }else if(operationString[i]==="("){
      stack.push(operationString[i]);
    }else if(operationString[i]===")"){
      while(stack.length>0 && stack[stack.length-1]!=="(")
        postfix.push(stack.pop());
      stack.pop();
    }else if(stack.length===0){
      stack.push(operationString[i]);
    }else{
      while(stack.length > 0 && greaterOrEqualPrecedence(stack[stack.length-1],operationString[i]) && stack[stack.length-1]!=="("){
        postfix.push(stack.pop());
      }
      stack.push(operationString[i]);
    }

  }
  while(stack.length>0){
    postfix.push(stack.pop());
  }
  return postfix;
}

function pushNumber(operationString,i,postfix){
  let number =0; let k = 0;
  let digitStack=[];
  let afterDecimal=false;


  for(var j=i; isDigit(operationString[j]); j++){
    if(operationString[j]===".")
      afterDecimal=true;
    else{
      digitStack.push(parseInt(operationString[j],10));
      if(afterDecimal) k--;
    }
  }

  while(digitStack.length>0){
    number += digitStack.pop()*Math.pow(10,k);
    k++;
  }

  if(operationString[j]==="e"){
    let expDigitStack=[];  let exponent=0; let l=0; let expSign = operationString[j+1];
    for(j=j+2; isDigit(operationString[j]); j++){
      expDigitStack.push(parseInt(operationString[j],10));
    }
    while(expDigitStack.length>0){
      exponent+= expDigitStack.pop()*Math.pow(10,l);
      l++;
    }
    if(expSign==="+")
      number = number*Math.pow(10,exponent);
    else if(expSign==="-")
      number = number*Math.pow(10,-1*exponent);

  }

  postfix.push(number);

  return j-1;

}


function unaryMinus(operationString,mIndex){
  if(operationString[mIndex]!=="-")
    return false;
  let prevChar = operationString.length > mIndex ? operationString[mIndex-1] : null;
  return !isValidExpression(prevChar);
}

function greaterOrEqualPrecedence(a,b){
  var highestPrecedence=["*"];
  var middlePrecedence= ["×","÷"];
  var lowerPrecedence= ["+","-"];
  if(middlePrecedence.includes(a))
    return !highestPrecedence.includes(b);
  if(lowerPrecedence.includes(a)){
    return lowerPrecedence.includes(b);
  }else
    return true;
}

function result(a,b,operator){
  switch(operator){
    case "+":
      return a+b;
    case "-":
      return a-b;
    case "×":
    case "*":
      return a*b;
    case "÷":
      return a/b;
    default:
      console.log("someting went wrong, following binary operator invalid: " + operator);
      return 0;
  }
}

function endsWithScientificNotation(operationString){
  let stringLen = operationString.length;
  let criticalPortion= operationString.substr(stringLen-3,2);
  return criticalPortion==="e+" || criticalPortion==="e-";
}

export default Calculator
