not necessarily about redux, but look at react-router in the `reduxstagram.js` file:
```
import React from 'react';
import { render } from 'react-dom';
import css from './styles/style.styl';
import Main from './components/Main';
import PhotoGrid from './components/PhotoGrid';
import Single from './components/Single';

//import react router deps
import { Router, Route, IndexRoute, BrowserHistory } from 'react-router';

const router = (
   <Router history={ BrowserHistory }>
      <Route path="/" component={ Main }>
         <IndexRoute component={ PhotoGrid }></IndexRoute>
         <Route path="/view/:postId" component={ Single }></Route>
      </Route>
   </Router>
)

render(router, document.getElementById("root"));

```

first, we've created our simple components in other files and imported them here. then we've declared our router as its own component, with `const = router`. Then we've specified at '/' will be our Main component and its children components will be the `PhotoGrid` and `Single` components. if path is the index (which is '/'), the index child component will be Photogrid, if the view is not, its path will be whatever the postId is and the component will be the 'Single' component. We then add the 'router' const to our render function so this router will show up.

Also important to note, this is our `Main` component...take a look at where `this.props.children` resides:

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

### CREATING OUR REDUX STORE


in redux, we keep all our data in a 'store'...rather than holding our component state in the component, we just contain it in one giant object.

1. create a store.js file
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


you can currently think about the store as an empty DB

we need to know about
===

actions:
- something that happens in your app (someone clicks a photo, someone likes it, someone deletes a comment, etc)...whenever this happens someone dispatches an action...the dispatch action has 2 things:

1. type of action that happen (EX: incrementLikes)
2. a payload of information that is needed (EX: which comment got deleted, what comment was added, just info about what specifically happened).

^ so the dispatch action contains what happened and where.

action creators



now what I've done is create a new directory under '/client' called '/actions' with a new file in it called 'actionCreators.js'...

inside here...
```
// increment likes

/* we're going to return an object because actions are just objects with a type (which is a name) and in this case, an index that describes what it is...the object is an identifier, at the end of the day */

export function increment(index) {
   return {
      type: 'INCREMENT_LIKES',
      index    //this is the es6 shortened version of 'index:index'
   }
}

// add comment
export function addComment(postId, author, comment) {
   return {
      type: 'ADD_COMMENT',
      postId,
      author,
      comment,
   }
}

// remove comment
export function removeComment(postId, i) {
   return {
      type: 'REMOVE_COMMENT',
      i,
      postId
   }
}

//NOTE: changing a page/view is also an action but is being handled by react-router

/*
these are the 'action creators'. we call them 'action creators' because the object returned is considered the 'action' but the function itself is the creator that will dispatch it out when called. sounds weird as hell but I'm rolling with it.
*/

```


next we'll need to create the second part of these action creators, so when these actions get fired or dispatched, how do we actually handle that data (how do we update those likes, add that comment, etc)...this is in REDUCERS.

we just learned that actions/action creators get fired off or 'dispatched' with info about what happened...what it doesnt do is update our state (in redux, our store).

we need to create a 'reducer' to be able to handle and update the actual state.

think of actions like regular JS events (click, scroll, hover, etc) and those events are going to happen, but if no one is listening to that click nothing happens. 'reducers' listen to those events.

we create a 'reducer' for every single piece of state. when posts get updated when run the 'posts reducer' and when the comments get updated, we create a 'comments reducer'.

lets create a reducer...


we created a '/reducers' directory, with `posts.js` and `comments.js` inside:

posts.js
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
^ //state syntax may look strange but it just sets state as a default empty array if nothing has been declared in it.


comments.js
```
function comments(state =[], action) {
   console.log(state, action);
   return state;
}

export default comments;
```

BUT we can only have ONE REDUCER? WE NEED TO PUT BOTH REDUCERS IN ONE BIG REDUCER...lets make an index.js file in '/reducers':

index.js:
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


In the next vid we will hook it up to our app so we can fire off our actions and make sure things are running...its a lot to put together before we can see this shit run.



### Integrating our store with react router



so far our app doesnt know anything about our store, so lets change that.

