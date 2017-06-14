// a reducer takes in 2 things:

//1. the action (what happened)
//2. a copy of current state

function posts(state =[], action) {
   console.log(state, action);
   return state;
}

export default posts;
