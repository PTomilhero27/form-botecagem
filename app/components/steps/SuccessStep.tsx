import { CheckCircle2, ShieldCheck, ReceiptText } from "lucide-react";

type Props = {
  merchantId?: string | null;
};

export function SuccessStep({ merchantId }: Props) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-5">
        {/* Icon */}
        <div className="w-fit rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
              Dados salvos com sucesso 
            </h2>
          </div>

          <p className="mt-2 text-base text-zinc-600">
            Obrigado! Recebemos o cadastro e o cardápio do seu PDV e já registramos tudo no sistema.
            A equipe responsável pelas maquininhas vai usar essas informações para configurar o atendimento
            e liberar o funcionamento corretamente.
          </p>

          {/* Info cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-200">
                  <ReceiptText className="h-5 w-5 text-zinc-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Próximos passos
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Em breve nossa equipe valida os dados e inicia a configuração do cardápio nas maquininhas.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-200">
                  <ShieldCheck className="h-5 w-5 text-zinc-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Segurança e consistência
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Seus dados foram gravados com segurança e não é necessário fazer mais nenhuma ação aqui.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Merchant ID (optional) */}
          {merchantId && (
            <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
              <p className="text-xs font-medium text-zinc-500">
                Identificador do cadastro
              </p>
              <p className="mt-2 break-all rounded-xl bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 ring-1 ring-zinc-200">
                {merchantId}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Se precisar de suporte, informe esse código para agilizar o atendimento.
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <p className="text-sm font-semibold text-emerald-900">
              Tudo certo por aqui ✅
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              Você pode fechar esta página. Caso a equipe precise de alguma confirmação, entraremos em contato.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
