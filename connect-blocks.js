angular.module("app",[]).controller("gameBoard",function($scope){

  $scope.showGameMenu = true;

  $scope.gameRules = {
    win : {
      patterns : {
        vertical : true,
        diaganol : true,
        horizontal : true
      },
      numberToConnect : 4
    },
    gridSize : {
      width: 7,
      height: 6
    },
    piecesPerTurn : 1
  };

  var playerColors = ["blue","red","orange","purple","green","orange"];

  $scope.players = [
    {
      playerID : 1,
      name : "Player blue",
      color : "blue",
      wins : 0
    },
    {
      playerID : 2,
      name : "Player red",
      color : "red",
      wins : 0
    }
  ];

  // These will be set by init function
  $scope.dropButtons = [];
  $scope.gameBoard = [];
  $scope.currentPlayer = {};


  $scope.addNewPlayer = function(){
    var newPlayerID = $scope.players.length+1,
        newColor = playerColors.find(checkForNextColourAvailability);
    $scope.players.push({
      playerID : newPlayerID,
      name : `Player ${newColor}`,
      color : newColor,
      wins : 0
    });
    $scope.gameSettingsReload();
  }

  /*
    checkForNextColourAvailability - Checks for next available colour
  */
  function checkForNextColourAvailability(color){
    return (!$scope.players.find(function(player){
      return player.color == color;
    }));
  };

  $scope.getMaxConnect = function(){
    return math.min(gameRules.gridSize.height,gameRules.gridSize.width);
  }

  /*
    removePlayer - Removes player from game
  */
  $scope.removePlayer = function(arrIndex){
    $scope.players.splice(arrIndex,1);
    $scope.gameSettingsReload();
  }

  $scope.gameSettingsReload = function(){
    // reset game board
    resetBoard();
    // Reset drop boxes
    resetDropBoxes();
    // Change player settings where needed
    $scope.currentPlayer.piecesLeft = $scope.gameRules.piecesPerTurn;
    // Sets up starting player
    $scope.currentPlayer = $scope.players[0];
    $scope.currentPlayer.playOrder = 1;
  }

  $scope.colFull = function(col){
    return ($scope.gameBoard[col-1].value!=0);
  }

  $scope.dropBlock = function(col){
    var resolved = false;
    var curRow = $scope.gameRules.gridSize.height;
    var itemIndex = ($scope.gameBoard.length-($scope.gameRules.gridSize.width-col))-1;
    while(!resolved){
      if($scope.gameBoard[itemIndex].value == 0){
      // if block is empty
        // Assign block information
        $scope.gameBoard[itemIndex] = {
          value: $scope.currentPlayer.playerID,
          color: $scope.currentPlayer.color
        };
        resolved = true;
      } else if (curRow == 1){
        // If last row and it hasn't found a blank, they dropped on a full column
        // Alert and break loop
        alert("DOH!");
        break;
      }
      // Now decrease current row and the itemIndex
      curRow = curRow - 1;
      itemIndex = itemIndex - $scope.gameRules.gridSize.width;
    }

    if(resolved){
      // Check for a win
      var hasWon = checkForWin();
      if(hasWon){
        assignWin();
        changeToNextPlayer();
      } else if (!$scope.gameBoard.find(b => b.value == 0)){
        // Otherwise if there are no more available pieces to play
        alert("Draw game!");
        resetBoard();
        changeToNextPlayer();
      } else {
        // If nothing then reduce piece count or change the player
        if($scope.currentPlayer.piecesLeft > 1){
          $scope.currentPlayer.piecesLeft--;
        } else {
          changeToNextPlayer();
        }
      }     
      
    }

  }

  /*
    checkForWin - Loops through game board to see if a player wins (after placing a piece)
  */
  checkForWin = function(){
    // Firstly create our win flag
    var hasWon = false;
    // Now set up variables needed for checks
    var lmcr = $scope.gameRules.win.numberToConnect, // Left Margin column requirement 
        rmcr = ($scope.gameRules.gridSize.width - $scope.gameRules.win.numberToConnect)-1, // Right Margin Column Requirement
        tmrr = $scope.gameRules.win.numberToConnect; // Top Margin Row Requirement
    // Now set up the current row and column as this will be needed to see whether to check right, left or up
    var curCol = $scope.gameRules.gridSize.width, 
        curRow = $scope.gameRules.gridSize.height;
    // Set up current player ID (for neatness)
    var currentPlayerValue = $scope.currentPlayer.playerID;
    // Do a loop from last to start (mostly reducing iterations of this loop...in theory) ------------TODO, explore other options to make this more efficient
    // Checking for the desired patterns
    for(var x=$scope.gameBoard.length-1; x>=0; x--){
      
      // We only need to check for current player
      if($scope.gameBoard[x].value == currentPlayerValue){
        // If we can check left without moving out of bounds of board
        if(curCol >= lmcr){
          // Check going horizontal left
          if(checkPattern(x,"leftHori")){
            hasWon = true;
            break;
          }
          // Check going diag left
          if(curRow >= tmrr && checkPattern(x,"leftUpDiag")){
            hasWon = true;
            break;
          }
        }
        // If we can check up without moving out of bounds of board
        if(curRow >= tmrr){
          // Check vertical up patter
          if(checkPattern(x,"verticalUp")){
            hasWon = true;
            break;
          }
          // Check going diag right
          if(curCol >= rmcr && checkPattern(x,"rightUpDiag")){
            hasWon = true;
            break;
          }
        }
      }
      // Reduce Row, If we no longer have a col reset to next row
      curCol--;
      if(!curCol){
        curCol = $scope.gameRules.gridSize.width,
        curRow--;
      }
    }
    // return whether player has won
    return hasWon;
  }

  /*
    checkPattern - Checks for wins using defined patterns
  */
  checkPattern = function(startingIndex,pattern){
    // Work out modifier by pattern
    var modifier = 0;
    switch(pattern) {
      case "leftHori":
        modifier = -1;
        break;
      case "leftUpDiag":
        modifier = ($scope.gameRules.gridSize.width+1)*-1;
        break;
      case "rightUpDiag":
        modifier = ($scope.gameRules.gridSize.width-1)*-1;
        break;
      case "verticalUp":
        modifier = ($scope.gameRules.gridSize.width)*-1;
        break;
    }
    for(var x=1; x<=($scope.gameRules.win.numberToConnect-1); x++){
      var index = startingIndex + (modifier*x); // Work out new index
      if($scope.gameBoard[index].value != $scope.currentPlayer.playerID){
        return false;
      }
    }
    return true;
  }

  /*
    changeToNextPlayer - Puts next player into action
  */
  changeToNextPlayer = function(){
    var nextPlayerIndex = ($scope.currentPlayer.playOrder < $scope.players.length) ? $scope.currentPlayer.playOrder : 0;
    $scope.currentPlayer = $scope.players[nextPlayerIndex];
    $scope.currentPlayer.playOrder = nextPlayerIndex+1;
    $scope.currentPlayer.piecesLeft = $scope.gameRules.piecesPerTurn;
  }


  // Now initialise the file
  resetBoard = function(){
    // Reset parameters
    $scope.gameBoard = [];
    // Sets up gameboard to be all blank
    var totalBlocks = $scope.gameRules.gridSize.width * $scope.gameRules.gridSize.height;
    for(i=1; i<=($scope.gameRules.gridSize.width * $scope.gameRules.gridSize.height); i++){
      $scope.gameBoard.push({
        value: 0,
        color: "white"
      });
    }
  }

  resetDropBoxes = function(){
    var i = 1;
    $scope.dropButtons = [];
    while(i<=$scope.gameRules.gridSize.width){
      $scope.dropButtons.push(i);
      i++;
    };
  }

  assignWin = function(){
    //alert win
    alert(`${$scope.currentPlayer.name} wins!`);
    // Apply new wins to player
    $scope.players[$scope.currentPlayer.playOrder-1].wins++;
    // reset board
    resetBoard();
  }

  // Now initialise the file
  init = function(){
    // Sets up drop down buttons
    resetDropBoxes();
    // Resets board
    resetBoard();
    // Sets up starting player
    $scope.currentPlayer = $scope.players[0];
    $scope.currentPlayer.piecesLeft = $scope.gameRules.piecesPerTurn;
    $scope.currentPlayer.playOrder = 1;
  }
  // Initialises app
  init();

});
