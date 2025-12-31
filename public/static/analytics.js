// ==========================================
// GOOGLE ANALYTICS - Tracking
// ==========================================

// Google Analytics ID (à remplacer en production)
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Initialize Google Analytics
(function() {
  // Skip if already loaded
  if (window.gtag) return;
  
  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    'send_page_view': true,
    'anonymize_ip': true // RGPD compliant
  });
})();

// Track page view
function trackPageView(pageName, pageLocation) {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: pageLocation || window.location.href,
      page_path: window.location.pathname
    });
    console.log('📊 GA Page View:', pageName);
  }
}

// Track custom event
function trackEvent(category, action, label, value) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
    console.log('📊 GA Event:', category, action, label);
  }
}

// Track user signup
function trackSignup(method) {
  trackEvent('User', 'Signup', method); // method: 'email', 'google', 'facebook'
  if (window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method
    });
  }
}

// Track user login
function trackLogin(method) {
  trackEvent('User', 'Login', method);
  if (window.gtag) {
    window.gtag('event', 'login', {
      method: method
    });
  }
}

// Track trip publication
function trackTripPublished(origin, destination, price) {
  trackEvent('Trip', 'Published', `${origin} → ${destination}`, price);
  if (window.gtag) {
    window.gtag('event', 'trip_published', {
      origin: origin,
      destination: destination,
      price: price
    });
  }
}

// Track package publication
function trackPackagePublished(origin, destination, weight, budget) {
  trackEvent('Package', 'Published', `${origin} → ${destination}`, budget);
  if (window.gtag) {
    window.gtag('event', 'package_published', {
      origin: origin,
      destination: destination,
      weight: weight,
      budget: budget
    });
  }
}

// Track booking/reservation
function trackBooking(type, amount) {
  trackEvent('Transaction', 'Booking', type, amount); // type: 'package' or 'trip'
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'EUR',
      value: amount,
      items: [{ item_name: type }]
    });
  }
}

// Track payment
function trackPayment(amount, method) {
  trackEvent('Transaction', 'Payment', method, amount);
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      currency: 'EUR',
      value: amount,
      transaction_id: Date.now().toString(),
      payment_type: method
    });
  }
}

// Track search
function trackSearch(term, filters) {
  trackEvent('Search', 'Query', term);
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: term,
      filters: JSON.stringify(filters)
    });
  }
}

// Track KYC completion
function trackKYCCompleted(status) {
  trackEvent('KYC', 'Completed', status); // status: 'verified' or 'rejected'
  if (window.gtag) {
    window.gtag('event', 'kyc_completed', {
      status: status
    });
  }
}

// Track PWA installation
function trackPWAInstall() {
  trackEvent('PWA', 'Installed', 'App');
  if (window.gtag) {
    window.gtag('event', 'pwa_installed');
  }
}

// Track notification permission
function trackNotificationPermission(granted) {
  trackEvent('Notification', 'Permission', granted ? 'Granted' : 'Denied');
  if (window.gtag) {
    window.gtag('event', 'notification_permission', {
      granted: granted
    });
  }
}

// Track button clicks
function trackButtonClick(buttonName, location) {
  trackEvent('Engagement', 'Button Click', `${buttonName} - ${location}`);
}

// Track form submission
function trackFormSubmit(formName, success) {
  trackEvent('Form', 'Submit', formName, success ? 1 : 0);
}

// Track outbound link
function trackOutboundLink(url) {
  trackEvent('Outbound', 'Link Click', url);
}

// Track errors
function trackError(errorType, errorMessage) {
  trackEvent('Error', errorType, errorMessage);
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: errorMessage,
      fatal: false
    });
  }
}

// Track user timing (performance)
function trackTiming(category, variable, value) {
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: variable,
      value: value,
      event_category: category
    });
  }
}

// Expose functions globally
window.analytics = {
  pageView: trackPageView,
  event: trackEvent,
  signup: trackSignup,
  login: trackLogin,
  tripPublished: trackTripPublished,
  packagePublished: trackPackagePublished,
  booking: trackBooking,
  payment: trackPayment,
  search: trackSearch,
  kycCompleted: trackKYCCompleted,
  pwaInstall: trackPWAInstall,
  notificationPermission: trackNotificationPermission,
  buttonClick: trackButtonClick,
  formSubmit: trackFormSubmit,
  outboundLink: trackOutboundLink,
  error: trackError,
  timing: trackTiming
};

console.log('📊 Google Analytics chargé ✅');
