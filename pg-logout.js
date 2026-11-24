// Shared logout button + action for every app page.
// Clears the app session and returns to the login screen. Keeps localStorage
// 'pg_device_id' so the SAME phone can log back into its bound account.
(function () {
  "use strict";
  if (window.__pgLogoutLoaded) { return; }
  window.__pgLogoutLoaded = true;

  window.pgLogout = function () {
    try { localStorage.setItem("pg_logout", "1"); } catch (e) {} // tell login.html to stay logged out (not auto-route back in)
    try { sessionStorage.clear(); } catch (e) {}
    try { if (window.PG_FIREBASE && window.PG_FIREBASE.auth) { window.PG_FIREBASE.auth.signOut(); } } catch (e) {}
    try { if (window.firebase && firebase.auth) { firebase.auth().signOut(); } } catch (e) {}
    window.location.replace("login.html");
  };

  function addButton() {
    if (document.getElementById("pgLogoutBtn")) { return; }
    var b = document.createElement("button");
    b.id = "pgLogoutBtn";
    b.type = "button";
    b.textContent = "יציאה";
    b.setAttribute("aria-label", "יציאה מהחשבון");
    b.style.cssText = "position:fixed;bottom:14px;left:14px;z-index:100000;" +
      "background:#c62f3b;color:#fff;border:none;border-radius:999px;padding:9px 16px;" +
      "font:700 13px/1 Rubik,Arial,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.3);cursor:pointer;";
    b.onclick = function () { if (window.confirm("להתנתק מהחשבון?")) { window.pgLogout(); } };
    document.body.appendChild(b);
  }

  if (document.readyState !== "loading") { addButton(); }
  else { document.addEventListener("DOMContentLoaded", addButton); }
})();
