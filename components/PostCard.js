"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import CommentItem from "./CommentItem";
import LikersModal from "./LikersModal";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} minute${Math.floor(s / 60) > 1 ? "s" : ""} ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hour${Math.floor(s / 3600) > 1 ? "s" : ""} ago`;
  return `${Math.floor(s / 86400)} day${Math.floor(s / 86400) > 1 ? "s" : ""} ago`;
}

export default function PostCard({ post, currentUser }) {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [showLikers, setShowLikers] = useState(false);
  const [allCommentsLoaded, setAllCommentsLoaded] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(c => data.liked ? c + 1 : c - 1);
  }

  async function loadAllComments() {
    const res = await fetch(`/api/posts/${post.id}/comments`);
    if (!res.ok) return;
    const data = await res.json();
    setComments(data.comments);
    setAllCommentsLoaded(true);
    setShowComments(true);
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    const data = await res.json();
    setComments([data, ...comments]);
    setCommentCount(c => c + 1);
    setCommentText("");
    setShowComments(true);
  }

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image" style={{ marginRight: 16 }}>
              <Avatar firstName={post.author.firstName} lastName={post.author.lastName} size="lg" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{post.author.firstName} {post.author.lastName}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {timeAgo(post.createdAt)} . <span>{post.visibility === "private" ? "🔒 Private" : "Public"}</span>
              </p>
            </div>
          </div>
        </div>
        {post.content && <h4 className="_feed_inner_timeline_post_title">{post.content}</h4>}
        {post.imageUrl && (
          <div className="_feed_inner_timeline_image">
            <img src={post.imageUrl} alt="" className="_time_img" />
          </div>
        )}
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image" onClick={() => likeCount > 0 && setShowLikers(true)} style={{ cursor: likeCount > 0 ? "pointer" : "default" }}>
          {likeCount > 0 && (
            <div style={{ background: "#1890FF", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            </div>
          )}
          <p className="_feed_inner_timeline_total_reacts_para" style={{ marginLeft: likeCount > 0 ? -8 : 0, display: likeCount > 0 ? "flex" : "none" }}>{likeCount}</p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1" style={{ cursor: "pointer" }} onClick={loadAllComments}>
            <span>{commentCount}</span> Comment{commentCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${liked ? "_feed_reaction_active" : ""}`} onClick={toggleLike}>
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#1890FF" : "none"} stroke={liked ? "#1890FF" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              {" "}{liked ? "Liked" : "Like"}
            </span>
          </span>
        </button>
        <button className="_feed_inner_timeline_reaction_comment _feed_reaction" onClick={() => setShowComments(!showComments)}>
          <span className="_feed_inner_timeline_reaction_link">
            <span>
              <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
              </svg>
              {" "}Comment
            </span>
          </span>
        </button>
      </div>

      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <form className="_feed_inner_comment_box_form" onSubmit={submitComment}>
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <Avatar firstName={currentUser?.firstName} lastName={currentUser?.lastName} size="sm" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea className="form-control _comment_textarea" placeholder="Write a comment" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) submitComment(e); }} />
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="_timline_comment_main">
        {!allCommentsLoaded && commentCount > comments.length && (
          <div className="_previous_comment">
            <button type="button" className="_previous_comment_txt" onClick={loadAllComments}>
              View all {commentCount} comments
            </button>
          </div>
        )}
        {comments.map(c => <CommentItem key={c.id} comment={c} currentUser={currentUser} />)}
      </div>

      {showLikers && <LikersModal type="post" id={post.id} onClose={() => setShowLikers(false)} />}
    </div>
  );
}
