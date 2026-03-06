"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import styles from "./ChartCard.module.css";

export interface BarChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface BarChartCardProps {
  title: string;
  subtitle: string;
  data: BarChartDataItem[];
  valueLabel?: string;
  valueUnit?: string;
}

const BarChartCard = ({
  title,
  subtitle,
  data,
  valueLabel = "Value",
  valueUnit = "",
}: BarChartCardProps) => {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardHeader}>
        <h3 className={styles.chartCardTitle}>{title}</h3>
        <p className={styles.chartCardSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.chartCardBody}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--chartCard-axis)", fontSize: 11 }}
              axisLine={{ stroke: "var(--chartCard-axis)" }}
              tickLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: "var(--chartCard-axis)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                valueUnit ? `${v} ${valueUnit}` : String(v)
              }
              label={
                valueLabel
                  ? {
                      value: valueLabel,
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fill: "var(--chartCard-subtitle)",
                        fontSize: 12,
                      },
                    }
                  : undefined
              }
            />
            <Tooltip
              formatter={(value: number | undefined) =>
                valueUnit
                  ? [`${value ?? 0} ${valueUnit}`, ""]
                  : [value ?? 0, ""]
              }
              contentStyle={{
                backgroundColor: "var(--chartCard-bg)",
                border: "1px solid var(--chartCard-border, #e5e7eb)",
                borderRadius: "8px",
              }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartCard;
