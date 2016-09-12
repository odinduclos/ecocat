angular.module('starter.controllers', [])
// angular.module('services', [])

.service('UserService', function() {

 var setUser = function(user_data) {
  $.post( "test.php", {user: user_data} );

  window.localStorage.starter_facebook_user = JSON.stringify(user_data);
};

var getUser = function(){
  return JSON.parse(window.localStorage.starter_facebook_user || '{}');
};
  // var setBoutique = function(boutique_data) {
  //   alert('cococo')
  //   window.localStorage.boutique = JSON.stringify(boutique_data);
  // };

  // var getBoutique = function(){

  //   alert('toto')
  //   return JSON.parse(window.localStorage.boutique || '{}');
  // };

  return {
     getUser: getUser,
     setUser: setUser,

  };
})

.service('BoutiqueService', function() {

 var setBoutique = function(boutique_data) {
  console.log(localStorage)

  window.localStorage.boutique = JSON.stringify(boutique_data);
  console.log(localStorage)
};

var getBoutique = function(){

  return JSON.parse(window.localStorage.boutique || '{}');
};

return {
  getBoutique: getBoutique,
  setBoutique: setBoutique
};
})

// $scope, $state, $q, UserService, $ionicLoading
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $state, $q, UserService, $location) {

  //$scope.$on('$ionicView.enter', function(e) {
  //});
var check = UserService.getUser('facebook')
if(!check.userID){
  // alert('totot')
  $location.path('/app/home')
}

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
     scope: $scope
  }).then(function(modal) {
     $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
     $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {

     var fbLoginSuccess = function(response) {

      if (!response.authResponse){
       fbLoginError("Cannot find the authResponse");
       return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
       alert(profileInfo.name)
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
       authResponse: authResponse,
       userID: profileInfo.id,
       name: profileInfo.name,
       email: profileInfo.email,
       picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
    });
      $ionicLoading.hide();
      alert('Hide false')
      $state.go('app.home');
   }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
   });
 };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
     console.log('fbLoginError', error);
     $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
     var info = $q.defer();

     facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
       console.log(response);
       info.resolve(response);
    },
    function (response) {
       console.log(response);
       info.reject(response);
    }
    );
     return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
     facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

        // Check if we have our user saved
        var user = UserService.getUser('facebook');

        if(!user.userID){
           getFacebookProfileInfo(success.authResponse)
           .then(function(profileInfo) {
            // For the purpose of this example I will store user data on local storage
            UserService.setUser({
             authResponse: success.authResponse,
             userID: profileInfo.id,
             name: profileInfo.name,
             email: profileInfo.email,
             picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
          });

            $state.go('app.login');
         }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
         });
        }else{
           $state.go('app.login');
        }
     } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.

        console.log('getLoginStatus', success.status);

        $ionicLoading.show({
           template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
     }
  });
};
// $scope.modal.show();
};

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
     console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
   }, 1000);
 };
 $scope.teste = function(e) {
  alert(e)
  alert('tototo')
}
})

.controller('JeuxCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $state, BoutiqueService) {

  // $ionicModal.fromTemplateUrl('jeux.html', {
  //   scope: $scope,
  //   animation: 'slide-in-up'
  // }).then(function(modal) {
  //   $scope.modal = modal;
  // });
  // $scope.openModal = function() {
  //   $scope.modal.show();
  // };
  // $scope.closeModal = function() {
  //   $scope.modal.hide();
  // };
  // // Cleanup the modal when we're done with it!
  // $scope.$on('$destroy', function() {
  //   $scope.modal.remove();
  // });
  // // Execute action on hide modal
  // $scope.$on('modal.hidden', function() {
  //   // Execute action
  // });
  // // Execute action on remove modal
  // $scope.$on('modal.removed', function() {
  //   // Execute action
  // });


var width = $(window).width();
var height = $(window).height();
var game = new Phaser.Game(width, height, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });
var cat = null;
var heading = null;
var acceleration = null;
var max_stars;
var nb_rows = Math.round(width / 50) - 1;
var timer_enemy;
var interval_enemy;
var enemies = null;
var game_speed;
var life;
var timer_until_shield;
var shield;
var cat_group = null;
var score;
var end_game;
var last_time_score;
var combo;
var duration_wo_shield;
var duration_shield;
var bar;
var next_acc_check;
var option = BoutiqueService.getBoutique('boutique')
var cat_speed = 0;
init_vars();
function preload() {

 game.load.spritesheet('cat', 'img/nyan-cat.png', 100, 70, 6);
 game.load.spritesheet('explosion', 'img/explosion.png', 200, 190, 5);
 game.load.image('star', 'img/star-small.png');
 game.load.image('bg', 'img/stars.png');
 game.load.image('flower', 'img/flower.png');
 game.load.image('shield', 'img/shield.png');

}


