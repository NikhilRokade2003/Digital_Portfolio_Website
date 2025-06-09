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
        private readonly SimplePDFGenerator _simplePdfGenerator;

        public PDFGeneratorService(AppDbContext context, SimplePDFGenerator simplePdfGenerator)
        {
            _context = context;
            _simplePdfGenerator = simplePdfGenerator;
        }

        public async Task<byte[]> GeneratePortfolioPDF(int portfolioId)
        {
            try
            {
                Console.WriteLine($"Generating PDF for portfolio ID: {portfolioId}");
                return await _simplePdfGenerator.GeneratePortfolioPDF(portfolioId);
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