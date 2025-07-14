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
      <button class="delete-btn" title="Delete trip">🗑️</button>
      <div class="card-overlay">
        <h3>${trip.title}</h3>
        <p>${trip.desc}</p>
      </div>
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
    date: "",
  };
  trips.push(newTrip);
  renderTrips();
  openTripModal(newTrip);
}

if (addTripBtn) addTripBtn.addEventListener("click", createEmptyTrip);
if (addCustomTripBtn) addCustomTripBtn.addEventListener("click", createEmptyTrip);

renderTrips();

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

    const titleEl = document.getElementById("modal-title");
    const descEl = document.getElementById("modal-description");
    const dateEl = document.getElementById("modal-date");
    const bannerEl = document.getElementById("modal-banner");

    titleEl.textContent = trip.title;
    descEl.textContent = trip.desc;
    dateEl.value = trip.date || "";
    dateEl.placeholder = "Click to set date";
    bannerEl.src = trip.img;

    titleEl.oninput = () => {
      trip.title = titleEl.textContent;
      renderTrips();
    };
    descEl.oninput = () => {
      trip.desc = descEl.textContent;
      renderTrips();
    };

    titleEl.addEventListener("click", selectAllText);
    descEl.addEventListener("click", selectAllText);

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
          <div class="day-icon-wrapper">
            <i class="fa-solid fa-circle-plus day-icon"></i>
            <div class="day-icon-dropdown hidden">
              <div class="icon-option"><i class="fa-solid fa-plane"></i></div>
              <div class="icon-option"><i class="fa-solid fa-hotel"></i></div>
              <div class="icon-option"><i class="fa-solid fa-utensils"></i></div>
              <div class="icon-option"><i class="fa-solid fa-tree"></i></div>
              <div class="icon-option"><i class="fa-solid fa-ship"></i></div>
            </div>
          </div>
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
  document.querySelectorAll(".day-icon-wrapper").forEach((wrapper) => {
    wrapper.onclick = (e) => {
      toggleDayIconDropdown(e, wrapper);
    };
  });

  document.querySelectorAll(".icon-option").forEach((iconOption) => {
    iconOption.onclick = (e) => {
      e.stopPropagation();
      setDayIcon(iconOption);
    };
  });
}

function toggleDayIconDropdown(event, wrapper) {
  event.stopPropagation();
  const dropdown = wrapper.querySelector(".day-icon-dropdown");
  document.querySelectorAll(".day-icon-dropdown").forEach((d) => {
    if (d !== dropdown) d.classList.add("hidden");
  });
  dropdown.classList.toggle("hidden");
}

function setDayIcon(element) {
  const iconClass = element.querySelector("i").className;
  const wrapper = element.closest(".day-icon-wrapper");
  const icon = wrapper.querySelector(".day-icon");
  icon.className = iconClass + " day-icon";
  wrapper.querySelector(".day-icon-dropdown").classList.add("hidden");
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
    if (dateEl) dateEl.value = trip.date;
    renderTrips();
  });
  input.click();
  setTimeout(() => document.body.removeChild(input), 300);
}

function selectAllText(e) {
  const el = e.target;
  if (el.contentEditable === "true") {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function toggleForm(mode) {
  const isLogin = mode === 'login';
  document.getElementById('form-title').textContent = isLogin ? 'Login' : 'Create Account';
  document.getElementById('toggle-btn').textContent = isLogin ? 'Create Account' : 'Login';
  document.getElementById('submit-btn').textContent = isLogin ? 'Login' : 'Create Account';
  document.getElementById('remember-me').style.display = isLogin ? 'block' : 'none';
}
