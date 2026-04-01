"use client";
import { useState, useEffect } from "react";

export default function LikersModal({ type, id, onClose }) {
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlMap = { post: `/api/posts/${id}/likers`, comment: `/api/comments/${id}/likers`, reply: `/api/replies/${id}/likers` };
    fetch(urlMap[type]).then(r => r.json()).then(d => { setLikers(d.likers || []); setLoading(false); });
  }, [type, id]);

  return (
    <div className="_likers_modal_overlay" onClick={onClose}>
      <div className="_likers_modal" onClick={e => e.stopPropagation()}>
        <h4>Liked by</h4>
        {loading ? <p>Loading...</p> : likers.length === 0 ? <p>No likes yet</p> : likers.map(u => (
          <div key={u.id} className="_likers_modal_item">{u.firstName} {u.lastName}</div>
        ))}
        <button className="_likers_modal_close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
