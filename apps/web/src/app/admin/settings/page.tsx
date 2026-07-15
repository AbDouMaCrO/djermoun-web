import { getSiteSettings, toggleCustomsCalculator, toggleCountry } from "@/app/actions/settings";
import { COUNTRY_CONFIG } from "@/country/country-context";

export const dynamic = "force-dynamic";

const COUNTRY_COLUMNS = [
  { key: "algeria",       column: "country_algeria_enabled"       },
  { key: "international", column: "country_international_enabled" },
  { key: "uae",          column: "country_uae_enabled"           },
] as const;

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <main className="px-8 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Site Settings</h1>

      <div className="mt-8 max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
          Car Listing Features
        </h2>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Customs &amp; Duties Calculator</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Show the customs estimator on car listing pages. When enabled, visitors can expand it
              by clicking a button.
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await toggleCustomsCalculator(settings.show_customs_calculator);
            }}
          >
            <button
              type="submit"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                settings.show_customs_calculator ? "bg-amber-500" : "bg-slate-300"
              }`}
              aria-label="Toggle customs calculator"
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  settings.show_customs_calculator ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </form>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Status:{" "}
          <span
            className={`font-medium ${settings.show_customs_calculator ? "text-emerald-500" : "text-slate-500"}`}
          >
            {settings.show_customs_calculator ? "Enabled" : "Disabled"}
          </span>
        </p>
      </div>

      <div className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-500">
          Active Country Sites
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enable a country to show it in the currency switcher and welcome modal.
        </p>

        <div className="mt-4 divide-y divide-slate-100">
          {COUNTRY_COLUMNS.map(({ key, column }) => {
            const cfg = COUNTRY_CONFIG[key];
            const enabled = settings[column];
            return (
              <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{cfg.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{cfg.label}</p>
                    <p className="text-xs text-slate-500">Prices in {cfg.currency}</p>
                  </div>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await toggleCountry(column, enabled);
                  }}
                >
                  <button
                    type="submit"
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      enabled ? "bg-amber-500" : "bg-slate-300"
                    }`}
                    aria-label={`Toggle ${cfg.label}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
