import { useLocation } from "react-router-dom";

export default function Receipt() {
  const { state } = useLocation();

  if (!state) {
    return <p>No receipt data found.</p>;
  }

  const { rideId, date, fare, paymentMethod, paymentStatus } = state;

  return (
    <div className="card">
      <h2>🧾 Ride Receipt</h2>
      <p><strong>Ride ID:</strong> {rideId}</p>
      <p><strong>Date:</strong> {new Date(date).toLocaleString()}</p>
      <p><strong>Fare:</strong> ₹{fare}</p>
      <p><strong>Payment Method:</strong> {paymentMethod}</p>
      <p><strong>Payment Status:</strong> {paymentStatus}</p>
    </div>
  );
}