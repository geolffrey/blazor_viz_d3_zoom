using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using System.Reflection;
using System.Text;

namespace blazor_viz_d3_zoom
{
    public static class Extensions
    {        
        public static async Task<IJSObjectReference> ComponentModule<T>(this IJSRuntime js)
        {
            try
            {
                var typeOf = typeof(T);
                var stringBuilder = new StringBuilder("./js/");

                _ = stringBuilder.Append(typeOf.FullName.Remove(0, typeOf.Assembly.GetName().Name.Length + 1).Replace('.', '/'));
                stringBuilder.Append(".razor.js");

                var module = await js.InvokeAsync<IJSObjectReference>("import", stringBuilder.ToString());

                return module;
            }
            catch (Exception ex)
            {
                return null!; 
                throw;
            }
        }
    }
}
