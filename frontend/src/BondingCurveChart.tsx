import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import numeral from "numeral";
import { CurrentPsiData, CurveDataPoint } from "./Types";
import { isConstructorDeclaration } from "typescript";

const data = require("./bondingCurveData.json");
Chart.register(...registerables, ChartDataLabels);

function parseData(data: CurveDataPoint[]): { x: number; y: number }[] {
  return data.map((record) => ({
    x: record.totalSupply,
    y: record.price,
  }));
}

function calculateLabelAlignment(
  pointerData: CurrentPsiData,
  supplyCap: number
) {
  let alignment = -52;
  if (pointerData.totalSupply > supplyCap * 0.1) {
    alignment = -90;
  }
  if (pointerData.totalSupply > supplyCap * 0.6) {
    alignment = 180;
  }
  if (pointerData.totalSupply > supplyCap * 0.8) {
    alignment = -225;
  }

  return alignment;
}

function getAspectRatio() {
  if (window.innerWidth > 700) {
    return 4;
  } else if (window.innerWidth > 400) {
    return 2;
  } else {
    return 1;
  }
}

const MyChart = ({ pointerData }: { pointerData: CurrentPsiData }) => {
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | undefined>(
    undefined
  );
  console.log("pointerData", pointerData);
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
                align: calculateLabelAlignment(pointerData, 2500000),
                offset: 20,
                borderRadius: 4,
                clamp: true,
                color: "black",
                font: {
                  weight: "bold",
                },
                padding: 10,
                formatter: function (value, context) {
                  const formattedSupply = numeral(
                    pointerData.totalSupply
                  ).format("0[.]0a");

                  const formattedPriceDollars = numeral(
                    pointerData.dollars.price
                  ).format("$0[.]00a");
                  const formattedMarketCapDollars = numeral(
                    pointerData.dollars.marketCap
                  ).format("$0[.]0a");

                  const formattedPriceEth = numeral(
                    pointerData.eth.price
                  ).format("0[.]00000a");
                  const formattedMarketCapEth = numeral(
                    pointerData.eth.marketCap
                  ).format("0[.]000a");

                  return `Current PSI stats:\nPSI bought: ${formattedSupply}\nPrice: ${formattedPriceEth} ETH (${formattedPriceDollars})\nMarket cap: ${formattedMarketCapEth} ETH (${formattedMarketCapDollars})`;
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
          aspectRatio: getAspectRatio(),
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
              // min: 0,
              // max: 5500000,
              title: { display: true, text: "PSI bought", color: "white" },
            },
            y: {
              display: true,
              grid: {
                color: "grey",
              },
              ticks: {
                color: "white",
                callback: function (ethPrice) {
                  const formattedEthPrice = numeral(Number(ethPrice)).format(
                    "0.0000"
                  );
                  const formattedDollarPrice = numeral(
                    Number(ethPrice) * pointerData.etherPrice
                  ).format("$0a");
                  return `${formattedEthPrice} ETH (${formattedDollarPrice})`;
                },
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
