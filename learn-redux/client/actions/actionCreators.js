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
      comment
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

/*these are the 'action creators'. we call them 'action creators' because the object returned is considered the 'action' but the function itself is the creator that will dispatch it out when called. sounds weird as hell but im rolling with it. */
