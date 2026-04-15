# GPTJobs - Adjust SDK 接入指南

## 📋 接入概览

| 平台 | SDK | 用途 |
|------|-----|------|
| Android | Adjust Android SDK | 原生 App 归因追踪 |
| iOS | Adjust iOS SDK | 原生 App 归因追踪 |
| Web | Adjust Web SDK | H5/网页归因追踪 |

---

## 🔧 第一步：获取 Adjust 配置

### 1. 注册 Adjust 账号
1. 访问 https://dash.adjust.com
2. 创建新 App
3. 记录以下参数：
   - **App Token**: `abc123xyz` (示例)
   - **Environment**: Production / Sandbox

### 2. 创建追踪事件
在 Adjust Dashboard 创建事件：

| 事件名称 | Token | 说明 |
|---------|-------|------|
| `completed_registration` | `xyz789abc` | 完成注册/联系 |
| `job_list_view` | (自动) | 浏览岗位列表 |
| `job_detail_open` | (自动) | 打开岗位详情 |
| `job_contact_click` | (自动) | 点击联系按钮 |

---

## 📱 第二步：Android SDK 接入

### 2.1 添加依赖

编辑 `android/app/build.gradle`:

```gradle
dependencies {
    // Adjust SDK
    implementation 'com.adjust.sdk:adjust-android:4.38.3'
    implementation 'com.android.installreferrer:installreferrer:2.2'
    
    // Google Play Services (用于获取 GAID)
    implementation 'com.google.android.gms:play-services-ads-identifier:18.0.1'
}
```

### 2.2 初始化 SDK

编辑 `android/app/src/main/java/.../MainApplication.java`:

```java
import com.adjust.sdk.Adjust;
import com.adjust.sdk.AdjustConfig;
import com.adjust.sdk.LogLevel;

public class MainApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        
        // Adjust 配置
        String appToken = "YOUR_ADJUST_APP_TOKEN";
        String environment = AdjustConfig.ENVIRONMENT_PRODUCTION;
        
        AdjustConfig config = new AdjustConfig(this, appToken, environment);
        config.setLogLevel(LogLevel.WARN);
        
        // 启用事件缓冲（推荐）
        config.setEventBufferingEnabled(true);
        
        // 初始化
        Adjust.onCreate(config);
    }
}
```

### 2.3 ProGuard 配置

编辑 `android/app/proguard-rules.pro`:

```
# Adjust
-keep class com.adjust.sdk.** { *; }
-keep class com.google.android.gms.common.ConnectionResult {
    int SUCCESS;
}
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient {
    com.google.android.gms.ads.identifier.AdvertisingIdClient$Info getAdvertisingIdInfo(android.content.Context);
}
```

### 2.4 追踪事件

在岗位详情页点击联系时：

```java
import com.adjust.sdk.Adjust;
import com.adjust.sdk.AdjustEvent;

public void onContactClick(String jobId, String contactType) {
    // 创建事件
    AdjustEvent event = new AdjustEvent("xyz789abc"); // completed_registration token
    
    // 添加回调参数
    event.addCallbackParameter("job_id", jobId);
    event.addCallbackParameter("contact_type", contactType);
    event.addCallbackParameter("platform", "android");
    
    // 发送事件（自动去重）
    Adjust.trackEvent(event);
}
```

---

## 🍎 第三步：iOS SDK 接入

### 3.1 添加依赖

使用 CocoaPods，编辑 `ios/App/Podfile`:

```ruby
platform :ios, '13.0'
use_frameworks!

target 'App' do
  pod 'Adjust', '~> 4.38.3'
end
```

运行安装：
```bash
cd ios/App && pod install
```

### 3.2 初始化 SDK

编辑 `ios/App/App/AppDelegate.swift`:

