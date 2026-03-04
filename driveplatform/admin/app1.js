/* =========================
   Simple SPA Admin Dashboard
   - Routes: dashboard, cars, bookings, customers, payments, settings
   - CRUD (demo) in localStorage
   - Export/Import JSON
========================= */

const LS_KEY = "drive_rentals_db_v1";

const seedDB = () => ({
  cars: [
    { id: uid(), name: "Toyota Yaris", type: "compact", location: "athens", price: 45, available: true, tag: "Economy" },
    { id: uid(), name: "Audi A3", type: "compact", location: "thessaloniki", price: 70, available: true, tag: "Best value" },
    { id: uid(), name: "BMW X5", type: "suv", location: "thessaloniki", price: 110, available: true, tag: "Featured" },
    { id: uid(), name: "Porsche 911", type: "sport", location: "islands", price: 180, available: true, tag: "Sport" },
    { id: uid(), name: "Mercedes C200", type: "sedan", location: "athens", price: 95, available: false, tag: "Premium" },
    { id: uid(), name: "Range Rover Evoque", type: "suv", location: "islands", price: 140, available: false, tag: "Luxury" },
  ],
  customers: [
    { id: uid(), name: "Nikos Papas", email: "nikos@example.com", phone: "+30 6900000001" },
    { id: uid(), name: "Maria Kosta", email: "maria@example.com", phone: "+30 6900000002" },
    { id: uid(), name: "Giannis Theo", email: "giannis@example.com", phone: "+30 6900000003" },
  ],
  bookings: [
    // link by ids
    // { id, carId, customerId, start, end, status }
  ],
  payments: [
    // { id, bookingId, amount, method, status, date }
  ],
  settings: {
    currency: "EUR",
    companyName: "Drive Rentals",
    notifications: true,
  }
});

function loadDB(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw){
    const s = seedDB();
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    return s;
  }
  try {
    const db = JSON.parse(raw);
    // basic sanity
    if(!db.cars || !db.customers || !db.bookings || !db.payments || !db.settings) throw new Error("bad db");
    return db;
  } catch {
    const s = seedDB();
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    return s;
  }
}
function saveDB(db){ localStorage.setItem(LS_KEY, JSON.stringify(db)); }

function uid(){ return Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(2,6); }

