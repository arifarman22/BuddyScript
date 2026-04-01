"use client";
import { useState, useRef } from "react";
import Avatar from "./Avatar";

export default function CreatePost({ currentUser, onPostCreated }) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!content.trim() && !image) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("content", content);
    fd.append("visibility", visibility);
    if (image) fd.append("image", image);

    const res = await fetch("/api/posts", { method: "POST", body: fd });
    const post = await res.json();
    onPostCreated(post);
    setContent("");
    setImage(null);
    setPreview(null);
    setVisibility("public");
    setLoading(false);
  }

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image" style={{ marginRight: 8 }}>
          <Avatar firstName={currentUser?.firstName} lastName={currentUser?.lastName} />
        </div>
        <div className="_feed_inner_text_area_box_form">
          <textarea
            className="form-control _textarea"
            placeholder="Write something ..."
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{ width: "100%", height: 86, border: "none", padding: 8 }}
          />
        </div>
      </div>
      {preview && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <img src={preview} alt="preview" className="_image_preview" />
          <button onClick={() => { setImage(null); setPreview(null); }} style={{ position: "absolute", top: 10, right: 4, background: "#e74c3c", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 12 }}>✕</button>
        </div>
      )}
      <input type="file" accept="image/*" ref={fileRef} onChange={handleImage} style={{ display: "none" }} />
      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_text_area_item">
          <div className="_feed_inner_text_area_bottom_photo _feed_common" onClick={() => fileRef.current.click()}>
            <button type="button" className="_feed_inner_text_area_bottom_photo_link">
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411z" />
                </svg>
              </span>
              Photo
            </button>
          </div>
          <div className="_feed_common">
            <select className="_visibility_select" value={visibility} onChange={e => setVisibility(e.target.value)}>
              <option value="public">🌍 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </div>
        </div>
        <div className="_feed_inner_text_area_btn">
          <button type="button" className="_feed_inner_text_area_btn_link" onClick={handleSubmit} disabled={loading}>
            <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
              <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
            </svg>
            <span>{loading ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
