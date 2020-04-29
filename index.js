var APIkey = "f6fc44e78a875d0d66d66fc3394bc49a";

$(document).ready(function() {
    $("#search-button").on("click", function() {
        var search = $("#search-value").val();
        $("#search-value").val("");
        searchWeather(search);
    });

    $(".history").on("click", "li", function() {
        searchWeather($(this).text());
    });

    function newRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-action").text(text);
        $(".history").append(li);
    }

    function searchWeather(search) {
        $.ajax({
            type: "GET",
            url: "api.openweathermap.org/data/2.5/weather?q=" + search + "&appid=" + APIkey,
            dataType: "json",
            success: function(data) {
                if (history.indexOf(search) === -1) {
                    history.pushState(search);
                    window.localStorage.setItem("history", JSON.stringify(history));
                    newRow(search);
                }

                $("#today").empty();

                var title = $("<h3>").addClass("card-title").text(data.name + " (" + new DataView().toLocalDateString() + ")");
                var card = $("<div>").addClass("card");
                var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
                var temp = $("<p>").addClass("card-text").text("Temperature: "+ data.main.temp + " °F");
                var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
                var cardBody =$("<div>").addClass("card-body");

                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $("#today").append(card);

                forecast(search);
                getUV(data.coord.lat, data.coord.lon);
            }
        });
    }

    function forecast(search) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/forecast?q=" + search + "&appid=" + APIkey,
            dataType: "json",
            success: function(data) {
                $("#forcast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

                for (var i = 0; i <data.list.length; i++) {
                    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                        var col = $("<div>").addClass("col-md-2");
                        var card = $("<div>").addClass("card bg-primary text-white");
                        var body = $("<div>").addClass("card-body p-2");
                        var title = $("<h5>").addClass("card-title").text(new DataView(data.list[i].dt_txt).toLocalDateString());
                        var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                        var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
                        
                        col.append(card.append(body.append(title, p1,p2)));
                        $("#forcast .row").append(col);
                    }
                }
            }
        });
    }

    function getUV(lat,lon) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/uvi?appid=" + APIkey + "&lat=" + lat + "&lon=" + lon,
            dataType: "json",
            success: function(data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);
                if (data.value < 3) {
                    btn.addClass("btn-success");
                }
                else if (data.value < 7) {
                    btn.addClass("btn-warning");
                }
                else {
                    btn.addClass("btn-danger");
                }

                $("#today .card-body").append(uv.append(btn));
            }
        });
    }

    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0) {
        searchWeather(history[history.length-1]);
    }

    for (var i = 0; i < history.length; i++) {
        makeRow(history[i]);
    }
});