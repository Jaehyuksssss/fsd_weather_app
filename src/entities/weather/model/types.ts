export type WeatherModel = {
  currentTempC: number;
  minTempC: number;
  maxTempC: number;
  hourly: readonly {
    timeISO: string;
    tempC: number;
  }[];
};
