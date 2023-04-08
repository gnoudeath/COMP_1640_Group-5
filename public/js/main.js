

(function ($) {
    "use strict";
    
    $(document).ready(function ($) {

        // testimonial sliders
        $(".testimonial-sliders").owlCarousel({
            items: 1,
            loop: true,
            autoplay: true,
            responsive: {
                0: {
                    items: 1,
                    nav: false
                },
                600: {
                    items: 1,
                    nav: false
                },
                1000: {
                    items: 1,
                    nav: false,
                    loop: true
                }
            }
        });

        // homepage slider
        $(".homepage-slider").owlCarousel({
            items: 1,
            loop: true,
            autoplay: true,
            nav: true,
            dots: false,
            navText: ['<i class="fas fa-angle-left"></i>', '<i class="fas fa-angle-right"></i>'],
            responsive: {
                0: {
                    items: 1,
                    nav: false,
                    loop: true
                },
                600: {
                    items: 1,
                    nav: true,
                    loop: true
                },
                1000: {
                    items: 1,
                    nav: true,
                    loop: true
                }
            }
        });

        // logo carousel
        $(".logo-carousel-inner").owlCarousel({
            items: 4,
            loop: true,
            autoplay: true,
            margin: 30,
            responsive: {
                0: {
                    items: 1,
                    nav: false
                },
                600: {
                    items: 3,
                    nav: false
                },
                1000: {
                    items: 4,
                    nav: false,
                    loop: true
                }
            }
        });

        // count down
        if ($('.time-countdown').length) {
            $('.time-countdown').each(function () {
                var $this = $(this), finalDate = $(this).data('countdown');
                $this.countdown(finalDate, function (event) {
                    var $this = $(this).html(event.strftime('' + '<div class="counter-column"><div class="inner"><span class="count">%D</span>Days</div></div> ' + '<div class="counter-column"><div class="inner"><span class="count">%H</span>Hours</div></div>  ' + '<div class="counter-column"><div class="inner"><span class="count">%M</span>Mins</div></div>  ' + '<div class="counter-column"><div class="inner"><span class="count">%S</span>Secs</div></div>'));
                });
            });
        }

        // projects filters isotop
        $(".product-filters li").on('click', function () {

            $(".product-filters li").removeClass("active");
            $(this).addClass("active");

            var selector = $(this).attr('data-filter');

            $(".product-lists").isotope({
                filter: selector,
            });

        });

        // isotop inner
        $(".product-lists").isotope();

        // magnific popup
        $('.popup-youtube').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });

        // light box
        $('.image-popup-vertical-fit').magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            mainClass: 'mfp-img-mobile',
            image: {
                verticalFit: true
            }
        });

        // homepage slides animations
        $(".homepage-slider").on("translate.owl.carousel", function () {
            $(".hero-text-tablecell .subtitle").removeClass("animated fadeInUp").css({ 'opacity': '0' });
            $(".hero-text-tablecell h1").removeClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.3s' });
            $(".hero-btns").removeClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.5s' });
        });

        $(".homepage-slider").on("translated.owl.carousel", function () {
            $(".hero-text-tablecell .subtitle").addClass("animated fadeInUp").css({ 'opacity': '0' });
            $(".hero-text-tablecell h1").addClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.3s' });
            $(".hero-btns").addClass("animated fadeInUp").css({ 'opacity': '0', 'animation-delay': '0.5s' });
        });



        // stikcy js
        $("#sticker").sticky({
            topSpacing: 0
        });

        //mean menu
        $('.main-menu').meanmenu({
            meanMenuContainer: '.mobile-menu',
            meanScreenWidth: "992"
        });

        // search form
        $(".search-bar-icon").on("click", function () {
            $(".search-area").addClass("search-active");
        });

        $(".close-btn").on("click", function () {
            $(".search-area").removeClass("search-active");
        });

    });


    jQuery(window).on("load", function () {
        jQuery(".loader").fadeOut(1000);
    });


}(jQuery));

var tabLinks = document.querySelectorAll(".tablinks");
var tabContent = document.querySelectorAll(".tabcontent");

tabLinks.forEach(function (el) {
    el.addEventListener("click", openTabs);
});

function openTabs(el) {
    var btn = el.currentTarget; // lắng nghe sự kiện và hiển thị các element
    var electronic = btn.dataset.electronic; // lấy giá trị trong data-electronic

    tabContent.forEach(function (el) {
        el.classList.remove("active");
    }); //lặp qua các tab content để remove class active

    tabLinks.forEach(function (el) {
        el.classList.remove("active");
    }); //lặp qua các tab links để remove class active

    document.querySelector("#" + electronic).classList.add("active");
    // trả về phần tử đầu tiên có id="" được add class active

    btn.classList.add("active");
    // các button mà chúng ta click vào sẽ được add class active
}

