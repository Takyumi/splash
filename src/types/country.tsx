export default interface Country {
  name: {
    common: string;
    official: string;
  };
  capital: string[] | undefined;
  capitalInfo: {
    latlng: number[];
  };
  region: string | undefined;
  subregion: string | undefined;
  languages: {
    [key: string]: string | undefined;
  } | undefined;
  latlng: number[];
  landlocked: boolean;
  area: number;
  flag: string | undefined;
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  } | undefined;
  population: number;
  timezones: string[] | undefined;
  continents: string[] | undefined;
  startOfWeek: string | undefined;
}
