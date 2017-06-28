* in redux, we keep all our data in a 'store'...rather than holding our component state in the component, we just contain it in one giant object.

in store.js:
```
import { createStore, compse } from 'redux';
import { syncHistoryWithStore } from 'react-router-redux';
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

//create our store (IDK what this stuff is)
const store = createStore(rootReducer, defaultState);

//create our history with the store to be exported (IDK what this method does)
export const history = syncHistoryWithStore(browserHistory, store);

//export our store
export default store;
```

#### Actions
* actions are something that happens in your app (someone clicks a photo, someone likes a photo, someone deletes a comment, etc). whenever this happens, someone dispatches an action.

The dispatch action has 2 things:
1. type of action that happened (EX: 'incremementLikes')
2. a payload of info that is needed (EX: which comment got deleted, what comment was added)..just info about what specifically happened

* the dispatch action contains 'what happened' and 'where'.

an excerpt from 'actions/actionCreators.js':
```
export function increment(index) {
   return {
      type: 'INCREMENT_LIKES',
      index    //this is the es6 shortened version of 'index:index'
   }
}
```

^ this is called an 'action creator' because the object returned is considered the 'action' but the function itself is the 'creator' that will dispatch it out when called.

weird? the function is the creator, the object returned is the action.

#### Reducers
next we'll need to create the second part of these action creators, so when these actions get fired or dispatched, we actually handle the data (we update those likes, we add that comment, etc)...we do this with REDUCERS.

* actions/action creators get fired off or 'dispatched' with info about what just happened. what it DOES NOT do is update our state (in redux, our "store"). we need to create a 'reducer' to do this.

* think about event handlers: there's events (click, onChange, keyDown, etc) and those events will happen, but if theres no listener listening to that click, nothing will happen. 'Reducers' listen to those events.

* reducers are created for every piece of state (to update it duh!!).

Lets create a reducer (in reducers/posts.js):
```
// a reducer takes in 2 things:

//1. the action (what happened)
//2. a copy of current state

function posts(state =[], action) {
   console.log(state, action);
   return state;
}

export default posts;
```

* Evidently we can only have ONE MAIN REDUCER, which we put all of our other reducers into. so in our app (at this point) we've created `reducers/posts.js` and `reducers/comments.js`. we need to combine the 2 reducers in one file, which will be `reducers/index.js`:

```
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
   because we have 3 things in our state: posts, comments, and the changes of our URL as well <--important to note. its not just posts, comments.
*/
```

at this point, our app doesnt know anything at all about our store. lets change that.
in `reduxtagram.js`:

`import { Provider } from 'react-redux';`

lets also import our store we created in addition to the history (IDK what 'history' does):

`import store, { history } from './store';`

^ so in this we can see the console.log()s firing off with objects filled with post and comment content, but we dont see actions for 'increment_likes' or 'add_comment' like declared in our 'actionCreators.js' file.

** so above we've already imported our 'Provider', now we're going to use it as an element to expose our store to our app. we'll do this by wrapping `<Provider>` around our <Router> component**:

```
const router = (
   <Provider>
      <Router history={ BrowserHistory }>
         <Route path="/" component={ Main }>
            <IndexRoute component={ PhotoGrid }></IndexRoute>
            <Route path="/view/:postId" component={ Single }></Route>
         </Route>
      </Router>
   </Provider>
)
```

then we'll add a store prop:
`<Provider store={store}>`

now lets replace the prop value 'BrowserHistory' in <Router> to match 'history' that we've created in 'store.js':

`<Router history={ history }>`

now lets take a look at what we've done so far:

```
import React from 'react';
import { render } from 'react-dom';

import css from './styles/style.styl';

import Main from './components/Main';
import PhotoGrid from './components/PhotoGrid';
import Single from './components/Single';

//import react router deps
import { Router, Route, IndexRoute, BrowserHistory } from 'react-router';
import { Provider } from 'react-redux';
import store, { history } from './store';

const router = (
   <Provider store={store}>
      <Router history={ history }>
         <Route path="/" component={ Main }>
            <IndexRoute component={ PhotoGrid }></IndexRoute>
            <Route path="/view/:postId" component={ Single }></Route>
         </Route>
      </Router>
   </Provider>
)

render(router, document.getElementById("root"));
```

we've imported the Provider, wrapped it around our Router, exposing our app to the redux state, then we had previously defined 'history' in `store.js` like this:

```
//create our history with the store to be exported (IDK what this method does)
export const history = syncHistoryWithStore(browserHistory, store);
```

So now our store is exposed to our app and we can check it out via going to our 'react' tab in devtools, selecting <Provider>, then in the console:
`$r.store.getState();`


#### Understanding the reducer's job and dispatching actions

reminder: action = what happened and where, reducer = the change that happens

^ how do we hook them up together?

* we dispatch an action, and the reducer listens for the action and then does something to handle that action.

* action = the event, reducer = the listener

run this in your console: `$r.store.dispatch({ type: 'INCREMENT_LIKES', index: 0 });`

this occurs after:
```
posts.js:7 The post will change
posts.js:8 []length: 0__proto__: Array(0) Object {type: "INCREMENT_LIKES", index: 0}
comments.js:2 []length: 0__proto__: Array(0) Object {type: "INCREMENT_LIKES", index: 0}
Object {type: "INCREMENT_LIKES", index: 0}
```

^ as you see, both `posts.js` and `comments.js`: are fired off. THIS IS ESSENTIAL FOR UNDERSTANDING REDUX.

* WHEN YOU DISPATCH AN ACTION, EVERY REDUCER RUNS. IF YOU WANT TO ACT UPON THAT ACTION, YOU HAVE TO DEFINE THAT IN THE REDUCER.



#### Accessing Dispatch and State with Redux


