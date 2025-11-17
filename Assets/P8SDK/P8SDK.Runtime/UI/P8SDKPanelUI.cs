using LitJson;
using UnityEngine;
using UnityEngine.UI;

namespace P8SDKWeChat.UI
{
    public class P8SDKPanelUI : MonoBehaviour
    {
        [SerializeField] private Button _loginButton;

        [SerializeField] private Button _payButton;

        [SerializeField] private Button _onActiveFuncButton;
        [SerializeField] private Button _pushLoginDataButton;
        [SerializeField] private Button _upgradeRecordButton;
        [SerializeField] private Button _signLogButton;
        [SerializeField] private Button _levelUpgradeButton;
        [SerializeField] private Button _rewardedAdLogButton;
        [SerializeField] private Button _tutorialFinishButton;

        [SerializeField] private Button _adInitButton;
        [SerializeField] private Button _rewardedAdShowButton;
        [SerializeField] private Button _interstitialAdShowButton;
        [SerializeField] private Button _bannerAdShowButton;
        [SerializeField] private Button _bannerAdHideButton;
        [SerializeField] private Button _customAdShowButton;
        [SerializeField] private Button _customAdHideButton;
        [SerializeField] private Button _customAdOnCloseButton;

        // [SerializeField] private Button _gotoMiniProgramButton;

        public void Awake()
        {
            _loginButton.onClick.AddListener(LoginButton_OnClick);

            _payButton.onClick.AddListener(PayButton_OnClick);

            _onActiveFuncButton.onClick.AddListener(OnActiveFuncButton_OnClick);
            _pushLoginDataButton.onClick.AddListener(PushLoginDataButton_OnClick);
            _upgradeRecordButton.onClick.AddListener(UpgradeRecordButton_OnClick);
            _signLogButton.onClick.AddListener(SignLogButton_OnClick);
            _levelUpgradeButton.onClick.AddListener(LevelUpgradeButton_OnClick);
            _rewardedAdLogButton.onClick.AddListener(RewardedAdLogButton_OnClick);
            _tutorialFinishButton.onClick.AddListener(TutorialFinishButton_OnClick);

            _adInitButton.onClick.AddListener(AdInitButton_OnClick);
            _rewardedAdShowButton.onClick.AddListener(RewardedAdShowButton_OnClick);
            _interstitialAdShowButton.onClick.AddListener(InterstitialAdShowButton_OnClick);
            _bannerAdShowButton.onClick.AddListener(BannerAdShowButton_OnClick);
            _bannerAdHideButton.onClick.AddListener(BannerAdHideButton_OnClick);
            _customAdShowButton.onClick.AddListener(CustomAdShowButton_OnClick);
            _customAdHideButton.onClick.AddListener(CustomAdHideButton_OnClick);
            _customAdOnCloseButton.onClick.AddListener(CustomAdOnCloseButton_OnClick);

            // _gotoMiniProgramButton.onClick.AddListener(GotoMiniProgramButton_OnClick);
        }


        private void TutorialFinishButton_OnClick()
        {
            P8SDK.TutorialFinish(new TutorialFinishOption()
            {
                sid = "test_sid",
                uid = "test_uid",
            });
        }

        private void LoginButton_OnClick()
        {
            P8SDK.Login(new LoginOption()
            {
                success = res => P8SDK.Log($"login success: {JsonMapper.ToJson(res)}"),
                fail = res => P8SDK.Log($"login fail: {JsonMapper.ToJson(res)}"),
            });
        }

        private void PayButton_OnClick()
        {
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
        }

        private void OnActiveFuncButton_OnClick()
        {
            P8SDK.OnActiveFunc(new GeneralCallbackOption()
            {
                success = () => P8SDK.Log($"OnActiveFunc success"),
                fail = res => P8SDK.Log($"OnActiveFunc fail: {JsonMapper.ToJson(res)}"),
            });
        }

