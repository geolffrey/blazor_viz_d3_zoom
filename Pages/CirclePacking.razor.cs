using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using blazor_viz_d3_zoom.Extensions;
using Microsoft.AspNetCore.Components.Web;
using System.Reflection;
using Microsoft.Extensions.Primitives;

namespace blazor_viz_d3_zoom.Pages
{
    [Route("/circle-packing")]
    public sealed partial class CirclePacking : ComponentBase, IAsyncDisposable
    {
        [Inject] IJSRuntime _JSRuntime { get; set; } = default!;
        private IJSObjectReference _Module = default!;

        private string value = "0";
        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                try
                {
                    _Module = await _JSRuntime.ComponentModule<CirclePacking>();
                    await _Module.InvokeVoidAsync("init");
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        private async Task onClickUpdate(MouseEventArgs args)
        {
            //height = 900;
            //width = 600;
            //radius = 6;
            //step = radius * 2;
            //theta = Math.PI * (3 - Math.Sqrt(5));

            //data = new List<double[]>();

            //for (int i = 0; i < 3000; i++)
            //{
            //    double radius = step * Math.Sqrt(i + 0.5);
            //    double a = theta * i;
            //    data.Add(new double[] {
            //        width / 2 + radius * Math.Cos(a),
            //        height / 2 + radius * Math.Sin(a)
            //    });
            //}
            await _Module.InvokeAsync<List<double[]>>("addDataSet", 2500);
        }
        private void onClickZoomIn(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickZoomIn");
        private void onClickZoomOut(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickZoomOut");

        private void onClickZoomRandom(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickzoomRandom");

        private void onClickZoomReset(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickzoomReset");
        private async Task onChangeValue(ChangeEventArgs val)
        {
            if (val is not null)
            {
                value = val.Value?.ToString();
                StateHasChanged();
                await _Module.InvokeAsync<List<double[]>>("addDataSet", int.Parse(value));
            }
        }
        async ValueTask IAsyncDisposable.DisposeAsync()
        {
            if (_Module is not null)
            {
                await _Module.InvokeVoidAsync("dispose");
                await _Module.DisposeAsync();
            }
        }
    }
}
