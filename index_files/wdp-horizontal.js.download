jQuery(document).ready(function ($) {
  
  
  $( window ).on( 'elementor/frontend/init', function() {
   

        $(".twae-horizontal.swiper-container").each(function(index){ 
                          
          var slidestoshow = $(this).data("slidestoshow");
          var autoplay = $(this).data("autoplay");
          
          var swiper = new Swiper( $(this), {
            spaceBetween: 10,
            autoplay:autoplay,
            delay: 5000,
            slidesPerView: slidestoshow,
            direction: 'horizontal',
            pagination: {
              el: '.twae-pagination',
              type: 'progressbar',
            },
            navigation: {
              nextEl: '.twae-button-next',
              prevEl: '.twae-button-prev',
            },
            // Responsive breakpoints
            breakpoints: {
              // when window width is >= 320px
              320: {
                slidesPerView: 1,
              },
              // when window width is >= 480px
              480: {
                slidesPerView: 2,
              },
              // when window width is >= 640px
              640: {
                slidesPerView: slidestoshow,
              
              }
            },
          
          });
                   

    });
              
  
    
  });

});