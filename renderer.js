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

        this.xBody.splice(this.length - 1, 10)
        this.yBody.splice(this.length - 1, 10)

        this.xpos = nextX
        this.ypos = nextY

        this.prevxDir = this.xDir;
        this.prevyDir = this.yDir;

        if (nextX in this.xBody && nextY in this.yBody){
            this.alive = false
            return false
        }

        return true
    }

    this.eat = function(){
        this.length ++
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
                console.log('pwet')
            }
        }
    }


};


var Player1 = new Players([0, 2], [ [0, 1], [0, 0] ], [38, 40, 37, 39])


function newStage(){
    $("#stage").empty();
    for (var y = size - 1; y > -1; y = y - 1){
            for (var x = 0; x < size; x++){
                var newTile = $("<div>", {id: 'x' + String(x) + 'y' + String(y), "class": "tile"});
                $('#stage').append(newTile);
            }
    }
}

function newMap(){
    var map = new Array(size)
    for (var i = 0; i < map.length; i++) {
        map[i] = new Array(size)
    }

    for (var y = size - 1; y > -1; y = y - 1){
            for (var x = 0; x < size; x++){
                map[x][y] = 0
            }
    }
    return map
}

function updateScreen(map){

    arrow = $('#' + 'x' + x + 'y' + y)

    for (var y = size - 1; y > -1; y = y - 1){
        for (var x = 0; x < size; x++){

            var tile = map[x][y]

            if (tile == -1){
                
                $('#' + 'x' + x + 'y' + y).addClass('apple');
            } else if (tile == 0) {
                $('#' + 'x' + x + 'y' + y).removeClass().empty();
            } else if (tile == 1) {
                if (direction[0] == 1 && direction[1] == 0){
                    //if right
                    $('#' + 'x' + x + 'y' + y).removeClass().addClass('head').html('<i class="fa fa-arrow-right"></i>');
                }else if (direction[0] == -1 && direction[1] == 0){
                    //if left
                    $('#' + 'x' + x + 'y' + y).removeClass().addClass('head').html('<i class="fa fa-arrow-left"></i>');
                }else if (direction[0] == 0 && direction[1] == 1){
                    //if up
                    $('#' + 'x' + x + 'y' + y).removeClass().addClass('head').html('<i class="fa fa-arrow-up"></i>');
                }else if (direction[0] == 0 && direction[1] == -1){
                    //if down
                    $('#' + 'x' + x + 'y' + y).removeClass().addClass('head').html('<i class="fa fa-arrow-down"></i>');
                }

            } else {
                $('#' + 'x' + x + 'y' + y).removeClass('head').addClass('snek');
            }

        }
    }
    $('#score').text( (length-3)/2 )
}

function spawnApple(map){
    missed = true
    if (length == (size*size)){
        return 0
    }
    while (missed){
        appleX = Math.floor(Math.random() * (size - 0) + 0);
        appleY = Math.floor(Math.random() * (size - 0) + 0);

        if (map[appleX][appleY] === 0){
            map[appleX][appleY] = -1
            missed = false
        }
    }
}

function play(map){

    
    
    var turn = setInterval(function(){

        for (var y = size - 1; y > -1; y = y - 1){
            for (var x = 0; x < size; x++){
                if (map[x][y] > 0 && map[x][y] != length){
                    map[x][y] += 1
                } else if (map[x][y] == length){
                    map[x][y] = 0
                }
            }
        }

        pos[0] = (direction[0] + pos[0] + size)%size
        pos[1] = (direction[1] + pos[1] + size)%size

        prevDirection = direction

        if (map[ pos[0] ][ pos[1] ] > 0){
            clearInterval(turn);

            score = (length-3)/2 ;
            highScore =  parseInt(localStorage.getItem('highScore'));
            if (score > highScore){
                localStorage.setItem('highScore', score);
            }
            $("#highScore").text( localStorage.getItem('highScore') );

            $('#start').removeClass('hidden')
        } else if ( map[ pos[0] ][ pos[1] ] == -1 ){
            length += 2
            spawnApple(map)
        }


        map[ pos[0] ][ pos[1] ] = 1


        updateScreen(map)
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

    $('#start').text('restart').addClass('hidden');

    newStage()

    var map = newMap();

    map[0][0] = 3;
    map[0][1] = 2;
    map[0][2] = 1;

    $("#x0y2").html('<i class="fa fa-arrow-up"></i>')
    $("#x0y1").html('<i class="fa fa-arrow-up"></i>')
    $("#x0y0").html('<i class="fa fa-arrow-up"></i>')

    spawnApple(map);

    pos = [0, 2];
    length = 3;
    prevDirection = [0, 1]
    direction = [0, 1]

    delay = 100;
    
    rounds = 0;


    play(map);
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

    var map = newMap();

    map[0][0] = 3;
    map[0][1] = 2;
    map[0][2] = 1;

    $("#x0y2").html('<i class="fa fa-arrow-up"></i>')
    $("#x0y1").html('<i class="fa fa-arrow-up"></i>')
    $("#x0y0").html('<i class="fa fa-arrow-up"></i>')

    updateScreen(map);

});