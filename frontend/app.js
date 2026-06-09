let currentRideId = null;
const socket = io("http://127.0.0.1:5000");
const map = L.map("map").setView(
  [11.8745, 75.3704],
  13
);

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "© OpenStreetMap contributors"
  }
).addTo(map);
let pickupMarker = null;
let dropMarker = null;

let pickupCoords = null;
let dropCoords = null;
let driverMarker = null;

map.on("click", function (e) {

  const { lat, lng } = e.latlng;

  if (!pickupMarker) {

    pickupMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Pickup")
      .openPopup();

    pickupCoords = { lat, lng };
    document.getElementById("pickup").value =
  `${lat}, ${lng}`;

  } else if (!dropMarker) {

    dropMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Drop")
      .openPopup();

    dropCoords = { lat, lng };
    document.getElementById("drop").value =
  `${lat}, ${lng}`;

  }

});
socket.on("connect", () => {
  console.log("✅ Connected to realtime server");
});
socket.on("rideUpdated", (ride) => {

  if (ride._id === currentRideId) {

    document.getElementById("rideStatus").innerHTML = `
      <h3>Ride Status:</h3>
      <p>${ride.status}</p>
    `;

  }

});
socket.on("driverLocationUpdated", (driver) => {

  const lat = driver.location.lat;
  const lng = driver.location.lng;

  if (!driverMarker) {

    driverMarker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("🚗 Driver");

  } else {

    driverMarker.setLatLng([lat, lng]);

  }

});
async function requestRide() {

  const passengerId =
    document.getElementById("passengerId").value;

  const pickup =
    document.getElementById("pickup").value;

  const drop =
    document.getElementById("drop").value;

  try {

    const response = await fetch(
      "http://127.0.0.1:5000/api/rides/request",
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
         'Authorization':
           `Bearer ${localStorage.getItem("token")}`
        },

        body: JSON.stringify({
          passengerId,
          pickup,
          drop
        })

      }
    );

    const data = await response.json();
    currentRideId = data.ride._id;
    document.getElementById("result").innerHTML = `
      <p>${data.message}</p>
    `;

  } catch (error) {

    document.getElementById("result").innerHTML = `
      <p>Error requesting ride</p>
    `;

  }

}