function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}
var width = $(window).width();
var height = $(window).height();

var game = new Phaser.Game(width, height, Phaser.CANVAS, 'Eco Cat', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.spritesheet('cat', 'img/nyan-cat.png', 100, 70, 6);
    game.load.image('star', 'img/star-small.png');
    game.load.image('bg', 'img/stars.png');

}

var cat;
var ennemies;
var heading = null;
var acceleration = null;
var map = null;
var max_stars = 3;
var nb_rows = Math.round(width / 50) - 1;
var timer_enemy = 0;
var interval_enemy = 2;
var enemies = [];

function create() {

    bg = game.add.tileSprite(0, 0, width, 1000000, 'bg');
    game.world.setBounds(0, 0, width, 1000000);
    game.stage.backgroundColor = '#2d2d2d';

    cat = game.add.sprite(width / 2 + 50, 999800, 'cat');

    game.physics.enable(cat, Phaser.Physics.ARCADE);
    game.camera.follow(cat, Phaser.Camera.FOLLOW_LOCKON);
    game.camera.y += 200;
    style = 'STYLE_LOCKON';

    cat.name = 'cat';
    cat.pivot.x = 35;
    cat.pivot.y = 50;
    cat.anchor.setTo(0.5, 0.5);
    cat.angle -= 90;
    cat.animations.add('move');
    cat.animations.play('move', 10, true, true);
    cat.enableBody = true;
    cat.physicsBodyType = Phaser.Physics.ARCADE;
    cat.body.collideWorldBounds = true;
}

function update() {

    // object1, object2, collideCallback, processCallback, callbackContext
    // game.physics.arcade.collide(sprite1, sprite2, collisionHandler, null, this);
    if (this.game.time.totalElapsedSeconds() >= timer_enemy) {
        var nb = getRandomIntInclusive(1, max_stars);
        var row = getRandomIntInclusive(0, nb_rows);
        var pos_x = row * 50;
        var g = game.add.group();
        for (var i = 0; i < nb; i++) {
            g.create(pos_x, cat.y - height - (i * 100),'star');
        }
        timer_enemy += interval_enemy;
        enemies.push(g);
    }
    navigator.compass.getCurrentHeading(compassSuccess, compassError);
    navigator.accelerometer.getCurrentAcceleration(accelerometerSuccess, accelerometerError);
    moveCat();

}

function collisionHandler (obj1, obj2) {

    //  The two sprites are colliding
    game.stage.backgroundColor = '#992d2d';

}

function render() {

/*    game.debug.body(cat);*/
    game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);

}

function moveCat() {
    if (acceleration) {
        cat.body.velocity.y = (acceleration.z - 5) * -20;
        cat.body.velocity.x = acceleration.x * -20;
    }
    cat.body.velocity.y -= 250;
}

function compassSuccess (data) {
    heading = data.trueHeading;
    // $(".debug #true").html("heading: " + heading);
}

function compassError (data) {
    $(".debug #true").html("heading: " + data);
}

function accelerometerSuccess (data) {
    acceleration = data;
    // $(".debug #x").html("x = " + data.x);
    // $(".debug #y").html("y = " + data.y);
    // $(".debug #z").html("z = " + data.z);
}

function accelerometerError (data) {
    $(".debug #x").html("x = " + data);
    $(".debug #y").html("y = " + data);
    $(".debug #z").html("z = " + data);
}



/*var ecocat = $("#ecocat:first");
var ecocat_width = 80;
var ecocat_height = 256;

var bg = $(".app");
ecocat.offset({top: height / 2, left: width / 2});*/
/*var game = {
    position: ecocat.offset(),
    acc: null,
    compass: null,
    old_compass: null,
    max_z: 0,
    min_z: 0,
    bg_pos: 0,
    game_speed: 2,
    frequency: 100,
    ennemies: [],
    ennemies_count: 0,
    init: function () {
        setInterval(game.updateCat, 40);
    },
    updateCompass: function (data) {
        game.compass = data.trueHeading;
        $(".debug #true").html("true = " + data.trueHeading);
    },
    updateAcc: function (data) {
        game.acc = data;
        $(".debug #x").html("x = " + data.x);
        $(".debug #y").html("y = " + data.y);
        $(".debug #z").html("z = " + data.z);
    },
    createEnnemies: function () {
        var nb = getRandomIntInclusive(1, 6);
        var pos_x = getRandomIntInclusive(25, width - 25);
        for (var i = 0; i < nb; i++) {
            $(".app").append("<img src='img/star-small.png' id='star-" + game.ennemies_count + "'>");
            var id = $("#star-" + game.ennemies_count + ":first");
            var pos_y = 0 - (i * 50);
            id.css({
                "position": "absolute",
                "top": pos_y,
                "left": pos_x
            });
            game.ennemies.push({
                pos_y: pos_y,
                pos_x: pos_x,
                dmg: 1,
                id: id
            });
            game.ennemies_count++;
        }
        console.log(game.ennemies);
    },
    moveEnnemies: function () {
        for (var i = 0; i < game.ennemies.length; i++) {
            var ennemy = game.ennemies[i];
            ennemy.pos_y += game.game_speed;
            ennemy.id.offset({
                top: ennemy.pos_y,
                left: ennemy.pos_x
            });
            if (ennemy.pos_y > height - 50) {
                ennemy.id.remove();
                game.ennemies.slice(i, i + 1);
            }
        }
    },
    updateCat: function () {
        if (getRandomIntInclusive(0, game.frequency) == 0) {
            game.createEnnemies();
        }
        game.moveEnnemies();
        game.bg_pos += game.game_speed;
        bg.css({"background-position": "0px " + game.bg_pos + "px"});
        var speed = 0;
        if (game.acc.z > 7) {
            speed = -4;
        } else if (game.acc.z > 6) {
            speed = -2;
        } else if (game.acc.z < 4) {
            speed = 4;
        } else if (game.acc.z < 3) {
            speed = 2;
        }
        var rotate = 0;
        if (game.acc.x > 2) {
            rotate = -4;
        } else if (game.acc.x > 1) {
            rotate = -2;
        } else if (game.acc.x < -2) {
            rotate = 4;
        } else if (game.acc.x < -1) {
            rotate = 2;
        }
        game.old_compass = game.compass;
        game.position = ecocat.offset();
        var x = game.position.top + speed;
        var y = game.position.left + rotate;
        x = Math.min(x, height - ecocat_height);
        x = Math.max(0, x);
        y = Math.min(y, width - ecocat_width);
        y = Math.max(0, y);
        ecocat.offset({top: x, left: y});
    }
}
game.init();*/