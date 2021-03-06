// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const Search = require('./astar');

const size = 50;

var delay;
var highScore;
var apple = [];
var deleted = [];
var playersArray = [];
var oldBestPlayer = -1;
var turn;

var $ = require('jquery');
// keys: [u, d, l, r]
function Players (startPos, body, keys, tag, bot=false) {

    this.length = 3;
    this.alive = true;
    this.tag = tag;
    this.xDir = 0;
    this.yDir = 1;
    this.prevxDir = 0;
    this.prevyDir = 1;
    this.xpos = startPos[0];
    this.ypos = startPos[1];
    this.bot = bot;

    if (this.bot === false) {
        this.up = keys[0];
        this.down = keys[1];
        this.left = keys[2];
        this.right = keys[3];
    }

    this.xBody= [];
    this.yBody= [];

    this.xBody.push(body[0][0]);
    this.yBody.push(body[0][1]);

    this.xBody.push(body[1][0]);
    this.yBody.push(body[1][1]);

    this.eat = function(){
        this.length += 2;
        spawnApple();
    };

    this.updateDirection = function(key){
        
        if(key == this.left) {
            if (this.prevxDir != 1 || this.prevyDir != 0){
                this.xDir = -1;
                this.yDir = 0;
            }
        } else if(key == this.right) {
            if (this.prevxDir != -1 || this.prevyDir != 0){
                this.xDir = 1;
                this.yDir = 0;
            }
        } else if(key == this.down) {
            if (this.prevxDir != 0 || this.prevyDir != 1){
                this.xDir = 0;
                this.yDir = -1;
            }
        } else if(key == this.up) {
            if (this.prevxDir != 0 || this.prevyDir != -1){
                this.xDir = 0;
                this.yDir = 1;
            }
        }
    }

}

Players.prototype.move = function (){

    let nextX, nextY;

    this.xBody.unshift(this.xpos);

    this.yBody.unshift(this.ypos);
    deleted.push([
        this.xBody[this.length - 1],
        this.yBody[this.length - 1]
    ]);

    this.xBody.splice(this.length - 1, 10);

    this.yBody.splice(this.length - 1, 10);
    this.prevxDir = this.xDir;

    this.prevyDir = this.yDir;


    if (this.bot) {
        let gameGraph = [];

        for (let x = 0; x < size; x++) {
            gameGraph[x] = [];
            for (let y = 0; y < size; y++) {
                gameGraph[x][y] = 1;
            }
        }

        playersArray.forEach(function(player) {


            gameGraph[player.xpos][player.ypos] = 0;

            for (var i = 0; i < player.xBody.length; i++) {

                gameGraph[player.xBody[i]][player.yBody[i]] = 0;

            }
        });

        gameGraph = new Search.Graph(gameGraph);

        let start = gameGraph.grid[this.xpos][this.ypos];
        let end = gameGraph.grid[apple[0]][apple[1]];

        let result = Search.astar.search(gameGraph, start, end, {heuristic: Search.astar.heuristics.wrappingManhattan});

        if (result.length > 0) {

            let xDiff = result[0].x - this.xpos;
            let yDiff = result[0].y - this.ypos;

            if (Math.abs(xDiff) === size -1 ) {
                if ((xDiff) < 0 ) {
                    this.xDir = 1
                } else if ((xDiff) > 0 ) {
                    this.xDir = -1
                }
            } else if ((xDiff) < 0 ) {
                this.xDir = -1
            } else if ((xDiff) > 0 ) {
                this.xDir = 1
            } else {
                this.xDir = 0
            }

            if (Math.abs(yDiff) === size -1 ) {
                if ((yDiff) < 0 ) {
                    this.yDir = 1
                } else if ((yDiff) > 0 ) {
                    this.yDir = -1
                }
            } else if ((yDiff) < 0 ) {
                this.yDir = -1
            } else if ((yDiff) > 0 ) {
                this.yDir = 1
            } else {
                this.yDir = 0
            }
        }

        this.prevxDir = this.xDir;
        this.prevyDir = this.yDir;

    }

    nextX = (this.xDir + this.xpos + size)%size;
    nextY = (this.yDir + this.ypos + size)%size;




    var connect = false;

    playersArray.forEach(function(player) {
        for (var i = 0; i < player.xBody.length; i++) {
            if (player.xBody[i] == nextX && player.yBody[i] == nextY){
                connect = true;
            }
        }
        if (player.xpos == nextX && player.ypos == nextY){
            connect = true;
        }
    });

    this.xpos = nextX;
    this.ypos = nextY;

    if (connect) {
        this.alive = false;
        spawnApple();
        return false;
    }

    return true;
};


function newStage(){
    $("#stage").empty();
    for (var y = size - 1; y > -1; y = y - 1){
            for (var x = 0; x < size; x++){
                var newTile = $("<div>", {id: 'x' + String(x) + 'y' + String(y)});
                $('#stage').append(newTile);
            }
    }
}