function init_vars() {
 max_stars = 3;
 timer_enemy = 0;
 interval_enemy = 2;
 game_speed = 255;

 if (option.vitesse)
   cat_speed = option.vitesse;

if (option.vie > 0)
 life = option.vie;
else
 life = 6;

timer_until_shield = 0;
shield = false;
score = 0;
end_game = false;
last_time_score = 0;
combo = 0;

if (option.regener > 0)
   game_speed = option.regener;
else
   duration_wo_shield = 10;

if (option.shield > 0)
   duration_shield = option.shield;
else
   duration_shield = 5;

bar = 100;
next_acc_check = 0;
$("#reset").on("click", reset);
$("#menu").css("width", width + "px");
}


function getRandomIntInclusive(min, max) {
 return Math.floor(Math.random() * (max - min +1)) + min;
}

function create_env() {
 cat = game.add.sprite(width / 2 + 50, 999800, 'cat');
 cat_group = game.add.group();
 cat_group.add(cat);
 game.physics.arcade.enable(cat);
 enemies = game.add.physicsGroup();
 game.camera.follow(cat, Phaser.Camera.FOLLOW_LOCKON);
 game.camera.y += 200;

 cat.name = 'cat';
 cat.pivot.x = 35;
 cat.pivot.y = 50;
 cat.anchor.setTo(0.5, 0.5);
 cat.angle -= 90;
 cat.animations.add('move');
 cat.animations.play('move', 10, true, true);
 cat.enableBody = true;
 cat.body.collideWorldBounds = true;
 cat.body.immovable = true;
 cat.body.setSize(55, 80, -5, 0);

 print_life(life);
 print_score(score);
}


function print_life(life) {
 var elmt = "";
 for (var i = 0; i < life; i++) {
  elmt += "<img src='img/heart.png'>";
}
$("#life").html(elmt);
}

function print_score(score) {
 $("#score").html(score);
}

function print_combo(combo) {
 $("#score").append("+" + combo);
}

function create() {
 game.physics.startSystem(Phaser.Physics.ARCADE);
 game.add.tileSprite(0, 0, width, 1000000, 'bg');
 game.world.setBounds(0, 0, width, 1000000);
 game.stage.backgroundColor = '#2d2d2d';
 game.input.onDown.add(activate_shield, this);
 game.time.events.add(Phaser.Timer.SECOND * 60, increase_game_speed, this);
 game.time.events.add(Phaser.Timer.SECOND * 20, add_enemies, this);
 create_env();
}

function increase_game_speed () {
 game_speed += 50;
 game.time.events.add(Phaser.Timer.SECOND * 60, increase_game_speed, this);
}

function add_enemies () {
 max_stars += 1;
 interval_enemy -= 0.1;
 game.time.events.add(Phaser.Timer.SECOND * 20, add_enemies, this);
}

function update() {
 if (end_game) {
  cat.destroy();
  return;
}
var cur_time = this.game.time.totalElapsedSeconds();
game.physics.arcade.collide(cat, enemies, collisionHandler, null, this);
if (cur_time >= timer_enemy) {
  var nb = getRandomIntInclusive(1, max_stars);
  var row = getRandomIntInclusive(0, nb_rows);
  var pos_x = row * 50;
  for (var i = 0; i < nb; i++) {
   var star = game.add.sprite(pos_x, cat.y - height - (i * 150), 'star');
   game.time.events.add(Phaser.Timer.SECOND * (height / game_speed) * 4, destroy, star);
   enemies.add(star);
   star.pivot.x = 35;
   star.pivot.y = 50;
   star.anchor.setTo(0.5, 0.5);
   star.body.angularVelocity = getRandomIntInclusive(-200, 200);
}
timer_enemy = cur_time + interval_enemy;
}
if (cur_time >= next_acc_check + 0.15) {
  next_acc_check = cur_time;
        // navigator.compass.getCurrentHeading(compassSuccess, compassError);
        navigator.accelerometer.getCurrentAcceleration(accelerometerSuccess, accelerometerError);
     }
     moveCat();
     if (cur_time >= last_time_score + 2) {
       score += combo;
       print_score(score);
       combo = 0;
    }
 }

 function destroy (obj) {
   this.destroy();
}

