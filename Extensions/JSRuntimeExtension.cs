using Microsoft.JSInterop;
using System.Text;


namespace blazor_viz_d3_zoom.Extensions
{
    public static class JSRuntimeExtension
    {
        public static async Task<IJSObjectReference> ComponentModule<T>(this IJSRuntime jsRuntime)
        {
            try 
            {
                var typeOf = typeof(T);
                var stringBuilder = new StringBuilder("./");
                stringBuilder.Append(typeOf.FullName?.Remove(0, typeOf.Assembly.GetName().Name.Length + 1).Replace(".", "/"));
                stringBuilder.Append(".razor.js");

                var result = await jsRuntime.InvokeAsync<IJSObjectReference>("import", stringBuilder.ToString());

                return result;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
