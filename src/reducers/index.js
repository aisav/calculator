import { combineReducers} from 'redux';
import  calculatorReducer from './calculator';

export default combineReducers({
  calculator: calculatorReducer,
})
