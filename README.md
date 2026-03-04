# DrivePlatform 🚗

DrivePlatform is a **mini car rental platform** that includes a public
booking website and an administrative dashboard.

The goal of this project is to demonstrate how a simple **platform
architecture** works using only **HTML, CSS and Vanilla JavaScript**,
without external frameworks.

It simulates the core workflow of a rental platform where:

User bookings → are stored → and managed from an admin dashboard.

------------------------------------------------------------------------

# 🌐 Platform Overview

The project is divided into two main interfaces.

## 1️⃣ User Website

The public-facing website allows customers to:

-   View the rental service
-   Enter pickup and return dates
-   Select a car category
-   Calculate estimated rental cost
-   Submit a booking request

When a booking is submitted, the data is stored in **LocalStorage** and
becomes visible inside the admin dashboard.

------------------------------------------------------------------------

## 2️⃣ Admin Dashboard

The admin panel is the internal control center of the platform.

It allows administrators to manage the entire rental system.

Main features include:

-   Fleet management
-   Booking management
-   Customer records
-   Payment tracking
-   Platform settings

------------------------------------------------------------------------

# ⚙️ Technologies Used

This project was intentionally built without frameworks to showcase core
frontend development skills.

Technologies used:

-   HTML5
-   CSS3
-   Vanilla JavaScript
-   LocalStorage (client-side database)

------------------------------------------------------------------------

# 📂 Project Structure

driveplatform │ ├── index.html ├── style.css ├── javascript.js │ └──
admin ├── index.html ├── styles.css └── app.js

------------------------------------------------------------------------

# 🔄 System Workflow

User Website\
↓\
Booking Form\
↓\
LocalStorage Database\
↓\
Admin Dashboard

When a user submits a booking:

1.  A booking entry is created
2.  A customer record is generated
3.  The booking appears inside the admin panel
4.  The admin can manage bookings and payments

------------------------------------------------------------------------

# 📊 Admin Dashboard Modules

### Dashboard

Overview of the platform status.

### Cars

Add, edit or remove vehicles from the fleet.

### Bookings

View and manage reservations.

### Customers

Store and manage customer information.

### Payments

Register payments related to bookings.

### Settings

Manage platform configuration and export data.

------------------------------------------------------------------------

# 🚀 Running the Project

## Option 1 --- VS Code Live Server

1.  Open the project folder in **VS Code**
2.  Install the extension **Live Server**
3.  Right click `index.html`
4.  Select **Open with Live Server**

------------------------------------------------------------------------

## Option 2 --- Python Local Server

Run:

python -m http.server 5500

Then open:

User site\
http://localhost:5500

Admin dashboard\
http://localhost:5500/admin/index.html

------------------------------------------------------------------------

# 🔐 Admin Panel

The admin dashboard is located at:

/admin/index.html

It is not linked from the public website and is intended for internal
use.

------------------------------------------------------------------------

# 🎯 Project Purpose

This project was created as a **portfolio and learning project** to
demonstrate:

-   platform architecture
-   UI dashboard development
-   state management
-   client-side data storage
-   full booking workflow simulation

------------------------------------------------------------------------

# 🔮 Future Improvements

Possible improvements include:

-   Authentication system for admin access
-   Real database integration (Firebase or Supabase)
-   Real-time fleet availability
-   Online payments (Stripe)
-   Booking calendar
-   Analytics dashboard

------------------------------------------------------------------------

# 📜 License

Apache License 2.0
# driveplatform-
