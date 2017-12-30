/* 
A bit rough code, I know. But it's getting better! (Well, it's not.)
And, if you use anything. Please credit me with my Martin Johansson and a link to http://cageside.se and/or http://cityinc.se
*/
    
var app = angular.module('gameApp', ['ui.router', 'ngStorage']);
    
app.config(function($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise("/");
    //
    // Now set up the states
    $stateProvider
    .state('build', {
        url: "/",
        templateUrl: "build.html",
    })
    .state('city', {
        url: "/city",
        templateUrl: "city.html",
    })
    .state('upgrade', {
        url: "/upgrade",
        templateUrl: "upgrade.html",
    })
    .state('politicians', {
        url: "/politicians",
        templateUrl: "politicians.html",
    })
    .state('about', {
        url: "/about",
        templateUrl: "about.html",
    })
    .state('goals', {
        url: "/goals",
        templateUrl: "goals.html",
    })
    .state('citizens', {
        url: "/citizens",
        templateUrl: "citizens.html",
    })
    .state('guide', {
        url: "/guide",
        templateUrl: "guide.html",
    })
    .state('stats', {
        url: "/stats",
        templateUrl: "stats.html",
    })
    .state('settings', {
        url: "/settings",
        templateUrl: "settings.html",
    })
    .state('numberguide', {
        url: "/numberguide",
        templateUrl: "numberguide.html",
    })
    .state('chat', {
        url: "/chat",
        templateUrl: "chat.html",
    });
});

// För Google Analytics
app.run(['$rootScope', '$location', '$window', function($rootScope, $location, $window){
    $rootScope
    .$on('$stateChangeSuccess',
        function(event){
            if (!$window.ga)
                return;
            $window.ga('send', 'pageview', { page: $location.path() });
            $window.scrollTo(0,0);
            $window.fireworks.setCanvasSize();
    });
}]);
    

