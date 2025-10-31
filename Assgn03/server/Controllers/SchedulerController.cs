using Backend.DTOs;
using Backend.Services;  // Make sure this matches folder name exactly
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers  // folder 'Controllers'
{
    [ApiController]
    [Route("api/v1/projects/{projectId}/schedule")]
    public class SchedulerController : ControllerBase
    {
        private readonly SchedulerService _service;
        public SchedulerController(SchedulerService service) { _service = service; }

        [HttpPost]
        public ActionResult<ScheduleOutput> Post([FromBody] ScheduleInput input)
        {
            var result = _service.GetRecommendedOrder(input);
            return Ok(result);
        }
    }
}
