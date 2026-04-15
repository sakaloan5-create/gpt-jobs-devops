# GPTJobs Mobile - Adjust SDK 接入代码

## 📦 第一步：安装依赖

```bash
cd /Users/laosan/.openclaw/workspace/gpt-jobs-devops/gpt-jobs-mobile

# 安装 Adjust React Native SDK
npm install react-native-adjust@4.38.3

# 如果是 Expo 托管项目，需要 eject
npx expo prebuild
```

---

## 🔧 第二步：配置文件

### 1. 创建 Adjust 配置

新建文件 `src/config/adjust.ts`:

```typescript
// Adjust 配置 - 填入你的实际参数
export const ADJUST_CONFIG = {
  // 从 Adjust Dashboard 获取
  appToken: 'YOUR_ADJUST_APP_TOKEN', // 示例: abc123xyz
  
  // 环境: 'sandbox' (测试) | 'production' (生产)
  environment: 'sandbox',
  
  // 事件 Token (从 Adjust Dashboard 创建事件后获取)
  eventTokens: {
    completedRegistration: 'xyz789abc', // 完成注册/联系
    jobListView: 'def456ghi',           // 浏览岗位列表
    jobDetailOpen: 'ghi789jkl',         // 打开岗位详情
    jobContactClick: 'jkl012mno',       // 点击联系按钮
  },
  
  // 日志级别
  logLevel: 'verbose' // 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'suppress'
};

// 检查是否已配置
export const isAdjustConfigured = (): boolean => {
  return ADJUST_CONFIG.appToken !== 'YOUR_ADJUST_APP_TOKEN';
};
```

### 2. 创建 Adjust 服务

新建文件 `src/services/adjust.ts`:

```typescript
import { Adjust, AdjustConfig, AdjustEvent, AdjustEnvironment } from 'react-native-adjust';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADJUST_CONFIG, isAdjustConfigured } from '../config/adjust';

const STORAGE_KEY = '@adjust_contact_tracked';

/**
 * 初始化 Adjust SDK
 */
export const initAdjust = (): void => {
  if (!isAdjustConfigured()) {
    console.warn('Adjust not configured - please set your app token');
    return;
  }

  const environment = ADJUST_CONFIG.environment === 'production' 
    ? AdjustEnvironment.Production 
    : AdjustEnvironment.Sandbox;

  const config = new AdjustConfig(
    ADJUST_CONFIG.appToken,
    environment
  );

  // 设置日志级别
  config.setLogLevel(ADJUST_CONFIG.logLevel);
  
  // 启用事件缓冲（减少网络请求）
  config.setEventBufferingEnabled(true);
  
  // 启用 SKAdNetwork (iOS 14+)
  config.setLinkMeEnabled(true);

  Adjust.create(config);
  console.log('✅ Adjust SDK initialized');
};

/**
 * 追踪标准事件
 */
export const trackEvent = (eventToken: string, params?: Record<string, string>): void => {
  if (!isAdjustConfigured()) return;

  const event = new AdjustEvent(eventToken);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      event.addCallbackParameter(key, value);
    });
  }

  Adjust.trackEvent(event);
};

/**
 * 追踪浏览岗位列表
 */
export const trackJobListView = (country?: string): void => {
  trackEvent(ADJUST_CONFIG.eventTokens.jobListView, {
    action: 'job_list_view',
    country: country || 'all',
    platform: 'mobile_app'
  });
};

/**
 * 追踪打开岗位详情
 */
export const trackJobDetailOpen = (jobId: string, jobTitle: string): void => {
  trackEvent(ADJUST_CONFIG.eventTokens.jobDetailOpen, {
    action: 'job_detail_open',
    job_id: jobId,
    job_title: jobTitle,
    platform: 'mobile_app'
  });
};

/**
 * 追踪点击联系按钮（带去重）
 * 单个用户仅触发一次
 */
export const trackContactClick = async (
  jobId: string, 
  jobTitle: string,
  contactType: string
): Promise<boolean> => {
  if (!isAdjustConfigured()) return false;

  try {
    // 检查是否已触发
    const hasTracked = await AsyncStorage.getItem(`${STORAGE_KEY}_${jobId}`);
    if (hasTracked) {
      console.log('Contact event already tracked for job:', jobId);
      return false;
    }

    // 创建事件
    const event = new AdjustEvent(ADJUST_CONFIG.eventTokens.jobContactClick);
    
    // 添加回调参数
    event.addCallbackParameter('job_id', jobId);
    event.addCallbackParameter('job_title', jobTitle);
    event.addCallbackParameter('contact_type', contactType);
    event.addCallbackParameter('action', 'job_contact_click');
    event.addCallbackParameter('platform', 'mobile_app');
    
    // 添加 Partner 参数 (用于 FB/TT 回传)
    event.addPartnerParameter('fb_content_type', 'job');
    event.addPartnerParameter('fb_content_id', jobId);
    
    // 发送事件
    Adjust.trackEvent(event);
    
    // 同时触发完成注册事件（用于归因）
    const regEvent = new AdjustEvent(ADJUST_CONFIG.eventTokens.completedRegistration);
    regEvent.addCallbackParameter('job_id', jobId);
    regEvent.addCallbackParameter('contact_type', contactType);
    Adjust.trackEvent(regEvent);
    
    // 标记已触发
    await AsyncStorage.setItem(`${STORAGE_KEY}_${jobId}`, 'true');
    
    console.log('✅ Adjust: Contact click tracked', { jobId, contactType });
    return true;
    
  } catch (error) {
    console.error('Adjust track error:', error);
    return false;
  }
};

/**
 * 重置追踪状态（用于测试）
 */
export const resetTrackingState = async (jobId?: string): Promise<void> => {
  if (jobId) {
    await AsyncStorage.removeItem(`${STORAGE_KEY}_${jobId}`);
  } else {
    const keys = await AsyncStorage.getAllKeys();
    const trackKeys = keys.filter(k => k.startsWith(STORAGE_KEY));
    await AsyncStorage.multiRemove(trackKeys);
  }
};

/**
 * 获取 Adjust ID (用于调试)
 */
export const getAdjustId = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    Adjust.getAdid((adid) => {
      resolve(adid);
    });
  });
};

/**
 * 启用/禁用 SDK
 */
export const setEnabled = (enabled: boolean): void => {
  Adjust.setEnabled(enabled);
};

/**
 * 检查是否启用
 */
export const isEnabled = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    Adjust.isEnabled((enabled) => {
      resolve(enabled);
    });
  });
};
```

