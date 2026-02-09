import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavLinkProps {
    to: string
    children: React.ReactNode
    className?: string
}

export default function NavLink({ to, children, className }: NavLinkProps) {
    const location = useLocation()
    const isActive = location.pathname === to

    return (
        <Link
            to={to}
            className={cn(
                'px-4 py-2 rounded-md transition-colors',
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                className
            )}
        >
            {children}
        </Link>
    )
}
