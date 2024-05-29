(function() {
  document.addEventListener("DOMContentLoaded", function() {
    var tcoCalculator = document.querySelector(".tco-calculator");
    var keyPointsBtn = document.querySelector("#key-points");
    var modal = document.querySelector(".content-modal");
    var modalCloseBtn = document.querySelector(".close-button");
    var backdrop = document.querySelector(".content-modal .backdrop");
    var userInputValue = "";

    var amdCost = 0;
    var ultraDiskCost = 0;
    var premiumSsdCost = 0;
    var avs36Cost = 0;
    var avs64Cost = 0;

    const AMD_TB_PER_MONTH = 142.336;
    const ULTRA_DISK_TB_PER_MONTH = 122.59328;
    const PREMIUM_SSD_TB_PER_MONTH = 82.944;
    const VSAN_AV36P = 232.448;
    const VSAN_AV64P = 416.768;

    const AMD_MAX_READ_IOPS = 66000;
    const ULTRA_DISK_MAX_READ_IOPS = 20000;
    const PREMIUM_SSD_READ_IOPS = 15000;

    const AMD_IOPS_MONTH = 0;
    const ULTRA_DISK_IOPS_MONTH = 0.04964;
    const PREMIUM_SSD_IOPS_MONTH = 0.0052;

    const AMD_MBPS_MONTH = 0;
    const ULTRA_DISK_MBPS_MONTH = 0.34967;
    const PREMIUM_SSD_MBPS_MONTH = 0.041;

    const VSAN_AV36P_AVS_COST_MONTH = 1300;
    const VSAN_AV64P_AVS_COST_MONTH = 1300;

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

    var av36OneYearCost = 0;
    var av36TwoYearCost = 0;
    var av36ThreeYearCost = 0;
    var av36FourYearCost = 0;
    var av36FiveYearCost = 0;

    var av64OneYearCost = 0;
    var av64TwoYearCost = 0;
    var av64ThreeYearCost = 0;
    var av64FourYearCost = 0;
    var av64FiveYearCost = 0;

    var amdResult = {};
    var ultraDiskResult = {};
    var premiumSsdResults = {};
    var av36Result = {};
    var av64Result = {};

    var premiumSsdPrCapacity = 0;
    var ultraDiskPrCapacity = 0;


    var totalCostHtmlField = document.getElementById("total-cost");
    var tibInput = document.getElementById("tib-input");

    var options = {
      width: "100%",
      height: "100%",
      tooltip: {
        isHtml: true
      },
      legend: {
        position: "none"
      },
      pointSize: 10,
      lineWidth: 2,
      colors: ["#BA9673", "#FFCF19", "#790977"],
      fontName: "Lato",
      fontSize: 20,
      chartArea: {width: "90%", left: "140", top: 50, bottom: "50"},
      vAxis: {
        format: "decimal",
        gridlines: {
          color: "#EDE7ED",
        },
        viewWindow: {
          min:0
        },
        minorGridlines: {
          color: "transparent",
        },
        baselineColor: "#EDE7ED",
        minValue: 0,
        textStyle: {fontSize: 20}
      },
      curveType: "function",
    };

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawGoogleChart);

    // Convert numeric to dollars currency format
    function numberToDollars(num, decimalPoint = 3) {
      var roundedNum = num > 0 ? parseFloat(num).toFixed(decimalPoint) : num;
      
      return "$" + roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function numberToDollarsRound(num) {
      var rawValue = num > 0 ? parseFloat(num) : num;
        
      var roundedNum = Math.trunc(rawValue);

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
      window.addEventListener(evt, drawGoogleChart, false);
    });

    tibInput.addEventListener('input', function(e) {
      drawGoogleChart();
    })

    tibInput.addEventListener('keypress', onlyNumbers);

    window.addEventListener('load', drawGoogleChart);

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
      amdProvsionedCapacity = userInputValue * AMD_MAX_READ_IOPS;

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

    // Calculate the Provsioned Capacity Ultra Disk
    function calculatepremiumSsdProvsionedCapacity() {
      premiumSsdProvsionedCapacity = userInputValue * PREMIUM_SSD_READ_IOPS;
      const premiumSsdCapHtml = document.getElementById("premium-ssd-cap");

      if (premiumSsdCapHtml) {
        premiumSsdCapHtml.textContent = premiumSsdProvsionedCapacity;
      }

      return premiumSsdProvsionedCapacity;
    }

    function calculateAv36Cost() {
      avs36Cost =
      tibInput.value * VSAN_AV36P * 12 + 12 * VSAN_AV36P_AVS_COST_MONTH;

      const av36YearOneCostHtml = document.getElementById("av36-cost-year-one");
      const av36YearTwoCostHtml = document.getElementById("av36-cost-year-two");
      const av36YearThreeCostHtml = document.getElementById(
        "av36-cost-year-three"
      );
      const av36YearFourCostHtml = document.getElementById(
        "av36-cost-year-four"
      );
      const av36YearFiveCostHtml = document.getElementById(
        "av36-cost-year-five"
      );

      av36OneYearCost = avs36Cost;
      av36TwoYearCost = av36OneYearCost * (YEARLY_INFLAMATION_VALUE);
      av36ThreeYearCost = av36TwoYearCost * (YEARLY_INFLAMATION_VALUE);
      av36FourYearCost = av36ThreeYearCost * (YEARLY_INFLAMATION_VALUE);
      av36FiveYearCost = av36FourYearCost * (YEARLY_INFLAMATION_VALUE);

      const av36TcoCost = {
        oneYear: av36OneYearCost,
        twoYear: av36TwoYearCost,
        threeYear: av36ThreeYearCost,
        fourYear: av36FourYearCost,
        fiveYear: av36FiveYearCost,
      };

      const cumulativeAv36Cost = {
        oneYear: av36TcoCost.oneYear,
        twoYear: av36TcoCost.twoYear + av36TcoCost.oneYear,
        threeYear: av36TcoCost.threeYear + av36TcoCost.oneYear + av36TcoCost.twoYear,
        fourYear: av36TcoCost.fourYear +
          av36TcoCost.oneYear +
          av36TcoCost.threeYear +
          av36TcoCost.twoYear,
        fiveYear: av36TcoCost.fiveYear +
          av36TcoCost.oneYear +
          av36TcoCost.fourYear +
          av36TcoCost.threeYear +
          av36TcoCost.twoYear,
      };

      if (av36YearOneCostHtml) {
        av36YearOneCostHtml.textContent = numberToDollars(
          cumulativeAv36Cost.oneYear
        );
        av36YearTwoCostHtml.textContent = numberToDollars(
          cumulativeAv36Cost.twoYear
        );
        av36YearThreeCostHtml.textContent = numberToDollars(
          cumulativeAv36Cost.threeYear
        );
        av36YearFourCostHtml.textContent = numberToDollars(
          cumulativeAv36Cost.fourYear
        );
        av36YearFiveCostHtml.textContent = numberToDollars(
          cumulativeAv36Cost.fiveYear
        );
      }

      const av36Calculations = {
        tcoCost: av36TcoCost,
        cumulativeCost: cumulativeAv36Cost,
      };

      return av36Calculations;
    }

    function calculateAv64Cost() {
      avs64Cost =
      tibInput.value * VSAN_AV64P * 12 + 12 * VSAN_AV64P_AVS_COST_MONTH;

      const av64YearOneCostHtml = document.getElementById("av64-cost-year-one");
      const av64YearTwoCostHtml = document.getElementById("av64-cost-year-two");
      const av64YearThreeCostHtml = document.getElementById(
        "av64-cost-year-three"
      );
      const av64YearFourCostHtml = document.getElementById(
        "av64-cost-year-four"
      );
      const av64YearFiveCostHtml = document.getElementById(
        "av64-cost-year-five"
      );

      av64OneYearCost = avs64Cost;
      av64TwoYearCost = av64OneYearCost * (YEARLY_INFLAMATION_VALUE);
      av64ThreeYearCost = av64TwoYearCost * (YEARLY_INFLAMATION_VALUE);
      av64FourYearCost = av64ThreeYearCost * (YEARLY_INFLAMATION_VALUE);
      av64FiveYearCost = av64FourYearCost * (YEARLY_INFLAMATION_VALUE);

      const av64TcoCost = {
        oneYear: av64OneYearCost,
        twoYear: av64TwoYearCost,
        threeYear: av64ThreeYearCost,
        fourYear: av64FourYearCost,
        fiveYear: av64FiveYearCost,
      };

      const cumulativeAv64Cost = {
        oneYear: av64TcoCost.oneYear,
        twoYear: av64TcoCost.twoYear + av64TcoCost.oneYear,
        threeYear: av64TcoCost.threeYear + av64TcoCost.oneYear + av64TcoCost.twoYear,
        fourYear: av64TcoCost.fourYear +
          av64TcoCost.oneYear +
          av64TcoCost.threeYear +
          av64TcoCost.twoYear,
        fiveYear: av64TcoCost.fiveYear +
          av64TcoCost.oneYear +
          av64TcoCost.fourYear +
          av64TcoCost.threeYear +
          av64TcoCost.twoYear,
      };

      if (av64YearOneCostHtml) {
        av64YearOneCostHtml.textContent = numberToDollars(
          cumulativeAv64Cost.oneYear
        );
        av64YearTwoCostHtml.textContent = numberToDollars(
          cumulativeAv64Cost.twoYear
        );
        av64YearThreeCostHtml.textContent = numberToDollars(
          cumulativeAv64Cost.threeYear
        );
        av64YearFourCostHtml.textContent = numberToDollars(
          cumulativeAv64Cost.fourYear
        );
        av64YearFiveCostHtml.textContent = numberToDollars(
          cumulativeAv64Cost.fiveYear
        );
      }

      const av64Calculations = {
        tcoCost: av64TcoCost,
        cumulativeCost: cumulativeAv64Cost,
      };

      return av64Calculations;
    }

    function onlyNumbers(event) {
      // Allow backspace key for deleting characters
      if (event.key === "Backspace") {
        return;
      }
    
      // Check if the pressed key is a number (0-9)
      if (!/^\d+$/.test(event.key)) {
        event.preventDefault();
      }
    }

    function calculateValueAndGenerateData() {
      var tibInput = getPositiveNumAndLimitMaxDigits(document.getElementById("tib-input"));
      
      premiumSsdPrCapacity = calculatepremiumSsdProvsionedCapacity();
      ultraDiskPrCapacity = calculateUltraDiskProvsionedCapacity();

      amdResult = calculateAmdCost();
      av36Result = calculateAv36Cost();
      av64Result = calculateAv64Cost();
   
      var av64TotalCost = calculateTotalCostSavings(
        amdResult.cumulativeCost.fiveYear,
        av64Result.cumulativeCost.fiveYear
      );
      
      var av64TotalCostPercentage = calculateTotalCostInPercentage(
        amdResult.cumulativeCost.fiveYear,
        av64Result.cumulativeCost.fiveYear
      );

      const av36TotalCostHtml = document.getElementById("av36-total-cost");
      const av36TotalSavingHtml =
        document.getElementById("av36-total-savings");

      const av64TotalCostHtml = document.getElementById("av64-total-cost");
      const av64TotalSavingHtml =
        document.getElementById("av64-total-savings");

      const totalCostHtml = document.getElementById("total-cost");
      const totalSavingHtml = document.getElementById(
        "calculation-percentage"
      );

      if (av64TotalCostHtml) {
        av64TotalCostHtml.textContent = numberToDollars(av64TotalCost, 2);
        av64TotalSavingHtml.textContent = av64TotalCostPercentage;
        totalCostHtml.textContent = numberToDollarsRound(av64TotalCost);
        totalSavingHtml.textContent = av64TotalCostPercentage;
      }

      if (tibInput == 0) {
        var resultDataArray = [
          ['Year', 'Av36p', { type: 'string', role: 'tooltip', p: { html: true } }, 'Av64p', { type: 'string', role: 'tooltip', p: { html: true } }, 'Lightbits', { type: 'string', role: 'tooltip', p: { html: true } }],
          ['Year One', 0,createTooltipHtml("grey-tooltip","Year One:"), 0,createTooltipHtml("yellow-tooltip","Year One:"), 0 , createTooltipHtml("purple-tooltip","Year One:"),],
          ['Year Two', 0, createTooltipHtml("grey-tooltip","Year Two:"), 0,createTooltipHtml("yellow-tooltip","Year two:"), 0, createTooltipHtml("purple-tooltip","Year two:")],
          ['Year Three', 0,createTooltipHtml("grey-tooltip","Year Three:"), 0,createTooltipHtml("yellow-tooltip","Year three:"), 0, createTooltipHtml("purple-tooltip","Year three:")],
          ['Year Four',0,createTooltipHtml("grey-tooltip","Year Four:"),0,createTooltipHtml("yellow-tooltip","Year Four:"),0, createTooltipHtml("purple-tooltip","Year Four:")],
          ['Year Five',0,createTooltipHtml("grey-tooltip","Year One:"), 0,createTooltipHtml("yellow-tooltip","Year One:"),0, createTooltipHtml("purple-tooltip","Year Five:")]
        ];
        totalCostHtml.textContent = 0;
        totalSavingHtml.textContent = 0;

        return resultDataArray;
      } else {
        var resultDataArray = [
          ['Year', 'Av36p', { type: 'string', role: 'tooltip', p: { html: true } }, 'Av64p', { type: 'string', role: 'tooltip', p: { html: true } }, 'Lightbits', { type: 'string', role: 'tooltip', p: { html: true } }],
          ['Year One', av36Result.cumulativeCost.oneYear, createTooltipHtml("grey-tooltip","Year One:", `${numberToDollars(av36Result.cumulativeCost.oneYear, 2)}`, `${numberToDollars(av64Result.cumulativeCost.oneYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.oneYear, 2)}`), av64Result.cumulativeCost.oneYear, createTooltipHtml("yellow-tooltip","Year One:", `${numberToDollars(av36Result.cumulativeCost.oneYear, 2)}`, `${numberToDollars(av64Result.cumulativeCost.oneYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.oneYear, 2)}`), amdResult.cumulativeCost.oneYear, createTooltipHtml("purple-tooltip","Year One:", `${numberToDollars(av36Result.cumulativeCost.oneYear, 2)}`, `${numberToDollars(av64Result.cumulativeCost.oneYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.oneYear, 2)}`)],
          ['Year Two', av36Result.cumulativeCost.twoYear, createTooltipHtml("grey-tooltip","Year Two:", `${numberToDollars(av36Result.cumulativeCost.twoYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.twoYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.twoYear,2)}`), av64Result.cumulativeCost.twoYear,createTooltipHtml("yellow-tooltip","Year Two:", `${numberToDollars(av36Result.cumulativeCost.twoYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.twoYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.twoYear,2)}`), amdResult.cumulativeCost.twoYear, createTooltipHtml("purple-tooltip","Year Two:", `${numberToDollars(av36Result.cumulativeCost.twoYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.twoYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.twoYear,2)}`)],
          ['Year Three', av36Result.cumulativeCost.threeYear, createTooltipHtml("grey-tooltip","Year Three:", `${numberToDollars(av36Result.cumulativeCost.threeYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.threeYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.threeYear,2)}`), av64Result.cumulativeCost.threeYear,createTooltipHtml("yellow-tooltip","Year Three:", `${numberToDollars(av36Result.cumulativeCost.threeYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.threeYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.threeYear,2)}`), amdResult.cumulativeCost.threeYear, createTooltipHtml("purple-tooltip","Year Three:", `${numberToDollars(av36Result.cumulativeCost.threeYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.threeYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.threeYear,2)}`)],
          ['Year Four', av36Result.cumulativeCost.fourYear, createTooltipHtml("grey-tooltip","Year Four:", `${numberToDollars(av36Result.cumulativeCost.fourYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.fourYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.fourYear,2)}`) ,av64Result.cumulativeCost.fourYear, createTooltipHtml("yellow-tooltip","Year Four:", `${numberToDollars(av36Result.cumulativeCost.fourYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.fourYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.fourYear,2)}`), amdResult.cumulativeCost.fourYear, createTooltipHtml("purple-tooltip","Year Four:", `${numberToDollars(av36Result.cumulativeCost.fourYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.fourYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.fourYear,2)}`)],
          ['Year Five', av36Result.cumulativeCost.fiveYear, createTooltipHtml("grey-tooltip","Year Five:", `${numberToDollars(av36Result.cumulativeCost.fiveYear, 2)}`, `${numberToDollars(av64Result.cumulativeCost.fiveYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.fiveYear,2)}`), av64Result.cumulativeCost.fiveYear,createTooltipHtml("yellow-tooltip","Year Five:", `${numberToDollars(av36Result.cumulativeCost.fiveYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.fiveYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.fiveYear,2)}`), amdResult.cumulativeCost.fiveYear, createTooltipHtml("purple-tooltip","Year Five:", `${numberToDollars(av36Result.cumulativeCost.fiveYear,2)}`, `${numberToDollars(av64Result.cumulativeCost.fiveYear,2)}`, `${numberToDollars(amdResult.cumulativeCost.fiveYear,2)}`)]
        ];

        return resultDataArray;
      }
    }

    function drawGoogleChart() {
      var arrayValues = calculateValueAndGenerateData();
      var data = google.visualization.arrayToDataTable(arrayValues);
      var container = document.getElementById('line-graph');
      var chart = new google.visualization.LineChart(container);
      
      alterChartOptionsOnResize();
      
      chart.draw(data, options);

      return;
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

    function createTooltipHtml(classNames,year, v32Value = `$${0}`, v64Value = `$${0}`, lightBitsValue = `$${0}`) {
      return `<div class="statistics__tooltip ${classNames}"><p class="tooltip-heading">${year}</p><p>Save Up To <strong>80% More</strong> with Lightbits </p><p>vSAN -AV36P Cost: <span>${v32Value}</span></p><p>vSAN -AV64P Cost: <span>${v64Value}</span></p><p class="purple-text">Lightbits Cost: <span>${lightBitsValue}</span></p> <span class="bottom-bar"></span></div>`;
    }

    // Set chart options values based on window size 
    function alterChartOptionsOnResize() {
      if (window.innerWidth <= 767) {
        options.width = 700;
        options.chartArea.top = 100;
      } else  {
        options.width = "100%";
        options.chartArea.top = 50;
      }

      return true;
    }

    keyPointsBtn.addEventListener("click", handleKeyPointBtnClick);
    modalCloseBtn.addEventListener("click", handleModalClose);
    backdrop.addEventListener("click", handleModalClose);
  });
})();