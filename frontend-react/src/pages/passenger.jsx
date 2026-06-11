import { useEffect, useState, useRef} from "react";

import { useNavigate } from "react-router-dom";


import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  GeoJSON
}
from "react-leaflet";

import { io }
from "socket.io-client";

import { API_URL }
from "../services/api";

import { getRoute } 
from "../services/routeService";

const socket =
  io(import.meta.env.VITE_API_URI || "https://zooming-light.up.railway.app");



export default function Passenger() {

  const [pickup, setPickup] =
    useState(null);

  const [currentLocation,
    setCurrentLocation] =
    useState([11.8745, 75.3704]);

  const [drop, setDrop] =
    useState(null);

  const [rideStatus, setRideStatus] =
    useState("");

  const [fare, setFare] =
    useState(0);

  const[routeData, setRouteData] = 
    useState(null);

  const [driverLocation,
    setDriverLocation] =
    useState(null);

  const [currentRideId,
    setCurrentRideId] =
    useState(null);

  const [paymentMethod,
     setPaymentMethod] = 
     useState("cash");

  const [paymentDone, 
      setPaymentDone] =
      useState(false);
 

  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    console.log("pickup:", pickup, "drop:", drop);
    if(pickup && drop) {
      getRoute(pickup[0],pickup[1], drop[0], drop[1])
      .then(data => { console.log("Route data:"); setRouteData(data);})
      .catch(err => console.log(err));
    }
  }, [pickup, drop]);

  useEffect(() => {

    navigator.geolocation.getCurrentPosition(

  (position) => {

    const lat =
      position.coords.latitude;

    const lng =
      position.coords.longitude;

    setCurrentLocation([
      lat,
      lng
    ]);
      setPickup([
      lat,
      lng
    ]);
  },

  (error) => {

    console.log(error);
    // keep the default location if geolocation fails
    setCurrentLocation([11.8745, 75.3704]);
  }

);

socket.on("driverLocationUpdated", (location) => {
  setDriverLocation(location);
});

    socket.on(
      "rideUpdated",
      (ride) => {

        if (
          ride._id === currentRideId
        ) {

          setRideStatus(
            ride.status
          );

        }

      }
    );



    socket.on(
      "driverLocationUpdated",
      (driver) => {

        if (driver.location) {

          setDriverLocation([
            driver.location.lat,
            driver.location.lng
          ]);

        }

      }
    );

    socket.on("driverArrived", () =>{
      alert("Driver has arrived!");
    });

  }, [currentRideId]);

  useEffect(() => {
    if (driverLocation && mapRef.current) {
      mapRef.current.flyTo(
        [driverLocation.latitude, driverLocation.longitude],
        15
      ); 
    }
  }, [driverLocation]);



  function LocationSelector({ pickup }) {

    useMapEvents({

      click(e) {

        const coords = [
          e.latlng.lat,
          e.latlng.lng
        ];

        if (!pickup) {

          setPickup(coords);
          console.log("Pickup set:", coords);

        } else if (!drop) {

          setDrop(coords);
          console.log("Drop set:", coords);
          if (pickup) {}
          getRoute(pickup[0], pickup[1], coords[0], coords[1])
          .then(data => { console.log("Route:", data); setRouteData(data); })
          .catch(err => console.log("Error:", err));

        }

      }

    });

    return null;

  }

  async function calculateRoute() {
  if (!pickup || !drop) {
    alert("Please select pickup and drop locations");
    return;
  }
  try {
    const data = await getRoute(
      pickup[0], pickup[1],
      drop[0], drop[1]
    );
    setRouteData(data);
  } catch (err) {
    alert("Could not calculate route. Try again.");
  }
}

  async function requestRide() {

    try {

      const user =
        JSON.parse(
          localStorage.getItem("user"))
         if (!user){
          alert("Please login first");
          return;
        }
        
       
      const response = await fetch(

        `${API_URL}/rides/request`,

        {

          method: "POST",

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

            passengerId: user.id,

            pickup:
              pickup?.join(","),

            drop:
              drop?.join(",")

          })

        }

      );

      const data =
        await response.json();
        
    
      if (data && data.ride){
        setCurrentRideId(
          data.ride._id
        );
      
      setRideStatus(
        data.ride.status
      );
      socket.emit("requestRide", {
  rideId: data.ride._id,
  passengerId: user.id || user._id,
  pickup: pickup?.join(","),
  drop: drop?.join(","),
});
    
      setFare(data.ride.fare);
      }
    } catch (error) {

      console.log(error);

    }

  }

  async function cancelRide() {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/rides/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    setRideStatus(null);
  } catch (error) {
    console.log(error);
  }
}

