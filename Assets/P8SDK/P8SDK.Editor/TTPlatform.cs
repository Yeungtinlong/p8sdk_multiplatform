using System.Collections.Generic;
using System.IO;
using UnityEditor;

namespace P8SDK.Editor
{
    public sealed class TTPlatform : AbstractPlatform
    {
        public override string PlatformName => "TT";

        public override List<string> BackupDirsRelateToAssetsPath => new List<string>()
        {
            $"{Path.Combine("Plugins", "ByteGame")}",
        };

        public override List<PathPair> CopyFilesRelateToAssetsPathWhenOn => new List<PathPair>()
        {
            new PathPair(
                $"{Path.Combine("P8SDK", "SDKScripts", "p8sdk-tt.js")}",
                $"{Path.Combine("StreamingAssets", "__cp_js_files", "p8sdk-tt.js")}"
            ),
            new PathPair(
                $"{Path.Combine("P8SDK", "SDKScripts", "p8sdk-tt-bridge.js")}",
                $"{Path.Combine("StreamingAssets", "__cp_js_files", "p8sdk-tt-bridge.js")}"
            ),
        };

        public override List<string> DeleteFilesRelateToAssetsPathWhenOff => new List<string>()
        {
            $"{Path.Combine("StreamingAssets", "__cp_js_files", "p8sdk-tt.js")}",
            $"{Path.Combine("StreamingAssets", "__cp_js_files", "p8sdk-tt-bridge.js")}"
        };

        public override bool Init()
        {
            CopyFiles();
            PlayerSettings.WebGL.template = "APPLICATION:Default";
            P8SDKEditorTools.ReplaceP8SDKMarco("P8SDKPanelUI.cs", "TT");
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            return true;
        }
    }
}