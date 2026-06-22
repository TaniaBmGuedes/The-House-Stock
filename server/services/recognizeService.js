import Anthropic from '@anthropic-ai/sdk';
import { ApiError } from '../lib/ApiError.js';

// Esquema que a resposta do modelo é OBRIGADA a seguir (structured outputs).
const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Nome do produto/alimento.' },
    brand: { type: 'string', description: 'Marca, ou "" se não visível.' },
    category: { type: 'string', enum: ['Cozinha', 'Casa de banho', 'Despensa', 'Outros'] },
    location: { type: 'string', description: 'Compartimento sugerido ou "".' },
    unit: { type: 'string', description: 'Unidade (un, kg, L, …).' },
    expiryDate: { type: 'string', description: 'Validade dd/mm/aaaa, ou "".' },
    note: { type: 'string', description: 'Observação curta opcional, ou "".' },
  },
  required: ['name', 'brand', 'category', 'location', 'unit', 'expiryDate', 'note'],
  additionalProperties: false,
};

const SYSTEM = `És um assistente que identifica produtos de casa (cozinha, casa de banho, despensa) a partir de uma fotografia, para preencher um inventário doméstico.
Analisa a imagem e devolve os campos. Regras:
- "category": escolhe a melhor entre Cozinha, Casa de banho, Despensa, Outros.
- "location": sugere o compartimento típico (ex: produtos frescos -> Frigorífico; congelados -> Arca congeladora; secos -> Armário/Despensa). Se não souberes, "".
- "expiryDate": só preenche se vires claramente uma data de validade na embalagem, no formato dd/mm/aaaa. Caso contrário "".
- Usa "" (string vazia) para qualquer campo que não consigas determinar. Nunca inventes datas.`;

export async function recognizeProduct({ image, mediaType }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ApiError(503, 'Reconhecimento por foto não configurado (falta ANTHROPIC_API_KEY).');
  }
  if (!image) throw new ApiError(400, 'Falta a imagem.');

  let message;
  try {
    const client = new Anthropic();
    message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: image },
            },
            { type: 'text', text: 'Identifica este produto e preenche os campos.' },
          ],
        },
      ],
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    });
  } catch (err) {
    console.error(err);
    throw new ApiError(502, 'Não foi possível analisar a foto.');
  }

  const textBlock = message.content.find((b) => b.type === 'text');
  return JSON.parse(textBlock.text);
}
