// Adjust + FB + TikTok + Firebase 事件追踪配置
// 触发条件：点击联系按钮并成功跳转
// 去重：单个用户仅触发一次

(function() {
  'use strict';

  // ============================================
  // 配置区域 - 请填入你的实际参数
  // ============================================
  const CONFIG = {
    // Adjust 配置
    adjust: {
      appToken: 'YOUR_ADJUST_APP_TOKEN', // 从 Adjust 后台获取
      environment: 'production', // 或 'sandbox' 用于测试
      eventToken: 'YOUR_ADJUST_EVENT_TOKEN' // 完成注册事件的 Token
    },
    
    // Facebook Pixel ID
    facebook: {
      pixelId: 'YOUR_FB_PIXEL_ID'
    },
    
    // TikTok Pixel ID
    tiktok: {
      pixelId: 'YOUR_TIKTOK_PIXEL_ID'
    },
    
    // Firebase 配置
    firebase: {
      apiKey: 'YOUR_FIREBASE_API_KEY',
      projectId: 'YOUR_FIREBASE_PROJECT_ID',
      appId: 'YOUR_FIREBASE_APP_ID'
    }
  };

  // 本地存储 key
  const STORAGE_KEY = 'gptjobs_contact_event_triggered';

  // ============================================
  // 1. 加载 SDK
  // ============================================
  
  // 加载 Adjust Web SDK
  function loadAdjustSDK() {
    return new Promise((resolve, reject) => {
      if (window.Adjust) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.adjust.com/adjust-5.2.0.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 加载 Facebook Pixel
  function loadFacebookPixel() {
    return new Promise((resolve) => {
      if (window.fbq) {
        resolve();
        return;
      }
      
      !function(f,b,e,v,n,t,s) {
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
      }(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      
      fbq('init', CONFIG.facebook.pixelId);
      fbq('track', 'PageView');
      
      resolve();
    });
  }

  // 加载 TikTok Pixel
  function loadTikTokPixel() {
    return new Promise((resolve) => {
      if (window.ttq) {
        resolve();
        return;
      }
      
      !function(w,d,t) {
        var s=d.createElement(t);
        s.async=!0;
        s.src='https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=' + CONFIG.tiktok.pixelId;
        var h=d.getElementsByTagName('head')[0];
        h.appendChild(s);
      }(window, document, 'script');
      
      window.ttq = window.ttq || [];
      window.ttq.push(['init', CONFIG.tiktok.pixelId]);
      
      resolve();
    });
  }

  // 加载 Firebase
  function loadFirebase() {
    return new Promise((resolve, reject) => {
      if (window.firebase) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
      script.onload = () => {
        const analyticsScript = document.createElement('script');
        analyticsScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics-compat.js';
        analyticsScript.onload = () => {
          // 初始化 Firebase
          firebase.initializeApp({
            apiKey: CONFIG.firebase.apiKey,
            projectId: CONFIG.firebase.projectId,
            appId: CONFIG.firebase.appId
          });
          resolve();
        };
        document.head.appendChild(analyticsScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ============================================
  // 2. 初始化 Adjust
  // ============================================
  function initAdjust() {
    if (!window.Adjust) {
      console.error('Adjust SDK not loaded');
      return;
    }
    
    Adjust.initSdk({
      appToken: CONFIG.adjust.appToken,
      environment: CONFIG.adjust.environment
    });
  }

  // ============================================
  // 3. 事件追踪函数（带去重）
  // ============================================
  function trackContactEvent(contactType, contactLink) {
    // 检查是否已触发
    if (localStorage.getItem(STORAGE_KEY)) {
      console.log('Contact event already tracked for this user');
      return;
    }
    
    // 标记为已触发
    localStorage.setItem(STORAGE_KEY, 'true');
    
    // 构建事件数据
    const eventData = {
      contact_type: contactType,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    // 1. Track Adjust 事件
    if (window.Adjust) {
      Adjust.trackEvent({
        eventToken: CONFIG.adjust.eventToken,
        callbackParams: [
          { key: 'contact_type', value: contactType },
          { key: 'event_name', value: 'completed_registration' }
        ]
      });
      console.log('✅ Adjust: completed_registration tracked');
    }
    
    // 2. Track Facebook Pixel
    if (window.fbq) {
      fbq('track', 'CompleteRegistration', {
        content_name: 'job_contact',
        contact_type: contactType
      });
      console.log('✅ Facebook: CompleteRegistration tracked');
    }
    
    // 3. Track TikTok Pixel
    if (window.ttq) {
      ttq.push(['track', 'Register', {
        content_type: 'contact',
        contact_method: contactType
      }]);
      console.log('✅ TikTok: Register tracked');
    }
    
    // 4. Track Firebase Analytics
    if (window.firebase && firebase.analytics) {
      firebase.analytics().logEvent('sign_up', {
        method: contactType,
        platform: 'gptjobs'
      });
      console.log('✅ Firebase: sign_up tracked');
    }
    
    // 发送到你的后端记录（可选）
    sendToBackend(eventData);
    
    console.log('🎉 All contact events tracked successfully!');
  }

  // 发送到后端记录（可选）
  function sendToBackend(data) {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: getDeviceId(),
        event_name: 'job_contact_click',
        event_params: data
      })
    }).catch(err => console.error('Backend track failed:', err));
  }

  // 生成设备ID
  function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'web_' + Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  // ============================================
  // 4. 绑定到联系按钮
  // ============================================
  function bindContactButtons() {
    // 自动绑定所有联系链接
    const contactLinks = document.querySelectorAll('[data-contact-link]');
    
    contactLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const contactType = this.dataset.contactType || 'link';
        const contactUrl = this.dataset.contactLink || this.href;
        
        // 追踪事件
        trackContactEvent(contactType, contactUrl);
        
        // 延迟跳转，确保事件发送完成
        if (contactUrl && !contactUrl.startsWith('#')) {
          e.preventDefault();
          setTimeout(() => {
            window.open(contactUrl, '_blank');
          }, 300);
        }
      });
    });
  }

  // ============================================
  // 5. 初始化所有 SDK
  // ============================================
  async function initAll() {
    try {
      console.log('🚀 Initializing tracking SDKs...');
      
      // 并行加载所有 SDK
      await Promise.all([
        loadAdjustSDK(),
        loadFacebookPixel(),
        loadTikTokPixel(),
        loadFirebase()
      ]);
      
      console.log('✅ All SDKs loaded');
      
      // 初始化 Adjust
      initAdjust();
      
      // 绑定按钮
      bindContactButtons();
      
      console.log('🎉 Tracking initialization complete!');
      
    } catch (error) {
      console.error('❌ SDK initialization failed:', error);
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // 暴露全局函数供手动调用
  window.trackContact = trackContactEvent;
  
})();

// ============================================
// 使用说明：
// ============================================
// 
// 1. 在 HTML 中添加联系按钮时，加上 data 属性：
//    <a href="https://wa.me/xxx" 
//       data-contact-link="https://wa.me/xxx" 
//       data-contact-type="whatsapp">
//       联系我
//    </a>
//
// 2. 或者在提交页面使用（submit.html）：
//    将联系按钮改为：
//    <a href="contact_link" 
//       data-contact-link="contact_link" 
//       data-contact-type="whatsapp"
//       class="contact-btn">
//       点击联系
//    </a>
//
// 3. 手动触发事件（如果需要）：
//    window.trackContact('whatsapp', 'https://wa.me/xxx');
//
// 4. 重置用户追踪状态（测试用）：
//    localStorage.removeItem('gptjobs_contact_event_triggered');