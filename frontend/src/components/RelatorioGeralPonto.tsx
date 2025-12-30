import { useState, useEffect } from 'react';
import { configuracoesAPI } from '../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RegistroPonto {
  id: string;
  pessoaId: string;
  tipoPessoa: 'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA';
  data: string;
  horaRegistro: string | Date;
  tipoRegistro: 'ENTRADA' | 'SAIDA' | 'INTERVALO_INICIO' | 'INTERVALO_FIM';
  observacao?: string;
  aprovado: boolean;
  reconhecimentoIA?: boolean;
  confianca?: number;
  fotoPath?: string;
}

interface ConfiguracaoJornada {
  id: string;
  pessoaId: string;
  tipoPessoa: string;
  cargaHorariaSemanal: number;
  cargaHorariaDiaria: number;
  horarioEntrada?: string;
  horarioSaida?: string;
  horarioIntervaloInicio?: string;
  horarioIntervaloFim?: string;
  diasTrabalho: string[];
}

interface BancoHoras {
  id: string;
  pessoaId: string;
  mes: number;
  ano: number;
  horasTrabalhadas: number;
  horasDevidas: number;
  saldo: number;
}

interface RelatorioGeralProps {
  pessoaSelecionada: string;
  tipoPessoa: 'PROFESSOR' | 'FUNCIONARIO' | 'EQUIPE_DIRETIVA';
  getNomePessoa: (id: string) => string;
  mesFiltro: number;
  anoFiltro: number;
  setMesFiltro: (mes: number) => void;
  setAnoFiltro: (ano: number) => void;
  registros: RegistroPonto[];
  bancoHoras: BancoHoras[];
  jornada: ConfiguracaoJornada | null;
  carregarRegistros: () => void;
  carregarBancoHoras: () => void;
  formatarData: (data: string) => string;
  formatarHora: (hora: string | Date) => string;
}