---

## 🎨 第三步：创建 React Hook

新建文件 `src/hooks/useAdjust.ts`:

```typescript
import { useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { 
  initAdjust, 
  trackJobListView, 
  trackJobDetailOpen, 
  trackContactClick,
  trackEvent,
  getAdjustId 
} from '../services/adjust';

/**
 * 初始化 Adjust SDK
 */
export const useAdjustInit = () => {
  useEffect(() => {
    initAdjust();
  }, []);
};

/**
 * 追踪岗位列表浏览
 */
export const useTrackJobList = (country?: string) => {
  useFocusEffect(
    useCallback(() => {
      trackJobListView(country);
    }, [country])
  );
};

/**
 * 追踪岗位详情打开
 */
export const useTrackJobDetail = (jobId: string, jobTitle: string) => {
  useEffect(() => {
    if (jobId) {
      trackJobDetailOpen(jobId, jobTitle);
    }
  }, [jobId, jobTitle]);
};

/**
 * 追踪联系点击
 */
export const useTrackContact = () => {
  const trackContact = useCallback(async (
    jobId: string,
    jobTitle: string, 
    contactType: string
  ): Promise<boolean> => {
    return await trackContactClick(jobId, jobTitle, contactType);
  }, []);

  return { trackContact };
};

/**
 * 获取 Adjust ID（调试用）
 */
export const useAdjustId = () => {
  const getId = useCallback(async (): Promise<string | null> => {
    return await getAdjustId();
  }, []);

  return { getAdjustId: getId };
};
```

---

## 📱 第四步：在页面中使用

### 岗位列表页 (`app/(tabs)/jobs.tsx`)

```typescript
import { useTrackJobList } from '../../hooks/useAdjust';

export default function JobsScreen() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  
  // 自动追踪浏览
  useTrackJobList(selectedCountry);
  
  return (
    <View>
      {/* 岗位列表 UI */}
    </View>
  );
}
```

### 岗位详情页 (`app/job/[id].tsx`)