app.controller('gameController', ['$scope', '$interval', '$timeout', '$localStorage', '$window', '$http', '$filter', '$location', '$state', function ($scope, $interval, $timeout, $localStorage, $window, $http, $filter, $location, $state) {
    $scope.Math = window.Math;
    
    $scope.version = "1.1";
    $scope.curMoney = 0; // Number of dollars you have right now
    
    $scope.sessionMoney = 0;
    
    $scope.availableCitizens = 0;

    $scope.curCitizens = 0;
    $scope.citizenHelp = 2; // 2% help as a default, as soon as you have a citizen that is.
    $scope.citizenExtraHelp = {
        useExtraHelp: false,
        amount: 0,
        useSpeedBoost: false,
        speedBoost: 0,
        allowRestart: false,
        extraCitizenGainRate: 1,
        citizenCurrentMax: 0
    };
      
    $scope.coins = {
        value: 0,
        multiplier: 1
    };
      
    $scope.offlineCash = 0;
      
    $scope.politicsIdeology = {
        value: 0,
        sliderValue: 0,
        valueSet: false
    };
      
    $scope.politicsBoost = {
        transportMultiplier: 1,
        civilianMultiplier: 1,
        businessMultiplier: 1,
        upcomingTransportMultiplier: 1,
        upcomingCivilianMultiplier: 1,
        upcomingBusinessMultiplier: 1,
        allowPoliticsBoost: false
    };
      
    $scope.happiness = {
        value: 1,
        multiplier: 0,
        smile: "neutral.png",
        text: "Your citizens are currently neutral towards your city planning, giving you no extra bonuses.",
        sliderValue: 0,
        sliderDecrease: 0.0025,
        ratingPercentage: 10
    };
      
    $scope.citizenNeeds = {
        transport: 0,
        civilian: 0,
        business: 0,
        transportSlider: 0,
        civilianSlider: 0,
        businessSlider: 0,
        checksum: 0
    };
      
    $scope.stats = {
        totalMoney: 0,
        offlineMoney: 0,
        resets: 0,
        totalCitizens: 0,
        maxGainedCitizens: 0,
        sacrifizedCitizens: 0,
        citizenUpgrades: 0,
        onlineTime: 0,
        tilesBought: 0,
        tilesTotalMoney: 0,
        goalsHit: 0,
        goalHighest: 0,
        tilesPlaced: 0,
        upgradesBought: 0,
        upgradesTotalMoney: 0,
        buildingsBought: 0,
        buildingsTotalMoney: 0,
        politiciansHired: 0,
        politiciansTotalMoney: 0,
        debatesWin: 0,
        debatesLoss: 0,
        debatesProfit: 0,
        dateStarted: '',
        totalCoins: 0,
        spentCoins: 0,
        coinUpgradesBought: 0,
        timeSinceLastReset: 0,
        highestRevenue: 0,
        lastRevenueRecord: 0,
        lastRevenue: 0,
        newRevenueRecord: false,
        choicesMade: 0,
        spentOnChoices: 0,
        highestRoads: 0,
        highestApartments: 0,
        highestOffices: 0,
        highestTransport: 0,
        highestEducation: 0,
        highestTaxis: 0,
        highestDocks: 0,
        highestHealth: 0,
        highestShopping: 0,
        highestBanks: 0
    };
      
    $scope.completedGames = 0;
    $scope.completeStats = [];
    $scope.advancedStrategy = {
        level: 1,
        availableObjects: [],
        chosenObjects: []
    };
      
    $scope.settings = {
        showFireworks: true,
        showUpgrades: false,
        maximizeLayout: false,
        cityLayout: 0,
        level: 0,
        generatedCityLayout: false,
        scientificNumbers: false,
        showChat: false,
        showRevenueCycle: false,
        gameCompleted: false,
        upgradeQuantity: 10,
        improvementQuantity: 10,
        coinQuantity: 10,
        goalsAll: 301,
        editCityName: false,
        cityName: "Stockholm",
        allowEditCityName: false,
        OCDMode: true,
        autoBuyPoliticians: false,
        goToBuildPageAfterReset: true,
        renderFireworks: true
    };
      
    $scope.notificationController = [];
    $scope.inIframe = false;
    $scope.adblock = false;
    $scope.allowSave = true;
      
    $scope.changePoliticsIdeology = function(val) {
        $scope.politicsIdeology.sliderValue = parseFloat(val);
    };
      
    $scope.setPoliticsIdeology = function() {
        $scope.politicsIdeology.valueSet = true;
        $scope.politicsIdeology.value = $scope.politicsIdeology.sliderValue;
    };
      
    $scope.calculateRevenue = function(key, build, getSeconds, offline, displayOnly) {
        getSeconds = (getSeconds == null) ? getSeconds = false : getSeconds = getSeconds;
        var revenue = 0;
        var happinessRevenue;
        
        if(offline) {
          happinessRevenue = 1;
        }
        else {
          happinessRevenue = $scope.happiness.value > 1 ? $scope.happiness.value + $scope.happiness.multiplier : $scope.happiness.value;
        }
        
        if(displayOnly) {
          revenue = (((($scope.buildMeta[key].revenue * 1) * build.multiplier) * ($scope.curCitizens * ($scope.citizenExtraHelp.amount + $scope.citizenHelp) / 100 + 1) * ($scope.politicsIdeology.value + 1)) * happinessRevenue);
        }
        else {
          revenue = (((($scope.buildMeta[key].revenue * build.num) * build.multiplier) * ($scope.curCitizens * ($scope.citizenExtraHelp.amount + $scope.citizenHelp) / 100 + 1) * ($scope.politicsIdeology.value + 1)) * happinessRevenue);
        }
        
        if($scope.calculateBuildSpeed(key, build) < 0.25 && build.auto && !getSeconds) {
          revenue = revenue * (0.25 / $scope.calculateBuildSpeed(key, build));
        }
        
        if($scope.buildMeta[key].happyCategory === 1) {
          revenue *= $scope.politicsBoost.transportMultiplier;
        }
        else if($scope.buildMeta[key].happyCategory === 2) {
          revenue *= $scope.politicsBoost.civilianMultiplier;
        }
        else if($scope.buildMeta[key].happyCategory === 3) {
          revenue *= $scope.politicsBoost.businessMultiplier;
        }
        
        // If you want revenue per seconds
        if(getSeconds) {
          revenue = revenue / $scope.calculateBuildSpeed(key, build);
          /*if($scope.calculateBuildSpeed(key, build) >= 0.25 && $scope.calculateBuildSpeed(key, build) < 1) {
            revenue *= (1 / $scope.calculateBuildSpeed(key, build));
          }*/
        }

        return revenue;
    };
      
    $scope.calculateBuildSpeed = function(key, build) {
        
        var timer = (buildMeta[key].timeToBuild/build.speedMultiplier);
        if($scope.citizenExtraHelp.useSpeedBoost) {
           timer = timer / (1 + $scope.citizenExtraHelp.speedBoost);
        }
        
        return timer;
    };
      
    calculateCitizens = function() {
        var citizens = 0;
        if($scope.curCitizens >= 1e21) {
          citizens = Math.floor((150*Math.sqrt($scope.sessionMoney/1e+15) * (($scope.politicsIdeology.value * -1) + 1)) * $scope.citizenExtraHelp.extraCitizenGainRate);// Math.floor(150*Math.sqrt($scope.sessionMoney/1e+15) * Math.pow(0.95, (-6 + ( Math.log($scope.curCitizens) / Math.log(1000) ) )))
          
        }
        else {
          citizens = Math.floor((150*Math.sqrt($scope.sessionMoney/1e+15) * (($scope.politicsIdeology.value * -1) + 1)) * $scope.citizenExtraHelp.extraCitizenGainRate);
        }
        return citizens;
    };
      
    updateCounter = function () {
        
        angular.forEach($scope.build, function(value, key) {
          if(value.curPercent >= 100 && value.inProgress) {
            var theRevenue = $scope.calculateRevenue(key, value);
            
            $scope.curMoney += theRevenue;
            $scope.sessionMoney += theRevenue;
            
            if($scope.calculateBuildSpeed(key, value) < 0.1 && value.auto) {
              value.curPercent = 100;
            }
            else {
              value.curPercent = 0;
            }
            
            if(!value.auto) {
              value.inProgress = false;
            }
          }
          else {
            if(value.inProgress) {
              value.curPercent += (100 / $scope.calculateBuildSpeed(key, value)) / 4;
            }
          }
        });
        
        if($scope.happiness.sliderValue > 0) {
          var newVal = $scope.happiness.sliderDecrease / 4;
          $scope.happiness.sliderValue -= newVal;
          
          if($scope.happiness.sliderValue < 0) {
            $scope.happiness.sliderValue = 0;
          }
        }
        
        //$interval.cancel(countInterval);
        //startCounter();
    };
      
    var countInterval = null;

    startCounter = function(index) {
          //countInterval = $interval(function () { updateCounter() }, 100);
          $interval(function () { updateCounter() }, 250);
    };
      
    startCounter();
      
    $scope.startBuild = function(building) {
        if(building.num > 0) {
          building.inProgress = true;
        }
    };
    
    $scope.notificationText = "";
    $scope.notificationIcon = "fa-users";
    $scope.showNotification = false;
    var notificationInterval = null;
      
    $scope.resetNotification = function() {
        $scope.showNotification = false;
        $interval.cancel(notificationInterval);
    };
      
    $scope.calculateBuildingCost = function(building, index, amount) {
        return (($scope.buildMeta[index].cost * Math.pow($scope.buildMeta[index].increment, building.num)) * (1 - Math.pow($scope.buildMeta[index].increment, amount)) / (1 - $scope.buildMeta[index].increment));
    };
      
    $scope.calculateMaxAmount = function(building, index, ocd) {
        var totalBuyCost = ($scope.buildMeta[index].cost * (1 - Math.pow($scope.buildMeta[index].increment, building.num))) / (1 - $scope.buildMeta[index].increment);
        var totalSum = Math.floor(Math.log( 1 + ($scope.buildMeta[index].increment - 1) * ($scope.curMoney + totalBuyCost) / $scope.buildMeta[index].cost ) / Math.log($scope.buildMeta[index].increment));
        
        if(ocd) {
          return totalSum;
        }
        else {
          return totalSum - building.num;
        }
        
    };
      
    calculateRevenuePercentage = function() {
        // Recalculates all the revenues
        angular.forEach($scope.build, function(value, key) {
          if(value.auto) {
            value.curRevenue = ($scope.calculateRevenue(key, value, true) / $scope.totalMoneyPerSecond() ) * 100;  
          }
        });
    };
      
    $scope.buyBuilding = function (building, index, amount, event) {
          if( $scope.curMoney >= $scope.calculateBuildingCost(building, index, amount) ) {
              
              // If amount === 0, then it's "buy max"
              if(amount === 0) {
                
                // Do a 100th increment
                if($scope.curMoney > $scope.calculateBuildingCost(building, index, 100) && $scope.settings.OCDMode) {
                  while($scope.curMoney > $scope.calculateBuildingCost(building, index, 1) ) {
                    if(building.num % (Math.ceil(building.num/100)*100) !== 0 || $scope.curMoney > $scope.calculateBuildingCost(building, index, 99.9)) {
                      doPurchase(building, index, 1);
                    }
                    else {
                      break;
                    }
                  }
                }
                // Do a 10th increment
                else if($scope.curMoney > $scope.calculateBuildingCost(building, index, 10)) {
                  while($scope.curMoney > $scope.calculateBuildingCost(building, index, 1) ) {
                    if(building.num % (Math.ceil(building.num/10)*10) !== 0 || $scope.curMoney > $scope.calculateBuildingCost(building, index, 9.9)) {
                      doPurchase(building, index, 1);
                    }
                    else {
                      break;
                    }
                  }
                }
                // Do a 1 increment
                else if($scope.curMoney > $scope.calculateBuildingCost(building, index, 1)) {
                  while($scope.curMoney > $scope.calculateBuildingCost(building, index, 1) ) {
                      doPurchase(building, index, 1);
                  }
                }
                
              }
              // Otherwise, just buy the amount requested.
              else {
                doPurchase(building, index, amount);
              }
              
              
              afterBuildingPurchase(building, index, event);
          }
    };
      
    doPurchase = function (building, index, amount) {
          $scope.curMoney -= (($scope.buildMeta[index].cost * Math.pow($scope.buildMeta[index].increment, building.num)) * (1 - Math.pow($scope.buildMeta[index].increment, amount)) / (1 - $scope.buildMeta[index].increment));
          $scope.stats.buildingsTotalMoney += (($scope.buildMeta[index].cost * Math.pow($scope.buildMeta[index].increment, building.num)) * (1 - Math.pow($scope.buildMeta[index].increment, amount)) / (1 - $scope.buildMeta[index].increment));
          building.num += amount;
          $scope.stats.buildingsBought += amount;
          $scope.coins.value += amount * $scope.coins.multiplier;
          $scope.stats.totalCoins += amount;
    };
      
    afterBuildingPurchase = function(building, index, event) {
          if(building.auto) {
            building.inProgress = true;
          }
          
          if($scope.citizenExtraHelp.useExtraHelp) {
            $scope.citizenExtraHelp.amount = Math.round(($scope.totalBuildings() / 4000) * 100) / 100;
          }
          
          if($scope.citizenExtraHelp.useSpeedBoost) {
            $scope.citizenExtraHelp.speedBoost = Math.round(($scope.build[0].num / 1000) * 20) / 100;
          }

          // Goals
          $scope.checkGoal(building, index, event);

          calculateMaxWager();
          
          $scope.save();
    };
      
    $scope.checkGoal = function(building, index, event) {
             
        if(building.num >= $scope.stats['highest' + $scope.buildMeta[index].shortName]) {
          $scope.stats['highest' + $scope.buildMeta[index].shortName] = building.num;
        }
        
        angular.forEach($scope.goalsMeta, function(value, key) {
          if(value.buildingRef == $scope.buildMeta[index].id) {
          
            if(building.num >= value.goal) {
              
              if(!$scope.isInArray($scope.goals, value.id)) {
              
                if(value.multiplier !== 0) {
                  building.multiplier *= value.multiplier;
                }
                else if(value.speed !== 0) {
                  building.speedMultiplier *= value.speed;
                }
                else {
                  if(value.otherGoal.multiplier !== 0) {
                    $scope.build[value.otherGoal.ref].multiplier *= value.otherGoal.multiplier;
                  }
                }
                
                $scope.goals.push({
                    refId: value.id,
                    owned: true
                });
                
                if($scope.goalsMeta[key + 1].buildingRef == $scope.buildMeta[index].id) {
                  building.nextGoal = key + 1;
                }
                else {
                  building.nextGoal = -1;
                }

                $scope.playFireworks(event);
                $scope.stats.goalsHit++;
                $scope.notificationText = value.desc;
                $scope.notificationIcon = $scope.buildMeta[index].icon;
                $scope.showNotification = true;
                notificationInterval = $interval(function () { $scope.resetNotification() }, 10000, 1);
                //console.log($scope.goals);
              }
            }
          }
          else if(value.buildingRef == 10) {
            // Kontrollera om "all goal" genomförts
            if(!$scope.isInArray($scope.goals, value.id)) {
              
              var checksum = 0;
              
              angular.forEach($scope.build, function(value2, key2) {
                if(value2.num >= value.goal) {
                  checksum++;
                }
              });
              
              // Om man träffat rätt på alla 10, win!
              if(checksum == 10) {
                
                $scope.goals.push({
                    refId: value.id,
                    owned: true
                });
                
                if(value.multiplier !== 0) {
                  angular.forEach($scope.build, function(value3, key3) {
                    value3.multiplier *= value.multiplier;
                  });
                }
                else if(value.speed !== 0) {
                  angular.forEach($scope.build, function(value3, key3) {
                    value3.speedMultiplier *= value.speed;
                  });
                }
                
                if(!$scope.over3000()) {
                  if($scope.goalsMeta[key + 1].buildingRef == 10) {
                    $scope.settings.goalsAll = key + 1;
                  }
                  else {
                    $scope.settings.goalsAll = -1;
                  }
                }
                
                $scope.playFireworks(event);                
                $scope.stats.goalsHit++;
                $scope.notificationText = value.desc;
                $scope.notificationIcon = "fa-users";
                $scope.showNotification = true;
                notificationInterval = $interval(function () { $scope.resetNotification() }, 10000, 1);
              }
            }
          }
          //console.log(key + ': ' + value.goal);
        });
        
        if($scope.goals.length > $scope.stats.goalHighest) {
          $scope.stats.goalHighest = $scope.goals.length;
          $window.ga('send', 'event', 'Goal', 'highestGoal', $scope.stats.goalHighest + 'theGoal', $scope.stats.goalHighest);
        }
        
        calculateRevenuePercentage();
        revenueRecordCheck();
        calculateCityLevel();
        $scope.generateAdvancedStrategy();
        $scope.save();
    };
      
    $scope.hirePolitician = function (politician, index) {
        if($scope.curMoney >= $scope.buildMeta[index].politicianCost || $scope.settings.autoBuyPoliticians) {
          if($scope.settings.autoBuyPoliticians == false) {
            $scope.curMoney -= $scope.buildMeta[index].politicianCost;
            $scope.stats.politiciansTotalMoney += $scope.buildMeta[index].politicianCost;
          } 
          $scope.stats.politiciansHired++;
          
          politician.auto = true;
          if(politician.num > 0) {
            politician.inProgress = true;
          }
          calculateMaxWager();
          calculateRevenuePercentage();
          revenueRecordCheck();
          $scope.save();
        }
    };
      
    $scope.getAllPoliticians = function() {
        angular.forEach($scope.build, function(value, key) {
          if(!value.auto) {
            $scope.hirePolitician(value, key);
          }
        });
    };
        
    //Because .subint does not exist.
    Number.prototype.subint = function(from, to) {
          return +((this+'').substr(from, to));
    };

    $scope.getUpgrade = function(upgrade, freeUpgrade) {
        if($scope.curMoney >= upgrade.cost || freeUpgrade) {
          if(!freeUpgrade) {
            $scope.curMoney -= upgrade.cost;
            $scope.stats.upgradesTotalMoney += upgrade.cost;
            $scope.stats.upgradesBought++;
          }
          
          // Om buildingRef == 999, betyder det att det är en citizen-uppgradering.
          if(upgrade.buildingRef == 999) {
            $scope.citizenHelp += upgrade.multiplier;
          }
          else if (upgrade.buildingRef == 666) { // Och om det är 666, ska alla få uppgraderingen
            angular.forEach($scope.build, function(value, key) {
              value.multiplier *= upgrade.multiplier;
            });
          }
          else if(upgrade.buildingRef.subint(0,3) == 777) {
            //console.log(upgrade.buildingRef.subint(0,3));
            
            if(upgrade.buildingRef.subint(3,3) == 666) {
              $scope.citizenExtraHelp.useSpeedBoost = true;
              $scope.citizenExtraHelp.speedBoost = Math.round(($scope.build[0].num / 1000) * 20) / 100;
            }
            else {
              $scope.build[upgrade.buildingRef.subint(3,3)].speedMultiplier *= upgrade.multiplier;
            }
          }
          else {
            $scope.build[upgrade.buildingRef].multiplier *= upgrade.multiplier;
          }
          
          $scope.upgrades.push({
              refId: upgrade.id,
              owned: true
          });
          calculateMaxWager();
          calculateRevenuePercentage();
          revenueRecordCheck();
          $scope.save();
        }
    };
      
    $scope.getAllUpgrades = function() {
        var tempArray = angular.copy($scope.upgradesMeta);
        tempArray = $filter('orderBy')(tempArray, "cost");
        angular.forEach(tempArray, function(value, key) {
          if(value.cat !== 0 && !$scope.isInArray($scope.upgrades, value.id)) {
            $scope.getUpgrade(value);
          }
        });
    };
      
    $scope.getTile = function(tile, freeTile) {
        if($scope.curMoney >= tile.cost || freeTile) {
          if(!freeTile) {
            $scope.curMoney -= tile.cost;
            $scope.stats.upgradesTotalMoney += tile.cost;
            $scope.stats.upgradesBought++;
          }
          
          if(tile.upgradeRef == 1) {
            $scope.happiness.multiplier += tile.multiplier;
          }
          else if (tile.upgradeRef == 2) {
            angular.forEach($scope.build, function(value, key) {
              value.multiplier *= tile.multiplier;
            });
          }
          else if(tile.upgradeRef == 3) {
            $scope.happiness.sliderDecrease = $scope.happiness.sliderDecrease / tile.multiplier;
          }
          
          $scope.tiles.push({
              refId: tile.id,
          });
          
          calculateMaxWager();
          calculateRevenuePercentage();
          revenueRecordCheck();
          $scope.save();
        }
    };
      
    $scope.getAllTiles = function() {
        var tempArray = angular.copy($scope.tilesMeta);
        tempArray = $filter('orderBy')(tempArray, "cost");
        angular.forEach(tempArray, function(value, key) {
          if(value.cat !== 0 && !$scope.isInArray($scope.tiles, value.id)) {
            $scope.getTile(value);
          }
        });
    };
      
    $scope.checkCategory = function(category) {
        var string = "";
        if(category == 1) {
          string = "Transport";
        }
        else if(category == 2) {
          string = "Civilian";
        }
        else if(category == 3) {
          string = "Business";
        }
        else if(category == 4) {
            string = "Banks";
          }
        else {
          string = "None";
        }
        
        return string;
    };
        
      
    $scope.getCitizenUpgrade = function(citizen, index) {
        if($scope.curCitizens >= citizen.cost) {
          $scope.curCitizens -= citizen.cost;
          $scope.stats.sacrifizedCitizens += citizen.cost;
          $scope.stats.citizenUpgrades++;
          
          // Om det gäller samtliga byggnader
          if(citizen.reference === 1) {
            angular.forEach($scope.build, function(value, key) {
              value.multiplier *= citizen.data.multiplier;
            });
          }
          // Eller om man vill höja effektiviteten för citizens
          else if(citizen.reference === 2) {
            $scope.citizenHelp += citizen.data.citizenMultiplier;
          }
          else if(citizen.reference === 3) {
            angular.forEach($scope.build, function(value, key) {
              value.multiplier *= citizen.data.multiplier;
              value.speedMultiplier *= citizen.data.reduceSpeed;
            });
          }
          else if (citizen.reference === 4) {
            $scope.citizenExtraHelp.useExtraHelp = true;
            $scope.citizenExtraHelp.amount = Math.round(($scope.totalBuildings() / 4000) * 100) / 100;
          }
          else if(citizen.reference === 5) {
            $scope.politicsBoost.allowPoliticsBoost = true;
          }
          else if(citizen.reference === 6) {
            $scope.citizenExtraHelp.allowRestart = true; 
          }
          
          $scope.citizensUpgrades.push({
              refId: citizen.id,
              owned: true
          });
          calculateMaxWager();
          calculateRevenuePercentage();
          revenueRecordCheck();
          $scope.save();
        }
    };
      
    $scope.getCoinUpgrade = function(coinUpgrade) {
        if($scope.coins.value >= coinUpgrade.cost) {
          $scope.coins.value -= coinUpgrade.cost;
          $scope.stats.spentCoins += coinUpgrade.cost;
          $scope.stats.coinUpgradesBought++;
          
          if(coinUpgrade.type === 0) { // Add to the happiness slider
            $scope.happiness.sliderValue += coinUpgrade.multiplier;
            if($scope.happiness.sliderValue > 100) {
              $scope.happiness.sliderValue = 100;
            }
          }
          else if(coinUpgrade.type === 1) { // Add to the citizen effectiveness
            $scope.citizenHelp += coinUpgrade.multiplier;
          }
          else if(coinUpgrade.type === 2) { // Add profit multiplier to all buildings
            angular.forEach($scope.build, function(value, key) {
              value.multiplier *= coinUpgrade.multiplier;
            });
          }
          else if(coinUpgrade.type === 3) { // Add the happiness multiplier
            $scope.happiness.multiplier += coinUpgrade.multiplier;
          }
          else if (coinUpgrade.type === 4) { // Buy next available upgrade
            var upgradeHit = false;
            var i = 0;
            while(!upgradeHit) {
              if(!$scope.isInArray($scope.upgrades, $scope.upgradesMeta[i].id)) {
                $scope.getUpgrade($scope.upgradesMeta[i], true);
                upgradeHit = true;
              }
              i++;
              if(i > $scope.upgradesMeta.length) {
                console.log("Something went fucky.");
                upgradeHit = true;
              }
            }
          }
          else if (coinUpgrade.type === 5) { // Double/tripple your current money
            $scope.curMoney = $scope.curMoney * coinUpgrade.multiplier;
          }
          else if (coinUpgrade.type === 6) { // Get all upcoming citizens
            $scope.curCitizens += $scope.availableCitizens;
          }
          else if (coinUpgrade.type === 7) { // Buy next improvement
            var improvementHit = false;
            var i = 0;
            
            while(!improvementHit) {
              if(!$scope.isInArray($scope.tiles, $scope.tilesMeta[i].id)) {
                $scope.getTile($scope.tilesMeta[i], true);
                improvementHit = true;
              }
              i++;
              if(i > $scope.tilesMeta.length) {
                console.log("Something went fucky.");
                improvementHit = true;
              }
            }
            
          }
          else if(coinUpgrade.type === 8) {
            $scope.build[coinUpgrade.buildingRef].num += coinUpgrade.multiplier;
            $scope.checkGoal($scope.build[coinUpgrade.buildingRef], coinUpgrade.buildingRef);
          }
          else if(coinUpgrade.type === 9) {
            $scope.happiness.ratingPercentage += coinUpgrade.multiplier;
          }
          else if(coinUpgrade.type === 10) {
            $scope.settings.allowEditCityName = true;
          }
          
          $scope.coinUpgrades.push({
              refId: coinUpgrade.id,
          });
          calculateRevenuePercentage();
          revenueRecordCheck();
          $scope.save();
        }
    };
      
    // Set these variables so I just have to use one modal on the politicians page. Then if the user hits "get strategy upgrade", we are good to go!
    var chosenStrategy;
    var choseChoice;
    $scope.setStrategyUpgrade = function(strategyUpgrade, choice) {
        $scope.chosenStrategy = strategyUpgrade;
        $scope.choseChoice = choice;
    }
      
    $scope.getStrategyUpgrade = function(setupStrategy) {
        var strategyUpgrade = $scope.chosenStrategy;
        var choice = $scope.choseChoice;
        
        if($scope.settings.level >= strategyUpgrade.cost) {
          
          if(choice.type === 0) { // Allow renaming your city
            $scope.settings.allowEditCityName = true;
          }
          else if(choice.type === 1) { // Add happiness
            $scope.happiness.sliderValue += choice.value;
            if($scope.happiness.sliderValue > 100) {
              $scope.happiness.sliderValue = 100;
            }
          }
          else if(choice.type === 2) { // Add coins
            $scope.coins.value += choice.value;
            $scope.stats.totalCoins += choice.value;
          }
          else if(choice.type === 3) { // Open up the parliment
            $scope.politicsBoost.allowPoliticsBoost = true;
          }
          else if(choice.type === 4) { // Add multiplier for a whole category
            if(choice.reference == 1) { // Transport
              $scope.build[0].multiplier *= choice.value;
              $scope.build[3].multiplier *= choice.value;
              $scope.build[5].multiplier *= choice.value;
            }
            else if(choice.reference == 2) { // Civilian
              $scope.build[1].multiplier *= choice.value;
              $scope.build[4].multiplier *= choice.value;
              $scope.build[7].multiplier *= choice.value;
            }
            else if(choice.reference == 3) { // Business
              $scope.build[2].multiplier *= choice.value;
              $scope.build[6].multiplier *= choice.value;
              $scope.build[8].multiplier *= choice.value;
              $scope.build[9].multiplier *= choice.value;
            }
          }
          else if(choice.type === 5) { // Add multiplier to all buildings
            angular.forEach($scope.build, function(value, key) {
              value.multiplier *= choice.value;
            });
          }
          else if(choice.type === 6) { // Add citizen effectiveness
            $scope.citizenHelp += choice.value;
          }
          else if(choice.type === 7) { // Add multiplier to specific building
            $scope.build[choice.reference].multiplier *= choice.value;
          }
          else if(choice.type === 9) { // multiplier to all buildings except...
            angular.forEach($scope.build, function(value, key) {
              if(key != choice.reference) {
                value.multiplier *= choice.value;
              }
            });
          }
          else if(choice.type === 10) { // Add extra citizen gains.
            $scope.citizenExtraHelp.extraCitizenGainRate = $scope.citizenExtraHelp.extraCitizenGainRate + choice.value;
          }
          else if (choice.type === 11) { // Start auto buying politicians
            $scope.settings.autoBuyPoliticians = true;
            $scope.getAllPoliticians();
          }
          else if(choice.type === 12) { // Add a number to a single building
            if(choice.reference == 0) {
              if($scope.build[choice.reference].num == 1) {
                $scope.build[choice.reference].num--;
              }
            }
            $scope.build[choice.reference].num += choice.value;
            afterBuildingPurchase($scope.build[choice.reference], choice.reference);
          }
          else if(choice.type === 13) { // Add a number to all buildings, except...
            angular.forEach($scope.build, function(value, key) {
              if(key != choice.reference) {
                if(key == 0) {
                  if($scope.build[key].num == 1) {
                    $scope.build[key].num--;
                  }
                }
                value.num += choice.value;
                afterBuildingPurchase(value, key);
              }
            });
          }
          else if(choice.type === 14) { // Add to the approval ratings bonus
            $scope.happiness.multiplier += choice.value;
          }
          else if(choice.type === 15) { // Double to coin amount.
            $scope.coins.multiplier += choice.value;
          }
          else if(choice.type === 16){
              $scope.build[3].multiplier *= choice.value;
              $scope.build[9].multiplier *= choice.value;
          }
          
          if(!setupStrategy) {
            $scope.strategyUpgrades.push({
                refId: strategyUpgrade.id,
                choice: choice
            });
            
            $scope.save();
          }
          
        }
    };
      
    // Set these variables so I just have to use one modal on the politicians page. Then if the user hits "get advanced strategy upgrade", we are good to go!
    var chosenAdvChoice;
    $scope.setAdvanceStrategyUpgrade = function(advCoice) {
        $scope.chosenAdvChoice = advCoice;
        console.log($scope.chosenAdvChoice);
    }
      
    $scope.getAdvanceStrategyUpgrade = function() {
        if($scope.settings.level >= $scope.advancedStrategy.level) {
          
          $scope.advancedStrategy.level++
          $scope.build[$scope.chosenAdvChoice.refIndex].multiplier *= $scope.chosenAdvChoice.multiplier;
          $scope.advancedStrategy.chosenObjects.push($scope.chosenAdvChoice);
          
          $scope.generateAdvancedStrategy();
          $scope.save();
        }
    }
      
    $scope.setupStrategy = function() {
        angular.forEach($scope.strategyUpgrades, function(strategy, key) {
          //console.log(strategy.choice.id);
          
          angular.forEach($scope.strategyMeta, function(value, index) {
             //console.log(value);
             if(strategy.refId === value.id) {
                console.log(value.choices[strategy.choice.id]);
                
                if(value.choices[strategy.choice.id].type != 15) {
                  
                  $scope.chosenStrategy = value;
                  $scope.choseChoice = value.choices[strategy.choice.id];
                  
                  $scope.getStrategyUpgrade(true);
                }
             }
          });
          
        });
        
        if($scope.completedGames) {
          angular.forEach($scope.advancedStrategy.chosenObjects, function(value, index) {
            $scope.build[value.refIndex].multiplier *= value.multiplier;
          });
        }
        
    };
      
    // Set these variables so I just have to use one modal on the politicians page. Then if the user hits "get strategy upgrade", we are good to go!
    var chosenStrategyToReset;
    $scope.setStrategyReset = function(strategyUpgrade) {
        $scope.chosenStrategyToReset = strategyUpgrade;
    };
      
    $scope.getStrategyReset = function() {
        
        if($scope.curCitizens >= $scope.citizenExtraHelp.citizenCurrentMax * 0.45) {
          var strategyResetIndex = $scope.getIndex($scope.strategyUpgrades, $scope.chosenStrategyToReset.id);
          $scope.strategyUpgrades.splice(strategyResetIndex, 1);
          $scope.curCitizens -= $scope.citizenExtraHelp.citizenCurrentMax * 0.45;
        }
        
        $('.modal').modal('hide');
        
    };
      
    $scope.toggleChat = function(value) {
        $scope.settings.showChat = value;
    };
      
    $scope.toggleRevenueText = function(value) {
        $scope.settings.showRevenueCycle = !$scope.settings.showRevenueCycle;
    };

      
    // Main Build
    $scope.buildMeta = $window.buildMeta;
      
    $scope.build = [
        {
            // Roads
            
            num: 1,            
            //curCost: 4,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 0,
            curRevenue: 0
        },
        {
            //name: 'Apartments',
            
            num: 0,
            //curCost: 60,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 20,
            curRevenue: 0
        },
        {
            //name: 'Offices',
            
            num: 0,
            //curCost: 720,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 141,
            curRevenue: 0
        },
        {
            //name: 'Local Transport',
            
            num: 0,
            //curCost: 8640,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 161,
            curRevenue: 0
        },
        {
            //name: 'Education',
            
            num: 0,
            //curCost: 103680,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 181,
            curRevenue: 0
        },
        {
            //name: 'Taxi service',

            num: 0,
            //curCost: 1244160,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 201,
            curRevenue: 0
        },
        {
            //name: 'Docks',
            
            num: 0,
            //curCost: 14929920,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 221,
            curRevenue: 0
        },
        {
            //name: 'Health care',
            
            num: 0,
            //curCost: 179159040,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 241,
            curRevenue: 0
        },
        {
            //name: 'Shopping',

            num: 0,
            //curCost: 2149908480,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 261,
            curRevenue: 0
        },
        {
            //name: 'Bank sector',

            num: 0,
            //curCost: 25798901760,
            multiplier: 1,
            curPercent: 0,
            inProgress: false,
            auto: false,
            speedMultiplier: 1,
            nextGoal: 281,
            curRevenue: 0
        }
    ];
      
    // Upgrades!
    $scope.upgradesMeta = $window.upgradesMeta;

    $scope.upgrades = [];
    
    // Citizen Upgrades
    $scope.citizensUpgrades = [];
    $scope.citizensUpgradesMeta = citizensUpgradesMeta;
    
    // Goals
    $scope.goalsMeta = $window.goalsMeta;
    $scope.goals = [];
    
    
    $scope.buildingUpgrades = [
    {
        // Transparent Tile
        refId: 0,
        owned: true, // DON'T CHANGE, start-tile
    },
    ];
    
    // City Improvements
    $scope.tilesMeta = $window.tilesMeta;
    
    // City Layout
    $scope.cityLayouts = $window.cityLayouts;
    
    $scope.tiles = [];
    
    
    $scope.coinUpgradesMeta = $window.coinUpgradesMeta;
    $scope.coinUpgrades = [];
    
    $scope.strategyMeta = $window.strategyMeta;
    $scope.strategyUpgrades = [];
      
    checkHappiness = function() {
        
        if($scope.happiness.sliderValue >= 80) {
          $scope.happiness.value = 1.10;
          $scope.happiness.smile = "amazed.png";
          $scope.happiness.text = "Your citizens currently have amazing confidence in you! Giving you an extra "+ $filter('number')(($scope.happiness.value + $scope.happiness.multiplier - 1) * 100, 1) +"% in profits!";
        }
        else if ($scope.happiness.sliderValue >= 40 && $scope.happiness.sliderValue < 80) {
          $scope.happiness.value = 1.07;
          $scope.happiness.smile = "happy.png";
          $scope.happiness.text = "Your citizens currently have high confidence in you as a leader, giving you an extra "+ $filter('number')(($scope.happiness.value + $scope.happiness.multiplier - 1) * 100, 1) +"% in profits.";
        }
        else if ($scope.happiness.sliderValue >= 9 && $scope.happiness.sliderValue < 40) {
          $scope.happiness.value = 1.03;
          $scope.happiness.smile = "neutral.png";
          $scope.happiness.text = "Your citizens are currently happy with you, giving you an extra "+ $filter('number')(($scope.happiness.value + $scope.happiness.multiplier - 1) * 100, 1) +"% in profits.";
        }
        else if ($scope.happiness.sliderValue < 9) {
          $scope.happiness.value = 1;
          $scope.happiness.smile = "worried.png";
          $scope.happiness.text = "Your citizens are currently neutral towards you, giving you no extra bonus";
        }
        
    };
      
    $scope.checkTime = function() {
        return $scope.happiness.sliderValue / ($scope.happiness.sliderDecrease * 1.1);
    };
      
    $scope.checkHappinessSlider = function() {
        
        var checkSum = 0;
        var transport = $scope.citizenNeeds.transport;
        var civilian = $scope.citizenNeeds.civilian;
        var business = $scope.citizenNeeds.business;
        var transportSlider = $scope.citizenNeeds.transportSlider;
        var civilianSlider = $scope.citizenNeeds.civilianSlider;
        var businessSlider = $scope.citizenNeeds.businessSlider;
        
        if(transportSlider > (transport - 10) && transportSlider < (transport + 10)) {
          checkSum++;
          if(transportSlider > (transport - 5) && transportSlider < (transport + 5)) {
            checkSum++;
            if(transportSlider > (transport - 2) && transportSlider < (transport + 2)) {
              checkSum++;
            }
          }
        }
        if(civilianSlider > (civilian - 10) && civilianSlider < (civilian + 10)) {
          checkSum++;
          if(civilianSlider > (civilian - 5) && civilianSlider < (civilian + 5)) {
            checkSum++;
            if(civilianSlider > (civilian - 2) && civilianSlider < (civilian + 2)) {
              checkSum++;
            }
          }
        }
        if(businessSlider > (business - 10) && businessSlider < (business + 10)) {
          checkSum++;
          if(businessSlider > (business - 5) && businessSlider < (business + 5)) {
            checkSum++;
            if(businessSlider > (business - 2) && businessSlider < (business + 2)) {
              checkSum++;
            }
          }
        }
        
        // Do the visual stuff
        if(checkSum >= 8) {
          $scope.happiness.value = 1.10;
          $scope.happiness.smile = "amazed.png";
          $scope.happiness.text = "Your citizens are currently AMAZED with your planning, giving you an extra "+ $filter('number')(($scope.happiness.value - 1) * 100, 1) +"% in profits!";
        }
        else if (checkSum >= 3 && checkSum < 8) {
          $scope.happiness.value = 1.07;
          $scope.happiness.smile = "happy.png";
          $scope.happiness.text = "Your citizens are currently HAPPY with your planning, giving you an extra "+ $filter('number')(($scope.happiness.value - 1) * 100, 1) +"% in profits.";
        }
        else if (checkSum > 0 && checkSum < 3) {
          $scope.happiness.value = 1;
          $scope.happiness.smile = "worried.png";
          $scope.happiness.text = "Your citizens are currently WORRIED about your planning, giving you no extra bonus";
        }
        else if (checkSum == 0) {
          $scope.happiness.value = 0.95;
          $scope.happiness.smile = "angry.png";
          $scope.happiness.text = "Your citizens are currently ANGRY, making you earn " + $filter('number')((($scope.happiness.value - 1) * -1) * 100, 1) +"% less.";
        }
        
        $scope.citizenNeeds.checksum = checkSum;
    };
      
    calculateCityLayout = function() {
        if(!$scope.settings.generatedCityLayout) {
          if($scope.settings.cityLayout == 4) {
            $scope.settings.cityLayout = Math.floor((Math.random() * 3) + 0);
          }
          else if($scope.politicsBoost.transportMultiplier == 1 && $scope.politicsBoost.civilianMultiplier == 1 && $scope.politicsBoost.businessMultiplier == 1) {
            $scope.settings.cityLayout = Math.floor((Math.random() * 3) + 0);
          }
          else if ($scope.politicsBoost.transportMultiplier > 1) {
            $scope.settings.cityLayout = 0;
          }
          else if ($scope.politicsBoost.civilianMultiplier > 1) {
            $scope.settings.cityLayout = 1;
          }
          else if ($scope.politicsBoost.businessMultiplier > 1) {
            $scope.settings.cityLayout = 2;
          }
          $scope.settings.generatedCityLayout = true;
        }
        //console.log($scope.settings.cityLayout);
    };
      
      // What image should be displayed on the city tab?
    calculateCityLevel = function() {
        var levelSteps = 20;
        var level = (Math.floor($scope.stats.goalHighest / levelSteps));
        
        if($scope.cityLayouts.length - 1 > level) {
          if($scope.goals.length == $scope.goalsMeta.length) { // Om man satt samtliga mål, så har man vunnit!
            //console.log("if " + ($scope.cityLayouts.length - 1));
            $scope.settings.level = $scope.cityLayouts.length - 1;
          }
          else {
            //console.log("else " + level);
            $scope.settings.level = level;
          }
        
        }
        else {
          //console.log("elkse" + ($scope.cityLayouts.length - 1));
          $scope.settings.level = $scope.cityLayouts.length - 1;
        }
        
    };
      
    $scope.getID = function(array, prop, value) {
        for (var i = 0; i < array.length ; i++) {
          if (array[i][prop] === value) {
            return i;
          }
        }
    };
      
    $scope.totalBuildings = function() {
        return $scope.build[0].num + $scope.build[1].num + $scope.build[2].num + $scope.build[3].num + $scope.build[4].num + $scope.build[5].num + $scope.build[6].num + $scope.build[7].num + $scope.build[8].num + $scope.build[9].num;
    };
      
    $scope.over3000 = function() {
        return $scope.build[0].num >= 3000 && $scope.build[1].num >= 3000 && $scope.build[2].num >= 3000 && $scope.build[3].num >= 3000 && $scope.build[4].num >= 3000 && $scope.build[5].num >= 3000 && $scope.build[6].num >= 3000 && $scope.build[7].num >= 3000 && $scope.build[8].num >= 3000 && $scope.build[9].num >= 3000;
    };
      
    $scope.totalMoneyPerSecond = function () {
        var moneyPerSec = 0;
        angular.forEach($scope.build, function(value, key) {
          if(value.auto) {
            //moneyPerSec += ((($scope.buildMeta[key].revenue * value.num) * value.multiplier) * ((($scope.curCitizens * $scope.citizenHelp) / 100) + $scope.citizenExtraHelp.amount + 1) / ($scope.buildMeta[key].timeToBuild/value.speedMultiplier) * ($scope.politicsIdeology.value + 1)) * $scope.happiness.value;
            moneyPerSec += $scope.calculateRevenue(key, value, true);
          }
        });
        return moneyPerSec;
    };
      
    revenueRecordCheck = function() {
        if($scope.totalMoneyPerSecond() > $scope.stats.highestRevenue) {
          $scope.stats.highestRevenue = $scope.totalMoneyPerSecond();
          $scope.stats.newRevenueRecord = true;
        }
    };
      
    /* 
    
    ======= DEBATES =======
    
    */
    $scope.party = {
    myParty: 0,
    enemyParty: 0,
    gameState: 0,
    myState: "",
    enemyState: "",
    };
    
    $scope.argument = {
    transport: 0,
    civilian: 0,
    business: 0,
    transportSpin: false,
    civilianSpin: false,
    businessSpin: false,
    };
    
    $scope.wager = {
    val: 0,
    max: 0,
    prev: 0, // Previous wager
    enemyPrev: 0, // Enemys previous wager
    };
    
    $scope.debateStarted = false;
    $scope.playerTurn = true;
    playerRested = false;
    enemyRested = false;
    var argumentTimer;
    var enemyTimer;
    var enemyHoldTimer;
      
    generateDebate = function(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    calculateVotes = function() {
        return (210 - $scope.party.myParty);
    };
      
    calculateMaxWager = function() {
        $scope.wager.max = angular.copy($scope.curMoney);
        $scope.wager.max = Math.round($scope.wager.max * 0.01);
        
        if($scope.wager.val > $scope.wager.max) {
          $scope.wager.val = $scope.wager.max;
        }
    }
        
      
    $scope.doDebate = function(myArgument) {
        if($scope.debateStarted == false) {
          $scope.curMoney -= $scope.wager.val;
          $scope.party.myParty = generateDebate(110, 1);
          $scope.party.enemyParty = generateDebate(110, 1);
          
          $scope.debateStarted = true;
          $scope.playerTurn = true;
          playerRested = false;
          enemyRested = false;
          
          $scope.argument.transport = generateDebate(90, 30);
          $scope.argument.civilian = generateDebate(110, 1);
          $scope.argument.business = generateDebate(150, 50);
          
          $scope.party.myState = "Votes left: " + calculateVotes();
          $scope.party.enemyState = "Awaiting player";
        }
        else if ($scope.debateStarted == true && $scope.party.myParty <= 210) {
          
          if(!$scope.argument.transportSpin && !$scope.argument.civilianSpin && !$scope.argument.businessSpin) {
          
            if(myArgument == "transport") { $scope.argument.transportSpin = true; }
            else if (myArgument == "civilian") { $scope.argument.civilianSpin = true; }
            else if (myArgument == "business") { $scope.argument.businessSpin = true; }
           
            $scope.party.myState = "Votes left: " + calculateVotes();
            $scope.playerTurn = false;
            // Start timer, to increase the players excitement
            argumentTimer = $timeout(function () {
              if(myArgument == "transport") {
                $scope.party.myParty += $scope.argument.transport;
              }
              else if (myArgument == "civilian") {
                $scope.party.myParty += $scope.argument.civilian;
              }
              else if (myArgument == "business") {
                $scope.party.myParty += $scope.argument.business;
              }
              $timeout.cancel(argumentTimer);
              
              $scope.party.myState = "Waiting";
              $scope.party.enemyState = "Debating";
              
              if($scope.party.myParty > 210) {
                checkDebate();
              }
              
            }, 1500);
            
            // Make sure the enemy's debate is after the players
            if($scope.party.enemyParty < 170 || playerRested) {
              enemyTimer = $timeout(function () {
                checkDebate();
                if($scope.debateStarted) {
                  $scope.wager.enemyPrev = generateDebate(110, 1);
                  $scope.party.enemyParty += $scope.wager.enemyPrev;
                }
                $timeout.cancel(enemyTimer);
                checkDebate();
              }, 4000);
            }
            else {
              enemyTimer = $timeout(function () {
                $timeout.cancel(enemyTimer);
                $scope.party.enemyState = "Holding argument";
                checkDebate();
              }, 2000);
            }
            
            // Generate new debate scores.
            $scope.argument.transport = generateDebate(90, 30);
            $scope.argument.civilian = generateDebate(110, 1);
            $scope.argument.business = generateDebate(150, 50);
          }
        }
    };
      
    $scope.holdDebate = function() {
        
        if(!$scope.argument.transportSpin && !$scope.argument.civilianSpin && !$scope.argument.businessSpin) {
          playerRested = true;
          $scope.playerTurn = false;
          
          $scope.party.myState = "Holding argument";
          
          if ($scope.debateStarted && playerRested) {  
            $scope.party.enemyState = "Debating";
            enemyHoldTimer = $timeout(function () {
              $timeout.cancel(enemyHoldTimer);
              
              if($scope.party.enemyParty < $scope.party.myParty && !enemyRested) {
                $scope.party.enemyParty += generateDebate(110, 1);
              }
              checkDebate();
              $scope.holdDebate();
            }, 2000);
          }
          else {
            $timeout.cancel(enemyHoldTimer);
          }
          
        }
    };
      
    checkDebate = function () {
        if($scope.debateStarted) {
          if ($scope.debateStarted == true && $scope.party.myParty > 210) {
            endDebate(false);
  
          }
          else if($scope.debateStarted == true && $scope.party.enemyParty > 210) {
            endDebate(true);
          }
          else {
            $scope.party.myState = "Votes left: " + calculateVotes();
            
            if($scope.party.enemyParty > 170) {
              $scope.party.enemyState = "Case rested";
              enemyRested = true;
              
              if(playerRested && $scope.party.myParty >= $scope.party.enemyParty) {
                endDebate(true);
              }
              else if(playerRested && $scope.party.enemyParty > $scope.party.myParty) {
                endDebate(false);
              }
            }
            else if (playerRested) {
              if($scope.party.enemyParty > $scope.party.myParty) {
                endDebate(false);
              }
            }
            else {
              $scope.party.enemyState = "Gained " + $scope.wager.enemyPrev + " votes";
            }
          }
          
          $scope.playerTurn = true;
          
          // Reset spinners
          $scope.argument.transportSpin = false;
          $scope.argument.civilianSpin = false;
          $scope.argument.businessSpin = false;
        }
    };
      
    endDebate = function(state) {
        if(state) {
          if($scope.party.enemyParty == $scope.party.myParty) {
            $scope.party.gameState = 3;
            $scope.party.myState = "Draw!";
            $scope.party.enemyState = "";
            $scope.curMoney += Math.round($scope.wager.val);
          }
          else {
            $scope.party.gameState = 1;
            $scope.party.myState = "You won!";
            $scope.party.enemyState = "";
            $scope.stats.debatesWin++;
            $scope.curMoney += Math.round($scope.wager.val);
            if($scope.party.myParty >= 200) {
              $scope.curMoney += Math.round($scope.wager.val * 2);
              $scope.stats.debatesProfit += Math.round($scope.wager.val * 2);
            }
            else {
              $scope.curMoney += Math.round($scope.wager.val * 1.5);
              $scope.stats.debatesProfit += Math.round($scope.wager.val * 1.5);
            }
            
            /*// If you win, you'll get how much you win by, devided by 10.
            $scope.happiness.sliderValue += $scope.party.myParty / 10;
            if($scope.happiness.sliderValue > 100) {
              $scope.happiness.sliderValue = 100;
            }
            else {
              $scope.happiness.sliderValue = $scope.happiness.sliderValue;
            }*/
          }
        }
        else if (!state) {
          $scope.party.gameState = 2;
          $scope.party.myState = "Loser";
          $scope.party.enemyState = "Winner";
          $scope.stats.debatesLoss++;
          $scope.stats.debatesProfit -= Math.round($scope.wager.val);
          /*
          // If you lose, you'll lose 10 points to happiness slider.
          $scope.happiness.sliderValue -= 10;
          if($scope.happiness.sliderValue < 0) {
            $scope.happiness.sliderValue = 0;
          }
          else {
            $scope.happiness.sliderValue = $scope.happiness.sliderValue;
          }
          */
          //$scope.debateCitizens -= Math.round($scope.wager.val);
          //$scope.curCitizens -= Math.round($scope.wager.val);
        }
        
        $timeout.cancel(enemyHoldTimer);
        $timeout.cancel(enemyTimer);
        $timeout.cancel(argumentTimer);
        
        $scope.debateStarted = false;
        
        // Recalulate the top wager.
        $scope.wager.prev = Math.round(angular.copy($scope.wager.val));
        calculateMaxWager();
        
    }; 
      
    $scope.investConfidence = function(addValue) {
        if($scope.curMoney > $scope.calculateInvestmentCost()) {
          $scope.curMoney -= $scope.calculateInvestmentCost();
          $scope.happiness.sliderValue += addValue;
          if($scope.happiness.sliderValue > 100) {
            $scope.happiness.sliderValue = 100;
          }
          checkHappiness();
        }
        
    };
      
    $scope.calculateInvestmentCost = function() {
        var happinessValue = 1;
        if($scope.happiness.sliderValue >= 0) {
          happinessValue = Math.round($scope.happiness.sliderValue);
        }
        return ($scope.totalMoneyPerSecond() * 1800) * (happinessValue / 100);
    };
      
    $scope.generateAdvancedStrategy = function() {
        $scope.advancedStrategy.availableObjects = [];
        var tempAdvanceArray = [];
        
        angular.forEach($scope.build, function(value, key) {
          var object = {};
          object.refIndex = key;
          object.value = ($scope.calculateRevenue(key, value, true) / $scope.totalMoneyPerSecond() ) * 100;
          object.multiplier = Math.floor((Math.random() * 3) + 2);
          tempAdvanceArray.push(object);
        });
        
        tempAdvanceArray.sort(function(a, b) {
            return parseFloat(a.value) - parseFloat(b.value);
        });
        $scope.advancedStrategy.availableObjects.push(tempAdvanceArray[0]);
        $scope.advancedStrategy.availableObjects.push(tempAdvanceArray[1]);
        $scope.advancedStrategy.availableObjects.push(tempAdvanceArray[2]);
        
        // Randomize
        $scope.advancedStrategy.availableObjects.sort(function(a, b) {
            return( parseInt( Math.random() * 10 ) % 2 );
        });
        
    };
      
    /* 
        
    ======= POLITICAL BOOSTS =======
    
    */
      
    $scope.changePoliticsBoost = function(direction) {
        if($scope.politicsBoost.allowPoliticsBoost && $scope.politicsBoost.allowPoliticsBoost !== undefined) {
          if(direction === 'transport') {
            $scope.politicsBoost.upcomingTransportMultiplier = 1.2;
            $scope.politicsBoost.upcomingCivilianMultiplier = 0.9;
            $scope.politicsBoost.upcomingBusinessMultiplier = 0.9;
          }
          else if(direction === 'civilian') {
            $scope.politicsBoost.upcomingTransportMultiplier = 0.9;
            $scope.politicsBoost.upcomingCivilianMultiplier = 1.2;
            $scope.politicsBoost.upcomingBusinessMultiplier = 0.9;
          }
          else if(direction === 'business') {
            $scope.politicsBoost.upcomingTransportMultiplier = 0.85;
            $scope.politicsBoost.upcomingCivilianMultiplier = 0.85;
            $scope.politicsBoost.upcomingBusinessMultiplier = 1.2;
          }
          else {
            $scope.politicsBoost.upcomingTransportMultiplier = 1;
            $scope.politicsBoost.upcomingCivilianMultiplier = 1;
            $scope.politicsBoost.upcomingBusinessMultiplier = 1;
            $scope.politicsIdeology.sliderValue = 0;
          }
        }
    };
      
      
      
    /* 
    
    ======= CALCULATE DAYS AND DATES =======
    
    */
    $scope.theDate = function(what) {
        if(what === 'beta') {
          return new Date('2016-06-07T23:59:59.000Z');
        }
        else {
          return new Date();
        }
    }

    /* 

    ======= Firewoooorks! =======

    */

    $scope.playFireworks = function(event) {
        if (event && event.pageX && event.pageY && $scope.settings.renderFireworks) {
            $window.fireworks.animateParticules(event.pageX, event.pageY - window.scrollY);
        } 
    }

    /* 
    
    ======= SAVE AND LOAD STUFF =======
    
    */
    $scope.doSave = function() {
        // Calculate offline profits
        var passedSaveTime = 0;
        var newSaveTimestamp;
        var timestampSaveError = false;

        // If timestamp doesn't exist, create one.
        if ($localStorage.timestamp === undefined) {
            $localStorage.timestamp = Math.round(new Date() / 1000);
        }

        $http({
          method: 'GET',
          url: 'time.php'
        }).then(function successCallback(response) {
            passedSaveTime = parseInt(response.data) - parseInt($localStorage.timestamp);
            newSaveTimestamp = parseInt(response.data);
            saveDone(passedSaveTime, newSaveTimestamp, timestampSaveError);
        }, function errorCallback(response) {
            console.log("Timestamp Error!");
            // timestampSaveError = true;
            passedSaveTime = Math.round(new Date() / 1000) - parseInt($localStorage.timestamp);
            newSaveTimestamp = Math.round(new Date() / 1000);
            saveDone(passedSaveTime, newSaveTimestamp, timestampSaveError);
        });
            
    };
        
    saveDone = function(passedSaveTime, newSaveTimestamp, timestampSaveError) {
        if(passedSaveTime > 60) {
            var tempOfflineSaveCash = calculateOfflineRevenue(passedSaveTime);
            $scope.offlineCash = tempOfflineSaveCash
            $scope.curMoney += tempOfflineSaveCash;
            $scope.sessionMoney += tempOfflineSaveCash;
            $scope.stats.offlineMoney += tempOfflineSaveCash;
            
            $localStorage.timestamp = newSaveTimestamp;
            
            $scope.save();
        }
        else {
            $localStorage.timestamp = newSaveTimestamp;
            $scope.stats.onlineTime += 10;
            $scope.save();
        }

        $timeout(function () { 
            $scope.doSave();
        }, 10000);
    }
      
    $scope.save = function() {
        if($scope.allowSave) {
            checkHappiness();
            
            $localStorage.build = $scope.build;
            $localStorage.city = $scope.city;
            $localStorage.goals = $scope.goals;
            $localStorage.upgrades = $scope.upgrades;
            $localStorage.buildingUpgrades = $scope.buildingUpgrades;
            $localStorage.citizensUpgrades = $scope.citizensUpgrades;
            $localStorage.coinUpgrades = $scope.coinUpgrades;
            $localStorage.curMoney = $scope.curMoney;
            $localStorage.sessionMoney = $scope.sessionMoney;
            $localStorage.curCitizens = $scope.curCitizens;
            $localStorage.curCitizen = $scope.curCitizens;
            $localStorage.citizenHelp = $scope.citizenHelp;
            $localStorage.politicsIdeology = $scope.politicsIdeology;
            $localStorage.politicsBoost = $scope.politicsBoost;
            $localStorage.tiles = $scope.tiles;
            $localStorage.happiness = $scope.happiness;
            $localStorage.stats = $scope.stats;
            $localStorage.citizenExtraHelp = $scope.citizenExtraHelp;
            $localStorage.settings = $scope.settings;
            $localStorage.completedGames = $scope.completedGames;
            $localStorage.citizenNeeds = $scope.citizenNeeds;
            $localStorage.coins = $scope.coins;
            $localStorage.strategyUpgrades = $scope.strategyUpgrades;
            $localStorage.advancedStrategy = $scope.advancedStrategy;
            $localStorage.completeStats = $scope.completeStats;
            
            //Om vi behöver lägga till stats-variabler i framtiden.
            if(angular.isUndefined($scope.stats.dateStarted) || $scope.stats.dateStarted === '') {
                $scope.stats.dateStarted = new Date();
            }
            if(angular.isUndefined($scope.stats.goalHighest)) {
                $scope.stats.goalHighest = 0;
            }
                
            $scope.availableCitizens = calculateCitizens();//Math.floor(150*Math.sqrt($scope.sessionMoney/1e+15)); // Uppdatera även antalet nya citizens vart 20e sekund.
            if(($scope.curCitizens * 0.5) < $scope.availableCitizens) {
                $scope.citizenExtraHelp.allowRestart = true;
            }
            
            if($scope.settings.cityName == "Your City") {
                var cityNames = [ 'Stockholm', 'Gothenburg', 'Lund', 'Kiruna', 'Fagerhult', 'Motala', 'Uppsala', 'Skansen', 'Visby', 'Falun', 'New York', 'Paris', 'Venice', 'Barcelona'];
                $scope.settings.cityName = cityNames[Math.floor((Math.random() * cityNames.length) + 1)];
            }
            
            calculateMaxWager();
            calculateCityLayout();
            
            if($scope.goals.length > $scope.stats.goalHighest) {
                $scope.stats.goalHighest = $scope.goals.length;
                $window.ga('send', 'event', 'Goal', 'highestGoal', $scope.stats.goalHighest + 'theGoal', $scope.stats.goalHighest);
            }
            
            // Show if the user has won!
            if ($scope.goals.length >= $scope.goalsMeta.length && $scope.settings.showFireworks) {
                $window.fireworks.winning();
            }

            console.log("Game Saved!");
            $scope.export();
            $window.fireworks.resetFireworksCounter();
        }
    };
      
    //   startSaveCounter = function() {
        
    //   };
      
    //   startSaveCounter();

    $scope.load = function(beenOffline) {
        if($localStorage.completedGames != null) {
          $scope.completedGames = $localStorage.completedGames;
          $scope.completeStats = $localStorage.completeStats;
        }
        
        if($localStorage.build !== undefined) {
          $scope.build = $localStorage.build;
          $scope.city = $localStorage.city;
          $scope.goals = $localStorage.goals;
          $scope.upgrades = $localStorage.upgrades;
          $scope.buildingUpgrades = $localStorage.buildingUpgrades;
          $scope.citizensUpgrades = $localStorage.citizensUpgrades;
          $scope.coinUpgrades = $localStorage.coinUpgrades;
          $scope.curMoney = $localStorage.curMoney;
          $scope.sessionMoney = $localStorage.sessionMoney;
          $scope.curCitizens = $localStorage.curCitizen;
          $scope.citizenHelp = $localStorage.citizenHelp;
          $scope.politicsIdeology = $localStorage.politicsIdeology;
          $scope.politicsBoost = $localStorage.politicsBoost;
          $scope.tiles = $localStorage.tiles;
          $scope.happiness = $localStorage.happiness;
          $scope.stats = $localStorage.stats;
          $scope.citizenExtraHelp = $localStorage.citizenExtraHelp
          $scope.settings = $localStorage.settings;
          $scope.citizenNeeds = $localStorage.citizenNeeds;
          $scope.coins = $localStorage.coins;
          $scope.strategyUpgrades = $localStorage.strategyUpgrades;
          $scope.advancedStrategy = $localStorage.advancedStrategy;
          
          if(angular.isUndefined($scope.politicsIdeology)) {
            $scope.politicsIdeology = {
              value: 0,
              sliderValue: 0,
              valueSet: false
            };
          }
          if(angular.isUndefined($scope.politicsIdeology.sliderValue) || angular.isUndefined($scope.politicsIdeology.valueSet)) {
            $scope.politicsIdeology.sliderValue = 0;
            $scope.politicsIdeology.valueSet = false;
          }
          
          if(angular.isUndefined($scope.politicsBoost)) {
            $scope.politicsBoost = {
              transportMultiplier: 1,
              civilianMultiplier: 1,
              businessMultiplier: 1,
              upcomingTransportMultiplier: 1,
              upcomingCivilianMultiplier: 1,
              upcomingBusinessMultiplier: 1,
              allowPoliticsBoost: false
            };
          }
          
          if(angular.isUndefined($scope.citizenNeeds)) {
            $scope.citizenNeeds = {
              transport: 0,
              civilian: 0,
              business: 0,
              transportSlider: 0,
              civilianSlider: 0,
              businessSlider: 0,
              checksum: 0
            };
          }
          
          //if($scope.happiness === undefined) {
          if(angular.isUndefined($scope.happiness)) {
            $scope.happiness = {
              value: 1,
              multiplier: 0,
              smile: "neutral.png",
              text: "Neutral",
              sliderValue: 0,
              sliderDecrease: 0.0025,
              ratingPercentage: 10
            };
          }
          if(angular.isUndefined($scope.happiness.sliderValue) || angular.isUndefined($scope.happiness.sliderDecrease)) {
            $scope.happiness.sliderValue = 0;
            $scope.happiness.sliderDecrease = 0.0025;
          }
          if(angular.isUndefined($scope.happiness.ratingPercentage)) {
            $scope.happiness.ratingPercentage = 10;
          }
          
          //if($scope.tiles === undefined) {
          if(angular.isUndefined($scope.tiles)) {
            $scope.tiles = [ ];
          }
          
          if(angular.isUndefined($scope.coinUpgrades)) {
            $scope.coinUpgrades = [];
          }
          
          if(angular.isUndefined($scope.stats)) {
            $scope.stats = {
              totalMoney: 0,
              offlineMoney: 0,
              resets: 0,
              totalCitizens: 0,
              maxGainedCitizens: 0,
              sacrifizedCitizens: 0,
              citizenUpgrades: 0,
              onlineTime: 0,
              tilesBought: 0,
              tilesTotalMoney: 0,
              goalsHit: 0,
              goalHighest: 0,
              tilesPlaced: 0,
              upgradesBought: 0,
              upgradesTotalMoney: 0,
              buildingsBought: 0,
              buildingsTotalMoney: 0,
              politiciansHired: 0,
              politiciansTotalMoney: 0,
              debatesWin: 0,
              debatesLoss: 0,
              debatesProfit: 0,
              dateStarted: '',
              totalCoins: 0,
              spentCoins: 0,
              coinUpgradesBought: 0,
              timeSinceLastReset: 0,
              highestRevenue: 0,
              lastRevenueRecord: 0,
              lastRevenue: 0,
              newRevenueRecord: false,
              choicesMade: 0,
              spentOnChoices: 0,
              highestRoads: 0,
              highestApartments: 0,
              highestOffices: 0,
              highestTransport: 0,
              highestEducation: 0,
              highestTaxis: 0,
              highestDocks: 0,
              highestHealth: 0,
              highestShopping: 0,
              highestBanks: 0
            };
          }
          if(angular.isUndefined($scope.stats.totalCoins)) {
            $scope.stats.totalCoins = 0;
            $scope.stats.spentCoins = 0;
            $scope.stats.coinUpgradesBought = 0;
          }
         
          if(angular.isUndefined($scope.stats.timeSinceLastReset)) {
            $scope.stats.timeSinceLastReset = 0;
          }
          if(angular.isUndefined($scope.stats.highestRevenue)) {
            $scope.stats.highestRevenue = 0;
            $scope.stats.newRevenueRecord = false;
          }
          if(angular.isUndefined($scope.stats.lastRevenueRecord)) {
            $scope.stats.lastRevenueRecord = $scope.stats.highestRevenue;
            $scope.stats.lastRevenue = 0;
            $scope.stats.highestRoads = 0;
            $scope.stats.highestApartments = 0;
            $scope.stats.highestOffices = 0;
            $scope.stats.highestTransport = 0;
            $scope.stats.highestEducation = 0;
            $scope.stats.highestTaxis = 0;
            $scope.stats.highestDocks = 0;
            $scope.stats.highestHealth = 0;
            $scope.stats.highestShopping = 0;
            $scope.stats.highestBanks = 0;
          }
          
          if(angular.isUndefined($scope.citizenExtraHelp)) {
            $scope.citizenExtraHelp = {
              useExtraHelp: false,
              amount: 0,
              useSpeedBoost: false,
              speedBoost: 0,
              allowRestart: false,
              extraCitizenGainRate: 1,
              citizenCurrentMax: 0
            };
          }
          if(angular.isUndefined($scope.citizenExtraHelp.useSpeedBoost) || angular.isUndefined($scope.citizenExtraHelp.speedBoost)) {
            $scope.citizenExtraHelp.useSpeedBoost = false;
            $scope.citizenExtraHelp.speedBoost = 1;
          }
          if(angular.isUndefined($scope.citizenExtraHelp.allowRestart)) {
            $scope.citizenExtraHelp.allowRestart = false;
          }
          if(angular.isUndefined($scope.citizenExtraHelp.extraCitizenGainRate)) {
            $scope.citizenExtraHelp.extraCitizenGainRate = 1;
          }
          if(angular.isUndefined($scope.citizenExtraHelp.citizenCurrentMax)) {
            $scope.citizenExtraHelp.citizenCurrentMax = 0;
          }
          
          if(angular.isUndefined($scope.settings)) {
            $scope.settings = {
              showFireworks: true,
              showUpgrades: false,
              maximizeLayout: false,
              cityLayout: 0,
              level: 0,
              generatedCityLayout: false,
              scientificNumbers: false,
              showChat: false,
              showRevenueCycle: false,
              gameCompleted: false,
              upgradeQuantity: 10,
              improvementQuantity: 10,
              coinQuantity: 10,
              goalsAll: 301,
              editCityName: false,
              cityName: "Stockholm",
              allowEditCityName: false,
              OCDMode: true,
              autoBuyPoliticians: false,
              goToBuildPageAfterReset: true,
              renderFireworks: true
            };
          }
          if(angular.isUndefined($scope.settings.showChat)) {
            $scope.settings.showChat = false;
          }
          if(angular.isUndefined($scope.settings.showRevenueCycle)) {
            $scope.settings.showRevenueCycle = false;
          }
          if(angular.isUndefined($scope.settings.gameCompleted)) {
            $scope.settings.gameCompleted = false;
            $scope.settings.upgradeQuantity = 10;
            $scope.settings.improvementQuantity = 10;
          }
          if(angular.isUndefined($scope.settings.coinQuantity)) {
            $scope.settings.coinQuantity = 10;
            $scope.settings.goalsAll = 301;
          }
          if(angular.isUndefined($scope.settings.cityName)) {
            $scope.settings.cityName = "Stockholm";
            $scope.settings.editCityName = false;
          }
          if(angular.isUndefined($scope.settings.cityLayout)) {
            $scope.settings.cityLayout = 4;
          }
          if(angular.isUndefined($scope.settings.allowEditCityName)) {
            $scope.settings.allowEditCityName = false;
            $scope.settings.OCDMode = true;
          }
          if(angular.isUndefined($scope.settings.autoBuyPoliticians)) {
            $scope.settings.autoBuyPoliticians = false;
          }
          if(angular.isUndefined($scope.settings.goToBuildPageAfterReset)) {
            $scope.settings.goToBuildPageAfterReset = true;
          }
          if(angular.isUndefined($scope.settings.renderFireworks)) {
            $scope.settings.renderFireworks = true;
          }
          
          if(angular.isUndefined($scope.completedGames)) {
            $scope.completedGames = 0;
          }
          
          //Om vi behöver lägga till stats-variabler i framtiden.
          if(angular.isUndefined($scope.stats.dateStarted) || $scope.stats.dateStarted === '') {
            $scope.stats.dateStarted = new Date();
          }
          if(angular.isUndefined($scope.stats.goalHighest)) {
            $scope.stats.goalHighest = 0;
          }
          
          if(angular.isUndefined($scope.strategyUpgrades)) {
            $scope.strategyUpgrades = []; 
          }
          
          if(angular.isUndefined($scope.coins)) {
            $scope.coins = {
              value: 0,
              multiplier: 1
            };
          }
          
          if(angular.isUndefined($scope.advancedStrategy)) {
            $scope.advancedStrategy = {
              level: 1,
              availableObjects: [],
              chosenObjects: []
            };
          }
          
          if(angular.isUndefined($scope.completeStats)) {
            $scope.completeStats = [];
          }
        
          checkHappiness();
          
          $scope.availableCitizens = calculateCitizens();//Math.floor(150*Math.sqrt($scope.sessionMoney/1e+15)); // Uppdatera även antalet nya citizens
          
          if(angular.isUndefined($scope.stats.maxGainedCitizens)) {
            $scope.stats.maxGainedCitizens = $scope.availableCitizens;
          }
          
          calculateCityLayout();
          calculateCityLevel();
          $scope.generateAdvancedStrategy();
          

          if (beenOffline) {
              console.log('been offline');
              $scope.doSave();
          }
          else {
              $scope.save();
          }
          

        }
        else {
          if($localStorage.completedGames > 0) {
            // For the completed games prestige bonus.
            $scope.curCitizens = $localStorage.completedGames * 100;
            $localStorage.curCitizen = $scope.completedGames * 100;
            $localStorage.curCitizens = $scope.completedGames * 100;
            $scope.citizenHelp = 2 + $localStorage.completedGames;
            $localStorage.citizenHelp = 2 + $localStorage.completedGames;
          }

        //   if (beenOffline) {
            $scope.doSave();
        //   }
        }
    };
      
    calculateOfflineRevenue = function(passedTime) {
        var missedRevenue = 0;
        angular.forEach($scope.build, function(value, key) {
            if(value.auto === true) {
                missedRevenue += $scope.calculateRevenue(key, value, true, true) * passedTime;
            }
        });
        return Math.round(missedRevenue);
    };
      
    $scope.softReset = function() {
        
        if($scope.stats.newRevenueRecord) {
          $scope.stats.lastRevenueRecord = $scope.totalMoneyPerSecond();
        }
        $scope.stats.lastRevenue = $scope.totalMoneyPerSecond();
        
        angular.forEach($scope.build, function(value, key) {
           value.num = 0;
           value.multiplier = 1;
           value.curPercent = 0;
           value.inProgress = false;
           value.auto = false;
           value.speedMultiplier = 1;
           value.curRevenue = 0;
        });
        $scope.build[0].num = 1; // Se till att Roads har åtminstone 1, för annars fungerar inte spelet.
        
        // Resets the goals to their proper indexes.
        $scope.build[0].nextGoal = 0;
        $scope.build[1].nextGoal = 20;
        $scope.build[2].nextGoal = 141;
        $scope.build[3].nextGoal = 161;
        $scope.build[4].nextGoal = 181;
        $scope.build[5].nextGoal = 201;
        $scope.build[6].nextGoal = 221;
        $scope.build[7].nextGoal = 241;
        $scope.build[8].nextGoal = 261;
        $scope.build[9].nextGoal = 281;
        $scope.settings.goalsAll = 301;
        
        $scope.buildingUpgrades = [
          {
            // Transparent Tile
            refId: 0,
            owned: true, // DON'T CHANGE, start-tile
          },
        ];
        $scope.tiles = [];
        
        $scope.happiness = {
          value: 1,
          multiplier: 0,
          smile: "neutral.png",
          text: "Neutral",
          sliderValue: 0,
          sliderDecrease: 0.0025,
          ratingPercentage: 10
        };
        
        /*$scope.politicsIdeology = {
          value: 0,
          sliderValue: 0,
          valueSet: false
        };*/
        $scope.politicsIdeology.value = $scope.politicsIdeology.sliderValue;
        
        $scope.stats.newRevenueRecord = false;
        
        // Get the politicalBoosts, and then do a reset
        if($scope.politicsBoost.upcomingTransportMultiplier != 1 && $scope.politicsBoost.upcomingCivilianMultiplier != 1 && $scope.politicsBoost.upcomingBusinessMultiplier) {
          $scope.politicsBoost.transportMultiplier = angular.copy($scope.politicsBoost.upcomingTransportMultiplier);
          $scope.politicsBoost.civilianMultiplier = angular.copy($scope.politicsBoost.upcomingCivilianMultiplier);
          $scope.politicsBoost.businessMultiplier = angular.copy($scope.politicsBoost.upcomingBusinessMultiplier);  
        }
        else {
          $scope.politicsBoost.transportMultiplier = 1;
          $scope.politicsBoost.civilianMultiplier = 1;
          $scope.politicsBoost.businessMultiplier = 1;
          $scope.politicsBoost.upcomingTransportMultiplier = 1;
          $scope.politicsBoost.upcomingCivilianMultiplier = 1;
          $scope.politicsBoost.upcomingBusinessMultiplier = 1;
        }
        
        $scope.politicsBoost.allowPoliticsBoost = false;
        
        $scope.stats.totalMoney += $scope.sessionMoney;
        $scope.stats.resets++;
        $scope.stats.totalCitizens += $scope.availableCitizens;
        
        $scope.goals = [];
        $scope.upgrades = [];
        $scope.citizensUpgrades = [];
        $scope.coinUpgrades = [];
        $scope.curMoney = 0;
        
        if($localStorage.completedGames > 0) {
            // For the completed games prestige bonus.
            $scope.citizenHelp = 2 + $localStorage.completedGames;
            $localStorage.citizenHelp = 2 + $localStorage.completedGames;
        }
        else {
          $scope.citizenHelp = 2;
        }
        
        $scope.stats.timeSinceLastReset = angular.copy($localStorage.timestamp);
        
        $scope.citizenNeeds = {
          transport: 0,
          civilian: 0,
          business: 0,
          transportSlider: 0,
          civilianSlider: 0,
          businessSlider: 0,
          checksum: 0
        };
        
        $scope.citizenExtraHelp = {
          useExtraHelp: false,
          amount: 0,
          useSpeedBoost: false,
          speedBoost: 0,
          allowRestart: false,
          extraCitizenGainRate: 1
        };
        
        
        $scope.settings.generatedCityLayout = false;
        
        $scope.curCitizens += $scope.availableCitizens;
        $scope.sessionMoney = 0;
        
        $scope.stats.maxGainedCitizens = $scope.availableCitizens;
        
        $scope.availableCitizens = calculateCitizens();//Math.floor(150*Math.sqrt($scope.sessionMoney/1e+15));
        $scope.citizenExtraHelp.citizenCurrentMax = angular.copy($scope.curCitizens);
        
        calculateMaxWager();
        calculateCityLayout();
        
        $scope.setupStrategy();
        
        $scope.save();
        
        if($scope.settings.goToBuildPageAfterReset) {
          $timeout(function () {
            $state.transitionTo('build');
          }, 500);
        }
        
    };
      
    $scope.superHardReset = function() {
        
        $localStorage.$reset();
        $window.location.reload();
        
    };
      
    $scope.hardReset = function() {
        
        if($scope.settings.gameCompleted) {
          var tempStats = {
            totalMoney: $scope.stats.totalMoney + $scope.sessionMoney,
            totalMoneySpent: $scope.stats.buildingsTotalMoney + $scope.stats.upgradesTotalMoney + $scope.stats.politiciansTotalMoney + $scope.stats.tilesTotalMoney,
            offlineMoney: $scope.stats.offlineMoney,
            revenueRecord: $scope.stats.highestRevenue,
            buildingsTotalMoney: $scope.stats.buildingsTotalMoney,
            upgradesTotalMoney: $scope.stats.upgradesTotalMoney,
            politiciansTotalMoney: $scope.stats.politiciansTotalMoney,
            goalsPerDay: Math.round($scope.stats.goalHighest / $scope.daysBetween($scope.stats.dateStarted, $scope.theDate())),
            goalsHit: $scope.stats.goalsHit,
            buildingsBought: $scope.stats.buildingsBought,
            upgradesBought: $scope.stats.upgradesBought,
            politiciansHired: $scope.stats.politiciansHired,
            resets: $scope.stats.resets,
            totalCitizens: $scope.stats.totalCitizens,
            citizenUpgrades: $scope.stats.citizenUpgrades,
            sacrifizedCitizens: $scope.stats.sacrifizedCitizens,
            totalCoins: $scope.stats.totalCoins,
            spentCoins: $scope.stats.spentCoins,
            coinUpgradesBought: $scope.stats.coinUpgradesBought,
            onlineTime: $scope.stats.onlineTime,
            dateStarted: $scope.stats.dateStarted,
            dateReset: $scope.theDate(),
            daysPlayed: $scope.daysBetween($scope.stats.dateStarted, $scope.theDate()),
            
            highestRoads: $scope.stats.highestRoads,
            highestApartments: $scope.stats.highestApartments,
            highestOffices: $scope.stats.highestOffices,
            highestTransport: $scope.stats.highestTransport,
            highestEducation: $scope.stats.highestEducation,
            highestTaxis: $scope.stats.highestTaxis,
            highestDocks: $scope.stats.highestDocks,
            highestHealth: $scope.stats.highestHealth,
            highestShopping: $scope.stats.highestShopping,
            highestBanks: $scope.stats.highestBanks
          }
          
          // checks of the previous object type is an array or not, otherwise it will convert the type.
          if(!angular.isArray($scope.completeStats)) {
            $scope.completeStats = [];
          }
          $scope.completeStats.push(tempStats);
        }
        
        var tempCompletedGames = angular.copy($scope.completedGames);
        var tempCompleteStats = angular.copy($scope.completeStats);
        
        $localStorage.$reset();

        $scope.completeStats = tempCompleteStats;
        $localStorage.completeStats = tempCompleteStats;
        
        $scope.completedGames = tempCompletedGames;
        $localStorage.completedGames = tempCompletedGames;
        // $scope.load(false);

        $scope.allowSave = false;
        $timeout(function () {
            $window.location.reload();
        }, 100);
    };

    $scope.completeGame = function() {
        if(!$scope.settings.gameCompleted) {
          $scope.completedGames++;  
          $scope.settings.gameCompleted = true;
        }
        $scope.settings.showFireworks = false;
        window.stopFireworks = true;
    }
      
    // Kontrollera notifieringar
    $scope.checkNotice = function(metaArray, dataArray, type) {
        var hit = false;
        var doCheck = true;
        angular.forEach(metaArray, function(value, key) {
          if(doCheck) {
             if(!$scope.isInArray(dataArray, value.id) && $scope.curMoney >= value.cost) {
                hit = true;  
                doCheck = false;
             }
          }
        });
        checkNotification(hit, type);
        return hit;
    };
      
    $scope.checkPolitician = function() {
        var hit = false;
        var doCheck = true;
        angular.forEach($scope.build, function(value, key) {
          if(doCheck) {
             if(value.auto === false && $scope.curMoney >= $scope.buildMeta[key].politicianCost) {
                hit = true;  
                doCheck = false;
             }
          }
        });
        checkNotification(hit, 'politician');
        return hit;
    };
      
    // Adds a notification on the tab if you have an upgrade ready to be bought.
    checkNotification = function(hit, type) {
        var total = 0;
        if($scope.notificationController.indexOf(type) === -1 && hit) {
          $scope.notificationController.push(type);
        }
        else if ($scope.notificationController.indexOf(type) !== -1 && !hit) {
          var index = $scope.notificationController.indexOf(type);
          $scope.notificationController.splice(index, 1);
        }
        
        if($scope.notificationController.length > 0) {
          $window.document.title = "(!) CityInc";
        }
        else {
          $window.document.title = "CityInc";
        }
    };
      
      
    $scope.checkIdeology = function() {
        if($scope.politicsBoost.allowPoliticsBoost && $scope.politicsBoost.allowPoliticsBoost !== undefined) {
          return true;
        }
        else {
          return false;
        }
    };
      
    $scope.isInArray = function(array, num) {
        
        var hit = false;
        angular.forEach(array, function(value, key) {
           if(value.refId === num) {
              hit = true;
           }
        });
        
        return hit;
    };
      
    $scope.getIndex = function(array, id) {
        
        var theIndex = -1;
        angular.forEach(array, function(value, key) {
           if(value.refId === id) {
              theIndex = key;
              return;
           }
        });
        return theIndex;
    };
      
      
    /* 
    
    ======= IMPORT/EXPORT =======
    
    */
    
    $scope.exportstring = {
        value: "",
        error: false,
        imported: false
    };
      
      
    $scope.export = function() {
        var local = angular.copy($localStorage);
        local = JSON.stringify(local);
        
        $scope.exportstring.value = window.btoa(local);
    };
      
    $scope.importera = function(importen) {
        var data;
        
        try {
          data = window.atob(importen);
        }
        catch(err) {
          $scope.exportstring.error = true;
        }
        
        try {
          data = JSON.parse(data);
        }
        catch(err) {
          $scope.exportstring.error = true;
        }
        
        if($scope.exportstring.error == false) {
          console.log(data);
          var importCheck = false;
          $localStorage.$reset();
          
          angular.forEach(data, function(value, key) {
            if(key == "build") {
              importCheck = true;
              console.log(importCheck);
            }
          });
          
          angular.forEach(data, function(value, key) {
            if(importCheck) {
              if(key === "curCitizen") {
                $scope.curCitizens = value;
              }
              else {
                $scope[key] = value;
              }
              $scope.exportstring.imported = true;
            }
            else {
              $scope.exportstring.error = true;
            }
          });
          
        }
        $scope.save();
        $scope.load(false);
        console.log($scope.exportstring.error);
    };
      
    $scope.isDev = function() {
        if($location.host() === 'run.plnkr.co' || $location.host() === 'localhost' || $location.host() === '127.0.0.1' || $location.host() === 'cageside.se') {
          return true;
        }
        else {
          return false;
        }
    };
      
    $scope.devChange = function(amount, category) {
        if(category == 'cash') { 
          $scope.curMoney = parseFloat(amount);
        }
        else if(category == 'citizens'){
          $scope.curCitizens = parseFloat(amount);
        }
        else if(category == 'coins') {
          $scope.coins.value = parseFloat(amount);
        }
    }
      
    $scope.daysBetween = function(date1, date2) {

          var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
          var firstDate = new Date(date1);
          var secondDate = new Date(date2);
          
          return diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    }
      
    $scope.timeSinceLastReset = function() {
          return $localStorage.timestamp - $scope.stats.timeSinceLastReset;
    }
      
    setupChecks = function() {
        if (window !== window.top) {
          $scope.inIframe = true;
        }
        if(typeof(window.google_render_ad) === 'undefined') { 
            $scope.adblock = true;
        }
    }
      
    setupChecks();

    $scope.powerNames = [
          {key: " to Infinity & beyond", value: Math.pow(10,306)},
          {key: " Centillion", value: Math.pow(10,303)},
          {key: " Novemnonagintillion", value: Math.pow(10,300)},
          {key: " Onctononagintillion", value: Math.pow(10,297)},
          {key: " Septnonagintillion", value: Math.pow(10,294)},
          {key: " Sexnonagintillion", value: Math.pow(10,291)},
          {key: " Quinnonagintillion", value: Math.pow(10,288)},
          {key: " Quattuornonagintillion", value: Math.pow(10,285)},
          {key: " Trenonagintillion", value: Math.pow(10,282)},
          {key: " Duononagintillion", value: Math.pow(10,279)},
          {key: " Unnonagintillion", value: Math.pow(10,276)},
          {key: " Nonagintillion", value: Math.pow(10,273)},
          {key: " Novemoctogintillion", value: Math.pow(10,270)},
          {key: " Octooctogintillion", value: Math.pow(10,267)},
          {key: " Septoctogintillion", value: Math.pow(10,264)},
          {key: " Sexoctogintillion", value: Math.pow(10,261)},
          {key: " Quinoctogintillion", value: Math.pow(10,258)},
          {key: " Quattuoroctogintillion", value: Math.pow(10,255)},
          {key: " Treoctogintillion", value: Math.pow(10,252)},
          {key: " Duooctogintillion", value: Math.pow(10,249)},
          {key: " Unoctogintillion", value: Math.pow(10,246)},
          {key: " Octogintillion", value: Math.pow(10,243)},
          {key: " Novemseptuagintillion", value: Math.pow(10,240)},
          {key: " Octoseptuagintillion", value: Math.pow(10,237)},
          {key: " Septseptuagintillion", value: Math.pow(10,234)},
          {key: " Sexseptuagintillion", value: Math.pow(10,231)},
          {key: " Quinseptuagintillion", value: Math.pow(10,228)},
          {key: " Quattuorseptuagintillion", value: Math.pow(10,225)},
          {key: " Treseptuagintillion", value: Math.pow(10,222)},
          {key: " Duoseptuagintillion", value: Math.pow(10,219)},
          {key: " Unseptuagintillion", value: Math.pow(10,216)},
          {key: " Septuagintillion", value: Math.pow(10,213)},
          {key: " Novemsexagintillion", value: Math.pow(10,210)},
          {key: " Octosexagintillion", value: Math.pow(10,207)},
          {key: " Septsexaginillion", value: Math.pow(10,204)},
          {key: " Sexsexagintillion", value: Math.pow(10,201)},
          {key: " Quinsexagintillion", value: Math.pow(10,198)},
          {key: " Quattuorsexagintillion", value: Math.pow(10,195)},
          {key: " Tresexagintillion", value: Math.pow(10,192)},
          {key: " Duosexagintillion", value: Math.pow(10,189)},
          {key: " Unsexagintillion", value: Math.pow(10,186)},
          {key: " Sexagintillion", value: Math.pow(10,183)},
          {key: " Novemquinquagintillion", value: Math.pow(10,180)},
          {key: " Octoquinquagintillion", value: Math.pow(10,177)},
          {key: " Septquinquagintillion", value: Math.pow(10,174)},
          {key: " Sexquinquagintillion", value: Math.pow(10,171)},
          {key: " Quinquinquagintillion", value: Math.pow(10,168)},
          {key: " Quattuorquinquagintillion", value: Math.pow(10,165)},
          {key: " Trequinquagintillion", value: Math.pow(10,162)},
          {key: " Duoquinquagintillion", value: Math.pow(10,159)},
          {key: " Unquinquagintillion", value: Math.pow(10,156)},
          {key: " Quinquagintillion", value: Math.pow(10,153)},
          {key: " Novemquadragintillion", value: Math.pow(10,150)},
          {key: " Octoquadragintillion", value: Math.pow(10,147)},
          {key: " Septquadragintillion", value: Math.pow(10,144)},
          {key: " Sexquadragintillion", value: Math.pow(10,141)},
          {key: " Quinquadragintillion", value: Math.pow(10,138)},
          {key: " Quattuorquadragintillion", value: Math.pow(10,135)},
          {key: " Trequadragintillion", value: Math.pow(10,132)},
          {key: " Duoquadragintillion", value: Math.pow(10,129)},
          {key: " Unquadragintillion", value: Math.pow(10,126)},
          {key: " Quadragintillion", value: Math.pow(10,123)},
          {key: " Noventrigintillion", value: Math.pow(10,120)},
          {key: " Octotrigintillion", value: Math.pow(10,117)},
          {key: " Septentrigintillion", value: Math.pow(10,114)},
          {key: " Sestrigintillion", value: Math.pow(10,111)},
          {key: " Quinquatrigintillion", value: Math.pow(10,108)},
          {key: " Quattuortrigintillion", value: Math.pow(10,105)},
          {key: " Trestrigintillion", value: Math.pow(10,102)},
          {key: " Googol", value: Math.pow(10,100)},
          {key: " Duotrigintillion", value: Math.pow(10,99)},
          {key: " Untrigintillion", value: Math.pow(10,96)},
          {key: " Trigintillion", value: Math.pow(10,93)},
          {key: " Novemvigintillion", value: Math.pow(10,90)},
          {key: " Octovigintillion", value: Math.pow(10,87)},
          {key: " Septemvigintillion", value: Math.pow(10,84)},
          {key: " Sesvigintillion", value: Math.pow(10,81)},
          {key: " Quinquavigintillion", value: Math.pow(10,78)},
          {key: " Quattuorvigintillion", value: Math.pow(10,75)},
          {key: " Tresvigintillion", value: Math.pow(10,72)},
          {key: " Duovigintillion", value: Math.pow(10,69)},
          {key: " Unvigintillion", value: Math.pow(10,66)},
          {key: " Vigintillion", value: Math.pow(10,63)},
          {key: " Novendecillion", value: Math.pow(10,60)},
          {key: " Octodecillion", value: Math.pow(10,57)},
          {key: " Septendecillion", value: Math.pow(10,54)},
          {key: " Sedecillion", value: Math.pow(10,51)},
          {key: " Quinquadecillion", value: Math.pow(10,48)},
          {key: " Quattuordecillion", value: Math.pow(10,45)},
          {key: " Tredecillion", value: Math.pow(10,42)},
          {key: " Duodecillion", value: Math.pow(10,39)},
          {key: " Undecillion", value: Math.pow(10,36)},
          {key: " Decillion", value: Math.pow(10,33)},
          {key: " Nonillion", value: Math.pow(10,30)},
          {key: " Octillion", value: Math.pow(10,27)},
          {key: " Septillion", value: Math.pow(10,24)},
          {key: " Sextillion", value: Math.pow(10,21)},
          {key: " Quintillion", value: Math.pow(10,18)},
          {key: " Quadrillion", value: Math.pow(10,15)},
          {key: " Trillion", value: Math.pow(10,12)},
          {key: " Billion", value: Math.pow(10,9)},
          {key: " Million", value: Math.pow(10,6)},
          {key: "", value: 1}
        ];
}]);
    
    
    
/* FILTERS */

app.filter('megaNumber', [ '$filter', function ($filter) {
    return function (number, powerNames, scientificNumbers, fractionSize) {
        
        if(number === null) { 
          return null; 
        }
        if(number === 0) {
          return "0";
        }
        
        if(scientificNumbers && number > 999000000000) {
          return number.toExponential(2);
        }

        if(!fractionSize || fractionSize < 0) {
          fractionSize = 3;
        }

        var abs = Math.abs(number);
        var rounder = Math.pow(10,fractionSize);
        var isNegative = number < 0;
        var key = '';
        var powers = powerNames;

        for(var i = 0; i < powers.length; i++) {

            var reduced = abs / powers[i].value;

            reduced = Math.round(reduced * rounder) / rounder;
            
            if(reduced >= 1){
                abs = reduced;
                key = powers[i].key;
                break;
            }
        }
        
        if(abs < 1) {
          abs = Math.round(abs);
        }
        
        if(abs > 999 && abs < 1000000) {
          abs = $filter('number')(abs);
        }
        
        return (isNegative ? '-' : '') + abs + key;
    };
}]);

app.filter('formatTimer', [ '$filter', function ($filter) {
  return function (input) {
      function z(n) { return (n < 10 ? '' : '') + n; }
      
      input = input < 1 ? Math.round(input * 100) / 100 : Math.round(input);
      
      if(input < 0.01) {
        return '<0.01s'
      }
      
      var seconds = input % 60;
      var minutes = Math.floor((input % 3600) / 60);
      var hours = Math.floor((input % 86400) / 3600);
      var days = Math.floor((input % 31536000) / 86400);
      var years = Math.floor(input / 31536000); 
      
      years = Math.round(years * 10) / 10;
      
      var returnString = '';
      
      if(years > 100) {
        return ' > 100 years';
      }
      
      if(years) {
        returnString = returnString + z(years) + 'y ';
      }
      if(days) {
        returnString = returnString + z(days) + 'd ';
      }
      if(hours || days) {
        returnString = returnString + z(hours) + 'h ';
      }
      if(minutes || days || hours) {
        returnString = returnString + z(minutes) + 'm ';
      }
      if(seconds) {
          returnString = returnString + (z(seconds) + 's');
      }

      return returnString;

  };
}]);

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

app.filter('exponent', function() {
    return function(input) {
      input = input.toExponential()
      return input.substring(input.indexOf("+") + 1);
    }
});

app.filter('dateDiff', function () {
  var magicNumber = (1000 * 60 * 60 * 24);

  return function (toDate, fromDate) {
    if(toDate && fromDate){
      var dayDiff = Math.floor((toDate - fromDate) / magicNumber);
      if (angular.isNumber(dayDiff)){
        return dayDiff + 1;
      }
    }
  };
});