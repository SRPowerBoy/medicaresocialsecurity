(function () {
  "use strict";

  var D = window.SITE_DATA;
  var chart = document.getElementById("chart");
  var tbody = document.getElementById("historyBody");
  if (!D || !chart || !tbody) return;

  var rows = D.history;
  var fmt = window.Fmt;
  var metrics = {
    premium: { label: "Monthly standard Part B premium", key: "premium", cents: true },
    deductible: { label: "Part B annual deductible", key: "deductible", cents: false },
    partADeductible: { label: "Part A inpatient deductible", key: "partADeductible", cents: false }
  };
  var buttons = document.querySelectorAll("[data-metric]");

  function text(metric, value) {
    return metric.cents ? fmt.money(value) : fmt.money0(value);
  }

  function drawChart(metricKey) {
    var metric = metrics[metricKey];
    var max = Math.max.apply(null, rows.map(function (r) { return r[metric.key]; }));
    chart.innerHTML = "";
    chart.setAttribute("aria-label", metric.label + " by year, 2020 to 2027");

    rows.forEach(function (r) {
      var value = r[metric.key];

      var col = document.createElement("div");
      col.className = "col";

      var val = document.createElement("div");
      val.className = "val";
      val.textContent = text(metric, value);

      var track = document.createElement("div");
      track.className = "track";

      var bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = (value / max * 100).toFixed(1) + "%";
      bar.title = r.year + ": " + text(metric, value);

      track.appendChild(bar);

      var yr = document.createElement("div");
      yr.className = "yr";
      yr.textContent = r.year;

      col.appendChild(val);
      col.appendChild(track);
      col.appendChild(yr);
      chart.appendChild(col);
    });
  }

  function drawTable() {
    tbody.innerHTML = "";
    rows.forEach(function (r, i) {
      var prev = rows[i - 1];
      var change = prev ? r.premium - prev.premium : null;
      var pct = prev ? change / prev.premium * 100 : null;

      var tr = document.createElement("tr");

      var cells = [
        { text: String(r.year), cls: "" },
        { text: fmt.money(r.premium), cls: "num" },
        {
          text: change == null ? "—" : fmt.signed(change),
          cls: "num" + (change == null ? "" : change >= 0 ? " up" : " down")
        },
        {
          text: pct == null ? "—" : (pct >= 0 ? "+" : "−") + Math.abs(pct).toFixed(1) + "%",
          cls: "num"
        },
        { text: fmt.money0(r.deductible), cls: "num" },
        { text: fmt.money0(r.partADeductible), cls: "num" }
      ];

      cells.forEach(function (c) {
        var td = document.createElement("td");
        td.textContent = c.text;
        if (c.cls) td.className = c.cls;
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.getAttribute("data-metric");
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      drawChart(key);
    });
  });

  drawChart("premium");
  drawTable();
})();
