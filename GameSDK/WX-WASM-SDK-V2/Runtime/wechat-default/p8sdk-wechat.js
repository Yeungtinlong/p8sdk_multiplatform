var P8SDK_VERSION = "2.0.49"; // 2025-10-9 17:38:17
var systemValues = {};
var start_param = "";
var inBPack = null;
var loginResult = null;
let ad_show_time = 1;
let paydata = {
  offerId: "",
  scale: "",
  zoneId: "",
  pf: "",
};
const SDKCODEHASH = "wjtxdwxxyx";
const SDKCODETYPE = 1; // 1：site 2：appid SDK检查类型
var p8OrderIdCX = "";
let SDKTYPE = 1; // 1: iap 2: iaa
let localCDN = false; // 是否使用本地cdn

let isLoggingIn = false;
let hasActivated = false;
let haspushLogin = false;

var win = (function () {
  // 尝试使用typeof来检查window对象是否存在，而不是通过try-catch
  if (typeof window !== "undefined") {
    return window;
  }
  // 如果window不存在，则返回GameGlobal（假设这是非浏览器环境中的全局对象）
  // 注意：如果GameGlobal也可能不存在，你应该添加一个额外的检查或默认值
  return GameGlobal || {}; // 提供一个空对象作为默认值，以防GameGlobal也不存在
})();

var P8SDK = {};
// var DNSDKMINIGAME = require('./dn-sdk-minigame')
var TXDNSDK = {}

let switchCheck;
var template_ids = [];
var gotoObj = {
  b_site: "",
};
var DEBUG = false;
if (DEBUG) {
  initTestBtnObj();
}
var configRequestNum = 0;

let configData = {
  aesTxt: "9F5syy/v1o+waEGuqKzP6FGJo+tsVWiKyeginHIHN00++37ugFHmM3S8cSXZBrGkV7pB8dK7LWSbywvxGX8PAH39rroNjX8fM02m8n65yy2EynhipL/450gee1ceyTCRuhclNYGXt4jkOvYV66ExAsBSckQFpJOadE18Ywxw3Lh8t//VgY+epPZQChvhrBD35hu0eUcC23E4HmzNUPan/nXjxCVSTq0kml8S7zCS9+D3Hc5X/mY7szrIx3DkK1+I9BSSh+IyFTFTkYvxVJUMxmD0NybDRZLvU/ofD9kwzHvwDjZFv2nmngvYMc6dNglVBg4ckEhLh4RhCylB6A8abxOlPDmosEQHHavtv7CD4V5e6cV4uOmzlzlacVMkpFW+74jyTkc2juTj8L8PckCP+tGe1utebauT/OxTXxo8KpzycAOp7DOH7cyG037ORpTfwLWO7OQsUmJSiUNxjGJdw6S6J5Q3Jba5kr45tS0shBjB+12nBjZMNNgf/LKm7+pl7XCNiXI3Ie/Lg955Mbsc9jZtFBlCu6k2WX6alufZ6ZUQvSJ2JrzD8lqQCdKB5xlIELXaHvrSy3c3INyEBi307biayRSpirNfJ6qv3sSq6QFT6TCdGz2RP+IVMPX3tuYHlFW60prXLWUMKbuEI+pjza9XcDleOKYjTkLM+2ajkbK3jtOgXcr7tu37Is5ZkYg/NQVXmrXm6/wiIC9sn/5443aXNZussPBeCdKh/MC1eLe6JcI2j+WzYKq6oXSvoFWu"
}

try {
  var adConfigData = '';
} catch (err) {}

/** 初始化腾讯sdk */
function initTXSDK(config) {
  print('初始化腾讯SDKconfig:', config)
  if (!config || !config.appid) {
    print('腾讯SDK初始化失败,未使用广点通请忽略')
    return
  }
  // Nn.setDebug(true);
  TXDNSDK = new Nn({
    // 数据源ID，数字，必填
    user_action_set_id: Number(config.user_action_set_id),
    // 加密key，必填
    secret_key: config.secret_key,
    // 微信小游戏APPID，wx开头，必填
    appid: config.appid,
  })
  TXDNSDK.setOpenId(sdkData.openid);
  console.log('sdkData', sdkData);
  console.log('sdkData.openid', sdkData.openid);

  // 监听收藏，触发腾讯sdk埋点
  wx.onAddToFavorites(() => {
    console.log(" 监听到收藏游戏...")
    if (TXDNSDK.track) {
      TXDNSDK.track('ADD_TO_WISHLIST', {
        //  普通收藏（default）
        type: 'default',
      });
    }
  })
  // 监听分享朋友圈，触发腾讯sdk埋点
  wx.onShareTimeline(() => {
    console.log(" 监听到分享朋友圈...")
    if (TXDNSDK.track) {
      TXDNSDK.track('SHARE', {
        target: 'TIME_LINE'
      });
    }
  })
  // 新注册用户上报注册
  if (sdkData.isRegisterUser) {
    txSdkHeartBeat('REGISTER', sdkData)
  }
  // 沉默唤起(RE_ACTIVE)
  else if (sdkData.isReactiveUser !== 0) {
    console.log("RE_ACTIVE_data", sdkData.backFlowDay)
    txSdkHeartBeat('RE_ACTIVE', {
      backFlowDay: sdkData.backFlowDay
    })
  }
}

/**
 * v2.0.23 新腾讯SDK上报
 * @param {*} type 上报类型，文档：https://datanexus.qq.com/doc/develop/guider/interface/enum#action-type
 * @param {*} data 上报数据
 */
function txSdkHeartBeat(type, data) {
  // 如果没有初始化，则返回
  if (Object.keys(TXDNSDK).length === 0) {
    print('腾讯SDK未初始化: ', data)
    return
  }
  var newData = formatTXSDKData(getCommonHeartBeatData(data))
  print('腾讯SDK上报信息-' + type + ': ', newData)
  TXDNSDK.track(type, newData)
}

/** 广告sdk获取配置参数 */
function getAdvConf() {
  return new Promise((resolve, reject) => {
    wxRequestShort(
      `${sdkData.platform_url}/api/getAdvConf`,
      'get',
      getReqBaseData({
        channel: 'wxxyx_sdk'
      }),
      (res) => {
        resolve(res.data)
      },
      (err) => {
        reject(err)
      }
    )
  })
}

/** 获取接口请求的基本参数 */
function getReqBaseData(other = {}) {
  const data = Object.assign({
      appid: sdkData.appid,
      site: sdkData.site,
      time: parseInt(new Date().getTime() / 1e3),
    },
    other
  )
  data.sign = md5(SignGetForCenter(data))
  return data
}

/** 获取公共上报信息 */
function getCommonHeartBeatData(otherData = {}) {
  var data = {
    version: P8SDK_VERSION,
    aid: sdkData.aid,
    uid: sdkData.uid,
    username: sdkData.account,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    ip: sdkData.ip,
    device_model: sdkData.device_model,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    game_type: 'mini',
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    is_model: 1,
    gameversion: sdkData.gameversion,
    mac: sdkData.mac,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    })
  }
  if (otherData instanceof Object && !Array.isArray(otherData)) {
    return Object.assign(data, otherData)
  } else {
    return Object.assign(data, {
      value: Array.isArray(otherData) ?
        JSON.stringify(otherData) : otherData,
    })
  }
}

function formatTXSDKData(data) {
  if (data instanceof Object) {
    for (const key in data) {
      const val = data[key]
      if (val === undefined || val === null) {
        data[key] = ''
      } else if (!['string', 'number', 'boolean'].includes(typeof val)) {
        data[key] = JSON.stringify(data[key])
      }
    }
  }
  return data
}

function goto_gift() {
  let e = parseInt(new Date().getTime() / 1e3);
  let t = {
    site: sdkData.site,
    aid: sdkData.aid,
    time: e,
    uid: sdkData.uid,
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  let i = `${sdkData.platform_url}/switch/wxToMsg`;
  let n = function (e) {
    let t = e.data.data;
    if (!getItem("show_num")) {
      setItem("show_num", 1);
    }
    console.log("getItem show_num ", getItem("show_num"));
    let a = getItem("show_num");
    if (t.s == true && a <= t.show_num) {
      a = a + 1;
      setItem("show_num", a);
      wx.showModal({
        title: t.title,
        content: t.content,
        showCancel: false,
        confirmText: t.bot_title,
        success(e) {
          if (e.confirm) {
            console.log("用户点击确定");
            if (t.is_cope == 1) {
              wx.setClipboardData({
                data: t.bot_content,
                success(e) {
                  wx.getClipboardData({
                    success(e) {
                      console.log("复制内容：", e);
                    },
                  });
                },
              });
            } else {
              print("复制未开启");
            }
          }
        },
      });
    } else {

      return;
    }
  };
  wxRequest(i, "GET", t, n);
}

function gotoLocalStore() {
  let e = parseInt((new Date).getTime() / 1e3);
  let t = {
    site: sdkData.site,
    time: e,
    type: '42',
    ext: 'appid',
    default: '0',
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  let i = `${sdkData.platform_url}/switch/switchList`;
  let n = function (e) {
    wx.setStorageSync('extAppid', e.data.data.appid);
  }

  wxRequest(i, "GET", t, n);
}

function gotoSwitchN(wx_scene_id) {
  let e = parseInt((new Date).getTime() / 1e3);
  let t = {
    site: sdkData.site,
    time: e,
    type: '54',
    default: '1',
    wx_scene_id,
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  let i = `${sdkData.platform_url}/switch/switchListN`;
  let n = function (e) {
    let code = e.data.result
    sdkData.blacklistCode = code;
  }
  wxRequest(i, "GET", t, n);
}

function gotosiyuSwitchN() {
  let e = parseInt((new Date).getTime() / 1e3);
  let t = {
    site: sdkData.site,
    time: e,
    type: '63',
    default: '0',
    ext: 'appid',
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  let i = `${sdkData.platform_url}/switch/switchListN`;
  let n = function (e) {
    wx.setStorageSync('priAppid', e.data.data.appid);
  }
  wxRequest(i, "GET", t, n);
}

function gotosiyuVipSwitchN() {
  let e = parseInt((new Date).getTime() / 1e3);
  let t = {
    site: sdkData.site,
    time: e,
    type: '70',
    default: '0',
    ext: 'appid',
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  let i = `${sdkData.platform_url}/switch/switchListN`;
  // let i = `https://tcenter.play800.cn/switch/switchListN`;
  let n = function (e) {
    wx.setStorageSync('vipAppid', e.data.data.appid);
  }
  wxRequest(i, "GET", t, n);
}

function getOnlineRewardId() {
  let e = parseInt((new Date).getTime() / 1e3);
  let t = {
    site: sdkData.site,
    time: e,
    uid: sdkData.uid,
    appid: sdkData.appid,
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  let i = `${sdkData.platform_url}/mGame/rewardedVideoAdId`;
  // let i = `https://tcenter.play800.cn/mGame/rewardedVideoAdId`;
  let n = function (e) {
    sdkData.adIaaData = e.data.data;
    if (sdkData.adIaaData.RewardedVideoAd) {
      P8SDK.wxADinit(sdkData.adIaaData.RewardedVideoAd);
    }
    if (sdkData.adIaaData.InterstitialAd) {
      P8SDK.wxADinit('', sdkData.adIaaData.InterstitialAd);
    }
  }
  wxRequest(i, "GET", t, n);
}

function initTestBtnObj() {
  function e(e, t, a) {
    let i = wx.createUserInfoButton({
      type: "text",
      text: e,
      style: t,
    });
    i.onTap(a);
  }
  let t = {
    left: 10,
    top: 20,
    width: 200,
    height: 40,
    lineHeight: 40,
    backgroundColor: "#ff0000",
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    borderRadius: 4,
  };
  t.top += 50;
  e("登录", t, (e) => {
    print("支付点击回调");
  });
  t.top += 50;
  e("支付", t, (e) => {
    print("支付点击回调");
  });
}

function wxRequest(e, t, a, i, n) {
  wx.request({
    url: e,
    method: t,
    data: a,
    success: (e) => {
      if (i) {
        i(e);
      }
    },
    fail: (e) => {
      if (n) {
        n(e);
      }
    },
  });
}

function wxRequestShort(url, method, data, succ, fail) {
  wx.request({
    url: url,
    method: method,
    data: data,
    timeout: 2000,
    success: (e) => {
      if (succ) {
        succ(e);
      }
    },
    fail: (err) => {
      // wx.draw([' 重复链接 ---》', e])
      if (fail) {
        fail(err);
      }
      wxRequestShort(url, method, data, succ, fail);
    },
  });
}

function wxRequestConFigShort(url, method, data, succ, fail, localFn) {
  wx.request({
    url: url,
    method: method,
    data: data,
    timeout: 5000,
    success: (e) => {
      if (succ) {
        succ(e);
      }
    },
    fail: (err) => {
      if (fail) {
        fail(err);
      }

      wxDotLog(203, '获取CDN失败,进行本地获取', JSON.stringify(err), new Date().getTime())
      // 本地获取
      if (localCDN) {
        print('获取CDN失败,进行本地获取') // 获取CDN失败,进行本地获取
        let md5Key = md5(sdkData.appid);
        let plainText = decrypt(wx.CryptoJS.mode.ECB, configData.aesTxt, md5Key);
        let cfgObj = JSON.parse(plainText);
        let gameConfig = cfgObj.mini_game,
          argCfg;
        let urlAddress = cfgObj.url_address;
        console.log('gameConfig:', gameConfig);
        console.log('urlAddress:', urlAddress);

        // 配置参数信息
        if (gameConfig) {
          if (sdkData.platform.toLowerCase().indexOf("ios") != -1 || sdkData.platform.toUpperCase().indexOf("IOS") != -1) {
            argCfg = gameConfig.ios;
          } else {
            argCfg = gameConfig.android;
          }
          Object.assign(sdkData, {
            key: argCfg.key,
            site: argCfg.site,
            aid: argCfg.aid,
          });

          sdkData.game_id = argCfg.data_gid ? argCfg.data_gid : argCfg.aid.slice(-4);
        }

        // 配置主体域名
        if (urlAddress) {
          console.log("获取到的url_address", urlAddress);
          Object.assign(sdkData, {
            platform_url: urlAddress.platform_url,
            data_url: urlAddress.data_url,
            rg_url: urlAddress.rg_url,
            dsj_url: urlAddress.dsj_url,
            yanfa_url: urlAddress.yanfa_url,
          });
          localFn && localFn()
        } else {
          wx.showModal({
            title: "aid 配置异常",
            content: "异常",
            success(e) {},
          });
        }
      } else {
        // 不从本地获取，进行重试获取
        print('获取CDN失败,进行重试获取')
        setTimeout(() => {
          wxRequestConFigShort(url, method, data, succ, fail);
        }, 1000);
      }
    },
  });
}

function wxRequestLoginShort(url, method, data, succ, fail) {
  wx.request({
    url: url,
    method: method,
    data: data,
    timeout: 10000,
    success: (e) => {
      if (succ) {
        succ(e);
      }
    },
    fail: (err) => {
      if (fail) {
        fail(err);
      }
    },
  });
}

function print() {
  let t = "";
  for (let e = 0; e < 20; e++) {
    if (!arguments[e]) {
      console.info(t);
      return;
    }
    t += " " + JSON.stringify(arguments[e]);
  }
}

// 辅助函数
function md5(data) {
  return wx.CryptoJS.MD5(data).toString();
}

// 传入key之前要调用，不然结果不对
function parseKey(key) {
  return wx.CryptoJS.enc.Utf8.parse(key);
}

// 解密过程
function decrypt(mode, cipherText, key, iv = null) {
  const uKey = parseKey(key);
  const uIv = parseKey(iv);
  let bytes = wx.CryptoJS.AES.decrypt(cipherText, uKey, {
    iv: uIv,
    mode: mode,
    padding: wx.CryptoJS.pad.Pkcs7
  });
  // console.log('bytes', bytes.toString(wx.CryptoJS.enc.Base64));
  return bytes.toString(wx.CryptoJS.enc.Utf8);
}

// 等待CryptoJS加载
function waitForCryptoJS(callback) {
  if (wx.CryptoJS && wx.CryptoJS.mode && wx.CryptoJS.AES) {
    callback();
  } else {
    setTimeout(() => waitForCryptoJS(callback), 100);
  }
}

/**
 * 盒子跳转模式 盒子数据
 */
function getGameBoxData() {
  let result = new Promise((resolve, reject) => {
    let e = parseInt(new Date().getTime() / 1e3);
    let t = {
      site: sdkData.site,
      appid: sdkData.appid,
      time: e,
    };
    let n = SignGetForCenter(t);
    t.sign = md5(n);
    let o = `${sdkData.platform_url}/api/gameBox`;
    // let o = `https://tcenter.play800.cn/api/gameBox`;
    let rUrl = o + "?" + keyValueConnect(t);
    let r = "GET";
    let d = (res) => {
      sdkData.gameBoxData = res.data.data.config;
      sdkData.box_id = res.data.data.box_id;
      resolve();
    };
    let f = (err) => {
      print("盒子请求 失败返回data", JSON.stringify(err));
      resolve();
    };
    wxRequest(o, r, t, d, f);
  });
  return result;
}

// 获取CDN配置 新版本走本地获取CDN
function getUrlConfig() {
  print('CDN获取状态', localCDN ? '本地CDN' : '网络CDN')
  let result = new Promise((resolve, reject) => {
    if (localCDN) {
      wxDotLog(200, '进入获取CDN流程', '', new Date().getTime())
      let appInfo = wx.getAccountInfoSync().miniProgram;
      let appid = appInfo.appId;
      console.log('p8sdk版本:', P8SDK_VERSION);
      console.log('appid:', appid);
      sdkData.appid = appid;

      // 获取本地CDN配置
      waitForCryptoJS(() => {
        let md5Key = md5(appid);
        let plainText = decrypt(wx.CryptoJS.mode.ECB, configData.aesTxt, md5Key);
        let cfgObj = JSON.parse(plainText);
        let gameConfig = cfgObj.mini_game,
          argCfg;
        let urlAddress = cfgObj.url_address;
        wxDotLog(201, '获取CDN成功', '', new Date().getTime())
        // 配置参数信息
        if (gameConfig) {
          console.log('gameConfig:', gameConfig);
          if (sdkData.platform.toLowerCase().indexOf("ios") != -1 || sdkData.platform.toUpperCase().indexOf("IOS") != -1) {
            argCfg = gameConfig.ios;
          } else {
            argCfg = gameConfig.android;
          }
          Object.assign(sdkData, {
            key: argCfg.key,
            site: argCfg.site,
            aid: argCfg.aid,
          });

          sdkData.game_id = argCfg.data_gid ? argCfg.data_gid : argCfg.aid.slice(-4);

          // 检查SDK代码hash 唯一性
          setTimeout(() => {
            checkSDKCodeHash();
          }, 5000);
        }

        // 配置主体域名
        if (urlAddress) {
          console.log("获取到的url_address", urlAddress);
          Object.assign(sdkData, {
            platform_url: urlAddress.platform_url,
            data_url: urlAddress.data_url,
            rg_url: urlAddress.rg_url,
            dsj_url: urlAddress.dsj_url,
            yanfa_url: urlAddress.yanfa_url,
          });
          resolve();
        } else {
          wx.showModal({
            title: "本地CDN加密文件配置异常",
            content: "异常",
            success(e) {},
          });
          wxDotLog(202, '获取CDN失败,本地CDN加密文件配置异常', `本地CDN加密文件配置异常`, new Date().getTime())
          reject();
        }
      });
    } else {
      getUrlConfigOld(() => {
        resolve();
      });
    }
  });

  return result;
}


// 获取CDN配置 旧版本走网络请求CDN
function getUrlConfigOld(a) {
  // SDK初始化打点
  wxDotLog(200, '进入获取CDN流程', '', new Date().getTime())
  let result = new Promise((resolve, reject) => {
    let appInfo = wx.getAccountInfoSync().miniProgram;
    let appid = appInfo.appId;
    console.log('p8sdk版本:', P8SDK_VERSION);
    console.log('appid:', appid);
    // let configUrl = `https://h5gm.wscbwh.cn/${appid}.txt?time=${Date.now()}`;
    let configUrl = `https://ksyun.oss-cn-hangzhou.aliyuncs.com/${appid}.txt?time=${Date.now()}`;
    // let configUrl = `https://ksyun.oss-cn-hangzhou.aliyuncs.com/wx27343e291b971910.txt?time=${Date.now()}`;
    console.log('configUrl', configUrl);
    sdkData.appid = appid;
    let t = "GET";
    let i = "";
    let n = function (t) {
      // print("获取到的url信息", t);
      if (t.statusCode == 200) {
        wxDotLog(201, '获取CDN成功', '', new Date().getTime())

        let data = dateOrRes(t);
        console.log('加密数据data::', data);
        //
        let md5Key = md5(appid);
        let plainText = decrypt(wx.CryptoJS.mode.ECB, data, md5Key);
        let cfgObj = JSON.parse(plainText);
        let gameConfig = cfgObj.mini_game,
          argCfg;
        let urlAddress = cfgObj.url_address;
        console.log('gameConfig:', gameConfig);
        console.log('urlAddress:', urlAddress);

        // 配置参数信息
        if (gameConfig) {
          if (sdkData.platform.toLowerCase().indexOf("ios") != -1 || sdkData.platform.toUpperCase().indexOf("IOS") != -1) {
            argCfg = gameConfig.ios;
          } else {
            argCfg = gameConfig.android;
          }
          Object.assign(sdkData, {
            key: argCfg.key,
            site: argCfg.site,
            aid: argCfg.aid,
          });

          sdkData.game_id = argCfg.data_gid ? argCfg.data_gid : argCfg.aid.slice(-4);

          // 检查SDK代码hash 唯一性
          setTimeout(() => {
            checkSDKCodeHash();
          }, 5000);
        }

        // 配置主体域名
        if (urlAddress) {
          console.log("获取到的url_address", urlAddress);
          Object.assign(sdkData, {
            platform_url: urlAddress.platform_url,
            data_url: urlAddress.data_url,
            rg_url: urlAddress.rg_url,
            dsj_url: urlAddress.dsj_url,
            yanfa_url: urlAddress.yanfa_url,
          });
          resolve();
          if (a) {
            a();
          }
        } else {
          wx.showModal({
            title: "aid 配置异常",
            content: "异常",
            success(e) {},
          });
        }
      } else if (t.statusCode == 404) {
        console.error('该appid.txt不存在，请运营确认是否配置再进行登录');
        wxDotLog(204, '获取CDN失败,该appid.txt不存在，请运营确认是否配置再进行登录', '该appid.txt不存在，请运营确认是否配置再进行登录', new Date().getTime())
      }
    };
    let f = function (datas) {
      console.error("请求失败，请确认域名是否正确 ", datas);
      wxDotLog(202, '获取CDN失败,请求失败，请确认域名是否正确', `请求失败，请确认域名是否正确 ${JSON.stringify(datas)}`, new Date().getTime())
      // let ress = ["获取到的 urlaid.txt 失败 --->"];
      // for (const key in datas) {
      //   if (Object.hasOwnProperty.call(datas, key)) {
      //     const value = datas[key];
      //     ress.push(key + ":" + value);
      //   }
      // }
      // wx.draw(ress)
    };
    let localFn = () => {
      resolve();
      if (a) {
        a();
      }
    }
    wxRequestConFigShort(configUrl, t, i, n, f, localFn);
  });

  return result;
}

function dateOrRes(e) {
  return e.data ? e.data : e;
}

function dateFormat() {
  let e = new Date();
  let t;
  let a = "YYYY-mm-dd HH:MM:SS";
  const i = {
    "Y+": e.getFullYear().toString(),
    "m+": (e.getMonth() + 1).toString(),
    "d+": e.getDate().toString(),
    "H+": e.getHours().toString(),
    "M+": e.getMinutes().toString(),
    "S+": e.getSeconds().toString(),
  };
  for (let e in i) {
    t = new RegExp("(" + e + ")").exec(a);
    if (t) {
      a = a.replace(t[1], t[1].length == 1 ? i[e] : i[e].padStart(t[1].length, "0"));
    }
  }
  return a;
}

let p8openid;

var queryData = {
  weixinadinfo: "",
  gdt_vid: "",
  aid: "",
  code: "",
  c: "",
};

let sdkData = {
  mdsVersion: "2.0", // 米大师版本
  platform_url: "",
  data_url: "",
  rg_url: "",
  dsj_url: "",
  yanfa_url: "",
  key_android: "",
  site_android: "",
  key_ios: "",
  site_ios: "",
  aid: "",
  appid: "",
  monitorAid: "",
  uid: "",
  sname: "",
  sid: "",
  roleid: "",
  rolename: "",
  vip: "",
  level: "",
  gold: "",
  mac: "",
  device: "",
  modeltype: "wx",
  device_type: "1",
  gameversion: "",
  device_model: "",
  device_resolution: "",
  device_version: "",
  device_net: "",
  device_orientation: "",
  device_benchmarkLevel: "", // 设备性能得分
  device_modelLevel: "", // 机型档位
  device_cpuType: "", // CPU类型
  device_memorySize: "", // 内存大小
  device_code: "",
  platform: "",
  initOnshowFlag: true,
  onshowFlag: true,
  account: "",
  password: "",
  gameBoxData: [],
  box_id: "",
  scene_id: "",
  game_id: "",
  blacklistCode: "", // 黑名单开关
  adIaaData: {}, // 广告数据
  isRegisterUser: 0,
  isReactiveUser: 0,
  backFlowDay: 30,
  ad_slot: "", // 广告位创建的名称
  ad_unit_id: "", // 广告位id
  ad_positon: "", // 广告展示位置
  adList: {
    ad_unit_id_reward: "",
    ad_slot_reward: "",
    ad_unit_id_sence: "",
    ad_slot_sence: "",
    ad_unit_id_banner: "",
    ad_slot_banner: "",
    ad_unit_id_custom: "",
    ad_slot_custom: "",
  },
  P8clickid: "",
  client_id: "", // 用户临时唯一标识
  a_b_test: "", // AB实验
  stage_clear: "", // 通关成就
  formation: "", // 关卡阵容
  level_wave: "", // 波次
  level_wave_status: "", // 波次状态
};

win.sdkData = sdkData;

function init() {
  getSdkLog();
  getDevice();
  getInitAidAndCode();
  getSceneId();
  getPlugin();

  // setTimeout(() => {
  //   // showCodeUrlTips();
  //   // showCodeUrlTipsNew();
  //   // showMiniPraGrameCodeUrlTips();
  //   // showMiniPraGrameCodeUrlTipsNew();
  // }, 1000)
}
init();

// // sdk 2.0.9版本 入口
async function loadData() {
  try {
    await getUrlConfig();
    console.log('[ 预加载·完成获取CDN ] >')
    await getUserInfo();
    console.log('[ 预加载·完成获取用户信息 ] >')
    await getpaydata();
    console.log('[ 预加载·完成获取支付数据 ] >')
    // await getSwitchLists()

    const [, adRes] = await Promise.all([getSwitchLists(), getAdvConf()])
    console.log('[ 预加载·完成获取广点通SDK配置数据 ] >')
    const {
      data,
      result
    } = adRes
    if (result === 0) {
      initTXSDK(data)
    }
  } catch (error) {
    console.error(`p8sdk版本:${P8SDK_VERSION}/p8sdk入口加载失败:`, error);
  }
}
loadData();

wx.onShow((e) => {
  console.log("onshow~~", e);
  let t = e.query;
  let a = JSON.stringify(t);

  if (a.length > 2) {
    start_param = a;
  }

  let deivceInfo = {
    play800_device_benchmarkLevel: sdkData.device_benchmarkLevel, // 设备性能得分
    play800_device_modelLevel: sdkData.device_modelLevel, // 机型档位
    play800_device_cpuType: sdkData.device_cpuType, // CPU类型
    play800_device_memorySize: sdkData.device_memorySize, // 内存大小
  }

  let startParamObj = {};
  try {
    startParamObj = JSON.parse(start_param);
  } catch (e) {
    startParamObj = {};
  }

  let mergedParams = {
    ...startParamObj,
    ...deivceInfo
  };

  start_param = JSON.stringify(mergedParams);

  if (t.mode == 'iaa') {
    console.log('[ wx.onShow mode=iaa 获取到的参数 ] >', t)
    let param = {
      activityId: t.activityId,
      content: t.content,
      shareOpenid: t.shareOpenid,
      version: t.version,
    }
    shareApiIaa(param);
  }

  if (t.mode == 'falls') {
    console.log('[ wx.onShow mode=falls 获取到的参数 ] >', t)
    let param = {
      shareid: t.shareid,
      groupid: t.groupid,
      shareOpenid: t.shareOpenid,
    }
    shareFallsApiIaa(param);
  }

  if (t.P8clickid) {
    console.log('[ wx.onShow p8clickid 获取到的参数 ] >', t.P8clickid);
    sdkData.P8clickid = t.P8clickid;
  }

  let i = e.referrerInfo && e.referrerInfo.extraData;
  if (i && i.p8go_site && i.p8go_aid) {
    inBPack = true;
    console.error("onshow 获取到跳转过来的参数", i);
    console.error("冷启动 获取到跳转过来的参数", i);
    gotoObj.site = i.p8go_site;
    gotoObj.aid = i.p8go_aid;
    gotoObj.b_site = i.b_site;
    gotoObj.b_appid = i.b_appid;
  }
  if (t.aid) {
    Object.assign(queryData, t);
    print("onShow存在启动参数 query", queryData);
    blowPoint("onShow 存在aid" + JSON.stringify(e));
  }
  console.log("p8OrderIdCX", p8OrderIdCX, sdkData.site)
  if (!p8OrderIdCX) {
    console.log('无查询订单');
    return;
  }
  let newOrder = getItem("newOrder");
  newOrder = JSON.parse(newOrder);
  if (newOrder.paytype != 5) {
    console.log('不是ios订单不查询');
    return;
  }

  function queryPayResultWithRetry(maxRetries = 5) {
    let retries = 0;
    const recursiveQuery = async () => {
      try {
        const res = await queryPayResult();
        if (res.result === 1 && retries < maxRetries) {
          console.log('重试次数 ', retries + 1);
          retries++;
          await recursiveQuery(); // 使用 await 等待递归调用完成
        } else {
          console.log('已达到最大重试次数或结果不为1');
          p8OrderIdCX = ""; // 清空 p8OrderIdCX
        }
      } catch (error) {
        console.error('查询支付结果时发生错误:', error);
        // 可以选择在这里进行错误处理，比如重试或记录日志
      }
    };
    recursiveQuery();
  }
  queryPayResultWithRetry(5);

});

function queryPayResult() {
  let newOrder = getItem("newOrder");
  newOrder = JSON.parse(newOrder);
  let e = new Promise((resolve, reject) => {
    let n = parseInt(new Date().getTime() / 1e3);
    var d = md5(`${sdkData.key}WX${sdkData.site}WX${n}${n}`);
    let t = {
      site: sdkData.site,
      order_id: newOrder.p8OrderId,
      json: "1",
      sign: d
    };
    // print("查询订单参数", t);
    let i = `${sdkData.rg_url}/api/queryPayResult`;
    let s = function (e) {
      // print("查询订单是否支付返回值:", e);
      // console.log("查询订单是否支付返回值:", e.data.data.is_pay);
      // print("查询订单是否支付返回值:", newOrder);
      if (e.data.data.is_pay) {
        console.log('支付成功上报TXsdk---txSdkHeartBeat');
        // txSdkHeartBeat('PURCHASE', {
        //   value: newOrder.money * 100,
        //   orderid: newOrder.p8OrderId,
        //   ...newOrder.cpOrder
        // });
        let puchaseMoney = Number(newOrder.money) * 100
        console.log(" 支付上报金额 ", puchaseMoney)
        if (TXDNSDK.onPurchase) {
          TXDNSDK.onPurchase(puchaseMoney);
        }
        wxDotLog(602, '广点通IOS米大师支付上报成功', `${newOrder.p8OrderId}`, new Date().getTime());
        let a = newOrder.cpOrder
        let incomedata = {
          roleid: a.roleid,
          rolename: a.rolename,
          sid: a.serverid,
          income_money: a.money,
          order_id: a.cp_order_id,
          username: a.username,
          vip: a.vip,
          level: a.level,
          ip: a.ip,
          income_currency: a.income_currency || "CNY",
          income_channel: a.income_channel || "wx",
          income_gold: a.income_gold,
          own_gold: a.own_gold,
          income_status: a.income_status,
          p8_order_id: newOrder.p8OrderId,
        }
        incomeLogNew(incomedata);

        let res = {
          result: 0,
          data: {
            errorcode: "",
            msg: "查询付款成功！",
          },
        };
        resolve(res)
      } else {
        let res = {
          result: 1,
          data: {
            errorcode: "",
            msg: "查询付款失败！",
          },
        };
        resolve(res)
      }
    }
    let f = function (err) {
      print("查询订单结果失败,重试中:", err);
      var res = {
        result: 1,
        data: {
          errorcode: "",
          msg: "查询订单结果失败！",
          data: JSON.stringify(err),
        },
      };
      resolve(res)
    }
    wxRequest(i, "GET", t, s, f);
  })
  return e;
}

var wx_videoAD;
var wx_bannerAD;
var wx_sceneAD;
var wx_CustomAD;

// 添加广告状态管理
let adLoadState = {
  isLoading: false,
  isReady: false
};

function BannerAdCreate(e, t = 0, a = 0, i = "", n) {
  let o = wx.getSystemInfoSync().screenWidth;
  if (!i) i = o;
  wx_bannerAD = wx.createBannerAd({
    adUnitId: e,
    adIntervals: 30,
    style: {
      left: t,
      top: a,
      width: i,
      height: n,
    },
  });
  wx_bannerAD.onLoad(() => {
    print("banner 广告加载成功 ", wx_bannerAD.style);
    window["bannerHeight"] = wx_bannerAD.style.realHeight;
  });
  wx_bannerAD.onResize((e) => {
    print("banner 广告onResize", e.width, e.height);
    print("banner 广告onResize2", wx_bannerAD.style.realWidth, wx_bannerAD.style.realHeight);
  });
  wx_bannerAD.onError((e) => {
    print("banner 广告异常", e);
  });
}

function CustomAdCreate(e, t = 0, a = 0, i = "") {
  let n = wx.getSystemInfoSync().screenWidth;
  if (!i) i = n;
  wx_CustomAD = wx.createCustomAd({
    adUnitId: e,
    style: {
      left: t,
      top: a,
      width: i,
      fixed: true,
    },
  });
  wx_CustomAD.onLoad(() => {
    print("模板 广告加载成功");
  });
  wx_CustomAD.onError((e) => {
    print("模板 广告异常", e);
  });
}

P8SDK.wxshowShareMenu = function (e = "", t = "", a = "") {
  print("p8sdk 显示菜单分享 接口调用", arguments);
  wx.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"],
  });
  wx.onShareAppMessage(() => {
    console.log(" 监听到转发好友...")
    if (TXDNSDK.track) {
      TXDNSDK.track('SHARE', {
        target: 'APP_MESSAGE'
      });
    }
    return {
      title: e,
      imageUrl: t,
      query: a,
    };
  });
};

P8SDK.wxshareAppMessage = function (e = "", t = "", a = "", b = "") {
  print("p8sdk 主动分享 接口调用", arguments);
  console.log(" 监听到主动分享好友...")
  if (TXDNSDK.track) {
    TXDNSDK.track('SHARE', {
      target: 'APP_MESSAGE'
    });
  }
  wx.shareAppMessage({
    title: e,
    imageUrl: t,
    query: a,
    imageUrlId: b,
  });
};

P8SDK.wxADinit = function (e, t, o, n) {
  console.log("微信广告初始化");
  if (adConfigData) {
    if (!e) {
      e = adConfigData.adUnitId
      console.log("本地配置广告id ");
    }
  }

  // 激励视频初始化
  if (e && (typeof e === "string" || typeof e === "object")) {
    const adUnitId = typeof e === "string" ? e : e.adUnitId;
    if (adUnitId) {
      console.log("激励视频初始化", typeof e === "string" ? adUnitId : JSON.stringify(e));

      // 保存广告ID
      sdkData.adList.ad_unit_id_reward = adUnitId;
      if (typeof e === "object" && e.adSlot) {
        sdkData.adList.ad_slot_reward = e.adSlot;
      }

      // 销毁广告实例
      destroyVideoAd();

      // 创建广告实例
      wx_videoAD = wx.createRewardedVideoAd({
        adUnitId: adUnitId,
        multiton: true,
      });

      // 统一的事件处理
      wx_videoAD.onLoad(() => {
        print("激励视频 广告加载事件成功");
        adLoadState.isLoading = false;
        adLoadState.isReady = true;
      });

      wx_videoAD.onError((err) => {
        print("激励视频 广告加载异常", err);
        adLoadState.isLoading = false;
        adLoadState.isReady = false;
      });

      // 初始加载
      if (!adLoadState.isLoading && !adLoadState.isReady) {
        adLoadState.isLoading = true;
        wx_videoAD.load().then(() => {
          print("激励视频 广告加载成功");
          adLoadState.isReady = true;
        }).catch(err => {
          print("激励视频 初始加载失败", err);
          adLoadState.isReady = false;
        }).finally(() => {
          adLoadState.isLoading = false;
        });
      }
    }
  }

  // banner初始化
  if (o) {
    console.log("广告 banner  ", o);
    if (o.adUnitId) {
      sdkData.adList.ad_unit_id_banner = o.adUnitId;
      sdkData.adList.ad_slot_banner = o.adSlot;
    }

    if (o.adUnitId) {
      let e = o.adUnitId;
      let t = o.left;
      let a = o.top;
      let i = o.width;
      let n = o.height;
      BannerAdCreate(e, t, a, i, n);
    } else {
      print("广告初始化 banner广告参数不对 ");
    }
  }

  // 插屏初始化
  if (t && typeof t === "string") {
    console.log("插屏广告id   ", t);
    sdkData.adList.ad_unit_id_sence = t
    wx_sceneAD = wx.createInterstitialAd({
      adUnitId: t,
    });
    wx_sceneAD.load(() => {
      print("插屏 广告加载成功");
    });
    wx_sceneAD.load().then(() => {
      print("插屏 广告加载成功");
    })
    wx_sceneAD.onLoad(() => {
      print("插屏 广告加载事件成功");
    });
    wx_sceneAD.onError((e) => {
      print("插屏 广告加载异常", e);
    });
  }

  // 插屏初始化
  if (t && typeof t === "object") {
    console.log("插屏广告info   ", JSON.stringify(t));
    if (t.adUnitId) {
      sdkData.adList.ad_unit_id_sence = t.adUnitId;
      sdkData.adList.ad_slot_sence = t.adSlot;
    }

    wx_sceneAD = wx.createInterstitialAd({
      adUnitId: t.adUnitId,
    });
    wx_sceneAD.load(() => {
      print("插屏 广告加载成功");
    });
    wx_sceneAD.load().then(() => {
      print("插屏 广告加载成功");
    })
    wx_sceneAD.onLoad(() => {
      print("插屏 广告加载事件成功");
    });
    wx_sceneAD.onError((e) => {
      print("插屏 广告加载异常", e);
    });
  }

  // 原生模板广告初始化
  if (n) {
    console.log("原生模板广告   ", n);
    if (n.adUnitId) {
      sdkData.adList.ad_unit_id_custom = n.adUnitId;
      sdkData.adList.ad_slot_custom = n.adSlot;
    }

    if (n.adUnitId) {
      let e = n.adUnitId;
      let t = n.left;
      let a = n.top;
      let i = n.width;
      CustomAdCreate(e, t, a, i);
    } else {
      print("广告初始化 原生模板广告参数不对 ");
    }
  }
};

// 添加激励视频状态锁
let isVideoLogReported = false;
let isVideoShowInProgress = false;
let lastVideoShowTime = 0;
const VIDEO_SHOW_COOLDOWN = 1000; // 1秒冷却时间

P8SDK.videoADShow = function (t, a, c, b, data) {
  if (!wx_videoAD || !wx_videoAD.show) {
    print("激励视频不存在");
    return;
  }

  // 检查是否在冷却时间内
  const now = Date.now();

  if (now - lastVideoShowTime < VIDEO_SHOW_COOLDOWN) {
    print("广告展示太频繁，请稍后再试");
    return;
  }

  // 检查是否有广告正在展示
  if (isVideoShowInProgress) {
    print("广告正在展示中");
    return;
  }

  let onShow = null;

  if (typeof b == 'string') {
    sdkData.ad_positon = b;
  } else if (typeof b == 'object') {
    sdkData.ad_positon = b.ad_position;
    sdkData.level_wave = b.level_wave;
    sdkData.a_b_test = b.a_b_test;
  } else if (typeof b == 'function') {
    onShow = b;
  }

  if (typeof data == 'function') {
    onShow = data;
  } else if (typeof data == 'object') {
    sdkData.ad_positon = data.ad_position;
    sdkData.level_wave = data.level_wave;
    sdkData.a_b_test = data.a_b_test;
  } else if (typeof data == 'string') {
    sdkData.ad_positon = data;
  }

  // 在新视频开始时初始化计时值
  ad_show_time = new Date().getTime();

  // 设置广告正在展示状态
  isVideoShowInProgress = true;

  // 重置状态锁
  isVideoLogReported = false;

  // 更新计时值
  lastVideoShowTime = now;

  // 优化的展示逻辑
  const showAd = () => {
    wx_videoAD.show().then(() => {
      if (onShow) onShow(); // 广告成功展示时触发回调
    }).catch((e) => {
      print("激励视频 广告加载异常", e);
      isVideoShowInProgress = false; // 重置状态
      if (c) c(e); // 广告加载异常 回调错误信息
    });
  };

  // 移除所有已存在的事件监听器
  wx_videoAD.offClose();

  // 准备上报数据
  let arg = {
    type: "RewardedVideoAd",
    status: "0",
    geType: "reward",
  }

  sdkData.ad_unit_id = sdkData.adList.ad_unit_id_reward;
  sdkData.ad_slot = sdkData.adList.ad_slot_reward;

  // 上报视频status = 0 状态
  if (!isVideoLogReported) {
    debounce(P8LogSDK.wxVideoAutoLog, 1000)(arg)
    isVideoLogReported = true;
  }

  const i = (e) => {
    wx_videoAD.offClose(i);
    isVideoShowInProgress = false; // 重置状态

    if ((e && e.isEnded) || e === undefined) {
      print("正常播放结束，可以下发游戏奖励");
      let succ = {
        type: "RewardedVideoAd",
        status: "1",
        geType: "reward",
      }

      // 重置状态锁并上报视频status = 1 完成状态
      isVideoLogReported = false;
      debounce(P8LogSDK.wxVideoAutoLog, 1000)(succ)

      // 预加载下一个广告
      if (!adLoadState.isLoading) {
        adLoadState.isLoading = true;
        wx_videoAD.load().finally(() => {
          adLoadState.isLoading = false;
        });
      }

      if (t) t()
    } else {
      print("播放中途退出，不下发游戏奖励");
      if (a) a()
    }
  };

  // 添加事件监听器
  wx_videoAD.onClose(i);

  // 检查是否需要重新加载
  if (!adLoadState.isReady && !adLoadState.isLoading) {
    adLoadState.isLoading = true;
    wx_videoAD.load().then(() => {
      showAd();
    }).catch((err) => {
      print("激励视频 加载失败", err);
      if (c) c(err);
    }).finally(() => {
      adLoadState.isLoading = false;
      isVideoShowInProgress = false;
    });
  } else {
    showAd();
  }
};

P8SDK.sceneADShow = (e, t, adp) => {
  sdkData.ad_positon = adp || "";
  if (!wx_sceneAD || !wx_sceneAD.show()) {
    print("插屏广告不存在");
    return;
  }
  let arg = {
    type: "InterstitialAd",
    status: "0"
  }
  sdkData.ad_unit_id = sdkData.adList.ad_unit_id_sence;
  sdkData.ad_slot = sdkData.adList.ad_slot_sence;
  debounce(P8LogSDK.wxVideoAutoLog, 1000)(arg)

  wx_sceneAD.show().catch((e) => {
    print("插屏 广告显示异常", e);
    if (t) {
      t();
    }
  });
  const a = () => {
    wx_sceneAD.offClose(a);
    print("插屏 广告关闭");
    let succ = {
      type: "InterstitialAd",
      status: "1"
    }
    debounce(P8LogSDK.wxVideoAutoLog, 1000)(succ)
    if (e) {
      e();
    }
    wx_sceneAD.load().then(() => {
      print("插屏 广告加载成功");
    })
  };
  wx_sceneAD.onClose(a);
};

P8SDK.bannerAdShow = (adp) => {
  console.log('sdkData.adList', sdkData.adList);
  sdkData.ad_positon = adp || "";
  if (wx_bannerAD && wx_bannerAD.show) {
    wx_bannerAD.show();
    let succ = {
      type: "BannerAd",
      status: "1"
    }
    sdkData.ad_unit_id = sdkData.adList.ad_unit_id_banner;
    sdkData.ad_slot = sdkData.adList.ad_slot_banner;
    debounce(P8LogSDK.wxVideoAutoLog, 1000)(succ)
  } else {
    print("bannerAD不存在");
  }
};

P8SDK.bannerAdHide = () => {
  wx_bannerAD.hide();
};

P8SDK.customADShow = (adp) => {
  console.log('sdkData.adList', sdkData.adList);
  sdkData.ad_positon = adp || "";
  if (wx_CustomAD && wx_CustomAD.show) {
    wx_CustomAD.show();
    let succ = {
      type: "CustomAd",
      status: "1"
    }
    sdkData.ad_unit_id = sdkData.adList.ad_unit_id_custom;
    sdkData.ad_slot = sdkData.adList.ad_slot_custom;
    debounce(P8LogSDK.wxVideoAutoLog, 1000)(succ)
  } else {
    print("模板 广告不存在");
  }
};

P8SDK.customADHide = () => {
  wx_CustomAD.hide();
};

P8SDK.customADOnclose = (e) => {
  const t = () => {
    wx_CustomAD.offClose(t);
    if (!wx_CustomAD || !wx_CustomAD.onClose) {
      print("模板 广告不存在");
      return;
    }
    if (e) {
      e();
    }
  };
  wx_CustomAD.onClose(t);
};

// 添加广告实例销毁函数
function destroyVideoAd() {
  if (wx_videoAD) {
    // 移除所有事件监听
    wx_videoAD.offLoad();
    wx_videoAD.offError();
    wx_videoAD.offClose();

    // 销毁实例
    if (typeof wx_videoAD.destroy === 'function') {
      wx_videoAD.destroy();
    }

    wx_videoAD = null;
  }
  // 重置状态
  adLoadState.isLoading = false;
  adLoadState.isReady = false;
}

P8SDK.msgSecCheck = (arg) => {
  let promise = new Promise((resolve, reject) => {
    var time = parseInt(new Date().getTime() / 1e3);
    let site = sdkData.site;
    let a = {
      appid: arg.appid || sdkData.appid,
      openid: arg.openid || sdkData.openid,
      site: site,
      content: arg.content,
      time: time,
    };
    // let t2 = SignGetForCenter(a);
    let key = sdkData.key;

    let t2 = (key + 'WX' + site + 'WX' + time + time)
    a.sign = hex_md5(t2);;
    console.log('上报的数据是', a);
    let i = `${sdkData.platform_url}/wx/msgSecCheckNew`;
    let n = "POST";
    let o = function (e) {
      print("内容安全成功", a);
      var e = e.data;
      if (e.result == 0) {
        let tag = {
          100: '正常',
          10001: '广告',
          20001: '时政',
          20002: '色情',
          20003: '辱骂',
          20006: '违法犯罪',
          20008: '欺诈',
          20012: '低俗',
          20013: '版权',
          21000: '其他'
        }
        let label = e.data.label;
        let msg = tag[label];

        let res = {
          result: 0,
          isSafe: e.data.s,
          label: e.data.label,
          msg: msg || '未记录异常'
        }
        resolve(res);
      } else {
        let res = {
          result: 1,
          msg: JSON.stringify(e),
        }
        resolve(res);
      }

    };
    wxRequestShort(i, n, a, o);
  });
  return promise;
}


P8SDK.dialogShow = function (params) {
  wx.showModal({
    title: '提示',
    content: '这是一个模态弹窗',
    success(res) {
      if (res.confirm) {
        console.log('用户点击确定')
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}

P8SDK.createPhoneNumberPage = function () {
  // 创建页面容器元素
  const pageContainer = document.createElement('div');
  pageContainer.style.position = 'absolute';
  pageContainer.style.top = '0';
  pageContainer.style.left = '0';
  pageContainer.style.width = '100%';
  pageContainer.style.height = '100%';
  pageContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  pageContainer.style.display = 'flex';
  pageContainer.style.alignItems = 'center';
  pageContainer.style.justifyContent = 'center';

  // 创建表单容器元素
  const formContainer = document.createElement('div');
  formContainer.style.backgroundColor = '#fff';
  formContainer.style.padding = '20px';

  formContainer.style.borderRadius = '5px';

  // 创建输入框元素
  const phoneNumberInput = document.createElement('input');
  phoneNumberInput.type = 'tel';
  phoneNumberInput.placeholder = '请输入手机号';

  // 创建提交按钮元素
  const submitButton = document.createElement('button');
  submitButton.textContent = '提交';

  // 添加输入框和按钮到表单容器元素
  formContainer.appendChild(phoneNumberInput);
  formContainer.appendChild(submitButton);

  // 添加表单容器元素到页面容器元素
  pageContainer.appendChild(formContainer);

  // 将页面容器元素绘制在游戏画布上
  const ctx = cc.find('CanvasTest');
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, ctx.width, ctx.height);

  // 将表单容器元素绘制在游戏画布上
  ctx.fillStyle = '#fff';
  ctx.fillRect(
    ctx.width / 2 - formContainer.offsetWidth / 2,
    ctx.height / 2 - formContainer.offsetHeight / 2,
    formContainer.offsetWidth,
    formContainer.offsetHeight
  );

  // 添加事件监听器
  submitButton.addEventListener('click', function () {
    const phoneNumber = phoneNumberInput.value;
    // 处理用户输入的手机号逻辑
    console.log('用户输入的手机号：', phoneNumber);

    // 清除页面容器元素的绘制
    ctx.clearRect(0, 0, ctx.width, ctx.height);
  });
}


function getGoToSwitchdata() {
  if (inBPack) {
    return;
  }
  let e = parseInt(new Date().getTime() / 1e3);
  let t = {
    site: sdkData.site,
    aid: sdkData.aid,
    uid: sdkData.uid,
    time: e,
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  print("跳包开关参数请求obj ", t);
  let i = `${sdkData.platform_url}/switch/wxSwitch`;
  let n = function (e) {
    let i = e.data.data;
    print("跳包开关返回的值:", i);
    if (i.redirect && i.redirect.s) {
      print("跳包开关返回的值 可以转端:", i.redirect.data);
      let e = i.redirect.data.msg;
      let t = i.redirect.data.b_appid;
      let a = {
        p8go_site: i.redirect.data.site,
        p8go_aid: i.redirect.data.aid,
        b_site: i.redirect.data.b_site,
        b_appid: t,
      };
      console.error("edata::", a);

      function n(e, t, a) {
        print("跳包开关返回的值 可以转端: gotoAnotherApp", e, t);
        wx.showModal({
          title: "提示",
          content: e ? e : "提示文本",
          confirmText: "确认",
          showCancel: false,
          confirmColor: "#576B95",
          success: function (e) {
            if (e.confirm) {
              console.log("用户点击确定");
              P8SDK.gotoSystem(t, e, a);
            } else if (e.cancel) {
              console.log("用户点击取消");
            }
          },
          fail: function (e) {
            print("showModal 失败", e);
          },
        });
      }
      wx.onTouchStart(() => {
        n(e, t, a);
      });
    }
  };
  wxRequest(i, "GET", t, n);
}

// 添加支付数据缓存变量
let paydataCache = null; // 支付数据缓存
let paydataPromise = null; // 支付数据请求状态

function getpaydata() {
  // 如果已经有缓存的支付数据，直接返回
  if (paydataCache) {
    console.log('[ getpaydata ] 使用缓存的支付数据，跳过接口调用');
    return Promise.resolve(paydataCache);
  }

  // 如果正在请求中，返回同一个Promise，避免重复请求
  if (paydataPromise) {
    console.log('[ getpaydata ] 支付数据请求进行中，等待结果');
    return paydataPromise;
  }

  paydataPromise = new Promise((reslove, reject) => {
    let e = parseInt(new Date().getTime() / 1e3);
    let t = {
      site: sdkData.site,
      appid: sdkData.appid,
      channel: "wx",
      time: e,
    };
    let a = SignGetForCenter(t, sdkData.key);
    t.sign = md5(a);
    print("支付配置参数请求obj ", t);
    let i = `${sdkData.platform_url}/api/wxGameConf`;
    let n = function (e) {
      let t = e.data.data;
      if (e.data.result == 0 && t.is_set == true) {
        paydata.offerId = t.offerId;
        paydata.scale = t.scale;
        paydata.zoneId = t.zoneId;
        paydata.pf = t.pf;

        // 缓存支付数据结果
        paydataCache = {
          result: 0,
          data: {
            offerId: t.offerId,
            scale: t.scale,
            zoneId: t.zoneId,
            pf: t.pf,
            is_set: t.is_set
          },
          msg: '支付配置获取成功'
        };

        console.log('[ getpaydata ] 支付配置获取成功，已缓存');
        paydataPromise = null; // 清除请求状态
        reslove(paydataCache);
      } else if (e.data.result == 0 && t.is_set == false) {
        console.error("参数沒有配置 运营要先后台配置");

        // 缓存未配置的结果
        paydataCache = {
          result: 0,
          data: {
            is_set: false
          },
          msg: '参数沒有配置 运营要先后台配置'
        };
        paydataPromise = null; // 清除请求状态
        reslove(paydataCache);
      } else if (e.data.result == 1) {
        print("支付参数接口請求失敗");
        paydataPromise = null; // 清除请求状态
        reject(new Error('支付参数接口請求失敗'));
      }
    };
    let fail = function (err) {
      print("请求支付配置接口失败" + JSON.stringify(err));
      paydataPromise = null; // 清除请求状态
      reject(err);
    }

    wxRequest(i, "GET", t, n, fail);

  });

  return paydataPromise;
}
P8SDK.gotoSystemSwitch = function () {
  print("转端开关检测: " + dateFormat());
  let e = new Promise((t, e) => {
    if (switchCheck == true) {
      let e = {
        result: "0",
        data: {
          msg: "已达到转端条件，可以转端",
        },
      };
      t(e);
      print("可以转端");
    } else {
      let e = {
        result: "1",
        data: {
          msg: "未达到转端条件，不可以转端",
        },
      };
      t(e);
      print("不可以转端");
    }
  });
  return e;
};

P8SDK.unityJumpBox = function (g) {
  print("p8sdk unity盒子跳转", arguments);
  let extraData = Object.assign({}, {
    key: '123'
  });
  let appid = JSON.parse(g).app_id;
  let sort = JSON.parse(g).sort;
  P8SDK.gotoSystemCustom(appid, extraData, 'active', sort);
  gameBoxjumpLog('click', sort);
}

function getGotoSystemInfo() {
  let e = parseInt(new Date().getTime() / 1e3);
  let t = {
    site: sdkData.site,
    aid: sdkData.aid,
    time: e,
    uid: sdkData.uid,
  };
  let a = SignGetForCenter(t, sdkData.key);
  t.sign = md5(a);
  print("跳转别的小程序参数 ", t);
  let i = `${sdkData.platform_url}/switch/wxToApp`;
  let n = function (e) {
    print("转端获取到的参数 ", e);
    switchCheck = e.data.data.s;
  };
  let o = "GET";
  wxRequest(i, o, t, n);
}

P8SDK.gotoMiniProgram = function (g = "{}") {
  let result = new Promise((resolve, reject) => {
    let P8clickid = `P8clickid_${Math.floor(Math.random() * 1000000)}`;
    let toParams = {
      appId: g.appId,
      path: '?' + g.query + `${g.query ? '&' : ''}P8clickid=${P8clickid}&appid=${sdkData.appid}`,
      envVersion: g.envVersion || "release",
      /* develop trial  release*/
      success(e) {
        print(" 跳转小程序 success  :", e);
        P8LogSDK.navigateToMiniProGramApi({
          P8clickid: P8clickid,
          appId: g.appId
        })
        let res = {
          result: 0,
          data: e
        }
        resolve(res);
      },
      fail(e) {
        print("跳转小程序 fail  :", e);
        let res = {
          result: 1,
          data: e
        }
        resolve(res);
      },
    }
    print("p8sdk wx跳转小程序 接口调用", toParams);
    wx.navigateToMiniProgram(toParams);
  })
  return result;
}

P8SDK.gotoSystem = function (e, t, a) {
  print("p8sdk wx跳转别的小程序 接口调用", arguments);
  wx.navigateToMiniProgram({
    appId: e,
    extraData: t,
    path: a,
    envVersion: "release",
    /* develop trial  release*/
    success(e) {
      print(" 跳转别的小程序 success  :", e);
    },
    fail(e) {
      print("跳转别的小程序 fail  :", e);
    },
  });
};

P8SDK.gotoSystemCustom = function (e, t, a, i) {
  print("p8sdk wx跳转别的小程序自定义 接口调用", arguments);
  wx.navigateToMiniProgram({
    appId: e,
    extraData: t,
    envVersion: "release",
    success(e) {
      print(" 跳转别的小程序 success  :", e);
      gameBoxjumpLog(a, i);
    },
    fail(e) {
      print("跳转别的小程序 fail  :", e);
    },
  });
};
var systemType = "";

function getInitAidAndCode() {
  let wxOpenInfo = wx.getLaunchOptionsSync();
  console.log('[ getInitAidAndCode获取到的参数wxOpenInfo ] >', wxOpenInfo)
  let e = wx.getLaunchOptionsSync().query;
  console.log('[ getInitAidAndCode获取到的参数query ] >', JSON.stringify(e))
  let t = wx.getLaunchOptionsSync().referrerInfo;
  console.log('[ getInitAidAndCode获取到的参数referrerInfo ] >', JSON.stringify(t))
  if (!e) {
    e = wx.getEnterOptionsSync().query;
    if (e && e.aid) {
      blowPoint(" mark0");
    }
  }

  let a = JSON.stringify(e);
  if (a.length > 2) {
    start_param = a;
  }

  if (wx.getDeviceBenchmarkInfo) {
    wx.getDeviceBenchmarkInfo({
      success(res) {
        console.log('获取设备性能得分和机型档位数据getInitAidAndCode:', res);
        sdkData.device_benchmarkLevel = res.benchmarkLevel
        sdkData.device_modelLevel = res.modelLevel

        let deivceInfo = {
          play800_device_benchmarkLevel: sdkData.device_benchmarkLevel, // 设备性能得分
          play800_device_modelLevel: sdkData.device_modelLevel, // 机型档位
          play800_device_cpuType: sdkData.device_cpuType, // CPU类型
          play800_device_memorySize: sdkData.device_memorySize, // 内存大小
        }

        let startParamObj = {};
        try {
          startParamObj = JSON.parse(start_param);
        } catch (e) {
          startParamObj = {};
        }

        let mergedParams = {
          ...startParamObj,
          ...deivceInfo
        };

        start_param = JSON.stringify(mergedParams);
      }
    })
  }


  if (e.mode == 'iaa') {
    console.log('[ getInitAidAndCode mode=iaa 获取到的参数 ] >', e)
    let param = {
      activityId: e.activityId,
      content: e.content,
      shareOpenid: e.shareOpenid,
      version: e.version,
    }
    shareApiIaa(param);
  }

  if (e.mode == 'falls') {
    console.log('[ getInitAidAndCode mode=falls 获取到的参数 ] >', e)
    let param = {
      shareid: e.shareid,
      groupid: e.groupid,
      shareOpenid: e.shareOpenid,
    }
    shareFallsApiIaa(param);
  }

  if (e.P8clickid) {
    console.log('[ getInitAidAndCode p8clickid 获取到的参数 ] >', e.P8clickid);
    sdkData.P8clickid = e.P8clickid;
  }

  let i = t && t.extraData;
  if (i && i.p8go_site && i.p8go_aid) {
    console.error("冷启动 获取到跳转过来的参数", i);
    inBPack = true;
    gotoObj.site = i.p8go_site;
    gotoObj.aid = i.p8go_aid;
    gotoObj.b_site = i.b_site;
    gotoObj.b_appid = i.b_appid;
    console.log(" 冷启动 extraData.goto_aid:", i.goto_aid);
  }
  if (e.clue_token) {
    systemType = "TT";
    systemValues.clue_token = e.clue_token;
    systemValues.ad_id = e.ad_id;
    systemValues.creative_id = e.creative_id;
    systemValues.channel = "jrtt_wxxyx";
  }
  if (e.aid || e.code) {
    Object.assign(queryData, e);
  }
  console.log('start_param', start_param);
}

function getSceneId() {
  let scene = wx.getLaunchOptionsSync().scene;
  print("场景值：", scene)
  sdkData.scene_id = scene;
}

/**
 * 拉起私域引流小程序
 */

P8SDK.gotoPrivateMiniProgram = () => {
  let ex = {
    site: sdkData.site,
    url: sdkData.rg_url,
  }
  print("p8sdk gotoPrivateMiniProgram 接口调用", ex);
  let o = wx.getStorageSync('priAppid');
  let r = "pages/webview/webview";
  let s = ex;

  P8SDK.gotoSystem(o, s, r);
}

/**
 * 拉起VIP引流小程序
 */

P8SDK.gotoVipMiniProgram = () => {
  let vipSite = sdkData.site.split('_')[0] + '_data';
  let vipEx = {
    site: vipSite,
    url: sdkData.rg_url,
  }
  print("p8sdk gotoVipMiniProgram 接口调用", vipEx);
  let o = wx.getStorageSync('vipAppid');
  let r = "pages/vip/vip";
  P8SDK.gotoSystem(o, vipEx, r);
}

/**
 * 拉起转端弹窗
 */
P8SDK.showSwitchPopup = () => {
  console.log('拉起转端弹窗.......showSwitchPopup');
  P8SDK.showSwitchGoto = function () {
    console.log('cocos版本', cc.ENGINE_VERSION);
    // let contentUrl = 'https://h5bg.ks3-cn-guangzhou.ksyuncs.com/tswcbyy.png';
    let contentUrl = sdkData.device_orientation == "portrait" ? "https://ksyun.oss-cn-hangzhou.aliyuncs.com/showSwitchPopupTYBG.png" : "https://ksyun.oss-cn-hangzhou.aliyuncs.com/showSwitchPopupTYBGhorizontal.png"
    if (cc) {
      cc.ENGINE_VERSION[0] == '2' ? showCCPopupPage(contentUrl) : showCCPopupPageNew(contentUrl);
    }
  };
  setTimeout(() => {
    console.log('调用.......showSwitchGoto');
    P8SDK.showSwitchGoto();
  }, 100);
}

/**
 * 拉起小盒子弹窗 PS:小游戏跳&小程序跳转盒子功能
 */
P8SDK.showBoxPopup = (g, a) => {
  if (sdkData.blacklistCode == "1") {
    wx.showToast({
      title: '该功能未开放',
      icon: "error"
    })
    return false
  }

  console.log('拉起小盒子弹窗.......showBoxPopup', g, a);
  P8SDK.showBoxGoto = function () {
    console.log('cocos版本', cc.ENGINE_VERSION);
    // let contentUrl = 'https://h5bg.ks3-cn-guangzhou.ksyuncs.com/tswcbyy.png';
    // let contentUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/parisBg.png';
    // let contentUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/whiteBg.png';
    // let contentUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/boxbg.png';
    let contentUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/boxbg2.png';
    if (cc) {
      cc.ENGINE_VERSION[0] == '2' ? showCCBoxPage(contentUrl, g, a) : showCCBoxPageNew(contentUrl, g, a);
    }
  };
  setTimeout(() => {
    console.log('调用.......showBoxGoto');
    P8SDK.showBoxGoto();
  }, 100);
}

/**
 * 按条件转端
 * @param {服务器id}} sid 
 */
P8SDK.getOnlySwitch = (sid) => {
  //
  console.log('调用.......', sid);
  console.error('开关37 uid ....', sdkData.uid);
  console.error('开关37 uid type ....', typeof sdkData.uid);
  if (!sid) {
    wx.showModal({
      title: '少传参数了',
      content: 'sid(服务器id)为必传参数',
      duration: 0,
      success: () => {
        console.log('success ..........');
      }
    })
    console.error('必须要传入服务器id ---> sid');
    return;
  }
  let time = parseInt(new Date().getTime() / 1e3);
  let obj = {
    site: sdkData.site,
    types: '37',
    time: time,
    // uid sid aid
    uid: sdkData.uid,
    aid: sdkData.aid,
    sid: sid
  };
  let t = SignGetForCenter(obj);
  obj.sign = md5(t);
  console.log('开关请求参数 obj', obj);
  let url = `${sdkData.platform_url}/switch/switchListS`;
  // url = `https://tcenter.play800.cn/switch/switchListS`;
  wxRequestShort(url, 'post', obj, (res) => {
    let rdata = res.data;
    let succ = rdata && rdata.result === 0;
    if (succ) {
      let data = rdata.data;
      // 38启动页弹框  39客服会话弹框  40支付弹框
      console.error('请求到list数据', JSON.stringify(rdata));
      if (data['37'].s) {
        blowPointScene('canShow')
        let showTime = data['37'].timespan;
        // showTime = 1;
        P8SDK.showGoto = function () {
          let obj = data['37'];
          let contentUrl = obj.content;
          contentUrl = 'https://h5bg.ks3-cn-guangzhou.ksyuncs.com/tswcbyy.png';
          showPage(contentUrl);
        };
        setTimeout(() => {
          console.log('调用.......showGoto');
          P8SDK.showGoto();
          blowPointScene('showIng')
        }, showTime * 1000);
      }

    } else {
      console.error('请求switchList数据失败', rdata);
    }
  }, (err) => {
    console.error('请求switchList数据异常', err);
  })
}


function getSwitchLists() {
  let result = new Promise((resolve, reject) => {
    let time = parseInt(new Date().getTime() / 1e3);
    let obj = {
      site: sdkData.site,
      types: '38|39|40',
      time: time,
    };
    let t = SignGetForCenter(obj);
    obj.sign = md5(t);
    console.log('开关请求参数 obj', obj);
    // let url = 'https://tcenter.play800.cn/switch/switchListS'; // `${sdkData.platform_url}/api/wxGameConf`;
    let url = `${sdkData.platform_url}/switch/switchListS`; // 'https://tcenter.play800.cn/switch/switchListS';
    wxRequestShort(url, 'post', obj, (res) => {
      let rdata = res.data;
      let succ = rdata && rdata.result === 0;
      if (succ) {
        let data = rdata.data;
        // 38启动页弹框  39客服会话弹框  40支付弹框
        // console.error('请求到list数据', rdata);
        if (data['38'].s) {
          // 启动就要加载创建
          P8SDK.showLoadPage = function () {
            let contentUrl = data['38'].content;
            showPage(contentUrl);
          };
        }
        if (data['39'].s) {
          // 启动就要加载创建
          P8SDK.showCustomerServicePage = function () {
            let contentUrl = data['39'].content;
            showPage(contentUrl);
          };
        }
        if (data['40'].s) {
          // 启动就要加载创建
          P8SDK.showPayPage = function () {
            let contentUrl = data['40'].content;
            showPage(contentUrl);
          };
        }
        resolve();
      } else {
        console.error('请求switchList数据失败', rdata);
      }
    }, (err) => {
      console.error('请求switchList数据异常', err);
    })
  });
  return result;
}

function showPage(contentUrl) {
  console.info('contentUrl:', contentUrl);
  // 此处测试
  if (!contentUrl) {
    return;
    contentUrl = 'https://wxldconf.ks3-cn-beijing.ksyuncs.com/test-SDK公告.png';
  }
  // 引擎初始化完成后执行的操作

  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }
  // let closeMask = newNode("closeMask");
  // closeMask.addComponent(cc.BlockInputEvents);
  // closeMask.setContentSize(1000, 2000);
  let n = newNode("firstPage");
  n.addComponent(cc.BlockInputEvents);
  let wd = n.addComponent(cc.Widget);
  wd.isAlignVerticalCenter = true;
  wd.isAlignHorizontalCenter = true;
  n.zIndex = 999;
  cc.game.addPersistRootNode(n);
  let o = n.addComponent(cc.Sprite);
  let tipLabel = newNode("tipLabel", n);
  let lb = tipLabel.addComponent(cc.Label);
  lb.fontSize = 28
  let cb = () => {
    console.error('posY:', o._spriteFrame._rect.height);
    console.error('posX:', o._spriteFrame._rect.width);
    lb.string = ""
    tipLabel.y = -o._spriteFrame._rect.height / 2;
  }
  let closeBtnUrl = 'https://h5bg.ks3-cn-guangzhou.ksyuncs.com/return.png';
  let closeBtnNode = newNode("closeBtnNode", n);
  closeBtnNode.zIndex = 9999;
  let closeSp = closeBtnNode.addComponent(cc.Sprite);
  let cb2 = () => {
    closeBtnNode.x = 230;
    closeBtnNode.y = 320;
  }
  setSpriteFrame(closeSp, closeBtnUrl, cb2);
  setSpriteFrame(o, contentUrl, cb);
  var ctime; // = Date.now();
  closeBtnNode.on(
    "touchstart",
    (e) => {
      // if (!ctime) {
      //   ctime = Date.now();
      // } else {
      //   if (Date.now() - ctime < 1000) {
      //     console.log('关闭图片');
      //     n.active = false;
      //   } else {
      //     console.log('时间显示...', Date.now() - ctime);
      //     ctime = Date.now();
      //   }
      // }
      blowPointScene('close')
      n.active = false;
    },
    this
  );
}

// cocos2.x版本可调用
function showCCPopupPage(contentUrl) {
  console.info('showCCPopupPage-----contentUrl:', contentUrl);
  // 此处测试
  if (!contentUrl) {
    return;
    contentUrl = 'https://wxldconf.ks3-cn-beijing.ksyuncs.com/test-SDK公告.png';
  }
  // 引擎初始化完成后执行的操作

  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }

  let n = newNode("firstPage");
  n.addComponent(cc.BlockInputEvents);
  n.zIndex = 999;
  cc.game.addPersistRootNode(n);
  let o = n.addComponent(cc.Sprite);
  let tipLabel = newNode("tipLabel", n);
  let lb = tipLabel.addComponent(cc.Label);
  lb.fontSize = 28;
  let closeBtnUrl = 'https://h5bg.ks3-cn-guangzhou.ksyuncs.com/return.png';
  let closeBtnNode = newNode("closeBtnNode", n);
  closeBtnNode.zIndex = 9999;
  let closeSp = closeBtnNode.addComponent(cc.Sprite);
  let cb = "";
  let cb2 = "";
  if (sdkData.device_orientation == "portrait") {
    cb = () => {
      console.error('posY:', o._spriteFrame._rect.height);
      console.error('posX:', o._spriteFrame._rect.width);
      // lb.string = ""
      // tipLabel.y = -o._spriteFrame._rect.height / 2;
      n.x = 375;
      n.y = 650;
    }
    cb2 = () => {
      closeBtnNode.x = 250;
      closeBtnNode.y = -150;
      closeBtnNode.width = 100;
      closeBtnNode.height = 100;
    }
  } else {
    cb = () => {
      console.error('posY:', o._spriteFrame._rect.height);
      console.error('posX:', o._spriteFrame._rect.width);
      // lb.string = ""
      // tipLabel.y = -o._spriteFrame._rect.height / 2;
      n.x = 375;
      n.y = 680;
      n.width = 650;
      n.height = 300;
    }
    cb2 = () => {
      closeBtnNode.x = 250;
      closeBtnNode.y = -95;
    }
  }



  setSpriteFrame(closeSp, closeBtnUrl, cb2);
  setSpriteFrame(o, contentUrl, cb);
  // P8SDK.gameActionLog('-2');
  closeBtnNode.on(
    "touchstart",
    (e) => {
      // P8SDK.gotoSystemCustom('wx9e8b1e7e954f3c25');
      n.active = false;
    },
    this
  );
}

// cocos3.x版本可调用 popup
function showCCPopupPageNew(contentUrl, retryCount = 0, maxRetries = 20) {
  // 此处测试
  if (!contentUrl) {
    return;
    contentUrl = 'https://wxldconf.ks3-cn-beijing.ksyuncs.com/test-SDK公告.png';
  }

  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }
  let currentScene = cc.director.getScene();

  if (retryCount >= maxRetries) {
    console.error('达到的最大重试次数:showCCPopupPageNew');
    return;
  }

  if (currentScene) {
    let canvasNode = currentScene.getChildByName('Canvas') ? currentScene.getChildByName('Canvas') : currentScene.getChildByName('CanvasTest');
    let canvasSize = canvasNode.getContentSize();
    console.log('canvasSize', canvasSize);
    let aPosx = canvasSize.width / 10;
    let aPosy = canvasSize.height / 10;
    console.log('aPosx', aPosx);
    console.log('aPosy', aPosy);
    let n = newNode("firstPage");
    n.addComponent(cc.BlockInputEventsComponent);
    canvasNode.addChild(n);
    n.layer = 33554432;
    let o = n.addComponent(cc.Sprite);
    let closeBtnUrl = 'https://h5bg.ks3-cn-guangzhou.ksyuncs.com/return.png';
    let closeBtnNode = newNode("closeBtnNode", n);
    closeBtnNode.layer = 33554442;
    let closeSp = closeBtnNode.addComponent(cc.Sprite);
    let cb = "";
    let cb2 = "";
    if (sdkData.device_orientation == "portrait") {
      cb = () => {
        n.setPosition(0, 0);
      };
      cb2 = () => {
        closeBtnNode.setPosition(250, -150);
        closeBtnNode.setContentSize(100, 100);
      };
    } else {
      cb = () => {
        n.getComponent(cc.UITransformComponent).setContentSize(canvasSize.x / 1.2, canvasSize.y - 40);
        n.setPosition(0, 35);
      };
      cb2 = () => {
        let x = 3.5 * aPosx;
        let y = 2.9 * aPosy;
        let w = 0.7 * aPosx;
        closeBtnNode.setPosition(x, -y);
        closeBtnNode.setContentSize(w, w);
      };
    }
    setSpriteFrameNew(o, contentUrl, cb, canvasNode);
    setSpriteFrameNew(closeSp, closeBtnUrl, cb2, canvasNode);
    closeBtnNode.on(
      cc.Node.EventType.TOUCH_START,
      (e) => {
        // P8SDK.gotoSystemCustom('wx9e8b1e7e954f3c25');
        n.active = false;
      },
      this
    );
  } else {
    setTimeout(() => {
      showCCPopupPageNew(contentUrl, retryCount + 1, maxRetries)
    }, 1000)

  }
}

// cocos2.x版本可调用
function showCCBoxPage(contentUrl, g = {}, a = {}) {
  console.info('showCCBoxPage-----contentUrl:', contentUrl);
  // 此处测试
  if (!contentUrl) {
    return;
    contentUrl = 'https://wxldconf.ks3-cn-beijing.ksyuncs.com/test-SDK公告.png';
  }
  let boxList = [];

  if (!sdkData.gameBoxData || sdkData.gameBoxData.length == 0) {
    console.error("盒子无数据,请查看后台是否配置...");
    return;
  } else {
    for (let i = 0; i < sdkData.gameBoxData.length; i++) {
      if (sdkData.gameBoxData[i].app_id != sdkData.appid) {
        let obj = {
          ...sdkData.gameBoxData[i],
          game_name: sdkData.gameBoxData[i].game_name.slice(0, 6),
        }
        boxList.push(obj);
      }
    }
  }

  if (boxList.length > 9) {
    boxList = boxList.slice(0, 9)
  }

  // 正式版要注释
  // boxList = boxList.slice(0, 9)
  // for (var i = 0; i < boxList.length; i++) {
  //   boxList[i].game_name = boxList[i].game_name.slice(0, 6);
  // }

  console.log('boxList', boxList);

  // 引擎初始化完成后执行的操作
  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }
  let n = newNode("firstPage");
  n.addComponent(cc.BlockInputEvents);
  let wd = n.addComponent(cc.Widget);
  wd.isAlignVerticalCenter = true;
  wd.isAlignHorizontalCenter = true;
  n.zIndex = 999;
  cc.game.addPersistRootNode(n);
  let o = n.addComponent(cc.Sprite);
  let closeBtnUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/redCloseBtn2.png';
  let closeBtnNode = newNode("closeBtnNode", n);
  closeBtnNode.zIndex = 9999;
  let closeSp = closeBtnNode.addComponent(cc.Sprite);
  let cb = "";
  let cb2 = "";
  if (sdkData.device_orientation == "portrait") {
    let cbPuls = "";
    let cb2Plus = "";
    let cbYpuls = "";
    let cb2Ypuls = "";
    if (boxList.length <= 2) {
      cbPuls = 600;
      cb2Plus = 235;
      cbYpuls = 660;
      cb2Ypuls = 240;
    }
    if (boxList.length > 2 && boxList.length <= 6) {
      cbPuls = 700;
      cb2Plus = 270;
      cbYpuls = 800;
      cb2Ypuls = 300;
    }
    if (boxList.length > 6) {
      cbPuls = 1050;
      cbYpuls = 800;
      cb2Ypuls = 300;
      cb2Plus = 390;
    }
    cb = () => {
      console.error('posY:', o._spriteFrame._rect.height);
      console.error('posX:', o._spriteFrame._rect.width);
      n.width = cbYpuls;
      n.y = 650;
      n.height = cbPuls;
    }

    cb2 = () => {
      closeBtnNode.x = cb2Ypuls;
      closeBtnNode.y = cb2Plus;
      closeBtnNode.width = 100;
      closeBtnNode.height = 100;
    }
  } else {
    let cbPuls = "";
    let cb2Plus = "";
    let cbYpuls = "";
    let cb2Ypuls = "";
    if (boxList.length <= 2) {
      cbPuls = 350;
      cbYpuls = 350;
      cb2Ypuls = 130;
      cb2Plus = 135;
    }
    if (boxList.length > 2 && boxList.length <= 6) {
      cbPuls = 360;
      cbYpuls = 430;
      cb2Ypuls = 160;
      cb2Plus = 140;
    }
    if (boxList.length > 6) {
      cbPuls = 360;
      cbYpuls = 430;
      cb2Ypuls = 160;
      cb2Plus = 140;
    }
    cb = () => {
      console.error('posY:', o._spriteFrame._rect.height);
      console.error('posX:', o._spriteFrame._rect.width);
      n.width = cbYpuls;
      n.y = 670;
      n.height = cbPuls;
    }
    cb2 = () => {
      closeBtnNode.x = cb2Ypuls;
      closeBtnNode.y = cb2Plus;
      closeBtnNode.width = 50;
      closeBtnNode.height = 50;
    }
  }

  let x = 0;
  let y = 0;
  let w = 0;
  let nx = -1;
  let b = 0;
  let leba = 0;


  for (let i = 0; i < boxList.length; i++) {
    // 底图
    let baseNode = newNode("baseImgNode" + i, n)
    baseNode.zIndex = 9997;
    let baseSp = baseNode.addComponent(cc.Sprite);
    let baseUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/iconBg.png';


    // 图片
    let imgNode = newNode("imgNode" + i, n);
    imgNode.zIndex = 9998;
    let imgSp = imgNode.addComponent(cc.Sprite);


    // 横条
    let lbBaseNode = newNode("lbBaseNode" + i, n)
    lbBaseNode.zIndex = 9999;
    let lbBaseNodeSp = lbBaseNode.addComponent(cc.Sprite);
    let lbBaseUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/labelBg.png';


    // 文字
    let lbNode = newNode("imgTitleNode" + i, n);
    lbNode.zIndex = 9999;
    let lb = lbNode.addComponent(cc.Label);
    lbNode.color = new cc.Color(0, 0, 0);
    lb.enableBold = true;
    lb.string = boxList[i].game_name;
    if (sdkData.device_orientation == "portrait") {
      lb.fontSize = 28;
    } else {
      lb.fontSize = 14;
    }

    // 方法
    let imgcb = "";
    if (sdkData.device_orientation == "portrait") {
      imgcb = () => {
        baseNode.width = 160;
        baseNode.height = 160;
        imgNode.width = 150;
        imgNode.height = 150;
        lbBaseNode.width = 210;
        lbBaseNode.height = 80;
        if (boxList.length == 1) {
          imgNode.x = 0;
          imgNode.y = 0;
          baseNode.x = 0;
          baseNode.y = 5;
          lbNode.x = 0;
          lbNode.y = -85;
          lbBaseNode.x = 0;
          lbBaseNode.y = -75;
        }
        if (boxList.length == 2) {
          x = 120;
          imgNode.x = (i * 2 * x) - x;
          imgNode.y = 0;
          baseNode.x = (i * 2 * x) - x;
          baseNode.y = 5;
          lbNode.x = (i * 2 * x) - x;
          lbNode.y = -85;
          lbBaseNode.x = (i * 2 * x) - x;
          lbBaseNode.y = -75;
        }
        if (boxList.length == 3) {
          x = 120;
          y = 115;
          if (i <= 1) {
            imgNode.x = (i * 2 * x) - x;
            imgNode.y = y;
            baseNode.x = (i * 2 * x) - x;
            baseNode.y = y + 5;
            lbNode.x = (i * 2 * x) - x;
            lbNode.y = 140 - y;
            lbBaseNode.x = (i * 2 * x) - x;
            lbBaseNode.y = 150 - y;
          }
          if (i > 1) {
            imgNode.x = -x;
            imgNode.y = -y;
            baseNode.x = -x;
            baseNode.y = -y + 5;
            lbNode.x = -x;
            lbNode.y = 140 - y - y - y;
            lbBaseNode.x = -x;
            lbBaseNode.y = 150 - y - y - y;
          }
        }
        if (boxList.length == 4) {
          x = 120;
          y = 115;
          if (i <= 1) {
            imgNode.x = (i * 2 * x) - x;
            imgNode.y = y;
            baseNode.x = (i * 2 * x) - x;
            baseNode.y = y + 5;
            lbNode.x = (i * 2 * x) - x;
            lbNode.y = 140 - y;
            lbBaseNode.x = (i * 2 * x) - x;
            lbBaseNode.y = 150 - y;
          }
          if (i > 1) {
            if (i == 2) {
              nx = 0;
            }
            if (i == 3) {
              nx = 1;
            }
            imgNode.x = (nx * 2 * x) - x;
            imgNode.y = -y;
            baseNode.x = (nx * 2 * x) - x;
            baseNode.y = -y + 5;
            lbNode.x = (nx * 2 * x) - x;
            lbNode.y = 140 - y - y - y;
            lbBaseNode.x = (nx * 2 * x) - x;
            lbBaseNode.y = 150 - y - y - y;
          }
        }
        if (boxList.length > 4 && boxList.length <= 6) {
          x = 200;
          y = 115;
          if (i <= 2) {
            imgNode.x = (i * x) - x;
            imgNode.y = y;
            baseNode.x = (i * x) - x;
            baseNode.y = y + 5;
            lbNode.x = (i * x) - x;
            lbNode.y = 140 - y;
            lbBaseNode.x = (i * x) - x;
            lbBaseNode.y = 150 - y;
          }
          if (i > 2 && i <= 5) {
            if (i == 3) {
              nx = 0;
            }
            if (i == 4) {
              nx = 1;
            }
            if (i == 5) {
              nx = 2;
            }
            imgNode.x = (nx * x) - x;
            imgNode.y = -y;
            baseNode.x = (nx * x) - x;
            baseNode.y = -y + 5;
            lbNode.x = (nx * x) - x;
            lbNode.y = 140 - y - y - y;
            lbBaseNode.x = (nx * x) - x;
            lbBaseNode.y = 150 - y - y - y;
          }
        }
        if (boxList.length > 6) {
          x = 200;
          y = 240;
          if (i <= 2) {
            imgNode.x = (i * x) - x;
            imgNode.y = y;
            baseNode.x = (i * x) - x;
            baseNode.y = y + 5;
            lbNode.x = (i * x) - x;
            lbNode.y = y - (170 / 2);
            lbBaseNode.x = (i * x) - x;
            lbBaseNode.y = y - (150 / 2);
          }
          if (i > 2 && i <= 5) {
            if (i == 3) {
              nx = 0;
            }
            if (i == 4) {
              nx = 1;
            }
            if (i == 5) {
              nx = 2;
            }
            imgNode.x = (nx * x) - x;
            imgNode.y = y - y;
            baseNode.x = (nx * x) - x;
            baseNode.y = y - y + 5;
            lbNode.x = (nx * x) - x;
            lbNode.y = y - (170 / 2) - y;
            lbBaseNode.x = (nx * x) - x;
            lbBaseNode.y = y - (150 / 2) - y;
          }
          if (i > 5) {
            if (i == 6) {
              nx = 0;
            }
            if (i == 7) {
              nx = 1;
            }
            if (i == 8) {
              nx = 2;
            }
            imgNode.x = (nx * x) - x;
            imgNode.y = y - y - y;
            baseNode.x = (nx * x) - x;
            baseNode.y = y - y - y + 5;
            lbNode.x = (nx * x) - x;
            lbNode.y = y - (170 / 2) - y - y;
            lbBaseNode.x = (nx * x) - x;
            lbBaseNode.y = y - (150 / 2) - y - y;
          }
        }
      }
    } else {
      imgcb = () => {
        baseNode.width = 70;
        baseNode.height = 70;
        imgNode.width = 60;
        imgNode.height = 60;
        lbBaseNode.width = 110;
        lbBaseNode.height = 40;
        if (boxList.length == 1) {
          imgNode.x = 0;
          imgNode.y = 0;
          baseNode.x = 0;
          baseNode.y = 3;
          lbNode.x = 0;
          lbNode.y = -58;
          lbBaseNode.x = 0;
          lbBaseNode.y = -40;
        }
        if (boxList.length == 2) {
          x = 70;
          imgNode.x = (i * 2 * x) - x;
          imgNode.y = 0;
          baseNode.x = (i * 2 * x) - x;
          baseNode.y = 3;
          lbNode.x = (i * 2 * x) - x;
          lbNode.y = -58;
          lbBaseNode.x = (i * 2 * x) - x;
          lbBaseNode.y = -40;
        }
        if (boxList.length == 3) {
          x = 70;
          y = 70;
          if (i <= 1) {
            imgNode.x = (i * 2 * x) - x;
            imgNode.y = y;
            baseNode.x = (i * 2 * x) - x;
            baseNode.y = y + 3;
            lbNode.x = (i * 2 * x) - x;
            lbNode.y = 80 - y;
            lbBaseNode.x = (i * 2 * x) - x;
            lbBaseNode.y = 98 - y;
          }
          if (i > 1) {
            imgNode.x = -x;
            imgNode.y = -y;
            baseNode.x = -x;
            baseNode.y = -y + 3;
            lbNode.x = -x;
            lbNode.y = 80 - y - y - y;
            lbBaseNode.x = -x;
            lbBaseNode.y = 98 - y - y - y;
          }
        }
        if (boxList.length == 4) {
          x = 70;
          y = 70;
          if (i <= 1) {
            imgNode.x = (i * 2 * x) - x;
            imgNode.y = y;
            baseNode.x = (i * 2 * x) - x;
            baseNode.y = y + 3;
            lbNode.x = (i * 2 * x) - x;
            lbNode.y = 80 - y;
            lbBaseNode.x = (i * 2 * x) - x;
            lbBaseNode.y = 98 - y;
          }
          if (i > 1) {
            if (i == 2) {
              nx = 0;
            }
            if (i == 3) {
              nx = 1;
            }
            imgNode.x = (nx * 2 * x) - x;
            imgNode.y = -y;
            baseNode.x = (nx * 2 * x) - x;
            baseNode.y = -y + 3;
            lbNode.x = (nx * 2 * x) - x;
            lbNode.y = 80 - y - y - y;
            lbBaseNode.x = (nx * 2 * x) - x;
            lbBaseNode.y = 98 - y - y - y;
          }
        }
        if (boxList.length > 4 && boxList.length <= 6) {
          x = 105;
          y = 70;
          if (i <= 2) {
            imgNode.x = (i * x) - x;
            imgNode.y = y;
            baseNode.x = (i * x) - x;
            baseNode.y = y + 3;
            lbNode.x = (i * x) - x;
            lbNode.y = 80 - y;
            lbBaseNode.x = (i * x) - x;
            lbBaseNode.y = 98 - y;
          }
          if (i > 2 && i <= 5) {
            if (i == 3) {
              nx = 0;
            }
            if (i == 4) {
              nx = 1;
            }
            if (i == 5) {
              nx = 2;
            }
            imgNode.x = (nx * x) - x;
            imgNode.y = -y;
            baseNode.x = (nx * x) - x;
            baseNode.y = -y + 3;
            lbNode.x = (nx * x) - x;
            lbNode.y = 80 - y - y - y;
            lbBaseNode.x = (nx * x) - x;
            lbBaseNode.y = 98 - y - y - y;
          }
        }
        if (boxList.length > 6) {
          x = 105;
          y = 80;
          if (i <= 2) {
            imgNode.x = (i * x) - x;
            imgNode.y = y;
            baseNode.x = (i * x) - x;
            baseNode.y = y + 3;
            lbNode.x = (i * x) - x;
            lbNode.y = y - (112 / 2);
            lbBaseNode.x = (i * x) - x;
            lbBaseNode.y = y - (78 / 2);
          }
          if (i > 2 && i <= 5) {
            if (i == 3) {
              nx = 0;
            }
            if (i == 4) {
              nx = 1;
            }
            if (i == 5) {
              nx = 2;
            }
            imgNode.x = (nx * x) - x;
            imgNode.y = y - y - 10;
            baseNode.x = (nx * x) - x;
            baseNode.y = y - y - 10 + 3;
            lbNode.x = (nx * x) - x;
            lbNode.y = y - (112 / 2) - y - 10;
            lbBaseNode.x = (nx * x) - x;
            lbBaseNode.y = y - (78 / 2) - y - 10;
          }
          if (i > 5) {
            if (i == 6) {
              nx = 0;
            }
            if (i == 7) {
              nx = 1;
            }
            if (i == 8) {
              nx = 2;
            }
            imgNode.x = (nx * x) - x;
            imgNode.y = y - y - y - 15;
            baseNode.x = (nx * x) - x;
            baseNode.y = y - y - y - 15 + 3;
            lbNode.x = (nx * x) - x;
            lbNode.y = y - (112 / 2) - y - y - 15;
            lbBaseNode.x = (nx * x) - x;
            lbBaseNode.y = y - (78 / 2) - y - y - 15;
          }
        }
      }
    }

    // 生成
    setSpriteFrame(baseSp, baseUrl, imgcb);
    setSpriteFrame(lbBaseNodeSp, lbBaseUrl, imgcb);
    setSpriteFrame(imgSp, boxList[i].icon, imgcb);


    imgNode.on(
      "touchstart",
      (e) => {
        console.log('e', e);
        let index = e.target._name[e.target._name.length - 1];
        let extraData = Object.assign({}, g, {
          key: '123'
        });
        let appid = boxList[index].app_id;
        let sort = boxList[index].sort;
        P8SDK.gotoSystemCustom(appid, extraData, 'active', sort);
        gameBoxjumpLog('click', sort);
      },
      this
    );
  }

  setSpriteFrame(closeSp, closeBtnUrl, cb2);
  setSpriteFrame(o, contentUrl, cb);
  gameBoxjumpLog('click', "999");

  closeBtnNode.on(
    "touchstart",
    (e) => {
      n.active = false;
    },
    this
  );
}

// cocos3.x版本可调用 box
function showCCBoxPageNew(contentUrl, g = {}, a = {}, retryCount = 0, maxRetries = 20) {
  console.log('触发cocos3.0盒子');
  // 此处测试
  if (!contentUrl) {
    return;
    contentUrl = 'https://wxldconf.ks3-cn-beijing.ksyuncs.com/test-SDK公告.png';
  }
  let boxList = [];

  if (!sdkData.gameBoxData || sdkData.gameBoxData.length == 0) {
    console.error("盒子无数据,请查看后台是否配置...");
    return;
  } else {
    for (let i = 0; i < sdkData.gameBoxData.length; i++) {
      if (sdkData.gameBoxData[i].app_id != sdkData.appid) {
        let obj = {
          ...sdkData.gameBoxData[i],
          game_name: sdkData.gameBoxData[i].game_name.slice(0, 6),
        }
        boxList.push(obj);
      }
    }
  }

  if (boxList.length > 9) {
    boxList = boxList.slice(0, 9)
  }

  // 正式版要注释
  // boxList = boxList.slice(0, 9)
  // for (var i = 0; i < boxList.length; i++) {
  //   boxList[i].game_name = boxList[i].game_name.slice(0, 6);
  // }

  console.log('boxList', boxList);

  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }

  let currentScene = cc.director.getScene();
  console.log('currentScene', currentScene);

  if (retryCount >= maxRetries) {
    console.error('达到的最大重试次数:showCCBoxPageNew');
    return;
  }
  if (currentScene) {
    let canvasNode = currentScene.getChildByName('Canvas') ? currentScene.getChildByName('Canvas') : currentScene.getChildByName('CanvasTest');
    let canvasSize = canvasNode.getContentSize();
    let view = cc.view.getDesignResolutionSize();

    let aPosx = canvasSize.width / 10;
    let aPosy = canvasSize.height / 10;
    console.log('aPosx', aPosx);
    console.log('aPosy', aPosy);
    let n = newNode("firstPage");
    canvasNode.addChild(n);
    n.layer = 33554432;
    let o = n.addComponent(cc.Sprite);
    let wd = n.addComponent(cc.Widget);

    wd.isAlignVerticalCenter = true;
    wd.isAlignHorizontalCenter = true;
    // let closeBtnUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/closeBtn.png';
    // let closeBtnUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/redCloseBtn.png';
    let closeBtnUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/redCloseBtn2.png';
    let closeBtnNode = newNode("closeBtnNode", n);
    // closeBtnNode.layer = 33554442;
    closeBtnNode.layer = 33554432;
    let closeSp = closeBtnNode.addComponent(cc.Sprite);
    let ccBtnNode = newNode("ccBtnNode", n);
    ccBtnNode.layer = 33554431;
    let ccbtn = ccBtnNode.addComponent(cc.Button);
    ccBtnNode.addComponent(cc.BlockInputEventsComponent);
    console.log('n', n);

    let cb = "";
    let cb2 = "";

    if (sdkData.device_orientation == "portrait") {
      let cbPuls = "";
      let cb2Plus = "";
      if (boxList.length <= 2) {
        cbPuls = 2.6;
        cb2Plus = 1.5;
      }
      if (boxList.length > 2 && boxList.length <= 6) {
        cbPuls = 2.3;
        cb2Plus = 1.7;
      }
      if (boxList.length > 6) {
        cbPuls = 1.6;
        cb2Plus = 2.4;
      }
      cb = () => {
        n.getComponent(cc.UITransformComponent).setContentSize(canvasSize.x, canvasSize.y / cbPuls);
        n.setPosition(0, 0);
        ccBtnNode.getComponent(cc.UITransformComponent).setContentSize(canvasSize.x, canvasSize.y);
        ccBtnNode.setPosition(0, 0);
      };
      cb2 = () => {
        let x = 3.6 * aPosx;
        let y = cb2Plus * aPosy;
        let w = 1.5 * aPosx;
        closeBtnNode.setPosition(x, y);
        closeBtnNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
      };
    } else {
      let cbPuls = "";
      let cb2Plus = "";
      let cbYplus = "";
      let cb2Yplus = "";
      if (boxList.length <= 2) {
        cbPuls = 1.3;
        cb2Plus = 2.8;
        cbYplus = 450;
        cb2Yplus = 2.8;
      }
      if (boxList.length > 2 && boxList.length <= 6) {
        cbPuls = 1.1;
        cb2Plus = 3.4;
        cbYplus = 300;
        cb2Yplus = 3.2;
      }
      if (boxList.length > 6) {
        cbPuls = 1;
        cb2Plus = 3.7;
        cbYplus = 5;
        cb2Yplus = 3.8;
      }
      cb = () => {
        n.getComponent(cc.UITransformComponent).setContentSize(canvasSize.y / cbPuls, canvasSize.y - cbYplus);
        n.setPosition(0, 0);
      };
      cb2 = () => {
        let x = cb2Plus * aPosy;
        let y = cb2Yplus * aPosy;
        let w = 1.3 * aPosy;
        closeBtnNode.setPosition(x, y);
        closeBtnNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
      };
    }

    let x = 0;
    let y = 0;
    let w = 0;
    let nx = -1;
    let b = 0;
    let leba = 0;

    for (let i = 0; i < boxList.length; i++) {
      // 底图
      let baseNode = newNode("baseImgNode" + i, n)
      baseNode.layer = 33554432;
      let baseSp = baseNode.addComponent(cc.Sprite);
      let baseUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/iconBg.png';

      // 图片
      let imgNode = newNode("imgNode" + i, n);
      imgNode.layer = 33554432;
      let imgSp = imgNode.addComponent(cc.Sprite);

      // 横条
      let lbBaseNode = newNode("lbBaseNode" + i, n)
      lbBaseNode.layer = 33554432;
      let lbBaseNodeSp = lbBaseNode.addComponent(cc.Sprite);
      let lbBaseUrl = 'https://ksyun.oss-cn-hangzhou.aliyuncs.com/labelBg.png';

      // 文字
      let lbNode = newNode("imgTitleNode" + i, n);
      lbNode.layer = 33554432;
      let lb = lbNode.addComponent(cc.Label);
      lb.isBold = true;
      lb.color = new cc.Color(0, 0, 0);
      lb.string = boxList[i].game_name;

      // 方法
      let imgcb = "";

      if (sdkData.device_orientation == "portrait") {
        imgcb = () => {
          // 九宫格
          if (boxList.length > 6) {
            x = 2.5 * aPosx;
            y = 1.4 * aPosy;
            w = 150;
            b = 160;
            leba = 150;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = aPosy / 7;
            if (i <= 2) {
              imgNode.setPosition((i * x) - x, y - 20);
              baseNode.setPosition((i * x) - x, y - 20 + 5);
              lbBaseNode.setPosition((i * x) - x, y - 20 - (w / 2));
              lbNode.setPosition((i * x) - x, y - 20 - (w / 2));
            }
            if (i > 2 && i <= 5) {
              if (i == 3) {
                nx = 0;
              }
              if (i == 4) {
                nx = 1;
              }
              if (i == 5) {
                nx = 2;
              }
              imgNode.setPosition((nx * x) - x, y - y - 20);
              baseNode.setPosition((nx * x) - x, y - y - 20 + 5);
              lbBaseNode.setPosition((nx * x) - x, y - (w / 2) - y - 20);
              lbNode.setPosition((nx * x) - x, y - (w / 2) - y - 20);
            }
            if (i > 5) {
              if (i == 6) {
                nx = 0;
              }
              if (i == 7) {
                nx = 1;
              }
              if (i == 8) {
                nx = 2;
              }
              imgNode.setPosition((nx * x) - x, y - y - y - 20);
              baseNode.setPosition((nx * x) - x, y - y - y - 20 + 5);
              lbBaseNode.setPosition((nx * x) - x, y - (w / 2) - y - y - 20);
              lbNode.setPosition((nx * x) - x, y - (w / 2) - y - y - 20);
            }
          }
          if (boxList.length > 4 && boxList.length <= 6) {
            x = 2.5 * aPosx;
            y = 0.7 * aPosy;
            w = 150;
            b = 160;
            leba = 150;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = aPosy / 7;
            if (i <= 2) {
              imgNode.setPosition((i * x) - x, y);
              baseNode.setPosition((i * x) - x, y + 5);
              lbBaseNode.setPosition((i * x) - x, w - y);
              lbNode.setPosition((i * x) - x, w - y);
            }
            if (i > 2 && i <= 5) {
              if (i == 3) {
                nx = 0;
              }
              if (i == 4) {
                nx = 1;
              }
              if (i == 5) {
                nx = 2;
              }
              imgNode.setPosition((nx * x) - x, y - y - y + 30);
              baseNode.setPosition((nx * x) - x, y - y - y + 30 + 5);
              lbBaseNode.setPosition((nx * x) - x, w - y - y - y + 30);
              lbNode.setPosition((nx * x) - x, w - y - y - y + 30);
            }
          }
          // 四宫格
          if (boxList.length == 4) {
            x = 1 * aPosy;
            y = 0.8 * aPosy;
            w = 1 * aPosy;
            b = 1.1 * aPosy;
            leba = 1 * aPosy;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = aPosy / 6;
            if (i <= 1) {
              imgNode.setPosition((i * 2 * x) - x, y);
              baseNode.setPosition((i * 2 * x) - x, y + 5);
              lbBaseNode.setPosition((i * 2 * x) - x, w - y);
              lbNode.setPosition((i * 2 * x) - x, w - y);
            }
            if (i > 1) {
              if (i == 2) {
                nx = 0;
              }
              if (i == 3) {
                nx = 1;
              }
              imgNode.setPosition((nx * 2 * x) - x, y - y - y + 30);
              baseNode.setPosition((nx * 2 * x) - x, y - y - y + 30 + 5);
              lbBaseNode.setPosition((nx * 2 * x) - x, w - y - y - y + 30);
              lbNode.setPosition((nx * 2 * x) - x, w - y - y - y + 30);
            }
          }
          // 单个格
          if (boxList.length == 1) {
            x = 2.3 * aPosx;
            y = 1.5 * aPosy;
            w = 1 * aPosy;
            b = 1.1 * aPosy;
            leba = 1 * aPosy;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = aPosy / 6;
            imgNode.setPosition(0, 0);
            baseNode.setPosition(0, 5);
            lbBaseNode.setPosition(0, -aPosy / 2);
            lbNode.setPosition(0, -aPosy / 2);
          }
          // 两个格
          if (boxList.length == 2) {
            x = 1 * aPosy;
            y = 0.3 * aPosy;
            w = 1 * aPosy;
            b = 1.1 * aPosy;
            leba = 1 * aPosy;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = aPosy / 6;
            imgNode.setPosition((i * 2 * x) - x, 0);
            baseNode.setPosition((i * 2 * x) - x, 5);
            lbBaseNode.setPosition((i * 2 * x) - x, -aPosy / 2);
            lbNode.setPosition((i * 2 * x) - x, -aPosy / 2);
          }
          // 三个格
          if (boxList.length == 3) {
            x = 1 * aPosy;
            y = 0.8 * aPosy;
            w = 1 * aPosy;
            b = 1.1 * aPosy;
            leba = 1 * aPosy;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = aPosy / 6;
            if (i <= 1) {
              imgNode.setPosition((i * 2 * x) - x, y);
              baseNode.setPosition((i * 2 * x) - x, y + 5);
              lbBaseNode.setPosition((i * 2 * x) - x, w - y);
              lbNode.setPosition((i * 2 * x) - x, w - y);
            }
            if (i > 1) {
              nx++
              imgNode.setPosition(-x, y - y - y + 30);
              baseNode.setPosition(-x, y - y - y + 30 + 5);
              lbBaseNode.setPosition(-x, w - y - y - y + 30);
              lbNode.setPosition(-x, w - y - y - y + 30);
              if (nx == 2) {
                nx = -1;
              }
            }
          }
        }
      } else {
        imgcb = () => {
          // 单个格
          if (boxList.length == 1) {
            x = 2.3 * aPosx;
            y = 1.5 * aPosy;
            w = 300;
            b = 320;
            leba = 300;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = 48;
            imgNode.setPosition(0, 0);
            baseNode.setPosition(0, 5);
            lbBaseNode.setPosition(0, -150);
            lbNode.setPosition(0, -150);
          }
          // 两个格
          if (boxList.length == 2) {
            x = 250;
            y = 80;
            w = 300;
            b = 320;
            leba = 300;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = 48;
            imgNode.setPosition((i * 2 * x) - x, 0);
            baseNode.setPosition((i * 2 * x) - x, 5);
            lbBaseNode.setPosition((i * 2 * x) - x, -150);
            lbNode.setPosition((i * 2 * x) - x, -150);
          }
          // 三个格
          if (boxList.length == 3) {
            x = 320;
            y = 250;
            w = 300;
            b = 320;
            leba = 300;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = 48;
            if (i <= 1) {
              imgNode.setPosition((i * 2 * x) - x, y);
              baseNode.setPosition((i * 2 * x) - x, y + 5);
              lbBaseNode.setPosition((i * 2 * x) - x, y - 150);
              lbNode.setPosition((i * 2 * x) - x, y - 150);
            }
            if (i > 1) {
              imgNode.setPosition(-x, y - y - y);
              baseNode.setPosition(-x, y - y - y + 5);
              lbBaseNode.setPosition(-x, y - y - y - 150);
              lbNode.setPosition(-x, y - y - y - 150);
            }
          }
          // 四宫格
          if (boxList.length == 4) {
            x = 320;
            y = 250;
            w = 300;
            b = 320;
            leba = 300;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = 48;
            if (i <= 1) {
              imgNode.setPosition((i * 2 * x) - x, y);
              baseNode.setPosition((i * 2 * x) - x, y + 5);
              lbBaseNode.setPosition((i * 2 * x) - x, y - 150);
              lbNode.setPosition((i * 2 * x) - x, y - 150);
            }
            if (i > 1) {
              if (i == 2) {
                nx = 0;
              }
              if (i == 3) {
                nx = 1;
              }
              imgNode.setPosition((nx * 2 * x) - x, y - y - y);
              baseNode.setPosition((nx * 2 * x) - x, y - y - y + 5);
              lbBaseNode.setPosition((nx * 2 * x) - x, y - y - y - 150);
              lbNode.setPosition((nx * 2 * x) - x, y - y - y - 150);
            }
          }
          if (boxList.length > 4 && boxList.length <= 6) {
            x = 380;
            y = 250;
            w = 300;
            b = 320;
            leba = 300;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = 48;
            if (i <= 2) {
              imgNode.setPosition((i * x) - x, y);
              baseNode.setPosition((i * x) - x, y + 5);
              lbBaseNode.setPosition((i * x) - x, y - 150);
              lbNode.setPosition((i * x) - x, y - 150);
            }
            if (i > 2 && i <= 5) {
              if (i == 3) {
                nx = 0;
              }
              if (i == 4) {
                nx = 1;
              }
              if (i == 5) {
                nx = 2;
              }
              imgNode.setPosition((nx * x) - x, y - y - y);
              baseNode.setPosition((nx * x) - x, y - y - y + 5);
              lbBaseNode.setPosition((nx * x) - x, y - y - y - 150);
              lbNode.setPosition((nx * x) - x, y - y - y - 150);
            }
          }
          // 九宫格
          if (boxList.length > 6) {
            x = 430;
            y = 365;
            w = 300;
            b = 320;
            leba = 300;
            imgNode.getComponent(cc.UITransformComponent).setContentSize(w, w);
            baseNode.getComponent(cc.UITransformComponent).setContentSize(b, b);
            lbBaseNode.getComponent(cc.UITransformComponent).setContentSize(leba * 1.2, leba / 2);
            lb.fontSize = 48;
            if (i <= 2) {
              imgNode.setPosition((i * x) - x, y - 10);
              baseNode.setPosition((i * x) - x, y - 10 + 5);
              lbNode.setPosition((i * x) - x, y - 10 - 150);
              lbBaseNode.setPosition((i * x) - x, y - 10 - 150);
            }
            if (i > 2 && i <= 5) {
              if (i == 3) {
                nx = 0;
              }
              if (i == 4) {
                nx = 1;
              }
              if (i == 5) {
                nx = 2;
              }
              imgNode.setPosition((nx * x) - x, y - y - 10);
              baseNode.setPosition((nx * x) - x, y - y - 10 + 5);
              lbBaseNode.setPosition((nx * x) - x, y - y - 10 - 150);
              lbNode.setPosition((nx * x) - x, y - y - 10 - 150);
            }
            if (i > 5) {
              if (i == 6) {
                nx = 0;
              }
              if (i == 7) {
                nx = 1;
              }
              if (i == 8) {
                nx = 2;
              }
              imgNode.setPosition((nx * x) - x, y - y - y - 10);
              baseNode.setPosition((nx * x) - x, y - y - y - 10);
              lbBaseNode.setPosition((nx * x) - x, y - y - y - 10 - 150);
              lbNode.setPosition((nx * x) - x, y - y - y - 10 - 150);
            }
          }
        }
      }
      // 生成
      setSpriteFrameNew(baseSp, baseUrl, imgcb, canvasNode);
      setSpriteFrameNew(lbBaseNodeSp, lbBaseUrl, imgcb, canvasNode);
      setSpriteFrameNew(imgSp, boxList[i].icon, imgcb, canvasNode);
      imgNode.on(
        cc.Node.EventType.TOUCH_START,
        (e) => {
          console.log('e', e);
          let index = e.target._name[e.target._name.length - 1];
          let extraData = Object.assign({}, g, {
            key: '123'
          });
          let appid = boxList[index].app_id;
          let sort = boxList[index].sort;
          P8SDK.gotoSystemCustom(appid, extraData, 'active', sort);
          gameBoxjumpLog('click', sort);
        },
        this
      );
    }

    setSpriteFrameNew(closeSp, closeBtnUrl, cb2, canvasNode);
    setSpriteFrameNew(o, contentUrl, cb, canvasNode);
    gameBoxjumpLog('click', "999");

    ccBtnNode.on(
      cc.Node.EventType.TOUCH_START,
      (e) => {
        console.log('n-ccBtnNode-e', e);
        n.active = false;
      },
      this
    );

    n.on(
      cc.Node.EventType.TOUCH_START,
      (e) => {
        console.log('n-node-e', e);

      },
      this
    );

    closeBtnNode.on(
      cc.Node.EventType.TOUCH_START,
      (e) => {
        console.log('e', e);
        n.active = false;
      },
      this
    );
  } else {
    setTimeout(() => {
      showCCBoxPageNew(contentUrl, g, a, retryCount = 0, maxRetries = 20)
    }, 1000)
  }
}

function showCodeUrlTips(codeUrl, retryCount = 0, maxRetries = 20) {
  console.log('-------------cc', cc);
  console.log('-------------showCodeUrlTips', codeUrl);

  if (retryCount >= maxRetries) {
    console.error('达到的最大重试次数:showCCPopupPageNew');
    return;
  }

  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }

  let currentScene = cc.director.getScene();
  console.log('---------currentScene', currentScene);

  if (currentScene) {
    let canvasNode = currentScene.getChildByName('Canvas') ? currentScene.getChildByName('Canvas') : currentScene.getChildByName('CanvasTest');
    let canvasSize = canvasNode.getContentSize();
    let wxSize = wx.getWindowInfo();
    console.log('------------wxSize', wxSize);
    console.log('------------canvasSize', canvasSize);
    let aPosx = canvasSize.width / 10;
    let aPosy = canvasSize.height / 10;
    console.log('aPosx', aPosx);
    console.log('aPosy', aPosy);
    let n = newNode("firstPage");
    n.addComponent(cc.BlockInputEvents);
    n.zIndex = 999;
    cc.game.addPersistRootNode(n);
    let o = n.addComponent(cc.Sprite);
    var img = codeUrl;
    let codeBtnUrl = img;
    console.log('codeBtnUrl', codeBtnUrl);
    let codeBtnNode = newNode("codeBtnNode", n);
    codeBtnNode.zIndex = 9999;
    let codeBtnSp = codeBtnNode.addComponent(cc.Sprite);

    let closeBtnUrl = "https://ksyun.oss-cn-hangzhou.aliyuncs.com/greenCloseBtn.png"
    let closeBtnNode = newNode("closeBtnNode", n);
    closeBtnNode.zIndex = 9999;
    let closeBtnSp = closeBtnNode.addComponent(cc.Sprite);

    let cb = "";
    let cb2 = "";
    let cb3 = "";
    let contentUrl = "";
    let baseImageWidth = "";
    let baseImageHeight = "";
    if (sdkData.device_orientation == "portrait") {
      contentUrl = "https://ksyun.oss-cn-hangzhou.aliyuncs.com/payCodeTipsV.png"
      baseImageWidth = "500"
      baseImageHeight = "500"
      cb = () => {
        console.error('posY:', o._spriteFrame._rect.height);
        console.error('posX:', o._spriteFrame._rect.width);
        n.x = 375;
        n.y = 667;
      }
      cb2 = () => {
        codeBtnNode.x = 0;
        codeBtnNode.y = 180;
        codeBtnNode.width = 500;
        codeBtnNode.height = 500;
      }
      cb3 = () => {
        closeBtnNode.x = 280;
        closeBtnNode.y = 470;
        closeBtnNode.width = 89;
        closeBtnNode.height = 101;
      }
    } else {
      contentUrl = "https://ksyun.oss-cn-hangzhou.aliyuncs.com/payCodeTipsH.png"
      baseImageWidth = "220"
      baseImageHeight = "220"
      cb = () => {
        console.error('posY:', o._spriteFrame._rect.height);
        console.error('posX:', o._spriteFrame._rect.width);
        // lb.string = ""
        // tipLabel.y = -o._spriteFrame._rect.height / 2;
        n.x = 375;
        n.y = 667;
        n.width = 600;
        n.height = 400;
      }
      cb2 = () => {
        codeBtnNode.x = 0;
        codeBtnNode.y = 30;
        codeBtnNode.width = 220;
        codeBtnNode.height = 220;
      }
      cb3 = () => {
        closeBtnNode.x = 140;
        closeBtnNode.y = 140;
        closeBtnNode.width = 40;
        closeBtnNode.height = 45;
      }
    }
    setSpriteFrameBase64(codeBtnSp, codeBtnUrl, cb2, baseImageWidth, baseImageHeight);
    setSpriteFrame(closeBtnSp, closeBtnUrl, cb3);
    setSpriteFrame(o, contentUrl, cb);
    closeBtnNode.on(
      "touchstart",
      (e) => {
        n.active = false;
      },
      this
    );
  } else {
    setTimeout(() => {
      showCodeUrlTips(codeUrl, retryCount + 1, maxRetries)
    }, 1000)
  }


}

function showCodeUrlTipsNew(codeUrl, retryCount = 0, maxRetries = 20) {
  console.log('-------------cc', cc);
  console.log('-------------showCodeUrlTipsNew', codeUrl);

  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }
  let currentScene = cc.director.getScene();

  if (retryCount >= maxRetries) {
    console.error('达到的最大重试次数:showCCPopupPageNew');
    return;
  }
  console.log('---------currentScene', currentScene);
  if (currentScene) {
    let canvasNode = currentScene.getChildByName('Canvas') ? currentScene.getChildByName('Canvas') : currentScene.getChildByName('CanvasTest');
    let canvasSize = canvasNode.getContentSize();
    console.log('------------canvasSize', canvasSize);
    let aPosx = canvasSize.width / 10;
    let aPosy = canvasSize.height / 10;
    console.log('aPosx', aPosx);
    console.log('aPosy', aPosy);
    let n = newNode("firstPage");
    n.addComponent(cc.BlockInputEventsComponent);
    canvasNode.addChild(n);
    n.layer = 33554432;
    let o = n.addComponent(cc.Sprite);
    var img = codeUrl;
    let codeBtnUrl = img;
    console.log('codeBtnUrl', codeBtnUrl);
    let codeBtnNode = newNode("codeBtnNode", n);
    codeBtnNode.layer = 33554433;
    let codeBtnSp = codeBtnNode.addComponent(cc.Sprite);

    let closeBtnUrl = "https://ksyun.oss-cn-hangzhou.aliyuncs.com/greenCloseBtn.png"
    let closeBtnNode = newNode("closeBtnNode", n);
    closeBtnNode.layer = 33554434;
    let closeBtnSp = closeBtnNode.addComponent(cc.Sprite);

    let cb = "";
    let cb2 = "";
    let cb3 = "";
    let contentUrl = "";
    let baseImageWidth = "";
    let baseImageHeight = "";
    if (sdkData.device_orientation == "portrait") {
      contentUrl = "https://ksyun.oss-cn-hangzhou.aliyuncs.com/payCodeTipsV.png"
      baseImageWidth = "500"
      baseImageHeight = "500"
      cb = () => {
        n.setPosition(0, 0);
      };
      cb2 = () => {
        codeBtnNode.setPosition(0, 180);
        codeBtnNode.setContentSize(500, 500);
      };
      cb3 = () => {
        closeBtnNode.setPosition(280, 470);
        closeBtnNode.setContentSize(89, 101);
      }
    } else {
      contentUrl = "https://ksyun.oss-cn-hangzhou.aliyuncs.com/payCodeTipsH.png"
      baseImageWidth = "220"
      baseImageHeight = "220"
      cb = () => {
        n.getComponent(cc.UITransformComponent).setContentSize(canvasSize.x / 1.2, canvasSize.y - 40);
        n.setPosition(0, -20);
      };
      cb2 = () => {
        let x = 3.5 * aPosx;
        let y = 1 * aPosy;
        let w = 3 * aPosx;
        codeBtnNode.setPosition(0, y);
        codeBtnNode.setContentSize(w, w);
      };
      cb3 = () => {
        let x = 3.5 * aPosx;
        let y = 4 * aPosy;
        let w = 0.6 * aPosx;
        closeBtnNode.setPosition(y, y);
        closeBtnNode.setContentSize(w, w + 5);
      }
    }
    setSpriteFrameNew(closeBtnSp, closeBtnUrl, cb3, canvasNode);
    setSpriteFrameNew(o, contentUrl, cb, canvasNode);
    setSpriteFrameBase64New(codeBtnSp, codeBtnUrl, cb2, canvasNode, baseImageWidth, baseImageHeight);
    closeBtnNode.on(
      cc.Node.EventType.TOUCH_START,
      (e) => {
        n.active = false;
      },
      this
    );
  } else {
    setTimeout(() => {
      showCodeUrlTipsNew(codeUrl, retryCount + 1, maxRetries)
    }, 1000)
  }
}

function showMiniPraGrameCodeUrlTips(codeUrl) {
  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }

  let n = newNode("firstPage");
  n.addComponent(cc.BlockInputEvents);
  n.zIndex = 999;
  cc.game.addPersistRootNode(n);
  let o = n.addComponent(cc.Sprite);
  var img = codeUrl;
  let codeBtnUrl = img;
  console.log('codeBtnUrl', codeBtnUrl);

  let cb = "";

  if (sdkData.device_orientation == "portrait") {
    cb = () => {
      n.x = 375;
      n.y = 667;
      n.width = 750;
      n.height = 1664;
    }
  } else {
    cb = () => {
      n.x = 375;
      n.y = 667;
      n.width = 220;
      n.height = 375;
    }
  }

  setSpriteFrame(o, codeBtnUrl, cb);

  n.on(
    "touchstart",
    (e) => {
      n.active = false;
    },
    this
  );
}

function showMiniPraGrameCodeUrlTipsNew(codeUrl, retryCount = 0, maxRetries = 20) {
  function newNode(e, t = null) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }

  let currentScene = cc.director.getScene();

  if (retryCount >= maxRetries) {
    console.error('达到的最大重试次数:showCCPopupPageNew');
    return;
  }

  if (currentScene) {
    let canvasNode = currentScene.getChildByName('Canvas') ? currentScene.getChildByName('Canvas') : currentScene.getChildByName('CanvasTest');
    let canvasSize = canvasNode.getContentSize();
    console.log('------------canvasSize', canvasSize);
    let aPosx = canvasSize.width / 10;
    let aPosy = canvasSize.height / 10;
    console.log('aPosx', aPosx);
    console.log('aPosy', aPosy);
    let n = newNode("firstPage");
    n.addComponent(cc.BlockInputEventsComponent);
    n.layer = 33554432;
    canvasNode.addChild(n);
    let o = n.addComponent(cc.Sprite);
    var img = codeUrl;
    let codeBtnUrl = img;
    console.log('codeBtnUrl', codeBtnUrl);

    let cb = "";

    if (sdkData.device_orientation == "portrait") {
      cb = () => {
        n.setPosition(0, 0);
        n.getComponent(cc.UITransformComponent).setContentSize(canvasSize.x, canvasSize.y);
      }
    } else {
      cb = () => {
        n.getComponent(cc.UITransformComponent).setContentSize(canvasSize.x / 3, canvasSize.y);
        n.setPosition(0, 0);
      }
    }

    setSpriteFrameNew(o, codeBtnUrl, cb, canvasNode);

    n.on(
      cc.Node.EventType.TOUCH_START,
      (e) => {
        n.active = false;
      },
      this
    );
  } else {
    setTimeout(() => {
      showMiniPraGrameCodeUrlTipsNew(codeUrl, retryCount + 1, maxRetries)
    }, 1000)
  }

}

function setSpriteFrame(a, e, cb) {
  var t = "https://ks3-cn-shanghai.ksyuncs.com";
  if (!e.startsWith('https://')) {
    e = t + e
  }

  cc.loader.load(e, function (e, t) {
    e ? print("cc.loader.load网络加载图片失败", e) : (a.spriteFrame = new cc.SpriteFrame(t), cb && cb());
  });
}

function setSpriteFrameNew(a, e, cb, c) {
  var t = "https://ks3-cn-shanghai.ksyuncs.com";
  if (!e.startsWith('https://')) {
    e = t + e
  }
  let ext = {
    ext: '.png'
  }
  cc.assetManager.loadRemote(e, ext, (err, text) => {
    if (err) {
      console.error(err);
    } else {
      let contentSize = c.getComponent(cc.UITransformComponent).contentSize;
      let width = contentSize.x;
      let height = contentSize.y;
      let spriteFrame = new cc.SpriteFrame();
      let texture = new cc.Texture2D();
      texture.image = text;
      spriteFrame.texture = texture;
      a.spriteFrame = spriteFrame;
      c.getComponent(cc.UITransformComponent).setContentSize(width, height);
      cb && cb();
    }
  });
}

function setSpriteFrameBase64(a, e, cb, w, h) {
  if (!e.startsWith('data:')) {
    console.error('不是base64图片链接');
    return;
  }
  console.log('data:', e);
  const image = new Image();
  image.src = e;
  image.onload = () => {
    let texture = new cc.Texture2D();
    texture.initWithElement(image);
    texture.width = w;
    texture.height = h;
    let spriteFrame = new cc.SpriteFrame(texture);
    a.spriteFrame = spriteFrame;
  };
  cb && cb();
}

function setSpriteFrameBase64New(a, e, cb, c, w, h) {
  if (!e.startsWith('data:')) {
    console.error('不是base64图片链接');
    return;
  }
  console.log('data:', e);
  const image = new Image();
  image.src = e;
  image.onload = () => {
    const img = new cc.ImageAsset(image);
    const texture2D = new cc.Texture2D();
    texture2D.image = img;
    const spriteFrame = new cc.SpriteFrame();
    spriteFrame.texture = texture2D;
    a.spriteFrame = spriteFrame;
    cb && cb();
  };
}

const LOGIN_CACHE_KEY = '@P8SDK_LOGIN_CACHE';
const LOGIN_CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24小时 默认正式使用
// const LOGIN_CACHE_EXPIRE_TIME = 2 * 60 * 1000; // 2分钟 Debug测试使用

// 检查登录缓存是否有效
function isLoginCacheValid(cacheData) {
  print('检查登录缓存是否有效');
  return new Promise((resolve) => {

    // 检查缓存数据是否存在或格式错误
    if (!cacheData || !cacheData.timestamp || !cacheData.loginData) {
      print('登录缓存数据不存在或格式错误');
      resolve(false);
      return;
    }

    // 检查缓存是否过期
    const now = Date.now();
    const cacheTime = cacheData.timestamp;
    const isExpired = now - cacheTime > LOGIN_CACHE_EXPIRE_TIME;
    if (isExpired) {
      print('登录缓存已过期');
      resolve(false);
      return;
    }

    // 检查必要字段是否存在
    const loginData = cacheData.loginData;
    if (!loginData.data || !loginData.data.openid || !loginData.data.session_key || !loginData.data.uid) {
      print('登录缓存数据不完整');
      resolve(false);
      return;
    }

    // 使用 wx.checkSession 验证微信登录状态
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        print('session_key 未过期，并且在本生命周期一直有效');

        // 验证登录信息
        const verifyParams = {
          site: loginData.data.site || sdkData.site,
          time: parseInt(new Date().getTime() / 1e3),
          uid: loginData.data.uid,
          sessionid: loginData.data.sessionid,
        };
        ChangeUndefined(verifyParams);
        let sting = newSignGetType_log(verifyParams);
        let sign = hex_md5(sting);
        verifyParams.sign = sign;
        const verifyUrl = `${sdkData.platform_url}/api/verify_sessionid`;
        wxRequestLoginShort(verifyUrl, 'POST', verifyParams, (res) => {
          let respones = res.data
          if (respones.result == 0 && respones.data.status) {
            print('登录信息验证成功');
            resolve(true);
          } else {
            print('登录信息验证失败');
            resolve(false);
          }
        }, (err) => {
          print('登录信息验证接口调用失败');
          wxDotLog(307, '登录信息验证接口调用失败', `登录信息验证接口调用失败 ${JSON.stringify(err)}`, new Date().getTime())
          resolve(false);
        });
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        print('session_key 已经失效，需要重新执行登录流程');
        resolve(false);
      }
    })

  });
}

// 保存登录信息到缓存
function saveLoginCache(loginData) {
  try {
    loginData.data.isRegisterUser = 0; // 0 表示老用户 1 表示新用户
    const cacheData = {
      timestamp: Date.now(),
      loginData: loginData,
      version: '1.1' // 用于后续版本兼容
    };

    setItem(LOGIN_CACHE_KEY, cacheData);
    print('登录信息已缓存到本地');
    return true;
  } catch (error) {
    console.error('保存登录缓存失败:', error);
    return false;
  }
}

// 获取缓存的登录信息
function getLoginCache() {
  return new Promise(async (resolve) => {
    try {
      const cacheData = getItem(LOGIN_CACHE_KEY);
      const isValid = await isLoginCacheValid(cacheData);

      if (isValid) {
        print('从本地缓存获取登录信息');
        resolve(cacheData.loginData);
        return;
      }

      // 缓存无效时清除
      if (cacheData) {
        removeItem(LOGIN_CACHE_KEY);
        print('删除无效的登录缓存');
      }

      resolve(null);
    } catch (error) {
      console.error('获取登录缓存失败:', error);
      resolve(null);
    }

  });
}

// P8SDK.login
function getUserInfo(l) {
  console.log('getUserInfo 登录锁状态 ', isLoggingIn);
  let result = new Promise(async (resolve, reject) => {
    try {
      if (!sdkData.platform_url) {
        resolve({
          result: 1,
          msg: 'CDN域名 还未获取到，SDK将自动重试登录',
          data: {}
        });
        return;
      }

      if (isLoggingIn) {
        const maxWaitTime = 12000; // 12秒超时
        const startTime = Date.now();
        let checkLoginTimer = null; // 添加定时器ID变量

        const checkLogin = () => {
          if (loginResult) {
            clearTimeout(checkLoginTimer); // 清除定时器
            loginResult.msg = '此处checkLogin表示sdk内部已经获取过这个值,再次调用会返回已经获取过的值';
            resolve(loginResult);
          } else if (Date.now() - startTime > maxWaitTime) {
            clearTimeout(checkLoginTimer); // 清除定时器
            isLoggingIn = false; // 超时自动释放锁
            resolve({
              result: 1,
              msg: '登录等待超时，SDK将自动重试登录',
              data: {}
            });
          } else {
            checkLoginTimer = setTimeout(checkLogin, 100);
          }
        };
        checkLogin();
        return;
      }

      // 设置登录锁
      isLoggingIn = true;

      // 检查缓存的登录结果
      if (loginResult) {
        loginResult.msg = '此处表示sdk内部已经获取过这个值,再次调用会返回已经获取过的值';
        resolve(loginResult); // 登录过重复调用返回缓存值
        console.log('loginResult', loginResult);
        return;
      }

      // 检查本地缓存的登录信息
      const cachedLogin = await getLoginCache();
      if (cachedLogin) {
        // 恢复 sdkData 中的关键信息
        if (cachedLogin.data) {
          const cacheData = cachedLogin.data;
          if (cacheData.openid) {
            sdkData.openid = cacheData.openid;
            sdkData.device = cacheData.openid;
            p8openid = cacheData.openid;
            sdkData.uid = cacheData.uid;
            sdkData.account = cacheData.account;
            sdkData.password = cacheData.password;
            sdkData.isRegisterUser = cacheData.isRegisterUser;
            sdkData.isReactiveUser = cacheData.isReactiveUser;
            sdkData.backFlowDay = cacheData.backFlowDay;
            sdkData.sign = cacheData.sign;
            sdkData.time = cacheData.time;
          }
        }

        // 设置内存缓存
        loginResult = cachedLogin;

        // 添加缓存标识
        cachedLogin.msg = '从本地缓存获取登录信息';
        cachedLogin.fromCache = true;

        print('使用缓存的登录信息:', cachedLogin);
        wxDotLog(306, '登录成功(缓存)', '从本地缓存获取登录信息', new Date().getTime());

        resolve(cachedLogin);

        // 使用缓存登录后，仍然执行一些必要的初始化操作
        setTimeout(() => {
          getpaydata();
          getGoToSwitchdata();
          if (win.cc) {
            P8SDK.showLoadPage && P8SDK.showLoadPage();
            P8SDK.lvcompare && P8SDK.lvcompare();
          }
          getDeviceCode();
          getGameBoxData();
          goto_gift();
          getOnlineRewardId();
          gotoLocalStore();
          gotoSwitchN(sdkData.scene_id);
          gotosiyuSwitchN();
          gotosiyuVipSwitchN();
          getGotoSystemInfo();
          getTempLateIDs();
          debounce(onActiveFuncNew, 1000)();
        }, 100);

        return;
      }


      // 开始主要登录流程
      console.log(' 请求wx.login了 ')
      wxDotLog(300, '进入登录流程', '', new Date().getTime())
      wx.login({
        success(r) {
          console.log('[ start_param ] >', start_param)
          var s = r.code;
          if (!s) {
            wxDotLog(306, '登录失败,调用微信原生的登录成功 但不存在js_code', `调用微信原生的登录成功 但不存在js_code ${JSON.stringify(r)}`, new Date().getTime())
            resolve({
              result: "999",
              data: {},
              msg: "调用微信原生的登录成功 但不存在code" + JSON.stringify(r),
            });
          }
          let n = parseInt(new Date().getTime() / 1e3);
          if (gotoObj.aid) {
            sdkData.b_site = gotoObj.b_site;
            sdkData.b_appid = gotoObj.b_appid;
            sdkData.aid = gotoObj.aid;
            sdkData.site = gotoObj.site;
          }
          var d = md5(`${sdkData.key}WX${sdkData.site}WX${n}${n}`);
          let a = {
            cname: "wxxyx",
            js_code: s,
            channel_parame: start_param,
            aid2: queryData.aid,
            code: queryData.code,
            gdt_vid: queryData.gdt_vid,
            c: queryData.c,
            weixinadinfo: queryData.weixinadinfo,
            modeltype: sdkData.modeltype ? sdkData.modeltype : "test",
            aid: sdkData.aid,
            appid: sdkData.appid,
            site: sdkData.site,
            b_site: gotoObj.b_site,
            sign: d,
            time: n,
            scene: sdkData.scene_id,
            source_type: 3,
            source_from: ""
          };
          if (systemType === "TT") {
            l.clue_token = systemValues.clue_token;
            l.ad_id = systemValues.ad_id;
            l.creative_id = systemValues.creative_id;
            l.channel = systemValues.channel;
          }
          if (queryData.code || queryData.aid) {
            a.source_type = 1
            a.source_from = ""
          }
          let launchData = wx.getLaunchOptionsSync();
          let re = launchData.referrerInfo
          let q = launchData.query
          if (re.appId || q.appid) {
            a.source_type = 2
            a.source_from = re.appId || q.appid
          }
          let o = `${sdkData.platform_url}/oauth/wxLoginToReport`;
          let e = "POST";
          let rUrl = o + "?" + keyValueConnect(a);
          print("登录login请求url ", o);
          print("登录login请求参数 ", a);
          print("登录login参数拼接url: ", rUrl);
          let t = function (i) {
            print("登录成功回调返回的所有参数：", i);
            var i = i.data;
            if (i.result == 0) {
              let e = i.data;
              // console.error("JSCode",s);
              // console.error("session_key",e.session_key);
              sdkData.sign = d;
              sdkData.time = n;
              sdkData.account = e.account;
              sdkData.password = e.password;
              sdkData.isRegisterUser = e.isRegisterUser
              sdkData.isReactiveUser = e.isReactiveUser
              sdkData.backFlowDay = e.backFlowDay

              let md5Key = md5(sdkData.appid);
              let plainText = decrypt(wx.CryptoJS.mode.ECB, e.d, md5Key);
              p8openid = plainText;

              sdkData.openid = p8openid;
              sdkData.device = p8openid;
              e.uid += '';
              sdkData.uid = e.uid + '';
              wxDotLog(301, '登录成功', `已经获取到了openid ${JSON.stringify(queryData)}`, new Date().getTime())
              print("登录成功回调 进行赋值", sdkData);
              print("查询本地是否有广告id配置文件 ", adConfigData);
              let a = {
                result: 0,
                data: {
                  openid: p8openid,
                  session_key: e.session_key,
                  sign: d,
                  time: n,
                  js_code: r.code,
                  site: sdkData.site,
                  appid: sdkData.appid,
                  adUnitId: adConfigData ? adConfigData.adUnitId : "",
                },
              };
              Object.assign(a.data, e);
              loginResult = a;
              saveLoginCache(a);
              setTimeout(() => {
                loginResult = null;
              }, 60000)
              resolve(loginResult);
              getpaydata();
              getGoToSwitchdata();
              if (win.cc) {
                P8SDK.showLoadPage && P8SDK.showLoadPage();
                P8SDK.lvcompare && P8SDK.lvcompare();
              }
              getDeviceCode();
              getGameBoxData();
              goto_gift();
              getOnlineRewardId();
              gotoLocalStore();
              gotoSwitchN(sdkData.scene_id);
              gotosiyuSwitchN();
              gotosiyuVipSwitchN();
              getGotoSystemInfo();
              getTempLateIDs();
              debounce(onActiveFuncNew, 1000)();
            } else {
              let e = {
                "-1": "系统繁忙，此时请开发者稍候再试",
                40029: "code 无效",
                45011: "频率限制，每个用户每分钟100次",
                40226: "高风险等级用户，小程序登录拦截 。风险等级详见用户安全解方案",
              };
              let t = {
                result: "1",
                msg: 'p8sdk服务端请求微信异常',
                data: {
                  errorcode: i && i.errorcode,
                  msg: i.msg,
                  reqData: a,
                  wxTip: i && e[i.errorcode],
                  bdata: i,
                  url: o,
                },
              };
              print("微信登录异常:" + JSON.stringify(t));
              wxDotLog(302, '登录失败,p8sdk服务端请求微信异常', `p8sdk服务端请求微信异常 ${JSON.stringify(t)}`, new Date().getTime())
              resolve(t);
            }
          };

          let i = function (e) {
            let t = {
              result: "1",
              msg: '请求800登录接口失败',
              data: {
                url: o,
                params: a,
                reqData: e,
              },
            };
            print("请求800登录接口失败" + JSON.stringify(e));
            wxDotLog(303, '登录失败,请求800登录接口失败', `请求800登录接口失败 ${JSON.stringify(t)}`, new Date().getTime())
            resolve(t);
          };

          wxRequestLoginShort(o, e, a, t, i);
        },
        fail: function (e) {
          wxDotLog(304, '登录失败,调用微信原生的登录失败 获取微信js_code失败', `调用微信原生的登录失败 获取微信js_code失败${JSON.stringify(e)}`, new Date().getTime())
          var t = {
            result: "-1",
            msg: "调用微信原生的登录失败 获取微信js_code失败" + JSON.stringify(e),
            data: {
              msg: "调用微信原生的登录失败 获取微信js_code失败 接口调用失败，将无法正常使用开放接口等服务 重启游戏试试看？",
            },
          };
          resolve(t);
        },
      });
    } catch (error) {
      console.error('P8SDK.login 登录流程异常', error);
      resolve({
        result: 1,
        msg: '登录流程异常',
        data: {}
      });
    }
  }).finally(() => {
    isLoggingIn = false; // 无论成功失败都释放锁
  });

  return result;
}

function getTempLateIDs() {
  let e = parseInt(new Date().getTime() / 1e3);
  console.log(e);
  let a = {
    site: sdkData.site,
    aid: sdkData.aid,
    time: e,
  };
  console.log('a', a);
  let t = SignGetForCenter(a);
  a.sign = md5(t);
  print("订阅推送消息请求参数 ", a);
  let i = `${sdkData.platform_url}/oauth/getWxSubscriptionId`;
  let n = "GET";
  let o = (t) => {
    print("订阅推送消息请求的url:", i);
    print("订阅推送消息获取到的data", t);
    if (t.data.result == 0) {
      let e = t.data.data.template_id;
      if (e) {
        let temp = e.split(",");
        for (let i = 0; i < temp.length; i++) {
          const element = temp[i];
          if (template_ids.indexOf(element) == -1) {
            template_ids.push(element);
          }
        }
      } else {
        print("没有配置订阅模板id");
      }
      print("订阅推送消息获取到的id", t.data.data.template_id);
    } else {
      print("请求订阅模板id异常 请求参数", t.data, a);
    }
  };
  let r = (e) => {
    print("订阅推送消息获取服务器数据失败", e);
  };
  wxRequest(i, n, a, o, r);
}

P8SDK.getTemplate_ids = function () {
  return template_ids;
};
P8SDK.subscribeMessage = function (temData) {
  let tmplIds = [];
  print("p8sdk 微信消息订阅 接口调用", template_ids);
  if (temData) {
    print("p8sdk 微信消息订阅 自定义传参 接口调用", temData);
  }
  let e = new Promise((c, e) => {
    tmplIds = temData ? temData : template_ids;
    console.log('tmplIds', tmplIds);
    wx.requestSubscribeMessage({
      tmplIds: tmplIds,
      success: (a) => {
        print("微信消息订阅窗口弹出 ", a);
        let i = "";
        for (let t = 0; t < tmplIds.length; t++) {
          let e = tmplIds[t];
          if (a[e] == "accept") {
            i += e + ",";
          }
        }
        i = i.substring(0, i.length - 1);
        let e = parseInt(new Date().getTime() / 1e3);
        let t = {
          site: sdkData.site,
          aid: sdkData.aid,
          template_id: i,
          open_id: sdkData.openid,
          uid: sdkData.uid,
          time: e,
        };
        let n = SignGetForCenter(t);
        t.sign = md5(n);
        let o = `${sdkData.platform_url}/oauth/getWxSubscription`;
        print("请求 订阅消息请求url ", o);
        print("请求 订阅消息请求参数 ", t);
        let r = "GET";
        let s = {
          wxres: a,
        };
        let d = (e) => {
          s.p8res = e;
          print("订阅消息请求 返回data", e);
          c(s);
        };
        let l = (e) => {
          print("订阅消息请求 失败返回data", e);
          s.p8res = e;
          c(s);
        };
        wxRequest(o, r, t, d, l);
      },
      fail(e) {
        let t = {
          wxres: e,
        };
        console.error("微信消息订阅窗口弹出异常:", e);
        c(t);
      },
    });
  });
  return e;
};

P8SDK.getSubscriptionsSetting = function (g) {
  print("p8sdk 查询订阅消息", arguments);
  let e = new Promise((l, j) => {
    let e = parseInt(new Date().getTime() / 1e3);
    let t = {
      site: sdkData.site,
      uid: sdkData.uid,
      time: e,
    };
    let n = SignGetForCenter(t);
    t.sign = md5(n);
    let o = `${sdkData.platform_url}/oauth/getUserWxSubscriptionId`;
    let rUrl = o + "?" + keyValueConnect(t);
    print("请求 查询订阅消息请求url ", o);
    print("请求 查询订阅消息请求参数 ", t);
    print("请求 查询订阅消息请求参数拼接url: ", rUrl);
    let r = "GET";
    let d = (res) => {
      print("查询订阅消息请求 成功返回data", res);
      l(res.data);
    };
    let f = (err) => {
      print("查询订阅消息请求 失败返回data", err);
      l(err.data);
    };
    wxRequest(o, r, t, d, f);
  })
  return e
}

P8SDK.delSubscribeMessage = function (g) {
  print("p8sdk 取消订阅消息", arguments);
  let e = new Promise((l, j) => {
    let e = parseInt(new Date().getTime() / 1e3);
    let temId = g.join(',')
    console.log('temId', temId);
    let t = {
      site: sdkData.site,
      uid: sdkData.uid,
      template_id: temId,
      time: e,
    };
    let n = SignGetForCenter(t);
    t.sign = md5(n);
    let o = `${sdkData.platform_url}/oauth/delUserWxSubscriptionId`;
    let rUrl = o + "?" + keyValueConnect(t);
    print("请求 取消订阅消息请求url ", o);
    print("请求 取消订阅消息请求参数 ", t);
    print("请求 取消订阅消息请求参数拼接url: ", rUrl);
    let r = "GET";
    let d = (res) => {
      print("取消订阅消息请求 成功返回data", res);
      let p8res = {
        result: 0,
        data: {
          msg: "取消成功",
          res: JSON.stringify(res),
        }
      }
      l(p8res);
    };
    let f = (err) => {
      print("取消订阅消息请求 失败返回data", err);
      let p8res = {
        result: 1,
        data: {
          msg: "取消失败",
          res: JSON.stringify(err),
        }
      }
      l(p8res);
    };
    wxRequest(o, r, t, d, f);
  })
  return e;
}

var temporarytime;
P8SDK.gotoCustomerServiceConversation = function (e) {
  if (P8SDK.showCustomerServicePage) {
    P8SDK.showCustomerServicePage();
    return
  }
  print("p8sdk 微信消息订阅 接口调用", e);
  if (!e || e.showMessageCard === undefined) {
    e = {};
    e.showMessageCard = false;
  }
  if (!e.fail) {
    e.fail = () => {
      print("p8 sdk调用客服 fail");
    };
  }
  if (!e.complete) {
    e.complete = () => {
      print("p8 sdk调用客服 complete");
    };
  }
  wx.openCustomerServiceConversation({
    showMessageCard: e.showMessageCard,
    sendMessageTitle: e.sendMessageTitle,
    sendMessagePath: e.sendMessagePath,
    sendMessageImg: e.sendMessageImg,
    success: e.success,
    fail: e.fail,
    complete: e.complete,
  });
};

function openKeFu() {
  let e = new Date();
  let t = e.getTime();
  temporarytime = t;
  wx.openCustomerServiceConversation({
    showMessageCard: true,
    sendMessagePath: "page/index/index?a=b&c=d",
    sendMessageTitle: "回复“礼包”继续",
    sendMessageImg: "https://ks3-cn-shanghai.ksyuncs.com/800img/1109.png",
  });
}
wx.onHide(function () {
  let e = new Date();
  let t = e.getTime();
  if (Math.abs(temporarytime - t) < 1e4) {
    let e = `${sdkData.platform_url}/oauth/wechat/${sdkData.appid}?MsgType=wxToH5&openid=${sdkData.device}&site=${sdkData.site}&aid=${sdkData.aid}`;
    let t = "GET";
    let a = "";
    let i = () => {
      print("进入微信后台上报成功");
    };
    wxRequest(e, t, a, i);
  }
});



var SuspensionTypeBtn = false;
P8SDK.SuspensionBtn = function () {
  print("调用生成悬浮窗");

  function b(e, t) {
    let a = new cc.Node(e);
    if (t) {
      a.parent = t;
    }
    return a;
  }
  SuspensionTypeBtn = true;
  var e = 375;
  var t = 812;
  var a = wx.getSystemInfoSync().windowWidth;
  var i = wx.getSystemInfoSync().windowHeight;
  var C = e / a;
  var T = t / i;
  let n = b("moveButton");
  n.zIndex = 100;
  let o = n.addComponent(cc.Sprite);
  n.addComponent(cc.Button);
  n.setContentSize(80 / C, 80 / T);
  setSpriteFrame(o, "/800img/bg.png");
  (o.sizeMode = cc.Sprite.SizeMode.CUSTOM), cc.game.addPersistRootNode(n);
  n.setPosition(50, i);
  let r = b("xuanfukuang", n);
  let s = r.addComponent(cc.Sprite);
  setSpriteFrame(s, "/hswl/p8SDK-img/%E6%9B%B4%E5%A4%9A.png");
  r.addComponent(cc.Button);
  r.setContentSize(80 / C, 80 / T);
  s.sizeMode = cc.Sprite.SizeMode.CUSTOM;
  let d;
  r.on(
    "touchstart",
    (e) => {
      d = false;
    },
    this
  );
  r.on(
    "touchmove",
    (e) => {
      d = true;
      n.x = e.currentTouch._point.x;
      n.y = e.currentTouch._point.y;
    },
    this
  );
  r.on(
    "touchend",
    (e) => {
      if (n.y <= 40) {
        n.y = 50;
      } else if (n.y >= 2 * i - 80 / T) {
        n.y = 2 * i - 20 - 80 / T;
      }
      if (!d) l.active = !l.active;
    },
    this
  );
  let l = b("layout", n);
  let c = l.addComponent(cc.Sprite);
  setSpriteFrame(c, "/hswl/20211026104715.png");
  l.setContentSize(200 / C, 250 / T);
  c.sizeMode = cc.Sprite.SizeMode.CUSTOM;
  l.setPosition(150 / C, -40 / T);
  l.active = false;
  let g = b("shoujiButton", l);
  let f = g.addComponent(cc.Sprite);
  g.addComponent(cc.Button);
  g.setContentSize(45 / C, 45 / T);
  setSpriteFrame(f, "/hswl/p8SDK-img/%E6%89%8B%E6%9C%BA.png");
  f.sizeMode = cc.Sprite.SizeMode.CUSTOM;
  g.setPosition(-40, 43 / T);
  let u = b("label2", g);
  u.color = new cc.color().fromHEX("#9F9F9F");
  u.setPosition(0, -50 / T);
  creatorlabel("label2", "#9F9F9F", g, 0, -50 / T, "手机", 22 / T);
  var A = false;
  var I = false;
  let M = b("binding");
  g.on(
    "click",
    (e) => {
      if (A == false && I == false) {
        A = true;
        I = true;
        M.addComponent(cc.BlockInputEvents);
        M.zIndex = 90;
        cc.game.addPersistRootNode(M);
        M.setContentSize(cc.director.getWinSizeInPixels().width, cc.director.getWinSizeInPixels().height);
        M.setPosition(cc.director.getWinSizeInPixels().width / 2, cc.director.getWinSizeInPixels().height / 2);
        let e = M.addComponent(cc.Sprite);
        setSpriteFrame(e, "/800img/1108.png");
        e.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        let t = cc.director.getWinSizeInPixels().height / 1560;
        creatorlabel("shoujihao", "#0D0D0D", M, -250 / C, 400 * t, "手 机 号 :");
        creatorlabel("yanzhengma", "#0D0D0D", M, -250 / C, 280 * t, "验 证 码 :");
        creatorlabel("mima", "#0D0D0D", M, -250 / C, 100 * t, "密       码:");
        creatorlabel("quedingmima", "#0D0D0D", M, -250 / C, 0 * t, "确认密码:");
        creatorlabel("quedingmima", "#0D0D0D", M, 0, -350 * t, "绑定后，您可以使用手机号登陆app客户端");
        let r = creatorlabel("success", "#E82C2C", M, 0, -400 * t, "请 输 入 您 的 手 机 号", 28);
        let s = creatorlabel("success", "#E82C2C", M, 0, -150 * t, "该账号以绑定过了", 28);
        s.node.active = false;
        let d = creatorlabel("success", "#E82C2C", M, 0, -150 * t, "请 输 入 验 证 码", 28);
        d.node.active = false;
        let l = creatorlabel("success", "#E82C2C", M, 0, -200 * t, "并设置最少大于6位的密码", 28);
        l.node.active = false;
        let a = b("EditBox1", M);
        a.setPosition(0 / C, 400 * t);
        a.setContentSize(300 / C, 100 / T);
        let c = a.addComponent(cc.EditBox);
        let i = creatorlabel("textlabel", "#8E8888", a, 0, 0, "手机号");
        a.on("editing-did-began", () => {
          i.string = "|";
        });
        a.on("text-changed", () => {
          i.string = c.string;
        });
        a.on("editing-did-ended", () => {
          if (c.string.length == 0) {
            i.string = "手机号";
          } else {
            i.string = c.string;
          }
        });
        var S = creatorlabel("daojishi", "#0D0D0D", M, 280 / C, 400 * t, "60");
        let n = 60;
        S.node.active = false;
        let o = b("jurisdiction1", M);
        o.setContentSize(180 / C, 120 / T);
        o.setPosition(260 / C, 400 * t);
        let g = o.addComponent(cc.Sprite);
        setSpriteFrame(g, "/hswl/bindingimg/20211102-154359.png");
        g.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        o.addComponent(cc.Button);
        o.on(
          "click",
          (e) => {
            o.active = false;
            S.node.active = true;
            n = 60;
            if (n >= 0) {
              setInterval(function () {
                if (n >= 1 && S.node.active == true) {
                  n -= 1;
                  S.string = n;
                } else {
                  S.node.active = false;
                  o.active = true;
                }
              }, 500);
            }
            if (i.string.length == 11) {
              r.node.active = false;
              let e = parseInt(new Date().getTime() / 1e3);
              let n = {
                site: sdkData.site,
                time: e,
                mobile: c.string,
                sendtype: "bind",
              };
              let t = newSignGetType(n);
              n.sign = md5(t);
              let a = `${sdkData.platform_url}/api/newcheckbind`;
              let i = "GET";
              let o = function (e) {
                let i = e.data.data;
                if (i.status == 0) {
                  s.node.active = false;
                  print("未绑定手机号,获取授权成功", i);
                  let e = `${sdkData.platform_url}/api/sendmobilecode`;
                  let t = "GET";
                  let a = function (e) {
                    print("验证码已经发送", e);
                    let t = e.data;
                    if (t.result == 0) {
                      d.node.active = true;
                      l.node.active = true;
                    }
                  };
                  wxRequest(e, t, n, a);
                } else {
                  print("请输入正确的手机号");
                  s.node.active = true;
                }
              };
              wxRequest(a, i, n, o);
            }
          },
          this
        );
        let f = b("EditBox2", M);
        f.setPosition(0 / C, 280 * t);
        f.setContentSize(300 / C, 100 / T);
        let u = f.addComponent(cc.EditBox);
        let p = creatorlabel("textlabel", "#8E8888", f, 0, 0, "验证码");
        f.on("editing-did-began", () => {
          p.string = "|";
        });
        f.on("text-changed", () => {
          p.string = u.string;
        });
        f.on("editing-did-ended", () => {
          if (u.string.length == 0) {
            p.string = "验证码";
          } else {
            p.string = u.string;
          }
        });
        let m = b("EditBox3", M);
        m.setPosition(0 / C, 100 * t);
        m.setContentSize(300 / C, 100 / T);
        let h = m.addComponent(cc.EditBox);
        let _ = creatorlabel("textlabel", "#8E8888", m, 0, 0, "请输入密码");
        m.on("editing-did-began", () => {
          _.string = "|";
        });
        m.on("text-changed", () => {
          _.string = h.string;
        });
        m.on("editing-did-ended", () => {
          if (h.string.length == 0) {
            _.string = "请输入密码";
          } else {
            _.string = h.string;
          }
        });
        let w = b("EditBox4", M);
        w.setPosition(0, 0);
        w.setContentSize(300 / C, 100 / T);
        let D = w.addComponent(cc.EditBox);
        let x = creatorlabel("textlabel", "#8E8888", w, 0, 0, "确认密码");
        w.on("editing-did-began", () => {
          x.string = "|";
        });
        w.on("text-changed", () => {
          x.string = D.string;
        });
        w.on("editing-did-ended", () => {
          if (D.string.length == 0) {
            x.string = "确认密码";
          } else {
            x.string = D.string;
          }
        });
        let v = b("jurisdiction2", M);
        v.setContentSize(600 / C, 120 / T);
        v.setPosition(0 / C, -500 * t);
        let y = v.addComponent(cc.Sprite);
        setSpriteFrame(y, "/hswl/bindingimg/20211102-154422.png");
        y.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        v.addComponent(cc.Button);
        let k = {
          account: sdkData.account,
          password: sdkData.password,
          site: sdkData.site,
          time: "",
          mobile: "",
          code: "",
          newpassword: "",
        };
        v.on(
          "click",
          (e) => {
            (k.time = parseInt(new Date().getTime() / 1e3)), (k.mobile = c.string);
            k.code = u.string;
            k.newpassword = h.string;
            let t = newSignGetType(k);
            k.sign = md5(t);
            if (D.string.length == h.string.length && D.string.length >= 6 && c.string.length == 11 && u.string.length == 5) {
              let e = `${sdkData.platform_url}/api/newbindmobile`;
              let t = "GET";
              let a = function (e) {
                if (e.data.result == 0) {
                  d.node.active = false;
                  l.string = "提 交 成 功";
                  v.active = false;
                  setTimeout(function () {
                    M.active = false;
                  }, 2e3);
                } else if (e.data.result == 1) {
                  l.node.active = true;
                  d.node.active = false;
                  l.string = e.data.data.msg;
                  setTimeout(function () {
                    l.node.active = false;
                  }, 2e3);
                }
              };
              wxRequest(e, t, k, a);
            } else {
              print("提交失败");
            }
            print("binding", M);
          },
          this
        );
      } else if (A == true && I == true) {
        M.active = false;
        A = false;
      } else if (A == false && I == true) {
        M.active = true;
        A = true;
      }
    },
    this
  );
  let p = b("shoujiButton", l);
  let m = p.addComponent(cc.Sprite);
  p.addComponent(cc.Button);
  p.setContentSize(45 / C, 45 / T);
  setSpriteFrame(m, "/hswl/p8SDK-img/%E6%89%8B%E6%B8%B8.png");
  m.sizeMode = cc.Sprite.SizeMode.CUSTOM;
  p.setPosition(40, 43 / T);
  creatorlabel("label3", "#9F9F9F", p, 0, -50 / T, "升级", 22 / T);
  p.on(
    "click",
    (e) => {
      let t =
        "下载并使用手机版游戏即可享受:\n\n✨✨【纵享流畅体验,减少卡顿闪退问题】✨✨\n\n✨【福利满满的高价值礼包等你来兑换】✨\n\n限时福利，机不可失,千万别错过!\n前往客服回复“礼包”领取手机版";
      wx.showModal({
        title: "超值福利领取",
        content: t,
        cancelText: "残忍拒绝",
        confirmText: "前往客服",
        success(e) {
          if (e.confirm) {
            print("用户点击确定--\x3e 前往客服");
            openKeFu();
          } else if (e.cancel) {
            print("用户点击取消--\x3e 残忍拒绝");
          }
        },
      });
    },
    this
  );
};
P8SDK.lvcompare = function () {
  let e = parseInt(new Date().getTime() / 1e3);
  let t = {
    site: sdkData.site,
    time: e,
    aid: sdkData.aid,
    uid: sdkData.uid,
  };
  print("悬浮窗条件查询请求参数", t);
  let a = SignGetForCenter(t);
  t.sign = md5(a);
  let i = `${sdkData.platform_url}/switch/wxFrame`;
  let n = "GET";
  let o = function (e) {
    let t = e.data.data;
    if (t.s == true && SuspensionTypeBtn == false) {
      print("条件满足，生成悬浮框");
      SuspensionBtn();
    } else {
      print("生成悬浮框条件不满足");
    }
  };
  wxRequest(i, n, t, o);
};
P8SDK.creatorlabel = function (e = "", t = "", a, i = 0, n = 0, o = "", r) {
  let s = new cc.Node(e);
  if (t) s.color = new cc.color().fromHEX(t);
  s.setPosition(i, n);
  s.parent = a;
  let d = s.addComponent(cc.Label);
  if (r) d.fontSize = r;
  d.string = o;
  return d;
};

P8SDK.init = function (succ, err) {

}

let loginRetryTimer = null;
P8SDK.login = function () {
  console.log("P8SDK.js  login开始调用: " + dateFormat());

  if (loginRetryTimer) {
    clearTimeout(loginRetryTimer);
    loginRetryTimer = null;
  }

  let result = new Promise((resolve, reject) => {
    getUserInfo().then((res) => {
      if (res.result == 0) {
        console.warn(`[!]登录回调getUserInfo: `, res);
        resolve(res)
      } else {
        console.log(`[!]p8sdk登录失败: `, JSON.stringify(res));
        wxDotLog(305, '登录失败,进行重试', JSON.stringify(res), new Date().getTime())
        loginRetryTimer = setTimeout(() => {
          P8SDK.login().then(resolve);
        }, 1000);
      }
    }).catch((err) => reject(err))
  });
  return result;
};

P8SDK.createGameClubButton = function (data) {
  let button = wx.createGameClubButton({
    type: data.type,
    style: {
      left: data.left,
      top: data.top,
      width: data.width,
      height: data.height,
    },
    image: data.image,
    openlink: data.openlink,
    hasRedDot: data.hasRedDot
  })
  return button;
}

// 游戏圈
P8SDK.getGameClubData = function () {
  console.log(sdkData);
  let e = new Promise((a, e) => {
    wx.getGameClubData({
      dataTypeList: [{
          type: 1
        },
        {
          type: 3
        },
        {
          type: 4
        },
        {
          type: 5
        },
        {
          type: 6
        },
        {
          type: 7
        },
        {
          type: 8
        },
        {
          type: 9
        },
        {
          type: 10
        },
      ],
      success: (res) => {
        let t = parseInt(new Date().getTime() / 1e3);
        let n = {
          site: sdkData.site,
          uid: sdkData.uid,
          iv: res.iv,
          encryptedData: res.encryptedData,
          time: t,
        };
        ChangeUndefined(n);
        var k = newSignGetType_log(n);
        var i = hex_md5(k);
        n.sign = i;
        let o = `${sdkData.platform_url}/api/wxDataDecode`;
        let r = "get";
        let s = (e) => {
          if (e.data.result == 0) {
            console.log(1);
            var t = {
              result: 0,
              data: {
                data: e.data.data
              },
            };
            a(t);
          } else {
            var t = {
              result: e.data.data.errorcode,
              msg: e.data.data.msg,
            };
            a(t);
          }
        };
        wxRequest(o, r, n, s);
      },
      fail: (res) => console.error(res),
    })
  });
  return e;
}

// 游戏更新提醒
P8SDK.requestSubscribeSystemMessage = function (func) {
  wx.requestSubscribeSystemMessage({
    msgTypeList: ['SYS_MSG_TYPE_WHATS_NEW'],
    success(res) {
      func(res);
    }
  })
}

function blowPoint(e = "null") {
  var t = parseInt(new Date().getTime() / 1e3);
  let a = {
    str: e,
    time: t,
    openid: p8openid,
    appid: sdkData.appid,
    site: sdkData.site,
    uid: sdkData.uid,
    version: P8SDK_VERSION,
    device: p8openid,
    aid: sdkData.aid,
  };
  let i = `${sdkData.platform_url}/sdk_callback/setLog`;
  let n = "POST";
  let o = function (e) {
    print("上报打点日志成功", a);
    var e = e.data;
    if (e.result == 0) {}
  };
  wxRequest(i, n, a, o);
}

function blowPointScene(e = "null") {
  var t = parseInt(new Date().getTime() / 1e3);
  let a = {
    log: 'tip_show_log',
    isip: true, // 是否记录ip
    str: e,
    time: t
  };
  console.error('上报的数据是', a);
  let i = `${sdkData.platform_url}/sdk_callback/setLog`;
  let n = "POST";
  let o = function (e) {
    print("上报打点日志成功", a);
    var e = e.data;
    if (e.result == 0) {}
  };
  wxRequestShort(i, n, a, o);
}

function wxDotLog(step_id, step_name, ext_info, dot_time) {
  const retryDelay = 1000; // 重试间隔1秒
  const maxRetries = 20; // 最大重试次数
  let retryCount = 0;
  let timer = null; // 保存定时器ID

  function attemptLog() {
    if (!sdkData.data_url) {
      if (retryCount < maxRetries) {
        retryCount++;
        timer = setTimeout(attemptLog, retryDelay);
        return;
      }
      if (timer) {
        clearTimeout(timer); // 清理定时器
        timer = null;
      }
      print(" wxDotLog· 达到最大重试次数后仍未获取到 data_url");
      return;
    }

    if (timer) {
      clearTimeout(timer); // 清理定时器
      timer = null;
    }

    let a = {
      site: sdkData.site,
      aid: sdkData.aid,
      client_id: sdkData.client_id,
      uid: sdkData.uid,
      openid: sdkData.openid,
      step_id: step_id ? step_id : "",
      step_name: step_name ? step_name : "",
      platform: sdkData.platform,
      device_model: sdkData.device_model,
      device_version: sdkData.device_version,
      network_type: sdkData.device_net,
      scene: sdkData.scene_id,
      ext_info: ext_info ? ext_info : "",
      time: dot_time ? dot_time : "",
    }
    // console.log('[ wxDotLog ] >', a)
    ChangeUndefined(a)
    let d = SignGetForCenter(a);
    a.sign = hex_md5(d);
    // let i = `http://tdata.play800.cn/log/wxDotLog`;
    let i = `${sdkData.data_url}/log/wxDotLog`;
    let n = "GET";
    let o = function (e) {
      var e = e.data;
      if (e.result == 0) {
        // print("上报wxDotLog打点日志成功", a);
      } else {
        // print("上报wxDotLog打点日志失败", a);
      }
    }
    wxRequest(i, n, a, o);
  }

  attemptLog();
}

P8SDK.getSDKData = function () {
  return sdkData;
}

function gameBoxjumpLog(s = "null", t = "-1") {
  let e = parseInt(new Date().getTime() / 1e3);
  let a = {
    site: sdkData.site,
    box_id: sdkData.box_id,
    uid: sdkData.uid,
    lattice: t,
    type: s,
    time: e,
  }
  let d = SignGetForCenter(a);
  a.sign = md5(d);
  print('盒子日志上报的数据: ', a);
  let i = `${sdkData.platform_url}/log/jumpLog`;
  let rUrl = i + "?" + keyValueConnect(a);
  print("请求 盒子上报打点日志拼接url: ", rUrl);
  let n = "GET";
  let o = function (e) {
    var e = e.data;
    if (e.result == 0) {
      print("盒子上报打点日志成功success: ", a);
    } else {
      print("盒子上报打点日志失败fail: " + JSON.stringify(e));
    }
  };
  wxRequestShort(i, n, a, o);
}

P8SDK.gameActionLog = function (s = "-1") {
  let a = {
    action_id: s,
    site: sdkData.site,
    uid: sdkData.uid,
  };
  print('游戏行为上报的数据: ', a);
  let i = `https://admin.yyingplay.com/v1/game_action_log`;
  let rUrl = i + "?" + keyValueConnect(a);
  print("请求 游戏行为日志上报拼接url: ", rUrl);
  let n = "POST";
  let o = (t) => {
    t = dateOrRes(t);
    if (t.ack === 0) {
      print("游戏行为日志上报成功success: ", JSON.stringify(t));
    } else {
      print("游戏行为日志上报异常fail: ", JSON.stringify(t));
    }
  };
  wxRequestShort(i, n, a, o);
}

/** 获取本地缓存文件 */
function getItem(key) {
  return wx.getStorageSync(key);
}

/** 设置本地缓存文件 */
function setItem(key, value) {
  wx.setStorageSync(key, value);
}

/** 清除本地缓存文件 */
function clearItem(key) {
  wx.clearStorageSync(key)
}

/** 删除本地缓存文件 */
function removeItem(key) {
  wx.removeStorageSync(key)
}

function SignGetForCenter(e) {
  let t = sdkData.key;
  var a = [];
  for (var i in e) {
    a.push(i);
  }
  a = a.sort();
  var n = "";
  for (var o = 0; o < a.length; o++) {
    var r = e[a[o]];
    if (o != a.length - 1) {
      n += a[o] + "=" + r + "&";
    } else {
      n += a[o] + "=" + r;
    }
  }
  return e.site + n + t;
}

function newSignGetType(t) {
  ChangeUndefined(t);
  var a = [];
  for (var e in t) {
    a.push(e);
  }
  a = a.sort();
  let i = "";
  for (let e = 0; e < a.length; e++) {
    const n = t[a[e]];
    if (e != 0) {
      i += a[e] + n;
    } else {
      i += a[e] + n;
    }
  }
  return i;
}

function ChangeUndefined(t) {
  for (let e in t) {
    if (t.hasOwnProperty(e)) {
      if (typeof t[e] == "undefined") {
        t[e] = "";
      }
    }
  }
}

P8SDK.showPayStatus = function (l) {
  let e = new Promise((t, e) => {
    let a = parseInt(new Date().getTime() / 1e3);
    let i = md5(sdkData.key + "WX" + sdkData.site + "WX" + a + a);
    let n = {
      site: sdkData.site,
      time: a,
      uid: sdkData.uid,
      sign: i,
      version: P8SDK_VERSION,
      roleid: l.roleid,
      level: l.level,
      ce: 0,
      vip: false,
      sid: 1,
    };
    let o = `${sdkData.rg_url}/h/isShowPay`;
    Object.assign(n, l);
    print(" 显示支付入口开关 请求参数", n);
    let r = "GET";
    let s = (e) => {
      print(" 显示支付入口开关 返回参数", e);
      t(e && e.data);
    };
    let d = (e) => {
      t({
        result: 1,
        data: {
          msg: "微信请求异常 error",
          res: e,
        },
      });
    };
    wxRequest(o, r, n, s, d);
  });
  return e;
};

/**
 * 补单操作
 */
function fixOrder() {
  let oldOrder = getItem("oldOrderInfo");
  if (!oldOrder) {
    return;
  }
  oldOrder = JSON.parse(oldOrder);
  oldOrder.mac = "1"; // 1代表补单
  getMidasBalance()
    .then((data) => {
      let res = dateOrRes(data);
      if (res.result == 0) {
        let balance = res.data.balance;
        console.log("balance:", balance);
        // 大于6块是有效金额
        if (balance >= 6) {
          // 此处是补单逻辑
          midasNotify(oldOrder);
        } // 反之不用管
      } else {
        console.log("请求米大师余额查询异常");
      }
    })
    .catch(() => {
      console.log("请求米大师余额查询失败");
    });
}

/** 查询用户米大师余额 */
function getMidasBalance() {
  let result = new Promise((resolve, rejecte) => {
    // test 查询米大师余额
    let i = `${sdkData.platform_url}/oauth/getMidasBalance`;
    // i = "https://tcenter.play800.cn/oauth/getMidasBalance";
    // console.error("测试域名2", i);
    let t = {
      site: sdkData.site,
      uid: sdkData.uid,
      openid: sdkData.openid,
      // version: "2.0"
      version: sdkData.mdsVersion,
    };

    let n = "GET";
    let o = function (data) {
      let res = dateOrRes(data);
      if (res.result == 0) {
        let balance = res.data.balance;
        console.log("balance:", balance);
        resolve(balance);
      }
      console.error("请求米大师余额查询 返回的数据", data);
      rejecte(null);
    };
    let f = function (msg) {
      console.error("请求米大师余额查询异常 msg", msg);
      rejecte(null);
    };
    wxRequest(i, n, t, o, f);
  });
  return result;
}

/**
 * @env {正式环境 0}
 * @money {购买数量 比例已经配置在后台了}
 */
function midasPay(params) {
  console.log('params', params);
  let result = new Promise((resolve, rejecte) => {
    let payReqdata = {
      env: params.env,
      buyQuantity: params.money * paydata.scale,
      offerId: paydata.offerId,
      zoneId: paydata.zoneId,
      mode: "game",
      currencyType: "CNY",
      platform: "android",
      success: function (e) {
        console.error("米大师支付返回", e);
        console.log('支付成功上报TXsdk---txSdkHeartBeat');
        // txSdkHeartBeat('PURCHASE', {
        //   value: params.money * 100,
        //   orderid: params.p8Order,
        //   ...params.cpOrder
        // })
        let puchaseMoney = Number(params.money) * 100;
        console.log(" 支付上报金额 ", puchaseMoney);
        if (TXDNSDK.onPurchase) {
          TXDNSDK.onPurchase(puchaseMoney);
        }
        wxDotLog(601, '广点通安卓米大师支付上报成功', `${params.p8Order}`, new Date().getTime());
        let a = params.cpOrder
        let incomedata = {
          roleid: a.roleid,
          rolename: a.rolename,
          sid: a.serverid,
          income_money: a.money,
          order_id: a.cp_order_id,
          username: a.username,
          vip: a.vip,
          level: a.level,
          ip: a.ip,
          income_currency: a.income_currency || "CNY",
          income_channel: a.income_channel || "wx",
          income_gold: a.income_gold,
          own_gold: a.own_gold,
          income_status: a.income_status,
          p8_order_id: params.p8Order,
        }
        incomeLogNew(incomedata);
        let res = {
          result: 0,
          data: {
            errorcode: "",
            msg: "付款成功！",
          },
        };
        resolve(res);
      },
      fail: function (e) {
        var res = {
          result: 1,
          data: {
            errorcode: "",
            msg: "付款失败！",
            data: JSON.stringify(e),
          },
        };

        console.error("米大师充值异常:", e);
        let o = {};
        o.g_money = params.money;
        o.paydata_scale = paydata.scale;
        let a = "";
        for (const i in o) {
          if (Object.hasOwnProperty.call(o, i)) {
            const n = o[i];
            if (i != "success" && i != "fail" && i != "complete") {
              a += i + ":" + n + "\n";
            }
          }
        }
        console.error("米大师支付参数:", a);
        resolve(res);
      },
    };
    console.log('payReqdata', payReqdata);
    wx.requestMidasPayment(payReqdata);
  });
  return result;
}

/** midas 扣款+发货
 * @env {环境配置}
 * @money {玩家传入的钱数}
 * @order_id {p8生成的订单id}
 * @mac {补单操作传1 发货接口传0}
 */
function midasNotify(params) {
  var notifyData = {
    env: params.env,
    money: params.money,
    offer_id: paydata.offerId,
    order_id: params.order_id,

    appid: sdkData.appid,
    openid: sdkData.device,
    site: sdkData.site,
    mac: params.mac ? params.mac : "0",
    scale: paydata.scale,
    zone_id: paydata.zoneId,
    b_site: gotoObj.b_site,
    pf: "android",
    // version: "2.0", // 米大师2.0版本
    version: sdkData.mdsVersion, // 米大师2.0版本
    time: parseInt(new Date().getTime() / 1e3),
  };

  var newStr = "";
  for (let e in notifyData) {
    newStr += "&" + e + "=" + notifyData[e] ? notifyData[e] : "";
  }
  newStr = newStr.substring(1);
  var sign = md5(`${sdkData.site}${newStr}${sdkData.key}`);
  notifyData.sign = sign;
  console.log("p8---> notifyData 扣款 ", notifyData);
  let result = new Promise((resolve, rejecte) => {
    // let url = "https://trecharge.play800.cn/midas/notify";
    // console.error("此处是测试url: ", url);
    let url = `${sdkData.rg_url}/midas/notify`;
    let method = "POST";
    let i = () => {
      var t = {
        result: 0,
        data: {
          errorcode: "0",
          msg: "付款成功！",
        },
      };
      resolve(t);
    };
    let f = (err) => {
      var t = {
        result: 1,
        data: {
          errorcode: "1",
          msg: JSON.stringify(err),
        },
      };
      resolve(t);
    };
    wxRequest(url, method, notifyData, i, f);
  });
  return result;
}

/**
 * @cp_order_id {cp订单号 做对账}
 * @money {金额}
 * @product_name {商品名}
 * @productid {商品id}
 * @roleid {角色id}
 * @rolename {角色名}
 * @serverid {服务器id}
 * @vip {玩家vip等级}
 * @level {玩家等级}
 * @ce {战斗力}
 * 下单接口 */
function madeOrder(params) {
  let result = new Promise((l, e) => {
    let newSite = sdkData.b_site ? sdkData.b_site : sdkData.site;
    let time = parseInt(new Date().getTime() / 1e3);
    var mdData = {
      cp_order_id: params.cp_order_id,
      money: params.money,
      product_name: params.product_name,
      productid: params.productid,
      roleid: params.roleid,
      rolename: params.rolename,
      serverid: params.serverid,
      level: params.level,
      ext: params.ext,

      aid: sdkData.aid,
      // aid: '916299157295613871', // 2
      // device_type: sdkData.device_type,
      udid: sdkData.device,
      uid: sdkData.uid,
      time: time,
      site: newSite,
      // site: "jstest_ios3",
      ip: "",
      test: params.test ? params.test : "0"
    };
    let noudf = newSignGetType_log(mdData);
    let sign = hex_md5(noudf);
    mdData.sign = sign;
    print("支付请求参数", mdData);
    // let url = `https://trecharge.play800.cn/h/pN/wx`;
    let url = `${sdkData.rg_url}/h/pN/wx`;
    console.log(url);
    let a = url + "?" + keyValueConnect(mdData);
    print("支付请求Url: ", a);
    let method = "GET";
    let seccess = (d) => {
      let res = {
        result: 0,
        data: d,
      };
      l(res);
    };
    let fail = (err) => {
      let res = {
        result: 1,
        data: err,
      };
      l(res);
    };
    wxRequest(url, method, mdData, seccess, fail);
  });
  return result;
}

P8SDK.pay = function (g) {
  console.log(g);
  if (P8SDK.showPayPage) {
    P8SDK.showPayPage()
    return
  }
  if (g.mdsVersion == "1.0") {
    sdkData.mdsVersion = "1.0";
  }
  console.info("调用P8支付接口");
  g.env = 0;
  console.error("sdk强制米大师支付使用正式环境");
  let e = new Promise((l, e) => {
    madeOrder(g).then((d) => {
      if (d.result != 0) {
        l({
          result: -1,
          msg: "下单异常:" + d.data,
        });
      }
      let result = d.data;
      if (!result) {
        l({
          result: -1,
          msg: "获取格式错误",
        });
      }
      result.data = result.data.data;
      console.info(" madeOrder 返回内容", JSON.stringify(result.data));
      var p8OrderId = result.data.orderid;
      p8OrderIdCX = result.data.orderid;
      let newOrder = {
        paytype: result.data.paytype,
        p8OrderId: result.data.orderid,
        env: g.env,
        money: g.money,
        cpOrder: g,
      }
      setItem("newOrder", JSON.stringify(newOrder));
      if (result.data.paytype == 5) {
        // 线下支付
        let e = {
          result: 0,
          data: {
            paytype: "5",
            url: result.data.url,
            order_id: p8OrderId,
          },
        };
        l(e);
      } else if (result.data.paytype == 13) {
        // 小程序支付
        fixOrder();
        // 正常的支付逻辑
        let midasReqData = {
          env: g.env,
          money: g.money,
          cpOrder: g,
          p8Order: p8OrderId,
        };
        midasPay(midasReqData).then((mdsRes) => {
          let notifyReqData = {
            env: 0, // g.env,
            money: g.money,
            order_id: p8OrderId,
            mac: "0",
          };
          // 付款成功后 要发货
          midasNotify(notifyReqData).then((notifyRes) => {
            mdsRes.data.paytype = "13";
            l(mdsRes);
            // 将订单存本地
            setItem("oldOrderInfo", JSON.stringify(notifyReqData));
          });
        });
      } else if (result.data.paytype == 16) {
        let e = p8OrderId;
        let t = g.roleid;
        let a = g.serverid;
        let i = g.productid;
        let n = g.money;
        let o = wx.getStorageSync('extAppid');
        let r = "pages/pay/pay";
        let s = {
          gotoPay_order: e,
          gotoPay_character: t,
          gotoPay_area: a,
          gotoPay_goods: i,
          gotoPay_price: n,
          gotoPay_site: sdkData.site,
        };
        P8SDK.gotoSystem(o, s, r);
      } else if (result.data.paytype == 17) {
        let e = `${sdkData.rg_url}/toPay`;
        let t = {
          pay_type: 17,
          order_id: p8OrderId,
        };
        let a = (t) => {
          // console.error("rrr1", t);
          t = dateOrRes(t);
          // console.error("rrr", t);
          if (t.result === 0 && t.data && t.data.url) {
            let e = t.data.url;
            console.log('---------sdkData', sdkData);
            // if (wx.previewImage) {
            //   wx.previewImage({
            //     urls: [e],
            //   });
            // } else if (wx.previewMedia) {
            //   wx.previewMedia({
            //     sources: [{
            //       url: e
            //     }],
            //   });
            // } else {
            //   if (cc && sdkData.blacklistCode == "0") {
            //     console.log('paytype17支付二维码');
            //     cc.ENGINE_VERSION[0] == '2' ? showMiniPraGrameCodeUrlTips(e) : showMiniPraGrameCodeUrlTipsNew(e);
            //   }
            // }

            if (cc && sdkData.blacklistCode == "0") {
              console.log('paytype17支付');
              cc.ENGINE_VERSION[0] == '2' ? showMiniPraGrameCodeUrlTips(e) : showMiniPraGrameCodeUrlTipsNew(e);
            }

          } else {
            console.error("加载异常", t);
          }
        };
        wxRequest(e, "get", t, a);
      } else if (result.data.paytype == 28) {
        let e = `${sdkData.rg_url}/toPay`;
        let t = {
          pay_type: 28,
          order_id: p8OrderId,
        };
        let a = (t) => {
          // console.error("rrr1", t);
          t = dateOrRes(t);
          // console.error("rrr", t);
          if (t.result === 0 && t.data && t.data.img) {
            let e = t.data.img;
            console.log('---------sdkData', sdkData);
            let img = e.replace(/[\r\n]/g, "")
            console.log('img', img);
            var base64Data = `data:image/jpeg;base64,${img}`;
            console.log('base64Data', base64Data);
            // if(wx.previewImage){
            //   wx.previewImage({
            //       urls: [base64Data],
            //     });
            // }else if(wx.previewMedia){
            //   wx.previewMedia({
            //     sources: [{
            //       url: base64Data
            //     }],
            //   });
            // }else{
            //   if (cc && sdkData.blacklistCode == "0") {
            //     console.log('截图二维码支付');
            //     cc.ENGINE_VERSION[0] == '2' ? showCodeUrlTips(base64Data) : showCodeUrlTipsNew(base64Data);
            //   }
            // }

            if (cc && sdkData.blacklistCode == "0") {
              console.log('截图二维码支付');
              cc.ENGINE_VERSION[0] == '2' ? showCodeUrlTips(base64Data) : showCodeUrlTipsNew(base64Data);
            }

          } else {
            console.error("加载28支付类型异常", t);
          }
        };
        wxRequest(e, "get", t, a);
      } else {
        var e = {
          result: 0,
          data: {
            errorcode: "-1",
            msg: "暂不支持支付 paytype： " + result.data.paytype,
            res: d,
          },
        };
        l(e);
      }
    });
  });
  return e;
};

function checkWxSdkPay(payInfo) {
  let result = new Promise((resolve, reject) => {
    let url = `${sdkData.platform_url}/adv/wxSdkPay`;
    // let url = `https://tcenter.play800.cn/adv/wxSdkPay`;
    let method = "GET";
    let data = {
      aid: sdkData.aid,
      uid: sdkData.uid,
      orderid: payInfo.orderid,
      money: payInfo.money,
      site: sdkData.site,
      time: parseInt(new Date().getTime() / 1e3),
    };
    ChangeUndefined(data);
    console.log('[付费上报开关传入的参数] >', JSON.stringify(data));
    let sign = newSignGetType_log(data);
    let signStr = hex_md5(sign);
    data.sign = signStr;
    let a = url + "?" + keyValueConnect(data);
    console.log('[付费上报开关请求的url] >', a);
    wxRequest(url, method, data, (res) => {
      console.log('[付费上报开关返回的数据] >', JSON.stringify(res.data));
      resolve(res.data);
    }, (err) => {
      console.log('[付费上报开关返回的错误] >', JSON.stringify(err));
      reject(err);
    });
  });

  return result;
}

P8SDK.wxdialog = function (d) {
  let e = new Promise((a, e) => {
    let t = parseInt(new Date().getTime() / 1e3);
    var i = md5(`${sdkData.key}WX${sdkData.site}WX${t}${t}`);
    let n = {
      uid: sdkData.uid,
      site: sdkData.site,
      aid: sdkData.aid,
      level: d.level,
      sign: i,
      time: t,
    };
    let o = `${sdkData.platform_url}/api/wxdialog`;
    let r = "GET";
    let s = (e) => {
      if (e.data.result == 0) {
        wx.showModal({
          title: "礼包福利",
          content: "下载并使用手机版游戏，即可享受:\n\n1.高价值手机版礼包\n2.沉浸式无干扰游戏体验\n\n限时福利，错过再等一年\n前往客服回复“礼包”领取手机版",
          showCancel: true,
          cancelText: "残忍拒绝",
          confirmText: "前往客服",
          confirmColor: "#999",
          success(e) {
            if (e.confirm) {
              var t = {
                result: 0,
                data: {
                  errorcode: "0",
                  msg: "处理成功",
                },
              };
            } else if (e.cancel) {
              var t = {
                result: 1,
                data: {
                  errorcode: "201",
                  msg: "用户点击取消",
                },
              };
            }
            a(t);
          },
        });
      } else {
        var t = {
          result: 1,
          data: {
            errorcode: "500",
            msg: e.data.data.msg,
          },
        };
        a(t);
      }
    };
    wxRequest(o, r, n, s);
  });
  return e;
};

function getDeviceCode() {
  let deviceCode = wx.getStorageSync('deviceCode');
  if (!deviceCode) {
    deviceCode = hex_md5(sdkData.openid + new Date().getTime() / 1e3);
    wx.setStorageSync('deviceCode', deviceCode);
    print(" 未有deviceCode生成一个新的： " + deviceCode);
  }
  sdkData.device_code = deviceCode;
}

function getDevice() {
  wx.getNetworkType({
    success: function (e) {
      sdkData.device_net = e.networkType;
    },
  });
  
  const deviceInfo = wx.getDeviceInfo()
  console.log('设备基础信息:', deviceInfo);
  sdkData.modeltype = deviceInfo.platform
  sdkData.platform = deviceInfo.platform
  sdkData.device_model = deviceInfo.model
  sdkData.device_version = deviceInfo.system
  sdkData.device_cpuType = deviceInfo.cpuType
  sdkData.device_memorySize = deviceInfo.memorySize
  sdkData.device_benchmarkLevel = deviceInfo.benchmarkLevel

  const windowInfo = wx.getWindowInfo()
  console.log('设备窗口信息:', windowInfo);
  sdkData.device_resolution = windowInfo.screenWidth + "*" + windowInfo.screenHeight;
  sdkData.device_orientation = windowInfo.screenHeight > windowInfo.screenWidth ? 'portrait' : 'landscape'

  const appBaseInfo = wx.getAppBaseInfo()
  console.log('微信APP基础信息:', appBaseInfo);
  sdkData.gameversion = appBaseInfo.version;



  // 生成用户临时唯一标识
  // return

  let client_id = wx.getStorageSync('client_id');
  if (!client_id) {
    client_id = generateTempUserId(deviceInfo, windowInfo);
    wx.setStorageSync('client_id', client_id);
  }
  sdkData.client_id = client_id;
  console.log('[ client_id ] >', client_id);

  // SDK初始化打点
  let dot_time = new Date().getTime();
  wxDotLog(100, 'SDK初始化', '', dot_time)
}

function getSdkLog() {
  console.warn(`【P8SDK更新通知 v${P8SDK_VERSION}版本】：1、兼容处理获取getDeviceBenchmarkInfo`);
}

function generateTempUserId(e, f) {
  try {
    // Generate random component (8 characters)
    const randomPart = Math.random().toString(36).substring(2, 10);

    // Get timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Get basic device/user info
    const systemInfo = e;

    const windowInfo = f;

    // Extract relevant user info
    const platform = systemInfo.platform || 'unknown';
    const model = systemInfo.model || 'unknown';
    const system = systemInfo.system || 'unknown';
    const resolution = `${windowInfo.screenWidth}x${windowInfo.screenHeight}`;

    // Create info hash using existing md5 function
    const userInfoStr = `${platform}-${model}-${system}-${resolution}-${timestamp}`;
    console.log('[ userInfoStr ] >', userInfoStr)
    const userInfoHash = hex_md5(userInfoStr).substring(0, 10);

    // Combine all parts
    const tempUserId = `${randomPart}${userInfoHash}${timestamp}`;

    return tempUserId;
  } catch (error) {
    // 生成备用ID
    return `${Math.random().toString(36).substring(2)}_${Date.now()}`;
  }
}

// 活动基本信息
P8SDK.activeInfo = function (d) {
  let e = new Promise((a, e) => {
    let t = parseInt(new Date().getTime() / 1e3);
    let n = {
      site: sdkData.site,
      uid: sdkData.uid,
      roleid: d.roleid,
      appid: sdkData.appid,
      type: d.type,
      time: t,
    };
    ChangeUndefined(n);
    var k = SignGetForCenter(n);
    var i = hex_md5(k);
    n.sign = i;
    // let o = `${sdkData.platform_url}/cash/activityInfo`;
    let o = `https://trecharge.play800.cn/cash/activityInfo`;
    let r = "GET";
    let s = (e) => {
      if (e.data.result == 0) {
        var t = {
          result: 0,
          data: {
            data: e.data.data
          },
        };
        a(t);
      } else {
        var t = {
          result: 1,
          data: {
            errorcode: "1",
            msg: "请求失败",
          },
        };
        a(t);
      }
    };
    wxRequest(o, r, n, s);
  });
  return e;
}

win.P8SDK = P8SDK;



// 以下是上报逻辑
var P8LogSDK = {};
var p8QuickApp = false; //  微信小游戏为false 其余为true
// 函数名称更改(sdk函数名与上报函数名相同冲突)
// 原log加密函数newSignGetType改为newSignGetType_log;
// 原md5加密函数改为log_md5;

// 复写方法 行为上报为P8LogSDK 复写给P8SDK
P8SDK.onActiveFunc = function (g) {
  return P8LogSDK.onActiveFunc(g);
}

P8SDK.pushLoginData = function (s) {
  return P8LogSDK.pushLoginData(s);
}

P8SDK.wxVideoAutoLog = function (arg) {
  return P8LogSDK.wxVideoAutoLog(arg);
}

P8SDK.wxVideoLog = function (arg) {
  return P8LogSDK.wxVideoLog(arg);
}

P8SDK.signLog = function (o) {
  return P8LogSDK.signLog(o);
}

P8SDK.upGradeRecord = function (s) {
  return P8LogSDK.upGradeRecord(s);
}

P8SDK.tutorialFinish = function (o) {
  return P8LogSDK.tutorialFinish(o);
}

P8SDK.levelUpGrade = function (o) {
  return P8LogSDK.levelUpGrade(o);
}

P8SDK.levelWaveUpGrade = function (o) {
  return P8LogSDK.levelWaveUpGrade(o);
}

P8SDK.navigateToMiniProGramApi = function (o) {
  return P8LogSDK.navigateToMiniProGramApi(o);
}

// SDK激活上报
P8LogSDK.onActiveFunc = function (g) {
  let e = new Promise((r, e) => {
    let t = parseInt(new Date().getTime() / 1e3);
    let i = {
      site: sdkData.site,
      aid: sdkData.aid,
      time: t,
      device: sdkData.device,
      ip: sdkData.ip,
      mac: sdkData.mac,
      modeltype: sdkData.modeltype,
      gameversion: sdkData.gameversion,
      device_model: sdkData.device_model,
      device_resolution: sdkData.device_resolution,
      device_version: sdkData.device_version,
      device_net: sdkData.device_net,
    };
    ChangeUndefined(i);
    let n = newSignGetType_log(i);
    console.log("排序", n);
    var d = hex_md5(n);
    i.sign = d;
    let a = `${sdkData.data_url}/log/activate`;
    print("  激活上报请求服务器参数: " + JSON.stringify(i));
    let o = a + "?" + keyValueConnect(i);
    print("激活上报Url: ", o);
    HttpRequest(o, "GET", i, (e) => {
      print(" 激活返回的数据 res： " + JSON.stringify(e));
      let t = dateOrRes(e);
      if (t.result) {
        print("激活数据上报失败 ");
        var i = {
          result: "1",
          data: {
            errorcode: t.data.errorcode,
            msg: t.data.msg
          }
        };
      } else {
        print("激活数据上报成功 ");
        var i = {
          result: "0"
        };

      }
      r(i);
      debounce(onActiveFuncNew, 1000)(g);
    });
  });
  return e;
};

// 登录上报
P8LogSDK.pushLoginData = function (s) {
  console.warn(" =============== 开始登录上报: 传入的数据是 " + JSON.stringify(s));
  wxDotLog(400, '进入登录行为上报流程', JSON.stringify(s), new Date().getTime())
  let e = new Promise((r, e) => {
    let t = parseInt(new Date().getTime() / 1e3);
    let i = {
      aid: sdkData.aid,
      uid: sdkData.uid,
      sid: s.sid || sdkData.sid || '1',
      roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
      rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
      level: s.level || sdkData.level || '1',
      vip: s.vip || sdkData.vip || '1',
      ip: s.ip || sdkData.ip,
      onlinetime: s.onlinetime,
      device: sdkData.device,
      modeltype: sdkData.modeltype,
      device_model: sdkData.device_model,
      device_resolution: sdkData.device_resolution,
      device_version: sdkData.device_version,
      device_net: sdkData.device_net,
      oaid: s.oaid,
      site: sdkData.site,
      time: t,
      version: P8SDK_VERSION,
      game_type: 'mini'
    };
    sdkData.sid = s.sid;
    sdkData.roleid = s.roleid;
    sdkData.rolename = s.rolename;
    sdkData.level = s.level;
    sdkData.vip = s.vip;
    setheartbeat(i);
    ChangeUndefined(i);
    let n = newSignGetType_log(i);
    console.log('nnn', sdkData);
    console.log('nnn', n);
    var d = hex_md5(n);
    i.sign = d;
    let a = `${sdkData.data_url}/log/login`;
    console.warn(" 登录上报请求服务器参数: ", i);

    let o = a + "?" + keyValueConnect(i);
    console.warn("登录上报请求Url: ", o);
    HttpRequest(o, "get", i, (e) => {
      let t = dateOrRes(e);
      console.warn("登录返回的数据 是什么 " + JSON.stringify(t));
      if (t.result) {
        print("登录数据上报失败 ");
        wxDotLog(402, '800登录行为上报失败', JSON.stringify(t), new Date().getTime())
        var i = {
          result: "1",
          data: {
            errorcode: t.errorcode,
            msg: t.msg
          }
        };
      } else {
        print("登录数据上报成功 ");
        wxDotLog(401, '800登录行为上报成功', JSON.stringify(t), new Date().getTime())
        var i = {
          result: "0",
          data: {
            errorcode: 200,
            msg: "登录数据上报成功"
          }
        };
      }
      r(i);
      debounce(pushLoginDataNew, 1000)(s);
    });
  });
  return e;
};

// 广告自动上报
P8LogSDK.wxVideoAutoLog = function (arg) {
  console.log(" =============== 开始微信广告自动上报逻辑: 数据是 " + JSON.stringify(arg));
  let e = new Promise((i, e) => {
    let t = parseInt(new Date().getTime() / 1e3);
    let data = {
      site: sdkData.site,
      aid: sdkData.aid,
      time: t,
      device_type: sdkData.platform,

      sid: arg.sid || sdkData.sid || "1",
      uid: sdkData.uid,
      device: sdkData.device,
      roleid: arg.roleid || sdkData.roleid || sdkData.uid || "1",
      rolename: arg.rolename || sdkData.rolename || sdkData.uid || "1",
      level: arg.level || sdkData.level || "1",
      game_type: 'mini',
      ad_slot: arg.ad_slot || sdkData.ad_slot || "激励视频", // 广告位创建的名称 在微信后台申请的广告位的名称
      ad_unit_id: arg.ad_unit_id || sdkData.ad_unit_id || "1", //广告位id
      type: arg.type, // 'BannerAd' 横幅 'RewardedVideoAd' 激励视频 'InterstitialAd' 插屏广告 'CustomAd' 模板广告
      status: arg.status, // 点击传入 0 观看成功传入 1 banner广告点击就算成功
      ad_positon: arg.ad_positon || sdkData.ad_positon || "", // 广告展示位置
      level_wave: arg.level_wave || sdkData.level_wave || "", //关卡波次
      a_b_test: arg.a_b_test || sdkData.a_b_test || "", //a/b测试
    };
    ChangeUndefined(data);
    let n = newSignGetType_log(data);
    var r = hex_md5(n);
    data.sign = r;
    let url = `${sdkData.data_url}/log/wxRewardedAd`;
    let a = url + "?" + keyValueConnect(data);
    HttpRequest(a, "get", data, (e) => {
      let t = dateOrRes(e);
      if (t.result) {
        var o = {
          result: "1",
          data: {
            errorcode: t.data.errorcode,
            msg: t.data.msg
          }
        };
      } else {
        var o = {
          result: "0"
        };
      }
      i(o);
      wxVideoLogNew(data);
    });
  });
  return e;
};



// 广告上报
P8LogSDK.wxVideoLog = function (arg) {
  console.warn(" 此方法不再使用，观看视频现已接入自动调用上报，请看最新文档广告接入");
  // console.log(" =============== 开始微信广告上报: 数据是 " + JSON.stringify(arg));
  return e = new Promise((i, e) => {
    var o = {
      result: "0",
      data: {
        msg: '此方法不再使用，观看视频现已接入自动调用上报，请看最新文档广告接入'
      }
    };
    i(o);
  })
  let e = new Promise((i, e) => {
    let arr = ["ad_slot", "ad_unit_id", "type", "status"];
    for (let m = 0; m < arr.length; m++) {
      let key = arr[m];
      if (!arg[key]) {
        let res = {
          code: -1,
          res: `${key}必须要传`
        };
        i(res);
      }
    }
    let t = parseInt(new Date().getTime() / 1e3);
    let data = {
      site: sdkData.site,
      aid: sdkData.aid,
      time: t,
      device_type: sdkData.platform,

      sid: arg.sid || sdkData.sid || "1",
      uid: sdkData.uid,
      device: sdkData.device,
      roleid: arg.roleid || sdkData.roleid || "1",
      rolename: arg.rolename || sdkData.rolename || "1",
      level: arg.level || sdkData.level || "1",
      game_type: 'mini',
      ad_slot: arg.ad_slot, // 广告位创建的名称 在微信后台申请的广告位的名称
      ad_unit_id: arg.ad_unit_id, //广告位id
      type: arg.type, // 'BannerAd' 横幅 'RewardedVideoAd' 激励视频 'InterstitialAd' 插屏广告 'CustomAd' 模板广告
      status: arg.status // 点击传入 0 观看成功传入 1 banner广告点击就算成功
    };
    ChangeUndefined(data);
    let n = newSignGetType_log(data);
    var r = hex_md5(n);
    data.sign = r;
    let url = `${sdkData.data_url}/log/wxRewardedAd`;
    console.log(" 微信广告上报参数: " + JSON.stringify(data));
    let a = url + "?" + keyValueConnect(data);
    console.log("newUrl: ", a);
    HttpRequest(a, "get", data, (e) => {
      console.log(" 广告返回的数据 res： " + JSON.stringify(e));
      let t = dateOrRes(e);
      if (t.result) {
        var o = {
          result: "1",
          data: {
            errorcode: t.data.errorcode,
            msg: t.data.msg
          }
        };
      } else {
        var o = {
          result: "0"
        };
      }
      i(o);
      wxVideoLogNew(arg);
    });
  });
  return e;
};

let retrySignLogCount = 0;
// 新创角色上报
P8LogSDK.signLog = function (o) {
  print(" =============== 开始创角上报: 传入的数据是 " + JSON.stringify(o));
  wxDotLog(500, '进入创角行为上报流程', JSON.stringify(o), new Date().getTime())
  let e = new Promise((r, e) => {
    ChangeUndefined(o);
    let s = o;
    if (!o) {
      s = {
        sid: "sid",
        uid: sdkData.uid,
        roleid: "roleid",
        rolename: "rolename",
        device: "device",
        modeltype: "modeltype",
        mac: "mac",
        level: "level",
        gameversion: "gameversion",
        ip: "ip",
        device_model: "device_model",
        device_resolution: "device_resolution",
        device_version: "device_version",
        device_net: "device_net"
      };
    } else {
      s = {
        sid: o.sid || sdkData.sid || '1',
        roleid: o.roleid || sdkData.roleid || sdkData.uid || '1',
        rolename: o.rolename || sdkData.rolename || sdkData.uid || '1',
        level: o.level || sdkData.level || '1',
        gameversion: sdkData.gameversion,
        uid: sdkData.uid,
        device: sdkData.device,
        modeltype: sdkData.modeltype,
        mac: sdkData.mac,
        ip: sdkData.ip,
        device_model: sdkData.device_model,
        device_resolution: sdkData.device_resolution,
        device_version: sdkData.device_version,
        device_net: sdkData.device_net,
      }
    }
    s.game_type = 'mini';
    if (!sdkData.uid) {
      if (retrySignLogCount < 10) {
        console.log("sdkData.uid,1秒后重试...重试次数" + retrySignLogCount);
        const retryTimer = setTimeout(() => {
          retrySignLogCount++;
          P8LogSDK.signLog(o).then((result) => {
            clearTimeout(retryTimer); // 接口调用成功时清理定时器
            r(result); // 调用原来的成功回调
          }).catch(e);
        }, 1000);
        return;
      }
    }
    let t = parseInt(new Date().getTime() / 1e3);
    s.site = sdkData.site;
    s.time = t;
    s.aid = sdkData.aid;
    ChangeUndefined(s);
    let i = newSignGetType_log(s);
    var n = hex_md5(i);
    s.sign = n;
    let d = `${sdkData.data_url}/log/role`;
    print("  创角上报请求服务器参数: " + JSON.stringify(s));
    let a = d + "?" + keyValueConnect(s);
    print("创角上报请求Url: ", a);
    HttpRequest(a, "GET", s, (e) => {
      let t = dateOrRes(e);
      print("创角返回的数据 是什么 " + JSON.stringify(t));
      if (t.result == 0) {
        print(sdkData.uid ? "创角数据上报成功 " : "创角数据上报成功,但是获取uid失败了,上报了没有uid的数据");
        wxDotLog(501, '800创角行为上报成功', new Date().getTime())
        var i = {
          result: sdkData.uid ? 0 : 1,
          data: {
            errorcode: sdkData.uid ? 0 : 200,
            msg: sdkData.uid ? "创角数据上报成功" : "创角上报了,获取uid失败了,上报了没有uid的数据"
          }
        };
      } else {
        print("创角数据上报失败");
        wxDotLog(502, '800创角行为上报失败', new Date().getTime())
        var i = {
          result: 1,
          data: {
            errorcode: 200,
            msg: "创角数据上报失败"
          }
        };
      }
      r(i);
      signLogNew(s);
      txSdkHeartBeat('CREATE_ROLE', {
        ...o,
        name: o.rolename,
      })
    });
  });
  return e;
};


// 升级上报
P8LogSDK.upGradeRecord = function (s) {
  print(" =============== 开始升级上报: 传入的数据是 " + JSON.stringify(s));
  let e = new Promise((r, e) => {
    let t = parseInt(new Date().getTime() / 1e3);
    let i = {
      aid: sdkData.aid,
      uid: sdkData.uid,
      device: sdkData.device,
      modeltype: sdkData.modeltype,
      sid: s.sid || sdkData.sid || '1',
      roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
      rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
      level: s.level || sdkData.level || '1',
      vip: s.vip || sdkData.vip || '1',
      ip: sdkData.ip,
      onlinetime: s.onlinetime,
      device_model: sdkData.device_model,
      device_resolution: sdkData.device_resolution,
      device_version: sdkData.device_version,
      device_net: sdkData.device_net,
      oaid: s.oaid,
      site: sdkData.site,
      time: t,
      version: P8SDK_VERSION
    };
    sdkData.sid = s.sid;
    sdkData.roleid = s.roleid;
    sdkData.rolename = s.rolename;
    sdkData.level = s.level;
    sdkData.vip = s.vip;
    ChangeUndefined(i);
    let n = newSignGetType_log(i);
    var d = hex_md5(n);
    i.sign = d;
    let a = `${sdkData.data_url}/log/level`;
    print("升级上报请求服务器的参数: " + JSON.stringify(i));
    let o = a + "?" + keyValueConnect(i);
    print("升级上报请求Url: ", o);
    HttpRequest(o, "GET", i, (e) => {
      let t = dateOrRes(e);
      print("升级数据上报返回的数据 是什么 " + JSON.stringify(t));
      if (t.result) {
        var res = {
          result: "1",
          data: {
            errorcode: t.errorcode,
            msg: t.msg
          }
        };
      } else {
        var res = {
          result: "0",
          data: {
            errorcode: 200,
            msg: "升级数据上报成功"
          }
        };
      }
      r(res);
      upGradeRecordNew(i);
    });
    txSdkHeartBeat('UPDATE_LEVEL', s)
  });
  return e;
};

// 完成新手指引上报
P8LogSDK.tutorialFinish = function (e) {
  onTuTorialFinishNew(e)
  txSdkHeartBeat('TUTORIAL_FINISH', e)
}

// v2.0.23 新SDK模版完成新手指引上报
function onTuTorialFinishNew(e = {}) {
  const data = {
    event_name: 'guide_flow',
    event_time: parseInt(new Date().getTime() / 1e3),
    data: getCommonHeartBeatData(e),
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  }
  ChangeUndefined(data.data)

  let a = `${sdkData.dsj_url}/sdk/upload`
  print('  新SDK模版完成新手指引上报请求服务器参数: ' + JSON.stringify(data))
  HttpRequestJson(a, 'POST', data, (e) => {
    let response = dateOrRes(e);
    print(' 新SDK模版完成新手指引上报返回的数据 res： ' + JSON.stringify(response))
  })
}

// v1.0 新SDK模版激活上报
function onActiveFuncNew(g = "{}") {
  if (hasActivated) {
    print('新SDK模版已经激活上报过,不再重复上报');
    return;
  }

  let t = parseInt(new Date().getTime() / 1e3);
  let i = {
    aid: sdkData.aid,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    username: g.username || sdkData.account,
    ip: sdkData.ip,
    mac: sdkData.mac,
    gameversion: sdkData.gameversion,
    device_model: sdkData.device_model,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    device_code: sdkData.device_code,
    oaid: g.oaid,
    idfv: g.idfv,
    ext: g.ext,
    media_params: start_param,
    game_id: sdkData.game_id,
    site: sdkData.site,
    is_model: 1,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    }),
    source_type: 3,
    source_from: ""
  };

  if (queryData.code || queryData.aid) {
    i.source_type = 1
    i.source_from = ""
  }

  let launchData = wx.getLaunchOptionsSync();
  let re = launchData.referrerInfo
  let q = launchData.query
  if (re.appId || q.appid) {
    i.source_type = 2
    i.source_from = re.appId || q.appid
  }

  ChangeUndefined(i);
  let activeData = {
    event_name: "activate",
    event_time: t,
    data: i,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };
  // let a = `${sdkData.data_url}/sdk/upload`;
  let a = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版激活上报请求服务器参数: " + JSON.stringify(activeData));
  HttpRequestJson(a, "POST", activeData, (e) => {
    let data = dateOrRes(e);
    if (data && data.ret == 0) {
      hasActivated = true;
    }
    print(" 新SDK模版激活返回的数据 res： " + JSON.stringify(data));
  });
};

// v1.0 新SDK模版登录上报
function pushLoginDataNew(s = "{}") {
  if (haspushLogin) {
    print('新SDK模版已经登录上报过,不再重复上报');
    return;
  }

  let t = parseInt(new Date().getTime() / 1e3);
  let i = {
    aid: sdkData.aid,
    uid: sdkData.uid,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    username: s.username || sdkData.account,
    sid: s.sid || sdkData.sid || '1',
    roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
    rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
    level: s.level || sdkData.level || '1',
    vip: s.vip || sdkData.vip || '1',
    ip: s.ip || sdkData.ip,
    device_model: sdkData.device_model,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    oaid: s.oaid,
    idfv: s.idfv,
    game_type: 'mini',
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    is_model: 1,
    site: sdkData.site,
    version: P8SDK_VERSION,
    onlinetime: s.onlinetime,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    }),
    source_type: 3,
    source_from: ""
  };

  console.log('[ queryData ] >', queryData)
  if (queryData.code || queryData.aid) {
    i.source_type = 1
    i.source_from = ""
  }

  let launchData = wx.getLaunchOptionsSync();
  console.log('[ launchData ] >', JSON.stringify(launchData))
  let re = launchData.referrerInfo
  let q = launchData.query
  if (re.appId || q.appid) {
    i.source_type = 2
    i.source_from = re.appId || q.appid
  }

  ChangeUndefined(i);
  let loginData = {
    event_name: "login",
    event_time: t,
    data: i,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };

  let a = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版登录上报请求服务器参数: " + JSON.stringify(loginData));
  HttpRequestJson(a, "POST", loginData, (e) => {
    let data = dateOrRes(e);
    if (data && data.ret == 0) {
      haspushLogin = true;
      wxDotLog(411, '大数据登录行为上报成功', JSON.stringify(data), new Date().getTime())
    } else {
      wxDotLog(412, '大数据登录行为上报失败', JSON.stringify(data), new Date().getTime())
    }
    print(" 新SDK模版登录返回的数据 res： " + JSON.stringify(data));
  });
}

// v1.0 新SDK模版充值上报
function incomeLogNew(a = "{}") {
  let o = parseInt(new Date().getTime() / 1e3);
  let t = {
    uid: sdkData.uid,
    site: sdkData.site,
    version: P8SDK_VERSION,
    order_id: a.order_id,
    aid: sdkData.aid,
    roleid: a.roleid,
    rolename: a.rolename,
    sid: a.sid,
    money: a.income_money,
    device: sdkData.device,
    mac: sdkData.mac,
    device_type: sdkData.modeltype,
    username: a.username || sdkData.account,
    device_model: sdkData.device_model,
    vip: a.vip,
    currency_type: a.income_currency,
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    is_model: 1,
    key: sdkData.key,
    level: a.level,
    ip: a.ip,
    income_channel: a.income_channel,
    income_gold: a.income_gold,
    own_gold: a.own_gold,
    income_status: a.income_status,
    p8_order_id: a.p8_order_id,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    })
  };
  ChangeUndefined(t);
  let incomeData = {
    event_name: "user_pay",
    event_time: o,
    data: t,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };
  let d = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版充值上报请求服务器参数: " + JSON.stringify(incomeData));
  HttpRequestJson(d, "POST", incomeData, (e) => {
    let data = dateOrRes(e);
    print(" 新SDK模版充值返回的数据 res： " + JSON.stringify(data));
  });
}

// v1.0 新SDK模版创角上报
function signLogNew(o = "{}") {
  let t = parseInt(new Date().getTime() / 1e3);
  let s = {
    aid: sdkData.aid,
    uid: sdkData.uid,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    username: o.username || sdkData.account,
    sid: o.sid || sdkData.sid || '1',
    roleid: o.roleid || sdkData.roleid || sdkData.uid || '1',
    rolename: o.rolename || sdkData.rolename || sdkData.uid || '1',
    level: o.level || sdkData.level || '1',
    vip: o.vip || sdkData.vip,
    ip: sdkData.ip,
    device_model: sdkData.device_model,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    oaid: o.oaid,
    idfv: o.idfv,
    game_type: 'mini',
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    is_model: 1,
    gameversion: sdkData.gameversion,
    mac: sdkData.mac,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    })
  }
  ChangeUndefined(s);
  let signLogData = {
    event_name: "role_create",
    event_time: t,
    data: s,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };
  let d = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版创角上报请求服务器参数: " + JSON.stringify(signLogData));
  HttpRequestJson(d, "POST", signLogData, (e) => {
    let data = dateOrRes(e);
    if (data && data.ret == 0) {
      wxDotLog(511, '大数据创角行为上报成功', JSON.stringify(data), new Date().getTime())
    } else {
      wxDotLog(512, '大数据创角行为上报失败', JSON.stringify(data), new Date().getTime())
    }
    print(" 新SDK模版创角返回的数据 res： " + JSON.stringify(data));
  });
}

let lastVideoReportTime = 0; // 添加静态变量存储上一次上报时间

// v1.0 新SDK模版广告上报
function wxVideoLogNew(arg = "{}") {
  let t = parseInt(new Date().getTime() / 1e3);

  // 添加时间戳检查
  if (t === lastVideoReportTime) {
    print("防止重复调用：当前时间戳与上次相同");
    return;
  }
  lastVideoReportTime = t; // 更新最后上报时间

  let nowTime = new Date().getTime();
  let endTime = nowTime - ad_show_time;
  let data = {
    site: sdkData.site,
    aid: sdkData.aid,
    sid: arg.sid,
    uid: sdkData.uid,
    device_type: sdkData.platform,
    device: sdkData.device,
    ip: sdkData.ip,
    roleid: arg.roleid,
    rolename: arg.rolename,
    level: arg.level,
    game_type: 'mini',
    ad_slot: arg.ad_slot || sdkData.ad_slot || "激励视频", // 广告位创建的名称 在微信后台申请的广告位的名称
    ad_unit_id: arg.ad_unit_id || sdkData.ad_unit_id || "1", //广告位id
    ad_status: arg.status, // 点击传入 0 观看成功传入 1 banner广告点击就算成功
    ad_type: arg.type, // 'BannerAd' 横幅 'RewardedVideoAd' 激励视频 'InterstitialAd' 插屏广告 'CustomAd' 模板广告
    ad_positon: arg.ad_positon || sdkData.ad_positon || "", // 广告展示位置
    level_wave: arg.level_wave || sdkData.level_wave || "", //关卡波次
    a_b_test: arg.a_b_test || sdkData.a_b_test || "", //a/b测试
    username: arg.username || sdkData.account,
    device_model: sdkData.device_model,
    ad_show_time: arg.status == 0 ? 0 : Math.floor((endTime) / 1000),
    vip: arg.vip,
    ad_bid: "1",
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    is_model: 1,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    })
  };
  ChangeUndefined(data);
  let wxVideoLog = {
    event_name: "ad_show",
    event_time: t,
    data,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };
  let d = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版广告上报请求服务器参数: " + JSON.stringify(wxVideoLog));
  HttpRequestJson(d, "POST", wxVideoLog, (e) => {
    let data = dateOrRes(e);
    print(" 新SDK模版广告返回的数据 res： " + JSON.stringify(data));
  });
}

function upGradeRecordNew(s = "{}") {
  let t = parseInt(new Date().getTime() / 1e3);
  let i = {
    site: sdkData.site,
    aid: sdkData.aid,
    sid: s.sid || sdkData.sid || '1',
    uid: sdkData.uid,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    ip: sdkData.ip,
    roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
    rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
    level: s.level || sdkData.level || '1',
    username: s.username || sdkData.account,
    device_model: sdkData.device_model,
    vip: s.vip || sdkData.vip || '1',
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    onlinetime: s.onlinetime,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    oaid: s.oaid,
    time: t,
    game_type: 'mini',
    is_model: 1,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    })
  };
  ChangeUndefined(i);
  let upgradeData = {
    event_name: "role_upgrade",
    event_time: t,
    data: i,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };
  let d = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版角色升级上报请求服务器参数: " + JSON.stringify(upgradeData));
  HttpRequestJson(d, "POST", upgradeData, (e) => {
    let data = dateOrRes(e);
    print(" 新SDK模版角色升级返回的数据 res： " + JSON.stringify(data));
  });
}

P8LogSDK.levelUpGrade = function (s = "{}") {
  let t = parseInt(new Date().getTime() / 1e3);
  let i = {
    site: sdkData.site,
    aid: sdkData.aid,
    sid: s.sid || sdkData.sid || '1',
    uid: sdkData.uid,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    ip: sdkData.ip,
    roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
    rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
    username: s.username || sdkData.account,
    device_model: sdkData.device_model,
    vip: s.vip || sdkData.vip || '1',
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    time: t,
    game_type: 'mini',
    is_model: 1,
    level: s.level,
    level_status: s.level_status,
    a_b_test: s.a_b_test,
    stage_clear: s.stage_clear,
    formation: s.formation,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    })
  };
  sdkData.sid = s.sid;
  sdkData.roleid = s.roleid;
  sdkData.rolename = s.rolename;
  sdkData.level = s.level;
  sdkData.vip = s.vip;
  sdkData.a_b_test = s.a_b_test;
  sdkData.stage_clear = s.stage_clear;
  sdkData.formation = s.formation;
  ChangeUndefined(i);
  let upgradeData = {
    event_name: "level_upgrade",
    event_time: t,
    data: i,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };
  let d = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版关卡进出上报请求服务器参数: " + JSON.stringify(upgradeData));
  HttpRequestJson(d, "POST", upgradeData, (e) => {
    let data = dateOrRes(e);
    print(" 新SDK模版关卡进出返回的数据 res： " + JSON.stringify(data));
  });

}

P8LogSDK.levelWaveUpGrade = function (s = "{}") {
  let t = parseInt(new Date().getTime() / 1e3);
  let i = {
    site: sdkData.site,
    aid: sdkData.aid,
    sid: s.sid || sdkData.sid || '1',
    uid: sdkData.uid,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    ip: sdkData.ip,
    roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
    rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
    username: s.username || sdkData.account,
    device_model: sdkData.device_model,
    vip: s.vip || sdkData.vip || '1',
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    time: t,
    game_type: 'mini',
    is_model: 1,
    level: s.level,
    level_status: s.level_status,
    level_wave: s.level_wave,
    level_wave_status: s.level_wave_status,
    a_b_test: s.a_b_test,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    })
  };
  sdkData.sid = s.sid;
  sdkData.roleid = s.roleid;
  sdkData.rolename = s.rolename;
  sdkData.level = s.level;
  sdkData.vip = s.vip;
  sdkData.a_b_test = s.a_b_test;
  sdkData.level_wave = s.level_wave;
  sdkData.level_wave_status = s.level_wave_status;
  ChangeUndefined(i);
  let upgradeData = {
    event_name: "level_wave_upgrade",
    event_time: t,
    data: i,
    sdk_ext: {
      sdk_version: P8SDK_VERSION,
      sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
    }
  };
  let d = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版关卡波次上报请求服务器参数: " + JSON.stringify(upgradeData));
  HttpRequestJson(d, "POST", upgradeData, (e) => {
    let data = dateOrRes(e);
    print(" 新SDK模版关卡波次返回的数据 res： " + JSON.stringify(data));
  });

}

P8LogSDK.navigateToMiniProGramApi = function (s = "{}") {
  let t = parseInt(new Date().getTime() / 1e3);
  let i = {
    site: sdkData.site,
    aid: sdkData.aid,
    uid: sdkData.uid,
    device: sdkData.device,
    device_type: sdkData.modeltype,
    username: s.username || sdkData.account,
    sid: s.sid || sdkData.sid || '1',
    roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
    rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
    level: s.level || sdkData.level || '1',
    vip: s.vip || sdkData.vip || '1',
    ip: sdkData.ip,
    device_model: sdkData.device_model,
    device_resolution: sdkData.device_resolution,
    device_version: sdkData.device_version,
    device_net: sdkData.device_net,
    game_type: 'mini',
    media_params: start_param,
    device_code: sdkData.device_code,
    game_id: sdkData.game_id,
    time: t,
    is_model: 1,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`,
    xyx_params: JSON.stringify({
      scene: sdkData.scene_id,
      appid: sdkData.appid
    }),
    p8clickid: s.P8clickid,
    appid: sdkData.appid,
    navigate_app_id: s.appId,
  };
  ChangeUndefined(i);
  let upgradeData = {
    event_name: "navigate_to_minprogram",
    event_time: t,
    data: i,
    sdk_version: P8SDK_VERSION,
    sdk_name: SDKTYPE == 1 ? `P8-小游戏-p8sdk-wechat-${P8SDK_VERSION}` : `P8-小游戏-p8sdk-wechat-iaa-${P8SDK_VERSION}`
  };
  let d = `${sdkData.dsj_url}/sdk/upload`;
  print("  新SDK模版跳转小程序上报请求服务器参数: " + JSON.stringify(upgradeData));
  HttpRequestJson(d, "POST", upgradeData, (e) => {
    let data = dateOrRes(e);
    print(" 新SDK模版跳转小程序返回的数据 res： " + JSON.stringify(data));
  });

}


/* 用户注册上报 研发iaa */
P8SDK.RegUserIaa = function (data = "{}") {
  let result = new Promise((resolve, reject) => {
    let param = {
      site: sdkData.site,
      openid: sdkData.device,
      ip: sdkData.ip,
    }

    if (data.version) {
      param.version = data.version;
    }

    let signParms = {
      site: sdkData.site,
      openid: sdkData.device,
      ip: sdkData.ip,
    }

    ChangeUndefined(param);
    ChangeUndefined(signParms);
    let n = newSignGetTypeNoSiteHead_log(signParms);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();
    let a = `${sdkData.yanfa_url}/common/iaa/reg_user`;
    print("用户注册上报服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);
    print("用户注册上报请求Url: ", o);
    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      print("用户注册上报返回的数据 是什么 " + JSON.stringify(t));
      if (t.code == 2000) {
        var res = {
          result: "0",
          data: {
            errorcode: 200,
            msg: "用户注册上报成功"
          }
        };
      } else {
        var res = {
          result: "1",
          data: {
            errorcode: t.code,
            msg: t.message
          }
        };
      }
      resolve(res);
    });
  })
  return result;
}

/* 关卡日志上报 研发iaa */
P8SDK.passInfoIaa = function (data = "{}") {
  let result = new Promise((resolve, reject) => {
    let param = {
      site: sdkData.site,
      openid: sdkData.device,
      ip: sdkData.ip,
      passid: data.pass_id,
      pass_status: data.pass_status,
      passtime: data.pass_time,
      version: data.version,
    }
    let signParms = {
      site: sdkData.site,
      openid: sdkData.device,
      ip: sdkData.ip,
      passid: data.pass_id,
      pass_status: data.pass_status,
      passtime: data.pass_time,
      version: data.version,

    }
    if (data.pass_seq) {
      param.passseq = data.pass_seq;
    }

    ChangeUndefined(param);
    ChangeUndefined(signParms);
    let n = newSignGetTypeNoSiteHead_log(signParms);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/passinfo`;
    print("关卡日志上报服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);
    print("关卡日志上报请求Url: ", o);
    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      print("关卡日志上报返回的数据 是什么 " + JSON.stringify(t));
      if (t.code == 2000) {
        var res = {
          result: "0",
          data: {
            errorcode: 200,
            msg: "关卡日志上报成功"
          }
        };
      } else {
        var res = {
          result: "1",
          data: {
            errorcode: t.code,
            msg: t.message
          }
        };
      }
      resolve(res);
    })
  })
  return result;
}

/* 心跳上报 研发cp */
P8SDK.heartbeatIaa = function (data = "{}") {
  let result = new Promise((resolve, reject) => {
    let t = parseInt(new Date().getTime() / 1e3);
    let param = {
      site: sdkData.site,
      openid: sdkData.device,
      ip: sdkData.ip,
      heartbeat_time: t,
      version: data.version,
    }
    print("***心跳时间***", param.heartbeat_time);
    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/heartbeatInfo`;
    let o = a + "?" + keyValueConnect(param);
    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      print("心跳上报 " + JSON.stringify(t));
      resolve(t);
    });
  })

  return result;
}

/* iaa心跳计时器 */
P8SDK.setHeartBeatIaa = function (data = "{}") {
  let t = setInterval(() => {
    P8SDK.heartbeatIaa(data);
  }, 3e5);
  print("心跳time =", t);
}


/* 广告观看打点 研发cp */
P8SDK.adInfoIaa = function (data = "{}") {
  let result = new Promise((resolve, reject) => {
    let param = {
      site: sdkData.site,
      openid: sdkData.device,
      ip: sdkData.ip,
      adid: data.adid,
      passid: data.passid,
      version: data.version,
    }

    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/adinfo`;
    print("广告观看打点 请求服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);
    print("广告观看打点 请求Url: ", o);
    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      print("广告观看打点 返回的数据 " + JSON.stringify(t));
      resolve(t);
    });
  })
  return result;
}

/* iaa 主动分享 */
P8SDK.shareMessageIaa = function (g = "{}") {
  console.log(" 监听到主动分享好友...")
  if (TXDNSDK.track) {
    TXDNSDK.track('SHARE', {
      target: 'APP_MESSAGE'
    });
  }
  console.log('[ sdkData.device ] >', sdkData.device)
  let shareObj = {
    title: g.title,
    imageUrl: g.imageUrl,
    query: g.query + `${g.query ? '&' : ''}mode=iaa&activityId=${g.activityId}&shareOpenid=${sdkData.device}&content=${g.content}&version=${g.version}`,
    imageUrlId: g.imageUrlId,
  }
  print("p8sdk iaa 主动分享 接口调用", shareObj);
  let postShareObj = {
    activityId: g.activityId,
    content: g.content,
    version: g.version,
  }
  postShareCount(postShareObj).then(res => {
    print("主动分享上报 返回的数据 " + JSON.stringify(res));
  })
  wx.shareAppMessage(shareObj);
}

/* 主动分享 研发cp */

function shareApiIaa(data = "{}") {
  let result = new Promise((resolve, reject) => {
    // 检查必要参数是否存在
    if (!sdkData.device) {
      console.log("sdkData.device未获取到,1秒后重试...");
      setTimeout(() => {
        shareApiIaa(data).then(resolve).catch(reject);
      }, 1000);
      return;
    }

    if (sdkData.device == data.shareOpenid) {
      console.log("sdkData.device与data.shareOpenid相同,不进行上报");
      return
    }

    let param = {
      site: sdkData.site,
      openid: sdkData.device,
      activityId: data.activityId,
      shareOpenid: data.shareOpenid,
      content: data.content,
      version: data.version,
    }

    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/share`;
    print("分享iaa上报 请求服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);
    print("分享iaa上报 请求Url: ", o);
    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      print("分享iaa上报 返回的数据 " + JSON.stringify(t));
      resolve(t);
    });
  })

  return result;
}

/* 查询分享结果 */
P8SDK.getShareInfo = function (data = "{}") {
  let result = new Promise((resolve, reject) => {
    let param = {
      site: sdkData.site,
      activityId: data.activityId,
      shareOpenid: data.shareOpenid || sdkData.device,
    }
    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/getShare`;
    print("查询分享结果 请求服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);
    print("查询分享结果 请求Url: ", o);

    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      let response = {
        idlist: t.idlist ? JSON.parse(t.idlist) : [],
        message: t.message,
        code: t.code,
      }

      resolve(response);
    });
  })


  return result;
}

function postShareCount(data = '{}') {
  let result = new Promise((resolve, reject) => {
    let param = {
      site: sdkData.site,
      activityId: data.activityId,
      shareNO: 1,
      shareOpenid: sdkData.device,
      content: data.content,
      version: data.version,
    }

    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/shareinfo`;
    print("主动分享上报 请求服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);

    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      resolve(t);
    });
  })

  return result;
}

P8SDK.videoIaaInfo = (data = "{}") => {
  let result = new Promise((resolve, reject) => {
    let param = {
      site: sdkData.site,
      openid: sdkData.device,
      vid: data.vid,
      groupid: data.groupid,
      errorid: data.errorid,
      v_status: data.v_status,
      timespent: data.timespent,
    }
    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/videoinfo`;
    print("瀑布流视频打点 请求服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);
    print("瀑布流视频打点 请求Url: ", o);

    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);;
      print("瀑布流视频打点 返回的数据: ", JSON.stringify(t));
      resolve(t);
    });
  })


  return result;
}

/* iaa 瀑布流分享 */
P8SDK.shareFallsIaa = function (g = "{}") {
  console.log(" 监听到瀑布流分享...")
  if (TXDNSDK.track) {
    TXDNSDK.track('SHARE', {
      target: 'APP_MESSAGE'
    });
  }
  console.log('[ sdkData.device ] >', sdkData.device)
  let shareObj = {
    title: g.title,
    imageUrl: g.imageUrl,
    query: g.query + `${g.query ? '&' : ''}mode=falls&shareid=${g.shareid}&shareOpenid=${sdkData.device}&groupid=${g.groupid}`,
    imageUrlId: g.imageUrlId,
  }
  print("p8sdk iaa 瀑布流分享 接口调用", shareObj);
  let postShareObj = {
    shareid: g.shareid,
    groupid: g.groupid,
    shareOpenid: sdkData.device,
  }
  postShareFallsCount(postShareObj).then(res => {
    print("瀑布流分享上报 返回的数据 " + JSON.stringify(res));
  })
  wx.shareAppMessage(shareObj);
}

function shareFallsApiIaa(data) {
  let result = new Promise((resolve, reject) => {
    // 检查必要参数是否存在
    if (!sdkData.device) {
      console.log("sdkData.device未获取到,1秒后重试...");
      setTimeout(() => {
        shareFallsApiIaa(data).then(resolve).catch(reject);
      }, 1000);
      return;
    }

    if (sdkData.device == data.shareOpenid) {
      console.log("sdkData.device与data.shareOpenid相同,不进行上报");
      return
    }

    let param = {
      site: sdkData.site,
      shareid: data.shareid,
      groupid: data.groupid,
      openid: sdkData.device,
      shareOpenid: data.shareOpenid,
    }

    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/shareinfo2`;
    print("瀑布流分享打点 请求服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);
    print("瀑布流分享打点 请求Url: ", o);
    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      print("瀑布流分享打点 返回的数据 " + JSON.stringify(t));
      resolve(t);
    });
  })

  return result;
}

function postShareFallsCount(data = '{}') {
  let result = new Promise((resolve, reject) => {
    let param = {
      site: sdkData.site,
      shareid: data.shareid,
      groupid: data.groupid,
      openid: "",
      shareOpenid: data.shareOpenid,
    }

    ChangeUndefined(param);
    let n = newSignGetTypeNoSiteHead_log(param);
    var d = hex_md5(n);
    param.sign = d.toUpperCase();

    let a = `${sdkData.yanfa_url}/common/iaa/shareinfo2`;
    print("瀑布流分享上报 请求服务器的参数: " + JSON.stringify(param));
    let o = a + "?" + keyValueConnect(param);

    HttpRequest(o, "GET", param, (e) => {
      let t = dateOrRes(e);
      resolve(t);
    });
  })

  return result;
}

function debounce(fn, delay = 1000) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
}

function HttpRequest(url, t = "get", i = null, r = null, f = null, retryCount = 0) {
  let retryTimer = null;
  if (p8QuickApp) {
    XmlHttpRequestLog(url, t, i, r, f);
  } else {
    wx.request({
      url: url,
      method: t,
      data: i,
      header: {
        "content-type": "application/x-www-form-urlencoded",
      },
      success: function (e) {
        if (retryTimer) clearTimeout(retryTimer); // 清除定时器
        retryTimer = null;
        r(e);
      },
      fail: function (e) {
        if (retryCount < 3) {
          console.warn(`HttpRequest 请求失败, 重试中 in 1s... (Attempt ${retryCount + 1}/3)`);
          if (retryTimer) clearTimeout(retryTimer); // 清除定时器
          retryTimer = setTimeout(() => {
            HttpRequest(url, t, i, r, f, retryCount + 1);
          }, 1000);
        } else {
          console.warn("HttpRequest 请求失败,超过3次,不再重试");
          if (retryTimer) clearTimeout(retryTimer); // 清除定时器
          retryTimer = null;
          r(e);
        }
      }
    });
  }
}

function HttpRequestJson(url, t = "get", i = null, r = null, f = null, retryCount = 0) {
  let retryTimer = null;
  if (p8QuickApp) {
    XmlHttpRequestLog(url, t, i, r, f);
  } else {
    wx.request({
      url: url,
      method: t,
      data: i,
      header: {
        "content-type": "application/json",
      },
      success: function (e) {
        if (retryTimer) clearTimeout(retryTimer); // 清除定时器
        retryTimer = null;
        r(e);
      },
      fail: function (e) {
        if (retryCount < 3) {
          console.warn(`HttpRequestJson 请求失败, 重试中 in 1s... (Attempt ${retryCount + 1}/3)`);
          if (retryTimer) clearTimeout(retryTimer); // 清除定时器
          retryTimer = setTimeout(() => {
            HttpRequestJson(url, t, i, r, f, retryCount + 1);
          }, 1000);
        } else {
          console.warn("HttpRequestJson 请求失败,超过3次,不再重试");
          if (retryTimer) clearTimeout(retryTimer); // 清除定时器
          r(e);
        }

      }
    });
  }
}

function keyValueConnect(e) {
  let t = "";
  for (const i in e) {
    if (e.hasOwnProperty.call(e, i)) {
      const r = e[i];
      t += i + "=" + r + "&";
    }
  }
  t = t.substring(0, t.length - 1);
  t = encodeURI(t);
  return t;
}


// function newSignGetType_log(t, flag) {
//   flag = true
//   var i = [];
//   for (var e in t) {
//     i.push(e);
//   }
//   i = i.sort();
//   let r = ''

//   for (let e = 0; e < i.length; e++) {
//     const n = t[i[e]];
//     if (e != 0) {
//       r += "&" + i[e] + "=" + n;
//     } else {
//       r += i[e] + "=" + n;
//     }
//   }
//   r += "28203d2c3522f84d9553f768f3271cc9"
//   return r;
// }

function newSignGetType_log(t) {
  var i = [];
  for (var e in t) {
    i.push(e);
  }
  i = i.sort();
  let r = sdkData.site;
  for (let e = 0; e < i.length; e++) {
    const n = t[i[e]];
    if (e != 0) {
      r += "&" + i[e] + "=" + n;
    } else {
      r += i[e] + "=" + n;
    }
  }
  r += sdkData.key;
  return r;
}

function newSignGetTypeNoSiteHead_log(t, flag) {
  flag = true
  var i = [];
  for (var e in t) {
    i.push(e);
  }
  i = i.sort();
  let r = ''

  for (let e = 0; e < i.length; e++) {
    const n = t[i[e]];
    if (e != 0) {
      r += "&" + i[e] + "=" + n;
    } else {
      r += i[e] + "=" + n;
    }
  }
  r += sdkData.key
  return r;
}

function XmlHttpRequestLog(e, t = "post", i = {}, r = null, f = null) {
  console.log("进入ajax", e);
  //console.log("进入ajax",$.ajax);
  var request = new XMLHttpRequest();
  request.open(t, e);
  // request.setRequestHeader("Content-type", "application/json");
  //request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //send_data = {'url': url, 'name': "zhangsan", 'age': 15}
  request.send(JSON.stringify(i));
  request.onload = function () {
    if (request.status === 200) {
      console.log(`请求${e}返回的数据:${request.responseText}`);
      //window.history.back(-1); //返回上个页面
      let rdata = JSON.parse(request.responseText);
      if (r) r({
        data: rdata
      });
    } else {
      console.log("设置失败，请重试！");
      //window.history.back(-1);
      if (r) r(request.responseText);
    }
  };

  request.onerror = function (e) {
    console.error("请求失败", e);
    if (f) f(e);
  };
}

function XmlHttpRequestEnter(url, method = "get", params = {}, i = true) {
  if (!url) {
    throw Error("请求路径为空")
  }
  return new Promise((resolve, reject) => {
    function formatParams(params) {
      if (!params) {
        return ""
      }
      let paramsContent = Object.entries(params).reduce((pre, [key, value]) => {
        pre += `${key}=${value}&`
        return pre
      }, "").slice(0, -1)
      return paramsContent
    }

    let request = new XMLHttpRequest;
    if (method === "get" || method === "GET") {
      url = `${url}?${formatParams(params)}`
    }
    request.open(method, url)
    if (i) {
      request.setRequestHeader("Content-type", "application/json")
    } else {
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    }
    request.send(JSON.stringify(params));
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        if (request.status == 200) {
          let res = JSON.parse(request.responseText);
          resolve(res)
        } else {
          reject(request)
        }
      } else {}
    }
  })
}

var V = V || {};
V.Security = V.Security || {};
(function () {
  var S = V.Security;
  S.maxExactInt = Math.pow(2, 53);
  S.toUtf8ByteArr = function (e) {
    var t = [],
      i;
    for (var r = 0; r < e.length; r++) {
      i = e.charCodeAt(r);
      if (55296 <= i && i <= 56319) {
        var n = i,
          d = e.charCodeAt(r + 1);
        i = (n - 55296) * 1024 + (d - 56320) + 65536;
        r++;
      }
      if (i <= 127) {
        t[t.length] = i;
      } else if (i <= 2047) {
        t[t.length] = (i >>> 6) + 192;
        t[t.length] = (i & 63) | 128;
      } else if (i <= 65535) {
        t[t.length] = (i >>> 12) + 224;
        t[t.length] = ((i >>> 6) & 63) | 128;
        t[t.length] = (i & 63) | 128;
      } else if (i <= 1114111) {
        t[t.length] = (i >>> 18) + 240;
        t[t.length] = ((i >>> 12) & 63) | 128;
        t[t.length] = ((i >>> 6) & 63) | 128;
        t[t.length] = (i & 63) | 128;
      } else {
        throw "Unicode standart supports code points up-to U+10FFFF";
      }
    }
    return t;
  };
  S.toHex32 = function (e) {
    if (e & 2147483648) {
      e = e & ~2147483648;
      e += Math.pow(2, 31);
    }
    var t = e.toString(16);
    while (t.length < 8) {
      t = "0" + t;
    }
    return t;
  };
  S.reverseBytes = function (e) {
    var t = 0;
    t += (e >>> 24) & 255;
    t += ((e >>> 16) & 255) << 8;
    t += ((e >>> 8) & 255) << 16;
    t += (e & 255) << 24;
    return t;
  };
  S.leftRotate = function (e, t) {
    return (e << t) | (e >>> (32 - t));
  };
  S.md5 = function (e) {
    var t = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
      16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    var i = [];
    for (var r = 0; r <= 63; r++) {
      i[r] = (Math.abs(Math.sin(r + 1)) * Math.pow(2, 32)) << 0;
    }
    var n = 1732584193,
      d = 4023233417,
      a = 2562383102,
      o = 271733878,
      s,
      l;
    s = S.toUtf8ByteArr(e);
    e = null;
    l = s.length;
    s.push(128);
    var c = Math.abs(448 - ((s.length * 8) % 512)) / 8;
    while (c--) {
      s.push(0);
    }
    s.push((l * 8) & 255, ((l * 8) >> 8) & 255, ((l * 8) >> 16) & 255, ((l * 8) >> 24) & 255);
    var r = 4;
    while (r--) {
      s.push(0);
    }
    var g = S.leftRotate;
    var r = 0,
      u = [];
    while (r < s.length) {
      for (var m = 0; m <= 15; m++) {
        u[m] = (s[r + 4 * m] << 0) + (s[r + 4 * m + 1] << 8) + (s[r + 4 * m + 2] << 16) + (s[r + 4 * m + 3] << 24);
      }
      var f = n,
        _ = d,
        v = a,
        h = o,
        p,
        y;
      for (var m = 0; m <= 63; m++) {
        if (m <= 15) {
          p = (_ & v) | (~_ & h);
          y = m;
        } else if (m <= 31) {
          p = (h & _) | (~h & v);
          y = (5 * m + 1) % 16;
        } else if (m <= 47) {
          p = _ ^ v ^ h;
          y = (3 * m + 5) % 16;
        } else {
          p = v ^ (_ | ~h);
          y = (7 * m) % 16;
        }
        var k = h;
        h = v;
        v = _;
        _ = _ + g(f + p + i[m] + u[y], t[m]);
        f = k;
      }
      n = (n + f) << 0;
      d = (d + _) << 0;
      a = (a + v) << 0;
      o = (o + h) << 0;
      r += 512 / 8;
    }
    var D = w(n) + w(d) + w(a) + w(o);

    function w(e) {
      return S.toHex32(S.reverseBytes(e));
    }
    return D;
  };
})();

// 商业组件
P8SDK.callPopupActivity = function (g) {
  console.log('callPopupActivity', g);
  let result = new Promise((l, e) => {
    if (!g.actId) {
      console.error('请传入当前要打开的活动 id');
      return false
    }
    if (GameGlobal.miniGameCommon && GameGlobal.miniGameCommon.createPopupActivity) {
      const popupActivity = GameGlobal.miniGameCommon.createPopupActivity();
      let showPopupOption = {
        actId: g.actId,
        levelList: g.levelList,
      }
      // 展示商业组件
      popupActivity
        .showPopup(showPopupOption) // 详见下方参数说明
        .then((showPopupResponse) => {
          // 用户已选择商品
          console.log('用户想要购买的商品:', showPopupResponse);
          var res = {
            result: 0,
            data: showPopupResponse,
          };
          l(res)
        })
        .catch((err) => {
          // 弹窗出错或关闭
          console.warn('关闭/出错返回:', err); // 详见下方错误说明
          var res = {
            result: 1,
            data: err,
          };
          l(res)
        });
    } else {
      console.error('商业组件不存在,未配置或者未申请权限');
    }
  })
  return result
}

P8SDK.callPopupActivityPay = function (g) {
  console.log('callPopupActivityPay', g);
  let result = new Promise((l, e) => {
    if (GameGlobal.miniGameCommon && GameGlobal.miniGameCommon.createPopupActivity) {
      const popupActivity = GameGlobal.miniGameCommon.createPopupActivity();
      if (P8SDK.showPayPage) {
        P8SDK.showPayPage()
        return
      }
      if (g.mdsVersion == "1.0") {
        sdkData.mdsVersion = "1.0";
      }
      console.info("调用P8支付接口");
      g.env = 0;
      console.error("sdk强制米大师支付使用正式环境");
      madeOrder(g).then((d) => {
        if (d.result != 0) {
          l({
            result: -1,
            msg: "下单异常:" + d.data,
          });
        }
        let result = d.data;
        if (!result) {
          l({
            result: -1,
            msg: "获取格式错误",
          });
        }
        result.data = result.data.data;
        console.info(" madeOrder 返回内容", JSON.stringify(result.data));
        var p8OrderId = result.data.orderid;
        fixOrder();
        console.log('paydata', paydata);
        const requestMidasPaymentOption = {
          env: g.env,
          offerId: paydata.offerId,
          buyQuantity: g.money * paydata.scale,
          outTradeNo: p8OrderId,
          exchangeRate: paydata.scale,
          zoneId: paydata.zoneId,
          mode: "game",
          currencyType: "CNY",
          platform: "android",
        };
        console.log('requestMidasPaymentOption', requestMidasPaymentOption);

        let notifyReqData = {
          env: 0, // g.env,
          money: g.money,
          order_id: p8OrderId,
          mac: "0",
        };

        // 详见下方返回值说明
        // 注意:
        // 开发者需要根据返回的payInfo去获取服务端生成的outTradeNo
        // 服务端轮询查这个订单是否支付成功，不要完全信任requestMidasPayment的回调
        // requestMidasPayment在部分极端场景不会触发回调，或者购买成功后依然回调了取消
        // getOutTradeNo是一个伪代码，具体逻辑由开发者实现
        // 具体支付实现建议查看 https://developers.weixin.qq.com/minigame/dev/guide/open-ability/virtual-payment/guide.html
        // 3.2.3.使用游戏币托管能力实现道具直购场景的优化建议

        // const outTradeNo = getOutTradeNo(showPopupResponse.payInfo);

        // 购买商品
        popupActivity
          .requestMidasPayment(requestMidasPaymentOption) // 详见下方参数说明
          .then((requestMidasPaymentResponse) => {
            // 用户已购买商品
            console.log('用户支付成功:', requestMidasPaymentResponse); // 详见下方返回值说明
            let res = {
              result: 0,
              data: {
                errorcode: "",
                msg: "付款成功！",
                data: JSON.stringify(requestMidasPaymentResponse),
              },
            };
            // 付款成功后 要发货
            midasNotify(notifyReqData).then((notifyRes) => {
              l(res)
              // 将订单存本地
              setItem("oldOrderInfo", JSON.stringify(notifyReqData));
            });
          })
          .catch((err) => {
            // 用户取消支付或支付失败
            console.warn('支付取消/出错:', err); // 详见下方错误说明
            var res = {
              result: 1,
              data: {
                errorcode: "",
                errCode: err.errCode,
                msg: err.errMsg,
                data: JSON.stringify(err),
              },
            };
            console.error("米大师充值异常:", err);
            if (err.errCode == -1) {
              let o = {};
              o.g_money = g.money;
              o.paydata_scale = paydata.scale;
              let a = "";
              for (const i in o) {
                if (Object.hasOwnProperty.call(o, i)) {
                  const n = o[i];
                  if (i != "success" && i != "fail" && i != "complete") {
                    a += i + ":" + n + "\n";
                  }
                }
              }
              console.error("米大师支付参数:", a);
            }
            // 付款成功后 要发货
            midasNotify(notifyReqData).then((notifyRes) => {
              l(res)
              // 将订单存本地
              setItem("oldOrderInfo", JSON.stringify(notifyReqData));
            });
          });
      })
    } else {
      console.error('商业组件不存在,未配置或者未申请权限');
    }

  })
  return result
}


function getPlugin() {
  try {
    if (typeof requirePlugin !== 'undefined') {
      const createMiniGameCommon = requirePlugin('MiniGameCommon', {
        enableRequireHostModule: true,
        customEnv: {
          wx,
        },
      }).default;
      const miniGameCommon = createMiniGameCommon();
      if (typeof miniGameCommon === 'undefined' || typeof miniGameCommon.canIUse === 'undefined') {
        // 插件初始化失败
        console.error('miniGameCommon create error');
      } else {
        // 插件初始化成功
        GameGlobal.miniGameCommon = miniGameCommon;
        console.log('miniGameCommon create success');
      }
    }
  } catch (e) {
    // 基础库版本过低
  }
}

function setheartbeat(e) {
  let t = setInterval(() => {
    print("计时器");
    heartbeat(e);
  }, 3e5);
  print("time =", t);
}

function heartbeat(e) {
  let t = parseInt(new Date().getTime() / 1e3);
  print("***t", t);
  let i = {
    aid: e.aid,
    uid: e.uid,
    site: e.site,
    device: e.device,
    modeltype: e.modeltype,
    username: e.username,
    sid: e.sid,
    roleid: e.roleid,
    rolename: e.rolename,
    level: e.level,
    vip: e.vip,
    ip: e.ip,
    onlinetime: e.onlinetime,
    device_model: e.device_model,
    device_resolution: e.device_resolution,
    device_version: e.device_version,
    device_net: e.device_net,
    time: t,
    oaid: e.oaid
  };

  ChangeUndefined(i);
  let r = newSignGetType_log(i);
  var n = hex_md5(r);
  i.sign = n;
  let d = `${sdkData.data_url}/log/onlineTime`;
  HttpRequest(d, "POST", i, (e) => {
    var t = dateOrRes(e);
    print("心跳时间上报= ", t);
  });
}

function checkSDKCodeHash() {
  const TYPE_CONFIG = {
    1: {
      key: 'site',
      label: 'site',
      transform: site => site.split('_')[0]
    },
    2: {
      key: 'appid',
      label: 'appid',
      transform: appid => appid
    }
  };

  const config = TYPE_CONFIG[SDKCODETYPE];
  if (!config) {
    printError('检查输出：[❌验证失败]无效的SDK检查类型');
    return false;
  }

  printTime(`检查输出：[✅验证]当前SDK检查类型：${SDKCODETYPE === 1 ? 'site' : 'appid'}`);
  printTime(`检查输出：[✅验证]当前SDK唯一值：${SDKCODEHASH}`);

  const value = sdkData[config.key];
  if (!value) {
    printError(`检查输出：[❌验证失败]当前游戏${config.label}：为空，请检查`);
    return false;
  }

  const localValue = config.transform(value);
  printTime(`检查输出：[✅验证]当前游戏${config.label}：${localValue}`);

  if (localValue !== SDKCODEHASH) {
    printError(`检查输出：[❌验证失败]当前游戏${config.label}：${localValue} 与 SDK唯一值：${SDKCODEHASH} 不匹配，SDK已被其他游戏绑定，请获取新的SDK,严格执行"一游戏一SDK"的独立开发原则`);
    return false;
  }

  printTime(`检查输出：[✅验证通过]当前游戏${config.label}：${localValue} 与 SDK唯一值：${SDKCODEHASH} 匹配`);
  return true;
}

function printTime(msg) {
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN', {
    hour12: false
  });
  console.log(`[${time}]：${msg}`);
}

function printError(msg) {
  const now = new Date();
  const time = now.toLocaleTimeString('zh-CN', {
    hour12: false
  });
  console.error(`[${time}]：${msg}`);
}

function arrayUtils() {
  function uniqueArray(arr) {
    return Array.from(new Set(arr));
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
}

function stringUtils() {
  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function reverseString(str) {
    return str.split('').reverse().join('');
  }

  function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

function mathUtils() {
  function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  }

  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

  function gcd(a, b) {
    return !b ? a : gcd(b, a % b);
  }
}

function validationUtils() {
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function isValidPhone(phone) {
    const re = /^1[3456789]\d{9}$/;
    return re.test(phone);
  }

  function isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

function debugUtils() {
  function timeFunction(fn) {
    const start = Date.now();
    fn();
    return Date.now() - start;
  }

  function memorySizeOf(obj) {
    let bytes = 0;
    const sizeOf = obj => {
      if (obj !== null && obj !== undefined) {
        switch (typeof obj) {
          case 'number':
            bytes += 8;
            break;
          case 'string':
            bytes += obj.length * 2;
            break;
          case 'boolean':
            bytes += 4;
            break;
          case 'object':
            if (Array.isArray(obj)) {
              obj.forEach(sizeOf);
            } else {
              for (let key in obj) {
                if (obj.hasOwnProperty(key)) sizeOf(obj[key]);
              }
            }
            break;
        }
      }
      return bytes;
    };
    return sizeOf(obj);
  }
}

function dataStructures() {

  class LinkedListNode {
    constructor(data) {
      this.data = data;
      this.next = null;
    }
  }

  class LinkedList {
    constructor() {
      this.head = null;
      this.size = 0;
    }

    add(data) {
      const node = new LinkedListNode(data);
      if (!this.head) {
        this.head = node;
      } else {
        let current = this.head;
        while (current.next) {
          current = current.next;
        }
        current.next = node;
      }
      this.size++;
    }
  }


  class TreeNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
    }
  }

  class BinarySearchTree {
    constructor() {
      this.root = null;
    }

    insert(value) {
      const node = new TreeNode(value);
      if (!this.root) {
        this.root = node;
        return;
      }
      let current = this.root;
      while (true) {
        if (value < current.value) {
          if (!current.left) {
            current.left = node;
            break;
          }
          current = current.left;
        } else {
          if (!current.right) {
            current.right = node;
            break;
          }
          current = current.right;
        }
      }
    }
  }
}

function sortingAlgorithms() {
  function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...middle, ...quickSort(right)];
  }

  function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
  }

  function merge(left, right) {
    const result = [];
    while (left.length && right.length) {
      result.push(left[0] <= right[0] ? left.shift() : right.shift());
    }
    return [...result, ...left, ...right];
  }
}

function performanceMonitor() {
  const metrics = new Map();

  function startMeasure(label) {
    metrics.set(label, {
      start: performance.now(),
      measurements: []
    });
  }

  function endMeasure(label) {
    const metric = metrics.get(label);
    if (metric) {
      const duration = performance.now() - metric.start;
      metric.measurements.push(duration);
      return duration;
    }
    return null;
  }

  function getAverageMetrics(label) {
    const metric = metrics.get(label);
    if (metric && metric.measurements.length) {
      const sum = metric.measurements.reduce((a, b) => a + b, 0);
      return sum / metric.measurements.length;
    }
    return 0;
  }
}

function dataConverter() {
  function xmlToJson(xml) {
    const obj = {};
    if (xml.nodeType === 1) {
      if (xml.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let i = 0; i < xml.attributes.length; i++) {
          const attribute = xml.attributes.item(i);
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) {
      obj = xml.nodeValue;
    }
    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;
        if (typeof (obj[nodeName]) === "undefined") {
          obj[nodeName] = xmlToJson(item);
        } else {
          if (typeof (obj[nodeName].push) === "undefined") {
            const old = obj[nodeName];
            obj[nodeName] = [];
            obj[nodeName].push(old);
          }
          obj[nodeName].push(xmlToJson(item));
        }
      }
    }
    return obj;
  }

  function csvToArray(csv, delimiter = ',') {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(delimiter);

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(delimiter);
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  }
}

function cacheManager() {
  class LRUCache {
    constructor(capacity) {
      this.capacity = capacity;
      this.cache = new Map();
    }

    get(key) {
      if (!this.cache.has(key)) return -1;
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }

    put(key, value) {
      if (this.cache.has(key)) {
        this.cache.delete(key);
      } else if (this.cache.size >= this.capacity) {
        this.cache.delete(this.cache.keys().next().value);
      }
      this.cache.set(key, value);
    }
  }

  class ExpiryCache {
    constructor() {
      this.cache = new Map();
    }

    set(key, value, ttl) {
      const expiryTime = Date.now() + ttl;
      this.cache.set(key, {
        value,
        expiryTime
      });
    }

    get(key) {
      const data = this.cache.get(key);
      if (!data) return null;
      if (Date.now() > data.expiryTime) {
        this.cache.delete(key);
        return null;
      }
      return data.value;
    }
  }
}

function designPatterns() {
  class Singleton {
    static instance = null;
    constructor() {
      if (Singleton.instance) {
        return Singleton.instance;
      }
      this.config = {};
      Singleton.instance = this;
    }
  }


  class EventEmitter {
    constructor() {
      this.events = {};
    }

    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    }

    emit(event, data) {
      if (this.events[event]) {
        this.events[event].forEach(callback => callback(data));
      }
    }
  }


  class ComponentFactory {
    createComponent(type) {
      switch (type) {
        case 'button':
          return new ButtonComponent();
        case 'input':
          return new InputComponent();
        case 'modal':
          return new ModalComponent();
        default:
          throw new Error('Unknown component type');
      }
    }
  }
}

function networkUtils() {
  class HttpClient {
    constructor(baseURL = '') {
      this.baseURL = baseURL;
      this.interceptors = {
        request: [],
        response: []
      };
    }

    async request(config) {

      for (const interceptor of this.interceptors.request) {
        config = await interceptor(config);
      }

      try {
        const response = await this._fetch(config);

        for (const interceptor of this.interceptors.response) {
          response = await interceptor(response);
        }
        return response;
      } catch (error) {
        throw error;
      }
    }

    async _fetch(config) {
      const {
        url,
        method = 'GET',
        data,
        headers = {}
      } = config;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(this.baseURL + url, options);
      return response.json();
    }
  }
}

function animationUtils() {
  class Animator {
    constructor() {
      this.animations = new Map();
    }

    animate(element, properties, duration, easing = 'linear') {
      const startTime = Date.now();
      const initialValues = {};
      const targetValues = {};

      Object.keys(properties).forEach(prop => {
        initialValues[prop] = parseFloat(getComputedStyle(element)[prop]);
        targetValues[prop] = properties[prop];
      });

      const animation = {
        element,
        initialValues,
        targetValues,
        duration,
        startTime,
        easing
      };

      this.animations.set(element, animation);
      this.startAnimation();
    }

    startAnimation() {
      if (!this.animationFrame) {
        this.animationFrame = requestAnimationFrame(() => this.updateAnimations());
      }
    }

    updateAnimations() {
      const currentTime = Date.now();
      let hasRunningAnimations = false;

      this.animations.forEach((animation, element) => {
        const elapsed = currentTime - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);

        if (progress < 1) {
          hasRunningAnimations = true;
          this.updateElement(element, animation, progress);
        } else {
          this.animations.delete(element);
        }
      });

      if (hasRunningAnimations) {
        this.animationFrame = requestAnimationFrame(() => this.updateAnimations());
      } else {
        this.animationFrame = null;
      }
    }
  }
}

function securityUtils() {
  class Encryptor {
    constructor(secretKey) {
      this.secretKey = secretKey;
    }

    encrypt(data) {
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
        result += String.fromCharCode(charCode);
      }
      return btoa(result);
    }

    decrypt(encryptedData) {
      const text = atob(encryptedData);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    }
  }

  class TokenManager {
    constructor() {
      this.tokens = new Map();
    }

    generateToken(userId, expiresIn = 3600) {
      const token = this.createRandomToken();
      this.tokens.set(token, {
        userId,
        expiresAt: Date.now() + expiresIn * 1000
      });
      return token;
    }

    verifyToken(token) {
      const tokenData = this.tokens.get(token);
      if (!tokenData) return false;
      if (Date.now() > tokenData.expiresAt) {
        this.tokens.delete(token);
        return false;
      }
      return true;
    }

    createRandomToken() {
      return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }
}

function imageUtils() {
  class ImageProcessor {
    static async loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    }

    static resize(image, width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, width, height);
      return canvas.toDataURL();
    }

    static applyFilter(image, filter) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filtered = this.processImageData(imageData, filter);
      ctx.putImageData(filtered, 0, 0);
      return canvas.toDataURL();
    }

    static processImageData(imageData, filter) {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        const result = filter(r, g, b, a);
        data[i] = result[0];
        data[i + 1] = result[1];
        data[i + 2] = result[2];
        data[i + 3] = result[3];
      }
      return imageData;
    }
  }
}

function stateManager() {
  class Store {
    constructor(initialState = {}) {
      this.state = initialState;
      this.listeners = new Set();
      this.reducers = new Map();
    }

    addReducer(type, reducer) {
      this.reducers.set(type, reducer);
    }

    dispatch(action) {
      const reducer = this.reducers.get(action.type);
      if (reducer) {
        const newState = reducer(this.state, action);
        if (newState !== this.state) {
          this.state = newState;
          this.notify();
        }
      }
    }

    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    notify() {
      this.listeners.forEach(listener => listener(this.state));
    }

    getState() {
      return this.state;
    }
  }
}

function eventUtils() {
  class EventEmitter {
    constructor() {
      this.events = new Map();
    }

    on(event, listener) {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event).push(listener);
    }

    emit(event, ...args) {
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.forEach(listener => listener(...args));
      }
    }

    off(event, listener) {
      const listeners = this.events.get(event);
      if (listeners) {
        this.events.set(event, listeners.filter(l => l !== listener));
      }
    }
  }
}

function gameEngineUtils() {
  class GameObject {
    constructor(x = 0, y = 0) {
      this.position = {
        x,
        y
      };
      this.rotation = 0;
      this.scale = {
        x: 1,
        y: 1
      };
      this.components = new Map();
      this.children = [];
    }

    addComponent(component) {
      component.gameObject = this;
      this.components.set(component.constructor.name, component);
    }

    update(deltaTime) {
      this.components.forEach(component => component.update(deltaTime));
      this.children.forEach(child => child.update(deltaTime));
    }
  }

  class Physics2D {
    constructor() {
      this.gravity = {
        x: 0,
        y: -9.81
      };
      this.bodies = [];
    }

    addBody(body) {
      this.bodies.push(body);
    }

    update(deltaTime) {
      this.bodies.forEach(body => {
        body.velocity.x += this.gravity.x * deltaTime;
        body.velocity.y += this.gravity.y * deltaTime;
        body.position.x += body.velocity.x * deltaTime;
        body.position.y += body.velocity.y * deltaTime;
      });
      this.checkCollisions();
    }

    checkCollisions() {
      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = i + 1; j < this.bodies.length; j++) {
          if (this.isColliding(this.bodies[i], this.bodies[j])) {
            this.resolveCollision(this.bodies[i], this.bodies[j]);
          }
        }
      }
    }
  }
}

function compressionUtils() {
  class HuffmanNode {
    constructor(char, frequency) {
      this.char = char;
      this.frequency = frequency;
      this.left = null;
      this.right = null;
    }
  }

  class HuffmanCompression {
    compress(data) {
      const frequency = new Map();
      for (const char of data) {
        frequency.set(char, (frequency.get(char) || 0) + 1);
      }

      const heap = Array.from(frequency.entries())
        .map(([char, freq]) => new HuffmanNode(char, freq));

      while (heap.length > 1) {
        heap.sort((a, b) => a.frequency - b.frequency);
        const left = heap.shift();
        const right = heap.shift();
        const parent = new HuffmanNode(null, left.frequency + right.frequency);
        parent.left = left;
        parent.right = right;
        heap.push(parent);
      }

      const codes = new Map();
      this.generateCodes(heap[0], '', codes);

      let compressed = '';
      for (const char of data) {
        compressed += codes.get(char);
      }

      return {
        compressed,
        tree: heap[0],
        codes
      };
    }

    generateCodes(node, code, codes) {
      if (node.char !== null) {
        codes.set(node.char, code);
        return;
      }
      this.generateCodes(node.left, code + '0', codes);
      this.generateCodes(node.right, code + '1', codes);
    }
  }
}

function loggingSystem() {
  class Logger {
    constructor(options = {}) {
      this.levels = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
      };
      this.level = options.level || this.levels.INFO;
      this.handlers = options.handlers || [console.log];
      this.format = options.format || this.defaultFormat;
      this.buffer = [];
      this.bufferSize = options.bufferSize || 1000;
    }

    log(level, message, ...args) {
      if (this.levels[level] <= this.level) {
        const logEntry = this.format(level, message, ...args);
        this.handlers.forEach(handler => handler(logEntry));
        this.buffer.push(logEntry);
        if (this.buffer.length > this.bufferSize) {
          this.buffer.shift();
        }
      }
    }

    defaultFormat(level, message, ...args) {
      return {
        timestamp: new Date().toISOString(),
        level,
        message,
        args,
        stack: new Error().stack
      };
    }
  }
}

function i18nUtils() {
  class I18n {
    constructor() {
      this.locale = 'en';
      this.translations = new Map();
      this.fallbackLocale = 'en';
      this.interpolationPattern = /\{\{([^}]+)\}\}/g;
    }

    setLocale(locale) {
      this.locale = locale;
    }

    addTranslations(locale, translations) {
      if (!this.translations.has(locale)) {
        this.translations.set(locale, new Map());
      }
      Object.entries(translations).forEach(([key, value]) => {
        this.translations.get(locale).set(key, value);
      });
    }

    translate(key, params = {}) {
      const localeTranslations = this.translations.get(this.locale) ||
        this.translations.get(this.fallbackLocale);

      if (!localeTranslations) {
        return key;
      }

      let translation = localeTranslations.get(key) || key;

      return translation.replace(this.interpolationPattern, (match, param) => {
        return params[param] || match;
      });
    }

    formatNumber(number, options = {}) {
      return new Intl.NumberFormat(this.locale, options).format(number);
    }

    formatDate(date, options = {}) {
      return new Intl.DateTimeFormat(this.locale, options).format(date);
    }
  }
}

function webglUtils() {
  class WebGLRenderer {
    constructor(canvas) {
      this.gl = canvas.getContext('webgl');
      this.programs = new Map();
      this.buffers = new Map();
      this.textures = new Map();
    }

    createShader(type, source) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);

      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        throw new Error(this.gl.getShaderInfoLog(shader));
      }

      return shader;
    }

    createProgram(vertexShader, fragmentShader) {
      const program = this.gl.createProgram();
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);

      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        throw new Error(this.gl.getProgramInfoLog(program));
      }

      return program;
    }

    createBuffer(data, target = this.gl.ARRAY_BUFFER, usage = this.gl.STATIC_DRAW) {
      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(target, buffer);
      this.gl.bufferData(target, data, usage);
      return buffer;
    }
  }
}

function audioUtils() {
  class AudioEngine {
    constructor() {
      this.context = new(window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.sounds = new Map();
    }

    async loadSound(url) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      return audioBuffer;
    }

    createSource(buffer) {
      const source = this.context.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.context.createGain();
      source.connect(gainNode);
      gainNode.connect(this.masterGain);

      return {
        source,
        gainNode
      };
    }

    createEffect(type, options = {}) {
      let effect;
      switch (type) {
        case 'reverb':
          effect = this.context.createConvolver();
          break;
        case 'delay':
          effect = this.context.createDelay();
          effect.delayTime.value = options.delayTime || 0.5;
          break;
        case 'filter':
          effect = this.context.createBiquadFilter();
          effect.type = options.filterType || 'lowpass';
          effect.frequency.value = options.frequency || 1000;
          break;
        default:
          throw new Error(`Unknown effect type: ${type}`);
      }
      return effect;
    }
  }
}

var hexcase = 0;
var b64pad = "";

function hex_md5(e) {
  return rstr2hex(rstr_md5(str2rstr_utf8(e)));
}

function rstr_md5(e) {
  return binl2rstr(binl_md5(rstr2binl(e), e.length * 8));
}

function rstr2hex(e) {
  try {
    hexcase;
  } catch (e) {
    hexcase = 0;
  }
  var t = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var i = "";
  var r;
  for (var n = 0; n < e.length; n++) {
    r = e.charCodeAt(n);
    i += t.charAt((r >>> 4) & 15) + t.charAt(r & 15);
  }
  return i;
}

function str2rstr_utf8(e) {
  return unescape(encodeURI(e));
}

function rstr2binl(e) {
  var t = Array(e.length >> 2);
  for (var i = 0; i < t.length; i++) t[i] = 0;
  for (var i = 0; i < e.length * 8; i += 8) t[i >> 5] |= (e.charCodeAt(i / 8) & 255) << i % 32;
  return t;
}

function binl2rstr(e) {
  var t = "";
  for (var i = 0; i < e.length * 32; i += 8) t += String.fromCharCode((e[i >> 5] >>> i % 32) & 255);
  return t;
}

function binl_md5(e, t) {
  e[t >> 5] |= 128 << t % 32;
  e[(((t + 64) >>> 9) << 4) + 14] = t;
  var i = 1732584193;
  var r = -271733879;
  var n = -1732584194;
  var d = 271733878;
  for (var a = 0; a < e.length; a += 16) {
    var o = i;
    var s = r;
    var l = n;
    var c = d;
    i = md5_ff(i, r, n, d, e[a + 0], 7, -680876936);
    d = md5_ff(d, i, r, n, e[a + 1], 12, -389564586);
    n = md5_ff(n, d, i, r, e[a + 2], 17, 606105819);
    r = md5_ff(r, n, d, i, e[a + 3], 22, -1044525330);
    i = md5_ff(i, r, n, d, e[a + 4], 7, -176418897);
    d = md5_ff(d, i, r, n, e[a + 5], 12, 1200080426);
    n = md5_ff(n, d, i, r, e[a + 6], 17, -1473231341);
    r = md5_ff(r, n, d, i, e[a + 7], 22, -45705983);
    i = md5_ff(i, r, n, d, e[a + 8], 7, 1770035416);
    d = md5_ff(d, i, r, n, e[a + 9], 12, -1958414417);
    n = md5_ff(n, d, i, r, e[a + 10], 17, -42063);
    r = md5_ff(r, n, d, i, e[a + 11], 22, -1990404162);
    i = md5_ff(i, r, n, d, e[a + 12], 7, 1804603682);
    d = md5_ff(d, i, r, n, e[a + 13], 12, -40341101);
    n = md5_ff(n, d, i, r, e[a + 14], 17, -1502002290);
    r = md5_ff(r, n, d, i, e[a + 15], 22, 1236535329);
    i = md5_gg(i, r, n, d, e[a + 1], 5, -165796510);
    d = md5_gg(d, i, r, n, e[a + 6], 9, -1069501632);
    n = md5_gg(n, d, i, r, e[a + 11], 14, 643717713);
    r = md5_gg(r, n, d, i, e[a + 0], 20, -373897302);
    i = md5_gg(i, r, n, d, e[a + 5], 5, -701558691);
    d = md5_gg(d, i, r, n, e[a + 10], 9, 38016083);
    n = md5_gg(n, d, i, r, e[a + 15], 14, -660478335);
    r = md5_gg(r, n, d, i, e[a + 4], 20, -405537848);
    i = md5_gg(i, r, n, d, e[a + 9], 5, 568446438);
    d = md5_gg(d, i, r, n, e[a + 14], 9, -1019803690);
    n = md5_gg(n, d, i, r, e[a + 3], 14, -187363961);
    r = md5_gg(r, n, d, i, e[a + 8], 20, 1163531501);
    i = md5_gg(i, r, n, d, e[a + 13], 5, -1444681467);
    d = md5_gg(d, i, r, n, e[a + 2], 9, -51403784);
    n = md5_gg(n, d, i, r, e[a + 7], 14, 1735328473);
    r = md5_gg(r, n, d, i, e[a + 12], 20, -1926607734);
    i = md5_hh(i, r, n, d, e[a + 5], 4, -378558);
    d = md5_hh(d, i, r, n, e[a + 8], 11, -2022574463);
    n = md5_hh(n, d, i, r, e[a + 11], 16, 1839030562);
    r = md5_hh(r, n, d, i, e[a + 14], 23, -35309556);
    i = md5_hh(i, r, n, d, e[a + 1], 4, -1530992060);
    d = md5_hh(d, i, r, n, e[a + 4], 11, 1272893353);
    n = md5_hh(n, d, i, r, e[a + 7], 16, -155497632);
    r = md5_hh(r, n, d, i, e[a + 10], 23, -1094730640);
    i = md5_hh(i, r, n, d, e[a + 13], 4, 681279174);
    d = md5_hh(d, i, r, n, e[a + 0], 11, -358537222);
    n = md5_hh(n, d, i, r, e[a + 3], 16, -722521979);
    r = md5_hh(r, n, d, i, e[a + 6], 23, 76029189);
    i = md5_hh(i, r, n, d, e[a + 9], 4, -640364487);
    d = md5_hh(d, i, r, n, e[a + 12], 11, -421815835);
    n = md5_hh(n, d, i, r, e[a + 15], 16, 530742520);
    r = md5_hh(r, n, d, i, e[a + 2], 23, -995338651);
    i = md5_ii(i, r, n, d, e[a + 0], 6, -198630844);
    d = md5_ii(d, i, r, n, e[a + 7], 10, 1126891415);
    n = md5_ii(n, d, i, r, e[a + 14], 15, -1416354905);
    r = md5_ii(r, n, d, i, e[a + 5], 21, -57434055);
    i = md5_ii(i, r, n, d, e[a + 12], 6, 1700485571);
    d = md5_ii(d, i, r, n, e[a + 3], 10, -1894986606);
    n = md5_ii(n, d, i, r, e[a + 10], 15, -1051523);
    r = md5_ii(r, n, d, i, e[a + 1], 21, -2054922799);
    i = md5_ii(i, r, n, d, e[a + 8], 6, 1873313359);
    d = md5_ii(d, i, r, n, e[a + 15], 10, -30611744);
    n = md5_ii(n, d, i, r, e[a + 6], 15, -1560198380);
    r = md5_ii(r, n, d, i, e[a + 13], 21, 1309151649);
    i = md5_ii(i, r, n, d, e[a + 4], 6, -145523070);
    d = md5_ii(d, i, r, n, e[a + 11], 10, -1120210379);
    n = md5_ii(n, d, i, r, e[a + 2], 15, 718787259);
    r = md5_ii(r, n, d, i, e[a + 9], 21, -343485551);
    i = safe_add(i, o);
    r = safe_add(r, s);
    n = safe_add(n, l);
    d = safe_add(d, c);
  }
  return Array(i, r, n, d);
}

function md5_cmn(e, t, i, r, n, d) {
  return safe_add(bit_rol(safe_add(safe_add(t, e), safe_add(r, d)), n), i);
}

function md5_ff(e, t, i, r, n, d, a) {
  return md5_cmn((t & i) | (~t & r), e, t, n, d, a);
}

function md5_gg(e, t, i, r, n, d, a) {
  return md5_cmn((t & r) | (i & ~r), e, t, n, d, a);
}

function md5_hh(e, t, i, r, n, d, a) {
  return md5_cmn(t ^ i ^ r, e, t, n, d, a);
}

function md5_ii(e, t, i, r, n, d, a) {
  return md5_cmn(i ^ (t | ~r), e, t, n, d, a);
}

function safe_add(e, t) {
  var i = (e & 65535) + (t & 65535);
  var r = (e >> 16) + (t >> 16) + (i >> 16);
  return (r << 16) | (i & 65535);
}

function bit_rol(e, t) {
  return (e << t) | (e >>> (32 - t));
}

function md5cycle(e, t) {
  var i = e[0],
    r = e[1],
    n = e[2],
    d = e[3];
  i = ff(i, r, n, d, t[0], 7, -680876936);
  d = ff(d, i, r, n, t[1], 12, -389564586);
  n = ff(n, d, i, r, t[2], 17, 606105819);
  r = ff(r, n, d, i, t[3], 22, -1044525330);
  i = ff(i, r, n, d, t[4], 7, -176418897);
  d = ff(d, i, r, n, t[5], 12, 1200080426);
  n = ff(n, d, i, r, t[6], 17, -1473231341);
  r = ff(r, n, d, i, t[7], 22, -45705983);
  i = ff(i, r, n, d, t[8], 7, 1770035416);
  d = ff(d, i, r, n, t[9], 12, -1958414417);
  n = ff(n, d, i, r, t[10], 17, -42063);
  r = ff(r, n, d, i, t[11], 22, -1990404162);
  i = ff(i, r, n, d, t[12], 7, 1804603682);
  d = ff(d, i, r, n, t[13], 12, -40341101);
  n = ff(n, d, i, r, t[14], 17, -1502002290);
  r = ff(r, n, d, i, t[15], 22, 1236535329);
  i = gg(i, r, n, d, t[1], 5, -165796510);
  d = gg(d, i, r, n, t[6], 9, -1069501632);
  n = gg(n, d, i, r, t[11], 14, 643717713);
  r = gg(r, n, d, i, t[0], 20, -373897302);
  i = gg(i, r, n, d, t[5], 5, -701558691);
  d = gg(d, i, r, n, t[10], 9, 38016083);
  n = gg(n, d, i, r, t[15], 14, -660478335);
  r = gg(r, n, d, i, t[4], 20, -405537848);
  i = gg(i, r, n, d, t[9], 5, 568446438);
  d = gg(d, i, r, n, t[14], 9, -1019803690);
  n = gg(n, d, i, r, t[3], 14, -187363961);
  r = gg(r, n, d, i, t[8], 20, 1163531501);
  i = gg(i, r, n, d, t[13], 5, -1444681467);
  d = gg(d, i, r, n, t[2], 9, -51403784);
  n = gg(n, d, i, r, t[7], 14, 1735328473);
  r = gg(r, n, d, i, t[12], 20, -1926607734);
  i = hh(i, r, n, d, t[5], 4, -378558);
  d = hh(d, i, r, n, t[8], 11, -2022574463);
  n = hh(n, d, i, r, t[11], 16, 1839030562);
  r = hh(r, n, d, i, t[14], 23, -35309556);
  i = hh(i, r, n, d, t[1], 4, -1530992060);
  d = hh(d, i, r, n, t[4], 11, 1272893353);
  n = hh(n, d, i, r, t[7], 16, -155497632);
  r = hh(r, n, d, i, t[10], 23, -1094730640);
  i = hh(i, r, n, d, t[13], 4, 681279174);
  d = hh(d, i, r, n, t[0], 11, -358537222);
  n = hh(n, d, i, r, t[3], 16, -722521979);
  r = hh(r, n, d, i, t[6], 23, 76029189);
  i = hh(i, r, n, d, t[9], 4, -640364487);
  d = hh(d, i, r, n, t[12], 11, -421815835);
  n = hh(n, d, i, r, t[15], 16, 530742520);
  r = hh(r, n, d, i, t[2], 23, -995338651);
  i = ii(i, r, n, d, t[0], 6, -198630844);
  d = ii(d, i, r, n, t[7], 10, 1126891415);
  n = ii(n, d, i, r, t[14], 15, -1416354905);
  r = ii(r, n, d, i, t[5], 21, -57434055);
  i = ii(i, r, n, d, t[12], 6, 1700485571);
  d = ii(d, i, r, n, t[3], 10, -1894986606);
  n = ii(n, d, i, r, t[10], 15, -1051523);
  r = ii(r, n, d, i, t[1], 21, -2054922799);
  i = ii(i, r, n, d, t[8], 6, 1873313359);
  d = ii(d, i, r, n, t[15], 10, -30611744);
  n = ii(n, d, i, r, t[6], 15, -1560198380);
  r = ii(r, n, d, i, t[13], 21, 1309151649);
  i = ii(i, r, n, d, t[4], 6, -145523070);
  d = ii(d, i, r, n, t[11], 10, -1120210379);
  n = ii(n, d, i, r, t[2], 15, 718787259);
  r = ii(r, n, d, i, t[9], 21, -343485551);
  e[0] = add32(i, e[0]);
  e[1] = add32(r, e[1]);
  e[2] = add32(n, e[2]);
  e[3] = add32(d, e[3]);
}

function cmn(e, t, i, r, n, d) {
  t = add32(add32(t, e), add32(r, d));
  return add32((t << n) | (t >>> (32 - n)), i);
}

function ff(e, t, i, r, n, d, a) {
  return cmn((t & i) | (~t & r), e, t, n, d, a);
}

function gg(e, t, i, r, n, d, a) {
  return cmn((t & r) | (i & ~r), e, t, n, d, a);
}

function hh(e, t, i, r, n, d, a) {
  return cmn(t ^ i ^ r, e, t, n, d, a);
}

function ii(e, t, i, r, n, d, a) {
  return cmn(i ^ (t | ~r), e, t, n, d, a);
}

function md51(e) {
  var t = "";
  var i = e.length,
    r = [1732584193, -271733879, -1732584194, 271733878],
    n;
  for (n = 64; n <= e.length; n += 64) {
    md5cycle(r, md5blk(e.substring(n - 64, n)));
  }
  e = e.substring(n - 64);
  var d = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (n = 0; n < e.length; n++) d[n >> 2] |= e.charCodeAt(n) << (n % 4 << 3);
  d[n >> 2] |= 128 << (n % 4 << 3);
  if (n > 55) {
    md5cycle(r, d);
    for (n = 0; n < 16; n++) d[n] = 0;
  }
  d[14] = i * 8;
  md5cycle(r, d);
  return r;
}

function md5blk(e) {
  var t = [],
    i;
  for (i = 0; i < 64; i += 4) {
    t[i >> 2] = e.charCodeAt(i) + (e.charCodeAt(i + 1) << 8) + (e.charCodeAt(i + 2) << 16) + (e.charCodeAt(i + 3) << 24);
  }
  return t;
}
var hex_chr = "0123456789abcdef".split("");

function rhex(e) {
  var t = "",
    i = 0;
  for (; i < 4; i++) t += hex_chr[(e >> (i * 8 + 4)) & 15] + hex_chr[(e >> (i * 8)) & 15];
  return t;
}

function hex(e) {
  for (var t = 0; t < e.length; t++) e[t] = rhex(e[t]);
  return e.join("");
}

function log_md5(e) {
  return hex(md51(e));
}

function add32(e, t) {
  return (e + t) & 4294967295;
}
if (log_md5("hello") != "5d41402abc4b2a76b9719d911017c592") {
  function add32(e, t) {
    var i = (e & 65535) + (t & 65535),
      r = (e >> 16) + (t >> 16) + (i >> 16);
    return (r << 16) | (i & 65535);
  }
}
(function () {
  function e(e, t) {
    var i = e[0],
      r = e[1],
      n = e[2],
      d = e[3];
    i = a(i, r, n, d, t[0], 7, -680876936);
    d = a(d, i, r, n, t[1], 12, -389564586);
    n = a(n, d, i, r, t[2], 17, 606105819);
    r = a(r, n, d, i, t[3], 22, -1044525330);
    i = a(i, r, n, d, t[4], 7, -176418897);
    d = a(d, i, r, n, t[5], 12, 1200080426);
    n = a(n, d, i, r, t[6], 17, -1473231341);
    r = a(r, n, d, i, t[7], 22, -45705983);
    i = a(i, r, n, d, t[8], 7, 1770035416);
    d = a(d, i, r, n, t[9], 12, -1958414417);
    n = a(n, d, i, r, t[10], 17, -42063);
    r = a(r, n, d, i, t[11], 22, -1990404162);
    i = a(i, r, n, d, t[12], 7, 1804603682);
    d = a(d, i, r, n, t[13], 12, -40341101);
    n = a(n, d, i, r, t[14], 17, -1502002290);
    r = a(r, n, d, i, t[15], 22, 1236535329);
    i = s(i, r, n, d, t[1], 5, -165796510);
    d = s(d, i, r, n, t[6], 9, -1069501632);
    n = s(n, d, i, r, t[11], 14, 643717713);
    r = s(r, n, d, i, t[0], 20, -373897302);
    i = s(i, r, n, d, t[5], 5, -701558691);
    d = s(d, i, r, n, t[10], 9, 38016083);
    n = s(n, d, i, r, t[15], 14, -660478335);
    r = s(r, n, d, i, t[4], 20, -405537848);
    i = s(i, r, n, d, t[9], 5, 568446438);
    d = s(d, i, r, n, t[14], 9, -1019803690);
    n = s(n, d, i, r, t[3], 14, -187363961);
    r = s(r, n, d, i, t[8], 20, 1163531501);
    i = s(i, r, n, d, t[13], 5, -1444681467);
    d = s(d, i, r, n, t[2], 9, -51403784);
    n = s(n, d, i, r, t[7], 14, 1735328473);
    r = s(r, n, d, i, t[12], 20, -1926607734);
    i = l(i, r, n, d, t[5], 4, -378558);
    d = l(d, i, r, n, t[8], 11, -2022574463);
    n = l(n, d, i, r, t[11], 16, 1839030562);
    r = l(r, n, d, i, t[14], 23, -35309556);
    i = l(i, r, n, d, t[1], 4, -1530992060);
    d = l(d, i, r, n, t[4], 11, 1272893353);
    n = l(n, d, i, r, t[7], 16, -155497632);
    r = l(r, n, d, i, t[10], 23, -1094730640);
    i = l(i, r, n, d, t[13], 4, 681279174);
    d = l(d, i, r, n, t[0], 11, -358537222);
    n = l(n, d, i, r, t[3], 16, -722521979);
    r = l(r, n, d, i, t[6], 23, 76029189);
    i = l(i, r, n, d, t[9], 4, -640364487);
    d = l(d, i, r, n, t[12], 11, -421815835);
    n = l(n, d, i, r, t[15], 16, 530742520);
    r = l(r, n, d, i, t[2], 23, -995338651);
    i = c(i, r, n, d, t[0], 6, -198630844);
    d = c(d, i, r, n, t[7], 10, 1126891415);
    n = c(n, d, i, r, t[14], 15, -1416354905);
    r = c(r, n, d, i, t[5], 21, -57434055);
    i = c(i, r, n, d, t[12], 6, 1700485571);
    d = c(d, i, r, n, t[3], 10, -1894986606);
    n = c(n, d, i, r, t[10], 15, -1051523);
    r = c(r, n, d, i, t[1], 21, -2054922799);
    i = c(i, r, n, d, t[8], 6, 1873313359);
    d = c(d, i, r, n, t[15], 10, -30611744);
    n = c(n, d, i, r, t[6], 15, -1560198380);
    r = c(r, n, d, i, t[13], 21, 1309151649);
    i = c(i, r, n, d, t[4], 6, -145523070);
    d = c(d, i, r, n, t[11], 10, -1120210379);
    n = c(n, d, i, r, t[2], 15, 718787259);
    r = c(r, n, d, i, t[9], 21, -343485551);
    e[0] = g(i, e[0]);
    e[1] = g(r, e[1]);
    e[2] = g(n, e[2]);
    e[3] = g(d, e[3]);
  }

  function o(e, t, i, r, n, d) {
    t = g(g(t, e), g(r, d));
    return g((t << n) | (t >>> (32 - n)), i);
  }

  function a(e, t, i, r, n, d, a) {
    return o((t & i) | (~t & r), e, t, n, d, a);
  }

  function s(e, t, i, r, n, d, a) {
    return o((t & r) | (i & ~r), e, t, n, d, a);
  }

  function l(e, t, i, r, n, d, a) {
    return o(t ^ i ^ r, e, t, n, d, a);
  }

  function c(e, t, i, r, n, d, a) {
    return o(i ^ (t | ~r), e, t, n, d, a);
  }

  function g(e, t) {
    return (e + t) & 4294967295;
  }
  if (log_md5("hello") != "5d41402abc4b2a76b9719d911017c592") {
    function g(e, t) {
      var i = (e & 65535) + (t & 65535),
        r = (e >> 16) + (t >> 16) + (i >> 16);
      return (r << 16) | (i & 65535);
    }
  }
})();

win.P8LogSDK = P8LogSDK;









! function (t, e) {
  if (typeof exports === "object") {
    wx.CryptoJS = module.exports = exports = e();
  } else if (typeof define === "function" && define.amd) {
    define([], e);
  } else {
    wx.CryptoJS = t.CryptoJS = e();
  }
}(this, function () {
  var n, o, s, a, h, t, e, l, r, i, c, f, d, u, p, S, x, b, A, H, z, _, v, g, y, B, w, k, m, C, D, E, R, M, F, P, W, O, I, U = U || function (h) {
    var i;
    if ("undefined" != typeof window && window.crypto && (i = window.crypto), "undefined" != typeof self && self.crypto && (i = self.crypto), !(i = !(i = !(i = "undefined" != typeof globalThis && globalThis.crypto ? globalThis.crypto : i) && "undefined" != typeof window && window.msCrypto ? window.msCrypto : i) && "undefined" != typeof global && global.crypto ? global.crypto : i) && "function" == typeof require) try {
      i = require("crypto")
    } catch (t) {}
    var r = Object.create || function (t) {
      return e.prototype = t, t = new e, e.prototype = null, t
    };

    function e() {}
    var t = {},
      n = t.lib = {},
      o = n.Base = {
        extend: function (t) {
          var e = r(this);
          return t && e.mixIn(t), e.hasOwnProperty("init") && this.init !== e.init || (e.init = function () {
            e.$super.init.apply(this, arguments)
          }), (e.init.prototype = e).$super = this, e
        },
        create: function () {
          var t = this.extend();
          return t.init.apply(t, arguments), t
        },
        init: function () {},
        mixIn: function (t) {
          for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
          t.hasOwnProperty("toString") && (this.toString = t.toString)
        },
        clone: function () {
          return this.init.prototype.extend(this)
        }
      },
      l = n.WordArray = o.extend({
        init: function (t, e) {
          t = this.words = t || [], this.sigBytes = null != e ? e : 4 * t.length
        },
        toString: function (t) {
          return (t || c).stringify(this)
        },
        concat: function (t) {
          var e = this.words,
            r = t.words,
            i = this.sigBytes,
            n = t.sigBytes;
          if (this.clamp(), i % 4)
            for (var o = 0; o < n; o++) {
              var s = r[o >>> 2] >>> 24 - o % 4 * 8 & 255;
              e[i + o >>> 2] |= s << 24 - (i + o) % 4 * 8
            } else
              for (var c = 0; c < n; c += 4) e[i + c >>> 2] = r[c >>> 2];
          return this.sigBytes += n, this
        },
        clamp: function () {
          var t = this.words,
            e = this.sigBytes;
          t[e >>> 2] &= 4294967295 << 32 - e % 4 * 8, t.length = h.ceil(e / 4)
        },
        clone: function () {
          var t = o.clone.call(this);
          return t.words = this.words.slice(0), t
        },
        random: function (t) {
          for (var e = [], r = 0; r < t; r += 4) e.push(function () {
            if (i) {
              if ("function" == typeof i.getRandomValues) try {
                return i.getRandomValues(new Uint32Array(1))[0]
              } catch (t) {}
              if ("function" == typeof i.randomBytes) try {
                return i.randomBytes(4).readInt32LE()
              } catch (t) {}
            }
            throw new Error("Native crypto module could not be used to get secure random number.")
          }());
          return new l.init(e, t)
        }
      }),
      s = t.enc = {},
      c = s.Hex = {
        stringify: function (t) {
          for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n++) {
            var o = e[n >>> 2] >>> 24 - n % 4 * 8 & 255;
            i.push((o >>> 4).toString(16)), i.push((15 & o).toString(16))
          }
          return i.join("")
        },
        parse: function (t) {
          for (var e = t.length, r = [], i = 0; i < e; i += 2) r[i >>> 3] |= parseInt(t.substr(i, 2), 16) << 24 - i % 8 * 4;
          return new l.init(r, e / 2)
        }
      },
      a = s.Latin1 = {
        stringify: function (t) {
          for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n++) {
            var o = e[n >>> 2] >>> 24 - n % 4 * 8 & 255;
            i.push(String.fromCharCode(o))
          }
          return i.join("")
        },
        parse: function (t) {
          for (var e = t.length, r = [], i = 0; i < e; i++) r[i >>> 2] |= (255 & t.charCodeAt(i)) << 24 - i % 4 * 8;
          return new l.init(r, e)
        }
      },
      f = s.Utf8 = {
        stringify: function (t) {
          try {
            return decodeURIComponent(escape(a.stringify(t)))
          } catch (t) {
            throw new Error("Malformed UTF-8 data")
          }
        },
        parse: function (t) {
          return a.parse(unescape(encodeURIComponent(t)))
        }
      },
      d = n.BufferedBlockAlgorithm = o.extend({
        reset: function () {
          this._data = new l.init, this._nDataBytes = 0
        },
        _append: function (t) {
          "string" == typeof t && (t = f.parse(t)), this._data.concat(t), this._nDataBytes += t.sigBytes
        },
        _process: function (t) {
          var e, r = this._data,
            i = r.words,
            n = r.sigBytes,
            o = this.blockSize,
            s = n / (4 * o),
            c = (s = t ? h.ceil(s) : h.max((0 | s) - this._minBufferSize, 0)) * o,
            n = h.min(4 * c, n);
          if (c) {
            for (var a = 0; a < c; a += o) this._doProcessBlock(i, a);
            e = i.splice(0, c), r.sigBytes -= n
          }
          return new l.init(e, n)
        },
        clone: function () {
          var t = o.clone.call(this);
          return t._data = this._data.clone(), t
        },
        _minBufferSize: 0
      }),
      u = (n.Hasher = d.extend({
        cfg: o.extend(),
        init: function (t) {
          this.cfg = this.cfg.extend(t), this.reset()
        },
        reset: function () {
          d.reset.call(this), this._doReset()
        },
        update: function (t) {
          return this._append(t), this._process(), this
        },
        finalize: function (t) {
          return t && this._append(t), this._doFinalize()
        },
        blockSize: 16,
        _createHelper: function (r) {
          return function (t, e) {
            return new r.init(e).finalize(t)
          }
        },
        _createHmacHelper: function (r) {
          return function (t, e) {
            return new u.HMAC.init(r, e).finalize(t)
          }
        }
      }), t.algo = {});
    return t
  }(Math);

  function K(t, e, r) {
    return t & e | ~t & r
  }

  function X(t, e, r) {
    return t & r | e & ~r
  }

  function L(t, e) {
    return t << e | t >>> 32 - e
  }

  function j(t, e, r, i) {
    var n, o = this._iv;
    o ? (n = o.slice(0), this._iv = void 0) : n = this._prevBlock, i.encryptBlock(n, 0);
    for (var s = 0; s < r; s++) t[e + s] ^= n[s]
  }

  function T(t) {
    var e, r, i;
    return 255 == (t >> 24 & 255) ? (r = t >> 8 & 255, i = 255 & t, 255 === (e = t >> 16 & 255) ? (e = 0, 255 === r ? (r = 0, 255 === i ? i = 0 : ++i) : ++r) : ++e, t = 0, t += e << 16, t += r << 8, t += i) : t += 1 << 24, t
  }

  function N() {
    for (var t = this._X, e = this._C, r = 0; r < 8; r++) E[r] = e[r];
    e[0] = e[0] + 1295307597 + this._b | 0, e[1] = e[1] + 3545052371 + (e[0] >>> 0 < E[0] >>> 0 ? 1 : 0) | 0, e[2] = e[2] + 886263092 + (e[1] >>> 0 < E[1] >>> 0 ? 1 : 0) | 0, e[3] = e[3] + 1295307597 + (e[2] >>> 0 < E[2] >>> 0 ? 1 : 0) | 0, e[4] = e[4] + 3545052371 + (e[3] >>> 0 < E[3] >>> 0 ? 1 : 0) | 0, e[5] = e[5] + 886263092 + (e[4] >>> 0 < E[4] >>> 0 ? 1 : 0) | 0, e[6] = e[6] + 1295307597 + (e[5] >>> 0 < E[5] >>> 0 ? 1 : 0) | 0, e[7] = e[7] + 3545052371 + (e[6] >>> 0 < E[6] >>> 0 ? 1 : 0) | 0, this._b = e[7] >>> 0 < E[7] >>> 0 ? 1 : 0;
    for (r = 0; r < 8; r++) {
      var i = t[r] + e[r],
        n = 65535 & i,
        o = i >>> 16;
      R[r] = ((n * n >>> 17) + n * o >>> 15) + o * o ^ ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0)
    }
    t[0] = R[0] + (R[7] << 16 | R[7] >>> 16) + (R[6] << 16 | R[6] >>> 16) | 0, t[1] = R[1] + (R[0] << 8 | R[0] >>> 24) + R[7] | 0, t[2] = R[2] + (R[1] << 16 | R[1] >>> 16) + (R[0] << 16 | R[0] >>> 16) | 0, t[3] = R[3] + (R[2] << 8 | R[2] >>> 24) + R[1] | 0, t[4] = R[4] + (R[3] << 16 | R[3] >>> 16) + (R[2] << 16 | R[2] >>> 16) | 0, t[5] = R[5] + (R[4] << 8 | R[4] >>> 24) + R[3] | 0, t[6] = R[6] + (R[5] << 16 | R[5] >>> 16) + (R[4] << 16 | R[4] >>> 16) | 0, t[7] = R[7] + (R[6] << 8 | R[6] >>> 24) + R[5] | 0
  }

  function q() {
    for (var t = this._X, e = this._C, r = 0; r < 8; r++) O[r] = e[r];
    e[0] = e[0] + 1295307597 + this._b | 0, e[1] = e[1] + 3545052371 + (e[0] >>> 0 < O[0] >>> 0 ? 1 : 0) | 0, e[2] = e[2] + 886263092 + (e[1] >>> 0 < O[1] >>> 0 ? 1 : 0) | 0, e[3] = e[3] + 1295307597 + (e[2] >>> 0 < O[2] >>> 0 ? 1 : 0) | 0, e[4] = e[4] + 3545052371 + (e[3] >>> 0 < O[3] >>> 0 ? 1 : 0) | 0, e[5] = e[5] + 886263092 + (e[4] >>> 0 < O[4] >>> 0 ? 1 : 0) | 0, e[6] = e[6] + 1295307597 + (e[5] >>> 0 < O[5] >>> 0 ? 1 : 0) | 0, e[7] = e[7] + 3545052371 + (e[6] >>> 0 < O[6] >>> 0 ? 1 : 0) | 0, this._b = e[7] >>> 0 < O[7] >>> 0 ? 1 : 0;
    for (r = 0; r < 8; r++) {
      var i = t[r] + e[r],
        n = 65535 & i,
        o = i >>> 16;
      I[r] = ((n * n >>> 17) + n * o >>> 15) + o * o ^ ((4294901760 & i) * i | 0) + ((65535 & i) * i | 0)
    }
    t[0] = I[0] + (I[7] << 16 | I[7] >>> 16) + (I[6] << 16 | I[6] >>> 16) | 0, t[1] = I[1] + (I[0] << 8 | I[0] >>> 24) + I[7] | 0, t[2] = I[2] + (I[1] << 16 | I[1] >>> 16) + (I[0] << 16 | I[0] >>> 16) | 0, t[3] = I[3] + (I[2] << 8 | I[2] >>> 24) + I[1] | 0, t[4] = I[4] + (I[3] << 16 | I[3] >>> 16) + (I[2] << 16 | I[2] >>> 16) | 0, t[5] = I[5] + (I[4] << 8 | I[4] >>> 24) + I[3] | 0, t[6] = I[6] + (I[5] << 16 | I[5] >>> 16) + (I[4] << 16 | I[4] >>> 16) | 0, t[7] = I[7] + (I[6] << 8 | I[6] >>> 24) + I[5] | 0
  }
  return F = (M = U).lib, n = F.Base, o = F.WordArray, (M = M.x64 = {}).Word = n.extend({
      init: function (t, e) {
        this.high = t, this.low = e
      }
    }), M.WordArray = n.extend({
      init: function (t, e) {
        t = this.words = t || [], this.sigBytes = null != e ? e : 8 * t.length
      },
      toX32: function () {
        for (var t = this.words, e = t.length, r = [], i = 0; i < e; i++) {
          var n = t[i];
          r.push(n.high), r.push(n.low)
        }
        return o.create(r, this.sigBytes)
      },
      clone: function () {
        for (var t = n.clone.call(this), e = t.words = this.words.slice(0), r = e.length, i = 0; i < r; i++) e[i] = e[i].clone();
        return t
      }
    }), "function" == typeof ArrayBuffer && (P = U.lib.WordArray, s = P.init, (P.init = function (t) {
      if ((t = (t = t instanceof ArrayBuffer ? new Uint8Array(t) : t) instanceof Int8Array || "undefined" != typeof Uint8ClampedArray && t instanceof Uint8ClampedArray || t instanceof Int16Array || t instanceof Uint16Array || t instanceof Int32Array || t instanceof Uint32Array || t instanceof Float32Array || t instanceof Float64Array ? new Uint8Array(t.buffer, t.byteOffset, t.byteLength) : t) instanceof Uint8Array) {
        for (var e = t.byteLength, r = [], i = 0; i < e; i++) r[i >>> 2] |= t[i] << 24 - i % 4 * 8;
        s.call(this, r, e)
      } else s.apply(this, arguments)
    }).prototype = P),
    function () {
      var t = U,
        n = t.lib.WordArray,
        t = t.enc;
      t.Utf16 = t.Utf16BE = {
        stringify: function (t) {
          for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n += 2) {
            var o = e[n >>> 2] >>> 16 - n % 4 * 8 & 65535;
            i.push(String.fromCharCode(o))
          }
          return i.join("")
        },
        parse: function (t) {
          for (var e = t.length, r = [], i = 0; i < e; i++) r[i >>> 1] |= t.charCodeAt(i) << 16 - i % 2 * 16;
          return n.create(r, 2 * e)
        }
      };

      function s(t) {
        return t << 8 & 4278255360 | t >>> 8 & 16711935
      }
      t.Utf16LE = {
        stringify: function (t) {
          for (var e = t.words, r = t.sigBytes, i = [], n = 0; n < r; n += 2) {
            var o = s(e[n >>> 2] >>> 16 - n % 4 * 8 & 65535);
            i.push(String.fromCharCode(o))
          }
          return i.join("")
        },
        parse: function (t) {
          for (var e = t.length, r = [], i = 0; i < e; i++) r[i >>> 1] |= s(t.charCodeAt(i) << 16 - i % 2 * 16);
          return n.create(r, 2 * e)
        }
      }
    }(), a = (w = U).lib.WordArray, w.enc.Base64 = {
      stringify: function (t) {
        var e = t.words,
          r = t.sigBytes,
          i = this._map;
        t.clamp();
        for (var n = [], o = 0; o < r; o += 3)
          for (var s = (e[o >>> 2] >>> 24 - o % 4 * 8 & 255) << 16 | (e[o + 1 >>> 2] >>> 24 - (o + 1) % 4 * 8 & 255) << 8 | e[o + 2 >>> 2] >>> 24 - (o + 2) % 4 * 8 & 255, c = 0; c < 4 && o + .75 * c < r; c++) n.push(i.charAt(s >>> 6 * (3 - c) & 63));
        var a = i.charAt(64);
        if (a)
          for (; n.length % 4;) n.push(a);
        return n.join("")
      },
      parse: function (t) {
        var e = t.length,
          r = this._map;
        if (!(i = this._reverseMap))
          for (var i = this._reverseMap = [], n = 0; n < r.length; n++) i[r.charCodeAt(n)] = n;
        var o = r.charAt(64);
        return !o || -1 !== (o = t.indexOf(o)) && (e = o),
          function (t, e, r) {
            for (var i = [], n = 0, o = 0; o < e; o++) {
              var s, c;
              o % 4 && (s = r[t.charCodeAt(o - 1)] << o % 4 * 2, c = r[t.charCodeAt(o)] >>> 6 - o % 4 * 2, c = s | c, i[n >>> 2] |= c << 24 - n % 4 * 8, n++)
            }
            return a.create(i, n)
          }(t, e, i)
      },
      _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    }, h = (F = U).lib.WordArray, F.enc.Base64url = {
      stringify: function (t, e = !0) {
        var r = t.words,
          i = t.sigBytes,
          n = e ? this._safe_map : this._map;
        t.clamp();
        for (var o = [], s = 0; s < i; s += 3)
          for (var c = (r[s >>> 2] >>> 24 - s % 4 * 8 & 255) << 16 | (r[s + 1 >>> 2] >>> 24 - (s + 1) % 4 * 8 & 255) << 8 | r[s + 2 >>> 2] >>> 24 - (s + 2) % 4 * 8 & 255, a = 0; a < 4 && s + .75 * a < i; a++) o.push(n.charAt(c >>> 6 * (3 - a) & 63));
        var h = n.charAt(64);
        if (h)
          for (; o.length % 4;) o.push(h);
        return o.join("")
      },
      parse: function (t, e = !0) {
        var r = t.length,
          i = e ? this._safe_map : this._map;
        if (!(n = this._reverseMap))
          for (var n = this._reverseMap = [], o = 0; o < i.length; o++) n[i.charCodeAt(o)] = o;
        e = i.charAt(64);
        return !e || -1 !== (e = t.indexOf(e)) && (r = e),
          function (t, e, r) {
            for (var i = [], n = 0, o = 0; o < e; o++) {
              var s, c;
              o % 4 && (s = r[t.charCodeAt(o - 1)] << o % 4 * 2, c = r[t.charCodeAt(o)] >>> 6 - o % 4 * 2, c = s | c, i[n >>> 2] |= c << 24 - n % 4 * 8, n++)
            }
            return h.create(i, n)
          }(t, r, n)
      },
      _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    },
    function (a) {
      var t = U,
        e = t.lib,
        r = e.WordArray,
        i = e.Hasher,
        e = t.algo,
        A = [];
      ! function () {
        for (var t = 0; t < 64; t++) A[t] = 4294967296 * a.abs(a.sin(t + 1)) | 0
      }();
      e = e.MD5 = i.extend({
        _doReset: function () {
          this._hash = new r.init([1732584193, 4023233417, 2562383102, 271733878])
        },
        _doProcessBlock: function (t, e) {
          for (var r = 0; r < 16; r++) {
            var i = e + r,
              n = t[i];
            t[i] = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8)
          }
          var o = this._hash.words,
            s = t[e + 0],
            c = t[e + 1],
            a = t[e + 2],
            h = t[e + 3],
            l = t[e + 4],
            f = t[e + 5],
            d = t[e + 6],
            u = t[e + 7],
            p = t[e + 8],
            _ = t[e + 9],
            y = t[e + 10],
            v = t[e + 11],
            g = t[e + 12],
            B = t[e + 13],
            w = t[e + 14],
            k = t[e + 15],
            m = H(m = o[0], b = o[1], x = o[2], S = o[3], s, 7, A[0]),
            S = H(S, m, b, x, c, 12, A[1]),
            x = H(x, S, m, b, a, 17, A[2]),
            b = H(b, x, S, m, h, 22, A[3]);
          m = H(m, b, x, S, l, 7, A[4]), S = H(S, m, b, x, f, 12, A[5]), x = H(x, S, m, b, d, 17, A[6]), b = H(b, x, S, m, u, 22, A[7]), m = H(m, b, x, S, p, 7, A[8]), S = H(S, m, b, x, _, 12, A[9]), x = H(x, S, m, b, y, 17, A[10]), b = H(b, x, S, m, v, 22, A[11]), m = H(m, b, x, S, g, 7, A[12]), S = H(S, m, b, x, B, 12, A[13]), x = H(x, S, m, b, w, 17, A[14]), m = z(m, b = H(b, x, S, m, k, 22, A[15]), x, S, c, 5, A[16]), S = z(S, m, b, x, d, 9, A[17]), x = z(x, S, m, b, v, 14, A[18]), b = z(b, x, S, m, s, 20, A[19]), m = z(m, b, x, S, f, 5, A[20]), S = z(S, m, b, x, y, 9, A[21]), x = z(x, S, m, b, k, 14, A[22]), b = z(b, x, S, m, l, 20, A[23]), m = z(m, b, x, S, _, 5, A[24]), S = z(S, m, b, x, w, 9, A[25]), x = z(x, S, m, b, h, 14, A[26]), b = z(b, x, S, m, p, 20, A[27]), m = z(m, b, x, S, B, 5, A[28]), S = z(S, m, b, x, a, 9, A[29]), x = z(x, S, m, b, u, 14, A[30]), m = C(m, b = z(b, x, S, m, g, 20, A[31]), x, S, f, 4, A[32]), S = C(S, m, b, x, p, 11, A[33]), x = C(x, S, m, b, v, 16, A[34]), b = C(b, x, S, m, w, 23, A[35]), m = C(m, b, x, S, c, 4, A[36]), S = C(S, m, b, x, l, 11, A[37]), x = C(x, S, m, b, u, 16, A[38]), b = C(b, x, S, m, y, 23, A[39]), m = C(m, b, x, S, B, 4, A[40]), S = C(S, m, b, x, s, 11, A[41]), x = C(x, S, m, b, h, 16, A[42]), b = C(b, x, S, m, d, 23, A[43]), m = C(m, b, x, S, _, 4, A[44]), S = C(S, m, b, x, g, 11, A[45]), x = C(x, S, m, b, k, 16, A[46]), m = D(m, b = C(b, x, S, m, a, 23, A[47]), x, S, s, 6, A[48]), S = D(S, m, b, x, u, 10, A[49]), x = D(x, S, m, b, w, 15, A[50]), b = D(b, x, S, m, f, 21, A[51]), m = D(m, b, x, S, g, 6, A[52]), S = D(S, m, b, x, h, 10, A[53]), x = D(x, S, m, b, y, 15, A[54]), b = D(b, x, S, m, c, 21, A[55]), m = D(m, b, x, S, p, 6, A[56]), S = D(S, m, b, x, k, 10, A[57]), x = D(x, S, m, b, d, 15, A[58]), b = D(b, x, S, m, B, 21, A[59]), m = D(m, b, x, S, l, 6, A[60]), S = D(S, m, b, x, v, 10, A[61]), x = D(x, S, m, b, a, 15, A[62]), b = D(b, x, S, m, _, 21, A[63]), o[0] = o[0] + m | 0, o[1] = o[1] + b | 0, o[2] = o[2] + x | 0, o[3] = o[3] + S | 0
        },
        _doFinalize: function () {
          var t = this._data,
            e = t.words,
            r = 8 * this._nDataBytes,
            i = 8 * t.sigBytes;
          e[i >>> 5] |= 128 << 24 - i % 32;
          var n = a.floor(r / 4294967296),
            r = r;
          e[15 + (64 + i >>> 9 << 4)] = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8), e[14 + (64 + i >>> 9 << 4)] = 16711935 & (r << 8 | r >>> 24) | 4278255360 & (r << 24 | r >>> 8), t.sigBytes = 4 * (e.length + 1), this._process();
          for (var e = this._hash, o = e.words, s = 0; s < 4; s++) {
            var c = o[s];
            o[s] = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8)
          }
          return e
        },
        clone: function () {
          var t = i.clone.call(this);
          return t._hash = this._hash.clone(), t
        }
      });

      function H(t, e, r, i, n, o, s) {
        s = t + (e & r | ~e & i) + n + s;
        return (s << o | s >>> 32 - o) + e
      }

      function z(t, e, r, i, n, o, s) {
        s = t + (e & i | r & ~i) + n + s;
        return (s << o | s >>> 32 - o) + e
      }

      function C(t, e, r, i, n, o, s) {
        s = t + (e ^ r ^ i) + n + s;
        return (s << o | s >>> 32 - o) + e
      }

      function D(t, e, r, i, n, o, s) {
        s = t + (r ^ (e | ~i)) + n + s;
        return (s << o | s >>> 32 - o) + e
      }
      t.MD5 = i._createHelper(e), t.HmacMD5 = i._createHmacHelper(e)
    }(Math), P = (M = U).lib, t = P.WordArray, e = P.Hasher, P = M.algo, l = [], P = P.SHA1 = e.extend({
      _doReset: function () {
        this._hash = new t.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
      },
      _doProcessBlock: function (t, e) {
        for (var r = this._hash.words, i = r[0], n = r[1], o = r[2], s = r[3], c = r[4], a = 0; a < 80; a++) {
          a < 16 ? l[a] = 0 | t[e + a] : (h = l[a - 3] ^ l[a - 8] ^ l[a - 14] ^ l[a - 16], l[a] = h << 1 | h >>> 31);
          var h = (i << 5 | i >>> 27) + c + l[a];
          h += a < 20 ? 1518500249 + (n & o | ~n & s) : a < 40 ? 1859775393 + (n ^ o ^ s) : a < 60 ? (n & o | n & s | o & s) - 1894007588 : (n ^ o ^ s) - 899497514, c = s, s = o, o = n << 30 | n >>> 2, n = i, i = h
        }
        r[0] = r[0] + i | 0, r[1] = r[1] + n | 0, r[2] = r[2] + o | 0, r[3] = r[3] + s | 0, r[4] = r[4] + c | 0
      },
      _doFinalize: function () {
        var t = this._data,
          e = t.words,
          r = 8 * this._nDataBytes,
          i = 8 * t.sigBytes;
        return e[i >>> 5] |= 128 << 24 - i % 32, e[14 + (64 + i >>> 9 << 4)] = Math.floor(r / 4294967296), e[15 + (64 + i >>> 9 << 4)] = r, t.sigBytes = 4 * e.length, this._process(), this._hash
      },
      clone: function () {
        var t = e.clone.call(this);
        return t._hash = this._hash.clone(), t
      }
    }), M.SHA1 = e._createHelper(P), M.HmacSHA1 = e._createHmacHelper(P),
    function (n) {
      var t = U,
        e = t.lib,
        r = e.WordArray,
        i = e.Hasher,
        e = t.algo,
        o = [],
        p = [];
      ! function () {
        function t(t) {
          return 4294967296 * (t - (0 | t)) | 0
        }
        for (var e = 2, r = 0; r < 64;) ! function (t) {
          for (var e = n.sqrt(t), r = 2; r <= e; r++)
            if (!(t % r)) return;
          return 1
        }(e) || (r < 8 && (o[r] = t(n.pow(e, .5))), p[r] = t(n.pow(e, 1 / 3)), r++), e++
      }();
      var _ = [],
        e = e.SHA256 = i.extend({
          _doReset: function () {
            this._hash = new r.init(o.slice(0))
          },
          _doProcessBlock: function (t, e) {
            for (var r = this._hash.words, i = r[0], n = r[1], o = r[2], s = r[3], c = r[4], a = r[5], h = r[6], l = r[7], f = 0; f < 64; f++) {
              f < 16 ? _[f] = 0 | t[e + f] : (d = _[f - 15], u = _[f - 2], _[f] = ((d << 25 | d >>> 7) ^ (d << 14 | d >>> 18) ^ d >>> 3) + _[f - 7] + ((u << 15 | u >>> 17) ^ (u << 13 | u >>> 19) ^ u >>> 10) + _[f - 16]);
              var d = i & n ^ i & o ^ n & o,
                u = l + ((c << 26 | c >>> 6) ^ (c << 21 | c >>> 11) ^ (c << 7 | c >>> 25)) + (c & a ^ ~c & h) + p[f] + _[f],
                l = h,
                h = a,
                a = c,
                c = s + u | 0,
                s = o,
                o = n,
                n = i,
                i = u + (((i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22)) + d) | 0
            }
            r[0] = r[0] + i | 0, r[1] = r[1] + n | 0, r[2] = r[2] + o | 0, r[3] = r[3] + s | 0, r[4] = r[4] + c | 0, r[5] = r[5] + a | 0, r[6] = r[6] + h | 0, r[7] = r[7] + l | 0
          },
          _doFinalize: function () {
            var t = this._data,
              e = t.words,
              r = 8 * this._nDataBytes,
              i = 8 * t.sigBytes;
            return e[i >>> 5] |= 128 << 24 - i % 32, e[14 + (64 + i >>> 9 << 4)] = n.floor(r / 4294967296), e[15 + (64 + i >>> 9 << 4)] = r, t.sigBytes = 4 * e.length, this._process(), this._hash
          },
          clone: function () {
            var t = i.clone.call(this);
            return t._hash = this._hash.clone(), t
          }
        });
      t.SHA256 = i._createHelper(e), t.HmacSHA256 = i._createHmacHelper(e)
    }(Math), r = (w = U).lib.WordArray, F = w.algo, i = F.SHA256, F = F.SHA224 = i.extend({
      _doReset: function () {
        this._hash = new r.init([3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428])
      },
      _doFinalize: function () {
        var t = i._doFinalize.call(this);
        return t.sigBytes -= 4, t
      }
    }), w.SHA224 = i._createHelper(F), w.HmacSHA224 = i._createHmacHelper(F),
    function () {
      var t = U,
        e = t.lib.Hasher,
        r = t.x64,
        i = r.Word,
        n = r.WordArray,
        r = t.algo;

      function o() {
        return i.create.apply(i, arguments)
      }
      var t1 = [o(1116352408, 3609767458), o(1899447441, 602891725), o(3049323471, 3964484399), o(3921009573, 2173295548), o(961987163, 4081628472), o(1508970993, 3053834265), o(2453635748, 2937671579), o(2870763221, 3664609560), o(3624381080, 2734883394), o(310598401, 1164996542), o(607225278, 1323610764), o(1426881987, 3590304994), o(1925078388, 4068182383), o(2162078206, 991336113), o(2614888103, 633803317), o(3248222580, 3479774868), o(3835390401, 2666613458), o(4022224774, 944711139), o(264347078, 2341262773), o(604807628, 2007800933), o(770255983, 1495990901), o(1249150122, 1856431235), o(1555081692, 3175218132), o(1996064986, 2198950837), o(2554220882, 3999719339), o(2821834349, 766784016), o(2952996808, 2566594879), o(3210313671, 3203337956), o(3336571891, 1034457026), o(3584528711, 2466948901), o(113926993, 3758326383), o(338241895, 168717936), o(666307205, 1188179964), o(773529912, 1546045734), o(1294757372, 1522805485), o(1396182291, 2643833823), o(1695183700, 2343527390), o(1986661051, 1014477480), o(2177026350, 1206759142), o(2456956037, 344077627), o(2730485921, 1290863460), o(2820302411, 3158454273), o(3259730800, 3505952657), o(3345764771, 106217008), o(3516065817, 3606008344), o(3600352804, 1432725776), o(4094571909, 1467031594), o(275423344, 851169720), o(430227734, 3100823752), o(506948616, 1363258195), o(659060556, 3750685593), o(883997877, 3785050280), o(958139571, 3318307427), o(1322822218, 3812723403), o(1537002063, 2003034995), o(1747873779, 3602036899), o(1955562222, 1575990012), o(2024104815, 1125592928), o(2227730452, 2716904306), o(2361852424, 442776044), o(2428436474, 593698344), o(2756734187, 3733110249), o(3204031479, 2999351573), o(3329325298, 3815920427), o(3391569614, 3928383900), o(3515267271, 566280711), o(3940187606, 3454069534), o(4118630271, 4000239992), o(116418474, 1914138554), o(174292421, 2731055270), o(289380356, 3203993006), o(460393269, 320620315), o(685471733, 587496836), o(852142971, 1086792851), o(1017036298, 365543100), o(1126000580, 2618297676), o(1288033470, 3409855158), o(1501505948, 4234509866), o(1607167915, 987167468), o(1816402316, 1246189591)],
        e1 = [];
      ! function () {
        for (var t = 0; t < 80; t++) e1[t] = o()
      }();
      r = r.SHA512 = e.extend({
        _doReset: function () {
          this._hash = new n.init([new i.init(1779033703, 4089235720), new i.init(3144134277, 2227873595), new i.init(1013904242, 4271175723), new i.init(2773480762, 1595750129), new i.init(1359893119, 2917565137), new i.init(2600822924, 725511199), new i.init(528734635, 4215389547), new i.init(1541459225, 327033209)])
        },
        _doProcessBlock: function (t, e) {
          for (var r = this._hash.words, i = r[0], n = r[1], o = r[2], s = r[3], c = r[4], a = r[5], h = r[6], l = r[7], f = i.high, d = i.low, u = n.high, p = n.low, _ = o.high, y = o.low, v = s.high, g = s.low, B = c.high, w = c.low, k = a.high, m = a.low, S = h.high, x = h.low, b = l.high, r = l.low, A = f, H = d, z = u, C = p, D = _, E = y, R = v, M = g, F = B, P = w, W = k, O = m, I = S, U = x, K = b, X = r, L = 0; L < 80; L++) {
            var j, T, N = e1[L];
            L < 16 ? (T = N.high = 0 | t[e + 2 * L], j = N.low = 0 | t[e + 2 * L + 1]) : ($ = (q = e1[L - 15]).high, J = q.low, G = (Q = e1[L - 2]).high, V = Q.low, Z = (Y = e1[L - 7]).high, q = Y.low, Y = (Q = e1[L - 16]).high, T = (T = (($ >>> 1 | J << 31) ^ ($ >>> 8 | J << 24) ^ $ >>> 7) + Z + ((j = (Z = (J >>> 1 | $ << 31) ^ (J >>> 8 | $ << 24) ^ (J >>> 7 | $ << 25)) + q) >>> 0 < Z >>> 0 ? 1 : 0)) + ((G >>> 19 | V << 13) ^ (G << 3 | V >>> 29) ^ G >>> 6) + ((j += J = (V >>> 19 | G << 13) ^ (V << 3 | G >>> 29) ^ (V >>> 6 | G << 26)) >>> 0 < J >>> 0 ? 1 : 0), j += $ = Q.low, N.high = T = T + Y + (j >>> 0 < $ >>> 0 ? 1 : 0), N.low = j);
            var q = F & W ^ ~F & I,
              Z = P & O ^ ~P & U,
              V = A & z ^ A & D ^ z & D,
              G = (H >>> 28 | A << 4) ^ (H << 30 | A >>> 2) ^ (H << 25 | A >>> 7),
              J = t1[L],
              Q = J.high,
              Y = J.low,
              $ = X + ((P >>> 14 | F << 18) ^ (P >>> 18 | F << 14) ^ (P << 23 | F >>> 9)),
              N = K + ((F >>> 14 | P << 18) ^ (F >>> 18 | P << 14) ^ (F << 23 | P >>> 9)) + ($ >>> 0 < X >>> 0 ? 1 : 0),
              J = G + (H & C ^ H & E ^ C & E),
              K = I,
              X = U,
              I = W,
              U = O,
              W = F,
              O = P,
              F = R + (N = (N = (N = N + q + (($ = $ + Z) >>> 0 < Z >>> 0 ? 1 : 0)) + Q + (($ = $ + Y) >>> 0 < Y >>> 0 ? 1 : 0)) + T + (($ = $ + j) >>> 0 < j >>> 0 ? 1 : 0)) + ((P = M + $ | 0) >>> 0 < M >>> 0 ? 1 : 0) | 0,
              R = D,
              M = E,
              D = z,
              E = C,
              z = A,
              C = H,
              A = N + (((A >>> 28 | H << 4) ^ (A << 30 | H >>> 2) ^ (A << 25 | H >>> 7)) + V + (J >>> 0 < G >>> 0 ? 1 : 0)) + ((H = $ + J | 0) >>> 0 < $ >>> 0 ? 1 : 0) | 0
          }
          d = i.low = d + H, i.high = f + A + (d >>> 0 < H >>> 0 ? 1 : 0), p = n.low = p + C, n.high = u + z + (p >>> 0 < C >>> 0 ? 1 : 0), y = o.low = y + E, o.high = _ + D + (y >>> 0 < E >>> 0 ? 1 : 0), g = s.low = g + M, s.high = v + R + (g >>> 0 < M >>> 0 ? 1 : 0), w = c.low = w + P, c.high = B + F + (w >>> 0 < P >>> 0 ? 1 : 0), m = a.low = m + O, a.high = k + W + (m >>> 0 < O >>> 0 ? 1 : 0), x = h.low = x + U, h.high = S + I + (x >>> 0 < U >>> 0 ? 1 : 0), r = l.low = r + X, l.high = b + K + (r >>> 0 < X >>> 0 ? 1 : 0)
        },
        _doFinalize: function () {
          var t = this._data,
            e = t.words,
            r = 8 * this._nDataBytes,
            i = 8 * t.sigBytes;
          return e[i >>> 5] |= 128 << 24 - i % 32, e[30 + (128 + i >>> 10 << 5)] = Math.floor(r / 4294967296), e[31 + (128 + i >>> 10 << 5)] = r, t.sigBytes = 4 * e.length, this._process(), this._hash.toX32()
        },
        clone: function () {
          var t = e.clone.call(this);
          return t._hash = this._hash.clone(), t
        },
        blockSize: 32
      });
      t.SHA512 = e._createHelper(r), t.HmacSHA512 = e._createHmacHelper(r)
    }(), P = (M = U).x64, c = P.Word, f = P.WordArray, P = M.algo, d = P.SHA512, P = P.SHA384 = d.extend({
      _doReset: function () {
        this._hash = new f.init([new c.init(3418070365, 3238371032), new c.init(1654270250, 914150663), new c.init(2438529370, 812702999), new c.init(355462360, 4144912697), new c.init(1731405415, 4290775857), new c.init(2394180231, 1750603025), new c.init(3675008525, 1694076839), new c.init(1203062813, 3204075428)])
      },
      _doFinalize: function () {
        var t = d._doFinalize.call(this);
        return t.sigBytes -= 16, t
      }
    }), M.SHA384 = d._createHelper(P), M.HmacSHA384 = d._createHmacHelper(P),
    function (l) {
      var t = U,
        e = t.lib,
        f = e.WordArray,
        i = e.Hasher,
        d = t.x64.Word,
        e = t.algo,
        A = [],
        H = [],
        z = [];
      ! function () {
        for (var t = 1, e = 0, r = 0; r < 24; r++) {
          A[t + 5 * e] = (r + 1) * (r + 2) / 2 % 64;
          var i = (2 * t + 3 * e) % 5;
          t = e % 5, e = i
        }
        for (t = 0; t < 5; t++)
          for (e = 0; e < 5; e++) H[t + 5 * e] = e + (2 * t + 3 * e) % 5 * 5;
        for (var n = 1, o = 0; o < 24; o++) {
          for (var s, c = 0, a = 0, h = 0; h < 7; h++) 1 & n && ((s = (1 << h) - 1) < 32 ? a ^= 1 << s : c ^= 1 << s - 32), 128 & n ? n = n << 1 ^ 113 : n <<= 1;
          z[o] = d.create(c, a)
        }
      }();
      var C = [];
      ! function () {
        for (var t = 0; t < 25; t++) C[t] = d.create()
      }();
      e = e.SHA3 = i.extend({
        cfg: i.cfg.extend({
          outputLength: 512
        }),
        _doReset: function () {
          for (var t = this._state = [], e = 0; e < 25; e++) t[e] = new d.init;
          this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32
        },
        _doProcessBlock: function (t, e) {
          for (var r = this._state, i = this.blockSize / 2, n = 0; n < i; n++) {
            var o = t[e + 2 * n],
              s = t[e + 2 * n + 1],
              o = 16711935 & (o << 8 | o >>> 24) | 4278255360 & (o << 24 | o >>> 8);
            (m = r[n]).high ^= s = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8), m.low ^= o
          }
          for (var c = 0; c < 24; c++) {
            for (var a = 0; a < 5; a++) {
              for (var h = 0, l = 0, f = 0; f < 5; f++) h ^= (m = r[a + 5 * f]).high, l ^= m.low;
              var d = C[a];
              d.high = h, d.low = l
            }
            for (a = 0; a < 5; a++)
              for (var u = C[(a + 4) % 5], p = C[(a + 1) % 5], _ = p.high, p = p.low, h = u.high ^ (_ << 1 | p >>> 31), l = u.low ^ (p << 1 | _ >>> 31), f = 0; f < 5; f++)(m = r[a + 5 * f]).high ^= h, m.low ^= l;
            for (var y = 1; y < 25; y++) {
              var v = (m = r[y]).high,
                g = m.low,
                B = A[y];
              l = B < 32 ? (h = v << B | g >>> 32 - B, g << B | v >>> 32 - B) : (h = g << B - 32 | v >>> 64 - B, v << B - 32 | g >>> 64 - B);
              B = C[H[y]];
              B.high = h, B.low = l
            }
            var w = C[0],
              k = r[0];
            w.high = k.high, w.low = k.low;
            for (a = 0; a < 5; a++)
              for (f = 0; f < 5; f++) {
                var m = r[y = a + 5 * f],
                  S = C[y],
                  x = C[(a + 1) % 5 + 5 * f],
                  b = C[(a + 2) % 5 + 5 * f];
                m.high = S.high ^ ~x.high & b.high, m.low = S.low ^ ~x.low & b.low
              }
            m = r[0], k = z[c];
            m.high ^= k.high, m.low ^= k.low
          }
        },
        _doFinalize: function () {
          var t = this._data,
            e = t.words,
            r = (this._nDataBytes, 8 * t.sigBytes),
            i = 32 * this.blockSize;
          e[r >>> 5] |= 1 << 24 - r % 32, e[(l.ceil((1 + r) / i) * i >>> 5) - 1] |= 128, t.sigBytes = 4 * e.length, this._process();
          for (var n = this._state, e = this.cfg.outputLength / 8, o = e / 8, s = [], c = 0; c < o; c++) {
            var a = n[c],
              h = a.high,
              a = a.low,
              h = 16711935 & (h << 8 | h >>> 24) | 4278255360 & (h << 24 | h >>> 8);
            s.push(a = 16711935 & (a << 8 | a >>> 24) | 4278255360 & (a << 24 | a >>> 8)), s.push(h)
          }
          return new f.init(s, e)
        },
        clone: function () {
          for (var t = i.clone.call(this), e = t._state = this._state.slice(0), r = 0; r < 25; r++) e[r] = e[r].clone();
          return t
        }
      });
      t.SHA3 = i._createHelper(e), t.HmacSHA3 = i._createHmacHelper(e)
    }(Math), Math, F = (w = U).lib, u = F.WordArray, p = F.Hasher, F = w.algo, S = u.create([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]), x = u.create([5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]), b = u.create([11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]), A = u.create([8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]), H = u.create([0, 1518500249, 1859775393, 2400959708, 2840853838]), z = u.create([1352829926, 1548603684, 1836072691, 2053994217, 0]), F = F.RIPEMD160 = p.extend({
      _doReset: function () {
        this._hash = u.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
      },
      _doProcessBlock: function (t, e) {
        for (var r = 0; r < 16; r++) {
          var i = e + r,
            n = t[i];
          t[i] = 16711935 & (n << 8 | n >>> 24) | 4278255360 & (n << 24 | n >>> 8)
        }
        for (var o, s, c, a, h, l, f = this._hash.words, d = H.words, u = z.words, p = S.words, _ = x.words, y = b.words, v = A.words, g = o = f[0], B = s = f[1], w = c = f[2], k = a = f[3], m = h = f[4], r = 0; r < 80; r += 1) l = o + t[e + p[r]] | 0, l += r < 16 ? (s ^ c ^ a) + d[0] : r < 32 ? K(s, c, a) + d[1] : r < 48 ? ((s | ~c) ^ a) + d[2] : r < 64 ? X(s, c, a) + d[3] : (s ^ (c | ~a)) + d[4], l = (l = L(l |= 0, y[r])) + h | 0, o = h, h = a, a = L(c, 10), c = s, s = l, l = g + t[e + _[r]] | 0, l += r < 16 ? (B ^ (w | ~k)) + u[0] : r < 32 ? X(B, w, k) + u[1] : r < 48 ? ((B | ~w) ^ k) + u[2] : r < 64 ? K(B, w, k) + u[3] : (B ^ w ^ k) + u[4], l = (l = L(l |= 0, v[r])) + m | 0, g = m, m = k, k = L(w, 10), w = B, B = l;
        l = f[1] + c + k | 0, f[1] = f[2] + a + m | 0, f[2] = f[3] + h + g | 0, f[3] = f[4] + o + B | 0, f[4] = f[0] + s + w | 0, f[0] = l
      },
      _doFinalize: function () {
        var t = this._data,
          e = t.words,
          r = 8 * this._nDataBytes,
          i = 8 * t.sigBytes;
        e[i >>> 5] |= 128 << 24 - i % 32, e[14 + (64 + i >>> 9 << 4)] = 16711935 & (r << 8 | r >>> 24) | 4278255360 & (r << 24 | r >>> 8), t.sigBytes = 4 * (e.length + 1), this._process();
        for (var e = this._hash, n = e.words, o = 0; o < 5; o++) {
          var s = n[o];
          n[o] = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8)
        }
        return e
      },
      clone: function () {
        var t = p.clone.call(this);
        return t._hash = this._hash.clone(), t
      }
    }), w.RIPEMD160 = p._createHelper(F), w.HmacRIPEMD160 = p._createHmacHelper(F), P = (M = U).lib.Base, _ = M.enc.Utf8, M.algo.HMAC = P.extend({
      init: function (t, e) {
        t = this._hasher = new t.init, "string" == typeof e && (e = _.parse(e));
        var r = t.blockSize,
          i = 4 * r;
        (e = e.sigBytes > i ? t.finalize(e) : e).clamp();
        for (var t = this._oKey = e.clone(), e = this._iKey = e.clone(), n = t.words, o = e.words, s = 0; s < r; s++) n[s] ^= 1549556828, o[s] ^= 909522486;
        t.sigBytes = e.sigBytes = i, this.reset()
      },
      reset: function () {
        var t = this._hasher;
        t.reset(), t.update(this._iKey)
      },
      update: function (t) {
        return this._hasher.update(t), this
      },
      finalize: function (t) {
        var e = this._hasher,
          t = e.finalize(t);
        return e.reset(), e.finalize(this._oKey.clone().concat(t))
      }
    }), F = (w = U).lib, M = F.Base, v = F.WordArray, P = w.algo, F = P.SHA1, g = P.HMAC, y = P.PBKDF2 = M.extend({
      cfg: M.extend({
        keySize: 4,
        hasher: F,
        iterations: 1
      }),
      init: function (t) {
        this.cfg = this.cfg.extend(t)
      },
      compute: function (t, e) {
        for (var r = this.cfg, i = g.create(r.hasher, t), n = v.create(), o = v.create([1]), s = n.words, c = o.words, a = r.keySize, h = r.iterations; s.length < a;) {
          var l = i.update(e).finalize(o);
          i.reset();
          for (var f = l.words, d = f.length, u = l, p = 1; p < h; p++) {
            u = i.finalize(u), i.reset();
            for (var _ = u.words, y = 0; y < d; y++) f[y] ^= _[y]
          }
          n.concat(l), c[0]++
        }
        return n.sigBytes = 4 * a, n
      }
    }), w.PBKDF2 = function (t, e, r) {
      return y.create(r).compute(t, e)
    }, M = (P = U).lib, F = M.Base, B = M.WordArray, w = P.algo, M = w.MD5, k = w.EvpKDF = F.extend({
      cfg: F.extend({
        keySize: 4,
        hasher: M,
        iterations: 1
      }),
      init: function (t) {
        this.cfg = this.cfg.extend(t)
      },
      compute: function (t, e) {
        for (var r, i = this.cfg, n = i.hasher.create(), o = B.create(), s = o.words, c = i.keySize, a = i.iterations; s.length < c;) {
          r && n.update(r), r = n.update(t).finalize(e), n.reset();
          for (var h = 1; h < a; h++) r = n.finalize(r), n.reset();
          o.concat(r)
        }
        return o.sigBytes = 4 * c, o
      }
    }), P.EvpKDF = function (t, e, r) {
      return k.create(r).compute(t, e)
    }, U.lib.Cipher || function () {
      var t = U,
        e = t.lib,
        r = e.Base,
        s = e.WordArray,
        i = e.BufferedBlockAlgorithm,
        n = t.enc,
        o = (n.Utf8, n.Base64),
        c = t.algo.EvpKDF,
        a = e.Cipher = i.extend({
          cfg: r.extend(),
          createEncryptor: function (t, e) {
            return this.create(this._ENC_XFORM_MODE, t, e)
          },
          createDecryptor: function (t, e) {
            return this.create(this._DEC_XFORM_MODE, t, e)
          },
          init: function (t, e, r) {
            this.cfg = this.cfg.extend(r), this._xformMode = t, this._key = e, this.reset()
          },
          reset: function () {
            i.reset.call(this), this._doReset()
          },
          process: function (t) {
            return this._append(t), this._process()
          },
          finalize: function (t) {
            return t && this._append(t), this._doFinalize()
          },
          keySize: 4,
          ivSize: 4,
          _ENC_XFORM_MODE: 1,
          _DEC_XFORM_MODE: 2,
          _createHelper: function (i) {
            return {
              encrypt: function (t, e, r) {
                return h(e).encrypt(i, t, e, r)
              },
              decrypt: function (t, e, r) {
                return h(e).decrypt(i, t, e, r)
              }
            }
          }
        });

      function h(t) {
        return "string" == typeof t ? p : u
      }
      e.StreamCipher = a.extend({
        _doFinalize: function () {
          return this._process(!0)
        },
        blockSize: 1
      });
      var l = t.mode = {},
        n = e.BlockCipherMode = r.extend({
          createEncryptor: function (t, e) {
            return this.Encryptor.create(t, e)
          },
          createDecryptor: function (t, e) {
            return this.Decryptor.create(t, e)
          },
          init: function (t, e) {
            this._cipher = t, this._iv = e
          }
        }),
        n = l.CBC = ((l = n.extend()).Encryptor = l.extend({
          processBlock: function (t, e) {
            var r = this._cipher,
              i = r.blockSize;
            f.call(this, t, e, i), r.encryptBlock(t, e), this._prevBlock = t.slice(e, e + i)
          }
        }), l.Decryptor = l.extend({
          processBlock: function (t, e) {
            var r = this._cipher,
              i = r.blockSize,
              n = t.slice(e, e + i);
            r.decryptBlock(t, e), f.call(this, t, e, i), this._prevBlock = n
          }
        }), l);

      function f(t, e, r) {
        var i, n = this._iv;
        n ? (i = n, this._iv = void 0) : i = this._prevBlock;
        for (var o = 0; o < r; o++) t[e + o] ^= i[o]
      }
      var l = (t.pad = {}).Pkcs7 = {
          pad: function (t, e) {
            for (var e = 4 * e, r = e - t.sigBytes % e, i = r << 24 | r << 16 | r << 8 | r, n = [], o = 0; o < r; o += 4) n.push(i);
            e = s.create(n, r);
            t.concat(e)
          },
          unpad: function (t) {
            var e = 255 & t.words[t.sigBytes - 1 >>> 2];
            t.sigBytes -= e
          }
        },
        d = (e.BlockCipher = a.extend({
          cfg: a.cfg.extend({
            mode: n,
            padding: l
          }),
          reset: function () {
            var t;
            a.reset.call(this);
            var e = this.cfg,
              r = e.iv,
              e = e.mode;
            this._xformMode == this._ENC_XFORM_MODE ? t = e.createEncryptor : (t = e.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == t ? this._mode.init(this, r && r.words) : (this._mode = t.call(e, this, r && r.words), this._mode.__creator = t)
          },
          _doProcessBlock: function (t, e) {
            this._mode.processBlock(t, e)
          },
          _doFinalize: function () {
            var t, e = this.cfg.padding;
            return this._xformMode == this._ENC_XFORM_MODE ? (e.pad(this._data, this.blockSize), t = this._process(!0)) : (t = this._process(!0), e.unpad(t)), t
          },
          blockSize: 4
        }), e.CipherParams = r.extend({
          init: function (t) {
            this.mixIn(t)
          },
          toString: function (t) {
            return (t || this.formatter).stringify(this)
          }
        })),
        l = (t.format = {}).OpenSSL = {
          stringify: function (t) {
            var e = t.ciphertext,
              t = t.salt,
              e = t ? s.create([1398893684, 1701076831]).concat(t).concat(e) : e;
            return e.toString(o)
          },
          parse: function (t) {
            var e, r = o.parse(t),
              t = r.words;
            return 1398893684 == t[0] && 1701076831 == t[1] && (e = s.create(t.slice(2, 4)), t.splice(0, 4), r.sigBytes -= 16), d.create({
              ciphertext: r,
              salt: e
            })
          }
        },
        u = e.SerializableCipher = r.extend({
          cfg: r.extend({
            format: l
          }),
          encrypt: function (t, e, r, i) {
            i = this.cfg.extend(i);
            var n = t.createEncryptor(r, i),
              e = n.finalize(e),
              n = n.cfg;
            return d.create({
              ciphertext: e,
              key: r,
              iv: n.iv,
              algorithm: t,
              mode: n.mode,
              padding: n.padding,
              blockSize: t.blockSize,
              formatter: i.format
            })
          },
          decrypt: function (t, e, r, i) {
            return i = this.cfg.extend(i), e = this._parse(e, i.format), t.createDecryptor(r, i).finalize(e.ciphertext)
          },
          _parse: function (t, e) {
            return "string" == typeof t ? e.parse(t, this) : t
          }
        }),
        t = (t.kdf = {}).OpenSSL = {
          execute: function (t, e, r, i) {
            i = i || s.random(8);
            t = c.create({
              keySize: e + r
            }).compute(t, i), r = s.create(t.words.slice(e), 4 * r);
            return t.sigBytes = 4 * e, d.create({
              key: t,
              iv: r,
              salt: i
            })
          }
        },
        p = e.PasswordBasedCipher = u.extend({
          cfg: u.cfg.extend({
            kdf: t
          }),
          encrypt: function (t, e, r, i) {
            r = (i = this.cfg.extend(i)).kdf.execute(r, t.keySize, t.ivSize);
            i.iv = r.iv;
            i = u.encrypt.call(this, t, e, r.key, i);
            return i.mixIn(r), i
          },
          decrypt: function (t, e, r, i) {
            i = this.cfg.extend(i), e = this._parse(e, i.format);
            r = i.kdf.execute(r, t.keySize, t.ivSize, e.salt);
            return i.iv = r.iv, u.decrypt.call(this, t, e, r.key, i)
          }
        })
    }(), U.mode.CFB = ((F = U.lib.BlockCipherMode.extend()).Encryptor = F.extend({
      processBlock: function (t, e) {
        var r = this._cipher,
          i = r.blockSize;
        j.call(this, t, e, i, r), this._prevBlock = t.slice(e, e + i)
      }
    }), F.Decryptor = F.extend({
      processBlock: function (t, e) {
        var r = this._cipher,
          i = r.blockSize,
          n = t.slice(e, e + i);
        j.call(this, t, e, i, r), this._prevBlock = n
      }
    }), F), U.mode.CTR = (M = U.lib.BlockCipherMode.extend(), P = M.Encryptor = M.extend({
      processBlock: function (t, e) {
        var r = this._cipher,
          i = r.blockSize,
          n = this._iv,
          o = this._counter;
        n && (o = this._counter = n.slice(0), this._iv = void 0);
        var s = o.slice(0);
        r.encryptBlock(s, 0), o[i - 1] = o[i - 1] + 1 | 0;
        for (var c = 0; c < i; c++) t[e + c] ^= s[c]
      }
    }), M.Decryptor = P, M), U.mode.CTRGladman = (F = U.lib.BlockCipherMode.extend(), P = F.Encryptor = F.extend({
      processBlock: function (t, e) {
        var r = this._cipher,
          i = r.blockSize,
          n = this._iv,
          o = this._counter;
        n && (o = this._counter = n.slice(0), this._iv = void 0), 0 === ((n = o)[0] = T(n[0])) && (n[1] = T(n[1]));
        var s = o.slice(0);
        r.encryptBlock(s, 0);
        for (var c = 0; c < i; c++) t[e + c] ^= s[c]
      }
    }), F.Decryptor = P, F), U.mode.OFB = (M = U.lib.BlockCipherMode.extend(), P = M.Encryptor = M.extend({
      processBlock: function (t, e) {
        var r = this._cipher,
          i = r.blockSize,
          n = this._iv,
          o = this._keystream;
        n && (o = this._keystream = n.slice(0), this._iv = void 0), r.encryptBlock(o, 0);
        for (var s = 0; s < i; s++) t[e + s] ^= o[s]
      }
    }), M.Decryptor = P, M), U.mode.ECB = ((F = U.lib.BlockCipherMode.extend()).Encryptor = F.extend({
      processBlock: function (t, e) {
        this._cipher.encryptBlock(t, e)
      }
    }), F.Decryptor = F.extend({
      processBlock: function (t, e) {
        this._cipher.decryptBlock(t, e)
      }
    }), F), U.pad.AnsiX923 = {
      pad: function (t, e) {
        var r = t.sigBytes,
          e = 4 * e,
          e = e - r % e,
          r = r + e - 1;
        t.clamp(), t.words[r >>> 2] |= e << 24 - r % 4 * 8, t.sigBytes += e
      },
      unpad: function (t) {
        var e = 255 & t.words[t.sigBytes - 1 >>> 2];
        t.sigBytes -= e
      }
    }, U.pad.Iso10126 = {
      pad: function (t, e) {
        e *= 4, e -= t.sigBytes % e;
        t.concat(U.lib.WordArray.random(e - 1)).concat(U.lib.WordArray.create([e << 24], 1))
      },
      unpad: function (t) {
        var e = 255 & t.words[t.sigBytes - 1 >>> 2];
        t.sigBytes -= e
      }
    }, U.pad.Iso97971 = {
      pad: function (t, e) {
        t.concat(U.lib.WordArray.create([2147483648], 1)), U.pad.ZeroPadding.pad(t, e)
      },
      unpad: function (t) {
        U.pad.ZeroPadding.unpad(t), t.sigBytes--
      }
    }, U.pad.ZeroPadding = {
      pad: function (t, e) {
        e *= 4;
        t.clamp(), t.sigBytes += e - (t.sigBytes % e || e)
      },
      unpad: function (t) {
        for (var e = t.words, r = t.sigBytes - 1, r = t.sigBytes - 1; 0 <= r; r--)
          if (e[r >>> 2] >>> 24 - r % 4 * 8 & 255) {
            t.sigBytes = r + 1;
            break
          }
      }
    }, U.pad.NoPadding = {
      pad: function () {},
      unpad: function () {}
    }, m = (P = U).lib.CipherParams, C = P.enc.Hex, P.format.Hex = {
      stringify: function (t) {
        return t.ciphertext.toString(C)
      },
      parse: function (t) {
        t = C.parse(t);
        return m.create({
          ciphertext: t
        })
      }
    },
    function () {
      var t = U,
        e = t.lib.BlockCipher,
        r = t.algo,
        h = [],
        l = [],
        f = [],
        d = [],
        u = [],
        p = [],
        _ = [],
        y = [],
        v = [],
        g = [];
      ! function () {
        for (var t = [], e = 0; e < 256; e++) t[e] = e < 128 ? e << 1 : e << 1 ^ 283;
        for (var r = 0, i = 0, e = 0; e < 256; e++) {
          var n = i ^ i << 1 ^ i << 2 ^ i << 3 ^ i << 4;
          h[r] = n = n >>> 8 ^ 255 & n ^ 99;
          var o = t[l[n] = r],
            s = t[o],
            c = t[s],
            a = 257 * t[n] ^ 16843008 * n;
          f[r] = a << 24 | a >>> 8, d[r] = a << 16 | a >>> 16, u[r] = a << 8 | a >>> 24, p[r] = a, _[n] = (a = 16843009 * c ^ 65537 * s ^ 257 * o ^ 16843008 * r) << 24 | a >>> 8, y[n] = a << 16 | a >>> 16, v[n] = a << 8 | a >>> 24, g[n] = a, r ? (r = o ^ t[t[t[c ^ o]]], i ^= t[t[i]]) : r = i = 1
        }
      }();
      var B = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
        r = r.AES = e.extend({
          _doReset: function () {
            if (!this._nRounds || this._keyPriorReset !== this._key) {
              for (var t = this._keyPriorReset = this._key, e = t.words, r = t.sigBytes / 4, i = 4 * (1 + (this._nRounds = 6 + r)), n = this._keySchedule = [], o = 0; o < i; o++) o < r ? n[o] = e[o] : (a = n[o - 1], o % r ? 6 < r && o % r == 4 && (a = h[a >>> 24] << 24 | h[a >>> 16 & 255] << 16 | h[a >>> 8 & 255] << 8 | h[255 & a]) : (a = h[(a = a << 8 | a >>> 24) >>> 24] << 24 | h[a >>> 16 & 255] << 16 | h[a >>> 8 & 255] << 8 | h[255 & a], a ^= B[o / r | 0] << 24), n[o] = n[o - r] ^ a);
              for (var s = this._invKeySchedule = [], c = 0; c < i; c++) {
                var a, o = i - c;
                a = c % 4 ? n[o] : n[o - 4], s[c] = c < 4 || o <= 4 ? a : _[h[a >>> 24]] ^ y[h[a >>> 16 & 255]] ^ v[h[a >>> 8 & 255]] ^ g[h[255 & a]]
              }
            }
          },
          encryptBlock: function (t, e) {
            this._doCryptBlock(t, e, this._keySchedule, f, d, u, p, h)
          },
          decryptBlock: function (t, e) {
            var r = t[e + 1];
            t[e + 1] = t[e + 3], t[e + 3] = r, this._doCryptBlock(t, e, this._invKeySchedule, _, y, v, g, l);
            r = t[e + 1];
            t[e + 1] = t[e + 3], t[e + 3] = r
          },
          _doCryptBlock: function (t, e, r, i, n, o, s, c) {
            for (var a = this._nRounds, h = t[e] ^ r[0], l = t[e + 1] ^ r[1], f = t[e + 2] ^ r[2], d = t[e + 3] ^ r[3], u = 4, p = 1; p < a; p++) var _ = i[h >>> 24] ^ n[l >>> 16 & 255] ^ o[f >>> 8 & 255] ^ s[255 & d] ^ r[u++],
              y = i[l >>> 24] ^ n[f >>> 16 & 255] ^ o[d >>> 8 & 255] ^ s[255 & h] ^ r[u++],
              v = i[f >>> 24] ^ n[d >>> 16 & 255] ^ o[h >>> 8 & 255] ^ s[255 & l] ^ r[u++],
              g = i[d >>> 24] ^ n[h >>> 16 & 255] ^ o[l >>> 8 & 255] ^ s[255 & f] ^ r[u++],
              h = _,
              l = y,
              f = v,
              d = g;
            _ = (c[h >>> 24] << 24 | c[l >>> 16 & 255] << 16 | c[f >>> 8 & 255] << 8 | c[255 & d]) ^ r[u++], y = (c[l >>> 24] << 24 | c[f >>> 16 & 255] << 16 | c[d >>> 8 & 255] << 8 | c[255 & h]) ^ r[u++], v = (c[f >>> 24] << 24 | c[d >>> 16 & 255] << 16 | c[h >>> 8 & 255] << 8 | c[255 & l]) ^ r[u++], g = (c[d >>> 24] << 24 | c[h >>> 16 & 255] << 16 | c[l >>> 8 & 255] << 8 | c[255 & f]) ^ r[u++];
            t[e] = _, t[e + 1] = y, t[e + 2] = v, t[e + 3] = g
          },
          keySize: 8
        });
      t.AES = e._createHelper(r)
    }(),
    function () {
      var t = U,
        e = t.lib,
        i = e.WordArray,
        r = e.BlockCipher,
        e = t.algo,
        h = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4],
        l = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32],
        f = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28],
        d = [{
          0: 8421888,
          268435456: 32768,
          536870912: 8421378,
          805306368: 2,
          1073741824: 512,
          1342177280: 8421890,
          1610612736: 8389122,
          1879048192: 8388608,
          2147483648: 514,
          2415919104: 8389120,
          2684354560: 33280,
          2952790016: 8421376,
          3221225472: 32770,
          3489660928: 8388610,
          3758096384: 0,
          4026531840: 33282,
          134217728: 0,
          402653184: 8421890,
          671088640: 33282,
          939524096: 32768,
          1207959552: 8421888,
          1476395008: 512,
          1744830464: 8421378,
          2013265920: 2,
          2281701376: 8389120,
          2550136832: 33280,
          2818572288: 8421376,
          3087007744: 8389122,
          3355443200: 8388610,
          3623878656: 32770,
          3892314112: 514,
          4160749568: 8388608,
          1: 32768,
          268435457: 2,
          536870913: 8421888,
          805306369: 8388608,
          1073741825: 8421378,
          1342177281: 33280,
          1610612737: 512,
          1879048193: 8389122,
          2147483649: 8421890,
          2415919105: 8421376,
          2684354561: 8388610,
          2952790017: 33282,
          3221225473: 514,
          3489660929: 8389120,
          3758096385: 32770,
          4026531841: 0,
          134217729: 8421890,
          402653185: 8421376,
          671088641: 8388608,
          939524097: 512,
          1207959553: 32768,
          1476395009: 8388610,
          1744830465: 2,
          2013265921: 33282,
          2281701377: 32770,
          2550136833: 8389122,
          2818572289: 514,
          3087007745: 8421888,
          3355443201: 8389120,
          3623878657: 0,
          3892314113: 33280,
          4160749569: 8421378
        }, {
          0: 1074282512,
          16777216: 16384,
          33554432: 524288,
          50331648: 1074266128,
          67108864: 1073741840,
          83886080: 1074282496,
          100663296: 1073758208,
          117440512: 16,
          134217728: 540672,
          150994944: 1073758224,
          167772160: 1073741824,
          184549376: 540688,
          201326592: 524304,
          218103808: 0,
          234881024: 16400,
          251658240: 1074266112,
          8388608: 1073758208,
          25165824: 540688,
          41943040: 16,
          58720256: 1073758224,
          75497472: 1074282512,
          92274688: 1073741824,
          109051904: 524288,
          125829120: 1074266128,
          142606336: 524304,
          159383552: 0,
          176160768: 16384,
          192937984: 1074266112,
          209715200: 1073741840,
          226492416: 540672,
          243269632: 1074282496,
          260046848: 16400,
          268435456: 0,
          285212672: 1074266128,
          301989888: 1073758224,
          318767104: 1074282496,
          335544320: 1074266112,
          352321536: 16,
          369098752: 540688,
          385875968: 16384,
          402653184: 16400,
          419430400: 524288,
          436207616: 524304,
          452984832: 1073741840,
          469762048: 540672,
          486539264: 1073758208,
          503316480: 1073741824,
          520093696: 1074282512,
          276824064: 540688,
          293601280: 524288,
          310378496: 1074266112,
          327155712: 16384,
          343932928: 1073758208,
          360710144: 1074282512,
          377487360: 16,
          394264576: 1073741824,
          411041792: 1074282496,
          427819008: 1073741840,
          444596224: 1073758224,
          461373440: 524304,
          478150656: 0,
          494927872: 16400,
          511705088: 1074266128,
          528482304: 540672
        }, {
          0: 260,
          1048576: 0,
          2097152: 67109120,
          3145728: 65796,
          4194304: 65540,
          5242880: 67108868,
          6291456: 67174660,
          7340032: 67174400,
          8388608: 67108864,
          9437184: 67174656,
          10485760: 65792,
          11534336: 67174404,
          12582912: 67109124,
          13631488: 65536,
          14680064: 4,
          15728640: 256,
          524288: 67174656,
          1572864: 67174404,
          2621440: 0,
          3670016: 67109120,
          4718592: 67108868,
          5767168: 65536,
          6815744: 65540,
          7864320: 260,
          8912896: 4,
          9961472: 256,
          11010048: 67174400,
          12058624: 65796,
          13107200: 65792,
          14155776: 67109124,
          15204352: 67174660,
          16252928: 67108864,
          16777216: 67174656,
          17825792: 65540,
          18874368: 65536,
          19922944: 67109120,
          20971520: 256,
          22020096: 67174660,
          23068672: 67108868,
          24117248: 0,
          25165824: 67109124,
          26214400: 67108864,
          27262976: 4,
          28311552: 65792,
          29360128: 67174400,
          30408704: 260,
          31457280: 65796,
          32505856: 67174404,
          17301504: 67108864,
          18350080: 260,
          19398656: 67174656,
          20447232: 0,
          21495808: 65540,
          22544384: 67109120,
          23592960: 256,
          24641536: 67174404,
          25690112: 65536,
          26738688: 67174660,
          27787264: 65796,
          28835840: 67108868,
          29884416: 67109124,
          30932992: 67174400,
          31981568: 4,
          33030144: 65792
        }, {
          0: 2151682048,
          65536: 2147487808,
          131072: 4198464,
          196608: 2151677952,
          262144: 0,
          327680: 4198400,
          393216: 2147483712,
          458752: 4194368,
          524288: 2147483648,
          589824: 4194304,
          655360: 64,
          720896: 2147487744,
          786432: 2151678016,
          851968: 4160,
          917504: 4096,
          983040: 2151682112,
          32768: 2147487808,
          98304: 64,
          163840: 2151678016,
          229376: 2147487744,
          294912: 4198400,
          360448: 2151682112,
          425984: 0,
          491520: 2151677952,
          557056: 4096,
          622592: 2151682048,
          688128: 4194304,
          753664: 4160,
          819200: 2147483648,
          884736: 4194368,
          950272: 4198464,
          1015808: 2147483712,
          1048576: 4194368,
          1114112: 4198400,
          1179648: 2147483712,
          1245184: 0,
          1310720: 4160,
          1376256: 2151678016,
          1441792: 2151682048,
          1507328: 2147487808,
          1572864: 2151682112,
          1638400: 2147483648,
          1703936: 2151677952,
          1769472: 4198464,
          1835008: 2147487744,
          1900544: 4194304,
          1966080: 64,
          2031616: 4096,
          1081344: 2151677952,
          1146880: 2151682112,
          1212416: 0,
          1277952: 4198400,
          1343488: 4194368,
          1409024: 2147483648,
          1474560: 2147487808,
          1540096: 64,
          1605632: 2147483712,
          1671168: 4096,
          1736704: 2147487744,
          1802240: 2151678016,
          1867776: 4160,
          1933312: 2151682048,
          1998848: 4194304,
          2064384: 4198464
        }, {
          0: 128,
          4096: 17039360,
          8192: 262144,
          12288: 536870912,
          16384: 537133184,
          20480: 16777344,
          24576: 553648256,
          28672: 262272,
          32768: 16777216,
          36864: 537133056,
          40960: 536871040,
          45056: 553910400,
          49152: 553910272,
          53248: 0,
          57344: 17039488,
          61440: 553648128,
          2048: 17039488,
          6144: 553648256,
          10240: 128,
          14336: 17039360,
          18432: 262144,
          22528: 537133184,
          26624: 553910272,
          30720: 536870912,
          34816: 537133056,
          38912: 0,
          43008: 553910400,
          47104: 16777344,
          51200: 536871040,
          55296: 553648128,
          59392: 16777216,
          63488: 262272,
          65536: 262144,
          69632: 128,
          73728: 536870912,
          77824: 553648256,
          81920: 16777344,
          86016: 553910272,
          90112: 537133184,
          94208: 16777216,
          98304: 553910400,
          102400: 553648128,
          106496: 17039360,
          110592: 537133056,
          114688: 262272,
          118784: 536871040,
          122880: 0,
          126976: 17039488,
          67584: 553648256,
          71680: 16777216,
          75776: 17039360,
          79872: 537133184,
          83968: 536870912,
          88064: 17039488,
          92160: 128,
          96256: 553910272,
          100352: 262272,
          104448: 553910400,
          108544: 0,
          112640: 553648128,
          116736: 16777344,
          120832: 262144,
          124928: 537133056,
          129024: 536871040
        }, {
          0: 268435464,
          256: 8192,
          512: 270532608,
          768: 270540808,
          1024: 268443648,
          1280: 2097152,
          1536: 2097160,
          1792: 268435456,
          2048: 0,
          2304: 268443656,
          2560: 2105344,
          2816: 8,
          3072: 270532616,
          3328: 2105352,
          3584: 8200,
          3840: 270540800,
          128: 270532608,
          384: 270540808,
          640: 8,
          896: 2097152,
          1152: 2105352,
          1408: 268435464,
          1664: 268443648,
          1920: 8200,
          2176: 2097160,
          2432: 8192,
          2688: 268443656,
          2944: 270532616,
          3200: 0,
          3456: 270540800,
          3712: 2105344,
          3968: 268435456,
          4096: 268443648,
          4352: 270532616,
          4608: 270540808,
          4864: 8200,
          5120: 2097152,
          5376: 268435456,
          5632: 268435464,
          5888: 2105344,
          6144: 2105352,
          6400: 0,
          6656: 8,
          6912: 270532608,
          7168: 8192,
          7424: 268443656,
          7680: 270540800,
          7936: 2097160,
          4224: 8,
          4480: 2105344,
          4736: 2097152,
          4992: 268435464,
          5248: 268443648,
          5504: 8200,
          5760: 270540808,
          6016: 270532608,
          6272: 270540800,
          6528: 270532616,
          6784: 8192,
          7040: 2105352,
          7296: 2097160,
          7552: 0,
          7808: 268435456,
          8064: 268443656
        }, {
          0: 1048576,
          16: 33555457,
          32: 1024,
          48: 1049601,
          64: 34604033,
          80: 0,
          96: 1,
          112: 34603009,
          128: 33555456,
          144: 1048577,
          160: 33554433,
          176: 34604032,
          192: 34603008,
          208: 1025,
          224: 1049600,
          240: 33554432,
          8: 34603009,
          24: 0,
          40: 33555457,
          56: 34604032,
          72: 1048576,
          88: 33554433,
          104: 33554432,
          120: 1025,
          136: 1049601,
          152: 33555456,
          168: 34603008,
          184: 1048577,
          200: 1024,
          216: 34604033,
          232: 1,
          248: 1049600,
          256: 33554432,
          272: 1048576,
          288: 33555457,
          304: 34603009,
          320: 1048577,
          336: 33555456,
          352: 34604032,
          368: 1049601,
          384: 1025,
          400: 34604033,
          416: 1049600,
          432: 1,
          448: 0,
          464: 34603008,
          480: 33554433,
          496: 1024,
          264: 1049600,
          280: 33555457,
          296: 34603009,
          312: 1,
          328: 33554432,
          344: 1048576,
          360: 1025,
          376: 34604032,
          392: 33554433,
          408: 34603008,
          424: 0,
          440: 34604033,
          456: 1049601,
          472: 1024,
          488: 33555456,
          504: 1048577
        }, {
          0: 134219808,
          1: 131072,
          2: 134217728,
          3: 32,
          4: 131104,
          5: 134350880,
          6: 134350848,
          7: 2048,
          8: 134348800,
          9: 134219776,
          10: 133120,
          11: 134348832,
          12: 2080,
          13: 0,
          14: 134217760,
          15: 133152,
          2147483648: 2048,
          2147483649: 134350880,
          2147483650: 134219808,
          2147483651: 134217728,
          2147483652: 134348800,
          2147483653: 133120,
          2147483654: 133152,
          2147483655: 32,
          2147483656: 134217760,
          2147483657: 2080,
          2147483658: 131104,
          2147483659: 134350848,
          2147483660: 0,
          2147483661: 134348832,
          2147483662: 134219776,
          2147483663: 131072,
          16: 133152,
          17: 134350848,
          18: 32,
          19: 2048,
          20: 134219776,
          21: 134217760,
          22: 134348832,
          23: 131072,
          24: 0,
          25: 131104,
          26: 134348800,
          27: 134219808,
          28: 134350880,
          29: 133120,
          30: 2080,
          31: 134217728,
          2147483664: 131072,
          2147483665: 2048,
          2147483666: 134348832,
          2147483667: 133152,
          2147483668: 32,
          2147483669: 134348800,
          2147483670: 134217728,
          2147483671: 134219808,
          2147483672: 134350880,
          2147483673: 134217760,
          2147483674: 134219776,
          2147483675: 0,
          2147483676: 133120,
          2147483677: 2080,
          2147483678: 131104,
          2147483679: 134350848
        }],
        u = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679],
        n = e.DES = r.extend({
          _doReset: function () {
            for (var t = this._key.words, e = [], r = 0; r < 56; r++) {
              var i = h[r] - 1;
              e[r] = t[i >>> 5] >>> 31 - i % 32 & 1
            }
            for (var n = this._subKeys = [], o = 0; o < 16; o++) {
              for (var s = n[o] = [], c = f[o], r = 0; r < 24; r++) s[r / 6 | 0] |= e[(l[r] - 1 + c) % 28] << 31 - r % 6, s[4 + (r / 6 | 0)] |= e[28 + (l[r + 24] - 1 + c) % 28] << 31 - r % 6;
              s[0] = s[0] << 1 | s[0] >>> 31;
              for (r = 1; r < 7; r++) s[r] = s[r] >>> 4 * (r - 1) + 3;
              s[7] = s[7] << 5 | s[7] >>> 27
            }
            for (var a = this._invSubKeys = [], r = 0; r < 16; r++) a[r] = n[15 - r]
          },
          encryptBlock: function (t, e) {
            this._doCryptBlock(t, e, this._subKeys)
          },
          decryptBlock: function (t, e) {
            this._doCryptBlock(t, e, this._invSubKeys)
          },
          _doCryptBlock: function (t, e, r) {
            this._lBlock = t[e], this._rBlock = t[e + 1], p.call(this, 4, 252645135), p.call(this, 16, 65535), _.call(this, 2, 858993459), _.call(this, 8, 16711935), p.call(this, 1, 1431655765);
            for (var i = 0; i < 16; i++) {
              for (var n = r[i], o = this._lBlock, s = this._rBlock, c = 0, a = 0; a < 8; a++) c |= d[a][((s ^ n[a]) & u[a]) >>> 0];
              this._lBlock = s, this._rBlock = o ^ c
            }
            var h = this._lBlock;
            this._lBlock = this._rBlock, this._rBlock = h, p.call(this, 1, 1431655765), _.call(this, 8, 16711935), _.call(this, 2, 858993459), p.call(this, 16, 65535), p.call(this, 4, 252645135), t[e] = this._lBlock, t[e + 1] = this._rBlock
          },
          keySize: 2,
          ivSize: 2,
          blockSize: 2
        });

      function p(t, e) {
        e = (this._lBlock >>> t ^ this._rBlock) & e;
        this._rBlock ^= e, this._lBlock ^= e << t
      }

      function _(t, e) {
        e = (this._rBlock >>> t ^ this._lBlock) & e;
        this._lBlock ^= e, this._rBlock ^= e << t
      }
      t.DES = r._createHelper(n);
      e = e.TripleDES = r.extend({
        _doReset: function () {
          var t = this._key.words;
          if (2 !== t.length && 4 !== t.length && t.length < 6) throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
          var e = t.slice(0, 2),
            r = t.length < 4 ? t.slice(0, 2) : t.slice(2, 4),
            t = t.length < 6 ? t.slice(0, 2) : t.slice(4, 6);
          this._des1 = n.createEncryptor(i.create(e)), this._des2 = n.createEncryptor(i.create(r)), this._des3 = n.createEncryptor(i.create(t))
        },
        encryptBlock: function (t, e) {
          this._des1.encryptBlock(t, e), this._des2.decryptBlock(t, e), this._des3.encryptBlock(t, e)
        },
        decryptBlock: function (t, e) {
          this._des3.decryptBlock(t, e), this._des2.encryptBlock(t, e), this._des1.decryptBlock(t, e)
        },
        keySize: 6,
        ivSize: 2,
        blockSize: 2
      });
      t.TripleDES = r._createHelper(e)
    }(),
    function () {
      var t = U,
        e = t.lib.StreamCipher,
        r = t.algo,
        i = r.RC4 = e.extend({
          _doReset: function () {
            for (var t = this._key, e = t.words, r = t.sigBytes, i = this._S = [], n = 0; n < 256; n++) i[n] = n;
            for (var n = 0, o = 0; n < 256; n++) {
              var s = n % r,
                s = e[s >>> 2] >>> 24 - s % 4 * 8 & 255,
                o = (o + i[n] + s) % 256,
                s = i[n];
              i[n] = i[o], i[o] = s
            }
            this._i = this._j = 0
          },
          _doProcessBlock: function (t, e) {
            t[e] ^= n.call(this)
          },
          keySize: 8,
          ivSize: 0
        });

      function n() {
        for (var t = this._S, e = this._i, r = this._j, i = 0, n = 0; n < 4; n++) {
          var r = (r + t[e = (e + 1) % 256]) % 256,
            o = t[e];
          t[e] = t[r], t[r] = o, i |= t[(t[e] + t[r]) % 256] << 24 - 8 * n
        }
        return this._i = e, this._j = r, i
      }
      t.RC4 = e._createHelper(i);
      r = r.RC4Drop = i.extend({
        cfg: i.cfg.extend({
          drop: 192
        }),
        _doReset: function () {
          i._doReset.call(this);
          for (var t = this.cfg.drop; 0 < t; t--) n.call(this)
        }
      });
      t.RC4Drop = e._createHelper(r)
    }(), F = (M = U).lib.StreamCipher, P = M.algo, D = [], E = [], R = [], P = P.Rabbit = F.extend({
      _doReset: function () {
        for (var t = this._key.words, e = this.cfg.iv, r = 0; r < 4; r++) t[r] = 16711935 & (t[r] << 8 | t[r] >>> 24) | 4278255360 & (t[r] << 24 | t[r] >>> 8);
        for (var i = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16], n = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]], r = this._b = 0; r < 4; r++) N.call(this);
        for (r = 0; r < 8; r++) n[r] ^= i[r + 4 & 7];
        if (e) {
          var o = e.words,
            s = o[0],
            c = o[1],
            e = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8),
            o = 16711935 & (c << 8 | c >>> 24) | 4278255360 & (c << 24 | c >>> 8),
            s = e >>> 16 | 4294901760 & o,
            c = o << 16 | 65535 & e;
          n[0] ^= e, n[1] ^= s, n[2] ^= o, n[3] ^= c, n[4] ^= e, n[5] ^= s, n[6] ^= o, n[7] ^= c;
          for (r = 0; r < 4; r++) N.call(this)
        }
      },
      _doProcessBlock: function (t, e) {
        var r = this._X;
        N.call(this), D[0] = r[0] ^ r[5] >>> 16 ^ r[3] << 16, D[1] = r[2] ^ r[7] >>> 16 ^ r[5] << 16, D[2] = r[4] ^ r[1] >>> 16 ^ r[7] << 16, D[3] = r[6] ^ r[3] >>> 16 ^ r[1] << 16;
        for (var i = 0; i < 4; i++) D[i] = 16711935 & (D[i] << 8 | D[i] >>> 24) | 4278255360 & (D[i] << 24 | D[i] >>> 8), t[e + i] ^= D[i]
      },
      blockSize: 4,
      ivSize: 2
    }), M.Rabbit = F._createHelper(P), F = (M = U).lib.StreamCipher, P = M.algo, W = [], O = [], I = [], P = P.RabbitLegacy = F.extend({
      _doReset: function () {
        for (var t = this._key.words, e = this.cfg.iv, r = this._X = [t[0], t[3] << 16 | t[2] >>> 16, t[1], t[0] << 16 | t[3] >>> 16, t[2], t[1] << 16 | t[0] >>> 16, t[3], t[2] << 16 | t[1] >>> 16], i = this._C = [t[2] << 16 | t[2] >>> 16, 4294901760 & t[0] | 65535 & t[1], t[3] << 16 | t[3] >>> 16, 4294901760 & t[1] | 65535 & t[2], t[0] << 16 | t[0] >>> 16, 4294901760 & t[2] | 65535 & t[3], t[1] << 16 | t[1] >>> 16, 4294901760 & t[3] | 65535 & t[0]], n = this._b = 0; n < 4; n++) q.call(this);
        for (n = 0; n < 8; n++) i[n] ^= r[n + 4 & 7];
        if (e) {
          var o = e.words,
            s = o[0],
            t = o[1],
            e = 16711935 & (s << 8 | s >>> 24) | 4278255360 & (s << 24 | s >>> 8),
            o = 16711935 & (t << 8 | t >>> 24) | 4278255360 & (t << 24 | t >>> 8),
            s = e >>> 16 | 4294901760 & o,
            t = o << 16 | 65535 & e;
          i[0] ^= e, i[1] ^= s, i[2] ^= o, i[3] ^= t, i[4] ^= e, i[5] ^= s, i[6] ^= o, i[7] ^= t;
          for (n = 0; n < 4; n++) q.call(this)
        }
      },
      _doProcessBlock: function (t, e) {
        var r = this._X;
        q.call(this), W[0] = r[0] ^ r[5] >>> 16 ^ r[3] << 16, W[1] = r[2] ^ r[7] >>> 16 ^ r[5] << 16, W[2] = r[4] ^ r[1] >>> 16 ^ r[7] << 16, W[3] = r[6] ^ r[3] >>> 16 ^ r[1] << 16;
        for (var i = 0; i < 4; i++) W[i] = 16711935 & (W[i] << 8 | W[i] >>> 24) | 4278255360 & (W[i] << 24 | W[i] >>> 8), t[e + i] ^= W[i]
      },
      blockSize: 4,
      ivSize: 2
    }), M.RabbitLegacy = F._createHelper(P), U
});

function t(t, e, n) {
  return (e = p(e)) in t ? Object.defineProperty(t, e, {
    value: n,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[e] = n, t
}

function e(t) {
  return function (t) {
    if (Array.isArray(t)) return r(t)
  }(t) || function (t) {
    if ("undefined" != typeof Symbol && null != t[Symbol.iterator] || null != t["@@iterator"]) return Array.from(t)
  }(t) || n(t) || function () {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
  }()
}

function n(t, e) {
  if (t) {
    if ("string" == typeof t) return r(t, e);
    var n = Object.prototype.toString.call(t).slice(8, -1);
    return "Object" === n && t.constructor && (n = t.constructor.name), "Map" === n || "Set" === n ? Array.from(t) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? r(t, e) : void 0
  }
}

function r(t, e) {
  (null == e || e > t.length) && (e = t.length);
  for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
  return r
}

function o(t, e) {
  if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
  t.prototype = Object.create(e && e.prototype, {
    constructor: {
      value: t,
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperty(t, "prototype", {
    writable: !1
  }), e && i(t, e)
}

function i(t, e) {
  return i = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t
  }, i(t, e)
}

function a(t) {
  var e = function () {
    if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
    if (Reflect.construct.sham) return !1;
    if ("function" == typeof Proxy) return !0;
    try {
      return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], (function () {}))), !0
    } catch (t) {
      return !1
    }
  }();
  return function () {
    var n, r = s(t);
    if (e) {
      var o = s(this).constructor;
      n = Reflect.construct(r, arguments, o)
    } else n = r.apply(this, arguments);
    return u(this, n)
  }
}

function u(t, e) {
  if (e && ("object" === l(e) || "function" == typeof e)) return e;
  if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
  return c(t)
}

function c(t) {
  if (void 0 === t) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return t
}

function s(t) {
  return s = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
    return t.__proto__ || Object.getPrototypeOf(t)
  }, s(t)
}

function l(t) {
  return l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
    return typeof t
  } : function (t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
  }, l(t)
}

function f(t, e) {
  if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
}

function d(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, p(r.key), r)
  }
}

function v(t, e, n) {
  return e && d(t.prototype, e), n && d(t, n), Object.defineProperty(t, "prototype", {
    writable: !1
  }), t
}

function p(t) {
  var e = function (t, e) {
    if ("object" !== l(t) || null === t) return t;
    var n = t[Symbol.toPrimitive];
    if (void 0 !== n) {
      var r = n.call(t, e || "default");
      if ("object" !== l(r)) return r;
      throw new TypeError("@@toPrimitive must return a primitive value.")
    }
    return ("string" === e ? String : Number)(t)
  }(t, "string");
  return "symbol" === l(e) ? e : String(e)
}
var h, y, _ = "LOCAL_ID",
  g = "QUEUE_ACTIONS",
  m = "CLICK_ID",
  A = "QUEUE_LOST_MAP",
  R = "REMOTE_CONFIG",
  k = "REMOTE_COMMON_CONFIG",
  T = "OPENID",
  S = {
    init: "init",
    reporting: "reporting",
    fail: "fail"
  },
  E = {
    maxSdkInstance: 4,
    maxQueueLength: 500,
    actionParamMaxLength: 1e4,
    autoTrack: !0,
    reportThreshold: 5,
    reportDelay: 1,
    inspectDelay: 30,
    cgiBatchSize: 50,
    requestConcurrency: 4,
    requestTimeout: 1e4,
    signVersion: "1.0",
    realTimeActionList: ["START_APP", "REGISTER", "PURCHASE"]
  },
  b = {
    JS_RUN_ERROR: "JS_RUN_ERROR",
    REQUEST_ERROR: "REQUEST_ERROR",
    REQUEST_CONFIG_ERROR: "REQUEST_CONFIG_ERROR",
    JS_QUEUE_LOG: "JS_QUEUE_LOG",
    PROXY_ERROR: "PROXY_ERROR",
    PROXY_POLYFILL: "PROXY_POLYFILL",
    QUEUE_LOST_NUM: "QUEUE_LOST_NUM",
    REQ_TOTAL: "REQ_TOTAL",
    SIGN_ERROR: "SIGN_ERROR"
  },
  O = "ANDROID",
  I = "IOS",
  w = "WINDOWS",
  C = "OSX",
  x = "UNKNOWN",
  N = 1e3,
  L = 100,
  P = 10,
  M = "START_APP",
  D = "ENTER_FOREGROUND",
  U = "ENTER_BACKGROUND",
  q = "ADD_TO_WISHLIST",
  j = "PURCHASE",
  F = "APP_QUIT",
  B = "REGISTER",
  V = "CREATE_ROLE",
  K = "TUTORIAL_FINISH",
  G = "TRUE",
  Q = "FALSE",
  Y = "TENCENT",
  W = "BYTEDANCE",
  J = "KUAISHOU",
  H = "ALIBABA",
  z = "BAIDU",
  $ = "OTHERS",
  X = "UNKNOWN",
  Z = "TICKET_INTERVAL_CHANGE",
  tt = (y = function (t) {
    return "".concat("@dn-sdk/minigame", "_").concat("production", "_").concat(t)
  }, {
    getSync: function (t) {
      var e;
      try {
        e = wx.getStorageSync(y(t))
      } catch (t) {
        return console.error("storage get error", t), e
      }
      return e
    },
    setSync: function (t, e) {
      try {
        wx.setStorageSync(y(t), e)
      } catch (t) {
        return console.error("storage set error", t), !1
      }
      return !0
    }
  }),
  et = function () {
    if (h) return h;
    try {
      return h = wx.getSystemInfoSync()
    } catch (t) {
      return {}
    }
  },
  nt = function () {
    var t;
    return function () {
      if (!t) {
        var e = et(),
          n = e.system,
          r = void 0 === n ? "" : n,
          o = (null == r ? void 0 : r.split(" ")) || [],
          i = function (t) {
            if (!t) return x;
            var e = (null == t ? void 0 : t.toUpperCase()) || "";
            return e.indexOf("ANDROID") > -1 ? O : e.indexOf("IOS") > -1 ? I : e.indexOf("MAC") > -1 ? C : e.indexOf("WINDOWS") > -1 ? w : x
          }(o[0]),
          a = function (t) {
            return !t || t.length <= 0 ? "" : 2 === t.length ? t[1] : 3 === t.length && "Windows" === t[0] ? "".concat(t[1], " ").concat(t[2]) : t[t.length - 1]
          }(o);
        t = {
          benchmark_level: e.benchmarkLevel,
          device_brand: e.brand,
          screen_height: Math.floor(e.screenHeight),
          screen_width: Math.floor(e.screenWidth),
          wx_lib_version: e.SDKVersion,
          wx_version: e.version,
          wx_platform: e.platform,
          device_model: e.model,
          os: i,
          os_version: a
        }
      }
      return t
    }
  }(),
  rt = function () {
    var t;
    return function () {
      try {
        if (t) return t;
        t || (t = tt.getSync(_) || ""), t || (t = mt(), tt.setSync(_, t))
      } catch (t) {}
      return t
    }
  }();
var ot = function () {
  var t = "unknown",
    e = !1;
  return function () {
    if (!e) try {
      wx.getNetworkType({
        success: function (e) {
          t = e.networkType
        },
        fail: function () {
          t = "unknown"
        }
      }), wx.onNetworkStatusChange((function (e) {
        t = e.networkType
      })), e = !0
    } catch (t) {}
    return t
  }
}();
ot();
var it = function () {
    var t = "";
    return function () {
      return t || (t = tt.getSync(T) || ""), t
    }
  }(),
  at = function () {
    var t;
    return function () {
      if (t) return t;
      try {
        var e = wx.getAccountInfoSync();
        return ht(e.miniProgram) ? t = e.miniProgram : {}
      } catch (e) {
        return {}
      }
    }
  }();

function ut(t) {
  var e = null == t ? void 0 : t.query;
  if (!ht(e)) return "";
  var n = "";
  return e.gdt_vid || [1045, 1046, 1084].indexOf(null == t ? void 0 : t.scene) > -1 ? n = Y : e.clue_token || e.clickid && e.item_id ? n = W : e.callback && "kuaishou" === e.ksChannel ? n = J : e.bd_vid || e.ai && e.d && e.q && e.c ? n = z : e.uctrackid ? n = H : (e.trackid || e.imp || [1065, 1069, 1194].indexOf(null == t ? void 0 : t.scene) > -1 && (e.callback || e.u)) && (n = $), n
}

function ct(t, e) {
  try {
    var n = nt(),
      r = {
        sdk_version: "1.5.4",
        sdk_name: "@dn-sdk/minigame",
        device_brand: null == n ? void 0 : n.device_brand,
        device_model: null == n ? void 0 : n.device_model,
        wx_version: null == n ? void 0 : n.wx_version,
        wx_lib_version: null == n ? void 0 : n.wx_lib_version,
        wx_platform: null == n ? void 0 : n.wx_platform,
        os: null == n ? void 0 : n.os,
        os_version: null == n ? void 0 : n.os_version,
        local_id: rt()
      },
      o = Object.assign(r, t);
    wx.request({
      url: "https://api.datanexus.qq.com/data-nexus-trace/log",
      data: o,
      method: "POST",
      timeout: E.requestTimeout,
      success: function (t) {
        "function" == typeof e && 200 === (null == t ? void 0 : t.statusCode) && e()
      }
    })
  } catch (n) {
    xt.error(n)
  }
}
var st = function () {
  function t() {
    f(this, t)
  }
  return v(t, null, [{
    key: "revise",
    value: function (t) {
      t > 0 && !this.isRevised && (this.offsetTime = t - Date.now(), this.isRevised = !0)
    }
  }, {
    key: "getRevisedcurrentTimeMillis",
    value: function () {
      return this.isRevised ? Date.now() + this.offsetTime : -1
    }
  }]), t
}();

function lt(t) {
  return new Promise((function (e, n) {
    wx.request({
      method: "POST",
      url: "https://api.datanexus.qq.com/data-nexus-config/v1/sdk/config/get",
      data: t,
      timeout: E.requestTimeout,
      success: function (t) {
        ft(t, e, "config/get", n), vt(t)
      },
      fail: function (t) {
        dt(t, "config/get", n)
      }
    })
  }))
}

function ft(t, e, n, r) {
  var o, i, a, u, c = null == t ? void 0 : t.statusCode,
    s = null == (o = null == t ? void 0 : t.data) ? void 0 : o.code;
  if (200 !== c || 0 !== s) {
    var l = s;
    200 !== c && (l = "number" == typeof c ? -1 * c : -888), ct({
      log_type: b.REQUEST_CONFIG_ERROR,
      message: "cgiName: ".concat(n, ", statusCode: ").concat(c, ", code: ").concat(s, ", traceid: ").concat(null == (a = null == t ? void 0 : t.data) ? void 0 : a.trace_id),
      code: l
    }), null == r || r(null == (u = null == t ? void 0 : t.data) ? void 0 : u.data)
  } else e(null == (i = t.data) ? void 0 : i.data)
}

function dt(t, e, n) {
  ct({
    log_type: b.REQUEST_CONFIG_ERROR,
    message: "cgiName: ".concat(e, " , message: ").concat(null == t ? void 0 : t.errMsg, " "),
    code: "number" == typeof (null == t ? void 0 : t.errno) ? -1 * t.errno : -999
  }), null == n || n(t)
}

function vt(t) {
  var e, n = 1 * (null == (e = null == t ? void 0 : t.header) ? void 0 : e["Server-Time"]);
  n > 17266752e5 && st.revise(n)
}
st.offsetTime = 0, st.isRevised = !1;
var pt = Object.prototype.toString,
  ht = function (t) {
    return "[object Object]" === pt.call(t)
  },
  yt = function (t) {
    return "[object Array]" === pt.call(t)
  },
  _t = function (t) {
    return "[object Function]" === pt.call(t)
  },
  gt = (new Date).getTime();

function mt() {
  var t = (new Date).getTime(),
    e = Math.abs(1e3 * (t - gt));
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (function (n) {
    var r = 16 * Math.random();
    return t > 0 ? (r = (t + r) % 16 | 0, t = Math.floor(t / 16)) : (r = (e + r) % 16 | 0, e = Math.floor(e / 16)), ("x" === n ? r : 3 & r | 8).toString(16).replace(/-/g, "")
  }))
}
var At = /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i,
  Rt = function (t) {
    if ("string" != typeof t) throw new TypeError("Invalid argument expected string");
    if (!At.test(t)) throw new Error("Invalid argument not valid semver ('".concat(t, "' received)"))
  },
  kt = function (t) {
    return isNaN(Number(t)) ? t : Number(t)
  },
  Tt = function (t) {
    var e = t.replace(/^v/, "").replace(/\+.*$/, ""),
      n = function (t, e) {
        return -1 === t.indexOf(e) ? t.length : t.indexOf(e)
      }(e, "-"),
      r = e.substring(0, n).split(".");
    return r.push(e.substring(n + 1)), r
  },
  St = function (t, e) {
    [t, e].forEach(Rt);
    for (var n = Tt(t), r = Tt(e), o = 0; o < Math.max(n.length - 1, r.length - 1); o++) {
      var i = parseInt(n[o] || "0", 10),
        a = parseInt(r[o] || "0", 10);
      if (i > a) return 1;
      if (a > i) return -1
    }
    var u = n[n.length - 1],
      c = r[r.length - 1];
    if (u && c)
      for (var s = u.split(".").map(kt), l = c.split(".").map(kt), f = 0; f < Math.max(s.length, l.length); f++) {
        if (void 0 === s[f] || "string" == typeof l[f] && "number" == typeof s[f]) return -1;
        if (void 0 === l[f] || "string" == typeof s[f] && "number" == typeof l[f] || s[f] > l[f]) return 1;
        if (l[f] > s[f]) return -1
      } else if (u || c) return u ? -1 : 1;
    return 0
  },
  Et = function (t) {
    return ht(t) ? (function (t) {
      var e = ["user_action_set_id", "secret_key", "appid", "openid", "unionid", "user_unique_id", "auto_track", "auto_attr"];
      for (var n in t) e.includes(n) || xt.warn("Invalid property '".concat(n, "' found in config"))
    }(t), "number" != typeof t.user_action_set_id ? "user_action_set_id 参数需为 number 类型" : t.user_action_set_id <= 0 ? "user_action_set_id 参数需大于 0" : "string" != typeof t.secret_key ? "secret_key 参数需为 string 类型" : "" === t.secret_key.trim() ? "缺少 secret_key 参数" : 32 !== t.secret_key.length ? "secret_key 参数需为 32 位字符串" : "string" != typeof t.appid ? "appid 参数需为 string 类型" : "" !== t.appid.trim() || "缺少 appid") : "初始化参数需为 object 类型"
  };

function bt(t) {
  return Ot()[t]
}

function Ot() {
  return E
}

function It(t, e) {
  return Object.prototype.hasOwnProperty.call(t, e)
}
var wt = function (t) {
    try {
      return t && "string" == typeof t ? -1 === (t = t.replace(/\s/g, "")).indexOf(".") ? t : t.split(".").slice(0, 2).join(".") : ""
    } catch (e) {
      return t
    }
  },
  Ct = function () {
    function t() {
      f(this, t)
    }
    return v(t, null, [{
      key: "error",
      value: function (t) {
        for (var e, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) r[o - 1] = arguments[o];
        (e = console).error.apply(e, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(t)].concat(r))
      }
    }, {
      key: "info",
      value: function (e) {
        for (var n, r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++) o[i - 1] = arguments[i];
        t.debug && (n = console).info.apply(n, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(o))
      }
    }, {
      key: "log",
      value: function (e) {
        for (var n, r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++) o[i - 1] = arguments[i];
        t.debug && (n = console).log.apply(n, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(o))
      }
    }, {
      key: "warn",
      value: function (t) {
        for (var e, n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), o = 1; o < n; o++) r[o - 1] = arguments[o];
        (e = console).warn.apply(e, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(t)].concat(r))
      }
    }, {
      key: "devLog",
      value: function (e) {
        for (var n, r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++) o[i - 1] = arguments[i];
        t.isDev && (n = console).log.apply(n, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(o))
      }
    }]), t
  }(),
  xt = Ct;
xt.debug = !1, xt.isDev = !1;
var Nt = function () {
  var t;
  return function () {
    if (!t) try {
      var e = wx.getLaunchOptionsSync(),
        n = e.query.gdt_vid || "";
      n ? tt.setSync(m, n) : n = tt.getSync(m) || "";
      var r = JSON.stringify(e);
      r.length > 1e4 && (r = JSON.stringify({
        cut: 1,
        scene: e.scene
      })), t = {
        source_scene: e.scene,
        pkg_channel_id: e.query.wxgamepro || "",
        ad_trace_id: n,
        launch_options: r,
        channel: ut(e)
      }
    } catch (e) {
      t = {}, xt.log("获取场景值和渠道号失败", e)
    }
    return t
  }
}();

function Lt(t, e, n) {
  var r = n.value;
  return n.value = function () {
    for (var n = arguments.length, o = new Array(n), i = 0; i < n; i++) o[i] = arguments[i];
    try {
      return r.apply(this, o)
    } catch (n) {
      try {
        xt.error.apply(xt, ["calling ".concat(t.constructor.name, ".").concat(e, " error with arguments")].concat(o)), xt.error(n);
        var a = {
          log_type: b.JS_RUN_ERROR,
          message: "[safeExcutable] ".concat(t.constructor.name, ".").concat(e, ": ").concat(null == n ? void 0 : n.message),
          err_stack: null == n ? void 0 : n.stack
        };
        _t(this.reportLog) ? this.reportLog(a) : ct(a)
      } catch (a) {}
    }
  }, n
}
var Pt = function (t, e, n) {
    var r = n.value;
    return n.value = function () {
      if (this.inited) {
        for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) e[n] = arguments[n];
        return r.apply(this, e)
      }
      xt.error("上报失败，请先完成初始化")
    }, n
  },
  Mt = Object.defineProperty,
  Dt = Object.getOwnPropertyDescriptor,
  Ut = function (t, e, n, r) {
    for (var o, i = r > 1 ? void 0 : r ? Dt(e, n) : e, a = t.length - 1; a >= 0; a--)(o = t[a]) && (i = (r ? o(e, n, i) : o(i)) || i);
    return r && i && Mt(e, n, i), i
  },
  qt = function () {
    function t(e) {
      var n = e.userActionSetId,
        r = e.maxLength,
        o = void 0 === r ? 500 : r;
      f(this, t), this.lostActionMaps = {}, this.stack = [], this.localStorageKey = "", this.localStorageKey = "".concat(g, "_").concat(null == n ? void 0 : n.toString()), this.maxLength = o, this.userActionSetId = n, this.setTimeStamp(), this.init()
    }
    return v(t, [{
      key: "getItems",
      value: function () {
        return this.stack
      }
    }, {
      key: "getStorage",
      value: function () {
        var t, e = (null == (t = tt) ? void 0 : t.getSync(this.localStorageKey)) || "[]";
        return JSON.parse(e)
      }
    }, {
      key: "reportLostNum",
      value: function () {
        var t = this,
          e = Object.assign({}, this.lostActionMaps),
          n = [];
        for (var r in e) {
          var o = null == r ? void 0 : r.split("_");
          n.push({
            queue_lost_session_id: o[0],
            queue_lost_timestamp: o[1],
            queue_lost_num: e[r]
          })
        }
        n.length && (this.setTimeStamp(), n.forEach((function (e) {
          var n = Object.assign({}, {
              user_action_set_id: t.userActionSetId,
              log_type: b.QUEUE_LOST_NUM
            }, e),
            r = null == e ? void 0 : e.queue_lost_session_id,
            o = null == e ? void 0 : e.queue_lost_timestamp,
            i = "".concat(r, "_").concat(o);
          ct(n, (function () {
            It(t.lostActionMaps, i) && (delete t.lostActionMaps[i], tt.setSync(A, JSON.stringify(t.lostActionMaps)))
          }))
        })))
      }
    }, {
      key: "getLostMaps",
      value: function () {
        return this.lostActionMaps
      }
    }, {
      key: "init",
      value: function () {
        var t = this,
          e = this.getStorage(),
          n = null == e ? void 0 : e.map((function (t) {
            var e, n;
            return t.inner_status === (null == (e = S) ? void 0 : e.reporting) ? Object.assign({}, t, {
              inner_status: null == (n = S) ? void 0 : n.fail,
              is_retry: !0,
              retry_count: t.retry_count + 1
            }) : t
          }));
        this.stack = n, this.lostActionMaps = JSON.parse(tt.getSync(A) || "{}"), setTimeout((function () {
          t.reportLostNum()
        }), 1e3)
      }
    }, {
      key: "addItem",
      value: function (t) {
        var e;
        null == (e = null == this ? void 0 : this.stack) || e.push(t)
      }
    }, {
      key: "removeItems",
      value: function (t) {
        var e, n = null == (e = null == this ? void 0 : this.stack) ? void 0 : e.filter((function (e) {
          return !(null != t && t.includes(null == e ? void 0 : e.action_id))
        }));
        this.stack = n
      }
    }, {
      key: "updateForReportFail",
      value: function (t) {
        var e;
        this.stack = null == (e = this.stack) ? void 0 : e.map((function (e) {
          var n;
          return null != t && t.includes(null == e ? void 0 : e.action_id) ? Object.assign({}, e, {
            inner_status: null == (n = S) ? void 0 : n.fail,
            retry_count: e.retry_count + 1,
            is_retry: !0
          }) : e
        }))
      }
    }, {
      key: "updateForReporting",
      value: function (t) {
        var e;
        this.stack = null == (e = this.stack) ? void 0 : e.map((function (e) {
          var n;
          return null != t && t.includes(null == e ? void 0 : e.action_id) ? Object.assign({}, e, {
            inner_status: null == (n = S) ? void 0 : n.reporting
          }) : e
        }))
      }
    }, {
      key: "updateAllStack",
      value: function (t) {
        this.stack = t
      }
    }, {
      key: "updateToStorage",
      value: function () {
        tt.setSync(this.localStorageKey, JSON.stringify(this.stack))
      }
    }, {
      key: "updateLostAction",
      value: function (t) {
        if (t) {
          var e = "".concat(t, "_").concat(this.timeStamp),
            n = this.lostActionMaps[e] || 0;
          this.lostActionMaps[e] = n + 1, tt.setSync(A, JSON.stringify(this.lostActionMaps))
        }
      }
    }, {
      key: "setTimeStamp",
      value: function () {
        this.timeStamp = Date.now().toString()
      }
    }]), t
  }();
Ut([Lt], qt.prototype, "getItems", 1), Ut([Lt], qt.prototype, "getStorage", 1), Ut([Lt], qt.prototype, "reportLostNum", 1), Ut([Lt], qt.prototype, "getLostMaps", 1), Ut([Lt], qt.prototype, "init", 1), Ut([Lt], qt.prototype, "addItem", 1), Ut([Lt], qt.prototype, "removeItems", 1), Ut([Lt], qt.prototype, "updateForReportFail", 1), Ut([Lt], qt.prototype, "updateForReporting", 1), Ut([Lt], qt.prototype, "updateAllStack", 1), Ut([Lt], qt.prototype, "updateToStorage", 1), Ut([Lt], qt.prototype, "updateLostAction", 1);
var jt = Object.defineProperty,
  Ft = Object.getOwnPropertyDescriptor,
  Bt = function (t, e, n, r) {
    for (var o, i = r > 1 ? void 0 : r ? Ft(e, n) : e, a = t.length - 1; a >= 0; a--)(o = t[a]) && (i = (r ? o(e, n, i) : o(i)) || i);
    return r && i && jt(e, n, i), i
  },
  Vt = function (t) {
    o(n, qt);
    var e = a(n);

    function n(t) {
      var r, o = t.userActionSetId,
        i = t.maxLength,
        a = void 0 === i ? 500 : i,
        u = t.ogEvents,
        c = void 0 === u ? [] : u;
      return f(this, n), (r = e.call(this, {
        userActionSetId: o,
        maxLength: a
      })).ogEvents = c, r
    }
    return v(n, [{
      key: "getReportableActions",
      value: function () {
        var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 100,
          e = this.getItems(),
          n = [];
        return null == e || e.forEach((function (e) {
          var r;
          (null == n ? void 0 : n.length) < t && (null == e ? void 0 : e.inner_status) !== (null == (r = S) ? void 0 : r.reporting) && (null == n || n.push(e))
        })), n
      }
    }, {
      key: "addAction",
      value: function (t) {
        var e = this.getItems();
        if ((null == e ? void 0 : e.length) >= this.maxLength) {
          var n = "队列长度超过最大限制".concat(this.maxLength, "条，SDK将按照行为优先级排序，丢弃优先级最低的行为事件");
          xt.warn(n), ct({
            user_action_set_id: this.userActionSetId,
            log_type: b.JS_QUEUE_LOG,
            message: n
          });
          var r = this.sortQueue(t, e);
          xt.debug && xt.info("超过".concat(this.maxLength, "条按优先级排序的队列："), r.concat([]));
          var o = r.pop();
          this.updateAllStack(r), this.updateLostAction((null == o ? void 0 : o.session_id) || "")
        } else this.addItem(t);
        this.updateToStorage()
      }
    }, {
      key: "removeActions",
      value: function (t) {
        this.removeItems(t), this.updateToStorage()
      }
    }, {
      key: "updateActionsForReportFail",
      value: function (t) {
        this.updateForReportFail(t), this.updateToStorage()
      }
    }, {
      key: "updateActionsForReporting",
      value: function (t) {
        this.updateForReporting(t), this.updateToStorage()
      }
    }, {
      key: "getReportableActionsLength",
      value: function () {
        var t = this.getItems().filter((function (t) {
          var e;
          return (null == t ? void 0 : t.inner_status) !== (null == (e = S) ? void 0 : e.reporting)
        }));
        return null == t ? void 0 : t.length
      }
    }, {
      key: "sortQueue",
      value: function (t, e) {
        var n = this,
          r = {},
          o = null == t ? void 0 : t.action_time,
          i = e.concat([t]),
          a = function (t) {
            return r[t.action_id] || (r[t.action_id] = n.caculateWeight(o, t)), r[t.action_id]
          };
        return i.sort((function (t, e) {
          return a(e) - a(t)
        }))
      }
    }, {
      key: "caculateWeight",
      value: function (t, e) {
        var n, r = 0,
          o = this.formatWeight(t, null == e ? void 0 : e.action_time),
          i = o.ogWeight,
          a = o.sdkWeight,
          u = o.userWeight;
        null != (n = this.ogEvents) && n.includes(null == e ? void 0 : e.action_type) && (r += i), null != e && e.is_sdk_auto_track ? r += a : r += u;
        var c = t - (null == e ? void 0 : e.action_time) + 1;
        return r = c > 0 ? r + 1 / c : r
      }
    }, {
      key: "formatWeight",
      value: function (t, e) {
        var n = N,
          r = P,
          o = L;
        return t - e > 2592e6 && (n /= 100, r /= 100, o /= 100), {
          ogWeight: n,
          sdkWeight: r,
          userWeight: o
        }
      }
    }]), n
  }();
Bt([Lt], Vt.prototype, "getReportableActions", 1), Bt([Lt], Vt.prototype, "addAction", 1), Bt([Lt], Vt.prototype, "removeActions", 1), Bt([Lt], Vt.prototype, "updateActionsForReportFail", 1), Bt([Lt], Vt.prototype, "updateActionsForReporting", 1), Bt([Lt], Vt.prototype, "getReportableActionsLength", 1), Bt([Lt], Vt.prototype, "sortQueue", 1), Bt([Lt], Vt.prototype, "caculateWeight", 1), Bt([Lt], Vt.prototype, "formatWeight", 1);
var Kt = function () {
    function t() {
      f(this, t), this.events = {}
    }
    return v(t, [{
      key: "subscribe",
      value: function (e, n) {
        t.checkCallback(n), yt(this.events[e]) ? this.events[e].push(n) : this.events[e] = [n]
      }
    }, {
      key: "once",
      value: function (e, n) {
        t.checkCallback(n), this.subscribe(this.onceEventName(e), n)
      }
    }, {
      key: "unsubscribe",
      value: function (e, n) {
        t.checkCallback(n), yt(this.events[e]) && (this.events[e] = this.events[e].filter((function (t) {
          return t !== n
        }))), yt(this.events[this.onceEventName(e)]) && (this.events[this.onceEventName(e)] = this.events[this.onceEventName(e)].filter((function (t) {
          return t !== n
        })))
      }
    }, {
      key: "publish",
      value: function (t) {
        for (var e = arguments.length, n = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++) n[r - 1] = arguments[r];
        var o = Date.now();
        yt(this.events[t]) && this.events[t].forEach((function (t) {
          return t.apply(void 0, [o].concat(n))
        })), yt(this.events[this.onceEventName(t)]) && (this.events[this.onceEventName(t)].forEach((function (t) {
          return t.apply(void 0, [o].concat(n))
        })), this.events[this.onceEventName(t)] = [])
      }
    }, {
      key: "onceEventName",
      value: function (t) {
        return "once_event_prefix_".concat(t)
      }
    }], [{
      key: "checkCallback",
      value: function (e) {
        _t(e) || xt.error(t.ERROR_CALLBACK_IS_NOT_A_FUNCTION)
      }
    }]), t
  }(),
  Gt = Kt;
Gt.ERROR_CALLBACK_IS_NOT_A_FUNCTION = "callback 不是函数";
var Qt = new Gt,
  Yt = ["REGISTER", "VIEW_CONTENT", "ADD_TO_CART", "PURCHASE", "COMPLETE_ORDER", "ADD_TO_WISHLIST", "START_APP", "CREATE_ROLE", "AUTHORIZE", "TUTORIAL_FINISH", "START_PAY", "FINISH_PAY"],
  Wt = "START_APP",
  Jt = "TICKET",
  Ht = "ENTER_FOREGROUND",
  zt = "ENTER_BACKGROUND",
  $t = "LOGIN",
  Xt = "SHARE",
  Zt = "TAP_GAME_CLUB",
  te = "CREATE_GAME_CLUB",
  ee = "CREATE_GAME_ROOM",
  ne = "JOIN_GAME_ROOM",
  re = "FINISH_PAY",
  oe = "START_PAY",
  ie = "ADD_TO_WISHLIST",
  ae = ["REGISTER", "START_APP", "RE_ACTIVE"],
  ue = ["TICKET", "ENTER_FOREGROUND", "ENTER_BACKGROUND"],
  ce = function () {
    function t() {
      f(this, t), this.channelClaimActionList = ae, this.noClaimActionList = ue, this.realTimeActionList = E.realTimeActionList, this.ticketInterval = 60, this.requestTimeout = E.requestTimeout, this.loadConfig()
    }
    return v(t, [{
      key: "getChannelClaimActionList",
      value: function () {
        return this.channelClaimActionList
      }
    }, {
      key: "getNoClaimActionList",
      value: function () {
        return this.noClaimActionList
      }
    }, {
      key: "getRealTimeActionList",
      value: function () {
        return this.realTimeActionList
      }
    }, {
      key: "getTicketInterval",
      value: function () {
        return this.ticketInterval
      }
    }, {
      key: "getRequestTimeout",
      value: function () {
        return this.requestTimeout
      }
    }, {
      key: "loadConfig",
      value: function () {
        var t = this;
        try {
          if ("undefined" == typeof wx) return;
          var e = tt.getSync(k);
          e && this.updateConfig(e), lt({
            conf_name: "mini_game_sdk_common",
            conf_key: "config"
          }).then((function (e) {
            e && ht(e) && (t.updateConfig(e), tt.setSync(k, e))
          }))
        } catch (e) {
          console.error(e)
        }
      }
    }, {
      key: "updateConfig",
      value: function (t) {
        t.channelClaimActionList && yt(t.channelClaimActionList) && (this.channelClaimActionList = t.channelClaimActionList), t.noClaimActionList && yt(t.noClaimActionList) && (this.noClaimActionList = t.noClaimActionList), t.realTimeActionList && yt(t.realTimeActionList) && (this.realTimeActionList = t.realTimeActionList), t.ticketInterval && "number" == typeof t.ticketInterval && t.ticketInterval > 1 && t.ticketInterval !== this.ticketInterval && (this.ticketInterval = t.ticketInterval, Qt.publish(Z)), t.requestTimeout && "number" == typeof t.requestTimeout && t.requestTimeout > 5e3 && (this.requestTimeout = t.requestTimeout)
      }
    }]), t
  }(),
  se = new ce,
  le = Wt,
  fe = Jt,
  de = Ht,
  ve = zt,
  pe = function () {
    var t = !1,
      e = !1,
      n = !0,
      r = !0,
      o = !0,
      i = !1;
    return function () {
      if (!i) {
        i = !0;
        var a = tt.getSync(R);
        if ((null == a ? void 0 : a.bg) === G ? t = !0 : (null == a ? void 0 : a.bg) === Q && (t = !1), (null == a ? void 0 : a.fg) === G ? e = !0 : (null == a ? void 0 : a.fg) === Q && (e = !1), (null == a ? void 0 : a.st) === G ? n = !0 : (null == a ? void 0 : a.st) === Q && (n = !1), (null == a ? void 0 : a.ti) === G ? r = !0 : (null == a ? void 0 : a.ti) === Q && (r = !1), xt.devLog("当前缓存开关 bgOn，fgOn，stOn，tiOn：", t, e, n, r), n && Qt.publish(le), r) {
          var u = function () {
              o && Qt.publish(fe)
            },
            c = setInterval(u, 1e3 * se.getTicketInterval());
          Qt.subscribe(Z, (function () {
            c && clearInterval(c), c = setInterval(u, 1e3 * se.getTicketInterval())
          }))
        }
        wx.onShow((function (t) {
          if (o = !0, e) {
            var n = "";
            try {
              (n = JSON.stringify(t)).length > 1e4 && (n = JSON.stringify({
                cut: 1,
                scene: t.scene
              }))
            } catch (t) {}
            Qt.publish(de, {
              enter_options: n
            })
          }
        })), wx.onHide((function () {
          o = !1, t && Qt.publish(ve)
        }))
      }
    }
  }(),
  he = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function ye(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t
}
var _e, ge = ye((function () {
    var t, e = null;

    function n(t) {
      return !!t && ("object" == l(t) || "function" == typeof t)
    }

    function r(t) {
      if (null !== t && !n(t)) throw new TypeError("Object prototype may only be an Object or null: " + t)
    }
    var o = Object,
      i = !(!o.create && {
          __proto__: null
        }
        instanceof o),
      a = o.create || (i ? function (t) {
        return r(t), {
          __proto__: t
        }
      } : function (t) {
        if (r(t), null === t) throw new SyntaxError("Native Object.create is required to create objects with null prototype");
        var e = function () {};
        return e.prototype = t, new e
      }),
      u = function () {
        return null
      },
      c = o.getPrototypeOf || ([].__proto__ === Array.prototype ? function (t) {
        var e = t.__proto__;
        return n(e) ? e : null
      } : u);
    return t = function (s, l) {
      if (void 0 === (this && this instanceof t ? this.constructor : void 0)) throw new TypeError("Constructor Proxy requires 'new'");
      if (!n(s) || !n(l)) throw new TypeError("Cannot create proxy with a non-object as target or handler");
      var f = function () {};
      e = function () {
        s = null, f = function (t) {
          throw new TypeError("Cannot perform '".concat(t, "' on a proxy that has been revoked"))
        }
      }, setTimeout((function () {
        e = null
      }), 0);
      var d = l;
      for (var v in l = {
          get: null,
          set: null,
          apply: null,
          construct: null
        }, d) {
        if (!(v in l)) throw new TypeError("Proxy polyfill does not support trap '".concat(v, "'"));
        l[v] = d[v]
      }
      "function" == typeof d && (l.apply = d.apply.bind(d));
      var p, h = c(s),
        y = !1,
        _ = !1;
      "function" == typeof s ? (p = function () {
        var t = this && this.constructor === p,
          e = Array.prototype.slice.call(arguments);
        return f(t ? "construct" : "apply"), t && l.construct ? l.construct.call(this, s, e) : !t && l.apply ? l.apply(s, this, e) : t ? (e.unshift(s), new(s.bind.apply(s, e))) : s.apply(this, e)
      }, y = !0) : s instanceof Array ? (p = [], _ = !0) : p = i || null !== h ? a(h) : {};
      var g = l.get ? function (t) {
          return f("get"), l.get(this, t, p)
        } : function (t) {
          return f("get"), this[t]
        },
        m = l.set ? function (t, e) {
          f("set"), l.set(this, t, e, p)
        } : function (t, e) {
          f("set"), this[t] = e
        },
        A = o.getOwnPropertyNames(s),
        R = {};
      A.forEach((function (t) {
        if (!y && !_ || !(t in p)) {
          var e = {
            enumerable: !!o.getOwnPropertyDescriptor(s, t).enumerable,
            get: g.bind(s, t),
            set: m.bind(s, t)
          };
          o.defineProperty(p, t, e), R[t] = !0
        }
      }));
      var k = !0;
      if (y || _) {
        var T = o.setPrototypeOf || ([].__proto__ === Array.prototype ? function (t, e) {
          return r(e), t.__proto__ = e, t
        } : u);
        h && T(p, h) || (k = !1)
      }
      if (l.get || !k)
        for (var S in s) R[S] || o.defineProperty(p, S, {
          get: g.bind(s, S)
        });
      return o.seal(s), o.seal(p), p
    }, t.revocable = function (n, r) {
      return {
        proxy: new t(n, r),
        revoke: e
      }
    }, t
  })),
  me = {};
try {
  _e || (_e = ge())
} catch (h) {
  Se(h)
}

function Ae(t, n, r, o) {
  try {
    if (!_e || null == t || !t[n]) return;
    t[n] = new _e(t[n], {
      apply: function (t, n, i) {
        var a, u;
        o && Te((function () {
          return o.apply(void 0, e(i))
        }));
        var c = !!(null != (a = i[0]) && a.success || null != (u = i[0]) && u.fail);
        c && ["success", "fail"].forEach((function (t) {
          if (i[0][t]) try {
            i[0][t] = new _e(i[0][t], {
              apply: function (n, o, a) {
                return Te((function () {
                  return r.apply(void 0, [t, i[0]].concat(e(a)))
                })), n.apply(o, a)
              }
            })
          } catch (t) {
            Se(t)
          }
        }));
        var s = t.apply(n, i);
        return !c && s && "[object Promise]" === Object.prototype.toString.call(s) ? s.then((function (t) {
          return Te((function () {
            return r("success", i[0], t)
          })), t
        })).catch((function (t) {
          throw Te((function () {
            return r("fail", i[0], t)
          })), t
        })) : s
      }
    })
  } catch (t) {
    Se(t)
  }
}

function Re(t, n, r) {
  try {
    if (!_e || null == t || !t[n]) return;
    t[n] = new _e(t[n], {
      apply: function (t, n, o) {
        var i = "function" == typeof o[0];
        if (i) try {
          o[0] = new _e(o[0], {
            apply: function (t, n, o) {
              var i = t.call.apply(t, [n].concat(e(o)));
              return Te((function () {
                return r(i)
              })), i
            }
          })
        } catch (t) {
          Se(t)
        }
        var a = t.call.apply(t, [n].concat(e(o)));
        return i || Te((function () {
          return r(a)
        })), a
      }
    })
  } catch (t) {
    Se(t)
  }
}

function ke(t) {
  var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
    r = arguments.length > 2 ? arguments[2] : void 0,
    o = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : [],
    i = arguments.length > 4 ? arguments[4] : void 0;
  try {
    if (!_e || null == t || !t[n]) return;
    t[n] = new _e(t[n], {
      apply: function (t, a, u) {
        var c = t.call.apply(t, [a].concat(e(u)));
        return (!r || !me[n]) && (Te((function () {
          return null == i ? void 0 : i(c)
        })), o.forEach((function (t) {
          var e = t.eventName,
            n = t.isAsync,
            r = t.proxyEvent;
          n ? Ae(c, e, r) : Re(c, e, r)
        }))), r && (me[n] = !0), c
      }
    })
  } catch (t) {
    Se(t)
  }
}

function Te(t) {
  try {
    t()
  } catch (t) {
    Se(t)
  }
}

function Se(t) {
  ct({
    log_type: b.PROXY_ERROR,
    message: null == t ? void 0 : t.message,
    err_stack: null == t ? void 0 : t.stack
  })
}
var Ee = $t,
  be = ie,
  Oe = Xt,
  Ie = Zt,
  we = te,
  Ce = ne,
  xe = oe,
  Ne = re,
  Le = function () {
    var t = !1;
    return function () {
      t || (t = !0, Ae(wx, "login", (function (t) {
        "success" === t && Qt.publish(Ee)
      })), Re(wx, "onAddToFavorites", (function () {
        Qt.publish(be)
      })), Re(wx, "onShareTimeline", (function () {
        Qt.publish(Oe, {
          target: "TIME_LINE",
          trigger: "MENU"
        })
      })), Re(wx, "onShareAppMessage", (function () {
        Qt.publish(Oe, {
          target: "APP_MESSAGE",
          trigger: "MENU"
        })
      })), Re(wx, "shareAppMessage", (function () {
        Qt.publish(Oe, {
          target: "APP_MESSAGE",
          trigger: "BUTTON"
        })
      })), ke(wx, "createGameClubButton", !1, [{
        isAsync: !1,
        eventName: "onTap",
        proxyEvent: function () {
          Qt.publish(Ie)
        }
      }], (function () {
        Qt.publish(we)
      })), ke(wx, "getGameServerManager", !0, [{
        isAsync: !0,
        eventName: "createRoom",
        proxyEvent: function (t) {
          "success" === t && Qt.publish("CREATE_GAME_ROOM")
        }
      }, {
        isAsync: !0,
        eventName: "joinRoom",
        proxyEvent: function (t) {
          "success" === t && Qt.publish(Ce)
        }
      }]), Ae(wx, "requestMidasPayment", (function (t, e) {
        Qt.publish(Ne, {
          status: "success" === t ? "SUCCESS" : "FAIL",
          quantity: (null == e ? void 0 : e.buyQuantity) || 0,
          mode: (null == e ? void 0 : e.mode) || "",
          platform: (null == e ? void 0 : e.platform) || "",
          no: (null == e ? void 0 : e.outTradeNo) || "",
          payType: "Midas"
        })
      }), (function (t) {
        Qt.publish(xe, {
          quantity: (null == t ? void 0 : t.buyQuantity) || 0,
          mode: (null == t ? void 0 : t.mode) || "",
          platform: (null == t ? void 0 : t.platform) || "",
          no: (null == t ? void 0 : t.outTradeNo) || "",
          payType: "Midas"
        })
      })), Ae(wx, "requestMidasPaymentGameItem", (function (t, e) {
        var n = (e || {}).signData;
        Qt.publish(Ne, {
          status: "success" === t ? "SUCCESS" : "FAIL",
          quantity: (null == n ? void 0 : n.buyQuantity) || 0,
          mode: (null == n ? void 0 : n.mode) || "",
          platform: (null == n ? void 0 : n.platform) || "",
          no: (null == n ? void 0 : n.outTradeNo) || "",
          p: (null == n ? void 0 : n.goodsPrice) || 0,
          productId: (null == n ? void 0 : n.productId) || "",
          payType: "MidasGameItem"
        })
      }), (function (t) {
        var e = (t || {}).signData;
        Qt.publish(xe, {
          quantity: (null == e ? void 0 : e.buyQuantity) || 0,
          mode: (null == e ? void 0 : e.mode) || "",
          platform: (null == e ? void 0 : e.platform) || "",
          no: (null == e ? void 0 : e.outTradeNo) || "",
          p: (null == e ? void 0 : e.goodsPrice) || 0,
          productId: (null == e ? void 0 : e.productId) || "",
          payType: "MidasGameItem"
        })
      })))
    }
  }(),
  Pe = function () {
    function t() {
      f(this, t)
    }
    return v(t, null, [{
      key: "isEmpty",
      value: function (t) {
        return !t || "" === t.trim()
      }
    }, {
      key: "format",
      value: function (t) {
        for (var e = arguments.length, n = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++) n[r - 1] = arguments[r];
        return t.replace(/\${(\d+)}/g, (function (t, e) {
          return n[e]
        }))
      }
    }, {
      key: "customStringify",
      value: function (t) {
        var e = [];
        try {
          return JSON.stringify(t, (function (t, n) {
            if (void 0 === n) return "undefined";
            if ("object" == l(n) && null !== n) {
              if (-1 !== e.indexOf(n)) return "[Circular]";
              e.push(n)
            }
            return "bigint" == typeof n ? n.toString() : n
          }))
        } catch (t) {
          return "[Param Error]"
        }
      }
    }]), t
  }(),
  Me = /^([a-zA-Z][a-zA-Z\d_]{0,63})$/i,
  De = /^ams_reserved_(.*)/i,
  Ue = function () {
    function t() {
      f(this, t)
    }
    return v(t, null, [{
      key: "validateActionType",
      value: function (e) {
        return Pe.isEmpty(e) ? (xt.error(t.ERROR_ACTION_TYPE_NULL), !1) : !!Me.test(e) || (xt.error(t.ERROR_ACTION_TYPE_INVALID), !1)
      }
    }, {
      key: "validateActionParam",
      value: function (e) {
        if (!e) return !0;
        if (!ht(e)) return xt.error(t.ERROR_ACTION_PARAM_IS_NOT_OBJECT), !1;
        for (var n in e) {
          if (Pe.isEmpty(n)) return xt.error(t.ERROR_ACTION_PARAM_KEY_NULL), !1;
          if (!Me.test(n)) return xt.error(t.ERROR_ACTION_PARAM_KEY_INVALID), !1;
          De.test(n) && xt.warn(t.WARN_ACTION_PARAM_KEY_RESERVED);
          var r = e[n];
          if (!t.isValidValue(r)) return xt.error(Pe.format(t.ERROR_ACTION_PARAM_VALUE_INVALID, n, r)), !1;
          if (yt(r)) {
            if (!t.isValidArrayValue(r)) {
              for (var o = 0; o < r.length; o++) xt.error(Pe.format(t.ERROR_ACTION_PARAM_VALUE_ARRAY_INVALID, n, Pe.customStringify(r), o, r[o]));
              return !1
            }
            if (!t.checkArrayElementTypes(r)) return xt.error(t.ERROR_ACTION_PARAM_VALUE_ARRAY_TYPE_UNUNIQUE), !1
          }
        }
        return !0
      }
    }, {
      key: "isValidValue",
      value: function (t) {
        return null == t || ("string" == typeof t || "number" == typeof t || "boolean" == typeof t || yt(t))
      }
    }, {
      key: "isValidArrayValue",
      value: function (t) {
        for (var e = 0; e < t.length; e++) {
          var n = t[e];
          if ("string" != typeof n && "number" != typeof n && "boolean" != typeof n) return !1
        }
        return !0
      }
    }, {
      key: "checkArrayElementTypes",
      value: function (t) {
        if (!t || t.length <= 1) return !0;
        for (var e = l(t[0]), n = 1; n < t.length; n++)
          if (l(t[n]) !== e) return !1;
        return !0
      }
    }]), t
  }(),
  qe = Ue;
qe.ERROR_ACTION_TYPE_NULL = "在track方法中，action_type参数不能为空！", qe.ERROR_ACTION_TYPE_INVALID = "在track方法中，action_type参数只能包含字母、数字和下划线，且只能以字母开头，长度不能超过64个字符！", qe.ERROR_ACTION_PARAM_KEY_NULL = "在track方法中，action_param参数的key不能为空！", qe.ERROR_ACTION_PARAM_KEY_INVALID = "在track方法中，action_param参数的key只能包含字母、数字和下划线，且不能以数字开头，长度不能超过64个字符！", qe.WARN_ACTION_PARAM_KEY_RESERVED = "SDK内部预留参数的key均以'ams_reserved_'开头，该参数的值会被SDK内部覆盖，请不要使用！", qe.ERROR_ACTION_PARAM_VALUE_INVALID = "在track方法中，action_param参数的value必须是String/Number/Boolean/Array中的一种！[key=${0}, value=${1}]", qe.ERROR_ACTION_PARAM_VALUE_ARRAY_INVALID = "在track方法中，如果action_param参数中的某个元素的value是Array，那么这个Array中的每个元素必须是String/Number/Boolean中的一种！[key=${0}, value=${1}, 数组的第${2}个元素为${3}]", qe.ERROR_ACTION_PARAM_VALUE_ARRAY_TYPE_UNUNIQUE = "在track方法中，如果action_param参数中的某个元素的value是Array，那么这个Array中所有元素的类型必须是同一种！", qe.ERROR_ACTION_PARAM_IS_NOT_OBJECT = "action_param 参数不是Object";
var je = {
  exports: {}
};
! function (t) {
  ! function (e) {
    function n(t, e) {
      var n = (65535 & t) + (65535 & e);
      return (t >> 16) + (e >> 16) + (n >> 16) << 16 | 65535 & n
    }

    function r(t, e, r, o, i, a) {
      return n(function (t, e) {
        return t << e | t >>> 32 - e
      }(n(n(e, t), n(o, a)), i), r)
    }

    function o(t, e, n, o, i, a, u) {
      return r(e & n | ~e & o, t, e, i, a, u)
    }

    function i(t, e, n, o, i, a, u) {
      return r(e & o | n & ~o, t, e, i, a, u)
    }

    function a(t, e, n, o, i, a, u) {
      return r(e ^ n ^ o, t, e, i, a, u)
    }

    function u(t, e, n, o, i, a, u) {
      return r(n ^ (e | ~o), t, e, i, a, u)
    }

    function c(t, e) {
      t[e >> 5] |= 128 << e % 32, t[14 + (e + 64 >>> 9 << 4)] = e;
      var r, c, s, l, f, d = 1732584193,
        v = -271733879,
        p = -1732584194,
        h = 271733878;
      for (r = 0; r < t.length; r += 16) c = d, s = v, l = p, f = h, d = o(d, v, p, h, t[r], 7, -680876936), h = o(h, d, v, p, t[r + 1], 12, -389564586), p = o(p, h, d, v, t[r + 2], 17, 606105819), v = o(v, p, h, d, t[r + 3], 22, -1044525330), d = o(d, v, p, h, t[r + 4], 7, -176418897), h = o(h, d, v, p, t[r + 5], 12, 1200080426), p = o(p, h, d, v, t[r + 6], 17, -1473231341), v = o(v, p, h, d, t[r + 7], 22, -45705983), d = o(d, v, p, h, t[r + 8], 7, 1770035416), h = o(h, d, v, p, t[r + 9], 12, -1958414417), p = o(p, h, d, v, t[r + 10], 17, -42063), v = o(v, p, h, d, t[r + 11], 22, -1990404162), d = o(d, v, p, h, t[r + 12], 7, 1804603682), h = o(h, d, v, p, t[r + 13], 12, -40341101), p = o(p, h, d, v, t[r + 14], 17, -1502002290), d = i(d, v = o(v, p, h, d, t[r + 15], 22, 1236535329), p, h, t[r + 1], 5, -165796510), h = i(h, d, v, p, t[r + 6], 9, -1069501632), p = i(p, h, d, v, t[r + 11], 14, 643717713), v = i(v, p, h, d, t[r], 20, -373897302), d = i(d, v, p, h, t[r + 5], 5, -701558691), h = i(h, d, v, p, t[r + 10], 9, 38016083), p = i(p, h, d, v, t[r + 15], 14, -660478335), v = i(v, p, h, d, t[r + 4], 20, -405537848), d = i(d, v, p, h, t[r + 9], 5, 568446438), h = i(h, d, v, p, t[r + 14], 9, -1019803690), p = i(p, h, d, v, t[r + 3], 14, -187363961), v = i(v, p, h, d, t[r + 8], 20, 1163531501), d = i(d, v, p, h, t[r + 13], 5, -1444681467), h = i(h, d, v, p, t[r + 2], 9, -51403784), p = i(p, h, d, v, t[r + 7], 14, 1735328473), d = a(d, v = i(v, p, h, d, t[r + 12], 20, -1926607734), p, h, t[r + 5], 4, -378558), h = a(h, d, v, p, t[r + 8], 11, -2022574463), p = a(p, h, d, v, t[r + 11], 16, 1839030562), v = a(v, p, h, d, t[r + 14], 23, -35309556), d = a(d, v, p, h, t[r + 1], 4, -1530992060), h = a(h, d, v, p, t[r + 4], 11, 1272893353), p = a(p, h, d, v, t[r + 7], 16, -155497632), v = a(v, p, h, d, t[r + 10], 23, -1094730640), d = a(d, v, p, h, t[r + 13], 4, 681279174), h = a(h, d, v, p, t[r], 11, -358537222), p = a(p, h, d, v, t[r + 3], 16, -722521979), v = a(v, p, h, d, t[r + 6], 23, 76029189), d = a(d, v, p, h, t[r + 9], 4, -640364487), h = a(h, d, v, p, t[r + 12], 11, -421815835), p = a(p, h, d, v, t[r + 15], 16, 530742520), d = u(d, v = a(v, p, h, d, t[r + 2], 23, -995338651), p, h, t[r], 6, -198630844), h = u(h, d, v, p, t[r + 7], 10, 1126891415), p = u(p, h, d, v, t[r + 14], 15, -1416354905), v = u(v, p, h, d, t[r + 5], 21, -57434055), d = u(d, v, p, h, t[r + 12], 6, 1700485571), h = u(h, d, v, p, t[r + 3], 10, -1894986606), p = u(p, h, d, v, t[r + 10], 15, -1051523), v = u(v, p, h, d, t[r + 1], 21, -2054922799), d = u(d, v, p, h, t[r + 8], 6, 1873313359), h = u(h, d, v, p, t[r + 15], 10, -30611744), p = u(p, h, d, v, t[r + 6], 15, -1560198380), v = u(v, p, h, d, t[r + 13], 21, 1309151649), d = u(d, v, p, h, t[r + 4], 6, -145523070), h = u(h, d, v, p, t[r + 11], 10, -1120210379), p = u(p, h, d, v, t[r + 2], 15, 718787259), v = u(v, p, h, d, t[r + 9], 21, -343485551), d = n(d, c), v = n(v, s), p = n(p, l), h = n(h, f);
      return [d, v, p, h]
    }

    function s(t) {
      var e, n = "",
        r = 32 * t.length;
      for (e = 0; e < r; e += 8) n += String.fromCharCode(t[e >> 5] >>> e % 32 & 255);
      return n
    }

    function l(t) {
      var e, n = [];
      for (n[(t.length >> 2) - 1] = void 0, e = 0; e < n.length; e += 1) n[e] = 0;
      var r = 8 * t.length;
      for (e = 0; e < r; e += 8) n[e >> 5] |= (255 & t.charCodeAt(e / 8)) << e % 32;
      return n
    }

    function f(t) {
      var e, n, r = "0123456789abcdef",
        o = "";
      for (n = 0; n < t.length; n += 1) e = t.charCodeAt(n), o += r.charAt(e >>> 4 & 15) + r.charAt(15 & e);
      return o
    }

    function d(t) {
      return unescape(encodeURIComponent(t))
    }

    function v(t) {
      return function (t) {
        return s(c(l(t), 8 * t.length))
      }(d(t))
    }

    function p(t, e) {
      return function (t, e) {
        var n, r, o = l(t),
          i = [],
          a = [];
        for (i[15] = a[15] = void 0, o.length > 16 && (o = c(o, 8 * t.length)), n = 0; n < 16; n += 1) i[n] = 909522486 ^ o[n], a[n] = 1549556828 ^ o[n];
        return r = c(i.concat(l(e)), 512 + 8 * e.length), s(c(a.concat(r), 640))
      }(d(t), d(e))
    }

    function h(t, e, n) {
      return e ? n ? p(e, t) : function (t, e) {
        return f(p(t, e))
      }(e, t) : n ? v(t) : function (t) {
        return f(v(t))
      }(t)
    }
    t.exports ? t.exports = h : e.md5 = h
  }(he)
}(je);
var Fe = ye(je.exports),
  Be = "function" == typeof btoa,
  Ve = "function" == typeof Buffer;
"function" == typeof TextDecoder && new TextDecoder;
var Ke, Ge = "function" == typeof TextEncoder ? new TextEncoder : void 0,
  Qe = Array.prototype.slice.call("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=");
Ke = {}, Qe.forEach((function (t, e) {
  return Ke[t] = e
}));
var Ye = String.fromCharCode.bind(String);
"function" == typeof Uint8Array.from && Uint8Array.from.bind(Uint8Array);
var We = Be ? function (t) {
    return btoa(t)
  } : Ve ? function (t) {
    return Buffer.from(t, "binary").toString("base64")
  } : function (t) {
    for (var e, n, r, o, i = "", a = t.length % 3, u = 0; u < t.length;) {
      if ((n = t.charCodeAt(u++)) > 255 || (r = t.charCodeAt(u++)) > 255 || (o = t.charCodeAt(u++)) > 255) throw new TypeError("invalid character found");
      i += Qe[(e = n << 16 | r << 8 | o) >> 18 & 63] + Qe[e >> 12 & 63] + Qe[e >> 6 & 63] + Qe[63 & e]
    }
    return a ? i.slice(0, a - 3) + "===".substring(a) : i
  },
  Je = Ve ? function (t) {
    return Buffer.from(t).toString("base64")
  } : function (t) {
    for (var e = [], n = 0, r = t.length; n < r; n += 4096) e.push(Ye.apply(null, t.subarray(n, n + 4096)));
    return We(e.join(""))
  },
  He = function (t) {
    if (t.length < 2) return (e = t.charCodeAt(0)) < 128 ? t : e < 2048 ? Ye(192 | e >>> 6) + Ye(128 | 63 & e) : Ye(224 | e >>> 12 & 15) + Ye(128 | e >>> 6 & 63) + Ye(128 | 63 & e);
    var e = 65536 + 1024 * (t.charCodeAt(0) - 55296) + (t.charCodeAt(1) - 56320);
    return Ye(240 | e >>> 18 & 7) + Ye(128 | e >>> 12 & 63) + Ye(128 | e >>> 6 & 63) + Ye(128 | 63 & e)
  },
  ze = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,
  $e = Ve ? function (t) {
    return Buffer.from(t, "utf8").toString("base64")
  } : Ge ? function (t) {
    return Je(Ge.encode(t))
  } : function (t) {
    return We(function (t) {
      return t.replace(ze, He)
    }(t))
  };
var Xe = Object.defineProperty,
  Ze = Object.getOwnPropertyDescriptor,
  tn = function (t, e, n, r) {
    for (var o, i = r > 1 ? void 0 : r ? Ze(e, n) : e, a = t.length - 1; a >= 0; a--)(o = t[a]) && (i = (r ? o(e, n, i) : o(i)) || i);
    return r && i && Xe(e, n, i), i
  },
  en = function () {
    function t(e) {
      var n = this;
      f(this, t), this.cgiBatchSize = E.cgiBatchSize, this.reportThreshold = E.reportThreshold, this.reportDelay = E.reportDelay, this.triggerExecuteSend = function (t) {
        var e, n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
          r = [];
        return function () {
          for (var o = arguments.length, i = new Array(o), a = 0; a < o; a++) i[a] = arguments[a];
          return clearTimeout(e), e = setTimeout((function () {
            var e = t.apply(void 0, i);
            r.forEach((function (t) {
              return t(e)
            })), r = []
          }), n), new Promise((function (t) {
            return r.push(t)
          }))
        }
      }((function () {
        n.executeSend()
      }), 1e3 * this.reportDelay), this.inspectDelay = E.inspectDelay, this.inspectTimer = void 0, this.isNeedContinueSend = !1, this.getBaseInfo = e.getBaseInfo, this.reportLog = e.reportLog, this.queueManager = e.queueManager, this.configManager = e.configManager, this.flushSend(), this.startInspectTimer()
    }
    return v(t, [{
      key: "batchSend",
      value: function () {
        var t, e = this.queueManager.getReportableActions(this.reportThreshold);
        if (e.length >= this.reportThreshold) this.executeSend();
        else {
          var n = (null == (t = this.configManager) ? void 0 : t.getRealTimeActionList()) || E.realTimeActionList;
          e.some((function (t) {
            return n.indexOf(t.action_type) > -1 && !t.is_retry
          })) ? this.executeSend() : this.triggerExecuteSend()
        }
        this.startInspectTimer()
      }
    }, {
      key: "flushSend",
      value: function () {
        this.executeSend()
      }
    }, {
      key: "executeSend",
      value: function () {
        var e = this;
        if (t.currentRequestCount >= t.requestConcurrency) this.isNeedContinueSend = !0;
        else {
          this.isNeedContinueSend = !1;
          var n = (t.requestConcurrency - t.currentRequestCount) * this.cgiBatchSize,
            r = this.queueManager.getReportableActions(n),
            o = this.getBaseInfo();
          if (!o.openid && !o.unionid && (xt.warn("请尽快调用 setOpenId 或 setUnionId 方法设置用户ID！"), r = r.filter((function (t) {
              return null == t ? void 0 : t.ad_trace_id
            }))), !(r.length <= 0)) {
            n < this.queueManager.getReportableActionsLength() && (this.isNeedContinueSend = !0), t.currentRequestCount += Math.ceil(r.length / this.cgiBatchSize);
            for (var i = [], a = 0; a < r.length; a += this.cgiBatchSize) {
              var u = this.generateActionReportParams(r.slice(a, a + this.cgiBatchSize));
              i.push(this.report(u))
            }
            Promise.all(i).then((function (t) {
              var n = t.some((function (t) {
                return t >= 0
              }));
              e.isNeedContinueSend && n && e.executeSend()
            })).catch((function (t) {
              xt.error(t), e.reportLog({
                message: "executeSend catch: ".concat(t.message),
                log_type: b.JS_RUN_ERROR,
                err_stack: t.stack
              })
            }))
          }
        }
      }
    }, {
      key: "generateActionReportParams",
      value: function (t) {
        var e = [],
          n = [],
          r = this.getBaseInfo();
        return t.forEach((function (t) {
          n.push(t.action_id);
          var r = Object.assign({}, t);
          delete r.inner_status, e.push(r)
        })), {
          data: {
            info: r,
            actions: e
          },
          actionIdList: n
        }
      }
    }, {
      key: "dealSuccessData",
      value: function (t, e) {
        [51001, 51003].indexOf(null == t ? void 0 : t.code) > -1 ? this.queueManager.updateActionsForReportFail(e) : this.queueManager.removeActions(e), 0 !== (null == t ? void 0 : t.code) && (this.reportLog({
          log_type: b.REQUEST_ERROR,
          code: null == t ? void 0 : t.code,
          message: "trace_id: ".concat(null == t ? void 0 : t.trace_id, "，msg: ").concat(null == t ? void 0 : t.message)
        }), xt.error("上报失败：", t))
      }
    }, {
      key: "dealFailData",
      value: function (t, e) {
        this.queueManager.updateActionsForReportFail(e), this.reportLog({
          log_type: b.REQUEST_ERROR,
          code: t.code,
          message: t.message
        }), xt.error("上报失败：", t)
      }
    }, {
      key: "report",
      value: function (e) {
        var n = this,
          r = e.data,
          o = e.actionIdList;
        return this.queueManager.updateActionsForReporting(o), xt.debug && (xt.info("上报行为类型: ", "【".concat(r.actions.map((function (t) {
          return t.action_type
        })).join("、"), "】")), xt.info("上报请求参数: ", r)), new Promise((function (e) {
          var i, a, u, c, s, f, d, v, p = Date.now();
          try {
            var h = function (t) {
                var e = "",
                  n = null == t ? void 0 : t.appid,
                  r = null == t ? void 0 : t.secret_key,
                  o = null == t ? void 0 : t.sdk_version,
                  i = null == t ? void 0 : t.timestamp;
                if (!(n && r && o && i && 32 === r.length)) return e;
                for (var a = Fe(o + n + i), u = 0; u < 32; u++) e += u % 2 == 0 ? r[u] : a[u];
                return e
              }({
                appid: null == (i = null == r ? void 0 : r.info) ? void 0 : i.appid,
                secret_key: null == (a = null == r ? void 0 : r.info) ? void 0 : a.secret_key,
                sdk_version: null == (u = null == r ? void 0 : r.info) ? void 0 : u.sdk_version,
                timestamp: p
              }),
              y = function (t) {
                return arguments.length > 1 && void 0 !== arguments[1] && arguments[1] ? function (t) {
                  return t.replace(/=/g, "").replace(/[+\/]/g, (function (t) {
                    return "+" == t ? "-" : "_"
                  }))
                }($e(t)) : $e(t)
              }(JSON.stringify(r));
            d = {
              "Client-Time": p,
              "Sign-Value": Fe(y + (null == (c = null == r ? void 0 : r.info) ? void 0 : c.user_action_set_id) + (null == (s = null == r ? void 0 : r.info) ? void 0 : s.secret_key) + h),
              "Sign-Version": E.signVersion,
              "content-type": "text/plain;charset=UTF-8"
            }, v = y
          } catch (h) {
            d = {
              "Client-Time": p
            }, v = r, n.reportLog({
              log_type: b.SIGN_ERROR,
              message: "sign error msg: ".concat(null == h ? void 0 : h.message),
              err_stack: null == h ? void 0 : h.stack
            }), xt.error(h)
          }
          wx.request({
            url: "https://api.datanexus.qq.com/data-nexus-cgi/miniprogram",
            method: "POST",
            timeout: (null == (f = n.configManager) ? void 0 : f.getRequestTimeout()) || E.requestTimeout,
            header: d,
            data: v,
            success: function (r) {
              var i, a;
              xt.devLog("上报接口返回码:", null == (i = null == r ? void 0 : r.data) ? void 0 : i.code);
              var u = (null == (a = null == r ? void 0 : r.header) ? void 0 : a["Server-Time"]) || -1;
              if (st.revise(u), t.currentRequestCount -= 1, 200 === (null == r ? void 0 : r.statusCode)) return n.dealSuccessData(null == r ? void 0 : r.data, o), void e((null == r ? void 0 : r.data).code);
              var c = "";
              try {
                c = "object" == l(null == r ? void 0 : r.data) ? JSON.stringify(null == r ? void 0 : r.data) : null == r ? void 0 : r.data
              } catch (t) {
                xt.error(t)
              }
              var s = {
                code: "number" == typeof (null == r ? void 0 : r.statusCode) ? -1 * r.statusCode : -888,
                message: "statusCode: ".concat(null == r ? void 0 : r.statusCode, ", data: ").concat(c)
              };
              n.dealFailData(s, o), e(s.code)
            },
            fail: function (r) {
              xt.devLog("上报失败:", r), t.currentRequestCount -= 1;
              var i = {
                code: "number" == typeof (null == r ? void 0 : r.errno) ? -1 * r.errno : -999,
                message: null == r ? void 0 : r.errMsg
              };
              n.dealFailData(i, o), e(i.code)
            }
          })
        }))
      }
    }, {
      key: "startInspectTimer",
      value: function () {
        var e = this;
        clearTimeout(this.inspectTimer), this.inspectTimer = setTimeout((function () {
          t.currentRequestCount >= t.requestConcurrency && (t.currentRequestCount = t.requestConcurrency - 1), e.executeSend(), e.startInspectTimer()
        }), 1e3 * this.inspectDelay)
      }
    }], [{
      key: "setRequestConcurrency",
      value: function (e) {
        "number" == typeof e ? e < 1 ? xt.error("网络请求最大并发量不能小于1") : e > 10 ? xt.error("网络请求最大并发量不能大于10") : t.requestConcurrency = e : xt.error("网络请求最大并发量需设置为数字")
      }
    }]), t
  }(),
  nn = en;
nn.currentRequestCount = 0, nn.requestConcurrency = E.requestConcurrency, tn([Lt], nn.prototype, "batchSend", 1), tn([Lt], nn.prototype, "flushSend", 1), tn([Lt], nn.prototype, "executeSend", 1);
var rn = Wt,
  on = Jt,
  an = Ht,
  un = zt,
  cn = $t,
  sn = ie,
  ln = Xt,
  fn = Zt,
  dn = te,
  vn = ne,
  pn = oe,
  hn = re,
  yn = ee,
  _n = function () {
    function e() {
      f(this, e)
    }
    return v(e, [{
      key: "install",
      value: function (e, n) {
        var r = function (n) {
          Qt.subscribe(n, function (n) {
            var r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
            return function (o) {
              var i = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
              e.track(n, Object.assign(r || {}, i, t(t({}, wn, !0), Cn, o)))
            }
          }(n))
        };
        r(on), r(rn), r(an), r(un), "all" === n && (r(cn), r(sn), r(ln), r(dn), r(fn), r(yn), r(vn), r(pn), r(hn))
      }
    }]), e
  }(),
  gn = function () {
    function e() {
      f(this, e), this.special_method_symbol = Symbol("special_method_symbol")
    }
    return v(e, [{
      key: "onPurchase",
      value: function (t) {
        "number" != typeof t && xt.warn("付费金额需要为数字"), t <= 0 && xt.warn("付费金额需要大于0"), this.wrapTrack(j, {
          value: t
        })
      }
    }, {
      key: "onEnterForeground",
      value: function () {
        this.wrapTrack(D)
      }
    }, {
      key: "onEnterBackground",
      value: function () {
        this.wrapTrack(U)
      }
    }, {
      key: "onAppStart",
      value: function () {
        this.wrapTrack(M)
      }
    }, {
      key: "onAppQuit",
      value: function () {
        this.wrapTrack(F)
      }
    }, {
      key: "onAddToWishlist",
      value: function () {
        this.wrapTrack(q)
      }
    }, {
      key: "wrapTrack",
      value: function (e, n) {
        this.track(e, Object.assign(n || {}, t({}, this.special_method_symbol, 1)))
      }
    }]), e
  }(),
  mn = function (t) {
    o(n, gn);
    var e = a(n);

    function n() {
      return f(this, n), e.apply(this, arguments)
    }
    return v(n, [{
      key: "onRegister",
      value: function () {
        this.wrapTrack(B)
      }
    }, {
      key: "onCreateRole",
      value: function (t) {
        t && "string" != typeof t && xt.warn("角色名称需要为字符串"), this.wrapTrack(V, t ? {
          name: t
        } : {})
      }
    }, {
      key: "onTutorialFinish",
      value: function () {
        this.wrapTrack(K)
      }
    }]), n
  }(),
  An = "（如果确认无误，请忽略该提示）",
  Rn = function () {
    var t = [];
    return {
      requestActionList: function () {
        try {
          lt({
            conf_name: "data_nexus_common",
            conf_key: "action_types"
          }).then((function (e) {
            yt(e) && (t = e)
          }))
        } catch (t) {
          xt.error(t)
        }
      },
      getActionList: function () {
        return t
      }
    }
  }();

function kn(t, e) {
  try {
    t.is_sdk_auto_track || (function (t) {
      try {
        var e = Rn.getActionList();
        if (!e.includes(t)) {
          var r, o = function (t, e) {
            var r = "undefined" != typeof Symbol && t[Symbol.iterator] || t["@@iterator"];
            if (!r) {
              if (Array.isArray(t) || (r = n(t)) || e && t && "number" == typeof t.length) {
                r && (t = r);
                var o = 0,
                  i = function () {};
                return {
                  s: i,
                  n: function () {
                    return o >= t.length ? {
                      done: !0
                    } : {
                      done: !1,
                      value: t[o++]
                    }
                  },
                  e: function (t) {
                    throw t
                  },
                  f: i
                }
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
            }
            var a, u = !0,
              c = !1;
            return {
              s: function () {
                r = r.call(t)
              },
              n: function () {
                var t = r.next();
                return u = t.done, t
              },
              e: function (t) {
                c = !0, a = t
              },
              f: function () {
                try {
                  u || null == r.return || r.return()
                } finally {
                  if (c) throw a
                }
              }
            }
          }(e);
          try {
            for (o.s(); !(r = o.n()).done;) {
              var i = r.value;
              if (Tn(i, t) <= parseInt((.3 * i.length).toString())) {
                xt.warn("通过SDK上报的".concat(t, "行为名称可能有误，请检查该行为类型是否为腾讯广告提供的标准行为！").concat(An));
                break
              }
            }
          } catch (t) {
            o.e(t)
          } finally {
            o.f()
          }
        }
      } catch (e) {
        xt.error(e)
      }
    }(t.action_type), "minigame" === e ? function (t, e) {
      var n, r, o;
      try {
        ["PURCHASE", "ADD_TO_CART"].includes(t.action_type) && t.action_param && It(t.action_param, "value") && ("number" != typeof (null == (n = t.action_param) ? void 0 : n.value) ? xt.warn("通过SDK上报的".concat(t.action_type, "行为携带的金额参数需要为数字！")) : (null == (r = t.action_param) ? void 0 : r.value) <= 0 ? xt.warn("通过SDK上报的".concat(t.action_type, "行为携带的金额参数需要大于0！")) : "minigame" === e && (null == (o = t.action_param) ? void 0 : o.value) < 100 && xt.warn("通过SDK上报的".concat(t.action_type, "行为携带的金额参数可能有误，金额的单位为‘分’，请检查金额是否正确！").concat(An)))
      } catch (t) {
        xt.error(t)
      }
    }(t, e) : "miniprogram" === e && function (t) {
      try {
        var e = null == t ? void 0 : t.action_type,
          n = (null == t ? void 0 : t.action_param) || {};
        "PURCHASE" === e && It(n, "value") && ("number" != typeof (null == n ? void 0 : n.value) ? xt.warn("通过SDK上报的".concat(e, "行为携带的金额参数需要为数字！")) : (null == n ? void 0 : n.value) <= 0 && xt.warn("通过SDK上报的".concat(e, "行为携带的金额参数需要大于0！")))
      } catch (e) {
        xt.error(e)
      }
    }(t))
  } catch (t) {
    xt.error(t)
  }
}

function Tn(t, e) {
  try {
    if (0 === t.length) return e.length;
    if (0 === e.length) return t.length;
    for (var n = [], r = 0; r <= e.length; r++) n[r] = [r];
    for (var o = 0; o <= t.length; o++) n[0][o] = o;
    for (var i = 1; i <= e.length; i++)
      for (var a = 1; a <= t.length; a++) e.charAt(i - 1) === t.charAt(a - 1) ? n[i][a] = n[i - 1][a - 1] : n[i][a] = Math.min(n[i - 1][a - 1] + 1, n[i][a - 1] + 1, n[i - 1][a] + 1);
    return n[e.length][t.length]
  } catch (n) {
    xt.error(n)
  }
}

function Sn(t) {
  try {
    t && !/^[a-zA-Z0-9_\-]+$/.test(t) && xt.warn("通过SDK上报的openid：".concat(t, "可能有误，请检查openid是否正确！").concat(An))
  } catch (t) {
    xt.error(t)
  }
}
var En = Object.defineProperty,
  bn = Object.getOwnPropertyDescriptor,
  On = function (t, e, n, r) {
    for (var o, i = r > 1 ? void 0 : r ? bn(e, n) : e, a = t.length - 1; a >= 0; a--)(o = t[a]) && (i = (r ? o(e, n, i) : o(i)) || i);
    return r && i && En(e, n, i), i
  },
  In = Symbol("initializedInstance"),
  wn = Symbol("autoTrack"),
  Cn = Symbol("actionTime"),
  xn = function (e) {
    o(r, mn);
    var n = a(r);

    function r(t) {
      var e;
      if (f(this, r), (e = n.call(this)).env = "production", e.sdk_version = "1.5.4", e.sdk_name = "@dn-sdk/minigame", e.deviceInfo = {}, e.gameInfo = {}, e.session_id = "", e.log_id = 0, e.inited = !1, null == wx || !wx.createCanvas) return xt.error("SDK只可以用在微信小游戏中使用"), u(e);
      var o = Ot();
      if (r[In].length >= o.maxSdkInstance) return xt.error("初始化超过上限"), u(e);
      var i = Et(t),
        a = at();
      if (!0 !== i) return xt.error(i), u(e);
      var s = null == a ? void 0 : a.appId;
      if (s && s !== t.appid) return xt.error("初始化失败，传入的appid与当前小游戏appid不一致"), u(e);
      e.config = t, It(t, "auto_track") || (e.config.auto_track = bt("autoTrack")), e.openid = t.openid, e.unionid = t.unionid, e.user_unique_id = t.user_unique_id, e.saveValidOpenidToStorage();
      var l = t.user_action_set_id;
      return r[In].includes(l) ? (xt.error("请勿重复初始化SDK"), u(e)) : (e.reportLog = e.reportLog.bind(c(e)), e.getTrackBaseInfo = e.getTrackBaseInfo.bind(c(e)), e.deviceInfo = nt(), e.gameInfo = Nt(), e.session_id = mt(), e.queueManage = new Vt({
        userActionSetId: l,
        maxLength: o.maxQueueLength,
        ogEvents: Yt
      }), e.actionReporter = new nn({
        getBaseInfo: e.getTrackBaseInfo,
        reportLog: e.reportLog,
        queueManager: e.queueManage,
        configManager: se
      }), e.inited = !0, r[In].push(l), e.useAutoTrack(), e.doReportOnEnterBackground(), "release" === (null == a ? void 0 : a.envVersion) ? (xt.info("初始化成功"), u(e)) : (function (t) {
        var e = t.conf_name,
          n = t.conf_key,
          r = t.sdk_version,
          o = t.default_download_url,
          i = t.fail_handler;
        lt({
          conf_name: e,
          conf_key: n
        }).then((function (t) {
          if (ht(t)) {
            var e = null == t ? void 0 : t.blackVersions,
              n = null == t ? void 0 : t.minVersion,
              a = null == t ? void 0 : t.bestVersion,
              u = null == t ? void 0 : t.downloadUrl,
              c = o;
            return u && /^https/.test(u) && (c = u), yt(e) && (null == e ? void 0 : e.indexOf(r)) > -1 ? (null == i || i(), void xt.error("初始化失败！当前SDK版本存在兼容问题，请尽快升级至最新版！下载地址：".concat(c))) : n && St(r, n) < 0 ? (null == i || i(), void xt.error("初始化失败！当前SDK版本过低，请尽快升级至最新版！下载地址：".concat(c))) : (a && St(r, a) < 0 && xt.warn("新版本SDK已上线，强烈建议您升级至最新版，尽早享受新特性！下载地址：".concat(c)), void xt.info("初始化成功"))
          }
          xt.info("初始化成功")
        })).catch((function () {
          xt.info("初始化成功")
        }))
      }({
        conf_name: "mini_game_sdk_common",
        conf_key: "version",
        sdk_version: e.sdk_version,
        default_download_url: "https://sr-home-1257214331.cos.ap-guangzhou.myqcloud.com/sdk/dn-sdk-minigame/dn-sdk-minigame.zip",
        fail_handler: function () {
          e.inited = !1
        }
      }), Rn.requestActionList(), Sn(t.openid), u(e)))
    }
    return v(r, [{
      key: "track",
      value: function (t, e) {
        var n, r, o, i = qe.validateActionType(t),
          a = qe.validateActionParam(e);
        if (i && a) {
          !this.openid && !this.unionid && xt.warn("缺少 openid 或 unionid");
          var u = bt("actionParamMaxLength");
          if (JSON.stringify(e || {}).length > u) return void xt.error("监测到超过".concat(u, "的上报日志：").concat(t, " ").concat(e));
          var c = !(null == e || !e[wn]),
            s = this.createAction(t, e || {}, c);
          "release" !== (null == (n = at()) ? void 0 : n.envVersion) && kn(s, "minigame"), null == (r = this.queueManage) || r.addAction(s), null == (o = this.actionReporter) || o.batchSend()
        }
      }
    }, {
      key: "flush",
      value: function () {
        var t;
        null == (t = this.actionReporter) || t.flushSend()
      }
    }, {
      key: "setOpenId",
      value: function (t) {
        var e;
        t && "string" == typeof t ? (this.openid = t, this.gameInfo.ad_trace_id && !tt.getSync(T) && Qt.publish("START_APP"), this.flush(), this.saveValidOpenidToStorage(), "release" !== (null == (e = at()) ? void 0 : e.envVersion) && Sn(t)) : xt.error("openid 格式错误")
      }
    }, {
      key: "setUnionId",
      value: function (t) {
        t && "string" == typeof t ? (this.unionid = t, this.flush()) : xt.error("unionid 格式错误")
      }
    }, {
      key: "setUserUniqueId",
      value: function (t) {
        t && "string" == typeof t ? this.user_unique_id = t : xt.error("user_unique_id 格式错误")
      }
    }, {
      key: "doReportOnEnterBackground",
      value: function () {
        var t = this;
        wx.onHide((function () {
          var e, n;
          null == (e = t.actionReporter) || e.flushSend(), null == (n = t.queueManage) || n.reportLostNum()
        }))
      }
    }, {
      key: "getTrackBaseInfo",
      value: function () {
        var t = at();
        return Object.assign({}, this.deviceInfo, function (t, e) {
          var n = {};
          return e.forEach((function (e) {
            It(t, e) && (n[e] = t[e])
          })), n
        }(this.config, ["user_action_set_id", "appid", "openid", "secret_key", "user_unique_id", "unionid"]), {
          local_id: rt(),
          sdk_name: this.sdk_name,
          sdk_version: this.sdk_version,
          openid: this.openid || it(),
          unionid: this.unionid,
          user_unique_id: this.user_unique_id,
          inner_param: {
            app_env_version: t.envVersion,
            app_version: t.version
          }
        })
      }
    }, {
      key: "createAction",
      value: function (t, e) {
        var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        null != e && e[wn] && delete e[wn];
        var r = Date.now();
        null != e && e[Cn] && (r = null == e ? void 0 : e[Cn], delete e[Cn]);
        var o = {
          action_id: mt(),
          action_param: e,
          action_time: r,
          action_type: t,
          is_retry: !1,
          is_sdk_auto_track: n,
          retry_count: 0,
          revised_action_time: st.getRevisedcurrentTimeMillis(),
          log_id: ++this.log_id,
          session_id: this.session_id,
          pkg_channel_id: this.gameInfo.pkg_channel_id,
          source_scene: this.gameInfo.source_scene,
          network_type: ot(),
          ad_trace_id: this.gameInfo.ad_trace_id,
          channel: this.getChannelByActionType(t)
        };
        return null != e && e[this.special_method_symbol] && (this.addActionInnerParam(o, "is_special_method", !0), delete e[this.special_method_symbol]), se.getChannelClaimActionList().indexOf(t) > -1 && this.gameInfo.launch_options && this.addActionInnerParam(o, "launch_options", this.gameInfo.launch_options), o
      }
    }, {
      key: "addActionInnerParam",
      value: function (e, n, r) {
        e.inner_param && ht(e.inner_param) ? e.inner_param[n] = r : e.inner_param = t({}, n, r)
      }
    }, {
      key: "getChannelByActionType",
      value: function (t) {
        var e = "";
        return se.getChannelClaimActionList().indexOf(t) > -1 ? e = this.gameInfo.channel || "" : se.getNoClaimActionList().indexOf(t) > -1 && (e = X), e
      }
    }, {
      key: "reportLog",
      value: function (t) {
        var e, n, r = {
          user_action_set_id: null == (e = this.config) ? void 0 : e.user_action_set_id,
          appid: null == (n = this.config) ? void 0 : n.appid,
          session_id: this.session_id
        };
        ct(Object.assign(r, t))
      }
    }, {
      key: "useAutoTrack",
      value: function () {
        var t;
        if (null != (t = this.config) && t.auto_track) {
          var e = !0,
            n = tt.getSync(R);
          (null == n ? void 0 : n.ap) === G ? e = !0 : (null == n ? void 0 : n.ap) === Q && (e = !1), "devtools" === nt().wx_platform && (e = !0), (new _n).install(this, e ? "all" : "lifecycle"), pe(), e && Le(), this.getAutoProxyRemoteConfig()
        }
      }
    }, {
      key: "getAutoProxyRemoteConfig",
      value: function () {
        var t, e, n = nt();
        n.os && n.os_version && null != (t = this.config) && t.user_action_set_id && function (t) {
          return new Promise((function (e) {
            wx.request({
              method: "POST",
              url: "https://api.datanexus.qq.com/data-nexus-config/v1/sdk/minigame/get",
              data: t,
              timeout: E.requestTimeout,
              success: function (t) {
                ft(t, e, "minigame/get"), vt(t)
              },
              fail: function (t) {
                dt(t, "minigame/get")
              }
            })
          }))
        }({
          conf_name: "MG",
          conf_param: {
            user_action_set_id: null == (e = this.config) ? void 0 : e.user_action_set_id,
            sdk_version: this.sdk_version,
            os_type: (null == n ? void 0 : n.os) || "",
            os_version: wt(n.os_version),
            device_brand: (null == n ? void 0 : n.device_brand) || "",
            weixin_lib_version: (null == n ? void 0 : n.wx_lib_version) || "",
            weixin_version: (null == n ? void 0 : n.wx_version) || ""
          }
        }).then((function (t) {
          ht(t) && tt.setSync(R, t)
        }))
      }
    }, {
      key: "saveValidOpenidToStorage",
      value: function () {
        this.openid && function (t) {
          return /^[a-zA-Z0-9_-]{28,30}$/.test(t)
        }(this.openid) && tt.setSync(T, this.openid)
      }
    }], [{
      key: "setRequestConcurrency",
      value: function (t) {
        nn.setRequestConcurrency(t)
      }
    }, {
      key: "setDebug",
      value: function (t) {
        xt.debug = t
      }
    }]), r
  }(),
  Nn = xn;
Nn[In] = [], On([Lt, Pt], Nn.prototype, "track", 1), On([Lt, Pt], Nn.prototype, "flush", 1), On([Lt], Nn.prototype, "setOpenId", 1), On([Lt], Nn.prototype, "setUnionId", 1), On([Lt], Nn.prototype, "setUserUniqueId", 1), On([Lt], Nn.prototype, "doReportOnEnterBackground", 1), On([Lt], Nn.prototype, "getTrackBaseInfo", 1), On([Lt], Nn.prototype, "useAutoTrack", 1);
// export {
//   Nn as SDK
// };