var api = {
    logged: false,
    user: null,
    login: function (inputs) {
        console.log("login", inputs);
        // call API, if (OK) then
        logged = true;
        $("#param").show();
        $.get("ecocat.view.html", app.initView);
    },
    subscribe: function (inputs) {
        console.log("subscribe", inputs);
        // call API, if (OK) then
        api.login(inputs);
    },
    saveParams: function (inputs) {
        console.log("save params", inputs);
        // call API

    }
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        if (!api.logged) {
            $.get("login.view.html", app.initView);
        } else {
            $.get("ecocat.view.html", app.initView);
        }
        $("#param").on("click", function () {
            console.log($(this));
            $('#param-modal').modal();
        });
        $(".close-modal").on("click", function () {
            $(".modal").modal('hide');
        });
        console.log('Received Event: ' + id);
    },
    security: function (action) {
        console.log("action", action);
        if (!api.logged && (action != "login" || action != "subscribe")) {
            $.get("login.view.html", app.initView);
        }
    },
    initView: function (page) {
        if (!api.logged);
        $("section#view").html(page);
        $(".loadview").on("click", function () {
            var action = $(this).data("action")
            app.security(action);
            $.get(action + ".view.html", app.initView);
        });
        $(".api").on("click", function (e) {
            e.preventDefault();
            api[$(this).data("action")]($(this).parents("form").find("input"));
        });
        $.material.init();
    }
};


app.initialize();