import { useEffect, useState }
from "react";

import { API_URL }
from "../services/api";



export default function Admin() {

  const [analytics,
    setAnalytics] =
    useState({});



  useEffect(() => {

    loadAnalytics();

  }, []);



  async function loadAnalytics() {

    try {

      const response =
        await fetch(

  `${API_URL}/admin/analytics`,

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

      setAnalytics(data);

    } catch (error) {

      console.log(error);

    }

  }



  return (

    <div className="page">

      <h1 className="page-title">

        📊 Admin Dashboard

      </h1>

      <div className="card">

        <h2>
          Total Users:
          {analytics.totalUsers}
        </h2>

        <h2>
          Drivers:
          {analytics.totalDrivers}
        </h2>

        <h2>
          Passengers:
          {analytics.totalPassengers}
        </h2>

        <h2>
          Total Rides:
          {analytics.totalRides}
        </h2>

        <h2>
          Completed:
          {analytics.completedRides}
        </h2>

        <h2>
          Avg Driver Rating:
          {analytics.avgDriverRating
           ? analytics.avgDriverRating.toFixed(1)
           : "N/A"} stars
        </h2>

        <h2>
          Avg Passenger Rating:
         {analytics.avgPassengerRating
           ? analytics.avgPassengerRating.toFixed(1)
           : "N/A"} stars
        </h2>

         

      </div>

    </div>

  );

}