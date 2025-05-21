
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const API_KEY = "BOYIYF0CB2G8AGFE";

export default function MarketSentimentDashboard() {
  const [data, setData] = useState({
    sp500: 0,
    vix: 0,
    fearGreed: 0,
    gold: 0,
    usdJpy: 0,
    sentiment: "Loading...",
  });

  useEffect(() => {
    const fetchData = async () => {
      const sp500 = await fetchSP500();
      const gold = await fetchGold();
      const usdJpy = await fetchUSDJPY();
      const vix = 13.5;
      const fearGreed = 75;
      const sentiment = calculateSentiment({ sp500, vix, fearGreed, gold, usdJpy });
      setData({ sp500, vix, fearGreed, gold, usdJpy, sentiment });
    };
    fetchData();
  }, []);

  const fetchSP500 = async () => {
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=^GSPC&interval=60min&apikey=${API_KEY}`);
      const json = await res.json();
      const prices = json["Time Series (60min)"];
      const keys = Object.keys(prices);
      const latest = parseFloat(prices[keys[0]]['4. close']);
      const prev = parseFloat(prices[keys[1]]['4. close']);
      return ((latest - prev) / prev * 100).toFixed(2);
    } catch {
      return 0;
    }
  };

  const fetchGold = async () => {
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`);
      const json = await res.json();
      return 0;
    } catch {
      return 0;
    }
  };

  const fetchUSDJPY = async () => {
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=JPY&apikey=${API_KEY}`);
      const json = await res.json();
      return parseFloat(json["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
    } catch {
      return 0;
    }
  };

  const calculateSentiment = ({ sp500, vix, fearGreed, gold, usdJpy }) => {
    let score = 0;
    if (sp500 > 0) score++;
    if (vix < 15) score++;
    if (fearGreed > 60) score++;
    if (gold < 0) score++;
    if (usdJpy > 0) score++;
    return score >= 4 ? "📈 Risk-On" : score <= 2 ? "📉 Risk-Off" : "⚖️ Neutral";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">📊 S&P 500 Change</h2>
          <p>{data.sp500}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">📉 VIX</h2>
          <p>{data.vix}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">😨 Fear & Greed Index</h2>
          <Progress value={data.fearGreed} />
          <p>{data.fearGreed} / 100</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">🥇 Gold Change</h2>
          <p>{data.gold}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-2">💱 USD/JPY Rate</h2>
          <p>{data.usdJpy}</p>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Signal:</AlertTitle>
        <AlertDescription className="text-lg font-bold">
          {data.sentiment}
        </AlertDescription>
      </Alert>
    </div>
  );
}
