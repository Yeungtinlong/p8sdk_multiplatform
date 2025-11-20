var P8SDK = {}; // 2025-10-22 15:04:59
var P8LogSDK = {};
var GEDNSDK = {}
var start_param = "";
let appInfo = "";
var template_ids;
let p8openid;
var requireCheck = true;
const newUploadUrl = "https://adv2.play800.cn/sdk/upload"
let ad_show_time = 1
let ad_timer = null
let paydata = {
    offerId: "",
    scale: "",
    zoneId: "",
    pf: ""
};
var code = '';

let isLoggingIn = false;
let hasActivated = false;
let haspushLogin = false;

let domainList = [];
let remberList = [];
let lostList = [];

function dateOrRes(e) {
    return e.data ? e.data : e
}


var cpwantData = null

var queryData = {
    weixinadinfo: "",
    gdt_vid: "",
    aid: "",
    code: "",
    c: ""
};

let sdkData = {
    sdkVersion: "2.0.27",
    platform_url: "",
    data_url: "",
    rg_url: "",
    ad_url: "",
    dsj_url: "",
    yanfa_url: "",
    key_android: "",
    site_android: "",
    key_ios: "",
    site_ios: "",
    appid: "",
    aid: "",
    game_id: "",
    monitorAid: "",
    uid: "",
    sid: "",
    sname: "",
    roleid: "",
    rolename: "",
    vip: "",
    level: "",
    gold: "",
    mac: "",
    device: "",
    ip: "",
    modeltype: "jrtt",
    device_type: "1",
    gameversion: "",
    device_model: "",
    device_resolution: "",
    device_version: "",
    device_net: "",
    platform: "",
    initOnshowFlag: true,
    onshowFlag: true,
    account: "",
    password: "",
    device_code: "",
    gameBoxData: [],
    box_id: "",
    scene_id: "",
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
    }
};

function randomDeviceCode() {
    let code = md5_d(p8openid + new Date().getTime())
    tt.setStorage({
        key: "device_code",
        data: code
    })
    return code
}

function getInitAidAndCode() {
    console.log('[ getInitAidAndCode获取到的参数 ] >', tt.getLaunchOptionsSync())
    let e = tt.getLaunchOptionsSync().query;
    console.log('[ getInitAidAndCode获取到的参数query ] >', JSON.stringify(e))
    let t = tt.getLaunchOptionsSync().refererInfo;
    console.log('[ getInitAidAndCode获取到的参数refererInfo ] >', JSON.stringify(t))
    let extra = tt.getLaunchOptionsSync().extra
    console.log('[ getInitAidAndCode获取到的参数extra ] >', JSON.stringify(extra))
    if (!e) {
        e = tt.getEnterOptionsSync().query;
        if (e && e.aid) {
            blowPoint("镜华看到请联系我~")
        }
    }

    let a = JSON.stringify(e);
    if (a.length > 2) {
        start_param = a
    }

    if (extra) {
        appInfo = extra;
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

    let i = t && t.extraData;
    if (i && i.p8go_site && i.p8go_aid) {
        print("冷启动 获取到跳转过来的参数", i);
        inBPack = true;
        gotoObj.site = i.p8go_site;
        gotoObj.aid = i.p8go_aid;
        gotoObj.b_site = i.b_site;
        gotoObj.b_appid = i.b_appid;
        console.log(" 冷启动 extraData.goto_aid:", i.goto_aid)
    }
    if (e.clue_token) {
        systemType = "TT";
        systemValues.clue_token = e.clue_token;
        systemValues.ad_id = e.ad_id;
        systemValues.creative_id = e.creative_id;
        systemValues.channel = "jrtt_wxxyx"
    }
    if (e.aid || e.code) {
        Object.assign(queryData, e)
    }
}

function init() {
    getDevice();
    getInitAidAndCode();
    getSceneId();
}
init()

async function loadData() {
    try {
        await getUrlConfig();
        await getCPwantData();
        await getpaydata();
        await textUrlIsRight();
    } catch (error) {
        console.error(`p8sdk版本:${sdkData.sdkVersion}/p8sdk入口加载失败:`, error);
    }
}
loadData();

/** 初始化引力sdk */
P8SDK.initGravityEngineSDK = function (token) {
    let result = new Promise((resolve, reject) => {
        initGESDK(token).then((res) => {
            resolve(res);
        });
    })

    return result;
}

/** 初始化引力引擎sdk */
function initGESDK(token) {
    let result = new Promise((resolve, reject) => {
        console.log('准备初始化引力引擎SDK', token)
        console.log('sdkData.openid', sdkData.openid);
        const config = {
            accessToken: token, // 项目通行证，在：网站后台-->设置-->应用列表中找到Access Token列 复制（首次使用可能需要先新增应用）全民解压消除
            clientId: sdkData.openid, // 用户唯一标识，如产品为小游戏，则必须填用户openid（注意，不是小游戏的APPID！！！）
            name: "GEDNSDK", // 全局变量名称, 默认为 gravityengine
            debugMode: "none", // debug none 是否开启测试模式，开启测试模式后，可以在 网站后台--设置--元数据--事件流中查看实时数据上报结果。（测试时使用，上线之后一定要关掉，改成none或者删除）
        };
        GEDNSDK = new tt.GravityEngineAPI(config);
        GEDNSDK.setupAndStart();
        console.log('[ GEDNSDK ] >', GEDNSDK)
        GEDNSDK.initialize({
                name: sdkData.openid,
                version: 1,
                openid: sdkData.openid,
                enable_sync_attribution: false,
            }).then((res) => {
                console.log('初始化引力引擎SDK完成', res)
                GEDNSDK.registerEvent();
                let response = {
                    result: 0,
                    message: "初始化成功",
                    data: res,
                }
                resolve(response);
            })
            .catch((err) => {
                console.log('初始化引力引擎SDK失败', err)
                let response = {
                    result: 1,
                    message: "初始化失败",
                    data: err,
                }
                resolve(response);
            });
    })

    return result;
}

/**
 * 引力引擎上报自定义事件
 * @param {*} event 事件名
 * @param {*} data 上报数据
 */
P8SDK.GravityengineTrack = function (event, data) {
    if (GEDNSDK.track) {
        console.log('引力引擎上报自定义事件信息', event, data)
        GEDNSDK.track(event, data);
    } else {
        console.log('引力引擎未初始化')
    }
}

// 设置用户属性
P8SDK.GravityengineUserSet = function (data) {
    if (GEDNSDK.userSet) {
        console.log('引力引擎用户设置信息', data)
        GEDNSDK.userSet(data);
    } else {
        console.log('引力引擎未初始化')
    }
}

// 初始化用户属性(只设置一次)
P8SDK.GravityengineUserSetOnce = function (data) {
    if (GEDNSDK.userSetOnce) {
        console.log('引力引擎 初始化用户属性', data)
        GEDNSDK.userSetOnce(data);
    } else {
        console.log('引力引擎未初始化')
    }
}

// 累加用户属性
P8SDK.GravityengineUserAdd = function (data) {
    if (GEDNSDK.userAdd) {
        console.log('引力引擎 累加用户属性', data)
        GEDNSDK.userAdd(data);
    } else {
        console.log('引力引擎未初始化')
    }
}

function ttRequest(url, method, data, succ, err) {
    tt.request({
        url: url,
        method: method,
        data: data,
        success: e => {
            if (succ) {
                succ(e)
            }
        },
        fail: e => {
            if (err) {
                err(e)
            }
        }
    })
}

function ttRequestConFigShort(url, method, data, succ, fail) {
    tt.request({
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
            setTimeout(() => {
                ttRequestConFigShort(url, method, data, succ, fail);
            }, 1000);
            if (fail) {
                fail(err);
            }
        },
    });
}

function ttRequestLoginShort(url, method, data, succ, fail) {
    tt.request({
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
    for (let e = 0; e < 21; e++) {
        if (!arguments[e]) {
            console.warn(t);
            return
        }
        t += " " + JSON.stringify(arguments[e])
    }
}



function getUrlConfig(a) {
    let result = new Promise((resolve, reject) => {
        console.log('sdkData', sdkData);
        let appid = ''


        if (!appid) {
            console.error('检测到兜底获取appid 方案一');
            if (start_param) {
                let start_paramParse = JSON.parse(start_param)
                console.log('start_paramParse', JSON.stringify(start_paramParse));
                appid = start_paramParse.appId
            }
        }

        if (!appid) {
            console.error('检测到兜底获取appid 方案二');
            let appInfoExtra = appInfo
            console.log('appInfoExtra', JSON.stringify(appInfoExtra));
            appid = appInfoExtra.appId
        }

        if (!appid) {
            if (tt.getEnvInfoSync) {
                console.error('检测到获取appid 方案三', tt.getEnvInfoSync());
                let obj = tt.getEnvInfoSync();
                console.log("真机obj: ", obj)
                appid = obj.microapp.appId;
                console.log("真机appid: ", appid)
            }
        }

        if (!appid) {
            console.error('检测到最后兜底获取appid 本地文件');
            try {
                let data = require('./p8-ttsdk-appid');
                console.log('local data:....', data);
                appid = data.appid;
                console.log('local appid:...', appid);
            } catch (err) {
                console.error('未配置本地appid文件', err);
                return;
            }
        }

        sdkData.appid = appid;
        let e = `https://ksyun.oss-cn-hangzhou.aliyuncs.com/${appid}.txt`;
        let t = "GET";
        let i = "";
        console.log('p8sdk版本:', sdkData.sdkVersion);
        console.log('appid:', appid);
        console.log('configUrl', e);
        let n = function (t) {
            //print("获取到的url信息", t);
            if (t.statusCode == 200) {
                let data = dateOrRes(t);
                console.log('加密数据data::', data);
                let md5Key = md5_d(appid);
                let plainText = decrypt(globalThis.CryptoJS.mode.ECB, data, md5Key);
                let cfgObj = JSON.parse(plainText);
                let gameConfig = cfgObj.mini_game,
                    argCfg;
                let urlAddress = cfgObj.url_address;
                console.log("cfgObj: ", cfgObj)
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
                }
                sdkData.game_id = argCfg.data_gid ? argCfg.data_gid : argCfg.aid.slice(-4);
                if (urlAddress) {
                    Object.assign(sdkData, {
                        platform_url: urlAddress.platform_url,
                        data_url: urlAddress.data_url,
                        rg_url: urlAddress.rg_url,
                        ad_url: urlAddress.ad_url,
                        dsj_url: urlAddress.dsj_url,
                        yanfa_url: urlAddress.yanfa_url
                    });
                    resolve()
                    if (a) {
                        a();
                    }
                } else {
                    tt.showModal({
                        title: "app 配置异常,请联系运营配置",
                        content: "异常",
                        success(e) {}
                    })
                }
                console.log('sdkData', sdkData);
            }
        };
        let f = function (datas) {
            console.error("请求失败，请确认域名是否正确 ", datas);
            // let ress = ["获取到的 urlaid.txt 失败 --->"];
            // for (const key in datas) {
            //   if (Object.hasOwnProperty.call(datas, key)) {
            //     const value = datas[key];
            //     ress.push(key + ":" + value);
            //   }
            // }
            // tt.draw(ress)
        };
        ttRequestConFigShort(e, t, i, n, f)

    })
    return result
}

function SignGetForCenter(e) {
    let t = sdkData.key;
    var a = [];
    for (var i in e) {
        a.push(i)
    }
    a = a.sort();
    var n = "";
    for (var o = 0; o < a.length; o++) {
        var r = e[a[o]];
        if (o != a.length - 1) {
            n += a[o] + "=" + r + "&"
        } else {
            n += a[o] + "=" + r
        }
    }
    return e.site + n + t
}

function getpaydata() {
    let result = new Promise((resolve, reject) => {
        let e = parseInt((new Date).getTime() / 1e3);
        let t = {
            site: sdkData.site,
            appid: sdkData.appid,
            channel: 'jrtt',
            time: e
        };
        let a = SignGetForCenter(t, sdkData.key);
        t.sign = hex_md5(a);
        //print("支付配置参数请求obj ", t);
        let i = `${sdkData.platform_url}/api/wxGameConf`;
        // let i = 'https://tcenter.play800.cn/api/wxGameConf';

        let n = function (e) {
            let t = e.data.data;
            print("支付配置参数返回的值:", t);
            if (e.data.result == 0 && t.is_set == true) {
                paydata.offerId = t.offerId;
                paydata.scale = t.scale;
                paydata.zoneId = t.zoneId;
                paydata.pf = t.pf
                resolve()
            } else if (e.data.result == 0 && t.is_set == false) {
                resolve()
            } else if (e.data.result == 1) {
                print("接口請求失敗")
            }
        };
        ttRequest(i, "GET", t, n)
    })
    return result
}

/* 原2.0.13版本入口 */
// getUrlConfig(() => {
//     getCPwantData()
//     getpaydata();
// });


function getCPwantData(l) {
    console.log('getUserInfo 登录锁状态 ', isLoggingIn);

    let result = new Promise((resolve, reject) => {
        try {
            if (!sdkData.platform_url) {
                resolve({
                    result: 1,
                    msg: '域名 还未获取到，将自动重试',
                    data: {}
                });
                return;
            }

            if (isLoggingIn) {
                const maxWaitTime = 12000; // 6秒超时
                const startTime = Date.now();

                const checkLogin = () => {
                    if (cpwantData) {
                        cpwantData.msg = '此处checkLogin表示sdk内部已经获取过这个值,再次调用会返回已经获取过的值';
                        resolve(cpwantData);
                    } else if (Date.now() - startTime > maxWaitTime) {
                        isLoggingIn = false; // 超时自动释放锁
                        resolve({
                            result: 1,
                            msg: '登录等待超时，将自动重试',
                            data: {}
                        });
                    } else {
                        setTimeout(checkLogin, 100);
                    }
                };
                checkLogin();
                return;
            }

            // 设置登录锁
            isLoggingIn = true;

            // 检查缓存的登录结果
            if (cpwantData) {
                cpwantData.msg = '此处表示sdk内部已经获取过这个值,再次调用会返回已经获取过的值';
                resolve(cpwantData); // 登录过重复调用返回缓存值
                console.log('cpwantData', cpwantData);
                return;
            }

            // 开始主要登录流程
            console.log(' 请求tt.login了 ')
            tt.login({
                timeout: 10000,
                force: true,
                success(res) {
                    let codeRes = res.code;
                    console.log('codeRes ====>', codeRes);
                    if (!codeRes) {
                        blowPoint("调用抖音原生的登录成功 但不存在code" + JSON.stringify(res));
                        resolve({
                            result: "999",
                            data: {},
                            msg: "调用抖音原生的登录成功 但不存在code" + JSON.stringify(res),
                        });
                    }
                    console.log(`login 调用成功res  `, res.code);
                    let time = parseInt((new Date).getTime() / 1e3);
                    var sign = hex_md5(`${sdkData.key}WX${sdkData.site}WX${time}${time}`);
                    let data = {
                        channel_parame: start_param,
                        aid: sdkData.aid,
                        site: sdkData.site,
                        appid: sdkData.appid,
                        js_code: res.code,
                        time: time,
                        sign: sign,
                        code: code,
                        scene: sdkData.scene_id,
                        source_type: 3,
                        source_from: ""
                    }
                    if (queryData.code) {
                        data.source_type = 1
                        data.source_from = ""
                    }

                    let url = `${sdkData.platform_url}/oauth/jrttLoginToReport`;
                    // let url = 'https://tcenter.play800.cn/oauth/jrttLoginToReport'
                    //print('登陆请求参数', data);
                    //print('登陆请求url', url);
                    let rUrl = url + "?" + keyValueConnect(data);
                    print("登录login请求url ", url);
                    print("登录login请求参数 ", data);
                    print("登录login参数拼接url: ", rUrl);
                    let success = function (res) {
                        print("登录成功回调返回的所有参数：", res);
                        if (res.data.result == 0) {
                            let e = res.data.data;
                            // openid
                            p8openid = e.openid;
                            sdkData.openid = p8openid;
                            let localDeviceCode = tt.getStorageSync("device_code")
                            sdkData.device_code = localDeviceCode ? localDeviceCode : randomDeviceCode()
                            console.log('opeid=', p8openid);
                            blowPoint("已经获取到了抖音的openid" + JSON.stringify(queryData));
                            sdkData.device = p8openid;
                            sdkData.uid = e.uid;
                            sdkData.account = e.account;
                            sdkData.password = e.password;
                            sdkData.istemp = e.istemp;

                            let a = {
                                result: 0,
                                data: {
                                    openid: p8openid,
                                }
                            };
                            Object.assign(a.data, sdkData);
                            Object.assign(a.data, e);
                            cpwantData = a;
                            setTimeout(() => {
                                cpwantData = null;
                            }, 60000)
                            resolve(cpwantData)
                            debounce(P8LogSDK.onActiveFunc, 1000)();
                            getTempLateIDs();
                        } else {
                            print(' 配置信息有误', res.data.errMsg);
                            let e = {
                                result: "1",
                                data: {
                                    errorcode: "500",
                                    msg: res.data.errMsg,
                                    sdkData: sdkData
                                }
                            };
                            cpwantData = e
                            print("抖音登录异常:" + JSON.stringify(e));
                            blowPoint("p8sdk服务端请求抖音异常:" + JSON.stringify(e));
                            resolve(cpwantData)
                        }
                    }
                    let fail = function (err) {

                        let t = {
                            result: "1",
                            msg: '请求800登录接口失败',
                            data: {
                                url: url,
                                params: data,
                                reqData: err,
                            },
                        };

                        print("请求800登录接口失败" + JSON.stringify(err));
                        blowPoint("请求800登录接口失败" + JSON.stringify(err));
                        resolve(t);
                    }

                    ttRequestLoginShort(url, 'POST', data, success, fail)
                },
                fail(res) {
                    console.log(`login 调用失败`);
                    blowPoint("调用抖音原生的登录 fail" + JSON.stringify(res));
                    var t = {
                        result: "-1",
                        msg: "调用抖音原生的登录 fail" + JSON.stringify(res),
                        data: {
                            msg: "调用抖音原生的登录 fail 接口调用失败，将无法正常使用开放接口等服务 重启游戏试试看？",
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
        isLoggingIn = false;
    })
    return result
}

function textUrlIsRight() {
    let result = new Promise((resolve, reject) => {
        let url = `${sdkData.platform_url}/mGameDomain/check`;
        // let url = `https://tcenter.play800.cn/mGameDomain/check`;
        let data = {
            site: sdkData.site,
            appid: sdkData.appid,
            game_id: sdkData.game_id,
            time: parseInt((new Date).getTime() / 1e3),
            // flush: 1,
        }
        ChangeUndefined(data);
        let n = newSignGetType_log(data);
        var d = hex_md5(n);
        data.sign = d;

        let o = url + "?" + keyValueConnect(data);
        console.warn(" 获取小游戏域名检测请求Url: ", o);
        let s = (res) => {
            // 获取主体域名url成功
            checkUrlIsRight(res)
        }
        let f = (err) => {
            console.log('[!]获取小游戏域名检测失败', err);
            // 重试
        }

        ttRequest(url, "GET", data, s, f)

        const checkUrlIsRight = (res) => {
            let data = dateOrRes(res);
            console.log('[!]checkUrlIsRight', data.data.check_status);
            if (data.result == 0 && data.data.check_status == 1) {
                domainList.push(data.data.list);
                for (const zhuti in domainList) {
                    if (Object.hasOwnProperty.call(domainList, zhuti)) {
                        const urlLists = domainList[zhuti];
                        console.log('[ urlLists ] >', urlLists)
                        for (let index = 0; index < urlLists.length; index++) {
                            const element = urlLists[index];
                            // 检查 element 是否包含 domain 数组
                            if (element.domain && Array.isArray(element.domain)) {
                                // 循环请求每个域名
                                element.domain.forEach((domain) => {
                                    tt.request({
                                        url: `https://${domain}`,
                                        success: (res) => {
                                            remberList.push({
                                                company_entity: element.company_entity,
                                                domain: domain,
                                                status: 'success'
                                            });

                                            // 检查是否所有请求都完成
                                            if (remberList.length + lostList.length === getTotalDomainCount(domainList)) {
                                                const groupedData = remberList.reduce((acc, item) => {
                                                    // 如果这个 company_entity 还没有，就创建一个新数组
                                                    if (!acc[item.company_entity]) {
                                                        acc[item.company_entity] = {
                                                            company_entity: item.company_entity,
                                                            domains: new Set() // 使用 Set 来自动去重
                                                        };
                                                    }
                                                    // 将 domain 添加到对应的数组中
                                                    acc[item.company_entity].domains.add(item.domain);
                                                    return acc;
                                                }, {});

                                                // 将 Set 转换回数组
                                                const finalResult = Object.values(groupedData).map(item => ({
                                                    company_entity: item.company_entity,
                                                    domains: Array.from(item.domains)
                                                }));

                                                // 调用 domainCheckNotie 时传入处理后的数据
                                                domainCheckNotie('success', {
                                                    groupedList: finalResult,
                                                    remberList: remberList,
                                                    lostList: lostList
                                                });
                                            }
                                        },
                                        fail: (res) => {
                                            lostList.push({
                                                company_entity: element.company_entity,
                                                domain: domain,
                                                status: 'fail'
                                            });
                                        },
                                    });
                                });

                            }
                        }
                    }
                }
                resolve();
            }
        }
    })

    return result
}

function domainCheckNotie(type, data) {
    console.log('[ domainCheckNotie ] >', type, data)
    console.log('domainList', domainList[0]);

    if (data.remberList.length + data.lostList.length === getTotalDomainCount(domainList) && domainList[0].length == data.groupedList.length) {
        // 如果是跳过了检验域名，导致全部上报成功就直接返回
        console.log('如果是开启了不检验合法域名，导致全部上报成功就直接return不上报检测');

        return;
    }

    let status = 1
    if (data.groupedList.length > 1) {
        status = 2
    } else {
        status = 1
    }

    let url = `${sdkData.platform_url}/mGameDomain/checkNotice`;
    // let url = `https://tcenter.play800.cn/mGameDomain/checkNotice`;
    let params = {
        content: status == 2 ? "域名存在多配置情况" : "域名配置正常",
        game_id: sdkData.game_id,
        site: sdkData.site,
        appid: sdkData.appid,
        time: parseInt((new Date).getTime() / 1e3),
        company_entity: data.groupedList.map((item) => item.company_entity).join(','),
        domains: data.groupedList.map((item) => item.domains.join(',')).join(','),
        status: status,
    }

    ChangeUndefined(params);
    let n = newSignGetType_log(params);
    var d = hex_md5(n);
    params.sign = d;

    let o = url + "?" + keyValueConnect(params);
    console.log('[ domainCheckNotie ] >', o)

    let s = (res) => {
        let data = dateOrRes(res);
        console.log('[!]小游戏域名检测结果通知成功', JSON.stringify(data));
    }
    let f = (err) => {
        console.log('[!]小游戏域名检测结果通知失败', JSON.stringify(err));
        // 重试
    }

    ttRequest(url, "POST", params, s, f)

}

// 辅助函数：计算所有域名的总数
function getTotalDomainCount(domainList) {
    let total = 0;
    for (const zhuti in domainList) {
        if (Object.hasOwnProperty.call(domainList, zhuti)) {
            const urlLists = domainList[zhuti];
            urlLists.forEach(element => {
                if (element.domain && Array.isArray(element.domain)) {
                    total += element.domain.length;
                }
            });
        }
    }
    return total;
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
        version: sdkData.sdkVersion,
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
    ttRequest(i, n, a, o);
}


function newSignGetType(t) {
    var a = [];
    for (var e in t) {
        a.push(e)
    }
    a = a.sort();
    let i = "";
    for (let e = 0; e < a.length; e++) {
        const n = t[a[e]];
        if (e != 0) {
            i += a[e] + n
        } else {
            i += a[e] + n
        }
    }
    return i
}

function ChangeUndefined(t) {
    for (let e in t) {
        if (t.hasOwnProperty(e)) {
            if (typeof t[e] == "undefined" || t[e] == null) {
                t[e] = ""
            }
        }
    }
}

function dateFormat() {
    let e = new Date;
    let t;
    let a = "YYYY-mm-dd HH:MM:SS";
    const i = {
        "Y+": e.getFullYear().toString(),
        "m+": (e.getMonth() + 1).toString(),
        "d+": e.getDate().toString(),
        "H+": e.getHours().toString(),
        "M+": e.getMinutes().toString(),
        "S+": e.getSeconds().toString()
    };
    for (let e in i) {
        t = new RegExp("(" + e + ")").exec(a);
        if (t) {
            a = a.replace(t[1], t[1].length == 1 ? i[e] : i[e].padStart(t[1].length, "0"))
        }
    }
    return a
}

P8SDK.login = function () {
    console.log("P8SDK.js  login开始调用: " + dateFormat());

    let result = new Promise((resolve, reject) => {
        getCPwantData().then((res) => {
            if (res.result == 0) {
                console.warn(`[!]登录回调getUserInfo: `, res);
                resolve(res)
            } else {
                console.log(`[!]p8sdk登录失败: `, res);
                setTimeout(() => {
                    P8SDK.login().then(resolve);
                }, 1000);
            }
        }).catch((err) => reject(err))
    });
    return result;
};

var ttGRM
var ttGRMMark
/**
 * @param {监听录屏开始事件} onStart 
 * @param {监听录屏继续事件} onResume 
 * @param {监听录屏暂停事件} onPause 
 * @param {监听录屏停止事件} onStop 
 * @param {监听录屏错误事件} onError 
 * @param {监听录屏中断开始事件} onInterruptionBegin 
 * @param {监听录屏中断结束事件} onInterruptionEnd 
 */
// P8SDK.login = function()
P8SDK.initTTGameRecorder = function (onStart, onResume, onPause, onStop, onError, onInterruptionBegin, onInterruptionEnd) {
    print('p8sdk 录屏初始化')
    ttGRM = tt.getGameRecorderManager();
    onStart && ttGRM.onStart((res) => {
        onStart(res)
    });
    onResume && ttGRM.onResume((res) => {
        onResume(res)
    });
    onPause && ttGRM.onPause((res) => {
        onPause(res)
    });
    onStop && ttGRM.onStop((res) => {
        onStop(res)
    });
    onError && ttGRM.onError((res) => {
        onError(res)
    });
    onInterruptionBegin && ttGRM.onInterruptionBegin((res) => {
        onInterruptionBegin(res)
    });
    onInterruptionEnd && ttGRM.onInterruptionEnd((res) => {
        onInterruptionEnd(res)
    });
    ttGRMMark = ttGRM.getMark()
}

/** 记录精彩的视频片段，调用时必须是正在录屏，以调用时的录屏时刻为基准，指定前 x 秒，后 y 秒为将要裁剪的片段，可以多次调用，记录不同时刻。在结束录屏时，可以调用 clipVideo 接口剪辑并合成记录的片段 */
P8SDK.TTGameRecorderClip = function (arg) {
    print('p8sdk 记录精彩的视频片段')
    ttGRM.recordClip({
        timeRange: arg.timeRange,
        success: arg.success,
        fail: arg.fail,
        complete: arg.complete
    });
}

/** 剪辑精彩的视频片段 */
P8SDK.TTGameRecorderClipLocalVideo = function (arg) {
    print('p8sdk 剪辑精彩的视频片段')
    ttGRM.clipVideo({
        path: arg.path,
        timeRange: arg.timeRange,
        clipRange: arg.clipRange,
        success: arg.success,
        fail: arg.fail,
        complete: arg.complete
    });
}

/** 开始录屏 */
P8SDK.TTGameRecorderStar = function (arg) {
    print('p8sdk 开始录屏')
    console.log(ttGRM);
    ttGRM.start({
        duration: arg.duration,
        isMarkOpen: arg.isMarkOpen,
        locLeft: arg.locLeft,
        locTop: arg.locTop,
        frameRate: arg.frameRate
        // duration: 5, // 录屏的时长，单位 s，必须大于 3s，最大值 300s（5 分钟）。
        // isMarkOpen: true, // 是否添加水印，会在录制出来的视频上添加默认水印，目前不支持自定义水印图案。
        // locLeft: 0, // 水印距离屏幕上边界的位置，单位为 dp。
        // locTop: 0, // 水印距离屏幕左边界的位置，单位为 dp。
        // frameRate: 30 // 设置录屏帧率，对于性能较差的手机可以调低参数以降低录屏性能消耗。
    });
}

/** 暂停录屏 */
P8SDK.TTGameRecorderPause = function () {
    print('p8sdk 暂停录屏')
    ttGRM.pause()
}

/** 继续录屏 */
P8SDK.TTGameRecorderResume = function () {
    print('p8sdk 继续录屏')
    ttGRM.resume()
}

/** 停止录屏 */
P8SDK.TTGameRecorderStop = function () {
    print('p8sdk 停止录屏')
    ttGRM.stop()
}

P8SDK.payios = function (g) {

}
P8SDK.pay = function (g, debugPay = false) {
    console.error("调用P8头条支付接口", g);
    let e = new Promise((l, e) => {
        let time = parseInt((new Date).getTime() / 1e3);
        let site = sdkData.b_site ? sdkData.b_site : sdkData.site;
        var a = {
            aid: sdkData.aid,
            cp_order_id: g.cp_order_id,
            device_type: sdkData.device_type,
            ext: g.ext,
            ip: sdkData.ip,
            json: 1,
            level: g.level,
            money: g.money,
            product_name: g.product_name,
            productid: g.productid,
            roleid: g.roleid,
            rolename: g.rolename,
            serverid: g.serverid,
            site: site,
            time: time,
            udid: sdkData.device,
            uid: sdkData.uid,
            ce: g.ce,
            vip: g.vip,
            channel: 'jrtt'
        };
        var i = "";

        ChangeUndefined(a);
        i = newSignGetType(a);
        var o = hex_md5(`${time}${sdkData.site}${i}${sdkData.key}${time}`);
        a.sign = o;
        console.error("下单请求参数", a);
        let r = `${sdkData.rg_url}/h/p`;
        // r = 'https://trecharge.play800.cn/h/p'
        // console.error('测试url', r);
        let s = "GET";
        let d = d => {
            console.error('下单返回数据:', d.data.data);
            if (d.data.result == 0) {


                let rData = d.data.data;
                // rData.paytype = 20
                let p8OrderId = rData.orderid;
                let params = g;
                let extraInfo = {
                    'openid': sdkData.openid,
                    cpData: params.extraInfo,
                    pay_type: rData.paytype
                }
                extraInfo = JSON.stringify(extraInfo)
                if (!rData.paytype) {
                    print('运营需要配置一下头条支付类型 ', rData.paytype);
                }
                // if (debugPay) {
                //     rData.paytype = debugPay;
                // }
                if (rData.paytype == 20) {
                    // 头条的支付
                    print(' ttpay 传入的参数 --- ', params);
                    print('params.buyQuantity:', params.money);
                    print(' paydata.scale:', paydata.scale);
                    let reData = {
                        mode: "game",
                        env: 0,
                        currencyType: "CNY",
                        platform: "android",
                        buyQuantity: params.money * paydata.scale, // 金币购买数量，金币数量必须满足：金币数量*金币单价
                        zoneId: params.zoneId ? params.zoneId : "1", // 1 游戏服务区 id
                        customId: p8OrderId, // 订单号
                        extraInfo: extraInfo,
                        success(res) {
                            print("调用支付函数成功~", res);
                            if (GEDNSDK.payEvent) {
                                GEDNSDK.payEvent(params.money * 100, "CNY", p8OrderId, g.product_name, "头条支付");
                            }
                            var e = {
                                result: 0,
                                data: {
                                    paytype: rData.paytype, // 后端基于自己返回的值做对应的处理
                                    url: rData.url,
                                    order_id: p8OrderId,
                                    res: res
                                }
                            };
                            l(e)
                        },
                        fail(res) {
                            print("调用支付函数失败~", res);
                            var e = {
                                result: 1,
                                data: {
                                    paytype: rData.paytype,
                                    url: rData.url,
                                    order_id: p8OrderId,
                                    res: res
                                }
                            };
                            l(e)
                        },

                    }
                    let logStr = ''
                    for (const key in reData) {
                        if (Object.hasOwnProperty.call(reData, key)) {
                            const element = reData[key];
                            if (key != 'success' && key != 'fail' && key != 'complete') {
                                logStr += key + ':' + element + '\n';
                            }

                        }
                    }
                    print(" 安卓支付参数2:\n", logStr);
                    tt.requestGamePayment(reData)

                } else if (rData.paytype == 23) {
                    let pData = {
                        buyQuantity: params.money * paydata.scale, // 金币购买数量，金币数量必须满足：金币数量*金币单价
                        zoneId: params.zoneId ? params.zoneId : "1", // 1 游戏服务区 id
                        customId: p8OrderId, // 订单号
                        extraInfo: extraInfo,
                        success(res) {
                            console.log("调用ios支付函数成功~", res);
                            if (GEDNSDK.payEvent) {
                                GEDNSDK.payEvent(params.money * 100, "CNY", p8OrderId, g.product_name, "钻石支付");
                            }
                            var e = {
                                result: 0,
                                data: {
                                    paytype: rData.paytype, // 后端基于自己返回的值做对应的处理
                                    url: rData.url,
                                    order_id: p8OrderId,
                                    res: res
                                }
                            };
                            l(e)
                        },
                        fail(res) {
                            console.log("调用ios支付函数失败", res);
                            print("调用支付函数失败~", res);
                            var e = {
                                result: 1,
                                data: {
                                    paytype: rData.paytype,
                                    url: rData.url,
                                    order_id: p8OrderId,
                                    res: res
                                }
                            };
                            l(e)
                        },
                    }
                    let logStr = ''
                    for (const key in pData) {
                        if (Object.hasOwnProperty.call(pData, key)) {
                            const element = pData[key];
                            if (key != 'success' && key != 'fail' && key != 'complete') {
                                logStr += key + ':' + element + '\n';
                            }

                        }
                    }
                    print(" ios支付参数 :\n", logStr);
                    tt.openAwemeCustomerService(pData);
                } else if (rData.paytype == 34) {
                    let url = `${sdkData.rg_url}/api/getPayUrl`;
                    let pay_type = rData.paytype;
                    let h5PayObj = {
                        order_id: p8OrderId,
                        pay_type: pay_type,
                        site: site,
                        time: time
                    }

                    i = newSignGetType(h5PayObj);
                    o = hex_md5(`${time}${sdkData.site}${i}${sdkData.key}${time}`);
                    h5PayObj.sign = o;
                    ttRequest(url, 'post', h5PayObj, (res) => {
                        console.log('p8微信h5支付接口返回res:', res);
                        let rdata = res.data.data;
                        let pay_url = rdata.pay_url;
                        console.log('pay_url:', pay_url);
                        tt.setClipboardData({
                            data: pay_url,
                            success(res) {
                                console.log(`setClipboardData调用成功`, res);
                                tt.showModal({
                                    title: "下单成功",
                                    content: "支付链接已复制,请粘贴到微信搜索框或者聊天后点击支付",
                                    confirmText: "确定",
                                    showCancel: false,
                                    success(res) {
                                        if (res.confirm) {
                                            console.log("confirm, continued");
                                        } else if (res.cancel) {
                                            console.log("cancel, cold");
                                        } else {
                                            // what happend?
                                        }
                                    },
                                    fail(res) {
                                        console.log(`showModal调用失败`);
                                    },
                                });
                            },
                            fail(res) {
                                console.log(`setClipboardData调用失败`, res);
                            },
                        });
                    });
                } else {
                    var e = {
                        result: -1,
                        data: {
                            errorcode: "-1",
                            msg: "暂不支持支付 paytype： " + rData.paytype, // 此处加上key 和 site
                            key: sdkData.key,
                            site: site,
                            aid: sdkData.aid,
                            res: d
                        }
                    };

                    l(e)
                    return
                }

                // 支付上报产品
                let payParams = {
                    event_name: "user_pay",
                    event_time: new Date().getTime() / 1e3,
                    data: {
                        ...a,
                        username: g.rolename,
                        device_model: sdkData.device_model,
                        currency_type: "CNY",
                        media_params: start_param,
                        device_code: sdkData.device_code,
                        game_id: sdkData.game_id,
                        is_model: 1,
                        device_type: a.modeltype,
                        sid: a.serverid,
                        device: a.adid,
                        product_id: a.productid,
                        order_type: a.test,
                        xyx_params: JSON.stringify({
                            scene: sdkData.scene_id,
                            appid: sdkData.appid
                        })
                    },
                    sdk_version: sdkData.sdkVersion,
                    sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
                }
                HttpRequest(`${sdkData.dsj_url}/sdk/upload`, "POST", JSON.stringify(payParams), (e) => {
                    let data = dateOrRes(e);
                    console.log("产品支付返回: ", data)
                })
            } else {
                var e = {
                    result: -2,
                    data: {
                        errorcode: "1100",
                        msg: d.data
                    }
                };
                l(e)
            }
        };
        ttRequest(r, s, a, d)
    });
    return e
}



var tt_videoAD;
var tt_bannerAD;
var tt_sceneAD;
var tt_CustomAD;

function BannerAdCreate(e, t = 0, a = 0, i = "", n) {
    let o = tt.getSystemInfoSync().screenWidth;
    if (!i) i = o;
    tt_bannerAD = tt.createBannerAd({
        adUnitId: e,
        adIntervals: 30,
        style: {
            left: t,
            top: a,
            width: i,
            height: n
        }
    });
    tt_bannerAD.onLoad(() => {
        print("banner 广告加载成功")
    });
    tt_bannerAD.onResize(e => {
        print("banner 广告onResize", e.width, e.height);
        print("banner 广告onResize2", tt_bannerAD.style.realWidth, tt_bannerAD.style.realHeight)
    });
    tt_bannerAD.onError(e => {
        print("banner 广告异常", e)
    })
}

function CustomAdCreate(e, t = 0, a = 0, i = "") {
    let n = tt.getSystemInfoSync().screenWidth;
    if (!i) i = n;
    tt_CustomAD = tt.createCustomAd({
        adUnitId: e,
        style: {
            left: t,
            top: a,
            width: i,
            fixed: true
        }
    });
    tt_CustomAD.onLoad(() => {
        print("模板 广告加载成功")
    });
    tt_CustomAD.onError(e => {
        print("模板 广告异常", e)
    })
}

P8SDK.ttADinit = function (e, t, o, n) {
    if (e && typeof e === "string") {
        print('创建激励视频id', e);
        sdkData.adList.ad_unit_id_reward = e;
        tt_videoAD = tt.createRewardedVideoAd({
            adUnitId: e
        });
        tt_videoAD.onLoad(() => {
            print("激励视频 广告加载成功")
        });
        tt_videoAD.onError(e => {
            print("激励视频 广告加载异常", e)
        })
    }
    if (e && typeof e === "object") {
        console.log("激励视频info ", JSON.stringify(e));
        if (e.adUnitId) {
            sdkData.adList.ad_unit_id_reward = e.adUnitId;
            sdkData.adList.ad_slot_reward = e.adSlot;
        }
        tt_videoAD = tt.createRewardedVideoAd({
            adUnitId: e.adUnitId
        });
        tt_videoAD.onLoad(() => {
            print("激励视频 广告加载成功")
        });
        tt_videoAD.onError(e => {
            print("激励视频 广告加载异常", e)
        })
    }
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
            BannerAdCreate(e, t, a, i, n)
        } else {
            print("广告初始化 banner广告参数不对 ")
        }
    }
    if (t && typeof t === "string") {
        console.log("插屏广告id   ", t);
        tt_sceneAD = tt.createInterstitialAd({
            adUnitId: t
        });
        console.log("tt_sceneAD: ", tt_sceneAD)
        tt_sceneAD.onLoad(() => {
            print("插屏 广告加载成功")
        });
        tt_sceneAD.onError(e => {
            print("插屏 广告加载异常", e)
        })
    }
    if (t && typeof t === "object") {
        console.log("插屏广告info   ", JSON.stringify(t));
        if (t.adUnitId) {
            sdkData.adList.ad_unit_id_sence = t.adUnitId;
            sdkData.adList.ad_slot_sence = t.adSlot;
        }

        tt_sceneAD = tt.createInterstitialAd({
            adUnitId: t.adUnitId
        });
        console.log("tt_sceneAD: ", tt_sceneAD)
        tt_sceneAD.onLoad(() => {
            print("插屏 广告加载成功")
        });
        tt_sceneAD.onError(e => {
            print("插屏 广告加载异常", e)
        })
    }
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
            CustomAdCreate(e, t, a, i)
        } else {
            print("广告初始化 原生模板广告参数不对 ")
        }
    }
}
P8SDK.sceneADShow = function (t, a, adp) {
    console.log('adp', adp);
    console.log('sdkData.adList', sdkData.adList);
    sdkData.ad_positon = adp || "";
    if (!tt_sceneAD || !tt_sceneAD.show()) {
        print("插屏广告不存在");
        return
    }
    let arg = {
        type: "InterstitialAd",
        status: "0",
        geType: "interstitial",
    }
    sdkData.ad_unit_id = sdkData.adList.ad_unit_id_sence;
    sdkData.ad_slot = sdkData.adList.ad_slot_sence;
    debounce(P8LogSDK.wxVideoLog, 1000)(arg)

    tt_sceneAD.show().catch(e => {
        print("插屏 广告显示异常", e);
        if (a) {
            a()
        }
    });
    const event = () => {
        tt_sceneAD.offClose(event)
        print("插屏 广告关闭");
        let succ = {
            type: "InterstitialAd",
            status: "1",
            geType: "interstitial",
        }
        debounce(P8LogSDK.wxVideoLog, 1000)(succ)
        if (t) {
            t()
        }

    }
    tt_sceneAD.onClose(event)
}
P8SDK.videoADShow = function (t, a, c, adp) {
    console.log('adp', adp);
    console.log('sdkData.adList', sdkData.adList);
    sdkData.ad_positon = adp || "";
    print('调用videoADShow');
    if (!tt_videoAD || !tt_videoAD.show) {
        print("激励视频不存在");
        return
    }
    print('调用videoADShow show', tt_videoAD);
    // 开始
    ad_show_time = 1
    ad_timer = setTimeout(() => {
        ad_show_time++
    }, 1000)
    tt_videoAD.show().catch(e => {
        print("激励视频 广告加载异常 再次广告加载", e);
        tt_videoAD.load().then(() => tt_videoAD.show()).catch((err) => {

        });
    });
    let arg = {
        type: "RewardedVideoAd",
        status: "0",
        geType: "reward",
    }
    sdkData.ad_unit_id = sdkData.adList.ad_unit_id_reward;
    sdkData.ad_slot = sdkData.adList.ad_slot_reward;
    debounce(P8LogSDK.wxVideoLog, 1000)(arg)

    tt_videoAD.onError((e) => {
        print("激励视频 广告加载异常.....", e);
        if (c) {
            c(e);
        }
    });

    const evnet = (e) => {
        tt_videoAD.offClose(evnet)
        // 结算时间
        clearTimeout(ad_timer)
        ad_timer = null
        if (e && e.isEnded || e === undefined) {
            print("正常播放结束，可以下发游戏奖励");
            let succ = {
                type: "RewardedVideoAd",
                status: "1",
                geType: "reward",
            }
            debounce(P8LogSDK.wxVideoLog, 1000)(succ)
            if (t) {
                t()
            }

        } else {
            print("播放中途退出，不下发游戏奖励");
            if (a) {
                a()
            }
        }
    }
    tt_videoAD.onClose(evnet)
}
P8SDK.bannerAdShow = function (adp) {
    console.log('adp', adp);
    console.log('sdkData.adList', sdkData.adList);
    sdkData.ad_positon = adp || "";
    if (tt_bannerAD && tt_bannerAD.show) {
        tt_bannerAD.show()
        let succ = {
            type: "BannerAd",
            status: "1",
            geType: "banner",
        }
        sdkData.ad_unit_id = sdkData.adList.ad_unit_id_banner;
        sdkData.ad_slot = sdkData.adList.ad_slot_banner;
        debounce(P8LogSDK.wxVideoLog, 1000)(succ)
    } else {
        print("bannerAD不存在")
    }
}
P8SDK.bannerAdHide = function () {
    tt_bannerAD.hide()
}
P8SDK.customADShow = function (adp) {
    console.log('adp', adp);
    console.log('sdkData.adList', sdkData.adList);
    sdkData.ad_positon = adp || "";
    if (tt_CustomAD && tt_CustomAD.show) {
        tt_CustomAD.show()
        let succ = {
            type: "CustomAd",
            status: "1",
            geType: "native",
        }
        sdkData.ad_unit_id = sdkData.adList.ad_unit_id_custom;
        sdkData.ad_slot = sdkData.adList.ad_slot_custom;
        debounce(P8LogSDK.wxVideoLog, 1000)(succ)
    } else {
        print("模板 广告不存在")
    }
}
P8SDK.customADHide = function () {
    tt_CustomAD.hide()
}
P8SDK.customADOnclose = function (e) {
    if (!tt_CustomAD || !tt_CustomAD.onClose) {
        print("模板 广告不存在");
        return
    }
    const evnet = () => {
        tt_CustomAD.offClose(e)
        if (e) {
            e()
        }
    }
    tt_CustomAD.onClose(evnet)
}

function getTempLateIDs() {
    let time = parseInt((new Date).getTime() / 1e3);
    let data = {
        site: sdkData.site,
        // aid: sdkData.aid,
        appid: sdkData.appid,
        time: time
    };
    let t = SignGetForCenter(data);
    data.sign = hex_md5(t);
    print("订阅推送消息请求参数 ", data);
    let url = `${sdkData.platform_url}/mGame/getSubscriptionId`;
    // let url = `https://tcenter.play800.cn/mGame/getSubscriptionId`;
    let i = "GET";
    let n = e => {
        print('订阅推送消息请求的url:', url)
        print("订阅推送消息获取到的data", e)

        if (e.data.result == 0) {
            let t = e.data.data;
            if (t) {
                template_ids = t
            } else {
                print("没有配置订阅模板id")
            }
            print("订阅推送消息获取到的id", e.data.data);
        } else {
            print("请求订阅模板id异常 请求参数", e.data, data)
        }

    };
    let o = e => {
        print("订阅推送消息获取服务器数据失败", e);
        resolve(e)
    };
    ttRequest(url, i, data, n, o)
}

// 订阅
P8SDK.subscribeMessage = function (temData) {
    let tmplIds = [];
    print("p8sdk 抖音消息订阅 后台配置 接口调用", template_ids);
    if (temData) {
        print("p8sdk 抖音消息订阅 自定义传模板id 接口调用", temData);
    }
    let e = new Promise((l, e) => {
        tmplIds = temData ? temData : template_ids;
        console.log('tmplIds', tmplIds);
        tt.requestSubscribeMessage({
            tmplIds: tmplIds,
            success: a => {
                print("头条消息订阅窗口弹出 ", a);
                console.log(tmplIds);
                let i = "";
                for (let t = 0; t < tmplIds.length; t++) {
                    let e = tmplIds[t];
                    if (a[e] == "accept") {
                        i += e + ","
                    }
                }
                i = i.substring(0, i.length - 1);
                console.log('i', i);
                let time = parseInt((new Date).getTime() / 1e3);
                let t = {
                    site: sdkData.site,
                    aid: sdkData.aid,
                    template_id: i,
                    open_id: sdkData.openid,
                    uid: sdkData.uid,
                    time: time,
                    channel: "dyxyx"
                };
                let n = SignGetForCenter(t);
                t.sign = hex_md5(n);
                let o = `${sdkData.platform_url}/mGame/insertSubscription`;
                // let o = `https://tcenter.play800.cn/mGame/insertSubscription`;
                print('请求 订阅消息请求url ', o)
                let r = "GET";
                let res = {
                    dyres: a,
                }
                let s = e => {
                    print('订阅消息请求 成功返回data', e.data)
                    res.p8res = e.data;
                    l(res)
                };
                let d = e => {
                    print("订阅消息请求 失败返回data", e.data);
                    res.p8res = e.data;
                    l(res)
                };
                ttRequest(o, r, t, s, d)
            },
            fail(e) {
                print("头条消息订阅窗口弹出异常:", e);
                l(e)
            }
        })
    });
    return e
}


// 一次性订阅
P8SDK.newSubscribeMessage = function (p) {
    let data = {}
    for (let key in p.data) {
        if (p.data.hasOwnProperty(key)) {
            console.log(key);
            data[key] = p.data[key];
        }
    }
    console.log(data);
    let e = new Promise((l, e) => {
        tt.requestSubscribeMessage({
            tmplIds: [p.template_ids],
            success: a => {
                let time = parseInt((new Date).getTime() / 1e3);
                let t = {
                    site: sdkData.site,
                    appid: sdkData.appid,
                    tpl_id: p.template_ids,
                    data: JSON.stringify(data),
                    openid: sdkData.openid,
                    uid: sdkData.uid,
                    time: time
                };
                let n = SignGetForCenter(t);
                t.sign = hex_md5(n);
                let o = `${sdklogData.platform_url}/oauth/jrttMsgSend`;
                // let o = `https://tcenter.play800.cn/oauth/jrttMsgSend`;
                console.log(t);
                print('请求 订阅消息请求url ', o)
                let r = "POST";
                let s = e => {
                    print('订阅消息请求', e.data)
                    l(e.data)
                };
                let d = e => {
                    l(e)
                };
                ttRequest(o, r, t, s, d)
            },
            fail(e) {
                print("消息订阅窗口弹出异常:", e);
                l(e)
            }
        })
    });
    return e
}

// 生成客服按钮的客服
P8SDK.gotoCustomerServiceConversation = function (e, handleClick, handleError) {
    if (!e || e.type === undefined) {
        e = {
            type: "text",
            text: '跳转客服',
            style: {
                left: 20,
                top: 40,
                width: 150,
                height: 150,
                lineHeight: 40,
                backgroundColor: "#ffffff",
                textAlign: "center",
                fontSize: 16,
                borderRadius: 4,
                borderColor: "#ffffff",
                borderWidth: 1,
                textColor: "#ffffff",
            },
            success(res) {
                console.log("create success", res);
            },
            fail(res) {
                console.log("create fail", res);
            },
            complete(res) {
                console.log("create complete", res);
            },
        };
    }
    sdkData.button_Contact = tt.createContactButton(e)
    // 点击事件
    sdkData.button_Contact.onTap((res) => {
        handleClick && handleClick(res)
    }); // 监听点击事件
    sdkData.button_Contact.onError((res) => {
        handleError && handleError(res)
    }); // 监听错误
}

// 抖音客服平台
P8SDK.ttOpenCustomerServiceConversation = function (type = 3) {

    if (tt.canIUse('openCustomerServiceConversation.type.3')) {

        tt.openCustomerServiceConversation({
            type: type, // 抖音客服平台
            success(res) {
                console.log(res);
            },
            fail(res) {
                console.log(res);
            },
        });
    }
}


// 跳转
P8SDK.gotoSystem = function (e, edata, a) {
    print("头条跳转别的小程序 ---------------- ");
    tt.navigateToMiniProgram({
        appId: e,
        extraData: edata,
        path: a,
        envVersion: "release",
        success(e) {
            print(" 跳转别的小程序 success  :", e)
        },
        fail(e) {
            print("跳转别的小程序 fail  :", e)
        }
    })
}

// 菜单分享按钮开启
P8SDK.ttshowShareMenu = function (arg) {
    tt.showShareMenu({
        success(res) {
            console.log("showShareMenu 成功显示", res);
        },
        fail(err) {
            console.log("showShareMenu 调用失败", err.errMsg);
        },
        complete(res) {
            console.log("showShareMenu 调用完成", res);
        },
    })

    tt.onShareAppMessage(function (res) {
        //当监听到用户点击了分享或者拍抖音等按钮后，会执行该函数
        // do something
        console.log('[ res ] >', res)
        if (GEDNSDK.track) {
            GEDNSDK.track('$MPShare');
        }
        return {
            //执行函数后，这里是需要该函数返回的对象
            title: arg.title,
            imageUrl: arg.imageUrl,
            query: arg.query,
            success: arg.success,
            fail: arg.fail,
        };
    });
}

tt.onShareAppMessage(function (res) {
    //当监听到用户点击了分享或者拍抖音等按钮后，会执行该函数
    // do something
    console.log('[ do something ] >')
    if (GEDNSDK.track) {
        GEDNSDK.track('$MPShare');
    }
});


tt.onFavoriteStateChange((isFavorited) => {
    if (isFavorited) {
        console.log("收藏成功");
        if (GEDNSDK.track) {
            GEDNSDK.track('$MPAddFavorites');
        }
    } else {
        console.log("收藏失败");
    }
});


// 主动分享   channel: "invite", // 拉起邀请面板分享游戏好友  channel: "token" // 口令分享 templateId: "", // 替换成通过审核的分享ID
P8SDK.ttshareAppMessage = function (arg) {
    let shareObj = {
        channel: arg.channel,
        templateId: arg.templateId,
        title: arg.title,
        desc: arg.desc,
        imageUrl: arg.imageUrl, // 图片 URL
        query: arg.query,
        extra: arg.extra, // 附加信息（仅channel == video时生效）
        success: (res) => {
            // 内部成功回调处理
            print('分享成功回调', res);
            arg.success && arg.success(res);
            if (GEDNSDK.track) {
                GEDNSDK.track('$MPShare');
            }
        },
        fail: arg.fail,
    }
    print('主动分享请求参数', shareObj)
    tt.shareAppMessage(shareObj)
}
// 637ns0ujam22mc0r5g

//获取启动参数
P8SDK.getQuery = function () {
    var options = tt.getLaunchOptionsSync();
    options.query.scene = options.scene
    return options.query;
}

// 确认当前宿主版本是否支持跳转某个小游戏入口场景，目前仅支持「侧边栏」场景。

P8SDK.checkScene = function (succ, err) {
    if (tt.checkScene) {
        tt.checkScene({
            scene: "sidebar",
            success: (res) => {
                console.log("check scene success: ", res.isExist);
                succ && succ(res.isExist);
                //成功回调逻辑
            },
            fail: (res) => {
                console.log("check scene fail:", res);
                err && err(res);
                //失败回调逻辑
            }
        });
    } else {
        err && err();
    }
}

// 调用该API可以跳转到某个小游戏入口场景，目前仅支持跳转「侧边栏」场景。
P8SDK.navigateToScene = function (succ, err) {
    if (tt.navigateToScene) {
        tt.navigateToScene({
            scene: "sidebar",
            success: (res) => {
                console.log("navigate to scene success");
                succ && succ();
                // 跳转成功回调逻辑
            },
            fail: (res) => {
                console.log("navigate to scene fail: ", res);
                err && err();
                // 跳转失败回调逻辑
            },
        });
    } else {
        err && err();
    }
}

// 调起复访栏
P8SDK.showRevisitGuide = function (succ, err) {
    if (tt.showRevisitGuide) {
        tt.showRevisitGuide({
            success() {
                console.log('成功调起复访引导弹窗');
                if (GEDNSDK.track) {
                    GEDNSDK.track('$MPAddFavorites');
                }
                succ && succ();
            },
            fail(res) {
                console.log('调用失败，错误信息：%s', res.errMsg);
                err && err();
            }
        })
    } else {
        err && err();
    }
}

// 添加到桌面
P8SDK.addShortcut = function () {
    tt.addShortcut({
        success() {
            console.log("添加桌面成功");
            if (GEDNSDK.track) {
                GEDNSDK.track('$MPAddFavorites');
            }
        },
        fail(err) {
            console.log("添加桌面失败", err.errMsg);
        },
    });
}

P8SDK.gotoMiniProgram = function (g = "{}") {
    let result = new Promise((resolve, reject) => {
        let P8clickid = `P8clickid_${Math.floor(Math.random() * 1000000)}`;
        let toParams = {
            appId: g.appId,
            path: '?' + g.query + `${g.query ? '&' : ''}P8clickid=${P8clickid}&appid=${sdkData.appid}`,
            envVersion: g.envVersion || "current",
            /* latest 测试版  current 正式版 */
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
        tt.navigateToMiniProgram(toParams);
    })
    return result;
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
        console.log('[ n ] >', n)
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
    let shareObj = {
        channel: g.channel,
        templateId: g.templateId,
        title: g.title,
        desc: g.desc,
        imageUrl: g.imageUrl,
        query: g.query + `${g.query ? '&' : ''}mode=iaa&activityId=${g.activityId}&shareOpenid=${sdkData.device}&content=${g.content}&version=${g.version}`,
        extra: g.extra,
        success: (res) => {
            // 内部成功回调处理
            print('分享成功回调', res);
            postShareCount(postShareObj).then(res => {
                print("主动分享上报 返回的数据 " + JSON.stringify(res));
            })
            // 调用外部传入的success回调
            g.success && g.success(res);
        },
        fail: g.fail,
    }
    print('主动分享请求参数', shareObj)
    let postShareObj = {
        activityId: g.activityId,
        content: g.content,
        version: g.version,
    }

    tt.shareAppMessage(shareObj);
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
    console.log('[ sdkData.device ] >', sdkData.device)

    let shareObj = {
        channel: g.channel,
        templateId: g.templateId,
        title: g.title,
        desc: g.desc,
        imageUrl: g.imageUrl,
        query: g.query + `${g.query ? '&' : ''}mode=falls&shareid=${g.shareid}&shareOpenid=${sdkData.device}&groupid=${g.groupid}`,
        extra: g.extra,
        success: (res) => {
            // 内部成功回调处理
            print('分享成功回调', res);
            postShareFallsCount(postShareObj).then(res => {
                print("瀑布流分享上报 返回的数据 " + JSON.stringify(res));
            })
            // 调用外部传入的success回调
            g.success && g.success(res);
        },
        fail: g.fail,
    }
    print("p8sdk iaa 瀑布流分享 接口调用", shareObj);
    let postShareObj = {
        shareid: g.shareid,
        groupid: g.groupid,
        shareOpenid: sdkData.device,
    }

    tt.shareAppMessage(shareObj);
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

        // if (sdkData.device == data.shareOpenid) {
        //     console.log("sdkData.device与data.shareOpenid相同,不进行上报");
        //     return
        // }

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

function getSceneId() {
    let scene = tt.getLaunchOptionsSync().scene;
    print("场景值：", scene)
    sdkData.scene_id = scene;
}

function getDevice() {
    tt.getNetworkType({
        success: function (e) {
            sdkData.device_net = e.networkType
        }
    });

    let e = tt.getSystemInfoSync();
    var t = e.platform;
    var options = tt.getLaunchOptionsSync();
    start_param = options.query;
    code = options.query.code;
    sdkData.modeltype = t;
    sdkData.platform = t;
    sdkData.device_model = e.model;
    sdkData.device_resolution = e.screenWidth + "*" + e.screenHeight;
    sdkData.device_version = e.system;
    if (t.toLowerCase().indexOf("ios") != -1 || t.toUpperCase().indexOf("IOS") != -1) {
        sdkData.key = sdkData.key_ios;
        sdkData.site = sdkData.site_ios;
        sdkData.aid = sdkData.aid_ios
    } else {
        sdkData.key = sdkData.key_android;
        sdkData.site = sdkData.site_android;
        sdkData.aid = sdkData.aid_android
    }
}


// 解密过程
function decrypt(mode, cipherText, key, iv = null) {
    const uKey = parseKey(key);
    const uIv = parseKey(iv);
    let bytes = globalThis.CryptoJS.AES.decrypt(cipherText, uKey, {
        iv: uIv,
        mode: mode,
        padding: globalThis.CryptoJS.pad.Pkcs7
    });
    // console.log('bytes', bytes.toString(globalThis.CryptoJS.enc.Base64));
    return bytes.toString(globalThis.CryptoJS.enc.Utf8);
}
// 传入key之前要调用，不然结果不对
function parseKey(key) {
    return globalThis.CryptoJS.enc.Utf8.parse(key);
}

P8SDK.destoryCustomerButton = function (e) {
    sdkData.button_Contact.hide()
    sdkData.button_Contact.destroy();
}

var p8QuickApp = null;

function HttpRequest(e, t = "get", i = null, r = null, f = null) {
    if (p8QuickApp) {
        XmlHttpRequest(e, t, i, r, f);
    } else {
        if (i) {
            print(" 请求参数: " + " sign: " + i.sign + " site: " + i.site + " time: " + i.time);
        }
        tt.request({
            url: e,
            method: t,
            data: i,
            header: {
                "content-type": "application/x-www-form-urlencoded"
            },
            success: function (e) {
                r(e);
            },
            fail: function (e) {
                r(e);
            }
        });
    }
}

// 上报激活
P8LogSDK.onActiveFunc = function (s = {}) {
    print(" =============== 开始激活上报: 传入数据是 " + JSON.stringify(s));
    ChangeUndefined(s);
    let e = new Promise((r, e) => {
        if (hasActivated) {
            print('激活已经上报过,不再重复上报');
            r({
                result: "-1",
                data: {
                    errorcode: 999,
                    msg: "激活已经上报过,不再重复上报"
                }
            });
            return;
        }


        let t = parseInt(new Date().getTime() / 1e3);
        let i = {
            aid: sdkData.aid,
            site: sdkData.site,
            time: t,
            version: sdkData.sdkVersion,
            device: sdkData.device,
            modeltype: sdkData.modeltype,
            gameversion: s.gameversion,
            device_model: sdkData.device_model,
            device_resolution: sdkData.device_resolution,
            device_version: sdkData.device_version,
            device_net: sdkData.device_net,
            oaid: s.oaid
        };
        ChangeUndefined(i);
        let params = {
            event_name: "activate",
            event_time: new Date().getTime() / 1e3,
            data: {
                ...i,
                media_params: start_param,
                device_code: sdkData.device_code,
                game_id: sdkData.game_id,
                is_model: 1,
                device_type: i.modeltype,
                xyx_params: JSON.stringify({
                    scene: sdkData.scene_id,
                    appid: sdkData.appid
                }),
                source_type: 3,
                source_from: ""
            },
            sdk_version: sdkData.sdkVersion,
            sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
        }

        if (queryData.code) {
            params.source_type = 1
            params.source_from = ""
        }

        console.log("params: ", params)
        let n = newSignGetType_log(i);
        console.log("排序", n);
        var d = hex_md5(n);
        i.sign = d;
        let a = `${sdkData.data_url}/log/activate`;
        print("  激活上报请求服务器参数: " + JSON.stringify(i));
        console.log("  激活上报请求产品服务器参数: ", params);
        let o = a + "?" + keyValueConnect(i);
        print("激活上报Url: ", o);
        print("产品激活上报Url: ", o);
        HttpRequest(o, "GET", i, (e) => {
            print(" 激活返回的数据 res： " + JSON.stringify(e));
            let t = dateOrRes(e);
            if (t.result) {
                var i = {
                    result: "1",
                    data: {
                        errorcode: t.data.errorcode,
                        msg: t.data.msg
                    }
                };
            } else {
                var i = {
                    result: "0"
                };
            }
            r(i);
        });
        HttpRequest(`${sdkData.dsj_url}/sdk/upload`, "POST", JSON.stringify(params), (e) => {
            let data = dateOrRes(e);
            if (data && data.ret == 0) {
                hasActivated = true;
            }
            console.log("产品激活返回: ", data)
        })
    });
    return e;
};

// 登录上报
P8LogSDK.pushLoginData = function (s) {
    console.warn(" =============== 开始登录上报: 传入的数据是 " + JSON.stringify(s));
    let e = new Promise((r, e) => {
        if (haspushLogin) {
            print('登录已经上报过,不再重复上报');
            r({
                result: "-1",
                data: {
                    errorcode: 999,
                    msg: "登录已经上报过,不再重复上报"
                }
            });
            return;
        }

        let t = parseInt(new Date().getTime() / 1e3);
        let i = {
            aid: sdkData.aid,
            uid: sdkData.uid,
            sid: s.sid || sdkData.sid || '1',
            roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
            rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
            username: s.username || sdkData.account || sdkData.uid || '1',
            level: s.level || sdkData.level || '1',
            vip: s.vip || sdkData.vip || '1',
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
            version: sdkData.sdkVersion
        };
        sdkData.sid = s.sid;
        sdkData.roleid = s.roleid;
        sdkData.rolename = s.rolename;
        sdkData.level = s.level;
        sdkData.vip = s.vip;
        setheartbeat(i);
        ChangeUndefined(i);
        // 登陆上报产品
        let params = {
            event_name: "login",
            event_time: new Date().getTime() / 1e3,
            data: {
                ...i,
                media_params: start_param,
                device_code: sdkData.device_code,
                game_id: sdkData.game_id,
                is_model: 1,
                device_type: sdkData.modeltype,
                xyx_params: JSON.stringify({
                    scene: sdkData.scene_id,
                    appid: sdkData.appid
                }),
                source_type: 3,
                source_from: ""
            },
            sdk_version: sdkData.sdkVersion,
            sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
        }

        if (queryData.code) {
            params.source_type = 1
            params.source_from = ""
        }

        console.log("登陆请求参数: ", params);
        let n = newSignGetType_log(i);
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
                var i = {
                    result: "1",
                    data: {
                        errorcode: t.errorcode,
                        msg: t.msg
                    }
                };
            } else {
                var i = {
                    result: "0",
                    data: {
                        errorcode: 200,
                        msg: "登录数据上报成功"
                    }
                };
            }
            r(i);
        });
        HttpRequest(`${sdkData.dsj_url}/sdk/upload`, "POST", JSON.stringify(params), (e) => {
            let data = dateOrRes(e);
            if (data && data.ret == 0) {
                haspushLogin = true;
            }
            console.log("产品登陆返回: ", data)
        })
    });
    return e;
};

// 创角上报
P8LogSDK.signLog = function (o) {
    print(" =============== 开始创角上报: 传入的数据是 " + JSON.stringify(o));

    let e = new Promise((r, e) => {
        let t = parseInt(new Date().getTime() / 1e3);
        let s = {
            sid: o.sid || sdkData.sid || '1',
            roleid: o.roleid || sdkData.roleid || sdkData.uid || '1',
            rolename: o.rolename || sdkData.rolename || sdkData.uid || '1',
            level: o.level || sdkData.level || '1',
            gameversion: o.gameversion,
            uid: sdkData.uid,
            device: sdkData.device,
            modeltype: sdkData.modeltype,
            device_model: sdkData.device_model,
            device_resolution: sdkData.device_resolution,
            device_version: sdkData.device_version,
            device_net: sdkData.device_net,
            site: sdkData.site,
            time: t,
            aid: sdkData.aid,
        }
        ChangeUndefined(s);
        let params = {
            event_name: "role_create",
            event_time: new Date().getTime() / 1e3,
            data: {
                ...s,
                media_params: start_param,
                device_code: sdkData.device_code,
                game_id: sdkData.game_id,
                is_model: 1,
                device_type: s.modeltype,
                xyx_params: JSON.stringify({
                    scene: sdkData.scene_id,
                    appid: sdkData.appid
                })
            },
            sdk_version: sdkData.sdkVersion,
            sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
        }
        let i = newSignGetType_log(s);
        console.log(i)
        var n = hex_md5(i);
        console.log("加密后的参数: ", n)
        s.sign = n;
        let d = `${sdkData.data_url}/log/role`;
        print("创角上报请求服务器参数: " + JSON.stringify(s));
        let a = d + "?" + keyValueConnect(s);
        print("创角上报请求Url: ", a);
        HttpRequest(a, "GET", s, (e) => {
            let t = dateOrRes(e);
            print("创角返回的数据 是什么 " + JSON.stringify(t));
            if (t.result == 0) {
                print("创角数据上报成功 ");
                var i = {
                    result: "0",
                    data: {
                        errorcode: t.errorcode,
                        msg: t.msg
                    }
                };
            } else {
                print("创角数据上报失败");
                var i = {
                    result: "1",
                    data: {
                        errorcode: 200,
                        msg: "创角数据上报失败"
                    }
                };
            }
            r(i);
        });
        HttpRequest(`${sdkData.dsj_url}/sdk/upload`, "POST", JSON.stringify(params), (e) => {
            let data = dateOrRes(e);
            console.log("产品创角返回: ", data)
        })
    });
    return e;
};

// 角色升级上报
P8LogSDK.upGradeRecord = function (s) {
    print(" =============== 开始升级上报: 传入的数据是 " + JSON.stringify(s));
    let e = new Promise((r, e) => {
        let t = parseInt(new Date().getTime() / 1e3);
        let i = {
            aid: sdkData.aid,
            uid: sdkData.uid,
            device: sdkData.device,
            modeltype: sdkData.modeltype,
            username: s.username || sdkData.account || sdkData.uid || '1',
            sid: s.sid || sdkData.sid || '1',
            roleid: s.roleid || sdkData.roleid || sdkData.uid || '1',
            rolename: s.rolename || sdkData.rolename || sdkData.uid || '1',
            level: s.level || sdkData.level || '1',
            vip: s.vip || sdkData.vip || '1',
            onlinetime: s.onlinetime,
            device_model: sdkData.device_model,
            device_resolution: sdkData.device_resolution,
            device_version: sdkData.device_version,
            device_net: sdkData.device_net,
            oaid: s.oaid,
            site: sdkData.site,
            time: t,
            version: sdkData.sdkVersion
        };
        sdkData.sid = s.sid;
        sdkData.roleid = s.roleid;
        sdkData.rolename = s.rolename;
        sdkData.level = s.level;
        sdkData.vip = s.vip;
        ChangeUndefined(i);
        let params = {
            event_name: "role_upgrade",
            event_time: new Date().getTime() / 1e3,
            data: {
                ...i,
                media_params: start_param,
                device_code: sdkData.device_code,
                game_id: sdkData.game_id,
                is_model: 1,
                device_type: s.modeltype,
                ip: sdkData.ip,
                xyx_params: JSON.stringify({
                    scene: sdkData.scene_id,
                    appid: sdkData.appid
                })
            },
            sdk_version: sdkData.sdkVersion,
            sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
        }
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
                var i = {
                    result: "1",
                    data: {
                        errorcode: t.errorcode,
                        msg: t.msg
                    }
                };
            } else {
                var i = {
                    result: "0",
                    data: {
                        errorcode: 200,
                        msg: "升级数据上报成功"
                    }
                };
            }
            r(i);
        });
        HttpRequest(`${sdkData.dsj_url}/sdk/upload`, "POST", JSON.stringify(params), (e) => {
            let data = dateOrRes(e);
            console.log("产品角色升级返回: ", data)
        })
    });
    return e;
};

// 直玩订阅功能
P8SDK.directPlaySubscription = function (params) {
    print('[ 直玩传入的参数 ] >' + JSON.stringify(params))
    let obj = tt.getLaunchOptionsSync();
    console.log('obj', obj);
    let result = new Promise((resolve, reject) => {
        // 先检测是否订阅过
        if (tt.checkFeedSubscribeStatus) {
            tt.checkFeedSubscribeStatus({
                type: params.type || 'play', // play=直玩（该场景必传scene）
                scene: params.scene || obj.feed_game_scene,
                allScene: params.allScene,
                success(res) {
                    console.log("查询订阅状态: ", res)
                    if (!res.status) {
                        // 没有订阅 发起订阅
                        tt.requestFeedSubscribe({
                            type: params.type || 'play', // play=直玩（该场景必传scene）
                            scene: params.scene || obj.feed_game_scene,
                            allScene: params.allScene,
                            contentIDs: params.contentIDs,
                            success(res) {
                                console.log("订阅结果返回的数据: ", res)
                                if (res.success) {
                                    resolve({
                                        msg: "订阅成功",
                                        code: 0
                                    })
                                } else {
                                    resolve({
                                        msg: "订阅失败/取消订阅/拒绝订阅",
                                        code: 1
                                    })
                                }
                            },
                            fail(res) {
                                resolve({
                                    msg: "订阅失败" + res.errMsg + res.errNo,
                                    code: -2
                                })
                            },
                        })
                    } else {
                        resolve({
                            msg: "用户已经订阅",
                            code: 1
                        })
                    }
                },
                fail(res) {
                    resolve({
                        msg: "查询订阅状态失败" + res.errMsg + res.errNo,
                        code: -1
                    })
                },
            })
        } else {
            tt.showModal({
                title: "提示",
                content: "当前客户端版本过低，无法使用该功能，请升级客户端或关闭后重启更新。",
            });
        }

    })

    return result;
}

// 查询用户订阅状态
P8SDK.checkFeedSubscribeStatus = function (params) {
    return new Promise((resolve, reject) => {
        tt.checkFeedSubscribeStatus({
            type: params.type || 'play', // play=直玩（该场景必传scene）
            scene: params.scene || obj.feed_game_scene,
            allScene: params.allScene,
            success(res) {
                console.log("查询订阅状态: ", res)
                if (!res.status) {
                    resolve({
                        msg: "用户没有订阅",
                        code: 0
                    })
                } else {
                    resolve({
                        msg: "用户已经订阅",
                        code: 1
                    })
                }
            },
            fail(res) {
                resolve({
                    msg: "查询订阅状态失败" + res.errMsg + res.errNo,
                    code: -1
                })
            },
        })
    })
}

// 上报自定义场景
P8SDK.reportCustomScene = function (params) {
    tt.reportScene({
        sceneId: params.sceneId,
        costTime: params.costTime,
        dimension: params.dimension,
        metric: params.metric,
        success: (res) => {
            params.success(res)
        },
        fail: (err) => {
            params.fail(err)
        }
    })
}

// 充值上报
P8LogSDK.incomeLog = function (a) {
    print(" =============== 开始充值上报: 传入的数据是 " + JSON.stringify(a));
    let o = parseInt(new Date().getTime() / 1e3);
    let t = new Promise((i, e) => {
        let t = {
            site: sdkData.site,
            key: sdkData.key,
            aid: sdkData.aid,
            time: o,
            uid: sdkData.uid,
            username: a.username,
            sid: a.sid,
            roleid: a.roleid,
            rolename: a.rolename,
            level: a.level,
            device_type: sdkData.openid,
            order_id: a.order_id,
            income_channel: a.income_channel,
            income_currency: a.income_currency,
            income_money: a.income_money,
            income_gold: a.income_gold,
            own_gold: a.own_gold,
            income_status: a.income_status
        };
        ChangeUndefined(t);
        let r = newSignGetType_log(t);
        var n = hex_md5(r);
        t.sign = n;
        let d = `${sdkData.data_url}/log/income_log`;
        print("  开始充值上报url " + d);
        HttpRequest(d, "GET", t, (e) => {
            var t = dateOrRes(e);
            if (t.result == 0) {
                i({
                    msg: t.msg ? t.msg : "成功",
                    result: t.result
                });
            } else {
                i({
                    data: t,
                    result: t.result
                });
            }
        });
    });
    return t;
};

// 广告点击上报
P8LogSDK.wxVideoLog = function (arg) {
    console.log(" =============== 开始微信广告上报: 数据是 " + JSON.stringify(arg));
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

            ad_slot: arg.ad_slot || sdkData.ad_slot || "激励视频", // 广告位创建的名称 在微信后台申请的广告位的名称
            ad_unit_id: arg.ad_unit_id || sdkData.ad_unit_id || "1", //广告位id
            type: arg.type, // 'BannerAd' 横幅 'RewardedVideoAd' 激励视频 'InterstitialAd' 插屏广告 'CustomAd' 模板广告
            status: arg.status, // 点击传入 0 观看成功传入 1 banner广告点击就算成功
            ad_positon: arg.ad_positon || sdkData.ad_positon || "",
        };

        if (data.status == 1) {
            if (GEDNSDK.track) {
                GEDNSDK.track('$AdShowByClient', {
                    $ad_type: arg.geType,
                    $ad_unit_id: data.ad_unit_id,
                    $ad_status: data.status,
                    $custom_param: data
                });
            }
        }

        ChangeUndefined(data);
        let params = {
            event_name: "ad_show",
            event_time: new Date().getTime() / 1e3,
            data: {
                ...data,
                username: arg.rolename || sdkData.account || sdkData.uid || '1',
                device_model: sdkData.device_model,
                vip: arg.vip || sdkData.vip || '1',
                ad_show_time,
                media_params: start_param,
                device_code: sdkData.device_code,
                game_id: sdkData.game_id,
                is_model: 1,
                device_type: data.modeltype,
                ad_type: data.type,
                ad_status: data.status,
                xyx_params: JSON.stringify({
                    scene: sdkData.scene_id,
                    appid: sdkData.appid
                })
            },
            sdk_version: sdkData.sdkVersion,
            sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
        }
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
        });
        console.log(" 微信广告模板上报参数: " + JSON.stringify(params));
        HttpRequest(`${sdkData.dsj_url}/sdk/upload`, "POST", JSON.stringify(params), (e) => {
            let data = dateOrRes(e);
            ad_show_time = 1
            console.log("产品广告上报返回: ", data)
        })
    });
    return e;
};

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
        level: s.level,
        username: s.username || sdkData.account || sdkData.uid || '1',
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
    ChangeUndefined(i);
    let upgradeData = {
        event_name: "level_upgrade",
        event_time: t,
        data: i,
        sdk_version: sdkData.sdkVersion,
        sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
    };
    print("  新SDK模版关卡进出上报请求服务器参数: " + JSON.stringify(upgradeData));
    HttpRequest(`${sdkData.dsj_url}/sdk/upload`, "POST", JSON.stringify(upgradeData), (e) => {
        let data = dateOrRes(e);
        console.log("产品关卡进出上报返回: ", data)
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
        sdk_version: sdkData.sdkVersion,
        sdk_name: `P8-小游戏-p8sdk-tt-${sdkData.sdkVersion}`
    };
    let d = `${sdkData.dsj_url}/sdk/upload`;
    print("  产品跳转小程序上报请求服务器参数: " + JSON.stringify(upgradeData));
    HttpRequest(d, "POST", upgradeData, (e) => {
        let data = dateOrRes(e);
        print(" 产品跳转小程序返回的数据 res： " + JSON.stringify(data));
    });

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


var V = V || {};
V.Security = V.Security || {};
(function () {
    var k = V.Security;
    k.maxExactInt = Math.pow(2, 53);
    k.toUtf8ByteArr = function (e) {
        var t = [],
            a;
        for (var i = 0; i < e.length; i++) {
            a = e.charCodeAt(i);
            if (55296 <= a && a <= 56319) {
                var n = a,
                    o = e.charCodeAt(i + 1);
                a = (n - 55296) * 1024 + (o - 56320) + 65536;
                i++
            }
            if (a <= 127) {
                t[t.length] = a
            } else if (a <= 2047) {
                t[t.length] = (a >>> 6) + 192;
                t[t.length] = a & 63 | 128
            } else if (a <= 65535) {
                t[t.length] = (a >>> 12) + 224;
                t[t.length] = a >>> 6 & 63 | 128;
                t[t.length] = a & 63 | 128
            } else if (a <= 1114111) {
                t[t.length] = (a >>> 18) + 240;
                t[t.length] = a >>> 12 & 63 | 128;
                t[t.length] = a >>> 6 & 63 | 128;
                t[t.length] = a & 63 | 128
            } else {
                throw "Unicode standart supports code points up-to U+10FFFF"
            }
        }
        return t
    };
    k.toHex32 = function (e) {
        if (e & 2147483648) {
            e = e & ~2147483648;
            e += Math.pow(2, 31)
        }
        var t = e.toString(16);
        while (t.length < 8) {
            t = "0" + t
        }
        return t
    };
    k.reverseBytes = function (e) {
        var t = 0;
        t += e >>> 24 & 255;
        t += (e >>> 16 & 255) << 8;
        t += (e >>> 8 & 255) << 16;
        t += (e & 255) << 24;
        return t
    };
    k.leftRotate = function (e, t) {
        return e << t | e >>> 32 - t
    };
    k.md5 = function (e) {
        var t = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
        var a = [];
        for (var i = 0; i <= 63; i++) {
            a[i] = Math.abs(Math.sin(i + 1)) * Math.pow(2, 32) << 0
        }
        var n = 1732584193,
            o = 4023233417,
            r = 2562383102,
            s = 271733878,
            d, l;
        d = k.toUtf8ByteArr(e);
        e = null;
        l = d.length;
        d.push(128);
        var c = Math.abs(448 - d.length * 8 % 512) / 8;
        while (c--) {
            d.push(0)
        }
        d.push(l * 8 & 255, l * 8 >> 8 & 255, l * 8 >> 16 & 255, l * 8 >> 24 & 255);
        var i = 4;
        while (i--) {
            d.push(0)
        }
        var g = k.leftRotate;
        var i = 0,
            f = [];
        while (i < d.length) {
            for (var u = 0; u <= 15; u++) {
                f[u] = (d[i + 4 * u] << 0) + (d[i + 4 * u + 1] << 8) + (d[i + 4 * u + 2] << 16) + (d[i + 4 * u + 3] << 24)
            }
            var p = n,
                m = o,
                h = r,
                _ = s,
                w, D;
            for (var u = 0; u <= 63; u++) {
                if (u <= 15) {
                    w = m & h | ~m & _;
                    D = u
                } else if (u <= 31) {
                    w = _ & m | ~_ & h;
                    D = (5 * u + 1) % 16
                } else if (u <= 47) {
                    w = m ^ h ^ _;
                    D = (3 * u + 5) % 16
                } else {
                    w = h ^ (m | ~_);
                    D = 7 * u % 16
                }
                var v = _;
                _ = h;
                h = m;
                m = m + g(p + w + a[u] + f[D], t[u]);
                p = v
            }
            n = n + p << 0;
            o = o + m << 0;
            r = r + h << 0;
            s = s + _ << 0;
            i += 512 / 8
        }
        var x = y(n) + y(o) + y(r) + y(s);

        function y(e) {
            return k.toHex32(k.reverseBytes(e))
        }
        return x
    }
})();
var hexcase = 0;
var b64pad = "";

function hex_md5(e) {
    return rstr2hex(rstr_md5(str2rstr_utf8(e)))
}

function rstr_md5(e) {
    return binl2rstr(binl_md5(rstr2binl(e), e.length * 8))
}

function rstr2hex(e) {
    try {
        hexcase
    } catch (e) {
        hexcase = 0
    }
    var t = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var a = "";
    var i;
    for (var n = 0; n < e.length; n++) {
        i = e.charCodeAt(n);
        a += t.charAt(i >>> 4 & 15) + t.charAt(i & 15)
    }
    return a
}

function str2rstr_utf8(e) {
    return unescape(encodeURI(e))
}

function rstr2binl(e) {
    var t = Array(e.length >> 2);
    for (var a = 0; a < t.length; a++) t[a] = 0;
    for (var a = 0; a < e.length * 8; a += 8) t[a >> 5] |= (e.charCodeAt(a / 8) & 255) << a % 32;
    return t
}

function binl2rstr(e) {
    var t = "";
    for (var a = 0; a < e.length * 32; a += 8) t += String.fromCharCode(e[a >> 5] >>> a % 32 & 255);
    return t
}

function binl_md5(e, t) {
    e[t >> 5] |= 128 << t % 32;
    e[(t + 64 >>> 9 << 4) + 14] = t;
    var a = 1732584193;
    var i = -271733879;
    var n = -1732584194;
    var o = 271733878;
    for (var r = 0; r < e.length; r += 16) {
        var s = a;
        var d = i;
        var l = n;
        var c = o;
        a = md5_ff(a, i, n, o, e[r + 0], 7, -680876936);
        o = md5_ff(o, a, i, n, e[r + 1], 12, -389564586);
        n = md5_ff(n, o, a, i, e[r + 2], 17, 606105819);
        i = md5_ff(i, n, o, a, e[r + 3], 22, -1044525330);
        a = md5_ff(a, i, n, o, e[r + 4], 7, -176418897);
        o = md5_ff(o, a, i, n, e[r + 5], 12, 1200080426);
        n = md5_ff(n, o, a, i, e[r + 6], 17, -1473231341);
        i = md5_ff(i, n, o, a, e[r + 7], 22, -45705983);
        a = md5_ff(a, i, n, o, e[r + 8], 7, 1770035416);
        o = md5_ff(o, a, i, n, e[r + 9], 12, -1958414417);
        n = md5_ff(n, o, a, i, e[r + 10], 17, -42063);
        i = md5_ff(i, n, o, a, e[r + 11], 22, -1990404162);
        a = md5_ff(a, i, n, o, e[r + 12], 7, 1804603682);
        o = md5_ff(o, a, i, n, e[r + 13], 12, -40341101);
        n = md5_ff(n, o, a, i, e[r + 14], 17, -1502002290);
        i = md5_ff(i, n, o, a, e[r + 15], 22, 1236535329);
        a = md5_gg(a, i, n, o, e[r + 1], 5, -165796510);
        o = md5_gg(o, a, i, n, e[r + 6], 9, -1069501632);
        n = md5_gg(n, o, a, i, e[r + 11], 14, 643717713);
        i = md5_gg(i, n, o, a, e[r + 0], 20, -373897302);
        a = md5_gg(a, i, n, o, e[r + 5], 5, -701558691);
        o = md5_gg(o, a, i, n, e[r + 10], 9, 38016083);
        n = md5_gg(n, o, a, i, e[r + 15], 14, -660478335);
        i = md5_gg(i, n, o, a, e[r + 4], 20, -405537848);
        a = md5_gg(a, i, n, o, e[r + 9], 5, 568446438);
        o = md5_gg(o, a, i, n, e[r + 14], 9, -1019803690);
        n = md5_gg(n, o, a, i, e[r + 3], 14, -187363961);
        i = md5_gg(i, n, o, a, e[r + 8], 20, 1163531501);
        a = md5_gg(a, i, n, o, e[r + 13], 5, -1444681467);
        o = md5_gg(o, a, i, n, e[r + 2], 9, -51403784);
        n = md5_gg(n, o, a, i, e[r + 7], 14, 1735328473);
        i = md5_gg(i, n, o, a, e[r + 12], 20, -1926607734);
        a = md5_hh(a, i, n, o, e[r + 5], 4, -378558);
        o = md5_hh(o, a, i, n, e[r + 8], 11, -2022574463);
        n = md5_hh(n, o, a, i, e[r + 11], 16, 1839030562);
        i = md5_hh(i, n, o, a, e[r + 14], 23, -35309556);
        a = md5_hh(a, i, n, o, e[r + 1], 4, -1530992060);
        o = md5_hh(o, a, i, n, e[r + 4], 11, 1272893353);
        n = md5_hh(n, o, a, i, e[r + 7], 16, -155497632);
        i = md5_hh(i, n, o, a, e[r + 10], 23, -1094730640);
        a = md5_hh(a, i, n, o, e[r + 13], 4, 681279174);
        o = md5_hh(o, a, i, n, e[r + 0], 11, -358537222);
        n = md5_hh(n, o, a, i, e[r + 3], 16, -722521979);
        i = md5_hh(i, n, o, a, e[r + 6], 23, 76029189);
        a = md5_hh(a, i, n, o, e[r + 9], 4, -640364487);
        o = md5_hh(o, a, i, n, e[r + 12], 11, -421815835);
        n = md5_hh(n, o, a, i, e[r + 15], 16, 530742520);
        i = md5_hh(i, n, o, a, e[r + 2], 23, -995338651);
        a = md5_ii(a, i, n, o, e[r + 0], 6, -198630844);
        o = md5_ii(o, a, i, n, e[r + 7], 10, 1126891415);
        n = md5_ii(n, o, a, i, e[r + 14], 15, -1416354905);
        i = md5_ii(i, n, o, a, e[r + 5], 21, -57434055);
        a = md5_ii(a, i, n, o, e[r + 12], 6, 1700485571);
        o = md5_ii(o, a, i, n, e[r + 3], 10, -1894986606);
        n = md5_ii(n, o, a, i, e[r + 10], 15, -1051523);
        i = md5_ii(i, n, o, a, e[r + 1], 21, -2054922799);
        a = md5_ii(a, i, n, o, e[r + 8], 6, 1873313359);
        o = md5_ii(o, a, i, n, e[r + 15], 10, -30611744);
        n = md5_ii(n, o, a, i, e[r + 6], 15, -1560198380);
        i = md5_ii(i, n, o, a, e[r + 13], 21, 1309151649);
        a = md5_ii(a, i, n, o, e[r + 4], 6, -145523070);
        o = md5_ii(o, a, i, n, e[r + 11], 10, -1120210379);
        n = md5_ii(n, o, a, i, e[r + 2], 15, 718787259);
        i = md5_ii(i, n, o, a, e[r + 9], 21, -343485551);
        a = safe_add(a, s);
        i = safe_add(i, d);
        n = safe_add(n, l);
        o = safe_add(o, c)
    }
    return Array(a, i, n, o)
}

function md5_cmn(e, t, a, i, n, o) {
    return safe_add(bit_rol(safe_add(safe_add(t, e), safe_add(i, o)), n), a)
}

function md5_ff(e, t, a, i, n, o, r) {
    return md5_cmn(t & a | ~t & i, e, t, n, o, r)
}

function md5_gg(e, t, a, i, n, o, r) {
    return md5_cmn(t & i | a & ~i, e, t, n, o, r)
}

function md5_hh(e, t, a, i, n, o, r) {
    return md5_cmn(t ^ a ^ i, e, t, n, o, r)
}

function md5_ii(e, t, a, i, n, o, r) {
    return md5_cmn(a ^ (t | ~i), e, t, n, o, r)
}

function safe_add(e, t) {
    var a = (e & 65535) + (t & 65535);
    var i = (e >> 16) + (t >> 16) + (a >> 16);
    return i << 16 | a & 65535
}

function bit_rol(e, t) {
    return e << t | e >>> 32 - t
}

function md5cycle(e, t) {
    var a = e[0],
        i = e[1],
        n = e[2],
        o = e[3];
    a = ff(a, i, n, o, t[0], 7, -680876936);
    o = ff(o, a, i, n, t[1], 12, -389564586);
    n = ff(n, o, a, i, t[2], 17, 606105819);
    i = ff(i, n, o, a, t[3], 22, -1044525330);
    a = ff(a, i, n, o, t[4], 7, -176418897);
    o = ff(o, a, i, n, t[5], 12, 1200080426);
    n = ff(n, o, a, i, t[6], 17, -1473231341);
    i = ff(i, n, o, a, t[7], 22, -45705983);
    a = ff(a, i, n, o, t[8], 7, 1770035416);
    o = ff(o, a, i, n, t[9], 12, -1958414417);
    n = ff(n, o, a, i, t[10], 17, -42063);
    i = ff(i, n, o, a, t[11], 22, -1990404162);
    a = ff(a, i, n, o, t[12], 7, 1804603682);
    o = ff(o, a, i, n, t[13], 12, -40341101);
    n = ff(n, o, a, i, t[14], 17, -1502002290);
    i = ff(i, n, o, a, t[15], 22, 1236535329);
    a = gg(a, i, n, o, t[1], 5, -165796510);
    o = gg(o, a, i, n, t[6], 9, -1069501632);
    n = gg(n, o, a, i, t[11], 14, 643717713);
    i = gg(i, n, o, a, t[0], 20, -373897302);
    a = gg(a, i, n, o, t[5], 5, -701558691);
    o = gg(o, a, i, n, t[10], 9, 38016083);
    n = gg(n, o, a, i, t[15], 14, -660478335);
    i = gg(i, n, o, a, t[4], 20, -405537848);
    a = gg(a, i, n, o, t[9], 5, 568446438);
    o = gg(o, a, i, n, t[14], 9, -1019803690);
    n = gg(n, o, a, i, t[3], 14, -187363961);
    i = gg(i, n, o, a, t[8], 20, 1163531501);
    a = gg(a, i, n, o, t[13], 5, -1444681467);
    o = gg(o, a, i, n, t[2], 9, -51403784);
    n = gg(n, o, a, i, t[7], 14, 1735328473);
    i = gg(i, n, o, a, t[12], 20, -1926607734);
    a = hh(a, i, n, o, t[5], 4, -378558);
    o = hh(o, a, i, n, t[8], 11, -2022574463);
    n = hh(n, o, a, i, t[11], 16, 1839030562);
    i = hh(i, n, o, a, t[14], 23, -35309556);
    a = hh(a, i, n, o, t[1], 4, -1530992060);
    o = hh(o, a, i, n, t[4], 11, 1272893353);
    n = hh(n, o, a, i, t[7], 16, -155497632);
    i = hh(i, n, o, a, t[10], 23, -1094730640);
    a = hh(a, i, n, o, t[13], 4, 681279174);
    o = hh(o, a, i, n, t[0], 11, -358537222);
    n = hh(n, o, a, i, t[3], 16, -722521979);
    i = hh(i, n, o, a, t[6], 23, 76029189);
    a = hh(a, i, n, o, t[9], 4, -640364487);
    o = hh(o, a, i, n, t[12], 11, -421815835);
    n = hh(n, o, a, i, t[15], 16, 530742520);
    i = hh(i, n, o, a, t[2], 23, -995338651);
    a = ii(a, i, n, o, t[0], 6, -198630844);
    o = ii(o, a, i, n, t[7], 10, 1126891415);
    n = ii(n, o, a, i, t[14], 15, -1416354905);
    i = ii(i, n, o, a, t[5], 21, -57434055);
    a = ii(a, i, n, o, t[12], 6, 1700485571);
    o = ii(o, a, i, n, t[3], 10, -1894986606);
    n = ii(n, o, a, i, t[10], 15, -1051523);
    i = ii(i, n, o, a, t[1], 21, -2054922799);
    a = ii(a, i, n, o, t[8], 6, 1873313359);
    o = ii(o, a, i, n, t[15], 10, -30611744);
    n = ii(n, o, a, i, t[6], 15, -1560198380);
    i = ii(i, n, o, a, t[13], 21, 1309151649);
    a = ii(a, i, n, o, t[4], 6, -145523070);
    o = ii(o, a, i, n, t[11], 10, -1120210379);
    n = ii(n, o, a, i, t[2], 15, 718787259);
    i = ii(i, n, o, a, t[9], 21, -343485551);
    e[0] = add32(a, e[0]);
    e[1] = add32(i, e[1]);
    e[2] = add32(n, e[2]);
    e[3] = add32(o, e[3])
}

function cmn(e, t, a, i, n, o) {
    t = add32(add32(t, e), add32(i, o));
    return add32(t << n | t >>> 32 - n, a)
}

function ff(e, t, a, i, n, o, r) {
    return cmn(t & a | ~t & i, e, t, n, o, r)
}

function gg(e, t, a, i, n, o, r) {
    return cmn(t & i | a & ~i, e, t, n, o, r)
}

function hh(e, t, a, i, n, o, r) {
    return cmn(t ^ a ^ i, e, t, n, o, r)
}

function ii(e, t, a, i, n, o, r) {
    return cmn(a ^ (t | ~i), e, t, n, o, r)
}

function md51(e) {
    var t = "";
    var a = e.length,
        i = [1732584193, -271733879, -1732584194, 271733878],
        n;
    for (n = 64; n <= e.length; n += 64) {
        md5cycle(i, md5blk(e.substring(n - 64, n)))
    }
    e = e.substring(n - 64);
    var o = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (n = 0; n < e.length; n++) o[n >> 2] |= e.charCodeAt(n) << (n % 4 << 3);
    o[n >> 2] |= 128 << (n % 4 << 3);
    if (n > 55) {
        md5cycle(i, o);
        for (n = 0; n < 16; n++) o[n] = 0
    }
    o[14] = a * 8;
    md5cycle(i, o);
    return i
}

function md5blk(e) {
    var t = [],
        a;
    for (a = 0; a < 64; a += 4) {
        t[a >> 2] = e.charCodeAt(a) + (e.charCodeAt(a + 1) << 8) + (e.charCodeAt(a + 2) << 16) + (e.charCodeAt(a + 3) << 24)
    }
    return t
}
var hex_chr = "0123456789abcdef".split("");

function rhex(e) {
    var t = "",
        a = 0;
    for (; a < 4; a++) t += hex_chr[e >> a * 8 + 4 & 15] + hex_chr[e >> a * 8 & 15];
    return t
}

function hex(e) {
    for (var t = 0; t < e.length; t++) e[t] = rhex(e[t]);
    return e.join("")
}

function md5(e) {
    return hex(md51(e))
}

// 辅助函数
function md5_d(data) {
    return globalThis.CryptoJS.MD5(data).toString();
}

function add32(e, t) {
    return e + t & 4294967295
}
if (md5("hello") != "5d41402abc4b2a76b9719d911017c592") {
    function add32(e, t) {
        var a = (e & 65535) + (t & 65535),
            i = (e >> 16) + (t >> 16) + (a >> 16);
        return i << 16 | a & 65535
    }
}(function () {
    function e(e, t) {
        var a = e[0],
            i = e[1],
            n = e[2],
            o = e[3];
        a = r(a, i, n, o, t[0], 7, -680876936);
        o = r(o, a, i, n, t[1], 12, -389564586);
        n = r(n, o, a, i, t[2], 17, 606105819);
        i = r(i, n, o, a, t[3], 22, -1044525330);
        a = r(a, i, n, o, t[4], 7, -176418897);
        o = r(o, a, i, n, t[5], 12, 1200080426);
        n = r(n, o, a, i, t[6], 17, -1473231341);
        i = r(i, n, o, a, t[7], 22, -45705983);
        a = r(a, i, n, o, t[8], 7, 1770035416);
        o = r(o, a, i, n, t[9], 12, -1958414417);
        n = r(n, o, a, i, t[10], 17, -42063);
        i = r(i, n, o, a, t[11], 22, -1990404162);
        a = r(a, i, n, o, t[12], 7, 1804603682);
        o = r(o, a, i, n, t[13], 12, -40341101);
        n = r(n, o, a, i, t[14], 17, -1502002290);
        i = r(i, n, o, a, t[15], 22, 1236535329);
        a = d(a, i, n, o, t[1], 5, -165796510);
        o = d(o, a, i, n, t[6], 9, -1069501632);
        n = d(n, o, a, i, t[11], 14, 643717713);
        i = d(i, n, o, a, t[0], 20, -373897302);
        a = d(a, i, n, o, t[5], 5, -701558691);
        o = d(o, a, i, n, t[10], 9, 38016083);
        n = d(n, o, a, i, t[15], 14, -660478335);
        i = d(i, n, o, a, t[4], 20, -405537848);
        a = d(a, i, n, o, t[9], 5, 568446438);
        o = d(o, a, i, n, t[14], 9, -1019803690);
        n = d(n, o, a, i, t[3], 14, -187363961);
        i = d(i, n, o, a, t[8], 20, 1163531501);
        a = d(a, i, n, o, t[13], 5, -1444681467);
        o = d(o, a, i, n, t[2], 9, -51403784);
        n = d(n, o, a, i, t[7], 14, 1735328473);
        i = d(i, n, o, a, t[12], 20, -1926607734);
        a = l(a, i, n, o, t[5], 4, -378558);
        o = l(o, a, i, n, t[8], 11, -2022574463);
        n = l(n, o, a, i, t[11], 16, 1839030562);
        i = l(i, n, o, a, t[14], 23, -35309556);
        a = l(a, i, n, o, t[1], 4, -1530992060);
        o = l(o, a, i, n, t[4], 11, 1272893353);
        n = l(n, o, a, i, t[7], 16, -155497632);
        i = l(i, n, o, a, t[10], 23, -1094730640);
        a = l(a, i, n, o, t[13], 4, 681279174);
        o = l(o, a, i, n, t[0], 11, -358537222);
        n = l(n, o, a, i, t[3], 16, -722521979);
        i = l(i, n, o, a, t[6], 23, 76029189);
        a = l(a, i, n, o, t[9], 4, -640364487);
        o = l(o, a, i, n, t[12], 11, -421815835);
        n = l(n, o, a, i, t[15], 16, 530742520);
        i = l(i, n, o, a, t[2], 23, -995338651);
        a = c(a, i, n, o, t[0], 6, -198630844);
        o = c(o, a, i, n, t[7], 10, 1126891415);
        n = c(n, o, a, i, t[14], 15, -1416354905);
        i = c(i, n, o, a, t[5], 21, -57434055);
        a = c(a, i, n, o, t[12], 6, 1700485571);
        o = c(o, a, i, n, t[3], 10, -1894986606);
        n = c(n, o, a, i, t[10], 15, -1051523);
        i = c(i, n, o, a, t[1], 21, -2054922799);
        a = c(a, i, n, o, t[8], 6, 1873313359);
        o = c(o, a, i, n, t[15], 10, -30611744);
        n = c(n, o, a, i, t[6], 15, -1560198380);
        i = c(i, n, o, a, t[13], 21, 1309151649);
        a = c(a, i, n, o, t[4], 6, -145523070);
        o = c(o, a, i, n, t[11], 10, -1120210379);
        n = c(n, o, a, i, t[2], 15, 718787259);
        i = c(i, n, o, a, t[9], 21, -343485551);
        e[0] = g(a, e[0]);
        e[1] = g(i, e[1]);
        e[2] = g(n, e[2]);
        e[3] = g(o, e[3])
    }

    function s(e, t, a, i, n, o) {
        t = g(g(t, e), g(i, o));
        return g(t << n | t >>> 32 - n, a)
    }

    function r(e, t, a, i, n, o, r) {
        return s(t & a | ~t & i, e, t, n, o, r)
    }

    function d(e, t, a, i, n, o, r) {
        return s(t & i | a & ~i, e, t, n, o, r)
    }

    function l(e, t, a, i, n, o, r) {
        return s(t ^ a ^ i, e, t, n, o, r)
    }

    function c(e, t, a, i, n, o, r) {
        return s(a ^ (t | ~i), e, t, n, o, r)
    }

    function g(e, t) {
        return e + t & 4294967295
    }
    if (md5("hello") != "5d41402abc4b2a76b9719d911017c592") {
        function g(e, t) {
            var a = (e & 65535) + (t & 65535),
                i = (e >> 16) + (t >> 16) + (a >> 16);
            return i << 16 | a & 65535
        }
    }
})();

window.P8SDK = P8SDK;
window.P8LogSDK = P8LogSDK;


;
(function (root, factory) {
    // if (typeof exports === "object") {
    // 	// CommonJS
    // 	module.exports = exports = factory();
    // }
    // else if (typeof define === "function" && define.amd) {
    // 	// AMD
    // 	define([], factory);
    // }
    // else {
    // 	// Global (browser)
    // 	root.CryptoJS = factory();
    // }
    globalThis.CryptoJS = factory();
}(this, function () {

    /*globals window, global, require*/

    /**
     * CryptoJS core components.
     */
    var CryptoJS = CryptoJS || (function (Math, undefined) {

        var crypto;

        // Native crypto from window (Browser)
        if (typeof window !== 'undefined' && window.crypto) {
            crypto = window.crypto;
        }

        // Native crypto in web worker (Browser)
        if (typeof self !== 'undefined' && self.crypto) {
            crypto = self.crypto;
        }

        // Native crypto from worker
        if (typeof globalThis !== 'undefined' && globalThis.crypto) {
            crypto = globalThis.crypto;
        }

        // Native (experimental IE 11) crypto from window (Browser)
        if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
            crypto = window.msCrypto;
        }

        // Native crypto from global (NodeJS)
        if (!crypto && typeof global !== 'undefined' && global.crypto) {
            crypto = global.crypto;
        }

        // Native crypto import via require (NodeJS)
        if (!crypto && typeof require === 'function') {
            try {
                crypto = require('crypto');
            } catch (err) {}
        }

        /*
         * Cryptographically secure pseudorandom number generator
         *
         * As Math.random() is cryptographically not safe to use
         */
        var cryptoSecureRandomInt = function () {
            if (crypto) {
                // Use getRandomValues method (Browser)
                if (typeof crypto.getRandomValues === 'function') {
                    try {
                        return crypto.getRandomValues(new Uint32Array(1))[0];
                    } catch (err) {}
                }

                // Use randomBytes method (NodeJS)
                if (typeof crypto.randomBytes === 'function') {
                    try {
                        return crypto.randomBytes(4).readInt32LE();
                    } catch (err) {}
                }
            }

            throw new Error('Native crypto module could not be used to get secure random number.');
        };

        /*
         * Local polyfill of Object.create

         */
        var create = Object.create || (function () {
            function F() {}

            return function (obj) {
                var subtype;

                F.prototype = obj;

                subtype = new F();

                F.prototype = null;

                return subtype;
            };
        }());

        /**
         * CryptoJS namespace.
         */
        var C = {};

        /**
         * Library namespace.
         */
        var C_lib = C.lib = {};

        /**
         * Base object for prototypal inheritance.
         */
        var Base = C_lib.Base = (function () {


            return {
                /**
                 * Creates a new object that inherits from this object.
                 *
                 * @param {Object} overrides Properties to copy into the new object.
                 *
                 * @return {Object} The new object.
                 *
                 * @static
                 *
                 * @example
                 *
                 *     var MyType = CryptoJS.lib.Base.extend({
                 *         field: 'value',
                 *
                 *         method: function () {
                 *         }
                 *     });
                 */
                extend: function (overrides) {
                    // Spawn
                    var subtype = create(this);

                    // Augment
                    if (overrides) {
                        subtype.mixIn(overrides);
                    }

                    // Create default initializer
                    if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
                        subtype.init = function () {
                            subtype.$super.init.apply(this, arguments);
                        };
                    }

                    // Initializer's prototype is the subtype object
                    subtype.init.prototype = subtype;

                    // Reference supertype
                    subtype.$super = this;

                    return subtype;
                },

                /**
                 * Extends this object and runs the init method.
                 * Arguments to create() will be passed to init().
                 *
                 * @return {Object} The new object.
                 *
                 * @static
                 *
                 * @example
                 *
                 *     var instance = MyType.create();
                 */
                create: function () {
                    var instance = this.extend();
                    instance.init.apply(instance, arguments);

                    return instance;
                },

                /**
                 * Initializes a newly created object.
                 * Override this method to add some logic when your objects are created.
                 *
                 * @example
                 *
                 *     var MyType = CryptoJS.lib.Base.extend({
                 *         init: function () {
                 *             // ...
                 *         }
                 *     });
                 */
                init: function () {},

                /**
                 * Copies properties into this object.
                 *
                 * @param {Object} properties The properties to mix in.
                 *
                 * @example
                 *
                 *     MyType.mixIn({
                 *         field: 'value'
                 *     });
                 */
                mixIn: function (properties) {
                    for (var propertyName in properties) {
                        if (properties.hasOwnProperty(propertyName)) {
                            this[propertyName] = properties[propertyName];
                        }
                    }

                    // IE won't copy toString using the loop above
                    if (properties.hasOwnProperty('toString')) {
                        this.toString = properties.toString;
                    }
                },

                /**
                 * Creates a copy of this object.
                 *
                 * @return {Object} The clone.
                 *
                 * @example
                 *
                 *     var clone = instance.clone();
                 */
                clone: function () {
                    return this.init.prototype.extend(this);
                }
            };
        }());

        /**
         * An array of 32-bit words.
         *
         * @property {Array} words The array of 32-bit words.
         * @property {number} sigBytes The number of significant bytes in this word array.
         */
        var WordArray = C_lib.WordArray = Base.extend({
            /**
             * Initializes a newly created word array.
             *
             * @param {Array} words (Optional) An array of 32-bit words.
             * @param {number} sigBytes (Optional) The number of significant bytes in the words.
             *
             * @example
             *
             *     var wordArray = CryptoJS.lib.WordArray.create();
             *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
             *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
             */
            init: function (words, sigBytes) {
                words = this.words = words || [];

                if (sigBytes != undefined) {
                    this.sigBytes = sigBytes;
                } else {
                    this.sigBytes = words.length * 4;
                }
            },

            /**
             * Converts this word array to a string.
             *
             * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
             *
             * @return {string} The stringified word array.
             *
             * @example
             *
             *     var string = wordArray + '';
             *     var string = wordArray.toString();
             *     var string = wordArray.toString(CryptoJS.enc.Utf8);
             */
            toString: function (encoder) {
                return (encoder || Hex).stringify(this);
            },

            /**
             * Concatenates a word array to this word array.
             *
             * @param {WordArray} wordArray The word array to append.
             *
             * @return {WordArray} This word array.
             *
             * @example
             *
             *     wordArray1.concat(wordArray2);
             */
            concat: function (wordArray) {
                // Shortcuts
                var thisWords = this.words;
                var thatWords = wordArray.words;
                var thisSigBytes = this.sigBytes;
                var thatSigBytes = wordArray.sigBytes;

                // Clamp excess bits
                this.clamp();

                // Concat
                if (thisSigBytes % 4) {
                    // Copy one byte at a time
                    for (var i = 0; i < thatSigBytes; i++) {
                        var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                        thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                    }
                } else {
                    // Copy one word at a time
                    for (var j = 0; j < thatSigBytes; j += 4) {
                        thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
                    }
                }
                this.sigBytes += thatSigBytes;

                // Chainable
                return this;
            },

            /**
             * Removes insignificant bits.
             *
             * @example
             *
             *     wordArray.clamp();
             */
            clamp: function () {
                // Shortcuts
                var words = this.words;
                var sigBytes = this.sigBytes;

                // Clamp
                words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
                words.length = Math.ceil(sigBytes / 4);
            },

            /**
             * Creates a copy of this word array.
             *
             * @return {WordArray} The clone.
             *
             * @example
             *
             *     var clone = wordArray.clone();
             */
            clone: function () {
                var clone = Base.clone.call(this);
                clone.words = this.words.slice(0);

                return clone;
            },

            /**
             * Creates a word array filled with random bytes.
             *
             * @param {number} nBytes The number of random bytes to generate.
             *
             * @return {WordArray} The random word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.lib.WordArray.random(16);
             */
            random: function (nBytes) {
                var words = [];

                for (var i = 0; i < nBytes; i += 4) {
                    words.push(cryptoSecureRandomInt());
                }

                return new WordArray.init(words, nBytes);
            }
        });

        /**
         * Encoder namespace.
         */
        var C_enc = C.enc = {};

        /**
         * Hex encoding strategy.
         */
        var Hex = C_enc.Hex = {
            /**
             * Converts a word array to a hex string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The hex string.
             *
             * @static
             *
             * @example
             *
             *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
             */
            stringify: function (wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;

                // Convert
                var hexChars = [];
                for (var i = 0; i < sigBytes; i++) {
                    var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    hexChars.push((bite >>> 4).toString(16));
                    hexChars.push((bite & 0x0f).toString(16));
                }

                return hexChars.join('');
            },

            /**
             * Converts a hex string to a word array.
             *
             * @param {string} hexStr The hex string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
             */
            parse: function (hexStr) {
                // Shortcut
                var hexStrLength = hexStr.length;

                // Convert
                var words = [];
                for (var i = 0; i < hexStrLength; i += 2) {
                    words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
                }

                return new WordArray.init(words, hexStrLength / 2);
            }
        };

        /**
         * Latin1 encoding strategy.
         */
        var Latin1 = C_enc.Latin1 = {
            /**
             * Converts a word array to a Latin1 string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The Latin1 string.
             *
             * @static
             *
             * @example
             *
             *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
             */
            stringify: function (wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;

                // Convert
                var latin1Chars = [];
                for (var i = 0; i < sigBytes; i++) {
                    var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    latin1Chars.push(String.fromCharCode(bite));
                }

                return latin1Chars.join('');
            },

            /**
             * Converts a Latin1 string to a word array.
             *
             * @param {string} latin1Str The Latin1 string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
             */
            parse: function (latin1Str) {
                // Shortcut
                var latin1StrLength = latin1Str.length;

                // Convert
                var words = [];
                for (var i = 0; i < latin1StrLength; i++) {
                    words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
                }

                return new WordArray.init(words, latin1StrLength);
            }
        };

        /**
         * UTF-8 encoding strategy.
         */
        var Utf8 = C_enc.Utf8 = {
            /**
             * Converts a word array to a UTF-8 string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The UTF-8 string.
             *
             * @static
             *
             * @example
             *
             *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
             */
            stringify: function (wordArray) {
                try {
                    return decodeURIComponent(escape(Latin1.stringify(wordArray)));
                } catch (e) {
                    throw new Error('Malformed UTF-8 data');
                }
            },

            /**
             * Converts a UTF-8 string to a word array.
             *
             * @param {string} utf8Str The UTF-8 string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
             */
            parse: function (utf8Str) {
                return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
            }
        };

        /**
         * Abstract buffered block algorithm template.
         *
         * The property blockSize must be implemented in a concrete subtype.
         *
         * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
         */
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
            /**
             * Resets this block algorithm's data buffer to its initial state.
             *
             * @example
             *
             *     bufferedBlockAlgorithm.reset();
             */
            reset: function () {
                // Initial values
                this._data = new WordArray.init();
                this._nDataBytes = 0;
            },

            /**
             * Adds new data to this block algorithm's buffer.
             *
             * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
             *
             * @example
             *
             *     bufferedBlockAlgorithm._append('data');
             *     bufferedBlockAlgorithm._append(wordArray);
             */
            _append: function (data) {
                // Convert string to WordArray, else assume WordArray already
                if (typeof data == 'string') {
                    data = Utf8.parse(data);
                }

                // Append
                this._data.concat(data);
                this._nDataBytes += data.sigBytes;
            },

            /**
             * Processes available data blocks.
             *
             * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
             *
             * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
             *
             * @return {WordArray} The processed data.
             *
             * @example
             *
             *     var processedData = bufferedBlockAlgorithm._process();
             *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
             */
            _process: function (doFlush) {
                var processedWords;

                // Shortcuts
                var data = this._data;
                var dataWords = data.words;
                var dataSigBytes = data.sigBytes;
                var blockSize = this.blockSize;
                var blockSizeBytes = blockSize * 4;

                // Count blocks ready
                var nBlocksReady = dataSigBytes / blockSizeBytes;
                if (doFlush) {
                    // Round up to include partial blocks
                    nBlocksReady = Math.ceil(nBlocksReady);
                } else {
                    // Round down to include only full blocks,
                    // less the number of blocks that must remain in the buffer
                    nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
                }

                // Count words ready
                var nWordsReady = nBlocksReady * blockSize;

                // Count bytes ready
                var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

                // Process blocks
                if (nWordsReady) {
                    for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                        // Perform concrete-algorithm logic
                        this._doProcessBlock(dataWords, offset);
                    }

                    // Remove processed words
                    processedWords = dataWords.splice(0, nWordsReady);
                    data.sigBytes -= nBytesReady;
                }

                // Return processed words
                return new WordArray.init(processedWords, nBytesReady);
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = bufferedBlockAlgorithm.clone();
             */
            clone: function () {
                var clone = Base.clone.call(this);
                clone._data = this._data.clone();

                return clone;
            },

            _minBufferSize: 0
        });

        /**
         * Abstract hasher template.
         *
         * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
         */
        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
            /**
             * Configuration options.
             */
            cfg: Base.extend(),

            /**
             * Initializes a newly created hasher.
             *
             * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
             *
             * @example
             *
             *     var hasher = CryptoJS.algo.SHA256.create();
             */
            init: function (cfg) {
                // Apply config defaults
                this.cfg = this.cfg.extend(cfg);

                // Set initial values
                this.reset();
            },

            /**
             * Resets this hasher to its initial state.
             *
             * @example
             *
             *     hasher.reset();
             */
            reset: function () {
                // Reset data buffer
                BufferedBlockAlgorithm.reset.call(this);

                // Perform concrete-hasher logic
                this._doReset();
            },

            /**
             * Updates this hasher with a message.
             *
             * @param {WordArray|string} messageUpdate The message to append.
             *
             * @return {Hasher} This hasher.
             *
             * @example
             *
             *     hasher.update('message');
             *     hasher.update(wordArray);
             */
            update: function (messageUpdate) {
                // Append
                this._append(messageUpdate);

                // Update the hash
                this._process();

                // Chainable
                return this;
            },

            /**
             * Finalizes the hash computation.
             * Note that the finalize operation is effectively a destructive, read-once operation.
             *
             * @param {WordArray|string} messageUpdate (Optional) A final message update.
             *
             * @return {WordArray} The hash.
             *
             * @example
             *
             *     var hash = hasher.finalize();
             *     var hash = hasher.finalize('message');
             *     var hash = hasher.finalize(wordArray);
             */
            finalize: function (messageUpdate) {
                // Final message update
                if (messageUpdate) {
                    this._append(messageUpdate);
                }

                // Perform concrete-hasher logic
                var hash = this._doFinalize();

                return hash;
            },

            blockSize: 512 / 32,

            /**
             * Creates a shortcut function to a hasher's object interface.
             *
             * @param {Hasher} hasher The hasher to create a helper for.
             *
             * @return {Function} The shortcut function.
             *
             * @static
             *
             * @example
             *
             *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
             */
            _createHelper: function (hasher) {
                return function (message, cfg) {
                    return new hasher.init(cfg).finalize(message);
                };
            },

            /**
             * Creates a shortcut function to the HMAC's object interface.
             *
             * @param {Hasher} hasher The hasher to use in this HMAC helper.
             *
             * @return {Function} The shortcut function.
             *
             * @static
             *
             * @example
             *
             *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
             */
            _createHmacHelper: function (hasher) {
                return function (message, key) {
                    return new C_algo.HMAC.init(hasher, key).finalize(message);
                };
            }
        });

        /**
         * Algorithm namespace.
         */
        var C_algo = C.algo = {};

        return C;
    }(Math));


    (function (undefined) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var X32WordArray = C_lib.WordArray;

        /**
         * x64 namespace.
         */
        var C_x64 = C.x64 = {};

        /**
         * A 64-bit word.
         */
        var X64Word = C_x64.Word = Base.extend({
            /**
             * Initializes a newly created 64-bit word.
             *
             * @param {number} high The high 32 bits.
             * @param {number} low The low 32 bits.
             *
             * @example
             *
             *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
             */
            init: function (high, low) {
                this.high = high;
                this.low = low;
            }

            /**
             * Bitwise NOTs this word.
             *
             * @return {X64Word} A new x64-Word object after negating.
             *
             * @example
             *
             *     var negated = x64Word.not();
             */
            // not: function () {
            // var high = ~this.high;
            // var low = ~this.low;

            // return X64Word.create(high, low);
            // },

            /**
             * Bitwise ANDs this word with the passed word.
             *
             * @param {X64Word} word The x64-Word to AND with this word.
             *
             * @return {X64Word} A new x64-Word object after ANDing.
             *
             * @example
             *
             *     var anded = x64Word.and(anotherX64Word);
             */
            // and: function (word) {
            // var high = this.high & word.high;
            // var low = this.low & word.low;

            // return X64Word.create(high, low);
            // },

            /**
             * Bitwise ORs this word with the passed word.
             *
             * @param {X64Word} word The x64-Word to OR with this word.
             *
             * @return {X64Word} A new x64-Word object after ORing.
             *
             * @example
             *
             *     var ored = x64Word.or(anotherX64Word);
             */
            // or: function (word) {
            // var high = this.high | word.high;
            // var low = this.low | word.low;

            // return X64Word.create(high, low);
            // },

            /**
             * Bitwise XORs this word with the passed word.
             *
             * @param {X64Word} word The x64-Word to XOR with this word.
             *
             * @return {X64Word} A new x64-Word object after XORing.
             *
             * @example
             *
             *     var xored = x64Word.xor(anotherX64Word);
             */
            // xor: function (word) {
            // var high = this.high ^ word.high;
            // var low = this.low ^ word.low;

            // return X64Word.create(high, low);
            // },

            /**
             * Shifts this word n bits to the left.
             *
             * @param {number} n The number of bits to shift.
             *
             * @return {X64Word} A new x64-Word object after shifting.
             *
             * @example
             *
             *     var shifted = x64Word.shiftL(25);
             */
            // shiftL: function (n) {
            // if (n < 32) {
            // var high = (this.high << n) | (this.low >>> (32 - n));
            // var low = this.low << n;
            // } else {
            // var high = this.low << (n - 32);
            // var low = 0;
            // }

            // return X64Word.create(high, low);
            // },

            /**
             * Shifts this word n bits to the right.
             *
             * @param {number} n The number of bits to shift.
             *
             * @return {X64Word} A new x64-Word object after shifting.
             *
             * @example
             *
             *     var shifted = x64Word.shiftR(7);
             */
            // shiftR: function (n) {
            // if (n < 32) {
            // var low = (this.low >>> n) | (this.high << (32 - n));
            // var high = this.high >>> n;
            // } else {
            // var low = this.high >>> (n - 32);
            // var high = 0;
            // }

            // return X64Word.create(high, low);
            // },

            /**
             * Rotates this word n bits to the left.
             *
             * @param {number} n The number of bits to rotate.
             *
             * @return {X64Word} A new x64-Word object after rotating.
             *
             * @example
             *
             *     var rotated = x64Word.rotL(25);
             */
            // rotL: function (n) {
            // return this.shiftL(n).or(this.shiftR(64 - n));
            // },

            /**
             * Rotates this word n bits to the right.
             *
             * @param {number} n The number of bits to rotate.
             *
             * @return {X64Word} A new x64-Word object after rotating.
             *
             * @example
             *
             *     var rotated = x64Word.rotR(7);
             */
            // rotR: function (n) {
            // return this.shiftR(n).or(this.shiftL(64 - n));
            // },

            /**
             * Adds this word with the passed word.
             *
             * @param {X64Word} word The x64-Word to add with this word.
             *
             * @return {X64Word} A new x64-Word object after adding.
             *
             * @example
             *
             *     var added = x64Word.add(anotherX64Word);
             */
            // add: function (word) {
            // var low = (this.low + word.low) | 0;
            // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
            // var high = (this.high + word.high + carry) | 0;

            // return X64Word.create(high, low);
            // }
        });

        /**
         * An array of 64-bit words.
         *
         * @property {Array} words The array of CryptoJS.x64.Word objects.
         * @property {number} sigBytes The number of significant bytes in this word array.
         */
        var X64WordArray = C_x64.WordArray = Base.extend({
            /**
             * Initializes a newly created word array.
             *
             * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
             * @param {number} sigBytes (Optional) The number of significant bytes in the words.
             *
             * @example
             *
             *     var wordArray = CryptoJS.x64.WordArray.create();
             *
             *     var wordArray = CryptoJS.x64.WordArray.create([
             *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
             *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
             *     ]);
             *
             *     var wordArray = CryptoJS.x64.WordArray.create([
             *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
             *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
             *     ], 10);
             */
            init: function (words, sigBytes) {
                words = this.words = words || [];

                if (sigBytes != undefined) {
                    this.sigBytes = sigBytes;
                } else {
                    this.sigBytes = words.length * 8;
                }
            },

            /**
             * Converts this 64-bit word array to a 32-bit word array.
             *
             * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
             *
             * @example
             *
             *     var x32WordArray = x64WordArray.toX32();
             */
            toX32: function () {
                // Shortcuts
                var x64Words = this.words;
                var x64WordsLength = x64Words.length;

                // Convert
                var x32Words = [];
                for (var i = 0; i < x64WordsLength; i++) {
                    var x64Word = x64Words[i];
                    x32Words.push(x64Word.high);
                    x32Words.push(x64Word.low);
                }

                return X32WordArray.create(x32Words, this.sigBytes);
            },

            /**
             * Creates a copy of this word array.
             *
             * @return {X64WordArray} The clone.
             *
             * @example
             *
             *     var clone = x64WordArray.clone();
             */
            clone: function () {
                var clone = Base.clone.call(this);

                // Clone "words" array
                var words = clone.words = this.words.slice(0);

                // Clone each X64Word object
                var wordsLength = words.length;
                for (var i = 0; i < wordsLength; i++) {
                    words[i] = words[i].clone();
                }

                return clone;
            }
        });
    }());


    (function () {
        // Check if typed arrays are supported
        if (typeof ArrayBuffer != 'function') {
            return;
        }

        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;

        // Reference original init
        var superInit = WordArray.init;

        // Augment WordArray.init to handle typed arrays
        var subInit = WordArray.init = function (typedArray) {
            // Convert buffers to uint8
            if (typedArray instanceof ArrayBuffer) {
                typedArray = new Uint8Array(typedArray);
            }

            // Convert other array views to uint8
            if (
                typedArray instanceof Int8Array ||
                (typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray) ||
                typedArray instanceof Int16Array ||
                typedArray instanceof Uint16Array ||
                typedArray instanceof Int32Array ||
                typedArray instanceof Uint32Array ||
                typedArray instanceof Float32Array ||
                typedArray instanceof Float64Array
            ) {
                typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
            }

            // Handle Uint8Array
            if (typedArray instanceof Uint8Array) {
                // Shortcut
                var typedArrayByteLength = typedArray.byteLength;

                // Extract bytes
                var words = [];
                for (var i = 0; i < typedArrayByteLength; i++) {
                    words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
                }

                // Initialize this word array
                superInit.call(this, words, typedArrayByteLength);
            } else {
                // Else call normal init
                superInit.apply(this, arguments);
            }
        };

        subInit.prototype = WordArray;
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;

        /**
         * UTF-16 BE encoding strategy.
         */
        var Utf16BE = C_enc.Utf16 = C_enc.Utf16BE = {
            /**
             * Converts a word array to a UTF-16 BE string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The UTF-16 BE string.
             *
             * @static
             *
             * @example
             *
             *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
             */
            stringify: function (wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;

                // Convert
                var utf16Chars = [];
                for (var i = 0; i < sigBytes; i += 2) {
                    var codePoint = (words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff;
                    utf16Chars.push(String.fromCharCode(codePoint));
                }

                return utf16Chars.join('');
            },

            /**
             * Converts a UTF-16 BE string to a word array.
             *
             * @param {string} utf16Str The UTF-16 BE string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
             */
            parse: function (utf16Str) {
                // Shortcut
                var utf16StrLength = utf16Str.length;

                // Convert
                var words = [];
                for (var i = 0; i < utf16StrLength; i++) {
                    words[i >>> 1] |= utf16Str.charCodeAt(i) << (16 - (i % 2) * 16);
                }

                return WordArray.create(words, utf16StrLength * 2);
            }
        };

        /**
         * UTF-16 LE encoding strategy.
         */
        C_enc.Utf16LE = {
            /**
             * Converts a word array to a UTF-16 LE string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The UTF-16 LE string.
             *
             * @static
             *
             * @example
             *
             *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
             */
            stringify: function (wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;

                // Convert
                var utf16Chars = [];
                for (var i = 0; i < sigBytes; i += 2) {
                    var codePoint = swapEndian((words[i >>> 2] >>> (16 - (i % 4) * 8)) & 0xffff);
                    utf16Chars.push(String.fromCharCode(codePoint));
                }

                return utf16Chars.join('');
            },

            /**
             * Converts a UTF-16 LE string to a word array.
             *
             * @param {string} utf16Str The UTF-16 LE string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
             */
            parse: function (utf16Str) {
                // Shortcut
                var utf16StrLength = utf16Str.length;

                // Convert
                var words = [];
                for (var i = 0; i < utf16StrLength; i++) {
                    words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << (16 - (i % 2) * 16));
                }

                return WordArray.create(words, utf16StrLength * 2);
            }
        };

        function swapEndian(word) {
            return ((word << 8) & 0xff00ff00) | ((word >>> 8) & 0x00ff00ff);
        }
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;

        /**
         * Base64 encoding strategy.
         */
        var Base64 = C_enc.Base64 = {
            /**
             * Converts a word array to a Base64 string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @return {string} The Base64 string.
             *
             * @static
             *
             * @example
             *
             *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
             */
            stringify: function (wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;
                var map = this._map;

                // Clamp excess bits
                wordArray.clamp();

                // Convert
                var base64Chars = [];
                for (var i = 0; i < sigBytes; i += 3) {
                    var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                    var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                    var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                    for (var j = 0;
                        (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                        base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                    }
                }

                // Add padding
                var paddingChar = map.charAt(64);
                if (paddingChar) {
                    while (base64Chars.length % 4) {
                        base64Chars.push(paddingChar);
                    }
                }

                return base64Chars.join('');
            },

            /**
             * Converts a Base64 string to a word array.
             *
             * @param {string} base64Str The Base64 string.
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
             */
            parse: function (base64Str) {
                // Shortcuts
                var base64StrLength = base64Str.length;
                var map = this._map;
                var reverseMap = this._reverseMap;

                if (!reverseMap) {
                    reverseMap = this._reverseMap = [];
                    for (var j = 0; j < map.length; j++) {
                        reverseMap[map.charCodeAt(j)] = j;
                    }
                }

                // Ignore padding
                var paddingChar = map.charAt(64);
                if (paddingChar) {
                    var paddingIndex = base64Str.indexOf(paddingChar);
                    if (paddingIndex !== -1) {
                        base64StrLength = paddingIndex;
                    }
                }

                // Convert
                return parseLoop(base64Str, base64StrLength, reverseMap);

            },

            _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        };

        function parseLoop(base64Str, base64StrLength, reverseMap) {
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
                    var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
                    var bitsCombined = bits1 | bits2;
                    words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }
            return WordArray.create(words, nBytes);
        }
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;

        /**
         * Base64url encoding strategy.
         */
        var Base64url = C_enc.Base64url = {
            /**
             * Converts a word array to a Base64url string.
             *
             * @param {WordArray} wordArray The word array.
             *
             * @param {boolean} urlSafe Whether to use url safe
             *
             * @return {string} The Base64url string.
             *
             * @static
             *
             * @example
             *
             *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
             */
            stringify: function (wordArray, urlSafe) {
                if (urlSafe === undefined) {
                    urlSafe = true
                }
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;
                var map = urlSafe ? this._safe_map : this._map;

                // Clamp excess bits
                wordArray.clamp();

                // Convert
                var base64Chars = [];
                for (var i = 0; i < sigBytes; i += 3) {
                    var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                    var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                    var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                    for (var j = 0;
                        (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                        base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                    }
                }

                // Add padding
                var paddingChar = map.charAt(64);
                if (paddingChar) {
                    while (base64Chars.length % 4) {
                        base64Chars.push(paddingChar);
                    }
                }

                return base64Chars.join('');
            },

            /**
             * Converts a Base64url string to a word array.
             *
             * @param {string} base64Str The Base64url string.
             *
             * @param {boolean} urlSafe Whether to use url safe
             *
             * @return {WordArray} The word array.
             *
             * @static
             *
             * @example
             *
             *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
             */
            parse: function (base64Str, urlSafe) {
                if (urlSafe === undefined) {
                    urlSafe = true
                }

                // Shortcuts
                var base64StrLength = base64Str.length;
                var map = urlSafe ? this._safe_map : this._map;
                var reverseMap = this._reverseMap;

                if (!reverseMap) {
                    reverseMap = this._reverseMap = [];
                    for (var j = 0; j < map.length; j++) {
                        reverseMap[map.charCodeAt(j)] = j;
                    }
                }

                // Ignore padding
                var paddingChar = map.charAt(64);
                if (paddingChar) {
                    var paddingIndex = base64Str.indexOf(paddingChar);
                    if (paddingIndex !== -1) {
                        base64StrLength = paddingIndex;
                    }
                }

                // Convert
                return parseLoop(base64Str, base64StrLength, reverseMap);

            },

            _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
            _safe_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
        };

        function parseLoop(base64Str, base64StrLength, reverseMap) {
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
                    var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
                    var bitsCombined = bits1 | bits2;
                    words[nBytes >>> 2] |= bitsCombined << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }
            return WordArray.create(words, nBytes);
        }
    }());


    (function (Math) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;

        // Constants table
        var T = [];

        // Compute constants
        (function () {
            for (var i = 0; i < 64; i++) {
                T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
            }
        }());

        /**
         * MD5 hash algorithm.
         */
        var MD5 = C_algo.MD5 = Hasher.extend({
            _doReset: function () {
                this._hash = new WordArray.init([
                    0x67452301, 0xefcdab89,
                    0x98badcfe, 0x10325476
                ]);
            },

            _doProcessBlock: function (M, offset) {
                // Swap endian
                for (var i = 0; i < 16; i++) {
                    // Shortcuts
                    var offset_i = offset + i;
                    var M_offset_i = M[offset_i];

                    M[offset_i] = (
                        (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
                        (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
                    );
                }

                // Shortcuts
                var H = this._hash.words;

                var M_offset_0 = M[offset + 0];
                var M_offset_1 = M[offset + 1];
                var M_offset_2 = M[offset + 2];
                var M_offset_3 = M[offset + 3];
                var M_offset_4 = M[offset + 4];
                var M_offset_5 = M[offset + 5];
                var M_offset_6 = M[offset + 6];
                var M_offset_7 = M[offset + 7];
                var M_offset_8 = M[offset + 8];
                var M_offset_9 = M[offset + 9];
                var M_offset_10 = M[offset + 10];
                var M_offset_11 = M[offset + 11];
                var M_offset_12 = M[offset + 12];
                var M_offset_13 = M[offset + 13];
                var M_offset_14 = M[offset + 14];
                var M_offset_15 = M[offset + 15];

                // Working variables
                var a = H[0];
                var b = H[1];
                var c = H[2];
                var d = H[3];

                // Computation
                a = FF(a, b, c, d, M_offset_0, 7, T[0]);
                d = FF(d, a, b, c, M_offset_1, 12, T[1]);
                c = FF(c, d, a, b, M_offset_2, 17, T[2]);
                b = FF(b, c, d, a, M_offset_3, 22, T[3]);
                a = FF(a, b, c, d, M_offset_4, 7, T[4]);
                d = FF(d, a, b, c, M_offset_5, 12, T[5]);
                c = FF(c, d, a, b, M_offset_6, 17, T[6]);
                b = FF(b, c, d, a, M_offset_7, 22, T[7]);
                a = FF(a, b, c, d, M_offset_8, 7, T[8]);
                d = FF(d, a, b, c, M_offset_9, 12, T[9]);
                c = FF(c, d, a, b, M_offset_10, 17, T[10]);
                b = FF(b, c, d, a, M_offset_11, 22, T[11]);
                a = FF(a, b, c, d, M_offset_12, 7, T[12]);
                d = FF(d, a, b, c, M_offset_13, 12, T[13]);
                c = FF(c, d, a, b, M_offset_14, 17, T[14]);
                b = FF(b, c, d, a, M_offset_15, 22, T[15]);

                a = GG(a, b, c, d, M_offset_1, 5, T[16]);
                d = GG(d, a, b, c, M_offset_6, 9, T[17]);
                c = GG(c, d, a, b, M_offset_11, 14, T[18]);
                b = GG(b, c, d, a, M_offset_0, 20, T[19]);
                a = GG(a, b, c, d, M_offset_5, 5, T[20]);
                d = GG(d, a, b, c, M_offset_10, 9, T[21]);
                c = GG(c, d, a, b, M_offset_15, 14, T[22]);
                b = GG(b, c, d, a, M_offset_4, 20, T[23]);
                a = GG(a, b, c, d, M_offset_9, 5, T[24]);
                d = GG(d, a, b, c, M_offset_14, 9, T[25]);
                c = GG(c, d, a, b, M_offset_3, 14, T[26]);
                b = GG(b, c, d, a, M_offset_8, 20, T[27]);
                a = GG(a, b, c, d, M_offset_13, 5, T[28]);
                d = GG(d, a, b, c, M_offset_2, 9, T[29]);
                c = GG(c, d, a, b, M_offset_7, 14, T[30]);
                b = GG(b, c, d, a, M_offset_12, 20, T[31]);

                a = HH(a, b, c, d, M_offset_5, 4, T[32]);
                d = HH(d, a, b, c, M_offset_8, 11, T[33]);
                c = HH(c, d, a, b, M_offset_11, 16, T[34]);
                b = HH(b, c, d, a, M_offset_14, 23, T[35]);
                a = HH(a, b, c, d, M_offset_1, 4, T[36]);
                d = HH(d, a, b, c, M_offset_4, 11, T[37]);
                c = HH(c, d, a, b, M_offset_7, 16, T[38]);
                b = HH(b, c, d, a, M_offset_10, 23, T[39]);
                a = HH(a, b, c, d, M_offset_13, 4, T[40]);
                d = HH(d, a, b, c, M_offset_0, 11, T[41]);
                c = HH(c, d, a, b, M_offset_3, 16, T[42]);
                b = HH(b, c, d, a, M_offset_6, 23, T[43]);
                a = HH(a, b, c, d, M_offset_9, 4, T[44]);
                d = HH(d, a, b, c, M_offset_12, 11, T[45]);
                c = HH(c, d, a, b, M_offset_15, 16, T[46]);
                b = HH(b, c, d, a, M_offset_2, 23, T[47]);

                a = II(a, b, c, d, M_offset_0, 6, T[48]);
                d = II(d, a, b, c, M_offset_7, 10, T[49]);
                c = II(c, d, a, b, M_offset_14, 15, T[50]);
                b = II(b, c, d, a, M_offset_5, 21, T[51]);
                a = II(a, b, c, d, M_offset_12, 6, T[52]);
                d = II(d, a, b, c, M_offset_3, 10, T[53]);
                c = II(c, d, a, b, M_offset_10, 15, T[54]);
                b = II(b, c, d, a, M_offset_1, 21, T[55]);
                a = II(a, b, c, d, M_offset_8, 6, T[56]);
                d = II(d, a, b, c, M_offset_15, 10, T[57]);
                c = II(c, d, a, b, M_offset_6, 15, T[58]);
                b = II(b, c, d, a, M_offset_13, 21, T[59]);
                a = II(a, b, c, d, M_offset_4, 6, T[60]);
                d = II(d, a, b, c, M_offset_11, 10, T[61]);
                c = II(c, d, a, b, M_offset_2, 15, T[62]);
                b = II(b, c, d, a, M_offset_9, 21, T[63]);

                // Intermediate hash value
                H[0] = (H[0] + a) | 0;
                H[1] = (H[1] + b) | 0;
                H[2] = (H[2] + c) | 0;
                H[3] = (H[3] + d) | 0;
            },

            _doFinalize: function () {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;

                var nBitsTotal = this._nDataBytes * 8;
                var nBitsLeft = data.sigBytes * 8;

                // Add padding
                dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

                var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
                var nBitsTotalL = nBitsTotal;
                dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
                    (((nBitsTotalH << 8) | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
                    (((nBitsTotalH << 24) | (nBitsTotalH >>> 8)) & 0xff00ff00)
                );
                dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
                    (((nBitsTotalL << 8) | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
                    (((nBitsTotalL << 24) | (nBitsTotalL >>> 8)) & 0xff00ff00)
                );

                data.sigBytes = (dataWords.length + 1) * 4;

                // Hash final blocks
                this._process();

                // Shortcuts
                var hash = this._hash;
                var H = hash.words;

                // Swap endian
                for (var i = 0; i < 4; i++) {
                    // Shortcut
                    var H_i = H[i];

                    H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
                        (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
                }

                // Return final computed hash
                return hash;
            },

            clone: function () {
                var clone = Hasher.clone.call(this);
                clone._hash = this._hash.clone();

                return clone;
            }
        });

        function FF(a, b, c, d, x, s, t) {
            var n = a + ((b & c) | (~b & d)) + x + t;
            return ((n << s) | (n >>> (32 - s))) + b;
        }

        function GG(a, b, c, d, x, s, t) {
            var n = a + ((b & d) | (c & ~d)) + x + t;
            return ((n << s) | (n >>> (32 - s))) + b;
        }

        function HH(a, b, c, d, x, s, t) {
            var n = a + (b ^ c ^ d) + x + t;
            return ((n << s) | (n >>> (32 - s))) + b;
        }

        function II(a, b, c, d, x, s, t) {
            var n = a + (c ^ (b | ~d)) + x + t;
            return ((n << s) | (n >>> (32 - s))) + b;
        }

        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.MD5('message');
         *     var hash = CryptoJS.MD5(wordArray);
         */
        C.MD5 = Hasher._createHelper(MD5);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacMD5(message, key);
         */
        C.HmacMD5 = Hasher._createHmacHelper(MD5);
    }(Math));


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;

        // Reusable object
        var W = [];

        /**
         * SHA-1 hash algorithm.
         */
        var SHA1 = C_algo.SHA1 = Hasher.extend({
            _doReset: function () {
                this._hash = new WordArray.init([
                    0x67452301, 0xefcdab89,
                    0x98badcfe, 0x10325476,
                    0xc3d2e1f0
                ]);
            },

            _doProcessBlock: function (M, offset) {
                // Shortcut
                var H = this._hash.words;

                // Working variables
                var a = H[0];
                var b = H[1];
                var c = H[2];
                var d = H[3];
                var e = H[4];

                // Computation
                for (var i = 0; i < 80; i++) {
                    if (i < 16) {
                        W[i] = M[offset + i] | 0;
                    } else {
                        var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                        W[i] = (n << 1) | (n >>> 31);
                    }

                    var t = ((a << 5) | (a >>> 27)) + e + W[i];
                    if (i < 20) {
                        t += ((b & c) | (~b & d)) + 0x5a827999;
                    } else if (i < 40) {
                        t += (b ^ c ^ d) + 0x6ed9eba1;
                    } else if (i < 60) {
                        t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
                    } else /* if (i < 80) */ {
                        t += (b ^ c ^ d) - 0x359d3e2a;
                    }

                    e = d;
                    d = c;
                    c = (b << 30) | (b >>> 2);
                    b = a;
                    a = t;
                }

                // Intermediate hash value
                H[0] = (H[0] + a) | 0;
                H[1] = (H[1] + b) | 0;
                H[2] = (H[2] + c) | 0;
                H[3] = (H[3] + d) | 0;
                H[4] = (H[4] + e) | 0;
            },

            _doFinalize: function () {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;

                var nBitsTotal = this._nDataBytes * 8;
                var nBitsLeft = data.sigBytes * 8;

                // Add padding
                dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
                dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
                dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
                data.sigBytes = dataWords.length * 4;

                // Hash final blocks
                this._process();

                // Return final computed hash
                return this._hash;
            },

            clone: function () {
                var clone = Hasher.clone.call(this);
                clone._hash = this._hash.clone();

                return clone;
            }
        });

        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.SHA1('message');
         *     var hash = CryptoJS.SHA1(wordArray);
         */
        C.SHA1 = Hasher._createHelper(SHA1);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacSHA1(message, key);
         */
        C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
    }());


    (function (Math) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;

        // Initialization and round constants tables
        var H = [];
        var K = [];

        // Compute constants
        (function () {
            function isPrime(n) {
                var sqrtN = Math.sqrt(n);
                for (var factor = 2; factor <= sqrtN; factor++) {
                    if (!(n % factor)) {
                        return false;
                    }
                }

                return true;
            }

            function getFractionalBits(n) {
                return ((n - (n | 0)) * 0x100000000) | 0;
            }

            var n = 2;
            var nPrime = 0;
            while (nPrime < 64) {
                if (isPrime(n)) {
                    if (nPrime < 8) {
                        H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                    }
                    K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                    nPrime++;
                }

                n++;
            }
        }());

        // Reusable object
        var W = [];

        /**
         * SHA-256 hash algorithm.
         */
        var SHA256 = C_algo.SHA256 = Hasher.extend({
            _doReset: function () {
                this._hash = new WordArray.init(H.slice(0));
            },

            _doProcessBlock: function (M, offset) {
                // Shortcut
                var H = this._hash.words;

                // Working variables
                var a = H[0];
                var b = H[1];
                var c = H[2];
                var d = H[3];
                var e = H[4];
                var f = H[5];
                var g = H[6];
                var h = H[7];

                // Computation
                for (var i = 0; i < 64; i++) {
                    if (i < 16) {
                        W[i] = M[offset + i] | 0;
                    } else {
                        var gamma0x = W[i - 15];
                        var gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^
                            ((gamma0x << 14) | (gamma0x >>> 18)) ^
                            (gamma0x >>> 3);

                        var gamma1x = W[i - 2];
                        var gamma1 = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                            ((gamma1x << 13) | (gamma1x >>> 19)) ^
                            (gamma1x >>> 10);

                        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                    }

                    var ch = (e & f) ^ (~e & g);
                    var maj = (a & b) ^ (a & c) ^ (b & c);

                    var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                    var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));

                    var t1 = h + sigma1 + ch + K[i] + W[i];
                    var t2 = sigma0 + maj;

                    h = g;
                    g = f;
                    f = e;
                    e = (d + t1) | 0;
                    d = c;
                    c = b;
                    b = a;
                    a = (t1 + t2) | 0;
                }

                // Intermediate hash value
                H[0] = (H[0] + a) | 0;
                H[1] = (H[1] + b) | 0;
                H[2] = (H[2] + c) | 0;
                H[3] = (H[3] + d) | 0;
                H[4] = (H[4] + e) | 0;
                H[5] = (H[5] + f) | 0;
                H[6] = (H[6] + g) | 0;
                H[7] = (H[7] + h) | 0;
            },

            _doFinalize: function () {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;

                var nBitsTotal = this._nDataBytes * 8;
                var nBitsLeft = data.sigBytes * 8;

                // Add padding
                dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
                dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
                dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
                data.sigBytes = dataWords.length * 4;

                // Hash final blocks
                this._process();

                // Return final computed hash
                return this._hash;
            },

            clone: function () {
                var clone = Hasher.clone.call(this);
                clone._hash = this._hash.clone();

                return clone;
            }
        });

        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.SHA256('message');
         *     var hash = CryptoJS.SHA256(wordArray);
         */
        C.SHA256 = Hasher._createHelper(SHA256);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacSHA256(message, key);
         */
        C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
    }(Math));


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;

        /**
         * SHA-224 hash algorithm.
         */
        var SHA224 = C_algo.SHA224 = SHA256.extend({
            _doReset: function () {
                this._hash = new WordArray.init([
                    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
                    0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
                ]);
            },

            _doFinalize: function () {
                var hash = SHA256._doFinalize.call(this);

                hash.sigBytes -= 4;

                return hash;
            }
        });

        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.SHA224('message');
         *     var hash = CryptoJS.SHA224(wordArray);
         */
        C.SHA224 = SHA256._createHelper(SHA224);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacSHA224(message, key);
         */
        C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;

        function X64Word_create() {
            return X64Word.create.apply(X64Word, arguments);
        }

        // Constants
        var K = [
            X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
            X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
            X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
            X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
            X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
            X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
            X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
            X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
            X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
            X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
            X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
            X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
            X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
            X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
            X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
            X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
            X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
            X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
            X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
            X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
            X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
            X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
            X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
            X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
            X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
            X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
            X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
            X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
            X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
            X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
            X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
            X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
            X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
            X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
            X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
            X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
            X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
            X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
            X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
            X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
        ];

        // Reusable objects
        var W = [];
        (function () {
            for (var i = 0; i < 80; i++) {
                W[i] = X64Word_create();
            }
        }());

        /**
         * SHA-512 hash algorithm.
         */
        var SHA512 = C_algo.SHA512 = Hasher.extend({
            _doReset: function () {
                this._hash = new X64WordArray.init([
                    new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
                    new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
                    new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
                    new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
                ]);
            },

            _doProcessBlock: function (M, offset) {
                // Shortcuts
                var H = this._hash.words;

                var H0 = H[0];
                var H1 = H[1];
                var H2 = H[2];
                var H3 = H[3];
                var H4 = H[4];
                var H5 = H[5];
                var H6 = H[6];
                var H7 = H[7];

                var H0h = H0.high;
                var H0l = H0.low;
                var H1h = H1.high;
                var H1l = H1.low;
                var H2h = H2.high;
                var H2l = H2.low;
                var H3h = H3.high;
                var H3l = H3.low;
                var H4h = H4.high;
                var H4l = H4.low;
                var H5h = H5.high;
                var H5l = H5.low;
                var H6h = H6.high;
                var H6l = H6.low;
                var H7h = H7.high;
                var H7l = H7.low;

                // Working variables
                var ah = H0h;
                var al = H0l;
                var bh = H1h;
                var bl = H1l;
                var ch = H2h;
                var cl = H2l;
                var dh = H3h;
                var dl = H3l;
                var eh = H4h;
                var el = H4l;
                var fh = H5h;
                var fl = H5l;
                var gh = H6h;
                var gl = H6l;
                var hh = H7h;
                var hl = H7l;

                // Rounds
                for (var i = 0; i < 80; i++) {
                    var Wil;
                    var Wih;

                    // Shortcut
                    var Wi = W[i];

                    // Extend message
                    if (i < 16) {
                        Wih = Wi.high = M[offset + i * 2] | 0;
                        Wil = Wi.low = M[offset + i * 2 + 1] | 0;
                    } else {
                        // Gamma0
                        var gamma0x = W[i - 15];
                        var gamma0xh = gamma0x.high;
                        var gamma0xl = gamma0x.low;
                        var gamma0h = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
                        var gamma0l = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

                        // Gamma1
                        var gamma1x = W[i - 2];
                        var gamma1xh = gamma1x.high;
                        var gamma1xl = gamma1x.low;
                        var gamma1h = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
                        var gamma1l = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

                        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
                        var Wi7 = W[i - 7];
                        var Wi7h = Wi7.high;
                        var Wi7l = Wi7.low;

                        var Wi16 = W[i - 16];
                        var Wi16h = Wi16.high;
                        var Wi16l = Wi16.low;

                        Wil = gamma0l + Wi7l;
                        Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
                        Wil = Wil + gamma1l;
                        Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
                        Wil = Wil + Wi16l;
                        Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

                        Wi.high = Wih;
                        Wi.low = Wil;
                    }

                    var chh = (eh & fh) ^ (~eh & gh);
                    var chl = (el & fl) ^ (~el & gl);
                    var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
                    var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

                    var sigma0h = ((ah >>> 28) | (al << 4)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
                    var sigma0l = ((al >>> 28) | (ah << 4)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
                    var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
                    var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

                    // t1 = h + sigma1 + ch + K[i] + W[i]
                    var Ki = K[i];
                    var Kih = Ki.high;
                    var Kil = Ki.low;

                    var t1l = hl + sigma1l;
                    var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
                    var t1l = t1l + chl;
                    var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
                    var t1l = t1l + Kil;
                    var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
                    var t1l = t1l + Wil;
                    var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

                    // t2 = sigma0 + maj
                    var t2l = sigma0l + majl;
                    var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

                    // Update working variables
                    hh = gh;
                    hl = gl;
                    gh = fh;
                    gl = fl;
                    fh = eh;
                    fl = el;
                    el = (dl + t1l) | 0;
                    eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
                    dh = ch;
                    dl = cl;
                    ch = bh;
                    cl = bl;
                    bh = ah;
                    bl = al;
                    al = (t1l + t2l) | 0;
                    ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
                }

                // Intermediate hash value
                H0l = H0.low = (H0l + al);
                H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
                H1l = H1.low = (H1l + bl);
                H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
                H2l = H2.low = (H2l + cl);
                H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
                H3l = H3.low = (H3l + dl);
                H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
                H4l = H4.low = (H4l + el);
                H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
                H5l = H5.low = (H5l + fl);
                H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
                H6l = H6.low = (H6l + gl);
                H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
                H7l = H7.low = (H7l + hl);
                H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
            },

            _doFinalize: function () {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;

                var nBitsTotal = this._nDataBytes * 8;
                var nBitsLeft = data.sigBytes * 8;

                // Add padding
                dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
                dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
                dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
                data.sigBytes = dataWords.length * 4;

                // Hash final blocks
                this._process();

                // Convert hash to 32-bit word array before returning
                var hash = this._hash.toX32();

                // Return final computed hash
                return hash;
            },

            clone: function () {
                var clone = Hasher.clone.call(this);
                clone._hash = this._hash.clone();

                return clone;
            },

            blockSize: 1024 / 32
        });

        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.SHA512('message');
         *     var hash = CryptoJS.SHA512(wordArray);
         */
        C.SHA512 = Hasher._createHelper(SHA512);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacSHA512(message, key);
         */
        C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;
        var SHA512 = C_algo.SHA512;

        /**
         * SHA-384 hash algorithm.
         */
        var SHA384 = C_algo.SHA384 = SHA512.extend({
            _doReset: function () {
                this._hash = new X64WordArray.init([
                    new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507),
                    new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939),
                    new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511),
                    new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)
                ]);
            },

            _doFinalize: function () {
                var hash = SHA512._doFinalize.call(this);

                hash.sigBytes -= 16;

                return hash;
            }
        });

        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.SHA384('message');
         *     var hash = CryptoJS.SHA384(wordArray);
         */
        C.SHA384 = SHA512._createHelper(SHA384);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacSHA384(message, key);
         */
        C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
    }());


    (function (Math) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var C_algo = C.algo;

        // Constants tables
        var RHO_OFFSETS = [];
        var PI_INDEXES = [];
        var ROUND_CONSTANTS = [];

        // Compute Constants
        (function () {
            // Compute rho offset constants
            var x = 1,
                y = 0;
            for (var t = 0; t < 24; t++) {
                RHO_OFFSETS[x + 5 * y] = ((t + 1) * (t + 2) / 2) % 64;

                var newX = y % 5;
                var newY = (2 * x + 3 * y) % 5;
                x = newX;
                y = newY;
            }

            // Compute pi index constants
            for (var x = 0; x < 5; x++) {
                for (var y = 0; y < 5; y++) {
                    PI_INDEXES[x + 5 * y] = y + ((2 * x + 3 * y) % 5) * 5;
                }
            }

            // Compute round constants
            var LFSR = 0x01;
            for (var i = 0; i < 24; i++) {
                var roundConstantMsw = 0;
                var roundConstantLsw = 0;

                for (var j = 0; j < 7; j++) {
                    if (LFSR & 0x01) {
                        var bitPosition = (1 << j) - 1;
                        if (bitPosition < 32) {
                            roundConstantLsw ^= 1 << bitPosition;
                        } else /* if (bitPosition >= 32) */ {
                            roundConstantMsw ^= 1 << (bitPosition - 32);
                        }
                    }

                    // Compute next LFSR
                    if (LFSR & 0x80) {
                        // Primitive polynomial over GF(2): x^8 + x^6 + x^5 + x^4 + 1
                        LFSR = (LFSR << 1) ^ 0x71;
                    } else {
                        LFSR <<= 1;
                    }
                }

                ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
            }
        }());

        // Reusable objects for temporary values
        var T = [];
        (function () {
            for (var i = 0; i < 25; i++) {
                T[i] = X64Word.create();
            }
        }());

        /**
         * SHA-3 hash algorithm.
         */
        var SHA3 = C_algo.SHA3 = Hasher.extend({
            /**
             * Configuration options.
             *
             * @property {number} outputLength
             *   The desired number of bits in the output hash.
             *   Only values permitted are: 224, 256, 384, 512.
             *   Default: 512
             */
            cfg: Hasher.cfg.extend({
                outputLength: 512
            }),

            _doReset: function () {
                var state = this._state = []
                for (var i = 0; i < 25; i++) {
                    state[i] = new X64Word.init();
                }

                this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
            },

            _doProcessBlock: function (M, offset) {
                // Shortcuts
                var state = this._state;
                var nBlockSizeLanes = this.blockSize / 2;

                // Absorb
                for (var i = 0; i < nBlockSizeLanes; i++) {
                    // Shortcuts
                    var M2i = M[offset + 2 * i];
                    var M2i1 = M[offset + 2 * i + 1];

                    // Swap endian
                    M2i = (
                        (((M2i << 8) | (M2i >>> 24)) & 0x00ff00ff) |
                        (((M2i << 24) | (M2i >>> 8)) & 0xff00ff00)
                    );
                    M2i1 = (
                        (((M2i1 << 8) | (M2i1 >>> 24)) & 0x00ff00ff) |
                        (((M2i1 << 24) | (M2i1 >>> 8)) & 0xff00ff00)
                    );

                    // Absorb message into state
                    var lane = state[i];
                    lane.high ^= M2i1;
                    lane.low ^= M2i;
                }

                // Rounds
                for (var round = 0; round < 24; round++) {
                    // Theta
                    for (var x = 0; x < 5; x++) {
                        // Mix column lanes
                        var tMsw = 0,
                            tLsw = 0;
                        for (var y = 0; y < 5; y++) {
                            var lane = state[x + 5 * y];
                            tMsw ^= lane.high;
                            tLsw ^= lane.low;
                        }

                        // Temporary values
                        var Tx = T[x];
                        Tx.high = tMsw;
                        Tx.low = tLsw;
                    }
                    for (var x = 0; x < 5; x++) {
                        // Shortcuts
                        var Tx4 = T[(x + 4) % 5];
                        var Tx1 = T[(x + 1) % 5];
                        var Tx1Msw = Tx1.high;
                        var Tx1Lsw = Tx1.low;

                        // Mix surrounding columns
                        var tMsw = Tx4.high ^ ((Tx1Msw << 1) | (Tx1Lsw >>> 31));
                        var tLsw = Tx4.low ^ ((Tx1Lsw << 1) | (Tx1Msw >>> 31));
                        for (var y = 0; y < 5; y++) {
                            var lane = state[x + 5 * y];
                            lane.high ^= tMsw;
                            lane.low ^= tLsw;
                        }
                    }

                    // Rho Pi
                    for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
                        var tMsw;
                        var tLsw;

                        // Shortcuts
                        var lane = state[laneIndex];
                        var laneMsw = lane.high;
                        var laneLsw = lane.low;
                        var rhoOffset = RHO_OFFSETS[laneIndex];

                        // Rotate lanes
                        if (rhoOffset < 32) {
                            tMsw = (laneMsw << rhoOffset) | (laneLsw >>> (32 - rhoOffset));
                            tLsw = (laneLsw << rhoOffset) | (laneMsw >>> (32 - rhoOffset));
                        } else /* if (rhoOffset >= 32) */ {
                            tMsw = (laneLsw << (rhoOffset - 32)) | (laneMsw >>> (64 - rhoOffset));
                            tLsw = (laneMsw << (rhoOffset - 32)) | (laneLsw >>> (64 - rhoOffset));
                        }

                        // Transpose lanes
                        var TPiLane = T[PI_INDEXES[laneIndex]];
                        TPiLane.high = tMsw;
                        TPiLane.low = tLsw;
                    }

                    // Rho pi at x = y = 0
                    var T0 = T[0];
                    var state0 = state[0];
                    T0.high = state0.high;
                    T0.low = state0.low;

                    // Chi
                    for (var x = 0; x < 5; x++) {
                        for (var y = 0; y < 5; y++) {
                            // Shortcuts
                            var laneIndex = x + 5 * y;
                            var lane = state[laneIndex];
                            var TLane = T[laneIndex];
                            var Tx1Lane = T[((x + 1) % 5) + 5 * y];
                            var Tx2Lane = T[((x + 2) % 5) + 5 * y];

                            // Mix rows
                            lane.high = TLane.high ^ (~Tx1Lane.high & Tx2Lane.high);
                            lane.low = TLane.low ^ (~Tx1Lane.low & Tx2Lane.low);
                        }
                    }

                    // Iota
                    var lane = state[0];
                    var roundConstant = ROUND_CONSTANTS[round];
                    lane.high ^= roundConstant.high;
                    lane.low ^= roundConstant.low;
                }
            },

            _doFinalize: function () {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;
                var nBitsTotal = this._nDataBytes * 8;
                var nBitsLeft = data.sigBytes * 8;
                var blockSizeBits = this.blockSize * 32;

                // Add padding
                dataWords[nBitsLeft >>> 5] |= 0x1 << (24 - nBitsLeft % 32);
                dataWords[((Math.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits) >>> 5) - 1] |= 0x80;
                data.sigBytes = dataWords.length * 4;

                // Hash final blocks
                this._process();

                // Shortcuts
                var state = this._state;
                var outputLengthBytes = this.cfg.outputLength / 8;
                var outputLengthLanes = outputLengthBytes / 8;

                // Squeeze
                var hashWords = [];
                for (var i = 0; i < outputLengthLanes; i++) {
                    // Shortcuts
                    var lane = state[i];
                    var laneMsw = lane.high;
                    var laneLsw = lane.low;

                    // Swap endian
                    laneMsw = (
                        (((laneMsw << 8) | (laneMsw >>> 24)) & 0x00ff00ff) |
                        (((laneMsw << 24) | (laneMsw >>> 8)) & 0xff00ff00)
                    );
                    laneLsw = (
                        (((laneLsw << 8) | (laneLsw >>> 24)) & 0x00ff00ff) |
                        (((laneLsw << 24) | (laneLsw >>> 8)) & 0xff00ff00)
                    );

                    // Squeeze state to retrieve hash
                    hashWords.push(laneLsw);
                    hashWords.push(laneMsw);
                }

                // Return final computed hash
                return new WordArray.init(hashWords, outputLengthBytes);
            },

            clone: function () {
                var clone = Hasher.clone.call(this);

                var state = clone._state = this._state.slice(0);
                for (var i = 0; i < 25; i++) {
                    state[i] = state[i].clone();
                }

                return clone;
            }
        });

        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.SHA3('message');
         *     var hash = CryptoJS.SHA3(wordArray);
         */
        C.SHA3 = Hasher._createHelper(SHA3);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacSHA3(message, key);
         */
        C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
    }(Math));


    /** @preserve
    (c) 2012 by Cédric Mesnil. All rights reserved.

    Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

        - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
        - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */

    (function (Math) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;

        // Constants table
        var _zl = WordArray.create([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
            3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
            1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
            4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        ]);
        var _zr = WordArray.create([
            5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
            6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
            15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
            8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
            12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        ]);
        var _sl = WordArray.create([
            11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
            7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
            11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
            11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
            9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        ]);
        var _sr = WordArray.create([
            8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
            9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
            9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
            15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
            8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        ]);

        var _hl = WordArray.create([0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E]);
        var _hr = WordArray.create([0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000]);

        /**
         * RIPEMD160 hash algorithm.
         */
        var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
            _doReset: function () {
                this._hash = WordArray.create([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]);
            },

            _doProcessBlock: function (M, offset) {

                // Swap endian
                for (var i = 0; i < 16; i++) {
                    // Shortcuts
                    var offset_i = offset + i;
                    var M_offset_i = M[offset_i];

                    // Swap
                    M[offset_i] = (
                        (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
                        (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
                    );
                }
                // Shortcut
                var H = this._hash.words;
                var hl = _hl.words;
                var hr = _hr.words;
                var zl = _zl.words;
                var zr = _zr.words;
                var sl = _sl.words;
                var sr = _sr.words;

                // Working variables
                var al, bl, cl, dl, el;
                var ar, br, cr, dr, er;

                ar = al = H[0];
                br = bl = H[1];
                cr = cl = H[2];
                dr = dl = H[3];
                er = el = H[4];
                // Computation
                var t;
                for (var i = 0; i < 80; i += 1) {
                    t = (al + M[offset + zl[i]]) | 0;
                    if (i < 16) {
                        t += f1(bl, cl, dl) + hl[0];
                    } else if (i < 32) {
                        t += f2(bl, cl, dl) + hl[1];
                    } else if (i < 48) {
                        t += f3(bl, cl, dl) + hl[2];
                    } else if (i < 64) {
                        t += f4(bl, cl, dl) + hl[3];
                    } else { // if (i<80) {
                        t += f5(bl, cl, dl) + hl[4];
                    }
                    t = t | 0;
                    t = rotl(t, sl[i]);
                    t = (t + el) | 0;
                    al = el;
                    el = dl;
                    dl = rotl(cl, 10);
                    cl = bl;
                    bl = t;

                    t = (ar + M[offset + zr[i]]) | 0;
                    if (i < 16) {
                        t += f5(br, cr, dr) + hr[0];
                    } else if (i < 32) {
                        t += f4(br, cr, dr) + hr[1];
                    } else if (i < 48) {
                        t += f3(br, cr, dr) + hr[2];
                    } else if (i < 64) {
                        t += f2(br, cr, dr) + hr[3];
                    } else { // if (i<80) {
                        t += f1(br, cr, dr) + hr[4];
                    }
                    t = t | 0;
                    t = rotl(t, sr[i]);
                    t = (t + er) | 0;
                    ar = er;
                    er = dr;
                    dr = rotl(cr, 10);
                    cr = br;
                    br = t;
                }
                // Intermediate hash value
                t = (H[1] + cl + dr) | 0;
                H[1] = (H[2] + dl + er) | 0;
                H[2] = (H[3] + el + ar) | 0;
                H[3] = (H[4] + al + br) | 0;
                H[4] = (H[0] + bl + cr) | 0;
                H[0] = t;
            },

            _doFinalize: function () {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;

                var nBitsTotal = this._nDataBytes * 8;
                var nBitsLeft = data.sigBytes * 8;

                // Add padding
                dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
                dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
                    (((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) |
                    (((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00)
                );
                data.sigBytes = (dataWords.length + 1) * 4;

                // Hash final blocks
                this._process();

                // Shortcuts
                var hash = this._hash;
                var H = hash.words;

                // Swap endian
                for (var i = 0; i < 5; i++) {
                    // Shortcut
                    var H_i = H[i];

                    // Swap
                    H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
                        (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
                }

                // Return final computed hash
                return hash;
            },

            clone: function () {
                var clone = Hasher.clone.call(this);
                clone._hash = this._hash.clone();

                return clone;
            }
        });


        function f1(x, y, z) {
            return ((x) ^ (y) ^ (z));

        }

        function f2(x, y, z) {
            return (((x) & (y)) | ((~x) & (z)));
        }

        function f3(x, y, z) {
            return (((x) | (~(y))) ^ (z));
        }

        function f4(x, y, z) {
            return (((x) & (z)) | ((y) & (~(z))));
        }

        function f5(x, y, z) {
            return ((x) ^ ((y) | (~(z))));

        }

        function rotl(x, n) {
            return (x << n) | (x >>> (32 - n));
        }


        /**
         * Shortcut function to the hasher's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         *
         * @return {WordArray} The hash.
         *
         * @static
         *
         * @example
         *
         *     var hash = CryptoJS.RIPEMD160('message');
         *     var hash = CryptoJS.RIPEMD160(wordArray);
         */
        C.RIPEMD160 = Hasher._createHelper(RIPEMD160);

        /**
         * Shortcut function to the HMAC's object interface.
         *
         * @param {WordArray|string} message The message to hash.
         * @param {WordArray|string} key The secret key.
         *
         * @return {WordArray} The HMAC.
         *
         * @static
         *
         * @example
         *
         *     var hmac = CryptoJS.HmacRIPEMD160(message, key);
         */
        C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
    }(Math));


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var C_algo = C.algo;

        /**
         * HMAC algorithm.
         */
        var HMAC = C_algo.HMAC = Base.extend({
            /**
             * Initializes a newly created HMAC.
             *
             * @param {Hasher} hasher The hash algorithm to use.
             * @param {WordArray|string} key The secret key.
             *
             * @example
             *
             *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
             */
            init: function (hasher, key) {
                // Init hasher
                hasher = this._hasher = new hasher.init();

                // Convert string to WordArray, else assume WordArray already
                if (typeof key == 'string') {
                    key = Utf8.parse(key);
                }

                // Shortcuts
                var hasherBlockSize = hasher.blockSize;
                var hasherBlockSizeBytes = hasherBlockSize * 4;

                // Allow arbitrary length keys
                if (key.sigBytes > hasherBlockSizeBytes) {
                    key = hasher.finalize(key);
                }

                // Clamp excess bits
                key.clamp();

                // Clone key for inner and outer pads
                var oKey = this._oKey = key.clone();
                var iKey = this._iKey = key.clone();

                // Shortcuts
                var oKeyWords = oKey.words;
                var iKeyWords = iKey.words;

                // XOR keys with pad constants
                for (var i = 0; i < hasherBlockSize; i++) {
                    oKeyWords[i] ^= 0x5c5c5c5c;
                    iKeyWords[i] ^= 0x36363636;
                }
                oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

                // Set initial values
                this.reset();
            },

            /**
             * Resets this HMAC to its initial state.
             *
             * @example
             *
             *     hmacHasher.reset();
             */
            reset: function () {
                // Shortcut
                var hasher = this._hasher;

                // Reset
                hasher.reset();
                hasher.update(this._iKey);
            },

            /**
             * Updates this HMAC with a message.
             *
             * @param {WordArray|string} messageUpdate The message to append.
             *
             * @return {HMAC} This HMAC instance.
             *
             * @example
             *
             *     hmacHasher.update('message');
             *     hmacHasher.update(wordArray);
             */
            update: function (messageUpdate) {
                this._hasher.update(messageUpdate);

                // Chainable
                return this;
            },

            /**
             * Finalizes the HMAC computation.
             * Note that the finalize operation is effectively a destructive, read-once operation.
             *
             * @param {WordArray|string} messageUpdate (Optional) A final message update.
             *
             * @return {WordArray} The HMAC.
             *
             * @example
             *
             *     var hmac = hmacHasher.finalize();
             *     var hmac = hmacHasher.finalize('message');
             *     var hmac = hmacHasher.finalize(wordArray);
             */
            finalize: function (messageUpdate) {
                // Shortcut
                var hasher = this._hasher;

                // Compute HMAC
                var innerHash = hasher.finalize(messageUpdate);
                hasher.reset();
                var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

                return hmac;
            }
        });
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;
        var HMAC = C_algo.HMAC;

        /**
         * Password-Based Key Derivation Function 2 algorithm.
         */
        var PBKDF2 = C_algo.PBKDF2 = Base.extend({
            /**
             * Configuration options.
             *
             * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
             * @property {Hasher} hasher The hasher to use. Default: SHA256
             * @property {number} iterations The number of iterations to perform. Default: 250000
             */
            cfg: Base.extend({
                keySize: 128 / 32,
                hasher: SHA256,
                iterations: 250000
            }),

            /**
             * Initializes a newly created key derivation function.
             *
             * @param {Object} cfg (Optional) The configuration options to use for the derivation.
             *
             * @example
             *
             *     var kdf = CryptoJS.algo.PBKDF2.create();
             *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
             *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
             */
            init: function (cfg) {
                this.cfg = this.cfg.extend(cfg);
            },

            /**
             * Computes the Password-Based Key Derivation Function 2.
             *
             * @param {WordArray|string} password The password.
             * @param {WordArray|string} salt A salt.
             *
             * @return {WordArray} The derived key.
             *
             * @example
             *
             *     var key = kdf.compute(password, salt);
             */
            compute: function (password, salt) {
                // Shortcut
                var cfg = this.cfg;

                // Init HMAC
                var hmac = HMAC.create(cfg.hasher, password);

                // Initial values
                var derivedKey = WordArray.create();
                var blockIndex = WordArray.create([0x00000001]);

                // Shortcuts
                var derivedKeyWords = derivedKey.words;
                var blockIndexWords = blockIndex.words;
                var keySize = cfg.keySize;
                var iterations = cfg.iterations;

                // Generate key
                while (derivedKeyWords.length < keySize) {
                    var block = hmac.update(salt).finalize(blockIndex);
                    hmac.reset();

                    // Shortcuts
                    var blockWords = block.words;
                    var blockWordsLength = blockWords.length;

                    // Iterations
                    var intermediate = block;
                    for (var i = 1; i < iterations; i++) {
                        intermediate = hmac.finalize(intermediate);
                        hmac.reset();

                        // Shortcut
                        var intermediateWords = intermediate.words;

                        // XOR intermediate with block
                        for (var j = 0; j < blockWordsLength; j++) {
                            blockWords[j] ^= intermediateWords[j];
                        }
                    }

                    derivedKey.concat(block);
                    blockIndexWords[0]++;
                }
                derivedKey.sigBytes = keySize * 4;

                return derivedKey;
            }
        });

        /**
         * Computes the Password-Based Key Derivation Function 2.
         *
         * @param {WordArray|string} password The password.
         * @param {WordArray|string} salt A salt.
         * @param {Object} cfg (Optional) The configuration options to use for this computation.
         *
         * @return {WordArray} The derived key.
         *
         * @static
         *
         * @example
         *
         *     var key = CryptoJS.PBKDF2(password, salt);
         *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
         *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
         */
        C.PBKDF2 = function (password, salt, cfg) {
            return PBKDF2.create(cfg).compute(password, salt);
        };
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var MD5 = C_algo.MD5;

        /**
         * This key derivation function is meant to conform with EVP_BytesToKey.
         * www.openssl.org/docs/crypto/EVP_BytesToKey.html
         */
        var EvpKDF = C_algo.EvpKDF = Base.extend({
            /**
             * Configuration options.
             *
             * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
             * @property {Hasher} hasher The hash algorithm to use. Default: MD5
             * @property {number} iterations The number of iterations to perform. Default: 1
             */
            cfg: Base.extend({
                keySize: 128 / 32,
                hasher: MD5,
                iterations: 1
            }),

            /**
             * Initializes a newly created key derivation function.
             *
             * @param {Object} cfg (Optional) The configuration options to use for the derivation.
             *
             * @example
             *
             *     var kdf = CryptoJS.algo.EvpKDF.create();
             *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
             *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
             */
            init: function (cfg) {
                this.cfg = this.cfg.extend(cfg);
            },

            /**
             * Derives a key from a password.
             *
             * @param {WordArray|string} password The password.
             * @param {WordArray|string} salt A salt.
             *
             * @return {WordArray} The derived key.
             *
             * @example
             *
             *     var key = kdf.compute(password, salt);
             */
            compute: function (password, salt) {
                var block;

                // Shortcut
                var cfg = this.cfg;

                // Init hasher
                var hasher = cfg.hasher.create();

                // Initial values
                var derivedKey = WordArray.create();

                // Shortcuts
                var derivedKeyWords = derivedKey.words;
                var keySize = cfg.keySize;
                var iterations = cfg.iterations;

                // Generate key
                while (derivedKeyWords.length < keySize) {
                    if (block) {
                        hasher.update(block);
                    }
                    block = hasher.update(password).finalize(salt);
                    hasher.reset();

                    // Iterations
                    for (var i = 1; i < iterations; i++) {
                        block = hasher.finalize(block);
                        hasher.reset();
                    }

                    derivedKey.concat(block);
                }
                derivedKey.sigBytes = keySize * 4;

                return derivedKey;
            }
        });

        /**
         * Derives a key from a password.
         *
         * @param {WordArray|string} password The password.
         * @param {WordArray|string} salt A salt.
         * @param {Object} cfg (Optional) The configuration options to use for this computation.
         *
         * @return {WordArray} The derived key.
         *
         * @static
         *
         * @example
         *
         *     var key = CryptoJS.EvpKDF(password, salt);
         *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
         *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
         */
        C.EvpKDF = function (password, salt, cfg) {
            return EvpKDF.create(cfg).compute(password, salt);
        };
    }());


    /**
     * Cipher core components.
     */
    CryptoJS.lib.Cipher || (function (undefined) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var Base64 = C_enc.Base64;
        var C_algo = C.algo;
        var EvpKDF = C_algo.EvpKDF;

        /**
         * Abstract base cipher template.
         *
         * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
         * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
         * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
         * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
         */
        var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
            /**
             * Configuration options.
             *
             * @property {WordArray} iv The IV to use for this operation.
             */
            cfg: Base.extend(),

            /**
             * Creates this cipher in encryption mode.
             *
             * @param {WordArray} key The key.
             * @param {Object} cfg (Optional) The configuration options to use for this operation.
             *
             * @return {Cipher} A cipher instance.
             *
             * @static
             *
             * @example
             *
             *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
             */
            createEncryptor: function (key, cfg) {
                return this.create(this._ENC_XFORM_MODE, key, cfg);
            },

            /**
             * Creates this cipher in decryption mode.
             *
             * @param {WordArray} key The key.
             * @param {Object} cfg (Optional) The configuration options to use for this operation.
             *
             * @return {Cipher} A cipher instance.
             *
             * @static
             *
             * @example
             *
             *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
             */
            createDecryptor: function (key, cfg) {
                return this.create(this._DEC_XFORM_MODE, key, cfg);
            },

            /**
             * Initializes a newly created cipher.
             *
             * @param {number} xformMode Either the encryption or decryption transormation mode constant.
             * @param {WordArray} key The key.
             * @param {Object} cfg (Optional) The configuration options to use for this operation.
             *
             * @example
             *
             *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
             */
            init: function (xformMode, key, cfg) {
                // Apply config defaults
                this.cfg = this.cfg.extend(cfg);

                // Store transform mode and key
                this._xformMode = xformMode;
                this._key = key;

                // Set initial values
                this.reset();
            },

            /**
             * Resets this cipher to its initial state.
             *
             * @example
             *
             *     cipher.reset();
             */
            reset: function () {
                // Reset data buffer
                BufferedBlockAlgorithm.reset.call(this);

                // Perform concrete-cipher logic
                this._doReset();
            },

            /**
             * Adds data to be encrypted or decrypted.
             *
             * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
             *
             * @return {WordArray} The data after processing.
             *
             * @example
             *
             *     var encrypted = cipher.process('data');
             *     var encrypted = cipher.process(wordArray);
             */
            process: function (dataUpdate) {
                // Append
                this._append(dataUpdate);

                // Process available blocks
                return this._process();
            },

            /**
             * Finalizes the encryption or decryption process.
             * Note that the finalize operation is effectively a destructive, read-once operation.
             *
             * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
             *
             * @return {WordArray} The data after final processing.
             *
             * @example
             *
             *     var encrypted = cipher.finalize();
             *     var encrypted = cipher.finalize('data');
             *     var encrypted = cipher.finalize(wordArray);
             */
            finalize: function (dataUpdate) {
                // Final data update
                if (dataUpdate) {
                    this._append(dataUpdate);
                }

                // Perform concrete-cipher logic
                var finalProcessedData = this._doFinalize();

                return finalProcessedData;
            },

            keySize: 128 / 32,

            ivSize: 128 / 32,

            _ENC_XFORM_MODE: 1,

            _DEC_XFORM_MODE: 2,

            /**
             * Creates shortcut functions to a cipher's object interface.
             *
             * @param {Cipher} cipher The cipher to create a helper for.
             *
             * @return {Object} An object with encrypt and decrypt shortcut functions.
             *
             * @static
             *
             * @example
             *
             *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
             */
            _createHelper: (function () {
                function selectCipherStrategy(key) {
                    if (typeof key == 'string') {
                        return PasswordBasedCipher;
                    } else {
                        return SerializableCipher;
                    }
                }

                return function (cipher) {
                    return {
                        encrypt: function (message, key, cfg) {
                            return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
                        },

                        decrypt: function (ciphertext, key, cfg) {
                            return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
                        }
                    };
                };
            }())
        });

        /**
         * Abstract base stream cipher template.
         *
         * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
         */
        var StreamCipher = C_lib.StreamCipher = Cipher.extend({
            _doFinalize: function () {
                // Process partial blocks
                var finalProcessedBlocks = this._process(!!'flush');

                return finalProcessedBlocks;
            },

            blockSize: 1
        });

        /**
         * Mode namespace.
         */
        var C_mode = C.mode = {};

        /**
         * Abstract base block cipher mode template.
         */
        var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
            /**
             * Creates this mode for encryption.
             *
             * @param {Cipher} cipher A block cipher instance.
             * @param {Array} iv The IV words.
             *
             * @static
             *
             * @example
             *
             *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
             */
            createEncryptor: function (cipher, iv) {
                return this.Encryptor.create(cipher, iv);
            },

            /**
             * Creates this mode for decryption.
             *
             * @param {Cipher} cipher A block cipher instance.
             * @param {Array} iv The IV words.
             *
             * @static
             *
             * @example
             *
             *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
             */
            createDecryptor: function (cipher, iv) {
                return this.Decryptor.create(cipher, iv);
            },

            /**
             * Initializes a newly created mode.
             *
             * @param {Cipher} cipher A block cipher instance.
             * @param {Array} iv The IV words.
             *
             * @example
             *
             *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
             */
            init: function (cipher, iv) {
                this._cipher = cipher;
                this._iv = iv;
            }
        });

        /**
         * Cipher Block Chaining mode.
         */
        var CBC = C_mode.CBC = (function () {
            /**
             * Abstract base CBC mode.
             */
            var CBC = BlockCipherMode.extend();

            /**
             * CBC encryptor.
             */
            CBC.Encryptor = CBC.extend({
                /**
                 * Processes the data block at offset.
                 *
                 * @param {Array} words The data words to operate on.
                 * @param {number} offset The offset where the block starts.
                 *
                 * @example
                 *
                 *     mode.processBlock(data.words, offset);
                 */
                processBlock: function (words, offset) {
                    // Shortcuts
                    var cipher = this._cipher;
                    var blockSize = cipher.blockSize;

                    // XOR and encrypt
                    xorBlock.call(this, words, offset, blockSize);
                    cipher.encryptBlock(words, offset);

                    // Remember this block to use with next block
                    this._prevBlock = words.slice(offset, offset + blockSize);
                }
            });

            /**
             * CBC decryptor.
             */
            CBC.Decryptor = CBC.extend({
                /**
                 * Processes the data block at offset.
                 *
                 * @param {Array} words The data words to operate on.
                 * @param {number} offset The offset where the block starts.
                 *
                 * @example
                 *
                 *     mode.processBlock(data.words, offset);
                 */
                processBlock: function (words, offset) {
                    // Shortcuts
                    var cipher = this._cipher;
                    var blockSize = cipher.blockSize;

                    // Remember this block to use with next block
                    var thisBlock = words.slice(offset, offset + blockSize);

                    // Decrypt and XOR
                    cipher.decryptBlock(words, offset);
                    xorBlock.call(this, words, offset, blockSize);

                    // This block becomes the previous block
                    this._prevBlock = thisBlock;
                }
            });

            function xorBlock(words, offset, blockSize) {
                var block;

                // Shortcut
                var iv = this._iv;

                // Choose mixing block
                if (iv) {
                    block = iv;

                    // Remove IV for subsequent blocks
                    this._iv = undefined;
                } else {
                    block = this._prevBlock;
                }

                // XOR blocks
                for (var i = 0; i < blockSize; i++) {
                    words[offset + i] ^= block[i];
                }
            }

            return CBC;
        }());

        /**
         * Padding namespace.
         */
        var C_pad = C.pad = {};

        /**
         * PKCS #5/7 padding strategy.
         */
        var Pkcs7 = C_pad.Pkcs7 = {
            /**
             * Pads data using the algorithm defined in PKCS #5/7.
             *
             * @param {WordArray} data The data to pad.
             * @param {number} blockSize The multiple that the data should be padded to.
             *
             * @static
             *
             * @example
             *
             *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
             */
            pad: function (data, blockSize) {
                // Shortcut
                var blockSizeBytes = blockSize * 4;

                // Count padding bytes
                var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

                // Create padding word
                var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

                // Create padding
                var paddingWords = [];
                for (var i = 0; i < nPaddingBytes; i += 4) {
                    paddingWords.push(paddingWord);
                }
                var padding = WordArray.create(paddingWords, nPaddingBytes);

                // Add padding
                data.concat(padding);
            },

            /**
             * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
             *
             * @param {WordArray} data The data to unpad.
             *
             * @static
             *
             * @example
             *
             *     CryptoJS.pad.Pkcs7.unpad(wordArray);
             */
            unpad: function (data) {
                // Get number of padding bytes from last byte
                var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

                // Remove padding
                data.sigBytes -= nPaddingBytes;
            }
        };

        /**
         * Abstract base block cipher template.
         *
         * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
         */
        var BlockCipher = C_lib.BlockCipher = Cipher.extend({
            /**
             * Configuration options.
             *
             * @property {Mode} mode The block mode to use. Default: CBC
             * @property {Padding} padding The padding strategy to use. Default: Pkcs7
             */
            cfg: Cipher.cfg.extend({
                mode: CBC,
                padding: Pkcs7
            }),

            reset: function () {
                var modeCreator;

                // Reset cipher
                Cipher.reset.call(this);

                // Shortcuts
                var cfg = this.cfg;
                var iv = cfg.iv;
                var mode = cfg.mode;

                // Reset block mode
                if (this._xformMode == this._ENC_XFORM_MODE) {
                    modeCreator = mode.createEncryptor;
                } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
                    modeCreator = mode.createDecryptor;
                    // Keep at least one block in the buffer for unpadding
                    this._minBufferSize = 1;
                }

                if (this._mode && this._mode.__creator == modeCreator) {
                    this._mode.init(this, iv && iv.words);
                } else {
                    this._mode = modeCreator.call(mode, this, iv && iv.words);
                    this._mode.__creator = modeCreator;
                }
            },

            _doProcessBlock: function (words, offset) {
                this._mode.processBlock(words, offset);
            },

            _doFinalize: function () {
                var finalProcessedBlocks;

                // Shortcut
                var padding = this.cfg.padding;

                // Finalize
                if (this._xformMode == this._ENC_XFORM_MODE) {
                    // Pad data
                    padding.pad(this._data, this.blockSize);

                    // Process final blocks
                    finalProcessedBlocks = this._process(!!'flush');
                } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
                    // Process final blocks
                    finalProcessedBlocks = this._process(!!'flush');

                    // Unpad data
                    padding.unpad(finalProcessedBlocks);
                }

                return finalProcessedBlocks;
            },

            blockSize: 128 / 32
        });

        /**
         * A collection of cipher parameters.
         *
         * @property {WordArray} ciphertext The raw ciphertext.
         * @property {WordArray} key The key to this ciphertext.
         * @property {WordArray} iv The IV used in the ciphering operation.
         * @property {WordArray} salt The salt used with a key derivation function.
         * @property {Cipher} algorithm The cipher algorithm.
         * @property {Mode} mode The block mode used in the ciphering operation.
         * @property {Padding} padding The padding scheme used in the ciphering operation.
         * @property {number} blockSize The block size of the cipher.
         * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
         */
        var CipherParams = C_lib.CipherParams = Base.extend({
            /**
             * Initializes a newly created cipher params object.
             *
             * @param {Object} cipherParams An object with any of the possible cipher parameters.
             *
             * @example
             *
             *     var cipherParams = CryptoJS.lib.CipherParams.create({
             *         ciphertext: ciphertextWordArray,
             *         key: keyWordArray,
             *         iv: ivWordArray,
             *         salt: saltWordArray,
             *         algorithm: CryptoJS.algo.AES,
             *         mode: CryptoJS.mode.CBC,
             *         padding: CryptoJS.pad.PKCS7,
             *         blockSize: 4,
             *         formatter: CryptoJS.format.OpenSSL
             *     });
             */
            init: function (cipherParams) {
                this.mixIn(cipherParams);
            },

            /**
             * Converts this cipher params object to a string.
             *
             * @param {Format} formatter (Optional) The formatting strategy to use.
             *
             * @return {string} The stringified cipher params.
             *
             * @throws Error If neither the formatter nor the default formatter is set.
             *
             * @example
             *
             *     var string = cipherParams + '';
             *     var string = cipherParams.toString();
             *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
             */
            toString: function (formatter) {
                return (formatter || this.formatter).stringify(this);
            }
        });

        /**
         * Format namespace.
         */
        var C_format = C.format = {};

        /**
         * OpenSSL formatting strategy.
         */
        var OpenSSLFormatter = C_format.OpenSSL = {
            /**
             * Converts a cipher params object to an OpenSSL-compatible string.
             *
             * @param {CipherParams} cipherParams The cipher params object.
             *
             * @return {string} The OpenSSL-compatible string.
             *
             * @static
             *
             * @example
             *
             *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
             */
            stringify: function (cipherParams) {
                var wordArray;

                // Shortcuts
                var ciphertext = cipherParams.ciphertext;
                var salt = cipherParams.salt;

                // Format
                if (salt) {
                    wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
                } else {
                    wordArray = ciphertext;
                }

                return wordArray.toString(Base64);
            },

            /**
             * Converts an OpenSSL-compatible string to a cipher params object.
             *
             * @param {string} openSSLStr The OpenSSL-compatible string.
             *
             * @return {CipherParams} The cipher params object.
             *
             * @static
             *
             * @example
             *
             *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
             */
            parse: function (openSSLStr) {
                var salt;

                // Parse base64
                var ciphertext = Base64.parse(openSSLStr);

                // Shortcut
                var ciphertextWords = ciphertext.words;

                // Test for salt
                if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
                    // Extract salt
                    salt = WordArray.create(ciphertextWords.slice(2, 4));

                    // Remove salt from ciphertext
                    ciphertextWords.splice(0, 4);
                    ciphertext.sigBytes -= 16;
                }

                return CipherParams.create({
                    ciphertext: ciphertext,
                    salt: salt
                });
            }
        };

        /**
         * A cipher wrapper that returns ciphertext as a serializable cipher params object.
         */
        var SerializableCipher = C_lib.SerializableCipher = Base.extend({
            /**
             * Configuration options.
             *
             * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
             */
            cfg: Base.extend({
                format: OpenSSLFormatter
            }),

            /**
             * Encrypts a message.
             *
             * @param {Cipher} cipher The cipher algorithm to use.
             * @param {WordArray|string} message The message to encrypt.
             * @param {WordArray} key The key.
             * @param {Object} cfg (Optional) The configuration options to use for this operation.
             *
             * @return {CipherParams} A cipher params object.
             *
             * @static
             *
             * @example
             *
             *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
             *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
             *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
             */
            encrypt: function (cipher, message, key, cfg) {
                // Apply config defaults
                cfg = this.cfg.extend(cfg);

                // Encrypt
                var encryptor = cipher.createEncryptor(key, cfg);
                var ciphertext = encryptor.finalize(message);

                // Shortcut
                var cipherCfg = encryptor.cfg;

                // Create and return serializable cipher params
                return CipherParams.create({
                    ciphertext: ciphertext,
                    key: key,
                    iv: cipherCfg.iv,
                    algorithm: cipher,
                    mode: cipherCfg.mode,
                    padding: cipherCfg.padding,
                    blockSize: cipher.blockSize,
                    formatter: cfg.format
                });
            },

            /**
             * Decrypts serialized ciphertext.
             *
             * @param {Cipher} cipher The cipher algorithm to use.
             * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
             * @param {WordArray} key The key.
             * @param {Object} cfg (Optional) The configuration options to use for this operation.
             *
             * @return {WordArray} The plaintext.
             *
             * @static
             *
             * @example
             *
             *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
             *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
             */
            decrypt: function (cipher, ciphertext, key, cfg) {
                // Apply config defaults
                cfg = this.cfg.extend(cfg);

                // Convert string to CipherParams
                ciphertext = this._parse(ciphertext, cfg.format);

                // Decrypt
                var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

                return plaintext;
            },

            /**
             * Converts serialized ciphertext to CipherParams,
             * else assumed CipherParams already and returns ciphertext unchanged.
             *
             * @param {CipherParams|string} ciphertext The ciphertext.
             * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
             *
             * @return {CipherParams} The unserialized ciphertext.
             *
             * @static
             *
             * @example
             *
             *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
             */
            _parse: function (ciphertext, format) {
                if (typeof ciphertext == 'string') {
                    return format.parse(ciphertext, this);
                } else {
                    return ciphertext;
                }
            }
        });

        /**
         * Key derivation function namespace.
         */
        var C_kdf = C.kdf = {};

        /**
         * OpenSSL key derivation function.
         */
        var OpenSSLKdf = C_kdf.OpenSSL = {
            /**
             * Derives a key and IV from a password.
             *
             * @param {string} password The password to derive from.
             * @param {number} keySize The size in words of the key to generate.
             * @param {number} ivSize The size in words of the IV to generate.
             * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
             *
             * @return {CipherParams} A cipher params object with the key, IV, and salt.
             *
             * @static
             *
             * @example
             *
             *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
             *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
             */
            execute: function (password, keySize, ivSize, salt, hasher) {
                // Generate random salt
                if (!salt) {
                    salt = WordArray.random(64 / 8);
                }

                // Derive key and IV
                if (!hasher) {
                    var key = EvpKDF.create({
                        keySize: keySize + ivSize
                    }).compute(password, salt);
                } else {
                    var key = EvpKDF.create({
                        keySize: keySize + ivSize,
                        hasher: hasher
                    }).compute(password, salt);
                }


                // Separate key and IV
                var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
                key.sigBytes = keySize * 4;

                // Return params
                return CipherParams.create({
                    key: key,
                    iv: iv,
                    salt: salt
                });
            }
        };

        /**
         * A serializable cipher wrapper that derives the key from a password,
         * and returns ciphertext as a serializable cipher params object.
         */
        var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
            /**
             * Configuration options.
             *
             * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
             */
            cfg: SerializableCipher.cfg.extend({
                kdf: OpenSSLKdf
            }),

            /**
             * Encrypts a message using a password.
             *
             * @param {Cipher} cipher The cipher algorithm to use.
             * @param {WordArray|string} message The message to encrypt.
             * @param {string} password The password.
             * @param {Object} cfg (Optional) The configuration options to use for this operation.
             *
             * @return {CipherParams} A cipher params object.
             *
             * @static
             *
             * @example
             *
             *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
             *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
             */
            encrypt: function (cipher, message, password, cfg) {
                // Apply config defaults
                cfg = this.cfg.extend(cfg);

                // Derive key and other params
                var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, cfg.salt, cfg.hasher);

                // Add IV to config
                cfg.iv = derivedParams.iv;

                // Encrypt
                var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

                // Mix in derived params
                ciphertext.mixIn(derivedParams);

                return ciphertext;
            },

            /**
             * Decrypts serialized ciphertext using a password.
             *
             * @param {Cipher} cipher The cipher algorithm to use.
             * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
             * @param {string} password The password.
             * @param {Object} cfg (Optional) The configuration options to use for this operation.
             *
             * @return {WordArray} The plaintext.
             *
             * @static
             *
             * @example
             *
             *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
             *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
             */
            decrypt: function (cipher, ciphertext, password, cfg) {
                // Apply config defaults
                cfg = this.cfg.extend(cfg);

                // Convert string to CipherParams
                ciphertext = this._parse(ciphertext, cfg.format);

                // Derive key and other params
                var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt, cfg.hasher);

                // Add IV to config
                cfg.iv = derivedParams.iv;

                // Decrypt
                var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

                return plaintext;
            }
        });
    }());


    /**
     * Cipher Feedback block mode.
     */
    CryptoJS.mode.CFB = (function () {
        var CFB = CryptoJS.lib.BlockCipherMode.extend();

        CFB.Encryptor = CFB.extend({
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher;
                var blockSize = cipher.blockSize;

                generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

                // Remember this block to use with next block
                this._prevBlock = words.slice(offset, offset + blockSize);
            }
        });

        CFB.Decryptor = CFB.extend({
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher;
                var blockSize = cipher.blockSize;

                // Remember this block to use with next block
                var thisBlock = words.slice(offset, offset + blockSize);

                generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);

                // This block becomes the previous block
                this._prevBlock = thisBlock;
            }
        });

        function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
            var keystream;

            // Shortcut
            var iv = this._iv;

            // Generate keystream
            if (iv) {
                keystream = iv.slice(0);

                // Remove IV for subsequent blocks
                this._iv = undefined;
            } else {
                keystream = this._prevBlock;
            }
            cipher.encryptBlock(keystream, 0);

            // Encrypt
            for (var i = 0; i < blockSize; i++) {
                words[offset + i] ^= keystream[i];
            }
        }

        return CFB;
    }());


    /**
     * Counter block mode.
     */
    CryptoJS.mode.CTR = (function () {
        var CTR = CryptoJS.lib.BlockCipherMode.extend();

        var Encryptor = CTR.Encryptor = CTR.extend({
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher
                var blockSize = cipher.blockSize;
                var iv = this._iv;
                var counter = this._counter;

                // Generate keystream
                if (iv) {
                    counter = this._counter = iv.slice(0);

                    // Remove IV for subsequent blocks
                    this._iv = undefined;
                }
                var keystream = counter.slice(0);
                cipher.encryptBlock(keystream, 0);

                // Increment counter
                counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0

                // Encrypt
                for (var i = 0; i < blockSize; i++) {
                    words[offset + i] ^= keystream[i];
                }
            }
        });

        CTR.Decryptor = Encryptor;

        return CTR;
    }());


    /** @preserve
     * Counter block mode compatible with  Dr Brian Gladman fileenc.c
     * derived from CryptoJS.mode.CTR
     * Jan Hruby jhruby.web@gmail.com
     */
    CryptoJS.mode.CTRGladman = (function () {
        var CTRGladman = CryptoJS.lib.BlockCipherMode.extend();

        function incWord(word) {
            if (((word >> 24) & 0xff) === 0xff) { //overflow
                var b1 = (word >> 16) & 0xff;
                var b2 = (word >> 8) & 0xff;
                var b3 = word & 0xff;

                if (b1 === 0xff) // overflow b1
                {
                    b1 = 0;
                    if (b2 === 0xff) {
                        b2 = 0;
                        if (b3 === 0xff) {
                            b3 = 0;
                        } else {
                            ++b3;
                        }
                    } else {
                        ++b2;
                    }
                } else {
                    ++b1;
                }

                word = 0;
                word += (b1 << 16);
                word += (b2 << 8);
                word += b3;
            } else {
                word += (0x01 << 24);
            }
            return word;
        }

        function incCounter(counter) {
            if ((counter[0] = incWord(counter[0])) === 0) {
                // encr_data in fileenc.c from  Dr Brian Gladman's counts only with DWORD j < 8
                counter[1] = incWord(counter[1]);
            }
            return counter;
        }

        var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher
                var blockSize = cipher.blockSize;
                var iv = this._iv;
                var counter = this._counter;

                // Generate keystream
                if (iv) {
                    counter = this._counter = iv.slice(0);

                    // Remove IV for subsequent blocks
                    this._iv = undefined;
                }

                incCounter(counter);

                var keystream = counter.slice(0);
                cipher.encryptBlock(keystream, 0);

                // Encrypt
                for (var i = 0; i < blockSize; i++) {
                    words[offset + i] ^= keystream[i];
                }
            }
        });

        CTRGladman.Decryptor = Encryptor;

        return CTRGladman;
    }());




    /**
     * Output Feedback block mode.
     */
    CryptoJS.mode.OFB = (function () {
        var OFB = CryptoJS.lib.BlockCipherMode.extend();

        var Encryptor = OFB.Encryptor = OFB.extend({
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher
                var blockSize = cipher.blockSize;
                var iv = this._iv;
                var keystream = this._keystream;

                // Generate keystream
                if (iv) {
                    keystream = this._keystream = iv.slice(0);

                    // Remove IV for subsequent blocks
                    this._iv = undefined;
                }
                cipher.encryptBlock(keystream, 0);

                // Encrypt
                for (var i = 0; i < blockSize; i++) {
                    words[offset + i] ^= keystream[i];
                }
            }
        });

        OFB.Decryptor = Encryptor;

        return OFB;
    }());


    /**
     * Electronic Codebook block mode.
     */
    CryptoJS.mode.ECB = (function () {
        var ECB = CryptoJS.lib.BlockCipherMode.extend();

        ECB.Encryptor = ECB.extend({
            processBlock: function (words, offset) {
                this._cipher.encryptBlock(words, offset);
            }
        });

        ECB.Decryptor = ECB.extend({
            processBlock: function (words, offset) {
                this._cipher.decryptBlock(words, offset);
            }
        });

        return ECB;
    }());


    /**
     * ANSI X.923 padding strategy.
     */
    CryptoJS.pad.AnsiX923 = {
        pad: function (data, blockSize) {
            // Shortcuts
            var dataSigBytes = data.sigBytes;
            var blockSizeBytes = blockSize * 4;

            // Count padding bytes
            var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;

            // Compute last byte position
            var lastBytePos = dataSigBytes + nPaddingBytes - 1;

            // Pad
            data.clamp();
            data.words[lastBytePos >>> 2] |= nPaddingBytes << (24 - (lastBytePos % 4) * 8);
            data.sigBytes += nPaddingBytes;
        },

        unpad: function (data) {
            // Get number of padding bytes from last byte
            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

            // Remove padding
            data.sigBytes -= nPaddingBytes;
        }
    };


    /**
     * ISO 10126 padding strategy.
     */
    CryptoJS.pad.Iso10126 = {
        pad: function (data, blockSize) {
            // Shortcut
            var blockSizeBytes = blockSize * 4;

            // Count padding bytes
            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

            // Pad
            data.concat(CryptoJS.lib.WordArray.random(nPaddingBytes - 1)).
            concat(CryptoJS.lib.WordArray.create([nPaddingBytes << 24], 1));
        },

        unpad: function (data) {
            // Get number of padding bytes from last byte
            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

            // Remove padding
            data.sigBytes -= nPaddingBytes;
        }
    };


    /**
     * ISO/IEC 9797-1 Padding Method 2.
     */
    CryptoJS.pad.Iso97971 = {
        pad: function (data, blockSize) {
            // Add 0x80 byte
            data.concat(CryptoJS.lib.WordArray.create([0x80000000], 1));

            // Zero pad the rest
            CryptoJS.pad.ZeroPadding.pad(data, blockSize);
        },

        unpad: function (data) {
            // Remove zero padding
            CryptoJS.pad.ZeroPadding.unpad(data);

            // Remove one more byte -- the 0x80 byte
            data.sigBytes--;
        }
    };


    /**
     * Zero padding strategy.
     */
    CryptoJS.pad.ZeroPadding = {
        pad: function (data, blockSize) {
            // Shortcut
            var blockSizeBytes = blockSize * 4;

            // Pad
            data.clamp();
            data.sigBytes += blockSizeBytes - ((data.sigBytes % blockSizeBytes) || blockSizeBytes);
        },

        unpad: function (data) {
            // Shortcut
            var dataWords = data.words;

            // Unpad
            var i = data.sigBytes - 1;
            for (var i = data.sigBytes - 1; i >= 0; i--) {
                if (((dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)) {
                    data.sigBytes = i + 1;
                    break;
                }
            }
        }
    };


    /**
     * A noop padding strategy.
     */
    CryptoJS.pad.NoPadding = {
        pad: function () {},

        unpad: function () {}
    };


    (function (undefined) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var CipherParams = C_lib.CipherParams;
        var C_enc = C.enc;
        var Hex = C_enc.Hex;
        var C_format = C.format;

        var HexFormatter = C_format.Hex = {
            /**
             * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
             *
             * @param {CipherParams} cipherParams The cipher params object.
             *
             * @return {string} The hexadecimally encoded string.
             *
             * @static
             *
             * @example
             *
             *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
             */
            stringify: function (cipherParams) {
                return cipherParams.ciphertext.toString(Hex);
            },

            /**
             * Converts a hexadecimally encoded ciphertext string to a cipher params object.
             *
             * @param {string} input The hexadecimally encoded string.
             *
             * @return {CipherParams} The cipher params object.
             *
             * @static
             *
             * @example
             *
             *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
             */
            parse: function (input) {
                var ciphertext = Hex.parse(input);
                return CipherParams.create({
                    ciphertext: ciphertext
                });
            }
        };
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;

        // Lookup tables
        var SBOX = [];
        var INV_SBOX = [];
        var SUB_MIX_0 = [];
        var SUB_MIX_1 = [];
        var SUB_MIX_2 = [];
        var SUB_MIX_3 = [];
        var INV_SUB_MIX_0 = [];
        var INV_SUB_MIX_1 = [];
        var INV_SUB_MIX_2 = [];
        var INV_SUB_MIX_3 = [];

        // Compute lookup tables
        (function () {
            // Compute double table
            var d = [];
            for (var i = 0; i < 256; i++) {
                if (i < 128) {
                    d[i] = i << 1;
                } else {
                    d[i] = (i << 1) ^ 0x11b;
                }
            }

            // Walk GF(2^8)
            var x = 0;
            var xi = 0;
            for (var i = 0; i < 256; i++) {
                // Compute sbox
                var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
                sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
                SBOX[x] = sx;
                INV_SBOX[sx] = x;

                // Compute multiplication
                var x2 = d[x];
                var x4 = d[x2];
                var x8 = d[x4];

                // Compute sub bytes, mix columns tables
                var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
                SUB_MIX_0[x] = (t << 24) | (t >>> 8);
                SUB_MIX_1[x] = (t << 16) | (t >>> 16);
                SUB_MIX_2[x] = (t << 8) | (t >>> 24);
                SUB_MIX_3[x] = t;

                // Compute inv sub bytes, inv mix columns tables
                var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
                INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
                INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
                INV_SUB_MIX_2[sx] = (t << 8) | (t >>> 24);
                INV_SUB_MIX_3[sx] = t;

                // Compute next counter
                if (!x) {
                    x = xi = 1;
                } else {
                    x = x2 ^ d[d[d[x8 ^ x2]]];
                    xi ^= d[d[xi]];
                }
            }
        }());

        // Precomputed Rcon lookup
        var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

        /**
         * AES block cipher algorithm.
         */
        var AES = C_algo.AES = BlockCipher.extend({
            _doReset: function () {
                var t;

                // Skip reset of nRounds has been set before and key did not change
                if (this._nRounds && this._keyPriorReset === this._key) {
                    return;
                }

                // Shortcuts
                var key = this._keyPriorReset = this._key;
                var keyWords = key.words;
                var keySize = key.sigBytes / 4;

                // Compute number of rounds
                var nRounds = this._nRounds = keySize + 6;

                // Compute number of key schedule rows
                var ksRows = (nRounds + 1) * 4;

                // Compute key schedule
                var keySchedule = this._keySchedule = [];
                for (var ksRow = 0; ksRow < ksRows; ksRow++) {
                    if (ksRow < keySize) {
                        keySchedule[ksRow] = keyWords[ksRow];
                    } else {
                        t = keySchedule[ksRow - 1];

                        if (!(ksRow % keySize)) {
                            // Rot word
                            t = (t << 8) | (t >>> 24);

                            // Sub word
                            t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

                            // Mix Rcon
                            t ^= RCON[(ksRow / keySize) | 0] << 24;
                        } else if (keySize > 6 && ksRow % keySize == 4) {
                            // Sub word
                            t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
                        }

                        keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
                    }
                }

                // Compute inv key schedule
                var invKeySchedule = this._invKeySchedule = [];
                for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
                    var ksRow = ksRows - invKsRow;

                    if (invKsRow % 4) {
                        var t = keySchedule[ksRow];
                    } else {
                        var t = keySchedule[ksRow - 4];
                    }

                    if (invKsRow < 4 || ksRow <= 4) {
                        invKeySchedule[invKsRow] = t;
                    } else {
                        invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
                            INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
                    }
                }
            },

            encryptBlock: function (M, offset) {
                this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
            },

            decryptBlock: function (M, offset) {
                // Swap 2nd and 4th rows
                var t = M[offset + 1];
                M[offset + 1] = M[offset + 3];
                M[offset + 3] = t;

                this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

                // Inv swap 2nd and 4th rows
                var t = M[offset + 1];
                M[offset + 1] = M[offset + 3];
                M[offset + 3] = t;
            },

            _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
                // Shortcut
                var nRounds = this._nRounds;

                // Get input, add round key
                var s0 = M[offset] ^ keySchedule[0];
                var s1 = M[offset + 1] ^ keySchedule[1];
                var s2 = M[offset + 2] ^ keySchedule[2];
                var s3 = M[offset + 3] ^ keySchedule[3];

                // Key schedule row counter
                var ksRow = 4;

                // Rounds
                for (var round = 1; round < nRounds; round++) {
                    // Shift rows, sub bytes, mix columns, add round key
                    var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
                    var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
                    var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
                    var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

                    // Update state
                    s0 = t0;
                    s1 = t1;
                    s2 = t2;
                    s3 = t3;
                }

                // Shift rows, sub bytes, add round key
                var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
                var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
                var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
                var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

                // Set output
                M[offset] = t0;
                M[offset + 1] = t1;
                M[offset + 2] = t2;
                M[offset + 3] = t3;
            },

            keySize: 256 / 32
        });

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
         */
        C.AES = BlockCipher._createHelper(AES);
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;

        // Permuted Choice 1 constants
        var PC1 = [
            57, 49, 41, 33, 25, 17, 9, 1,
            58, 50, 42, 34, 26, 18, 10, 2,
            59, 51, 43, 35, 27, 19, 11, 3,
            60, 52, 44, 36, 63, 55, 47, 39,
            31, 23, 15, 7, 62, 54, 46, 38,
            30, 22, 14, 6, 61, 53, 45, 37,
            29, 21, 13, 5, 28, 20, 12, 4
        ];

        // Permuted Choice 2 constants
        var PC2 = [
            14, 17, 11, 24, 1, 5,
            3, 28, 15, 6, 21, 10,
            23, 19, 12, 4, 26, 8,
            16, 7, 27, 20, 13, 2,
            41, 52, 31, 37, 47, 55,
            30, 40, 51, 45, 33, 48,
            44, 49, 39, 56, 34, 53,
            46, 42, 50, 36, 29, 32
        ];

        // Cumulative bit shift constants
        var BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

        // SBOXes and round permutation constants
        var SBOX_P = [{
                0x0: 0x808200,
                0x10000000: 0x8000,
                0x20000000: 0x808002,
                0x30000000: 0x2,
                0x40000000: 0x200,
                0x50000000: 0x808202,
                0x60000000: 0x800202,
                0x70000000: 0x800000,
                0x80000000: 0x202,
                0x90000000: 0x800200,
                0xa0000000: 0x8200,
                0xb0000000: 0x808000,
                0xc0000000: 0x8002,
                0xd0000000: 0x800002,
                0xe0000000: 0x0,
                0xf0000000: 0x8202,
                0x8000000: 0x0,
                0x18000000: 0x808202,
                0x28000000: 0x8202,
                0x38000000: 0x8000,
                0x48000000: 0x808200,
                0x58000000: 0x200,
                0x68000000: 0x808002,
                0x78000000: 0x2,
                0x88000000: 0x800200,
                0x98000000: 0x8200,
                0xa8000000: 0x808000,
                0xb8000000: 0x800202,
                0xc8000000: 0x800002,
                0xd8000000: 0x8002,
                0xe8000000: 0x202,
                0xf8000000: 0x800000,
                0x1: 0x8000,
                0x10000001: 0x2,
                0x20000001: 0x808200,
                0x30000001: 0x800000,
                0x40000001: 0x808002,
                0x50000001: 0x8200,
                0x60000001: 0x200,
                0x70000001: 0x800202,
                0x80000001: 0x808202,
                0x90000001: 0x808000,
                0xa0000001: 0x800002,
                0xb0000001: 0x8202,
                0xc0000001: 0x202,
                0xd0000001: 0x800200,
                0xe0000001: 0x8002,
                0xf0000001: 0x0,
                0x8000001: 0x808202,
                0x18000001: 0x808000,
                0x28000001: 0x800000,
                0x38000001: 0x200,
                0x48000001: 0x8000,
                0x58000001: 0x800002,
                0x68000001: 0x2,
                0x78000001: 0x8202,
                0x88000001: 0x8002,
                0x98000001: 0x800202,
                0xa8000001: 0x202,
                0xb8000001: 0x808200,
                0xc8000001: 0x800200,
                0xd8000001: 0x0,
                0xe8000001: 0x8200,
                0xf8000001: 0x808002
            },
            {
                0x0: 0x40084010,
                0x1000000: 0x4000,
                0x2000000: 0x80000,
                0x3000000: 0x40080010,
                0x4000000: 0x40000010,
                0x5000000: 0x40084000,
                0x6000000: 0x40004000,
                0x7000000: 0x10,
                0x8000000: 0x84000,
                0x9000000: 0x40004010,
                0xa000000: 0x40000000,
                0xb000000: 0x84010,
                0xc000000: 0x80010,
                0xd000000: 0x0,
                0xe000000: 0x4010,
                0xf000000: 0x40080000,
                0x800000: 0x40004000,
                0x1800000: 0x84010,
                0x2800000: 0x10,
                0x3800000: 0x40004010,
                0x4800000: 0x40084010,
                0x5800000: 0x40000000,
                0x6800000: 0x80000,
                0x7800000: 0x40080010,
                0x8800000: 0x80010,
                0x9800000: 0x0,
                0xa800000: 0x4000,
                0xb800000: 0x40080000,
                0xc800000: 0x40000010,
                0xd800000: 0x84000,
                0xe800000: 0x40084000,
                0xf800000: 0x4010,
                0x10000000: 0x0,
                0x11000000: 0x40080010,
                0x12000000: 0x40004010,
                0x13000000: 0x40084000,
                0x14000000: 0x40080000,
                0x15000000: 0x10,
                0x16000000: 0x84010,
                0x17000000: 0x4000,
                0x18000000: 0x4010,
                0x19000000: 0x80000,
                0x1a000000: 0x80010,
                0x1b000000: 0x40000010,
                0x1c000000: 0x84000,
                0x1d000000: 0x40004000,
                0x1e000000: 0x40000000,
                0x1f000000: 0x40084010,
                0x10800000: 0x84010,
                0x11800000: 0x80000,
                0x12800000: 0x40080000,
                0x13800000: 0x4000,
                0x14800000: 0x40004000,
                0x15800000: 0x40084010,
                0x16800000: 0x10,
                0x17800000: 0x40000000,
                0x18800000: 0x40084000,
                0x19800000: 0x40000010,
                0x1a800000: 0x40004010,
                0x1b800000: 0x80010,
                0x1c800000: 0x0,
                0x1d800000: 0x4010,
                0x1e800000: 0x40080010,
                0x1f800000: 0x84000
            },
            {
                0x0: 0x104,
                0x100000: 0x0,
                0x200000: 0x4000100,
                0x300000: 0x10104,
                0x400000: 0x10004,
                0x500000: 0x4000004,
                0x600000: 0x4010104,
                0x700000: 0x4010000,
                0x800000: 0x4000000,
                0x900000: 0x4010100,
                0xa00000: 0x10100,
                0xb00000: 0x4010004,
                0xc00000: 0x4000104,
                0xd00000: 0x10000,
                0xe00000: 0x4,
                0xf00000: 0x100,
                0x80000: 0x4010100,
                0x180000: 0x4010004,
                0x280000: 0x0,
                0x380000: 0x4000100,
                0x480000: 0x4000004,
                0x580000: 0x10000,
                0x680000: 0x10004,
                0x780000: 0x104,
                0x880000: 0x4,
                0x980000: 0x100,
                0xa80000: 0x4010000,
                0xb80000: 0x10104,
                0xc80000: 0x10100,
                0xd80000: 0x4000104,
                0xe80000: 0x4010104,
                0xf80000: 0x4000000,
                0x1000000: 0x4010100,
                0x1100000: 0x10004,
                0x1200000: 0x10000,
                0x1300000: 0x4000100,
                0x1400000: 0x100,
                0x1500000: 0x4010104,
                0x1600000: 0x4000004,
                0x1700000: 0x0,
                0x1800000: 0x4000104,
                0x1900000: 0x4000000,
                0x1a00000: 0x4,
                0x1b00000: 0x10100,
                0x1c00000: 0x4010000,
                0x1d00000: 0x104,
                0x1e00000: 0x10104,
                0x1f00000: 0x4010004,
                0x1080000: 0x4000000,
                0x1180000: 0x104,
                0x1280000: 0x4010100,
                0x1380000: 0x0,
                0x1480000: 0x10004,
                0x1580000: 0x4000100,
                0x1680000: 0x100,
                0x1780000: 0x4010004,
                0x1880000: 0x10000,
                0x1980000: 0x4010104,
                0x1a80000: 0x10104,
                0x1b80000: 0x4000004,
                0x1c80000: 0x4000104,
                0x1d80000: 0x4010000,
                0x1e80000: 0x4,
                0x1f80000: 0x10100
            },
            {
                0x0: 0x80401000,
                0x10000: 0x80001040,
                0x20000: 0x401040,
                0x30000: 0x80400000,
                0x40000: 0x0,
                0x50000: 0x401000,
                0x60000: 0x80000040,
                0x70000: 0x400040,
                0x80000: 0x80000000,
                0x90000: 0x400000,
                0xa0000: 0x40,
                0xb0000: 0x80001000,
                0xc0000: 0x80400040,
                0xd0000: 0x1040,
                0xe0000: 0x1000,
                0xf0000: 0x80401040,
                0x8000: 0x80001040,
                0x18000: 0x40,
                0x28000: 0x80400040,
                0x38000: 0x80001000,
                0x48000: 0x401000,
                0x58000: 0x80401040,
                0x68000: 0x0,
                0x78000: 0x80400000,
                0x88000: 0x1000,
                0x98000: 0x80401000,
                0xa8000: 0x400000,
                0xb8000: 0x1040,
                0xc8000: 0x80000000,
                0xd8000: 0x400040,
                0xe8000: 0x401040,
                0xf8000: 0x80000040,
                0x100000: 0x400040,
                0x110000: 0x401000,
                0x120000: 0x80000040,
                0x130000: 0x0,
                0x140000: 0x1040,
                0x150000: 0x80400040,
                0x160000: 0x80401000,
                0x170000: 0x80001040,
                0x180000: 0x80401040,
                0x190000: 0x80000000,
                0x1a0000: 0x80400000,
                0x1b0000: 0x401040,
                0x1c0000: 0x80001000,
                0x1d0000: 0x400000,
                0x1e0000: 0x40,
                0x1f0000: 0x1000,
                0x108000: 0x80400000,
                0x118000: 0x80401040,
                0x128000: 0x0,
                0x138000: 0x401000,
                0x148000: 0x400040,
                0x158000: 0x80000000,
                0x168000: 0x80001040,
                0x178000: 0x40,
                0x188000: 0x80000040,
                0x198000: 0x1000,
                0x1a8000: 0x80001000,
                0x1b8000: 0x80400040,
                0x1c8000: 0x1040,
                0x1d8000: 0x80401000,
                0x1e8000: 0x400000,
                0x1f8000: 0x401040
            },
            {
                0x0: 0x80,
                0x1000: 0x1040000,
                0x2000: 0x40000,
                0x3000: 0x20000000,
                0x4000: 0x20040080,
                0x5000: 0x1000080,
                0x6000: 0x21000080,
                0x7000: 0x40080,
                0x8000: 0x1000000,
                0x9000: 0x20040000,
                0xa000: 0x20000080,
                0xb000: 0x21040080,
                0xc000: 0x21040000,
                0xd000: 0x0,
                0xe000: 0x1040080,
                0xf000: 0x21000000,
                0x800: 0x1040080,
                0x1800: 0x21000080,
                0x2800: 0x80,
                0x3800: 0x1040000,
                0x4800: 0x40000,
                0x5800: 0x20040080,
                0x6800: 0x21040000,
                0x7800: 0x20000000,
                0x8800: 0x20040000,
                0x9800: 0x0,
                0xa800: 0x21040080,
                0xb800: 0x1000080,
                0xc800: 0x20000080,
                0xd800: 0x21000000,
                0xe800: 0x1000000,
                0xf800: 0x40080,
                0x10000: 0x40000,
                0x11000: 0x80,
                0x12000: 0x20000000,
                0x13000: 0x21000080,
                0x14000: 0x1000080,
                0x15000: 0x21040000,
                0x16000: 0x20040080,
                0x17000: 0x1000000,
                0x18000: 0x21040080,
                0x19000: 0x21000000,
                0x1a000: 0x1040000,
                0x1b000: 0x20040000,
                0x1c000: 0x40080,
                0x1d000: 0x20000080,
                0x1e000: 0x0,
                0x1f000: 0x1040080,
                0x10800: 0x21000080,
                0x11800: 0x1000000,
                0x12800: 0x1040000,
                0x13800: 0x20040080,
                0x14800: 0x20000000,
                0x15800: 0x1040080,
                0x16800: 0x80,
                0x17800: 0x21040000,
                0x18800: 0x40080,
                0x19800: 0x21040080,
                0x1a800: 0x0,
                0x1b800: 0x21000000,
                0x1c800: 0x1000080,
                0x1d800: 0x40000,
                0x1e800: 0x20040000,
                0x1f800: 0x20000080
            },
            {
                0x0: 0x10000008,
                0x100: 0x2000,
                0x200: 0x10200000,
                0x300: 0x10202008,
                0x400: 0x10002000,
                0x500: 0x200000,
                0x600: 0x200008,
                0x700: 0x10000000,
                0x800: 0x0,
                0x900: 0x10002008,
                0xa00: 0x202000,
                0xb00: 0x8,
                0xc00: 0x10200008,
                0xd00: 0x202008,
                0xe00: 0x2008,
                0xf00: 0x10202000,
                0x80: 0x10200000,
                0x180: 0x10202008,
                0x280: 0x8,
                0x380: 0x200000,
                0x480: 0x202008,
                0x580: 0x10000008,
                0x680: 0x10002000,
                0x780: 0x2008,
                0x880: 0x200008,
                0x980: 0x2000,
                0xa80: 0x10002008,
                0xb80: 0x10200008,
                0xc80: 0x0,
                0xd80: 0x10202000,
                0xe80: 0x202000,
                0xf80: 0x10000000,
                0x1000: 0x10002000,
                0x1100: 0x10200008,
                0x1200: 0x10202008,
                0x1300: 0x2008,
                0x1400: 0x200000,
                0x1500: 0x10000000,
                0x1600: 0x10000008,
                0x1700: 0x202000,
                0x1800: 0x202008,
                0x1900: 0x0,
                0x1a00: 0x8,
                0x1b00: 0x10200000,
                0x1c00: 0x2000,
                0x1d00: 0x10002008,
                0x1e00: 0x10202000,
                0x1f00: 0x200008,
                0x1080: 0x8,
                0x1180: 0x202000,
                0x1280: 0x200000,
                0x1380: 0x10000008,
                0x1480: 0x10002000,
                0x1580: 0x2008,
                0x1680: 0x10202008,
                0x1780: 0x10200000,
                0x1880: 0x10202000,
                0x1980: 0x10200008,
                0x1a80: 0x2000,
                0x1b80: 0x202008,
                0x1c80: 0x200008,
                0x1d80: 0x0,
                0x1e80: 0x10000000,
                0x1f80: 0x10002008
            },
            {
                0x0: 0x100000,
                0x10: 0x2000401,
                0x20: 0x400,
                0x30: 0x100401,
                0x40: 0x2100401,
                0x50: 0x0,
                0x60: 0x1,
                0x70: 0x2100001,
                0x80: 0x2000400,
                0x90: 0x100001,
                0xa0: 0x2000001,
                0xb0: 0x2100400,
                0xc0: 0x2100000,
                0xd0: 0x401,
                0xe0: 0x100400,
                0xf0: 0x2000000,
                0x8: 0x2100001,
                0x18: 0x0,
                0x28: 0x2000401,
                0x38: 0x2100400,
                0x48: 0x100000,
                0x58: 0x2000001,
                0x68: 0x2000000,
                0x78: 0x401,
                0x88: 0x100401,
                0x98: 0x2000400,
                0xa8: 0x2100000,
                0xb8: 0x100001,
                0xc8: 0x400,
                0xd8: 0x2100401,
                0xe8: 0x1,
                0xf8: 0x100400,
                0x100: 0x2000000,
                0x110: 0x100000,
                0x120: 0x2000401,
                0x130: 0x2100001,
                0x140: 0x100001,
                0x150: 0x2000400,
                0x160: 0x2100400,
                0x170: 0x100401,
                0x180: 0x401,
                0x190: 0x2100401,
                0x1a0: 0x100400,
                0x1b0: 0x1,
                0x1c0: 0x0,
                0x1d0: 0x2100000,
                0x1e0: 0x2000001,
                0x1f0: 0x400,
                0x108: 0x100400,
                0x118: 0x2000401,
                0x128: 0x2100001,
                0x138: 0x1,
                0x148: 0x2000000,
                0x158: 0x100000,
                0x168: 0x401,
                0x178: 0x2100400,
                0x188: 0x2000001,
                0x198: 0x2100000,
                0x1a8: 0x0,
                0x1b8: 0x2100401,
                0x1c8: 0x100401,
                0x1d8: 0x400,
                0x1e8: 0x2000400,
                0x1f8: 0x100001
            },
            {
                0x0: 0x8000820,
                0x1: 0x20000,
                0x2: 0x8000000,
                0x3: 0x20,
                0x4: 0x20020,
                0x5: 0x8020820,
                0x6: 0x8020800,
                0x7: 0x800,
                0x8: 0x8020000,
                0x9: 0x8000800,
                0xa: 0x20800,
                0xb: 0x8020020,
                0xc: 0x820,
                0xd: 0x0,
                0xe: 0x8000020,
                0xf: 0x20820,
                0x80000000: 0x800,
                0x80000001: 0x8020820,
                0x80000002: 0x8000820,
                0x80000003: 0x8000000,
                0x80000004: 0x8020000,
                0x80000005: 0x20800,
                0x80000006: 0x20820,
                0x80000007: 0x20,
                0x80000008: 0x8000020,
                0x80000009: 0x820,
                0x8000000a: 0x20020,
                0x8000000b: 0x8020800,
                0x8000000c: 0x0,
                0x8000000d: 0x8020020,
                0x8000000e: 0x8000800,
                0x8000000f: 0x20000,
                0x10: 0x20820,
                0x11: 0x8020800,
                0x12: 0x20,
                0x13: 0x800,
                0x14: 0x8000800,
                0x15: 0x8000020,
                0x16: 0x8020020,
                0x17: 0x20000,
                0x18: 0x0,
                0x19: 0x20020,
                0x1a: 0x8020000,
                0x1b: 0x8000820,
                0x1c: 0x8020820,
                0x1d: 0x20800,
                0x1e: 0x820,
                0x1f: 0x8000000,
                0x80000010: 0x20000,
                0x80000011: 0x800,
                0x80000012: 0x8020020,
                0x80000013: 0x20820,
                0x80000014: 0x20,
                0x80000015: 0x8020000,
                0x80000016: 0x8000000,
                0x80000017: 0x8000820,
                0x80000018: 0x8020820,
                0x80000019: 0x8000020,
                0x8000001a: 0x8000800,
                0x8000001b: 0x0,
                0x8000001c: 0x20800,
                0x8000001d: 0x820,
                0x8000001e: 0x20020,
                0x8000001f: 0x8020800
            }
        ];

        // Masks that select the SBOX input
        var SBOX_MASK = [
            0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
            0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
        ];

        /**
         * DES block cipher algorithm.
         */
        var DES = C_algo.DES = BlockCipher.extend({
            _doReset: function () {
                // Shortcuts
                var key = this._key;
                var keyWords = key.words;

                // Select 56 bits according to PC1
                var keyBits = [];
                for (var i = 0; i < 56; i++) {
                    var keyBitPos = PC1[i] - 1;
                    keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
                }

                // Assemble 16 subkeys
                var subKeys = this._subKeys = [];
                for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
                    // Create subkey
                    var subKey = subKeys[nSubKey] = [];

                    // Shortcut
                    var bitShift = BIT_SHIFTS[nSubKey];

                    // Select 48 bits according to PC2
                    for (var i = 0; i < 24; i++) {
                        // Select from the left 28 key bits
                        subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);

                        // Select from the right 28 key bits
                        subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
                    }

                    // Since each subkey is applied to an expanded 32-bit input,
                    // the subkey can be broken into 8 values scaled to 32-bits,
                    // which allows the key to be used without expansion
                    subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
                    for (var i = 1; i < 7; i++) {
                        subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
                    }
                    subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
                }

                // Compute inverse subkeys
                var invSubKeys = this._invSubKeys = [];
                for (var i = 0; i < 16; i++) {
                    invSubKeys[i] = subKeys[15 - i];
                }
            },

            encryptBlock: function (M, offset) {
                this._doCryptBlock(M, offset, this._subKeys);
            },

            decryptBlock: function (M, offset) {
                this._doCryptBlock(M, offset, this._invSubKeys);
            },

            _doCryptBlock: function (M, offset, subKeys) {
                // Get input
                this._lBlock = M[offset];
                this._rBlock = M[offset + 1];

                // Initial permutation
                exchangeLR.call(this, 4, 0x0f0f0f0f);
                exchangeLR.call(this, 16, 0x0000ffff);
                exchangeRL.call(this, 2, 0x33333333);
                exchangeRL.call(this, 8, 0x00ff00ff);
                exchangeLR.call(this, 1, 0x55555555);

                // Rounds
                for (var round = 0; round < 16; round++) {
                    // Shortcuts
                    var subKey = subKeys[round];
                    var lBlock = this._lBlock;
                    var rBlock = this._rBlock;

                    // Feistel function
                    var f = 0;
                    for (var i = 0; i < 8; i++) {
                        f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
                    }
                    this._lBlock = rBlock;
                    this._rBlock = lBlock ^ f;
                }

                // Undo swap from last round
                var t = this._lBlock;
                this._lBlock = this._rBlock;
                this._rBlock = t;

                // Final permutation
                exchangeLR.call(this, 1, 0x55555555);
                exchangeRL.call(this, 8, 0x00ff00ff);
                exchangeRL.call(this, 2, 0x33333333);
                exchangeLR.call(this, 16, 0x0000ffff);
                exchangeLR.call(this, 4, 0x0f0f0f0f);

                // Set output
                M[offset] = this._lBlock;
                M[offset + 1] = this._rBlock;
            },

            keySize: 64 / 32,

            ivSize: 64 / 32,

            blockSize: 64 / 32
        });

        // Swap bits across the left and right words
        function exchangeLR(offset, mask) {
            var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
            this._rBlock ^= t;
            this._lBlock ^= t << offset;
        }

        function exchangeRL(offset, mask) {
            var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
            this._lBlock ^= t;
            this._rBlock ^= t << offset;
        }

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
         */
        C.DES = BlockCipher._createHelper(DES);

        /**
         * Triple-DES block cipher algorithm.
         */
        var TripleDES = C_algo.TripleDES = BlockCipher.extend({
            _doReset: function () {
                // Shortcuts
                var key = this._key;
                var keyWords = key.words;
                // Make sure the key length is valid (64, 128 or >= 192 bit)
                if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
                    throw new Error('Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.');
                }

                // Extend the key according to the keying options defined in 3DES standard
                var key1 = keyWords.slice(0, 2);
                var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
                var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);

                // Create DES instances
                this._des1 = DES.createEncryptor(WordArray.create(key1));
                this._des2 = DES.createEncryptor(WordArray.create(key2));
                this._des3 = DES.createEncryptor(WordArray.create(key3));
            },

            encryptBlock: function (M, offset) {
                this._des1.encryptBlock(M, offset);
                this._des2.decryptBlock(M, offset);
                this._des3.encryptBlock(M, offset);
            },

            decryptBlock: function (M, offset) {
                this._des3.decryptBlock(M, offset);
                this._des2.encryptBlock(M, offset);
                this._des1.decryptBlock(M, offset);
            },

            keySize: 192 / 32,

            ivSize: 64 / 32,

            blockSize: 64 / 32
        });

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
         */
        C.TripleDES = BlockCipher._createHelper(TripleDES);
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;

        /**
         * RC4 stream cipher algorithm.
         */
        var RC4 = C_algo.RC4 = StreamCipher.extend({
            _doReset: function () {
                // Shortcuts
                var key = this._key;
                var keyWords = key.words;
                var keySigBytes = key.sigBytes;

                // Init sbox
                var S = this._S = [];
                for (var i = 0; i < 256; i++) {
                    S[i] = i;
                }

                // Key setup
                for (var i = 0, j = 0; i < 256; i++) {
                    var keyByteIndex = i % keySigBytes;
                    var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;

                    j = (j + S[i] + keyByte) % 256;

                    // Swap
                    var t = S[i];
                    S[i] = S[j];
                    S[j] = t;
                }

                // Counters
                this._i = this._j = 0;
            },

            _doProcessBlock: function (M, offset) {
                M[offset] ^= generateKeystreamWord.call(this);
            },

            keySize: 256 / 32,

            ivSize: 0
        });

        function generateKeystreamWord() {
            // Shortcuts
            var S = this._S;
            var i = this._i;
            var j = this._j;

            // Generate keystream word
            var keystreamWord = 0;
            for (var n = 0; n < 4; n++) {
                i = (i + 1) % 256;
                j = (j + S[i]) % 256;

                // Swap
                var t = S[i];
                S[i] = S[j];
                S[j] = t;

                keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
            }

            // Update counters
            this._i = i;
            this._j = j;

            return keystreamWord;
        }

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
         */
        C.RC4 = StreamCipher._createHelper(RC4);

        /**
         * Modified RC4 stream cipher algorithm.
         */
        var RC4Drop = C_algo.RC4Drop = RC4.extend({
            /**
             * Configuration options.
             *
             * @property {number} drop The number of keystream words to drop. Default 192
             */
            cfg: RC4.cfg.extend({
                drop: 192
            }),

            _doReset: function () {
                RC4._doReset.call(this);

                // Drop
                for (var i = this.cfg.drop; i > 0; i--) {
                    generateKeystreamWord.call(this);
                }
            }
        });

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
         */
        C.RC4Drop = StreamCipher._createHelper(RC4Drop);
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;

        // Reusable objects
        var S = [];
        var C_ = [];
        var G = [];

        /**
         * Rabbit stream cipher algorithm
         */
        var Rabbit = C_algo.Rabbit = StreamCipher.extend({
            _doReset: function () {
                // Shortcuts
                var K = this._key.words;
                var iv = this.cfg.iv;

                // Swap endian
                for (var i = 0; i < 4; i++) {
                    K[i] = (((K[i] << 8) | (K[i] >>> 24)) & 0x00ff00ff) |
                        (((K[i] << 24) | (K[i] >>> 8)) & 0xff00ff00);
                }

                // Generate initial state values
                var X = this._X = [
                    K[0], (K[3] << 16) | (K[2] >>> 16),
                    K[1], (K[0] << 16) | (K[3] >>> 16),
                    K[2], (K[1] << 16) | (K[0] >>> 16),
                    K[3], (K[2] << 16) | (K[1] >>> 16)
                ];

                // Generate initial counter values
                var C = this._C = [
                    (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
                    (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
                    (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
                    (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
                ];

                // Carry bit
                this._b = 0;

                // Iterate the system four times
                for (var i = 0; i < 4; i++) {
                    nextState.call(this);
                }

                // Modify the counters
                for (var i = 0; i < 8; i++) {
                    C[i] ^= X[(i + 4) & 7];
                }

                // IV setup
                if (iv) {
                    // Shortcuts
                    var IV = iv.words;
                    var IV_0 = IV[0];
                    var IV_1 = IV[1];

                    // Generate four subvectors
                    var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
                    var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
                    var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
                    var i3 = (i2 << 16) | (i0 & 0x0000ffff);

                    // Modify counter values
                    C[0] ^= i0;
                    C[1] ^= i1;
                    C[2] ^= i2;
                    C[3] ^= i3;
                    C[4] ^= i0;
                    C[5] ^= i1;
                    C[6] ^= i2;
                    C[7] ^= i3;

                    // Iterate the system four times
                    for (var i = 0; i < 4; i++) {
                        nextState.call(this);
                    }
                }
            },

            _doProcessBlock: function (M, offset) {
                // Shortcut
                var X = this._X;

                // Iterate the system
                nextState.call(this);

                // Generate four keystream words
                S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
                S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
                S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
                S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

                for (var i = 0; i < 4; i++) {
                    // Swap endian
                    S[i] = (((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff) |
                        (((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00);

                    // Encrypt
                    M[offset + i] ^= S[i];
                }
            },

            blockSize: 128 / 32,

            ivSize: 64 / 32
        });

        function nextState() {
            // Shortcuts
            var X = this._X;
            var C = this._C;

            // Save old counter values
            for (var i = 0; i < 8; i++) {
                C_[i] = C[i];
            }

            // Calculate new counter values
            C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
            C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
            C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
            C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
            C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
            C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
            C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
            C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
            this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

            // Calculate the g-values
            for (var i = 0; i < 8; i++) {
                var gx = X[i] + C[i];

                // Construct high and low argument for squaring
                var ga = gx & 0xffff;
                var gb = gx >>> 16;

                // Calculate high and low result of squaring
                var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
                var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

                // High XOR low
                G[i] = gh ^ gl;
            }

            // Calculate new state values
            X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
            X[1] = (G[1] + ((G[0] << 8) | (G[0] >>> 24)) + G[7]) | 0;
            X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
            X[3] = (G[3] + ((G[2] << 8) | (G[2] >>> 24)) + G[1]) | 0;
            X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
            X[5] = (G[5] + ((G[4] << 8) | (G[4] >>> 24)) + G[3]) | 0;
            X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
            X[7] = (G[7] + ((G[6] << 8) | (G[6] >>> 24)) + G[5]) | 0;
        }

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
         */
        C.Rabbit = StreamCipher._createHelper(Rabbit);
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;

        // Reusable objects
        var S = [];
        var C_ = [];
        var G = [];

        /**
         * Rabbit stream cipher algorithm.
         *
         * This is a legacy version that neglected to convert the key to little-endian.
         * This error doesn't affect the cipher's security,
         * but it does affect its compatibility with other implementations.
         */
        var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
            _doReset: function () {
                // Shortcuts
                var K = this._key.words;
                var iv = this.cfg.iv;

                // Generate initial state values
                var X = this._X = [
                    K[0], (K[3] << 16) | (K[2] >>> 16),
                    K[1], (K[0] << 16) | (K[3] >>> 16),
                    K[2], (K[1] << 16) | (K[0] >>> 16),
                    K[3], (K[2] << 16) | (K[1] >>> 16)
                ];

                // Generate initial counter values
                var C = this._C = [
                    (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
                    (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
                    (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
                    (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
                ];

                // Carry bit
                this._b = 0;

                // Iterate the system four times
                for (var i = 0; i < 4; i++) {
                    nextState.call(this);
                }

                // Modify the counters
                for (var i = 0; i < 8; i++) {
                    C[i] ^= X[(i + 4) & 7];
                }

                // IV setup
                if (iv) {
                    // Shortcuts
                    var IV = iv.words;
                    var IV_0 = IV[0];
                    var IV_1 = IV[1];

                    // Generate four subvectors
                    var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
                    var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
                    var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
                    var i3 = (i2 << 16) | (i0 & 0x0000ffff);

                    // Modify counter values
                    C[0] ^= i0;
                    C[1] ^= i1;
                    C[2] ^= i2;
                    C[3] ^= i3;
                    C[4] ^= i0;
                    C[5] ^= i1;
                    C[6] ^= i2;
                    C[7] ^= i3;

                    // Iterate the system four times
                    for (var i = 0; i < 4; i++) {
                        nextState.call(this);
                    }
                }
            },

            _doProcessBlock: function (M, offset) {
                // Shortcut
                var X = this._X;

                // Iterate the system
                nextState.call(this);

                // Generate four keystream words
                S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
                S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
                S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
                S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

                for (var i = 0; i < 4; i++) {
                    // Swap endian
                    S[i] = (((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff) |
                        (((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00);

                    // Encrypt
                    M[offset + i] ^= S[i];
                }
            },

            blockSize: 128 / 32,

            ivSize: 64 / 32
        });

        function nextState() {
            // Shortcuts
            var X = this._X;
            var C = this._C;

            // Save old counter values
            for (var i = 0; i < 8; i++) {
                C_[i] = C[i];
            }

            // Calculate new counter values
            C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
            C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
            C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
            C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
            C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
            C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
            C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
            C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
            this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;

            // Calculate the g-values
            for (var i = 0; i < 8; i++) {
                var gx = X[i] + C[i];

                // Construct high and low argument for squaring
                var ga = gx & 0xffff;
                var gb = gx >>> 16;

                // Calculate high and low result of squaring
                var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
                var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);

                // High XOR low
                G[i] = gh ^ gl;
            }

            // Calculate new state values
            X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
            X[1] = (G[1] + ((G[0] << 8) | (G[0] >>> 24)) + G[7]) | 0;
            X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
            X[3] = (G[3] + ((G[2] << 8) | (G[2] >>> 24)) + G[1]) | 0;
            X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
            X[5] = (G[5] + ((G[4] << 8) | (G[4] >>> 24)) + G[3]) | 0;
            X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
            X[7] = (G[7] + ((G[6] << 8) | (G[6] >>> 24)) + G[5]) | 0;
        }

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.RabbitLegacy.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.RabbitLegacy.decrypt(ciphertext, key, cfg);
         */
        C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
    }());


    (function () {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;

        const N = 16;

        //Origin pbox and sbox, derived from PI
        const ORIG_P = [
            0x243F6A88, 0x85A308D3, 0x13198A2E, 0x03707344,
            0xA4093822, 0x299F31D0, 0x082EFA98, 0xEC4E6C89,
            0x452821E6, 0x38D01377, 0xBE5466CF, 0x34E90C6C,
            0xC0AC29B7, 0xC97C50DD, 0x3F84D5B5, 0xB5470917,
            0x9216D5D9, 0x8979FB1B
        ];

        const ORIG_S = [
            [0xD1310BA6, 0x98DFB5AC, 0x2FFD72DB, 0xD01ADFB7,
                0xB8E1AFED, 0x6A267E96, 0xBA7C9045, 0xF12C7F99,
                0x24A19947, 0xB3916CF7, 0x0801F2E2, 0x858EFC16,
                0x636920D8, 0x71574E69, 0xA458FEA3, 0xF4933D7E,
                0x0D95748F, 0x728EB658, 0x718BCD58, 0x82154AEE,
                0x7B54A41D, 0xC25A59B5, 0x9C30D539, 0x2AF26013,
                0xC5D1B023, 0x286085F0, 0xCA417918, 0xB8DB38EF,
                0x8E79DCB0, 0x603A180E, 0x6C9E0E8B, 0xB01E8A3E,
                0xD71577C1, 0xBD314B27, 0x78AF2FDA, 0x55605C60,
                0xE65525F3, 0xAA55AB94, 0x57489862, 0x63E81440,
                0x55CA396A, 0x2AAB10B6, 0xB4CC5C34, 0x1141E8CE,
                0xA15486AF, 0x7C72E993, 0xB3EE1411, 0x636FBC2A,
                0x2BA9C55D, 0x741831F6, 0xCE5C3E16, 0x9B87931E,
                0xAFD6BA33, 0x6C24CF5C, 0x7A325381, 0x28958677,
                0x3B8F4898, 0x6B4BB9AF, 0xC4BFE81B, 0x66282193,
                0x61D809CC, 0xFB21A991, 0x487CAC60, 0x5DEC8032,
                0xEF845D5D, 0xE98575B1, 0xDC262302, 0xEB651B88,
                0x23893E81, 0xD396ACC5, 0x0F6D6FF3, 0x83F44239,
                0x2E0B4482, 0xA4842004, 0x69C8F04A, 0x9E1F9B5E,
                0x21C66842, 0xF6E96C9A, 0x670C9C61, 0xABD388F0,
                0x6A51A0D2, 0xD8542F68, 0x960FA728, 0xAB5133A3,
                0x6EEF0B6C, 0x137A3BE4, 0xBA3BF050, 0x7EFB2A98,
                0xA1F1651D, 0x39AF0176, 0x66CA593E, 0x82430E88,
                0x8CEE8619, 0x456F9FB4, 0x7D84A5C3, 0x3B8B5EBE,
                0xE06F75D8, 0x85C12073, 0x401A449F, 0x56C16AA6,
                0x4ED3AA62, 0x363F7706, 0x1BFEDF72, 0x429B023D,
                0x37D0D724, 0xD00A1248, 0xDB0FEAD3, 0x49F1C09B,
                0x075372C9, 0x80991B7B, 0x25D479D8, 0xF6E8DEF7,
                0xE3FE501A, 0xB6794C3B, 0x976CE0BD, 0x04C006BA,
                0xC1A94FB6, 0x409F60C4, 0x5E5C9EC2, 0x196A2463,
                0x68FB6FAF, 0x3E6C53B5, 0x1339B2EB, 0x3B52EC6F,
                0x6DFC511F, 0x9B30952C, 0xCC814544, 0xAF5EBD09,
                0xBEE3D004, 0xDE334AFD, 0x660F2807, 0x192E4BB3,
                0xC0CBA857, 0x45C8740F, 0xD20B5F39, 0xB9D3FBDB,
                0x5579C0BD, 0x1A60320A, 0xD6A100C6, 0x402C7279,
                0x679F25FE, 0xFB1FA3CC, 0x8EA5E9F8, 0xDB3222F8,
                0x3C7516DF, 0xFD616B15, 0x2F501EC8, 0xAD0552AB,
                0x323DB5FA, 0xFD238760, 0x53317B48, 0x3E00DF82,
                0x9E5C57BB, 0xCA6F8CA0, 0x1A87562E, 0xDF1769DB,
                0xD542A8F6, 0x287EFFC3, 0xAC6732C6, 0x8C4F5573,
                0x695B27B0, 0xBBCA58C8, 0xE1FFA35D, 0xB8F011A0,
                0x10FA3D98, 0xFD2183B8, 0x4AFCB56C, 0x2DD1D35B,
                0x9A53E479, 0xB6F84565, 0xD28E49BC, 0x4BFB9790,
                0xE1DDF2DA, 0xA4CB7E33, 0x62FB1341, 0xCEE4C6E8,
                0xEF20CADA, 0x36774C01, 0xD07E9EFE, 0x2BF11FB4,
                0x95DBDA4D, 0xAE909198, 0xEAAD8E71, 0x6B93D5A0,
                0xD08ED1D0, 0xAFC725E0, 0x8E3C5B2F, 0x8E7594B7,
                0x8FF6E2FB, 0xF2122B64, 0x8888B812, 0x900DF01C,
                0x4FAD5EA0, 0x688FC31C, 0xD1CFF191, 0xB3A8C1AD,
                0x2F2F2218, 0xBE0E1777, 0xEA752DFE, 0x8B021FA1,
                0xE5A0CC0F, 0xB56F74E8, 0x18ACF3D6, 0xCE89E299,
                0xB4A84FE0, 0xFD13E0B7, 0x7CC43B81, 0xD2ADA8D9,
                0x165FA266, 0x80957705, 0x93CC7314, 0x211A1477,
                0xE6AD2065, 0x77B5FA86, 0xC75442F5, 0xFB9D35CF,
                0xEBCDAF0C, 0x7B3E89A0, 0xD6411BD3, 0xAE1E7E49,
                0x00250E2D, 0x2071B35E, 0x226800BB, 0x57B8E0AF,
                0x2464369B, 0xF009B91E, 0x5563911D, 0x59DFA6AA,
                0x78C14389, 0xD95A537F, 0x207D5BA2, 0x02E5B9C5,
                0x83260376, 0x6295CFA9, 0x11C81968, 0x4E734A41,
                0xB3472DCA, 0x7B14A94A, 0x1B510052, 0x9A532915,
                0xD60F573F, 0xBC9BC6E4, 0x2B60A476, 0x81E67400,
                0x08BA6FB5, 0x571BE91F, 0xF296EC6B, 0x2A0DD915,
                0xB6636521, 0xE7B9F9B6, 0xFF34052E, 0xC5855664,
                0x53B02D5D, 0xA99F8FA1, 0x08BA4799, 0x6E85076A
            ],
            [0x4B7A70E9, 0xB5B32944, 0xDB75092E, 0xC4192623,
                0xAD6EA6B0, 0x49A7DF7D, 0x9CEE60B8, 0x8FEDB266,
                0xECAA8C71, 0x699A17FF, 0x5664526C, 0xC2B19EE1,
                0x193602A5, 0x75094C29, 0xA0591340, 0xE4183A3E,
                0x3F54989A, 0x5B429D65, 0x6B8FE4D6, 0x99F73FD6,
                0xA1D29C07, 0xEFE830F5, 0x4D2D38E6, 0xF0255DC1,
                0x4CDD2086, 0x8470EB26, 0x6382E9C6, 0x021ECC5E,
                0x09686B3F, 0x3EBAEFC9, 0x3C971814, 0x6B6A70A1,
                0x687F3584, 0x52A0E286, 0xB79C5305, 0xAA500737,
                0x3E07841C, 0x7FDEAE5C, 0x8E7D44EC, 0x5716F2B8,
                0xB03ADA37, 0xF0500C0D, 0xF01C1F04, 0x0200B3FF,
                0xAE0CF51A, 0x3CB574B2, 0x25837A58, 0xDC0921BD,
                0xD19113F9, 0x7CA92FF6, 0x94324773, 0x22F54701,
                0x3AE5E581, 0x37C2DADC, 0xC8B57634, 0x9AF3DDA7,
                0xA9446146, 0x0FD0030E, 0xECC8C73E, 0xA4751E41,
                0xE238CD99, 0x3BEA0E2F, 0x3280BBA1, 0x183EB331,
                0x4E548B38, 0x4F6DB908, 0x6F420D03, 0xF60A04BF,
                0x2CB81290, 0x24977C79, 0x5679B072, 0xBCAF89AF,
                0xDE9A771F, 0xD9930810, 0xB38BAE12, 0xDCCF3F2E,
                0x5512721F, 0x2E6B7124, 0x501ADDE6, 0x9F84CD87,
                0x7A584718, 0x7408DA17, 0xBC9F9ABC, 0xE94B7D8C,
                0xEC7AEC3A, 0xDB851DFA, 0x63094366, 0xC464C3D2,
                0xEF1C1847, 0x3215D908, 0xDD433B37, 0x24C2BA16,
                0x12A14D43, 0x2A65C451, 0x50940002, 0x133AE4DD,
                0x71DFF89E, 0x10314E55, 0x81AC77D6, 0x5F11199B,
                0x043556F1, 0xD7A3C76B, 0x3C11183B, 0x5924A509,
                0xF28FE6ED, 0x97F1FBFA, 0x9EBABF2C, 0x1E153C6E,
                0x86E34570, 0xEAE96FB1, 0x860E5E0A, 0x5A3E2AB3,
                0x771FE71C, 0x4E3D06FA, 0x2965DCB9, 0x99E71D0F,
                0x803E89D6, 0x5266C825, 0x2E4CC978, 0x9C10B36A,
                0xC6150EBA, 0x94E2EA78, 0xA5FC3C53, 0x1E0A2DF4,
                0xF2F74EA7, 0x361D2B3D, 0x1939260F, 0x19C27960,
                0x5223A708, 0xF71312B6, 0xEBADFE6E, 0xEAC31F66,
                0xE3BC4595, 0xA67BC883, 0xB17F37D1, 0x018CFF28,
                0xC332DDEF, 0xBE6C5AA5, 0x65582185, 0x68AB9802,
                0xEECEA50F, 0xDB2F953B, 0x2AEF7DAD, 0x5B6E2F84,
                0x1521B628, 0x29076170, 0xECDD4775, 0x619F1510,
                0x13CCA830, 0xEB61BD96, 0x0334FE1E, 0xAA0363CF,
                0xB5735C90, 0x4C70A239, 0xD59E9E0B, 0xCBAADE14,
                0xEECC86BC, 0x60622CA7, 0x9CAB5CAB, 0xB2F3846E,
                0x648B1EAF, 0x19BDF0CA, 0xA02369B9, 0x655ABB50,
                0x40685A32, 0x3C2AB4B3, 0x319EE9D5, 0xC021B8F7,
                0x9B540B19, 0x875FA099, 0x95F7997E, 0x623D7DA8,
                0xF837889A, 0x97E32D77, 0x11ED935F, 0x16681281,
                0x0E358829, 0xC7E61FD6, 0x96DEDFA1, 0x7858BA99,
                0x57F584A5, 0x1B227263, 0x9B83C3FF, 0x1AC24696,
                0xCDB30AEB, 0x532E3054, 0x8FD948E4, 0x6DBC3128,
                0x58EBF2EF, 0x34C6FFEA, 0xFE28ED61, 0xEE7C3C73,
                0x5D4A14D9, 0xE864B7E3, 0x42105D14, 0x203E13E0,
                0x45EEE2B6, 0xA3AAABEA, 0xDB6C4F15, 0xFACB4FD0,
                0xC742F442, 0xEF6ABBB5, 0x654F3B1D, 0x41CD2105,
                0xD81E799E, 0x86854DC7, 0xE44B476A, 0x3D816250,
                0xCF62A1F2, 0x5B8D2646, 0xFC8883A0, 0xC1C7B6A3,
                0x7F1524C3, 0x69CB7492, 0x47848A0B, 0x5692B285,
                0x095BBF00, 0xAD19489D, 0x1462B174, 0x23820E00,
                0x58428D2A, 0x0C55F5EA, 0x1DADF43E, 0x233F7061,
                0x3372F092, 0x8D937E41, 0xD65FECF1, 0x6C223BDB,
                0x7CDE3759, 0xCBEE7460, 0x4085F2A7, 0xCE77326E,
                0xA6078084, 0x19F8509E, 0xE8EFD855, 0x61D99735,
                0xA969A7AA, 0xC50C06C2, 0x5A04ABFC, 0x800BCADC,
                0x9E447A2E, 0xC3453484, 0xFDD56705, 0x0E1E9EC9,
                0xDB73DBD3, 0x105588CD, 0x675FDA79, 0xE3674340,
                0xC5C43465, 0x713E38D8, 0x3D28F89E, 0xF16DFF20,
                0x153E21E7, 0x8FB03D4A, 0xE6E39F2B, 0xDB83ADF7
            ],
            [0xE93D5A68, 0x948140F7, 0xF64C261C, 0x94692934,
                0x411520F7, 0x7602D4F7, 0xBCF46B2E, 0xD4A20068,
                0xD4082471, 0x3320F46A, 0x43B7D4B7, 0x500061AF,
                0x1E39F62E, 0x97244546, 0x14214F74, 0xBF8B8840,
                0x4D95FC1D, 0x96B591AF, 0x70F4DDD3, 0x66A02F45,
                0xBFBC09EC, 0x03BD9785, 0x7FAC6DD0, 0x31CB8504,
                0x96EB27B3, 0x55FD3941, 0xDA2547E6, 0xABCA0A9A,
                0x28507825, 0x530429F4, 0x0A2C86DA, 0xE9B66DFB,
                0x68DC1462, 0xD7486900, 0x680EC0A4, 0x27A18DEE,
                0x4F3FFEA2, 0xE887AD8C, 0xB58CE006, 0x7AF4D6B6,
                0xAACE1E7C, 0xD3375FEC, 0xCE78A399, 0x406B2A42,
                0x20FE9E35, 0xD9F385B9, 0xEE39D7AB, 0x3B124E8B,
                0x1DC9FAF7, 0x4B6D1856, 0x26A36631, 0xEAE397B2,
                0x3A6EFA74, 0xDD5B4332, 0x6841E7F7, 0xCA7820FB,
                0xFB0AF54E, 0xD8FEB397, 0x454056AC, 0xBA489527,
                0x55533A3A, 0x20838D87, 0xFE6BA9B7, 0xD096954B,
                0x55A867BC, 0xA1159A58, 0xCCA92963, 0x99E1DB33,
                0xA62A4A56, 0x3F3125F9, 0x5EF47E1C, 0x9029317C,
                0xFDF8E802, 0x04272F70, 0x80BB155C, 0x05282CE3,
                0x95C11548, 0xE4C66D22, 0x48C1133F, 0xC70F86DC,
                0x07F9C9EE, 0x41041F0F, 0x404779A4, 0x5D886E17,
                0x325F51EB, 0xD59BC0D1, 0xF2BCC18F, 0x41113564,
                0x257B7834, 0x602A9C60, 0xDFF8E8A3, 0x1F636C1B,
                0x0E12B4C2, 0x02E1329E, 0xAF664FD1, 0xCAD18115,
                0x6B2395E0, 0x333E92E1, 0x3B240B62, 0xEEBEB922,
                0x85B2A20E, 0xE6BA0D99, 0xDE720C8C, 0x2DA2F728,
                0xD0127845, 0x95B794FD, 0x647D0862, 0xE7CCF5F0,
                0x5449A36F, 0x877D48FA, 0xC39DFD27, 0xF33E8D1E,
                0x0A476341, 0x992EFF74, 0x3A6F6EAB, 0xF4F8FD37,
                0xA812DC60, 0xA1EBDDF8, 0x991BE14C, 0xDB6E6B0D,
                0xC67B5510, 0x6D672C37, 0x2765D43B, 0xDCD0E804,
                0xF1290DC7, 0xCC00FFA3, 0xB5390F92, 0x690FED0B,
                0x667B9FFB, 0xCEDB7D9C, 0xA091CF0B, 0xD9155EA3,
                0xBB132F88, 0x515BAD24, 0x7B9479BF, 0x763BD6EB,
                0x37392EB3, 0xCC115979, 0x8026E297, 0xF42E312D,
                0x6842ADA7, 0xC66A2B3B, 0x12754CCC, 0x782EF11C,
                0x6A124237, 0xB79251E7, 0x06A1BBE6, 0x4BFB6350,
                0x1A6B1018, 0x11CAEDFA, 0x3D25BDD8, 0xE2E1C3C9,
                0x44421659, 0x0A121386, 0xD90CEC6E, 0xD5ABEA2A,
                0x64AF674E, 0xDA86A85F, 0xBEBFE988, 0x64E4C3FE,
                0x9DBC8057, 0xF0F7C086, 0x60787BF8, 0x6003604D,
                0xD1FD8346, 0xF6381FB0, 0x7745AE04, 0xD736FCCC,
                0x83426B33, 0xF01EAB71, 0xB0804187, 0x3C005E5F,
                0x77A057BE, 0xBDE8AE24, 0x55464299, 0xBF582E61,
                0x4E58F48F, 0xF2DDFDA2, 0xF474EF38, 0x8789BDC2,
                0x5366F9C3, 0xC8B38E74, 0xB475F255, 0x46FCD9B9,
                0x7AEB2661, 0x8B1DDF84, 0x846A0E79, 0x915F95E2,
                0x466E598E, 0x20B45770, 0x8CD55591, 0xC902DE4C,
                0xB90BACE1, 0xBB8205D0, 0x11A86248, 0x7574A99E,
                0xB77F19B6, 0xE0A9DC09, 0x662D09A1, 0xC4324633,
                0xE85A1F02, 0x09F0BE8C, 0x4A99A025, 0x1D6EFE10,
                0x1AB93D1D, 0x0BA5A4DF, 0xA186F20F, 0x2868F169,
                0xDCB7DA83, 0x573906FE, 0xA1E2CE9B, 0x4FCD7F52,
                0x50115E01, 0xA70683FA, 0xA002B5C4, 0x0DE6D027,
                0x9AF88C27, 0x773F8641, 0xC3604C06, 0x61A806B5,
                0xF0177A28, 0xC0F586E0, 0x006058AA, 0x30DC7D62,
                0x11E69ED7, 0x2338EA63, 0x53C2DD94, 0xC2C21634,
                0xBBCBEE56, 0x90BCB6DE, 0xEBFC7DA1, 0xCE591D76,
                0x6F05E409, 0x4B7C0188, 0x39720A3D, 0x7C927C24,
                0x86E3725F, 0x724D9DB9, 0x1AC15BB4, 0xD39EB8FC,
                0xED545578, 0x08FCA5B5, 0xD83D7CD3, 0x4DAD0FC4,
                0x1E50EF5E, 0xB161E6F8, 0xA28514D9, 0x6C51133C,
                0x6FD5C7E7, 0x56E14EC4, 0x362ABFCE, 0xDDC6C837,
                0xD79A3234, 0x92638212, 0x670EFA8E, 0x406000E0
            ],
            [0x3A39CE37, 0xD3FAF5CF, 0xABC27737, 0x5AC52D1B,
                0x5CB0679E, 0x4FA33742, 0xD3822740, 0x99BC9BBE,
                0xD5118E9D, 0xBF0F7315, 0xD62D1C7E, 0xC700C47B,
                0xB78C1B6B, 0x21A19045, 0xB26EB1BE, 0x6A366EB4,
                0x5748AB2F, 0xBC946E79, 0xC6A376D2, 0x6549C2C8,
                0x530FF8EE, 0x468DDE7D, 0xD5730A1D, 0x4CD04DC6,
                0x2939BBDB, 0xA9BA4650, 0xAC9526E8, 0xBE5EE304,
                0xA1FAD5F0, 0x6A2D519A, 0x63EF8CE2, 0x9A86EE22,
                0xC089C2B8, 0x43242EF6, 0xA51E03AA, 0x9CF2D0A4,
                0x83C061BA, 0x9BE96A4D, 0x8FE51550, 0xBA645BD6,
                0x2826A2F9, 0xA73A3AE1, 0x4BA99586, 0xEF5562E9,
                0xC72FEFD3, 0xF752F7DA, 0x3F046F69, 0x77FA0A59,
                0x80E4A915, 0x87B08601, 0x9B09E6AD, 0x3B3EE593,
                0xE990FD5A, 0x9E34D797, 0x2CF0B7D9, 0x022B8B51,
                0x96D5AC3A, 0x017DA67D, 0xD1CF3ED6, 0x7C7D2D28,
                0x1F9F25CF, 0xADF2B89B, 0x5AD6B472, 0x5A88F54C,
                0xE029AC71, 0xE019A5E6, 0x47B0ACFD, 0xED93FA9B,
                0xE8D3C48D, 0x283B57CC, 0xF8D56629, 0x79132E28,
                0x785F0191, 0xED756055, 0xF7960E44, 0xE3D35E8C,
                0x15056DD4, 0x88F46DBA, 0x03A16125, 0x0564F0BD,
                0xC3EB9E15, 0x3C9057A2, 0x97271AEC, 0xA93A072A,
                0x1B3F6D9B, 0x1E6321F5, 0xF59C66FB, 0x26DCF319,
                0x7533D928, 0xB155FDF5, 0x03563482, 0x8ABA3CBB,
                0x28517711, 0xC20AD9F8, 0xABCC5167, 0xCCAD925F,
                0x4DE81751, 0x3830DC8E, 0x379D5862, 0x9320F991,
                0xEA7A90C2, 0xFB3E7BCE, 0x5121CE64, 0x774FBE32,
                0xA8B6E37E, 0xC3293D46, 0x48DE5369, 0x6413E680,
                0xA2AE0810, 0xDD6DB224, 0x69852DFD, 0x09072166,
                0xB39A460A, 0x6445C0DD, 0x586CDECF, 0x1C20C8AE,
                0x5BBEF7DD, 0x1B588D40, 0xCCD2017F, 0x6BB4E3BB,
                0xDDA26A7E, 0x3A59FF45, 0x3E350A44, 0xBCB4CDD5,
                0x72EACEA8, 0xFA6484BB, 0x8D6612AE, 0xBF3C6F47,
                0xD29BE463, 0x542F5D9E, 0xAEC2771B, 0xF64E6370,
                0x740E0D8D, 0xE75B1357, 0xF8721671, 0xAF537D5D,
                0x4040CB08, 0x4EB4E2CC, 0x34D2466A, 0x0115AF84,
                0xE1B00428, 0x95983A1D, 0x06B89FB4, 0xCE6EA048,
                0x6F3F3B82, 0x3520AB82, 0x011A1D4B, 0x277227F8,
                0x611560B1, 0xE7933FDC, 0xBB3A792B, 0x344525BD,
                0xA08839E1, 0x51CE794B, 0x2F32C9B7, 0xA01FBAC9,
                0xE01CC87E, 0xBCC7D1F6, 0xCF0111C3, 0xA1E8AAC7,
                0x1A908749, 0xD44FBD9A, 0xD0DADECB, 0xD50ADA38,
                0x0339C32A, 0xC6913667, 0x8DF9317C, 0xE0B12B4F,
                0xF79E59B7, 0x43F5BB3A, 0xF2D519FF, 0x27D9459C,
                0xBF97222C, 0x15E6FC2A, 0x0F91FC71, 0x9B941525,
                0xFAE59361, 0xCEB69CEB, 0xC2A86459, 0x12BAA8D1,
                0xB6C1075E, 0xE3056A0C, 0x10D25065, 0xCB03A442,
                0xE0EC6E0E, 0x1698DB3B, 0x4C98A0BE, 0x3278E964,
                0x9F1F9532, 0xE0D392DF, 0xD3A0342B, 0x8971F21E,
                0x1B0A7441, 0x4BA3348C, 0xC5BE7120, 0xC37632D8,
                0xDF359F8D, 0x9B992F2E, 0xE60B6F47, 0x0FE3F11D,
                0xE54CDA54, 0x1EDAD891, 0xCE6279CF, 0xCD3E7E6F,
                0x1618B166, 0xFD2C1D05, 0x848FD2C5, 0xF6FB2299,
                0xF523F357, 0xA6327623, 0x93A83531, 0x56CCCD02,
                0xACF08162, 0x5A75EBB5, 0x6E163697, 0x88D273CC,
                0xDE966292, 0x81B949D0, 0x4C50901B, 0x71C65614,
                0xE6C6C7BD, 0x327A140A, 0x45E1D006, 0xC3F27B9A,
                0xC9AA53FD, 0x62A80F00, 0xBB25BFE2, 0x35BDD2F6,
                0x71126905, 0xB2040222, 0xB6CBCF7C, 0xCD769C2B,
                0x53113EC0, 0x1640E3D3, 0x38ABBD60, 0x2547ADF0,
                0xBA38209C, 0xF746CE76, 0x77AFA1C5, 0x20756060,
                0x85CBFE4E, 0x8AE88DD8, 0x7AAAF9B0, 0x4CF9AA7E,
                0x1948C25C, 0x02FB8A8C, 0x01C36AE4, 0xD6EBE1F9,
                0x90D4F869, 0xA65CDEA0, 0x3F09252D, 0xC208E69F,
                0xB74E6132, 0xCE77E25B, 0x578FDFE3, 0x3AC372E6
            ]
        ];

        var BLOWFISH_CTX = {
            pbox: [],
            sbox: []
        }

        function F(ctx, x) {
            let a = (x >> 24) & 0xFF;
            let b = (x >> 16) & 0xFF;
            let c = (x >> 8) & 0xFF;
            let d = x & 0xFF;

            let y = ctx.sbox[0][a] + ctx.sbox[1][b];
            y = y ^ ctx.sbox[2][c];
            y = y + ctx.sbox[3][d];

            return y;
        }

        function BlowFish_Encrypt(ctx, left, right) {
            let Xl = left;
            let Xr = right;
            let temp;

            for (let i = 0; i < N; ++i) {
                Xl = Xl ^ ctx.pbox[i];
                Xr = F(ctx, Xl) ^ Xr;

                temp = Xl;
                Xl = Xr;
                Xr = temp;
            }

            temp = Xl;
            Xl = Xr;
            Xr = temp;

            Xr = Xr ^ ctx.pbox[N];
            Xl = Xl ^ ctx.pbox[N + 1];

            return {
                left: Xl,
                right: Xr
            };
        }

        function BlowFish_Decrypt(ctx, left, right) {
            let Xl = left;
            let Xr = right;
            let temp;

            for (let i = N + 1; i > 1; --i) {
                Xl = Xl ^ ctx.pbox[i];
                Xr = F(ctx, Xl) ^ Xr;

                temp = Xl;
                Xl = Xr;
                Xr = temp;
            }

            temp = Xl;
            Xl = Xr;
            Xr = temp;

            Xr = Xr ^ ctx.pbox[1];
            Xl = Xl ^ ctx.pbox[0];

            return {
                left: Xl,
                right: Xr
            };
        }

        /**
         * Initialization ctx's pbox and sbox.
         *
         * @param {Object} ctx The object has pbox and sbox.
         * @param {Array} key An array of 32-bit words.
         * @param {int} keysize The length of the key.
         *
         * @example
         *
         *     BlowFishInit(BLOWFISH_CTX, key, 128/32);
         */
        function BlowFishInit(ctx, key, keysize) {
            for (let Row = 0; Row < 4; Row++) {
                ctx.sbox[Row] = [];
                for (let Col = 0; Col < 256; Col++) {
                    ctx.sbox[Row][Col] = ORIG_S[Row][Col];
                }
            }

            let keyIndex = 0;
            for (let index = 0; index < N + 2; index++) {
                ctx.pbox[index] = ORIG_P[index] ^ key[keyIndex];
                keyIndex++;
                if (keyIndex >= keysize) {
                    keyIndex = 0;
                }
            }

            let Data1 = 0;
            let Data2 = 0;
            let res = 0;
            for (let i = 0; i < N + 2; i += 2) {
                res = BlowFish_Encrypt(ctx, Data1, Data2);
                Data1 = res.left;
                Data2 = res.right;
                ctx.pbox[i] = Data1;
                ctx.pbox[i + 1] = Data2;
            }

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 256; j += 2) {
                    res = BlowFish_Encrypt(ctx, Data1, Data2);
                    Data1 = res.left;
                    Data2 = res.right;
                    ctx.sbox[i][j] = Data1;
                    ctx.sbox[i][j + 1] = Data2;
                }
            }

            return true;
        }

        /**
         * Blowfish block cipher algorithm.
         */
        var Blowfish = C_algo.Blowfish = BlockCipher.extend({
            _doReset: function () {
                // Skip reset of nRounds has been set before and key did not change
                if (this._keyPriorReset === this._key) {
                    return;
                }

                // Shortcuts
                var key = this._keyPriorReset = this._key;
                var keyWords = key.words;
                var keySize = key.sigBytes / 4;

                //Initialization pbox and sbox
                BlowFishInit(BLOWFISH_CTX, keyWords, keySize);
            },

            encryptBlock: function (M, offset) {
                var res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
                M[offset] = res.left;
                M[offset + 1] = res.right;
            },

            decryptBlock: function (M, offset) {
                var res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
                M[offset] = res.left;
                M[offset + 1] = res.right;
            },

            blockSize: 64 / 32,

            keySize: 128 / 32,

            ivSize: 64 / 32
        });

        /**
         * Shortcut functions to the cipher's object interface.
         *
         * @example
         *
         *     var ciphertext = CryptoJS.Blowfish.encrypt(message, key, cfg);
         *     var plaintext  = CryptoJS.Blowfish.decrypt(ciphertext, key, cfg);
         */
        C.Blowfish = BlockCipher._createHelper(Blowfish);
    }());


    return CryptoJS;

}));

"use strict";

function ownKeys(t, e) {
    var n, r = Object.keys(t);
    return Object.getOwnPropertySymbols && (n = Object.getOwnPropertySymbols(t), e && (n = n.filter(function (e) {
        return Object.getOwnPropertyDescriptor(t, e).enumerable
    })), r.push.apply(r, n)), r
}

function _objectSpread2(t) {
    for (var e = 1; e < arguments.length; e++) {
        var n = null != arguments[e] ? arguments[e] : {};
        e % 2 ? ownKeys(Object(n), !0).forEach(function (e) {
            _defineProperty(t, e, n[e])
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : ownKeys(Object(n)).forEach(function (e) {
            Object.defineProperty(t, e, Object.getOwnPropertyDescriptor(n, e))
        })
    }
    return t
}

function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
        return a
    };
    var a = {},
        e = Object.prototype,
        c = e.hasOwnProperty,
        u = Object.defineProperty || function (e, t, n) {
            e[t] = n.value
        },
        t = "function" == typeof Symbol ? Symbol : {},
        r = t.iterator || "@@iterator",
        n = t.asyncIterator || "@@asyncIterator",
        i = t.toStringTag || "@@toStringTag";

    function o(e, t, n) {
        return Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }), e[t]
    }
    try {
        o({}, "")
    } catch (e) {
        o = function (e, t, n) {
            return e[t] = n
        }
    }

    function s(e, t, n, r) {
        var i, o, a, s, t = t && t.prototype instanceof f ? t : f,
            t = Object.create(t.prototype),
            r = new b(r || []);
        return u(t, "_invoke", {
            value: (i = e, o = n, a = r, s = "suspendedStart", function (e, t) {
                if ("executing" === s) throw new Error("Generator is already running");
                if ("completed" === s) {
                    if ("throw" === e) throw t;
                    return {
                        value: void 0,
                        done: !0
                    }
                }
                for (a.method = e, a.arg = t;;) {
                    var n = a.delegate;
                    if (n) {
                        n = function e(t, n) {
                            var r = n.method,
                                i = t.iterator[r];
                            if (void 0 === i) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = void 0, e(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), p;
                            r = l(i, t.iterator, n.arg);
                            if ("throw" === r.type) return n.method = "throw", n.arg = r.arg, n.delegate = null, p;
                            i = r.arg;
                            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = void 0), n.delegate = null, p) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, p)
                        }(n, a);
                        if (n) {
                            if (n === p) continue;
                            return n
                        }
                    }
                    if ("next" === a.method) a.sent = a._sent = a.arg;
                    else if ("throw" === a.method) {
                        if ("suspendedStart" === s) throw s = "completed", a.arg;
                        a.dispatchException(a.arg)
                    } else "return" === a.method && a.abrupt("return", a.arg);
                    s = "executing";
                    n = l(i, o, a);
                    if ("normal" === n.type) {
                        if (s = a.done ? "completed" : "suspendedYield", n.arg === p) continue;
                        return {
                            value: n.arg,
                            done: a.done
                        }
                    }
                    "throw" === n.type && (s = "completed", a.method = "throw", a.arg = n.arg)
                }
            })
        }), t
    }

    function l(e, t, n) {
        try {
            return {
                type: "normal",
                arg: e.call(t, n)
            }
        } catch (e) {
            return {
                type: "throw",
                arg: e
            }
        }
    }
    a.wrap = s;
    var p = {};

    function f() {}

    function d() {}

    function h() {}
    var t = {},
        g = (o(t, r, function () {
            return this
        }), Object.getPrototypeOf),
        g = g && g(g(S([]))),
        _ = (g && g !== e && c.call(g, r) && (t = g), h.prototype = f.prototype = Object.create(t));

    function m(e) {
        ["next", "throw", "return"].forEach(function (t) {
            o(e, t, function (e) {
                return this._invoke(t, e)
            })
        })
    }

    function v(a, s) {
        var t;
        u(this, "_invoke", {
            value: function (n, r) {
                function e() {
                    return new s(function (e, t) {
                        ! function t(e, n, r, i) {
                            var o, e = l(a[e], a, n);
                            if ("throw" !== e.type) return (n = (o = e.arg).value) && "object" == typeof n && c.call(n, "__await") ? s.resolve(n.__await).then(function (e) {
                                t("next", e, r, i)
                            }, function (e) {
                                t("throw", e, r, i)
                            }) : s.resolve(n).then(function (e) {
                                o.value = e, r(o)
                            }, function (e) {
                                return t("throw", e, r, i)
                            });
                            i(e.arg)
                        }(n, r, e, t)
                    })
                }
                return t = t ? t.then(e, e) : e()
            }
        })
    }

    function y(e) {
        var t = {
            tryLoc: e[0]
        };
        1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
    }

    function k(e) {
        var t = e.completion || {};
        t.type = "normal", delete t.arg, e.completion = t
    }

    function b(e) {
        this.tryEntries = [{
            tryLoc: "root"
        }], e.forEach(y, this), this.reset(!0)
    }

    function S(t) {
        if (t || "" === t) {
            var n, e = t[r];
            if (e) return e.call(t);
            if ("function" == typeof t.next) return t;
            if (!isNaN(t.length)) return n = -1, (e = function e() {
                for (; ++n < t.length;)
                    if (c.call(t, n)) return e.value = t[n], e.done = !1, e;
                return e.value = void 0, e.done = !0, e
            }).next = e
        }
        throw new TypeError(typeof t + " is not iterable")
    }
    return u(_, "constructor", {
        value: d.prototype = h,
        configurable: !0
    }), u(h, "constructor", {
        value: d,
        configurable: !0
    }), d.displayName = o(h, i, "GeneratorFunction"), a.isGeneratorFunction = function (e) {
        e = "function" == typeof e && e.constructor;
        return !!e && (e === d || "GeneratorFunction" === (e.displayName || e.name))
    }, a.mark = function (e) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(e, h) : (e.__proto__ = h, o(e, i, "GeneratorFunction")), e.prototype = Object.create(_), e
    }, a.awrap = function (e) {
        return {
            __await: e
        }
    }, m(v.prototype), o(v.prototype, n, function () {
        return this
    }), a.AsyncIterator = v, a.async = function (e, t, n, r, i) {
        void 0 === i && (i = Promise);
        var o = new v(s(e, t, n, r), i);
        return a.isGeneratorFunction(t) ? o : o.next().then(function (e) {
            return e.done ? e.value : o.next()
        })
    }, m(_), o(_, i, "Generator"), o(_, r, function () {
        return this
    }), o(_, "toString", function () {
        return "[object Generator]"
    }), a.keys = function (e) {
        var t, n = Object(e),
            r = [];
        for (t in n) r.push(t);
        return r.reverse(),
            function e() {
                for (; r.length;) {
                    var t = r.pop();
                    if (t in n) return e.value = t, e.done = !1, e
                }
                return e.done = !0, e
            }
    }, a.values = S, b.prototype = {
        constructor: b,
        reset: function (e) {
            if (this.prev = 0, this.next = 0, this.sent = this._sent = void 0, this.done = !1, this.delegate = null, this.method = "next", this.arg = void 0, this.tryEntries.forEach(k), !e)
                for (var t in this) "t" === t.charAt(0) && c.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = void 0)
        },
        stop: function () {
            this.done = !0;
            var e = this.tryEntries[0].completion;
            if ("throw" === e.type) throw e.arg;
            return this.rval
        },
        dispatchException: function (n) {
            if (this.done) throw n;
            var r = this;

            function e(e, t) {
                return o.type = "throw", o.arg = n, r.next = e, t && (r.method = "next", r.arg = void 0), !!t
            }
            for (var t = this.tryEntries.length - 1; 0 <= t; --t) {
                var i = this.tryEntries[t],
                    o = i.completion;
                if ("root" === i.tryLoc) return e("end");
                if (i.tryLoc <= this.prev) {
                    var a = c.call(i, "catchLoc"),
                        s = c.call(i, "finallyLoc");
                    if (a && s) {
                        if (this.prev < i.catchLoc) return e(i.catchLoc, !0);
                        if (this.prev < i.finallyLoc) return e(i.finallyLoc)
                    } else if (a) {
                        if (this.prev < i.catchLoc) return e(i.catchLoc, !0)
                    } else {
                        if (!s) throw new Error("try statement without catch or finally");
                        if (this.prev < i.finallyLoc) return e(i.finallyLoc)
                    }
                }
            }
        },
        abrupt: function (e, t) {
            for (var n = this.tryEntries.length - 1; 0 <= n; --n) {
                var r = this.tryEntries[n];
                if (r.tryLoc <= this.prev && c.call(r, "finallyLoc") && this.prev < r.finallyLoc) {
                    var i = r;
                    break
                }
            }
            var o = (i = i && ("break" === e || "continue" === e) && i.tryLoc <= t && t <= i.finallyLoc ? null : i) ? i.completion : {};
            return o.type = e, o.arg = t, i ? (this.method = "next", this.next = i.finallyLoc, p) : this.complete(o)
        },
        complete: function (e, t) {
            if ("throw" === e.type) throw e.arg;
            return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), p
        },
        finish: function (e) {
            for (var t = this.tryEntries.length - 1; 0 <= t; --t) {
                var n = this.tryEntries[t];
                if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), k(n), p
            }
        },
        catch: function (e) {
            for (var t = this.tryEntries.length - 1; 0 <= t; --t) {
                var n, r, i = this.tryEntries[t];
                if (i.tryLoc === e) return "throw" === (n = i.completion).type && (r = n.arg, k(i)), r
            }
            throw new Error("illegal catch attempt")
        },
        delegateYield: function (e, t, n) {
            return this.delegate = {
                iterator: S(e),
                resultName: t,
                nextLoc: n
            }, "next" === this.method && (this.arg = void 0), p
        }
    }, a
}

function _typeof(e) {
    return (_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
        return typeof e
    } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
    })(e)
}

function asyncGeneratorStep(e, t, n, r, i, o, a) {
    try {
        var s = e[o](a),
            c = s.value
    } catch (e) {
        return void n(e)
    }
    s.done ? t(c) : Promise.resolve(c).then(r, i)
}

function _asyncToGenerator(s) {
    return function () {
        var e = this,
            a = arguments;
        return new Promise(function (t, n) {
            var r = s.apply(e, a);

            function i(e) {
                asyncGeneratorStep(r, t, n, i, o, "next", e)
            }

            function o(e) {
                asyncGeneratorStep(r, t, n, i, o, "throw", e)
            }
            i(void 0)
        })
    }
}

function _classCallCheck(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
}

function _defineProperties(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, _toPropertyKey(r.key), r)
    }
}

function _createClass(e, t, n) {
    return t && _defineProperties(e.prototype, t), n && _defineProperties(e, n), Object.defineProperty(e, "prototype", {
        writable: !1
    }), e
}

function _defineProperty(e, t, n) {
    return (t = _toPropertyKey(t)) in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n, e
}

function _unsupportedIterableToArray(e, t) {
    var n;
    if (e) return "string" == typeof e ? _arrayLikeToArray(e, t) : "Map" === (n = "Object" === (n = Object.prototype.toString.call(e).slice(8, -1)) && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _arrayLikeToArray(e, t) : void 0
}

function _arrayLikeToArray(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r
}

function _createForOfIteratorHelper(e, t) {
    var n, r, i, o, a = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
    if (a) return r = !(n = !0), {
        s: function () {
            a = a.call(e)
        },
        n: function () {
            var e = a.next();
            return n = e.done, e
        },
        e: function (e) {
            r = !0, i = e
        },
        f: function () {
            try {
                n || null == a.return || a.return()
            } finally {
                if (r) throw i
            }
        }
    };
    if (Array.isArray(e) || (a = _unsupportedIterableToArray(e)) || t && e && "number" == typeof e.length) return a && (e = a), o = 0, {
        s: t = function () {},
        n: function () {
            return o >= e.length ? {
                done: !0
            } : {
                done: !1,
                value: e[o++]
            }
        },
        e: function (e) {
            throw e
        },
        f: t
    };
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
}

function _toPrimitive(e, t) {
    if ("object" != typeof e || null === e) return e;
    var n = e[Symbol.toPrimitive];
    if (void 0 === n) return ("string" === t ? String : Number)(e);
    n = n.call(e, t || "default");
    if ("object" != typeof n) return n;
    throw new TypeError("@@toPrimitive must return a primitive value.")
}

function _toPropertyKey(e) {
    e = _toPrimitive(e, "string");
    return "symbol" == typeof e ? e : String(e)
}
var Config = {
        LIB_VERSION: "4.8.50",
        LIB_NAME: "MG",
        LIB_STACK: "MiniGame",
        BASE_URL: "https://backend.gravity-engine.com/event_center/api/v1"
    },
    PlatformProxy = function () {
        function e() {
            _classCallCheck(this, e), this.config = {
                persistenceName: "GravityEngine",
                persistenceNameOld: "GravityEngine_web"
            }
        }
        return _createClass(e, [{
            key: "getConfig",
            value: function () {
                return this.config
            }
        }, {
            key: "getStorage",
            value: function (e, t, n) {
                e = localStorage.getItem(e);
                if (!t) return _.isJSONString(e) ? JSON.parse(e) : {};
                _.isJSONString(e) ? n(JSON.parse(e)) : n({})
            }
        }, {
            key: "setStorage",
            value: function (e, t) {
                localStorage.setItem(e, t)
            }
        }, {
            key: "removeStorage",
            value: function (e) {
                localStorage.removeItem(e)
            }
        }, {
            key: "_setSystemProxy",
            value: function (e) {
                this._sysCallback = e
            }
        }, {
            key: "getSystemInfo",
            value: function (e) {
                var t = this._getOs(),
                    t = {
                        mp_platform: "web",
                        system: t,
                        platform: t,
                        screenWidth: window.screen.width,
                        screenHeight: window.screen.height,
                        systemLanguage: navigator.language
                    };
                this._sysCallback && (t = _.extend(t, this._sysCallback(e))), e.success(t), e.complete()
            }
        }, {
            key: "_getOs",
            value: function () {
                var e = navigator.userAgent;
                return /Windows/i.test(e) ? /Phone/.test(e) || /WPDesktop/.test(e) ? "Windows Phone" : "Windows" : /(iPhone|iPad|iPod)/.test(e) ? "iOS" : /Android/.test(e) ? "Android" : /(BlackBerry|PlayBook|BB10)/i.test(e) ? "BlackBerry" : /Mac/i.test(e) ? "MacOS" : /Linux/.test(e) ? "Linux" : /CrOS/.test(e) ? "ChromeOS" : ""
            }
        }, {
            key: "getNetworkType",
            value: function (e) {
                e.complete()
            }
        }, {
            key: "onNetworkStatusChange",
            value: function () {}
        }, {
            key: "request",
            value: function (e) {
                var t = {},
                    n = new XMLHttpRequest;
                if (n.open(e.method, e.url), e.header)
                    for (var r in e.header) n.setRequestHeader(r, e.header[r]);
                return n.onreadystatechange = function () {
                    4 === n.readyState && 200 === n.status ? (t.statusCode = 200, _.isJSONString(n.responseText) && (t.data = JSON.parse(n.responseText)), e.success(t)) : 200 !== n.status && (t.errMsg = "network error", e.fail(t))
                }, n.ontimeout = function () {
                    t.errMsg = "timeout", e.fail(t)
                }, n.send(e.data), n
            }
        }, {
            key: "initAutoTrackInstance",
            value: function (e, t) {
                this.instance = e, this.autoTrack = t.autoTrack;
                var n = this;
                "onpagehide" in window ? window.onpagehide = function () {
                    n.onPageHide(!0)
                } : window.onbeforeunload = function () {
                    n.onPageHide(!0)
                }, n.onPageShow(), n.autoTrack.appHide && n.instance.timeEvent("ta_page_hide"), "onvisibilitychange" in document && (document.onvisibilitychange = function () {
                    document.hidden ? n.onPageHide(!1) : (n.onPageShow(), n.autoTrack.appHide && n.instance.timeEvent("ta_page_hide"))
                })
            }
        }, {
            key: "setGlobal",
            value: function (e, t) {
                window[t] = e
            }
        }, {
            key: "getAppOptions",
            value: function () {}
        }, {
            key: "showToast",
            value: function () {}
        }, {
            key: "onPageShow",
            value: function () {
                var e;
                this.autoTrack.appShow && (_.extend(e = {}, this.autoTrack.properties), _.isFunction(this.autoTrack.callback) && _.extend(e, this.autoTrack.callback("appShow")), this.instance._internalTrack("$WebPageView", e))
            }
        }, {
            key: "onPageHide",
            value: function (e) {
                var t;
                this.autoTrack.appHide && (_.extend(t = {}, this.autoTrack.properties), _.isFunction(this.autoTrack.callback) && _.extend(t, this.autoTrack.callback("appHide")), this.instance._internalTrack("$WebPageHide", t, new Date, null, e))
            }
        }], [{
            key: "createInstance",
            value: function () {
                return new e
            }
        }]), e
    }(),
    AutoTrackBridge = function () {
        function n(e, t) {
            _classCallCheck(this, n), this.taInstance = e, this.config = t || {}, this.referrer = "Directly open", this.config.isPlugin ? (e.App = function () {
                App.apply(this, arguments)
            }, inension(e.Page)) : (t = App, App = this._initAppExtention(t), e = Page, Page = this._initPageExtension(e))
        }
        return _createClass(n, [{
            key: "_initPageExtension",
            value: function (i) {
                var o = this;
                return function (e) {
                    var t = e.onLoad,
                        n = e.onShow,
                        r = (e.onShareAppMessage, {});
                    return e.onLoad = function (e) {
                        r = e || {}, "function" == typeof t && t.call(this, e)
                    }, e.onShow = function (e) {
                        o.onPageShow(r), "function" == typeof n && n.call(this, e)
                    }, i(e)
                }
            }
        }, {
            key: "_initAppExtention",
            value: function (i) {
                var o = this;
                return function (e) {
                    var t = e.onLaunch,
                        n = e.onShow,
                        r = e.onHide;
                    return e.onLaunch = function (e) {
                        o.onAppLaunch(e, this), "function" == typeof t && t.call(this, e)
                    }, e.onShow = function (e) {
                        o.onAppShow(e), "function" == typeof n && n.call(this, e)
                    }, e.onHide = function () {
                        o.onAppHide(), "function" == typeof r && r.call(this)
                    }, i(e)
                }
            }
        }, {
            key: "onAppLaunch",
            value: function (e, t) {
                this._setAutoTrackProperties(e), _.isUndefined(t) || (t[this.taInstance.name] = this.taInstance), this.config.appLaunch && (t = {}, e && e.path && (t.$url_query = _.setQuery(e.query), t.$scene = String(e.scene || e.from)), this.taInstance._internalTrack("$MPLaunch", t))
            }
        }, {
            key: "onAppShow",
            value: function (e) {
                var t;
                this.config.appHide && this.taInstance.timeEvent("$MPHide"), this._setAutoTrackProperties(e), this.config.appShow && (t = {}, e && e.path && (t.$url_path = this._getPath(e.path), t.$url_query = _.setQuery(e.query), t.$scene = String(e.scene || e.from)), _.extend(t, this.config.properties), _.isFunction(this.config.callback) && _.extend(t, this.config.callback("appShow")), this.taInstance._internalTrack("$MPShow", t))
            }
        }, {
            key: "onAppHide",
            value: function () {
                var e;
                this.config.appHide && (_.extend(e = {}, this.config.properties), _.isFunction(this.config.callback) && _.extend(e, this.config.callback("appHide")), this.taInstance._internalTrack("$MPHide", e))
            }
        }, {
            key: "_getCurrentPath",
            value: function () {
                var e = "Not to get";
                try {
                    var t = getCurrentPages(),
                        e = t[t.length - 1].route
                } catch (e) {
                    logger.info(e)
                }
                return e
            }
        }, {
            key: "_setAutoTrackProperties",
            value: function (e) {
                this.taInstance._setAutoTrackProperties({})
            }
        }, {
            key: "_getPath",
            value: function (e) {
                return "string" == typeof e ? e.replace(/^\//, "") : "Abnormal values"
            }
        }, {
            key: "onPageShare",
            value: function (e) {
                if (this.config.pageShare) {
                    var t = 1;
                    try {
                        t = getCurrentPages().length
                    } catch (e) {
                        t = 1
                    }
                    this.taInstance._internalTrack("$MPShare", {
                        $share_method: "转发消息卡片",
                        $share_depth: t,
                        $url_path: this._getCurrentPath()
                    })
                }
                return _.isObject(e) ? e : {}
            }
        }, {
            key: "onPageShow",
            value: function (e) {
                var t;
                this.config.pageShow && (t = this._getCurrentPath(), _.setQuery(e), this.referrer = t)
            }
        }]), n
    }(),
    AutoTrackBridge$1 = function () {
        function i(t, e, n) {
            var r = this,
                t = (_classCallCheck(this, i), this.taInstance = t, this.config = e || {}, {});
            try {
                t = n.getLaunchOptionsSync()
            } catch (e) {
                t = {}
            }
            this._onShow(t), this.startTracked = !0, n.onShow(function (e) {
                r._onShow(e)
            }), n.onHide(function () {
                var e;
                r.startTracked = !1, r.config.appHide && (_.extend(e = {}, r.config.properties), _.isFunction(r.config.callback) && _.extend(e, r.config.callback("appHide")), r.taInstance._internalTrack("$MPHide", e))
            })
        }
        return _createClass(i, [{
            key: "_onShow",
            value: function (e) {
                var t;
                _.isObject(e) || (e = {}), this.startTracked || (this.config.appHide && this.taInstance.timeEvent("$MPHide"), this.config.appShow && (_.extend(t = {}, this.config.properties), _.isFunction(this.config.callback) && _.extend(t, this.config.callback("appShow")), this.taInstance._internalTrack("$MPShow", _objectSpread2(_objectSpread2({}, t), {}, {
                    $scene: String((null == (t = e) ? void 0 : t.scene) || (null == (t = e) ? void 0 : t.from)),
                    $url_query: _.setQuery((null == (e = PlatformAPI.getAppOptions()) ? void 0 : e.query) || {})
                }))))
            }
        }]), i
    }();

function xhrRequest(e) {
    var t = {},
        n = new XMLHttpRequest;
    if (n.open(e.method, e.url), e.header)
        for (var r in e.header) n.setRequestHeader(r, e.header[r]);
    return n.onreadystatechange = function () {
        4 === n.readyState && 200 === n.status ? (t.statusCode = 200, _.isJSONString(n.responseText) && (t.data = JSON.parse(n.responseText)), e.success(t)) : 200 !== n.status && (t.errMsg = "network error", e.fail(t))
    }, n.ontimeout = function () {
        t.errMsg = "timeout", e.fail(t)
    }, n.send(JSON.parse(e.data)), n
}
var PlatformProxy$1 = function () {
        function r(e, t, n) {
            _classCallCheck(this, r), this.api = e, this.config = t, this._config = n
        }
        return _createClass(r, [{
            key: "getConfig",
            value: function () {
                return this.config
            }
        }, {
            key: "getStorage",
            value: function (e, t, n) {
                if (t) this.api.getStorage({
                    key: e,
                    success: function (e) {
                        e = _.isJSONString(e.data) ? JSON.parse(e.data) : {};
                        n(e)
                    },
                    fail: function () {
                        n({})
                    }
                });
                else try {
                    var r, i;
                    return ["dd_mp", "ali_mp", "ali_mg"].includes(this._config.platform) ? (r = this.api.getStorageSync({
                        key: e
                    }), _.isJSONString(r.data) ? JSON.parse(r.data) : {}) : (i = this.api.getStorageSync(e), _.isJSONString(i) ? JSON.parse(i) : {})
                } catch (e) {
                    return {}
                }
            }
        }, {
            key: "setStorage",
            value: function (e, t) {
                try {
                    ["ali_mp", "tb_mp", "dd_mp", "ali_mg"].includes(this._config.platform) ? this.api.setStorageSync({
                        key: e,
                        data: t
                    }) : this.api.setStorageSync(e, t)
                } catch (e) {}
            }
        }, {
            key: "removeStorage",
            value: function (e) {
                try {
                    _.isFunction(this.api.removeStorage) ? this.api.removeStorage({
                        key: e
                    }) : _.isFunction(this.api.deleteStorage) && this.api.deleteStorage({
                        key: e
                    })
                } catch (e) {}
            }
        }, {
            key: "_getPlatform",
            value: function () {
                return ""
            }
        }, {
            key: "getSystemInfo",
            value: function (t) {
                var n = this._config.mpPlatform;
                this.api.getSystemInfo({
                    success: function (e) {
                        _.isFunction(n) ? e.mp_platform = n(e) : e.mp_platform = n, t.success(e), "wechat" === n && t.complete()
                    },
                    complete: function () {
                        t.complete()
                    }
                })
            }
        }, {
            key: "getNetworkType",
            value: function (t) {
                _.isFunction(this.api.getNetworkType) ? this.api.getNetworkType({
                    success: function (e) {
                        t.success(e)
                    },
                    complete: function () {
                        t.complete()
                    }
                }) : (t.success({}), t.complete())
            }
        }, {
            key: "onNetworkStatusChange",
            value: function (e) {
                _.isFunction(this.api.onNetworkStatusChange) ? this.api.onNetworkStatusChange(e) : e({})
            }
        }, {
            key: "request",
            value: function (t) {
                var e;
                if ("ali_mp" === this._config.platform || "dd_mp" === this._config.platform) return (e = _.extend({}, t)).headers = t.header, e.success = function (e) {
                    e.statusCode = e.status, t.success(e)
                }, e.fail = function (e) {
                    e.errMsg = e.errorMessage, t.fail(e)
                }, "dd_mp" === this._config.platform ? this.api.httpRequest(e) : this.api.request(e);
                try {
                    return "taobao_mg" === this._config.platform ? xhrRequest(t) : this.api.request(t)
                } catch (e) {}
            }
        }, {
            key: "initAutoTrackInstance",
            value: function (e, t) {
                return _.isObject(t.autoTrack) && (t.autoTrack.isPlugin = t.is_plugin), new(this._config.mp ? AutoTrackBridge : AutoTrackBridge$1)(e, t.autoTrack, this.api)
            }
        }, {
            key: "setGlobal",
            value: function (e, t) {
                if (this._config.mp) logger.warn("GravityAnalytics: we do not set global name for GE instance when you do not enable auto track.");
                else if ("ali_mg" !== this._config.platform) try {
                    GameGlobal[t] = e
                } catch (e) {}
            }
        }, {
            key: "getAppOptions",
            value: function (e) {
                var t = {};
                try {
                    t = this.api.getLaunchOptionsSync()
                } catch (e) {
                    t = {}
                }
                if (_.isFunction(e)) try {
                    this._config.mp ? this.api.onAppShow(e) : this.api.onShow(e)
                } catch (e) {
                    logger.warn("Cannot register onShow callback.")
                }
                return t
            }
        }, {
            key: "showToast",
            value: function (e) {
                var t;
                _.isFunction(this.api.showToast) && (t = {
                    title: e
                }, "dd_mp" !== this._config.platform && "ali_mp" !== this._config.platform || (t.content = e), this.api.showToast(t))
            }
        }], [{
            key: "createInstance",
            value: function () {
                return this._createInstance("tt_mg")
            }
        }, {
            key: "_createInstance",
            value: function (e) {
                switch (e) {
                    case "wechat_mp":
                        return new r(wx, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_wechat"
                        }, {
                            mpPlatform: "wechat",
                            mp: !0,
                            platform: e
                        });
                    case "wechat_mg":
                        return new r(wx, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_wechat_game"
                        }, {
                            mpPlatform: "wechat",
                            platform: e
                        });
                    case "qq_mp":
                        return new r(qq, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_qq"
                        }, {
                            mpPlatform: "qq",
                            mp: !0,
                            platform: e
                        });
                    case "qq_mg":
                        return new r(qq, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_qq_game"
                        }, {
                            mpPlatform: "qq",
                            platform: e
                        });
                    case "baidu_mp":
                        return new r(swan, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_swan"
                        }, {
                            mpPlatform: function (e) {
                                return e.host
                            },
                            mp: !0,
                            platform: e
                        });
                    case "baidu_mg":
                        return new r(swan, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_swan_game"
                        }, {
                            mpPlatform: function (e) {
                                return e.host
                            },
                            platform: e
                        });
                    case "taobao_mg":
                        return new r(my, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_taobao_game"
                        }, {
                            mpPlatform: "taobao",
                            platform: e
                        });
                    case "tt_mg":
                        return new r(tt, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_tt_game"
                        }, {
                            mpPlatform: function (e) {
                                return e.appName
                            },
                            platform: e
                        });
                    case "tt_mp":
                        return new r(tt, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_tt"
                        }, {
                            mpPlatform: function (e) {
                                return e.appName
                            },
                            mp: !0,
                            platform: e
                        });
                    case "ali_mp":
                        return new r(my, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_ali"
                        }, {
                            mpPlatform: function (e) {
                                return e.app
                            },
                            mp: !0,
                            platform: e
                        });
                    case "ali_mg":
                        return new r(my, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_ali_game"
                        }, {
                            mpPlatform: function (e) {
                                return e.app
                            },
                            platform: e
                        });
                    case "dd_mp":
                        return new r(dd, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_dd"
                        }, {
                            mpPlatform: "dingding",
                            mp: !0,
                            platform: e
                        });
                    case "bl_mg":
                        return new r(bl, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_bl_game"
                        }, {
                            mpPlatform: "bilibili",
                            platform: e
                        });
                    case "kuaishou_mp":
                        return new r(ks, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_kuaishou_program"
                        }, {
                            mpPlatform: "kuaishou",
                            mp: !0,
                            platform: e
                        });
                    case "kuaishou_mg":
                        return new r(ks, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_kuaishou_game"
                        }, {
                            mpPlatform: "kuaishou_game",
                            platform: e
                        });
                    case "qh360_mg":
                        return new r(qh, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_qh360"
                        }, {
                            mpPlatform: "qh360",
                            platform: e
                        });
                    case "tb_mp":
                        return new r(my, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_tb"
                        }, {
                            mpPlatform: "tb",
                            mp: !0,
                            platform: e
                        });
                    case "jd_mp":
                        return new r(jd, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_jd"
                        }, {
                            mpPlatform: "jd",
                            mp: !0,
                            platform: e
                        });
                    case "qh360_mp":
                        return new r(qh, {
                            persistenceName: "GravityEngine",
                            persistenceNameOld: "GravityEngine_qh360"
                        }, {
                            mpPlatform: "qh360",
                            mp: !0,
                            platform: e
                        });
                    case "WEB":
                        return new PlatformProxy.createInstance
                }
            }
        }]), r
    }(),
    PlatformAPI = function () {
        function e() {
            _classCallCheck(this, e)
        }
        return _createClass(e, null, [{
            key: "_getCurrentPlatform",
            value: function () {
                return this.currentPlatform || (this.currentPlatform = PlatformProxy$1.createInstance())
            }
        }, {
            key: "getConfig",
            value: function () {
                return this._getCurrentPlatform().getConfig()
            }
        }, {
            key: "getStorage",
            value: function (e, t, n) {
                return this._getCurrentPlatform().getStorage(e, t, n)
            }
        }, {
            key: "setStorage",
            value: function (e, t) {
                return this._getCurrentPlatform().setStorage(e, t)
            }
        }, {
            key: "removeStorage",
            value: function (e) {
                return this._getCurrentPlatform().removeStorage(e)
            }
        }, {
            key: "getSystemInfo",
            value: function (e) {
                return this._getCurrentPlatform().getSystemInfo(e)
            }
        }, {
            key: "getNetworkType",
            value: function (e) {
                return this._getCurrentPlatform().getNetworkType(e)
            }
        }, {
            key: "getQuickDevice",
            value: function (e) {
                return this._getCurrentPlatform().getQuickDevice(e)
            }
        }, {
            key: "onNetworkStatusChange",
            value: function (e) {
                this._getCurrentPlatform().onNetworkStatusChange(e)
            }
        }, {
            key: "request",
            value: function (e) {
                return this._getCurrentPlatform().request(e)
            }
        }, {
            key: "initAutoTrackInstance",
            value: function (e, t) {
                return this._getCurrentPlatform().initAutoTrackInstance(e, t)
            }
        }, {
            key: "setGlobal",
            value: function (e, t) {
                e && t && this._getCurrentPlatform().setGlobal(e, t)
            }
        }, {
            key: "getAppOptions",
            value: function (e) {
                return this._getCurrentPlatform().getAppOptions(e)
            }
        }, {
            key: "showDebugToast",
            value: function (e) {
                this._getCurrentPlatform().showToast(e)
            }
        }]), e
    }(),
    _ = {},
    ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    slice = ArrayProto.slice,
    nativeToString = ObjProto.toString,
    nativeHasOwnProperty = Object.prototype.hasOwnProperty,
    nativeForEach = ArrayProto.forEach,
    nativeIsArray = Array.isArray,
    breaker = {},
    logger = (_.isNumber = function (e) {
        return "number" == typeof e ? 0 == e - e : "string" == typeof e && "" !== e.trim() && (Number.isFinite ? Number.isFinite(+e) : isFinite(+e))
    }, _.each = function (e, t, n) {
        if (null == e) return !1;
        if (nativeForEach && e.forEach === nativeForEach) e.forEach(t, n);
        else if (e.length === +e.length) {
            for (var r = 0, i = e.length; r < i; r++)
                if (r in e && t.call(n, e[r], r, e) === breaker) return !1
        } else
            for (var o in e)
                if (nativeHasOwnProperty.call(e, o) && t.call(n, e[o], o, e) === breaker) return !1
    }, _.sleep = function (t) {
        return new Promise(function (e) {
            return setTimeout(e, t)
        })
    }, _.extend = function (n) {
        return _.each(slice.call(arguments, 1), function (e) {
            for (var t in e) void 0 !== e[t] && (n[t] = e[t])
        }), n
    }, _.extend2Layers = function (n) {
        return _.each(slice.call(arguments, 1), function (e) {
            for (var t in e) void 0 !== e[t] && (_.isObject(e[t]) && _.isObject(n[t]) ? _.extend(n[t], e[t]) : n[t] = e[t])
        }), n
    }, _.isArray = nativeIsArray || function (e) {
        return "[object Array]" === nativeToString.call(e)
    }, _.isFunction = function (e) {
        try {
            return "function" == typeof e
        } catch (e) {
            return !1
        }
    }, _.isPromise = function (e) {
        return "[object Promise]" === nativeToString.call(e) && null != e
    }, _.isObject = function (e) {
        return "[object Object]" === nativeToString.call(e) && null != e
    }, _.isEmptyObject = function (e) {
        if (_.isObject(e)) {
            for (var t in e)
                if (nativeHasOwnProperty.call(e, t)) return !1;
            return !0
        }
        return !1
    }, _.isUndefined = function (e) {
        return void 0 === e
    }, _.isString = function (e) {
        return "[object String]" === nativeToString.call(e)
    }, _.isDate = function (e) {
        return "[object Date]" === nativeToString.call(e)
    }, _.isBoolean = function (e) {
        return "[object Boolean]" === nativeToString.call(e)
    }, _.isNumber = function (e) {
        return "[object Number]" === nativeToString.call(e) && /[\d\.]+/.test(String(e))
    }, _.isJSONString = function (e) {
        try {
            JSON.parse(e)
        } catch (e) {
            return !1
        }
        return !0
    }, _.decodeURIComponent = function (t) {
        var n = "";
        try {
            n = decodeURIComponent(t)
        } catch (e) {
            n = t
        }
        return n
    }, _.encodeURIComponent = function (t) {
        var n = "";
        try {
            n = encodeURIComponent(t)
        } catch (e) {
            n = t
        }
        return n
    }, _.utf8Encode = function (e) {
        for (var t, n = "", r = t = 0, i = (e = (e + "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")).length, o = 0; o < i; o++) {
            var a = e.charCodeAt(o),
                s = null;
            a < 128 ? t++ : s = 127 < a && a < 2048 ? String.fromCharCode(a >> 6 | 192, 63 & a | 128) : String.fromCharCode(a >> 12 | 224, a >> 6 & 63 | 128, 63 & a | 128), null !== s && (r < t && (n += e.substring(r, t)), n += s, r = t = o + 1)
        }
        return r < t && (n += e.substring(r, e.length)), n
    }, _.base64Encode = function (e) {
        var t, n, r, i, o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            a = 0,
            s = 0,
            c = "",
            u = [];
        if (!e) return e;
        for (e = _.utf8Encode(e); t = (i = e.charCodeAt(a++) << 16 | e.charCodeAt(a++) << 8 | e.charCodeAt(a++)) >> 12 & 63, n = i >> 6 & 63, r = 63 & i, u[s++] = o.charAt(i >> 18 & 63) + o.charAt(t) + o.charAt(n) + o.charAt(r), a < e.length;);
        switch (c = u.join(""), e.length % 3) {
            case 1:
                c = c.slice(0, -2) + "==";
                break;
            case 2:
                c = c.slice(0, -1) + "="
        }
        return c
    }, _.encodeDates = function (r) {
        return _.each(r, function (e, t) {
            if (_.isDate(e)) r[t] = _.formatDate(e);
            else if (_.isObject(e)) r[t] = _.encodeDates(e);
            else if (_.isArray(e))
                for (var n = 0; n < e.length; n++) _.isDate(e[n]) && (r[t][n] = _.formatDate(e[n]))
        }), r
    }, _.formatDate = function (e) {
        function t(e) {
            return e < 10 ? "0" + e : e
        }
        return e.getFullYear() + "-" + t(e.getMonth() + 1) + "-" + t(e.getDate()) + " " + t(e.getHours()) + ":" + t(e.getMinutes()) + ":" + t(e.getSeconds()) + "." + ((e = e.getMilliseconds()) < 100 && 9 < e ? "0" + e : e < 10 ? "00" + e : e)
    }, _.searchObjDate = function (n) {
        try {
            (_.isObject(n) || _.isArray(n)) && _.each(n, function (e, t) {
                _.isObject(e) || _.isArray(e) ? _.searchObjDate(n[t]) : _.isDate(e) && (n[t] = _.formatDate(e))
            })
        } catch (e) {
            logger.warn(e)
        }
    }, _.UUID = function () {
        var e = (new Date).getTime();
        return String(Math.random()).replace(".", "").slice(1, 11) + "-" + e
    }, _.UUIDv4 = function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (e) {
            var t = 16 * Math.random() | 0;
            return ("x" === e ? t : 3 & t | 8).toString(16)
        })
    }, _.setMpPlatform = function (e) {
        _.mpPlatform = e
    }, _.getMpPlatform = function () {
        return _.mpPlatform
    }, _.createExtraHeaders = function () {
        return {
            "GE-Integration-Type": Config.LIB_NAME,
            "GE-Integration-Version": Config.LIB_VERSION,
            "GE-Integration-Count": "1",
            "GE-Integration-Extra": _.getMpPlatform()
        }
    }, _.checkAppId = function (e) {
        if ("number" == typeof e) e = String(e);
        else if ("string" != typeof e) return "";
        return e = e.replace(/\s*/g, "")
    }, _.checkUrl = function (e) {
        return e = e.replace(/\s*/g, ""), e = _.url("basic", e)
    }, _.url = function () {
        function i() {
            return new RegExp(/(.*?)\.?([^.]*?)\.(com|net|org|biz|ws|in|me|co\.uk|co|org\.uk|ltd\.uk|plc\.uk|me\.uk|edu|mil|br\.com|cn\.com|eu\.com|hu\.com|no\.com|qc\.com|sa\.com|se\.com|se\.net|us\.com|uy\.com|ac|co\.ac|gv\.ac|or\.ac|ac\.ac|af|am|as|at|ac\.at|co\.at|gv\.at|or\.at|asn\.au|com\.au|edu\.au|org\.au|net\.au|id\.au|be|ac\.be|adm\.br|adv\.br|am\.br|arq\.br|art\.br|bio\.br|cng\.br|cnt\.br|com\.br|ecn\.br|eng\.br|esp\.br|etc\.br|eti\.br|fm\.br|fot\.br|fst\.br|g12\.br|gov\.br|ind\.br|inf\.br|jor\.br|lel\.br|med\.br|mil\.br|net\.br|nom\.br|ntr\.br|odo\.br|org\.br|ppg\.br|pro\.br|psc\.br|psi\.br|rec\.br|slg\.br|tmp\.br|tur\.br|tv\.br|vet\.br|zlg\.br|br|ab\.ca|bc\.ca|mb\.ca|nb\.ca|nf\.ca|ns\.ca|nt\.ca|on\.ca|pe\.ca|qc\.ca|sk\.ca|yk\.ca|ca|cc|ac\.cn|net\.cn|com\.cn|edu\.cn|gov\.cn|org\.cn|bj\.cn|sh\.cn|tj\.cn|cq\.cn|he\.cn|nm\.cn|ln\.cn|jl\.cn|hl\.cn|js\.cn|zj\.cn|ah\.cn|gd\.cn|gx\.cn|hi\.cn|sc\.cn|gz\.cn|yn\.cn|xz\.cn|sn\.cn|gs\.cn|qh\.cn|nx\.cn|xj\.cn|tw\.cn|hk\.cn|mo\.cn|cn|cx|cz|de|dk|fo|com\.ec|tm\.fr|com\.fr|asso\.fr|presse\.fr|fr|gf|gs|co\.il|net\.il|ac\.il|k12\.il|gov\.il|muni\.il|ac\.in|co\.in|org\.in|ernet\.in|gov\.in|net\.in|res\.in|is|it|ac\.jp|co\.jp|go\.jp|or\.jp|ne\.jp|ac\.kr|co\.kr|go\.kr|ne\.kr|nm\.kr|or\.kr|li|lt|lu|asso\.mc|tm\.mc|com\.mm|org\.mm|net\.mm|edu\.mm|gov\.mm|ms|nl|no|nu|pl|ro|org\.ro|store\.ro|tm\.ro|firm\.ro|www\.ro|arts\.ro|rec\.ro|info\.ro|nom\.ro|nt\.ro|se|si|com\.sg|org\.sg|net\.sg|gov\.sg|sk|st|tf|ac\.th|co\.th|go\.th|mi\.th|net\.th|or\.th|tm|to|com\.tr|edu\.tr|gov\.tr|k12\.tr|net\.tr|org\.tr|com\.tw|org\.tw|net\.tw|ac\.uk|uk\.com|uk\.net|gb\.com|gb\.net|vg|sh|kz|ch|info|ua|gov|name|pro|ie|hk|com\.hk|org\.hk|net\.hk|edu\.hk|us|tk|cd|by|ad|lv|eu\.lv|bz|es|jp|cl|ag|mobi|eu|co\.nz|org\.nz|net\.nz|maori\.nz|iwi\.nz|io|la|md|sc|sg|vc|tw|travel|my|se|tv|pt|com\.pt|edu\.pt|asia|fi|com\.ve|net\.ve|fi|org\.ve|web\.ve|info\.ve|co\.ve|tel|im|gr|ru|net\.ru|org\.ru|hr|com\.hr|ly|xyz)$/)
        }

        function o(e, t) {
            var n = e.charAt(0),
                t = t.split(n);
            return n === e ? t : t[(e = parseInt(e.substring(1), 10)) < 0 ? t.length + e : e - 1]
        }

        function a(e, t) {
            for (var n, r = e.charAt(0), i = t.split("&"), o = [], a = {}, s = e.substring(1), c = 0, u = i.length; c < u; c++)
                if ("" !== (o = (o = i[c].match(/(.*?)=(.*)/)) || [i[c], i[c], ""])[1].replace(/\s/g, "")) {
                    if (o[2] = (n = o[2] || "", _.decodeURIComponent(n.replace(/\+/g, " "))), s === o[1]) return o[2];
                    (n = o[1].match(/(.*)\[([0-9]+)\]/)) ? (a[n[1]] = a[n[1]] || [], a[n[1]][n[2]] = o[2]) : a[o[1]] = o[2]
                } return r === e ? a : a[s]
        }
        return function (e, t) {
            var n, r = {};
            if ("tld?" === e) return i();
            if (t = t || window.location.toString(), !e) return t;
            if (e = e.toString(), t.match(/^mailto:([^/].+)/)) n = t.match(/^mailto:([^/].+)/), r.protocol = "mailto", r.email = n[1];
            else {
                if ((t = t.match(/(.*?)\/#!(.*)/) ? (n = t.match(/(.*?)\/#!(.*)/))[1] + n[2] : t).match(/(.*?)#(.*)/) && (n = t.match(/(.*?)#(.*)/), r.hash = n[2], t = n[1]), r.hash && e.match(/^#/)) return a(e, r.hash);
                if (t.match(/(.*?)\?(.*)/) && (n = t.match(/(.*?)\?(.*)/), r.query = n[2], t = n[1]), r.query && e.match(/^\?/)) return a(e, r.query);
                if (t.match(/(.*?):?\/\/(.*)/) && (n = t.match(/(.*?):?\/\/(.*)/), r.protocol = n[1].toLowerCase(), t = n[2]), t.match(/(.*?)(\/.*)/) && (n = t.match(/(.*?)(\/.*)/), r.path = n[2], t = n[1]), r.path = (r.path || "").replace(/^([^/])/, "/$1").replace(/\/$/, ""), (e = e.match(/^[-0-9]+$/) ? e.replace(/^([^/])/, "/$1") : e).match(/^\//)) return o(e, r.path.substring(1));
                if ((n = (n = o("/-1", r.path.substring(1))) && n.match(/(.*?)\.(.*)/)) && (r.file = n[0], r.filename = n[1], r.fileext = n[2]), t.match(/(.*):([0-9]+)$/) && (n = t.match(/(.*):([0-9]+)$/), r.port = n[2], t = n[1]), t.match(/(.*?)@(.*)/) && (n = t.match(/(.*?)@(.*)/), r.auth = n[1], t = n[2]), r.auth && (n = r.auth.match(/(.*):(.*)/), r.user = n ? n[1] : r.auth, r.pass = n ? n[2] : void 0), r.hostname = t.toLowerCase(), "." === e.charAt(0)) return o(e, r.hostname);
                i() && (n = r.hostname.match(i())) && (r.tld = n[3], r.domain = n[2] ? n[2] + "." + n[3] : void 0, r.sub = n[1] || void 0);
                t = r.port ? ":" + r.port : "";
                r.protocol = r.protocol || window.location.protocol.replace(":", ""), r.port = r.port || ("https" === r.protocol ? "443" : "80"), r.protocol = r.protocol || ("443" === r.port ? "https" : "http"), r.basic = r.protocol + "://" + r.hostname + t
            }
            return e in r ? r[e] : "{}" === e ? r : ""
        }
    }(), _.createString = function (e) {
        for (var t = e, n = Math.random().toString(36).substr(2); n.length < t;) n += Math.random().toString(36).substr(2);
        return n = n.substr(0, e)
    }, _.createAesKey = function () {
        return _.createString(16)
    }, _.setQuery = function (e) {
        try {
            if (!_.isObject(e)) return "";
            var t, n = PlatformAPI.getConfig().persistenceNameOld.includes("GravityEngine_ali"),
                r = [];
            for (t in e)(n || e.hasOwnProperty(t)) && r.push(encodeURIComponent(t) + "=" + encodeURIComponent(e[t]));
            return r.join("&")
        } catch (e) {
            return ""
        }
    }, _.generateEncryptyData = function (e, t) {
        if (void 0 !== t) {
            var n = t.publicKey,
                t = t.version;
            if (void 0 !== n && void 0 !== t && "undefined" != typeof CryptoJS && "undefined" != typeof JSEncrypt) {
                var r = _.createAesKey();
                try {
                    var i = CryptoJS.enc.Utf8.parse(r),
                        o = CryptoJS.enc.Utf8.parse(JSON.stringify(e)),
                        a = _.isUndefined(CryptoJS.pad.Pkcs7) ? CryptoJS.pad.PKCS7 : CryptoJS.pad.Pkcs7,
                        s = CryptoJS.AES.encrypt(o, i, {
                            mode: CryptoJS.mode.ECB,
                            padding: a
                        }).toString(),
                        c = new JSEncrypt,
                        u = (c.setPublicKey(n), c.encrypt(r));
                    return !1 === u ? (logger.warn("私钥加密失败，返回原数据"), e) : {
                        pkv: t,
                        ekey: u,
                        payload: s
                    }
                } catch (e) {
                    logger.warn("数据加密失败，返回原数据: " + e)
                }
            }
        }
        return e
    }, "object" === _typeof(logger) ? logger : {}),
    KEY_NAME_MATCH_REGEX = (logger.info = function () {
        if ("object" === ("undefined" == typeof console ? "undefined" : _typeof(console)) && console.log && logger.enabled) try {
            return console.log.apply(console, arguments)
        } catch (e) {
            console.log(arguments[0])
        }
    }, logger.warn = function () {
        if ("object" === ("undefined" == typeof console ? "undefined" : _typeof(console)) && console.log && logger.enabled) try {
            return console.warn.apply(console, arguments)
        } catch (e) {
            console.warn(arguments[0])
        }
    }, logger.tencentSdkLog = function (e) {
        console.log("触发tencentSDK：", e)
    }, /^\$?[a-zA-Z][a-zA-Z0-9_]{0,49}$/),
    PropertyChecker = function () {
        function e() {
            _classCallCheck(this, e)
        }
        return _createClass(e, null, [{
            key: "stripProperties",
            value: function (e) {
                return _.isObject(e) && _.each(e, function (e, t) {
                    _.isString(e) || _.isNumber(e) || _.isDate(e) || _.isBoolean(e) || _.isArray(e) || _.isObject(e) || logger.warn("Your data -", t, e, "- format does not meet requirements and may not be stored correctly. Attribute values only support String, Number, Date, Boolean, Array, Object")
                }), e
            }
        }, {
            key: "_checkPropertiesKey",
            value: function (e) {
                var n = !0;
                return _.each(e, function (e, t) {
                    KEY_NAME_MATCH_REGEX.test(t) || (logger.warn("Invalid KEY: " + t), n = !1)
                }), n
            }
        }, {
            key: "event",
            value: function (e) {
                return !(!_.isString(e) || !KEY_NAME_MATCH_REGEX.test(e)) || (logger.warn("Check the parameter format. The eventName must start with an English letter and contain no more than 50 characters including letters, digits, and underscores: " + e), !1)
            }
        }, {
            key: "propertyName",
            value: function (e) {
                return !(!_.isString(e) || !KEY_NAME_MATCH_REGEX.test(e)) || (logger.warn("Check the parameter format. PropertyName must start with a letter and contain letters, digits, and underscores (_). The value is a string of no more than 50 characters: " + e), !1)
            }
        }, {
            key: "properties",
            value: function (e) {
                return this.stripProperties(e), !(e && (_.isObject(e) ? !this._checkPropertiesKey(e) && (logger.warn("Check the parameter format. The properties key must start with a letter, contain digits, letters, and underscores (_), and contain a maximum of 50 characters"), 1) : (logger.warn("properties can be none, but it must be an object"), 1)))
            }
        }, {
            key: "propertiesMust",
            value: function (e) {
                return this.stripProperties(e), void 0 === e || !_.isObject(e) || _.isEmptyObject(e) ? (logger.warn("properties must be an object with a value"), !1) : !!this._checkPropertiesKey(e) || (logger.warn("Check the parameter format. The properties key must start with a letter, contain digits, letters, and underscores (_), and contain a maximum of 50 characters"), !1)
            }
        }, {
            key: "userId",
            value: function (e) {
                return !(!_.isString(e) || !/^.{1,64}$/.test(e)) || (logger.warn("The user ID must be a string of less than 64 characters and cannot be null"), !1)
            }
        }, {
            key: "userAddProperties",
            value: function (e) {
                if (!this.propertiesMust(e)) return !1;
                for (var t in e)
                    if (!_.isNumber(e[t])) return logger.warn("The attributes of userAdd need to be Number"), !1;
                return !0
            }
        }, {
            key: "userAppendProperties",
            value: function (e) {
                if (!this.propertiesMust(e)) return !1;
                for (var t in e)
                    if (!_.isArray(e[t])) return logger.warn("The attribute of userAppend must be Array"), !1;
                return !0
            }
        }]), e
    }();

function t(e, t, n) {
    return (t = p(t)) in e ? Object.defineProperty(e, t, {
        value: n,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = n, e
}

function e(e) {
    return function (e) {
        if (Array.isArray(e)) return r(e)
    }(e) || function () {
        if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
    }() || n(e) || function () {
        throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
    }()
}

function n(e, t) {
    var n;
    if (e) return "string" == typeof e ? r(e, t) : "Map" === (n = "Object" === (n = Object.prototype.toString.call(e).slice(8, -1)) && e.constructor ? e.constructor.name : n) || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? r(e, t) : void 0
}

function r(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r
}

function o(e, t) {
    if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(t && t.prototype, {
        constructor: {
            value: e,
            writable: !0,
            configurable: !0
        }
    }), Object.defineProperty(e, "prototype", {
        writable: !1
    }), t && i(e, t)
}

function i(e, t) {
    return (i = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (e, t) {
        return e.__proto__ = t, e
    })(e, t)
}

function a(n) {
    var r = function () {
        if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
        if (Reflect.construct.sham) return !1;
        if ("function" == typeof Proxy) return !0;
        try {
            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0
        } catch (e) {
            return !1
        }
    }();
    return function () {
        var e, t = s(n);
        return u(this, r ? (e = s(this).constructor, Reflect.construct(t, arguments, e)) : t.apply(this, arguments))
    }
}

function u(e, t) {
    if (t && ("object" === l(t) || "function" == typeof t)) return t;
    if (void 0 !== t) throw new TypeError("Derived constructors may only return object or undefined");
    return c(e)
}

function c(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e
}

function s(e) {
    return (s = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (e) {
        return e.__proto__ || Object.getPrototypeOf(e)
    })(e)
}

function l(e) {
    return (l = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
        return _typeof(e)
    } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : _typeof(e)
    })(e)
}

function f(e, t) {
    if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function")
}

function d(e, t) {
    for (var n = 0; n < t.length; n++) {
        var r = t[n];
        r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(e, p(r.key), r)
    }
}

function v(e, t, n) {
    return t && d(e.prototype, t), n && d(e, n), Object.defineProperty(e, "prototype", {
        writable: !1
    }), e
}

function p(e) {
    e = function (e) {
        if ("object" !== l(e) || null === e) return e;
        var t = e[Symbol.toPrimitive];
        if (void 0 === t) return String(e);
        t = t.call(e, "string");
        if ("object" !== l(t)) return t;
        throw new TypeError("@@toPrimitive must return a primitive value.")
    }(e);
    return "symbol" === l(e) ? e : String(e)
}
var h, y, _$1 = "LOCAL_ID",
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
    tt$1 = (y = function (e) {
        return "".concat("@dn-sdk/minigame", "_").concat("production", "_").concat(e)
    }, {
        getSync: function (e) {
            var t;
            try {
                t = wx.getStorageSync(y(e))
            } catch (e) {
                console.error("storage get error", e)
            }
            return t
        },
        setSync: function (e, t) {
            try {
                wx.setStorageSync(y(e), t)
            } catch (e) {
                return console.error("storage set error", e), !1
            }
            return !0
        }
    }),
    et = function () {
        if (h) return h;
        try {
            return h = wx.getSystemInfoSync()
        } catch (e) {
            return {}
        }
    },
    nt = function () {
        var r;
        return function () {
            var e, t, n;
            return r || (t = (e = et()).system, t = (null == (t = void 0 === t ? "" : t) ? void 0 : t.split(" ")) || [], n = (n = t[0]) ? -1 < (n = (null == n ? void 0 : n.toUpperCase()) || "").indexOf("ANDROID") ? O : -1 < n.indexOf("IOS") ? I : -1 < n.indexOf("MAC") ? C : -1 < n.indexOf("WINDOWS") ? w : x : x, t = !(t = t) || t.length <= 0 ? "" : 2 === t.length ? t[1] : 3 === t.length && "Windows" === t[0] ? "".concat(t[1], " ").concat(t[2]) : t[t.length - 1], r = {
                benchmark_level: e.benchmarkLevel,
                device_brand: e.brand,
                screen_height: Math.floor(e.screenHeight),
                screen_width: Math.floor(e.screenWidth),
                wx_lib_version: e.SDKVersion,
                wx_version: e.version,
                wx_platform: e.platform,
                device_model: e.model,
                os: n,
                os_version: t
            }), r
        }
    }(),
    rt = function () {
        var e;
        return function () {
            try {
                if (e) return e;
                (e = e || tt$1.getSync(_$1) || "") || (e = mt(), tt$1.setSync(_$1, e))
            } catch (e) {}
            return e
        }
    }(),
    ot = function () {
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
                }), wx.onNetworkStatusChange(function (e) {
                    t = e.networkType
                }), e = !0
            } catch (e) {}
            return t
        }
    }(),
    it = (ot(), function () {
        var e = "";
        return function () {
            return e = e || tt$1.getSync(T) || ""
        }
    }()),
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

function ut(e) {
    var t, n = null == e ? void 0 : e.query;
    return ht(n) ? (t = "", n.gdt_vid || -1 < [1045, 1046, 1084].indexOf(null == e ? void 0 : e.scene) ? t = Y : n.clue_token || n.clickid && n.item_id ? t = W : n.callback && "kuaishou" === n.ksChannel ? t = J : n.bd_vid || n.ai && n.d && n.q && n.c ? t = z : n.uctrackid ? t = H : (n.trackid || n.imp || -1 < [1065, 1069, 1194].indexOf(null == e ? void 0 : e.scene) && (n.callback || n.u)) && (t = $), t) : ""
}

function ct(e, t) {
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
            i = Object.assign(r, e);
        wx.request({
            url: "https://api.datanexus.qq.com/data-nexus-trace/log",
            data: i,
            method: "POST",
            timeout: E.requestTimeout,
            success: function (e) {
                "function" == typeof t && 200 === (null == e ? void 0 : e.statusCode) && t()
            }
        })
    } catch (n) {
        xt.error(n)
    }
}
var st = function () {
    function e() {
        f(this, e)
    }
    return v(e, null, [{
        key: "revise",
        value: function (e) {
            0 < e && !this.isRevised && (this.offsetTime = e - Date.now(), this.isRevised = !0)
        }
    }, {
        key: "getRevisedcurrentTimeMillis",
        value: function () {
            return this.isRevised ? Date.now() + this.offsetTime : -1
        }
    }]), e
}();

function lt(e) {
    return new Promise(function (t, n) {
        wx.request({
            method: "POST",
            url: "https://api.datanexus.qq.com/data-nexus-config/v1/sdk/config/get",
            data: e,
            timeout: E.requestTimeout,
            success: function (e) {
                ft(e, t, "config/get", n), vt(e)
            },
            fail: function (e) {
                dt(e, "config/get", n)
            }
        })
    })
}

function ft(e, t, n, r) {
    var i, o = null == e ? void 0 : e.statusCode,
        a = null == (a = null == e ? void 0 : e.data) ? void 0 : a.code;
    200 !== o || 0 !== a ? (i = 200 !== o ? "number" == typeof o ? -1 * o : -888 : a, ct({
        log_type: b.REQUEST_CONFIG_ERROR,
        message: "cgiName: ".concat(n, ", statusCode: ").concat(o, ", code: ").concat(a, ", traceid: ").concat(null == (n = null == e ? void 0 : e.data) ? void 0 : n.trace_id),
        code: i
    }), null != r && r(null == (o = null == e ? void 0 : e.data) ? void 0 : o.data)) : t(null == (a = e.data) ? void 0 : a.data)
}

function dt(e, t, n) {
    ct({
        log_type: b.REQUEST_CONFIG_ERROR,
        message: "cgiName: ".concat(t, " , message: ").concat(null == e ? void 0 : e.errMsg, " "),
        code: "number" == typeof (null == e ? void 0 : e.errno) ? -1 * e.errno : -999
    }), null != n && n(e)
}

function vt(e) {
    e = +(null == (e = null == e ? void 0 : e.header) ? void 0 : e["Server-Time"]);
    17266752e5 < e && st.revise(e)
}
st.offsetTime = 0, st.isRevised = !1;
var pt = Object.prototype.toString,
    ht = function (e) {
        return "[object Object]" === pt.call(e)
    },
    yt = function (e) {
        return "[object Array]" === pt.call(e)
    },
    _t = function (e) {
        return "[object Function]" === pt.call(e)
    },
    gt = (new Date).getTime();

function mt() {
    var n = (new Date).getTime(),
        r = Math.abs(1e3 * (n - gt));
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (e) {
        var t = 16 * Math.random();
        return 0 < n ? (t = (n + t) % 16 | 0, n = Math.floor(n / 16)) : (t = (r + t) % 16 | 0, r = Math.floor(r / 16)), ("x" === e ? t : 3 & t | 8).toString(16).replace(/-/g, "")
    })
}
var At = /^v?(?:\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+)(\.(?:[x*]|\d+))?(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i,
    Rt = function (e) {
        if ("string" != typeof e) throw new TypeError("Invalid argument expected string");
        if (!At.test(e)) throw new Error("Invalid argument not valid semver ('".concat(e, "' received)"))
    },
    kt = function (e) {
        return isNaN(Number(e)) ? e : Number(e)
    },
    Tt = function (e) {
        var e = e.replace(/^v/, "").replace(/\+.*$/, ""),
            t = -1 === (t = e).indexOf("-") ? t.length : t.indexOf("-"),
            n = e.substring(0, t).split(".");
        return n.push(e.substring(t + 1)), n
    },
    St = function (e, t) {
        [e, t].forEach(Rt);
        for (var n = Tt(e), r = Tt(t), i = 0; i < Math.max(n.length - 1, r.length - 1); i++) {
            var o = parseInt(n[i] || "0", 10),
                a = parseInt(r[i] || "0", 10);
            if (a < o) return 1;
            if (o < a) return -1
        }
        e = n[n.length - 1], t = r[r.length - 1];
        if (e && t)
            for (var s = e.split(".").map(kt), c = t.split(".").map(kt), u = 0; u < Math.max(s.length, c.length); u++) {
                if (void 0 === s[u] || "string" == typeof c[u] && "number" == typeof s[u]) return -1;
                if (void 0 === c[u] || "string" == typeof s[u] && "number" == typeof c[u] || s[u] > c[u]) return 1;
                if (c[u] > s[u]) return -1
            } else if (e || t) return e ? -1 : 1;
        return 0
    },
    Et = function (e) {
        {
            if (ht(e)) {
                var t, n = ["user_action_set_id", "secret_key", "appid", "openid", "unionid", "user_unique_id", "auto_track", "auto_attr"];
                for (t in e) n.includes(t) || xt.warn("Invalid property '".concat(t, "' found in config"));
                return "number" != typeof e.user_action_set_id ? "user_action_set_id 参数需为 number 类型" : e.user_action_set_id <= 0 ? "user_action_set_id 参数需大于 0" : "string" != typeof e.secret_key ? "secret_key 参数需为 string 类型" : "" === e.secret_key.trim() ? "缺少 secret_key 参数" : 32 !== e.secret_key.length ? "secret_key 参数需为 32 位字符串" : "string" != typeof e.appid ? "appid 参数需为 string 类型" : "" !== e.appid.trim() || "缺少 appid"
            }
            return "初始化参数需为 object 类型"
        }
    };

function bt(e) {
    return Ot()[e]
}

function Ot() {
    return E
}

function It(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t)
}
var wt = function (t) {
        try {
            return t && "string" == typeof t ? -1 === (t = t.replace(/\s/g, "")).indexOf(".") ? t : t.split(".").slice(0, 2).join(".") : ""
        } catch (e) {
            return t
        }
    },
    Ct = function () {
        function o() {
            f(this, o)
        }
        return v(o, null, [{
            key: "error",
            value: function (e) {
                for (var t, n = arguments.length, r = new Array(1 < n ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
                (t = console).error.apply(t, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(r))
            }
        }, {
            key: "info",
            value: function (e) {
                for (var t, n = arguments.length, r = new Array(1 < n ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
                o.debug && (t = console).info.apply(t, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(r))
            }
        }, {
            key: "log",
            value: function (e) {
                for (var t, n = arguments.length, r = new Array(1 < n ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
                o.debug && (t = console).log.apply(t, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(r))
            }
        }, {
            key: "warn",
            value: function (e) {
                for (var t, n = arguments.length, r = new Array(1 < n ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
                (t = console).warn.apply(t, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(r))
            }
        }, {
            key: "devLog",
            value: function (e) {
                for (var t, n = arguments.length, r = new Array(1 < n ? n - 1 : 0), i = 1; i < n; i++) r[i - 1] = arguments[i];
                o.isDev && (t = console).log.apply(t, ["".concat("[@dn-sdk/minigame v1.5.4]", ": ").concat(e)].concat(r))
            }
        }]), o
    }(),
    xt = Ct,
    Nt = (xt.debug = !1, xt.isDev = !1, function () {
        var r;
        return function () {
            if (!r) try {
                var e = wx.getLaunchOptionsSync(),
                    t = e.query.gdt_vid || "",
                    n = (t ? tt$1.setSync(m, t) : t = tt$1.getSync(m) || "", JSON.stringify(e));
                1e4 < n.length && (n = JSON.stringify({
                    cut: 1,
                    scene: e.scene
                })), r = {
                    source_scene: e.scene,
                    pkg_channel_id: e.query.wxgamepro || "",
                    ad_trace_id: t,
                    launch_options: n,
                    channel: ut(e)
                }
            } catch (e) {
                r = {}, xt.log("获取场景值和渠道号失败", e)
            }
            return r
        }
    }());

function Lt(i, o, e) {
    var a = e.value;
    return e.value = function () {
        for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
        try {
            return a.apply(this, t)
        } catch (e) {
            try {
                xt.error.apply(xt, ["calling ".concat(i.constructor.name, ".").concat(o, " error with arguments")].concat(t)), xt.error(e);
                var r = {
                    log_type: b.JS_RUN_ERROR,
                    message: "[safeExcutable] ".concat(i.constructor.name, ".").concat(o, ": ").concat(null == e ? void 0 : e.message),
                    err_stack: null == e ? void 0 : e.stack
                };
                _t(this.reportLog) ? this.reportLog(r) : ct(r)
            } catch (r) {}
        }
    }, e
}
var Pt = function (e, t, n) {
        var r = n.value;
        return n.value = function () {
            if (this.inited) {
                for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                return r.apply(this, t)
            }
            xt.error("上报失败，请先完成初始化")
        }, n
    },
    Mt = Object.defineProperty,
    Dt = Object.getOwnPropertyDescriptor,
    Ut = function (e, t, n, r) {
        for (var i, o = 1 < r ? void 0 : r ? Dt(t, n) : t, a = e.length - 1; 0 <= a; a--)(i = e[a]) && (o = (r ? i(t, n, o) : i(o)) || o);
        return r && o && Mt(t, n, o), o
    },
    qt = function () {
        function n(e) {
            var t = e.userActionSetId,
                e = e.maxLength,
                e = void 0 === e ? 500 : e;
            f(this, n), this.lostActionMaps = {}, this.stack = [], this.localStorageKey = "", this.localStorageKey = "".concat(g, "_").concat(null == t ? void 0 : t.toString()), this.maxLength = e, this.userActionSetId = t, this.setTimeStamp(), this.init()
        }
        return v(n, [{
            key: "getItems",
            value: function () {
                return this.stack
            }
        }, {
            key: "getStorage",
            value: function () {
                var e = (null == tt$1 ? void 0 : tt$1.getSync(this.localStorageKey)) || "[]";
                return JSON.parse(e)
            }
        }, {
            key: "reportLostNum",
            value: function () {
                var e, i = this,
                    t = Object.assign({}, this.lostActionMaps),
                    n = [];
                for (e in t) {
                    var r = null == e ? void 0 : e.split("_");
                    n.push({
                        queue_lost_session_id: r[0],
                        queue_lost_timestamp: r[1],
                        queue_lost_num: t[e]
                    })
                }
                n.length && (this.setTimeStamp(), n.forEach(function (e) {
                    var t = Object.assign({}, {
                            user_action_set_id: i.userActionSetId,
                            log_type: b.QUEUE_LOST_NUM
                        }, e),
                        n = null == e ? void 0 : e.queue_lost_session_id,
                        e = null == e ? void 0 : e.queue_lost_timestamp,
                        r = "".concat(n, "_").concat(e);
                    ct(t, function () {
                        It(i.lostActionMaps, r) && (delete i.lostActionMaps[r], tt$1.setSync(A, JSON.stringify(i.lostActionMaps)))
                    })
                }))
            }
        }, {
            key: "getLostMaps",
            value: function () {
                return this.lostActionMaps
            }
        }, {
            key: "init",
            value: function () {
                var e = this,
                    t = this.getStorage(),
                    t = null == t ? void 0 : t.map(function (e) {
                        return e.inner_status === (null == S ? void 0 : S.reporting) ? Object.assign({}, e, {
                            inner_status: null == S ? void 0 : S.fail,
                            is_retry: !0,
                            retry_count: e.retry_count + 1
                        }) : e
                    });
                this.stack = t, this.lostActionMaps = JSON.parse(tt$1.getSync(A) || "{}"), setTimeout(function () {
                    e.reportLostNum()
                }, 1e3)
            }
        }, {
            key: "addItem",
            value: function (e) {
                var t;
                null != (t = null == this ? void 0 : this.stack) && t.push(e)
            }
        }, {
            key: "removeItems",
            value: function (t) {
                var e = null == (e = null == this ? void 0 : this.stack) ? void 0 : e.filter(function (e) {
                    return !(null != t && t.includes(null == e ? void 0 : e.action_id))
                });
                this.stack = e
            }
        }, {
            key: "updateForReportFail",
            value: function (t) {
                var e;
                this.stack = null == (e = this.stack) ? void 0 : e.map(function (e) {
                    return null != t && t.includes(null == e ? void 0 : e.action_id) ? Object.assign({}, e, {
                        inner_status: null == S ? void 0 : S.fail,
                        retry_count: e.retry_count + 1,
                        is_retry: !0
                    }) : e
                })
            }
        }, {
            key: "updateForReporting",
            value: function (t) {
                var e;
                this.stack = null == (e = this.stack) ? void 0 : e.map(function (e) {
                    return null != t && t.includes(null == e ? void 0 : e.action_id) ? Object.assign({}, e, {
                        inner_status: null == S ? void 0 : S.reporting
                    }) : e
                })
            }
        }, {
            key: "updateAllStack",
            value: function (e) {
                this.stack = e
            }
        }, {
            key: "updateToStorage",
            value: function () {
                tt$1.setSync(this.localStorageKey, JSON.stringify(this.stack))
            }
        }, {
            key: "updateLostAction",
            value: function (e) {
                var t;
                e && (e = "".concat(e, "_").concat(this.timeStamp), t = this.lostActionMaps[e] || 0, this.lostActionMaps[e] = t + 1, tt$1.setSync(A, JSON.stringify(this.lostActionMaps)))
            }
        }, {
            key: "setTimeStamp",
            value: function () {
                this.timeStamp = Date.now().toString()
            }
        }]), n
    }(),
    jt = (Ut([Lt], qt.prototype, "getItems", 1), Ut([Lt], qt.prototype, "getStorage", 1), Ut([Lt], qt.prototype, "reportLostNum", 1), Ut([Lt], qt.prototype, "getLostMaps", 1), Ut([Lt], qt.prototype, "init", 1), Ut([Lt], qt.prototype, "addItem", 1), Ut([Lt], qt.prototype, "removeItems", 1), Ut([Lt], qt.prototype, "updateForReportFail", 1), Ut([Lt], qt.prototype, "updateForReporting", 1), Ut([Lt], qt.prototype, "updateAllStack", 1), Ut([Lt], qt.prototype, "updateToStorage", 1), Ut([Lt], qt.prototype, "updateLostAction", 1), Object.defineProperty),
    Ft = Object.getOwnPropertyDescriptor,
    Bt = function (e, t, n, r) {
        for (var i, o = 1 < r ? void 0 : r ? Ft(t, n) : t, a = e.length - 1; 0 <= a; a--)(i = e[a]) && (o = (r ? i(t, n, o) : i(o)) || o);
        return r && o && jt(t, n, o), o
    },
    Vt = function () {
        o(i, qt);
        var r = a(i);

        function i(e) {
            var t = e.userActionSetId,
                n = e.maxLength,
                n = void 0 === n ? 500 : n,
                e = e.ogEvents,
                e = void 0 === e ? [] : e;
            return f(this, i), (t = r.call(this, {
                userActionSetId: t,
                maxLength: n
            })).ogEvents = e, t
        }
        return v(i, [{
            key: "getReportableActions",
            value: function () {
                var t = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 100,
                    e = this.getItems(),
                    n = [];
                return null != e && e.forEach(function (e) {
                    (null == n ? void 0 : n.length) < t && (null == e ? void 0 : e.inner_status) !== (null == S ? void 0 : S.reporting) && null != n && n.push(e)
                }), n
            }
        }, {
            key: "addAction",
            value: function (e) {
                var t, n = this.getItems();
                (null == n ? void 0 : n.length) >= this.maxLength ? (t = "队列长度超过最大限制".concat(this.maxLength, "条，SDK将按照行为优先级排序，丢弃优先级最低的行为事件"), xt.warn(t), ct({
                    user_action_set_id: this.userActionSetId,
                    log_type: b.JS_QUEUE_LOG,
                    message: t
                }), t = this.sortQueue(e, n), xt.debug && xt.info("超过".concat(this.maxLength, "条按优先级排序的队列："), t.concat([])), n = t.pop(), this.updateAllStack(t), this.updateLostAction((null == n ? void 0 : n.session_id) || "")) : this.addItem(e), this.updateToStorage()
            }
        }, {
            key: "removeActions",
            value: function (e) {
                this.removeItems(e), this.updateToStorage()
            }
        }, {
            key: "updateActionsForReportFail",
            value: function (e) {
                this.updateForReportFail(e), this.updateToStorage()
            }
        }, {
            key: "updateActionsForReporting",
            value: function (e) {
                this.updateForReporting(e), this.updateToStorage()
            }
        }, {
            key: "getReportableActionsLength",
            value: function () {
                var e = this.getItems().filter(function (e) {
                    return (null == e ? void 0 : e.inner_status) !== (null == S ? void 0 : S.reporting)
                });
                return null == e ? void 0 : e.length
            }
        }, {
            key: "sortQueue",
            value: function (e, t) {
                function n(e) {
                    return i[e.action_id] || (i[e.action_id] = r.caculateWeight(o, e)), i[e.action_id]
                }
                var r = this,
                    i = {},
                    o = null == e ? void 0 : e.action_time,
                    t = t.concat([e]);
                return t.sort(function (e, t) {
                    return n(t) - n(e)
                })
            }
        }, {
            key: "caculateWeight",
            value: function (e, t) {
                var n = 0,
                    r = this.formatWeight(e, null == t ? void 0 : t.action_time),
                    i = r.ogWeight,
                    o = r.sdkWeight,
                    r = r.userWeight,
                    a = (null != (a = this.ogEvents) && a.includes(null == t ? void 0 : t.action_type) && (n += i), null != t && t.is_sdk_auto_track ? n += o : n += r, e - (null == t ? void 0 : t.action_time) + 1);
                return 0 < a ? n + 1 / a : n
            }
        }, {
            key: "formatWeight",
            value: function (e, t) {
                var n = N,
                    r = P,
                    i = L;
                return 2592e6 < e - t && (n /= 100, r /= 100, i /= 100), {
                    ogWeight: n,
                    sdkWeight: r,
                    userWeight: i
                }
            }
        }]), i
    }(),
    Kt = (Bt([Lt], Vt.prototype, "getReportableActions", 1), Bt([Lt], Vt.prototype, "addAction", 1), Bt([Lt], Vt.prototype, "removeActions", 1), Bt([Lt], Vt.prototype, "updateActionsForReportFail", 1), Bt([Lt], Vt.prototype, "updateActionsForReporting", 1), Bt([Lt], Vt.prototype, "getReportableActionsLength", 1), Bt([Lt], Vt.prototype, "sortQueue", 1), Bt([Lt], Vt.prototype, "caculateWeight", 1), Bt([Lt], Vt.prototype, "formatWeight", 1), function () {
        function n() {
            f(this, n), this.events = {}
        }
        return v(n, [{
            key: "subscribe",
            value: function (e, t) {
                n.checkCallback(t), yt(this.events[e]) ? this.events[e].push(t) : this.events[e] = [t]
            }
        }, {
            key: "once",
            value: function (e, t) {
                n.checkCallback(t), this.subscribe(this.onceEventName(e), t)
            }
        }, {
            key: "unsubscribe",
            value: function (e, t) {
                n.checkCallback(t), yt(this.events[e]) && (this.events[e] = this.events[e].filter(function (e) {
                    return e !== t
                })), yt(this.events[this.onceEventName(e)]) && (this.events[this.onceEventName(e)] = this.events[this.onceEventName(e)].filter(function (e) {
                    return e !== t
                }))
            }
        }, {
            key: "publish",
            value: function (e) {
                for (var t = arguments.length, n = new Array(1 < t ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
                var i = Date.now();
                yt(this.events[e]) && this.events[e].forEach(function (e) {
                    return e.apply(void 0, [i].concat(n))
                }), yt(this.events[this.onceEventName(e)]) && (this.events[this.onceEventName(e)].forEach(function (e) {
                    return e.apply(void 0, [i].concat(n))
                }), this.events[this.onceEventName(e)] = [])
            }
        }, {
            key: "onceEventName",
            value: function (e) {
                return "once_event_prefix_".concat(e)
            }
        }], [{
            key: "checkCallback",
            value: function (e) {
                _t(e) || xt.error(n.ERROR_CALLBACK_IS_NOT_A_FUNCTION)
            }
        }]), n
    }()),
    Gt = Kt,
    Qt = (Gt.ERROR_CALLBACK_IS_NOT_A_FUNCTION = "callback 不是函数", new Gt),
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
        function e() {
            f(this, e), this.channelClaimActionList = ae, this.noClaimActionList = ue, this.realTimeActionList = E.realTimeActionList, this.ticketInterval = 60, this.requestTimeout = E.requestTimeout, this.loadConfig()
        }
        return v(e, [{
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
                var e, t = this;
                try {
                    "undefined" != typeof wx && ((e = tt$1.getSync(k)) && this.updateConfig(e), lt({
                        conf_name: "mini_game_sdk_common",
                        conf_key: "config"
                    }).then(function (e) {
                        e && ht(e) && (t.updateConfig(e), tt$1.setSync(k, e))
                    }))
                } catch (e) {
                    console.error(e)
                }
            }
        }, {
            key: "updateConfig",
            value: function (e) {
                e.channelClaimActionList && yt(e.channelClaimActionList) && (this.channelClaimActionList = e.channelClaimActionList), e.noClaimActionList && yt(e.noClaimActionList) && (this.noClaimActionList = e.noClaimActionList), e.realTimeActionList && yt(e.realTimeActionList) && (this.realTimeActionList = e.realTimeActionList), e.ticketInterval && "number" == typeof e.ticketInterval && 1 < e.ticketInterval && e.ticketInterval !== this.ticketInterval && (this.ticketInterval = e.ticketInterval, Qt.publish(Z)), e.requestTimeout && "number" == typeof e.requestTimeout && 5e3 < e.requestTimeout && (this.requestTimeout = e.requestTimeout)
            }
        }]), e
    }(),
    se = new ce,
    le = Wt,
    fe = Jt,
    de = Ht,
    ve = zt,
    pe = function () {
        var r = !1,
            i = !1,
            o = !0,
            a = !0,
            s = !0,
            c = !1;
        return function () {
            var e, t, n;
            c || (c = !0, (null == (e = tt$1.getSync(R)) ? void 0 : e.bg) === G ? r = !0 : (null == e ? void 0 : e.bg) === Q && (r = !1), (null == e ? void 0 : e.fg) === G ? i = !0 : (null == e ? void 0 : e.fg) === Q && (i = !1), (null == e ? void 0 : e.st) === G ? o = !0 : (null == e ? void 0 : e.st) === Q && (o = !1), (null == e ? void 0 : e.ti) === G ? a = !0 : (null == e ? void 0 : e.ti) === Q && (a = !1), xt.devLog("当前缓存开关 bgOn，fgOn，stOn，tiOn：", r, i, o, a), o && Qt.publish(le), a && (t = function () {
                s && Qt.publish(fe)
            }, n = setInterval(t, 1e3 * se.getTicketInterval()), Qt.subscribe(Z, function () {
                n && clearInterval(n), n = setInterval(t, 1e3 * se.getTicketInterval())
            })), wx.onShow(function (e) {
                if (s = !0, i) {
                    var t = "";
                    try {
                        1e4 < (t = JSON.stringify(e)).length && (t = JSON.stringify({
                            cut: 1,
                            scene: e.scene
                        }))
                    } catch (e) {}
                    Qt.publish(de, {
                        enter_options: t
                    })
                }
            }), wx.onHide(function () {
                s = !1, r && Qt.publish(ve)
            }))
        }
    }(),
    he = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};

function ye(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e
}
var _e, ge = ye(function () {
        var g = null;

        function _(e) {
            return e && ("object" == l(e) || "function" == typeof e)
        }

        function m(e) {
            if (null !== e && !_(e)) throw new TypeError("Object prototype may only be an Object or null: " + e)
        }

        function v() {
            return null
        }
        var y, k = Object,
            b = !(!k.create && {
                    __proto__: null
                }
                instanceof k),
            S = k.create || (b ? function (e) {
                return m(e), {
                    __proto__: e
                }
            } : function (e) {
                if (m(e), null === e) throw new SyntaxError("Native Object.create is required to create objects with null prototype");

                function t() {}
                return t.prototype = e, new t
            }),
            w = k.getPrototypeOf || ([].__proto__ === Array.prototype ? function (e) {
                e = e.__proto__;
                return _(e) ? e : null
            } : v);
        return (y = function (n, r) {
            if (void 0 === (this && this instanceof y ? this.constructor : void 0)) throw new TypeError("Constructor Proxy requires 'new'");
            if (!_(n) || !_(r)) throw new TypeError("Cannot create proxy with a non-object as target or handler");
            var e, i = function () {},
                t = (g = function () {
                    n = null, i = function (e) {
                        throw new TypeError("Cannot perform '".concat(e, "' on a proxy that has been revoked"))
                    }
                }, setTimeout(function () {
                    g = null
                }, 0), r);
            for (e in r = {
                    get: null,
                    set: null,
                    apply: null,
                    construct: null
                }, t) {
                if (!(e in r)) throw new TypeError("Proxy polyfill does not support trap '".concat(e, "'"));
                r[e] = t[e]
            }
            "function" == typeof t && (r.apply = t.apply.bind(t));
            var o, a, s = w(n),
                c = !1,
                u = !1,
                l = ("function" == typeof n ? (o = function () {
                    var e = this && this.constructor === o,
                        t = Array.prototype.slice.call(arguments);
                    return i(e ? "construct" : "apply"), e && r.construct ? r.construct.call(this, n, t) : !e && r.apply ? r.apply(n, this, t) : e ? (t.unshift(n), new(n.bind.apply(n, t))) : n.apply(this, t)
                }, c = !0) : n instanceof Array ? (o = [], u = !0) : o = b || null !== s ? S(s) : {}, r.get ? function (e) {
                    return i("get"), r.get(this, e, o)
                } : function (e) {
                    return i("get"), this[e]
                }),
                p = r.set ? function (e, t) {
                    i("set"), r.set(this, e, t, o)
                } : function (e, t) {
                    i("set"), this[e] = t
                },
                f = k.getOwnPropertyNames(n),
                d = {},
                f = (f.forEach(function (e) {
                    var t;
                    (c || u) && e in o || (t = {
                        enumerable: !!k.getOwnPropertyDescriptor(n, e).enumerable,
                        get: l.bind(n, e),
                        set: p.bind(n, e)
                    }, k.defineProperty(o, e, t), d[e] = !0)
                }), !0);
            if ((c || u) && (a = k.setPrototypeOf || ([].__proto__ === Array.prototype ? function (e, t) {
                    return m(t), e.__proto__ = t, e
                } : v), s && a(o, s) || (f = !1)), r.get || !f)
                for (var h in n) d[h] || k.defineProperty(o, h, {
                    get: l.bind(n, h)
                });
            return k.seal(n), k.seal(o), o
        }).revocable = function (e, t) {
            return {
                proxy: new y(e, t),
                revoke: g
            }
        }, y
    }),
    me = {};
try {
    _e = _e || ge()
} catch (h) {
    Se(h)
}

function Ae(t, n, a, i) {
    try {
        _e && null != t && t[n] && (t[n] = new _e(t[n], {
            apply: function (t, n, o) {
                i && Te(function () {
                    return i.apply(void 0, e(o))
                });
                var r = !!(null != (r = o[0]) && r.success || null != (r = o[0]) && r.fail),
                    t = (r && ["success", "fail"].forEach(function (i) {
                        if (o[0][i]) try {
                            o[0][i] = new _e(o[0][i], {
                                apply: function (t, n, r) {
                                    return Te(function () {
                                        return a.apply(void 0, [i, o[0]].concat(e(r)))
                                    }), t.apply(n, r)
                                }
                            })
                        } catch (i) {
                            Se(i)
                        }
                    }), t.apply(n, o));
                return !r && t && "[object Promise]" === Object.prototype.toString.call(t) ? t.then(function (e) {
                    return Te(function () {
                        return a("success", o[0], e)
                    }), e
                }).catch(function (e) {
                    throw Te(function () {
                        return a("fail", o[0], e)
                    }), e
                }) : t
            }
        }))
    } catch (t) {
        Se(t)
    }
}

function Re(t, n, a) {
    try {
        _e && null != t && t[n] && (t[n] = new _e(t[n], {
            apply: function (t, n, r) {
                var i = "function" == typeof r[0];
                if (i) try {
                    r[0] = new _e(r[0], {
                        apply: function (t, n, r) {
                            var i = t.call.apply(t, [n].concat(e(r)));
                            return Te(function () {
                                return a(i)
                            }), i
                        }
                    })
                } catch (t) {
                    Se(t)
                }
                var o = t.call.apply(t, [n].concat(e(r)));
                return i || Te(function () {
                    return a(o)
                }), o
            }
        }))
    } catch (t) {
        Se(t)
    }
}

function ke(t) {
    var o = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "",
        a = 2 < arguments.length ? arguments[2] : void 0,
        s = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : [],
        c = 4 < arguments.length ? arguments[4] : void 0;
    try {
        _e && null != t && t[o] && (t[o] = new _e(t[o], {
            apply: function (t, n, r) {
                var i = t.call.apply(t, [n].concat(e(r)));
                return a && me[o] || (Te(function () {
                    return null == c ? void 0 : c(i)
                }), s.forEach(function (e) {
                    var t = e.eventName,
                        n = e.isAsync,
                        e = e.proxyEvent;
                    (n ? Ae : Re)(i, t, e)
                })), a && (me[o] = !0), i
            }
        }))
    } catch (t) {
        Se(t)
    }
}

function Te(e) {
    try {
        e()
    } catch (e) {
        Se(e)
    }
}

function Se(e) {
    ct({
        log_type: b.PROXY_ERROR,
        message: null == e ? void 0 : e.message,
        err_stack: null == e ? void 0 : e.stack
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
        var e = !1;
        return function () {
            e || (e = !0, Ae(wx, "login", function (e) {
                "success" === e && Qt.publish(Ee)
            }), Re(wx, "onAddToFavorites", function () {
                Qt.publish(be)
            }), Re(wx, "onShareTimeline", function () {
                Qt.publish(Oe, {
                    target: "TIME_LINE",
                    trigger: "MENU"
                })
            }), Re(wx, "onShareAppMessage", function () {
                Qt.publish(Oe, {
                    target: "APP_MESSAGE",
                    trigger: "MENU"
                })
            }), Re(wx, "shareAppMessage", function () {
                Qt.publish(Oe, {
                    target: "APP_MESSAGE",
                    trigger: "BUTTON"
                })
            }), ke(wx, "createGameClubButton", !1, [{
                isAsync: !1,
                eventName: "onTap",
                proxyEvent: function () {
                    Qt.publish(Ie)
                }
            }], function () {
                Qt.publish(we)
            }), ke(wx, "getGameServerManager", !0, [{
                isAsync: !0,
                eventName: "createRoom",
                proxyEvent: function (e) {
                    "success" === e && Qt.publish("CREATE_GAME_ROOM")
                }
            }, {
                isAsync: !0,
                eventName: "joinRoom",
                proxyEvent: function (e) {
                    "success" === e && Qt.publish(Ce)
                }
            }]), Ae(wx, "requestMidasPayment", function (e, t) {
                Qt.publish(Ne, {
                    status: "success" === e ? "SUCCESS" : "FAIL",
                    quantity: (null == t ? void 0 : t.buyQuantity) || 0,
                    mode: (null == t ? void 0 : t.mode) || "",
                    platform: (null == t ? void 0 : t.platform) || "",
                    no: (null == t ? void 0 : t.outTradeNo) || "",
                    payType: "Midas"
                })
            }, function (e) {
                Qt.publish(xe, {
                    quantity: (null == e ? void 0 : e.buyQuantity) || 0,
                    mode: (null == e ? void 0 : e.mode) || "",
                    platform: (null == e ? void 0 : e.platform) || "",
                    no: (null == e ? void 0 : e.outTradeNo) || "",
                    payType: "Midas"
                })
            }), Ae(wx, "requestMidasPaymentGameItem", function (e, t) {
                t = (t || {}).signData;
                Qt.publish(Ne, {
                    status: "success" === e ? "SUCCESS" : "FAIL",
                    quantity: (null == t ? void 0 : t.buyQuantity) || 0,
                    mode: (null == t ? void 0 : t.mode) || "",
                    platform: (null == t ? void 0 : t.platform) || "",
                    no: (null == t ? void 0 : t.outTradeNo) || "",
                    p: (null == t ? void 0 : t.goodsPrice) || 0,
                    productId: (null == t ? void 0 : t.productId) || "",
                    payType: "MidasGameItem"
                })
            }, function (e) {
                e = (e || {}).signData;
                Qt.publish(xe, {
                    quantity: (null == e ? void 0 : e.buyQuantity) || 0,
                    mode: (null == e ? void 0 : e.mode) || "",
                    platform: (null == e ? void 0 : e.platform) || "",
                    no: (null == e ? void 0 : e.outTradeNo) || "",
                    p: (null == e ? void 0 : e.goodsPrice) || 0,
                    productId: (null == e ? void 0 : e.productId) || "",
                    payType: "MidasGameItem"
                })
            }))
        }
    }(),
    Pe = function () {
        function e() {
            f(this, e)
        }
        return v(e, null, [{
            key: "isEmpty",
            value: function (e) {
                return !e || "" === e.trim()
            }
        }, {
            key: "format",
            value: function (e) {
                for (var t = arguments.length, n = new Array(1 < t ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
                return e.replace(/\${(\d+)}/g, function (e, t) {
                    return n[t]
                })
            }
        }, {
            key: "customStringify",
            value: function (e) {
                var n = [];
                try {
                    return JSON.stringify(e, function (e, t) {
                        if (void 0 === t) return "undefined";
                        if ("object" == l(t) && null !== t) {
                            if (-1 !== n.indexOf(t)) return "[Circular]";
                            n.push(t)
                        }
                        return "bigint" == typeof t ? t.toString() : t
                    })
                } catch (e) {
                    return "[Param Error]"
                }
            }
        }]), e
    }(),
    Me = /^([a-zA-Z][a-zA-Z\d_]{0,63})$/i,
    De = /^ams_reserved_(.*)/i,
    Ue = function () {
        function i() {
            f(this, i)
        }
        return v(i, null, [{
            key: "validateActionType",
            value: function (e) {
                return Pe.isEmpty(e) ? (xt.error(i.ERROR_ACTION_TYPE_NULL), !1) : !!Me.test(e) || (xt.error(i.ERROR_ACTION_TYPE_INVALID), !1)
            }
        }, {
            key: "validateActionParam",
            value: function (e) {
                if (e) {
                    if (!ht(e)) return xt.error(i.ERROR_ACTION_PARAM_IS_NOT_OBJECT), !1;
                    for (var t in e) {
                        if (Pe.isEmpty(t)) return xt.error(i.ERROR_ACTION_PARAM_KEY_NULL), !1;
                        if (!Me.test(t)) return xt.error(i.ERROR_ACTION_PARAM_KEY_INVALID), !1;
                        De.test(t) && xt.warn(i.WARN_ACTION_PARAM_KEY_RESERVED);
                        var n = e[t];
                        if (!i.isValidValue(n)) return xt.error(Pe.format(i.ERROR_ACTION_PARAM_VALUE_INVALID, t, n)), !1;
                        if (yt(n)) {
                            if (!i.isValidArrayValue(n)) {
                                for (var r = 0; r < n.length; r++) xt.error(Pe.format(i.ERROR_ACTION_PARAM_VALUE_ARRAY_INVALID, t, Pe.customStringify(n), r, n[r]));
                                return !1
                            }
                            if (!i.checkArrayElementTypes(n)) return xt.error(i.ERROR_ACTION_PARAM_VALUE_ARRAY_TYPE_UNUNIQUE), !1
                        }
                    }
                }
                return !0
            }
        }, {
            key: "isValidValue",
            value: function (e) {
                return null == e || "string" == typeof e || "number" == typeof e || "boolean" == typeof e || yt(e)
            }
        }, {
            key: "isValidArrayValue",
            value: function (e) {
                for (var t = 0; t < e.length; t++) {
                    var n = e[t];
                    if ("string" != typeof n && "number" != typeof n && "boolean" != typeof n) return !1
                }
                return !0
            }
        }, {
            key: "checkArrayElementTypes",
            value: function (e) {
                if (e && !(e.length <= 1))
                    for (var t = l(e[0]), n = 1; n < e.length; n++)
                        if (l(e[n]) !== t) return !1;
                return !0
            }
        }]), i
    }(),
    qe = Ue,
    je = (qe.ERROR_ACTION_TYPE_NULL = "在track方法中，action_type参数不能为空！", qe.ERROR_ACTION_TYPE_INVALID = "在track方法中，action_type参数只能包含字母、数字和下划线，且只能以字母开头，长度不能超过64个字符！", qe.ERROR_ACTION_PARAM_KEY_NULL = "在track方法中，action_param参数的key不能为空！", qe.ERROR_ACTION_PARAM_KEY_INVALID = "在track方法中，action_param参数的key只能包含字母、数字和下划线，且不能以数字开头，长度不能超过64个字符！", qe.WARN_ACTION_PARAM_KEY_RESERVED = "SDK内部预留参数的key均以'ams_reserved_'开头，该参数的值会被SDK内部覆盖，请不要使用！", qe.ERROR_ACTION_PARAM_VALUE_INVALID = "在track方法中，action_param参数的value必须是String/Number/Boolean/Array中的一种！[key=${0}, value=${1}]", qe.ERROR_ACTION_PARAM_VALUE_ARRAY_INVALID = "在track方法中，如果action_param参数中的某个元素的value是Array，那么这个Array中的每个元素必须是String/Number/Boolean中的一种！[key=${0}, value=${1}, 数组的第${2}个元素为${3}]", qe.ERROR_ACTION_PARAM_VALUE_ARRAY_TYPE_UNUNIQUE = "在track方法中，如果action_param参数中的某个元素的value是Array，那么这个Array中所有元素的类型必须是同一种！", qe.ERROR_ACTION_PARAM_IS_NOT_OBJECT = "action_param 参数不是Object", {
        exports: {}
    }),
    Fe = (! function (e) {
        function p(e, t) {
            var n = (65535 & e) + (65535 & t);
            return (e >> 16) + (t >> 16) + (n >> 16) << 16 | 65535 & n
        }

        function s(e, t, n, r, i, o) {
            return p((t = p(p(t, e), p(r, o))) << i | t >>> 32 - i, n)
        }

        function f(e, t, n, r, i, o, a) {
            return s(t & n | ~t & r, e, t, i, o, a)
        }

        function d(e, t, n, r, i, o, a) {
            return s(t & r | n & ~r, e, t, i, o, a)
        }

        function h(e, t, n, r, i, o, a) {
            return s(t ^ n ^ r, e, t, i, o, a)
        }

        function g(e, t, n, r, i, o, a) {
            return s(n ^ (t | ~r), e, t, i, o, a)
        }

        function a(e, t) {
            e[t >> 5] |= 128 << t % 32, e[14 + (t + 64 >>> 9 << 4)] = t;
            for (var n, r, i, o, a = 1732584193, s = -271733879, c = -1732584194, u = 271733878, l = 0; l < e.length; l += 16) a = f(n = a, r = s, i = c, o = u, e[l], 7, -680876936), u = f(u, a, s, c, e[l + 1], 12, -389564586), c = f(c, u, a, s, e[l + 2], 17, 606105819), s = f(s, c, u, a, e[l + 3], 22, -1044525330), a = f(a, s, c, u, e[l + 4], 7, -176418897), u = f(u, a, s, c, e[l + 5], 12, 1200080426), c = f(c, u, a, s, e[l + 6], 17, -1473231341), s = f(s, c, u, a, e[l + 7], 22, -45705983), a = f(a, s, c, u, e[l + 8], 7, 1770035416), u = f(u, a, s, c, e[l + 9], 12, -1958414417), c = f(c, u, a, s, e[l + 10], 17, -42063), s = f(s, c, u, a, e[l + 11], 22, -1990404162), a = f(a, s, c, u, e[l + 12], 7, 1804603682), u = f(u, a, s, c, e[l + 13], 12, -40341101), c = f(c, u, a, s, e[l + 14], 17, -1502002290), a = d(a, s = f(s, c, u, a, e[l + 15], 22, 1236535329), c, u, e[l + 1], 5, -165796510), u = d(u, a, s, c, e[l + 6], 9, -1069501632), c = d(c, u, a, s, e[l + 11], 14, 643717713), s = d(s, c, u, a, e[l], 20, -373897302), a = d(a, s, c, u, e[l + 5], 5, -701558691), u = d(u, a, s, c, e[l + 10], 9, 38016083), c = d(c, u, a, s, e[l + 15], 14, -660478335), s = d(s, c, u, a, e[l + 4], 20, -405537848), a = d(a, s, c, u, e[l + 9], 5, 568446438), u = d(u, a, s, c, e[l + 14], 9, -1019803690), c = d(c, u, a, s, e[l + 3], 14, -187363961), s = d(s, c, u, a, e[l + 8], 20, 1163531501), a = d(a, s, c, u, e[l + 13], 5, -1444681467), u = d(u, a, s, c, e[l + 2], 9, -51403784), c = d(c, u, a, s, e[l + 7], 14, 1735328473), a = h(a, s = d(s, c, u, a, e[l + 12], 20, -1926607734), c, u, e[l + 5], 4, -378558), u = h(u, a, s, c, e[l + 8], 11, -2022574463), c = h(c, u, a, s, e[l + 11], 16, 1839030562), s = h(s, c, u, a, e[l + 14], 23, -35309556), a = h(a, s, c, u, e[l + 1], 4, -1530992060), u = h(u, a, s, c, e[l + 4], 11, 1272893353), c = h(c, u, a, s, e[l + 7], 16, -155497632), s = h(s, c, u, a, e[l + 10], 23, -1094730640), a = h(a, s, c, u, e[l + 13], 4, 681279174), u = h(u, a, s, c, e[l], 11, -358537222), c = h(c, u, a, s, e[l + 3], 16, -722521979), s = h(s, c, u, a, e[l + 6], 23, 76029189), a = h(a, s, c, u, e[l + 9], 4, -640364487), u = h(u, a, s, c, e[l + 12], 11, -421815835), c = h(c, u, a, s, e[l + 15], 16, 530742520), a = g(a, s = h(s, c, u, a, e[l + 2], 23, -995338651), c, u, e[l], 6, -198630844), u = g(u, a, s, c, e[l + 7], 10, 1126891415), c = g(c, u, a, s, e[l + 14], 15, -1416354905), s = g(s, c, u, a, e[l + 5], 21, -57434055), a = g(a, s, c, u, e[l + 12], 6, 1700485571), u = g(u, a, s, c, e[l + 3], 10, -1894986606), c = g(c, u, a, s, e[l + 10], 15, -1051523), s = g(s, c, u, a, e[l + 1], 21, -2054922799), a = g(a, s, c, u, e[l + 8], 6, 1873313359), u = g(u, a, s, c, e[l + 15], 10, -30611744), c = g(c, u, a, s, e[l + 6], 15, -1560198380), s = g(s, c, u, a, e[l + 13], 21, 1309151649), a = g(a, s, c, u, e[l + 4], 6, -145523070), u = g(u, a, s, c, e[l + 11], 10, -1120210379), c = g(c, u, a, s, e[l + 2], 15, 718787259), s = g(s, c, u, a, e[l + 9], 21, -343485551), a = p(a, n), s = p(s, r), c = p(c, i), u = p(u, o);
            return [a, s, c, u]
        }

        function c(e) {
            for (var t = "", n = 32 * e.length, r = 0; r < n; r += 8) t += String.fromCharCode(e[r >> 5] >>> r % 32 & 255);
            return t
        }

        function u(e) {
            var t = [];
            for (t[(e.length >> 2) - 1] = void 0, r = 0; r < t.length; r += 1) t[r] = 0;
            for (var n = 8 * e.length, r = 0; r < n; r += 8) t[r >> 5] |= (255 & e.charCodeAt(r / 8)) << r % 32;
            return t
        }

        function r(e) {
            for (var t, n = "0123456789abcdef", r = "", i = 0; i < e.length; i += 1) t = e.charCodeAt(i), r += n.charAt(t >>> 4 & 15) + n.charAt(15 & t);
            return r
        }

        function l(e) {
            return unescape(encodeURIComponent(e))
        }

        function i(e) {
            return c(a(u(e = l(e)), 8 * e.length))
        }

        function o(e, t) {
            var n, e = l(e),
                t = l(t),
                r = u(e),
                i = [],
                o = [];
            for (i[15] = o[15] = void 0, 16 < r.length && (r = a(r, 8 * e.length)), n = 0; n < 16; n += 1) i[n] = 909522486 ^ r[n], o[n] = 1549556828 ^ r[n];
            return e = a(i.concat(u(t)), 512 + 8 * t.length), c(a(o.concat(e), 640))
        }

        function t(e, t, n) {
            return t ? n ? o(t, e) : r(o(t, e)) : n ? i(e) : r(i(e))
        }
        var n;
        n = he, e.exports ? e.exports = t : n.md5 = t
    }(je), ye(je.exports)),
    Be = "function" == typeof btoa,
    Ve = "function" == typeof Buffer;
"function" == typeof TextDecoder && new TextDecoder;
var Ge = "function" == typeof TextEncoder ? new TextEncoder : void 0,
    Qe = Array.prototype.slice.call("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="),
    Ke = {},
    Ye = (Qe.forEach(function (e, t) {
        return Ke[e] = t
    }), String.fromCharCode.bind(String)),
    We = ("function" == typeof Uint8Array.from && Uint8Array.from.bind(Uint8Array), Be ? function (e) {
        return btoa(e)
    } : Ve ? function (e) {
        return Buffer.from(e, "binary").toString("base64")
    } : function (e) {
        for (var t, n, r, i = "", o = e.length % 3, a = 0; a < e.length;) {
            if (255 < (t = e.charCodeAt(a++)) || 255 < (n = e.charCodeAt(a++)) || 255 < (r = e.charCodeAt(a++))) throw new TypeError("invalid character found");
            i += Qe[(t = t << 16 | n << 8 | r) >> 18 & 63] + Qe[t >> 12 & 63] + Qe[t >> 6 & 63] + Qe[63 & t]
        }
        return o ? i.slice(0, o - 3) + "===".substring(o) : i
    }),
    Je = Ve ? function (e) {
        return Buffer.from(e).toString("base64")
    } : function (e) {
        for (var t = [], n = 0, r = e.length; n < r; n += 4096) t.push(Ye.apply(null, e.subarray(n, n + 4096)));
        return We(t.join(""))
    },
    He = function (e) {
        var t;
        return e.length < 2 ? (t = e.charCodeAt(0)) < 128 ? e : t < 2048 ? Ye(192 | t >>> 6) + Ye(128 | 63 & t) : Ye(224 | t >>> 12 & 15) + Ye(128 | t >>> 6 & 63) + Ye(128 | 63 & t) : (t = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320), Ye(240 | t >>> 18 & 7) + Ye(128 | t >>> 12 & 63) + Ye(128 | t >>> 6 & 63) + Ye(128 | 63 & t))
    },
    ze = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,
    $e = Ve ? function (e) {
        return Buffer.from(e, "utf8").toString("base64")
    } : Ge ? function (e) {
        return Je(Ge.encode(e))
    } : function (e) {
        return We(e.replace(ze, He))
    },
    Xe = Object.defineProperty,
    Ze = Object.getOwnPropertyDescriptor,
    tn = function (e, t, n, r) {
        for (var i, o = 1 < r ? void 0 : r ? Ze(t, n) : t, a = e.length - 1; 0 <= a; a--)(i = e[a]) && (o = (r ? i(t, n, o) : i(o)) || o);
        return r && o && Xe(t, n, o), o
    },
    en = function () {
        function g(e) {
            var t = this;
            f(this, g), this.cgiBatchSize = E.cgiBatchSize, this.reportThreshold = E.reportThreshold, this.reportDelay = E.reportDelay, this.triggerExecuteSend = function (r, e) {
                var i, o = 1 < arguments.length && void 0 !== e ? e : 0,
                    a = [];
                return function () {
                    for (var e = arguments.length, n = new Array(e), t = 0; t < e; t++) n[t] = arguments[t];
                    return clearTimeout(i), i = setTimeout(function () {
                        var t = r.apply(void 0, n);
                        a.forEach(function (e) {
                            return e(t)
                        }), a = []
                    }, o), new Promise(function (e) {
                        return a.push(e)
                    })
                }
            }(function () {
                t.executeSend()
            }, 1e3 * this.reportDelay), this.inspectDelay = E.inspectDelay, this.inspectTimer = void 0, this.isNeedContinueSend = !1, this.getBaseInfo = e.getBaseInfo, this.reportLog = e.reportLog, this.queueManager = e.queueManager, this.configManager = e.configManager, this.flushSend(), this.startInspectTimer()
        }
        return v(g, [{
            key: "batchSend",
            value: function () {
                var e, t, n = this.queueManager.getReportableActions(this.reportThreshold);
                n.length >= this.reportThreshold || (t = (null == (e = this.configManager) ? void 0 : e.getRealTimeActionList()) || E.realTimeActionList, n.some(function (e) {
                    return -1 < t.indexOf(e.action_type) && !e.is_retry
                })) ? this.executeSend() : this.triggerExecuteSend(), this.startInspectTimer()
            }
        }, {
            key: "flushSend",
            value: function () {
                this.executeSend()
            }
        }, {
            key: "executeSend",
            value: function () {
                var t = this;
                if (g.requestConcurrency <= g.currentRequestCount) this.isNeedContinueSend = !0;
                else {
                    this.isNeedContinueSend = !1;
                    var e = (g.requestConcurrency - g.currentRequestCount) * this.cgiBatchSize,
                        n = this.queueManager.getReportableActions(e),
                        r = this.getBaseInfo();
                    if (r.openid || r.unionid || (xt.warn("请尽快调用 setOpenId 或 setUnionId 方法设置用户ID！"), n = n.filter(function (e) {
                            return null == e ? void 0 : e.ad_trace_id
                        })), !(n.length <= 0)) {
                        e < this.queueManager.getReportableActionsLength() && (this.isNeedContinueSend = !0), g.currentRequestCount += Math.ceil(n.length / this.cgiBatchSize);
                        for (var i = [], o = 0; o < n.length; o += this.cgiBatchSize) {
                            var a = this.generateActionReportParams(n.slice(o, o + this.cgiBatchSize));
                            i.push(this.report(a))
                        }
                        Promise.all(i).then(function (e) {
                            e = e.some(function (e) {
                                return 0 <= e
                            });
                            t.isNeedContinueSend && e && t.executeSend()
                        }).catch(function (e) {
                            xt.error(e), t.reportLog({
                                message: "executeSend catch: ".concat(e.message),
                                log_type: b.JS_RUN_ERROR,
                                err_stack: e.stack
                            })
                        })
                    }
                }
            }
        }, {
            key: "generateActionReportParams",
            value: function (e) {
                var t = [],
                    n = [],
                    r = this.getBaseInfo();
                return e.forEach(function (e) {
                    n.push(e.action_id);
                    e = Object.assign({}, e);
                    delete e.inner_status, t.push(e)
                }), {
                    data: {
                        info: r,
                        actions: t
                    },
                    actionIdList: n
                }
            }
        }, {
            key: "dealSuccessData",
            value: function (e, t) {
                -1 < [51001, 51003].indexOf(null == e ? void 0 : e.code) ? this.queueManager.updateActionsForReportFail(t) : this.queueManager.removeActions(t), 0 !== (null == e ? void 0 : e.code) && (this.reportLog({
                    log_type: b.REQUEST_ERROR,
                    code: null == e ? void 0 : e.code,
                    message: "trace_id: ".concat(null == e ? void 0 : e.trace_id, "，msg: ").concat(null == e ? void 0 : e.message)
                }), xt.error("上报失败：", e))
            }
        }, {
            key: "dealFailData",
            value: function (e, t) {
                this.queueManager.updateActionsForReportFail(t), this.reportLog({
                    log_type: b.REQUEST_ERROR,
                    code: e.code,
                    message: e.message
                }), xt.error("上报失败：", e)
            }
        }, {
            key: "report",
            value: function (e) {
                var f = this,
                    d = e.data,
                    h = e.actionIdList;
                return this.queueManager.updateActionsForReporting(h), xt.debug && (xt.info("上报行为类型: ", "【".concat(d.actions.map(function (e) {
                    return e.action_type
                }).join("、"), "】")), xt.info("上报请求参数: ", d)), new Promise(function (n) {
                    var e, t, r, i, o, a = Date.now();
                    try {
                        var s = function (e) {
                                var t = "",
                                    n = null == e ? void 0 : e.appid,
                                    r = null == e ? void 0 : e.secret_key,
                                    i = null == e ? void 0 : e.sdk_version,
                                    e = null == e ? void 0 : e.timestamp;
                                if (n && r && i && e && 32 === r.length)
                                    for (var o = Fe(i + n + e), a = 0; a < 32; a++) t += (a % 2 == 0 ? r : o)[a];
                                return t
                            }({
                                appid: null == (o = null == d ? void 0 : d.info) ? void 0 : o.appid,
                                secret_key: null == (e = null == d ? void 0 : d.info) ? void 0 : e.secret_key,
                                sdk_version: null == (t = null == d ? void 0 : d.info) ? void 0 : t.sdk_version,
                                timestamp: a
                            }),
                            c = function (e, t) {
                                return 1 < arguments.length && void 0 !== t && t ? $e(e).replace(/=/g, "").replace(/[+\/]/g, function (e) {
                                    return "+" == e ? "-" : "_"
                                }) : $e(e)
                            }(JSON.stringify(d)),
                            u = {
                                "Client-Time": a,
                                "Sign-Value": Fe(c + (null == (r = null == d ? void 0 : d.info) ? void 0 : r.user_action_set_id) + (null == (i = null == d ? void 0 : d.info) ? void 0 : i.secret_key) + s),
                                "Sign-Version": E.signVersion,
                                "content-type": "text/plain;charset=UTF-8"
                            },
                            p = c
                    } catch (s) {
                        u = {
                            "Client-Time": a
                        }, p = d, f.reportLog({
                            log_type: b.SIGN_ERROR,
                            message: "sign error msg: ".concat(null == s ? void 0 : s.message),
                            err_stack: null == s ? void 0 : s.stack
                        }), xt.error(s)
                    }
                    wx.request({
                        url: "https://api.datanexus.qq.com/data-nexus-cgi/miniprogram",
                        method: "POST",
                        timeout: (null == (o = f.configManager) ? void 0 : o.getRequestTimeout()) || E.requestTimeout,
                        header: u,
                        data: p,
                        success: function (e) {
                            xt.devLog("上报接口返回码:", null == (t = null == e ? void 0 : e.data) ? void 0 : t.code);
                            var t = (null == (t = null == e ? void 0 : e.header) ? void 0 : t["Server-Time"]) || -1;
                            if (st.revise(t), --g.currentRequestCount, 200 === (null == e ? void 0 : e.statusCode)) f.dealSuccessData(null == e ? void 0 : e.data, h), n((null == e ? void 0 : e.data).code);
                            else {
                                t = "";
                                try {
                                    t = "object" == l(null == e ? void 0 : e.data) ? JSON.stringify(null == e ? void 0 : e.data) : null == e ? void 0 : e.data
                                } catch (e) {
                                    xt.error(e)
                                }
                                e = {
                                    code: "number" == typeof (null == e ? void 0 : e.statusCode) ? -1 * e.statusCode : -888,
                                    message: "statusCode: ".concat(null == e ? void 0 : e.statusCode, ", data: ").concat(t)
                                };
                                f.dealFailData(e, h), n(e.code)
                            }
                        },
                        fail: function (e) {
                            xt.devLog("上报失败:", e), --g.currentRequestCount;
                            e = {
                                code: "number" == typeof (null == e ? void 0 : e.errno) ? -1 * e.errno : -999,
                                message: null == e ? void 0 : e.errMsg
                            };
                            f.dealFailData(e, h), n(e.code)
                        }
                    })
                })
            }
        }, {
            key: "startInspectTimer",
            value: function () {
                var e = this;
                clearTimeout(this.inspectTimer), this.inspectTimer = setTimeout(function () {
                    g.requestConcurrency <= g.currentRequestCount && (g.currentRequestCount = g.requestConcurrency - 1), e.executeSend(), e.startInspectTimer()
                }, 1e3 * this.inspectDelay)
            }
        }], [{
            key: "setRequestConcurrency",
            value: function (e) {
                "number" == typeof e ? e < 1 ? xt.error("网络请求最大并发量不能小于1") : 10 < e ? xt.error("网络请求最大并发量不能大于10") : g.requestConcurrency = e : xt.error("网络请求最大并发量需设置为数字")
            }
        }]), g
    }(),
    nn = en,
    rn = (nn.currentRequestCount = 0, nn.requestConcurrency = E.requestConcurrency, tn([Lt], nn.prototype, "batchSend", 1), tn([Lt], nn.prototype, "flushSend", 1), tn([Lt], nn.prototype, "executeSend", 1), Wt),
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
            value: function (i, e) {
                function n(e) {
                    Qt.subscribe(e, function (n, e) {
                        var r = 1 < arguments.length && void 0 !== e ? e : {};
                        return function (e) {
                            i.track(n, Object.assign(r || {}, 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {}, t(t({}, wn, !0), Cn, e)))
                        }
                    }(e))
                }
                n(on), n(rn), n(an), n(un), "all" === e && (n(cn), n(sn), n(ln), n(dn), n(fn), n(yn), n(vn), n(pn), n(hn))
            }
        }]), e
    }(),
    gn = function () {
        function e() {
            f(this, e), this.special_method_symbol = Symbol("special_method_symbol")
        }
        return v(e, [{
            key: "onPurchase",
            value: function (e) {
                "number" != typeof e && xt.warn("付费金额需要为数字"), e <= 0 && xt.warn("付费金额需要大于0"), this.wrapTrack(j, {
                    value: e
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
    mn = function () {
        o(t, gn);
        var e = a(t);

        function t() {
            return f(this, t), e.apply(this, arguments)
        }
        return v(t, [{
            key: "onRegister",
            value: function () {
                this.wrapTrack(B)
            }
        }, {
            key: "onCreateRole",
            value: function (e) {
                e && "string" != typeof e && xt.warn("角色名称需要为字符串"), this.wrapTrack(V, e ? {
                    name: e
                } : {})
            }
        }, {
            key: "onTutorialFinish",
            value: function () {
                this.wrapTrack(K)
            }
        }]), t
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
                    }).then(function (e) {
                        yt(e) && (t = e)
                    })
                } catch (e) {
                    xt.error(e)
                }
            },
            getActionList: function () {
                return t
            }
        }
    }();

function kn(e, t) {
    try {
        if (!e.is_sdk_auto_track) {
            var r = e.action_type;
            try {
                var i = Rn.getActionList();
                if (!i.includes(r)) {
                    var o, a = function (e) {
                        var t, r, i, o, a, s = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
                        if (s) return i = !(r = !0), {
                            s: function () {
                                s = s.call(e)
                            },
                            n: function () {
                                var e = s.next();
                                return r = e.done, e
                            },
                            e: function (e) {
                                i = !0, t = e
                            },
                            f: function () {
                                try {
                                    r || null == s.return || s.return()
                                } finally {
                                    if (i) throw t
                                }
                            }
                        };
                        if (Array.isArray(e) || (s = n(e))) return s && (e = s), o = 0, {
                            s: a = function () {},
                            n: function () {
                                return o >= e.length ? {
                                    done: !0
                                } : {
                                    done: !1,
                                    value: e[o++]
                                }
                            },
                            e: function (e) {
                                throw e
                            },
                            f: a
                        };
                        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
                    }(i);
                    try {
                        for (a.s(); !(o = a.n()).done;) {
                            var s = o.value;
                            if (Tn(s, r) <= parseInt((.3 * s.length).toString())) {
                                xt.warn("通过SDK上报的".concat(r, "行为名称可能有误，请检查该行为类型是否为腾讯广告提供的标准行为！").concat(An));
                                break
                            }
                        }
                    } catch (r) {
                        a.e(r)
                    } finally {
                        a.f()
                    }
                }
            } catch (i) {
                xt.error(i)
            }
            if ("minigame" === t) {
                var c, u, l, p = e,
                    f = t;
                try {
                    ["PURCHASE", "ADD_TO_CART"].includes(p.action_type) && p.action_param && It(p.action_param, "value") && ("number" != typeof (null == (c = p.action_param) ? void 0 : c.value) ? xt.warn("通过SDK上报的".concat(p.action_type, "行为携带的金额参数需要为数字！")) : (null == (u = p.action_param) ? void 0 : u.value) <= 0 ? xt.warn("通过SDK上报的".concat(p.action_type, "行为携带的金额参数需要大于0！")) : "minigame" === f && (null == (l = p.action_param) ? void 0 : l.value) < 100 && xt.warn("通过SDK上报的".concat(p.action_type, "行为携带的金额参数可能有误，金额的单位为‘分’，请检查金额是否正确！").concat(An)))
                } catch (p) {
                    xt.error(p)
                }
            } else if ("miniprogram" === t) {
                var d = e;
                try {
                    var h = null == d ? void 0 : d.action_type,
                        g = (null == d ? void 0 : d.action_param) || {};
                    "PURCHASE" === h && It(g, "value") && ("number" != typeof (null == g ? void 0 : g.value) ? xt.warn("通过SDK上报的".concat(h, "行为携带的金额参数需要为数字！")) : (null == g ? void 0 : g.value) <= 0 && xt.warn("通过SDK上报的".concat(h, "行为携带的金额参数需要大于0！")))
                } catch (h) {
                    xt.error(h)
                }
            }
        }
    } catch (e) {
        xt.error(e)
    }
}

function Tn(e, t) {
    try {
        if (0 === e.length) return t.length;
        if (0 === t.length) return e.length;
        for (var n = [], r = 0; r <= t.length; r++) n[r] = [r];
        for (var i = 0; i <= e.length; i++) n[0][i] = i;
        for (var o = 1; o <= t.length; o++)
            for (var a = 1; a <= e.length; a++) t.charAt(o - 1) === e.charAt(a - 1) ? n[o][a] = n[o - 1][a - 1] : n[o][a] = Math.min(n[o - 1][a - 1] + 1, n[o][a - 1] + 1, n[o - 1][a] + 1);
        return n[t.length][e.length]
    } catch (n) {
        xt.error(n)
    }
}

function Sn(e) {
    try {
        e && !/^[a-zA-Z0-9_\-]+$/.test(e) && xt.warn("通过SDK上报的openid：".concat(e, "可能有误，请检查openid是否正确！").concat(An))
    } catch (e) {
        xt.error(e)
    }
}
var En = Object.defineProperty,
    bn = Object.getOwnPropertyDescriptor,
    On = function (e, t, n, r) {
        for (var i, o = 1 < r ? void 0 : r ? bn(t, n) : t, a = e.length - 1; 0 <= a; a--)(i = e[a]) && (o = (r ? i(t, n, o) : i(o)) || o);
        return r && o && En(t, n, o), o
    },
    In = Symbol("initializedInstance"),
    wn = Symbol("autoTrack"),
    Cn = Symbol("actionTime"),
    xn = function () {
        o(p, mn);
        var l = a(p);

        function p(e) {
            var t, n, r, i, o, a, s;
            return (f(this, p), (t = l.call(this)).env = "production", t.sdk_version = "1.5.4", t.sdk_name = "@dn-sdk/minigame", t.deviceInfo = {}, t.gameInfo = {}, t.session_id = "", t.log_id = 0, t.inited = !1, null != wx && wx.createCanvas) ? (i = Ot(), p[In].length >= i.maxSdkInstance ? xt.error("初始化超过上限") : (r = Et(e), n = at(), !0 !== r ? xt.error(r) : (r = null == n ? void 0 : n.appId) && r !== e.appid ? xt.error("初始化失败，传入的appid与当前小游戏appid不一致") : (It(t.config = e, "auto_track") || (t.config.auto_track = bt("autoTrack")), t.openid = e.openid, t.unionid = e.unionid, t.user_unique_id = e.user_unique_id, t.saveValidOpenidToStorage(), r = e.user_action_set_id, p[In].includes(r) ? xt.error("请勿重复初始化SDK") : (t.reportLog = t.reportLog.bind(c(t)), t.getTrackBaseInfo = t.getTrackBaseInfo.bind(c(t)), t.deviceInfo = nt(), t.gameInfo = Nt(), t.session_id = mt(), t.queueManage = new Vt({
                userActionSetId: r,
                maxLength: i.maxQueueLength,
                ogEvents: Yt
            }), t.actionReporter = new nn({
                getBaseInfo: t.getTrackBaseInfo,
                reportLog: t.reportLog,
                queueManager: t.queueManage,
                configManager: se
            }), t.inited = !0, p[In].push(r), t.useAutoTrack(), t.doReportOnEnterBackground(), "release" === (null == n ? void 0 : n.envVersion) ? xt.info("初始化成功") : (i = {
                conf_name: "mini_game_sdk_common",
                conf_key: "version",
                sdk_version: t.sdk_version,
                default_download_url: "https://sr-home-1257214331.cos.ap-guangzhou.myqcloud.com/sdk/dn-sdk-minigame/dn-sdk-minigame.zip",
                fail_handler: function () {
                    t.inited = !1
                }
            }, o = i.sdk_version, a = i.default_download_url, s = i.fail_handler, lt({
                conf_name: i.conf_name,
                conf_key: i.conf_key
            }).then(function (e) {
                var t, n, r, i;
                if (ht(e)) return t = null == e ? void 0 : e.blackVersions, n = null == e ? void 0 : e.minVersion, r = null == e ? void 0 : e.bestVersion, e = null == e ? void 0 : e.downloadUrl, i = a, e && /^https/.test(e) && (i = e), yt(t) && -1 < (null == t ? void 0 : t.indexOf(o)) ? (null != s && s(), void xt.error("初始化失败！当前SDK版本存在兼容问题，请尽快升级至最新版！下载地址：".concat(i))) : n && St(o, n) < 0 ? (null != s && s(), void xt.error("初始化失败！当前SDK版本过低，请尽快升级至最新版！下载地址：".concat(i))) : (r && St(o, r) < 0 && xt.warn("新版本SDK已上线，强烈建议您升级至最新版，尽早享受新特性！下载地址：".concat(i)), void xt.info("初始化成功"));
                xt.info("初始化成功")
            }).catch(function () {
                xt.info("初始化成功")
            }), Rn.requestActionList(), Sn(e.openid)))))) : xt.error("SDK只可以用在微信小游戏中使用"), u(t)
        }
        return v(p, [{
            key: "track",
            value: function (e, t) {
                var n = qe.validateActionType(e),
                    r = qe.validateActionParam(t);
                n && r && (this.openid || this.unionid || xt.warn("缺少 openid 或 unionid"), n = bt("actionParamMaxLength"), JSON.stringify(t || {}).length > n ? xt.error("监测到超过".concat(n, "的上报日志：").concat(e, " ").concat(t)) : (r = !(null == t || !t[wn]), n = this.createAction(e, t || {}, r), "release" !== (null == (e = at()) ? void 0 : e.envVersion) && kn(n, "minigame"), null != (t = this.queueManage) && t.addAction(n), null != (r = this.actionReporter) && r.batchSend()))
            }
        }, {
            key: "flush",
            value: function () {
                var e;
                null != (e = this.actionReporter) && e.flushSend()
            }
        }, {
            key: "setOpenId",
            value: function (e) {
                var t;
                e && "string" == typeof e ? (this.openid = e, this.gameInfo.ad_trace_id && !tt$1.getSync(T) && Qt.publish("START_APP"), this.flush(), this.saveValidOpenidToStorage(), "release" !== (null == (t = at()) ? void 0 : t.envVersion) && Sn(e)) : xt.error("openid 格式错误")
            }
        }, {
            key: "setUnionId",
            value: function (e) {
                e && "string" == typeof e ? (this.unionid = e, this.flush()) : xt.error("unionid 格式错误")
            }
        }, {
            key: "setUserUniqueId",
            value: function (e) {
                e && "string" == typeof e ? this.user_unique_id = e : xt.error("user_unique_id 格式错误")
            }
        }, {
            key: "doReportOnEnterBackground",
            value: function () {
                var t = this;
                wx.onHide(function () {
                    var e;
                    null != (e = t.actionReporter) && e.flushSend(), null != (e = t.queueManage) && e.reportLostNum()
                })
            }
        }, {
            key: "getTrackBaseInfo",
            value: function () {
                var t, n, e = at();
                return Object.assign({}, this.deviceInfo, (t = this.config, n = {}, ["user_action_set_id", "appid", "openid", "secret_key", "user_unique_id", "unionid"].forEach(function (e) {
                    It(t, e) && (n[e] = t[e])
                }), n), {
                    local_id: rt(),
                    sdk_name: this.sdk_name,
                    sdk_version: this.sdk_version,
                    openid: this.openid || it(),
                    unionid: this.unionid,
                    user_unique_id: this.user_unique_id,
                    inner_param: {
                        app_env_version: e.envVersion,
                        app_version: e.version
                    }
                })
            }
        }, {
            key: "createAction",
            value: function (e, t) {
                var n = 2 < arguments.length && void 0 !== arguments[2] && arguments[2],
                    r = (null != t && t[wn] && delete t[wn], Date.now()),
                    r = (null != t && t[Cn] && (r = null == t ? void 0 : t[Cn], delete t[Cn]), {
                        action_id: mt(),
                        action_param: t,
                        action_time: r,
                        action_type: e,
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
                        channel: this.getChannelByActionType(e)
                    });
                return null != t && t[this.special_method_symbol] && (this.addActionInnerParam(r, "is_special_method", !0), delete t[this.special_method_symbol]), -1 < se.getChannelClaimActionList().indexOf(e) && this.gameInfo.launch_options && this.addActionInnerParam(r, "launch_options", this.gameInfo.launch_options), r
            }
        }, {
            key: "addActionInnerParam",
            value: function (e, n, r) {
                e.inner_param && ht(e.inner_param) ? e.inner_param[n] = r : e.inner_param = t({}, n, r)
            }
        }, {
            key: "getChannelByActionType",
            value: function (e) {
                var t = "";
                return -1 < se.getChannelClaimActionList().indexOf(e) ? t = this.gameInfo.channel || "" : -1 < se.getNoClaimActionList().indexOf(e) && (t = X), t
            }
        }, {
            key: "reportLog",
            value: function (e) {
                var t = {
                    user_action_set_id: null == (t = this.config) ? void 0 : t.user_action_set_id,
                    appid: null == (t = this.config) ? void 0 : t.appid,
                    session_id: this.session_id
                };
                ct(Object.assign(t, e))
            }
        }, {
            key: "useAutoTrack",
            value: function () {
                var e, t;
                null != (e = this.config) && e.auto_track && (e = !0, (null == (t = tt$1.getSync(R)) ? void 0 : t.ap) === G ? e = !0 : (null == t ? void 0 : t.ap) === Q && (e = !1), "devtools" === nt().wx_platform && (e = !0), (new _n).install(this, e ? "all" : "lifecycle"), pe(), e && Le(), this.getAutoProxyRemoteConfig())
            }
        }, {
            key: "getAutoProxyRemoteConfig",
            value: function () {
                var e, n, t = nt();
                t.os && t.os_version && null != (e = this.config) && e.user_action_set_id && (n = {
                    conf_name: "MG",
                    conf_param: {
                        user_action_set_id: null == (e = this.config) ? void 0 : e.user_action_set_id,
                        sdk_version: this.sdk_version,
                        os_type: (null == t ? void 0 : t.os) || "",
                        os_version: wt(t.os_version),
                        device_brand: (null == t ? void 0 : t.device_brand) || "",
                        weixin_lib_version: (null == t ? void 0 : t.wx_lib_version) || "",
                        weixin_version: (null == t ? void 0 : t.wx_version) || ""
                    }
                }, new Promise(function (t) {
                    wx.request({
                        method: "POST",
                        url: "https://api.datanexus.qq.com/data-nexus-config/v1/sdk/minigame/get",
                        data: n,
                        timeout: E.requestTimeout,
                        success: function (e) {
                            ft(e, t, "minigame/get"), vt(e)
                        },
                        fail: function (e) {
                            dt(e, "minigame/get")
                        }
                    })
                }).then(function (e) {
                    ht(e) && tt$1.setSync(R, e)
                }))
            }
        }, {
            key: "saveValidOpenidToStorage",
            value: function () {
                this.openid && /^[a-zA-Z0-9_-]{28,30}$/.test(this.openid) && tt$1.setSync(T, this.openid)
            }
        }], [{
            key: "setRequestConcurrency",
            value: function (e) {
                nn.setRequestConcurrency(e)
            }
        }, {
            key: "setDebug",
            value: function (e) {
                xt.debug = e
            }
        }]), p
    }(),
    Nn = xn,
    HttpTask = (Nn[In] = [], On([Lt, Pt], Nn.prototype, "track", 1), On([Lt, Pt], Nn.prototype, "flush", 1), On([Lt], Nn.prototype, "setOpenId", 1), On([Lt], Nn.prototype, "setUnionId", 1), On([Lt], Nn.prototype, "setUserUniqueId", 1), On([Lt], Nn.prototype, "doReportOnEnterBackground", 1), On([Lt], Nn.prototype, "getTrackBaseInfo", 1), On([Lt], Nn.prototype, "useAutoTrack", 1), function () {
        function s(e, t, n, r, i, o, a) {
            _classCallCheck(this, s), this.data = e, this.serverUrl = t, this.callback = a, this.debugMode = i, this.platFormName = o, this.tryCount = _.isNumber(n) ? n : 1, this.permissionTryCount = 6, this.timeout = _.isNumber(r) ? r : 3e3, this.taClassName = "HttpTask"
        }
        return _createClass(s, [{
            key: "run",
            value: function () {
                var e, n = this,
                    t = _.createExtraHeaders(),
                    r = (t["content-type"] = "application/json", "debug" === this.debugMode && (t["Turbo-Debug-Mode"] = 1), "GravityEngine_ali_game" === this.platFormName ? "headers" : "header"),
                    i = PlatformAPI.request((_defineProperty(e = {
                        url: this.serverUrl,
                        method: "POST",
                        data: this.data
                    }, r, t), _defineProperty(e, "success", function (e) {
                        var t;
                        0 === (null == e || null == (t = e.data) ? void 0 : t.code) ? n.onSuccess(e) : n.onFailed(e)
                    }), _defineProperty(e, "fail", function (e) {
                        n.onFailed(e)
                    }), e));
                setTimeout(function () {
                    if ((_.isObject(i) || _.isPromise(i)) && _.isFunction(i.abort)) try {
                        i.abort()
                    } catch (e) {}
                }, this.timeout)
            }
        }, {
            key: "onSuccess",
            value: function (e) {
                var t, n;
                200 === e.statusCode ? (n = "Data Verified", null != e && null != (t = e.data) && null != (t = t.extra) && null != (t = t.errors) && t.length && (n = e.data.extra.errors), this.callback({
                    code: null == e || null == (t = e.data) ? void 0 : t.code,
                    msg: n
                })) : this.callback({
                    code: (null == e ? void 0 : e.statusCode) || -3,
                    msg: e.statusCode
                })
            }
        }, {
            key: "onFailed",
            value: function (e) {
                var t, n = this;
                0 < --this.tryCount ? setTimeout(function () {
                    n.run()
                }, 1e3) : this.callback({
                    code: -3,
                    msg: "".concat(null == e || null == (t = e.data) ? void 0 : t.msg, "：").concat(null == e || null == (t = e.data) || null == (t = t.extra) ? void 0 : t.error)
                })
            }
        }]), s
    }()),
    SenderQueue = function () {
        function e() {
            _classCallCheck(this, e), this.items = [], this.isRunning = !1, this.showDebug = !1
        }
        return _createClass(e, [{
            key: "enqueue",
            value: function (e, t, n) {
                var r = !(3 < arguments.length && void 0 !== arguments[3]) || arguments[3],
                    i = "debug" === n.debugMode,
                    o = this,
                    e = new HttpTask(JSON.stringify(e), t, n.maxRetries, n.sendTimeout, n.debugMode, n.platFormName, function (e) {
                        o.isRunning = !1, _.isFunction(n.callback) && n.callback(e), o._runNext(i), i && logger.info("code ".concat(e.code, " and msg is,"), e.msg)
                    });
                !0 === r ? (this.items.push(e), this._runNext(i)) : e.run()
            }
        }, {
            key: "_dequeue",
            value: function () {
                return this.items.shift()
            }
        }, {
            key: "_runNext",
            value: function (e) {
                if (0 < this.items.length && !this.isRunning)
                    if (this.isRunning = !0, e) this._dequeue().run();
                    else {
                        for (var t = this.items.splice(0, this.items.length), e = t[0], n = JSON.parse(e.data), r = 1; r < t.length; r++) {
                            var i = t[r],
                                i = JSON.parse(i.data);
                            n.event_list = n.event_list.concat(i.event_list)
                        }
                        var o = (new Date).getTime();
                        n.$flush_time = o, new HttpTask(JSON.stringify(n), e.serverUrl, e.tryCount, e.timeout, null == e ? void 0 : e.debugMode, e.platFormName, e.callback).run()
                    }
            }
        }]), e
    }(),
    senderQueue = new SenderQueue,
    DEFAULT_CONFIG = {
        name: "GravityEngine",
        is_plugin: !1,
        maxRetries: 3,
        sendTimeout: 5e3,
        enablePersistence: !0,
        asyncPersistence: !1,
        strict: !1,
        debugMode: "none"
    },
    systemInformation = {
        properties: {
            $lib_version: Config.LIB_VERSION,
            $lib: Config.LIB_STACK,
            $scene: "",
            $today_first_scene: ""
        },
        getSystemInfo: function (e) {
            var n = this;
            PlatformAPI.onNetworkStatusChange(function (e) {
                n.properties.$network_type = e.networkType
            }), PlatformAPI.getNetworkType({
                success: function (e) {
                    n.properties.$network_type = e.networkType
                },
                complete: function () {
                    PlatformAPI.getSystemInfo({
                        success: function (e) {
                            logger.info(JSON.stringify(e, null, 4));
                            var t = {
                                $manufacturer: e.brand,
                                $brand: e.brand,
                                $model: e.model,
                                $screen_width: Number(e.screenWidth),
                                $screen_height: Number(e.screenHeight),
                                $system_language: e.language,
                                $os: e.platform,
                                $os_version: e.system
                            };
                            _.extend(n.properties, t), _.setMpPlatform(e.mp_platform)
                        },
                        complete: function () {
                            e()
                        }
                    })
                }
            })
        }
    },
    GravityEnginePersistence = function () {
        function e(t, n) {
            var r = this;
            _classCallCheck(this, e), this.enabled = t.enablePersistence, this.enabled ? (t.isChildInstance ? (this.name = t.persistenceName + "_" + t.name, this.nameOld = t.persistenceNameOld + "_" + t.name) : (this.name = t.persistenceName, this.nameOld = t.persistenceNameOld), t.asyncPersistence ? (this._state = {}, PlatformAPI.getStorage(this.name, !0, function (e) {
                _.isEmptyObject(e) ? PlatformAPI.getStorage(r.nameOld, !0, function (e) {
                    r._state = _.extend2Layers({}, e, r._state), r._init(t, n), r._save()
                }) : (r._state = _.extend2Layers({}, e, r._state), r._init(t, n), r._save())
            })) : (this._state = PlatformAPI.getStorage(this.name) || {}, _.isEmptyObject(this._state) && (this._state = PlatformAPI.getStorage(this.nameOld) || {}), this._init(t, n))) : (this._state = {}, this._init(t, n))
        }
        return _createClass(e, [{
            key: "_init",
            value: function (e, t) {
                this.getDistinctId() || this.setDistinctId(_.UUID()), e.isChildInstance || this.getDeviceId() || this._setDeviceId(_.UUID()), this.initComplete = !0, "function" == typeof t && t();
                var e = PlatformAPI.getStorage(this.name),
                    t = null == e ? void 0 : e.current_first_scene_date,
                    n = null == e ? void 0 : e.current_first_scene,
                    r = (new Date).toLocaleDateString();
                n && t && t === r ? systemInformation.properties.$today_first_scene = String(null == e ? void 0 : e.current_first_scene) : (e = String((null == (n = PlatformAPI.getAppOptions()) ? void 0 : n.scene) || (null == (t = PlatformAPI.getAppOptions()) ? void 0 : t.from)), systemInformation.properties.$today_first_scene = e, this._state.current_first_scene = e, this._state.current_first_scene_date = r), this._save()
            }
        }, {
            key: "_save",
            value: function () {
                this.enabled && this.initComplete && PlatformAPI.setStorage(this.name, JSON.stringify(this._state))
            }
        }, {
            key: "_set",
            value: function (e, t) {
                var n, r = this;
                "string" == typeof e ? (n = {})[e] = t : "object" === _typeof(e) && (n = e), _.each(n, function (e, t) {
                    r._state[t] = e
                }), this._save()
            }
        }, {
            key: "_get",
            value: function (e) {
                return this._state[e]
            }
        }, {
            key: "setEventTimer",
            value: function (e, t) {
                var n = this._state.event_timers || {};
                n[e] = t, this._set("event_timers", n)
            }
        }, {
            key: "removeEventTimer",
            value: function (e) {
                var t = (this._state.event_timers || {})[e];
                return _.isUndefined(t) || (delete this._state.event_timers[e], this._save()), t
            }
        }, {
            key: "getDeviceId",
            value: function () {
                return this._state.device_id
            }
        }, {
            key: "_setDeviceId",
            value: function (e) {
                this.getDeviceId() ? logger.warn("cannot modify the device id.") : this._set("device_id", e)
            }
        }, {
            key: "getDistinctId",
            value: function () {
                return this._state.distinct_id
            }
        }, {
            key: "setDistinctId",
            value: function (e) {
                this._set("distinct_id", e)
            }
        }, {
            key: "getAccountId",
            value: function () {
                return this._state.account_id
            }
        }, {
            key: "setAccountId",
            value: function (e) {
                this._set("account_id", e)
            }
        }, {
            key: "getSuperProperties",
            value: function () {
                return this._state.props || {}
            }
        }, {
            key: "setSuperProperties",
            value: function (e, t) {
                t = t ? e : _.extend(this.getSuperProperties(), e);
                this._set("props", t)
            }
        }]), e
    }();

function getPlatFormName() {
    return PlatformAPI.getConfig().persistenceNameOld
}
var GravityEngineAPI = function () {
    function n(e) {
        _classCallCheck(this, n), e.appId = _.checkAppId((null == e ? void 0 : e.clientId) || ""), e.accessToken = e.accessToken, e.accessToken || console.warn("GravityAnalytics: accessToken must be required"), e.autoTrack = {
            appLaunch: !0,
            appShow: !0,
            appHide: !0,
            pageShare: !0
        }, e.serverUrl = "".concat(Config.BASE_URL, "/event/collect/?access_token=").concat(e.accessToken);
        var t = _.extend({}, DEFAULT_CONFIG, PlatformAPI.getConfig());
        _.isObject(e) ? this.config = _.extend(t, e) : this.config = t, this._init(this.config)
    }
    var e, t, r, i, o, a, s, c, u, l;
    return _createClass(n, [{
        key: "_init",
        value: function (e) {
            var t = this,
                n = (this.name = e.name, this.appId = e.clientId, this.accessToken = e.accessToken, this.platFormName = getPlatFormName(), _.isObject(e.tencentSdkData) && "GravityEngine_wechat_game" === this.platFormName && (null != (n = e.tencentSdkData) && n.enableDebug && (Nn.setDebug(!0), logger.tencentSdkLog("setDebug")), this.sdk = new Nn({
                    user_action_set_id: e.tencentSdkData.user_action_set_id,
                    secret_key: e.tencentSdkData.secret_key,
                    appid: e.tencentSdkData.appid
                })), e.serverUrl || e.server_url),
                n = (this.serverUrl = n, this.serverDebugUrl = n, this.configUrl = n + "/config", this.autoTrackProperties = {}, this._queue = [], this.config.syncBatchSize = 100, this.config.syncInterval = 60, e.isChildInstance ? this._state = {} : (logger.enabled = "debug" === e.debugMode, this.instances = [], this._state = {
                    getSystemInfo: !1,
                    initComplete: !1
                }, systemInformation.getSystemInfo(function () {
                    t._updateState({
                        getSystemInfo: !0
                    })
                }), PlatformAPI.setGlobal(this, this.name)), systemInformation.properties.$scene = String((null == (n = PlatformAPI.getAppOptions()) ? void 0 : n.scene) || (null == (n = PlatformAPI.getAppOptions()) ? void 0 : n.from)), this.store = new GravityEnginePersistence(e, function () {
                    t.config.asyncPersistence && _.isFunction(t.config.persistenceComplete) && t.config.persistenceComplete(t), t._updateState()
                }), this.enabled = !_.isBoolean(this.store._get("ge_enabled")) || this.store._get("ge_enabled"), this.isOptOut = !!_.isBoolean(this.store._get("ge_isOptOut")) && this.store._get("ge_isOptOut"), getPlatFormName()),
                r = "GravityEngine_quick_mp" === n;
            (r || "GravityEngine_wechat_game" === n || "GravityEngine_taobao_game" === n || "GravityEngine_tt_game" === n || "GravityEngine_ali_game" === n || n.includes("gravityengine_qg")) && this.track(r ? "$AppStart" : "$MPLaunch", {
                $url_query: _.setQuery(this.getQuery())
            }), e.isChildInstance || (this.autoTrack = PlatformAPI.initAutoTrackInstance(this, e))
        }
    }, {
        key: "updateConfig",
        value: function (e, t) {}
    }, {
        key: "initInstance",
        value: function (e, t) {
            if (!this.config.isChildInstance) return _.isString(e) && e !== this.name && _.isUndefined(this[e]) ? (t = new n(_.extend({}, this.config, {
                enablePersistence: !1,
                isChildInstance: !0,
                name: e
            }, t)), this[e] = t, this.instances.push(e), this[e]._state = this._state, t) : void logger.warn("initInstance() failed due to the name is invalid: " + e);
            logger.warn("initInstance() cannot be called on child instance")
        }
    }, {
        key: "lightInstance",
        value: function (e) {
            return this[e]
        }
    }, {
        key: "_setAutoTrackProperties",
        value: function (e) {
            _.extend(this.autoTrackProperties, e)
        }
    }, {
        key: "setupAndStart",
        value: function (e) {
            var t = this;
            if (null != e && e.clientId && (this.config.appId = e.clientId, this.appId = e.clientId), this.openId = (null == e ? void 0 : e.openId) || this.appId, this.sdk && (this.sdk.setOpenId(this.openId), logger.tencentSdkLog("setOpenId"), PlatformAPI.getStorage("is_ge_registered", !0, function (e) {
                    "Y" === e && t._setDryRunValue(0).then(function () {
                        t.config.tencentSdkData.enableDryRun ? t.tryDryRun({
                            actionList: ["pay", "tutorial_finish", "create_role", "re_active", "register"]
                        }) : t.tencentSDKRegisterTrack()
                    })
                })), this._state.initComplete) return !1;
            this._updateState({
                initComplete: !0
            })
        }
    }, {
        key: "preInit",
        value: (l = _asyncToGenerator(_regeneratorRuntime().mark(function e() {
            var t, n;
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (t = PlatformAPI.getStorage("gravity_pre_cache", !1), (t = null != t && t.latest_cache_time ? Number(null == t ? void 0 : t.latest_cache_time) : 0) && Date.now() - t < 864e5) return e.abrupt("return");
                        e.next = 4;
                        break;
                    case 4:
                        t = PlatformAPI.getAppOptions(), n = _.isObject(null == t ? void 0 : t.query) ? t.query : {}, n = {
                            latest_cache_time: Date.now(),
                            gravity_query_cache: n,
                            gravity_scene_cache: (null == t ? void 0 : t.scene) || ""
                        }, PlatformAPI.setStorage("gravity_pre_cache", JSON.stringify(n));
                    case 8:
                    case "end":
                        return e.stop()
                }
            }, e)
        })), function () {
            return l.apply(this, arguments)
        })
    }, {
        key: "_getPreCache",
        value: function () {
            var e, t = {
                    cache_query: {},
                    cache_scene: ""
                },
                n = PlatformAPI.getStorage("gravity_pre_cache", !1);
            return !_.isObject(n) || _.isEmptyObject(n) || (e = null != n && n.latest_cache_time ? Number(null == n ? void 0 : n.latest_cache_time) : 0) && 864e5 < Date.now() - e ? t : (e = (null == n ? void 0 : n.gravity_query_cache) || {}, {
                cache_query: _.isObject(e) && !_.isEmptyObject(e) ? e : {},
                cache_scene: (null == n ? void 0 : n.gravity_scene_cache) || ""
            })
        }
    }, {
        key: "_isReady",
        value: function () {
            return this._state.getSystemInfo && this._state.initComplete && this.store.initComplete && this.config.appId && this.config.accessToken
        }
    }, {
        key: "_updateState",
        value: function (e) {
            var t = this;
            _.isObject(e) && _.extend(this._state, e), this._onStateChange(), _.each(this.instances, function (e) {
                t[e]._onStateChange()
            })
        }
    }, {
        key: "_onStateChange",
        value: function () {
            var t = this;
            this._isReady() && this._queue && 0 < this._queue.length && (_.each(this._queue, function (e) {
                t[e[0]].apply(t, slice.call(e[1]))
            }), this._queue = [])
        }
    }, {
        key: "_hasDisabled",
        value: function () {
            var e = !this.enabled || this.isOptOut;
            return e && logger.info("GravityEngine is Pause or Stop!"), e
        }
    }, {
        key: "_sendRequest",
        value: function (e, t, n) {
            if (!this._hasDisabled())
                if (!_.isUndefined(this.config.disableEventList) && this.config.disableEventList.includes(e.eventName)) logger.info("disabled Event : " + e.eventName);
                else {
                    t = _.isDate(t) ? t : new Date;
                    var t = {
                            event_list: [{
                                type: e.type,
                                time: new Date(t).getTime()
                            }]
                        },
                        r = (t.event_list[0].event = e.eventName, "track" === e.type ? (t.event_list[0].properties = this.getSendProperties(), r = this.store.removeEventTimer(e.eventName), _.isUndefined(r) || (r = (new Date).getTime() - r, 86400 < (r = parseFloat((r / 1e3).toFixed(3))) ? r = 86400 : r < 0 && (r = 0), t.event_list[0].properties.$event_duration = r)) : t.event_list[0].properties = {}, _.isObject(e.properties) && !_.isEmptyObject(e.properties) && _.extend(t.event_list[0].properties, e.properties), _.searchObjDate(t.event_list[0]), t.client_id = this.appId, logger.info(JSON.stringify(t, null, 4)), this.serverUrl);
                    if (_.isBoolean(this.config.enableEncrypt) && 1 == this.config.enableEncrypt && (t.event_list[0] = _.generateEncryptyData(t.event_list[0], void 0)), n) {
                        var i, n = new FormData;
                        "debug" === this.config.debugMode ? (n.append("source", "client"), n.append("appid", this.appId), n.append("deviceId", this.getDeviceId()), n.append("data", JSON.stringify(t.event_list[0]))) : (i = _.base64Encode(JSON.stringify(t)), n.append("data", i));
                        try {
                            navigator.sendBeacon(r, n)
                        } catch (e) {}
                        _.isFunction(e.onComplete) && e.onComplete({
                            statusCode: 200
                        })
                    } else senderQueue.enqueue(t, r, {
                        maxRetries: this.config.maxRetries,
                        sendTimeout: this.config.sendTimeout,
                        callback: e.onComplete,
                        debugMode: this.config.debugMode,
                        platFormName: this.platFormName
                    })
                }
        }
    }, {
        key: "_isObjectParams",
        value: function (e) {
            return _.isObject(e) && _.isFunction(e.onComplete)
        }
    }, {
        key: "track",
        value: function (e, t, n, r) {
            var i;
            this._hasDisabled() || (this._isObjectParams(e) && (e = (i = e).eventName, t = i.properties, n = i.time, r = i.onComplete), null != (i = t = _.isObject(t) ? t : {}) && i.$trace_id || (t.$trace_id = _.UUID()), PropertyChecker.event(e) && PropertyChecker.properties(t) || !this.config.strict ? this._internalTrack(e, t, n, r) : _.isFunction(r) && r({
                code: -1,
                msg: "invalid parameters"
            }))
        }
    }, {
        key: "_internalTrack",
        value: function (e, t, n, r, i) {
            this._hasDisabled() || (n = _.isDate(n) ? n : new Date, this._isReady() ? this._sendRequest({
                type: "track",
                eventName: e,
                properties: t,
                onComplete: r
            }, n, i) : this._queue.push(["_internalTrack", [e, t, n, r]]))
        }
    }, {
        key: "userSet",
        value: function (e, t, n) {
            var r;
            this._hasDisabled() || (this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), PropertyChecker.propertiesMust(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                type: "profile",
                eventName: "profile_set",
                properties: e,
                onComplete: n
            }, t) : this._queue.push(["userSet", [e, t, n]])) : (logger.warn("calling userSet failed due to invalid arguments"), _.isFunction(n) && n({
                code: -1,
                msg: "invalid parameters"
            })))
        }
    }, {
        key: "userSetOnce",
        value: function (e, t, n) {
            var r;
            this._hasDisabled() || (this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), PropertyChecker.propertiesMust(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                type: "profile",
                eventName: "profile_set_once",
                properties: e,
                onComplete: n
            }, t) : this._queue.push(["userSetOnce", [e, t, n]])) : (logger.warn("calling userSetOnce failed due to invalid arguments"), _.isFunction(n) && n({
                code: -1,
                msg: "invalid parameters"
            })))
        }
    }, {
        key: "userAdd",
        value: function (e, t, n) {
            var r;
            this._hasDisabled() || (this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), PropertyChecker.propertiesMust(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                type: "profile",
                eventName: "profile_increment",
                properties: e,
                onComplete: n
            }, t) : this._queue.push(["userAdd", [e, t, n]])) : (logger.warn("calling userAdd failed due to invalid arguments"), _.isFunction(n) && n({
                code: -1,
                msg: "invalid parameters"
            })))
        }
    }, {
        key: "userNumberMax",
        value: function (e, t, n) {
            if (!this._hasDisabled()) {
                var r, i, o;
                for (i in this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), e)
                    if ("number" != typeof e[i]) return o = "The key ".concat(i, " must be type of number"), console.warn(o), void(_.isFunction(n) && n({
                        code: -1,
                        msg: o
                    }));
                PropertyChecker.propertiesMust(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                    type: "profile",
                    eventName: "profile_number_max",
                    properties: e,
                    onComplete: n
                }, t) : this._queue.push(["userNumberMax", [e, t, n]])) : (logger.warn("calling userNumberMax failed due to invalid arguments"), _.isFunction(n) && n({
                    code: -1,
                    msg: "invalid parameters"
                }))
            }
        }
    }, {
        key: "userNumberMin",
        value: function (e, t, n) {
            if (!this._hasDisabled()) {
                var r, i, o;
                for (i in this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), e)
                    if ("number" != typeof e[i]) return o = "The key ".concat(i, " must be type of number"), console.warn(o), void(_.isFunction(n) && n({
                        code: -1,
                        msg: o
                    }));
                PropertyChecker.propertiesMust(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                    type: "profile",
                    eventName: "profile_number_min",
                    properties: e,
                    onComplete: n
                }, t) : this._queue.push(["userNumberMin", [e, t, n]])) : (logger.warn("calling userNumberMin failed due to invalid arguments"), _.isFunction(n) && n({
                    code: -1,
                    msg: "invalid parameters"
                }))
            }
        }
    }, {
        key: "userDel",
        value: function (e, t) {
            var n, r = {};
            this._hasDisabled() || (this._isObjectParams(r) && (r = (n = r).properties, e = n.time, t = n.onComplete), PropertyChecker.propertiesMust(r) || !this.config.strict ? (e = _.isDate(e) ? e : new Date, this._isReady() ? this._sendRequest({
                type: "profile",
                eventName: "profile_delete",
                properties: r,
                onComplete: t
            }, e) : this._queue.push(["userDel", [r, e, t]])) : (logger.warn("calling userDel failed due to invalid arguments"), _.isFunction(t) && t({
                code: -1,
                msg: "invalid parameters"
            })))
        }
    }, {
        key: "userAppend",
        value: function (e, t, n) {
            var r;
            this._hasDisabled() || (this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), PropertyChecker.propertiesMust(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                type: "profile",
                eventName: "profile_append",
                properties: e,
                onComplete: n
            }, t) : this._queue.push(["userAppend", [e, t, n]])) : (logger.warn("calling userAppend failed due to invalid arguments"), _.isFunction(n) && n({
                code: -1,
                msg: "invalid parameters"
            })))
        }
    }, {
        key: "userUniqAppend",
        value: function (e, t, n) {
            var r;
            this._hasDisabled() || (this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), PropertyChecker.userAppendProperties(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                type: "profile",
                eventName: "profile_uniq_append",
                properties: e,
                onComplete: n
            }, t) : this._queue.push(["userUniqAppend", [e, t, n]])) : (logger.warn("calling userAppend failed due to invalid arguments"), _.isFunction(n) && n({
                code: -1,
                msg: "invalid parameters"
            })))
        }
    }, {
        key: "userUnset",
        value: function (e, t, n) {
            var r, e = _defineProperty({}, e, null);
            this._hasDisabled() || (this._isObjectParams(e) && (e = (r = e).properties, t = r.time, n = r.onComplete), PropertyChecker.propertiesMust(e) || !this.config.strict ? (t = _.isDate(t) ? t : new Date, this._isReady() ? this._sendRequest({
                type: "profile",
                eventName: "profile_unset",
                properties: e,
                onComplete: n
            }, t) : this._queue.push(["userUnset", [e, t, n]])) : (logger.warn("calling userUnset failed due to invalid arguments"), _.isFunction(n) && n({
                code: -1,
                msg: "invalid parameters"
            })))
        }
    }, {
        key: "getQuickAppInfo",
        value: function () {
            return new Promise(function (r, e) {
                var t;
                PlatformAPI.getQuickDevice({
                    success: (t = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
                        var n;
                        return _regeneratorRuntime().wrap(function (e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    return n = {
                                        os_name: "android",
                                        android_id: t.user,
                                        imei: t.device,
                                        oaid: t.oaid,
                                        mac: t.mac,
                                        android_version: t.system,
                                        api_version: t.osVersionCode,
                                        rom: t.vendorOsName,
                                        rom_version: t.vendorOsVersion,
                                        phone_brand: t.manufacturer,
                                        phone_model: t.model
                                    }, e.abrupt("return", r(n));
                                case 2:
                                case "end":
                                    return e.stop()
                            }
                        }, e)
                    })), function (e) {
                        return t.apply(this, arguments)
                    })
                })
            })
        }
    }, {
        key: "getQuickGameInfo",
        value: function () {
            return new Promise(function (t) {
                var e = getPlatFormName();
                PlatformAPI.getQuickDevice({
                    platform: e,
                    success: function (e) {
                        return t(e)
                    }
                })
            })
        }
    }, {
        key: "uploadQuickAppDeviceInfo",
        value: function () {
            var a = this;
            return new Promise(function (i, o) {
                var t;
                PlatformAPI.getQuickDevice({
                    success: (t = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
                        var n, r;
                        return _regeneratorRuntime().wrap(function (e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    return n = {
                                        os_name: "android",
                                        android_id: t.user,
                                        imei: t.device,
                                        oaid: t.oaid,
                                        mac: t.mac,
                                        android_version: t.system,
                                        api_version: t.osVersionCode,
                                        rom: t.vendorOsName,
                                        rom_version: t.vendorOsVersion,
                                        phone_brand: t.manufacturer,
                                        phone_model: t.model
                                    }, r = "".concat(Config.BASE_URL, "/user/device_info/?access_token=").concat(a.accessToken, "&client_id=").concat(a.appId), e.next = 4, a.sendNetWork(r, {
                                        data: n
                                    });
                                case 4:
                                    return r = e.sent, e.abrupt("return", (0 === r.code ? i : o)(r));
                                case 6:
                                case "end":
                                    return e.stop()
                            }
                        }, e)
                    })), function (e) {
                        return t.apply(this, arguments)
                    })
                })
            })
        }
    }, {
        key: "uploadQuickGameDeviceInfo",
        value: function () {
            var a = this;
            return new Promise(function (i, o) {
                var t, e = getPlatFormName();
                PlatformAPI.getQuickDevice({
                    platform: e,
                    success: (t = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
                        var n, r;
                        return _regeneratorRuntime().wrap(function (e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    return n = t, r = "".concat(Config.BASE_URL, "/user/device_info/?access_token=").concat(a.accessToken, "&client_id=").concat(a.appId), e.next = 4, a.sendNetWork(r, {
                                        data: n
                                    });
                                case 4:
                                    return r = e.sent, e.abrupt("return", (0 === r.code ? i : o)(r));
                                case 6:
                                case "end":
                                    return e.stop()
                            }
                        }, e)
                    })), function (e) {
                        return t.apply(this, arguments)
                    })
                })
            })
        }
    }, {
        key: "logoutEvent",
        value: function () {
            this.track("$MPLogout", {})
        }
    }, {
        key: "loginEvent",
        value: function () {
            this.track("$MPLogin", {})
        }
    }, {
        key: "registerEvent",
        value: function () {
            "GravityEngine_quick_mp" === getPlatFormName() ? this.track("$AppRegister", {}) : this.track("$MPRegister", {})
        }
    }, {
        key: "payEvent",
        value: function (n, r, i, o, a) {
            var s = this;
            if ("number" != typeof n) throw new Error("pay_amount must be a number");
            if ("string" != typeof r) throw new Error("pay_type must be a string");
            if ("string" != typeof i) throw new Error("order_id must be a string");
            if ("string" != typeof o) throw new Error("pay_reason must be a string");
            if ("string" != typeof a) throw new Error("pay_method must be a string");
            return new Promise(function (e, t) {
                s.track("$PayEvent", {
                    $pay_amount: n,
                    $pay_type: r,
                    $order_id: i,
                    $pay_reason: o,
                    $pay_method: a
                }, null, function () {
                    e()
                })
            })
        }
    }, {
        key: "bindTAThirdPlatform",
        value: function (e, t) {
            if (!e && !t) throw new Error("taAccountId or taDistinctId must be required");
            if (e && "string" != typeof e) throw new Error("taAccountId must be a string");
            if (t && "string" != typeof t) throw new Error("taDistinctId must be a string");
            this.track("$BindThirdPlatform", {
                $third_platform_type: "ta",
                $ta_account_id: e,
                $ta_distinct_id: t
            })
        }
    }, {
        key: "adShowEvent",
        value: function (e, t, n) {
            var r = getPlatFormName(),
                i = "GravityEngine_wechat" === r || "GravityEngine_wechat_game" === r || "GravityEngine_ali_game" === r || r.startsWith("gravityengine_qg") || r.startsWith("GravityEngine_quick"),
                r = "GravityEngine_wechat" === r || "GravityEngine_wechat_game" === r;
            if (i) {
                if ("string" != typeof e) throw new Error("ad_type must be a string");
                if ("string" != typeof t) throw new Error("ad_unit_id must be a string");
                if (r && !t.startsWith("adunit-")) throw new Error("您传入的ad_unit_id格式不正确，请检查");
                i = {
                    $ad_type: e,
                    $ad_unit_id: t,
                    $adn_type: r ? "wechat" : "media"
                };
                "[object Object]" === Object.prototype.toString.call(n) && Object.assign(i, n), this.track("$AdShow", i)
            }
        }
    }, {
        key: "getQuery",
        value: function () {
            try {
                var e;
                return null != PlatformAPI && PlatformAPI.getAppOptions && null != (e = PlatformAPI.getAppOptions()) && e.query ? PlatformAPI.getAppOptions().query || {} : {}
            } catch (e) {
                return {}
            }
        }
    }, {
        key: "sendNetWork",
        value: function (r, i) {
            var o = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : "POST",
                a = "GravityEngine_ali_game" === this.platFormName ? "headers" : "header";
            return new Promise(function (t, n) {
                var e;
                PlatformAPI.request((_defineProperty(e = {
                    url: r,
                    method: o,
                    data: "string" == typeof i ? i : JSON.stringify(i)
                }, a, {
                    "content-type": "application/json"
                }), _defineProperty(e, "success", function (e) {
                    200 === e.statusCode || 200 === e.status ? t(e.data) : n(e)
                }), _defineProperty(e, "fail", function (e) {
                    n(e)
                }), e))
            })
        }
    }, {
        key: "_errorPromise",
        value: function (e) {
            return Promise.reject(new Error(e))
        }
    }, {
        key: "initializeWithHistoryUserInfo",
        value: (u = _asyncToGenerator(_regeneratorRuntime().mark(function e() {
            var t, n, r = arguments;
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = 0 < r.length && void 0 !== r[0] ? r[0] : {}, n = 1 < r.length ? r[1] : void 0, e.abrupt("return", this.initialize(t, n));
                    case 3:
                    case "end":
                        return e.stop()
                }
            }, e, this)
        })), function () {
            return u.apply(this, arguments)
        })
    }, {
        key: "initialize",
        value: (c = _asyncToGenerator(_regeneratorRuntime().mark(function e() {
            var y, k, b = this,
                t = arguments;
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return y = 0 < t.length && void 0 !== t[0] ? t[0] : {}, k = 1 < t.length ? t[1] : void 0, e.abrupt("return", new Promise(function () {
                            var n = _asyncToGenerator(_regeneratorRuntime().mark(function e(m, v) {
                                return _regeneratorRuntime().wrap(function (e) {
                                    for (;;) switch (e.prev = e.next) {
                                        case 0:
                                            try {
                                                PlatformAPI.getStorage("is_ge_registered", !0, function () {
                                                    var t = _asyncToGenerator(_regeneratorRuntime().mark(function e(n) {
                                                        var r, i, o, a, s, c, u, l, p, f, d, h, g;
                                                        return _regeneratorRuntime().wrap(function (e) {
                                                            for (;;) switch (e.prev = e.next) {
                                                                case 0:
                                                                    if (i = "", b._state.initComplete ? null != y && y.name ? null != y && y.version || 0 === (null == y ? void 0 : y.version) ? _.isNumber(null == y ? void 0 : y.version) && "number" == typeof (null == y ? void 0 : y.version) ? void 0 !== k && ("[object Object]" !== Object.prototype.toString.call(k) ? i = "history_info must be type: Object" : null != k && k.company ? "string" != typeof k.company ? i = "history_info.company must be type: String" : null != k && k.create_time || 0 === k.create_time ? _.isNumber(k.create_time) && "number" == typeof k.create_time || (i = "history_info.create_time must be type: Number") : i = "history_info.create_time must be required" : i = "history_info.company must be required") : i = "version must be type: Number" : i = "version must be required" : i = "name must be required" : i = "initialize must be called after setupAndStart", i) return e.abrupt("return", v(i));
                                                                    e.next = 4;
                                                                    break;
                                                                case 4:
                                                                    if (t = void 0, t = b.getQuery(), r = _.isObject(t) && !_.isEmptyObject(t) ? t : (t = b._getPreCache().cache_query, _.isObject(t) && !_.isEmptyObject(t) ? _objectSpread2(_objectSpread2({}, t), {}, {
                                                                            gravity_launch_cache: 1
                                                                        }) : {}), i = getPlatFormName(), a = i.includes("GravityEngine_ali"), o = (null == y ? void 0 : y.channel) || "base_channel", s = (null == y ? void 0 : y.enable_sync_attribution) || !1, a = {
                                                                            client_id: b.appId,
                                                                            name: y.name,
                                                                            channel: a && null != r && r.channel ? r.channel : o,
                                                                            version: y.version,
                                                                            wx_openid: (null == y ? void 0 : y.openid) || (null == y ? void 0 : y.wx_openid) || b.openId || "",
                                                                            wx_unionid: (null == y ? void 0 : y.wx_unionid) || "",
                                                                            promoted_object_id: (null == y ? void 0 : y.promoted_object_id) || "",
                                                                            need_return_attribution: s,
                                                                            ad_data: r
                                                                        }, k && (a.history_info = k), "GravityEngine_quick_mp" === (s = getPlatFormName())) return e.next = 15, b.getQuickAppInfo();
                                                                    e.next = 16;
                                                                    break;
                                                                case 15:
                                                                    a.device_info = e.sent;
                                                                case 16:
                                                                    if (s.includes("gravityengine_qg")) return e.next = 19, b.getQuickGameInfo();
                                                                    e.next = 20;
                                                                    break;
                                                                case 19:
                                                                    a.device_info = e.sent;
                                                                case 20:
                                                                    return u = "".concat(Config.BASE_URL, "/user/initialize/?access_token=").concat(b.accessToken, "&client_id=").concat(b.appId), e.next = 23, b.sendNetWork(u, a);
                                                                case 23:
                                                                    if (0 !== (c = e.sent).code) return e.abrupt("return", v(c));
                                                                    e.next = 26;
                                                                    break;
                                                                case 26:
                                                                    u = systemInformation.properties, g = new Date, l = g.getFullYear(), p = ("0" + (g.getMonth() + 1)).slice(-2), f = ("0" + g.getDate()).slice(-2), d = ("0" + g.getHours()).slice(-2), h = ("0" + g.getMinutes()).slice(-2), g = ("0" + g.getSeconds()).slice(-2), l = "".concat(l, "-").concat(p, "-").concat(f, " ").concat(d, ":").concat(h, ":").concat(g), "Y" !== n && (p = {
                                                                        $channel: o,
                                                                        $manufacturer: u.$manufacturer,
                                                                        $model: u.$model,
                                                                        $brand: u.$brand,
                                                                        $os: u.$os,
                                                                        $first_visit_time: l
                                                                    }, f = function (e) {
                                                                        e = null == (e = PlatformAPI.getAppOptions()) ? void 0 : e.scene;
                                                                        return e ? String(e) : b._getPreCache().cache_scene || ""
                                                                    }(), p.$first_scene = f, null != r && r.gravity_referee_openid && (p.$gravity_referee_openid = r.gravity_referee_openid), b.userSetOnce(p), d = _.setQuery(b.getQuery()), h = "GravityEngine_quick_mp" === s ? "$AppStart" : "$MPLaunch", g = {
                                                                        $url_query: d
                                                                    }, b.track(h, g), b.track("$MPShow", g), b.tryRegisterEventDryRun());
                                                                    try {
                                                                        PlatformAPI.removeStorage("gravity_pre_cache")
                                                                    } catch (e) {}
                                                                    return PlatformAPI.setStorage("is_ge_registered", JSON.stringify("Y")), e.abrupt("return", m(c));
                                                                case 39:
                                                                case "end":
                                                                    return e.stop()
                                                            }
                                                            var t
                                                        }, e)
                                                    }));
                                                    return function (e) {
                                                        return t.apply(this, arguments)
                                                    }
                                                }())
                                            } catch (e) {
                                                v(e)
                                            }
                                            case 1:
                                            case "end":
                                                return e.stop()
                                    }
                                }, e)
                            }));
                            return function (e, t) {
                                return n.apply(this, arguments)
                            }
                        }()));
                    case 3:
                    case "end":
                        return e.stop()
                }
            }, e)
        })), function () {
            return c.apply(this, arguments)
        })
    }, {
        key: "authorizeOpenID",
        value: function (e) {
            this.identify(e)
        }
    }, {
        key: "identify",
        value: function (e) {
            if (!this._hasDisabled()) {
                if ("number" == typeof e) e = String(e);
                else if ("string" != typeof e) return !1;
                this.store.setDistinctId(e)
            }
        }
    }, {
        key: "getDistinctId",
        value: function () {
            return this.store.getDistinctId()
        }
    }, {
        key: "login",
        value: function (e) {
            if (!this._hasDisabled()) {
                if ("number" == typeof e) e = String(e);
                else if ("string" != typeof e) return !1;
                this.store.setAccountId(e)
            }
        }
    }, {
        key: "getAccountId",
        value: function () {
            return this.store.getAccountId()
        }
    }, {
        key: "logout",
        value: function () {
            this._hasDisabled() || this.store.setAccountId(null)
        }
    }, {
        key: "setSuperProperties",
        value: function (e) {
            this._hasDisabled() || (PropertyChecker.propertiesMust(e) || !this.config.strict ? this.store.setSuperProperties(e) : logger.warn("setSuperProperties parameter must be a valid property value"))
        }
    }, {
        key: "clearSuperProperties",
        value: function () {
            this._hasDisabled() || this.store.setSuperProperties({}, !0)
        }
    }, {
        key: "unsetSuperProperty",
        value: function (e) {
            var t;
            this._hasDisabled() || _.isString(e) && (delete(t = this.getSuperProperties())[e], this.store.setSuperProperties(t, !0))
        }
    }, {
        key: "getSuperProperties",
        value: function () {
            return this.store.getSuperProperties()
        }
    }, {
        key: "getSendProperties",
        value: function () {
            try {
                var e, t = _.extend({}, systemInformation.properties, this.autoTrackProperties, this.store.getSuperProperties(), this.dynamicProperties ? this.dynamicProperties() : {});
                for (e in t) "string" == typeof t[e] && (t[e] = t[e].substring(0, 8192));
                return t
            } catch (e) {
                return {}
            }
        }
    }, {
        key: "getPresetProperties",
        value: function () {
            var e = systemInformation.properties,
                t = {},
                n = e.$system_language,
                n = (t.system_language = _.isUndefined(n) ? "" : n, e.$os),
                n = (t.os = _.isUndefined(n) ? "" : n, e.$screen_width),
                n = (t.screenWidth = _.isUndefined(n) ? 0 : n, e.$screen_height),
                n = (t.screenHeight = _.isUndefined(n) ? 0 : n, e.$network_type),
                n = (t.networkType = _.isUndefined(n) ? "" : n, e.$model),
                n = (t.deviceModel = _.isUndefined(n) ? "" : n, e.$os_version),
                n = (t.osVersion = _.isUndefined(n) ? "" : n, t.deviceId = this.getDeviceId(), 0 - (new Date).getTimezoneOffset() / 60),
                n = (t.zoneOffset = n, e.$manufacturer),
                n = (t.manufacturer = _.isUndefined(n) ? "" : n, e.$manufacturer);
            return t.brand = _.isUndefined(n) ? "" : n, t.toEventPresetProperties = function () {
                var e;
                return {
                    $app_id: this.appId,
                    $model: t.deviceModel,
                    $screen_width: t.screenWidth,
                    $screen_height: t.screenHeight,
                    $system_language: t.system_language,
                    $os: t.os,
                    $os_version: t.osVersion,
                    $network_type: t.networkType,
                    $manufacturer: t.manufacturer,
                    $brand: t.manufacturer,
                    $scene: String((null == (e = PlatformAPI.getAppOptions()) ? void 0 : e.scene) || (null == (e = PlatformAPI.getAppOptions()) ? void 0 : e.from))
                }
            }, t
        }
    }, {
        key: "setDynamicSuperProperties",
        value: function (e) {
            this._hasDisabled() || ("function" == typeof e ? PropertyChecker.properties(e()) || !this.config.strict ? this.dynamicProperties = e : logger.warn("A dynamic public property must return a valid property value") : logger.warn("setDynamicSuperProperties parameter must be a function type"))
        }
    }, {
        key: "timeEvent",
        value: function (e, t) {
            this._hasDisabled() || (t = _.isDate(t) ? t : new Date, this._isReady() ? PropertyChecker.event(e) || !this.config.strict ? this.store.setEventTimer(e, t.getTime()) : logger.warn("calling timeEvent failed due to invalid eventName: " + e) : this._queue.push(["timeEvent", [e, t]]))
        }
    }, {
        key: "getDeviceId",
        value: function () {
            return systemInformation.properties.$device_id
        }
    }, {
        key: "enableTracking",
        value: function (e) {
            this.enabled = e, this.store._set("ta_enabled", e)
        }
    }, {
        key: "optOutTracking",
        value: function () {
            this.store.setSuperProperties({}, !0), this.store.setDistinctId(_.UUID()), this.store.setAccountId(null), this._queue.splice(0, this._queue.length), this.isOptOut = !0, this.store._set("ge_isOptOut", !0)
        }
    }, {
        key: "optOutTrackingAndDeleteUser",
        value: function () {
            var e = new Date;
            this._sendRequest({
                type: "user_del"
            }, e), this.optOutTracking()
        }
    }, {
        key: "optInTracking",
        value: function () {
            this.isOptOut = !1, this.store._set("ge_isOptOut", !1)
        }
    }, {
        key: "setTrackStatus",
        value: function (e) {
            switch (e) {
                case "PAUSE":
                    this.eventSaveOnly = !1, this.optInTracking(), this.enableTracking(!1);
                    break;
                case "STOP":
                    this.eventSaveOnly = !1, this.optOutTracking(!0);
                    break;
                default:
                    this.eventSaveOnly = !1, this.optInTracking(), this.enableTracking(!0)
            }
        }
    }, {
        key: "getCommonOpenId",
        value: function (o, a) {
            var s = this;
            return new Promise(function () {
                var n = _asyncToGenerator(_regeneratorRuntime().mark(function e(t, n) {
                    var r, i;
                    return _regeneratorRuntime().wrap(function (e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                if (e.prev = 0, o) {
                                    e.next = 3;
                                    break
                                }
                                return e.abrupt("return", n("code is required"));
                            case 3:
                                return i = "https://backend.gravity-engine.com/event_center/api/v1/base/".concat(a, "/code2Session/?access_token=").concat(s.accessToken), e.next = 6, s.sendNetWork(i, {
                                    code: o
                                });
                            case 6:
                                return i = e.sent, e.abrupt("return", 0 === i.code && null != i && null != (r = i.data) && r.resp ? t(i.data.resp) : n(i));
                            case 10:
                                return e.prev = 10, e.t0 = e.catch(0), e.abrupt("return", n(e.t0));
                            case 13:
                            case "end":
                                return e.stop()
                        }
                    }, e, null, [
                        [0, 10]
                    ])
                }));
                return function (e, t) {
                    return n.apply(this, arguments)
                }
            }())
        }
    }, {
        key: "getWechatOpenId",
        value: function (e) {
            return this.getCommonOpenId(e, "wx")
        }
    }, {
        key: "getKuaishouOpenId",
        value: function (e) {
            return this.getCommonOpenId(e, "ks")
        }
    }, {
        key: "getDouyinOpenId",
        value: function (e) {
            return this.getCommonOpenId(e, "dy")
        }
    }, {
        key: "getBilibiliOpenId",
        value: function (e) {
            return this.getCommonOpenId(e, "bili")
        }
    }, {
        key: "tencentSDKRegisterTrack",
        value: function () {
            var t = this;
            this.sdk && this.appId && this.checkUserInfo().then(function (e) {
                var e = (null == e || null == (e = e.data) ? void 0 : e.action) || "";
                "register" === e ? (t.sdk.onRegister(), logger.tencentSdkLog("onRegister"), t.setupUserInfo("register")) : "re_active" === e && "number" == typeof (null == (e = t.config) || null == (e = e.tencentSdkData) ? void 0 : e.silentPeriod) && (t.sdk.track("RE_ACTIVE", {
                    backFlowDay: t.config.tencentSdkData.silentPeriod
                }), logger.tencentSdkLog("track RE_ACTIVE"), t.setupUserInfo("re_active"))
            })
        }
    }, {
        key: "checkUserInfo",
        value: function () {
            var e, i = this,
                o = (null == (e = this.config) || null == (e = e.tencentSdkData) ? void 0 : e.silentPeriod) || 7;
            return new Promise(function () {
                var n = _asyncToGenerator(_regeneratorRuntime().mark(function e(t, n) {
                    var r;
                    return _regeneratorRuntime().wrap(function (e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                return r = "https://backend.gravity-engine.com/event_center/api/v1/event/tencent_sdk/?access_token=".concat(i.accessToken, "&client_id=").concat(i.appId, "&backFlowDay=").concat(o), e.next = 3, i.sendNetWork(r, {}, "get");
                            case 3:
                                return r = e.sent, e.abrupt("return", (0 === r.code ? t : n)(r));
                            case 5:
                            case "end":
                                return e.stop()
                        }
                    }, e)
                }));
                return function (e, t) {
                    return n.apply(this, arguments)
                }
            }())
        }
    }, {
        key: "setupUserInfo",
        value: function (i) {
            var o = this;
            return new Promise(function () {
                var n = _asyncToGenerator(_regeneratorRuntime().mark(function e(t, n) {
                    var r;
                    return _regeneratorRuntime().wrap(function (e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                if (i) {
                                    e.next = 2;
                                    break
                                }
                                return e.abrupt("return", n("action is required"));
                            case 2:
                                return r = "https://backend.gravity-engine.com/event_center/api/v1/event/tencent_sdk/?access_token=".concat(o.accessToken, "&client_id=").concat(o.appId), e.next = 5, o.sendNetWork(r, {
                                    postback_list: [{
                                        action: i
                                    }]
                                }, "post");
                            case 5:
                                return r = e.sent, e.abrupt("return", (0 === r.code ? t : n)(r));
                            case 7:
                            case "end":
                                return e.stop()
                        }
                    }, e)
                }));
                return function (e, t) {
                    return n.apply(this, arguments)
                }
            }())
        }
    }, {
        key: "queryDryRunInfo",
        value: function (i) {
            var o = this;
            return new Promise(function () {
                var n = _asyncToGenerator(_regeneratorRuntime().mark(function e(t, n) {
                    var r;
                    return _regeneratorRuntime().wrap(function (e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                return r = "".concat(i ? "&trace_id=".concat(i) : ""), r = "https://backend.gravity-engine.com/event_center/api/v1/event/postback_info/?access_token=".concat(o.accessToken, "&client_id=").concat(o.appId).concat(r), e.next = 4, o.sendNetWork(r, {}, "get");
                            case 4:
                                return r = e.sent, e.abrupt("return", (0 === r.code ? t : n)(r));
                            case 6:
                            case "end":
                                return e.stop()
                        }
                    }, e)
                }));
                return function (e, t) {
                    return n.apply(this, arguments)
                }
            }())
        }
    }, {
        key: "sendDryRunResult",
        value: function (i, o) {
            var a = this;
            return new Promise(function () {
                var n = _asyncToGenerator(_regeneratorRuntime().mark(function e(t, n) {
                    var r;
                    return _regeneratorRuntime().wrap(function (e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                if (i) {
                                    e.next = 2;
                                    break
                                }
                                return e.abrupt("return", n("traceId is required"));
                            case 2:
                                if (o) {
                                    e.next = 4;
                                    break
                                }
                                return e.abrupt("return", n("action is required"));
                            case 4:
                                return r = "https://backend.gravity-engine.com/event_center/api/v1/event/postback_info/?access_token=".concat(a.accessToken, "&client_id=").concat(a.appId), e.next = 7, a.sendNetWork(r, {
                                    postback_list: [{
                                        trace_id: i,
                                        action: o
                                    }]
                                }, "post");
                            case 7:
                                return r = e.sent, e.abrupt("return", (0 === r.code ? t : n)(r));
                            case 9:
                            case "end":
                                return e.stop()
                        }
                    }, e)
                }));
                return function (e, t) {
                    return n.apply(this, arguments)
                }
            }())
        }
    }, {
        key: "payEventToTencent",
        value: function (e) {
            this.sdk && (this.sdk.onPurchase(e), logger.tencentSdkLog("onPurchase"))
        }
    }, {
        key: "getDryRunPostBackInfo",
        value: (s = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
            var n, r, i;
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return n = {
                            click_company: "",
                            postback_list: [],
                            retry: 0
                        }, e.prev = 1, e.next = 4, this.queryDryRunInfo(t);
                    case 4:
                        if (r = e.sent, null !== (r = (null == r ? void 0 : r.data) || {}) && null != (i = r.postback_list) && i.length) return i = Number(null === r ? void 0 : r.retry) || n.retry, e.abrupt("return", {
                            postback_list: r.postback_list,
                            click_company: (null === r ? void 0 : r.click_company) || n.click_company,
                            retry: 0 <= i ? i : n.retry
                        });
                        e.next = 9;
                        break;
                    case 9:
                        return e.abrupt("return", n);
                    case 12:
                        return e.prev = 12, e.t0 = e.catch(1), e.abrupt("return", n);
                    case 15:
                    case "end":
                        return e.stop()
                }
            }, e, this, [
                [1, 12]
            ])
        })), function (e) {
            return s.apply(this, arguments)
        })
    }, {
        key: "_getIsDryRun",
        value: function () {
            var i = this;
            return new Promise(function () {
                var t = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
                    var n, r;
                    return _regeneratorRuntime().wrap(function (e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                return n = "https://backend.gravity-engine.com/event_center/api/v1/base/appconf/?access_token=".concat(i.accessToken, "&conf_type=dryrun_mode"), e.prev = 1, e.next = 4, i.sendNetWork(n, {}, "get");
                            case 4:
                                n = e.sent, r = 0 < (null == n || null == (r = n.data) || null == (r = r.dryrun_mode) ? void 0 : r.tencent), t(0 === n.code && r), e.next = 12;
                                break;
                            case 9:
                                e.prev = 9, e.t0 = e.catch(1), t(!1);
                            case 12:
                            case "end":
                                return e.stop()
                        }
                    }, e, null, [
                        [1, 9]
                    ])
                }));
                return function (e) {
                    return t.apply(this, arguments)
                }
            }())
        }
    }, {
        key: "_setDryRunValue",
        value: (a = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
            var n;
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (!this.sdk || Reflect.has(this.config.tencentSdkData, "enableDryRun")) return e.abrupt("return");
                        e.next = 2;
                        break;
                    case 2:
                        return e.next = 4, _.sleep(t);
                    case 4:
                        if (Reflect.has(this.config.tencentSdkData, "enableDryRun")) return e.abrupt("return");
                        e.next = 6;
                        break;
                    case 6:
                        return e.next = 8, this._getIsDryRun();
                    case 8:
                        n = e.sent, this.config.tencentSdkData.enableDryRun = n;
                    case 10:
                    case "end":
                        return e.stop()
                }
            }, e, this)
        })), function (e) {
            return a.apply(this, arguments)
        })
    }, {
        key: "tryDryRun",
        value: (o = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
            var n, r, i, o, a, s, c, u, l, p, f;
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (0 === (n = t.actionList).length) return e.abrupt("return");
                        e.next = 3;
                        break;
                    case 3:
                        return e.next = 5, _.sleep(1e3);
                    case 5:
                        return e.next = 7, this.getDryRunPostBackInfo("");
                    case 7:
                        o = e.sent, r = o.postback_list, i = o.retry, o = o.click_company, a = 0;
                    case 12:
                        if (0 === r.length && a < i) return s = 1e3 * a + 2e3, e.next = 16, _.sleep(s);
                        e.next = 24;
                        break;
                    case 16:
                        return e.next = 18, this.getDryRunPostBackInfo("");
                    case 18:
                        s = e.sent, r = s.postback_list, o = s.click_company, a++, e.next = 12;
                        break;
                    case 24:
                        if ("tencent" === o && r.length) {
                            e.next = 26;
                            break
                        }
                        return e.abrupt("return");
                    case 26:
                        c = _createForOfIteratorHelper(r);
                        try {
                            for (c.s(); !(u = c.n()).done;) "pay" === (l = u.value).action && n.includes("pay") ? (this.sdk.onPurchase(l.postback_value), logger.tencentSdkLog("onPurchase")) : "tutorial_finish" === l.action && n.includes("tutorial_finish") ? this.onTutorialFinishEvent() : "create_role" === l.action && n.includes("create_role") ? this.onCreateRoleEvent(l.role_name) : "re_active" === l.action && n.includes("re_active") ? (this.sdk.track("RE_ACTIVE", {
                                backFlowDay: l.re_active_day
                            }), logger.tencentSdkLog("track RE_ACTIVE")) : "register" === l.action && n.includes("register") && (this.sdk.onRegister(), logger.tencentSdkLog("onRegister"))
                        } catch (e) {
                            c.e(e)
                        } finally {
                            c.f()
                        }
                        p = r.filter(function (e) {
                            return n.includes(e.action)
                        }), f = "https://backend.gravity-engine.com/event_center/api/v1/event/postback_info/?access_token=".concat(this.accessToken, "&client_id=").concat(this.appId), this.sendNetWork(f, {
                            postback_list: p.map(function (e) {
                                return {
                                    trace_id: e.trace_id,
                                    action: e.action
                                }
                            })
                        }, "post");
                    case 31:
                    case "end":
                        return e.stop()
                }
            }, e, this)
        })), function (e) {
            return o.apply(this, arguments)
        })
    }, {
        key: "tryPayEventDryRun",
        value: (i = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (this.sdk) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.next = 4, this._setDryRunValue(200);
                    case 4:
                        this.config.tencentSdkData.enableDryRun ? this.tryDryRun({
                            actionList: ["pay"]
                        }) : (this.sdk.onPurchase(t), logger.tencentSdkLog("onPurchase"));
                    case 5:
                    case "end":
                        return e.stop()
                }
            }, e, this)
        })), function (e) {
            return i.apply(this, arguments)
        })
    }, {
        key: "tryTutorialFinishEventDryRun",
        value: (r = _asyncToGenerator(_regeneratorRuntime().mark(function e() {
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (this.sdk) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.next = 4, this._setDryRunValue(200);
                    case 4:
                        this.config.tencentSdkData.enableDryRun ? this.tryDryRun({
                            actionList: ["tutorial_finish"]
                        }) : this.onTutorialFinishEvent();
                    case 5:
                    case "end":
                        return e.stop()
                }
            }, e, this)
        })), function () {
            return r.apply(this, arguments)
        })
    }, {
        key: "tryCreateRoleEventDryRun",
        value: (t = _asyncToGenerator(_regeneratorRuntime().mark(function e(t) {
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (this.sdk) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.next = 4, this._setDryRunValue(200);
                    case 4:
                        this.config.tencentSdkData.enableDryRun ? this.tryDryRun({
                            actionList: ["create_role"]
                        }) : this.onCreateRoleEvent(t);
                    case 5:
                    case "end":
                        return e.stop()
                }
            }, e, this)
        })), function (e) {
            return t.apply(this, arguments)
        })
    }, {
        key: "tryRegisterEventDryRun",
        value: (e = _asyncToGenerator(_regeneratorRuntime().mark(function e() {
            return _regeneratorRuntime().wrap(function (e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (this.sdk) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.next = 4, this._setDryRunValue(200);
                    case 4:
                        this.config.tencentSdkData.enableDryRun ? this.tryDryRun({
                            actionList: ["register"]
                        }) : this.tencentSDKRegisterTrack();
                    case 5:
                    case "end":
                        return e.stop()
                }
            }, e, this)
        })), function () {
            return e.apply(this, arguments)
        })
    }, {
        key: "onUpdateLevelEvent",
        value: function (e, t) {
            this.sdk && (this.sdk.track("UPDATE_LEVEL", {
                level: e,
                power: t
            }), logger.tencentSdkLog("track UPDATE_LEVEL")), this.track("$UpdateLevel", {
                $user_level: e,
                $user_power: t
            })
        }
    }, {
        key: "onUpdateLevelEventWithParams",
        value: function (e, t, n) {
            this.sdk && (this.sdk.track("UPDATE_LEVEL", {
                level: e,
                power: t
            }), logger.tencentSdkLog("track UPDATE_LEVEL"));
            e = {
                $user_level: e,
                $user_power: t
            };
            _.isObject(n) && !_.isEmptyObject(n) && Object.assign(e, n), this.track("$UpdateLevel", e)
        }
    }, {
        key: "onRegisterEvent",
        value: function () {
            this.sdk && (this.sdk.onRegister(), logger.tencentSdkLog("onRegister")), this.registerEvent()
        }
    }, {
        key: "onCreateRoleEvent",
        value: function (e) {
            this.sdk && (this.sdk.onCreateRole(e), logger.tencentSdkLog("onCreateRole")), this.track("$CreateRole", {
                $role_name: e
            })
        }
    }, {
        key: "onCreateRoleEventWithParams",
        value: function (e, t) {
            this.sdk && (this.sdk.onCreateRole(e), logger.tencentSdkLog("onCreateRole"));
            e = {
                $role_name: e
            };
            _.isObject(t) && !_.isEmptyObject(t) && Object.assign(e, t), this.track("$CreateRole", e)
        }
    }, {
        key: "onTutorialFinishEvent",
        value: function () {
            this.sdk && (this.sdk.onTutorialFinish(), logger.tencentSdkLog("onTutorialFinish")), this.track("$TutorialFinish", {})
        }
    }, {
        key: "onTutorialFinishEventWithParams",
        value: function (e) {
            this.sdk && (this.sdk.onTutorialFinish(), logger.tencentSdkLog("onTutorialFinish"));
            var t = {};
            _.isObject(e) && !_.isEmptyObject(e) && Object.assign(t, e), this.track("$TutorialFinish", t)
        }
    }, {
        key: "onViewMallContentEvent",
        value: function () {
            this.sdk && (this.sdk.track("VIEW_CONTENT", {
                item: "Mall"
            }), logger.tencentSdkLog("track VIEW_CONTENT Mall")), this.track("$ViewMallContent", {})
        }
    }, {
        key: "onViewMallContentEventWithParams",
        value: function (e) {
            this.sdk && (this.sdk.track("VIEW_CONTENT", {
                item: "Mall"
            }), logger.tencentSdkLog("track VIEW_CONTENT Mall"));
            var t = {};
            _.isObject(e) && !_.isEmptyObject(e) && Object.assign(t, e), this.track("$ViewMallContent", t)
        }
    }, {
        key: "onViewActivityContentEvent",
        value: function () {
            this.sdk && (this.sdk.track("VIEW_CONTENT", {
                item: "Activity"
            }), logger.tencentSdkLog("track VIEW_CONTENT Activity")), this.track("$ViewActivityContent", {})
        }
    }, {
        key: "onViewActivityContentEventWithParams",
        value: function (e) {
            this.sdk && (this.sdk.track("VIEW_CONTENT", {
                item: "Activity"
            }), logger.tencentSdkLog("track VIEW_CONTENT Activity"));
            var t = {};
            _.isObject(e) && !_.isEmptyObject(e) && Object.assign(t, e), this.track("$ViewActivityContent", t)
        }
    }, {
        key: "onAddToWishListEvent",
        value: function () {
            this.sdk && (this.sdk.track("ADD_TO_WISHLIST", {
                type: 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : "default"
            }), logger.tencentSdkLog("track ADD_TO_WISHLIST")), this.track("$MPAddFavorites", {
                $url_path: ""
            })
        }
    }, {
        key: "onAddToWishListEventWithParams",
        value: function (e, t) {
            this.sdk && (this.sdk.track("ADD_TO_WISHLIST", {
                type: e || "default"
            }), logger.tencentSdkLog("track ADD_TO_WISHLIST"));
            e = {
                $url_path: ""
            };
            _.isObject(t) && !_.isEmptyObject(t) && Object.assign(e, t), this.track("$MPAddFavorites", e)
        }
    }, {
        key: "onShareEvent",
        value: function (e) {
            this.sdk && (this.sdk.track("SHARE", {
                target: e
            }), logger.tencentSdkLog("track SHARE")), this.track("$MPShare", {
                $share_depth: 1,
                $share_method: "转发消息卡片",
                $share_target: e
            })
        }
    }, {
        key: "onShareEventWithParams",
        value: function (e, t) {
            this.sdk && (this.sdk.track("SHARE", {
                target: e
            }), logger.tencentSdkLog("track SHARE"));
            e = {
                $share_depth: 1,
                $share_method: "转发消息卡片",
                $share_target: e
            };
            _.isObject(t) && !_.isEmptyObject(t) && Object.assign(e, t), this.track("$MPShare", e)
        }
    }]), n
}();
tt.GravityEngineAPI = GravityEngineAPI;