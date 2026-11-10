/* ============================================================
   Google AdSense 加载器
   - 未配置发布商 ID 时不加载任何外部脚本（无跟踪、无广告）
   - 配置后：加载官方脚本，并把 .ad-slot[data-ad-slot] 转成广告单元
   ============================================================ */
(function () {
  'use strict';

  var config = window.SITE_CONFIG || {};
  var client = (config.adsenseClient || '').trim();
  var slots = Array.prototype.slice.call(document.querySelectorAll('.ad-slot[data-ad-slot]'));

  slots.forEach(function (slot) {
    slot.dataset.adState = 'placeholder';
  });

  if (!/^ca-pub-\d{10,}$/.test(client)) {
    /* 未配置：保持占位样式，便于审核前预览版式 */
    return;
  }

  var script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
    encodeURIComponent(client);
  script.onerror = function () {
    slots.forEach(function (slot) { slot.dataset.adState = 'error'; });
  };
  document.head.appendChild(script);

  slots.forEach(function (slot) {
    var slotId = (slot.dataset.adSlot || '').trim();
    var configured = (config.adsenseSlots || {})[slotId] || '';
    if (!configured) return;

    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', client);
    ins.setAttribute('data-ad-slot', configured);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    slot.innerHTML = '';
    slot.appendChild(ins);
    slot.classList.add('has-ads');
    slot.dataset.adState = 'filled';

    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
})();
