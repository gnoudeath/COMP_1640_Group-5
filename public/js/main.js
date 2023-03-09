

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
    $(document).on("click", "#like-idea",() => {
        const settings = {
            "async": true,
            "crossDomain": true,
            "url": `http://localhost:3000/likeIdeas/${id}`,
            "method": "POST",
            "headers": {
              "cache-control": "no-cache",
              "postman-token": "472a0d8c-3acd-61f6-88f3-738a13a45af3"
            }
          }
          
          $.ajax(settings).done(function (response) {
            $("#number-like").html(response.data.like + 1)
          });
    })
    $(document).on("click", "#dislike-idea",() => {
        console.log(id)
        const settings = {
            "async": true,
            "crossDomain": true,
            "url": `http://localhost:3000/disLikeIdeas/${id}`,
            "method": "POST",
            "headers": {
              "cache-control": "no-cache",
              "postman-token": "472a0d8c-3acd-61f6-88f3-738a13a45af3"
            }
          }
          
          $.ajax(settings).done(function (response) {
            $("#number-dislike").html(response.data.dislike + 1)
          });
    })

    $(document).on("click", "#add-comment" , () => {
        
        const commentValue = $("#comment-value").val();
        if(commentValue){
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": `http://localhost:3000/comment/${id}?comment=${commentValue}`,
                "method": "POST",
                "headers": {
                  "content-type": "application/json",
                  "cache-control": "no-cache",
                  "postman-token": "4a023968-04bb-3e57-ca9b-dfdd6ab4a373"
                },
                "processData": false,
                "data": "{\n\t\"comment\": \"test comment đá\"\n}"
              }
              
              $.ajax(settings).done(function (response) {
                $("#comment-value").val("")

                var commentsCount = parseInt($(".comment-count-title").text()) + 1;
                $(".comment-count-title").text(`${commentsCount} Comment${commentsCount > 1 ? "s" : ""}`);
                
                $("#list-comment").append(`
                <div class="single-comment-body">
                <div class="comment-user-avater">
                  <img src="assets/img/avaters/avatar1.png" alt="">
                </div>
                <div class="comment-text-body">
                  <h4>${response.data.user.username} <span class="comment-date">created at: ${new Date(response.data.created_at).toLocaleDateString()}</span></h4>
                  <p>${response.data.comment}</p>
                </div>
                <div class="single-comment-body child">
                  <div class="comment-user-avater">
                    <img src="assets/img/avaters/avatar3.png" alt="">
                  </div>
                </div>
              </div>
                `)
                // update comment count
                
              });
        }
    })
})
