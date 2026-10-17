export type City = string;

export type CityListItem = {
  number: number;
  city: City;
};

export type CitiesState = {
  cities: City[];
  defaultCity: City | null;
};

export type GeocodingResponse = {
  results?: Array<{
    latitude: number;
    longitude: number;
  }>;
};
