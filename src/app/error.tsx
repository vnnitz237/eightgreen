"use client";
export default function Error({ reset }: { reset: () => void }) { return <div className="erro-pagina"><h1>Não foi possível carregar esta tela</h1><p>Tente novamente. Se o problema continuar, registre o contexto para investigação.</p><button onClick={reset}>Tentar novamente</button></div>; }
