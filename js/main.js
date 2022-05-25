"use strict";
$(function () {
    //function list
    function list(id,text,date='',category='',favorite='') {
        //if category not empty
        var category_html = '';
        if(category.length > 0 ){
            category_html += '<span>'+category+'</span>';
        }

        if(favorite){
            favorite = 'active';
        }
        else{
            date = $.timeago(date);
        }

        var html =
            '<div class="item_ch">' +
                '<div class="icon_ch"><span></span></div>' +
                '<div class="info_ch">' +
                    '<div class="id_ch">ID: <a href="#">'+id+'</a></div>' +
                    '<div class="text_ch">'+text+'</div>' +
                    '<div class="date_ch">Last update: <span>'+date+'</span></div>' +
                    '<div class="category_ch">'+category_html+'</div>' +
                    '<div class="favorite_ch '+favorite+'" data-id="'+id+'"></div>' +
                '</div>'+
            '</div>';
        return html;
    }


    //get favorites
    function get_favorites() {
        $("#result_favorites").html('');
        var retrievedObject = localStorage;
        
        $.each(retrievedObject , function(index, res) {
            var json_res = function(s){ try {  return JSON.parse(res); } catch (e) { return false; }}();
            if(json_res != null) {
                if (index == json_res.id) {
                    $("#result_favorites").append(list(json_res.id, json_res.value, json_res.updated_at, json_res.categories, 1));
                }
            }
        });
    }

    //get categories
    function get_categories() {
        $.ajax({
            type: "GET",
            url: "https://api.chucknorris.io/jokes/categories",
            dataType: "json",
            success: function (res) {
                // 2. LOADED!
                $.each(res , function(index, res) {
                    $(".categories_ch").append('<input type="radio" value="'+res+'" class="btn-check" name="categories" id="'+res+'" autocomplete="off"><label class="btn btn-secondary" for="'+res+'">'+res+'</label>');
                });
            }
        });
    }



    get_favorites();
    get_categories();


    //add/remove favorite
    $(document).on("click",".favorite_ch",function() {
        var id_ch = $(this).attr('data-id');
        console.log(id_ch);
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            $('[data-id='+id_ch+']').removeClass("active");
            localStorage.removeItem(id_ch);
        }else {
            $(this).addClass("active")
            localStorage.setItem(id_ch, JSON.stringify({
                'id': id_ch,
                'value': $(this).parent().find('.text_ch').text(),
                'updated_at': $(this).parent().find('.date_ch span').text(),
                'categories': $(this).parent().find('.category_ch').text()
            }));
        }
        get_favorites();
    });

    //menu
    $(document).on("click",".menu-c svg",function() {
        $('body').addClass("active-bar");
    });
    $(document).on("click",".close svg",function() {
        $('body').removeClass("active-bar");
    });

    $( 'input[name="type_search"]' ).change(function() {
        var change = $(this).val();
        console.log(change);
        if(change == 'categories'){
            $('input[name="categories"]').prop('required',true);
            $('input[name="search"]').prop('required',false);
            $('.search_ch').hide();
            $('.categories_ch').show();
        }
        else if(change == 'search'){
            $('input[name="categories"]').prop('required',false);
            $('input[name="search"]').prop('required',true);
            $('.search_ch').show();
            $('.categories_ch').hide();
        }
        else{
            $('input[name="categories"]').prop('required',false);
            $('input[name="search"]').prop('required',false);
            $('.search_ch').hide();
            $('.categories_ch').hide();
        }
    });




    // fetch API
    $("form").on("submit", function (e) {
        e.preventDefault();
        //get array values form
        $("#result").html('');
        var data = {};
        $(this).serializeArray().map(function(x){data[x.name] = x.value;});

        // 1. LOADING...
        $("#submit").attr("disabled", true);

        // AJAX
        //random
        if(data.type_search == 'random'){
            $.ajax({
                type: "GET",
                url: "https://api.chucknorris.io/jokes/random",
                dataType: "json",
                success: function (res) {
                    // 2. LOADED!
                    $("#submit").attr("disabled", false);
                    $("#result").html(list(res.id,res.value, res.updated_at,res.categories));
                },
                error: function (xhr, status, error) {
                    $("#submit").attr("disabled", false);
                    console.log(xhr);
                    $("#result").html("\n\t\t\t\t\tError: <i>" + JSON.parse(xhr.responseText).message + "</i>");
                },
            });
        }
        //category
        if(data.type_search == 'categories'){
            $.ajax({
                type: "GET",
                url: "https://api.chucknorris.io/jokes/random?category="+data.categories,
                dataType: "json",
                success: function (res) {
                    // 2. LOADED!
                    $("#submit").attr("disabled", false);
                    $("#result").append(list(res.id,res.value, res.updated_at,res.categories));
                },
                error: function (xhr, status, error) {
                    $("#submit").attr("disabled", false);
                    console.log(xhr);
                    $("#result").html("\n\t\t\t\t\tError <i>" + JSON.parse(xhr.responseText).message + "</i>");
                },
            });
        }
        //search
        if(data.type_search == 'search'){
            $.ajax({
                type: "GET",
                url: "https://api.chucknorris.io/jokes/search?query="+data.search,
                dataType: "json",
                success: function (res) {
                    // 2. LOADED!
                    $("#submit").attr("disabled", false);
                    $.each(res.result , function(index, res) {
                        $("#result").append(list(res.id,res.value, res.updated_at,res.categories));
                    });
                },
                error: function (xhr, status, error) {
                    $("#submit").attr("disabled", false);
                    $("#result").html("\n\t\t\t\t\tError <i>" + JSON.parse(xhr.responseText).message + "</i>");
                },
            });
        }

    });
});

