// Lebanese cities used by the owner property forms.
// Coordinates are [latitude, longitude] — Leaflet's order. The backend stores
// GeoJSON [longitude, latitude], so always flip when sending or reading.

export const CITY_COORDS = {
  Beirut:    [33.8938, 35.5018], Jounieh:   [33.9806, 35.6178],
  Jbeil:     [34.1236, 35.6519], Tripoli:   [34.4367, 35.8497],
  Sidon:     [33.5606, 35.3714], Tyre:      [33.2705, 35.2038],
  Zahle:     [33.8469, 35.9017], Batroun:   [34.2553, 35.6586],
  Baalbek:   [34.0042, 36.2144], Hermel:    [34.3894, 36.3875],
  Nabatieh:  [33.3772, 35.4836], Aley:      [33.81,   35.5994],
  Baabda:    [33.8342, 35.5486], Chouf:     [33.6947, 35.5606],
  Keserwan:  [34.0167, 35.65],   Metn:      [33.9333, 35.6],
  Akkar:     [34.55,   36.0],    Bcharre:   [34.2511, 36.0131],
  Marjayoun: [33.3622, 35.5853], Jezzine:   [33.5456, 35.5783],
  Rachaya:   [33.4986, 35.843],  Hasbaya:   [33.3986, 35.6853],
  Zgharta:   [34.3975, 35.8936],
}

export const CITIES = Object.keys(CITY_COORDS)

export const LEBANON_CENTER = [33.87, 35.83]
