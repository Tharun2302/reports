"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  DashboardStats,
  ChartData,
  FilterOptions,
  DashboardFilters,
} from "@/types/dashboard";

interface UseDashboardDataResult {
  stats: DashboardStats | null;
  chartData: ChartData | null;
  filterOptions: FilterOptions | null;
  isLoading: boolean;
  error: string | null;
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  refetch: () => void;
}

export function useDashboardData(
  initialFilters: DashboardFilters = {}
): UseDashboardDataResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);

  const buildQueryString = useCallback((filters: DashboardFilters): string => {
    const params = new URLSearchParams();
    
    if (filters.userId) params.set("userId", filters.userId);
    if (filters.fromCloudName) params.set("fromCloudName", filters.fromCloudName);
    if (filters.toCloudName) params.set("toCloudName", filters.toCloudName);
    if (filters.jobType) params.set("jobType", filters.jobType);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    
    return params.toString();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString(filters);
      const queryPart = queryString ? `?${queryString}` : "";

      const [statsRes, chartsRes, filtersRes] = await Promise.all([
        fetch(`/api/dashboard/stats${queryPart}`),
        fetch(`/api/dashboard/charts${queryPart}`),
        fetch(`/api/dashboard/filters`),
      ]);

      if (!statsRes.ok || !chartsRes.ok || !filtersRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const [statsData, chartsData, filtersData] = await Promise.all([
        statsRes.json(),
        chartsRes.json(),
        filtersRes.json(),
      ]);

      setStats(statsData);
      setChartData(chartsData);
      setFilterOptions(filtersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [filters, buildQueryString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    chartData,
    filterOptions,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
  };
}
