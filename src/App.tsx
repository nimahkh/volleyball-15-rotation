import "./App.css";
import { AppContent } from "./components/AppContent";
import { Rotation } from "./providers/Rotation";
import { ThemeProvider } from "./providers/ThemeProvider";

export default function VolleyballRotationHelper() {
  return (
    <ThemeProvider>
      <Rotation.provider>
        <AppContent />
      </Rotation.provider>
    </ThemeProvider>
  );
}
