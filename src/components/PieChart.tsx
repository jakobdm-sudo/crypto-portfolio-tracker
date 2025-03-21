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
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { ClientOnly } from "~/components/client-only";

type TooltipPayload = {
  name: string;
  value: number;
  payload: {
    name: string;
    symbol: string;
    value: number;
    formattedValue: string;
    percentage: string;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      symbol: string;
      value: number;
      formattedValue: string;
      percentage: string;
    };
  }>;
};

const getAssetColor = (asset: CryptoAsset) =>
  CRYPTO_ICONS[asset.symbol]?.color ?? DEFAULT_CRYPTO_COLOR;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export default function PieChart() {
  const { data: configData } = api.config.getRefetchInterval.useQuery(
    undefined,
    {
      retry: false,
      onError: () => {
        return 1800000;
      },
    },
  );
  const refetchInterval = configData ?? 1800000; // 30 minutes default

  const [assets] = api.assets.getAssets.useSuspenseQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: refetchInterval,
  });

  const { theme } = useTheme();
  const isMobile = useIsMobile();

  const totalPortfolioValue = assets.reduce(
    (acc, asset) => acc + (asset.totalValue ?? 0),
    0,
  );

  const data = assets
    .map((asset) => {
      const value = asset.totalValue ?? 0;
      const percentage = ((value / totalPortfolioValue) * 100).toFixed(2);
      return {
        name: asset.name,
        symbol: asset.symbol,
        value: value,
        formattedValue: formatCurrency(value),
        percentage: percentage,
      };
    })
    .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return (
    <ClientOnly>
      <div className="border-width-2 mx-4 my-4 mt-12 rounded-lg border border-primary/20 bg-primary/10 p-4 pb-4 shadow-lg backdrop-blur-md md:mx-20 md:pb-12">
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
                cy={isMobile ? "50%" : "45%"}
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
                  <g>
                    <text
                      x={width / 2}
                      y={height * (isMobile ? 0.45 : 0.45)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-base font-bold md:text-lg"
                      fill={theme === "dark" ? "#ffffff" : "#000000"}
                    >
                      {formatCurrency(totalPortfolioValue)}
                    </text>
                  </g>
                )}
              />

              <Tooltip
                content={({ active, payload }: CustomTooltipProps) => {
                  if (!active || !payload?.length) return null;

                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border-2 border-border bg-card p-2">
                      <p className="font-bold">{data.name}</p>
                      <p>{data.formattedValue}</p>
                      <p className="text-muted-foreground">
                        {data.percentage}%
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                iconType="circle"
                iconSize={0}
                formatter={(value, entry, index) => (
                  <div className="my-0.5 inline-flex items-center gap-1.5 md:my-0 md:gap-0.5">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span
                      style={{
                        color: theme === "dark" ? "#ffffff" : "#000000",
                      }}
                      className=""
                    >
                      {value}
                    </span>
                    <span className="text-xs text-muted-foreground md:hidden">
                      ({entry.payload?.percentage}%)
                    </span>
                  </div>
                )}
              />
            </RechartsChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </ClientOnly>
  );
}
