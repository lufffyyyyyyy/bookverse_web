// Navbar state
initAuthNav();

const $ = (id) => document.getElementById(id);
const msgBox = $("msg");
const form = $("regForm");
const regBtn = $("regBtn");
const pw = $("password");

function showError(t) {
  msgBox.innerHTML = `<p class="error">${t}</p>`;
}
function showSuccess(t) {
  msgBox.innerHTML = `<p class="success">${t}</p>`;
}

// Registration submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msgBox.innerHTML = "";

  const name = $("name").value.trim();
  const email = $("email").value.trim();
  const password = pw.value;

  if (!name || name.length < 2)
    return showError("Please enter your name (min 2 characters).");
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return showError("Please enter a valid email address.");
  if (!password || password.length < 6)
    return showError("Password should be at least 6 characters.");

  regBtn.disabled = true;
  regBtn.textContent = "Creating account…";

  try {
    const res = await fetch("/api/register.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!data.ok) {
      return showError(
        data.error || "Registration failed. Try a different email."
      );
    }

    showSuccess("Account created! Redirecting you to login…");
    setTimeout(() => {
      location.href = "/login.html";
    }, 900);
  } catch {
    showError("Network error. Please check your server and try again.");
  } finally {
    regBtn.disabled = false;
    regBtn.textContent = "Sign Up";
  }
});
