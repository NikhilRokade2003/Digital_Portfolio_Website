using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalPortfolioBackend.Models
{
	public enum AccessRequestStatus
	{
		Pending = 0,
		Approved = 1,
		Rejected = 2
	}

	public class AccessRequest
	{
		[Key]
		public int Id { get; set; }

		// Portfolio being requested
		public int PortfolioId { get; set; }

		[ForeignKey("PortfolioId")]
		public required Portfolio Portfolio { get; set; }

		// User who requests access
		public int RequesterUserId { get; set; }

		[ForeignKey("RequesterUserId")]
		public required User Requester { get; set; }

		// Owner who acts (derived from portfolio.UserId)
		public AccessRequestStatus Status { get; set; } = AccessRequestStatus.Pending;

		[MaxLength(500)]
		public string? Message { get; set; }

		[MaxLength(500)]
		public string? OwnerResponseNote { get; set; }

		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		public DateTime? DecidedAt { get; set; }
	}
}



