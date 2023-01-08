import { user } from '@prisma/client'
import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AuthState {
    user: user | null
    setUser: (user: user) => void
}

export const useAuthStore = create<AuthState>()(
    devtools(
            (set) => ({
                user: null,
                setUser: (user) => set((state) => ({ user }))
            }),
            {
                name: 'bear-storage',
            }
    )
)
