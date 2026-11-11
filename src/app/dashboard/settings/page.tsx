'use client'

import { useAuth } from '@/contexts/auth-context'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Mail, User, ImageIcon, CalendarClock, LogIn } from 'lucide-react'

const Setting = () => {
    const { user } = useAuth()

    if (!user) return null

    const displayName = user.displayName || 'Unnamed user'
    const email = user.email || '—'
    const photoURL = user.photoURL || ''
    const initials =
        (user.displayName || user.email || 'U')
            .split(' ')
            .map((s) => s[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()


    // const createdAt = formatFirebaseTs(user.metadata?.creationTime)
    // const lastLoginAt = formatFirebaseTs(user.metadata?.lastSignInTime)
    const createdAt = user.metadata?.creationTime
    const lastLoginAt = user.metadata?.lastSignInTime
    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your account information and preferences.
                    </p>
                </div>
            </div>

            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        {photoURL ? <AvatarImage src={photoURL} alt={displayName} /> : null}
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <CardTitle className="text-xl text-foreground truncate">{displayName}</CardTitle>
                        <CardDescription className="truncate">{email}</CardDescription>
                        {/* <Badge variant="secondary" className="mt-2">
                            {user.emailVerified ? 'Verified' : 'Unverified'}
                        </Badge> */}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />

                    <InfoRow icon={<User className="h-4 w-4" />} label="Display name" value={displayName} />
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={email} />
                    <InfoRow
                        icon={<ImageIcon className="h-4 w-4" />}
                        label="Photo URL"
                        value={photoURL || '—'}
                        truncate
                    />
                    <InfoRow icon={<CalendarClock className="h-4 w-4" />} label="Account created" value={createdAt as any} />
                    <InfoRow icon={<LogIn className="h-4 w-4" />} label="Last sign-in" value={lastLoginAt as any} />
                </CardContent>
            </Card>
        </div>
    )
}

function InfoRow({
    icon,
    label,
    value,
    truncate = false,
}: {
    icon: React.ReactNode
    label: string
    value: string
    truncate?: boolean
}) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <span className="text-muted-foreground block text-xs font-medium">{label}</span>
                <span
                    className={`text-foreground font-medium block ${truncate ? 'truncate' : 'break-all'}`}
                    title={value}
                >
                    {value}
                </span>
            </div>
        </div>
    )
}



// function formatFirebaseTs(value?: string | number | Date | null): string {
//     if (!value) return '—'
//     const date = value instanceof Date ? value : new Date(Number(value))
//     if (isNaN(date.getTime())) return '—'
//     return date.toLocaleString(undefined, {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//     })
// }


export default Setting