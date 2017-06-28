// a reducer takes in 2 things:

//1. the action (what happened)
//2. a copy of current state

function posts(state =[], action) {
   switch(action.type) {
      case 'INCREMENT_LIKES' :
         console.log(action);
         const i = action.index;
         return [
            ...state.slice(0, i), //before the one we are updating
            {...state[i], likes: state[i].likes + 1},
            ...state.slice(i + 1) //after the one we are updating
         ]
      // return the updated state
      default:
         return state;
   }
}

export default posts;
