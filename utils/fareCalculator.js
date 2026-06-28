function calculateFare(distanceKm) {

  const baseFare = 30;

  const perKm = 15;

  return Math.round(
    baseFare + (distanceKm * perKm)
  );

}

module.exports = {
  calculateFare
};