import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import posts from './posts';
import comments from './comments';


const rootReducer = combineReducers({
   posts, comments, router: rootReducer
});

export default rootReducer;


/*
why are we using 'router: rootReducer'?
   because we have 3 things in our state: posts, comments, and the changes of our URL as well
*/
