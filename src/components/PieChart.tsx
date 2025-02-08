"use client";

import {
  PieChart as RechartsChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CryptoAsset } from "~/types/CryptoAsset";
import { ChartContainer } from "~/components/ui/chart";
import { useTheme } from "next-themes";
import { formatCurrency } from "~/utils/formatters";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function PieChart({ assets }: { assets: CryptoAsset[] }) {
  const { theme } = useTheme();
  const data = assets.map((asset) => ({
    name: asset.name,
    value: asset.value,
    formattedValue: formatCurrency(asset.value),
  }));

  return (
    <ChartContainer
      config={{
        ...Object.fromEntries(
          assets.map((asset, index) => [
            asset.symbol,
            {
              label: asset.name,
              color: COLORS[index % COLORS.length],
            },
          ]),
        ),
      }}
      className="h-[400px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
          />
          <Legend
            formatter={(value, entry, index) => (
              <span style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}>
                {value}
              </span>
            )}
          />
        </RechartsChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
