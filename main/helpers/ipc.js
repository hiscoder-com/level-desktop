import { ipcMain } from "electron";
import { localeStore } from "./user-store";

ipcMain.handle("setLocale", (_event, locale) => {
  localeStore.set("locale", locale);
});
