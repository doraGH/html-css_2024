$(function() {
  /*
   * 輪播 - 橫幅
   */
  // scss/modules/_carousel_kanban.scss

  let windowBlur = false;
  let isKanbanVisible = false;
  let kanbanPlayers = [];
  const kanban = document.querySelector('.c-kanban.carousel');
  const kanban_prev = kanban.querySelector('.swiper-button-prev');
  const kanban_next = kanban.querySelector('.swiper-button-next');
  const kanban_pagination = kanban.querySelector('.swiper-pagination');
  let kanbanLoop = kanban.querySelectorAll('.swiper-slide').length > 1;
  let kanbanT = parseInt(kanban.getBoundingClientRect().top);
  let kanbanB = parseInt(kanban.offsetHeight + kanbanT + window.innerHeight * 0.5);
  
  const kanban_slider = new Swiper(kanban, {
    speed: 800,
    loop: kanbanLoop,
    navigation: {
      nextEl: kanban_next,
      prevEl: kanban_prev
    },
    pagination: {
      el: kanban_pagination,
      type: 'bullets',
      clickable: true,
      // type: 'fraction', 這個為數字
    },
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
      pauseOnMouseEnter: false
    },
    effect: 'fade', // 取消會變左右滑動
    fadeEffect: {
      crossFade: true
    },
    on: {
      resize: function(swiper) {
        kanbanT = parseInt(kanban.getBoundingClientRect().top);
        kanbanB = parseInt(kanban.offsetHeight + kanbanT + window.innerHeight * 0.5);
        isKanbanVisible = window.scrollY + window.innerHeight * 0.4 < kanbanB ? true : false;
      },
      init: function(swiper){
        kanbanT = parseInt(kanban.getBoundingClientRect().top);
        kanbanB = parseInt(kanban.offsetHeight + kanbanT + window.innerHeight * 0.5);
        isKanbanVisible = window.scrollY + window.innerHeight * 0.4 < kanbanB ? true : false;
        
        // 先暫停自動輪播
        swiper.autoplay.stop();
  
        // Video
        if(kanban.querySelectorAll('.js-player').length) {
          kanbanPlayers = Array.from(kanban.querySelectorAll('.js-player')).map((p) => new Plyr(p, {
            muted: true, // 關聲音
            autoplay: false,
            hideControls: true,
            // 以下是客製按鈕需求才開啟
            // fullscreen: { 
            //   enabled: false, 
            //   fallback: true, 
            //   iosNative: true, 
            //   container: null
            // },
            // controls: ['play', 'mute', 'volume']
          }));            
  
          kanbanPlayers.forEach((player, index) => {  
            player.on('ready', (event) => {
              // 轉換前停止所有影片
              player.pause();
              // 若第一則為影片要播放
              if(kanban.querySelector('.swiper-slide-active').contains(player.elements.container)) {
                if(!player.playing && !windowBlur && isKanbanVisible) {
                  player.volume = 0;
                  player.play();
                }
              } else {
                // 若第一則不是影片就開啟自動輪播
                swiper.autoplay.start();
              }
            });
            player.on('playing', (event) => {
              // 影片播放中輪播停止自動輪播
              swiper.autoplay.stop();
              // .is-video-playing為 影片播放中可增加的樣式(應用例:播放前覆蓋自訂圖片，撥放中隱藏圖片)
              kanban.classList.add('is-video-playing');
            });
            player.on('pause', (event) => {
              kanban.classList.remove('is-video-playing');
            });
            player.on('ended', (event) => {
              // 影片停止播放時輪播啟動自動輪播，但如果只有一張就自動重播
              if(kanbanLoop) {
                swiper.slideNext();
                swiper.autoplay.start();
              } else {
                if(!windowBlur && isKanbanVisible) {
                  player.play(); 
                }
              }
            }); 
          });              
        } else {
          // 確認都沒有影片則繼續開啟自動輪播
          swiper.autoplay.start();
        }

        // 是否出現裝飾文字
        if(!swiper.slides[swiper.activeIndex].dataset.decoText) {
          kanban.classList.add('hide-deco-text');
        } else {
          kanban.classList.remove('hide-deco-text');
        }
      },
      slideChangeTransitionStart: function(swiper){
        // 是否出現裝飾文字
        if(swiper.slides[swiper.activeIndex].dataset.decoText == 'true') {
          kanban.classList.remove('hide-deco-text');
        } else {
          kanban.classList.add('hide-deco-text');
        }
      },
      slideChangeTransitionEnd: function(swiper){
        // 轉換前停止所有影片
        kanbanPlayers.forEach(function(player, index) {
          player.pause();
        });
        
        // 播放當前影片
        var _cur = swiper.slides[swiper.activeIndex];
          
        kanbanPlayers.forEach((player, index) => { 
          if(_cur.contains(player.elements.container)) {
            // 有影片要先強制停止自動輪播，不然與播放有時間差
            swiper.autoplay.stop();
            if(!player.playing && !windowBlur && isKanbanVisible) {
              // 要重頭播放，不然會一直偵測為結束影片了
              player.currentTime = 0;
              player.play();
            }
          } else {
            swiper.autoplay.start();
          }
        });
      },
    }
  });
  // 離開橫幅停止播放
  window.addEventListener('scroll', debounce(function() {
    isKanbanVisible = window.scrollY + window.innerHeight * 0.4 < kanbanB ? true : false;
    if (!isKanbanVisible) {
      kanbanPlayers.forEach(function(player, index) {
        player.pause();
      });
    } else {
      kanbanPlayers.forEach((player, index) => {  
        if(kanban.querySelector('.swiper-slide-active').contains(player.elements.container)) {
          if(!player.playing && !windowBlur && isKanbanVisible) {
            player.play();
          }
        }
      });
    }
  }));
  function debounce(func, delay) { 
    var timer = null; 
    delay = delay ? delay : 100; 
    return function () { 
      var context = this; 
      var args = arguments; 
      clearTimeout(timer); 
      timer = setTimeout(function () { 
        func.apply(context, args); 
      }, delay); 
    }; 
  }
  // 離開頁籤停止播放
  window.addEventListener('blur', function() {
    windowBlur = true;
  });
  window.addEventListener('focus', function() {
    windowBlur = false;
  });

});