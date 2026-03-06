"use client";

import { Search, ChevronRight, Calendar } from "lucide-react";
import type { JobItem } from "@/types/dashboard";
import styles from "./Jobs.module.css";

export interface JobsLeftPanelProps {
  jobs: JobItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  dateRangeLabel?: string;
  isLoading?: boolean;
  statusFilter?: string;
  statusLabel?: string;
}

const JobsLeftPanel = ({
  jobs,
  searchQuery,
  onSearchChange,
  selectedJobId,
  onSelectJob,
  dateRangeLabel,
  isLoading = false,
}: JobsLeftPanelProps) => {
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const displayDate = dateRangeLabel || today;

  return (
    <aside className={styles.jobsLeft}>
      <div className={styles.jobsLeftHeader}>
        <div className={styles.jobsTimePeriodRow}>
          <span className={styles.jobsTimePeriodLabel}>Time Period:</span>
          <button
            type="button"
            className={styles.jobsDatePicker}
            aria-label="Select time period"
          >
            <Calendar
              size={16}
              className={styles.jobsDatePickerIcon}
              aria-hidden
            />
            <span>{displayDate}</span>
          </button>
        </div>
      </div>
      <div className={styles.jobsSearchWrap}>
        <div className={styles.jobsSearchInner}>
          <Search size={18} className={styles.jobsSearchIcon} aria-hidden />
          <input
            type="search"
            className={styles.jobsSearchInput}
            placeholder="Search By Job Name"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search by job name"
          />
        </div>
      </div>
      <div className={styles.jobsList} role="list">
        {isLoading ? (
          <div className={styles.jobsLoading}>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className={styles.jobsEmpty}>No jobs found</div>
        ) : (
          jobs.map((job) => (
            <JobListItem
              key={job.id}
              job={job}
              isSelected={selectedJobId === job.id}
              onSelect={() => onSelectJob(job.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
};

const STATUS_COLORS: Record<string, string> = {
  Completed: "#22c55e",
  "In Progress": "#3b82f6",
  Started: "#3b82f6",
  Suspended: "#ef4444",
  "Partially Completed": "#f59e0b",
};

function JobListItem({
  job,
  isSelected,
  onSelect,
}: {
  job: JobItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusColor = STATUS_COLORS[job.status] || "#6b7eeb";

  return (
    <button
      type="button"
      className={`${styles.jobItem} ${isSelected ? styles.jobItemSelected : ""}`}
      onClick={onSelect}
      role="listitem"
    >
      <ChevronRight size={18} className={styles.jobItemArrow} aria-hidden />
      <div className={styles.jobItemContent}>
        <p className={styles.jobItemName}>{job.jobName}</p>
        <p className={styles.jobItemStatus} style={{ color: statusColor }}>
          {job.status}
        </p>
      </div>
    </button>
  );
}

export default JobsLeftPanel;