const RelatorioGeralPonto: React.FC<RelatorioGeralProps> = ({
  pessoaSelecionada,
  getNomePessoa,
  mesFiltro,
  anoFiltro,
  setMesFiltro,
  setAnoFiltro,
  registros,
  bancoHoras,
  jornada,
  carregarRegistros,
  carregarBancoHoras,
  formatarData,
  formatarHora,
}) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (pessoaSelecionada) {
      carregarRegistros();
      carregarBancoHoras();
      carregarConfig();
    }
  }, [pessoaSelecionada, mesFiltro, anoFiltro]);

  const carregarConfig = async () => {
    try {
      const response = await configuracoesAPI.get();
      setConfig(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const gerarPDF = async () => {
    if (!pessoaSelecionada) return;
    
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Logo da escola (se existir)
      if (config?.logoUrl) {
        try {
          doc.addImage(config.logoUrl, 'PNG', pageWidth / 2 - 15, yPos, 30, 30);
          yPos += 35;
        } catch (error) {
          console.log('Logo não disponível');
          yPos += 5;
        }
      }

      // Cabeçalho
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(config?.nomeEscola || 'Sistema de Gestão Escolar', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      doc.setFontSize(14);
      doc.text('RELATÓRIO DE PONTO', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Informações do funcionário
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Funcionário: ${getNomePessoa(pessoaSelecionada)}`, 14, yPos);
      yPos += 6;
      doc.text(`Período: ${String(mesFiltro).padStart(2, '0')}/${anoFiltro}`, 14, yPos);
      yPos += 6;
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, yPos);
      yPos += 10;

      // Linha divisória
      doc.setLineWidth(0.5);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 8;

      // Jornada de Trabalho
      if (jornada) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('JORNADA DE TRABALHO', 14, yPos);
        yPos += 6;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Carga Horária Semanal: ${jornada.cargaHorariaSemanal}h`, 14, yPos);
        yPos += 5;
        doc.text(`Carga Horária Diária: ${jornada.cargaHorariaDiaria}h`, 14, yPos);
        yPos += 5;
        doc.text(`Horário: ${jornada.horarioEntrada} às ${jornada.horarioSaida}`, 14, yPos);
        yPos += 10;
      }

      // Registros de Ponto
      if (registros.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('REGISTROS DE PONTO', 14, yPos);
        yPos += 6;

        const registrosData = registros.map(r => [
          formatarData(r.data),
          formatarHora(r.horaRegistro),
          r.tipoRegistro.replace(/_/g, ' '),
          r.observacao || '-',
          r.aprovado ? 'Sim' : 'Não'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Data', 'Hora', 'Tipo', 'Observação', 'Aprovado']],
          body: registrosData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [14, 165, 233], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 20 },
            2: { cellWidth: 35 },
            3: { cellWidth: 70 },
            4: { cellWidth: 20 }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Banco de Horas
      if (bancoHoras.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BANCO DE HORAS', 14, yPos);
        yPos += 6;

        const bancoData = bancoHoras.map(b => [
          `${String(b.mes).padStart(2, '0')}/${b.ano}`,
          `${b.horasDevidas.toFixed(2)}h`,
          `${b.horasTrabalhadas.toFixed(2)}h`,
          `${b.saldo >= 0 ? '+' : ''}${b.saldo.toFixed(2)}h`,
          b.saldo >= 0 ? 'Positivo' : 'Negativo'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Período', 'Esperadas', 'Trabalhadas', 'Saldo', 'Status']],
          body: bancoData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [14, 165, 233], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 30 },
            4: { cellWidth: 30 }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Rodapé com assinaturas
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 20;
      doc.setFontSize(10);
      doc.line(14, yPos, 90, yPos);
      doc.text('Assinatura do Funcionário', 14, yPos + 5);
      
      doc.line(110, yPos, 186, yPos);
      doc.text('Assinatura do Responsável', 110, yPos + 5);

      // Informações do documento
      yPos = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(`Documento gerado em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });

      // Salvar PDF
      const nomeArquivo = `Relatorio_Ponto_${getNomePessoa(pessoaSelecionada).replace(/\s+/g, '_')}_${mesFiltro}_${anoFiltro}.pdf`;
      doc.save(nomeArquivo);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-box">
      <h2>📄 Relatório Geral - {getNomePessoa(pessoaSelecionada)}</h2>
      
      {!pessoaSelecionada ? (
        <p className="empty-state">Selecione uma pessoa para gerar o relatório</p>
      ) : (
        <>
          <div className="filters-section">
            <div className="form-row">
              <div className="form-group">
                <label>Mês:</label>
                <select 
                  value={mesFiltro} 
                  onChange={(e) => setMesFiltro(Number(e.target.value))}
                  style={{ border: '2px solid #10b981' }}
                >
                  <option value={1}>Janeiro</option>
                  <option value={2}>Fevereiro</option>
                  <option value={3}>Março</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Maio</option>
                  <option value={6}>Junho</option>
                  <option value={7}>Julho</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Setembro</option>
                  <option value={10}>Outubro</option>
                  <option value={11}>Novembro</option>
                  <option value={12}>Dezembro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ano:</label>
                <input
                  type="number"
                  value={anoFiltro}
                  onChange={(e) => setAnoFiltro(Number(e.target.value))}
                  min="2000"
                  max="2099"
                  style={{ border: '2px solid #10b981' }}
                />
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={gerarPDF}
              disabled={loading}
              style={{ marginTop: '15px', width: '100%', fontSize: '18px', padding: '16px 28px' }}
            >
              {loading ? '⏳ Gerando PDF...' : '📄 Gerar PDF'}
            </button>
          </div>

          {/* Preview dos dados */}
          <div style={{ marginTop: '30px' }}>
            <h3>📊 Preview dos Dados</h3>
            
            {jornada && (
              <div className="info-section" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h4>Jornada de Trabalho</h4>
                <p><strong>Carga Horária Semanal:</strong> {jornada.cargaHorariaSemanal}h</p>
                <p><strong>Carga Horária Diária:</strong> {jornada.cargaHorariaDiaria}h</p>
                <p><strong>Horário:</strong> {jornada.horarioEntrada} às {jornada.horarioSaida}</p>
              </div>
            )}

            {registros.length > 0 ? (
              <div style={{ marginTop: '20px' }}>
                <h4>Registros de Ponto ({registros.length})</h4>
                <p style={{ color: '#64748b' }}>Total de registros no período selecionado</p>
              </div>
            ) : (
              <p style={{ marginTop: '20px', color: '#64748b' }}>Nenhum registro encontrado no período</p>
            )}

            {bancoHoras.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4>Banco de Horas</h4>
                {bancoHoras.map((banco, index) => (
                  <div key={index} style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', marginTop: '10px' }}>
                    <p><strong>Período:</strong> {String(banco.mes).padStart(2, '0')}/{banco.ano}</p>
                    <p><strong>Horas Esperadas:</strong> {banco.horasDevidas.toFixed(2)}h</p>
                    <p><strong>Horas Trabalhadas:</strong> {banco.horasTrabalhadas.toFixed(2)}h</p>
                    <p><strong>Saldo:</strong> <span style={{ color: banco.saldo >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {banco.saldo >= 0 ? '+' : ''}{banco.saldo.toFixed(2)}h
                    </span></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RelatorioGeralPonto;
