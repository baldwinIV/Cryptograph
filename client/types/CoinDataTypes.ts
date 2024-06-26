export interface CoinMetaData {
  id: number;
  symbol: string;
  name: string;
  name_kr: string;
  slug: string;
  market_cap_dominance: number;
  market_cap: number;
  market_cap_kr: string;
  max_supply: number;
  circulating_supply: number;
  total_supply: number;
  cmc_rank: number;
  time: string;
  website: string;
  logo: string;
  description: number;
  volume_24h: string;
}

export interface MarketCapInfo {
  name: string;
  name_es: string;
  cmc_rank: string;
  name_kr: string;
  logo: string;
  market_cap: number;
  acc_trade_price_24h: number;
  signed_change_rate: number;
}
