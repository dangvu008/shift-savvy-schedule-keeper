import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import HomePage from "@/pages/HomePage";
import SettingsPage from "@/pages/SettingsPage";
import StatisticsPage from "@/pages/StatisticsPage";
import ShiftFormPage from "@/pages/ShiftFormPage";
import NoteFormPage from "@/pages/NoteFormPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/shifts/add" element={<ShiftFormPage />} />
            <Route path="/shifts/edit/:id" element={<ShiftFormPage />} />
            <Route path="/notes/add" element={<NoteFormPage />} />
            <Route path="/notes/edit/:id" element={<NoteFormPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
