import { useEffect, useState } from "react";
import { addComment, getComments } from "../api/issues";

export default function Comments({ issueId }) {
  const [body, setBody] = useState("");
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadComments = async () => {
    try {
      const data = await getComments(issueId);
      setComments(data);
    } catch (err) {
      setError("Failed to load comments");
    }
  };

  useEffect(() => {
    loadComments();
  }, [issueId]);

  const submit = async () => {
    setMessage("");
    setError("");
    try {
      await addComment(issueId, body);
      setBody("");
      setMessage("Comment added");
      loadComments(); // 🔥 reload after adding
    } catch (err) {
      setError("Failed to add comment");
    }
  };

  return (
    <div>
      <h4>Comments</h4>

      {/* Existing comments */}
      {comments.length === 0 && <p>No comments yet</p>}

      {comments.map((c) => (
        <div
          key={c.id}
          style={{ borderBottom: "1px solid #ddd", marginBottom: 8 }}
        >
          <p>{c.body}</p>
          <small>
            {new Date(c.created_at).toLocaleString()}
          </small>
        </div>
      ))}

      <h4>Add Comment</h4>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment..."
      />
      <br />
      <button onClick={submit}>Post</button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
