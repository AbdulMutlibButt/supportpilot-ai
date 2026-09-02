import { AuthPage } from "@/components/auth-page-new";
import { validateRuntimeConfig } from "@/lib/runtime-config";
export default function Login(){return <AuthPage mode="login" publicDemo={validateRuntimeConfig().publicDemo}/>}
