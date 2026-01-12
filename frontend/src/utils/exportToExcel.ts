import * as XLSX from 'xlsx'

interface ExportOptions {
  filename: string
  sheetName?: string
  includeHeaders?: boolean
}

/**
 * Exporta dados para arquivo Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions
) {
  try {
    const {
      filename,
      sheetName = 'Dados',
      includeHeaders = true,
    } = options

    // Criar worksheet a partir dos dados
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Ajustar largura das colunas automaticamente
    const cols = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      ) + 2,
    }))
    worksheet['!cols'] = cols

    // Criar workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const fullFilename = `${filename}_${timestamp}.xlsx`

    // Fazer download
    XLSX.writeFile(workbook, fullFilename)

    return { success: true, filename: fullFilename }
  } catch (error) {
    console.error('Erro ao exportar para Excel:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Exporta múltiplas abas para um único arquivo Excel
 */
export function exportMultipleSheets(
  sheets: Array<{ name: string; data: any[] }>,
  filename: string
) {
  try {
    const workbook = XLSX.utils.book_new()

    sheets.forEach(sheet => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data)
      
      // Ajustar largura das colunas
      if (sheet.data.length > 0) {
        const cols = Object.keys(sheet.data[0]).map(key => ({
          wch: Math.max(
            key.length,
            ...sheet.data.map(row => String(row[key] || '').length)
          ) + 2,
        }))
        worksheet['!cols'] = cols
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
    })

    const timestamp = new Date().toISOString().split('T')[0]
    const fullFilename = `${filename}_${timestamp}.xlsx`

    XLSX.writeFile(workbook, fullFilename)

    return { success: true, filename: fullFilename }
  } catch (error) {
    console.error('Erro ao exportar múltiplas abas:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Formata dados para exportação (remove campos desnecessários, formata datas, etc.)
 */
export function prepareDataForExport<T extends Record<string, any>>(
  data: T[],
  fieldsToRemove: string[] = ['id', 'createdAt', 'updatedAt'],
  dateFields: string[] = []
): any[] {
  return data.map(item => {
    const cleaned: any = {}

    Object.keys(item).forEach(key => {
      if (!fieldsToRemove.includes(key)) {
        let value = item[key]

        // Formatar datas
        if (dateFields.includes(key) && value) {
          value = new Date(value).toLocaleDateString('pt-BR')
        }

        // Formatar valores nulos
        if (value === null || value === undefined) {
          value = '-'
        }

        cleaned[key] = value
      }
    })

    return cleaned
  })
}
