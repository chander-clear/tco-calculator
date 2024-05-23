(function() {
  document.addEventListener("DOMContentLoaded", function() {
    var tcoCalculator = document.querySelector(".tco-calculator");
    var keyPointsBtn = document.querySelector("#key-points");
    var modal = document.querySelector(".content-modal");
    var modalCloseBtn = document.querySelector(".close-button");
    var backdrop = document.querySelector(".content-modal .backdrop");
    var ultraDiskButton = document.querySelector("#ultra-disk-btn");
    var prSsdButton = document.querySelector("#pr-ssd-btn");
    var userInputValue = "";

    var amdCost = 0;
    var ultraDiskCost = 0;
    var premiumSsdCost = 0;

    const AMD_TB_PER_MONTH = 142.336;
    const ULTRA_DISK_TB_PER_MONTH = 122.59328;
    const PREMIUM_SSD_TB_PER_MONTH = 82.944;

    const AMD_MAX_READ_IOPS = 66000;
    const ULTRA_DISK_MAX_READ_IOPS = 20000;
    const PREMIUM_SSD_READ_IOPS = 15000;

    const AMD_IOPS_MONTH = 0;
    const ULTRA_DISK_IOPS_MONTH = 0.04964;
    const PREMIUM_SSD_IOPS_MONTH = 0.0052;

    const AMD_MBPS_MONTH = 0;
    const ULTRA_DISK_MBPS_MONTH = 0.34967;
    const PREMIUM_SSD_MBPS_MONTH = 0.041;


    const YEARLY_INFLAMATION_VALUE = 1 + 0.15;

    const MONTHS = 12;

    if (!tcoCalculator) return;

    var amdProvsionedCapacity = 0;
    var ultraDiskProvsionedCapacity = 0;
    var premiumSsdProvsionedCapacity = 0;

    var amdCostOneYear = 0;
    var amdCostTwoYear = 0;
    var amdCostThreeYear = 0;
    var amdCostFourYear = 0;
    var amdCostFiveYear = 0;

    var ultraDiskOneYearCost = 0;
    var ultraDiskTwoYearCost = 0;
    var ultraDiskThreeYearCost = 0;
    var ultraDiskFourYearCost = 0;
    var ultraDiskFiveYearCost = 0;

    var premiumSsdOneYearCost = 0;
    var premiumSsdTwoYearCost = 0;
    var premiumSsdThreeYearCost = 0;
    var premiumSsdFourYearCost = 0;
    var premiumSsdFiveYearCost = 0;

    var amdResult = {};
    var ultraDiskResult = {};
    var premiumSsdResults = {};

    var premiumSsdPrCapacity = 0;
    var ultraDiskPrCapacity = 0;

    var tibInput = document.getElementById("tib-input");

    // Convert numeric to dollars currency format
    function numberToDollars(num, decimalPoint = 3) {
      var roundedNum = num > 0 ? parseFloat(num).toFixed(decimalPoint) : num;
      return "$" + roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Convert negative numbers to positive numbers and limit max digits to 12 digits for number inputs
    function getPositiveNumAndLimitMaxDigits(input) {
      if (!!input.value) {
        input.value = parseInt(
          input.value.toLocaleString("fullwide", {
            useGrouping: false
          }),
          10
        );
        input.value = Math.abs(input.value) >= 0 ? Math.abs(input.value) : null;
        input.value =
          input.value.length > input.maxLength ?
          input.value.slice(0, input.maxLength) :
          input.value;
      }

      return input.value;
    }

    // Calculate values and draw chart again when the window is resized to responsive designs
    ["resize"].forEach(function(evt) {
      window.addEventListener(evt, printCharts, false);
    });

    tibInput.addEventListener('input', function(e) {
      printCharts();
    })

    window.addEventListener('load', printCharts);

    const buttons = document.querySelectorAll('.form-group-input .btn-new');

   
    for (i = 0; i < buttons.length; i++) {
      var button = buttons[i];

      button.addEventListener('click', function() {
        document.querySelectorAll('.form-group-input .btn-new').forEach(function(el) {
          el.classList.remove('active');
        })

        this.classList.add('active');

        if (this.getAttribute('id') === "ultra-disk-btn") {
          tibInput.classList.remove('ssd-v2');
          tibInput.classList.add('ultra-disk');
          printCharts();
        } else if (this.getAttribute("id") === "pr-ssd-btn") {
          tibInput.classList.remove('ultra-disk');
          tibInput.classList.add('ssd-v2');
          printCharts();
        }
      })
    }

    // Calculate the Cost of AMD Year One
    function calculateAmdCost() {
      amdCost = tibInput.value * AMD_TB_PER_MONTH * MONTHS;

      const amdYearOneCostHtml = document.getElementById("amd-cost-year-one");
      const amdYearTwoCostHtml = document.getElementById("amd-cost-year-two");
      const amdYearThreeCostHtml = document.getElementById(
        "amd-cost-year-three"
      );
      const amdYearFourCostHtml = document.getElementById("amd-cost-year-four");
      const amdYearFiveCostHtml = document.getElementById("amd-cost-year-five");

      amdCostOneYear = amdCost;
      amdCostTwoYear = amdCostOneYear * (YEARLY_INFLAMATION_VALUE);
      amdCostThreeYear = amdCostTwoYear * (YEARLY_INFLAMATION_VALUE);
      amdCostFourYear = amdCostThreeYear * (YEARLY_INFLAMATION_VALUE);
      amdCostFiveYear = amdCostFourYear * (YEARLY_INFLAMATION_VALUE);

      const amdTcoCost = {
        oneYear: amdCostOneYear,
        twoYear: amdCostTwoYear,
        threeYear: amdCostThreeYear,
        fourYear: amdCostFourYear,
        fiveYear: amdCostFiveYear,
      };

      const cumulativeAmdCost = {
        oneYear: amdTcoCost.oneYear,
        twoYear: amdTcoCost.twoYear + amdTcoCost.oneYear,
        threeYear: amdTcoCost.threeYear + amdTcoCost.oneYear + amdTcoCost.twoYear,
        fourYear: amdTcoCost.fourYear +
          amdTcoCost.oneYear +
          amdTcoCost.threeYear +
          amdTcoCost.twoYear,
        fiveYear: amdTcoCost.fiveYear +
          amdTcoCost.oneYear +
          amdTcoCost.fourYear +
          amdTcoCost.threeYear +
          amdTcoCost.twoYear,
      };

      if (amdYearOneCostHtml) {
        amdYearOneCostHtml.textContent = numberToDollars(
          cumulativeAmdCost.oneYear
        );
        amdYearTwoCostHtml.textContent = numberToDollars(
          cumulativeAmdCost.twoYear
        );
        amdYearThreeCostHtml.textContent = numberToDollars(
          cumulativeAmdCost.threeYear
        );
        amdYearFourCostHtml.textContent = numberToDollars(
          cumulativeAmdCost.fourYear
        );
        amdYearFiveCostHtml.textContent = numberToDollars(
          cumulativeAmdCost.fiveYear
        );
      }

      const amdCalculations = {
        tcoCost: amdTcoCost,
        cumulativeCost: cumulativeAmdCost,
      };

      return amdCalculations;
    }

    // Calculate the Provsioned Capacity AMD
    function calculateAmdProvsionedCapacity() {
      amdProvsionedCapacity = tibInput.value * AMD_MAX_READ_IOPS;

      const amdCapHtml = document.getElementById("amd-cap");

      if (amdCapHtml) {
        amdCapHtml.textContent = amdProvsionedCapacity;
      }

      return amdProvsionedCapacity;
    }

    // Calculate the Cost of Ultra Disk Year one
    function calculateUltraDiskCost() {
      ultraDiskCost =
      tibInput.value * ULTRA_DISK_TB_PER_MONTH * MONTHS +
      tibInput.value *
        ULTRA_DISK_MAX_READ_IOPS *
        ULTRA_DISK_IOPS_MONTH *
        MONTHS +
        (tibInput.value *
          2 *
          ULTRA_DISK_MAX_READ_IOPS *
          ULTRA_DISK_MBPS_MONTH *
          MONTHS) /
        1024;

      const ultraDiskYearOneCostHtml = document.getElementById(
        "ultra-disk-year-one"
      );
      const ultraDiskYearTwoCostHtml = document.getElementById(
        "ultra-disk-year-two"
      );
      const ultraDiskYearThreeCostHtml = document.getElementById(
        "ultra-disk-year-three"
      );
      const ultraDiskYearFourCostHtml = document.getElementById(
        "ultra-disk-year-four"
      );
      const ultraDiskYearFiveCostHtml = document.getElementById(
        "ultra-disk-year-five"
      );

      ultraDiskOneYearCost = ultraDiskCost;
      ultraDiskTwoYearCost = ultraDiskOneYearCost * (YEARLY_INFLAMATION_VALUE);
      ultraDiskThreeYearCost = ultraDiskTwoYearCost * (YEARLY_INFLAMATION_VALUE);
      ultraDiskFourYearCost = ultraDiskThreeYearCost * (YEARLY_INFLAMATION_VALUE);
      ultraDiskFiveYearCost = ultraDiskFourYearCost * (YEARLY_INFLAMATION_VALUE);

      const ultraDiskTcoCost = {
        oneYear: ultraDiskOneYearCost,
        twoYear: ultraDiskTwoYearCost,
        threeYear: ultraDiskThreeYearCost,
        fourYear: ultraDiskFourYearCost,
        fiveYear: ultraDiskFiveYearCost,
      };

      const cumulativeUltraDiskCost = {
        oneYear: ultraDiskTcoCost.oneYear,
        twoYear: ultraDiskTcoCost.twoYear + ultraDiskTcoCost.oneYear,
        threeYear: ultraDiskTcoCost.threeYear +
          ultraDiskTcoCost.oneYear +
          ultraDiskTcoCost.twoYear,
        fourYear: ultraDiskTcoCost.fourYear +
          ultraDiskTcoCost.oneYear +
          ultraDiskTcoCost.threeYear +
          ultraDiskTcoCost.twoYear,
        fiveYear: ultraDiskTcoCost.fiveYear +
          ultraDiskTcoCost.oneYear +
          ultraDiskTcoCost.fourYear +
          ultraDiskTcoCost.threeYear +
          ultraDiskTcoCost.twoYear,
      };

      if (ultraDiskYearOneCostHtml) {
        ultraDiskYearOneCostHtml.textContent = numberToDollars(
          cumulativeUltraDiskCost.oneYear
        );
        ultraDiskYearTwoCostHtml.textContent = numberToDollars(
          cumulativeUltraDiskCost.twoYear
        );
        ultraDiskYearThreeCostHtml.textContent = numberToDollars(
          cumulativeUltraDiskCost.threeYear
        );
        ultraDiskYearFourCostHtml.textContent = numberToDollars(
          cumulativeUltraDiskCost.fourYear
        );
        ultraDiskYearFiveCostHtml.textContent = numberToDollars(
          cumulativeUltraDiskCost.fiveYear
        );
      }

      const ultraDiskCalculations = {
        tcoCost: ultraDiskTcoCost,
        cumulativeCost: cumulativeUltraDiskCost,
      };

      return ultraDiskCalculations;
    }

    // Calculate the Provsioned Capacity Ultra Disk
    function calculateUltraDiskProvsionedCapacity() {
      ultraDiskProvsionedCapacity = tibInput.value * ULTRA_DISK_MAX_READ_IOPS;

      const ultraDiskCapHtml = document.getElementById("ultra-disk-cap");

      if (ultraDiskCapHtml) {
        ultraDiskCapHtml.textContent = ultraDiskProvsionedCapacity;
      }

      return ultraDiskProvsionedCapacity;
    }

    // Calculate the Cost of PremiumSsd Year one
    function calculatePremiumSsdCost() {
      premiumSsdCost =
      tibInput.value * PREMIUM_SSD_TB_PER_MONTH * MONTHS +
      tibInput.value *
        PREMIUM_SSD_READ_IOPS *
        PREMIUM_SSD_IOPS_MONTH *
        MONTHS +
        (tibInput.value *
          2 *
          PREMIUM_SSD_READ_IOPS *
          PREMIUM_SSD_MBPS_MONTH *
          MONTHS) /
        1024;

      const premiumSsdYearOneCostHtml = document.getElementById(
        "premium-ssd-year-one"
      );
      const premiumSsdYearTwoCostHtml = document.getElementById(
        "premium-ssd-year-two"
      );
      const premiumSsdYearThreeCostHtml = document.getElementById(
        "premium-ssd-year-three"
      );
      const premiumSsdYearFourCostHtml = document.getElementById(
        "premium-ssd-year-four"
      );
      const premiumSsdYearFiveCostHtml = document.getElementById(
        "premium-ssd-year-five"
      );

      premiumSsdOneYearCost = premiumSsdCost;
      premiumSsdTwoYearCost = premiumSsdOneYearCost * (YEARLY_INFLAMATION_VALUE);
      premiumSsdThreeYearCost = premiumSsdTwoYearCost * (YEARLY_INFLAMATION_VALUE);
      premiumSsdFourYearCost = premiumSsdThreeYearCost * (YEARLY_INFLAMATION_VALUE);
      premiumSsdFiveYearCost = premiumSsdFourYearCost * (YEARLY_INFLAMATION_VALUE);

      const premiumSsdTcoCost = {
        oneYear: premiumSsdOneYearCost,
        twoYear: premiumSsdTwoYearCost,
        threeYear: premiumSsdThreeYearCost,
        fourYear: premiumSsdFourYearCost,
        fiveYear: premiumSsdFiveYearCost,
      };

      const cumulativePremiumSsdCost = {
        oneYear: premiumSsdTcoCost.oneYear,
        twoYear: premiumSsdTcoCost.twoYear + premiumSsdTcoCost.oneYear,
        threeYear: premiumSsdTcoCost.threeYear +
          premiumSsdTcoCost.oneYear +
          premiumSsdTcoCost.twoYear,
        fourYear: premiumSsdTcoCost.fourYear +
          premiumSsdTcoCost.oneYear +
          premiumSsdTcoCost.threeYear +
          premiumSsdTcoCost.twoYear,
        fiveYear: premiumSsdTcoCost.fiveYear +
          premiumSsdTcoCost.oneYear +
          premiumSsdTcoCost.fourYear +
          premiumSsdTcoCost.threeYear +
          premiumSsdTcoCost.twoYear,
      };

      if (premiumSsdYearOneCostHtml) {
        premiumSsdYearOneCostHtml.textContent = numberToDollars(
          cumulativePremiumSsdCost.oneYear
        );
        premiumSsdYearTwoCostHtml.textContent = numberToDollars(
          cumulativePremiumSsdCost.twoYear
        );
        premiumSsdYearThreeCostHtml.textContent = numberToDollars(
          cumulativePremiumSsdCost.threeYear
        );
        premiumSsdYearFourCostHtml.textContent = numberToDollars(
          cumulativePremiumSsdCost.fourYear
        );
        premiumSsdYearFiveCostHtml.textContent = numberToDollars(
          cumulativePremiumSsdCost.fiveYear
        );
      }

      const premiumSsdCalculations = {
        tcoCost: premiumSsdTcoCost,
        cumulativeCost: cumulativePremiumSsdCost,
      };

      return premiumSsdCalculations;
    }

    // Calculate the Provsioned Capacity Premium SSD V2
    function calculatepremiumSsdProvsionedCapacity() {
      premiumSsdProvsionedCapacity = tibInput.value * PREMIUM_SSD_READ_IOPS;
      const premiumSsdCapHtml = document.getElementById("premium-ssd-cap");

      if (premiumSsdCapHtml) {
        premiumSsdCapHtml.textContent = premiumSsdProvsionedCapacity;
      }

      return premiumSsdProvsionedCapacity;
    }

    function calculateValueAndGenerateData() {
      amdResult = calculateAmdCost();
      ultraDiskResult = calculateUltraDiskCost();
      premiumSsdResults = calculatePremiumSsdCost();
   
      var ultraDiskTotalCost = calculateTotalCostSavings(amdResult.cumulativeCost.fiveYear, ultraDiskResult.cumulativeCost.fiveYear);
      var premiumSsdTotalCost = calculateTotalCostSavings(amdResult.cumulativeCost.fiveYear, premiumSsdResults.cumulativeCost.fiveYear);
      var ultraDiskTotalCostInPercentage = calculateTotalCostInPercentage(amdResult.cumulativeCost.fiveYear, ultraDiskResult.cumulativeCost.fiveYear);
      var premiumSsdTotalCostInPercentage = calculateTotalCostInPercentage(amdResult.cumulativeCost.fiveYear, premiumSsdResults.cumulativeCost.fiveYear);


      const totalCostHtml = document.getElementById("total-cost");
      const totalSavingHtml = document.getElementById(
        "calculation-percentage"
      );

      if (tibInput.classList.contains('ultra-disk')) {
        if (ultraDiskTotalCostInPercentage) {
          // ultraDiskTotalCostHtml.textContent = numberToDollars(ultraDiskTotalCost, 2);
          // ultraDiskTotalSavingHtml.textContent = ultraDiskTotalCostInPercentage;
          totalCostHtml.textContent = numberToDollars(ultraDiskTotalCost, 2);
          totalSavingHtml.textContent = ultraDiskTotalCostInPercentage;
        }

      } else if (tibInput.classList.contains('ssd-v2')) {
        totalCostHtml.textContent = numberToDollars(premiumSsdTotalCost, 2);
        totalSavingHtml.textContent = premiumSsdTotalCostInPercentage;
      }

      if (tibInput.classList.contains('ultra-disk')) {
        if (tibInput.value == '') {
          var resultDataArray = [
            ['Year', 'UltraDisk', 'Lightbits'],
            ['YearOne', 0, 0],
            ['YearTwo', 0, 0],
            ['YearThree', 0, 0],
            ['YearFour', 0,0],
            ['YearFive', 0,0]
          ];
          totalCostHtml.textContent = 0;
          totalSavingHtml.textContent = 0;
  
          return resultDataArray;
        } else {
  
          var resultDataArray = [
            ['Year', 'UltraDisk', 'Lightbits'],
            ['YearOne', ultraDiskResult.cumulativeCost.oneYear, amdResult.cumulativeCost.oneYear],
            ['YearTwo', ultraDiskResult.cumulativeCost.twoYear, amdResult.cumulativeCost.twoYear],
            ['YearThree', ultraDiskResult.cumulativeCost.threeYear,  amdResult.cumulativeCost.threeYear],
            ['YearFour', ultraDiskResult.cumulativeCost.fourYear, amdResult.cumulativeCost.fourYear],
            ['YearFive', ultraDiskResult.cumulativeCost.fiveYear, amdResult.cumulativeCost.fiveYear]
          ];
  
          return resultDataArray;
        }

      } else if (tibInput.classList.contains('ssd-v2')) {
        if (tibInput.value == '') {
          var resultDataArray = [
            ['Year', 'Premium SSD v2', 'Lightbits'],
            ['YearOne', 0, 0],
            ['YearTwo', 0, 0],
            ['YearThree', 0, 0],
            ['YearFour', 0,0],
            ['YearFive', 0,0]
          ];
          totalCostHtml.textContent = 0;
          totalSavingHtml.textContent = 0;
  
          return resultDataArray;
        } else {
  
          var resultDataArray = [
            ['Year', 'Premium SSD v2', 'Lightbits'],
            ['YearOne', premiumSsdResults.cumulativeCost.oneYear, amdResult.cumulativeCost.oneYear],
            ['YearTwo', premiumSsdResults.cumulativeCost.twoYear, amdResult.cumulativeCost.twoYear],
            ['YearThree', premiumSsdResults.cumulativeCost.threeYear,  amdResult.cumulativeCost.threeYear],
            ['YearFour', premiumSsdResults.cumulativeCost.fourYear, amdResult.cumulativeCost.fourYear],
            ['YearFive', premiumSsdResults.cumulativeCost.fiveYear, amdResult.cumulativeCost.fiveYear]
          ];
  
          return resultDataArray;
        }
      }
      
    }

    function calculateCapacityAndGenerateData() {
      var tibInput = document.getElementById("tib-input");

      amdPrCapacity = calculateAmdProvsionedCapacity();
      ultraDiskPrCapacity = calculateUltraDiskProvsionedCapacity();
      premiumSsdPrCapacity = calculatepremiumSsdProvsionedCapacity();

      if (tibInput.classList.contains('ultra-disk')) {
        if (tibInput.value == '') {
          var resultDataArray = [
            ["Element", "Density", { role: "style" } ],
            ["Ultra Disk", 0, "#BA9673"],
            ["Lightbits", 0, "#790977"],
          ]
  
          return resultDataArray;
        } else {
          var resultDataArray = [
            ["Element", "Density", { role: "style" } ],
            ["Ultra Disk", ultraDiskPrCapacity, "#BA9673"],
            ["Lightbits", amdPrCapacity, "#790977"],
          ]
  
          return resultDataArray;
        }

      } else if (tibInput.classList.contains('ssd-v2')) {
        if (tibInput.value == '') {
          var resultDataArray = [
            ["Capacity", "Capacity", { role: "style" } ],
            ["Premium SSD v2", 0, "#BA9673"],
            ["Lightbits", 0, "#790977"],
          ]
  
          return resultDataArray;
        } else {
          var resultDataArray = [
            ["Element", "Capacity", { role: "style" } ],
            ["Premium SSD v2", premiumSsdPrCapacity, "#BA9673"],
            ["Lightbits", amdPrCapacity, "#790977"],
          ]
  
          return resultDataArray;
        }
      }
    }

    function drawBarChart() {
      var arrayValues = calculateCapacityAndGenerateData();
      var data = google.visualization.arrayToDataTable(arrayValues);
      
      var chart = new google.visualization.BarChart(document.getElementById("bar-chart"));
      chart.draw(data, barOptions);

      return;
    }

    function drawGoogleChart() {
      var arrayValues = calculateValueAndGenerateData();
      var data = google.visualization.arrayToDataTable(arrayValues);
      var chart = new google.charts.Line(document.getElementById('line-graph'));

      chart.draw(data, google.charts.Line.convertOptions(options));


      return;
    }

    function printCharts() {
      drawBarChart();
      drawGoogleChart();
    }

    function calculateTotalCostSavings(baseCost, fiveCost) {
      return Math.abs(fiveCost - baseCost).toFixed(2);
    }

    function calculateTotalCostInPercentage(baseCost, fiveYearCost) {
      return `${~~((1 - baseCost / fiveYearCost) * 100)}%`;
    }

    function handleKeyPointBtnClick(e) {
      e.preventDefault();
      e.stopPropagation();

      modal.classList.add("content-modal--open");
    }

    function handleModalClose(e) {
      e.stopPropagation();

      modal.classList.remove("content-modal--open");
    }

    keyPointsBtn.addEventListener("click", handleKeyPointBtnClick);
    modalCloseBtn.addEventListener("click", handleModalClose);
    backdrop.addEventListener("click", handleModalClose);

    var options = {
      width: "100%",
      height: "100%",
      title: "Total Cost Savings in 5 years - Lower is Better",
      tooltip: {
        isHtml: true
      },
      legend: {
        position: "bottom"
      },
      pointSize: 20,
      lineWidth: 5,
      colors: ["#BA9673", "#790977"],
      fontName: "Lato",
      fontSize: 20,
      hAxis: {
        format: "string",
        maxValue: 5,
      },
      vAxis: {
        logScale: "true",
        format: "decimal",
        // Discrete: "true",
        gridlines: {
          color: "#c3c6c8",
        },
        minorGridlines: {
          color: "transparent",
        },
        baselineColor: "#c3c6c8",
        minValue: 0,
        viewWindow: {
          min: 0,
        },
      },
      curveType: "function",
    };

    var barOptions = {
      width: "100%",
      height: "100%",
      titleTextStyle: { color: '#000' },
      fontSize: 20,
      fontName: 'Lato',
      bar: {groupWidth: "95%"},
      legend: { position: "none" },
    }

    google.charts.load('current', { 'packages': ['line'] });
    google.charts.setOnLoadCallback(drawGoogleChart);

    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawBarChart);
  });
})();
