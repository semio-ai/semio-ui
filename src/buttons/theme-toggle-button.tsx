import { IconSun, IconMoon } from "@tabler/icons-react";
import { Switch } from "../inputs/switch";
import { useTheme } from "../hooks/use-theme";
import { Theme, Variant } from "../types";

export function ThemeToggleButton() {
  const { resolvedTheme, systemPreference, setExplicitTheme } = useTheme();
  const toggle = (v: boolean) => {
    if (systemPreference === Theme.Dark && v) {
      setExplicitTheme(Theme.System);
    } else if (systemPreference === Theme.Dark && !v) {
      setExplicitTheme(Theme.Light);
    } else if (systemPreference === Theme.Light && !v) {
      setExplicitTheme(Theme.System);
    } else if (systemPreference === Theme.Light && v) {
      setExplicitTheme(Theme.Dark);
    }
  };

  return (
    <label className="bg-default-200 dark:bg-default-800 flex justify-around p-2">
      <span className="dark:text-default-200 text-default-800">
        {resolvedTheme === Theme.Dark ? "Dark" : "Light"}
        {" Mode"}
      </span>
      <Switch
        value={resolvedTheme === Theme.Dark}
        onChange={toggle}
        onIcon={<IconMoon size={14} />}
        offIcon={<IconSun size={14} />}
        variant={Variant.Info}
        offVariant={Variant.Secondary}
      />
    </label>
  );
}
