var database = firebase.database();
var score = database.ref("Scores");

window.addEventListener("load",function() {
    if((window.location.href).indexOf('?') != -1) {
        var queryString = (window.location.href).substr((window.location.href).indexOf('?') + 1);
        var nickName = (queryString.split('='))[1];
        nickName = decodeURIComponent(nickName);
    }

    //constants
    var GAME_WIDTH = 1000;
    var GAME_HEIGHT = 500;

    //keep the game going
    var gameLive = true;

    //current level
    var level = 1;
    var life = 5;

    function Enemies(x, y, speedY, w, h) {
        this.x = x;
        this.y = y;
        this.speedY = speedY;
        this.w = w;
        this.h = h;
    }

    var enemies= [];
    initialize();

    //the player object
    var player = {
        x: 10,
        y: 190,
        speedX: 2,
        isMoving: false,  //keep track whether the player is moving or not
        w: 40,
        h: 40
    };

    //the goal object
    var goal = {
        x: 950,
        y: 190,
        w: 50,
        h: 40
    };

    var movePlayer = function() {
        player.isMoving = true;
    };

    var stopPlayer = function() {
        player.isMoving = false;
    };

    //grab the canvas and context
    var canvas = document.getElementById("gameCanvas");
    var ctx = canvas.getContext("2d");

    //event listeners to move player
    canvas.addEventListener('mousedown', movePlayer);
    canvas.addEventListener('mouseup', stopPlayer);
    canvas.addEventListener('touchstart', movePlayer);
    canvas.addEventListener('touchend', stopPlayer);

    //update the logic
    var update = function() {
        //check if you've won the game
        if(checkCollision(player, goal)) {
            alert('Win !');
            level += 1;
            life += 1;
            player.speedX += 1;
            player.x = 10;
            player.y = 190;
            player.isMoving = false;

            for(var ab = 0; ab < enemies.length; ab++){
                if(enemies[ab].speedY > 1){
                    enemies[ab].speedY += 1 ;
                }
                else{
                    enemies[ab].speedY -= 1 ;
                }
            }
        }

        //update player
        if(player.isMoving) {
            player.x = player.x + player.speedX;
        }

        //update enemies
        var i = 0;
        var n = enemies.length;

        enemies.forEach(function(element, index){

            //check for collision with player
            if(checkCollision(player, element)) {
                //stop the game
                if(life === 0){
                    writeUserData();
                    alert('Game Over');
                    // window.location.href = "../loginPage/login.html";
                }

                if(life > 0){
                    life -= 1 ;
                }

                player.x = 10;
                player.y = 190;
                player.isMoving = false;
            }

            //move enemy
            element.y += element.speedY;

            //check borders
            if(element.y <= 10) {
                element.y = 10;
                //element.speedY = element.speedY * -1;
                element.speedY *= -1;
            }
            else if(element.y >= GAME_HEIGHT - 50) {
                element.y = GAME_HEIGHT - 50;
                element.speedY *= -1;
            }
        });
    };

    //show the game on the screen
    var draw = function() {
        //clear the canvas
        ctx.clearRect(0,0,GAME_WIDTH,GAME_HEIGHT);

        //draw level
        ctx.font = "15px Verdana";
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillText("Level : " + level , 10, 15);
        ctx.fillText("Life : " + life , 10, 35);
        ctx.fillText("Speed : " + player.speedX , 10, 55);


        //draw player
        var img2 = document.getElementById("smile");
        ctx.drawImage(img2,player.x, player.y, player.w, player.h);

        //draw enemies
        var img = document.getElementById("scream");
        enemies.forEach(function(element, index){
            ctx.drawImage(img,element.x, element.y, element.w, element.h);
        });

        //draw goal
        var img3 = document.getElementById("kiss");
        ctx.drawImage(img3,goal.x, goal.y, goal.w, goal.h);
    };

    //gets executed multiple times per second
    var step = function() {
        update();
        draw();

        if(gameLive)
            window.requestAnimationFrame(step);
    };

    //Initialize enemies
    function initialize() {
        var startEnemies = {x: 100, y: 100, speedY: 2, w: 40, h: 40};

        for(var i = 0; i < 10; i++){
            enemies[i] = new Enemies(startEnemies.x, startEnemies.y, startEnemies.speedY, startEnemies.w, startEnemies.h);
            startEnemies.x += 100;

            if(i < 5)
                startEnemies.y += 50;
            else
                startEnemies.y -= 60;
        }
    }

    //check the collision between two rectangles
    var checkCollision = function(rect1, rect2) {
        var closeOnWidth = Math.abs(rect1.x - rect2.x) <= Math.max(rect1.w, rect2.w);
        var closeOnHeight = Math.abs(rect1.y - rect2.y) <= Math.max(rect1.h, rect2.h);
        return closeOnWidth && closeOnHeight;
    };

    function writeUserData() {
        score.push({
            nickName: nickName,
            level: level
        });
        window.location.replace("../loginPage/login.html");
    }
    //initial kick
    step();
});