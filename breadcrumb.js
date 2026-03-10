(function () {
  var nav = document.createElement("a");
  nav.href = "/index.html";
  nav.textContent = "\u2190 Testing Stuff";
  nav.style.cssText =
    "position:fixed;top:12px;left:12px;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
    "font-size:13px;font-weight:500;color:#475569;background:#fff;border:1px solid #e2e8f0;border-radius:8px;" +
    "padding:6px 12px;text-decoration:none;box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:border-color .15s,box-shadow .15s;";
  nav.onmouseenter = function () {
    nav.style.borderColor = "#94a3b8";
    nav.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
  };
  nav.onmouseleave = function () {
    nav.style.borderColor = "#e2e8f0";
    nav.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
  };
  document.body.appendChild(nav);
})();
