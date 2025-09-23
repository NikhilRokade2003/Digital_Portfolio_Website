using System;
using System.Threading.Tasks;
using DigitalPortfolioBackend.Models;
using DigitalPortfolioBackend.Data;
using Microsoft.EntityFrameworkCore;

namespace DigitalPortfolioBackend.Services
{
    public class PDFGeneratorService
    {
        private readonly AppDbContext _context;
        private readonly ProfessionalPDFGenerator _professionalPdfGenerator;

        public PDFGeneratorService(AppDbContext context, ProfessionalPDFGenerator professionalPdfGenerator)
        {
            _context = context;
            _professionalPdfGenerator = professionalPdfGenerator;
        }

        public async Task<byte[]> GeneratePortfolioPDF(int portfolioId)
        {
            try
            {
                Console.WriteLine($"Generating professional PDF for portfolio ID: {portfolioId}");
                return await _professionalPdfGenerator.GeneratePortfolioPDF(portfolioId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GeneratePortfolioPDF error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}