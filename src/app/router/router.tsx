import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "../../pages/home";
import { PlacePage } from "../../pages/place";
import { QrCreatePage, QrViewPage } from "../../pages/qr";
import { AppShell } from "../layout/AppShell";
import { Navigate } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "place/:placeId", element: <PlacePage /> },
    ],
  },
  { path: "/qr", element: <Navigate to="/qr/create" replace /> },
  { path: "/qr/create", element: <QrCreatePage /> },
  { path: "/qr/view", element: <QrViewPage /> },
]);