function collisionHandler (obj1, obj2) {

   var emitter = game.add.emitter(0, 0, 100);

   emitter.makeParticles('flower');
   emitter.gravity = 200;
   particleBurst(emitter, obj2);
   obj2.destroy();
   if (!shield) {
   console.log("BOOM");
    life--;
    print_life(life);
    if (life === 0) {
     var exp = game.add.sprite(cat.body.x + 25, cat.body.y + 35, 'explosion');
     exp.animations.add('explode');
     exp.animations.play('explode', 10, false, true);
     end_game = true;
     game.physics.arcade.enable(exp);
     exp.anchor.setTo(0.5, 0.5);
     cat_group.add(exp);
     cat.visible = false;
     enemies.destroy();
     $("#screen").show();
     $("#menu").hide();
     var scores = JSON.parse(localStorage.getItem("scores"));
     var nbr = option.nbr;
     var vitesse = option.vitesse;
     var vie = option.vie;
     var regener = option.regener;
     var boucle = option.shield;

     if (scores === null) {
      scores = [];
   }
   scores.push(score);
   console.log(score)
   console.log(option.nbr)
   if (option.nbr === null || option.nbr === undefined)
      nbr = score;
   else
      nbr = option.nbr + score;

   BoutiqueService.setBoutique({
    vie: vie,
    vitesse: vitesse,
    regener: regener,
    shield: boucle,
    nbr: nbr,
 });
   scores.sort(compareNumbersDesc);
   localStorage.setItem("scores",JSON.stringify(scores));
   $("#screen ol").html("");
   for (var i = 0; i < scores.length && i < 4; i++) {
      $("#screen ol").append("<li>" + scores[i] + "</li>");
   }
}
} else {
 score++;
 var cur_time = this.game.time.totalElapsedSeconds();
 if (cur_time < last_time_score + 2) {
  combo += Math.round(0.5 * (combo + 1));
}
print_score(score);
if (combo > 0) {
  print_combo(combo);
}
last_time_score = cur_time;
}
}

function compareNumbersDesc(a, b) {
   return b - a;
}

function render() {

    // game.debug.body(cat);
    // game.debug.body(enemies);
    // game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);

 }

 function particleBurst(emitter, obj) {

  emitter.x = obj.body.x + 25;
  emitter.y = obj.body.y + 25;

  emitter.start(true, 4000, null, 10);
  game.time.events.add(2000, destroyEmitter, emitter);

}

function destroyEmitter() {

  this.destroy();

}

function activate_shield () {
  console.log("try activate shield");
  if (this.game.time.totalElapsedSeconds() > timer_until_shield) {
   console.log("activate shield");
   var s = game.add.sprite(cat.body.x + 25, cat.body.y + 35, 'shield');
   s.anchor.setTo(0.5, 0.5);
   game.physics.arcade.enable(s);
   cat_group.add(s);
   game.time.events.add(duration_shield * 1000, destroyShield, s);
   timer_until_shield = game.time.totalElapsedSeconds() + duration_wo_shield;
   game.time.events.repeat(Phaser.Timer.SECOND / (10 / duration_shield), 10, reduceBar, this);
   shield = true;
}
}

function reduceBar() {
  bar -= 10;
  $("#shield").attr("value", bar);
}

function increaseBar() {
  bar += 10;
  $("#shield").attr("value", bar);
}

function destroyShield () {
  this.destroy();
  shield = false;
  game.time.events.repeat(Phaser.Timer.SECOND / (10 / (duration_wo_shield - duration_shield)), 10, increaseBar, this);
}

function moveCat() {
  if (acceleration) {
   cat_group.setAll('body.velocity.y', (acceleration.z - 5) * -20 - game_speed - cat_speed);
   cat_group.setAll('body.velocity.x', acceleration.x * -20);
}
}

function compassSuccess (data) {
  heading = data.trueHeading;
}

function compassError (data) {
    // $(".debug #true").html("heading: " + data);
 }

 function accelerometerSuccess (data) {
  acceleration = data;
}

function accelerometerError (data) {
    // $(".debug #x").html("x = " + data);
    // $(".debug #y").html("y = " + data);
    // $(".debug #z").html("z = " + data);
 }

 function reset() {
  cat.destroy();
  cat_group.destroy();

  init_vars();
  create_env();

  $("#screen").hide();
  $("#menu").show();
}
})



