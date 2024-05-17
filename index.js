(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var tcoCalculator = document.querySelector(".tco-calculator");
    var keyPointsBtn = document.querySelector('#key-points');
    var modal = document.querySelector('.content-modal');
    var modalCloseBtn = document.querySelector('.close-button');
    var backdrop = document.querySelector('.content-modal .backdrop');
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
    const PREMIUM_SSD_IOPS_MONTH = 0.00520;

    const AMD_MBPS_MONTH = 0;
    const ULTRA_DISK_MBPS_MONTH = 0.34967;
    const PREMIUM_SSD_MBPS_MONTH = 0.04100;

    const VSAN_AV36P_AVS_COST_MONTH = 1300;
    const VSAN_AV64P_AVS_COST_MONTH = 1300;

    const YEARLY_INFLAMATION_VALUE = (1 + 0.15);

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


    // Calculate values and draw chart again when the window is resized to responsive designs
    ['resize'].forEach(function (evt) {
      window.addEventListener(evt, calculateValuesAndPrint, false);
    });

    // Add, initialize and listen to input events in form
    function initListeners() {
      var tibInput = document.getElementById("tib-input");

      if (tibInput) {
        tibInput.value = userInputValue;

        tibInput.addEventListener("input", function () {
          this.value = getPositiveNumAndLimitMaxDigits(this);

          userInputValue = this.value;
          amdResult = calculateAmdCost();
          ultraDiskResult = calculateUltraDiskCost();
          premiumSsdResults = calculatePremiumSsdCost();
          av36Result = calculateAv36Cost();
          av64Result = calculateAv64Cost();

          const totalCostHtml = document.getElementById('total-cost');
          const totalSavingHtml = document.getElementById('calculation-percentage');



          var ultraDiskTotalCost = calculateTotalCostSavings(amdResult.cumulativeCost.fiveYear, ultraDiskResult.cumulativeCost.fiveYear);
          var premiumSsdTotalCost = calculateTotalCostSavings(amdResult.cumulativeCost.fiveYear, premiumSsdResults.cumulativeCost.fiveYear);
          var av36TotalCost = calculateTotalCostSavings(amdResult.cumulativeCost.fiveYear, av36Result.cumulativeCost.fiveYear);
          var av64TotalCost = calculateTotalCostSavings(amdResult.cumulativeCost.fiveYear, av64Result.cumulativeCost.fiveYear);

          var ultraDiskTotalCostInPercentage = calculateTotalCostInPercentage(amdResult.cumulativeCost.fiveYear, ultraDiskResult.cumulativeCost.fiveYear);
          var premiumSsdTotalCostPercentage = calculateTotalCostInPercentage(amdResult.cumulativeCost.fiveYear, premiumSsdResults.cumulativeCost.fiveYear);
          var av36TotalCostPercentage = calculateTotalCostInPercentage(amdResult.cumulativeCost.fiveYear, av36Result.cumulativeCost.fiveYear);
          var av64TotalCostPercentage = calculateTotalCostInPercentage(amdResult.cumulativeCost.fiveYear, av64Result.cumulativeCost.fiveYear);

          const ultraDiskTotalCostHtml = document.getElementById('ultra-disk-total-cost');
          const ultraDiskTotalSavingHtml = document.getElementById('ultra-disk-total-cost-savings');
          const premiumSsdTotalCostHtml = document.getElementById('premium-ssd-total-cost');
          const premiumSsdTotalSavingHtml = document.getElementById('premium-ssd-total-saving');
          const av36TotalCostHtml = document.getElementById('av36-total-cost');
          const av36TotalSavingHtml = document.getElementById('av36-total-savings');

          const av64TotalCostHtml = document.getElementById('av64-total-cost');
          const av64TotalSavingHtml = document.getElementById('av64-total-savings');

          if (av64TotalCost || av64TotalCostPercentage) {
            totalCostHtml.textContent = numberToDollars(av64TotalCost, 2);
            totalSavingHtml.textContent = av64TotalCostPercentage;
          }

          if (ultraDiskTotalCostHtml) {
            ultraDiskTotalCostHtml.textContent = numberToDollars(ultraDiskTotalCost);
            ultraDiskTotalSavingHtml.textContent = ultraDiskTotalCostInPercentage;
          }

          if (premiumSsdTotalCostHtml) {
            premiumSsdTotalCostHtml.textContent = numberToDollars(premiumSsdTotalCost);
            premiumSsdTotalSavingHtml.textContent = premiumSsdTotalCostPercentage;
          }

          if (av36TotalCostHtml) {
            av36TotalCostHtml.textContent = numberToDollars(av36TotalCost);
            av36TotalSavingHtml.textContent = av36TotalCostPercentage;
          }

          if (av64TotalCostHtml) {
            av64TotalCostHtml.textContent = numberToDollars(av64TotalCost);
            av64TotalSavingHtml.textContent = av64TotalCostPercentage;
          }

          calculateValuesAndPrint();
        });
      }
    }

    // Calculate the Cost of AMD Year One
    function calculateAmdCost() {
      amdCost = userInputValue * AMD_TB_PER_MONTH * MONTHS;

      const amdYearOneCostHtml = document.getElementById('amd-cost-year-one');
      const amdYearTwoCostHtml = document.getElementById('amd-cost-year-two');
      const amdYearThreeCostHtml = document.getElementById('amd-cost-year-three');
      const amdYearFourCostHtml = document.getElementById('amd-cost-year-four');
      const amdYearFiveCostHtml = document.getElementById('amd-cost-year-five');

      amdCostOneYear = amdCost;
      amdCostTwoYear = amdCostOneYear * (1 + 0.15);
      amdCostThreeYear = amdCostTwoYear * (1 + 0.15);
      amdCostFourYear = amdCostThreeYear * (1 + 0.15);
      amdCostFiveYear = amdCostFourYear * (1 + 0.15);


      const amdTcoCost = {
        oneYear: amdCostOneYear,
        twoYear: amdCostTwoYear,
        threeYear: amdCostThreeYear,
        fourYear: amdCostFourYear,
        fiveYear: amdCostFiveYear
      }

      const cumulativeAmdCost = {
        oneYear: amdTcoCost.oneYear,
        twoYear: (amdTcoCost.twoYear + amdTcoCost.oneYear),
        threeYear: (amdTcoCost.threeYear + amdTcoCost.oneYear + amdTcoCost.twoYear),
        fourYear: (amdTcoCost.fourYear + amdTcoCost.oneYear + amdTcoCost.threeYear + amdTcoCost.twoYear),
        fiveYear: (amdTcoCost.fiveYear + amdTcoCost.oneYear + amdTcoCost.fourYear + amdTcoCost.threeYear + amdTcoCost.twoYear)
      }

      if (amdYearOneCostHtml) {
        amdYearOneCostHtml.textContent = numberToDollars(cumulativeAmdCost.oneYear);
        amdYearTwoCostHtml.textContent = numberToDollars(cumulativeAmdCost.twoYear);
        amdYearThreeCostHtml.textContent = numberToDollars(cumulativeAmdCost.threeYear);
        amdYearFourCostHtml.textContent = numberToDollars(cumulativeAmdCost.fourYear);
        amdYearFiveCostHtml.textContent = numberToDollars(cumulativeAmdCost.fiveYear);
      }

      const amdCalculations = {
        tcoCost: amdTcoCost,
        cumulativeCost: cumulativeAmdCost,
      }

      return amdCalculations;
    }

    // Calculate the Provsioned Capacity AMD
    function calculateAmdProvsionedCapacity() {
      amdProvsionedCapacity = userInputValue * AMD_MAX_READ_IOPS;

      const amdCapHtml = document.getElementById('amd-cap');

      if (amdCapHtml) {
        amdCapHtml.textContent = amdProvsionedCapacity;
      }

      return amdProvsionedCapacity;
    }

    // Calculate the Cost of Ultra Disk Year one
    function calculateUltraDiskCost() {
      ultraDiskCost = (userInputValue * ULTRA_DISK_TB_PER_MONTH * MONTHS) + (userInputValue * ULTRA_DISK_MAX_READ_IOPS * ULTRA_DISK_IOPS_MONTH * MONTHS) + ((userInputValue * 2 * ULTRA_DISK_MAX_READ_IOPS * ULTRA_DISK_MBPS_MONTH * MONTHS) / 1024);

      const ultraDiskYearOneCostHtml = document.getElementById('ultra-disk-year-one');
      const ultraDiskYearTwoCostHtml = document.getElementById('ultra-disk-year-two');
      const ultraDiskYearThreeCostHtml = document.getElementById('ultra-disk-year-three');
      const ultraDiskYearFourCostHtml = document.getElementById('ultra-disk-year-four');
      const ultraDiskYearFiveCostHtml = document.getElementById('ultra-disk-year-five');

      ultraDiskOneYearCost = ultraDiskCost;
      ultraDiskTwoYearCost = ultraDiskOneYearCost * (1 + 0.15);
      ultraDiskThreeYearCost = ultraDiskTwoYearCost * (1 + 0.15);
      ultraDiskFourYearCost = ultraDiskThreeYearCost * (1 + 0.15);
      ultraDiskFiveYearCost = ultraDiskFourYearCost * (1 + 0.15);

      const ultraDiskTcoCost = {
        oneYear: ultraDiskOneYearCost,
        twoYear: ultraDiskTwoYearCost,
        threeYear: ultraDiskThreeYearCost,
        fourYear: ultraDiskFourYearCost,
        fiveYear: ultraDiskFiveYearCost
      }

      const cumulativeUltraDiskCost = {
        oneYear: ultraDiskTcoCost.oneYear,
        twoYear: (ultraDiskTcoCost.twoYear + ultraDiskTcoCost.oneYear),
        threeYear: (ultraDiskTcoCost.threeYear + ultraDiskTcoCost.oneYear + ultraDiskTcoCost.twoYear),
        fourYear: (ultraDiskTcoCost.fourYear + ultraDiskTcoCost.oneYear + ultraDiskTcoCost.threeYear + ultraDiskTcoCost.twoYear),
        fiveYear: (ultraDiskTcoCost.fiveYear + ultraDiskTcoCost.oneYear + ultraDiskTcoCost.fourYear + ultraDiskTcoCost.threeYear + ultraDiskTcoCost.twoYear)
      }

      if (ultraDiskYearOneCostHtml) {
        ultraDiskYearOneCostHtml.textContent = numberToDollars(cumulativeUltraDiskCost.oneYear);
        ultraDiskYearTwoCostHtml.textContent = numberToDollars(cumulativeUltraDiskCost.twoYear);
        ultraDiskYearThreeCostHtml.textContent = numberToDollars(cumulativeUltraDiskCost.threeYear);
        ultraDiskYearFourCostHtml.textContent = numberToDollars(cumulativeUltraDiskCost.fourYear);
        ultraDiskYearFiveCostHtml.textContent = numberToDollars(cumulativeUltraDiskCost.fiveYear);
      }


      const ultraDiskCalculations = {
        tcoCost: ultraDiskTcoCost,
        cumulativeCost: cumulativeUltraDiskCost,
      }

      return ultraDiskCalculations;
    }

    // Calculate the Provsioned Capacity Ultra Disk
    function calculateUltraDiskProvsionedCapacity() {
      ultraDiskProvsionedCapacity = userInputValue * ULTRA_DISK_MAX_READ_IOPS;

      const ultraDiskCapHtml = document.getElementById('ultra-disk-cap');

      if (ultraDiskCapHtml) {
        ultraDiskCapHtml.textContent = ultraDiskProvsionedCapacity;
      }

      return ultraDiskProvsionedCapacity;
    }

    // Calculate the Cost of PremiumSsd Year one
    function calculatePremiumSsdCost() {
      premiumSsdCost = (userInputValue * PREMIUM_SSD_TB_PER_MONTH * MONTHS) + (userInputValue * PREMIUM_SSD_READ_IOPS * PREMIUM_SSD_IOPS_MONTH * MONTHS) + ((userInputValue * 2 * PREMIUM_SSD_READ_IOPS * PREMIUM_SSD_MBPS_MONTH * MONTHS) / 1024);

      const premiumSsdYearOneCostHtml = document.getElementById('premium-ssd-year-one');
      const premiumSsdYearTwoCostHtml = document.getElementById('premium-ssd-year-two');
      const premiumSsdYearThreeCostHtml = document.getElementById('premium-ssd-year-three');
      const premiumSsdYearFourCostHtml = document.getElementById('premium-ssd-year-four');
      const premiumSsdYearFiveCostHtml = document.getElementById('premium-ssd-year-five');


      premiumSsdOneYearCost = premiumSsdCost;
      premiumSsdTwoYearCost = premiumSsdOneYearCost * (1 + 0.15);
      premiumSsdThreeYearCost = premiumSsdTwoYearCost * (1 + 0.15);
      premiumSsdFourYearCost = premiumSsdThreeYearCost * (1 + 0.15);
      premiumSsdFiveYearCost = premiumSsdFourYearCost * (1 + 0.15);

      const premiumSsdTcoCost = {
        oneYear: premiumSsdOneYearCost,
        twoYear: premiumSsdTwoYearCost,
        threeYear: premiumSsdThreeYearCost,
        fourYear: premiumSsdFourYearCost,
        fiveYear: premiumSsdFiveYearCost
      }

      const cumulativePremiumSsdCost = {
        oneYear: premiumSsdTcoCost.oneYear,
        twoYear: (premiumSsdTcoCost.twoYear + premiumSsdTcoCost.oneYear),
        threeYear: (premiumSsdTcoCost.threeYear + premiumSsdTcoCost.oneYear + premiumSsdTcoCost.twoYear),
        fourYear: (premiumSsdTcoCost.fourYear + premiumSsdTcoCost.oneYear + premiumSsdTcoCost.threeYear + premiumSsdTcoCost.twoYear),
        fiveYear: (premiumSsdTcoCost.fiveYear + premiumSsdTcoCost.oneYear + premiumSsdTcoCost.fourYear + premiumSsdTcoCost.threeYear + premiumSsdTcoCost.twoYear)
      }

      if (premiumSsdYearOneCostHtml) {
        premiumSsdYearOneCostHtml.textContent = numberToDollars(cumulativePremiumSsdCost.oneYear);
        premiumSsdYearTwoCostHtml.textContent = numberToDollars(cumulativePremiumSsdCost.twoYear);
        premiumSsdYearThreeCostHtml.textContent = numberToDollars(cumulativePremiumSsdCost.threeYear);
        premiumSsdYearFourCostHtml.textContent = numberToDollars(cumulativePremiumSsdCost.fourYear);
        premiumSsdYearFiveCostHtml.textContent = numberToDollars(cumulativePremiumSsdCost.fiveYear);
      }

      const premiumSsdCalculations = {
        tcoCost: premiumSsdTcoCost,
        cumulativeCost: cumulativePremiumSsdCost,
      }

      return premiumSsdCalculations;
    }

    // Calculate the Provsioned Capacity Ultra Disk
    function calculatepremiumSsdProvsionedCapacity() {
      premiumSsdProvsionedCapacity = userInputValue * PREMIUM_SSD_READ_IOPS;
      const premiumSsdCapHtml = document.getElementById('premium-ssd-cap');

      if (premiumSsdCapHtml) {
        premiumSsdCapHtml.textContent = premiumSsdProvsionedCapacity;
      }

      return premiumSsdProvsionedCapacity;
    }

    function calculateAv36Cost() {
      avs36Cost = (userInputValue * VSAN_AV36P * 12) + (12 * VSAN_AV36P_AVS_COST_MONTH);

      const av36YearOneCostHtml = document.getElementById('av36-cost-year-one');
      const av36YearTwoCostHtml = document.getElementById('av36-cost-year-two');
      const av36YearThreeCostHtml = document.getElementById('av36-cost-year-three');
      const av36YearFourCostHtml = document.getElementById('av36-cost-year-four');
      const av36YearFiveCostHtml = document.getElementById('av36-cost-year-five');

      av36OneYearCost = avs36Cost;
      av36TwoYearCost = av36OneYearCost * (1 + 0.15);
      av36ThreeYearCost = av36TwoYearCost * (1 + 0.15);
      av36FourYearCost = av36ThreeYearCost * (1 + 0.15);
      av36FiveYearCost = av36FourYearCost * (1 + 0.15);

      const av36TcoCost = {
        oneYear: av36OneYearCost,
        twoYear: av36TwoYearCost,
        threeYear: av36ThreeYearCost,
        fourYear: av36FourYearCost,
        fiveYear: av36FiveYearCost
      }

      const cumulativeAv36Cost = {
        oneYear: av36TcoCost.oneYear,
        twoYear: (av36TcoCost.twoYear + av36TcoCost.oneYear),
        threeYear: (av36TcoCost.threeYear + av36TcoCost.oneYear + av36TcoCost.twoYear),
        fourYear: (av36TcoCost.fourYear + av36TcoCost.oneYear + av36TcoCost.threeYear + av36TcoCost.twoYear),
        fiveYear: (av36TcoCost.fiveYear + av36TcoCost.oneYear + av36TcoCost.fourYear + av36TcoCost.threeYear + av36TcoCost.twoYear)
      }

      if (av36YearOneCostHtml) {
        av36YearOneCostHtml.textContent = numberToDollars(cumulativeAv36Cost.oneYear);
        av36YearTwoCostHtml.textContent = numberToDollars(cumulativeAv36Cost.twoYear);
        av36YearThreeCostHtml.textContent = numberToDollars(cumulativeAv36Cost.threeYear);
        av36YearFourCostHtml.textContent = numberToDollars(cumulativeAv36Cost.fourYear);
        av36YearFiveCostHtml.textContent = numberToDollars(cumulativeAv36Cost.fiveYear);
      }

      const av36Calculations = {
        tcoCost: av36TcoCost,
        cumulativeCost: cumulativeAv36Cost,
      }

      return av36Calculations;
    }

    function calculateAv64Cost() {
      avs64Cost = (userInputValue * VSAN_AV64P * 12) + (12 * VSAN_AV64P_AVS_COST_MONTH);

      const av64YearOneCostHtml = document.getElementById('av64-cost-year-one');
      const av64YearTwoCostHtml = document.getElementById('av64-cost-year-two');
      const av64YearThreeCostHtml = document.getElementById('av64-cost-year-three');
      const av64YearFourCostHtml = document.getElementById('av64-cost-year-four');
      const av64YearFiveCostHtml = document.getElementById('av64-cost-year-five');


      av64OneYearCost = avs64Cost;
      av64TwoYearCost = av64OneYearCost * (1 + 0.15);
      av64ThreeYearCost = av64TwoYearCost * (1 + 0.15);
      av64FourYearCost = av64ThreeYearCost * (1 + 0.15);
      av64FiveYearCost = av64FourYearCost * (1 + 0.15);

      const av64TcoCost = {
        oneYear: av64OneYearCost,
        twoYear: av64TwoYearCost,
        threeYear: av64ThreeYearCost,
        fourYear: av64FourYearCost,
        fiveYear: av64FiveYearCost
      }

      const cumulativeAv64Cost = {
        oneYear: av64TcoCost.oneYear,
        twoYear: (av64TcoCost.twoYear + av64TcoCost.oneYear),
        threeYear: (av64TcoCost.threeYear + av64TcoCost.oneYear + av64TcoCost.twoYear),
        fourYear: (av64TcoCost.fourYear + av64TcoCost.oneYear + av64TcoCost.threeYear + av64TcoCost.twoYear),
        fiveYear: (av64TcoCost.fiveYear + av64TcoCost.oneYear + av64TcoCost.fourYear + av64TcoCost.threeYear + av64TcoCost.twoYear)
      }

      if (av64YearOneCostHtml) {
        av64YearOneCostHtml.textContent = numberToDollars(cumulativeAv64Cost.oneYear);
        av64YearTwoCostHtml.textContent = numberToDollars(cumulativeAv64Cost.twoYear);
        av64YearThreeCostHtml.textContent = numberToDollars(cumulativeAv64Cost.threeYear);
        av64YearFourCostHtml.textContent = numberToDollars(cumulativeAv64Cost.fourYear);
        av64YearFiveCostHtml.textContent = numberToDollars(cumulativeAv64Cost.fiveYear);
      }

      const av64Calculations = {
        tcoCost: av64TcoCost,
        cumulativeCost: cumulativeAv64Cost,
      }

      return av64Calculations;
    }

    function calculateValuesAndPrint() {
      calculatepremiumSsdProvsionedCapacity()
      calculateUltraDiskProvsionedCapacity();
      calculateAmdProvsionedCapacity();
      calculateAmdCost();
      calculateUltraDiskCost();
      calculatePremiumSsdCost();
      calculateAv36Cost();
      calculateAv64Cost();
      drawChart();
    }

    function calculateTotalCostSavings(baseCost, fiveCost) {
      return Math.abs(fiveCost - baseCost).toFixed(2);;
    }

    function calculateTotalCostInPercentage(baseCost, fiveYearCost) {
      return `${~~((1 - (baseCost / fiveYearCost)) * 100)}%`;
    }

    // Convert numeric to dollars currency format
    function numberToDollars(num, decimalPoint = 3) {
      var roundedNum = num > 0 ? parseFloat(num).toFixed(decimalPoint) : num;
      return (
        "$" + roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      );
    }

    // Convert negative numbers to positive numbers and limit max digits to 12 digits for number inputs
    function getPositiveNumAndLimitMaxDigits(input) {
      if (!!input.value) {
        input.value = parseInt(
          input.value.toLocaleString("fullwide", { useGrouping: false }),
          10
        );
        input.value =
          Math.abs(input.value) >= 0 ? Math.abs(input.value) : null;
        input.value =
          input.value.length > input.maxLength
            ? input.value.slice(0, input.maxLength)
            : input.value;
      }

      return input.value;
    }

    function handleKeyPointBtnClick(e) {
      e.preventDefault();
      e.stopPropagation();

      modal.classList.add('content-modal--open');
    }

    function handleModalClose(e) {
      e.stopPropagation();

      modal.classList.remove('content-modal--open');
    }

    keyPointsBtn.addEventListener('click', handleKeyPointBtnClick);
    modalCloseBtn.addEventListener('click', handleModalClose);
    backdrop.addEventListener('click', handleModalClose);

    initListeners();

    // Responsive 
    // Google Chart 
    // Style Chart

    var options = {
      width: '100%',
      height: '100%',
      title: 'Total Cost Savings in 5 years - Lower is Better',
      tooltip: { isHtml: true },
      legend: { position: 'bottom' },
      pointSize: 20,
      lineWidth: 5,
      colors: ['#BA9673', '#FFCF19', '#790977',],
      fontName: 'Lato',
      chartArea: {
        width: '100%',
        height: '100%',
        top: 84,
        left: 110,
        bottom: 10,
        right: 0,
        backgroundColor: 'transparent',
      },
      fontSize: 20,
      hAxis: {
        format: 'string',
        maxValue: 5,
      },
      vAxis: {
        logScale: 'true',
        format: 'decimal',
        Discrete: 'true',
        gridlines: {
          color: '#c3c6c8',
        },
        minorGridlines: {
          color: 'transparent',
        },
        baselineColor: '#c3c6c8',
        minValue: 0,
        viewWindow: {
          min: 0,
        }
      },
      curveType: 'function',
    };


    google.charts.load('current', { 'packages': ['line'] });
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {

      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Year');
      data.addColumn('number', 'Av36p');
      data.addColumn('number', 'Av64p');
      data.addColumn('number', 'Lightbits');
    
      data.addRows([
        ['YearOne', av36Result.cumulativeCost.oneYear, av64Result.cumulativeCost.oneYear, amdResult.cumulativeCost.oneYear],
        ['YearTwo', av36Result.cumulativeCost.twoYear, av64Result.cumulativeCost.twoYear, amdResult.cumulativeCost.twoYear],
        ['YearThree', av36Result.cumulativeCost.threeYear, av64Result.cumulativeCost.threeYear, amdResult.cumulativeCost.threeYear],
        ['YearFour', av36Result.cumulativeCost.fourYear, av64Result.cumulativeCost.fourYear, amdResult.cumulativeCost.fourYear],
        ['YearFive', av36Result.cumulativeCost.fiveYear, av64Result.cumulativeCost.fiveYear, amdResult.cumulativeCost.fiveYear]
      ]);

      var chart = new google.charts.Line(document.getElementById('line-graph'));

      chart.draw(data, google.charts.Line.convertOptions(options));
    }
  });
})();
