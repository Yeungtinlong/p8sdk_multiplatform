mergeInto(LibraryManager.library, {
    P8Log: function (message) {
        console.log(UTF8ToString(message));
    },

    UnityCallJsAsync: function (msg) {
        globalThis.GameGlobal.P8Utils.UnityCallJsAsync(UTF8ToString(msg));
    },

    UnityCallJsSync: function (msg) {
    }
});