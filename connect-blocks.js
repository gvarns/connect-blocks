angular.module("app",[]).controller("gameBoard",function($scope){

  $scope.gridSize = {
    width: 7,
    height: 6
  };

  $scope.gameRules = {
    win : {
      patterns : {
        vertical : true,
        diaganol : true,
        horizontal : true
      },
      numberToConnect : 4
    }
  };

  $scope.players = [
    {
      playerID : 1331,
      name : "GeeVee",
      colour : "blue",
      wins : 0,
      playOrder : 1
    },
    {
      playerID : 2221,
      name : "Jane",
      colour : "red",
      wins : 0,
      playOrder : 2
    }
  ];


  // These will be set by init function
  $scope.dropButtons = [];
  $scope.gameBoard = [];
  $scope.currentPlayer = {};

  $scope.dropBlock = function(col){
    var resolved = false;
    var curRow = $scope.gridSize.height;
    var itemIndex = ($scope.gameBoard.length-($scope.gridSize.width-col))-1;
    while(!resolved){
      if($scope.gameBoard[itemIndex].value == 0){
        $scope.gameBoard[itemIndex] = {
          value: $scope.currentPlayer.playerID,
          colour: $scope.currentPlayer.colour
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
      itemIndex = itemIndex - $scope.gridSize.width;
    }

    if(resolved){
      // Check for a win
      checkForWin();
      // Finally change the player
      changeToNextPlayer();
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
        rmcr = ($scope.gridSize.width - $scope.gameRules.win.numberToConnect)-1, // Right Margin Column Requirement
        tmrr = ($scope.gridSize.height - $scope.gameRules.win.numberToConnect)-1; // Top Margin Row Requirement
    // Now set up the current row and column as this will be needed to see whether to check right, left or up
    var curCol = $scope.gridSize.width, 
        curRow = $scope.gridSize.height;
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
        curCol = $scope.gridSize.width,
        curRow--;
      }
    }

    if(hasWon){
      alert(`${$scope.currentPlayer.name} wins!`);
      // resetBoard();
    }

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
        modifier = ($scope.gridSize.width+1)*-1;
        break;
      case "rightUpDiag":
        modifier = ($scope.gridSize.width-1)*-1;
        break;
      case "verticalUp":
        modifier = ($scope.gridSize.width)*-1;
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
    var nextPlayerOrderNo = ($scope.currentPlayer.playOrder < $scope.players.length) ? $scope.currentPlayer.playOrder+1 : 1;
    $scope.currentPlayer = $scope.players[nextPlayerOrderNo-1];
  }

  // Now initialise the file
  init = function(){
    // Sets up drop down buttons
    var i = 1;
    while(i<=$scope.gridSize.width){
      $scope.dropButtons.push(i);
      i++;
    };
    // Sets up gameboard to be all blank
    var totalBlocks = $scope.gridSize.width * $scope.gridSize.height;
    for(i=1; i<=($scope.gridSize.width * $scope.gridSize.height); i++){
      $scope.gameBoard.push({
        value: 0,
        colour: "white"
        
      });
    }
    // Sets up starting player
    $scope.currentPlayer = $scope.players[0];
  }
  // Initialises app
  init();

});
