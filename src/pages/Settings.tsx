import SettingsForm from "../components/settings/SettingsForm";
import { sampleSavedSettings } from "../lib/validation/settingsSchema";

export default function Settings() {
  return (
    <SettingsForm
      initialValues={sampleSavedSettings}
      onSave={(values) => {
        console.log("Saved settings:", values);
      }}
    />
  );
}
