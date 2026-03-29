import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "../../pages/home";
import { PlacePage } from "../../pages/place";
import { QrPage } from "../../pages/qr";
import { AppShell } from "../layout/AppShell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "place/:placeId", element: <PlacePage /> },
      { path: "qr", element: <QrPage /> },
    ],
  },
]);
