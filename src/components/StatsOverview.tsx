"use client";

import React from "react";
import { useTranslation } from "react-i18next";

export type Stats = {
  total: number;
  active: number;
  expired: number;
  favorites: number;
  archived: number;
  totalUsages: number;
  expiringSoon: number;
};

export type StatsOverviewProps = {
  stats: Stats;
  onStatClick?: (type: "expired" | "favorites" | "expiringSoon") => void;
};

const baseCardClasses =
  "p-4 rounded-lg shadow transition-transform duration-200 focus:outline-none";
const clickableClasses =
  "cursor-pointer hover:shadow-xl hover:scale-105 focus:ring-2 focus:ring-blue-500";
const nonClickableClasses = "cursor-default opacity-75";

function StatCard(props: {
  label: string;
  count: number;
  isClickable: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { label, count, isClickable, onClick, disabled } = props;
  const classes = [
    baseCardClasses,
    isClickable ? clickableClasses : nonClickableClasses,
    disabled ? "opacity-50" : "",
    "flex flex-col items-start gap-1 text-left",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={Boolean(disabled)}
      onClick={isClickable && !disabled ? onClick : undefined}
      aria-label={label}
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{count}</div>
    </button>
  );
}

export function StatsOverview({ stats, onStatClick }: StatsOverviewProps) {
  const { t } = useTranslation();

  const activeLabel = t("stats.activeCodes", "Actieve codes");
  const expiredLabel = t("stats.expiredCodes", "Verlopen codes");
  const favoritesLabel = t("stats.favoriteCodes", "Favorieten codes");
  const soonLabel = t("stats.expiringSoon", "Verloopt binnenkort");

  const handle = (type: "expired" | "favorites" | "expiringSoon") => () => {
    onStatClick?.(type);
  };

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
      {/* Active: intentionally non-clickable */}
      <StatCard
        label={activeLabel}
        count={stats.active}
        isClickable={false}
        disabled={stats.active === 0}
      />

      {/* Expired */}
      <StatCard
        label={expiredLabel}
        count={stats.expired}
        isClickable={stats.expired > 0}
        disabled={stats.expired === 0}
        onClick={handle("expired")}
      />

      {/* Favorites */}
      <StatCard
        label={favoritesLabel}
        count={stats.favorites}
        isClickable={stats.favorites > 0}
        disabled={stats.favorites === 0}
        onClick={handle("favorites")}
      />

      {/* Expiring soon (clickable when there are items) */}
      <StatCard
        label={soonLabel}
        count={stats.expiringSoon}
        isClickable={stats.expiringSoon > 0}
        disabled={stats.expiringSoon === 0}
        onClick={handle("expiringSoon")}
      />
    </div>
  );
}
