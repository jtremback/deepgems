import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const randomInt = () => Math.floor(Math.random() * (10 - 1 + 1)) + 1;

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
              parsing: false,
              borderColor: "rgba(255,0,0,1)",
              showLine: true,
              data: [
                { x: 1, y: 1 },
                { x: 2, y: 10 },
                { x: 3, y: 100 },
                { x: 4, y: 1000 },
              ],
            },
          ],
        },
        options: {
          // responsive: true,
          // plugins: {
          //   title: {
          //     display: true,
          //     text: "Chart.js Line Chart - Logarithmic",
          //   },
          // },
          scales: {
            x: {
              display: true,
              type: "logarithmic",
            },
            y: {
              display: true,
            },
          },
        },
      });
      setChartInstance(newChartInstance);
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
    <div style={{ background: "white" }}>
      <button onClick={onButtonClick}>Randomize!</button>
      <canvas ref={chartContainer} />
    </div>
  );
};

export default MyChart;
