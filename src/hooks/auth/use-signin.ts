import {
    Session, User,
    SignInWithPasswordCredentials, SignInWithIdTokenCredentials,
    SignInWithOAuthCredentials, SignInWithPasswordlessCredentials, SignInWithSSO,
    AuthError,
} from '@supabase/gotrue-js'
import { useCallback, useState } from 'react'

import { useClient } from '../use-client'
import { initialState } from './state'

export type UseSignInState = {
    error?: AuthError | null
    fetching: boolean
    session?: Session | null
    user?: User | null
}

export type UseSignInResponse = [
    UseSignInState,
    (
        credentials: SignInWithPasswordCredentials,
    ) => Promise<Pick<UseSignInState, 'error' | 'session' | 'user'>>,
]

export type UseSignInOptions = {
    redirectTo?: string
    scopes?: string
}

export type SignInCredentials = (
    SignInWithPasswordCredentials | SignInWithIdTokenCredentials | SignInWithOAuthCredentials
    | SignInWithPasswordlessCredentials | SignInWithSSO
)

export function useSignIn(): UseSignInResponse {
    const client = useClient()
    const [state, setState] = useState<UseSignInState>(initialState)

    async function signIn(withPassword:SignInWithPasswordCredentials):Promise<object>;
    async function signIn(withToken:SignInWithIdTokenCredentials):Promise<object>;
    async function signIn(withOAuth:SignInWithOAuthCredentials):Promise<object>;
    async function signIn(withPasswordless:SignInWithPasswordlessCredentials):Promise<object>;
    async function signIn(withSSO:SignInWithSSO):Promise<object>;
    async function signIn(credentials:SignInCredentials):Promise<object> {
        setState({ ...initialState, fetching: true })

        let authFn // =  client.auth.signInWithOtp
        if ('provider' in credentials) {
            if ('token' in credentials) {
                authFn = client.auth.signInWithIdToken
            }
            authFn = client.auth.signInWithOAuth
        } else if ('password' in credentials) {
            authFn = client.auth.signInWithPassword
        } else if ('providerId' in credentials || 'domain' in credentials) {
            authFn = client.auth.signInWithSSO
        } else {
            authFn = client.auth.signInWithOtp
        }

        const { error, data: { session, user }} = await authFn(
            {
                ...credentials,
            },
        )
        const res = { error, session, user }
        setState({ ...res, fetching: false })
        return res
    }
    const execute = useCallback(signIn, [client])
    return [state, execute]
}