```swift
import Adjust

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Adjust 配置
        let appToken = "YOUR_ADJUST_APP_TOKEN"
        let environment = ADJEnvironmentProduction
        
        let config = ADJConfig(appToken: appToken, environment: environment)
        config?.logLevel = ADJLogLevelWarn
        
        // 初始化
        Adjust.appDidLaunch(config)
        
        return true
    }
}
```

### 3.3 追踪事件

```swift
import Adjust

func onContactClick(jobId: String, contactType: String) {
    let event = ADJEvent(eventToken: "xyz789abc")
    
    // 添加参数
    event?.addCallbackParameter("job_id", value: jobId)
    event?.addCallbackParameter("contact_type", value: contactType)
    event?.addCallbackParameter("platform", value: "ios")
    
    // 发送事件
    Adjust.trackEvent(event)
}
```

---

## 🌐 第四步：Web SDK 接入

### 4.1 加载 SDK

在 `index.html` 或 `submit.html` 添加：

```html
<script src="https://cdn.adjust.com/adjust-5.2.0.min.js"></script>
```

### 4.2 初始化

```javascript
// 配置
const ADJUST_CONFIG = {
  appToken: 'YOUR_ADJUST_APP_TOKEN',
  environment: 'production', // 或 'sandbox'
  logLevel: 'warning'
};

// 初始化
Adjust.initSdk({
  appToken: ADJUST_CONFIG.appToken,
  environment: ADJUST_CONFIG.environment
});
```

### 4.3 带去重的联系事件追踪

```javascript
// 用户唯一标识（存储在 localStorage）
function getUserId() {
  let userId = localStorage.getItem('adjust_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('adjust_user_id', userId);
  }
  return userId;
}

// 追踪联系事件（单个用户仅触发一次）
function trackContactEvent(jobId, contactType) {
  const userId = getUserId();
  const storageKey = `contact_tracked_${userId}`;
  
  // 检查是否已触发
  if (localStorage.getItem(storageKey)) {
    console.log('Contact event already tracked for this user');
    return;
  }
  
  // 创建 Adjust 事件
  const event = {
    eventToken: 'xyz789abc', // completed_registration
    callbackParams: [
      { key: 'job_id', value: jobId },
      { key: 'contact_type', value: contactType },
      { key: 'user_id', value: userId },
      { key: 'platform', value: 'web' }
    ]
  };
  
  // 发送 Adjust 事件
  Adjust.trackEvent(event);
  
  // 同时发送 FB/TikTok/Firebase（可选）
  trackFacebookEvent();
  trackTikTokEvent();
  trackFirebaseEvent();
  
  // 标记已触发
  localStorage.setItem(storageKey, 'true');
  console.log('✅ Contact event tracked successfully');
}

// 辅助函数：追踪其他平台
function trackFacebookEvent() {
  if (window.fbq) {
    fbq('track', 'CompleteRegistration');
  }
}

function trackTikTokEvent() {
  if (window.ttq) {
    ttq.push(['track', 'Register']);
  }
}

function trackFirebaseEvent() {
  if (window.firebase && firebase.analytics) {
    firebase.analytics().logEvent('sign_up');
  }
}
```

### 4.4 绑定到联系按钮

```javascript
// 自动绑定所有带 data-track-contact 的按钮
document.addEventListener('DOMContentLoaded', () => {
  const contactButtons = document.querySelectorAll('[data-track-contact]');
  
  contactButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const jobId = btn.dataset.jobId;
      const contactType = btn.dataset.contactType;
      
      // 追踪事件
      trackContactEvent(jobId, contactType);
      
      // 延迟跳转，确保事件发送
      const href = btn.href;
      if (href && !href.startsWith('#')) {
        e.preventDefault();
        setTimeout(() => {
          window.open(href, '_blank');
        }, 300);
      }
    });
  });
});
```

---

## 🔗 第五步：深度链接（Deep Link）配置

### 5.1 Android 配置

编辑 `AndroidManifest.xml`:

```xml
<activity android:name=".MainActivity">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" 
              android:host="gptjobs.app" 
              android:pathPrefix="/job" />
    </intent-filter>
</activity>
```

