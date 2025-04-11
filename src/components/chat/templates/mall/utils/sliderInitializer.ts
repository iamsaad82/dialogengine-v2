'use client';

/**
 * Hilfsfunktion zur Initialisierung von Slidern im Mall-Template
 * Diese Funktion wird aufgerufen, nachdem der Content gerendert wurde
 */
export function initializeSliders() {
  // Sofort ausführen, um Flackern zu vermeiden
  try {
    try {
      // Finde alle Listen im Mall-Template
      const lists = document.querySelectorAll('.mall-message ul');

      lists.forEach((list) => {
        // Überprüfe, ob die Liste mehr als ein Element hat
        if (list.children.length <= 1) return;

        // Füge die Slider-Klasse hinzu, falls noch nicht vorhanden
        if (!list.classList.contains('mall-slider')) {
          list.classList.add('mall-slider');
        }

        // Stelle sicher, dass die Liste horizontal scrollbar ist
        list.style.display = 'flex';
        list.style.overflowX = 'auto';
        list.style.scrollSnapType = 'x mandatory';
        list.style.webkitOverflowScrolling = 'touch';
        list.style.scrollbarWidth = 'none'; // Firefox
        list.style.msOverflowStyle = 'none'; // IE/Edge
        list.style.padding = '0.5rem 0';
        list.style.margin = '0';
        list.style.listStyle = 'none';
        list.style.gap = '1rem';

        // Verstecke die Scrollbar
        const style = document.createElement('style');
        style.textContent = `
          .mall-slider::-webkit-scrollbar {
            display: none;
          }
        `;
        document.head.appendChild(style);

        // Füge Styles für die Listenelemente hinzu
        Array.from(list.children).forEach((item) => {
          if (item instanceof HTMLElement) {
            item.style.flex = '0 0 auto';
            item.style.scrollSnapAlign = 'start';
            item.style.width = '300px';
            item.style.minHeight = '100px';
            item.style.marginRight = '1rem';
            item.style.borderRadius = '8px';
            item.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            item.style.overflow = 'hidden';
            item.style.backgroundColor = 'white';
            item.style.transition = 'none'; // Keine Transition um Flackern zu vermeiden
            item.style.border = '1px solid #eaeaea';

            // Füge Hover-Effekt hinzu (nur Box-Shadow, keine Transformation)
            item.addEventListener('mouseenter', () => {
              item.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
            });

            item.addEventListener('mouseleave', () => {
              item.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            });
          }
        });

        // Füge Touch-Swipe-Unterstützung hinzu
        let isDown = false;
        let startX: number;
        let scrollLeft: number;

        list.addEventListener('mousedown', (e) => {
          isDown = true;
          list.style.cursor = 'grabbing';
          startX = e.pageX - list.offsetLeft;
          scrollLeft = list.scrollLeft;
          e.preventDefault();
        });

        list.addEventListener('mouseleave', () => {
          isDown = false;
          list.style.cursor = 'grab';
        });

        list.addEventListener('mouseup', () => {
          isDown = false;
          list.style.cursor = 'grab';
        });

        list.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - list.offsetLeft;
          const walk = (x - startX) * 2; // Scroll-Geschwindigkeit
          list.scrollLeft = scrollLeft - walk;
        });

        // Touch-Events
        list.addEventListener('touchstart', (e) => {
          isDown = true;
          startX = e.touches[0].pageX - list.offsetLeft;
          scrollLeft = list.scrollLeft;
        }, { passive: true });

        list.addEventListener('touchend', () => {
          isDown = false;
        }, { passive: true });

        list.addEventListener('touchcancel', () => {
          isDown = false;
        }, { passive: true });

        list.addEventListener('touchmove', (e) => {
          if (!isDown) return;
          const x = e.touches[0].pageX - list.offsetLeft;
          const walk = (x - startX) * 2;
          list.scrollLeft = scrollLeft - walk;
        }, { passive: true });
      });

      console.log('Mall Template: Slider initialisiert');
    } catch (error) {
      console.error('Fehler bei der Slider-Initialisierung:', error);
    }
  } catch (error) {
    console.error('Fehler bei der Slider-Initialisierung:', error);
  }
}

/**
 * Beobachtet DOM-Änderungen und initialisiert Slider, wenn neue Listen hinzugefügt werden
 */
export function observeSliders() {
  // Erstelle einen MutationObserver, um DOM-Änderungen zu beobachten
  const observer = new MutationObserver((mutations) => {
    let shouldInitialize = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Überprüfe, ob neue Listen hinzugefügt wurden
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const lists = node.querySelectorAll('ul');
            if (lists.length > 0) {
              shouldInitialize = true;
            }
          }
        });
      }
    });

    if (shouldInitialize) {
      initializeSliders();
    }
  });

  // Starte die Beobachtung des DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initialisiere Slider beim ersten Laden
  initializeSliders();

  return observer;
}
