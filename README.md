# Redux Course Notes (abridged)

In redux, we keep all our data in a 'store'...rather than holding our component state in the component, we just contain it in one giant object.

in store.js:
```
import { createStore, compose } from 'redux';
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

# Actions
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

# Reducers
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


# Understanding the reducer's job and dispatching actions

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



# Accessing Dispatch and State with Redux

How to populate data? In react, we typically pass state in at the top level and then pass it down to wherever it should go via props. In redux, we use "connect" to inject data at the component level we want it at, then pass it down if we want.

if we look at our main.js file at the moment, it looks like this:
```
import React from 'react';
import { Link } from 'react-router';

const Main = React.createClass({
   render() {
      return (
         <div>
            <h1>
               <Link to="/">Reduxstagram</Link>
            </h1>
            {React.cloneElement(this.props.children, this.props)};
         </div>
      )
   }
});

export default Main;
//this 'export' allows us to import the component in our reduxstagram file

```

^ this is a mostly presentational component containing mostly DOM markup, but we wanna infuse it with both the action creators as well as the data...we do this by creating a 2nd component that will sorta sprinkle this stuff on top.

lets create a new file called 'App.js' inside the '/components' folder:
```
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../actions/actionCreators';
import Main from './Main';

const App =
```

now instead of using `React.createClass({})` for App, we will use connect():

`const App = connect( mapStateToProps, mapDispatchToProps);`

^ these are 2 functions which will take the state and our action creators and surface those in the app via props. now lets create those functions:

```
function mapStateToProps(state){
   return {
      posts: state.posts,
      comment: state.comments
   }
}

function mapDispatchToProps(dispatch){
   return bindActionCreators(actionCreators, dispatch);
}
```
^ these 2 functions will surface our data and make the dispatch actions possible.

now go back to reduxtagram.js:

instead of importing 'Main' directly like this:
```
import Main from './components/Main';

<Route path="/" component={ Main }>
   <IndexRoute component={ PhotoGrid }></IndexRoute>
   <Route path="/view/:postId" component={ Single }></Route>
</Route>
```

we want to change 'Main' to 'App' since we'll be using that:

```
import App from './components/App';

<Route path="/" component={ App }>
   <IndexRoute component={ PhotoGrid }></IndexRoute>
   <Route path="/view/:postId" component={ Single }></Route>
</Route>
```


and now in App.js, we're going to attach the 'Main' component to the created functions via connect(). this looks strange, but I will explain:

`const App = connect( mapStateToProps, mapDispatchToProps)(Main);`

**Remember: we use 'connect'to attach these two functions to our 'Main' component. These 2 functions pass down the data and dispatch actions via props.**

a little backtrack but worth it:

In redux, all our state lives in a store. we make the store accessible via the 'react-redux' `<provider>`, wrapping our component structure with it. now it is accessible, but not connected. In redux, We can only change state by dispatching an action, and we can only retrieve data by obtaining a store's current state. connect() allows us to do that.

It looks a bit weird because of the syntax (double parantheses), but makes sense. here's a fantastic read on connect():
http://www.sohamkamani.com/blog/2017/03/31/react-redux-connect-explained/


# Displaying Redux state inside our components

lets create Photo.js inside our /components directory:
```
import React from 'react';

const Photo = React.createClass({
   render() {
      return (
         <figure className="grid-figure">
            I am a photo!
         </figure>
      )
   }
});

export default Photo;

```

now lets map through the posts in our photoGrid, and for Each post, lets add a <Photo/> component:
```
<div className="photo-grid">
   { this.props.posts.map((post, i) => <Photo />)}
