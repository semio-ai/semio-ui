import { Switch } from "../inputs/switch";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "../hooks/use-theme";
import { Theme, Variant } from "../types";

export const ThemeToggleButton = () => {
  const { resolvedTheme, systemPreference, setExplicitTheme } = useTheme();
  const toggle = (v: boolean) => {
    if (systemPreference === Theme.DARK && v) {
      setExplicitTheme(Theme.SYSTEM);
    } else if (systemPreference === Theme.DARK && !v) {
      setExplicitTheme(Theme.LIGHT);
    } else if (systemPreference === Theme.LIGHT && !v) {
      setExplicitTheme(Theme.SYSTEM);
    } else if (systemPreference === Theme.LIGHT && v) {
      setExplicitTheme(Theme.DARK);
    }
  };

  return (
    <label className="bg-default-200 dark:bg-default-800 flex justify-around p-2">
      <span className="dark:text-default-200 text-default-800">
        {resolvedTheme === Theme.DARK ? "Dark" : "Light"}
        {" Mode"}
      </span>
      <Switch
        value={resolvedTheme === Theme.DARK}
        onChange={toggle}
        onIcon={<IconMoon size={14} />}
        offIcon={<IconSun size={14} />}
        variant={Variant.INFO}
        offVariant={Variant.SECONDARY}
      />
    </label>
  );
};
