"use strict";

// Small helpers for the portfolio. The page works without this file: the menu then stays open,
// nothing is highlighted, nothing slides in and the IT support CV is the main download.
// Nothing is stored in the browser.

document.documentElement.classList.add("js");  // lets style.css fold the phone menu only when this runs

document.addEventListener("DOMContentLoaded", () => {
  setUpMenu();
  setUpSectionHighlight();
  setUpRoleSwitcher();
  setUpReveal();
});

// ------------------------------------------------------------ boxes slide up as they come into view

const REVEAL = ".facts > div, .role, .entry, .figures .chart, .skills > div, .languages, .quote, .contact .two-col > div";

function setUpReveal() {
  // Only when the browser can tell what is on screen and the visitor has not asked for less motion;
  // otherwise everything simply stays visible.
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry, order) => {
      observer.unobserve(entry.target);
      setTimeout(() => entry.target.classList.add("is-visible"), order * 60);  // boxes arriving together come one by one
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const box of document.querySelectorAll(REVEAL)) {
    box.classList.add("reveal");
    observer.observe(box);
  }
  // Safety net for very fast scrolling or a jump from the menu: anything on screen or above it is shown.
  let waiting = null;
  const catchUp = () => {
    waiting = null;
    for (const box of document.querySelectorAll(".reveal:not(.is-visible)")) {
      if (box.getBoundingClientRect().top < window.innerHeight) { observer.unobserve(box); box.classList.add("is-visible"); }
    }
  };
  window.addEventListener("scroll", () => { if (!waiting) waiting = setTimeout(catchUp, 200); }, { passive: true });
}

// ------------------------------------------------------------ phone menu

function setUpMenu() {
  const button = document.querySelector(".menu-button");
  const nav = document.getElementById("site-nav");
  if (!button || !nav) return;
  button.hidden = false;

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Close" : "Menu";
    nav.classList.toggle("open", open);
  };
  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) { setOpen(false); button.focus(); }
  });
  document.addEventListener("click", (event) => {
    if (nav.classList.contains("open") && !event.target.closest(".site")) setOpen(false);
  });
}

// ------------------------------------------------------------ "you are here" in the menu

function setUpSectionHighlight() {
  const links = [...document.querySelectorAll('#site-nav a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (!sections.length) return;

  const update = () => {
    const line = window.innerHeight * 0.35;  // the section that crosses this line is the one being read
    let current = null;
    let nearest = -Infinity;
    for (const section of sections) {  // by position, because the role switcher can change the order
      const top = section.getBoundingClientRect().top;
      if (top <= line && top > nearest) { nearest = top; current = section; }
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
    for (const link of links) {
      if (current && link.getAttribute("href") === `#${current.id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };
  // Seven position checks per scroll event are cheap, so no timer is needed.
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// ------------------------------------------------------------ role switcher

const ROLES = ["it", "data", "ee"];

function setUpRoleSwitcher() {
  const group = document.querySelector(".focus");
  if (!group) return;
  group.hidden = false;
  const fromLink = new URLSearchParams(location.search).get("for");  // a link like /?for=data opens on data
  choose(ROLES.includes(fromLink) ? fromLink : "it", false);

  for (const button of group.querySelectorAll("button[data-role]")) {
    button.addEventListener("click", () => choose(button.dataset.role, true));
  }
}

function choose(role, fromClick) {
  for (const button of document.querySelectorAll(".focus button[data-role]")) {
    button.setAttribute("aria-pressed", String(button.dataset.role === role));
  }
  // Everything written for certain roles (data-show="data" or data-show="it ee") shows only for them:
  // the headline, the introduction, and the Download CV buttons (each CV link keeps its own
  // GoatCounter name, so the stats still show which CV was taken).
  for (const item of document.querySelectorAll("[data-show]")) item.hidden = !item.dataset.show.split(" ").includes(role);

  // The figure that matters most for this role gets a coloured frame.
  for (const fact of document.querySelectorAll(".facts [data-for]")) fact.classList.toggle("is-picked", fact.dataset.for === role);

  // For data roles the thesis is the strongest proof, so Projects comes before Experience,
  // on the page and in the menu. Every other role keeps Experience first.
  const experience = document.getElementById("experience");
  const projects = document.getElementById("projects");
  const menuExperience = document.querySelector('#site-nav a[href="#experience"]');
  const menuProjects = document.querySelector('#site-nav a[href="#projects"]');
  if (role === "data") { experience.before(projects); menuExperience.before(menuProjects); }
  else { projects.before(experience); menuProjects.before(menuExperience); }

  // The chosen role comes first in Roles, and its skills come first in Skills.
  const roles = document.querySelector(".roles");
  for (const card of [...roles.querySelectorAll(".role")]) {
    const picked = card.dataset.role === role;
    card.classList.toggle("is-picked", picked);
    card.querySelector(".picked").hidden = !picked;
  }
  roles.prepend(roles.querySelector(`.role[data-role="${role}"]`));
  const skills = document.querySelector(".skills");
  const groups = [...skills.children];
  const fits = (item) => item.dataset.for.split(" ").includes(role);
  skills.append(...groups.filter(fits), ...groups.filter((item) => !fits(item)));

  if (fromClick) {
    const url = new URL(location.href);
    if (role === "it") url.searchParams.delete("for"); else url.searchParams.set("for", role);
    history.replaceState(null, "", url);
  }
}