.controller('InfoCtrl', function($scope, $stateParams, $ionicLoading) {
 $scope.submit = function(superficie, ordinateur, tv, frigo, value) {
  $ionicLoading.show({
   template: 'Logging in...'
});
  console.log(tv);
  $.post( "test.php", { superficie: superficie, ordinateur: ordinateur, tv: tv, frigo: frigo, nbrPersonne: value} );
      // $scope.list.push(this.text);
      // $scope.text = '';
   };
   $ionicLoading.hide()

})
.controller('BoutiqueCtrl', function($scope, $stateParams,$ionicHistory, $ionicModal, $timeout, $ionicLoading, $state, $q, BoutiqueService,$ionicPopup, $location) {
  // var check = BoutiqueService.getBoutique();
  console.log(localStorage)
  // if(check){
  //   alert('toto')
  // BoutiqueService.setBoutique({
  //   nbr: 15,
  //   vitesse: 50,
  //   vie: 50,
  //   regener: 50,
  //   shield: 50
  // });

console.log(BoutiqueService.getBoutique('boutique'));

$scope.$on("$ionicView.enter", function(event, data){

 var option = BoutiqueService.getBoutique('boutique')

 var nbr = option.nbr;
 var vitesse = option.vitesse;
 var vie = option.vie;
 var regener = option.regener;
 var shield = option.shield;
 console.log(nbr)
 console.log(localStorage)
 $scope.nbr = nbr;
 $scope.vitesse = vitesse;
 $scope.vie = vie;
 $scope.regener = regener;
 $scope.shield = shield;
 console.log('tototo')


  localStorage.clear()
  console.log('Je suis le nbr', nbr);


  $scope.plus =  function(value) {
     var nbrV = nbr - 500;
     var nbrVie = nbr - 600;
     var nbrRegener = nbr - 850;
     var nbrShield = nbr - 900;
     console.log("Je suis la value",value)
     if (nbr !== undefined || nbr !== undefined || nbr <= 0) {
        if (value == 'vitesse' && nbrV > 0 && vitesse < 405 || vitesse === undefined) {
         if (vitesse === undefined || vitesse === null)
            vitesse = 255 + 30
         else
            vitesse = vitesse + 30;
         nbr = nbr - 500;
         BoutiqueService.setBoutique({
          vie: vie,
          vitesse: vitesse,
          regener: regener,
          shield: shield,
          nbr: nbr,
       });
         $scope.nbr = nbr;
         $scope.vitesse = vitesse;

      } else if (value == 'vie' && nbrVie > 0 && vie < 11 || vie === undefined) {
         if (vie === undefined || vie === null)
            vie = 6 + 1;
         else
            vie = vie + 1;
         nbr = nbr - 600;
         BoutiqueService.setBoutique({
          vie: vie,
          vitesse: vitesse,
          regener: regener,
          shield: shield,
          nbr: nbr,
       });
         $scope.nbr = nbr;
         $scope.vie = vie;

      } else if (value == 'regener' && nbrRegener > 0 && regener > 4 || regener === undefined) {
         if (regener === undefined || regener === null)
            regener = 10 - 1;
         else
            regener = regener - 1;
         nbr = nbr - 850;
         BoutiqueService.setBoutique({
          vie: vie,
          vitesse: vitesse,
          regener: regener,
          shield: shield,
          nbr: nbr,
       });
         $scope.nbr = nbr;
         $scope.regener = regener;

      } else if (value == 'shield' && nbrShield > 0 && shield < 11 || shield === undefined) {
         if (shield === undefined || shield === null)
            shield = 5 + 2;
         else
            shield = shield + 2;
         nbr = nbr - 900;
         BoutiqueService.setBoutique({
          vie: vie,
          vitesse: vitesse,
          regener: regener,
          shield: shield,
          nbr: nbr,
       });
         $scope.nbr = nbr;
         $scope.shield = shield;

      } else {
       var alertPopup = $ionicPopup.alert({
        title: 'Information',
        template: 'Vous n\'avez pas suffisamment de credit',
        cssClass: 'alert',
        okType: 'button-dark'

     });

    }
 } else {
    var alertPopup = $ionicPopup.alert({
     title: 'Information',
     template: 'Vous n\'avez pas suffisamment de credit',
     cssClass: 'alert',
     okType: 'button-dark'

  });
 }

}});

$scope.moin =  function(value) {
 if (value == 'vitesse') {

 } else if (value == 'vie') {

 } else if (value == 'renvoi') {

 } else if (value == 'shield') {

 }

 alert('totot')

}




})


.controller('PlaylistCtrl', function($scope, $stateParams) {
});
