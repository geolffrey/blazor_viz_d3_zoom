using Microsoft.AspNetCore.Components;

namespace blazor_viz_d3_zoom.Shared
{
    public sealed partial class Error : ComponentBase
    {
        [Parameter] public RenderFragment ChildContent { get; set; } = default!;
        [Inject] ILogger<Error> Logger { get; set; } = default!;        

        public void ProcessError(Exception ex)
        {
            Logger.LogError("Error : ProcessError - Type: {Type} Message {Message}",ex.GetType(),ex.Message);
        }
    }
}
