(function () {
  "use strict";

  var D = window.SITE_DATA;
  var form = document.getElementById("calc-form");
  if (!form || !D) return;

  var input = document.getElementById("benefit");
  var deducted = document.getElementById("deducted");
  var presets = document.querySelectorAll("[data-preset]");
  var emptyMsg = document.getElementById("calc-empty");
  var results = document.getElementById("calc-results");
  var hold = document.getElementById("hold");

  var COLA = D.cola2027;
  var P26 = D.partB.premium2026;
  var P27 = D.partB.premium2027;
  var money = window.Fmt.money;
  var signed = window.Fmt.signed;

  function $(id) { return document.getElementById(id); }

  function readBenefit() {
    var n = parseFloat(String(input.value).replace(/[^0-9.]/g, ""));
    return isFinite(n) && n > 0 ? n : null;
  }

  function setBar(id, value, scale) {
    var pct = scale > 0 ? Math.min(100, Math.abs(value) / scale * 100) : 0;
    $(id).style.width = pct.toFixed(1) + "%";
  }

  function render() {
    var b = readBenefit();

    presets.forEach(function (p) {
      p.setAttribute("aria-pressed", String(b !== null && Number(p.getAttribute("data-preset")) === b));
    });

    if (b === null) {
      emptyMsg.hidden = false;
      results.hidden = true;
      return;
    }
    emptyMsg.hidden = true;
    results.hidden = false;

    var takes = deducted.checked;
    var raise = b * COLA;
    var gross27 = b + raise;
    var prem26 = takes ? P26 : 0;
    var prem27 = takes ? P27 : 0;
    var net26 = b - prem26;
    var net27 = gross27 - prem27;
    var change = net27 - net26;
    var premInc = prem27 - prem26;

    // A benefit smaller than the premium can't be estimated here.
    var tooLow = takes && gross27 <= P27;

    $("net27").textContent = tooLow ? "Ask SSA" : money(net27);

    var delta = $("netChange");
    if (tooLow) {
      delta.textContent = "";
      delta.className = "delta";
    } else {
      delta.textContent = (change >= 0 ? "Up " : "Down ") + money(Math.abs(change)) + " a month";
      delta.className = "delta" + (change < 0 ? " down" : "");
    }

    $("gross27").textContent = money(gross27);
    $("raise").textContent = signed(raise);
    $("prem27").textContent = takes ? "−" + money(prem27) : "Billed separately";
    $("net26").textContent = money(net26);

    $("raiseVal").textContent = signed(raise);
    $("premIncVal").textContent = takes ? "−" + money(premInc) : "Not from your check";

    var scale = Math.max(raise, premInc, 1);
    setBar("barRaise", raise, scale);
    setBar("barPrem", premInc, scale);

    var msg;
    if (tooLow) {
      msg = "Your benefit is smaller than the Part B premium, so this estimate doesn't apply. Contact SSA to see how your premium is handled.";
    } else if (!takes) {
      msg = "Your premium isn't taken from your check, so the full raise of " + signed(raise) +
        " a month shows up in your deposit. You still pay the premium on your own.";
    } else if (change > 0.005) {
      msg = "The raise is bigger than the premium increase, so your check goes up by about " +
        money(change) + " a month.";
    } else if (change < -0.005) {
      msg = "The premium increase is bigger than your raise, so your check goes down by about " +
        money(Math.abs(change)) + " a month.";
    } else {
      msg = "The raise and the premium increase cancel out, so your check stays about the same.";
    }
    $("verdict").textContent = msg;

    hold.hidden = tooLow || !(takes && change < -0.005);
  }

  presets.forEach(function (p) {
    p.addEventListener("click", function () {
      input.value = p.getAttribute("data-preset");
      render();
      input.focus();
    });
  });
  input.addEventListener("input", render);
  deducted.addEventListener("change", render);
  form.addEventListener("submit", function (e) { e.preventDefault(); render(); });

  render();
})();
