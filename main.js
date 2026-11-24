const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

navigation?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const selectedItems = new Map();
const orderList = document.querySelector('#order-items');
const orderCount = document.querySelector('#order-count');
const orderCountLabel = document.querySelector('#order-count-label');
const orderSubmit = document.querySelector('#order-submit');
const quoteDemoForm = document.querySelector('#quote-demo-form');
const quoteDemoStatus = document.querySelector('#quote-demo-status');

function updateOrder() {
  if (!orderList || !orderCount || !orderSubmit) return;
  orderCount.textContent = String(selectedItems.size);
  if (orderCountLabel) orderCountLabel.textContent = selectedItems.size === 1 ? 'categoría seleccionada' : 'categorías seleccionadas';
  orderList.replaceChildren();

  if (selectedItems.size === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-order';
    empty.textContent = 'Tu selección aparecerá aquí.';
    orderList.append(empty);
    orderSubmit.disabled = true;
    orderSubmit.innerHTML = 'Selecciona productos <span>↗</span>';
    return;
  }

  selectedItems.forEach((quantity, name) => {
    const item = document.createElement('li');
    item.className = 'order-item';
    item.textContent = `${name} · ${quantity} aprox.`;
    orderList.append(item);
  });
  orderSubmit.disabled = false;
  orderSubmit.innerHTML = 'Preparar solicitud <span>↗</span>';
  if (quoteDemoStatus) quoteDemoStatus.textContent = 'Prototipo: esta acción muestra el flujo, no envía una solicitud real.';
}

document.querySelectorAll('.add-item').forEach((button) => {
  const product = button.dataset.product;
  const quantityInput = button.closest('.product-card')?.querySelector('.quantity-control input');
  const addButton = () => {
    if (!product) return;
    if (selectedItems.has(product)) {
      selectedItems.delete(product);
      button.classList.remove('selected');
      button.setAttribute('aria-pressed', 'false');
      button.querySelector('span').textContent = '+';
    } else {
      const quantity = Math.max(1, Number.parseInt(quantityInput?.value || '1', 10) || 1);
      selectedItems.set(product, quantity);
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      button.querySelector('span').textContent = '✓';
    }
    updateOrder();
  };

  button.addEventListener('click', addButton);
  quantityInput?.addEventListener('change', () => {
    const quantity = Math.max(1, Number.parseInt(quantityInput.value || '1', 10) || 1);
    quantityInput.value = String(quantity);
    if (selectedItems.has(product)) {
      selectedItems.set(product, quantity);
      updateOrder();
    }
  });
});

quoteDemoForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (selectedItems.size === 0) {
    if (quoteDemoStatus) quoteDemoStatus.textContent = 'Agrega al menos una categoría para preparar la cotización.';
    return;
  }
  const formData = new FormData(quoteDemoForm);
  const company = String(formData.get('company') || '').trim();
  if (quoteDemoStatus) {
    quoteDemoStatus.textContent = `Solicitud de demostración preparada para ${company}. No se ha enviado; este prototipo no está conectado a un sistema de ventas.`;
  }
});

const carousel = document.querySelector('.hero-slider');
if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(carousel.querySelectorAll('.slider-dot'));
  const previous = carousel.querySelector('.slider-prev');
  const next = carousel.querySelector('.slider-next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeSlide = 0;
  let rotationTimer;

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const isActive = i === activeSlide;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      dots[i].classList.toggle('is-active', isActive);
      dots[i].setAttribute('aria-pressed', String(isActive));
    });
  };

  previous?.addEventListener('click', () => showSlide(activeSlide - 1));
  next?.addEventListener('click', () => showSlide(activeSlide + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

  const stopRotation = () => window.clearInterval(rotationTimer);
  const startRotation = () => {
    stopRotation();
    if (!reduceMotion && !document.hidden) {
      rotationTimer = window.setInterval(() => showSlide(activeSlide + 1), 6000);
    }
  };
  carousel.addEventListener('mouseenter', stopRotation);
  carousel.addEventListener('mouseleave', startRotation);
  carousel.addEventListener('focusin', stopRotation);
  carousel.addEventListener('focusout', startRotation);
  document.addEventListener('visibilitychange', startRotation);
  startRotation();
}
