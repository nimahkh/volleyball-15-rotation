import "./App.css";
import { AppContent } from "./components/AppContent";
import { Rotation } from "./providers/Rotation";

export default function VolleyballRotationHelper() {
  return (
    <Rotation.provider>
      <AppContent />
    </Rotation.provider>
  );
}
