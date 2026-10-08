// Contact page (docs/contact-plan.md). The form works without this file: it posts as a normal page load. This adds
// a message under a field that is wrong, the order number only for the topics that have one, the characters left,
// a form filled in from the address (?topic=order&order=1042&about=…) and a "Sending…" button.
const form = document.querySelector('[data-contact-form]');
const topic = form?.querySelector('[data-topic]');

if (topic) {
  const body = form.querySelector('[data-body]');
  const order = form.querySelector('[data-order]');
  const left = form.querySelector('[data-left]');
  const send = form.querySelector('[data-send]');
  const label = send.textContent;
  const checked = [...form.querySelectorAll('[data-error]')];
  const key = () => topic.selectedOptions[0]?.dataset.key || '';
  const store = { get: () => { try { return JSON.parse(sessionStorage.getItem('yb-contact')) || {}; } catch { return {}; } }, set: (v) => { try { sessionStorage.setItem('yb-contact', JSON.stringify(v)); } catch {} } };

  form.noValidate = true;
  const ready = () => { send.removeAttribute('aria-disabled'); send.textContent = label; };

  const check = (field) => {
    const bad = !field.validity.valid;
    const out = document.getElementById(`${field.id}-error`);
    if (bad) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    out.textContent = bad ? field.dataset.error : '';
    out.hidden = !bad;
    return !bad;
  };

  const showTopic = () => {
    const now = key();
    form.querySelectorAll('[data-topic-field]').forEach((el) => { el.hidden = !el.dataset.topicField.split(' ').includes(now); });
    form.querySelectorAll('[data-topic-note]').forEach((el) => { el.hidden = el.dataset.topicNote !== now; });
  };
  const pick = (wanted) => {
    const option = [...topic.options].find((o) => o.dataset.key === wanted);
    if (option) topic.value = option.value;
    showTopic();
  };
  const count = () => {
    left.textContent = left.dataset.template.replace('9999', body.maxLength - body.value.length);
    left.hidden = false;
  };

  // Shopify hands back the name, email, phone and message after a failed send, but not our own two fields.
  const kept = store.get();
  const params = new URLSearchParams(location.search);
  if (kept.topic && !params.has('contact_posted')) { pick(kept.topic); order.value = kept.order || ''; }
  store.set({});
  if (params.has('topic')) pick(params.get('topic'));
  if (params.has('order')) order.value = params.get('order').slice(0, 20);
  if (params.has('about') && !body.value) body.value = `${body.dataset.about}${params.get('about').slice(0, 120)}\n`;
  showTopic();
  count();

  checked.forEach((field) => {
    field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) check(field); });
    field.addEventListener('input', () => { if (field.hasAttribute('aria-invalid')) check(field); });
  });
  topic.addEventListener('change', showTopic);
  body.addEventListener('input', count);
  document.querySelectorAll('[data-topic-link]').forEach((link) => link.addEventListener('click', () => pick(link.dataset.topicLink)));

  form.addEventListener('submit', (event) => {
    const wrong = checked.filter((field) => !check(field));
    if (wrong.length) {
      event.preventDefault();
      wrong[0].focus();
      return;
    }
    if (order.closest('[hidden]')) order.value = '';
    store.set({ topic: key(), order: order.value });
    send.setAttribute('aria-disabled', 'true');
    send.textContent = send.dataset.sending;
    // Shopify may show its bot check over the page before it sends. If that is closed, the page is still here and
    // the button must work again.
    setTimeout(ready, 6000);
  });
  send.addEventListener('click', (event) => { if (send.getAttribute('aria-disabled') === 'true') event.preventDefault(); });
  // Back from another page: the button is ready again.
  addEventListener('pageshow', ready);
}
