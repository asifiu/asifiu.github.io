"use strict";

// Small helpers for the portfolio. The page works without this file: the menu then stays open,
// nothing is highlighted and the IT support CV is the main download. Nothing is stored in the browser.

document.documentElement.classList.add("js");  // lets style.css fold the phone menu only when this runs

document.addEventListener("DOMContentLoaded", () => {
  setUpMenu();
  setUpSectionHighlight();
  setUpRoleSwitcher();
});

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
    for (const section of sections) if (section.getBoundingClientRect().top <= line) current = section;
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
  // The hero button and the menu button download the CV for this role (each link keeps its own
  // GoatCounter name, so the stats still show which CV was taken).
  for (const link of document.querySelectorAll("a[data-cv]")) link.hidden = link.dataset.cv !== role;

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