`import { Provider } from 'react-redux';`

lets also import our store we created in addition to the history (still unsure what the 'history' portion does):

`import store, { history } from './store';`


now when we open our browser again we see all these console.log()s firing off with objects filled with post and comment content. but we dont see actions for 'Increment_likes' or "Add_comment" like declared in our 'actionCreators.js' file

in reduxstagram.js we've already imported our "Provider", now we're going to use it as an element to expose our store to our application. we'll do this by wrapping `<Provider>` around our `<Router>` component:
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

now lets replace the prop value 'BrowserHistory' in <Router> to match 'history' that we've created in store.js:
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

we've imported the Provider (dont know what this does) from react-redux, we wrapped our router in the <Provider> component, exposing our app to the redux state, then we had previously defined history in store.js like this:
```
//create our history with the store to be exported (IDK what this method does)
export const history = syncHistoryWithStore(browserHistory, store);
```

^ also important to note that browserHistory is imported from 'react-router' and 'store' is a const we created in store.js..this lead us to our HUGE BUG THAT TOOK 30 MINS TO RESOLVE.

problem: (dont have time to figure this out)
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

solution:
```
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

let combinedReducers = combineReducers({
    routing: routerReducer,
    rootReducer
});

// const store = createStore(combinedReducers, composeWithDevTools());

//create our store (IDK what this stuff is)
const store = createStore(combinedReducers, defaultState);

//create our history with the store to be exported (IDK what this method does)
export const history = syncHistoryWithStore(browserHistory, store);

//export our store
export default store;

```



So now our store is exposed to our app and we can check it out via going to our 'react' tab in devtools, selecting <Provider>, then in the console:
`$r.store.getState();`







OOOOOK.

### Understanding the reducer's job and dispatching actions


reminder: an action states what has happened and where, and the reducer is the change that then happens.

^ How do we hook them up together?

we dispatch an action, and the reducer listens for the action and then does something to handle that action.

action =the event, reducer = the listener


if you look in your react tab, click on <Provider>, then its 'store' prop, you'll see a 'dispatch' action there.

then you can go to console and:
`$r.store.dispatch();`


now lets do it similar to the 'increment' function in actionCreators.js:

`$r.store.dispatch({ type: 'INCREMENT_LIKES', index: 0 });`

now we'll see that this runs:
```
$r.store.dispatch({ type: 'INCREMENT_LIKES', index: 0 });

posts.js:7 The post will change
posts.js:8 []length: 0__proto__: Array(0) Object {type: "INCREMENT_LIKES", index: 0}
comments.js:2 []length: 0__proto__: Array(0) Object {type: "INCREMENT_LIKES", index: 0}
Object {type: "INCREMENT_LIKES", index: 0}
```


^ so what we see here, and what IS FUNDAMENTAL TO UNDERSTANDING REDUX is that when we dispatch an action, ALL reducers will be run...so the posts.js and comments.js both run and whether you choose to act on that action or not is up to the reducer.

^ REMEMBER THIS.

so we need to write some logic inside our reducer to listen and do something for the specific action.

ONE MORE TIME: WHEN YOU DISPATCH AN ACTION, EVERY REDUCER RUNS. IF YOU WANT TO ACT UPON THAT ACTION, YOU HAVE TO DEFINE THAT IN THE REDUCER.


### Accessing Dispatch and State with Redux


we've got a bunch of stuff set up, but nothing on the page. lets get some posts and comments in here, but how to do it the redux way?

now in react, we have something defined top level and just pass it down via props until we get to the component and elements we want to show the stuff. in redux, we have this thing called "connect" that injects data at the component level we want it at, and then if we wanna pass it down, we can.


* short version: how to populate data? in react we typically pass state in at the top level and then pass it down to wherever it should go via props. In redux, we use "connect" to inject data at the component level we want it at, then pass it down if we want.

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


function mapStateToProps(state){
   return {
      posts: state.posts,
      comment: state.comments
   }
}

function mapDispatchToProps(dispatch){
   return bindActionCreators(actionCreators, dispatch);
}


