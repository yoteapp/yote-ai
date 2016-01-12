import AppDispatcher from "../../dispatcher";
import PostConstants from "./PostConstants";
import PostAPI from "./PostAPI";

export default {
	//list posts
	requestPostsList() {
		console.log("requesting posts list in actions");
		PostAPI.getAllPosts();
	}
	, receivedPostsList(posts) {
		console.log("received posts list in actions");
		//this whole file seems redundant. it receives the method from API, then sends the same exact thing to dispatcher.
		// only different is methodName is camelcase and ACTIONTYPE is from the constants file.
		AppDispatcher.dispatch({
			actionType: PostConstants.RECEIVED_POSTS_LIST
			, posts: posts
		});
	}

	//get post
	, requestSinglePost(postId) {
		console.log("requesting single post in ACTIONS");
		PostAPI.getPost(postId);
	}
	, receivedSinglePost(post) {
		console.log("received single post in actions");
		AppDispatcher.dispatch({
			actionType: PostConstants.RECEIVED_POST
			, post: post
		});
	}
}