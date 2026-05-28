import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: AI-Powered Lead Summarizer
app.post("/api/leads/summarize", async (req, res) => {
  try {
    const { name, answers, temperature, tags } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      // Offline fallback rules-based compiler
      const shopee = answers.find((a: any) => a.question.toLowerCase().includes("shopee") || a.question.toLowerCase().includes("vende"))?.value || "Não especificado";
      const faturamento = answers.find((a: any) => a.question.toLowerCase().includes("faturamento") || a.question.toLowerCase().includes("fatura"))?.value || "Não informado";
      const dificuldade = answers.find((a: any) => a.question.toLowerCase().includes("dificuldade") || a.question.toLowerCase().includes("maior"))?.value || "Nenhuma";
      const produto = answers.find((a: any) => a.question.toLowerCase().includes("busca") || a.question.toLowerCase().includes("curso") || a.question.toLowerCase().includes("mentoria"))?.value || "Contatos";

      const summary = `Lead ${shopee.includes("Sim") ? "já vende na Shopee" : "iniciante"}. Faturamento de ${faturamento}. Dificuldade: ${dificuldade}. Busca: ${produto}. Temperatura: ${temperature}.`;
      return res.json({ summary });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `Gere um rápido resumo comercial e estratégico (máximo 150 caracteres) para a equipe comercial sobre o lead de vendas abaixo.
Dados do Lead:
- Nome: ${name}
- Temperatura: ${temperature}
- Tags/Tags de Categorização: ${tags ? tags.join(", ") : ""}
- Perguntas e Respostas:
${answers.map((a: any) => `- ${a.question}: ${a.value}`).join("\n")}

Instruções:
- Vá direto ao ponto! Use sentenças afirmativas, claras e curtas. Exemplo: "Já vende na Shopee, fatura R$25k/mês, dificuldades com Ads, busca mentoria."
- Evite frases prolixas de introdução como "O lead se chama..." ou "De acordo com as respostas...".
- Utilize português do Brasil (PT-BR) de forma amigável e puramente profissional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const summary = response.text?.trim() || "Resumo indisponível.";
    return res.json({ summary });
  } catch (error: any) {
    console.error("Erro no processamento do resumo:", error);
    return res.status(200).json({ 
      summary: "Lead captado! Aguardando inteligência de resumo comercial.",
      error: error.message 
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Correctly resolve the absolute path relative to root
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
