class SwipeBack {
    constructor() {
      this.startX = 0;
      this.startY = 0;
      this.startTime = 0;
      this.isSwipeActive = false;
      this.minSwipeDistance = 50;
      this.maxSwipeTime = 300;
      this.maxVerticalDistance = 100;
      
      this.indicator = null;
      this.pageElement = null;
      
      this.init();
    }
  
    init() {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupElements();
      });
  
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.setupElements();
        });
      } else {
        this.setupElements();
      }
  
      this.registerEvents();
    }
  
    setupElements() {
      if (!document.querySelector('.swipe-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'swipe-indicator';
        indicator.innerHTML = '←';
        document.body.appendChild(indicator);
      }

      if (!document.querySelector('.page-transition')) {
        document.body.classList.add('page-transition');
      }
  
      this.indicator = document.querySelector('.swipe-indicator');
      this.pageElement = document.querySelector('.page-transition') || document.body;
    }
  
    registerEvents() {
      document.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
      document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
      document.addEventListener('touchend', (e) => this.handleEnd(e), { passive: false });
    }
  
    handleStart(e) {
      const point = e.touches[0];
      this.startX = point.clientX;
      this.startY = point.clientY;
      this.startTime = Date.now();
      this.isSwipeActive = true;
    }
  
    handleMove(e) {
      if (!this.isSwipeActive) return;
  
      const point = e.touches[0];
      const deltaX = point.clientX - this.startX;
      const deltaY = point.clientY - this.startY;
  
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        this.resetSwipe();
        return;
      }

      if (deltaX > 20) {
        this.showIndicator();
        this.pageElement.classList.add('swiping');
        
        if (Math.abs(deltaX) > 10) {
          e.preventDefault();
        }
      } else {
        this.hideIndicator();
        this.pageElement.classList.remove('swiping');
      }
    }
  
    handleEnd(e) {
      if (!this.isSwipeActive) return;
  
      const point = e.changedTouches[0];
      const deltaX = point.clientX - this.startX;
      const deltaY = point.clientY - this.startY;
      const deltaTime = Date.now() - this.startTime;
  
      if (deltaX > this.minSwipeDistance &&       
          Math.abs(deltaY) < this.maxVerticalDistance &&
          deltaTime < this.maxSwipeTime &&   
          deltaX > Math.abs(deltaY)) {           
        
        this.navigateBack();
      }
  
      this.resetSwipe();
    }
  
    showIndicator() {
      if (this.indicator) {
        this.indicator.classList.add('active');
      }
    }
  
    hideIndicator() {
      if (this.indicator) {
        this.indicator.classList.remove('active');
      }
    }
  
    resetSwipe() {
      this.isSwipeActive = false;
      this.hideIndicator();
      this.pageElement.classList.remove('swiping');
    }
  
    navigateBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  }

  new SwipeBack();