function updateScreen(){

    let scores = [];

    playersArray.forEach(function(player) {

            //if right
        if (player.prevxDir == 1 && player.prevyDir == 0){
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-right"></i>');

            //if left
        }else if (player.prevxDir == -1 && player.prevyDir == 0){
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-left"></i>');

            //if up
        }else if (player.prevxDir == 0 && player.prevyDir == 1){
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-up"></i>');

            //if down
        }else if (player.prevxDir == 0 && player.prevyDir == -1){
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-down"></i>');
        }

        $('#' + 'x' + player.xBody[0] + 'y' + player.yBody[0]).removeClass('head' + player.tag).addClass('snek' + player.tag);

        $('#score' + player.tag).text( (player.length-3)/2 );

        scores.push( (player.length-3)/2 );

    });

    deleted.forEach(function(tile) {
        $('#' + 'x' + tile[0] + 'y' + tile[1]).removeClass().text('');
    });

    var bestPlayer = scores.indexOf(Math.max.apply( Math, scores )) + 1;

    if (bestPlayer != oldBestPlayer){
        $('#victory').text('Player' + bestPlayer + ' is ahead');
        oldBestPlayer = bestPlayer;
    }


    deleted = [];


    
}

function spawnApple(){

    if (apple.length){
        $('#' + 'x' + apple[0] + 'y' + apple[1]).removeClass('apple');
    }

    let valid = false;
    let appleX;
    let appleY;
    let tryAmount = 0;

    while (valid === false && tryAmount < 20){
        appleX = Math.floor(Math.random() * size);
        appleY = Math.floor(Math.random() * size);

        console.log(['try', tryAmount, appleX, appleY]);

        let validate = validateAppleSpawn(appleX, appleY, tryAmount);

        valid = validate[0];
        tryAmount = validate[1];
    }

    apple = [appleX, appleY];

    $('#' + 'x' + apple[0] + 'y' + apple[1]).addClass('apple');

    updateScreen();
}

function validateAppleSpawn(appleX, appleY, tryAmount) {

    let gameGraph = [];

    for (let x = 0; x < size; x++) {
        gameGraph[x] = [];
        for (let y = 0; y < size; y++) {
            gameGraph[x][y] = 1;
        }
    }

    playersArray.forEach(function(player) {

        gameGraph[player.xpos][player.ypos] = 0;

        for (var i = 0; i < player.xBody.length; i++) {

            gameGraph[player.xBody[i]][player.yBody[i]] = 0;

        }
    });

    gameGraph = new Search.Graph(gameGraph);

    for (let index in playersArray) {
        let player = playersArray[index];

        for (var i = 0; i < player.xBody.length; i++) {
            if (player.xBody[i] === appleX && player.yBody[i] === appleY){
                return [false, tryAmount];
            }
        }

        if (player.xpos === appleX && player.ypos === appleY){
            return [false, tryAmount];
        }

        let start = gameGraph.grid[player.xpos][player.ypos];
        let end = gameGraph.grid[appleX][appleY];

        let result = Search.astar.search(gameGraph, start, end, {heuristic: Search.astar.heuristics.wrappingManhattan});

        if (result.length === 0 && player.alive) {
            tryAmount += 1;
            return [false, tryAmount];
        }

    }

    return [true, 0];
}

function play(){

    turn = setInterval(function(){

        playing = false;

        playersArray.forEach(function(player) {
            if (player.alive){
                player.move();


                if ( !(player.alive) ){

                    score = ( player.length - 3 )/2 ;
                    highScore =  parseInt(localStorage.getItem('highScore'));
                    if (score > highScore){
                        localStorage.setItem('highScore', score);
                    }
                    $("#highScore").text( localStorage.getItem('highScore') );

                } else if ( player.xpos == apple[0] && player.ypos == apple[1] ){
                    player.eat();
                    playing = true;
                } else {
                    playing = true;
                }
            }
        });

        if ( !(playing) ){
            clearInterval(turn);

            $('#victory').text('Winner: Player' + oldBestPlayer);

            $('#pause').addClass('hidden');

            $('#start').removeClass('hidden');
            $('#playerAmount').removeClass('hidden');

            $('#selectLabel').removeClass('hidden');
        }


        updateScreen();
    }, delay);

}


// event listner: keydown -> direction  udate
document.addEventListener('keydown', function(event) {
    playersArray.forEach(function(player) {
        player.updateDirection(event.keyCode);
    });
});

