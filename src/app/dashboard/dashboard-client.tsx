"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/app/gutscheinList/utils";

interface HistoryEntry {
  id: string;
  couponId: string;
  date: string;
  employee: string;
  description: string;
  type: "redeemed" | "created";
  value: number;
  couponType: string;
}

interface GesamtEntry extends HistoryEntry {
  location: string;
}

interface LocationData {
  location: string;
  entries: HistoryEntry[];
  totalRedeemed: number;
  totalRedeemedCount: number;
  totalCreated: number;
  totalCreatedCount: number;
}

interface DashboardClientProps {
  locations: LocationData[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const GESAMT = "Gesamt";

export function DashboardClient({ locations }: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(GESAMT);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateVon, setDateVon] = useState("");
  const [dateBis, setDateBis] = useState("");
  const [search, setSearch] = useState("");

  const isGesamt = activeTab === GESAMT;
  const activeLocation = locations.find((l) => l.location === activeTab);

  // Build entries based on active tab
  const allEntries = useMemo((): GesamtEntry[] => {
    if (isGesamt) {
      return locations.flatMap((loc) =>
        loc.entries.map((e) => ({ ...e, location: loc.location }))
      );
    }
    if (!activeLocation) return [];
    return activeLocation.entries.map((e) => ({
      ...e,
      location: activeLocation.location,
    }));
  }, [isGesamt, activeLocation, locations]);

  // Apply date range + search filter
  const filteredEntries = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allEntries
      .filter((e) => {
        if (dateVon && e.date < dateVon) return false;
        if (dateBis && e.date > dateBis) return false;
        if (q && !e.couponId.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [allEntries, dateVon, dateBis, search]);

  const filteredTotals = useMemo(() => {
    const redeemed = filteredEntries
      .filter((e) => e.type === "redeemed")
      .reduce((sum, e) => sum + e.value, 0);
    const created = filteredEntries
      .filter((e) => e.type === "created")
      .reduce((sum, e) => sum + e.value, 0);
    return {
      redeemed: Math.round(redeemed * 100) / 100,
      redeemedCount: filteredEntries.filter((e) => e.type === "redeemed")
        .length,
      created: Math.round(created * 100) / 100,
      createdCount: filteredEntries.filter((e) => e.type === "created").length,
    };
  }, [filteredEntries]);

  const hasDateFilter = dateVon || dateBis;

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const colCount = isGesamt ? 6 : 5;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab(GESAMT)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            isGesamt
              ? "bg-gray-800 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}>
          Gesamt
        </button>
        {locations.map((loc) => (
          <button
            key={loc.location}
            onClick={() => setActiveTab(loc.location)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === loc.location
                ? "bg-[#FDC30A] text-black shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}>
            {loc.location}
          </button>
        ))}

        {/* Search + Date range filter + Refresh */}
        <div className="ml-auto flex gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Gutschein Nr."
            className="px-3 py-2 rounded-lg text-sm border border-gray-300 bg-white w-32"
          />
          <span className="text-xs text-gray-500">Von</span>
          <input
            type="date"
            value={dateVon}
            onChange={(e) => setDateVon(e.target.value)}
            className="px-2 py-2 rounded-lg text-sm border border-gray-300 bg-white"
          />
          <span className="text-xs text-gray-500">Bis</span>
          <input
            type="date"
            value={dateBis}
            onChange={(e) => setDateBis(e.target.value)}
            className="px-2 py-2 rounded-lg text-sm border border-gray-300 bg-white"
          />
          {hasDateFilter && (
            <button
              onClick={() => {
                setDateVon("");
                setDateBis("");
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">
              ✕
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors disabled:opacity-50">
            {isRefreshing ? "⟳ ..." : "⟳ Aktualisieren"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Eingelöst</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(filteredTotals.redeemed)}
          </p>
          <p className="text-xs text-gray-400">
            {filteredTotals.redeemedCount} Gutscheine
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Einnahme</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(filteredTotals.created)}
          </p>
          <p className="text-xs text-gray-400">
            {filteredTotals.createdCount} Gutscheine
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total Einträge</p>
          <p className="text-2xl font-bold text-gray-800">
            {filteredEntries.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            Datum
          </p>
          <p className="text-lg font-bold text-blue-600">
            {dateVon && dateBis
              ? `${formatDate(dateVon)} – ${formatDate(dateBis)}`
              : dateVon
                ? `Ab ${formatDate(dateVon)}`
                : dateBis
                  ? `Bis ${formatDate(dateBis)}`
                  : "—"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Datum
              </th>
              {isGesamt && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Laden
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Gutschein
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Mitarbeiter
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Typ
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Betrag
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-8 text-center text-sm text-gray-400">
                  Keine Einträge
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(entry.date)}
                  </td>
                  {isGesamt && (
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(entry as GesamtEntry).location}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                    {entry.couponId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {entry.employee}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        entry.type === "redeemed"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      )}>
                      {entry.type === "redeemed" ? "Eingelöst" : "Neu"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-sm text-right font-medium",
                      entry.type === "redeemed"
                        ? "text-red-700"
                        : "text-green-700"
                    )}>
                    {formatCurrency(entry.value)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredEntries.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td
                  colSpan={isGesamt ? 4 : 3}
                  className="px-4 py-3 text-sm text-gray-900">
                  Total
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    {filteredTotals.redeemedCount}
                  </span>
                  {" / "}
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {filteredTotals.createdCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className="text-red-700">
                    {formatCurrency(filteredTotals.redeemed)}
                  </span>
                  {" / "}
                  <span className="text-green-700">
                    {formatCurrency(filteredTotals.created)}
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
