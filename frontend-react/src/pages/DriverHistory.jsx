import {
  useEffect,
  useState
} from "react";

import {
  API_URL
} from "../services/api";

export default function DriverHistory() {

  const [rides,
    setRides] =
    useState([]);

  useEffect(() => {

    loadHistory();

  }, []);

  async function loadHistory() {

    try {

      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id || user?.id;

      const token = localStorage.getItem("token")
      const response =
        await fetch(

          `${API_URL}/rides/history/${userId}`,
         {
          headers: {
            Authorization: `Bearer {$token}`
          }
         }
        );

      const data =
        await response.json();

      setRides(data);

    } catch (error) {

      console.log(error);

    }

  }

  return (

    <div className="page">

      <h1>
        Ride History
      </h1>

      {

        rides.map(ride => (

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
              Fare:
              ₹{ride.fare}
            </p>

            <p>
                Earnings:
                ₹{ride.fare}
            </p>

            <span className={'status-${ride.status}'}>
                {ride.status}
            </span>

            <p>
              Date:
              {
                new Date(
                  ride.createdAt
                ).toLocaleString()
              }
            </p>

          </div>

        ))

      }

    </div>

  );

}