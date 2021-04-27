import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import numeral from "numeral";
import { CurrentPsiData, CurveDataPoint } from "./Types";

const data = require("./bondingCurveData.json");
Chart.register(...registerables, ChartDataLabels);

function parseData(data: CurveDataPoint[]): { x: number; y: number }[] {
  return data.map((record) => ({
    x: record.totalSupply,
    y: record.price,
  }));
}

function calculateLabelAlignment(pointerData: CurrentPsiData) {
  let alignment = -52;
  if (pointerData.totalSupply > 200000) {
    alignment = -90;
  }
  if (pointerData.totalSupply > 600000) {
    alignment = 180;
  }
  if (pointerData.totalSupply > 800000) {
    alignment = -225;
  }

  return alignment;
}

const MyChart = ({ pointerData }: { pointerData: CurrentPsiData }) => {
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | undefined>(
    undefined
  );
  console.log(pointerData);
  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      const newChartInstance = new Chart(chartContainer.current, {
        type: "scatter",
        data: {
          datasets: [
            {
              type: "line",
              pointRadius: 8,
              backgroundColor: "white",
              data: [
                {
                  x: pointerData.totalSupply,
                  y: pointerData.eth.price,
                },
              ],
              datalabels: {
                backgroundColor: "rgba(255,255,255,1)",
                align: calculateLabelAlignment(pointerData),
                offset: 20,
                borderRadius: 4,
                clamp: true,
                color: "black",
                font: {
                  weight: "bold",
                },
                padding: 10,
                formatter: function (value, context) {
                  console.log("pointerData", pointerData);
                  const formattedSupply = numeral(
                    pointerData.totalSupply
                  ).format("0[.]0a");

                  const formattedPriceDollars = numeral(
                    pointerData.dollars.price
                  ).format("$0[.]00a");
                  const formattedMarketCapDollars = numeral(
                    pointerData.dollars.marketCap
                  ).format("$0a");

                  const formattedPriceEth = numeral(
                    pointerData.eth.price
                  ).format("0[.]0000000a");
                  const formattedMarketCapEth = numeral(
                    pointerData.eth.marketCap
                  ).format("0.000a");

                  return `Current PSI stats:\nSupply: ${formattedSupply}\nPrice: ${formattedPriceEth} ETH (${formattedPriceDollars})\nMarket cap: ${formattedMarketCapEth} ETH (${formattedMarketCapDollars})`;
                },
              },
            },
            {
              showLine: true,
              pointRadius: 0,
              data: parseData(data),
              datalabels: {
                display: false,
              },
            },
          ],
        },
        options: {
          responsive: true,
          aspectRatio: 4,
          elements: {
            line: {
              borderColor: "white",
            },
            point: {
              radius: 0,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              display: true,
              grid: {
                color: "grey",
                tickColor: "white",
                offset: false,
              },
              ticks: {
                color: "white",
              },
              min: 0,
              max: 500000,
              title: { display: true, text: "PSI supply", color: "white" },
            },
            y: {
              display: true,
              grid: {
                color: "grey",
              },
              ticks: {
                color: "white",
              },
              title: { display: true, text: "PSI price", color: "white" },
            },
          },
        },
      });
      setChartInstance(newChartInstance);
      return function cleanup() {
        newChartInstance.destroy();
      };
    }
  }, [chartContainer]);

  return (
    // style={{ position: "relative", height: 100, width: "100%" }}
    <div>
      <canvas ref={chartContainer} />
    </div>
  );
};

export default MyChart;
