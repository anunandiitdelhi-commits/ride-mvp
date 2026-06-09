import { useEffect, useState }
from "react";
import { useNavigate } from "react-router-dom";

import { io }
from "socket.io-client";

import { API_URL }
from "../services/api";

const socket =
  io("http://localhost:5000");



export default function Driver() {

  const navigate = useNavigate();

  const [rides, setRides] =
    useState([]);

  const [isOnline, setIsOnline] =
    useState(false);

    const [earnings,setEarnings] = useState({

    totalEarnings: 0,

    totalTrips: 0

  });



  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

async function loadEarnings() {

  try {

    const driverId =
      localStorage.getItem(
        "userId"
      );

    const response =
      await fetch(

        `${API_URL}/driver/earnings/${driverId}`,

        {

          headers: {

            Authorization:
              `Bearer ${
                localStorage.getItem(
                  "token"
                )
              }`

          }

        }

      );

    const data =
      await response.json();

    setEarnings(data);

  } catch (error) {

    console.log(error);

  }

}

    async function completeRide(id) {

  try {

    await fetch(

      `${API_URL}/rides/complete/${id}`,

      {
        method: "PUT"
      }

    );

    loadRides();

  } catch (error) {

    console.log(error);

  }

}

async function ratePassenger(ride) {
  const rating = Number(prompt("Rate Passenger (1-5)"));
  const comment = prompt("Write review");
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        rideId: ride._id,
        reviewTargetId: ride.passengerId,
        rating,
        comment
      })
    });
    alert('Review submitted!');
  } catch (error) {
    console.log(error);
  }
}

  useEffect(() => {

    loadRides();
    loadEarnings();
   const user = JSON.parse(localStorage.getItem("user"));
socket.emit("driverAvailable", {
  driverId: user?._id || user?.id,
});


    socket.on(
      "newRideRequest",
      () => {

        loadRides();

      }
    );

  }, []);

  async function updateDriverLocation() {

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      socket.emit(
        "driverLocationUpdate",
        {

          driverId:
            localStorage.getItem(
              "userId"
            ),

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude

        }

      );

    const distanceToPickup = 50;
    if (distanceToPickup < 100) {
      socket.emit("driverArrived", localStorage.getItem("rideId"));
    }

    }

  );

}

useEffect(() => {

  const interval =
    setInterval(() => {

      updateDriverLocation();

    }, 5000);

  return () =>
    clearInterval(interval);

}, []);



  async function goOnline() {

    try {

      const user = JSON.parse(localStorage.getItem("user"));

      await fetch(

        `${API_URL}/users/driver/${user.id || user._id}/status`,

        {

          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
              "Authorization": 'Bearer ${localStorage.getItem("token")}'
          },

          body: JSON.stringify({

            isOnline: true,

            lat: 11.8745,

            lng: 75.3704

          })

        }

      );

      setIsOnline(true);

      socket.emit("driverAvailable", {
  driverId: user?._id || user?.id,
});

    } catch (error) {

      console.log(error);

    }

  }



  async function loadRides() {

    try {

      const response =
        await fetch(
          `${API_URL}/rides`
        );

      const data =
        await response.json();

      const myRides =
        data.filter(

          ride =>
            ride.status === "requested"

        );

      setRides(myRides);

    } catch (error) {

      console.log(error);

    }

  }



  async function acceptRide(id) {

    try {

      await fetch(

        `${API_URL}/rides/accept/${id}`,

        {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorisation: `Bearer ${localStorage.getItem("token")}`,
          }
        }

      );

      loadRides();

    } catch (error) {

      console.log(error);

    }

  }



  function simulateMovement() {

    let lat = 11.8745;
    let lng = 75.3704;

    setInterval(async () => {

      lat += 0.001;
      lng += 0.001;

      await fetch(

        `${API_URL}/users/driver/${user.id}/status`,

        {

          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
            "Authorization":
              'Bearer ${localStorage.getItem("token")}'
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

async function cancelRide(id) {

  try {

    const reason =
      prompt(
        "Cancellation reason?"
      );

    if (!reason) return;

    await fetch(

      `${API_URL}/rides/cancel/${id}`,

      {

        method: "PUT",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${
              localStorage.getItem(
                "token"
              )
            }`

        },

        body: JSON.stringify({
          reason
        })

      }

    );

    loadRides();

  } catch (error) {

    console.log(error);

  }

}

  return (

   
    <div className="page">

      <h1 className="page-title">

        🚗 Driver Dashboard
      </h1>

      <button onclick={()  => navigate("/driver-history")}>
        History
      </button>

      <div className="card">

  <h2>
    💰 Total Earnings
  </h2>

  <h1>
    ₹{earnings.totalEarnings}
  </h1>

  <h3>
    Trips:
    {earnings.totalTrips}
  </h3>

  <h3>
  Today:
  ₹{earnings.todayEarnings}
  </h3>

</div>

      <button
        onClick={goOnline}
       className="primary-btn"
      >

        {
          isOnline
          ? "Online"
          : "Go Online"
        }

      </button>

      <button
        onClick={simulateMovement}
       className="primary-btn"
      >

        Simulate Movement

      </button>

      <h2>
        Assigned Rides
      </h2>

      {rides.map((ride) => (

        <div
          key={ride._id}
          className="card"
        >

          <p>
            Pickup:
            {ride.pickup}
          </p>

          <p>
            Drop:
            {ride.drop}
          </p>

          <p>
            Status:
            {ride.status}
          </p>

          <button
            onClick={() =>
              acceptRide(ride._id)
            }
            className="primary-btn"
          >

            Accept Ride
 

          </button>

          <button
  onClick={() =>
    completeRide(ride._id)
  }
  className="primary-btn"
>

  Complete Ride

</button>

{ride.status === "completed" && (
  <button
    onClick={() => ratePassenger(ride)}
    className="primary-btn"
  >
    ⭐ Rate Passenger
  </button>
)}

<button
  onClick={() =>
    cancelRide(ride._id)
  }
  className="primary-btn"
>

  Cancel Ride

</button>

<p>

  Cancelled By:
  {ride.cancelledBy || "N/A"}

</p>

<p>

  Reason:
  {ride.cancellationReason || "N/A"}

</p>

         



        </div>

      ))}

    </div>

  );

}
