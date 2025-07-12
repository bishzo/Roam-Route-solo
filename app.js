const tripList = document.getElementById("trip-list");
const addTripBtn = document.getElementById("add-trip");
const addCustomTripBtn = document.getElementById("add-custom-trip");

let trips = [
  {
    id: 1,
    title: "Paris Getaway",
    desc: "Museums, croissants, and romantic nights.",
    img: "assets/paris.png"
  },
  {
    id: 2,
    title: "Bali Escape",
    desc: "Beaches, temples, and surfing.",
    img: "assets/bali.png"
  }
];

function renderTrips() {
  tripList.innerHTML = "";
  trips.forEach(trip => {
    const card = document.createElement("div");
    card.className = "card trip-card";
    card.innerHTML = `
      <img src="${trip.img}" alt="${trip.title}" />
      <button class="delete-btn" onclick="deleteTrip(${trip.id})">Delete</button>
      <h3>${trip.title}</h3>
      <p>${trip.desc}</p>
    `;
    tripList.appendChild(card);
  });
}

function deleteTrip(id) {
  trips = trips.filter(t => t.id !== id);
  renderTrips();
}

if (addTripBtn) {
  addTripBtn.addEventListener("click", () => {
    const title = prompt("Enter destination title:");
    const desc = prompt("Enter a short description:");
    const img = prompt("Enter image file name (e.g., 'mytrip.png') placed in /assets:");
    if (title && desc && img) {
      trips.push({
        id: Date.now(),
        title,
        desc,
        img: `assets/${img}`
      });
      renderTrips();
    }
  });
}

if (addCustomTripBtn) {
  addCustomTripBtn.addEventListener("click", () => {
    const title = prompt("Trip Title?");
    const desc = prompt("Short Description?");
    const img = prompt("PNG Image filename inside /assets (e.g., venice.png):");
    if (title && desc && img) {
      trips.push({
        id: Date.now(),
        title,
        desc,
        img: `assets/${img}`
      });
      renderTrips();
    }
  });
}

renderTrips();
