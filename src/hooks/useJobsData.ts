"use client";

import { useState, useEffect, useCallback } from "react";
import type { JobItem, DashboardFilters } from "@/types/dashboard";

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface UseJobsDataResult {
  jobs: JobItem[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

export function useJobsData(initialFilters: DashboardFilters = {}): UseJobsDataResult {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [page, setPage] = useState(1);

  const buildQueryString = useCallback(
    (filters: DashboardFilters, page: number): string => {
      const params = new URLSearchParams();

      params.set("page", page.toString());
      params.set("limit", "500");

      if (filters.userId) params.set("userId", filters.userId);
      if (filters.fromCloudName) params.set("fromCloudName", filters.fromCloudName);
      if (filters.toCloudName) params.set("toCloudName", filters.toCloudName);
      if (filters.jobType) params.set("jobType", filters.jobType);
      if (filters.jobStatus) params.set("jobStatus", filters.jobStatus);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      return params.toString();
    },
    []
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString(filters, page);
      const response = await fetch(`/api/jobs?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, buildQueryString]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    jobs,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    refetch: fetchData,
  };
}
