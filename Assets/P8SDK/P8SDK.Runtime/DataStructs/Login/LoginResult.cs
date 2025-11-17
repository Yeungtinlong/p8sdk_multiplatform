namespace P8SDKWeChat
{
    public struct LoginResult
    {
        public string session_key;
        public string sign;
        public string time;

        /// <summary>
        /// 用户ID
        /// </summary>
        public string uid;

        /// <summary>
        /// 用户名
        /// </summary>
        public string account;

        /// <summary>
        /// 密码
        /// </summary>
        public string password;

        /// <summary>
        /// 0-正式
        /// 1-QQ登录
        /// 2-微信登录
        /// 3-临时
        /// </summary>
        public string istemp;

        public string sessionid;

        /// <summary>
        /// 过期时间
        /// </summary>
        public string sessiontime;

        /// <summary>
        /// 场景值：用户来源
        /// 场景值说明：https://developers.weixin.qq.com/miniprogram/dev/reference/scene-list.html
        /// </summary>
        public string scene;

        /// <summary>
        /// openid 按需使用
        /// </summary>
        public string openid;
    }
}