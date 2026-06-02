import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { DadosContratoSnapshot } from "@/lib/contratos/types";
import { pdfStyles as s } from "@/lib/contratos/pdf/styles";

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DocumentoContratoPlanoConquista({
  dados,
}: {
  dados: DadosContratoSnapshot;
}) {
  const l = dados.locador;
  const t = dados.locatario;
  const v = dados.veiculo;
  const loc = dados.locacao;
  const meses = loc.planoConquistaMeses ?? 24;
  const adesao = loc.planoConquistaValorAdesao ?? loc.valorCaucao;
  const multa3 = loc.valorSemanalOuMensal * 0.03;
  const juros1 = loc.valorSemanalOuMensal * 0.01;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>
          CONTRATO DE LOCAÇÃO DE AUTOMÓVEL COM PLANO CONQUISTA
        </Text>
        <Text style={s.sectionTitle}>Identificação das partes contratantes</Text>
        <Text style={s.paragraph}>
          LOCADOR: {l.razaoSocial}, inscrito no CPF {l.cpfCnpj}
          {l.rg ? `, RG ${l.rg}` : ""}
          {l.rgOrgao ? ` (${l.rgOrgao})` : ""}, {l.endereco}, {l.cidade} – {l.uf}.
        </Text>
        <Text style={s.paragraph}>
          LOCATÁRIO: {t.nome}, brasileiro, CPF {t.cpf}
          {t.rg ? `, RG ${t.rg}` : ""}
          {t.endereco ? `, ${t.endereco}` : ""}.
        </Text>
        <Text style={s.paragraph}>Contrato nº {dados.numero}.</Text>

        <Text style={s.sectionTitle}>Do objeto do contrato</Text>
        <Text style={s.paragraph}>
          Cláusula 1ª. Locação com plano conquista futura do veículo {v.marca}{" "}
          {v.modelo}, ano {v.ano}, cor {v.cor ?? "—"}, placa {v.placa}
          {v.renavam ? `, RENAVAM ${v.renavam}` : ""}, de propriedade do
          LOCADOR.
        </Text>

        <Text style={s.sectionTitle}>Do prazo</Text>
        <Text style={s.paragraph}>
          Cláusula 2ª. Prazo de {meses} meses, iniciando em {loc.dataInicio}
          {loc.dataFimPrevista ? `, com término previsto em ${loc.dataFimPrevista}` : ""}.
          Parágrafo primeiro: o prazo pode ser reduzido mediante amortização
          antecipada das parcelas.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 3ª. Ao final do contrato, estando o LOCATÁRIO adimplente, o
          LOCADOR deverá providenciar a transferência do veículo ao LOCATÁRIO.
        </Text>

        <Text style={s.sectionTitle}>Da rescisão</Text>
        <Text style={s.paragraph}>
          Cláusula 4ª. Desistência pelo LOCATÁRIO: reembolso de 70% da adesão,
          renunciando às mensalidades pagas; devolução do veículo em {l.cidade} –
          {l.uf}, com custos de transporte por conta do LOCATÁRIO.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 5ª. Desistência pelo LOCADOR: reembolso integral da adesão e
          de todas as mensalidades pagas pelo LOCATÁRIO.
        </Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Do pagamento e multa por inadimplemento</Text>
        <Text style={s.paragraph}>
          Cláusula 6ª. {meses} parcelas mensais de{" "}
          {moeda(loc.valorSemanalOuMensal)}.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 7ª. Pagamento até o 5º dia corrido de cada mês, a partir de{" "}
          {loc.dataInicio}.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 8ª. Atraso: multa de 3% ({moeda(multa3)}) + 1% ao dia (
          {moeda(juros1)}) a partir do 5º dia, por até 30 dias.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 9ª. Atraso superior a 30 dias autoriza rescisão pelo LOCADOR
          sem penalidade da Cláusula 5ª, aplicando-se a Cláusula 4ª.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 10ª. Adesão contratual de {moeda(adesao)}
          {loc.adesaoCronograma
            ? `, nas datas: ${loc.adesaoCronograma}`
            : ""}
          . Sujeita às penalidades das cláusulas 4ª e 9ª em caso de desistência ou
          inadimplência.
        </Text>

        <Text style={s.sectionTitle}>
          Da multa, impostos e encargos incidentes sobre o veículo
        </Text>
        <Text style={s.paragraph}>
          Cláusula 11ª. Multas de trânsito: responsabilidade do LOCATÁRIO
          (DETRAN/MA ou equivalente).
        </Text>
        <Text style={s.paragraph}>
          Cláusula 12ª. IPVA, DPVAT e licenciamento: responsabilidade do LOCATÁRIO
          a partir do ano da assinatura.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 13ª. Sinistros e danos a terceiros: responsabilidade total do
          LOCATÁRIO. Veículo sem seguro, com ciência do LOCATÁRIO.
        </Text>

        <Text style={s.sectionTitle}>Manutenção</Text>
        <Text style={s.paragraph}>
          Cláusula 14ª. Manutenções preventivas, de rotina e corretivas: custo do
          LOCATÁRIO.
        </Text>
        <Text style={s.paragraph}>
          Cláusula 15ª. O LOCATÁRIO deve zelar pelo veículo; em rescisão, o saldo
          da adesão pode ser usado para reparos.
        </Text>

        <Text style={s.sectionTitle}>Transferência</Text>
        <Text style={s.paragraph}>
          Cláusula 16ª. Após quitação de mensalidades e pendências, direito à
          transferência em até 30 dias, custos por conta do LOCATÁRIO.
        </Text>

        <Text style={s.sectionTitle}>Do foro</Text>
        <Text style={s.paragraph}>
          Cláusula 17ª. Foro da comarca de {l.cidade} – {l.uf}.
        </Text>

        <Text style={{ marginTop: 16 }}>
          {l.cidade}, {dados.geradoEm}.
        </Text>
        <View style={{ marginTop: 20 }}>
          <Text style={s.signature}>LOCADOR/VENDEDOR: {l.razaoSocial}</Text>
          <Text style={[s.signature, { marginTop: 16 }]}>
            LOCATÁRIO/COMPRADOR: {t.nome}
          </Text>
          <Text style={[s.signature, { marginTop: 16 }]}>
            Testemunha 1: _________________________
          </Text>
          <Text style={[s.signature, { marginTop: 16 }]}>
            Testemunha 2: _________________________
          </Text>
        </View>
      </Page>
    </Document>
  );
}
