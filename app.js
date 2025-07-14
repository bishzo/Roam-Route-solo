const tripList = document.getElementById("trip-list");
const addTripBtn = document.getElementById("add-trip");
const addCustomTripBtn = document.getElementById("add-custom-trip");

let trips = [];

function renderTrips() {
  tripList.innerHTML = "";

  trips.forEach((trip) => {
    const card = document.createElement("div");
    card.className = "card trip-card";
    card.innerHTML = `
      <img src="${trip.img}" alt="${trip.title}" />
      <button class="delete-btn">Delete</button>
      <h3>${trip.title}</h3>
      <p>${trip.desc}</p>
    `;

    card.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      deleteTrip(trip.id);
    });

    card.addEventListener("click", () => {
      openTripModal(trip);
    });

    tripList.appendChild(card);
  });
}

function deleteTrip(id) {
  trips = trips.filter((t) => t.id !== id);
  renderTrips();
}

function createEmptyTrip() {
  const newTrip = {
    id: Date.now(),
    title: "Untitled Trip",
    desc: "Add a short description...",
    img: "assets/placeholder-banner.jpg",
    date: "Click to set date",
  };
  trips.push(newTrip);
  renderTrips();
  openTripModal(newTrip);
}

if (addTripBtn) addTripBtn.addEventListener("click", createEmptyTrip);
if (addCustomTripBtn)
  addCustomTripBtn.addEventListener("click", createEmptyTrip);

renderTrips();

// === Modal Handling ===

async function openTripModal(trip) {
  let modalOverlay = document.getElementById("trip-modal");

  if (!modalOverlay) {
    const res = await fetch("Modal.html");
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);
  }

  setTimeout(() => {
    modalOverlay = document.getElementById("trip-modal");
    if (!modalOverlay) return;

    modalOverlay.classList.add("show");

    // Elements
    const titleEl = document.getElementById("modal-title");
    const descEl = document.getElementById("modal-description");
    const dateEl = document.getElementById("modal-date");
    const bannerEl = document.getElementById("modal-banner");

    titleEl.textContent = trip.title;
    descEl.textContent = trip.desc;
    dateEl.textContent = trip.date;
    bannerEl.src = trip.img;

    titleEl.oninput = () => {
      trip.title = titleEl.textContent;
      renderTrips();
    };
    descEl.oninput = () => {
      trip.desc = descEl.textContent;
      renderTrips();
    };

    dateEl.onclick = () => showDatePicker(trip);

    document.getElementById("close-modal-btn").onclick = closeModal;
    document.getElementById("add-day-btn").onclick = addNewDay;

    const bannerUpload = document.getElementById("banner-upload");
    if (bannerUpload) {
      bannerUpload.onchange = (e) => handleBannerUpload(e, trip);
    }

    attachDeleteHandlers();
    attachDayIconSelector();
  }, 50);
}

function closeModal() {
  const modal = document.querySelector(".modal-content");
  if (!modal) return;
  modal.classList.add("fade-out");
  setTimeout(() => {
    document.getElementById("trip-modal").classList.remove("show");
    modal.classList.remove("fade-out");
  }, 300);
}

function addNewDay() {
  const container = document.getElementById("day-plans-container");
  const newDay = document.createElement("details");
  newDay.className = "day-plan";
  newDay.open = true;
  newDay.innerHTML = `
    <summary>
      <div class="day-header">
        <div class="day-info">
          <img src="assets/icons/flight.png" class="day-icon" />
          <div>
            <div contenteditable="true" class="day-title">Day Title</div>
            <div contenteditable="true" class="day-subtitle">Subtitle</div>
          </div>
        </div>
        <button class="delete-day">🗑️</button>
      </div>
    </summary>
    <ul class="activity-list">
      <li class="activity-item">
        <input type="time" class="activity-time" />
        <input type="checkbox" class="activity-check" />
        <span contenteditable="true" class="activity-desc">New activity</span>
      </li>
    </ul>
  `;
  container.appendChild(newDay);
  attachDeleteHandlers();
  attachDayIconSelector();
}

function attachDeleteHandlers() {
  document.querySelectorAll(".delete-day").forEach((btn) => {
    btn.onclick = () => btn.closest(".day-plan").remove();
  });
}

function attachDayIconSelector() {
  const icons = document.querySelectorAll(".day-icon");
  icons.forEach((icon) => {
    icon.onclick = (e) => {
      e.stopPropagation();
      openIconMenu(icon);
    };
  });
}

function openIconMenu(targetIcon) {
  const existing = document.getElementById("icon-menu");
  if (existing) existing.remove();

  const iconMenu = document.createElement("div");
  iconMenu.id = "icon-menu";
  iconMenu.style.position = "absolute";
  iconMenu.style.top = `${
    targetIcon.getBoundingClientRect().bottom + window.scrollY
  }px`;
  iconMenu.style.left = `${targetIcon.getBoundingClientRect().left}px`;
  iconMenu.style.background = "#111";
  iconMenu.style.border = "1px solid #333";
  iconMenu.style.padding = "6px";
  iconMenu.style.borderRadius = "8px";
  iconMenu.style.display = "flex";
  iconMenu.style.gap = "8px";
  iconMenu.style.zIndex = 9999;

  const iconList = [
    "flight",
    "hotel",
    "food",
    "boating",
    "sport",
    "park",
    "sightseeing",
  ];

  iconList.forEach((name) => {
    const img = document.createElement("img");
    img.src = `assets/icons/${name}.png`;
    img.style.width = "28px";
    img.style.height = "28px";
    img.style.cursor = "pointer";
    img.title = name;
    img.onclick = () => {
      targetIcon.src = img.src;
      iconMenu.remove();
    };
    iconMenu.appendChild(img);
  });

  document.body.appendChild(iconMenu);

  document.addEventListener(
    "click",
    (e) => {
      if (!iconMenu.contains(e.target) && e.target !== targetIcon) {
        iconMenu.remove();
      }
    },
    { once: true }
  );
}

function handleBannerUpload(e, trip) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const banner = document.getElementById("modal-banner");
    if (banner) banner.src = event.target.result;
    trip.img = event.target.result;
    renderTrips();
  };
  reader.readAsDataURL(file);
}

function showDatePicker(trip) {
  const input = document.createElement("input");
  input.type = "date";
  input.style.position = "fixed";
  input.style.opacity = 0;
  input.style.pointerEvents = "none";

  document.body.appendChild(input);

  input.addEventListener("change", () => {
    trip.date = input.value;
    const dateEl = document.getElementById("modal-date");
    if (dateEl) dateEl.textContent = trip.date;
    renderTrips();
  });

  input.click();
  setTimeout(() => document.body.removeChild(input), 300);
}
