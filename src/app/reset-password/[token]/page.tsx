import {CompleteResetForm} from "@/components/password-reset-form";
export default async function ResetPassword({params}:{params:Promise<{token:string}>}){const {token}=await params;return <main className="auth-page"><section className="auth-panel col-span-full"><CompleteResetForm token={token}/></section></main>}
