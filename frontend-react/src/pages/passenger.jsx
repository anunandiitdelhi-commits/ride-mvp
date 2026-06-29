import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, GeoJSON } from "react-leaflet";
import { io } from "socket.io-client";
import { API_URL } from "../services/api";
import { getRoute } from "../services/routeService";

const socket = io("https://zooming-light-production-e8d3.up.railway.app");

export default function Passenger() {
  const [pickup, setPickup] = useState(null);
  const [currentLocation, setCurrentLocation] = useState([11.8745, 75.3704]);
  const [drop, setDrop] = useState(null);
  const [rideStatus, setRideStatus] = useState("");
  const [fare, setFare] = useState(0);
  const [routeData, setRouteData] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [currentRideId, setCurrentRideId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation([lat, lng]);
        setPickup([lat, lng]);
      },
      () => setCurrentLocation([11.8745, 75.3704])
    );

    socket.on("driverLocationUpdated", (driver) => {
      if (driver.location) {
        setDriverLocation([driver.location.lat, driver.location.lng]);
      }
    });

    socket.on("rideUpdated", (ride) => {
      if (ride._id === currentRideId) {
        setRideStatus(ride.status);
      }
    });

    socket.on("driverArrived", () => {
      alert("🛺 Driver has arrived!");
    });
  }, [currentRideId]);

  function LocationSelector({ pickup }) {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        if (!pickup) {
          setPickup(coords);
        } else if (!drop) {
          setDrop(coords);
          getRoute(pickup[0], pickup[1], coords[0], coords[1])
            .then((data) => setRouteData(data))
            .catch((err) => console.log(err));
        }
      },
    });
    return null;
  }

  async function calculateRoute() {
    if (!pickup || !drop) {
      alert("Please select pickup and drop locations");
      return;
    }
    setLoading(true);
    try {
      const data = await getRoute(pickup[0], pickup[1], drop[0], drop[1]);
      setRouteData(data);
    } catch {
      alert("Could not calculate route. Try again.");
    }
    setLoading(false);
  }

  async function requestRide() {
    if (!pickup || !drop) {
      alert("Please select pickup and drop");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rides/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          passengerId: user.id,
          pickup: pickup?.join(","),
          drop: drop?.join(","),
          paymentMethod,
        }),
      });
      const data = await response.json();
      if (data && data.ride) {
        setCurrentRideId(data.ride._id);
        setRideStatus(data.ride.status);
        setFare(data.ride.fare);
        setActiveTab("status");
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  async function cancelRide() {
    try {
      await fetch(`${API_URL}/rides/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRideStatus("");
      setCurrentRideId(null);
      setActiveTab("home");
    } catch (error) {
      console.log(error);
    }
  }

  async function payRide() {
    const res = await fetch(`${API_URL}/payment/pay/${currentRideId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ paymentMethod }),
    });
    const data = await res.json();
    navigate("/receipt", {
      state: {
        rideId: currentRideId,
        date: new Date(),
        fare,
        paymentMethod,
        paymentStatus: data.ride?.paymentStatus || "paid",
      },
    });
  }

  const getStatusColor = () => {
    if (rideStatus === "searching") return "#FFD700";
    if (rideStatus === "accepted") return "#00b894";
    if (rideStatus === "arrived") return "#0984e3";
    if (rideStatus === "ongoing") return "#6c5ce7";
    if (rideStatus === "completed") return "#00b894";
    if (rideStatus === "cancelled") return "#d63031";
    return "#333";
  };

  const getStatusText = () => {
    if (rideStatus === "searching") return "🔍 Searching for driver...";
    if (rideStatus === "accepted") return "✅ Driver is on the way!";
    if (rideStatus === "arrived") return "🛺 Driver has arrived!";
    if (rideStatus === "ongoing") return "🚗 Ride in progress...";
    if (rideStatus === "completed") return "🎉 Ride completed!";
    if (rideStatus === "cancelled") return "❌ Ride cancelled";
    return "No active ride";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      fontFamily: "'Segoe UI', sans-serif",
      maxWidth: "480px",
      margin: "0 auto",
      position: "relative"
    }}>

      {/* TOP HEADER */}
      <div style={{
        background: "#111",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        <div>
          <h1 style={{ color: "#FFD700", fontSize: "20px", fontWeight: "800", margin: 0 }}>🛺 AutoGo</h1>
          <p style={{ color: "#888", fontSize: "11px", margin: 0 }}>Hey {user.name || "Passenger"} 👋</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/notifications")}
            style={{
              background: "rgba(255,215,0,0.15)",
              border: "1px solid #FFD700",
              borderRadius: "8px",
              padding: "6px 10px",
              color: "#FFD700",
              fontSize: "16px",
              cursor: "pointer"
            }}>🔔</button>
          <button
            onClick={() => navigate("/passenger-history")}
            style={{
              background: "rgba(255,215,0,0.15)",
              border: "1px solid #FFD700",
              borderRadius: "8px",
              padding: "6px 10px",
              color: "#FFD700",
              fontSize: "14px",
              cursor: "pointer"
            }}>History</button>
        </div>
      </div>

      {/* MAP */}
      <div style={{ height: "280px", position: "relative" }}>
        <MapContainer
          key="passenger-map"
          center={currentLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationSelector pickup={pickup} />
          <Marker position={currentLocation}>
            <Popup>📍 You are here</Popup>
          </Marker>
          {pickup && <Marker position={pickup}><Popup>🟢 Pickup</Popup></Marker>}
          {drop && <Marker position={drop}><Popup>🔴 Drop</Popup></Marker>}
          {driverLocation && <Marker position={driverLocation}><Popup>🛺 Driver</Popup></Marker>}
          {routeData && routeData.geojson && <GeoJSON data={routeData.geojson} />}
        </MapContainer>

        {/* Map hint */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "12px",
          zIndex: 999,
          pointerEvents: "none"
        }}>
          {!pickup ? "Tap map to set pickup" : !drop ? "Tap map to set drop" : "Route ready!"}
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div style={{
        background: "#fff",
        borderRadius: "24px 24px 0 0",
        marginTop: "-16px",
        position: "relative",
        zIndex: 10,
        padding: "24px 20px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)"
      }}>

        {/* ROUTE INFO */}
        {routeData && (
          <div style={{
            background: "#111",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            textAlign: "center"
          }}>
            <div>
              <p style={{ color: "#888", fontSize: "11px", margin: "0 0 4px" }}>DISTANCE</p>
              <p style={{ color: "#FFD700", fontSize: "18px", fontWeight: "700", margin: 0 }}>{routeData.distance} km</p>
            </div>
            <div style={{ borderLeft: "1px solid #333", borderRight: "1px solid #333" }}>
              <p style={{ color: "#888", fontSize: "11px", margin: "0 0 4px" }}>ETA</p>
              <p style={{ color: "#FFD700", fontSize: "18px", fontWeight: "700", margin: 0 }}>{routeData.duration} min</p>
            </div>
            <div>
              <p style={{ color: "#888", fontSize: "11px", margin: "0 0 4px" }}>FARE</p>
              <p style={{ color: "#FFD700", fontSize: "18px", fontWeight: "700", margin: 0 }}>₹{routeData.fare}</p>
            </div>
          </div>
        )}

        {/* RIDE STATUS */}
        {rideStatus && (
          <div style={{
            background: getStatusColor(),
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "16px",
            textAlign: "center"
          }}>
            <p style={{ color: "#fff", fontWeight: "700", fontSize: "15px", margin: 0 }}>{getStatusText()}</p>
            {fare > 0 && <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", margin: "4px 0 0" }}>Estimated fare: ₹{fare}</p>}
          </div>
        )}

        {/* PAYMENT METHOD */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ color: "#333", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Payment Method</p>
          <div style={{ display: "flex", gap: "10px" }}>
            {["cash", "upi"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: paymentMethod === method ? "2px solid #FFD700" : "2px solid #eee",
                  background: paymentMethod === method ? "#111" : "#f9f9f9",
                  color: paymentMethod === method ? "#FFD700" : "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                {method === "cash" ? "💵 Cash" : "📱 UPI"}
              </button>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          <button
            onClick={calculateRoute}
            disabled={!pickup || !drop || loading}
            style={{
              background: (!pickup || !drop) ? "#eee" : "#111",
              color: (!pickup || !drop) ? "#999" : "#FFD700",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: (!pickup || !drop) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Calculating..." : "📍 Calculate Route"}
          </button>

          {!rideStatus && (
            <button
              onClick={requestRide}
              disabled={!routeData || loading}
              style={{
                background: !routeData ? "#eee" : "linear-gradient(135deg, #FFD700, #ff8c00)",
                color: !routeData ? "#999" : "#000",
                border: "none",
                borderRadius: "14px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "800",
                cursor: !routeData ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Requesting..." : "🛺 Request Ride"}
            </button>
          )}

          {rideStatus && rideStatus !== "completed" && rideStatus !== "cancelled" && (
            <button
              onClick={cancelRide}
              style={{
                background: "#fff",
                color: "#d63031",
                border: "2px solid #d63031",
                borderRadius: "14px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              ❌ Cancel Ride
            </button>
          )}

          {rideStatus === "completed" && (
            <button
              onClick={payRide}
              style={{
                background: "linear-gradient(135deg, #FFD700, #ff8c00)",
                color: "#000",
                border: "none",
                borderRadius: "14px",
                padding: "16px",
                fontSize: "16px",
                fontWeight: "800",
                cursor: "pointer"
              }}
            >
              💳 Pay Now ₹{fare}
            </button>
          )}

        </div>

        {/* RESET BUTTON */}
        {(pickup || drop) && !rideStatus && (
          <button
            onClick={() => { setPickup(null); setDrop(null); setRouteData(null); }}
            style={{
              background: "transparent",
              border: "none",
              color: "#999",
              fontSize: "13px",
              cursor: "pointer",
              marginTop: "12px",
              width: "100%"
            }}
          >
            🔄 Reset locations
          </button>
        )}

      </div>
    </div>
  );
}