        private void PushLoginDataButton_OnClick()
        {
            P8SDK.PushLoginData(new PushLoginDataOption()
            {
                sid = "test_sid",
                level = "10",
                onlinetime = "9999",
                roleid = "test_roleid",
                rolename = "test_rolename",
                username = "test_username",
                vip = "9999",
                success = () => P8SDK.Log($"PushLoginData success."),
                fail = res => P8SDK.Log($"PushLoginData fail: {JsonMapper.ToJson(res)}"),
            });
        }

        private void UpgradeRecordButton_OnClick()
        {
            P8SDK.UpgradeRecord(new UpgradeRecordOption()
            {
                level = "1",
                oaid = "test_oaid",
                onlinetime = "9999",
                roleid = "test_roleid",
                rolename = "test_rolename",
                sid = "test_sid",
                vip = "9999",
                success = () => P8SDK.Log($"UpgradeRecord success."),
                fail = res => P8SDK.Log($"UpgradeRecord fail: {JsonMapper.ToJson(res)}"),
            });
        }

        private void SignLogButton_OnClick()
        {
            P8SDK.SignLog(new SignLogOption()
            {
                level = "9999",
                roleid = "test_roleid",
                rolename = "test_rolename",
                sid = "test_sid",
                success = () => P8SDK.Log($"SignLog success."),
                fail = res => P8SDK.Log($"SignLog fail: {JsonMapper.ToJson(res)}"),
            });
        }

        private void LevelUpgradeButton_OnClick()
        {
            P8SDK.LevelUpgrade(new LevelUpgradeOption()
            {
                level = "9999",
                level_status = "1",
            });
        }

        private void RewardedAdLogButton_OnClick()
        {
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
                ad_position = "test_ad_position",
                success = () => P8SDK.Log("RewardedAdLog success."),
                fail = (res) => P8SDK.Log($"RewardedAdLog fail {JsonMapper.ToJson(res)}"),
            });
        }

        private void AdInitButton_OnClick()
        {
            P8SDK.AdInit(new AdInitOption()
            {
                rewardedAdInitOption = new RewardedAdInitOption()
                {
                    adUnitId = "adunit-646d6e72bf2e9d2f",
                },
            });
        }

        private void RewardedAdShowButton_OnClick()
        {
            P8SDK.RewardedAdShow(new RewardedAdShowOption()
            {
                success = () => P8SDK.Log($"RewardedAdShow success."),
                close = () => P8SDK.Log($"RewardedAdShow close."),
                fail = res => P8SDK.Log($"RewardedAdShow fail: {JsonMapper.ToJson(res)}"),
                adPosition = "video_test_ad_position",
            });
        }

        private void InterstitialAdShowButton_OnClick()
        {
            P8SDK.InterstitialAdShow(new InterstitialAdShowOption()
            {
                adPosition = "scene_test_ad_position",
                close = () => P8SDK.Log($"InterstitialAdShow close."),
                fail = (res) => P8SDK.Log($"InterstitialAdShow fail {JsonMapper.ToJson(res)}."),
            });
        }

        private void BannerAdShowButton_OnClick()
        {
            P8SDK.BannerAdShow(new BannerAdShowOption()
            {
                adPosition = "banner_test_ad_position",
            });
        }

        private void BannerAdHideButton_OnClick()
        {
            P8SDK.BannerAdHide();
        }

        private void CustomAdShowButton_OnClick()
        {
            P8SDK.CustomAdShow(new CustomAdShowOption()
            {
                adPosition = "custom_test_ad_position",
            });
        }

        private void CustomAdHideButton_OnClick()
        {
            P8SDK.CustomAdHide();
        }

        private void CustomAdOnCloseButton_OnClick()
        {
            P8SDK.CustomAdOnClose(new GeneralCompleteCallbackOption()
            {
                complete = () => P8SDK.Log($"CustomAdOnClose complete."),
            });
        }

        private void GotoMiniProgramButton_OnClick()
        {
        }
    }
}