</div>
```

^ looks good, but doesnt inherit any props, which it needs to display photos. lets do that:

`{ this.props.posts.map((post, i) => <Photo {...this.props} />)}`

we also need to give it a key because each child should have a unique key...react needs a key to differentiate which photo is which. so we'll add that using the index 'i' as the unique key:

```
{ this.props.posts.map((post, i) => <Photo {...this.props} key={i} />)}
```

now we also need to pass the index value that goes along with it:
```
{ this.props.posts.map((post, i) => <Photo {...this.props} key={i} i={ i }/>)}
```

**we cant use 'key' as our unique ID because react reserves 'key' for itself. if you want a unique ID, you'll have to use the index.**

now lets add the post prop: `{ this.props.posts.map((post, i) => <Photo {...this.props} key={i} i={ i } post={ post }/>)}`

now we have our unique identifier and 'post' props. lets create a proper `<Photo>` component in `photo.js`:
```
import React from 'react';
import { Link } from 'react-router';

const Photo = React.createClass({
   render() {
      const { post, i, comments } = this.props;

      return (
         <figure className="grid-figure">
            <div className="grid-photo-wrap">
               <Link to={`/view/${ post.code }`}>
               <img src={post.display_src} alt={post.caption} className="grid-photo" />
                { post.caption }
               </Link>
            </div>
         </figure>
      )
   }
});

export default Photo;
```
^ we give individual links to each Photo component using the native <Link> tag provided by importing it from 'react-router'..we then use some variables to shorten our props declarations so we dont constantly use 'this.props' all the time.

These link urls go to urls based on the `<Single>` component we defined in `main.js`

# Updating our state with reducers

when someone clicks a 'like' button, we want the 'increment' function to run. we've already included the 'increment' function via props, so we can pass it in a click handler:

in photo.js
```
<button onClick={this.props.increment()} className="likes">&hearts; {post.likes}</button>
```

^ and when clicking, we see that the event is being fired off. nice, but we need to pass in its unique identifier:

`onClick={this.props.increment.bind(null, i)}`

**if necessary, refer to notes on bind()**

now when we click, ALL REDUCERS show up in console.

An Aside about pure/impure functions:
redux is designed in a functional programming style, meaning no impure functions. impure functions are functions that have side effects and affect things not within itself. take this for example:
```
function addLike(picture) {
   picture.likes++;
   console.log(picture);
   return picture
}

var post = { name: "A cool picture", likes: 10};

addLike(post); //picture.likes is 11
addLike(post); //picture.likes is 12
addLike(post); //picture.likes is 13

```

^ NOT GOOD! this is because we are changing what is inside of the 'post' object. lets instead create a copy of the post object and return that new copy instead, keeping the original 'post' object intact:
```
function addLike(picture) {
   //take a copy
   var pic = Object.assign({}, picture); //creates a new Object from 'picture'
   pic.likes++;
   console.log(pic);
   return pic
}

var post = { name: "A cool picture", likes: 10};

addLike(post); //picture.likes is 11
addLike(post); //picture.likes is 11
addLike(post); //picture.likes is 11
```

Now since we understand the need for pure functions in redux, lets go back and code what goes in our reducer for 'INCREMENT_LIKES' action, creating a switch statement to do something if it is the INCREMENT_LIKES action dispatcher:

```
function posts(state =[], action) {
   switch(action.type) {
      case 'INCREMENT_LIKES' :
         const i = action.index;
         return [
            ...state.slice(0, i), //before the one we are updating
            {...state[i], likes: state[i].likes + 1}
            ...state.slice(i + 1), //after the one we are updating
         ]
      // return the updated state
      default:
         return state;
   }
}
```

^ we're returning a copy of the new state array, which includes all the same stuff EXCEPT it updates the specific state index's 'likes' object to be incremented by 1. One thing I've learned a lot about react and redux is the need to create copies of state to replace the state them rather than just updating the current state. seems cleaner.

# Displaying the single component

lets update our Comment component located inside 'Single.js' to have some usable props:
```
import React from 'react';
import Photo from './Photo';
import Comments from './Comments';

const Single = React.createClass({
   render() {

      const {postId} = this.props.params;

      //we need the index of the post (we get through finding the specific url code then the index)...
      const i = this.props.posts.findIndex((post) => post.code === postId);

      //the post itself, found with 'i'
      const post = this.props.posts[i];
      console.log(post);

      const postComments = this.props.comments[postId] || [];

      return (
         <div className="single-photo">
            <Photo i={i} post={post} {...this.props} />
            <Comments postComments={postComments} />
         </div>
      )
   }
});

