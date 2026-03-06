import React from "react";
import { Settings, Users, Clock, AlertTriangle } from "lucide-react";
import StatCard from "@/components/Reusables/StatCard";
import type { DashboardStats } from "@/types/dashboard";
import styles from "./Dashboard.module.css";

const CARD_ICON_SIZE = 20;

interface Card {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  iconBgColor: string;
  showArrow?: boolean;
  href?: string | null;
}

interface DashboardTopSectionProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const DashboardTopSection = ({ stats, isLoading }: DashboardTopSectionProps) => {
  const cards: Card[] = [
    {
      title: "Total Jobs",
      value: stats?.totalJobs ?? 0,
      subtitle: "Initiated Jobs",
      icon: <Settings size={CARD_ICON_SIZE} />,
      iconBgColor: "#6b7eeb",
      showArrow: true,
      href: "/Jobs?status=ALL",
    },
    {
      title: "Completed Jobs",
      value: stats?.completedJobs ?? 0,
      subtitle: "Completed Jobs",
      icon: <Users size={CARD_ICON_SIZE} />,
      iconBgColor: "#22c55e",
      showArrow: true,
      href: "/Jobs?status=COMPLETED",
    },
    {
      title: "In Progress Jobs",
      value: stats?.inProgressJobs ?? 0,
      subtitle: "Jobs Currently Running",
      icon: <Clock size={CARD_ICON_SIZE} />,
      iconBgColor: "#f59e0b",
      showArrow: true,
      href: "/Jobs?status=IN_PROGRESS",
    },
    {
      title: "Partially Completed Jobs",
      value: stats?.partiallyCompletedJobs ?? 0,
      subtitle: "Partially Completed",
      icon: <AlertTriangle size={CARD_ICON_SIZE} />,
      iconBgColor: "#ef4444",
      showArrow: true,
      href: "/Jobs?status=PARTIALLY_COMPLETED",
    },
  ];

  return (
    <section className={styles.topSection}>
      <div className={styles.cardGrid}>
        {cards.map((card: Card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={isLoading ? "..." : card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            iconBgColor={card.iconBgColor}
            showArrow={card.showArrow}
            href={card.href}
          />
        ))}
      </div>
    </section>
  );
};

export default DashboardTopSection;
