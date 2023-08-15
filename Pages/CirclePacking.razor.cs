using blazor_viz_d3_zoom.Data;
using blazor_viz_d3_zoom.Extensions;
using blazor_viz_d3_zoom.Shared;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;
using System.Text.Json;

namespace blazor_viz_d3_zoom.Pages
{
    [Route("/circle-packing")]
    public sealed partial class CirclePacking : ComponentBase, IAsyncDisposable
    {
        [CascadingParameter] Error Error { get; set; } = default!;
        [Inject] IJSRuntime _JSRuntime { get; set; } = default!;
        private IJSObjectReference _Module = default!;
        private Element _Element = new Element();
        private int _Value = 0;
        private int _Height = 0;
        private int _Width = 0;
        private bool _Visible = false;
        public sealed class BrowserDimmensions
        {
            public int Width { get; set; } = default!;
            public int Height { get; set; } = default!;
        }
        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                try
                {
                    // Get the current object reference.
                    var thisObjectRef = DotNetObjectReference.Create(this);
                    _Module = await _JSRuntime.ComponentModule<CirclePacking>();
                    await _Module.InvokeVoidAsync("init", thisObjectRef);

                    // Capture browser window inner dimmensions.
                    // this will be used to calculate  the center and use that as the initial point of distributions
                    var wndDimm = await _Module.InvokeAsync<BrowserDimmensions>("browserDimmensions");
                    _Height = wndDimm.Height;
                    _Width = wndDimm.Width;                    
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        private void onClickUpdate(MouseEventArgs args)
        {
            _Visible = !_Visible;
            StateHasChanged(); 
        }


        [JSInvokable("OnSelectedPoint")]
        public void OnSelectedPoint(Element arg)
        {
            if (arg is not null)
            {
                try
                {
                    _Element = arg; //JsonSerializer.Deserialize<Element>(arg);
                    _Visible = true;
                    StateHasChanged();
                }
                catch (Exception ex)
                {
                    Error.ProcessError(ex);
                    throw;
                }
            }
        }

        private async Task<List<double[]>> DataGenerator(int args)
        {

            double radius = 6;
            double step = radius * 2;
            double theta = Math.PI * (3 - Math.Sqrt(5));

            var data = new List<double[]>();

            for (int i = 0; i < args; i++)
            {
                radius = step * Math.Sqrt(i + 0.5);
                double a = theta * i;
                data.Add(new double[] {
                    _Width / 2 + radius * Math.Cos(a),
                    _Height / 2 + radius * Math.Sin(a)
                });
            }

            return data;
        }
        public void OffCanvasOnClosed(bool args)
        {
            _Visible = args;
            StateHasChanged();
        }
        private void onClickZoomIn(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickZoomIn");
        private void onClickZoomOut(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickZoomOut");

        private void onClickZoomRandom(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickzoomRandom");

        private void onClickZoomReset(MouseEventArgs args) => _Module.InvokeVoidAsync("onclickzoomReset");
        private async Task onChangeValue(ChangeEventArgs arg)
        {
            if (arg is not null && arg.Value is not null)
            {
                int value = int.Parse(arg.Value.ToString()); 
                if (value > 0)
                {
                    var dataset = await DataGenerator(value);
                    await _Module.InvokeAsync<List<double[]>>("addDataSet", dataset);

                    _Value = value;
                }
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
