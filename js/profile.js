initAuthNav(true);

Promise.all([
  fetch("/api/me.php", { credentials: "include" }).then((r) => r.json()),
  fetch("/api/reviews.php", { credentials: "include" }).then((r) => r.json()),
  fetch("/api/favorites.php", { credentials: "include" }).then((r) => r.json()),
]).then(([me, rev, fav]) => {
  if (!me.user) {
    location.href = "/login.html";
    return;
  }

  const u = me.user;
  userCard.innerHTML = `<strong>${escapeHTML(u.name)}</strong><br><span class="book-meta">${escapeHTML(u.email)}</span>`;

  // Fill edit form
  document.getElementById("pName").value = u.name;
  document.getElementById("pEmail").value = u.email;

  // ✅ images live in htdocs/assets/books
  const FALLBACK = "/assets/placeholder.jpg";

  function coverSrc(r) {
    let v = (r.cover_url || "").trim();
    if (!v) return FALLBACK;

    // If full URL or already absolute, just use it
    if (/^https?:\/\//i.test(v) || v.startsWith("/")) {
      return encodeURI(v);
    }

    // Otherwise assume it's a filename stored in DB, e.g. "book1.jpg"
    // -> /assets/books/book1.jpg
    return "/assets/books/" + encodeURI(v.replace(/^\/+/, ""));
  }

  // Render Favorites
  const favList = document.getElementById("favoritesList");
  favList.innerHTML = (fav.favorites || []).length
    ? `<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.8rem;">` +
      fav.favorites
        .map(
          (b) => `
        <div class="card book-tile" id="fav-${b.id}" style="padding:0.6rem; position: relative;">
          <a href="/public/book.html?id=${b.id}" style="text-decoration:none; color:inherit;">
            <img src="${coverSrc(b)}" alt="${escapeHTML(b.title)}" style="height:180px">
            <strong style="font-size:0.9rem">${escapeHTML(b.title)}</strong>
          </a>
          <button onclick="removeFavorite(${b.id})" style="position:absolute; top:5px; right:5px; padding:0.2rem 0.4rem; background:rgba(255,255,255,0.9); border-radius:50%; color:red; font-size:1.2rem; line-height:1; box-shadow:0 2px 5px rgba(0,0,0,0.2); border:none; cursor:pointer;">&times;</button>
        </div>
      `
        )
        .join("") +
      `</div>`
    : "<p class='muted'>No favorites yet.</p>";

  // Render Reviews
  reviews.innerHTML = (rev.reviews || []).length
    ? rev.reviews
        .map(
          (r) => `
        <div class="review" id="review-${r.book_id}">
          <div class="review-body">
            <div class="review-title-row">
              <a href="/public/book.html?id=${r.book_id}"><strong>${escapeHTML(r.title)}</strong></a>
              <span class="muted">— ${Number(r.rating).toFixed(1)}★</span>
              <span class="muted"> • ${new Date(r.created_at).toLocaleDateString()}</span>
              <button class="btn-ghost" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-left: auto;" onclick="deleteReview(${r.book_id})">Delete</button>
            </div>
            <p>${escapeHTML(r.content)}</p>
          </div>
        </div>
      `
        )
        .join("")
    : "<p class='muted'>You have not written reviews yet.</p>";
});

// Handle Profile Update
const editForm = document.getElementById("editProfileForm");
const msg = document.getElementById("profileMsg");
const saveBtn = document.getElementById("saveProfileBtn");

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";
  msg.textContent = "";

  const name = document.getElementById("pName").value;
  const email = document.getElementById("pEmail").value;
  const pass = document.getElementById("pPass").value;

  try {
    const res = await fetch("/api/profile_update.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pass || undefined }),
    });
    const data = await res.json();

    if (data.ok) {
      msg.className = "success";
      msg.textContent = "Profile updated successfully!";
      userCard.innerHTML = `<strong>${escapeHTML(name)}</strong><br><span class="book-meta">${escapeHTML(email)}</span>`;
      document.getElementById("pPass").value = "";
    } else {
      msg.className = "error";
      msg.textContent = data.error || "Update failed.";
    }
  } catch (err) {
    msg.className = "error";
    msg.textContent = "Network error.";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Changes";
  }
});

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

async function deleteReview(bookId) {
  if (!confirm("Are you sure you want to delete this review?")) return;

  try {
    const res = await fetch("/api/reviews.php", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    });
    const data = await res.json();

    if (data.ok) {
      const el = document.getElementById(`review-${bookId}`);
      if (el) el.remove();

      const list = document.getElementById("reviews");
      if (!list.querySelector(".review")) {
        list.innerHTML = "<p class='muted'>You have not written reviews yet.</p>";
      }
    } else {
      alert(data.error || "Failed to delete review");
    }
  } catch (e) {
    alert("Network error");
  }
}
window.deleteReview = deleteReview;

async function removeFavorite(bookId) {
  if (!confirm("Remove from favorites?")) return;

  try {
    const res = await fetch("/api/favorites.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    });
    const data = await res.json();

    if (data.ok) {
      const el = document.getElementById(`fav-${bookId}`);
      if (el) el.remove();

      const list = document.getElementById("favoritesList");
      if (!list.querySelector(".book-tile")) {
        list.innerHTML = "<p class='muted'>No favorites yet.</p>";
      }
    } else {
      alert("Failed to remove favorite");
    }
  } catch (e) {
    alert("Network error");
  }
}
window.removeFavorite = removeFavorite;
