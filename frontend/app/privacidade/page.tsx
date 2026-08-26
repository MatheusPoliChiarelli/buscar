import Header from '@/components/Header';

export const metadata = {
  title: 'Política de Privacidade — BusCAR',
  description: 'Como o BusCAR coleta, usa e protege os dados pessoais de quem usa a plataforma',
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-brand-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-stone-900">Política de Privacidade</h1>
        <p className="text-stone-500 mt-2">Última atualização: 20 de agosto de 2026</p>

        <div className="bg-white rounded-xl border border-brand-200 shadow-sm p-8 mt-6 space-y-8">
          <section>
            <p className="text-stone-700 leading-relaxed">
              Esta política explica como o BusCAR trata os dados pessoais de quem usa a plataforma.
              Ela segue a Lei Geral de Proteção de Dados (Lei 13.709/2018)
            </p>
            <p className="text-stone-700 leading-relaxed mt-3">
              O BusCAR é operado por Matheus Poli Chiarelli, pessoa física, em Ribeirão Preto - SP.
              Para qualquer assunto relacionado a privacidade, o contato é{' '}
              <a
                href="mailto:buscarribeirao@gmail.com"
                className="font-medium text-brand-700 hover:underline"
              >
                buscarribeirao@gmail.com
              </a>
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Quais dados coletamos</h2>

            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mt-5">
              De quem anuncia
            </h3>
            <p className="text-stone-700 leading-relaxed mt-2">
              Quando uma revenda cria uma conta, coletamos nome do estabelecimento, e-mail, telefone
              de contato, endereço completo, horário de funcionamento e, opcionalmente, a logo. A
              senha é armazenada de forma criptografada, e nem nós temos acesso a ela
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Também guardamos os dados dos veículos anunciados: marca, modelo, ano, quilometragem,
              preço, características e fotos
            </p>

            <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wide mt-5">
              De quem navega
            </h3>
              <p className="text-stone-700 leading-relaxed mt-2">
              Para buscar carros e ver anúncios, não é preciso criar conta nem informar dados
              pessoais. Registramos apenas informações de uso da plataforma: quais anúncios foram
              abertos, quando alguém clica para falar com uma revenda, e quais páginas de loja foram
              visitadas
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Esses registros usam um identificador aleatório de sessão, que é gerado no seu
              navegador, não identifica você e é descartado ao fechar a aba. Os dados são
              apresentados às revendas apenas de forma agregada, em forma de números totais, sem
              qualquer informação sobre quem visitou
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Por que usamos esses dados</h2>
            <ul className="mt-3 space-y-2 text-stone-700 leading-relaxed list-disc pl-5">
              <li>Publicar os anúncios e permitir que compradores encontrem os veículos</li>
              <li>Permitir o contato entre comprador e revenda</li>
              <li>Autenticar o acesso da revenda à sua conta</li>
              <li>Enviar e-mails necessários ao funcionamento, como redefinição de senha</li>
              <li>Entender como a plataforma é usada e melhorá-la</li>
              <li>Mostrar às revendas quantas pessoas viram seus anúncios e quantas entraram em contato</li>
            </ul>
            <p className="text-stone-700 leading-relaxed mt-3">
              O tratamento se baseia na execução do serviço solicitado pela revenda e no legítimo
              interesse de operar e melhorar a plataforma
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Dados que ficam públicos</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Ao publicar um anúncio, os dados da revenda (nome, endereço, telefone e horário de
              funcionamento) e as informações do veículo ficam visíveis para qualquer visitante. Isso
              é da natureza do serviço: o comprador precisa dessas informações para entrar em contato
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              O e-mail de cadastro nunca é exibido publicamente
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Com quem compartilhamos</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Não vendemos nem cedemos dados pessoais. Usamos serviços de terceiros que processam
              dados em nosso nome, sempre limitados ao necessário para a plataforma funcionar:
            </p>
            <ul className="mt-3 space-y-2 text-stone-700 leading-relaxed list-disc pl-5">
              <li>Armazenamento de banco de dados e hospedagem da aplicação</li>
              <li>Armazenamento e entrega das imagens dos anúncios</li>
              <li>Envio de e-mails transacionais</li>
              <li>Ferramentas de análise de tráfego</li>
              <li>
                Consulta à Tabela FIPE, para exibir a referência de preço. Nenhum dado pessoal é
                enviado nessa consulta
              </li>
            </ul>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Cookies</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Usamos armazenamento local do navegador para manter a revenda conectada após o login.
              Também podemos usar cookies de ferramentas de análise para entender o uso da plataforma
              de forma agregada e anônima
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Você pode bloquear cookies nas configurações do seu navegador, mas nesse caso o login
              pode deixar de funcionar
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Por quanto tempo guardamos</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Os dados da conta ficam armazenados enquanto ela existir. Anúncios removidos deixam de
              aparecer publicamente, mas permanecem no sistema para consulta da própria revenda
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Se você pedir a exclusão da conta, removemos seus dados em até 30 dias, exceto o que a
              lei exigir que seja mantido
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Seus direitos</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              A LGPD garante a você o direito de confirmar se tratamos seus dados, acessá-los,
              corrigi-los, pedir a exclusão, revogar consentimento e solicitar informações sobre com
              quem os compartilhamos
            </p>
            <p className="text-stone-700 leading-relaxed mt-2">
              Boa parte disso está disponível diretamente na plataforma: a revenda pode editar seus
              dados e remover anúncios a qualquer momento. Para os demais pedidos, escreva para{' '}
              <a
                href="mailto:buscarribeirao@gmail.com"
                className="font-medium text-brand-700 hover:underline"
              >
                buscarribeirao@gmail.com
              </a>{' '}
              e responderemos em até 15 dias
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Segurança</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Senhas são armazenadas com criptografia e o acesso é protegido por autenticação. A
              comunicação com a plataforma acontece por conexão segura. Ainda assim, nenhum sistema é
              totalmente imune, e nos comprometemos a comunicar incidentes relevantes aos afetados e
              à autoridade competente
            </p>
          </section>

          <section className="border-t border-stone-100 pt-6">
            <h2 className="text-lg font-bold text-stone-900">Mudanças nesta política</h2>
            <p className="text-stone-700 leading-relaxed mt-2">
              Podemos atualizar esta política conforme a plataforma evolui. A data no topo indica a
              última alteração. Mudanças relevantes serão comunicadas às revendas cadastradas
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}