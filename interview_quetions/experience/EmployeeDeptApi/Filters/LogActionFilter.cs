using Microsoft.AspNetCore.Mvc.Filters;

namespace EmployeeDeptApi.Filters
{
    // Action Filter: runs just before/after an action method executes (MVC pipeline),
    // as opposed to middleware which wraps the whole HTTP pipeline.
    public class LogActionFilter : IActionFilter
    {
        private readonly ILogger<LogActionFilter> _logger;

        public LogActionFilter(ILogger<LogActionFilter> logger)
        {
            _logger = logger;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            _logger.LogInformation("Executing action {Action} with arguments: {@Arguments}",
                context.ActionDescriptor.DisplayName, context.ActionArguments);
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            _logger.LogInformation("Executed action {Action}, result type: {ResultType}",
                context.ActionDescriptor.DisplayName, context.Result?.GetType().Name);
        }
    }
}