^ remember when we were manually running `$r.store.dispatch({type: 'INCREDMENT_LIKES', index: 0});`? now this does it for us evidently?

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


as you see in `App.js` we've imported 'Main' already, but we havent used it...lets use it.

`const App = connect( mapStateToProps, mapDispatchToProps)(Main);`

^ this is CONFUSING. so we're using 'connect' to attach these two functions to our 'Main' component. These 2 functions pass down the data and the dispatch actions via props.

I went through a long bit of hell in debugging purely because I mispelled something and the 'combined reducers' function just magically is not in the course /13 folder..beats me. Im not going to talk about it, just rolling with it at this point. dont understand this stuff at all.


NOW when we look at our <Main> component in react we see our props that contain all our actions and all our data. nice, i guess.



### Displaying Redux state inside our components



if we look, we can see our <PhotoGrid> component has access to all the props of the parent <Main> component...this is because of what we had previously defined in "Main.js":
```
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
```

^ React.cloneElement passes down the props from Main to the first child

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

this works! so it adds the <Photo/> components properly, but it doesnt inherit any of the props, which it needs in order to display the photos...lets do that:

```
{ this.props.posts.map((post, i) => <Photo {...this.props} />)}
```


we also need to give it a key because each child should have a unique key...react needs a key to differentiate which photo is which. so we'll add that using the index 'i' as the unique key:

```
{ this.props.posts.map((post, i) => <Photo {...this.props} key={i} />)}
```

now we also need to pass the index value that goes along with it:
```
{ this.props.posts.map((post, i) => <Photo {...this.props} key={i} i={ i }/>)}
```


^ this looks weird...why cant we use 'key'? it looks like react reserves 'key' for itself so if you're looking for the unique identifier and want to use it, you have to pass in the index via i={i}.

now lets add the post prop:
```
{ this.props.posts.map((post, i) => <Photo {...this.props} key={i} i={ i } post={ post }/>)}
```


so now we can look in our react devtools and see we have a unique identifier 'i' and 'post' props as well..now lets take a look at photo.js:

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
                { post.caption }
               </Link>
            </div>
         </figure>
      )
   }
});

export default Photo;
```


so what we've done here is created a div wrapper, and given individual links to each Photo component using the native <Link> tag provided by importing it from 'react-router'..we then use some variables to shorten our props declarations so we dont constantly use 'this.props' all the time.

looks good! this actually shows up as individual links that go to specific URLs👍

these URLS go to urls based on the <Single> component we've defined in Main.js.

we're also adding some markup:
```
<Link to={`/view/${ post.code }`}>
   <img src={post.display_src} alt={post.caption} className="grid-photo" />
</Link>
```

now we'll add some animations:
```
<CSSTransitionGroup transitionName="like" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
<span key={post.likes} className="likes-heart">{post.likes}</span>
</CSSTransitionGroup>
```

now we need to allow the captions and following info:
```
<figcaption>
 <p>{post.caption}</p>
 <div className="control-buttons">
   <button onClick={this.props.increment.bind(null, i)} className="likes">&hearts; {post.likes}</button>
   <Link className="button" to={`/view/${post.code}`}>
     <span className="comment-count">
       <span className="speech-bubble"></span>
       {comments[post.code] ? comments[post.code].length : 0 }
     </span>
   </Link>
 </div>
</figcaption>
```

Looks good...now lets hook some stuff up so it looks good:


summary:

* defining `{React.cloneElement(this.props.children, this.props)};` within our main element made our props available to all of our components one level down, so we can access them in our <PhotoGrid> component. Likewise, our <Photo> component (which lives inside <Photogrid>) can access it as well.

* we used the native <Link> tag to link to a specific view passed via props:
`<Link className="button" to={`/view/${post.code}`}>`

* react needs unique identifiers for itself to differentiate between different components of the same type, in our case <Photo>s, and so we do this with the 'key' property:

`<Photo {...this.props} key={i} i={ i }/>`

we arent able to access 'key' so if we want to access a unique identifer for ourselves we have to declare it with i={i}


### Updating our state with reducers


when someone clicks a 'like' button, we want the 'increment' function to run.

we've already included the 'increment' function via props so we can pass it as a click handler:

in photo.js
```
<button onClick={this.props.increment()} className="likes">&hearts; {post.likes}</button>
```

^ and when clicking, we see that the event is being fired off.

we need to pass it its unique identifier...which you'd think would be 'i'...evidently if we did:
`onClick={this.props.increment(i)}`

^ this would only run on page load??? what?

I guess we need to pass this argument to the function on click...theres a few ways you could do this but wes bos is using .bind() method to do this:

`onClick={this.props.increment.bind(null, i)}`


HOLD UP: lets talk about bind() real quick.

REFER TO BIND()_NOTES.MD FILE.



so now when we click the button, all of our reducers show up:
```

