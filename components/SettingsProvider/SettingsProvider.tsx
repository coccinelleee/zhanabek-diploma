import {
	createContext,
	ReactNode,
	useCallback,
	useEffect,
	useState,
	useContext,
  } from "react";
  import { useWindowEvent } from "@mantine/hooks";
  
  // Тип настроек
  export type Settings = {
	initialized: boolean;
	paletteMode: "light" | "dark";
  };
  
  // Контекст с типом Settings | null
  export const SettingsContext = createContext<Settings | null>(null);
  
  const settingsKey = "APP.SETTINGS";
  
  // Значения по умолчанию
  const defaultValues: Settings = {
	paletteMode: "light",
	initialized: false,
  };
  
  // Пропсы
  type Props = {
	children: ReactNode;
  };
  
  // Провайдер
  export default function SettingsProvider({ children }: Props) {
	const [settings, setSettings] = useState<Settings>(defaultValues);
  
	const updateSettings = useCallback((values: Partial<Settings>) => {
	  setSettings((prevState) => {
		const newState = { ...prevState, ...values };
		localStorage.setItem(settingsKey, JSON.stringify(newState));
		if (values.paletteMode) {
		  document.documentElement.setAttribute(
			"data-mantine-color-scheme",
			values.paletteMode
		  );
		}
		return newState;
	  });
	}, []);
  
	useEffect(() => {
	  const storedSettings = localStorage.getItem(settingsKey);
	  if (storedSettings) {
		updateSettings({ ...JSON.parse(storedSettings), initialized: true });
	  } else {
		updateSettings({ initialized: true });
	  }
	}, [updateSettings]);
  
	useWindowEvent("keydown", (e) => {
	  if (e.ctrlKey && e.key === "j") {
		updateSettings({
		  paletteMode: settings.paletteMode === "dark" ? "light" : "dark",
		});
	  }
	});
  
	return (
	  <SettingsContext.Provider value={settings}>
		{children}
	  </SettingsContext.Provider>
	);
  }
  
  // Consumer для компонентов
  export const SettingsConsumer = SettingsContext.Consumer;
  
  // Хук, если хочешь использовать useSettings()
  export const useSettings = () => useContext(SettingsContext);
  