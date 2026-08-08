namespace nondevhub_api.Models
{
    public class Permission
    {
        public int PermissionId { get; set; }
        public int UserId { get; set; }
        public string SystemId { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanAdd { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanApprove { get; set; }
        public bool CanReject { get; set; }

        public User? User { get; set; }
    }
}