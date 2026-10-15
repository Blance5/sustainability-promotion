(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const chart = document.querySelector("[data-chart]");
  if (chart) {
    const buttons = Array.from(chart.querySelectorAll(".bar-btn"));
    const detail = document.querySelector("[data-chart-detail]");
    const title = detail.querySelector("h3");
    const text = detail.querySelector("p");
    function show(button) {
      buttons.forEach(function (item) {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      title.textContent = button.dataset.title;
      text.textContent = button.dataset.detail;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () { show(button); });
    });
    requestAnimationFrame(function () { chart.classList.add("ready"); });
    if (buttons[0]) show(buttons[0]);
  }

  const map = document.querySelector("[data-map]");
  if (map) {
    const regions = Array.from(map.querySelectorAll(".region"));
    const panel = document.querySelector("[data-map-panel]");
    function select(region) {
      regions.forEach(function (item) {
        item.setAttribute("aria-pressed", item === region ? "true" : "false");
      });
      panel.innerHTML =
        "<h3>" + region.dataset.title + "</h3>" +
        "<p>" + region.dataset.detail + "</p>" +
        "<p><a href=\"" + region.dataset.url + "\">Read the official Campus Recreation page</a></p>";
    }
    regions.forEach(function (region) {
      region.addEventListener("click", function () { select(region); });
    });
    if (regions[0]) select(regions[0]);
  }
})();