$('#start').on('click', function(event){

    playersArray = [];

    let Player1;
    let Player2;
    let Player3;
    let Player4;

    let playerAmount = parseInt($('#playerAmount').val(), 10);

    switch (playerAmount) {
        case 1: //1 player

            Player1 = new Players([13, 15], [ [13, 14], [13, 13] ], [38, 40, 37, 39], 0);
            playersArray.push(Player1);

            break;

        case 2: //2 players

            Player1 = new Players([13, 15], [ [13, 14], [13, 13] ], [38, 40, 37, 39], 0);
            playersArray.push(Player1);

            Player2 = new Players([37, 39], [ [37, 38], [37, 37] ], [90, 83, 81, 68], 1);
            playersArray.push(Player2);

            break;

        case 3: //3 players

            Player1 = new Players([13, 15], [ [13, 14], [13, 13] ], [38, 40, 37, 39], 0);
            playersArray.push(Player1);

            Player2 = new Players([37, 39], [ [37, 38], [37, 37] ], [90, 83, 81, 68], 1);
            playersArray.push(Player2);

            Player3 = new Players([13, 39], [ [13, 38], [13, 37] ], [104, 101, 100, 102], 2);
            playersArray.push(Player3);

            break;

        case 4: //4 players

            Player1 = new Players([13, 15], [ [13, 14], [13, 13] ], [38, 40, 37, 39], 0);
            playersArray.push(Player1);

            Player2 = new Players([37, 39], [ [37, 38], [37, 37] ], [90, 83, 81, 68], 1);
            playersArray.push(Player2);

            Player3 = new Players([13, 39], [ [13, 38], [13, 37] ], [104, 101, 100, 102], 2);
            playersArray.push(Player3);

            Player4 = new Players([37, 15], [ [37, 14], [37, 13] ], [85, 74, 72, 75], 3);
            playersArray.push(Player4);

            break;

        case 5: //1 player 1 bot

            Player1 = new Players([13, 15], [ [13, 14], [13, 13] ], [38, 40, 37, 39], 0);
            playersArray.push(Player1);

            Player2 = new Players([37, 39], [ [37, 38], [37, 37] ], [90, 83, 81, 68], 1, true);
            playersArray.push(Player2);

            break;

        case 6:  //1 player 3 bots

            Player1 = new Players([13, 15], [ [13, 14], [13, 13] ], [38, 40, 37, 39], 0);
            playersArray.push(Player1);

            Player2 = new Players([37, 39], [ [37, 38], [37, 37] ], [90, 83, 81, 68], 1, true);
            playersArray.push(Player2);

            Player3 = new Players([13, 39], [ [13, 38], [13, 37] ], [104, 101, 100, 102], 2, true);
            playersArray.push(Player3);

            Player4 = new Players([37, 15], [ [37, 14], [37, 13] ], [85, 74, 72, 75], 3, true);
            playersArray.push(Player4);

            break;

        case 7: //no players 4 bots

            Player1 = new Players([13, 15], [ [13, 14], [13, 13] ], [38, 40, 37, 39], 0, true);
            playersArray.push(Player1);

            Player2 = new Players([37, 39], [ [37, 38], [37, 37] ], [90, 83, 81, 68], 1, true);
            playersArray.push(Player2);

            Player3 = new Players([13, 39], [ [13, 38], [13, 37] ], [104, 101, 100, 102], 2, true);
            playersArray.push(Player3);

            Player4 = new Players([37, 15], [ [37, 14], [37, 13] ], [85, 74, 72, 75], 3, true);
            playersArray.push(Player4);

            break;
    }

    //up 38
    //down 40
    //left 37
    //right 39

    //z 90
    //q 81
    //s 83
    //d 68

    //4 100
    //5 101
    //6 102
    //8 104

    //u 85
    //j 74
    //h 72
    //k 75

    $('#start').text('restart').addClass('hidden');

    $('#playerAmount').addClass('hidden');

    $('#selectLabel').addClass('hidden');

    $('#unpause').addClass('hidden');

    $('#pause').removeClass('hidden');

    newStage();

    spawnApple();

    delay = 100;

    $("#scoreboard").empty();
    
    playersArray.forEach(function(player){
        $("#scoreboard").append('Score p' + (player.tag + 1) + ': <span id="score' + player.tag + '"></span> ');
    });


    play();
});

$('#reset').on('click', function(event){
    localStorage.setItem('highScore', '0');
    $('#highScore').text( 0 );
});

$('#pause').on('click', function(event){
    clearInterval(turn);
    $('#pause').addClass('hidden');
    $('#unpause').removeClass('hidden');
    $('#start').removeClass('hidden');

    $('#playerAmount').removeClass('hidden');

    $('#selectLabel').removeClass('hidden');
});

$('#unpause').on('click', function(event){
    play();
    $('#pause').removeClass('hidden');
    $('#unpause').addClass('hidden');
    $('#start').addClass('hidden');

    $('#playerAmount').addClass('hidden');

    $('#selectLabel').addClass('hidden');
});

$( document ).ready(function() {  

    $('#victory').text('Wellcome');

    if (! ("highScore" in localStorage) ){
        localStorage.setItem('highScore', '0');
        highScore = 0;
    } else {
        highScore = localStorage.getItem("highScore");
    }

    $("#highScore").text( highScore );

    newStage();

});