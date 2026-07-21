using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EmployeeDeptApi.Filters
{
    // Action Filter: short-circuits the pipeline with 400 Bad Request if ModelState is invalid,
    // so controller actions don't need to repeat "if (!ModelState.IsValid)" checks.
    public class ValidateModelFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                context.Result = new BadRequestObjectResult(context.ModelState);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
        }
    }
}
