using System;

namespace P8SDKWeChat
{
    public struct SignLogOption
    {
        /// <summary>
        /// 服务器Id
        /// </summary>
        public string sid;

        /// <summary>
        /// 角色Id
        /// </summary>
        public string roleid;

        /// <summary>
        /// 角色名
        /// </summary>
        public string rolename;

        /// <summary>
        /// 角色等级
        /// </summary>
        public string level;

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