### 5.2 iOS 配置

编辑 `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.gptjobs.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>gptjobs</string>
        </array>
    </dict>
</array>
```

---

## 📊 第六步：回调与后端对接

### 6.1 Adjust 实时回调设置

在 Adjust Dashboard → App Settings → Raw Data Export → Real-Time Callbacks:

**Callback URL:**
```
https://gpt-jobs-api-mujotqfwaa-de.a.run.app/api/adjust/callback
```

**回调参数:**
- `{job_id}` - 岗位 ID
- `{contact_type}` - 联系方式（whatsapp/telegram/email）
- `{user_id}` - 用户标识
- `{platform}` - 平台（android/ios/web）
- `{event_token}` - 事件 Token

### 6.2 后端接收回调

编辑 `backend/src/routes/index.js`，添加：

```javascript
// Adjust 回调接收
router.post('/adjust/callback', async (req, res) => {
  const {
    job_id,
    contact_type,
    user_id,
    platform,
    event_token,
    adid  // Adjust ID
  } = req.body;
  
  // 记录到数据库
  await db.collection('adjust_events').add({
    job_id,
    contact_type,
    user_id,
    platform,
    adid,
    event_token,
    created_at: new Date()
  });
  
  // 标记岗位转化
  if (job_id) {
    await db.collection('jobs').doc(job_id).update({
      has_contact_conversion: true,
      last_contact_at: new Date()
    });
  }
  
  res.json({ code: 200, message: 'ok' });
});
```

---

## 🧪 第七步：测试验证

### 7.1 测试沙盒环境

```javascript
// 测试时使用沙盒环境
Adjust.initSdk({
  appToken: 'YOUR_APP_TOKEN',
  environment: 'sandbox'  // ← 测试用沙盒
});
```

### 7.2 查看测试日志

```bash
# Android
adb logcat -s Adjust

# iOS (Xcode)
# 查看 Console 日志
```

### 7.3 验证事件

在 Adjust Dashboard → Testing Console 查看：
- 设备是否出现
- 事件是否正确上报
- 参数是否完整

---

## 📱 第八步：渠道对接

### 8.1 Facebook (Meta)

在 Adjust → Partner Setup → Facebook:
1. 关联 Facebook App ID
2. 启用 App Events 回传
3. 启用 SKAdNetwork（iOS 14+）

### 8.2 Google Ads

1. 链接 Google Ads 账号
2. 启用 Conversion 回传
3. 配置 First Open 事件

### 8.3 TikTok

1. 添加 TikTok 为 Partner
2. 配置 Pixel ID
3. 启用事件回传

---

## 🚀 部署上线

### 修改跟踪代码中的占位符

1. 打开 `www/js/adjust-config.js`
2. 替换为真实值：

```javascript
const ADJUST_CONFIG = {
  appToken: '你的真实_App_Token',
  eventTokens: {
    registration: '你的_事件_Token'
  }
};
```

3. 提交代码并部署

### 上线检查清单

- [ ] Android SDK 集成测试通过
- [ ] iOS SDK 集成测试通过  
- [ ] Web SDK 集成测试通过
- [ ] 深度链接测试通过
- [ ] 回调接收正常
- [ ] 沙盒事件可查看
- [ ] 渠道 Partner 已配置

---

## 📞 支持

**Adjust 官方文档:**
- Android: https://github.com/adjust/android_sdk
- iOS: https://github.com/adjust/ios_sdk
- Web: https://github.com/adjust/web_sdk

**遇到问题？**
1. 检查 Logcat/Xcode Console 日志
2. 在 Adjust Dashboard Testing Console 查看
3. 联系 Adjust 技术支持

---

**接入完成！** 🎉
现在 GPTJobs 可以追踪：
- ✅ 用户来源（自然/广告）
- ✅ 岗位浏览、详情打开、联系点击
- ✅ 跨平台归因（Web→App）
- ✅ 渠道 ROI 分析