"use client";

import {
  PieChart as RechartsChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Customized,
} from "recharts";
import type { CryptoAsset } from "~/types/CryptoAsset";
import { ChartContainer } from "~/components/ui/chart";
import { useTheme } from "next-themes";
import { formatCurrency } from "~/utils/formatters";
import { CRYPTO_ICONS, DEFAULT_CRYPTO_COLOR } from "~/utils/cryptoIcons";

const getAssetColor = (asset: CryptoAsset) =>
  CRYPTO_ICONS[asset.symbol]?.color ?? DEFAULT_CRYPTO_COLOR;

export default function PieChart({ assets }: { assets: CryptoAsset[] }) {
  const { theme } = useTheme();

  const totalPortfolioValue = assets.reduce(
    (acc, asset) => acc + asset.totalValue,
    0,
  ); //calc portfolio value TODO: chnage to hook when using actual crypto prices

  const data = assets.map((asset) => ({
    name: asset.name,
    symbol: asset.symbol,
    value: asset.totalValue,
    formattedValue: formatCurrency(asset.totalValue),
  }));

  return (
    <div className="border-width-2 mx-20 my-4 mt-12 rounded-lg border border-primary/20 bg-primary/10 p-4 pb-8 shadow-lg backdrop-blur-md">
      <ChartContainer
        config={{
          ...Object.fromEntries(
            assets.map((asset, index) => [
              asset.symbol,
              {
                label: asset.name,
                color: getAssetColor(asset),
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
              innerRadius={100}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    CRYPTO_ICONS[entry.symbol]?.color ?? DEFAULT_CRYPTO_COLOR
                  }
                />
              ))}
            </Pie>

            {/* Add Total Portfolio Value in the Center */}
            <Customized
              component={({ width, height }) => (
                <text
                  x={width / 2}
                  y={height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18px"
                  fontWeight="bold"
                  fill={theme === "dark" ? "#ffffff" : "#000000"}
                >
                  {formatCurrency(totalPortfolioValue)}
                </text>
              )}
            />

            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor:
                  theme === "dark"
                    ? "hsl(var(--background))"
                    : "hsl(var(--card))",
                borderColor:
                  theme === "dark"
                    ? "hsl(var(--border))"
                    : "hsl(var(--border))",
                color:
                  theme === "dark"
                    ? "hsl(var(--muted-foreground))"
                    : "hsl(var(--foreground))",
                borderWidth: "2px",
                borderRadius: "0.5rem",
                padding: "0.5rem",
              }}
              labelStyle={{
                color:
                  theme === "dark"
                    ? "hsl(var(--muted-foreground))"
                    : "hsl(var(--foreground))",
              }}
              itemStyle={{
                color:
                  theme === "dark"
                    ? "hsl(var(--muted-foreground))"
                    : "hsl(var(--foreground))",
              }}
            />
            <Legend
              formatter={(value, entry, index) => (
                <span
                  style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
                >
                  {value}
                </span>
              )}
            />
          </RechartsChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
