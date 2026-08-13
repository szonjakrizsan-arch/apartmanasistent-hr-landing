/* ==========================================================================
   APARTMENT ASSISTANT — LANDING PAGE SCRIPT
   ==========================================================================
   Inhalt:
   1. Analytics-/Marketing-IDs (TODO — siehe unten)
   2. Cookie-Einwilligung (Consent Mode v2)
   3. Scroll-Reveal-Animation (für data-reveal-Elemente)
   4. CTA-Klick-Tracking (dataLayer-Event, nur bei Einwilligung)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. TODO(DE-Start) — ANALYTICS-IDs
     GOOGLE_ADS_ID und META_PIXEL_ID sind aktuell noch dieselben wie auf der
     ungarischen Seite (apartmanassistant.hu). Vor dem Start von Google-/
     Meta-Werbung für den deutschen Markt hier eigene, separate IDs für
     apartmentassistant.de eintragen — sonst vermischen sich die
     Conversion-Daten beider Märkte.
     ------------------------------------------------------------------------ */
  var GA4_MEASUREMENT_ID = ""; // z. B. "G-XXXXXXXXXX"
  var GOOGLE_ADS_ID = "AW-18334546190";
  var META_PIXEL_ID = "982039981469218";

  function loadAnalytics() {
    // --- Google Analytics 4 laden (nur nach Einwilligung) ---
    // if (GA4_MEASUREMENT_ID) {
    //   var s = document.createElement("script");
    //   s.async = true;
    //   s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_MEASUREMENT_ID;
    //   document.head.appendChild(s);
    //   gtag('js', new Date());
    //   gtag('config', GA4_MEASUREMENT_ID);
    // }

    // --- Google-Ads-Tag laden (nur nach Einwilligung) ---
    if (GOOGLE_ADS_ID) {
      var ga = document.createElement("script");
      ga.async = true;
      ga.src = "https://www.googletagmanager.com/gtag/js?id=" + GOOGLE_ADS_ID;
      document.head.appendChild(ga);
      gtag('js', new Date());
      gtag('config', GOOGLE_ADS_ID);
    }

    // --- Meta Pixel laden (nur nach Einwilligung) ---
    if (META_PIXEL_ID) {
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', META_PIXEL_ID);
      fbq('track', 'PageView');
    }
  }

  /* ------------------------------------------------------------------------
     2. COOKIE-EINWILLIGUNG
     ------------------------------------------------------------------------ */
  var CONSENT_KEY = "aa_cookie_consent"; // "granted" | "denied"
  var banner = document.getElementById("cookie-banner");
  var acceptBtn = document.getElementById("cookie-accept");
  var rejectBtn = document.getElementById("cookie-reject");

  function updateConsent(granted) {
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
        ad_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied",
      });
    }
    if (granted) {
      loadAnalytics();
    }
  }

  function getStoredConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      /* localStorage nicht verfügbar — Banner erscheint bei jedem Besuch */
    }
  }

  function initCookieBanner() {
    if (!banner) return;
    var stored = getStoredConsent();

    if (stored === "granted") {
      updateConsent(true);
      return;
    }
    if (stored === "denied") {
      updateConsent(false);
      return;
    }

    // Noch keine Entscheidung getroffen — Banner wird angezeigt
    banner.classList.add("is-visible");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        storeConsent("granted");
        updateConsent(true);
        banner.classList.remove("is-visible");
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        storeConsent("denied");
        updateConsent(false);
        banner.classList.remove("is-visible");
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. SCROLL-REVEAL-ANIMATION
     Läuft nur, wenn der Browser IntersectionObserver unterstützt und die
     Besucherin/der Besucher keine reduzierte Bewegung wünscht — ohne das
     bleiben alle Elemente einfach von Anfang an sichtbar (kein Layout-Bruch,
     falls JS nicht lädt).
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var elements = document.querySelectorAll("[data-reveal]");

    if (
      prefersReducedMotion ||
      !("IntersectionObserver" in window) ||
      elements.length === 0
    ) {
      elements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     4. CTA-KLICK-TRACKING
     ------------------------------------------------------------------------ */
  function initCtaTracking() {
    var ctaButtons = document.querySelectorAll("[data-cta]");
    ctaButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (typeof window.dataLayer !== "undefined") {
          window.dataLayer.push({
            event: "cta_click",
            cta_location: btn.getAttribute("data-cta"),
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     START
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initCookieBanner();
    initScrollReveal();
    initCtaTracking();
  });
})();
