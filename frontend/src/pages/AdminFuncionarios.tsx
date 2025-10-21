import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth";
import api from "../lib/api";
import { uploadFile } from "../lib/api";
import {
  Funcionario,
  useFuncionariosStore,
} from "../stores/funcionarios";

function formatDate(date?: string | null) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
}

export default function AdminFuncionarios() {
  const navigate = useNavigate();
  const registerFuncionario = useAuthStore(
    (state) => state.registerFuncionario
  );
  const updateAdminPassword = useAuthStore(
    (state) => state.updateAdminPassword
  );
  const updateFuncionarioPassword = useAuthStore(
    (state) => state.updateFuncionarioPassword
  );
  const funcionarios = useFuncionariosStore((state) => state.funcionarios);
  const fetchFuncionarios = useFuncionariosStore(
    (state) => state.fetchFuncionarios
  );
  const upsertFuncionario = useFuncionariosStore(
    (state) => state.upsertFuncionario
  );
  const user = useAuthStore((s)=> s.user);

  const [loadingList, setLoadingList] = useState(false);
  const [cadastroStatus, setCadastroStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [cadastroErro, setCadastroErro] = useState<string | null>(null);
  const [senhaAdminStatus, setSenhaAdminStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [senhaAdminErro, setSenhaAdminErro] = useState<string | null>(null);
  const [expandedFuncionario, setExpandedFuncionario] = useState<string | null>(
    null
  );
  const [senhaFuncionarioStatus, setSenhaFuncionarioStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [senhaFuncionarioErro, setSenhaFuncionarioErro] =
    useState<string | null>(null);

  const [cadastroForm, setCadastroForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    foto: "",
    fotoFile: undefined as File | undefined,
  });

  const [senhaAdminForm, setSenhaAdminForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmacao: "",
  });

  const [senhaFuncionarioForm, setSenhaFuncionarioForm] = useState({
    novaSenha: "",
    confirmacao: "",
  });

  useEffect(() => {
    let ativo = true;
    (async () => {
      setLoadingList(true);
      try {
        await fetchFuncionarios();
      } catch (error) {
        console.error("Falha ao carregar funcionários", error);
      } finally {
        if (ativo) setLoadingList(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [fetchFuncionarios]);

  useEffect(() => {
    setSenhaFuncionarioForm({ novaSenha: "", confirmacao: "" });
    setSenhaFuncionarioStatus("idle");
    setSenhaFuncionarioErro(null);
  }, [expandedFuncionario]);

  const funcionariosOrdenados = useMemo(() => {
    return [...funcionarios].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
    );
  }, [funcionarios]);

  async function handleCadastro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCadastroStatus("idle");
    setCadastroErro(null);

    if (cadastroForm.senha !== cadastroForm.confirmarSenha) {
      setCadastroErro("As senhas não conferem.");
      return;
    }

    setCadastroStatus("loading");
    try {
      let fotoUrl: string | undefined = undefined;
      if (cadastroForm.fotoFile) {
        try {
          fotoUrl = await uploadFile(cadastroForm.fotoFile, "usuarios");
        } catch (e: any) {
          setCadastroErro("Falha no upload da foto do usuário");
          setCadastroStatus("error");
          return;
        }
      }
      const novo = await registerFuncionario({
        nome: cadastroForm.nome,
        email: cadastroForm.email,
        senha: cadastroForm.senha,
        foto: fotoUrl || cadastroForm.foto || undefined,
      });

      if (novo?.id) {
        const convertido: Funcionario = {
          id: novo.id,
          name: novo.name,
          email: novo.email,
          photo: novo.photo ?? null,
          ativo: Boolean(novo.ativo ?? true),
        };
        upsertFuncionario(convertido);
      } else {
        await fetchFuncionarios();
      }

      setCadastroStatus("success");
      setCadastroForm({ nome: "", email: "", senha: "", confirmarSenha: "", foto: "", fotoFile: undefined });
    } catch (error: any) {
      console.error("Falha ao cadastrar funcionário", error);
      const mensagem =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível cadastrar o funcionário.";
      setCadastroErro(mensagem);
      setCadastroStatus("error");
    }
  }

  async function handleSenhaAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSenhaAdminStatus("idle");
    setSenhaAdminErro(null);

    if (senhaAdminForm.novaSenha !== senhaAdminForm.confirmacao) {
      setSenhaAdminErro("As senhas não conferem.");
      return;
    }

    setSenhaAdminStatus("loading");
    try {
      await updateAdminPassword(senhaAdminForm);
      setSenhaAdminStatus("success");
      setSenhaAdminForm({ senhaAtual: "", novaSenha: "", confirmacao: "" });
    } catch (error: any) {
      console.error("Erro ao atualizar senha do administrador", error);
      const mensagem =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível atualizar a senha.";
      setSenhaAdminErro(mensagem);
      setSenhaAdminStatus("error");
    }
  }

  async function handleSenhaFuncionario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!expandedFuncionario) return;
    setSenhaFuncionarioStatus("idle");
    setSenhaFuncionarioErro(null);

    if (
      senhaFuncionarioForm.novaSenha !== senhaFuncionarioForm.confirmacao
    ) {
      setSenhaFuncionarioErro("As senhas não conferem.");
      return;
    }

    setSenhaFuncionarioStatus("loading");
    try {
      const atualizado = await updateFuncionarioPassword(
        expandedFuncionario,
        senhaFuncionarioForm
      );
      if (atualizado?.id) {
        const convertido: Funcionario = {
          id: atualizado.id,
          name: atualizado.name,
          email: atualizado.email,
          photo: atualizado.photo ?? null,
          ativo: Boolean(atualizado.ativo ?? true),
        };
        upsertFuncionario(convertido);
      }
      setSenhaFuncionarioStatus("success");
      setSenhaFuncionarioForm({ novaSenha: "", confirmacao: "" });
    } catch (error: any) {
      console.error("Erro ao atualizar senha do funcionário", error);
      const mensagem =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível atualizar a senha.";
      setSenhaFuncionarioErro(mensagem);
      setSenhaFuncionarioStatus("error");
    }
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 rounded-full bg-[#d7e6dc] px-5 py-2 text-sm font-semibold text-[#315245] transition hover:bg-[#c5d9cd]"
      >
        Voltar
      </button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
        <section className="rounded-3xl bg-white/85 p-6 shadow-xl shadow-[#c0d3c9]/40">
          <header className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#2f4d3f]">
                Cadastrar novo funcionário
              </h2>
              <p className="text-sm text-[#5b7a6b]">
                Cadastre atendentes e compartilhe a senha temporária com eles.
              </p>
            </div>
          </header>

          <form className="grid gap-4" onSubmit={handleCadastro}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-[#2f4d3f]">
                Nome completo
                <input
                  className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                  value={cadastroForm.nome}
                  onChange={(e) =>
                    setCadastroForm((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  required
                />
              </label>

              <label className="text-sm font-medium text-[#2f4d3f]">
                Email
                <input
                  type="email"
                  className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                  value={cadastroForm.email}
                  onChange={(e) =>
                    setCadastroForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-[#2f4d3f]">
                Senha provisória
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                  value={cadastroForm.senha}
                  onChange={(e) =>
                    setCadastroForm((prev) => ({ ...prev, senha: e.target.value }))
                  }
                  required
                  minLength={6}
                />
              </label>

              <label className="text-sm font-medium text-[#2f4d3f]">
                Confirmar senha
                <input
                  type="password"
                  className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                  value={cadastroForm.confirmarSenha}
                  onChange={(e) =>
                    setCadastroForm((prev) => ({
                      ...prev,
                      confirmarSenha: e.target.value,
                    }))
                  }
                  required
                  minLength={6}
                />
              </label>
            </div>

            <label className="text-sm font-medium text-[#2f4d3f]">
              Foto (URL opcional)
              <input
                type="url"
                className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                placeholder="https://"
                value={cadastroForm.foto}
                onChange={(e) =>
                  setCadastroForm((prev) => ({ ...prev, foto: e.target.value }))
                }
              />
            </label>

            <label className="text-sm font-medium text-[#2f4d3f]">
              Foto (upload)
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5"
                onChange={(e)=> setCadastroForm((prev)=> ({...prev, fotoFile: e.currentTarget.files?.[0]}))}
              />
            </label>

            {cadastroErro && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {cadastroErro}
              </p>
            )}

            {cadastroStatus === "success" && (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
                Funcionário cadastrado com sucesso!
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#2f4d3f] px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-[#2f4d3f]/30 transition hover:bg-[#3c6752] disabled:cursor-not-allowed disabled:bg-[#8aa498]"
                disabled={cadastroStatus === "loading"}
              >
                {cadastroStatus === "loading" ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white/85 p-6 shadow-xl shadow-[#c0d3c9]/40">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold text-[#2f4d3f]">
              Atualizar senha do administrador
            </h2>
            <p className="text-sm text-[#5b7a6b]">
              Defina uma nova senha sempre que necessário para manter o acesso
              seguro.
            </p>
          </header>

          <form className="grid gap-4" onSubmit={handleSenhaAdmin}>
            <label className="text-sm font-medium text-[#2f4d3f]">
              Senha atual
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                value={senhaAdminForm.senhaAtual}
                onChange={(e) =>
                  setSenhaAdminForm((prev) => ({
                    ...prev,
                    senhaAtual: e.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="text-sm font-medium text-[#2f4d3f]">
              Nova senha
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                value={senhaAdminForm.novaSenha}
                onChange={(e) =>
                  setSenhaAdminForm((prev) => ({
                    ...prev,
                    novaSenha: e.target.value,
                  }))
                }
                required
                minLength={6}
              />
            </label>

            <label className="text-sm font-medium text-[#2f4d3f]">
              Confirmar nova senha
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                value={senhaAdminForm.confirmacao}
                onChange={(e) =>
                  setSenhaAdminForm((prev) => ({
                    ...prev,
                    confirmacao: e.target.value,
                  }))
                }
                required
                minLength={6}
              />
            </label>

            {senhaAdminErro && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {senhaAdminErro}
              </p>
            )}

            {senhaAdminStatus === "success" && (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
                Senha atualizada com sucesso!
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#2f4d3f] px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-[#2f4d3f]/30 transition hover:bg-[#3c6752] disabled:cursor-not-allowed disabled:bg-[#8aa498]"
                disabled={senhaAdminStatus === "loading"}
              >
                {senhaAdminStatus === "loading"
                  ? "Atualizando..."
                  : "Atualizar senha"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <section className="rounded-3xl bg-white/85 p-6 shadow-xl shadow-[#c0d3c9]/40">
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#2f4d3f]">
              Funcionários cadastrados
            </h2>
            <p className="text-sm text-[#5b7a6b]">
              Gerencie o acesso de cada funcionário sempre que precisar.
            </p>
          </div>
          {loadingList && (
            <span className="text-sm text-[#5b7a6b]">Carregando lista...</span>
          )}
        </header>

        {funcionariosOrdenados.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#b9ccbf] bg-white/60 px-4 py-6 text-center text-sm text-[#5b7a6b]">
            Nenhum funcionário cadastrado até o momento.
          </p>
        ) : (
          <ul className="space-y-4">
            {funcionariosOrdenados.map((func) => {
              const ativo = func.ativo;
              const expandido = expandedFuncionario === func.id;
              return (
                <li
                  key={func.id}
                  className="rounded-2xl border border-[#d1e2d7] bg-white/70 p-4 shadow-sm shadow-[#c5d9cd]/50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#e4efe8] shadow">
                        {func.photo ? (
                          <img
                            src={func.photo}
                            alt={func.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-[#567666]">
                            {func.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[#2f4d3f]">
                          {func.name}
                        </p>
                        <p className="text-sm text-[#5b7a6b]">
                          {func.email || "Sem email cadastrado"}
                        </p>
                        <p className="text-xs text-[#7c9489]">
                          Desde {formatDate(func.created)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          ativo
                            ? "bg-[#daf0e2] text-[#2f4d3f]"
                            : "bg-[#f2d9d9] text-[#8b3f3f]"
                        }`}
                      >
                        {ativo ? "Ativo" : "Inativo"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedFuncionario((prev) =>
                            prev === func.id ? null : func.id
                          )
                        }
                        className="rounded-full bg-[#2f4d3f] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:bg-[#3c6752]"
                      >
                        {expandido ? "Cancelar" : "Trocar senha"}
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          type="button"
                          className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                          onClick={async ()=>{
                            if (!confirm(`Desativar funcionário ${func.name}?`)) return;
                            await api.delete(`/auth/funcionarios/${func.id}`);
                            await fetchFuncionarios();
                          }}
                        >Excluir</button>
                      )}
                    </div>
                  </div>

                  {expandido && (
                    <form
                      className="mt-4 grid gap-4 rounded-2xl border border-[#cfe2d7] bg-white/80 p-4"
                      onSubmit={handleSenhaFuncionario}
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-[#2f4d3f]">
                          Nova senha
                          <input
                            type="password"
                            className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                            value={senhaFuncionarioForm.novaSenha}
                            onChange={(e) =>
                              setSenhaFuncionarioForm((prev) => ({
                                ...prev,
                                novaSenha: e.target.value,
                              }))
                            }
                            required
                            minLength={6}
                          />
                        </label>

                        <label className="text-sm font-medium text-[#2f4d3f]">
                          Confirmar nova senha
                          <input
                            type="password"
                            className="mt-1 w-full rounded-2xl border border-[#9fb7aa] bg-white/70 px-4 py-2.5 text-base text-[#2f4d3f] outline-none transition focus:border-[#3e6c58] focus:ring-2 focus:ring-[#a9d5be]"
                            value={senhaFuncionarioForm.confirmacao}
                            onChange={(e) =>
                              setSenhaFuncionarioForm((prev) => ({
                                ...prev,
                                confirmacao: e.target.value,
                              }))
                            }
                            required
                            minLength={6}
                          />
                        </label>
                      </div>

                      {senhaFuncionarioErro && (
                        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                          {senhaFuncionarioErro}
                        </p>
                      )}

                      {senhaFuncionarioStatus === "success" && (
                        <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
                          Senha atualizada com sucesso!
                        </p>
                      )}

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setExpandedFuncionario(null)}
                          className="rounded-full bg-[#d7e6dc] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#2f4d3f] hover:bg-[#c5d9cd]"
                        >
                          Fechar
                        </button>
                        <button
                          type="submit"
                          className="rounded-full bg-[#2f4d3f] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:bg-[#3c6752] disabled:cursor-not-allowed disabled:bg-[#8aa498]"
                          disabled={senhaFuncionarioStatus === "loading"}
                        >
                          {senhaFuncionarioStatus === "loading"
                            ? "Salvando..."
                            : "Salvar nova senha"}
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
