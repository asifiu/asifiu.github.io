// Fades sections in as they scroll into view. Without JavaScript everything is simply visible.
document.documentElement.classList.add("js");
const sections = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("seen");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  sections.forEach((section) => observer.observe(section));
} else {
  sections.forEach((section) => section.classList.add("seen"));
}
