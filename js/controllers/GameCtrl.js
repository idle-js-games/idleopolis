app.controller('GameCtrl', ['$scope', '$interval', '$localStorage', function ($scope, $interval, $localStorage) {
    
    /**
     * Rules of the game
     * These are fixed and NOT part of the savegame.
     */
    $scope.rules = {
        interval: 500,
        costIncrease: 1.12
    };
    
    /**
     * Default Game Data
     * Mutational data that is stored in the savegame.
     *
     * Stored by html5 localStorage, which is automatically updated – no save timer needed!
     */
    var gamedata = {
        
        // Initial resources
        populationTotal: 0,
        populationAvailable: 0,
        
        currency: 100,
        supplies: 100,
        
        landTotal: 5,
        landAvailable: 5,
        
        culture: 0,
        knowledge: 1,
        
        // Initial land squares
        land: [
            {
                type: false,
                collect: 0
            },
            {
                type: false,
                collect: 0
            },
            {
                type: false,
                collect: 0
            },
            {
                type: false,
                collect: 0
            },
            {
                type: false,
                collect: 0
            }
        ],
        
        // Single land square
        square: {
            buyCostCurrency: 80,
            buyCostSupplies: 0,
            buildTime: 5,
            population: 0
        },

        // Buildings
        buildings: {
            house: {
                buildCostCurrency: 20,
                buildCostSupplies: 0,
                buildTime: 5,
                population: 5,
                gains: 'currency',
                gainsAmount: 5,
                autoCollect: false,
                duration: 5,
                amountBuilt: 0
            },
            factory: {
                buildCostCurrency: 30,
                buildCostSupplies: 0,
                buildTime: 10,
                population: -2,
                gains: 'supplies',
                gainsAmount: 5,
                autoCollect: false,
                duration: 10,
                amountBuilt: 0
            },
            tavern: {
                buildCostCurrency: 20,
                buildCostSupplies: 20,
                buildTime: 10,
                population: -3,
                culture: 5,
                amountBuilt: 0      
            },
            school: {
                buildCostCurrency: 60,
                buildCostSupplies: 50,
                buildTime: 20,
                population: -4,
                gains: 'knowledge',
                gainsAmount: 1,
                autoCollect: false,
                duration: 60,
                amountBuilt: 0      
            }
        },
       
        // Researchable improvements
        research: {
            wireTransfer: {
                description: "Your people can send their taxes by wire, no need to go door-to-door anymore.",
                cost: 2,
                researched: false
            },
            shipping: {
                description: "Supplies are delivered to your warehouse overnight, so you don't have to collect them yourself.",
                cost: 4,
                researched: false
            },
            cloudStorage: {
                description: "Your schools upload new knowledge directly to the city's wiki.",
                cost: 8,
                researched: false
            }
        },
        
        // Stats Totals
        totalStats: {
            currency: 0,
            supplies: 0,
            knowledge: 0
        }
        
    };
    
    /*
     * Local storage of gamedata
     * All operations are done on .$storage, not .gamedata
     */
    var init = function() {
        $scope.$storage = $localStorage.$default(gamedata);
    };
    init();
    
    /**
     * Resets the game to the defaults
     * + user confirmation
     */
    $scope.resetGame = function() {
        console.log($scope.$storage.$reset(gamedata));
    };
    
    /**
     * Adds entry to the log
     * @param {String} entry
     */
    $scope.addLogEntry = function(entry, type) {
        var icon;
        
        switch(type) {
            case 'info':    icon = ' '; break;
            case 'success': icon = '√'; break;
            case 'warning': icon = '!'; break;
            case 'debug':   icon = 'E'; break;
        }
        console.log(icon + ' ' + entry);
    };
    $scope.addLogEntry("Welcome to idleopolis! Like to look under the hood? Here's the source: https://github.com/tobiv/idleopolis", 'info');

    
    /**
     * Places a building on the map
     * @param {String} type  The building that's supposed to be erected
     */
    $scope.build = function(type) {
        var building = $scope.$storage.buildings[type];
        
        // Proceed if player is credit worthy
        if($scope.$storage.currency >= building.buildCostCurrency && $scope.$storage.supplies >= building.buildCostSupplies) {
            // If building needs more population than available, exit
            if(building.population < 0 && $scope.$storage.populationAvailable < (-1 * building.population)) {
                $scope.addLogEntry('Not enough population', 'warning');
                return false;
            }
            
            // Find empty land square
            var freeLand = $scope.$storage.land.map( function(e) {
                return e.type;
            }).indexOf(false);
            
            if(freeLand > -1) {
                // Collect player funds
                $scope.$storage.currency -= building.buildCostCurrency;
                $scope.$storage.supplies -= building.buildCostSupplies;
                
                // Place building on free square
                $scope.$storage.land[freeLand].type = type;
                $scope.$storage.land[freeLand].progress = 0;
                $scope.$storage.land[freeLand].collect = 0;
                building.amountBuilt += 1;
                
                // Change population
                if(building.population > 0) {
                    $scope.$storage.populationTotal += building.population;
                }
                $scope.$storage.populationAvailable += building.population;
                
                // Change land
                $scope.$storage.landAvailable -= 1;
                
                //$scope.addLogEntry('Built a ' + type + ' for c' + building.buildCostCurrency + ' s' + building.buildCostSupplies, 'success');
                
                // Increase future cost
                building.buildCostCurrency = Math.ceil(building.buildCostCurrency * $scope.rules.costIncrease);
                if(building.buildCostSupplies === 0) {
                    building.buildCostSupplies = 5;
                }
                building.buildCostSupplies = Math.ceil(building.buildCostSupplies * $scope.rules.costIncrease);
            }
            else {
                $scope.addLogEntry('Not enough land', 'warning');
                return false;
            }
        }
        else {
            $scope.addLogEntry('Not enough funds!', 'warning');
            return false;
        }
    };

    /**
     * Buys a piece of land
     * + buy multiple
     */
    $scope.buyLand = function() {
        if($scope.$storage.currency >= $scope.$storage.square.buyCostCurrency && $scope.$storage.supplies >= $scope.$storage.square.buyCostSupplies) {
            // Collect player funds first...
            $scope.$storage.currency -= $scope.$storage.square.buyCostCurrency;
            $scope.$storage.supplies -= $scope.$storage.square.buyCostSupplies;

            // Add land square
            var newLand = {
                type: false,
                collect: 0                
            };
            $scope.$storage.land.push(newLand);
            
            var landdiv = document.getElementById('io-the-land');
            landdiv.scrollTop = landdiv.scrollHeight;

            $scope.addLogEntry('Bought one square of land for c' + $scope.$storage.square.buyCostCurrency + ' s' + $scope.$storage.square.buyCostSupplies, 'success');
            
                        
            // Change totals
            $scope.$storage.landTotal += 1;
            $scope.$storage.landAvailable += 1;
            
            // Increase future cost
            $scope.$storage.square.buyCostCurrency = Math.ceil($scope.$storage.square.buyCostCurrency * $scope.rules.costIncrease);
            if($scope.$storage.square.buyCostSupplies === 0) {
                $scope.$storage.square.buyCostSupplies = 10;
            }
            $scope.$storage.square.buyCostSupplies = Math.ceil($scope.$storage.square.buyCostSupplies * $scope.rules.costIncrease);
        }
        else {
            $scope.addLogEntry('Not enough funds!', 'warning');
            return false;
        }
    };
    
    /**
     * Collects resources from ready buildings
     * @param {Number} index  Index of the land array element
     */
    $scope.collectSquare = function(index) {
        if($scope.$storage.land[index].collect > 0) {
            
            // Determine which resource is gained            
            var type     = $scope.$storage.land[index].type;
            var building = $scope.$storage.buildings[type];
            var gains    = building.gains;

            // Add resource to total 
            $scope.$storage[gains] += $scope.$storage.land[index].collect;
            $scope.$storage.totalStats[gains] += $scope.$storage.land[index].collect;
            
            // Reset progress
            $scope.$storage.land[index].collect = 0;
            $scope.$storage.land[index].progress = 0;
        }
    };
    
    /**
     * Buys research
     */
    $scope.research = function(name) {
        switch(name) {
            case 'wireTransfer':
                if($scope.$storage.research.wireTransfer.researched === true) {
                    $scope.addLogEntry('Already researched!', 'warning');
                    return false;
                }
                if($scope.$storage.knowledge >= $scope.$storage.research.wireTransfer.cost) {
                    $scope.$storage.knowledge -= $scope.$storage.research.wireTransfer.cost;
                    $scope.$storage.research.wireTransfer.researched = true;
                    $scope.$storage.buildings.house.autoCollect = true;
                    $scope.addLogEntry('Researched Wire Transfer – taxes are collected automatically now', 'success');
                }
                else {
                    $scope.addLogEntry('Not enough knowledge!', 'warning');
                    return false;
                }
                break;
            case 'shipping':
                if($scope.$storage.research.shipping.researched === true) {
                    $scope.addLogEntry('Already researched!', 'warning');
                    return false;
                }
                if($scope.$storage.knowledge >= $scope.$storage.research.shipping.cost) {
                    $scope.$storage.knowledge -= $scope.$storage.research.shipping.cost;
                    $scope.$storage.research.shipping.researched = true;
                    $scope.$storage.buildings.factory.autoCollect = true;
                    $scope.addLogEntry('Researched Shipping – supplies are collected automatically now', 'success');
                }
                else {
                    $scope.addLogEntry('Not enough knowledge!', 'warning');
                    return false;
                }
                break;
            case 'cloudStorage':
                if($scope.$storage.research.cloudStorage.researched === true) {
                    $scope.addLogEntry('Already researched!', 'warning');
                    return false;
                }
                if($scope.$storage.knowledge >= $scope.$storage.research.cloudStorage.cost) {
                    $scope.$storage.knowledge -= $scope.$storage.research.cloudStorage.cost;
                    $scope.$storage.research.cloudStorage.researched = true;
                    $scope.$storage.buildings.school.autoCollect = true;
                    $scope.addLogEntry('Researched Cloud Storage – knowledge is collected automatically now', 'success');
                }
                else {
                    $scope.addLogEntry('Not enough knowledge!', 'warning');
                    return false;
                }
                break;
        }
    };
    
    /**
     * Testing Cheat
     */
    $scope.cheat = function() {
        $scope.$storage.currency += 100000;
        $scope.$storage.supplies += 100000;
        $scope.$storage.knowledge += 100;
    };
    
    $scope.$on('$destroy', function () {
        // Make sure that the interval is destroyed
        if (angular.isDefined(timer)) {
            $interval.cancel(timer);
            timer = undefined;
        }
    });

    /**
     * Main game timer
     * Advances the construction, production and research progress.
     */
    var timer = $interval(function () {
        var landmass = $scope.$storage.land.length;
        var type;
        var building;
        var focus;
        
        for(var square = 0; square < landmass; square++) {
            focus = $scope.$storage.land[square];
            
            // Buildings
            // Ignore empty and ready-to-collect squares
            if(focus.type !== false && focus.construction !== true && focus.collect === 0) {
                
                type     = focus.type;
                building = $scope.$storage.buildings[type];
                
                // Update progress
                focus.progress += 100 / (building.duration * 1000 / $scope.rules.interval);
                
                if(focus.progress > 99) {
                    
                    // Update square with the amount to gain
                    focus.collect = building.gainsAmount;
                    
                    // Auto-collect if researched
                    if(building.autoCollect === true) {
                        $scope.collectSquare(square);
                    }
                }
            }
            
            // Construction
            if(focus.construction === true) {
                
            }
        }
        
    }, $scope.rules.interval, 0);
    
}]);
 