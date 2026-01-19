// Centralized label mappers for categories, actions and modalities
export function labelCategoria(key: string): string {
  switch (key) {
    case 'mudanca-endereco': return 'Mudança de Endereço';
    case 'regularizacao': return 'Regularização';
    case 'ato-formal': return 'Ato Formal';
    default: return capitalizeGeneric(key);
  }
}

export function labelAcao(categoria: string, key: string): string {
  if (key === 'nao-se-aplica') return 'Não se aplica';
  if (categoria === 'ato-formal') {
    switch (key) {
      case 'prorrogacao': return 'Prorrogação';
      case 'rescisao': return 'Rescisão';
      case 'alteracao-titularidade': return 'Alteração de titularidade';
      case 'antecipacao-parcela': return 'Antecipação de parcela';
      case 'recebimento-imovel': return 'Recebimento de imóvel';
      case 'acrescimo-area': return 'Acréscimo de área';
      case 'supressao-area': return 'Supressão de área';
      case 'revisao-aluguel': return 'Revisão de aluguel';
      case 'reajuste-aluguel': return 'Reajuste de aluguel';
      case 'apostilamento': return 'Apostilamento';
      case 'acao-renovatoria': return 'Ação renovatória';
    }
  }
  return capitalizeGeneric(key);
}

export function labelModalidade(key: string): string {
  switch (key) {
    case 'nao-se-aplica': return 'Não se aplica';
    case 'locacao': return 'Locação';
    case 'cessao': return 'Cessão';
    case 'comodato': return 'Comodato';
    default: return capitalizeGeneric(key);
  }
}

function capitalizeGeneric(text: string): string {
  if (!text) return text;
  const normalized = text.replace(/-/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
