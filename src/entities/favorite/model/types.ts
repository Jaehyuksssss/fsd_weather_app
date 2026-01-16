import type { CoordsLatLon } from "../../place/model/types";

export type Favorite = Readonly<{
  placeId: string;
  label: string;
  alias?: string;
  coords: CoordsLatLon;
  createdAt: string;
}>;
