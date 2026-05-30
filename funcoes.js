// ══════════════════════════════════════════════════════════════════════
//  SUBSTITUIR as funções mgBaixarDoc() e mgBaixarMemDoc() no index.html
//  pelo código abaixo.
//
//  Cole este bloco no lugar das duas funções antigas.
//  Ajuste a constante DOCX_FUNCTION_URL se necessário.
// ══════════════════════════════════════════════════════════════════════

// ── URL da Edge Function (ajuste para o seu projeto Supabase) ──────────
const DOCX_FUNCTION_URL =
  "https://lbjklgqqtemtjwwwmduz.supabase.co/functions/v1/gerar-docx";

// ── Helper: chama a Edge Function e faz download do .docx ─────────────
async function _baixarDocx(tipo) {
  var nome     = document.getElementById('mg-tecnico').value.trim() || 'Tecnico';
  var titulo   = document.getElementById('mg-titulo').value || '';
  var registro = document.getElementById('mg-registro').value || '';
  var cultura  = (window._recData && window._recData.cultura) || 'Cultura';
  var calagem  = (window._recData && window._recData.calagem) || '';
  var adubacao = (window._recData && window._recData.adubacao) || '';
  var data     = new Date().toLocaleDateString('pt-BR');

  // Loading visual
  var loadEl = document.getElementById('mg-loading');
  var loadMsg = document.getElementById('mg-loading-msg');
  var loadIcon = document.getElementById('mg-loading-icon');
  if (loadEl) {
    loadEl.style.display = 'block';
    loadMsg.textContent = 'Gerando documento Word (.docx)... aguarde.';
    loadIcon.textContent = '⏳';
  }

  try {
    var resp = await fetch(DOCX_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, tecnico: nome, titulo, registro, cultura, calagem, adubacao, data })
    });

    if (!resp.ok) {
      var err = await resp.text();
      throw new Error('Erro na Edge Function: ' + err);
    }

    var blob = await resp.blob();
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = tipo === 'recomendacao'
      ? 'Recomendacao_' + cultura.replace(/\s/g, '_') + '.docx'
      : 'MemoriaCalculo_' + cultura.replace(/\s/g, '_') + '.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (e) {
    alert('Erro ao gerar .docx:\n' + e.message);
    console.error(e);
  } finally {
    if (loadEl) loadEl.style.display = 'none';
  }
}

// ── Baixar .DOCX da Recomendação de Adubação ──────────────────────────
async function mgBaixarDoc() {
  await _baixarDocx('recomendacao');
}

// ── Baixar .DOCX da Memória de Cálculo ────────────────────────────────
async function mgBaixarMemDoc() {
  await _baixarDocx('memoria');
}
