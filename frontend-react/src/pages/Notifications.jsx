import {
  useEffect,
  useState
} from "react";

import {
  API_URL
} from "../services/api";

export default function Notifications() {

  const [
    notifications,

    setNotifications

  ] = useState([]);

  useEffect(() => {

    loadNotifications();

  }, []);

  async function loadNotifications() {

    const userId =
      localStorage.getItem(
        "userId"
      );

    const response =
      await fetch(

        `${API_URL}/notifications/${userId}`,

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

    setNotifications(data);

  }

  return (

    <div className="page">

      <h1>
        Notifications
      </h1>

      {

        notifications.map(

          notification => (

            <div
              key={
                notification._id
              }
              className="card"
            >

              <h3>
                {
                  notification.title
                }
              </h3>

              <p>
                {
                  notification.message
                }
              </p>

            </div>

          )

        )

      }

    </div>

  );

}