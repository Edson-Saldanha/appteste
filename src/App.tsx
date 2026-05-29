import { useState } from 'react';

const QUESTIONS = [
  'Já vende na Shopee?',
  'Qual o faturamento mensal atual?',
  'Qual a maior dificuldade?',
  'O que busca: curso, mentoria ou contatos?',
];

const TEMPERATURES = ['Frio', 'Morno', 'Quente'];

export default function App() {
  const [name, setName] = useState('');
  const [temperature, setTemperature] = useState('Morno');
  const [tags, setTags] = useState('');
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''));
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnswer = (i: number, value: string) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await fetch('/api/leads/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          temperature,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          answers: QUESTIONS.map((q, i) => ({ question: q, value: answers[i] })),
        }),
      });

      const data = await res.json();
      setSummary(data.summary);
    } catch {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-white">Resumo de Lead com IA</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do lead</label>
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Temperatura</label>
            <div className="flex gap-2">
              {TEMPERATURES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemperature(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    temperature === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: iniciante, shopee, ads"
            />
          </div>

          {QUESTIONS.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-1">{q}</label>
              <input
                className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={answers[i]}
                onChange={(e) => handleAnswer(i, e.target.value)}
                placeholder="Resposta..."
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold transition-colors"
          >
            {loading ? 'Gerando resumo...' : 'Gerar Resumo'}
          </button>
        </form>

        {summary && (
          <div className="bg-indigo-950 border border-indigo-700 rounded-xl p-4 text-indigo-100">
            <p className="text-sm font-medium text-indigo-400 mb-1">Resumo gerado:</p>
            <p>{summary}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-700 rounded-xl p-4 text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
