import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { DadosContratoSnapshot } from "@/lib/contratos/types";
import {
  dataPorExtenso,
  diaSemanaPagamento,
  moeda,
  prazoValidadeDias,
} from "@/lib/contratos/format-contrato";
import { pdfStyles as s } from "@/lib/contratos/pdf/styles";

export function DocumentoContratoPadrao({
  dados,
}: {
  dados: DadosContratoSnapshot;
}) {
  const l = dados.locador;
  const t = dados.locatario;
  const v = dados.veiculo;
  const loc = dados.locacao;
  const cl = dados.clausulas;

  const valorSemanal = loc.valorSemanalOuMensal;
  const valorCaucao = loc.valorCaucao;
  const totalRetirada = valorCaucao + valorSemanal;
  const multaMora = valorSemanal * 0.05;
  const jurosDia = valorSemanal * 0.01;
  const diasPrazo = prazoValidadeDias(loc.dataInicio, loc.dataFimPrevista);
  const diaPagamento = diaSemanaPagamento(loc.dataInicio);
  const inicioExtenso = dataPorExtenso(loc.dataInicio);

  const locadorQualificacao = `${l.razaoSocial}, brasileiro, inscrito no CPF sob o nº ${l.cpfCnpj}${
    l.rg ? `, portador do RG nº ${l.rg}` : ""
  }${l.rgOrgao ? ` expedido por ${l.rgOrgao}` : ""}, residente e domiciliado na ${l.endereco}, ${l.cidade}– ${l.uf}${
    l.cep ? `. CEP: ${l.cep}` : ""
  }`;

  const locatarioQualificacao = `${t.nome}, ${t.nacionalidade ?? "brasileiro"}, inscrito no CPF sob o nº ${t.cpf}${
    t.rg ? `, portador do RG nº ${t.rg}` : ""
  }${t.rgOrgao ? ` expedido por ${t.rgOrgao}` : ""}${
    t.endereco ? `, residente e domiciliado na ${t.endereco}` : ""
  }`;

  const clausula6 = diasPrazo
    ? `A presente locação terá o lapso temporal de validade de ${diasPrazo} dias, e poderá persistir por tempo indeterminado caso haja vontade das partes, iniciando no dia ${inicioExtenso} e quando terminado o veículo deverá ser devolvido no estado em que foi locado. Km na retirada: ${loc.kmInicio} km.`
    : `A presente locação iniciará no dia ${inicioExtenso}, persistindo por tempo indeterminado enquanto houver vontade das partes, devendo o veículo ser devolvido no estado em que foi locado quando encerrada. Km na retirada: ${loc.kmInicio} km.`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>
          CONTRATO DE LOCAÇÃO DE AUTOMÓVEL POR PRAZO DETERMINADO
        </Text>

        <Text style={s.sectionTitle}>Identificação das partes contratantes</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>LOCADOR: </Text>
          {locadorQualificacao}
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>LOCATÁRIO: </Text>
          {locatarioQualificacao}
        </Text>
        <Text style={[s.paragraph, { marginTop: 8 }]}>
          As partes acima identificadas têm, entre si, justo e acertado o presente
          Contrato de Locação de Automóvel por Prazo Determinado, que se regerá pelas
          cláusulas seguintes e pelas condições descritas no presente.
        </Text>

        <Text style={s.sectionTitle}>Do objeto do contrato</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 1ª. </Text>
          O presente contrato tem como objetivo a locação de um veículo de marca{" "}
          {v.marca}, modelo {v.modelo}, cor {v.cor ?? "—"}, placa {v.placa}
          {v.renavam ? `, RENAVAM ${v.renavam}` : ""}, de propriedade de{" "}
          {l.razaoSocial}, brasileiro, inscrito sob o CPF {l.cpfCnpj}{" "}
          <Text style={s.bold}>LOCADOR</Text>.
        </Text>
        <Text style={s.paragraph}>
          Fica acordado entre as partes a mudança de veículo caso ambas as partes
          tenham interesse de também propriedade do Locador.
        </Text>

        <Text style={s.sectionTitle}>Do uso</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 2ª. </Text>
          O veículo, objeto deste contrato, será utilizado exclusivamente pelo{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> para uso pessoal e/ou profissional
          nas plataformas UBER e 99 POP (e/ou outras plataformas de transporte de
          passageiros), não sendo permitido, em nenhuma hipótese, o seu uso por
          terceiros ou para fins diversos sob pena de rescisão contratual e o
          pagamento da multa prevista na Cláusula 9ª.
        </Text>
        <Text style={s.paragraph}>
          Parágrafo único. Fica o LOCATÁRIO responsável por seguir as diretrizes e
          atender às exigências de credenciamento das referidas plataformas.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 3ª. </Text>
          O locatário ficará limitado ao uso do veículo urbano na grande {l.cidade}{" "}
          caso precise se redirecionar para fora disso deve ter comunicação prévia e
          consentimento do locador, onde o mesmo poderá cobrar taxas extras por isso.
          O não aviso prévio pode acarretar pagamento de multa prevista na Cláusula
          9°.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 4°. </Text>
          O locatário poderá usufruir do veículo em questão por todos os dias da
          semana se limitando a uma quilometragem de até{" "}
          {cl.kmSemanalMax.toLocaleString("pt-BR")} km semanal, caso o mesmo
          ultrapasse essa quilometragem acarretará pagamento extra de{" "}
          {moeda(cl.valorKmExtra)} há cada 2 km ultrapassados.
        </Text>

        <Text style={s.sectionTitle}>Da devolução</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 5ª. </Text>
          O <Text style={s.bold}>LOCATÁRIO</Text> deverá devolver o veículo ao{" "}
          <Text style={s.bold}>LOCADOR</Text> nas mesmas condições em que estava
          quando o recebeu, ou seja, em boas condições de uso, respondendo pelos
          danos ou prejuízos causados.
        </Text>

        <Text style={s.sectionTitle}>Do prazo</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 6ª. </Text>
          {clausula6}
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 7ª. </Text>
          Se o <Text style={s.bold}>LOCATÁRIO</Text> não restituir o automóvel na
          data estipulada, deverá pagar, enquanto detiver em seu poder, o aluguel
          que o <Text style={s.bold}>LOCADOR</Text> arbitrar, e responderá pelo dano
          que o automóvel venha a sofrer mesmo se proveniente de caso fortuito.
        </Text>

        <Text style={s.sectionTitle}>Da rescisão</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 8ª. </Text>
          É assegurada às partes a rescisão do presente contrato desde que haja
          comunicação à outra parte com antecedência mínima de 7 dias.
        </Text>
        <Text style={s.paragraph}>
          Parágrafo único. O inadimplemento contratual de quaisquer das partes
          justifica a rescisão, dispensado o prazo de comunicação.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 9ª. </Text>
          O descumprimento de qualquer das cláusulas por parte dos contratantes
          ensejará a rescisão deste instrumento e o devido pagamento de multa, pela
          parte inadimplente no valor de {moeda(cl.multaRescisao)}.
        </Text>
      </Page>

      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>
          Do pagamento e da multa por inadimplemento
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 10ª. </Text>
          O LOCATÁRIO no ato do recebimento do veículo repassará ao LOCADOR uma
          quantia no valor de {moeda(totalRetirada)}, referente ao caução do
          contrato mais valor estipulado da 1ª semana ({moeda(valorSemanal)}). O
          valor do caução ({moeda(valorCaucao)}) deverá ser devolvido ao LOCATÁRIO
          em um prazo de até 10 dias úteis após o final do contrato, caso não haja
          nenhum incidente, ou o valor pode ser usado para eventuais danos do
          LOCATÁRIO ao veículo.
        </Text>
        <Text style={s.paragraph}>
          O valor da locação é de {moeda(valorSemanal)} por semana de uso e deverão
          ser adimplidos todas as {diaPagamento} de cada semana por meio de
          transferência bancária ou via pix para a conta de titularidade do{" "}
          <Text style={s.bold}>LOCADOR</Text>, no banco de sua escolha.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Parágrafo primeiro</Text>. Em caso de
          inadimplemento, incidirão multa de mora de 5% sob o valor semanal (
          {moeda(multaMora)}) e juros de 1% ao dia ({moeda(jurosDia)}).
        </Text>

        <Text style={s.sectionTitle}>
          Da multa, impostos e encargos incidentes sobre o veículo
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 11ª. </Text>
          Fica o LOCATÁRIO responsável pelas multas de trânsito que eventualmente
          cometer, incluindo a transferência de pontuação e pagamento dos valores,
          devendo para tal disponibilizar a documentação requerida e no prazo
          indicado pelo Departamento de Trânsito do Estado do Maranhão – DETRAN/
          {l.uf}.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 12ª. </Text>
          Os impostos e encargos incidentes sobre o veículo, IPVA, seguro DPVAT,
          Licenciamento anual serão suportados exclusivamente pelo{" "}
          <Text style={s.bold}>LOCADOR</Text>.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 13ª. </Text>
          Em caso de sinistro, acidentes, danos materiais e derivados causados pelo
          locatário serão de sua total responsabilidade arcar com os danos.
        </Text>

        <Text style={s.sectionTitle}>Manutenção</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 14ª. </Text>
          Manutenção de rotina será de responsabilidade do LOCADOR. Eventuais
          manutenções necessárias por mal uso será de responsabilidade do
          LOCATÁRIO.
        </Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 15ª. </Text>
          Caso o Locatário faça serviços/revisão fora do mecânico/oficina de
          indicação do locador, o mesmo deve registrar com fotos e/ou vídeo a
          prestação de serviço.
        </Text>

        <Text style={s.sectionTitle}>Do foro</Text>
        <Text style={s.paragraph}>
          <Text style={s.bold}>Cláusula 16ª. </Text>
          Para dirimir quaisquer controvérsias oriundas do CONTRATO, as partes elegem
          o foro da comarca de {l.cidade} – {l.uf};
        </Text>

        <Text style={[s.paragraph, { marginTop: 12 }]}>
          Por estarem assim justos e contratados, firmam o presente instrumento, em
          duas vias de igual teor, juntamente com 2 (duas) testemunhas.
        </Text>
        <Text style={[s.paragraph, { marginTop: 16 }]}>
          {l.cidade}, {inicioExtenso}.
        </Text>
        <Text style={[s.paragraph, { fontSize: 9, color: "#555", marginTop: 8 }]}>
          Contrato nº {dados.numero}
        </Text>

        <View style={{ marginTop: 28 }}>
          <Text style={s.signatureLine}>
            _________________________________________________
          </Text>
          <Text style={s.signatureLabel}>
            (Nome e assinatura do Representante legal do LOCADOR)
          </Text>
          <Text style={[s.signatureLine, { marginTop: 20 }]}>
            _________________________________________________
          </Text>
          <Text style={s.signatureLabel}>(Nome e assinatura do LOCATÁRIO)</Text>
          <Text style={[s.signatureLine, { marginTop: 20 }]}>
            _________________________________________________
          </Text>
          <Text style={s.signatureLabel}>
            (Nome, RG e assinatura da Testemunha 1)
          </Text>
          <Text style={[s.signatureLine, { marginTop: 20 }]}>
            _________________________________________________
          </Text>
          <Text style={s.signatureLabel}>
            (Nome, RG e assinatura da Testemunha 2)
          </Text>
        </View>
      </Page>
    </Document>
  );
}
