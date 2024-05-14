/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru", "es"],
  },
  debug: process.env.NODE_ENV === "development",
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath:
    typeof window === "undefined"
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("path").resolve("./renderer/public/locales")
      : "/locales",
};
