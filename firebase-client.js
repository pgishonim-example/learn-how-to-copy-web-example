/* Shared Firebase Auth and Realtime Database client. */

/* Map a human account name to a stable, valid Firebase e-mail.
   MUST stay identical in login.html and admin.html (both load this file). */
window.pgAccountToEmail = function (name) {
  var n = String(name == null ? "" : name).trim().toLowerCase();
  if (/^[a-z0-9][a-z0-9._-]{0,30}$/.test(n)) { return n + "@pgishonim.app"; }
  var bytes = unescape(encodeURIComponent(n)); // UTF-8 bytes (supports Hebrew etc.)
  var hex = "";
  for (var i = 0; i < bytes.length; i++) { hex += ("0" + bytes.charCodeAt(i).toString(16)).slice(-2); }
  return "u" + hex + "@pgishonim.app";
};

(function () {
  "use strict";

  if (!window.firebase || typeof FIREBASE_CONFIG === "undefined") {
    console.error("[PG-Firebase] SDK or configuration did not load.");
    return;
  }

  try {
    var app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
    var auth = app.auth();
    var database = app.database();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function (error) {
      console.warn("[PG-Firebase] Local sign-in persistence is unavailable:", error);
    });
    window.PG_FIREBASE = { app: app, auth: auth, database: database };
  } catch (error) {
    console.error("[PG-Firebase] Initialization failed:", error);
  }
})();
