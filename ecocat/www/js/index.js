var api = {
    logged: true,
    user: null,
    login: function (inputs) {
        console.log("login", inputs);
        // call API, if (OK) then
        api.logged = true;
        app.loadView("ecocat");
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
$(".app").css({"height": $(window).height()})
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
        app.loadView("ecocat");
        $("#param").on("click", function () {
            console.log($(this));
            $('#param-modal').modal();
        });
        $(".close-modal").on("click", function () {
            $(".modal").modal('hide');
        });
        console.log('Received Event: ' + id);
    },
    loadView: function (action) {
        if (action != "login" && action != "subscribe") {
            if (!api.logged) {
                $("#param").hide();
                $.get("login.view.html", app.initView);
                return;
            }
            $("#param").show();
        } else {
            $("#param").hide();
        }
        $.get(action + ".view.html", app.initView);
    },
    initView: function (page) {
        if (!api.logged);
        $("section#view").html(page);
        $(".loadview").on("click", function () {
            app.loadView($(this).data("action"));
        });
        $(".api").on("click", function (e) {
            e.preventDefault();
            api[$(this).data("action")]($(this).parents("form").find("input"));
        });
        $.material.init();
    }
};

app.initialize();