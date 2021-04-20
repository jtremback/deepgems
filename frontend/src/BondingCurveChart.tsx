import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import numeral from "numeral";
const data = require("./bondingCurveData.json");
Chart.register(...registerables, ChartDataLabels);

const randomInt = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

interface CurveDataPoint {
  price: number;
  totalSupply: number;
  marketCap: number;
}

function parseData(data: CurveDataPoint[]): { x: number; y: number }[] {
  return data.map((record) => ({
    x: record.totalSupply,
    y: record.price,
  }));
}

const pointerData = parseData([
  {
    price: 197.5532572050197,
    totalSupply: 993863.8197262969,
    marketCap: 196341034.80515245,
  },
]);

function calculateLabelAlignment(pointerData: CurveDataPoint) {
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

const MyChart = ({ pointerData }: { pointerData: CurveDataPoint }) => {
  const chartContainer = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | undefined>(
    undefined
  );

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
              data: parseData([pointerData]),
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
                  const formattedSupply = numeral(value.x).format("0[.]0a");
                  const formattedPrice = numeral(value.y).format("$0[.]00a");
                  const formattedMarketCap = numeral(value.marketCap).format(
                    "$0a"
                  );
                  return `Current PSI stats:\nSupply: ${formattedSupply}\nPrice: ${formattedPrice}\nMarket cap: ${formattedMarketCap}`;
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
              max: 1000000,
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

  const updateDataset = (datasetIndex: number, newData: number[]) => {
    if (!chartInstance || !chartInstance.data.datasets) return;
    chartInstance.data.datasets[datasetIndex].data = newData;
    chartInstance.update();
  };

  const onButtonClick = () => {
    const data = [
      randomInt(),
      randomInt(),
      randomInt(),
      randomInt(),
      randomInt(),
      randomInt(),
    ];
    updateDataset(0, data);
  };

  return (
    // style={{ position: "relative", height: 100, width: "100%" }}
    <div>
      <canvas ref={chartContainer} />
    </div>
  );
};

export default MyChart;
