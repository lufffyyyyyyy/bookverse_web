const API_BASE = "/api";

/*  get current user  */
async function getCurrentUser() {
  const bust = Date.now();
  const res = await fetch(`${API_BASE}/me.php?b=${bust}`, {
    credentials: "include",
  });

  return res.json();
}

/* logout then hard-navigate to home with cache-buster */
async function logoutAndGoHome() {
  try {
    await fetch(`${API_BASE}/logout.php`, { credentials: "include" });
  } catch (_) { }

  location.replace(`/index.html?logged_out=${Date.now()}`);
}

/* ---- Navbar: show Login / My Profile / Logout based on session ----*/
function initAuthNav(requireAuth = false) {
  getCurrentUser()
    .then(({ user }) => {
      const navLogin = document.getElementById("navLogin");
      const navLogout = document.getElementById("navLogout");
      const navProfile = document.getElementById("navProfile");

      if (user) {
        if (navLogin) navLogin.style.display = "none";
        if (navProfile) navProfile.style.display = "inline";
        if (navLogout) {
          navLogout.style.display = "inline";
          navLogout.onclick = (e) => {
            e.preventDefault();
            logoutAndGoHome();
          };
        }
      } else {
        if (navLogin) navLogin.style.display = "inline";
        if (navProfile) navProfile.style.display = "none";
        if (navLogout) navLogout.style.display = "none";
        if (requireAuth)
          location.replace(
            "/login.html?next=" +
            encodeURIComponent(location.pathname + location.search)
          );
      }
    })
    .catch(() => {
      const navLogin = document.getElementById("navLogin");
      const navLogout = document.getElementById("navLogout");
      const navProfile = document.getElementById("navProfile");
      if (navLogin) navLogin.style.display = "inline";
      if (navProfile) navProfile.style.display = "none";
      if (navLogout) navLogout.style.display = "none";
      if (requireAuth) location.replace("/login.html");
    });
}

// Redirect to login if not authenticated; resolves to user object if logged in
async function ensureLoggedIn() {
  try {
    const { user } = await getCurrentUser();
    if (!user)
      location.replace(
        "/login.html?next=" +
        encodeURIComponent(location.pathname + location.search)
      );
    return user;
  } catch (_) {
    location.replace("/login.html");
  }
}

// Fetch and populate categories
async function initCategoryDropdown() {
  const dd = document.getElementById("navCategories");
  if (!dd) return;

  try {
    // Try fetching from API first
    const r = await fetch("/api/categories.php");
    const d = await r.json();
    let cats = d.categories || [];

    // Fallback if empty
    if (cats.length === 0) {
      cats = ["Fantasy", "Sci-Fi", "Mystery", "Thriller", "Romance", "Non-Fiction"];
    }

    dd.innerHTML = cats.map(c =>
      `<a href="/index.html?category=${encodeURIComponent(c)}">${escapeHTML(c)}</a>`
    ).join("");

  } catch (e) {
    console.error("Failed to load categories", e);
  }
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

// Expose in global (handy for debugging in console)
window.BookVerse = {
  getCurrentUser,
  logoutAndGoHome,
  initAuthNav,
  ensureLoggedIn,
  initCategoryDropdown
};

// Auto-init if present
document.addEventListener("DOMContentLoaded", initCategoryDropdown);
