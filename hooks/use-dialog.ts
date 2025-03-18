import { ReactNode, useState } from "react"

type DialogConfig = {
    open: boolean
    title: string
    description: ReactNode
    confirmLabel: string
    confirmVariant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    onConfirm: () => Promise<void>
    isLoading: boolean
}

export function useDialog() {
    const [config, setConfig] = useState<DialogConfig>({
        open: false,
        title: "",
        description: "",
        confirmLabel: "Confirm",
        confirmVariant: "default",
        onConfirm: async () => { },
        isLoading: false,
    })

    const openDialog = (dialog: Partial<DialogConfig>) => {
        setConfig((prev) => ({
            ...prev,
            ...dialog,
            open: true,
            isLoading: false,
        }))
    }

    const closeDialog = () => {
        setConfig((prev) => ({ ...prev, open: false, isLoading: false }))
    }

    const setLoading = (loading: boolean) => {
        setConfig((prev) => ({ ...prev, isLoading: loading }))
    }

    return { config, openDialog, closeDialog, setLoading }
}