function prettyLocation(loc){
  if(loc === "thessaloniki") return "Thessaloniki";
  if(loc === "athens") return "Athens";
  if(loc === "islands") return "Islands";
  return "—";
}
function prettyType(t){
  if(t === "suv") return "SUV";
  if(t === "sedan") return "Sedan";
  if(t === "compact") return "Compact";
  if(t === "sport") return "Sport";
  return "—";
}
function fmtDate(d){
  if(!d) return "—";
  const x = new Date(d);
  if(isNaN(x.getTime())) return d;
  return x.toLocaleDateString("el-GR");
}
function clampNum(n, min, max){
  const x = Number(n);
  if(Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}

let db = loadDB();

let state = {
  route: "dashboard",
  globalQuery: "",
  dashboardSort: "featured",
  dashboardFilters: {
    location: "all",
    type: "all",
    maxPrice: 200,
    onlyAvailable: false
  }
};

const els = {
  nav: document.getElementById("nav"),
  viewRoot: document.getElementById("viewRoot"),
  pageTitle: document.getElementById("pageTitle"),
  pageSubtitle: document.getElementById("pageSubtitle"),
  globalSearch: document.getElementById("globalSearch"),
  clearSearch: document.getElementById("clearSearch"),
  exportBtn: document.getElementById("exportBtn"),
  primaryActionBtn: document.getElementById("primaryActionBtn"),

  modalBackdrop: document.getElementById("modalBackdrop"),
  modalTitle: document.getElementById("modalTitle"),
  modalDesc: document.getElementById("modalDesc"),
  modalBody: document.getElementById("modalBody"),
  modalClose: document.getElementById("modalClose"),
  modalCancel: document.getElementById("modalCancel"),
  modalOk: document.getElementById("modalOk"),
};

function setRoute(route){
  state.route = route;
  // nav active
  [...els.nav.querySelectorAll(".nav-item")].forEach(a => {
    a.classList.toggle("active", a.dataset.route === route);
  });
  // update header
  const headers = {
    dashboard: ["Drive Rentals", "Διαχειρίσου στόλο, τιμές και κρατήσεις σε ένα μέρος."],
    cars: ["Cars", "Διαχείριση στόλου (προσθήκη/επεξεργασία/διαγραφή)."],
    bookings: ["Bookings", "Κρατήσεις (δημιουργία/κατάσταση/ιστορικό)."],
    customers: ["Customers", "Πελάτες και στοιχεία επικοινωνίας."],
    payments: ["Payments", "Πληρωμές ανά κράτηση και μέθοδο."],
    settings: ["Settings", "Ρυθμίσεις και export/import δεδομένων."],
  };
  els.pageTitle.textContent = headers[route][0];
  els.pageSubtitle.textContent = headers[route][1];

  // primary action label per route
  const labels = {
    dashboard: "+ Add",
    cars: "+ Add Car",
    bookings: "+ Create Booking",
    customers: "+ Add Customer",
    payments: "+ Add Payment",
    settings: "Import JSON",
  };
  els.primaryActionBtn.textContent = labels[route] || "+ Add";

  render();
  // update hash
  location.hash = route;
}

function initRouting(){
  // sidebar click
  els.nav.addEventListener("click", (e) => {
    const a = e.target.closest(".nav-item");
    if(!a) return;
    e.preventDefault();
    setRoute(a.dataset.route);
  });

  // hash routing
  const hash = (location.hash || "").replace("#","");
  if(hash) state.route = hash;

  window.addEventListener("hashchange", () => {
    const h = (location.hash || "").replace("#","");
    if(h && h !== state.route) setRoute(h);
  });

  setRoute(state.route);
}

/* =========================
   Modal helper
========================= */
let modalOnOk = null;

function openModal({title, desc, bodyHTML, okText="Save", cancelText="Cancel", onOk}){
  els.modalTitle.textContent = title || "Modal";
  els.modalDesc.textContent = desc || "—";
  els.modalBody.innerHTML = bodyHTML || "";
  els.modalOk.textContent = okText;
  els.modalCancel.textContent = cancelText;
  modalOnOk = onOk || null;
  els.modalBackdrop.classList.add("show");
  els.modalBackdrop.setAttribute("aria-hidden","false");
}

function closeModal(){
  els.modalBackdrop.classList.remove("show");
  els.modalBackdrop.setAttribute("aria-hidden","true");
  modalOnOk = null;
  els.modalBody.innerHTML = "";
}

els.modalClose.addEventListener("click", closeModal);
els.modalCancel.addEventListener("click", closeModal);
els.modalBackdrop.addEventListener("click", (e) => {
  if(e.target === els.modalBackdrop) closeModal();
});
els.modalOk.addEventListener("click", async () => {
  if(modalOnOk){
    const res = await modalOnOk();
    if(res !== false) closeModal();
  } else {
    closeModal();
  }
});

/* =========================
   Topbar actions
========================= */
els.globalSearch.addEventListener("input", () => {
  state.globalQuery = els.globalSearch.value.trim().toLowerCase();
  render();
});
els.clearSearch.addEventListener("click", () => {
  els.globalSearch.value = "";
  state.globalQuery = "";
  render();
});

els.exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "drive-rentals-export.json";
  a.click();
  URL.revokeObjectURL(url);
});

els.primaryActionBtn.addEventListener("click", () => {
  if(state.route === "cars") return openCarModal();
  if(state.route === "bookings") return openBookingModal();
  if(state.route === "customers") return openCustomerModal();
  if(state.route === "payments") return openPaymentModal();
  if(state.route === "settings") return openImportModal();
  // dashboard -> add car
  return openCarModal();
});

/* =========================
   Render
========================= */
function render(){
  if(state.route === "dashboard") return renderDashboard();
  if(state.route === "cars") return renderCars();
  if(state.route === "bookings") return renderBookings();
  if(state.route === "customers") return renderCustomers();
  if(state.route === "payments") return renderPayments();
  if(state.route === "settings") return renderSettings();
  els.viewRoot.innerHTML = `<div class="panel"><div class="panel-title">Not found</div></div>`;
}

/* =========================
   Dashboard (like your screenshot)
========================= */
function badgeForCar(car){
  const availabilityClass = car.available ? "ok" : "danger";
  const availabilityText = car.available ? "Available" : "Booked";
  return `
    <div class="badges">
      <span class="pill">${escapeHtml(car.tag || "—")}</span>
      <span class="pill ${availabilityClass}">${availabilityText}</span>
    </div>
  `;
}

function carCard(car){
  const actionText = car.available ? "Book" : "Notify";
  const rightPill = car.available ? "Ready" : "Busy";
  return `
  <article class="card">
    <div class="card-media">
      ${badgeForCar(car)}
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(car.name)}</h3>
      <p class="card-sub">${prettyType(car.type)} • ${prettyLocation(car.location)}</p>

      <div class="card-row">
        <div class="price">${car.price}€ <span class="muted">/ day</span></div>
        <span class="pill">${rightPill}</span>
      </div>

      <div class="card-actions">
        <button class="small-btn" data-action="carDetails" data-id="${car.id}">Details</button>
        <button class="small-btn primary" data-action="carQuickAction" data-id="${car.id}">${actionText}</button>
      </div>
    </div>
  </article>`;
}

