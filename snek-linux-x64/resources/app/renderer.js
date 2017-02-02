// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const size = 50;

var length = 3;
var delay
var prevDirection = [0, 1]
var direction = [0, 1]
var pos = [0, 2]
var highScore
var apple
var deleted = []
var playersArray = []

var $ = require('jquery');
// keys: [u, d, l, r]
function Players (startPos, body, keys, tag) {

    this.length = 3;
    this.alive = true;
    this.tag = tag
    this.xDir = 0;
    this.yDir = 1;
    this.prevxDir = 0;
    this.prevyDir = 1;
    this.xpos = startPos[0];
    this.ypos = startPos[1];

    this.up = keys[0];
    this.down = keys[1];
    this.left = keys[2];
    this.right = keys[3];

    this.xBody= [];
    this.yBody= [];

    //DO NOT FORGET array.unshift

    this.xBody.push(body[0][0]);
    this.yBody.push(body[0][1]);

    this.xBody.push(body[1][0]);
    this.yBody.push(body[1][1]);

    this.move = function (){

        nextX = (this.xDir + this.xpos + size)%size;
        nextY = (this.yDir + this.ypos + size)%size;

        this.xBody.unshift(this.xpos)
        this.yBody.unshift(this.ypos)

        deleted.push([ 
            this.xBody[this.length - 1],  
            this.yBody[this.length - 1] 
        ]);

        this.xBody.splice(this.length - 1, 10)
        this.yBody.splice(this.length - 1, 10)

        this.prevxDir = this.xDir;
        this.prevyDir = this.yDir;

        var connect = false;

        playersArray.forEach(function(player) {
            for (var i = 0; i < player.xBody.length; i++) {
                if (player.xBody[i] == nextX && player.yBody[i] == nextY){
                    connect = true
                }
            }
            if (player.xpos == nextX && player.ypos == nextY){
                connect = true
            }
        });

        this.xpos = nextX
        this.ypos = nextY

        if (connect) {
            this.alive = false
            return false
        }

        return true
    }

    this.eat = function(){
        this.length += 2
    }

    this.updateDirection = function(key){
        
        if(key == this.left) {
            if (this.prevxDir != 1 || this.prevyDir != 0){
                this.xDir = -1
                this.yDir = 0
            }
        } else if(key == this.right) {
            if (this.prevxDir != -1 || this.prevyDir != 0){
                this.xDir = 1
                this.yDir = 0
            }
        } else if(key == this.down) {
            if (this.prevxDir != 0 || this.prevyDir != 1){
                this.xDir = 0
                this.yDir = -1
            }
        } else if(key == this.up) {
            if (this.prevxDir != 0 || this.prevyDir != -1){
                this.xDir = 0
                this.yDir = 1
            }
        }
    }


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

    playersArray.forEach(function(player) {

        if (player.prevxDir == 1 && player.prevyDir == 0){

            //if right
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-right"></i>');
        }else if (player.prevxDir == -1 && player.prevyDir == 0){

            //if left
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-left"></i>');
        }else if (player.prevxDir == 0 && player.prevyDir == 1){

            //if up
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-up"></i>');
        }else if (player.prevxDir == 0 && player.prevyDir == -1){

            //if down
            $('#' + 'x' + player.xpos + 'y' + player.ypos).removeClass().addClass('head' + player.tag).html('<i class="fa fa-arrow-down"></i>');
        }

        $('#' + 'x' + player.xBody[0] + 'y' + player.yBody[0]).removeClass('head' + player.tag).addClass('snek' + player.tag);

        $('#score' + player.tag).text( (player.length-3)/2 )

    });

    deleted.forEach(function(tile) {
        $('#' + 'x' + tile[0] + 'y' + tile[1]).removeClass().text('')
    });

    deleted = [];


    
}

function spawnApple(){

    missed = true

    while (missed){
        appleX = Math.floor(Math.random() * (size - 0) + 0);
        appleY = Math.floor(Math.random() * (size - 0) + 0);

        missed = false;

        playersArray.forEach(function(player) {

            for (var i = 0; i < player.xBody.length; i++) {
                if (player.xBody[i] == appleX && player.yBody[i] == appleY){
                    missed = true
                }
            }

            if (player.xpos == appleX && player.ypos == appleY){
                missed = true
            }
        });

    }

    apple = [appleX, appleY]

    $('#' + 'x' + apple[0] + 'y' + apple[1]).addClass('apple');
}

function play(){

    var turn = setInterval(function(){

        playing = false

        playersArray.forEach(function(player) {
            if (player.alive){
                player.move()


                if ( !(player.alive) ){

                    score = ( player.length - 3 )/2 ;
                    highScore =  parseInt(localStorage.getItem('highScore'));
                    if (score > highScore){
                        localStorage.setItem('highScore', score);
                    }
                    $("#highScore").text( localStorage.getItem('highScore') );

                } else if ( player.xpos == apple[0] && player.ypos == apple[1] ){
                    player.eat()
                    spawnApple()
                    playing = true
                } else {
                    playing = true
                }
            }
        });

        if ( !(playing) ){
            clearInterval(turn);
            $('#start').removeClass('hidden');
            $('#playerAmount').removeClass('hidden');

            $('#selectLabel').removeClass('hidden');
        }


        updateScreen()
    }, delay);

}


/*
    document.addEventListener('keydown', function updateUp1( event ) {
        Player1.up = event.keyCode
        console.log(Player1.up)
    } , true);

    document.removeEventListener('keydown', updateUp1(event) , true )
*/

// event listner: keydown -> P1 direction  udate
document.addEventListener('keydown', function(event) {
    playersArray.forEach(function(player) {
        player.updateDirection(event.keyCode)
    }, this);
});

$('#start').on('click', function(event){

    playersArray = []

    Player1 = 0
    Player2 = 0
    Player3 = 0
    Player4 = 0

    playerAmount = $('#playerAmount').val()

    for (var i = 0; i < playerAmount; i++) {
        switch (i) {
            case 0:

                Player1 = new Players([0, 2], [ [0, 1], [0, 0] ], [38, 40, 37, 39], 0)
                playersArray.push(Player1)

                break;

            case 1:

                Player2 = new Players([24, 2], [ [24, 1], [24, 0] ], [90, 83, 81, 68], 1)
                playersArray.push(Player2)

                break;

            case 2:

                Player3 = new Players([0, 26], [ [0, 25], [0, 24] ], [104, 101, 100, 102], 2)
                playersArray.push(Player3)

                break;

            case 3:

                Player4 = new Players([24, 26], [ [24, 25], [24, 24] ], [85, 74, 72, 75], 3)
                playersArray.push(Player4)

                break;
        }
        
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

    newStage()

    spawnApple();

    delay = 100;

    $("#scoreboard").empty()
    
    playersArray.forEach(function(player){
        $("#scoreboard").append('Score p' + (player.tag + 1) + ': <span id="score' + player.tag + '"></span> ')
    })


    play();
});

$('#reset').on('click', function(event){
    localStorage.setItem('highScore', '0');
    $("#highScore").text( 0 );
});

$( document ).ready(function() {  

    if (! ("highScore" in localStorage) ){
        localStorage.setItem('highScore', '0');
        highScore = 0;
    } else {
        highScore = localStorage.getItem("highScore");
    }

    $("#highScore").text( highScore );

    newStage();

});