# Digitar Pro - Academy

**Digite melhor. Evolua sempre.**

A **Digitar Pro** é uma marca de produtos de aprendizagem e produtividade digital. A **Digitar Pro Academy** é seu primeiro produto: laboratório de digitação em português (Brasil), gratuito e executado no navegador.

> Estado atual: **MVP 0.6 Premium**, preparado para publicação. O sistema não possui autenticação, armazenamento em nuvem ou pagamento. Produtos futuros não estão implementados.

## Iniciar o sistema

Abra `index.html` no navegador. Não precisa instalar nada. Também pode ser publicado como um site estático no GitHub Pages.

## O que já está implementado

- 12 lições, organizadas em 4 módulos
- Digitação caractere por caractere, com feedback dos erros
- Indicadores: PPM, precisão e tempo decorrido
- Teclado visual simplificado com destaque da próxima tecla
- Resultados e progresso salvos no navegador (localStorage)
- Dois modos de prática: **Treinamento** (conclui ao terminar o texto, contando erros) e **Precisão** (é necessário corrigir os erros antes de concluir)
- Avanço com **Enter** após a conclusão, conforme o modo selecionado
- Preferência de modo salva no navegador, independente do progresso
- Resumo no fim do módulo, com desempenho médio e conquista
- Possibilidade de repetir módulos
- Interface v0.6 Premium com layout focado na lição, cabeçalho compacto e cartões de desempenho
- Dashboard de progresso com lições concluídas, recorde de PPM, precisão média e módulos completos
- Objetivo pedagógico por lição, teclado de apoio recolhível e preferências de movimento reduzido
- Interface responsiva e identidade visual Digitar Pro
- Identificação dos produtos da família, com rótulo claro de futuro

**Atenção:** o progresso não é sincronizado entre dispositivos; no modo Treinamento, erros são contabilizados e não bloqueiam a conclusão; no modo Precisão, todos devem ser corrigidos. Trocar de modo reinicia o exercício atual, sem apagar os resultados já salvos. O teclado visual ainda não é uma representação completa do ABNT2. As métricas são estimativas para fins educativos.

## Arquitetura e futuro portfólio

| Produto | Proposta | Situação |
|---|---|---|
| **Digitar Pro Academy** | Aprendizagem de digitação com progresso e gamificação | MVP 0.6 Premium implementado |
| Digitar Pro Kids | Experiência lúdica para crianças | Ideia futura |
| Digitar Pro Business | Produtividade e capacitação em empresas | Ideia futura |
| Digitar Pro Schools | Turmas, professores e acompanhamento escolar | Ideia futura |

A identidade da marca permite ampliar para novos produtos sem acoplar funcionalidades futuras ao MVP. Uma evolução com o método SPECTION pode incluir Product Brief, PRD, arquitetura, testes, autenticação, 60 lições, painel docente e recursos opcionais de acessibilidade.

## Publicar no GitHub Pages

1. Crie um repositório **público** chamado `digitar-pro`.
2. Envie `index.html` e `README.md` para a raiz da branch `main`.
3. Acesse **Settings > Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch **main**, pasta **/(root)** e clique em **Save**.
6. Depois da publicação, o endereço esperado será `https://alexsandsouza.github.io/digitar-pro/` (verifique no próprio GitHub Pages).

## Versões

- **0.6 Premium** - Redesign da interface, foco na atividade, dashboard local, objetivo pedagógico, teclado recolhível, responsividade e acessibilidade. Mantém o progresso e os dois modos existentes.

- **0.5** - Seleção entre Treinamento e Precisão, correção obrigatória de erros no segundo modo, preferência persistida e comportamento de Enter contextual.

- **0.4.1** - Corrigido o avanço com Enter: lições finalizam ao atingir o fim do texto, mesmo com erros, preservando a medição de precisão.

- **0.4** - Identidade Digitar Pro Academy e estrutura visual para a família de produtos.
- **0.3** - Tela de resumo por módulo e conquistas.
- **0.2** - Tecla Enter para avanço após conclusão.
- **0.1** - Protótipo de digitação com 12 lições e indicadores.

## Privacidade

O sistema salva o desempenho apenas no armazenamento local do navegador. Não há transmissão de dados de estudantes para um servidor pelo aplicativo. Limpar os dados do site no navegador pode apagar o progresso.

## Licenciamento e marca

O código deste MVP ainda não tem licença de distribuição definida. O nome e a identidade **Digitar Pro** são escolhas provisórias do projeto, não uma afirmação de registro de marca. Antes do lançamento comercial, pesquise marca no INPI e disponibilidade de domínios.
## Testes recomendados para v0.6 Premium

1. Confirmar que a trilha inicia na lição 1 com o campo de digitação acessível.
2. Digitar com e sem erros nos modos Treinamento e Precisão; verificar o comportamento de Enter.
3. Recarregar a página e conferir que os resultados e o modo selecionado permanecem salvos.
4. Concluir as três lições de um módulo e conferir a tela de conquista e o dashboard.
5. Testar navegação pelo teclado, visualização em telas estreitas e a opção de reduzir movimento.

**Implantação:** desenvolver e validar em `feature/premium-v0.6` antes de integrar à `main`. O GitHub Pages da produção continua na branch `main` até a aprovação.