(24) [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object]

Object {type: "INCREMENT_LIKES", index: 0}
comments.js:2

Object {BAhvZrRwcfu: Array(1), BAcyDyQwcXX: Array(4), BAPIPRjQce9: Array(9), BAF_KY4wcRY: Array(8), _4jHytwcUA: Array(1)…} Object {type: "INCREMENT_LIKES", index: 0}
```


********
now in lets have a bit of an aside about pure and impure functions:
********

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




now lets roll back and start coding what goes on in our reducer:
in reducers/posts.js:
```
function posts(state =[], action) {
   switch(action.type) {
      case 'INCREMENT_LIKES' :
         console.log("Incrementing Likes!");
      // return the updated state
      default:
         return state;
   }
}
```

so we'll create a switch statement to do something if it is the INCREMENT_LIKES action dispatcher.
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

^ so in the case of INCREMENT_LIKES, we're returning a new 'state' array with a new copy of the existing state array (via the ...spread operator and slice()), and the only thing we're updating is the specific post's state's 'like' value.

weird, but im getting to understand it a bit better.





### Displaying the single component



lets create the layout from our 'single' photo component:
```
import React from 'react';
import Photo from './Photo';

const Single = React.createClass({
   render() {
      //we need the index of the post (we get through finding the specific url code then the index)...
      const i = this.props.posts.findIndex((post) => post.code === this.props.params.postId);

      //the post itself, found with 'i'
      const post = this.props.posts[i];
      console.log(post);


      return (
         <div className="single-photo">
            <Photo i={i} post={post} {...this.props} />
         </div>
      )
   }
});

export default Single;

```


now create the comments layout in a new file:
```
import React from 'react';
import Photo from './Photo';

const Comments = React.createClass({
   render() {
      return (
         <div className="comment">
            I'm the comments!!!
         </div>
      )
   }
});

export default Comments;

```

^ now lets import it in Single.js and we'll be good!



### Displaying state inside our components



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

now we'll iterate over all the comments in the comments prop using .map() in the <Comment> component file:
```
import React from 'react';
import Photo from './Photo';

