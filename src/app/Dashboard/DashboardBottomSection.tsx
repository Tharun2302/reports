"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import DoughnutChartCard from "@/components/Reusables/Charts/DoughnutChartCard";
import BarChartCard from "@/components/Reusables/Charts/BarChartCard";
import type { DoughnutChartDataItem } from "@/components/Reusables/Charts/DoughnutChartCard";
import type { BarChartDataItem } from "@/components/Reusables/Charts/BarChartCard";
import type { ChartData } from "@/types/dashboard";
import styles from "./Dashboard.module.css";

const DISPLAY_TO_STATUS: Record<string, string> = {
  Processed: "PROCESSED",
  "In Progress": "IN_PROGRESS",
  "Not Processed": "NOT_PROCESSED",
  Conflict: "CONFLICT",
  Suspended: "SUSPENDED",
  "Processed With Some Conflicts": "PROCESSED_WITH_SOME_CONFLICTS",
  Cancelled: "CANCEL",
};

interface DashboardBottomSectionProps {
  chartData: ChartData | null;
  isLoading: boolean;
}

const DashboardBottomSection = ({ chartData, isLoading }: DashboardBottomSectionProps) => {
  const router = useRouter();
  const workspacesByStatusData: DoughnutChartDataItem[] = chartData?.workspacesByStatus || [];
  const migratedDataSizeData: BarChartDataItem[] = chartData?.migratedDataSize || [];

  const handlePieClick = useCallback(
    (point: { name: string }) => {
      const rawStatus = DISPLAY_TO_STATUS[point.name] || point.name;
      const params = new URLSearchParams({
        processStatus: rawStatus,
        type: "workspaces",
      });
      router.push(`/FileDetails?${params.toString()}`);
    },
    [router]
  );

  if (isLoading) {
    return (
      <section className={styles.bottomSection}>
        <div className={styles.chartRow}>
          <div className={styles.loadingPlaceholder}>Loading charts...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.bottomSection}>
      <div className={styles.chartRow}>
        <DoughnutChartCard
          title="Workspaces Based On Status"
          subtitle="Number of Workspaces By Status"
          data={workspacesByStatusData}
          showLegend={false}
          onPointClick={handlePieClick}
        />
        <BarChartCard
          title="Migrated Data Size Summary"
          subtitle="Data volume by migration status"
          data={migratedDataSizeData}
          valueLabel=""
          valueUnit="GB"
        />
      </div>
    </section>
  );
};

export default DashboardBottomSection;
