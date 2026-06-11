import type { Stock } from "@/lib/types";

export const stocks: Stock[] = [
  {
    symbol: "005930",
    nameKo: "삼성전자",
    nameEn: "Samsung Electronics",
    market: "KOSPI",
    price: 74200,
    changePercent: 1.23,
    volume: 12834000,
  },
  {
    symbol: "000660",
    nameKo: "SK하이닉스",
    nameEn: "SK Hynix",
    market: "KOSPI",
    price: 216500,
    changePercent: -0.82,
    volume: 3892000,
  },
];