const Comments = React.createClass({
   renderComment(comment, i) {
      console.log(comment);
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

^ now if we save and check, we'll see each comment object being console.log()ged. Thats good, now lets put it as some actual DOM markup:

```
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
```

^ populating comments to the DOM, looks good. now lets make a form element like on the reduxtagram demo where people can add comments themselves:
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

Nice



### Updating comment state in our store


when we submit a new comment, it just refreshes the page. its not hooked up to anything. lets add a submit handler to our form:

```
   handleSubmit(e) {
      e.preventDefault();
      console.log("submitting");
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

we can type something into the inputs, type enter and we see the console.log() firing off. so thats good. we need to get the text from these inputs, and thats what we use the 'refs' for! when you need to get data out of a text input, in react we use refs.

so instead of `console.log("submitting");` we'll do: `console.log(this.refs);`
```

   handleSubmit(e) {
      e.preventDefault();
      const { postId } = this.props.params;
      const author = this.refs.author.value;
      const comment = this.refs.comment.value;
      console.log(postId, author, comment);
   },
```

we're running into an error where 'postId' is not defined. we can check for props on our <Comments/> component in the react tab and see that we're not getting props for params, so we need to pass those params to the <Comment/> component where we're using it in the Single.js file:
```

      return (
         <div className="single-photo">
            <Photo i={i} post={post} {...this.props} />
            <Comments postComments={postComments} {...this.props}/>
         </div>
      )
```

so now we can see the console.log firing off correctly! nice!

we want to take these form comments and use them to update our state. remember how do we update our state in redux? we use a REDUCER!!!!

so lets roll to actionCreators.js and add some stuff to handle updating the state..we'll see that we will use our addComment() function we've already created, so this should work nicely.

if you remember us passing all the props onto the <comment> component via `{...this.props}` you'll be able to look in the react console tab and see a 'addComment' prop attached to te <comment> component prop list. we'll use this in our 'handleSubmit()' function:

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

lets run a console.log() to make sure stuff is running in our 'addComment()' function in 'actionCreators.js'
```
// add comment
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

nice. its working, our action is being dispatched. now we should actually update the state. so lets review this real quick:

1. we use 'ref' attributes to get values from text inputs
2. we've passed along all props from the <single> component to the <comment> component via {...this.props}. our props also include our reducer functions like addComment() removeComment() incremementLikes() and so forth.
4. we use the addComment() function in our handleSubmit() function:

`this.props.addComment(postId, author, comment);`

5. we added a console.log() statement to check and make sure the action is being dispatched, and it is.



### Redux Reducer Composition



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


* so we create different functions to handle different things. one function to update the specific post ID comment state and one function to return the overall state with the newly updated postID comment state inside it. this is why postComments() is considered a sub-reducer, because it is used as a reducer within a reducer. fucking bizzare. wow.


in our handleSubmit() function in Comment.js, we can also add a reset() method for the Form:
`this.refs.commentForm.reset();`



so we're good on adding a comment, lets handle removing a comment as well.

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


^ see! "removing a comment"..lets hook this up to be fired off in our remove-comment button via a click handler:

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

now if we check the removeComment() function declaration, we'll see that it needs 2 args, a postId and unique index of the comment so we know,"is this the 1st comment? the 5th comment? etc?". also we'll use bind so we always make sure we get the right instances of the unique index:

```
   <button className="remove-comment" onClick={this.props.removeComment.bind(null, this.props.params.postId, i)}>&times;</button>
```

^ REVIEW THIS!!!!

now when we click to remove a comment, we can see the 'removing a comment' console.log() firing off. we're just returning the state, as you can see here in comments.js:
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

but we need to return the updated state without that comment, so we'll do like we did last time in updating the comment, updating the specific area via .slice() method:

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
         //we need to return the new state without the deleted comment
         return [
         // from the start to the one we want to delete
         ...state.slice(0, action.i)]
         // after the deleted one to the end
         ...state.slice(action.i + 1)
         return state;
      default:
         return state;
   }
   return state;
}

```

so its less of us removing the state by deleting it and its more of identifying the actual index and returning the state without it. this up here returns the state from 0 to the specific index and then also returns the state from the index + 1 (the one after it) to the end of the state list. hmmm.

here's an example:

```
["wow","neat","cool","nice"];
```

we wanna delete the 3rd one. we return wow and neat, skip cool, and return nice too:

```
["wow","neat","nice"];
```




### Hot Reloading Redux Reducers with webpack


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

///////////////////////////y ////////////////////////////////////////////
Redux DevTools
///////////////////////////////////////////////////////////////////////

redux devTools' 'sweep' tab literally logs every action that is fired off and displays the state, action, etc...if you want to go 'back in time' to say, debug something, you can simply click on that action to toggle it to remove it from happening in the UI.

- sweep = remove any actions from your UI/log
- commit = works similar to git commit...adds any change to be the initial state
- revert = reverts anything since your last commit
- reset = brings all actions (including commits) all the way back to initial state



### course wrap-up


main ideas of redux

1. all state lives in a giant object, a store.
2. we update the store with 'actions'
3. we have 'action creators' that create actions that include what happened and a payload of info thats needed (ex: where did this happen)
4. when the actions get dispatched, they get handled by a reducer
5. the reducer is responsible for updating your state.

- we used 'matchStateToProps()' and 'matchDispatchToProps()' in order to expose our state and our action functions to our components (using connect()).

