function calculateFare(distanceKm) {

  const baseFare = 40;

  const perKm = 12;

  return Math.round(
    baseFare + (distanceKm * perKm)
  );

}

module.exports = {
  calculateFare
};