export default Single;
```

now in the <Comments> component file, we'll iterate and use the comments using `map()`:

```
import React from 'react';
import Photo from './Photo';

const Comments = React.createClass({
   renderComment(comment, i) {
      return (
         <div className="comment" key={i}>
            <p>
               <strong>{comment.user}</strong>
               {comment.text}
               <button className="remove-comment">&times;</button>
            </p>
         </div>
      )
   },

   render() {
      return (
         <div className="comment">
            {this.props.postComments.map(this.renderComment)}
         </div>
      )
   }
});

export default Comments;
```

^ this populates all photo comments to the DOM, now lets make a form element like on the reduxtagram demo where people can add their own comments.

```
   render() {
      return (
         <div className="comments">
            {this.props.postComments.map(this.renderComment)}
            <form ref="commentForm" className="comment-form">
               <input type="text" ref="author" placeholder="author" />
               <input type="text" ref="comment" placeholder="comment" />
               <input type="submit" hidden />
         </div>
      )
   }
```

# Updating comment state in our store

so on submitting a new comment, we just refresh the page. lets handle that submit so new comments can be added.

```
   handleSubmit(e) {
      e.preventDefault();
      const { postId } = this.props.params;
      const author = this.refs.author.value;
      const comment = this.refs.comment.value;
      console.log(postId, author, comment);
   },

   render() {
      return (
         <div className="comments">
            {this.props.postComments.map(this.renderComment)}
            <form ref="commentForm" className="comment-form" onSubmit={this.handleSubmit}>
               <input type="text" ref="author" placeholder="author" />
               <input type="text" ref="comment" placeholder="comment" />
               <input type="submit" hidden />
            </form>
         </div>
      )
   }
```

REMEMBER: in react, we get values from inputs using the 'ref' attribute. so we've got the author, comment but not the specific post, as the error console is stating it isnt defined. we need to pass those params (postId) in as props on the `<Comment>` component used in `single.js`:

```
return (
   <div className="single-photo">
      <Photo i={i} post={post} {...this.props} />
      <Comments postComments={postComments} {...this.props}/>
   </div>
)
```

so now our console.log() is firing off nicely. lets take these form comments and update our state using a REDUCER. we'll add some code to `actionCreators.js` to handle updating the state. we'll use the already created `addComment()` function within `handleSubmit()`.

```
   handleSubmit(e) {
      e.preventDefault();
      const { postId } = this.props.params;
      const author = this.refs.author.value;
      const comment = this.refs.comment.value;
      console.log(postId, author, comment);
      this.props.addComment(postId, author, comment);
   },
```

we'll run a quick `console.log()` statement in actionCreators.js to make sure things are working nicely:
```
export function addComment(postId, author, comment) {
   console.log('dispatching add comment');
   return {
      type: 'ADD_COMMENT',
      postId,
      author,
      comment
   }
}
```
Now its working, our action is being dispatched. now we should actually update the state. so lets review this real quick:

1. we use 'ref' attributes to get values from text inputs
2. we've passed along all props from the <single> component to the <comment> component via {...this.props}. our props also include our reducer functions like addComment() removeComment() incremementLikes() and so forth.
4. we use the addComment() function in our handleSubmit() function:

`this.props.addComment(postId, author, comment);`

5. we added a console.log() statement to check and make sure the action is being dispatched, and it is.



# Redux Reducer Composition
our 'comments' state is a big object with all comments, with each item being a key based on the unique id of the associated post and an array with its comments.

when we want to add a comment we dont have to update the entire 'comments' state, we just want to update that one little piece.

***reducer composition = updating just a slice of state.***

we've created reducers for posts, comments, and now we'll do a 'sub-reducer' for single comments within a post, in comments.js:

```
function postComments(state =[], action) {
   switch(action.type) {
      case 'ADD_COMMENT':
      //return the new state with the new comment
      return [...state, {
         user: action.author,
         text: action.comment,
      }];

      case 'REMOVE_COMMENT':
         return state;
      default:
         return state;
   }
   return state;
}


