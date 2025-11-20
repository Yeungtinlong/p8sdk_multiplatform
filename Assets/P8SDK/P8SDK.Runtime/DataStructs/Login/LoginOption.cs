using System;

namespace P8SDKSpace
{
    public struct LoginOption
    {
        /// <summary>
        /// 成功回调
        /// </summary>
        public Action<LoginResult> success;

        /// <summary>
        /// 失败回调
        /// </summary>
        public Action<GeneralCallbackData> fail;
    }
}