namespace P8SDKWeChat
{
    public struct LevelUpgradeOption
    {
        /// <summary>
        /// 关卡
        /// </summary>
        public string level;
        
        /// <summary>
        /// "0" 进入关卡
        /// "1" 通关成功
        /// "3" 通关失败
        /// "4" 中途退出
        /// </summary>
        public string level_status;
    }
}