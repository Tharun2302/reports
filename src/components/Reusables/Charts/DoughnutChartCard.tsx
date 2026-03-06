"use client";

import React, { useEffect, useRef, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styles from "./ChartCard.module.css";

export interface DoughnutChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface DoughnutChartCardProps {
  title: string;
  subtitle: string;
  data: DoughnutChartDataItem[];
  customHeight?: number | null;
  customWidth?: number | null;
  showDataLabels?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  onPointClick?: (point: { name: string; value: number }) => void;
}

const DEFAULT_HEIGHT = 350;
const DEFAULT_WIDTH = 470;

const DoughnutChartCard = ({
  title,
  subtitle,
  data,
  customHeight = DEFAULT_HEIGHT,
  customWidth = null,
  showDataLabels = true,
  showLegend = true,
  valueFormatter,
  onPointClick,
}: DoughnutChartCardProps) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef?.current?.chart) {
        chartRef.current.chart.reflow();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const graphData = useMemo(
    () =>
      data.map((item) => ({
        name: item.name,
        y: item.value,
        color: item.color,
      })),
    [data],
  );

  const chartOptions: Highcharts.Options = useMemo(
    () => ({
      chart: {
        type: "pie",
        height:
          customHeight === null ? undefined : (customHeight ?? DEFAULT_HEIGHT),
        width:
          customWidth === null ? undefined : (customWidth ?? DEFAULT_WIDTH),
        backgroundColor: "transparent",
      },
      title: {
        text: undefined,
      },
      plotOptions: {
        pie: {
          allowPointSelect: Boolean(onPointClick),
          cursor: onPointClick ? "pointer" : "default",
          innerSize: "80%",
          dataLabels: {
            enabled: showDataLabels,
            formatter: function (this: Highcharts.Point) {
              const displayVal = valueFormatter
                ? valueFormatter(this.y ?? 0)
                : String(this.y);
              return `<p>${this.name}: ${displayVal}</p>`;
            },
            style: {
              color: "var(--chartCard-data-label)",
            },
          },
          showInLegend: showLegend,
          point: {
            events: {
              click: function () {
                if (onPointClick) {
                  onPointClick({
                    name: (this as Highcharts.Point).name ?? "",
                    value: (this as Highcharts.Point).y ?? 0,
                  });
                }
              },
            },
          },
        },
      },
      series: [
        {
          type: "pie",
          name: title,
          data: graphData,
        },
      ],
      credits: {
        enabled: false,
      },
      tooltip: {
        followPointer: true,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        style: {
          color: "#fff",
          fontWeight: "bold",
        },
        borderRadius: 4,
        formatter: function () {
          const displayVal = valueFormatter
            ? valueFormatter(this.y ?? 0)
            : String(this.y);
          return `${this.key}: ${displayVal}`;
        },
      },
      legend: {
        itemStyle: {
          color: "var(--chartCard-legend)",
        },
      },
    }),
    [
      title,
      graphData,
      customHeight,
      customWidth,
      showDataLabels,
      showLegend,
      valueFormatter,
      onPointClick,
    ],
  );

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardHeader}>
        <h3 className={styles.chartCardTitle}>{title}</h3>
        <p className={styles.chartCardSubtitle}>{subtitle}</p>
      </div>
      <div className={styles.chartCardBody}>
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};

export default DoughnutChartCard;
