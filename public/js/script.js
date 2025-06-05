//flash code 


  // Automatically dismiss alert after 3 seconds (3000ms)
  setTimeout(() => {
    const alert = document.querySelector('.alert');
    if (alert) {
      
      alert.classList.remove('show');
      alert.classList.add('hide');

      // Fully remove it from the DOM after fade-out
      setTimeout(() => {
        alert.remove();
      }, 300); // 300ms for Bootstrap fade transition
    }
  }, 3000);