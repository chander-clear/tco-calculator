(function() {
  document.addEventListener("DOMContentLoaded", function() {
    var tcoCalculator = document.querySelector(".tco-calculator");
    var keyPointsBtn = document.querySelector("#key-points");
    var modal = document.querySelector(".content-modal");
    var modalCloseBtn = document.querySelector(".close-button");
    var backdrop = document.querySelector(".content-modal .backdrop");
    var marketoFormPopup = document.querySelector('.popup_form.demo');
    var contactBtn = document.querySelector('.calculator-action-wrapper .contact-btn');
    var calcBtn = document.querySelector('#calc-btn');
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

    const keyPointsUltraDisk = '<h3>Key Assumptions</h3><ul><li><strong>Data Reduction:</strong> 3:1: Achieved through compression, thin provisioning with auto-scaling, space-efficient snapshots, and clones.</li><li><strong>Highly Available w/ 3 replicas:</strong> Ensures high availability of data with three replicas.</li><li><strong>Azure VMs:</strong> Reserved 3 Year, EastUS: Utilizes reserved VM instances for 3 years in the EastUS region.</li><li><strong>Annual Expected Growth: 15%:</strong> Accounts for a projected annual growth rate of 15%.</li><li><strong>LRS Azure:</strong> Utilizes Locally Redundant Storage (LRS) in Azure.</li><li><strong>Ultra Disk Billing:</strong> Billed based on provisioned size, provisioned IOPS, and provisioned throughput, with 20 IOPS per GB and 2KBs per 1 I/O.</li></ul>';

    const keyPointsSsdV2 = '<h3>Key Assumptions</h3><ul><li><strong>Data Reduction:</strong> 3:1: Achieved through compression, thin provisioning with auto-scaling, space-efficient snapshots, and clones.</li><li><strong>Highly Available w/ 2 replicas:</strong> Ensures high availability of data with two replicas.</li><li><strong>Azure VMs:</strong> Reserved 3 Year, EastUS: Utilizes reserved VM instances for 3 years in the EastUS region.</li><li><strong>Annual Expected Growth: 15%:</strong>Accounts for a projected annual growth rate of 15%.</li><li><strong>LRS Azure:</strong> Utilizes Locally Redundant Storage (LRS) in Azure.</li><li><strong>Premium SSD v2 Assumptions:</strong> Assumes 15K IOPS per TB and 2KBs per each I/O for Premium SSD v2.</li></ul>';
    // Convert numeric to dollars currency format
    function numberToDollars(num, decimalPoint = 3) {
      var roundedNum = num > 0 ? parseFloat(num).toFixed(decimalPoint) : num;
      return "$" + roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function formatNmWithComma(num) {
      var roundedNum = num > 0 ? parseFloat(num) : num;
      return roundedNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

    function alterBarChartOptionsOnResize() {
      if (window.innerWidth <= 767) {
        barOptions.width = 700;
        barOptions.chartArea.right = 0;
      } else if (window.innerWidth <= 1024 && window.innerWidth >= 768) {
        barOptions.width = "100%"
        barOptions.chartArea.right = 0;
      } else {
        barOptions.chartArea.right = '100';
        barOptions.width = "100%"
      }

      return true;
    }

    // Calculate values and draw chart again when the window is resized to responsive designs
    ["resize"].forEach(function(evt) {
      window.addEventListener(evt, printCharts, false);
    });


    tibInput.addEventListener('input', function(e) {
      printCharts();
    })

    tibInput.addEventListener('keypress', onlyNumbers);

    window.addEventListener('load', printCharts);

    const buttons = document.querySelectorAll('.input-item.divider-bottom .form-group-input .btn-new');
   
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
        changeModalHtml(keyPointsUltraDisk);
        if (ultraDiskTotalCostInPercentage) {
          totalCostHtml.textContent = numberToDollarsRound(ultraDiskTotalCost);
          totalSavingHtml.textContent = ultraDiskTotalCostInPercentage;
        }

      } else if (tibInput.classList.contains('ssd-v2')) {
        changeModalHtml(keyPointsSsdV2);
        totalCostHtml.textContent = numberToDollarsRound(premiumSsdTotalCost);
        totalSavingHtml.textContent = premiumSsdTotalCostInPercentage;
      }

      if (tibInput.classList.contains('ultra-disk')) {
        if (tibInput.value == '') {
          var resultDataArray = [
            ['Year', 'UltraDisk',{ type: 'string', role: 'tooltip', p: { html: true } }, 'Lightbits', { type: 'string', role: 'tooltip', p: { html: true } }, {type: 'number', role: 'annotation'}],
            ['Year One', 0, createTooltipHtml("grey-tooltip","Year One:"), 0 , createTooltipHtml("purple-tooltip","Year One:"), 0],
            ['Year Two', 0,createTooltipHtml("grey-tooltip","Year Two:"), 0,createTooltipHtml("purple-tooltip","Year Two:"), 0],
            ['Year Three', 0,createTooltipHtml("grey-tooltip","Year Three:"), 0,createTooltipHtml("purple-tooltip","Year Three:"), 0],
            ['Year Four', 0,createTooltipHtml("grey-tooltip","Year Four:"),0,createTooltipHtml("purple-tooltip","Year Four:"), 0],
            ['Year Five', 0,createTooltipHtml("grey-tooltip","Year One:"),0,createTooltipHtml("purple-tooltip","Year One:"), 0]
          ];
          totalCostHtml.textContent = 0;
          totalSavingHtml.textContent = 0;
  
          return resultDataArray;
        } else {
  
          var resultDataArray = [
            ['Year', 'UltraDisk',{ type: 'string', role: 'tooltip', p: { html: true } } , {type: 'number', role: 'annotation'}, 'Lightbits',{ type: 'string', role: 'tooltip', p: { html: true } }, {type: 'number', role: 'annotation'}],
            ['Year One', ultraDiskResult.cumulativeCost.oneYear,createTooltipHtml("grey-tooltip","Year One:", `${numberToDollars(ultraDiskResult.cumulativeCost.oneYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.oneYear, 2)}`), ultraDiskResult.cumulativeCost.oneYear,amdResult.cumulativeCost.oneYear, createTooltipHtml("purple-tooltip","Year One:", `${numberToDollars(ultraDiskResult.cumulativeCost.oneYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.oneYear, 2)}`), amdResult.cumulativeCost.oneYear],
            ['Year Two', ultraDiskResult.cumulativeCost.twoYear,createTooltipHtml("grey-tooltip","Year Two:", `${numberToDollars(ultraDiskResult.cumulativeCost.twoYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.twoYear, 2)}`), ultraDiskResult.cumulativeCost.twoYear ,amdResult.cumulativeCost.twoYear, createTooltipHtml("purple-tooltip","Year Two:", `${numberToDollars(ultraDiskResult.cumulativeCost.twoYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.twoYear, 2)}`), amdResult.cumulativeCost.twoYear],
            ['Year Three', ultraDiskResult.cumulativeCost.threeYear, createTooltipHtml("grey-tooltip","Year Three:", `${numberToDollars(ultraDiskResult.cumulativeCost.threeYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.threeYear, 2)}`),ultraDiskResult.cumulativeCost.threeYear, amdResult.cumulativeCost.threeYear, createTooltipHtml("purple-tooltip","Year Three:", `${numberToDollars(ultraDiskResult.cumulativeCost.threeYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.threeYear, 2)}`), amdResult.cumulativeCost.threeYear],
            ['Year Four', ultraDiskResult.cumulativeCost.fourYear,createTooltipHtml("grey-tooltip","Year Four:", `${numberToDollars(ultraDiskResult.cumulativeCost.fourYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fourYear, 2)}`),ultraDiskResult.cumulativeCost.fourYear ,amdResult.cumulativeCost.fourYear, createTooltipHtml("purple-tooltip","Year Four:", `${numberToDollars(ultraDiskResult.cumulativeCost.fourYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fourYear, 2)}`), amdResult.cumulativeCost.fourYear],
            ['Year Five', ultraDiskResult.cumulativeCost.fiveYear,createTooltipHtml("grey-tooltip","Year Five:", `${numberToDollars(ultraDiskResult.cumulativeCost.fiveYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fiveYear, 2)}`),ultraDiskResult.cumulativeCost.fiveYear,amdResult.cumulativeCost.fiveYear, createTooltipHtml("purple-tooltip","Year Five:", `${numberToDollars(ultraDiskResult.cumulativeCost.fiveYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fiveYear, 2)}`), amdResult.cumulativeCost.fiveYear]
          ];
  
          return resultDataArray;
        }

      } else if (tibInput.classList.contains('ssd-v2')) {
        if (tibInput.value == '') {
          var resultDataArray = [
            ['Year', 'Premium SSD v2',{ type: 'string', role: 'tooltip', p: { html: true } }, {type: 'number', role: 'annotation'}, 'Lightbits',{ type: 'string', role: 'tooltip', p: { html: true } }, {type: 'number', role: 'annotation'}],
            ['Year One', 0, createTooltipHtml("grey-tooltip","Year One:"), 0 , createTooltipHtml("purple-tooltip","Year One:"), 0],
            ['Year Two', 0,createTooltipHtml("grey-tooltip","Year Two:"), 0,createTooltipHtml("purple-tooltip","Year Two:"), 0],
            ['Year Three', 0,createTooltipHtml("grey-tooltip","Year Three:"), 0,createTooltipHtml("purple-tooltip","Year Three:"), 0],
            ['Year Four', 0,createTooltipHtml("grey-tooltip","Year Four:"),0,createTooltipHtml("purple-tooltip","Year Four:"), 0],
            ['Year Five', 0,createTooltipHtml("grey-tooltip","Year One:"),0,createTooltipHtml("purple-tooltip","Year One:"), 0]
          ];
          totalCostHtml.textContent = 0;
          totalSavingHtml.textContent = 0;
  
          return resultDataArray;
        } else {
  
          var resultDataArray = [
            ['Year', 'Premium SSD v2',{ type: 'string', role: 'tooltip', p: { html: true } }, {type: 'number', role: 'annotation'}, 'Lightbits',{ type: 'string', role: 'tooltip', p: { html: true } },  {type: 'number', role: 'annotation'}],
            ['Year One', premiumSsdResults.cumulativeCost.oneYear,createTooltipHtml("grey-tooltip","Year One:", `${numberToDollars(premiumSsdResults.cumulativeCost.oneYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.oneYear, 2)}`),premiumSsdResults.cumulativeCost.oneYear, amdResult.cumulativeCost.oneYear,createTooltipHtml("purple-tooltip","Year One:", `${numberToDollars(premiumSsdResults.cumulativeCost.oneYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.oneYear, 2)}`), amdResult.cumulativeCost.oneYear],
            ['Year Two', premiumSsdResults.cumulativeCost.twoYear,createTooltipHtml("grey-tooltip","Year Two:", `${numberToDollars(premiumSsdResults.cumulativeCost.twoYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.twoYear, 2)}`),premiumSsdResults.cumulativeCost.twoYear,amdResult.cumulativeCost.twoYear, createTooltipHtml("purple-tooltip","Year two:", `${numberToDollars(premiumSsdResults.cumulativeCost.twoYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.twoYear, 2)}`), amdResult.cumulativeCost.twoYear],
            ['Year Three', premiumSsdResults.cumulativeCost.threeYear,createTooltipHtml("grey-tooltip","Year Three:", `${numberToDollars(premiumSsdResults.cumulativeCost.threeYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.threeYear, 2)}`),premiumSsdResults.cumulativeCost.threeYear,amdResult.cumulativeCost.threeYear, createTooltipHtml("purple-tooltip","Year Three:", `${numberToDollars(premiumSsdResults.cumulativeCost.threeYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.threeYear, 2)}`), amdResult.cumulativeCost.threeYear],
            ['Year Four', premiumSsdResults.cumulativeCost.fourYear,createTooltipHtml("grey-tooltip","Year Four:", `${numberToDollars(premiumSsdResults.cumulativeCost.fourYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fourYear, 2)}`),premiumSsdResults.cumulativeCost.fourYear,amdResult.cumulativeCost.fourYear, createTooltipHtml("purple-tooltip","Year Four:", `${numberToDollars(premiumSsdResults.cumulativeCost.fourYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fourYear, 2)}`), amdResult.cumulativeCost.fourYear],
            ['Year Five', premiumSsdResults.cumulativeCost.fiveYear,createTooltipHtml("grey-tooltip","Year Five:", `${numberToDollars(premiumSsdResults.cumulativeCost.fiveYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fiveYear, 2)}`),premiumSsdResults.cumulativeCost.fiveYear,amdResult.cumulativeCost.fiveYear, createTooltipHtml("purple-tooltip","Year Five:", `${numberToDollars(premiumSsdResults.cumulativeCost.fiveYear, 2)}`, `${numberToDollars(amdResult.cumulativeCost.fiveYear, 2)}`), amdResult.cumulativeCost.fiveYear],
          ];
  
          return resultDataArray;
        }
      }
      
    }

    function calculateCapacityAndGenerateData() {
      var tibInput = getPositiveNumAndLimitMaxDigits(document.getElementById("tib-input"));

      amdPrCapacity = calculateAmdProvsionedCapacity();
      ultraDiskPrCapacity = calculateUltraDiskProvsionedCapacity();
      premiumSsdPrCapacity = calculatepremiumSsdProvsionedCapacity();

      if (document.getElementById("tib-input").classList.contains('ultra-disk')) {
        if (tibInput == 0) {
          var resultDataArray = [
            ["Element", "Capacity", { role: "style" }, {type: 'string', role: 'tooltip', p: {html:true}}, {type: 'number', role: 'annotation'} ],
            ["Ultra Disk", 0, "#BA9673", createBarChartTooltipHtml("grey-tooltip", ), 0],
            ["Lightbits", 0, "#790977", createBarChartTooltipHtml("purple-tooltip", ), 0],
          ]

          updateDescriotion('Ultra Disk');
          updateSubTitle('Ultra Disk');
  
          return resultDataArray;
        } else {
          var resultDataArray = [
            ["Element", "Capacity", { role: "style" }, {type: 'string', role: 'tooltip', p: {html:true}}, {type: 'number', role: 'annotation'} ],
            ["Ultra Disk", ultraDiskPrCapacity, "#BA9673", createBarChartTooltipHtml("grey-tooltip", 'Ultra Disk', ultraDiskPrCapacity, amdPrCapacity), ultraDiskPrCapacity],
            ["Lightbits", amdPrCapacity, "#790977", createBarChartTooltipHtml("purple-tooltip", 'Ultra Disk',ultraDiskPrCapacity, amdPrCapacity), amdPrCapacity],
          ]

          updateTag('Ultra Disk');
          let performance = calcPerformance(amdPrCapacity, ultraDiskPrCapacity);
          updateDescriotion('Ultra Disk', performance);
          updateSubTitle('Ultra Disk', performance);
          
          return resultDataArray;
        }

      } else if (document.getElementById("tib-input").classList.contains('ssd-v2')) {
        if (tibInput == 0) {
          var resultDataArray = [
            ["Capacity", "Capacity", { role: "style" }, {type: 'string', role: 'tooltip', p: {html:true}},  {type: 'number', role: 'annotation'} ],
            ["Premium SSD v2", 0, "#BA9673", createBarChartTooltipHtml("grey-tooltip", ), 0],
            ["Lightbits", 0, "#790977", createBarChartTooltipHtml("purple-tooltip", ), 0],
          ]

          updateDescriotion('Ultra Disk');
          updateSubTitle('Premium SSD v2');
          
          return resultDataArray;
        } else {
          var resultDataArray = [
            ["Element", "Capacity", { role: "style" }, {type: 'string', role: 'tooltip', p: {html:true}},  {type: 'number', role: 'annotation'} ],
            ["Premium SSD v2", premiumSsdPrCapacity, "#BA9673", createBarChartTooltipHtml("grey-tooltip",  'SSDv2' ,premiumSsdPrCapacity, amdPrCapacity), premiumSsdPrCapacity],
            ["Lightbits", amdPrCapacity, "#790977", createBarChartTooltipHtml("purple-tooltip", 'SSDv2' ,premiumSsdPrCapacity, amdPrCapacity), amdPrCapacity],
          ]

          updateTag('Premium SSD v2');
          let perNumber = calcPerformance(amdPrCapacity, premiumSsdPrCapacity);
          updateDescriotion('Premium SSD v2', perNumber);
          updateSubTitle('Premium SSD v2', perNumber);
          return resultDataArray;
        }
      }
    }

    function drawBarChart() {
      var arrayValues = calculateCapacityAndGenerateData();
      var data = google.visualization.arrayToDataTable(arrayValues);
      var chart = new google.visualization.ColumnChart(document.getElementById("bar-chart"));
      alterBarChartOptionsOnResize();

      chart.draw(data, barOptions);

      return;
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

    function createTooltipHtml(classNames,year, ultraDiskValue = `$${0}`, lightBitsValue = `$${0}`) {
      return `<div class="statistics__tooltip ${classNames}"><p class="tooltip-heading">${year}</p><p>Save Up To <strong>80% More</strong> with Lightbits </p><p>Ultra Disk Cost: <span>${ultraDiskValue}</span></p><p class="purple-text">Lightbits Cost: <span>${lightBitsValue}</span></p> <span class="bottom-bar"></span></div>`;
    }

    function createBarChartTooltipHtml(classNames, typeString , ultraDiskValue = `0`, lightBitsValue = `0`) {
      return `<div class="statistics__tooltip bar-chart-tooltip ${classNames}"><p class="tooltip-heading purple-text-2">Max IOPS <br> per Provisioned Capacity Comparison</p><p class="grey-text">Total IOPS for ${typeString}: <span>${formatNmWithComma(ultraDiskValue)}</span></p><p class="purple-text">Total IOPS for Lightbits: <span>${formatNmWithComma(lightBitsValue)}</span></p> <span class="bottom-bar"></span></div>`;
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

    function calcPerformance(lightbitsIops, otherIops) {
      return lightbitsIops / otherIops;
    }

    function updateTag(tagString) {
      document.querySelector('.tags-wrapper .tag.tag-grey').textContent = tagString;
    }

    function updateDescriotion(type, performanceNum = 0) {
      document.querySelector('.calculation-result-wrapper .calculation-number.no-padding').innerHTML = `<h5>Lightbits outperforms <strong>${type}</strong> by approximately <span>${performanceNum}</span><span class="text-yellow">x</span></h5>`;
    }

    function updateSubTitle(type, performanceNum = 0) {
      document.querySelector('.bar-chart-subtitle').innerHTML = `<h5>Lightbits outperforms <strong>${type}</strong> by approximately <span>${performanceNum}</span><span class="text-purple">x</span></h5>`;
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

    function handleCalcBtnClick(e) {
      e.preventDefault();

      document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
      });

      history.replaceState([],"",window.location.href.split('#')[0])
    }

    function changeModalHtml(htmlString) {
      document.querySelector('.content-modal .content-inner').innerHTML = htmlString;
    }

    function handleContactUsClick(e) {
      e.preventDefault();
      e.stopPropagation();

      if (marketoFormPopup) {
        marketoFormPopup.classList.add('active');
      }
    }
    
    keyPointsBtn.addEventListener("click", handleKeyPointBtnClick);
    modalCloseBtn.addEventListener("click", handleModalClose);
    backdrop.addEventListener("click", handleModalClose);
    calcBtn.addEventListener('click', handleCalcBtnClick);
    contactBtn.addEventListener('click', handleContactUsClick);

    var options = {
      width: "100%",
      height: "100%",
      tooltip: {
        isHtml: true,
        trigger: 'both',
      },
      legend: {
        position: "none"
      },
      pointSize: 10,
      lineWidth: 2,
      colors: ["#BA9673", "#790977"],
      fontName: "Lato",
      fontSize: 20,
      chartArea: {width: "90%", left: "120", top: 50, bottom: "50"},
      vAxis: {
        format: "decimal",
        title: 'Cost Savings',
        textStyle: {
          color: '#000000',
          fontStyle: 'normal',
          fontName: "Lato",
          fontSize: 20,
        },
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
      hAxis: {
        title: 'Year',
        textStyle: {
          fontSize: 12,
          fontName: "Lato",
          color: '#000000',
          fontStyle: 'normal',
        }
      },
      curveType: "function",
      annotations: {
        textStyle: {
            color: 'black',
            fontSize: 11,
        },
        alwaysOutside: true,
        position: 'top'
      }
    };

    var barOptions = {
      width: "100%",
      height: "100%",
      titleTextStyle: { color: '#000' },
      chartArea: {width: "90%", left: "200", right: '100', top: '100', bottom: "50"},
      fontSize: 20,
      tooltip: {
        isHtml: true,
        trigger: 'both',
      },
      fontName: 'Lato',
      bar: {groupWidth: "35%"},
      legend: { position: "none" },
      vAxis: {
        format: "decimal",
        title: 'Cost Savings',
        textStyle: {
          color: '#000000',
          fontStyle: 'normal',
          fontName: "Lato",
          fontSize: 20,
        },
        gridlines: {
          color: "#EDE7ED",
        },
        viewWindow: {
          min:0
        },
        baselineColor: "#EDE7ED",
        minorGridlines: {
          color: "transparent",
        },
      },
      hAxis: {
        title: 'Year',
        textStyle: {
          fontSize: 12,
          fontName: "Lato",
          color: '#000000',
          fontStyle: 'normal',
        }
      },
      bar: {
        groupWidth: '30%',
      },
      annotations: {
        textStyle: {
            color: 'black',
            fontSize: 11,
        },
        alwaysOutside: true,
        position: 'top'
      }
    }

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawGoogleChart);

    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawBarChart);
  });
})();
