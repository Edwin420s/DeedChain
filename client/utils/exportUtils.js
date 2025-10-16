import { utils, write } from 'xlsx'

// Export utilities for data export functionality
export const exportUtils = {
  // Export to CSV
  toCSV: (data, filename = 'export.csv') => {
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Handle special characters and commas
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    downloadFile(csvContent, filename, 'text/csv')
  },

  // Export to JSON
  toJSON: (data, filename = 'export.json') => {
    const jsonContent = JSON.stringify(data, null, 2)
    downloadFile(jsonContent, filename, 'application/json')
  },

  // Export to Excel
  toExcel: (data, filename = 'export.xlsx', sheetName = 'Data') => {
    const worksheet = utils.json_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, sheetName)
    
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    downloadBlob(blob, filename)
  },

  // Export to PDF (simplified - would use a PDF library in production)
  toPDF: (data, filename = 'export.pdf') => {
    // This is a simplified version. In production, use a library like jsPDF
    const content = `
      <html>
        <head>
          <title>DeedChain Export</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>DeedChain Data Export</h1>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    
    const blob = new Blob([content], { type: 'application/pdf' })
    downloadBlob(blob, filename)
  },

  // Format property data for export
  formatPropertyData: (properties) => {
    return properties.map(property => ({
      'Token ID': property.tokenId,
      'Location': property.location,
      'Area (acres)': property.area,
      'Survey Number': property.surveyNumber,
      'Status': property.status,
      'Owner': property.owner,
      'Registered Date': new Date(property.registeredAt).toLocaleDateString(),
      'Verified': property.verified ? 'Yes' : 'No',
      'Coordinates': property.coordinates ? 
        `${property.coordinates.lat}, ${property.coordinates.lng}` : 'N/A',
      'IPFS Hash': property.ipfsHash || 'N/A'
    }))
  },

  // Format transaction data for export
  formatTransactionData: (transactions) => {
    return transactions.map(tx => ({
      'Transaction Hash': tx.txHash,
      'Type': tx.type,
      'Block Number': tx.blockNumber,
      'Timestamp': new Date(tx.timestamp).toLocaleString(),
      'From': tx.from,
      'To': tx.to,
      'Gas Used': tx.gasUsed,
      'Gas Price': tx.gasPrice,
      'Status': tx.status,
      'Property ID': tx.property?.tokenId || 'N/A',
      'Property Location': tx.property?.location || 'N/A'
    }))
  }
}

// Helper functions
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Batch export functionality
export const batchExport = {
  // Export multiple datasets
  exportMultiple: (datasets, format = 'zip') => {
    if (format === 'zip') {
      // In production, use a library like JSZip
      console.log('Batch export would create a ZIP file with:', datasets)
      alert('Batch export feature would create a ZIP file with all selected data')
    } else {
      // Export individually
      datasets.forEach(({ data, filename, type }) => {
        switch (type) {
          case 'properties':
            exportUtils.toCSV(exportUtils.formatPropertyData(data), filename)
            break
          case 'transactions':
            exportUtils.toCSV(exportUtils.formatTransactionData(data), filename)
            break
          default:
            exportUtils.toCSV(data, filename)
        }
      })
    }
  },

  // Create export template
  createTemplate: (type) => {
    const templates = {
      property: [
        'location',
        'area',
        'surveyNumber',
        'coordinates_lat',
        'coordinates_lng',
        'description'
      ],
      transaction: [
        'type',
        'recipient',
        'propertyId',
        'amount'
      ]
    }

    const template = templates[type] || []
    const csvContent = template.join(',')
    downloadFile(csvContent, `template_${type}.csv`, 'text/csv')
  }
}