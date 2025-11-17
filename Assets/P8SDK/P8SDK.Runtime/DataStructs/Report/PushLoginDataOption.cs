using System;

namespace P8SDKWeChat
{
    public struct PushLoginDataOption
    {
        /// <summary>
        /// 游戏服务器Id
        /// </summary>
        public string sid;

        /// <summary>
        /// 游戏角色ID
        /// </summary>
        public string roleid;

        /// <summary>
        /// 游戏角色名称
        /// </summary>
        public string rolename;

        /// <summary>
        /// 登录时角色等级
        /// </summary>
        public string level;

        /// <summary>
        /// vip等级
        /// </summary>
        public string vip;

        /// <summary>
        /// Play800 sdk 用户登录账号
        /// </summary>
        public string username;

        /// <summary>
        /// 角色累计在线时长（单位分钟）
        /// </summary>
        public string onlinetime;

        /// <summary>
        /// 成功回调
        /// </summary>
        public Action success;

        /// <summary>
        /// 失败回调
        /// </summary>
        public Action<GeneralCallbackData> fail;
    }
}