function sortCars(list, mode){
  const copy = [...list];
  if(mode === "priceAsc") return copy.sort((a,b) => a.price - b.price);
  if(mode === "priceDesc") return copy.sort((a,b) => b.price - a.price);
  // featured default: available first, then price asc
  return copy.sort((a,b) => Number(b.available) - Number(a.available) || a.price - b.price);
}

function dashboardFilteredCars(){
  const q = state.globalQuery;
  const f = state.dashboardFilters;

  let list = db.cars.filter(c => {
    if(q && !c.name.toLowerCase().includes(q)) return false;
    if(f.location !== "all" && c.location !== f.location) return false;
    if(f.type !== "all" && c.type !== f.type) return false;
    if(Number(c.price) > Number(f.maxPrice)) return false;
    if(f.onlyAvailable && !c.available) return false;
    return true;
  });

  return sortCars(list, state.dashboardSort);
}

function renderDashboard(){
  const carsShown = dashboardFilteredCars();
  const totalCars = db.cars.length;
  const availableCars = db.cars.filter(c => c.available).length;
  const bookedCars = totalCars - availableCars;

  els.viewRoot.innerHTML = `
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Total cars</div><div class="kpi-value">${totalCars}</div></div>
      <div class="kpi"><div class="kpi-label">Available</div><div class="kpi-value">${availableCars}</div></div>
      <div class="kpi"><div class="kpi-label">Booked</div><div class="kpi-value">${bookedCars}</div></div>
      <div class="kpi"><div class="kpi-label">Bookings</div><div class="kpi-value">${db.bookings.length}</div></div>
    </div>

    <div class="page-grid">
      <div class="panel">
        <div class="panel-title">Filters</div>

        <div class="field">
          <label>Location</label>
          <select id="fLocation">
            <option value="all">All</option>
            <option value="thessaloniki">Thessaloniki</option>
            <option value="athens">Athens</option>
            <option value="islands">Islands</option>
          </select>
        </div>

        <div class="field">
          <label>Type</label>
          <select id="fType">
            <option value="all">All</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="compact">Compact</option>
            <option value="sport">Sport</option>
          </select>
        </div>

        <div class="field">
          <label>Price / day (€)</label>
          <div class="range">
            <input id="fPrice" type="range" min="20" max="200" value="${state.dashboardFilters.maxPrice}" />
            <div class="range-row">
              <span class="muted">20€</span>
              <span id="fPriceLabel" class="pill">≤ ${state.dashboardFilters.maxPrice}€</span>
              <span class="muted">200€</span>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Availability</label>
          <div class="toggle-row">
            <label class="switch">
              <input id="fOnlyAvail" type="checkbox" ${state.dashboardFilters.onlyAvailable ? "checked":""} />
              <span class="slider"></span>
            </label>
            <span class="muted">Only available</span>
          </div>
        </div>

        <button class="btn full secondary" id="resetFilters">Reset filters</button>

        <div class="divider"></div>

        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <div class="muted">Cars shown</div><div style="font-weight:900;">${carsShown.length}</div>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <div class="muted">Total cars</div><div style="font-weight:900;">${totalCars}</div>
        </div>
      </div>

      <div class="panel">
        <div class="cards-header">
          <div class="panel-title" style="margin:0;">Fleet</div>
          <div class="tabs">
            <button class="tab ${state.dashboardSort==="featured"?"active":""}" data-sort="featured">Featured</button>
            <button class="tab ${state.dashboardSort==="priceAsc"?"active":""}" data-sort="priceAsc">Price ↑</button>
            <button class="tab ${state.dashboardSort==="priceDesc"?"active":""}" data-sort="priceDesc">Price ↓</button>
          </div>
        </div>

        <div class="cards-grid" id="dashCards">
          ${carsShown.map(carCard).join("")}
        </div>
      </div>
    </div>
  `;

  // set current values
  const fLoc = document.getElementById("fLocation");
  const fType = document.getElementById("fType");
  fLoc.value = state.dashboardFilters.location;
  fType.value = state.dashboardFilters.type;

  // bind filters
  fLoc.addEventListener("change", () => {
    state.dashboardFilters.location = fLoc.value;
    renderDashboard();
  });
  fType.addEventListener("change", () => {
    state.dashboardFilters.type = fType.value;
    renderDashboard();
  });

  const fPrice = document.getElementById("fPrice");
  const fPriceLabel = document.getElementById("fPriceLabel");
  fPrice.addEventListener("input", () => {
    state.dashboardFilters.maxPrice = Number(fPrice.value);
    fPriceLabel.textContent = `≤ ${fPrice.value}€`;
    renderDashboard();
  });

  const fOnly = document.getElementById("fOnlyAvail");
  fOnly.addEventListener("change", () => {
    state.dashboardFilters.onlyAvailable = fOnly.checked;
    renderDashboard();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state.dashboardFilters = { location:"all", type:"all", maxPrice:200, onlyAvailable:false };
    state.dashboardSort = "featured";
    renderDashboard();
  });

  // tabs sort
  els.viewRoot.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      state.dashboardSort = btn.dataset.sort;
      renderDashboard();
    });
  });

  // card actions
  els.viewRoot.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if(!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if(action === "carDetails"){
      const car = db.cars.find(c=>c.id===id);
      if(car) openCarModal(car);
    }
    if(action === "carQuickAction"){
      const car = db.cars.find(c=>c.id===id);
      if(!car) return;
      if(car.available){
        // create booking quick with first customer (demo)
        if(db.customers.length === 0){
          alert("Δεν υπάρχουν customers. Πρόσθεσε έναν πελάτη πρώτα.");
          return;
        }
        const customerId = db.customers[0].id;
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1).toISOString().slice(0,10);
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()+3).toISOString().slice(0,10);

        createBooking({ carId: car.id, customerId, start, end, status:"confirmed" });
        alert("Έγινε demo booking ✅ (δες Bookings)");
      } else {
        alert("Notify: demo action ✅");
      }
    }
  }, { once:true }); // avoid stacking
}

