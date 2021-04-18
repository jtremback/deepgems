import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import numeral from "numeral";
const data = require("./bondingCurveData.json");
Chart.register(...registerables, ChartDataLabels);

const randomInt = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

function parseData(
  data: {
    reservePool: number;
    price: number;
    totalSupply: number;
    marketCap: number;
  }[]
) {
  return data.map((record) => ({
    x: record.totalSupply,
    y: record.price,
    marketCap: record.marketCap,
  }));
}

const pointerData = parseData([
  {
    reservePool: 65446945.750675924,
    price: 197.5532572050197,
    totalSupply: 993863.8197262969,
    marketCap: 196341034.80515245,
  },
]);

function calculateLabelAlignment(pointerData: {
  x: number;
  y: number;
  marketCap: number;
}) {
  let alignment = -52;
  if (pointerData.x > 200000) {
    alignment = -90;
  }
  if (pointerData.x > 600000) {
    alignment = 180;
  }
  if (pointerData.x > 800000) {
    alignment = -225;
  }

  return alignment;
}

const MyChart = () => {
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
              showLine: true,
              pointRadius: 0,
              data: parseData(data),
              datalabels: {
                display: false,
              },
            },
            {
              type: "line",
              pointRadius: 8,
              backgroundColor: "white",
              data: pointerData,
              datalabels: {
                // display: false,
                backgroundColor: "rgba(255,255,255,1)",
                align: calculateLabelAlignment(pointerData[0]),
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
                  return `Current PSI:\nSupply: ${formattedSupply}\nPrice: ${formattedPrice}\nMarket cap: ${formattedMarketCap}`;
                },
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
              // position: "bottom",
            },
          },
          scales: {
            x: {
              display: true,
              // type: "logarithmic",
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
