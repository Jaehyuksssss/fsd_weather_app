import { createBrowserRouter } from "react-router-dom";

import { HomePage } from "../../pages/home";
import { AppShell } from "../ui/AppShell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
