const googleMaps = require('@google/maps');

const mapsClient = googleMaps.createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

class GeoService {
  async geocodeAddress(address, city) {
    try {
      const fullAddress = `${address}, ${city}, Brazil`;
      
      const response = await mapsClient.geocode({
        address: fullAddress
      }).asPromise();

      if (response.json.results.length === 0) {
        throw new Error('Endereço não encontrado');
      }

      const result = response.json.results[0];
      const location = result.geometry.location;

      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } catch (error) {
      console.error('Erro ao fazer geocoding:', error);
      throw error;
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const response = await mapsClient.reverseGeocode({
        latlng: [latitude, longitude]
      }).asPromise();

      if (response.json.results.length === 0) {
        throw new Error('Localização não encontrada');
      }

      const result = response.json.results[0];
      return {
        address: result.formatted_address,
        components: result.address_components,
        placeId: result.place_id
      };
    } catch (error) {
      console.error('Erro ao fazer reverse geocoding:', error);
      throw error;
    }
  }

  async calculateDistance(lat1, lng1, lat2, lng2) {
    try {
      const response = await mapsClient.distanceMatrix({
        origins: [[lat1, lng1]],
        destinations: [[lat2, lng2]],
        mode: 'driving'
      }).asPromise();

      if (response.json.rows.length === 0) {
        throw new Error('Não foi possível calcular a distância');
      }

      const element = response.json.rows[0].elements[0];
      return {
        distanceKm: element.distance.value / 1000,
        durationMinutes: Math.round(element.duration.value / 60),
        status: element.status
      };
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
      throw error;
    }
  }

  async isWithinServiceArea(latitude, longitude, centerLat = -30.0330, centerLng = -51.2304, radiusKm = 15) {
    try {
      const distance = await this.calculateDistance(centerLat, centerLng, latitude, longitude);
      return distance.distanceKm <= radiusKm;
    } catch (error) {
      console.error('Erro ao verificar área de serviço:', error);
      throw error;
    }
  }
}

module.exports = new GeoService();
