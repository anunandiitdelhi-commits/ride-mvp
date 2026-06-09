const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Driver connected realtime");
});


socket.on("newRide", (ride) => {

  alert("🚕 New Ride Request Received!");

  loadRides();

});
async function goOnline() {

  const driverId =
    document.getElementById("driverId").value;

  try {

    const response = await fetch(
      `http://localhost:5000/api/users/driver/${driverId}/status`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          isOnline: true,
          lat: 11.8745,
          lng: 75.3704
        })

      }
    );

    const data = await response.json();

    alert(data.message);

  } catch (error) {

    alert("Error going online");

  }

}
async function simulateMovement() {

  const driverId =
    document.getElementById("driverId").value;

  let lat = 11.8745;
  let lng = 75.3704;

  setInterval(async () => {

    lat += 0.001;
    lng += 0.001;

    await fetch(
      `http://localhost:5000/api/users/driver/${driverId}/status`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          isOnline: true,
          lat,
          lng
        })

      }
    );

  }, 3000);

}


async function loadRides() {

  const driverId =
    document.getElementById("driverId").value;

  try {

    const response = await fetch(
      "http://localhost:5000/api/rides"
    );

    const rides = await response.json();

    const driverRides =
      rides.filter(
        ride => ride.driverId === driverId
      );

    let html = "";

    driverRides.forEach(ride => {

      html += `
        <div class="ride-card">

          <p><strong>Pickup:</strong>
          ${ride.pickup}</p>

          <p><strong>Drop:</strong>
          ${ride.drop}</p>

          <p><strong>Status:</strong>
          ${ride.status}</p>

          <button onclick="acceptRide('${ride._id}')">
            Accept Ride
          </button>

        </div>
      `;

    });

    document.getElementById("rides").innerHTML = html;

  } catch (error) {

    console.log(error);

  }

}



async function acceptRide(rideId) {

  try {

    const response = await fetch(
      `http://localhost:5000/api/rides/accept/${rideId}`,
      {
        method: "PUT"
      }
    );

    const data = await response.json();

    alert(data.message);

    loadRides();

  } catch (error) {

    console.log(error);

  }

}