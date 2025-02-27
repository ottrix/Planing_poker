using Microsoft.AspNetCore.Mvc;

namespace ScrumPoker.Server.Controllers
{
    public class RoomController : Controller
    {
        public IActionResult Index(string roomId)
        {
            // Przekierowanie do strony głównej aplikacji z parametrem roomId
            return Redirect($"/?roomId={roomId}");
        }
    }
}