function comments(state =[], action) {
   if(typeof action.postId !== 'undefined') {
         console.log(action);

      return {
         //take the current state
         ...state,
         //overwrite this post with the new one
         //
         [action.postId] : postComments(state[action.postId], action)
      }
   }
   return state;
}

export default comments;
```
^ what we're doing here:

1. we create a switch statement in postComments() where if the action is 'ADD_COMMENT' we return the new state with the new comment.
2. in comments(), we make sure the action.postId is not undefined, and if its not, we return the current state and in the specific post ID, we handle the updating of the post via the postComments() function.

**so we create different functions to handle different things. one function to update the specific post ID comment state and one function to return the overall state with the newly updated postID comment state inside it. this is why postComments() is considered a sub-reducer, because it is used as a reducer within a reducer.**

so we're good on adding a comment, lets handle removing a comment as well:

in Comments.js:
```
function postComments(state =[], action) {
   switch(action.type) {
      case 'ADD_COMMENT':
      //return the new state with the new comment
      return [...state, {
         user: action.author,
         text: action.comment,
      }];

      case 'REMOVE_COMMENT':
         console.log("removing a comment");
         return state;
      default:
         return state;
   }
   return state;
}
```
lets hook this up to be fired off in our remove-comment button via a click handler:

```
   renderComment(comment, i) {
      return (
         <div className="comment" key={i}>
            <p>
               <strong>{comment.user}</strong>
               {comment.text}
               <button className="remove-comment" onClick={this.props.removeComment()}>&times;</button>
            </p>
         </div>
      )
   },
```

The `removeComment()` function needs 2 args: a postId and the unique index of the comment we're removing. also we'll use `bind()` to make sure we always get the right instance of the unique index:

```
<button className="remove-comment" onClick={this.props.removeComment.bind(null, this.props.params.postId, i)}>&times;</button>
```

^ this works, but now we should actually remove the comment instead of simply running a `console.log()`. what we'll do is return a copy of the comment state without the specific comment, using `slice()` to do so:

```
 case 'REMOVE_COMMENT':
   //we need to return the new state without the deleted comment
   return [
   // from the start to the one we want to delete
   ...state.slice(0, action.i)]
   // after the deleted one to the end
   ...state.slice(action.i + 1)
   return state;
```
so its less of us removing the state by deleting it and its more of identifying the actual index and returning the state without it.

another example: `["wow","neat","cool","nice"];`

we wanna delete the 3rd one. we return wow and neat, skip cool, and return nice too:

`["wow","neat","nice"];`


# Hot Reloading Redux Reducers with webpack

we can do live reload in our jsx fine, but if we want to change our reducer (ex: we want to change -click = 1 like to click = 10 likes) we have to do some additional work:

store.js:
```
//allows hot reload by checking to see if module has changed first then...something?
if (module.hot) {
   module.hot.accept('./reducers/', () => {
      const nextRootReducer = require('./reducers/index').default;
      store.replaceReducer(nextRootReducer);
   });
}
```
^ definitely worth a review


# Redux DevTools
redux devTools' 'sweep' tab literally logs every action that is fired off and displays the state, action, etc...if you want to go 'back in time' to say, debug something, you can simply click on that action to toggle it to remove it from happening in the UI.

an abridged description of Redux DevTools tabs:
===
* sweep = remove any actions from your UI/log
* commit = works similar to git commit...adds any change to be the initial state
* revert = reverts anything since your last commit
* reset = brings all actions (including commits) all the way back to initial state


# Course wrap-up
main ideas of redux

1. all state lives in a giant object, a store.
2. we update the store with 'actions'
3. we have 'action creators' that create actions that include what happened and a payload of info thats needed (ex: where did this happen)
4. when the actions get dispatched, they get handled by a reducer
5. the reducer is responsible for updating your state.

* we used `matchStateToProps()` and `matchDispatchToProps()` in order to expose our state and our action functions to our components (using `connect()`).
