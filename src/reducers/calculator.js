import * as actionTypes from '../actions/actionTypes'

const initialState = {

  currentOperation:"",
  decimalSet:false,
  parensOpen:0
};


const reducer = (state = initialState, action) => {
  let helpObj = {}
  let count

  switch (action.type) {
      /////////////////////////////////////////////////////////////////////////////////////////// ADD ///////////////
    case actionTypes.WOLFRAM_ALPHA:
      if (state.quantityById[action.payload.id] !== undefined)
        count = state.quantityById[action.payload.id] + 1
      else count = 1

      helpObj[action.payload.id] = count

      return {
        ...state,
        quantityById: {...state.quantityById, ...helpObj}
      }
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    default:
      return state;
  }
}


export default reducer;
