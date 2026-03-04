const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

const burger = document.getElementById("burger");
const menu = document.querySelector(".menu");
burger?.addEventListener("click", () => {
  menu.classList.toggle("open");
});

function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((b - a) / ms));
}

function priceFor(type) {
  const base = { Economy: 29, Compact: 35, SUV: 49, Luxury: 89 }[type] ?? 35;
  return base;
}

document.getElementById("bookingForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const form = e.target;
  const location = form.location.value.trim();
  const pickup = new Date(form.pickupDate.value);
  const ret = new Date(form.returnDate.value);
  const carType = form.carType.value;

  const out = document.getElementById("quoteOutput");

  if (!location) {
    out.textContent = "Please enter a pickup location.";
    return;
  }
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(ret.getTime())) {
    out.textContent = "Please select valid dates.";
    return;
  }
  if (ret <= pickup) {
    out.textContent = "Return date must be after pickup date.";
    return;
  }

  const days = daysBetween(pickup, ret);
  const daily = priceFor(carType);
  const total = days * daily;

  out.textContent = `Estimated quote: €${total} (${days} day(s) • ${carType})`;
});

const LS_KEY = "drive_rentals_db_v1";

function uid(){
  return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(2,6);
}

function loadDB(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw) return null;
  return JSON.parse(raw);
}

function saveDB(db){
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

document.getElementById("bookingForm").addEventListener("submit", function(e){
  e.preventDefault();

  const db = loadDB();
  if(!db){
    alert("Open admin panel first to initialize database.");
    return;
  }

  const pickup = this.pickupDate.value;
  const ret = this.returnDate.value;

  const car = db.cars.find(c => c.available);

  if(!car){
    alert("No cars available.");
    return;
  }

  const customerId = uid();

  db.customers.push({
    id: customerId,
    name: "Website Customer",
    email: "web@customer.com",
    phone: "-"
  });

  db.bookings.push({
    id: uid(),
    carId: car.id,
    customerId: customerId,
    start: pickup,
    end: ret,
    status: "pending"
  });

  car.available = false;

  saveDB(db);

  alert("Booking created! Check admin panel.");
});