/* =========================
   Cars page
========================= */
function renderCars(){
  const q = state.globalQuery;
  const list = db.cars.filter(c => !q || c.name.toLowerCase().includes(q));

  els.viewRoot.innerHTML = `
    <div class="panel">
      <div class="panel-title">Cars</div>
      <table class="table">
        <thead>
          <tr>
            <th>Car</th><th>Type</th><th>Location</th><th>Price</th><th>Status</th><th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(c => `
            <tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${prettyType(c.type)}</td>
              <td>${prettyLocation(c.location)}</td>
              <td>${c.price}€</td>
              <td><span class="badge ${c.available ? "ok":"danger"}">${c.available ? "Available":"Booked"}</span></td>
              <td>
                <div class="row-actions">
                  <button class="icon-btn" data-act="editCar" data-id="${c.id}" title="Edit">✎</button>
                  <button class="icon-btn" data-act="toggleCar" data-id="${c.id}" title="Toggle">⟲</button>
                  <button class="icon-btn" data-act="delCar" data-id="${c.id}" title="Delete">🗑</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="help">Tip: Γράψε στο search πάνω δεξιά για να φιλτράρεις.</div>
    </div>
  `;

  els.viewRoot.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      const id = btn.dataset.id;
      const car = db.cars.find(c=>c.id===id);
      if(act==="editCar" && car) openCarModal(car);
      if(act==="toggleCar" && car){
        car.available = !car.available;
        saveDB(db);
        renderCars();
      }
      if(act==="delCar" && car){
        if(confirm("Να διαγραφεί το αυτοκίνητο;")){
          // also detach bookings/payments
          db.bookings = db.bookings.filter(b => b.carId !== id);
          db.payments = db.payments.filter(p => {
            const b = db.bookings.find(x => x.id === p.bookingId);
            return !!b;
          });
          db.cars = db.cars.filter(c => c.id !== id);
          saveDB(db);
          renderCars();
        }
      }
    });
  });
}

/* =========================
   Bookings page
========================= */
function bookingRow(b){
  const car = db.cars.find(c=>c.id===b.carId);
  const customer = db.customers.find(c=>c.id===b.customerId);
  const statusClass = b.status === "confirmed" ? "ok" : (b.status === "pending" ? "warn" : "danger");
  return `
    <tr>
      <td>${escapeHtml(customer?.name || "—")}</td>
      <td>${escapeHtml(car?.name || "—")}</td>
      <td>${fmtDate(b.start)} → ${fmtDate(b.end)}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(b.status)}</span></td>
      <td style="text-align:right;">
        <div class="row-actions">
          <button class="icon-btn" data-act="editBooking" data-id="${b.id}" title="Edit">✎</button>
          <button class="icon-btn" data-act="makePayment" data-id="${b.id}" title="Payment">€</button>
          <button class="icon-btn" data-act="delBooking" data-id="${b.id}" title="Delete">🗑</button>
        </div>
      </td>
    </tr>
  `;
}

function renderBookings(){
  const q = state.globalQuery;
  let list = [...db.bookings];

  if(q){
    list = list.filter(b => {
      const car = db.cars.find(c=>c.id===b.carId);
      const cu = db.customers.find(c=>c.id===b.customerId);
      return (car?.name || "").toLowerCase().includes(q) || (cu?.name || "").toLowerCase().includes(q);
    });
  }

  els.viewRoot.innerHTML = `
    <div class="panel">
      <div class="panel-title">Bookings</div>
      <table class="table">
        <thead>
          <tr>
            <th>Customer</th><th>Car</th><th>Dates</th><th>Status</th><th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.length ? list.map(bookingRow).join("") : `<tr><td colspan="5" class="muted">No bookings yet.</td></tr>`}
        </tbody>
      </table>
      <div class="help">Το “€” δημιουργεί payment για την κράτηση (demo).</div>
    </div>
  `;

  els.viewRoot.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      const id = btn.dataset.id;
      const b = db.bookings.find(x=>x.id===id);
      if(act==="editBooking" && b) openBookingModal(b);
      if(act==="makePayment" && b){
        openPaymentModal(null, b.id);
      }
      if(act==="delBooking" && b){
        if(confirm("Να διαγραφεί η κράτηση;")){
          db.payments = db.payments.filter(p => p.bookingId !== id);
          // free car if no other confirmed bookings (simple rule)
          const car = db.cars.find(c=>c.id===b.carId);
          db.bookings = db.bookings.filter(x => x.id !== id);
          if(car) car.available = true;
          saveDB(db);
          renderBookings();
        }
      }
    });
  });
}

/* =========================
   Customers page
========================= */
function renderCustomers(){
  const q = state.globalQuery;
  const list = db.customers.filter(c =>
    !q || c.name.toLowerCase().includes(q) || (c.email||"").toLowerCase().includes(q)
  );

  els.viewRoot.innerHTML = `
    <div class="panel">
      <div class="panel-title">Customers</div>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(c => `
            <tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${escapeHtml(c.email || "—")}</td>
              <td>${escapeHtml(c.phone || "—")}</td>
              <td style="text-align:right;">
                <div class="row-actions">
                  <button class="icon-btn" data-act="editCustomer" data-id="${c.id}">✎</button>
                  <button class="icon-btn" data-act="delCustomer" data-id="${c.id}">🗑</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  els.viewRoot.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      const id = btn.dataset.id;
      const c = db.customers.find(x=>x.id===id);
      if(act==="editCustomer" && c) openCustomerModal(c);
      if(act==="delCustomer" && c){
        if(confirm("Να διαγραφεί ο πελάτης;")){
          // also remove bookings/payments of that customer
          const bookingIds = db.bookings.filter(b => b.customerId === id).map(b=>b.id);
          db.payments = db.payments.filter(p => !bookingIds.includes(p.bookingId));
          db.bookings = db.bookings.filter(b => b.customerId !== id);
          db.customers = db.customers.filter(x => x.id !== id);
          saveDB(db);
          renderCustomers();
        }
      }
    });
  });
}

/* =========================
   Payments page
========================= */
function renderPayments(){
  const q = state.globalQuery;
  let list = [...db.payments];

  if(q){
    list = list.filter(p => {
      const b = db.bookings.find(x=>x.id===p.bookingId);
      const car = b ? db.cars.find(c=>c.id===b.carId) : null;
      const cu = b ? db.customers.find(c=>c.id===b.customerId) : null;
      return (car?.name||"").toLowerCase().includes(q) || (cu?.name||"").toLowerCase().includes(q);
    });
  }

  els.viewRoot.innerHTML = `
    <div class="panel">
      <div class="panel-title">Payments</div>
      <table class="table">
        <thead>
          <tr>
            <th>Date</th><th>Customer</th><th>Car</th><th>Amount</th><th>Method</th><th>Status</th><th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${list.length ? list.map(p => {
            const b = db.bookings.find(x=>x.id===p.bookingId);
            const car = b ? db.cars.find(c=>c.id===b.carId) : null;
            const cu = b ? db.customers.find(c=>c.id===b.customerId) : null;
            const stClass = p.status==="paid" ? "ok" : (p.status==="pending" ? "warn" : "danger");
            return `
              <tr>
                <td>${fmtDate(p.date)}</td>
                <td>${escapeHtml(cu?.name || "—")}</td>
                <td>${escapeHtml(car?.name || "—")}</td>
                <td>${Number(p.amount).toFixed(2)}€</td>
                <td>${escapeHtml(p.method)}</td>
                <td><span class="badge ${stClass}">${escapeHtml(p.status)}</span></td>
                <td style="text-align:right;">
                  <div class="row-actions">
                    <button class="icon-btn" data-act="editPayment" data-id="${p.id}">✎</button>
                    <button class="icon-btn" data-act="delPayment" data-id="${p.id}">🗑</button>
                  </div>
                </td>
              </tr>
            `;
          }).join("") : `<tr><td colspan="7" class="muted">No payments yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  els.viewRoot.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.act;
      const id = btn.dataset.id;
      const p = db.payments.find(x=>x.id===id);
      if(act==="editPayment" && p) openPaymentModal(p);
      if(act==="delPayment" && p){
        if(confirm("Να διαγραφεί η πληρωμή;")){
          db.payments = db.payments.filter(x => x.id !== id);
          saveDB(db);
          renderPayments();
        }
      }
    });
  });
}

/* =========================
   Settings page
========================= */
function renderSettings(){
  els.viewRoot.innerHTML = `
    <div class="panel">
      <div class="panel-title">Settings</div>

      <div class="field">
        <label>Company name</label>
        <input class="input" id="setCompany" value="${escapeAttr(db.settings.companyName)}" />
      </div>

      <div class="field">
        <label>Currency</label>
        <select id="setCurrency">
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
        </select>
      </div>

      <div class="field">
        <label>Notifications</label>
        <div class="toggle-row">
          <label class="switch">
            <input id="setNotif" type="checkbox" ${db.settings.notifications ? "checked":""} />
            <span class="slider"></span>
          </label>
          <span class="muted">Enable</span>
        </div>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn secondary" id="saveSettings">Save settings</button>
        <button class="btn secondary" id="resetDB">Reset demo data</button>
        <button class="btn primary" id="importBtn">Import JSON</button>
      </div>

      <div class="divider"></div>
      <div class="help">Export: από το κουμπί “Export” πάνω δεξιά. Import: “Import JSON”.</div>
    </div>
  `;

  document.getElementById("setCurrency").value = db.settings.currency;

  document.getElementById("saveSettings").addEventListener("click", () => {
    db.settings.companyName = document.getElementById("setCompany").value.trim() || "Drive Rentals";
    db.settings.currency = document.getElementById("setCurrency").value;
    db.settings.notifications = document.getElementById("setNotif").checked;
    saveDB(db);
    alert("Saved ✅");
  });

  document.getElementById("resetDB").addEventListener("click", () => {
    if(confirm("Reset demo data; Θα χαθούν οι αλλαγές.")){
      db = seedDB();
      saveDB(db);
      render();
    }
  });

  document.getElementById("importBtn").addEventListener("click", openImportModal);
}

/* =========================
   CRUD: Cars
========================= */
function openCarModal(car=null){
  const isEdit = !!car;
  const data = car ? {...car} : { name:"", type:"compact", location:"thessaloniki", price:60, available:true, tag:"Featured" };

  openModal({
    title: isEdit ? "Edit Car" : "Add Car",
    desc: "Συμπλήρωσε τα στοιχεία του αυτοκινήτου.",
    okText: isEdit ? "Update" : "Create",
    bodyHTML: `
      <div class="form">
        <div class="field">
          <label>Name</label>
          <input class="input" id="carName" value="${escapeAttr(data.name)}" placeholder="e.g. BMW X5" />
        </div>

        <div class="field">
          <label>Type</label>
          <select id="carType" class="select">
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="compact">Compact</option>
            <option value="sport">Sport</option>
          </select>
        </div>

        <div class="field">
          <label>Location</label>
          <select id="carLoc" class="select">
            <option value="thessaloniki">Thessaloniki</option>
            <option value="athens">Athens</option>
            <option value="islands">Islands</option>
          </select>
        </div>

        <div class="field">
          <label>Price / day (€)</label>
          <input class="input" id="carPrice" type="number" min="1" value="${Number(data.price)}" />
        </div>

        <div class="field">
          <label>Tag</label>
          <input class="input" id="carTag" value="${escapeAttr(data.tag)}" placeholder="Featured / Economy / Luxury..." />
        </div>

        <div class="field">
          <label>Availability</label>
          <div class="toggle-row">
            <label class="switch">
              <input id="carAvail" type="checkbox" ${data.available ? "checked":""} />
              <span class="slider"></span>
            </label>
            <span class="muted">Available</span>
          </div>
        </div>
      </div>
    `,
    onOk: () => {
      const name = document.getElementById("carName").value.trim();
      const type = document.getElementById("carType").value;
      const location = document.getElementById("carLoc").value;
      const price = clampNum(document.getElementById("carPrice").value, 1, 9999);
      const tag = document.getElementById("carTag").value.trim() || "—";
      const available = document.getElementById("carAvail").checked;

      if(!name){
        alert("Βάλε όνομα αυτοκινήτου.");
        return false;
      }

      if(isEdit){
        const idx = db.cars.findIndex(c=>c.id===car.id);
        if(idx >= 0){
          db.cars[idx] = { ...db.cars[idx], name, type, location, price, tag, available };
        }
      } else {
        db.cars.unshift({ id: uid(), name, type, location, price, tag, available });
      }
      saveDB(db);
      render();
    }
  });

  // set selects after modal render
  setTimeout(() => {
    document.getElementById("carType").value = data.type;
    document.getElementById("carLoc").value = data.location;
  }, 0);
}

/* =========================
   CRUD: Customers
========================= */
function openCustomerModal(customer=null){
  const isEdit = !!customer;
  const data = customer ? {...customer} : { name:"", email:"", phone:"" };

  openModal({
    title: isEdit ? "Edit Customer" : "Add Customer",
    desc: "Στοιχεία πελάτη.",
    okText: isEdit ? "Update" : "Create",
    bodyHTML: `
      <div class="form">
        <div class="field">
          <label>Name</label>
          <input class="input" id="cuName" value="${escapeAttr(data.name)}" placeholder="Full name" />
        </div>
        <div class="field">
          <label>Email</label>
          <input class="input" id="cuEmail" value="${escapeAttr(data.email)}" placeholder="email@example.com" />
        </div>
        <div class="field">
          <label>Phone</label>
          <input class="input" id="cuPhone" value="${escapeAttr(data.phone)}" placeholder="+30 69..." />
        </div>
      </div>
    `,
    onOk: () => {
      const name = document.getElementById("cuName").value.trim();
      const email = document.getElementById("cuEmail").value.trim();
      const phone = document.getElementById("cuPhone").value.trim();
      if(!name){
        alert("Βάλε όνομα πελάτη.");
        return false;
      }
      if(isEdit){
        const idx = db.customers.findIndex(c=>c.id===customer.id);
        if(idx >= 0) db.customers[idx] = { ...db.customers[idx], name, email, phone };
      } else {
        db.customers.unshift({ id: uid(), name, email, phone });
      }
      saveDB(db);
      render();
    }
  });
}

/* =========================
   CRUD: Bookings
========================= */
function openBookingModal(booking=null){
  const isEdit = !!booking;
  const data = booking ? {...booking} : {
    carId: db.cars[0]?.id || "",
    customerId: db.customers[0]?.id || "",
    start: new Date().toISOString().slice(0,10),
    end: new Date(Date.now()+2*86400000).toISOString().slice(0,10),
    status: "confirmed"
  };

  if(db.cars.length === 0){
    alert("Δεν υπάρχουν cars. Πρόσθεσε αυτοκίνητο πρώτα.");
    return;
  }
  if(db.customers.length === 0){
    alert("Δεν υπάρχουν customers. Πρόσθεσε πελάτη πρώτα.");
    return;
  }

  openModal({
    title: isEdit ? "Edit Booking" : "Create Booking",
    desc: "Σύνδεσε πελάτη + αυτοκίνητο + ημερομηνίες.",
    okText: isEdit ? "Update" : "Create",
    bodyHTML: `
      <div class="form">
        <div class="field">
          <label>Customer</label>
          <select id="bCustomer" class="select">
            ${db.customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
          </select>
        </div>

        <div class="field">
          <label>Car</label>
          <select id="bCar" class="select">
            ${db.cars.map(c => `<option value="${c.id}">${escapeHtml(c.name)} (${c.price}€)</option>`).join("")}
          </select>
        </div>

        <div class="field">
          <label>Start date</label>
          <input id="bStart" class="input" type="date" value="${escapeAttr(data.start)}" />
        </div>

        <div class="field">
          <label>End date</label>
          <input id="bEnd" class="input" type="date" value="${escapeAttr(data.end)}" />
        </div>

        <div class="field">
          <label>Status</label>
          <select id="bStatus" class="select">
            <option value="confirmed">confirmed</option>
            <option value="pending">pending</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        <div class="help">Demo rule: όταν status=confirmed → το car γίνεται Booked (available=false).</div>
      </div>
    `,
    onOk: () => {
      const customerId = document.getElementById("bCustomer").value;
      const carId = document.getElementById("bCar").value;
      const start = document.getElementById("bStart").value;
      const end = document.getElementById("bEnd").value;
      const status = document.getElementById("bStatus").value;

      if(!customerId || !carId || !start || !end){
        alert("Συμπλήρωσε όλα τα πεδία.");
        return false;
      }
      if(new Date(end) < new Date(start)){
        alert("Το end date πρέπει να είναι μετά το start date.");
        return false;
      }

      if(isEdit){
        const idx = db.bookings.findIndex(b=>b.id===booking.id);
        if(idx >= 0){
          db.bookings[idx] = { ...db.bookings[idx], customerId, carId, start, end, status };
        }
      } else {
        createBooking({ customerId, carId, start, end, status });
      }

      // apply car availability based on confirmed bookings
      updateCarAvailabilityFromBookings();
      saveDB(db);
      render();
    }
  });

  setTimeout(() => {
    document.getElementById("bCustomer").value = data.customerId;
    document.getElementById("bCar").value = data.carId;
    document.getElementById("bStatus").value = data.status;
  }, 0);
}

function createBooking({customerId, carId, start, end, status}){
  db.bookings.unshift({ id: uid(), customerId, carId, start, end, status });
  updateCarAvailabilityFromBookings();
  saveDB(db);
}

function updateCarAvailabilityFromBookings(){
  // simple: if any confirmed booking exists for car -> available=false else true
  const confirmedByCar = new Set(db.bookings.filter(b=>b.status==="confirmed").map(b=>b.carId));
  db.cars.forEach(c => {
    c.available = !confirmedByCar.has(c.id);
  });
}

/* =========================
   CRUD: Payments
========================= */
function openPaymentModal(payment=null, bookingIdPrefill=null){
  const isEdit = !!payment;

  if(db.bookings.length === 0){
    alert("Δεν υπάρχουν bookings. Φτιάξε booking πρώτα.");
    return;
  }

  const data = payment ? {...payment} : {
    bookingId: bookingIdPrefill || db.bookings[0].id,
    amount: 120,
    method: "card",
    status: "paid",
    date: new Date().toISOString().slice(0,10),
  };

  openModal({
    title: isEdit ? "Edit Payment" : "Add Payment",
    desc: "Καταχώρηση πληρωμής για κράτηση.",
    okText: isEdit ? "Update" : "Create",
    bodyHTML: `
      <div class="form">
        <div class="field">
          <label>Booking</label>
          <select id="pBooking" class="select">
            ${db.bookings.map(b => {
              const car = db.cars.find(c=>c.id===b.carId);
              const cu = db.customers.find(c=>c.id===b.customerId);
              return `<option value="${b.id}">${escapeHtml(cu?.name||"—")} • ${escapeHtml(car?.name||"—")} • ${fmtDate(b.start)}-${fmtDate(b.end)}</option>`;
            }).join("")}
          </select>
        </div>

        <div class="field">
          <label>Amount (€)</label>
          <input id="pAmount" class="input" type="number" min="0" step="0.01" value="${Number(data.amount)}" />
        </div>

        <div class="field">
          <label>Method</label>
          <select id="pMethod" class="select">
            <option value="card">card</option>
            <option value="cash">cash</option>
            <option value="bank">bank</option>
            <option value="crypto">crypto</option>
          </select>
        </div>

        <div class="field">
          <label>Status</label>
          <select id="pStatus" class="select">
            <option value="paid">paid</option>
            <option value="pending">pending</option>
            <option value="failed">failed</option>
          </select>
        </div>

        <div class="field">
          <label>Date</label>
          <input id="pDate" class="input" type="date" value="${escapeAttr(data.date)}" />
        </div>
      </div>
    `,
    onOk: () => {
      const bookingId = document.getElementById("pBooking").value;
      const amount = clampNum(document.getElementById("pAmount").value, 0, 999999);
      const method = document.getElementById("pMethod").value;
      const status = document.getElementById("pStatus").value;
      const date = document.getElementById("pDate").value;

      if(!bookingId || !date){
        alert("Συμπλήρωσε booking και date.");
        return false;
      }

      if(isEdit){
        const idx = db.payments.findIndex(p=>p.id===payment.id);
        if(idx >= 0){
          db.payments[idx] = { ...db.payments[idx], bookingId, amount, method, status, date };
        }
      } else {
        db.payments.unshift({ id: uid(), bookingId, amount, method, status, date });
      }

      saveDB(db);
      render();
    }
  });

  setTimeout(() => {
    document.getElementById("pBooking").value = data.bookingId;
    document.getElementById("pMethod").value = data.method;
    document.getElementById("pStatus").value = data.status;
  }, 0);
}

/* =========================
   Import Modal
========================= */
function openImportModal(){
  openModal({
    title: "Import JSON",
    desc: "Κάνε paste το export JSON εδώ και πάτα Import.",
    okText: "Import",
    bodyHTML: `
      <div class="form">
        <div class="field">
          <label>JSON</label>
          <textarea id="importText" class="input" rows="10" style="resize:vertical;"></textarea>
        </div>
        <div class="help">Προσοχή: θα αντικαταστήσει όλα τα δεδομένα.</div>
      </div>
    `,
    onOk: () => {
      const txt = document.getElementById("importText").value.trim();
      if(!txt){
        alert("Βάλε JSON.");
        return false;
      }
      try{
        const next = JSON.parse(txt);
        if(!next.cars || !next.customers || !next.bookings || !next.payments || !next.settings){
          alert("Μη έγκυρο format.");
          return false;
        }
        db = next;
        saveDB(db);
        render();
      }catch{
        alert("JSON parse error.");
        return false;
      }
    }
  });
}

/* =========================
   Utils: escaping
========================= */
function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function escapeAttr(str){ return escapeHtml(str).replaceAll("\n"," "); }

/* =========================
   Boot
========================= */
initRouting();

// default route if empty hash
if(!location.hash) location.hash = "#dashboard";