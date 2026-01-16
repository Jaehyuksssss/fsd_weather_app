import type { CoordsLatLon } from "../../place/model/types";

export type Favorite = Readonly<{
  placeId: string;
  label: string;
  coords: CoordsLatLon;
  createdAt: string;
}>;
