import { createStore, compse, combineReducers } from 'redux';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';
import { browserHistory } from 'react-router';

//import the root reducer
import rootReducer from './reducers/index';

//we need some default data to work with
import comments from './data/comments';
import posts from './data/posts';

// create an object for the default data
const defaultState = {
   posts,
   comments
};

// let combinedReducers = combineReducers({
//     routing: routerReducer,
//     rootReducer
// });

const store = createStore(rootReducer, defaultState);

//create our store (IDK what this stuff is)
// const store = createStore(combinedReducers, defaultState);

//create our history with the store to be exported (IDK what this method does)
export const history = syncHistoryWithStore(browserHistory, store);

//export our store
export default store;
