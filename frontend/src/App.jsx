import { useEffect, useState } from "react";

// const API_URL = import.meta.env.VITE_API_URL;
const API_URL = "https://django-task-f9g6.onrender.com";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [posts, setPosts] = useState([]);

  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});

  const [message, setMessage] = useState("");

  // =========================
  // FETCH ALL POSTS
  // =========================

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/posts/`
      );

      const data = await response.json();

      if (response.ok) {
        setPosts(data);
      } else {
        setMessage("Failed to load posts.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to connect to backend.");
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

    if (!username.trim() || !password.trim()) {
      setMessage("Username and password are required.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
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
        setMessage(
          "Invalid username or password."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    }
  };

  // =========================
  // CREATE POST
  // =========================

  const createPost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage(
        "Title and content are required."
      );
      return;
    }

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/`,
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
        setMessage(
          "Post created successfully!"
        );

        setTitle("");
        setContent("");

        fetchPosts();
      } else {
        console.log(data);
        setMessage("Failed to create post.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
    }
  };

  // =========================
  // FETCH COMMENTS
  // =========================

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}/comments/`
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
      setMessage("Unable to connect to backend.");
    }
  };

  // =========================
  // ADD COMMENT
  // =========================

  const addComment = async (postId, text) => {
    if (!text.trim()) {
      setMessage("Comment cannot be empty.");
      return;
    }

    if (!token) {
      setMessage(
        "Please login to add a comment."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/posts/${postId}/comments/`,
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
        setMessage(
          "Comment added successfully!"
        );

        setCommentText((previousComments) => ({
          ...previousComments,
          [postId]: "",
        }));

        // Reload comments
        fetchComments(postId);
      } else {
        console.log(data);
        setMessage("Failed to add comment.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend.");
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
  // UI
  // =========================

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
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
          {/* =========================
              LOGGED IN SECTION
          ========================= */}

          <p>
            <strong>You are logged in.</strong>
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
              rows="5"
              cols="50"
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

      {message && <p>{message}</p>}

      <hr />

      {/* =========================
          ALL POSTS
      ========================= */}

      <h2>All Blog Posts</h2>

      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>{post.title}</h3>

            <p>{post.content}</p>

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
              <div style={{ marginTop: "15px" }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={
                    commentText[post.id] || ""
                  }
                  onChange={(e) =>
                    setCommentText({
                      ...commentText,
                      [post.id]:
                        e.target.value,
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
                  style={{
                    marginLeft: "8px",
                  }}
                >
                  Add Comment
                </button>
              </div>
            )}

            {/* =========================
                COMMENTS
            ========================= */}

            {comments[post.id] && (
              <div style={{ marginTop: "15px" }}>
                <h4>Comments</h4>

                {comments[post.id].length ===
                0 ? (
                  <p>No comments yet.</p>
                ) : (
                  comments[post.id].map(
                    (comment) => (
                      <div
                        key={comment.id}
                        style={{
                          padding: "10px",
                          borderTop:
                            "1px solid #ddd",
                        }}
                      >
                        <strong>
                          {
                            comment.author
                              .username
                          }
                        </strong>

                        <p>
                          {comment.content}
                        </p>

                        <small>
                          {comment.created_at}
                        </small>
                      </div>
                    )
                  )
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default App;