```typescript
import { useTrackJobDetail, useTrackContact } from '../../hooks/useAdjust';
import { Alert, Linking } from 'react-native';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const job = useJob(id); // 获取岗位数据
  
  // 追踪详情打开
  useTrackJobDetail(id as string, job?.title || '');
  
  // 获取联系追踪函数
  const { trackContact } = useTrackContact();

  const handleContact = useCallback(async () => {
    // 1. 先追踪事件（带去重）
    const tracked = await trackContact(
      id as string,
      job.title,
      job.contact_platform
    );
    
    // 2. 打开联系链接
    const canOpen = await Linking.canOpenURL(job.contact_link);
    if (canOpen) {
      await Linking.openURL(job.contact_link);
    } else {
      Alert.alert('无法打开链接', '请检查链接格式');
    }
    
    // 3. 显示提示（首次点击）
    if (tracked) {
      console.log('首次点击，已追踪归因');
    }
  }, [id, job, trackContact]);

  return (
    <View>
      {/* 岗位详情 */}
      
      <TouchableOpacity 
        style={styles.contactButton}
        onPress={handleContact}
      >
        <Text>点击联系</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## ⚙️ 第五步：Android 原生配置

### 编辑 `android/app/build.gradle`

在 dependencies 中添加：

```gradle
dependencies {
    // 现有依赖...
    
    // Adjust SDK
    implementation 'com.adjust.sdk:adjust-android:4.38.3'
    implementation 'com.android.installreferrer:installreferrer:2.2'
    
    // Google Play Services (用于获取 GAID)
    implementation 'com.google.android.gms:play-services-ads-identifier:18.0.1'
}
```

### 编辑 `android/app/proguard-rules.pro`

添加 ProGuard 规则：

```
# Adjust SDK
-keep class com.adjust.sdk.** { *; }
-keep class com.google.android.gms.common.ConnectionResult {
    int SUCCESS;
}
-keep class com.google.android.gms.ads.identifier.AdvertisingIdClient {
    com.google.android.gms.ads.identifier.AdvertisingIdClient$Info getAdvertisingIdInfo(android.content.Context);
}
-dontwarn com.adjust.sdk.**
```

### 编辑 `AndroidManifest.xml`

添加深度链接支持：

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTask">
    
    <!-- 深度链接 -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" 
              android:host="gptjobs.app" 
              android:pathPrefix="/job/" />
    </intent-filter>
    
    <!-- Scheme 链接 -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="gptjobs" />
    </intent-filter>
</activity>
```

---

## 🍎 第六步：iOS 原生配置

### 编辑 `ios/Podfile`

确保平台版本 >= 13：

```ruby
platform :ios, '13.0'

target 'YourApp' do
  # Adjust SDK 已通过 npm 安装，这里不需要额外添加
end
```

### 编辑 `ios/YourApp/AppDelegate.mm`

```objc
#import <Adjust/Adjust.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // ... 现有代码
  
  // 深度链接处理
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// 深度链接回调
- (BOOL)application:(UIApplication *)application 
            openURL:(NSURL *)url 
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  [Adjust appWillOpenUrl:url];
  return [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application 
continueUserActivity:(NSUserActivity *)userActivity 
 restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  [Adjust appWillOpenUrl:userActivity.webpageURL];
  return [RCTLinkingManager application:application 
                  continueUserActivity:userActivity 
                    restorationHandler:restorationHandler];
}
```

### 编辑 `Info.plist`

添加 URL Scheme：

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

## 🧪 第七步：测试

### 1. 检查日志

```bash
# Android
adb logcat -s Adjust

# iOS (Xcode)
# 查看 Console 输出
```

### 2. 验证事件

在 Adjust Dashboard → Testing Console 查看设备。

### 3. 调试辅助函数

在设置页添加调试按钮：

```typescript
import { getAdjustId, resetTrackingState } from '../services/adjust';

// 显示 Adjust ID
const showAdjustId = async () => {
  const id = await getAdjustId();
  Alert.alert('Adjust ID', id || '未获取');
};

// 重置追踪状态
const resetState = async () => {
  await resetTrackingState();
  Alert.alert('已重置', '可以重新测试追踪');
};
```

---

## 🚀 第八步：上线配置

### 修改生产环境

编辑 `src/config/adjust.ts`:

```typescript
export const ADJUST_CONFIG = {
  appToken: '你的真实_App_Token',
  environment: 'production', // ← 上线前改为 production
  eventTokens: {
    completedRegistration: '你的_真实_Event_Token',
    // ...
  },
  logLevel: 'warn' // ← 上线改为 warn 或 error
};
```

### 构建发布

```bash
# Android
npx expo prebuild --platform android
cd android
./gradlew assembleRelease

# iOS
npx expo prebuild --platform ios
cd ios
# 用 Xcode 打包
```

---

## 📋 接入检查清单

- [ ] 安装 `react-native-adjust`
- [ ] 配置 `src/config/adjust.ts`
- [ ] 创建 `src/services/adjust.ts`
- [ ] 创建 `src/hooks/useAdjust.ts`
- [ ] 在列表页添加 `useTrackJobList`
- [ ] 在详情页添加 `useTrackJobDetail`
- [ ] 在联系按钮添加 `trackContact`
- [ ] 配置 Android ProGuard
- [ ] 配置 iOS Info.plist
- [ ] 沙盒环境测试通过
- [ ] 切换到 production 环境
- [ ] 上线前检查日志级别

---

**需要我帮你修改具体文件或写更多代码吗？**