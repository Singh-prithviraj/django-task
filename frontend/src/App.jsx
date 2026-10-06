import { useEffect, useState } from "react";

function App() {
  // =========================
  // LOGIN STATES
  // =========================
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );

  // =========================
  // POST STATES
  // =========================
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState([]);

  // =========================
  // COMMENT STATES
  // =========================
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const [message, setMessage] = useState("");

  // =========================
  // GET ALL POSTS
  // =========================
  const fetchPosts = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/posts/"
      );

      const data = await response.json();

      if (response.ok) {
        setPosts(data);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load posts.");
    }
  };

  // Load posts when application starts
  useEffect(() => {
    fetchPosts();
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/api/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "access_token",
          data.access
        );

        setToken(data.access);

        setMessage("Login successful!");

        setUsername("");
        setPassword("");
      } else {
        setMessage("Invalid username or password.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  };

  // =========================
  // CREATE POST
  // =========================
  const createPost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Title and content are required.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/posts/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title,
            content: content,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Post created successfully!");

        setTitle("");
        setContent("");

        // Refresh post list
        fetchPosts();
      } else {
        setMessage("Failed to create post.");
        console.log(data);
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  };

  // =========================
  // GET COMMENTS
  // =========================
  const fetchComments = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/posts/${postId}/comments/`
      );

      const data = await response.json();

      if (response.ok) {
        setComments((previousComments) => ({
          ...previousComments,
          [postId]: data,
        }));
      } else {
        setMessage("Failed to load comments.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  };

  // =========================
  // CREATE COMMENT
  // =========================
  const addComment = async (postId, text) => {
    if (!text.trim()) {
      setMessage("Comment cannot be empty.");
      return;
    }

    if (!token) {
      setMessage("Please login to add a comment.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/posts/${postId}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: text,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Comment added successfully!");

        // Clear input
        setCommentText((previousComments) => ({
          ...previousComments,
          [postId]: "",
        }));

        // Reload comments
        fetchComments(postId);
      } else {
        setMessage("Failed to add comment.");
        console.log(data);
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("access_token");

    setToken(null);

    setMessage("Logged out successfully.");
  };

  // =========================
  // FRONTEND
  // =========================
  return (
    <div>
      <h1>Django Blog</h1>

      {/* =========================
          LOGIN SECTION
      ========================= */}
      {!token ? (
        <form onSubmit={login}>
          <h2>Login</h2>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <br />
          <br />

          <button type="submit">
            Login
          </button>
        </form>
      ) : (
        <div>
          <p>
            You are logged in.
          </p>

          <button onClick={logout}>
            Logout
          </button>

          <hr />

          {/* =========================
              CREATE POST
          ========================= */}
          <h2>Create Post</h2>

          <form onSubmit={createPost}>
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <br />
            <br />

            <textarea
              placeholder="Post content"
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
            />

            <br />
            <br />

            <button type="submit">
              Create Post
            </button>
          </form>
        </div>
      )}

      {/* =========================
          MESSAGE
      ========================= */}
      <p>{message}</p>

      <hr />

      {/* =========================
          ALL POSTS
      ========================= */}
      <h2>All Blog Posts</h2>

      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id}>

            <h3>{post.title}</h3>

            <p>
              {post.content}
            </p>

            <p>
              <strong>Author:</strong>{" "}
              {post.author.username}
            </p>

            <p>
              <strong>Post ID:</strong>{" "}
              {post.id}
            </p>

            {/* =========================
                LOAD COMMENTS
            ========================= */}
            <button
              onClick={() =>
                fetchComments(post.id)
              }
            >
              Load Comments
            </button>

            {/* =========================
                ADD COMMENT
            ========================= */}
            {token && (
              <div>
                <br />

                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={
                    commentText[post.id] || ""
                  }
                  onChange={(e) =>
                    setCommentText({
                      ...commentText,
                      [post.id]: e.target.value,
                    })
                  }
                />

                <button
                  onClick={() =>
                    addComment(
                      post.id,
                      commentText[post.id] || ""
                    )
                  }
                >
                  Add Comment
                </button>
              </div>
            )}

            {/* =========================
                COMMENTS
            ========================= */}
            {comments[post.id] && (
              <div>
                <h4>Comments</h4>

                {comments[post.id].length === 0 ? (
                  <p>
                    No comments yet.
                  </p>
                ) : (
                  comments[post.id].map(
                    (comment) => (
                      <div key={comment.id}>

                        <strong>
                          {comment.author.username}
                        </strong>

                        <p>
                          {comment.content}
                        </p>

                        <small>
                          {comment.created_at}
                        </small>

                        <hr />
                      </div>
                    )
                  )
                )}
              </div>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default App;