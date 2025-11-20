using System;

namespace P8SDKSpace
{
    public struct UpgradeRecordOption
    {
        /// <summary>
        /// 用户等级或者关卡
        /// </summary>
        public string level;

        /// <summary>
        /// 服务器id
        /// </summary>
        public string sid;

        /// <summary>
        /// 角色id
        /// </summary>
        public string roleid;

        /// <summary>
        /// 角色名
        /// </summary>
        public string rolename;

        /// <summary>
        /// vip等级 
        /// </summary>
        public string vip;

        /// <summary>
        /// 角色累计在线时间（单位分钟）
        /// </summary>
        public string onlinetime;

        /// <summary>
        /// 安卓必须传，获取不了传空，ios不传
        /// </summary>
        public string oaid;
    }
}