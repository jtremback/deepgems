const ethPrice = 3300;

function timeout(n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, n);
  });
}

async function run() {
  const req = await fetch("data.json");
  const data = await req.json();

  await timeout(500);

  var ctx = document.getElementById("chart1").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          showLine: true,
          pointRadius: 3,
          data: data.map((record) => ({
            x: record.totalSupply,
            y: record.price * ethPrice,
          })),
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
          title: { display: true, text: "PSI minted", color: "white" },
          // min: 0,
          // max: 6000000,
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
          // min: 0,
          // max: 6,
        },
      },
    },
  });

  var ctx = document.getElementById("chart2").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          showLine: true,
          pointRadius: 3,
          data: data.map((record) => ({
            x: record.totalSupply,
            y: record.marketCap * ethPrice,
          })),
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
          title: { display: true, text: "PSI minted", color: "white" },
        },
        y: {
          display: true,
          grid: {
            color: "grey",
          },
          ticks: {
            color: "white",
          },

          title: { display: true, text: "PSI market cap", color: "white" },
        },
      },
    },
  });

  var ctx = document.getElementById("chart3").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          showLine: true,
          pointRadius: 3,
          data: data.map((record) => ({
            x: record.marketCap * ethPrice,
            y: record.price * ethPrice,
          })),
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
          title: { display: true, text: "PSI market cap", color: "white" },
          // min: 0,
          // max: 10000000,
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
}

run();
