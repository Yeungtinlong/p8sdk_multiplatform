using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;

namespace P8SDK.Editor
{
    public sealed class WXPlatform : AbstractPlatform
    {
        private static readonly string _templateDirPath = Path.Combine("WX-WASM-SDK-V2", "Runtime", "wechat-default");
        private static readonly string _sdkFileName = "800sdkwxggk251020.js";

        public override string PlatformName => "WX";

        public override List<string> BackupDirsRelateToAssetsPath => new List<string>()
        {
            "WX-WASM-SDK-V2",
            "WebGLTemplates",
        };

        public override List<PathPair> CopyFilesRelateToAssetsPathWhenOn => new List<PathPair>()
        {
            new PathPair(
                $"{Path.Combine("P8SDK", "SDKScripts", _sdkFileName)}",
                $"{Path.Combine(_templateDirPath, _sdkFileName)}"
            ),
            new PathPair(
                $"{Path.Combine("P8SDK", "SDKScripts", "p8sdk-wechat-bridge.js")}",
                $"{Path.Combine(_templateDirPath, "p8sdk-wechat-bridge.js")}"
            ),
        };

        public override bool Init()
        {
            CopyFiles();
            if (!WriteRequireToGameFile())
                return false;
            PlayerSettings.WebGL.template = "PROJECT:WXTemplate2022";
            P8SDKEditorTools.ReplaceP8SDKMarco("P8SDKPanelUI.cs", "WX");
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            return true;
        }

        private bool WriteRequireToGameFile()
        {
            string gameFilePath = Path.Combine(FileUtils.GetAssetsPath(), _templateDirPath, "game.js");
            if (!File.Exists(gameFilePath))
            {
                Debug.LogError("game.js文件不存在，WXSDK内容缺失，请删除并重新导入。");
                return false;
            }

            string gamejsContent = File.ReadAllText(gameFilePath);
            if (!gamejsContent.Contains("require('./p8sdk');"))
            {
                File.WriteAllText(gameFilePath, $"require('./p8sdk');\n{gamejsContent}");
            }

            StringBuilder requires = new StringBuilder();
            foreach (var sdkFilePath in CopyFilesRelateToAssetsPathWhenOn)
            {
                requires.Append($"require('./{Path.GetFileName(sdkFilePath.to)}');\n");
            }

            // 创建p8sdk.js，require其它所有p8sdk相关的文件
            File.WriteAllText(Path.Combine(FileUtils.GetAssetsPath(), _templateDirPath, "p8sdk.js"), requires.ToString());
            return true;
        }
    }
}