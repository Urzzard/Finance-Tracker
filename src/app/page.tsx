import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../components/mod-toggle";
import { CreateAccountDialog } from "../components/create-account-dialog";
import { CreateTransactionDialog } from "../components/create-transaction-dialog";
import { TransactionList } from "../components/transaction-list";
import { db } from "../db";
import { getTransactions, getCategories, getAccountBalances } from "./actions";
import { AccountActions } from "../components/account-actions";
import { LogoutButton } from "../components/logout-button";

export default async function Dashboard() {
  const supabase = await createClient();

  // 1. Verificamos quién eres
  const { data: { user }, error } = await supabase.auth.getUser();

  // 2. Si no hay usuario, fuera de aquí (al login)
  if (error || !user) {
    redirect('/login');
  }

  // --- CONSULTA A BASE DE DATOS ---
  // Obtenemos las cuentas del usuario logueado
  const userAccounts = await db.query.accounts.findMany({
    where: (accounts, { eq }) => eq(accounts.userId, user.id),
    orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
  });

  // Obtenemos las transacciones, categorías y balances
  const userTransactions = await getTransactions();
  const userCategories = await getCategories();
  const accountBalances = await getAccountBalances();

  // 3. Si hay usuario, mostramos el Dashboard básico
  return (
    <div className="p-8 min-h-screen bg-background text-foreground transition-colors duration-300">

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Mis Finanzas
        </h1>
        
        <div className="flex gap-2 items-center">
            {/* AQUI ESTÁ EL BOTÓN DE TEMA */}
            <ModeToggle />
            
            <LogoutButton />
        </div>
      </div>

      <div className="border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl mb-4">¡Bienvenido!</h2>
        <p>Has iniciado sesión correctamente con el correo:</p>
        <code className="bg-black text-white px-2 py-1 rounded mt-2 block w-fit">
          {user.email}
        </code>

        <hr className="border-gray-400 my-4" />

        <div>
          {/* SECCIÓN DE CUENTAS */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Mis Cuentas</h2>
                {/* Aquí ponemos el botón que abre el Modal */}
                <CreateAccountDialog />
            </div>

            {/* LISTADO DE TARJETAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAccounts.length === 0 ? (
                  // ESTADO VACÍO (Empty State)
                  <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg border-muted-foreground/25">
                      <p className="text-muted-foreground mb-4">No tienes cuentas registradas.</p>
                      {/* Reutilizamos el botón para que sea fácil crear la primera */}
                      <CreateAccountDialog />
                  </div>
              ) : (
                  // MAPEO DE CUENTAS (Si existen)
                  userAccounts.map((account) => (
                      <div key={account.id} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm group relative">
                          {/* BOTON DE ACCIONES */}
                          <div className="absolute top-4 right-4">
                              <AccountActions account={account} />
                          </div>
                          <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-lg">{account.name}</h3>
                              {account.isCredit && (
                                  <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                      Crédito
                                  </span>
                              )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">
                              Moneda: {account.currency}
                          </p>
                          <div className="text-2xl font-bold">
                              {(() => {
                                const balance = accountBalances[account.id]
                                if (balance) {
                                  const prefix = balance.currency === 'USD' ? '$' : 'S/'
                                  const formattedBalance = Math.abs(balance.net / 100).toFixed(2)
                                  const sign = balance.net >= 0 ? '' : '-'
                                  return `${prefix} ${sign}${formattedBalance}`
                                }
                                const prefix = account.currency === 'USD' ? '$' : 'S/'
                                return `${prefix} 0.00`
                              })()}
                          </div>
                      </div>
                  ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* SECCIÓN DE TRANSACCIONES */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Transacciones</h2>
          <CreateTransactionDialog 
            accounts={userAccounts} 
            categories={userCategories} 
          />
        </div>
        <TransactionList 
          transactions={userTransactions} 
          accounts={userAccounts}
          categories={userCategories}
        />
      </div>

    </div>
  );
}