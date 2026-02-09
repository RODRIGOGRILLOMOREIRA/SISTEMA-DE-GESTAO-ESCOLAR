import * as XLSX from 'xlsx-js-style';

interface ExportOptions {
  filename: string;
  sheetName?: string;
  data: any[];
  columns?: { header: string; key: string; width?: number }[];
}

/**
 * Exporta dados para Excel com estilização
 */
export const exportToExcel = ({
  filename,
  sheetName = 'Dados',
  data,
  columns,
}: ExportOptions) => {
  try {
    // Se não tiver colunas definidas, usar as chaves do primeiro objeto
    const cols = columns || Object.keys(data[0] || {}).map(key => ({
      header: key,
      key: key,
      width: 15,
    }));

    // Criar dados da planilha
    const worksheetData = [
      // Cabeçalho
      cols.map(col => col.header),
      // Dados
      ...data.map(row => cols.map(col => row[col.key] ?? '')),
    ];

    // Criar worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Estilizar cabeçalho
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Aplicar estilo no cabeçalho
    cols.forEach((_, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = headerStyle;
    });

    // Estilizar células de dados
    const dataStyle = {
      border: {
        top: { style: 'thin', color: { rgb: 'CCCCCC' } },
        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
        left: { style: 'thin', color: { rgb: 'CCCCCC' } },
        right: { style: 'thin', color: { rgb: 'CCCCCC' } },
      },
      alignment: { vertical: 'center' },
    };

    // Aplicar estilo nas células
    for (let row = 1; row <= data.length; row++) {
      cols.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '' };
        worksheet[cellAddress].s = {
          ...dataStyle,
          fill: row % 2 === 0 
            ? { fgColor: { rgb: 'F2F2F2' } } 
            : { fgColor: { rgb: 'FFFFFF' } },
        };
      });
    }

    // Definir largura das colunas
    worksheet['!cols'] = cols.map(col => ({
      wch: col.width || 15,
    }));

    // Criar workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Gerar arquivo e fazer download
    XLSX.writeFile(workbook, `${filename}.xlsx`);

    return true;
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    return false;
  }
};

/**
 * Formata dados de alunos para exportação
 */
export const formatAlunosForExport = (alunos: any[]) => {
  return alunos.map(aluno => ({
    'Matrícula': aluno.numeroMatricula || 'N/A',
    'Nome': aluno.nome,
    'CPF': aluno.cpf,
    'Data Nascimento': new Date(aluno.dataNascimento).toLocaleDateString('pt-BR'),
    'Email': aluno.email,
    'Telefone': aluno.telefone || 'N/A',
    'Responsável': aluno.responsavel,
    'Tel. Responsável': aluno.telefoneResp,
    'Turma': aluno.turma?.nome || 'Sem turma',
    'Status': aluno.statusMatricula || 'ATIVO',
  }));
};

/**
 * Formata dados de turmas para exportação
 */
export const formatTurmasForExport = (turmas: any[]) => {
  return turmas.map(turma => ({
    'Nome': turma.nome,
    'Ano': turma.ano,
    'Ano Letivo': turma.anoLetivo,
    'Período': turma.periodo,
    'Professor': turma.professor?.nome || 'Sem professor',
    'Total Alunos': turma.alunos?.length || 0,
    'Total Disciplinas': turma.disciplinas?.length || 0,
  }));
};

/**
 * Formata dados de notas para exportação
 */
export const formatNotasForExport = (notas: any[]) => {
  return notas.map(nota => ({
    'Aluno': nota.aluno?.nome || 'N/A',
    'Disciplina': nota.disciplina?.nome || 'N/A',
    'Trimestre': nota.trimestre,
    'Ano Letivo': nota.anoLetivo,
    'Avaliação 1': nota.avaliacao01 ?? '-',
    'Avaliação 2': nota.avaliacao02 ?? '-',
    'Avaliação 3': nota.avaliacao03 ?? '-',
    'Média': nota.media ?? '-',
    'Status': nota.status || 'N/A',
  }));
};

/**
 * Formata dados de frequência para exportação
 */
export const formatFrequenciasForExport = (frequencias: any[]) => {
  return frequencias.map(freq => ({
    'Aluno': freq.aluno?.nome || 'N/A',
    'Turma': freq.turma?.nome || 'N/A',
    'Data': new Date(freq.data).toLocaleDateString('pt-BR'),
    'Presente': freq.presente ? 'Sim' : 'Não',
    'Observação': freq.observacao || '-',
  }));
};

/**
 * Formata dados de professores para exportação
 */
export const formatProfessoresForExport = (professores: any[]) => {
  return professores.map(prof => ({
    'Nome': prof.nome,
    'CPF': prof.cpf,
    'Email': prof.email,
    'Telefone': prof.telefone || 'N/A',
    'Área': prof.area || 'N/A',
    'Componentes': prof.componentes || 'N/A',
    'Turmas Vinculadas': prof.turmasVinculadas || 'N/A',
  }));
};