async function payRide() {
  const res = await fetch(
    `${API_URL}/payment/pay/${currentRideId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ paymentMethod }),
    }
  );
  const data = await res.json();
  navigate("/receipt", {
    state: {
      rideId: currentRideId,
      date: new Date(),
      fare: fare,
      paymentMethod: paymentMethod,
      paymentStatus: data.ride?.paymentStatus || "paid",
    },
  });
}

async function rateDriver() {

  const rating =
    Number(
      prompt(
        "Rate Driver (1-5)"
      )
    );

  const comment =
    prompt(
      "Write review"
    );

  await fetch(

    `${API_URL}/reviews/create`,

    {

      method: "POST",

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

        rideId:
          currentRideId,

        reviewTargetId:
          assignedDriverId,

        rating,

        comment

      })

    }

  );

}

  return (

    <div
       className="page">
    

      <h1 className="page-title">

        🚕 Passenger Dashboard
      </h1>

      

      <MapContainer

        key="passenger-map"

        center={currentLocation}

        zoom={13}

        className="map-container" 
        ref={mapRef}>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationSelector pickup={pickup} />
          <Marker position={currentLocation}>

  <Popup>
    📍 You are here
  </Popup>

          
          </Marker>
        {pickup && (
          <Marker position={pickup}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {drop && (
          <Marker position={drop}>
            <Popup>Drop</Popup>
          </Marker>
        )}

        {driverLocation && (
          <Marker position={[driverLocation.latitude, driverLocation.longitude]}>
            <Popup>🚗 Driver</Popup>
          </Marker>
        )}

         {routeData && routeData.geojson && (
          <GeoJSON data={routeData.geojson} />
         )}

      </MapContainer>

     

      <button
  onClick={() =>
    navigate(
      "/passenger-history"
    )
  }
>
  History
</button>

<button onClick={calculateRoute} className="calc-route-btn" style={{display:"block", width:"100%"}}>
      Calculate Route
      </button>

    {routeData && (
  <div className="route-info">
    <p>📍 Distance: {routeData.distance} km</p>
    <p>⏱ ETA: {routeData.duration} min</p>
    <p>💰 Fare: ₹{routeData.fare}</p>
  </div>
)}
    
      
      
           
            <button

        onClick={requestRide}

        className="primary-btn"
      >

        Request Ride

      </button>

      <button
         onClick={() => setRideStatus(null)}
         className="primary-btn"
>

         Cancel Ride

      </button>

      <button
  onClick={() =>
    navigate(
      "/notifications"
        )
       }
       >
        Notifications
      </button>

      <button
  onClick={rateDriver}
  className="primary-btn"
>

  ⭐ Rate Driver

      </button>

      <div className="card status">

       <h2>Ride Status</h2>

       <p>

  {rideStatus === "cancelled"

    ? "❌ Ride Cancelled"

    : rideStatus}

</p>

       <h3>Estimated Fare:₹{fare}</h3>

     </div>

     <select
  value={paymentMethod}
  onChange={
    e =>
    setPaymentMethod(
      e.target.value
    )
  }
>

  <option value="cash">
    Cash
  </option>

  <option value="upi">
    UPI
  </option>

</select>

{rideStatus === "completed" && (
<button
  onClick={payRide}
>

  Pay Now

</button>

)}

        <p>

  {rideStatus === "cancelled"

    ? "❌ Ride Cancelled"

    : rideStatus}

</p>

      </div>

  );

}



const buttonStyle = {

  marginTop: "20px",

  padding: "14px",

  width: "100%",

  border: "none",

  borderRadius: "8px",

  background: "gold",

  color: "black",

  fontWeight: "bold",

  cursor: "pointer"

};