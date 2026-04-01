"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import ReplyItem from "./ReplyItem";
import LikersModal from "./LikersModal";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function CommentItem({ comment, currentUser }) {
  const [liked, setLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [replies, setReplies] = useState(comment.replies || []);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showLikers, setShowLikers] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(c => data.liked ? c + 1 : c - 1);
  }

  async function submitReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    const res = await fetch(`/api/comments/${comment.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText }),
    });
    const data = await res.json();
    setReplies([...replies, data]);
    setReplyText("");
    setShowReplyBox(false);
  }

  return (
    <div className="_comment_main" style={{ marginBottom: 16 }}>
      <div className="_comment_image">
        <Avatar firstName={comment.author.firstName} lastName={comment.author.lastName} />
      </div>
      <div className="_comment_area">
        <div className="_comment_details" style={{ marginBottom: 30 }}>
          <div className="_comment_details_top">
            <div className="_comment_name">
              <h4 className="_comment_name_title">{comment.author.firstName} {comment.author.lastName}</h4>
            </div>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text"><span>{comment.content}</span></p>
          </div>
          {likeCount > 0 && (
            <div className="_total_reactions" onClick={() => setShowLikers(true)} style={{ cursor: "pointer" }}>
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                </span>
              </div>
              <span className="_total">{likeCount}</span>
            </div>
          )}
          <div className="_comment_reply" style={{ position: "absolute", bottom: -25 }}>
            <ul className="_comment_reply_list">
              <li><span onClick={toggleLike} style={{ color: liked ? "#1890FF" : undefined, cursor: "pointer" }}>Like.</span></li>
              <li><span onClick={() => setShowReplyBox(!showReplyBox)} style={{ cursor: "pointer" }}>Reply.</span></li>
              <li><span className="_time_link">.{timeAgo(comment.createdAt)}</span></li>
            </ul>
          </div>
        </div>

        {replies.map(r => <ReplyItem key={r.id} reply={r} />)}

        {showReplyBox && (
          <div className="_feed_inner_comment_box" style={{ marginTop: 8 }}>
            <form className="_feed_inner_comment_box_form" onSubmit={submitReply}>
              <div className="_feed_inner_comment_box_content">
                <div className="_feed_inner_comment_box_content_image">
                  <Avatar firstName={currentUser?.firstName} lastName={currentUser?.lastName} size="sm" />
                </div>
                <div className="_feed_inner_comment_box_content_txt">
                  <textarea className="form-control _comment_textarea" placeholder="Write a reply" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) submitReply(e); }} />
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
      {showLikers && <LikersModal type="comment" id={comment.id} onClose={() => setShowLikers(false)} />}
    </div>
  );
}
