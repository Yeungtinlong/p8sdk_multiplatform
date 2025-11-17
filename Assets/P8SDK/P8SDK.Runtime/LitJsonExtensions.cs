using LitJson;

namespace P8SDKWeChat
{
    public static class LitJsonExtensions
    {
        public static int ToInt(this JsonData jsonData, int defaultValue = 0)
        {
            if (jsonData.IsInt)
            {
                return (int)jsonData;
            }

            if (jsonData.IsString && int.TryParse(jsonData.ToString(), out int intValue))
            {
                return intValue;
            }

            return defaultValue;
        }

        public static double ToDouble(this JsonData jsonData, float defaultValue = 0)
        {
            if (jsonData.IsDouble)
            {
                return (double)jsonData;
            }

            if (jsonData.IsString && double.TryParse(jsonData.ToString(), out double doubleValue))
            {
                return doubleValue;
            }

            return defaultValue;
        }

        public static JsonData GetValueOrDefault(this JsonData jsonData, string key, JsonData defaultValue = null)
        {
            return jsonData.ContainsKey(key) ? jsonData[key] : defaultValue;
        }

        public static T ToObject<T>(this JsonData jsonData)
        {
            return JsonMapper.ToObject<T>(JsonMapper.ToJson(jsonData));
        }
    }
}