"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardTopSection from "./DashboardTopSection";
import DashboardBottomSection from "./DashboardBottomSection";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const { stats, chartData, isLoading, error } = useDashboardData();

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorMessage}>
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <DashboardTopSection stats={stats} isLoading={isLoading} />
      <DashboardBottomSection chartData={chartData} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;
