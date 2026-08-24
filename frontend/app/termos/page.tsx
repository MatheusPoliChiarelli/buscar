import Header from '@/components/Header';

export const metadata = {
  title: 'Termos de Uso — BusCAR',
  description: 'Regras de uso da plataforma BusCAR para revendas e compradores',
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-stone-900">Termos de Uso</h1>
        <p className="text-stone-500 mt-2">Última atualização: 20 de agosto de 2026</p>

        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-8 mt-6 space-y-8">
          <section>
            <p className="text-stone-700 leading-relaxed">
              Estes termos valem para todo mundo que usa o BusCAR, seja para anunciar veículos ou
              para procurar um carro. Ao usar a plataforma, você concorda com as regras abaixo
            </p>
            <p className="text-stone-700 leading-relaxed mt-3">
              O BusCAR é operado por Matheus Poli Chiarelli, pessoa física, em Ribeirão Preto - SP.
              Contato:{' '}
              <a
                href="mailto:buscarribeirao@gmail.com"
                className="font-medium text-brand-700 hover:underline"
              >
                buscarribeirao@gmail.com
              </a>
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">O que o BusCAR é</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              O BusCAR é um classificado online que conecta revendas de veículos em Ribeirão Preto a
              pessoas interessadas em comprar um carro
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Não somos parte de nenhuma negociação. Não vendemos veículos, não intermediamos
              pagamentos, não fazemos vistoria e não garantimos a conclusão de nenhum negócio. Toda
              transação acontece diretamente entre comprador e revenda, fora da plataforma
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Responsabilidade pelos anúncios</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Cada revenda é integralmente responsável pelo conteúdo que publica: dados do veículo,
              fotos, preço, descrição e informações sobre procedência. O BusCAR não verifica nem
              valida essas informações
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              As indicações de histórico veicular e vistoria exibidas nos anúncios são declarações da
              própria revenda, não conferidas pela plataforma
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Ao anunciar, a revenda declara que tem legitimidade para vender o veículo e que as
              informações são verdadeiras
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Sobre a Tabela FIPE</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Os anúncios exibem o valor de referência da Tabela FIPE para facilitar a comparação. Esse
              valor vem de fontes públicas e é uma média estatística de mercado
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              A FIPE não considera o estado de conservação, quilometragem, histórico ou opcionais do
              veículo específico. Ela não é uma avaliação do carro anunciado, e o BusCAR não garante
              sua exatidão ou atualidade. Use como referência, nunca como única base de decisão
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Recomendações ao comprador</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Antes de fechar qualquer negócio, recomendamos fortemente que você:
            </p>
            <ul className="mt-3 space-y-2 text-stone-700 leading-relaxed list-disc pl-5">
              <li>Veja o veículo pessoalmente</li>
              <li>Contrate uma vistoria cautelar em empresa de sua confiança</li>
              <li>Consulte o histórico do veículo por conta própria</li>
              <li>Confira a documentação e a titularidade antes de qualquer pagamento</li>
              <li>Desconfie de preços muito abaixo do mercado</li>
            </ul>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Conta da revenda</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              A revenda é responsável por manter a senha em segurança e por tudo que acontecer na sua
              conta. Cadastros com informações falsas, anúncios enganosos ou uso indevido da
              plataforma podem levar à suspensão ou exclusão da conta, sem aviso prévio
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Também não são permitidos anúncios de veículos com restrição judicial, procedência
              irregular, ou conteúdo ofensivo, ilegal ou que não seja um veículo à venda
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Conteúdo publicado</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Ao enviar fotos e textos, a revenda declara ter os direitos sobre esse material e
              autoriza o BusCAR a exibi-lo na plataforma e a usá-lo para divulgar os próprios
              anúncios
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              A marca BusCAR, o layout e o código da plataforma são de propriedade do operador e não
              podem ser copiados ou reproduzidos sem autorização
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Limitação de responsabilidade</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              O BusCAR é oferecido no estado em que se encontra. Não garantimos disponibilidade
              ininterrupta, ausência de erros ou resultados específicos como venda de veículos ou
              volume de contatos
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Não nos responsabilizamos por prejuízos decorrentes de negociações feitas entre
              usuários, informações incorretas publicadas por revendas, ou decisões tomadas com base
              no conteúdo da plataforma
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Mudanças e encerramento</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Podemos alterar estes termos, modificar funcionalidades ou encerrar a plataforma a
              qualquer momento. Mudanças relevantes serão comunicadas às revendas cadastradas
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              A revenda pode encerrar sua conta quando quiser, escrevendo para o contato informado no
              topo desta página
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Foro</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Estes termos são regidos pela lei brasileira. Fica eleito o foro da comarca de Ribeirão
              Preto - SP para resolver qualquer questão, ressalvado o direito do consumidor de optar
              pelo foro de seu domicílio
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}