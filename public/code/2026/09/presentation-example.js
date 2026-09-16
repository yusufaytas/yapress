(() => {
  const presentation = document.querySelector("[data-presentation-example]");
  const status = presentation?.querySelector("[data-presentation-status]");
  const next = presentation?.querySelector("[data-presentation-next]");

  next?.addEventListener("click", () => {
    if (status) status.textContent = "Part 2 of the presentation";
    presentation?.classList.add("is-advanced");
  });
})();
