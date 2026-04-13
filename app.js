const CLAIM_TTL_MS = 60_000;

const listingForm = document.querySelector("#listing-form");
const itemsRoot = document.querySelector("#items-root");
const itemTemplate = document.querySelector("#item-template");

const state = {
  items: seedItems(),
};

listingForm.addEventListener("submit", handleListingSubmit);
setInterval(expireOldClaims, 1000);
render();

function seedItems() {
  const now = Date.now();
  return [
    createItem({
      title: "Data Structures Textbook",
      category: "Books",
      price: 12,
      pickupNote: "Dorm C lobby, evening",
      createdAt: now - 5_000,
    }),
    createItem({
      title: "Mini Fridge",
      category: "Appliances",
      price: null,
      pickupNote: "Hostel Gate 2, after class",
      createdAt: now - 3_000,
    }),
  ];
}

function createItem({ title, category, price, pickupNote, createdAt = Date.now() }) {
  return {
    id: crypto.randomUUID(),
    title,
    category,
    price,
    pickupNote,
    createdAt,
    status: "available",
    claimedBy: null,
    claimExpiresAt: null,
    closedReason: null,
  };
}

function handleListingSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const title = sanitizeText(form.get("title"));
  const category = sanitizeText(form.get("category"));
  const pickupNote = sanitizeText(form.get("pickupNote"));
  const priceRaw = String(form.get("price") || "").trim();
  const price = priceRaw === "" ? null : Number(priceRaw);

  if (!title || !category || !pickupNote) {
    alert("Please fill title, category, and pickup note.");
    return;
  }

  if (price !== null && (Number.isNaN(price) || price < 0)) {
    alert("Price must be a valid number or empty.");
    return;
  }

  state.items.unshift(createItem({ title, category, price, pickupNote }));
  event.target.reset();
  render();
}

function attemptClaim(itemId, buyerName) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return { ok: false, message: "Listing no longer exists." };

  // Single source of truth check prevents double success.
  if (item.status !== "available") {
    return { ok: false, message: "This item is no longer available." };
  }

  item.status = "claimed";
  item.claimedBy = buyerName;
  item.claimExpiresAt = Date.now() + CLAIM_TTL_MS;
  return { ok: true, message: "Claim successful. Complete pickup soon." };
}

function confirmHandoff(itemId, buyerName) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item || item.status !== "claimed") return;

  if (item.claimedBy !== buyerName) {
    alert("Only the student who claimed can confirm handoff.");
    return;
  }

  item.status = "sold";
  item.closedReason = "handoff-complete";
  item.claimExpiresAt = null;
  render();
}

function markAsSold(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;
  item.status = "sold";
  item.closedReason = "seller-override";
  item.claimExpiresAt = null;
  render();
}

function forceRemove(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) return;
  item.status = "removed";
  item.closedReason = "seller-removed";
  item.claimExpiresAt = null;
  render();
}

function expireOldClaims() {
  let changed = false;
  const now = Date.now();

  for (const item of state.items) {
    if (item.status === "claimed" && item.claimExpiresAt && item.claimExpiresAt <= now) {
      item.status = "available";
      item.claimedBy = null;
      item.claimExpiresAt = null;
      changed = true;
    }
  }

  if (changed) render();
}

function sanitizeText(raw) {
  return String(raw || "").trim();
}

function formatPrice(price) {
  return price === null ? "Free" : `Rs ${price.toFixed(2)}`;
}

function statusInfo(item) {
  if (item.status === "available") {
    return { text: "Available", className: "status-available" };
  }

  if (item.status === "claimed") {
    const seconds = Math.max(0, Math.ceil((item.claimExpiresAt - Date.now()) / 1000));
    return {
      text: `Claimed by ${item.claimedBy} (expires in ${seconds}s)`,
      className: "status-claimed",
    };
  }

  if (item.status === "sold") {
    const reason = item.closedReason === "seller-override" ? "seller override" : "handoff done";
    return { text: `Sold (${reason})`, className: "status-sold" };
  }

  return { text: "Removed by seller", className: "status-removed" };
}

function render() {
  itemsRoot.innerHTML = "";

  if (state.items.length === 0) {
    itemsRoot.textContent = "No listings yet.";
    return;
  }

  for (const item of state.items) {
    const card = itemTemplate.content.firstElementChild.cloneNode(true);
    const buyerNameInput = card.querySelector(".buyer-name");
    const claimBtn = card.querySelector(".claim-btn");
    const confirmBtn = card.querySelector(".confirm-btn");
    const soldBtn = card.querySelector(".sold-btn");
    const removeBtn = card.querySelector(".remove-btn");

    card.querySelector(".item-title").textContent = item.title;
    card.querySelector(".item-meta").textContent = `${item.category} • ${formatPrice(item.price)}`;
    card.querySelector(".item-pickup").textContent = `Pickup: ${item.pickupNote}`;

    const details = statusInfo(item);
    const statusNode = card.querySelector(".item-status");
    statusNode.textContent = details.text;
    statusNode.className = `item-status ${details.className}`;

    claimBtn.disabled = item.status !== "available";
    confirmBtn.disabled = item.status !== "claimed";
    soldBtn.disabled = item.status === "removed" || item.status === "sold";
    removeBtn.disabled = item.status === "removed";

    claimBtn.addEventListener("click", () => {
      const buyerName = sanitizeText(buyerNameInput.value);
      if (!buyerName) {
        alert("Enter buyer name before claiming.");
        return;
      }

      const result = attemptClaim(item.id, buyerName);
      alert(result.message);
      render();
    });

    confirmBtn.addEventListener("click", () => {
      const buyerName = sanitizeText(buyerNameInput.value);
      confirmHandoff(item.id, buyerName);
    });

    soldBtn.addEventListener("click", () => markAsSold(item.id));
    removeBtn.addEventListener("click", () => forceRemove(item.id));

    itemsRoot.appendChild(card);
  }
}
