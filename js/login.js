// Navbar state
initAuthNav();

const emailEl = document.getElementById("email");
const pwdEl = document.getElementById("password");
const btn = document.getElementById("loginBtn");
const errBox = document.getElementById("err");
const peekBtn = document.getElementById("peekBtn");

// Toggle password visibility

peekBtn.addEventListener("click", () => {
  const show = pwdEl.type === "password";
  pwdEl.type = show ? "text" : "password";
  peekIcon.classList.toggle("fa-eye", !show);
  peekIcon.classList.toggle("fa-eye-slash", show);
  peekBtn.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

// Submit on Enter inside any field
document.getElementById("loginCard").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    doLogin();
  }
});

btn.addEventListener("click", doLogin);

async function doLogin() {
  // Clear error
  errBox.style.display = "none";
  errBox.textContent = "";

  const email = (emailEl.value || "").trim();
  const password = (pwdEl.value || "").trim();

  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  // Disable while logging in
  btn.disabled = true;
  btn.textContent = "Logging in…";

  try {
    const res = await fetch("/api/login.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!data || !data.ok) {
      showError(data?.error || "Invalid credentials.");
      return;
    }

    // Success → go home
    location.href = "/index.html";
  } catch (e) {
    showError("Network error. Please try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Login";
  }
}

function showError(msg) {
  errBox.textContent = msg;
  errBox.style.display = "block";
  btn.disabled = false;
  btn.textContent = "Login";
}
