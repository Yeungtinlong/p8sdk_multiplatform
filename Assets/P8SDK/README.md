# P8SDK (支持微信、抖音小游戏切换) 接口文档

## 必读

* 导入插件后请点击顶部菜单 `P8SDK/初始化P8SDK>>[相应平台]`完成初始化。
* 所有接口功能，可在 /P8SDK/Scene/P8SDK_Sample 场景中测试。
* 所有接口均在P8SDKSpace命名空间.P8SDK类调用，均为静态方法。

## 一、登录

### 1、 登录，必接，在启动游戏后调用

``` csharp
P8SDK.Login(new LoginOption()
{
    success = res => P8SDK.Log($"login success: {JsonMapper.ToJson(res)}"),
    fail = res => P8SDK.Log($"login fail: {JsonMapper.ToJson(res)}"),
});
```

## 二、支付

### 1、SDK支付 必接

``` csharp
P8SDK.Pay(new PayOption()
{
    roleid = "test_roleid",
    rolename = "test_rolename",
    cp_order_id = "test_cp_order_id",
    serverid = "test_serverid",
    productid = "test_productid",
    product_name = "test_product_nam",
    ext = "test_ext",
    mdsVersion = "test_mdsVersion",
    env = "test_env",
    money = "test_money",
    level = "test_level",
    test = "test_test",
    callback = res => P8SDK.Log($"Pay callback {JsonMapper.ToJson(res)}"),
});
```

## 三、行为上报

### 1、SDK激活

``` csharp
P8SDK.OnActiveFunc();
```

### 2、登录行为上报，必接

``` csharp
P8SDK.PushLoginData(new PushLoginDataOption()
{
    sid = "test_sid",
    level = "10",
    onlinetime = "9999",
    roleid = "test_roleid",
    rolename = "test_rolename",
    username = "test_username",
    vip = "9999"
});
```

### 3、角色升级上报，必接

* 每次玩家升级或者过关的时候调用一下

``` csharp
P8SDK.UpgradeRecord(new UpgradeRecordOption()
{
    level = "1",
    oaid = "test_oaid",
    onlinetime = "9999",
    roleid = "test_roleid",
    rolename = "test_rolename",
    sid = "test_sid",
    vip = "9999"
});
```

### 4、新创角色上报 按需接入

* 传入对应的请求参数
* 只有初次注册的时候会统计

``` csharp
P8SDK.SignLog(new SignLogOption()
{
    level = "9999",
    roleid = "test_roleid",
    rolename = "test_rolename",
    sid = "test_sid"
});
```

### 5、关卡进出上报

``` csharp
P8SDK.LevelUpgrade(new LevelUpgradeOption()
{
    level = "9999",
    level_status = "1",
});
```

### 6、微信广告点击日志上报

``` csharp
P8SDK.RewardedAdLog(new RewardedAdLogOption()
{
    sid = "test_sid",
    roleid = "test_roleid",
    rolename = "test_rolename",
    level = "test_level",
    ad_slot = "test_ad_slot",
    ad_unit_ad = "test_ad_unit_ad",
    type = "test_type",
    status = "test_status",
    ad_position = "test_ad_position"
});
```

## 四、广告接入

* 微信小游戏流量主广告 按需接入 （微信广告玩家当日有次数限制 CP应做下超额处理）

### 1、初始化广告，参数没有传空值

``` csharp
P8SDK.AdInit(new AdInitOption()
{
    rewardedAdInitOption = new RewardedAdInitOption()
    {
        adUnitId = "adunit-646d6e72bf2e9d2f",
    },
});
```

### 2、激励广告

``` csharp
P8SDK.RewardedAdShow(new RewardedAdShowOption()
{
    success = () => P8SDK.Log($"RewardedAdShow success."),
    close = () => P8SDK.Log($"RewardedAdShow close."),
    fail = res => P8SDK.Log($"RewardedAdShow fail: {JsonMapper.ToJson(res)}"),
    adPosition = "video_test_ad_position",
});
```

### 3、插屏广告

``` csharp
P8SDK.InterstitialAdShow(new InterstitialAdShowOption()
{
    adPosition = "scene_test_ad_position",
    close = () => P8SDK.Log($"InterstitialAdShow close."),
    fail = (res) => P8SDK.Log($"InterstitialAdShow fail {JsonMapper.ToJson(res)}."),
});
```

### 4、Banner广告

* 显示banner

``` csharp
P8SDK.BannerAdShow(new BannerAdShowOption()
{
    adPosition = "banner_test_ad_position",
});
```

* 隐藏Banner

``` csharp
P8SDK.BannerAdHide();
```

### 5、模版广告

* 显示模版广告

``` csharp
P8SDK.CustomAdShow(new CustomAdShowOption()
{
    adPosition = "custom_test_ad_position",
});
```

* 隐藏模版广告

``` csharp
P8SDK.CustomAdHide();
```

* 注册模版广告关闭事件

``` csharp
P8SDK.CustomAdOnClose(new GeneralCompleteCallbackOption()
{
    complete = () => P8SDK.Log($"CustomAdOnClose complete."),
});
```