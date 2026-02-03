import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

class PDFExportService {
  // Generate HTML content for PDF
  generateTransactionsPDFHTML(transactions, categories, currency, userInfo) {
    const now = new Date();
    const dateString = now.toLocaleDateString();

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Group transactions by category
    const categoryTotals = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const catName = t.category_name || 'Uncategorized';
        categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
      });

    const categoryRows = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${currency}${amount.toFixed(2)}</td>
        </tr>
      `)
      .join('');

    // Transaction rows
    const transactionRows = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(t => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${t.date}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${t.type === 'income' ? 'Income' : 'Expense'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${t.category_name || '-'}</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; color: ${t.type === 'income' ? '#2ecc71' : '#e74c3c'}; font-weight: bold;">
            ${t.type === 'income' ? '+' : '-'}${currency}${t.amount.toFixed(2)}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 11px;">${t.tags || '-'}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            h1 {
              color: #3498db;
              border-bottom: 3px solid #3498db;
              padding-bottom: 10px;
            }
            h2 {
              color: #2c3e50;
              margin-top: 30px;
              border-bottom: 2px solid #ecf0f1;
              padding-bottom: 8px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .summary-box {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #3498db;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #dee2e6;
            }
            .summary-item:last-child {
              border-bottom: none;
            }
            .summary-label {
              font-weight: bold;
              color: #555;
            }
            .income {
              color: #2ecc71;
              font-weight: bold;
            }
            .expense {
              color: #e74c3c;
              font-weight: bold;
            }
            .balance {
              color: ${balance >= 0 ? '#2ecc71' : '#e74c3c'};
              font-size: 24px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th {
              background: #3498db;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            th:last-child,
            td:last-child {
              text-align: right;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #ecf0f1;
              text-align: center;
              color: #7f8c8d;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Prosper Budget Planner</h1>
            <p>Financial Report</p>
            <p style="color: #7f8c8d;">${userInfo?.email || 'User'} • Generated: ${dateString}</p>
          </div>

          <div class="summary-box">
            <h2>Financial Summary</h2>
            <div class="summary-item">
              <span class="summary-label">Total Income:</span>
              <span class="income">+${currency}${totalIncome.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total Expenses:</span>
              <span class="expense">-${currency}${totalExpenses.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Balance:</span>
              <span class="balance">${currency}${balance.toFixed(2)}</span>
            </div>
          </div>

          <h2>Expenses by Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows || '<tr><td colspan="2" style="text-align: center; padding: 20px;">No expenses recorded</td></tr>'}
            </tbody>
          </table>

          <h2>Transaction History</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows || '<tr><td colspan="5" style="text-align: center; padding: 20px;">No transactions recorded</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p>This report was generated by Prosper Budget Planner</p>
            <p>For more information, visit your app settings</p>
          </div>
        </body>
      </html>
    `;
  }

  // Export transactions to PDF
  async exportTransactionsToPDF(transactions, categories, currency, userInfo) {
    try {
      const html = this.generateTransactionsPDFHTML(transactions, categories, currency, userInfo);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `prosper_report_${date}.pdf`;

      // Move to a permanent location
      const newUri = FileSystem.documentDirectory + filename;
      await FileSystem.moveAsync({
        from: uri,
        to: newUri
      });

      return {
        success: true,
        uri: newUri,
        filename
      };
    } catch (error) {
      console.error('PDF export error:', error);
      throw error;
    }
  }

  // Share PDF file
  async sharePDF(uri) {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Financial Report'
        });
        return { success: true };
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('PDF sharing error:', error);
      throw error;
    }
  }

  // Export and share in one step
  async exportAndShare(transactions, categories, currency, userInfo) {
    try {
      const result = await this.exportTransactionsToPDF(transactions, categories, currency, userInfo);

      if (result.success) {
        await this.sharePDF(result.uri);
        return result;
      }

      return result;
    } catch (error) {
      console.error('Export and share error:', error);
      throw error;
    }
  }
}

export default new PDFExportService();
