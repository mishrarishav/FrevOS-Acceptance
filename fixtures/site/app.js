const statusButton = document.querySelector("[data-testid='load-status']");
const statusRegion = document.querySelector("[data-testid='service-status']");

statusButton?.addEventListener("click", async () => {
  if (!(statusRegion instanceof HTMLElement)) {
    return;
  }

  statusRegion.textContent = "Checking";
  try {
    const response = await fetch("/api/status", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error("Fixture status request failed");
    }
    const body = await response.json();
    statusRegion.textContent = body.status === "available" ? "Available" : "Unavailable";
  } catch {
    statusRegion.textContent = "Unable to load status";
  }
});
