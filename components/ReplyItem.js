"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import LikersModal from "./LikersModal";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function ReplyItem({ reply }) {
  const [liked, setLiked] = useState(reply.liked);
  const [likeCount, setLikeCount] = useState(reply.likeCount);
  const [showLikers, setShowLikers] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/replies/${reply.id}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(c => data.liked ? c + 1 : c - 1);
  }

  return (
    <div className="_comment_main _reply_area" style={{ marginBottom: 16 }}>
      <div className="_comment_image">
        <Avatar firstName={reply.author.firstName} lastName={reply.author.lastName} />
      </div>
      <div className="_comment_area">
        <div className="_comment_details" style={{ marginBottom: 30 }}>
          <div className="_comment_name">
            <h4 className="_comment_name_title">{reply.author.firstName} {reply.author.lastName}</h4>
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text"><span>{reply.content}</span></p>
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
              <li><span className="_time_link">.{timeAgo(reply.createdAt)}</span></li>
            </ul>
          </div>
        </div>
      </div>
      {showLikers && <LikersModal type="reply" id={reply.id} onClose={() => setShowLikers(false)} />}
    </div>
  );
}
