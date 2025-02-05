import { toast } from "react-toastify"

export function notify(message: string, success: boolean):void { 
    toast(message, {
        position:"bottom-center", 
        type:success?"success":"error"
    })
}