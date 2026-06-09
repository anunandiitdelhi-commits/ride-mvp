export async function getRoute(startLat, startLng, endLat, endLng) {
  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        Authorization: import.meta.env.VITE_ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [startLng, startLat],
          [endLng, endLat],
        ],
      }),
    }
  );

  const data = await response.json();
  const distance = (data.features[0].properties.summary.distance / 1000).toFixed(1);
  const duration = Math.ceil(data.features[0].properties.summary.duration / 60);
  const fare = Math.ceil(distance * 15) + 30;

  return { distance, duration, fare, geojson: data };
}