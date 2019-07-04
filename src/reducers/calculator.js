import * as actionTypes from '../actions/actionTypes'

import axios from 'axios'
const WolframAlphaAPI = require('wolfram-alpha-api');
const waApi = WolframAlphaAPI('XW2VUL-KJT8AL6PA6');

const initialState = {

  currentOperation:"",
  decimalSet:false,
  parensOpen:0,
  walFrameMode:false,
};



const reducer = (state = initialState, action) => {
  // let helpObj = {}
  // let count


  switch (action.type) {
    case actionTypes.BUTTON_CLICK:

      let currentOp = state.currentOperation;
      let decimalSet = state.decimalSet;
      let parensOpen = state.parensOpen;
      let lastVal = currentOp.length>0 ? currentOp[currentOp.length-1] : null;
      if(currentOp==="Infinity" || currentOp==="-Infinity")
        currentOp= "";



      if(action.payload.operator){
        if(action.payload.value==="clear"){
          currentOp= ""
          parensOpen=0;
        }else if(action.payload.value==="back"){
          if(!endsWithScientificNotation(currentOp)){
            currentOp= currentOp.substr(0,currentOp.length-1);
            if(lastVal==="(") parensOpen--;
            if(lastVal===")") parensOpen++;
            if(lastVal===".") decimalSet=false;
          }
        }else
        if(action.payload.value==="API =") {
          // waApi.getFull("2+3")
          //     .then(res => {
          //       console.log(res)
          //       return {
          //         ...state,
          //         currentOperation: 1,
          //         walFrameMode: true
          //       }
          //     })
          //     .catch(err=> {
          //       return {
          //         ...state,
          //         currentOperation: 0,
          //         walFrameMode: true
          //       }
          //     })
          // Todo fix, but response is not json, Access-Control-Allow-Origin fixed
          axios.get(`https://www.wolframalpha.com/input/?i=8*111&appid=XW2VUL-KJT8AL6PA6&output=json`)
              .then(res => {
                console.log(res)
                // this.setState({currentOperation: 1})
              })
        }

        else {
          currentOp = processOperator(action.payload.value, currentOp, parensOpen);
        }
        decimalSet=false;
      }else if(action.payload.value==="."){
        if(!decimalSet){
          currentOp+=action.payload.value;
          decimalSet=true;
        }
      }else if(action.payload.value==="("){
        if(!isValidExpression(lastVal)){
          currentOp+=action.payload.value;
          parensOpen++;
        }
      }else if(action.payload.value===")"){
        if(isValidExpression(lastVal) && parensOpen>0){
          currentOp+=action.payload.value;
          parensOpen--;
        }
      }else {
        let secondToLast = currentOp.length>1 ? currentOp[currentOp.length-2] : null;
        if(lastVal==="0" && !isDigit(secondToLast))
          currentOp= currentOp.substr(0,currentOp.length-1)+action.payload.value;
        else
          currentOp+=action.payload.value;
      }
      return {
        ...state,currentOperation:currentOp,decimalSet:decimalSet,parensOpen:parensOpen};

    default:
      return state;
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

function processOperator(operator,currentOp,openParens){
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

export default reducer;
