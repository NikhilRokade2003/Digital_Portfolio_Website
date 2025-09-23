using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalPortfolioBackend.Models
{
	public enum NotificationType
	{
		AccessRequested = 0,
		AccessApproved = 1,
		AccessRejected = 2,
		PortfolioViewed = 3
	}

	public class Notification
	{
		[Key]
		public int Id { get; set; }

		// Recipient user (who sees this notification)
		public int UserId { get; set; }

		[ForeignKey("UserId")]
		public required User User { get; set; }

		public NotificationType Type { get; set; }

		[MaxLength(200)]
		public required string Title { get; set; }

		[MaxLength(1000)]
		public string? Message { get; set; }

		public bool IsRead { get; set; } = false;

		// Optional association to portfolio/access request
		public int? PortfolioId { get; set; }

		public int? AccessRequestId { get; set; }

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	}
}