$(document).ready(() => {
    // $(document).on("click", "#like-idea",() => {
    //     const $button = $("#like-idea");
    //     if (!$button.hasClass("disabled")) {
    //         const settings = {
    //             "async": true,
    //             "crossDomain": true,
    //             "url": `http://localhost:3000/likeIdeas/${id}`,
    //             "method": "POST",
    //             "headers": {
    //                 "cache-control": "no-cache",
    //                 "postman-token": "472a0d8c-3acd-61f6-88f3-738a13a45af3"
    //             }
    //         };
    //         $.ajax(settings).done(function (response) {
    //             $("#number-like").html(response.data.like + 1);
    //         });
    //         $button.addClass("disabled");
    //     }
    // });
    // $(document).on("click", "#dislike-idea",() => {
    //     const $button = $("#dislike-idea");
    //     if (!$button.hasClass("disabled")) {
    //         const settings = {
    //             "async": true,
    //             "crossDomain": true,
    //             "url": `http://localhost:3000/disLikeIdeas/${id}`,
    //             "method": "POST",
    //             "headers": {
    //                 "cache-control": "no-cache",
    //                 "postman-token": "472a0d8c-3acd-61f6-88f3-738a13a45af3"
    //             }
    //         };
    //         $.ajax(settings).done(function (response) {
    //             $("#number-dislike").html(response.data.dislike + 1);
    //         });
    //         $button.addClass("disabled");
    //     }
    // });
    // Like button
$("#like-button").click(function() {
    var ideaId = $(this).data("id");
    var $button = $(this);
    $.ajax({
      type: "POST",
      url: "/likeIdeas/" + ideaId,
      success: function(data) {
        
        // Handle success response
        if ($button.hasClass("active")) {
          $button.removeClass("active");
          $button.find(".ms-2").text(data.numLikes);
        } else {
          $button.addClass("active");
        $button.find(".ms-2").text(data.numLikes);
        $("#dislike-button").removeClass("active");
        $("#dislike-button").find(".ms-2").text(data.numDislikes);
        }
        $button.prop("disabled", false);
        $("#dislike-button").prop("disabled", false);

        // Update list of users who have liked the idea
        $("#likesTab ul").empty();
        data.updatedIdea.likedBy.forEach(function(user) {
          $("#likesTab ul").append("<li class='list-group-item'>" + user.username + "</li>");
        });
      
        // update list of users who have disliked the idea
        $("#dislikesTab ul").empty();
        data.updatedIdea.dislikedBy.forEach(function(user) {
          $("#dislikesTab ul").append("<li class='list-group-item'>" + user.username + "</li>");
        });
        
      },
      error: function(xhr, status, error) {
        // Handle error response
      }
    });
  });
  
  // Dislike button
  $("#dislike-button").click(function() {
    var ideaId = $(this).data("id");
    var $button = $(this);
    $.ajax({
      type: "POST",
      url: "/dislikeIdeas/" + ideaId,
      success: function(data) {
        // Handle success response
        if ($button.hasClass("active")) {
          $button.removeClass("active");
          $button.find(".ms-2").text(data.numDislikes);
        } else {
            $button.addClass("active");
            $button.find(".ms-2").text(data.numDislikes);
            $("#like-button").removeClass("active");
            $("#like-button").find(".ms-2").text(data.numLikes);
        }
        $button.prop("disabled", false);
        $("#like-button").prop("disabled", false);
        $("#likesTab ul").empty();
        data.updatedIdea.likedBy.forEach(function(user) {
          $("#likesTab ul").append("<li class='list-group-item'>" + user.username + "</li>");
        });
      
        // update list of users who have disliked the idea
        $("#dislikesTab ul").empty();
        data.updatedIdea.dislikedBy.forEach(function(user) {
          $("#dislikesTab ul").append("<li class='list-group-item'>" + user.username + "</li>");
        });
      },
      error: function(xhr, status, error) {
        // Handle error response
      }
    });
  });
  
    $(document).on("click", "#add-comment", () => {    
        var protocol = window.location.protocol; // Giao thức (http:// hoặc https://)
var host = window.location.host; // Tên miền (bao gồm cả cổng nếu có)
// Tạo lại URL gốc của trang web hiện tại
var baseUrl = protocol + '//' + host;
        const commentValue = $("#comment-value").val();
        const isAnonymous = $("#anonymous-checkbox").prop("checked"); // Lấy giá trị của ô checkbox
        if (commentValue) {
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": `${baseUrl}/comment/${id}?comment=${commentValue}&anonymous=${isAnonymous}`,
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-cache",
                    "postman-token": "4a023968-04bb-3e57-ca9b-dfdd6ab4a373"
                },
                "processData": false,
                "data": "{\n\t\"comment\": \"test comment đá\"\n}"
            };
            
            $.ajax(settings).done(function (response) {
                $("#comment-value").val("");
    
                var commentsCount = parseInt($(".comment-count-title").text()) + 1;
                $(".comment-count-title").text(`${commentsCount} Comment${commentsCount > 1 ? "s" : ""}`);
                
                const username = isAnonymous ? "Unknown" : response.data.user.username; // Lấy tên người comment
                const createdAt = new Date(response.data.created_at).toLocaleDateString(); // Lấy thời gian tạo comment
                const commentText = response.data.comment; // Lấy nội dung comment
   
                // Thêm comment mới vào danh sách
                $("#list-comment").append(`
                    <div class="single-comment-body">
                        <div class="comment-user-avater">
                            <img src="assets/img/avaters/avatar1.png" alt="">
                        </div>
                        <div class="comment-text-body">
                            <h4>${username} <span class="comment-date">created at: ${createdAt}</span></h4>
                            <p>${commentText}</p>
                        </div>
                    </div>
                `);
            });
        }
    });
})
