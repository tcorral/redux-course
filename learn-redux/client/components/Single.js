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
            <Comments postComments={postComments} {...this.props}/>
         </div>
      )
   }
});

export default Single;
