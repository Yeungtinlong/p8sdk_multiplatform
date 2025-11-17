using System;

namespace P8SDKWeChat
{
    public enum PayResultType : int
    {
        /// <summary>
        /// 支付成功
        /// </summary>
        Success = 0,

        /// <summary>
        /// 支付失败/用户取消支付
        /// </summary>
        Fail = 1,
    }
    
    public struct PayResult
    {
        public PayResultType result;
    }
    
    public struct PayOption
    {
        public string roleid; // 角色ID
        public string rolename; // 角色名
        public string cp_order_id; // 订单号 后期对账使用 每笔订单号唯一
        public string serverid; // 服务器ID
        public string productid; // 商品ID
        public string product_name; // 商品名
        public string ext; // 透传字段，由CP定义的字段
        public string mdsVersion; // 米大师版本 默认2.0  1.0版本需要传入这个值
        public string env; // 正式环境：0;沙盒环境 ：1
        public string money; // 付款金额，单位：CNY
        public string level; //玩家等级
        public string test; //1为测试订单(测试回调地址);0为正式订单(正式回调地址);不传默认为0
        public Action<PayResult> callback;
    }
}