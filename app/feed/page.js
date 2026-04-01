"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Avatar from "@/components/Avatar";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";

export default function FeedPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [profileDrop, setProfileDrop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
    });
  }, [router]);

  const loadPosts = useCallback(async (cursor) => {
    const url = cursor ? `/api/posts?cursor=${cursor}` : "/api/posts";
    const res = await fetch(url);
    if (!res.ok) return { posts: [], nextCursor: null };
    const data = await res.json();
    return data;
  }, []);

  useEffect(() => {
    if (!user) return;
    loadPosts().then(data => {
      setPosts(data.posts);
      setNextCursor(data.nextCursor);
      setLoading(false);
    });
  }, [user, loadPosts]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const data = await loadPosts(nextCursor);
    setPosts(p => [...p, ...data.posts]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }

  async function logout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    router.push("/login");
  }

  function onPostCreated(post) {
    setPosts(p => [post, ...p]);
  }

  useEffect(() => {
    function handleScroll() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMore();
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  if (!user) return <div className="_loading_spinner">Loading...</div>;

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="_main_layout">
        {/* Desktop Nav */}
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
          <div className="container _custom_container">
            <div className="_logo_wrap">
              <a className="navbar-brand" href="/feed">
                <img src="/images/logo.svg" alt="Image" className="_nav_logo" />
              </a>
            </div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                <li className="nav-item _header_nav_item">
                  <a className="nav-link _header_nav_link_active _header_nav_link" href="/feed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                      <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                      <path className="_home_active" stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
                    </svg>
                  </a>
                </li>
              </ul>
              <div className="_header_nav_profile">
                <div className="_header_nav_profile_image" style={{ marginRight: 8 }}>
                  <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                </div>
                <div className="_header_nav_dropdown" onClick={() => setProfileDrop(!profileDrop)}>
                  <p className="_header_nav_para">{user.firstName} {user.lastName}</p>
                  <button className="_header_nav_dropdown_btn" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                      <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                    </svg>
                  </button>
                </div>
                <div className={`_nav_profile_dropdown _profile_dropdown ${profileDrop ? "show" : ""}`}>
                  <div className="_nav_profile_dropdown_info">
                    <div className="_nav_profile_dropdown_image" style={{ paddingRight: 8 }}>
                      <Avatar firstName={user.firstName} lastName={user.lastName} />
                    </div>
                    <div className="_nav_profile_dropdown_info_txt">
                      <h4 className="_nav_dropdown_title">{user.firstName} {user.lastName}</h4>
                    </div>
                  </div>
                  <hr />
                  <ul className="_nav_dropdown_list">
                    <li className="_nav_dropdown_list_item">
                      <a href="#" className="_nav_dropdown_link" onClick={(e) => { e.preventDefault(); logout(); }}>
                        <div className="_nav_drop_info">
                          <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                              <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667" />
                            </svg>
                          </span>
                          Log Out
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Header */}
        <div className="_header_mobile_menu">
          <div className="_header_mobile_menu_wrap">
            <div className="container">
              <div className="_header_mobile_menu">
                <div className="row">
                  <div className="col-12">
                    <div className="_header_mobile_menu_top_inner">
                      <div className="_header_mobile_menu_logo">
                        <a href="/feed"><img src="/images/logo.svg" alt="Image" className="_nav_logo" /></a>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{user.firstName}</span>
                        <button onClick={logout} style={{ border: "1px solid #1890FF", background: "transparent", borderRadius: 6, padding: "4px 12px", color: "#1890FF", fontSize: 12, cursor: "pointer" }}>Logout</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="_mobile_navigation_bottom_wrapper">
          <div className="_mobile_navigation_bottom_wrap">
            <div className="container">
              <div className="row">
                <div className="col-12">
                  <ul className="_mobile_navigation_bottom_list">
                    <li className="_mobile_navigation_bottom_item">
                      <a href="/feed" className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="27" fill="none" viewBox="0 0 24 27">
                          <path className="_mobile_svg" fill="#000" fillOpacity=".6" stroke="#666666" strokeWidth="1.5" d="M1 13.042c0-2.094 0-3.141.431-4.061.432-.92 1.242-1.602 2.862-2.965l1.571-1.321C8.792 2.232 10.256 1 12 1c1.744 0 3.208 1.232 6.136 3.695l1.572 1.321c1.62 1.363 2.43 2.044 2.86 2.965.432.92.432 1.967.432 4.06v6.54c0 2.908 0 4.362-.92 5.265-.921.904-2.403.904-5.366.904H7.286c-2.963 0-4.445 0-5.365-.904C1 23.944 1 22.49 1 19.581v-6.54z" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              {/* Left Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_left_sidebar_wrap">
                  <div className="_layout_left_sidebar_inner">
                    <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <h4 className="_left_inner_area_explore_title _title5 _mar_b24">Explore</h4>
                      <ul className="_left_inner_area_explore_list">
                        <li className="_left_inner_area_explore_item"><a href="#" className="_left_inner_area_explore_link">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                          Feed</a>
                        </li>
                        <li className="_left_inner_area_explore_item"><a href="#" className="_left_inner_area_explore_link">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                          Friends</a>
                        </li>
                        <li className="_left_inner_area_explore_item"><a href="#" className="_left_inner_area_explore_link">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                          Saved</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Feed */}
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <div className="_layout_middle_inner">
                    <CreatePost currentUser={user} onPostCreated={onPostCreated} />
                    {loading ? (
                      <div className="_loading_spinner">Loading posts...</div>
                    ) : posts.length === 0 ? (
                      <div className="_loading_spinner">No posts yet. Be the first to post!</div>
                    ) : (
                      <>
                        {posts.map(p => <PostCard key={p.id} post={p} currentUser={user} />)}
                        {loadingMore && <div className="_loading_spinner">Loading more...</div>}
                        {nextCursor && !loadingMore && (
                          <div style={{ textAlign: "center", padding: 16 }}>
                            <button onClick={loadMore} className="_feed_inner_text_area_btn_link" style={{ margin: "0 auto" }}>
                              <span>Load More</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <div className="_layout_right_sidebar_wrap">
                  <div className="_layout_right_sidebar_inner">
                    <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                      <div className="_right_inner_area_info_content _mar_b24">
                        <h4 className="_right_inner_area_info_content_title _title5">Welcome!</h4>
                      </div>
                      <hr className="_underline" />
                      <div className="_right_inner_area_info_box">
                        <div className="_right_inner_area_info_box_image" style={{ marginRight: 20 }}>
                          <Avatar firstName={user.firstName} lastName={user.lastName} size="lg" />
                        </div>
                        <div className="_right_inner_area_info_box_txt">
                          <h4 className="_right_inner_area_info_box_title">{user.firstName} {user.lastName}</h4>
                          <p className="_right_inner_area_info_box_para">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
