// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const platformSelect = document.getElementById("platformSelect");
const publisherSelect = document.getElementById("publisherSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))];
const platforms = [...new Set(chartData.map(r => r.platform))];
const publishers = [...new Set(chartData.map(r => r.publisher))]

years.forEach(y => yearSelect.add(new Option(y, y)));
platforms.forEach(h => platformSelect.add(new Option(h, h)));
publishers.forEach(p => publisherSelect.add(new Option(p, p)));

yearSelect.value = years[0];
platformSelect.value = platforms[0];
publisherSelect.value = platforms[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = Number(yearSelect.value);
  const platform = platformSelect.value;
  const publisher = publisherSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, platform, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, platform, metric }) {
  if (type === "bar") return barByNeighborhood(year, metric);
  if (type === "line") return lineOverTime(platform, ["revenueUSD"]);
  if (type === "scatter") return scatterTripsVsTemp(year);
  if (type === "doughnut") return doughnutMemberVsCasual(year, platform);
  if (type === "radar") return radarCompareNeighborhoods(year);
  return barByNeighborhood(year, metric);
}

// Task A: BAR — compare sales for a given year
function barByNeighborhood(year, metric) {
  const rows = chartData.filter(r => r.year === year);

  const labels = rows.map(r => r.platform);
  const values = rows.map(r => r[metric]);

  console.log('entered');
  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `platform comparison (${year})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "platform" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one platform (2 datasets)
function lineOverTime(platform, metrics) {
  const rows = chartData.filter(r => r.platform === platform);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(y => ({
    label: y,
    data: rows.map(r => r[y])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${platform}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "year" } }
      }
    }
  };
}

//Scatter: review score vs sales
// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp(year) {
  const rows = chartData.filter(r => r.year == year);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.revenueUSD }));
  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Review Score vs Sales (${year})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does Review Score affect Sales? (${year})` }
      },
      scales: {
        x: { title: { display: true, text: "review Score" } },
        y: { title: { display: true, text: "Sales" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one platform + year
function doughnutMemberVsCasual(year, platform) {
  const row = chartData.find(r => r.year == year && r.platform == platform);

  const allRegions = chartData.filter(r => r.region).length

  const NA = (chartData.filter(r => r.region === "NA").length)/allRegions;
  const EU = (chartData.fill(r => r.region === "EU").length)/allRegions;
  const JP = (chartData.fill(r => r.region === "JP").length)/allRegions;
  const ASIA = (chartData.fill(r => r.region === "ASIA").length)/allRegions;

  return {
    type: "doughnut",
    data: {
      labels: ["NA", "EU", "JP", "ASIA"],
      datasets: [{ label: "Rider mix", data: [NA, EU, JP, ASIA] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${platform} (${year})` }
      }
    }
  };
}

// RADAR — compare publishers across multiple metrics for one year
function radarCompareNeighborhoods(year) {
  const rows = chartData.filter(r => r.year == year);
  const metrics = ["unitsM", "revenueUSD", "priceUSD", "reviewScore", "esports"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.publisher,
    data: metrics.map(y => r[y])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}