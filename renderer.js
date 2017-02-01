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
var Player1
var deleted = []

var $ = require('jquery');

function Players (startPos, body, keys) {

    this.length = 3;
    this.alive = true;
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

        this.xpos = nextX
        this.ypos = nextY

        this.prevxDir = this.xDir;
        this.prevyDir = this.yDir;

        var connect = false;

        for (var i = 0; i < this.xBody.length; i++) {
            if (this.xBody[i] == nextX && this.yBody[i] == nextY){
                connect = true
            }
        }

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
                var newTile = $("<div>", {id: 'x' + String(x) + 'y' + String(y), "class": "tile"});
                $('#stage').append(newTile);
            }
    }
}

function updateScreen(){

    

    if (Player1.prevxDir == 1 && Player1.prevyDir == 0){

        //if right
        $('#' + 'x' + Player1.xpos + 'y' + Player1.ypos).removeClass().addClass('head').html('<i class="fa fa-arrow-right"></i>');
    }else if (Player1.prevxDir == -1 && Player1.prevyDir == 0){

        //if left
        $('#' + 'x' + Player1.xpos + 'y' + Player1.ypos).removeClass().addClass('head').html('<i class="fa fa-arrow-left"></i>');
    }else if (Player1.prevxDir == 0 && Player1.prevyDir == 1){

        //if up
        $('#' + 'x' + Player1.xpos + 'y' + Player1.ypos).removeClass().addClass('head').html('<i class="fa fa-arrow-up"></i>');
    }else if (Player1.prevxDir == 0 && Player1.prevyDir == -1){

        //if down
        $('#' + 'x' + Player1.xpos + 'y' + Player1.ypos).removeClass().addClass('head').html('<i class="fa fa-arrow-down"></i>');
    }

    $('#' + 'x' + Player1.xBody[0] + 'y' + Player1.yBody[0]).removeClass('head').addClass('snek');

    deleted.forEach(function(tile) {
        $('#' + 'x' + tile[0] + 'y' + tile[1]).removeClass().text('')
    });

    deleted = [];


    $('#score').text( (Player1.length-3)/2 )
}

function spawnApple(){

    missed = true

    while (missed){
        appleX = Math.floor(Math.random() * (size - 0) + 0);
        appleY = Math.floor(Math.random() * (size - 0) + 0);

        if ( !(appleX in Player1.xBody && appleY in Player1.yBody) || !(appleX == Player1.xpos && appleY == Player1.ypos) ){
            apple = [appleX, appleY]
            missed = false
        }
    }

    $('#' + 'x' + apple[0] + 'y' + apple[1]).addClass('apple');
}

function play(){

    
    
    var turn = setInterval(function(){


        Player1.move()


        if ( !(Player1.alive) ){
            clearInterval(turn);

            score = (Player1.length-3)/2 ;
            highScore =  parseInt(localStorage.getItem('highScore'));
            if (score > highScore){
                localStorage.setItem('highScore', score);
            }
            $("#highScore").text( localStorage.getItem('highScore') );

            $('#start').removeClass('hidden')
        } else if ( Player1.xpos == apple[0] && Player1.ypos == apple[1] ){
            Player1.eat()
            spawnApple()
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
    Player1.updateDirection(event.keyCode)
}, false);

$('#start').on('click', function(event){

    Player1 = 0
    Player1 = new Players([0, 2], [ [0, 1], [0, 0] ], [38, 40, 37, 39])

    $('#start').text('restart').addClass('hidden');

    newStage()

    $("#x0y2").html('<i class="fa fa-arrow-up"></i>')
    $("#x0y1").html('<i class="fa fa-arrow-up"></i>')
    $("#x0y0").html('<i class="fa fa-arrow-up"></i>')

    spawnApple();

    pos = [0, 2];
    length = 3;
    prevDirection = [0, 1]
    direction = [0, 1]

    delay = 100;
    
    rounds = 0;


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

    Player1 = new Players([0, 2], [ [0, 1], [0, 0] ], [38, 40, 37, 39])

    updateScreen();

});