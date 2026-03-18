# ironcore-diag

Produto separado do Ironcore focado em:
- upload da base histórica
- consolidação da base histórica
- geração do diagnóstico histórico com IA
- validação executiva do diagnóstico

## Stack
- Next.js
- Postgres
- DeepSeek (opcional, com fallback local)

## Desenvolvimento
```bash
npm install
cp .env.example .env
npm run build
npm run start
```

## Banco
```bash
export DATABASE_URL='postgres://...'
npm run migrate
npm run seed:users
```

## Escopo extraído do Ironcore-web
Este repositório contém apenas o fluxo de diagnóstico histórico. Não inclui os módulos de:
- conciliação
- operação diária completa
- fechamento mensal
- delivery
- monitoramento diretoria
