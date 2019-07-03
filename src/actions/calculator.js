import {
  BUTTON_CLICK,

} from './actionTypes';


export const buttonClick = (operator, value)=>({type:BUTTON_CLICK, payload: {operator, value}});



