import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

test('all movie workflows serialize supported Gemini requests and parse JSON responses', async () => {
  const repo = fileURLToPath(new URL('../', import.meta.url));
  const temporary = await mkdtemp(path.join(repo, '.gemini-test-'));
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.API_KEY;
  const requests = [];
  const movie = {
    title: 'Arrival', year: 2016, rtScore: '94%', description: 'A first contact story.',
    reasoning: 'A thoughtful science fiction film.', wikipediaTitle: 'Arrival_(film)',
  };
  const outputs = [{ tags: ['Science Fiction', 'First Contact'] }, { suggestions: [movie] }, { suggestion: movie }];
  process.env.API_KEY = 'test-api-key';
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), body: JSON.parse(options.body) });
    return new Response(JSON.stringify({
      candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify(outputs[requests.length - 1]) }] }, finishReason: 'STOP' }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  try {
    const source = await readFile(path.join(repo, 'services/geminiService.ts'), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    });
    const compiled = path.join(temporary, 'geminiService.mjs');
    await writeFile(compiled, outputText);
    const service = await import(pathToFileURL(compiled).href);

    assert.deepEqual(await service.generateTagsFromMovies(['The Matrix', 'Blade Runner', 'Interstellar']), outputs[0].tags);
    assert.deepEqual(await service.getMovieSuggestions(['The Matrix'], ['Science Fiction'], [2000, 2020]), [movie]);
    assert.deepEqual(await service.getReplacementSuggestion(['The Matrix'], ['Science Fiction'], [2000, 2020]), movie);
    assert.equal(requests.length, 3);

    for (const { url, body } of requests) {
      assert.match(url, /\/models\/gemini-3\.8-flash:generateContent$/);
      assert.equal(body.generationConfig.responseMimeType, 'application/json');
      assert.ok(body.generationConfig.responseSchema);
      assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, 'LOW');
      for (const deprecated of ['temperature', 'topP', 'topK', 'top_p', 'top_k', 'thinkingBudget', 'thinking_budget']) {
        assert.equal(JSON.stringify(body).includes(`"${deprecated}"`), false, `${deprecated} must not be sent`);
      }
    }
    assert.ok(requests[0].body.generationConfig.responseSchema.properties.tags);
    assert.ok(requests[1].body.generationConfig.responseSchema.properties.suggestions);
    assert.ok(requests[2].body.generationConfig.responseSchema.properties.suggestion);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = originalApiKey;
    await rm(temporary, { recursive: true, force: true });
  }
});
