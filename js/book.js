initAuthNav();

const params = new URLSearchParams(location.search);
const id = Number(params.get("id") || 0);

const hero = document.getElementById("hero");
const synopsisEl = document.getElementById("synopsis");
const reviewsEl = document.getElementById("reviews");
const writeWrap = document.getElementById("writeWrap");
const loginHint = document.getElementById("loginHint");
const postBtn = document.getElementById("postBtn");
const postMsg = document.getElementById("postMsg");

let currentRating = 5;

// ✅ images base + fallback
const FALLBACK = "/assets/placeholder.jpg"; // change if you use another placeholder

function coverSrc(b) {
  let v = (b.cover_url || "").trim();
  if (!v) return FALLBACK;

  // Full external URL
  if (/^https?:\/\//i.test(v)) return encodeURI(v);

  // Already correct absolute path
  if (v.startsWith("/assets/books/")) return encodeURI(v);

  // Relative like "assets/books/book1.jpg"
  if (v.startsWith("assets/books/")) return "/" + encodeURI(v);

  // Any other relative with a slash -> just prepend '/'
  if (v.includes("/")) return "/" + encodeURI(v.replace(/^\/+/, ""));

  // Just filename in DB -> assume /assets/books/<filename>
  return "/assets/books/" + encodeURI(v.replace(/^\/+/, ""));
}

function starBar(avg, size = 18) {
  const pct = Math.max(0, Math.min(100, ((Number(avg) || 0) / 5) * 100));
  return `
    <span class="stars" style="--size:${size}px"><i style="width:${pct}%"></i></span>
  `;
}

function escapeHTML(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m])
  );
}

async function loadBook() {
  if (!id) {
    hero.innerHTML = `<p class="alert">Book not found.</p>`;
    synopsisEl.textContent = "—";
    reviewsEl.textContent = "—";
    return;
  }
  const res = await fetch(`/api/book.php?id=${id}`, { credentials: "include" });
  const data = await res.json();

  if (!data.book) {
    hero.innerHTML = `<p class="alert">Book not found.</p>`;
    synopsisEl.textContent = "—";
    reviewsEl.textContent = "—";
    return;
  }

  const b = data.book;
  const s = data.stats || { avg_rating: 0, cnt: 0 };
  const imgSrc = coverSrc(b);

  hero.innerHTML = `
    <img src="${imgSrc}" alt="Cover of ${escapeHTML(b.title)}">
    <div>
      <h1 class="title">${escapeHTML(b.title)}</h1>
      <div class="submeta">
        by ${escapeHTML(b.author)}
        ${b.year ? " • " + b.year : ""}
        ${b.isbn ? " • ISBN " + b.isbn : ""}
        ${b.category ? " • " + escapeHTML(b.category) : ""}
      </div>
      <div class="star-row">
        ${starBar(s.avg_rating, 18)}
        <span class="avg-chip">
          ${
            s.cnt
              ? `${Number(s.avg_rating).toFixed(1)}★`
              : "No ratings yet"
          }
        </span>
        ${s.cnt ? `<span class="muted">(${s.cnt} reviews)</span>` : ""}
      </div>
    </div>
    <button id="favBtn" class="fav-btn" aria-label="Toggle Favorite" style="display:none">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  `;

  synopsisEl.textContent = (b.description || "No synopsis available.").trim();

  if (!data.reviews || data.reviews.length === 0) {
    reviewsEl.innerHTML = `<p class="muted">No reviews yet.</p>`;
  } else {
    reviewsEl.innerHTML = data.reviews
      .map(
        (r) => `
      <div class="review-item">
        <div class="star-row" style="gap:.35rem">
          ${starBar(r.rating, 14)}
          <strong>${escapeHTML(r.name)}</strong>
          <span class="muted"> • ${new Date(
            r.created_at
          ).toLocaleDateString()}</span>
        </div>
        <div>${escapeHTML(r.content)}</div>
      </div>
    `
      )
      .join("");
  }
}

async function initReviewBox() {
  const r = await fetch("/api/me.php", { credentials: "include" });
  const { user } = await r.json();
  if (user) {
    writeWrap.style.display = "block";
    buildStarInput();
  } else {
    loginHint.style.display = "block";
  }
}

function buildStarInput() {
  const wrap = document.getElementById("ratingStars");
  wrap.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rate-star";
    b.dataset.v = i;
    b.textContent = "★";
    b.onclick = () => {
      currentRating = i;
      paintStars();
    };
    wrap.appendChild(b);
  }
  paintStars();
}

function paintStars() {
  document.querySelectorAll(".rate-star").forEach((btn) => {
    btn.classList.toggle("on", Number(btn.dataset.v) <= currentRating);
  });
}

postBtn?.addEventListener("click", async () => {
  const content = (document.getElementById("content").value || "").trim();
  if (!content) {
    postMsg.textContent = "Write something first.";
    return;
  }
  postBtn.disabled = true;
  postBtn.textContent = "Posting…";
  try {
    const r = await fetch("/api/reviews.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: id, rating: currentRating, content }),
    });
    const data = await r.json();
    if (!data.ok) {
      postMsg.textContent = data.error || "Failed to post.";
    } else {
      document.getElementById("content").value = "";
      postMsg.textContent = "Thanks for your review!";
      await loadBook(); // re-fetch to show the new review immediately
    }
  } catch (e) {
    postMsg.textContent = "Network error. Try again.";
  } finally {
    postBtn.disabled = false;
    postBtn.textContent = "Post Review";
  }
});

(async function init() {
  await loadBook();      // only once (you had it twice before)
  await initReviewBox();
  checkFavorite();
})();

async function checkFavorite() {
  const btn = document.getElementById("favBtn");
  if (!btn) return;

  try {
    const r = await fetch("/api/favorites.php", { credentials: "include" });
    if (r.status === 401) return; // not logged in

    const data = await r.json();
    const favs = data.favorites || [];
    const isFav = favs.some((f) => Number(f.id) === id);

    btn.style.display = "flex";
    btn.classList.toggle("active", isFav);

    btn.onclick = async () => {
      btn.disabled = true;
      const res = await fetch("/api/favorites.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: id }),
      });
      const d = await res.json();
      if (d.favorited !== undefined) {
        btn.classList.toggle("active", d.favorited);
      }
      btn.disabled = false;
    };
  } catch (e) {
    console.error(e);
  }
}
