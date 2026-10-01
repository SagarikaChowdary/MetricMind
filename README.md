# MetricMind – AI Data Analytics Platform

MetricMind is a browser-based AI data analytics workspace that allows users to upload CSV, XLSX, and JSON datasets, preview and analyze data, build charts, view an auto-generated dashboard, explore rule-based AI insights, and chat with their data.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

To create a production build:

```bash
npm run build
```

## Structure

```text
src/
├── store.jsx
│   └── Context store for the loaded dataset.
│       Dataset state is shared across all pages.
│       Session data is saved to localStorage when below ~3 MB.
│
├── utils/
│   └── data.js
│       ├── CSV/XLSX/JSON parsing
│       ├── Data type detection
│       ├── Statistics
│       ├── Duplicate and missing-value detection
│       ├── Automatic chart generation
│       ├── Data insights
│       ├── Chat answers
│       └── Sample dataset
│
├── components/
│   ├── Sidebar
│   ├── KPICard
│   ├── ChartCard
│   ├── InsightCard
│   ├── Loading/Error/Empty states
│   ├── DataTable
│   ├── ChartBuilder
│   ├── Charts
│   └── AIChat
│
└── pages/
    └── pages.jsx
        ├── Home
        ├── Upload
        ├── Preview
        ├── Analysis
        ├── Dashboard
        ├── Insights
        └── About
```

## Supported Features

* CSV, XLSX, and JSON file upload
* Sample dataset for quick testing
* Dataset preview
* Automatic data analysis
* Statistics and KPI generation
* Missing-value detection
* Duplicate detection
* Automatic chart generation
* Custom chart building
* Auto-generated analytics dashboard
* Rule-based AI insights
* Data-aware chat
* Persistent dataset session using localStorage
* Responsive browser-based interface

## Optional External AI

MetricMind can optionally connect to an external AI endpoint.

Create a `.env` file in the project root:

```env
VITE_AI_ENDPOINT=your_api_endpoint
```

The endpoint should accept:

```json
{
  "question": "What is the average sales?",
  "summary": "Dataset summary..."
}
```

and return:

```json
{
  "answer": "The average sales is..."
}
```

If `VITE_AI_ENDPOINT` is not configured, MetricMind uses rule-based answers generated from the loaded dataset.

## Technologies

* React
* Vite
* JavaScript
* Recharts
* PapaParse
* SheetJS
* CSS
* LocalStorage

## Project Goal

MetricMind provides a simple analytics workspace where users can upload a dataset and quickly move from **raw data → analysis → visualization → dashboard → insights** without requiring advanced data analytics knowledge.
