import manifest from "cryptocurrency-icons/manifest.json";

interface CryptoIcon {
  symbol: string;
  name: string;
  color: string;
}

const iconManifest = manifest as CryptoIcon[];

// Map using symbols instead of names
export const CRYPTO_ICONS: Record<string, { icon: string; color: string }> = {
  ...Object.fromEntries(
    iconManifest.map((coin) => [
      coin.symbol.toUpperCase(), // Use uppercase symbol as key
      {
        icon: `/crypto-icons/${coin.symbol.toLowerCase()}.svg`,
        color: `${coin.color}`, // No # prefix since manifest already includes it
      },
    ]),
  ),
};

// Fallback values
export const DEFAULT_CRYPTO_ICON = "/crypto-icons/generic.svg";
export const DEFAULT_CRYPTO_COLOR = "#000000";
