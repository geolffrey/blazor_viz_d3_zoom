I have been closely monitoring the evolution of Blazor and have been actively involved in creating robust applications. These posts aim not only to share my techniques, strategies, and patterns with the community but also to have fun with two exciting technologies: Blazor and D3js.

To enhance your reading experience, some experience with Blazor and D3js is required. While many of the techniques discussed here are advanced, they are accessible to all audiences. 

For those who are new to Blazor, I recommend starting with these essential resources:
* [Build beautiful web apps with Blazor](https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor)
* [Awesome Blazor](https://github.com/AdrienTorris/awesome-blazor)

If you are seeking familiarity with D3js, the best starting point is:
* [D3 on Observable](https://d3js.org/)

I acknowledge that some of you might believe that D3js is obsolete. However, I strongly advise reconsidering this perception by exploring its current state. D3js remains the foundation for numerous visualization tools and frameworks that hold prominence today, and it's the underlying technology concealed behind paywalls or presented as pre-packaged solutions. Another potential objection could be the availability of tools like Tableau and Power BI, which offer exceptional out-of-the-box solutions. Nevertheless, they might not have it all. Those engaged in data visualization and analytics will inevitably encounter the necessity to acquaint themselves with D3js sooner or later.

The core aim of this initial post revolves around crafting a Blazor WebAssembly application. This endeavor serves as the foundation upon which subsequent series posts will build.

We'll commence by crafting a Blazor WebAssembly version, eschewing the hosted variant for simplicity. This approach offers the advantage of deploying it later as static content on GitHub Pages (github.io), as a convenience for those who want free hosting.

Assuming you already have a functional iteration of the recently developed Blazor WebAssembly app, proceed as follows.

In terms of personal preference, the arrangement of your JavaScript assets is a matter of choice. Personally, I find it convenient to house both third-party and custom libraries within a designated directory titled **lib**. Meanwhile, for JavaScript code pertinent to the application itself for global purposes, I tend to organize it within an **js** folder. *See the picture below.*

![wwwwroor folder structure](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vte4fuxa7pieo78ze3kx.png)

In the case of the Blazor component, starting from NET 6, it's possible to place the JavaScript file alongside the Razor component. It's important to note that this organizational structure serves as a means of maintaining tidiness. This practice facilitates ease of access. It's worth mentioning that during the publish or build process, these file locations will naturally change to the framework's and deployment environment's specific requirements. *See the picture below*.

![component folder structure](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gjz21f30gtwtr3q6l6cb.png)

Now that we have the boilerplate of the file structure let us add a new component. Again for simplicity, we will add the component to the default **Page** folder, naming it *CirclePacking*. I prefer to use a code-behind approach since this helps me to keep the code clean.


```
namespace blazor_viz_d3_zoom.Pages
{
    // Route("/circle-packing") is the same as 
    // the directive '@page /circle-packing' at 
    // the begining of the razor file.
    // This is a personal preference, and for some a bad practice,
    // a hidden magic, to some extent they are righ, my rationality
    // is keeping my HTML and razor code clean


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
        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            if (firstRender)
            {
                try
                {
                    // Get the current object reference.
                    // This is "the key" to this class methods
                    // This reference will be used for JavaScript
                    // methods that call NET methods

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


        [JSInvokable("OnSelectedFeature")]
        public void OnSelectedFeature(Element arg)
        {
            if (arg is not null)
            {
                try
                {
                    _Element = arg; 
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

    // For the purpose of this application
    // favoring simplicity I will keep
    // this class in this file and namespace
    // anyway, this will be used in this context only
    // We will work on it later.
    public sealed class BrowserDimmensions
    {
        public int Width { get; set; } = default!;
        public int Height { get; set; } = default!;
    }
}

```
