import { RouterProvider } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import { AppProviders } from "@/providers";
import { router } from "@/router";

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Analytics />
    </AppProviders>
  );
}

export default App;