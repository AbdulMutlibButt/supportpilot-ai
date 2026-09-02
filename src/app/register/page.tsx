import { AuthPage } from "@/components/auth-page-new";
import { validateRuntimeConfig } from "@/lib/runtime-config";
export default function Register(){return <AuthPage mode="register" publicDemo={validateRuntimeConfig().publicDemo}/>}
